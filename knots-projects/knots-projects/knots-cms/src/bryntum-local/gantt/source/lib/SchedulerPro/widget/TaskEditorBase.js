import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import Popup from '../../Core/widget/Popup.js';
import Toast from '../../Core/widget/Toast.js';
import Widget from '../../Core/widget/Widget.js';
import ReadyStatePropagator from '../widget/taskeditor/mixin/ReadyStatePropagator.js';
import '../localization/En.js';

/**
 * @module SchedulerPro/widget/TaskEditorBase
 */

/**
 * Abstract base class for Scheduler and Gantt task editors
 *
 * @extends Core/widget/Popup
 * @abstract
 */
export default class TaskEditorBase extends Popup.mixin(ReadyStatePropagator) {

    //region Config

    static get $name() {
        return 'TaskEditorBase';
    }

    static get type() {
        return 'taskeditorbase';
    }

    static get configurable() {
        return {
            localizableProperties : ['width'],

            title     : 'L{Information}',
            cls       : 'b-schedulerpro-taskeditor',
            closable  : true,
            layout    : 'fit',
            draggable : {
                handleSelector : ':not(button,.b-field-inner)' // blacklist buttons and field inners
            },

            items : null, // overridden in subclasses

            bbar : {
                // When readOnly, child buttons are hidden
                hideWhenEmpty : true,

                defaults : {
                    localeClass : this
                },

                items : {
                    saveButton : {
                        text   : 'L{Save}',
                        color  : 'b-blue',
                        cls    : 'b-raised',
                        weight : 100
                    },
                    deleteButton : {
                        text   : 'L{Delete}',
                        weight : 200
                    },
                    cancelButton : {
                        text   : 'L{Object.Cancel}',
                        weight : 300
                    }
                }
            },

            width : {
                $config : {
                    localeKey : 'L{editorWidth}'
                }
            }
        };
    }

    static get defaultConfig() {
        return {
            axisLock  : 'flexible',
            autoClose : true,
            onChange  : null,
            onCancel  : null,
            onSave    : null,
            autoShow  : false,

            scrollAction : 'realign',

            /**
             * The decimal precision to use for Duration field / columns, normally provided by the owning Scheduler´s {@link SchedulerPro.view.SchedulerPro#config-durationDisplayPrecision}
             * @config {Number}
             */
            durationDisplayPrecision : 1,

            tabPanelItems : null,

            defaultTabs : null,

            /**
             * A message to be shown when Engine is performing task scheduling. Localizable text is 'L{calculateMask}'. Disabled by default.
             * @config {String|null}
             * @default
             */
            calculateMask : null,

            /**
             * A delay before the {@link #config-calculateMask mask} becomes visible. This config is needed to avoid UI blinking when calculating is relatively fast.
             * Note, the mask is applied immediately and blocks the content anyway. However if the delay is set, it will be transparent. If `null`, the mask is visible immediately.
             * @config {Number|null}
             * @default
             */
            calculateMaskDelay : 100,

            localizableProperties : ['calculateMask'],

            project : null,

            /**
             * A task field (id, wbsCode, sequenceNumber etc) that will be used when displaying and editing linked tasks. Defaults to Gantt `dependencyIdField`
             * @config {String} dependencyIdField
             */
            dependencyIdField : null
        };
    }

    //endregion

    //region Internal

    // This method is called for every child widget in the task editor
    processWidgetConfig(widgetConfig) {
        if (widgetConfig.type?.includes('date') && widgetConfig.weekStartDay == null) {
            widgetConfig.weekStartDay = this.weekStartDay;
        }

        // Backward compatibility
        if (widgetConfig.ref === 'tabs' && this.extraItems) {
            const preparedItems = {};

            for (const key in this.extraItems) {
                // Lower-cased "tab" is not supported anymore
                const preparedKey = key.replace('tab', 'Tab');

                preparedItems[preparedKey] = {
                    items : Array.isArray(this.extraItems[key]) ? ObjectHelper.transformArrayToNamedObject(this.extraItems[key]) : this.extraItems[key]
                };
            }

            ObjectHelper.merge(widgetConfig.items, preparedItems);
        }

        return widgetConfig;
    }

    changeItems(items) {
        const
            { tabPanelItems = {} } = this,
            // Clone to not pollute config
            clonedItems                        = ObjectHelper.clone(items),
            tabPanel                           = clonedItems.find(w => w.ref === 'tabs');

        this.cleanItemsConfig(tabPanelItems);
        ObjectHelper.merge(tabPanel.items, tabPanelItems);

        return super.changeItems(clonedItems);
    }

    // Remove any items configured as === true which just means default config options
    cleanItemsConfig(items) {
        for (const ref in items) {
            const itemCfg = items[ref];

            if (itemCfg === true) {
                delete items[ref];
            }
            else if (itemCfg?.items) {
                this.cleanItemsConfig(itemCfg.items);
            }
        }
    }

    afterConfigure() {
        const
            me            = this,
            { widgetMap } = me,
            { tabs }      = widgetMap,
            {
                cancelButton,
                deleteButton,
                saveButton
            } = me.bbar?.widgetMap || {};

        saveButton?.on('click', me.onSaveClick, me);
        cancelButton?.on('click', me.onCancelClick, me);
        deleteButton?.on('click', me.onDeleteClick, me);

        Object.values(widgetMap).forEach(widget => {
            if (widget.isDurationField) {
                widget.decimalPrecision = this.durationDisplayPrecision;
            }
            else if (widget.ref === 'startDate' || widget.ref === 'endDate') {
                widget.project = this.project;
            }
            else if (widget.ref === 'predecessorsTab' || widget.ref === 'successorsTab') {
                widget.grid.durationDisplayPrecision = this.durationDisplayPrecision;
                widget.dependencyIdField = widget.dependencyIdField || me.dependencyIdField;
            }

            if (widget.isReadyStatePropagator) {
                widget.on('readystatechange', me.onReadyStateChange, me);
            }
        });

        // override standard Container's method to pick the right record and make possible
        // to reflect record update on programmatically field value change
        // TODO: may be removed after merged https://github.com/bryntum/support/issues/2920
        tabs.onFieldChange = ({ source }) => {
            const { name, isValid, value } = source;

            // skip record field setting if we are loading values from the record
            if (me.loadedRecord && name && isValid && !me.isLoadingEvent) {
                me.loadedRecord[name] = value;
            }
        };
    }

    get canSave() {
        let canSave = true;

        // If widget report it can't both save and cancel then there's no reason to walk through others
        Object.values(this.widgetMap).forEach(w => {
            if (w.isReadyStatePropagator) {
                canSave = canSave && w.canSave;
            }
        });

        return canSave;
    }

    // Close, Cancel and clicking outside all lead here
    async hide() {
        this.detachListeners('project');
        this.detachListeners('eventStore');
        this._delayedAction = null;

        // Let editing feature know to cancel
        this.trigger('cancel');

        return super.hide();
    }

    // Iterates over contained fields and disables them based on the loaded record isEditable(fielName) result
    toggleFieldsDisabled(record) {
        this.eachWidget(widget => {
            if (widget.isField && widget.name) {
                const isFieldEditable = record.isEditable(widget.name);
                // skip unknown fields
                if (isFieldEditable !== undefined) {
                    widget.disabled = !record.isEditable(widget.name);
                }
            }
        });
    }

    /**
     * Loads a task model into the editor
     *
     * @param {SchedulerPro.model.EventModel} record
     */
    loadEvent(record, highlightChanges = false) {
        const me = this;

        me.isLoadingEvent = true;

        // iterate over fields and disable them by name
        me.toggleFieldsDisabled(record);

        me.callWidgetHook('loadEvent', record, highlightChanges);

        me.detachListeners('project');

        // Not using .record to not trigger containers record behaviour
        // TODO: Why not rely on that?
        me.loadedRecord = record;

        record.project.on({
            name         : 'project',
            beforeCommit : 'onProjectBeforeCommit',
            dataReady    : 'onProjectDataReady',
            thisObj      : me
        });

        me.detachListeners('eventStore');

        record.project.eventStore.on({
            name    : 'eventStore',
            remove  : 'onTaskRemove',
            thisObj : me
        });

        me.isLoadingEvent = false;
    }

    callWidgetHook(name, ...args) {
        this.eachWidget(w => {
            if (typeof w[name] === 'function') {
                w[name](...args);
            }
        });
    }

    //endregion

    //region Events

    onDocumentMouseDown(params) {
        const
            me                = this,
            activeCellEditing = Object.values(me.widgetMap).some(w => w._activeCellEdit);

        let action = null;

        if (activeCellEditing) {
            const
                { event }           = params,
                {
                    saveButton,
                    cancelButton,
                    deleteButton
                }                   = me.widgetMap,
                clickedButtonEl     = event.target.closest('button');

            // When there is a grid in a TaskEditor tab, and cell editing of the grid is in progress,
            // and you click on one of the action buttons below (save/cancel/delete), the cell editing feature catches
            // 'globaltap' event which is fired on global 'mousedown' and finishes the editing.
            // When new data is applied to the record, a new propagation begins. The task editor adds calculating mask
            // to protect the UI. Then 'click' event is fired. At this time the buttons are hovered with
            // the calculating mask and button's handlers are never called.
            // So, if tap out happens, and cell editing is in progress, and the target is one of the action buttons,
            // need to foresee the situation when the mask can block the buttons. Though closing the cell editing
            // does not guarantee that the propagation will start and the mask will appear. Therefore we clean up
            // the flags inside the handlers.

            if (clickedButtonEl) {
                switch (clickedButtonEl) {
                    case saveButton?.element:
                        action = me.onSaveClick;
                        break;
                    case cancelButton?.element:
                        action = me.onCancelClick;
                        break;
                    case deleteButton?.element:
                        action = me.onDeleteClick;
                        break;
                }
            }
        }

        me._delayedAction = action;

        super.onDocumentMouseDown(params);
    }

    onSaveClick() {
        const me = this;

        me._delayedAction = null;

        if (me.canSave) {
            me.trigger('save');
        }
        else {
            Toast.show({
                rootElement : me.rootElement,
                html        : me.L('L{saveError}')
            });
        }
    }

    onCancelClick() {
        this.close();
    }

    onDeleteClick() {
        this._delayedAction = null;

        this.trigger('delete');
    }

    onPropagationRequested() {
        this.trigger('requestPropagation');
    }

    onReadyStateChange({ source, canSave }) {
        this.requestReadyStateChange();

        if (!source.couldSaveTitle) {
            source.couldSaveTitle = source.title;
        }

        if (source.parent === this.widgetMap.tabs) {
            if (canSave) {
                source.tab.element.classList.remove('b-invalid');
                source.tab.icon = null;
                source.title = source.couldSaveTitle;
                source.couldSaveTitle = null;
            }
            else {
                source.tab.element.classList.add('b-invalid');
                source.tab.icon = 'b-icon-warning';
                source.title = source.couldSaveTitle;
            }
        }
    }

    onTaskRemove() {
        this.afterDelete();
    }

    onProjectBeforeCommit() {
        if (this.calculateMask) {
            this.mask({
                text      : this.calculateMask,
                showDelay : this.calculateMaskDelay
            });
        }
    }

    onProjectDataReady({ records }) {
        const me = this;

        if (me.calculateMask) {
            me.unmask();
        }

        if (records.has(me.loadedRecord)) {
            me.callWidgetHook('afterProjectChange');
        }

        me._delayedAction?.();
    }

    beforeSave() {
        this.callWidgetHook('beforeSave');
    }

    afterSave() {
        this.loadedRecord = undefined;

        this.callWidgetHook('afterSave');
    }

    beforeCancel() {

        this.callWidgetHook('beforeCancel');
    }

    afterCancel() {
        this.loadedRecord = undefined;

        this.callWidgetHook('afterCancel');
    }

    beforeDelete() {
        this.callWidgetHook('beforeDelete');
    }

    afterDelete() {
        this.loadedRecord = undefined;

        this.callWidgetHook('afterDelete');
    }

    onInternalKeyDown(event) {
        if (event.key === 'Enter' && this.saveAndCloseOnEnter && event.target.tagName.toLowerCase() === 'input') {
            if (event.target.matches('input')) {

                // Enter might have been pressed right after field editing so we need to process the changes (Fix for #166)
                const field = Widget.fromElement(event.target);
                if (field?.internalOnChange) {
                    field.internalOnChange();
                }
            }

            // this prevents field events so the new value would not be processed without above call to internalOnChange
            // Need to prevent this key events from being fired on whatever receives focus after the editor is hidden
            event.preventDefault();

            this.onSaveClick();
        }

        super.onInternalKeyDown(event);
    }

    //endregion

    updateReadOnly(readOnly) {
        const
            {
                deleteButton,
                saveButton,
                cancelButton,
                tabs
            } = this.widgetMap,
            {
                items : childTabs
            } = tabs;

        super.updateReadOnly(readOnly);

        if (deleteButton) {
            deleteButton.hidden = readOnly;
        }

        if (saveButton) {
            saveButton.hidden = readOnly;
        }

        if (cancelButton) {
            cancelButton.hidden = readOnly;
        }

        // All tabs are readOnly if we are readOnly
        for (let i = 0, { length } = childTabs; i < length; i++) {
            childTabs[i].readOnly = readOnly;
        }
    }
}

// Register this widget type with its Factory
TaskEditorBase.initClass();
