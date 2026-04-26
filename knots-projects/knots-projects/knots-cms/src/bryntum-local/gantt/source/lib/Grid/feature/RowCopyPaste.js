import InstancePlugin from '../../Core/mixin/InstancePlugin.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import KeyMap from '../../Core/widget/mixin/KeyMap.js';

/**
 * @module Grid/feature/RowCopyPaste
 */

/**
 * Allow using [Ctrl/CMD + C/X] and [Ctrl/CMD + V] to copy/cut and paste rows. You can configure how a newly pasted record
 * is named using {@link #function-generateNewName}
 *
 * This feature is **enabled** by default
 *
 * ```javascript
 * const grid = new Grid({
 *     features : {
 *         rowCopyPaste : true
 *     }
 * });
 * ```
 *
 * ## Keyboard shortcuts
 *
 * By default, this feature will react to Ctrl+C, Ctrl+X and Ctrl+V for standard clipboard actions.
 * You can reconfigure the keys used to trigger these actions, see {@link #config-keyMap} for more details.
 *
 *
 * @extends Core/mixin/InstancePlugin
 * @inlineexample Grid/feature/RowCopyPaste.js
 * @classtype rowCopyPaste
 * @feature
 */
export default class RowCopyPaste extends InstancePlugin.mixin(KeyMap) {

    static get $name() {
        return 'RowCopyPaste';
    }

    static get type() {
        return 'rowCopyPaste';
    }

    static get pluginConfig() {
        return {
            assign : [
                'copyRows',
                'pasteRows'
            ],
            chain : [
                'onElementKeyDown',
                'populateCellMenu'
            ]
        };
    }

    static get properties() {
        return {
            clipboardRecords : []
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
             * const grid = new Grid({
             *    features : {
             *        rowCopyPaste : {
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
            },

            copyRecordText        : 'L{copyRecord}',
            cutRecordText         : 'L{cutRecord}',
            pasteRecordText       : 'L{pasteRecord}',
            localizableProperties : [
                'copyRecordText',
                'cutRecordText',
                'pasteRecordText'
            ]
        };
    }

    construct(grid, config) {
        super.construct(grid, config);

        grid.rowManager.on({
            beforeRenderRow : 'onBeforeRenderRow',
            thisObj         : this
        });

        this.grid = grid;
    }

    onBeforeRenderRow({ row, record }) {
        row.cls['b-cut-row'] = this._isCut && this.clipboardRecords.includes(record);
    }

    onElementKeyDown({ ctrlKey, target, key }) {
        const
            me       = this,
            cellEdit = me.grid.features.cellEdit;

        // No action if
        // 1. there is selected text on the page
        // 2. cell editing is active
        // 3. cursor is not in the grid (filter bar etc)
        if (!me.disabled &&
            globalThis.getSelection().toString().length === 0 &&
            (!cellEdit || !cellEdit.isEditing) &&
            target.closest('.b-grid-body-container')
        ) {
            me.performKeyMapAction(...arguments);
        }
    }

    copy() {
        this.copyRows();
    }

    cut() {
        this.copyRows(true);
    }

    paste() {
        this.pasteRows();
    }

    /**
     * Copy or cut rows to clipboard to paste later
     *
     * @fires beforeCopy
     * @param {Boolean} [isCut] Copies by default, pass `true` to cut
     * @category Common
     * @on-owner
     */
    copyRows(isCut = false) {
        const
            me         = this,
            { client } = me,
            // Dont cut readOnly records
            records    = client.selectedRecords.filter(r => !r.readOnly || !isCut);

        /**
         * Fires on the owning Grid before a copy action is performed, return `false` to prevent the action
         * @event beforeCopy
         * @preventable
         * @on-owner
         * @param {Grid.view.Grid} source Owner grid
         * @param {Core.data.Model[]} records The records about to be copied
         * @param {Boolean} isCut `true` if this is a cut action
         */
        if (!records.length || client.readOnly || client.trigger('beforeCopy', { records, isCut }) === false) {
            return;
        }

        me._isCut = isCut;

        me.clipboardRecords.forEach(rec => client.rowManager.getRowById(rec)?.removeCls('b-cut-row'));

        me.clipboardRecords = client.selectedRecords.slice();

        client.store.forEach(rec => {
            rec.meta.isCut = me._isCut && me.clipboardRecords.includes(rec);
        });

        // refresh to call reapply the cls for records where the cut was canceled
        client.selectedRecords.forEach(record => this.onRowCutOrCopy(record, isCut));
    }

    onRowCutOrCopy(record, isCut) {
        this.client.rowManager.getRowById(record)?.toggleCls('b-cut-row', isCut);
    }

    /**
     * Paste rows above selected or passed record
     *
     * @fires beforePaste
     * @param {Core.data.Model} [record] Paste above this record, or currently selected record if left out
     * @category Common
     * @on-owner
     */
    pasteRows(record) {
        const
            me                = this,
            records           = me.clipboardRecords,
            { client }        = me,
            referenceRecord   = record || client.selectedRecord;

        /**
         * Fires on the owning Grid before a paste action is performed, return `false` to prevent the action
         * @event beforePaste
         * @preventable
         * @on-owner
         * @param {Grid.view.Grid} source Owner grid
         * @param {Core.data.Model} referenceRecord The reference record, the clipboard event records will
         * be pasted above this record
         * @param {Core.data.Model[]} records The records about to be pasted
         * @param {Boolean} isCut `true` if this is a cut action
         */
        if (client.readOnly || client.isTreeGrouped || !records.length || client.trigger('beforePaste', {
            records, referenceRecord, isCut : me._isCut
        }) === false) {
            return [];
        }

        // sort selected to move records to make sure it will be added in correct order independent of how it was selected.
        // Should be done with real records in the clipboard, after records are copied, all indexes will be changed
        me.sortByIndex(records);

        const recordsToProcess = records.map(rec => {
            if (me._isCut) {
                // reset record cut state
                rec.meta.isCut = false;
            }
            else {
                rec = rec.copy();
                rec[me.nameField] = me.generateNewName(rec);
            }
            return rec;
        });

        if (me._isCut) {
            client.store.move(recordsToProcess, referenceRecord);

            // reset clipboard
            me.clearClipboard();
        }
        else {
            me.insertCopiedRecords(referenceRecord, recordsToProcess);
            client.selectedRecords = recordsToProcess;
        }

        return recordsToProcess;
    }

    clearClipboard() {
        this.clipboardRecords.forEach(rec => this.client.rowManager.getRowById(rec)?.removeCls('b-cut-row'));
        this._isCut           = false;
        this.clipboardRecords = [];
    }

    /**
     * A method used to generate the name for a copy-pasted record. By defaults appends "- 2", "- 3" as a suffix. Override
     * it to provide your own naming of pasted records.
     *
     * @param {Core.data.Model} record The new record being pasted
     * @return {String}
     */
    generateNewName(record) {
        const originalName = record[this.nameField];

        let counter = 2;

        while (this.client.store.findRecord(this.nameField, `${originalName} - ${counter}`)) {
            counter++;
        }

        return `${originalName} - ${counter}`;
    }

    insertCopiedRecords(recordReference, toInsert) {
        const { store } = this.client;

        if (store.tree) {
            return recordReference.parent.insertChild(toInsert, recordReference.nextSibling);
        }
        else {
            const idxPaste = store.indexOf(recordReference);
            return store.insert(idxPaste + 1, toInsert);
        }
    }

    populateCellMenu({ record, items }) {
        const me = this;

        if (!me.client.readOnly && !me.client.isTreeGrouped && record && !record.isSpecialRow) {
            items.cut = {
                text        : me.cutRecordText,
                localeClass : me,
                cls         : 'b-separator',
                icon        : 'b-icon b-icon-cut',
                weight      : 110,
                disabled    : record.readOnly,
                onItem      : () => me.copyRows(true)
            };

            items.copy = {
                text        : me.copyRecordText,
                localeClass : me,
                icon        : 'b-icon b-icon-copy',
                weight      : 120,
                onItem      : () => me.copyRows()
            };

            if (me.clipboardRecords.length) {
                items.paste = {
                    text        : me.pasteRecordText,
                    localeClass : me,
                    icon        : 'b-icon b-icon-paste',
                    weight      : 130,
                    onItem      : () => me.pasteRows(record)
                };
            }
        }
    }

    /**
     * Sort array of records ASC by its indexes stored in indexPath
     * @param {Core.data.Model[]} array array to sort
     * @private
     */
    sortByIndex(array) {
        return array.sort((rec1, rec2) => {
            const
                idx1 = rec1.indexPath,
                idx2 = rec2.indexPath;

            for (let i = 0; i <= idx1.length; i++) {
                if (idx1[i] < idx2[i]) {
                    return -1;
                }
                if (idx1[i] > idx2[i]) {
                    return 1;
                }
            }
        });
    }
}

RowCopyPaste.featureClass = 'b-row-copypaste';

GridFeatureManager.registerFeature(RowCopyPaste, true, 'Grid');
GridFeatureManager.registerFeature(RowCopyPaste, false, 'Gantt');
GridFeatureManager.registerFeature(RowCopyPaste, false, 'SchedulerPro');
GridFeatureManager.registerFeature(RowCopyPaste, false, 'ResourceHistogram');
