import RowCopyPaste from '../../Grid/feature/RowCopyPaste.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';

/**
 * @module Gantt/feature/TaskCopyPaste
 */

/**
 * Allow using [Ctrl/CMD + C/X] and [Ctrl/CMD + V] to copy/cut and paste tasks. You can configure how a newly pasted record
 * is named using {@link #function-generateNewName}
 *
 * This feature is **enabled** by default
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         taskCopyPaste : true
 *     }
 * });
 * ```
 *
 * ## Keyboard shortcuts
 *
 * By default, this feature will react to Ctrl+C, Ctrl+X and Ctrl+V for standard clipboard actions.
 * You can reconfigure the keys used to trigger these actions, see {@link #config-keyMap} for more details.
 *
 * @extends Grid/feature/RowCopyPaste
 * @inlineexample Gantt/feature/TaskCopyPaste.js
 * @classtype taskCopyPaste
 * @feature
 */
export default class TaskCopyPaste extends RowCopyPaste {

    static get $name() {
        return 'TaskCopyPaste';
    }

    static get type() {
        return 'taskCopyPaste';
    }

    static get configurable() {
        return {
            copyRecordText  : 'L{copyTask}',
            cutRecordText   : 'L{cutTask}',
            pasteRecordText : 'L{pasteTask}'
        };
    }

    construct(gantt, config) {
        super.construct(gantt, config);

        gantt.on({
            beforeRenderTask : 'onBeforeRenderTask',
            thisObj          : this
        });
    }

    onRowCut(record) {
        super.onRowCut(record);

        // After a row is cut - also refresh the associated task bar
        this.client.taskRendering.redraw(record);
    }

    onRowCutOrCopy(taskRecord) {
        super.onRowCutOrCopy(...arguments);

        // After a row is cut or copied - also refresh the associated task bar
        this.client.taskRendering.redraw(taskRecord);
    }

    onBeforeRenderTask({ renderData }) {
        renderData.cls['b-cut-row'] = renderData.row.cls['b-cut-row'];
    }

    pasteRows(referenceRecord = this.client.selectedRecord) {
        const
            me              = this,
            records         = me.clipboardRecords,
            isCut           = me._isCut,
            client          = me.client;

        /**
         * Fires on the owning Gantt before a paste action is performed, return `false` to prevent the action
         * @event beforePaste
         * @preventable
         * @on-owner
         * @param {Gantt.view.Gantt} source Owner Gantt
         * @param {Gantt.model.TaskModel} referenceRecord The reference task record, the clipboard task records will
         * be pasted above this row.
         * @param {Gantt.model.TaskModel[]} records The records about to be pasted
         * @param {Boolean} isCut `true` if this is a cut action
         */
        if (client.readOnly || !records.length || client.trigger('beforePaste', {
            records,
            referenceRecord,
            isCut
        }) === false) {
            return [];
        }

        // important to sort selected before copying to rely on indices when extract/apply dependencies and
        // parents since all ids will be cleared after record.copy operation. Sorting itself is required to
        // make sure records will be added in correct order independent of how they were selected
        me.sortByIndex(records);

        const
            deps             = me.extractDependencies(records, isCut),
            parentsMap       = me.extractParents(records, isCut),
            recordsToProcess = isCut ? records : records.map(rec => {
                rec = rec.copy();
                rec[me.nameField] = me.generateNewName(rec);
                return rec;
            });

        if (isCut) {
            client.store.move(recordsToProcess, referenceRecord);

            // reset clipboard
            me.clearClipboard();
        }
        else {
            me.insertCopiedRecords(referenceRecord, recordsToProcess);
            client.selectedRecords = recordsToProcess;
        }

        // re-apply dependencies via copied records only
        // applying dependencies possible only after copied records were added to project
        me.applyDependencies(recordsToProcess, deps);
        // re-apply hierarchy via copied records only
        me.applyParents(recordsToProcess, parentsMap);

        return recordsToProcess;
    }

    /**
     * Extract dependecies from passed records. The result will include all deps in case of cut operation or
     * only deps via records and not include deps with foreign records.
     * @param {Core.data.Model[]} taskRecords array of records to extract dependencies from
     * @param {Boolean} [isCut] Copy by default, pass 'true' to cut operation.
     * @returns {Object[]} array of dependencies settings via passed records to apply using applyDependencies method
     * @private
     */
    extractDependencies(taskRecords, isCut = false) {
        return taskRecords.map(rec => {
            const deps = [];

            rec.predecessors.forEach(predecessor => {
                if (taskRecords.includes(predecessor.fromEvent)) {
                    deps.push({
                        fromEvent : taskRecords.indexOf(predecessor.fromEvent)
                    });
                }
                // support foreign dependencies for cut/paste opertion
                else if (isCut) {
                    deps.push({
                        fromEventId : predecessor.fromEvent.id
                    });
                }
            });

            rec.successors.forEach(successor => {
                if (taskRecords.includes(successor.toEvent)) {
                    deps.push({
                        toEvent : taskRecords.indexOf(successor.toEvent)
                    });
                }
                // support foreign dependencies for cut/paste opertion
                else if (isCut) {
                    deps.push({
                        toEventId : successor.toEvent.id
                    });
                }
            });

            if (isCut) {
                // remove old record dependencies because it will be removed from the store/tree
                rec.dependencies = [];
            }

            return deps;
        });
    }

    /**
     * Apply dependecies to passed records from dependencies array
     * @param {Core.data.Model[]} taskRecords array of records to apply dependencies on
     * @param {Object[]} deps array of dependencies settings, result of extractDependencies method
     * @private
     */
    applyDependencies(taskRecords, deps) {
        taskRecords.forEach((rec, idx) => {
            // update from/to on dependencies with the new record id
            rec.dependencies = deps[idx].map(dep => {
                return {
                    fromEvent : dep.fromEventId ?? taskRecords[dep.fromEvent]?.id ?? rec.id,
                    toEvent   : dep.toEventId ?? taskRecords[dep.toEvent]?.id ?? rec.id
                };
            });
        });
    }

    /**
     * Extract parents from passed records. Result will include only hierarchy via copied records.
     * @param {Core.data.Model[]} taskRecords array of records to extract parents from
     * @returns {Object[]} array of parent id settings via passed records to apply using applyParents method
     * @private
     */
    extractParents(taskRecords) {
        return taskRecords.map(rec => {
            if (taskRecords.includes(rec.parent)) {
                return taskRecords.indexOf(rec.parent);
            }
        });
    }

    /**
     * Apply parents to passed records.
     * @param {Core.data.Model[]} taskRecords array of records to apply hierarchy on.
     * @param {Object[]} parentsMap array of parent id settings via passed records, result of extractParents method
     * @private
     */
    applyParents(taskRecords, parentsMap) {
        taskRecords.forEach((rec, idx) => {
            if (!isNaN(parentsMap[idx])) {
                taskRecords[parentsMap[idx]].appendChild(rec);
            }
        });
    }
}

GridFeatureManager.registerFeature(TaskCopyPaste, true, 'Gantt');
