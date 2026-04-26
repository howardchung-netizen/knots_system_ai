import InstancePlugin from '../../Core/mixin/InstancePlugin.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import KeyMap from '../../Core/widget/mixin/KeyMap.js';
import './ScheduleContext.js';

/**
 * @module Scheduler/feature/EventCopyPaste
 */

/**
 * Allow using [Ctrl/CMD + C/X] and [Ctrl/CMD + V] to copy/cut and paste events. This feature also adds entries
 * to the {@link Scheduler.feature.EventMenu} (see example below for how to configure). You can configure how a newly pasted record
 * is named using {@link #function-generateNewName}
 *
 * This feature is **enabled** by default
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         eventCopyPaste : true
 *     }
 * });
 * ```
 *
 * ```javascript
 * // Custom copy text + remove cut option from event menu:
 * const scheduler = new Scheduler({
 *     features : {
 *         eventCopyPaste : true,
 *         eventMenu : {
 *             items : {
 *                 copyEvent : {
 *                     text : 'Copy booking'
 *                 },
 *                 cutEvent  : false
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * ## Keyboard shortcuts
 *
 * By default, this feature will react to Ctrl+C, Ctrl+X and Ctrl+V for standard clipboard actions.
 * You can reconfigure the keys used to trigger these actions, {@link #config-keyMap} for more details.
 *
 * @extends Core/mixin/InstancePlugin
 * @inlineexample Scheduler/feature/EventCopyPaste.js
 * @classtype eventCopyPaste
 * @feature
 */
export default class EventCopyPaste extends InstancePlugin.mixin(KeyMap) {
    static get $name() {
        return 'EventCopyPaste';
    }

    static get pluginConfig() {
        return {
            assign : [
                'copyEvents',
                'pasteEvents'
            ],
            chain : [
                'onElementKeyDown',
                'populateEventMenu',
                'populateScheduleMenu',
                'onEventDataGenerated'
            ]
        };
    }

    static get configurable() {
        return {
            /**
             * The field to use as the name field when updating the name of copied records
             * @config {String}
             * @default
             */
            nameField : 'name',

            /**
             * The feature has the following default key mappings during editing:
             *
             * | Keys        | Action       |
             * |-------------|--------------|
             * | Ctrl+C      | copy         |
             * | Ctrl+X      | cut          |
             * | Ctrl+V      | paste        |
             *
             * You can supply your own key map if you want to change any mapping, or set it to `null` to disable all keyboard
             * shortcuts.
             *
             * ```javascript
             * const scheduler = new Scheduler({
             *    features : {
             *        eventCopyPaste : {
             *            keyMap : {
             *                // disable cut via keyboard
             *                'Ctrl-X' : null
             *            }
             *        }
             *    }
             * });
             * ```
             *
             * @config {Object}
             */
            keyMap : {
                'Ctrl+C' : 'copy',
                'Ctrl+X' : 'cut',
                'Ctrl+V' : 'paste'
            }
        };
    }

    static get properties() {
        return {
            clipboardRecords : []
        };
    }

    construct(scheduler, config) {
        super.construct(scheduler, config);

        // enable scheduleContext to highlight cell on click to paste
        if (scheduler.features.scheduleContext) {
            scheduler.features.scheduleContext.disabled = false;
        }

        scheduler.on('scheduleclick', this.onSchedulerClick, this);

        this.scheduler = scheduler;
    }

    onEventDataGenerated(eventData) {
        const { eventRecord } = eventData;

        eventData.cls['b-cut-item'] = eventRecord.meta.isCut;
    }

    onSchedulerClick(context) {
        this._cellClickedContext = context;
    }

    onElementKeyDown(event) {
        const
            me       = this,
            cellEdit = me.client.features.cellEdit;

        // No action if
        // 1. there is selected text on the page
        // 2. cell editing is active
        // 3. cursor is not in the grid (filter bar etc)
        if (!me.disabled &&
            globalThis.getSelection().toString().length === 0 &&
            (!cellEdit || !cellEdit.isEditing) &&
            event.target.closest('.b-grid-body-container')
        ) {
            me.performKeyMapAction(event);
        }
    }

    copy() {
        this.copyEvents();
    }

    cut() {
        this.copyEvents(undefined, true);
    }

    paste() {
        this.pasteEvents();
    }

    /**
     * Copy events to clipboard to paste later
     * @fires beforeCopy
     * @param {Scheduler.model.EventModel[]} [records] Uses `selectedAssignments` by default, pass other records to copy them
     * @param {Boolean} [isCut] Copies by default, pass `true` to cut
     * @category Edit
     */
    copyEvents(records = this.client.selectedEvents, isCut = false) {
        const
            me            = this,
            { scheduler } = me;

        // Prevent cutting readOnly events
        if (isCut) {
            records = records.filter(r => !r.readOnly);
        }

        /**
         * Fires on the owning Scheduler before a copy action is performed, return `false` to prevent the action
         * @event beforeCopy
         * @preventable
         * @on-owner
         * @param {Scheduler.view.Scheduler} source Owner scheduler
         * @param {Scheduler.model.EventModel[]} records The event records about to be copied
         * @param {Boolean} isCut `true` if this is a cut action
         */
        if (!records.length || scheduler.readOnly || scheduler.trigger('beforeCopy', { records, isCut }) === false) {
            return;
        }

        me._isCut = isCut;
        // records is used when call comes from context menu where the current event is the context
        me.clipboardRecords = records;

        scheduler.eventStore.forEach(rec => {
            rec.meta.isCut = me._isCut && me.clipboardRecords.includes(rec);
        });

        // refresh to call onEventDataGenerated and reapply the cls for records where the cut was canceled
        scheduler.refreshWithTransition();
    }

    /**
     * Paste events to date/resource to assign
     * @fires beforePaste
     *
     * @param {Date} [date] The date where the event(s) will be pasted
     * @param {Scheduler.model.ResourceModel} [resourceRecord] The resource to assign the pasted event(s) to
     * @category Edit
     */
    pasteEvents(date, resourceRecord) {
        const
            me                   = this,
            { clipboardRecords, scheduler } = me;

        if (arguments.length === 0) {
            const context  = me._cellClickedContext || {};
            date           = context.date;
            // If user only clicked an event, and no cells - fall back to that assignment´s resource
            resourceRecord = context.resourceRecord || scheduler.selectedAssignments[0]?.resource;
        }

        /**
         * Fires on the owning Scheduler before a paste action is performed, return `false` to prevent the action
         * @event beforePaste
         * @preventable
         * @on-owner
         * @param {Scheduler.view.Scheduler} source Owner scheduler
         * @param {Scheduler.model.EventModel[]} records The records about to be pasted
         * @param {Date} date The date when the pasted events will be scheduled
         * @param {Scheduler.model.ResourceModel} resourceRecord The target resource record, the clipboard
         * event records will be assigned to this resource.
         * @param {Boolean} isCut `true` if this is a cut action
         */
        if (!clipboardRecords.length || scheduler.trigger('beforePaste', { records : clipboardRecords, resourceRecord, date, isCut : me._isCut }) === false) {
            return;
        }

        clipboardRecords.forEach(clipboardRecord => {
            if (me._isCut) {
                clipboardRecord.startDate  = date;
                clipboardRecord.meta.isCut = false;
            }
            else {
                clipboardRecord           = clipboardRecord.copy();
                clipboardRecord.startDate = date;
                clipboardRecord.name      = me.generateNewName(clipboardRecord);
                scheduler.eventStore.add(clipboardRecord);
            }

            scheduler.eventStore.assignEventToResource(clipboardRecord, resourceRecord);
        });

        if (me._isCut) {
            // reset clipboard
            me._isCut = false;
            me.clipboardRecords = [];
        }
    }

    populateEventMenu({ eventRecord, items }) {
        const me = this;

        if (!me.scheduler.readOnly) {
            items.copyEvent = {
                text        : 'L{copyEvent}',
                localeClass : me,
                icon        : 'b-icon b-icon-copy',
                weight      : 110,
                onItem      : () => me.copyEvents([eventRecord], false)
            };

            items.cutEvent = {
                text        : 'L{cutEvent}',
                localeClass : me,
                icon        : 'b-icon b-icon-cut',
                weight      : 120,
                disabled    : eventRecord.readOnly,
                onItem      : () => me.copyEvents([eventRecord], true)
            };
        }
    }

    populateScheduleMenu({ items }) {
        const
            me            = this,
            { scheduler } = me;

        if (!scheduler.readOnly && me.clipboardRecords.length) {
            items.pasteEvent = {
                text        : 'L{pasteEvent}',
                localeClass : me,
                icon        : 'b-icon b-icon-paste',
                disabled    : scheduler.resourceStore.count === 0,
                weight      : 110,
                onItem      : ({ date, resourceRecord }) => me.pasteEvents(date, resourceRecord, scheduler.getRowFor(resourceRecord))
            };
        }
    }

    /**
     * A method used to generate the name for a copy pasted record. By defaults appends "- 2", "- 3" as a suffix.
     *
     * @param {Scheduler.model.EventModel} eventRecord The new eventRecord being pasted
     * @return {String}
     */
    generateNewName(eventRecord) {
        const
            originalName = eventRecord[this.nameField];

        let counter = 2;

        while (this.client.eventStore.findRecord(this.nameField, `${originalName} - ${counter}`)) {
            counter++;
        }

        return `${originalName} - ${counter}`;
    }
}

EventCopyPaste.featureClass = 'b-event-copypaste';

GridFeatureManager.registerFeature(EventCopyPaste, true, 'Scheduler');
