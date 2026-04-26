import TooltipBase from '../../Scheduler/feature/base/TooltipBase.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';

/**
 * @module Gantt/feature/Rollups
 */

const
    rollupCls      = 'b-task-rollup',
    rollupSelector = `.${rollupCls}`;

/**
 * If the task's {@link Gantt/model/TaskModel#field-rollup} data field is set to true, it displays a small bar or diamond below its summary task in the timeline.
 * Each of the rollup elements show a tooltip when hovering it with details of the task.
 * The tooltip content is customizable, see {@link #config-template} config for details.
 *
 * To edit the rollup data field, use {@link Gantt/column/RollupColumn} or a checkbox on Advanced tab of {@link Gantt/widget/TaskEditor}.
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid/view/mixin/GridFeatures}.
 *
 * @extends Scheduler/feature/base/TooltipBase
 * @inlineexample Gantt/feature/Rollups.js
 * @demo Gantt/rollups
 * @classtype rollups
 * @feature
 */
export default class Rollups extends TooltipBase {
    //region Config

    static get $name() {
        return 'Rollups';
    }

    // Default configuration.
    static get defaultConfig() {
        return {
            cls         : 'b-gantt-task-tooltip',
            align       : 't-b',
            forSelector : rollupSelector
        };
    }

    static get pluginConfig() {
        return {
            chain : [
                // onTaskDataGenerated for decorating task with rollups
                'onTaskDataGenerated',
                // render for creating tooltip (in TooltipBase)
                'onPaint'
            ]
        };
    }

    //endregion

    //region Init & destroy

    construct(gantt, config) {
        const me = this;

        me.tipId = `${gantt.id}-rollups-tip`;

        super.construct(gantt, config);
    }

    attachToTaskStore(store) {
        this.detachListeners('taskStore');

        if (store) {
            store.on({
                name    : 'taskStore',
                update  : 'onStoreUpdateRecord',
                thisObj : this
            });
        }
    }

    doDestroy() {
        this.attachToTaskStore(null);
        super.doDestroy();
    }

    doDisable(disable) {
        const
            me = this,
            { dependencies } = me.client.features;

        if (me.tooltip) {
            me.tooltip.disabled = disable;
        }

        // attach/detach listeners
        me.attachToTaskStore(disable ? null : me.client.taskStore);

        // Hide or show the rollup elements
        me.client.refresh();

        // Redraw dependencies *after* elements have animated to new position,
        // and we must clear cache because of position changes.
        if (dependencies) {
            me.client.setTimeout(() => dependencies.scheduleDraw(true), 300);
        }

        super.doDisable(disable);
    }

    //endregion

    getTipHtml({ activeTarget, event }) {
        const
            { client }              = this,
            task                    = client.resolveTaskRecord(activeTarget),
            rawElements             = document.elementsFromPoint(event.pageX + globalThis.pageXOffset, event.pageY + globalThis.pageYOffset),
            // MS browsers return NodeList instead of array
            rollupElements          = Array.from(rawElements)
                .filter(e => e.classList.contains(rollupCls))
                .sort((lhs, rhs) => parseInt(lhs.dataset.index, 10) - parseInt(rhs.dataset.index, 10)),
            children                = [];

        for (const rollupElement of rollupElements) {
            children.push(task.children[parseInt(rollupElement.dataset.index, 10)]);
        }
        return this.template({
            task,
            children
        });
    }

    /**
     * Template (a function accepting event data and returning a string) used to display info in the tooltip.
     * The template will be called with an object as with fields as detailed below
     * @config {Function}
     * @param {Object} data A data block containing the information needed to create tooltip content.
     * @param {Gantt.model.TaskModel} data.task The summary task to rollup to.
     * @param {Gantt.model.TaskModel[]} data.children The array of rollup tasks.
     */
    template({ children }) {
        const
            me         = this,
            { client } = me,
            pieces     = [];

        children.map((child, index) => {
            const
                { startDate, endDate } = child,
                startText              = client.getFormattedDate(startDate),
                endDateValue           = client.getDisplayEndDate(endDate, startDate),
                endText                = client.getFormattedDate(endDateValue);

            pieces.push(
                `<div class="b-gantt-task-title ${index ? 'b-follow-on' : ''}">${child.name}</div><table>`,
                `<tr><td>${me.L('L{TaskTooltip.Start}')}:</td><td>${me.clockTemplate.template({
                    date : startDate,
                    text : startText,
                    cls  : 'b-sch-tooltip-startdate'
                })}</td></tr>`,
                `<tr><td>${me.L('L{TaskTooltip.End}')}:</td><td>${child.isMilestone ? '' : me.clockTemplate.template({
                    date : endDateValue,
                    text : endText,
                    cls  : 'b-sch-tooltip-enddate'
                })}</td></tr></table>`
            );
        });

        return pieces.join('');
    }

    //region Events

    onStoreUpdateRecord({ record, changes }) {
        // We don't need this listener in case the gantt is loading data
        if (!this.client.project.propagatingLoadChanges) {
            // If it's a size or position change, then sync that parent's rollups
            if (record.parent && (changes.rollup || changes.startDate || changes.endDate)) {
                this.client.taskRendering.redraw(record.parent);
            }
        }
    }

    onTaskDataGenerated({ taskRecord, left, wrapperChildren, style }) {
        // Not checking taskRecord.isParent as it might be a lazy loaded parent (set to `true`)
        if (!this.disabled && Array.isArray(taskRecord.children)) {
            const
                // Shortest last in DOM, so they are on top in the stacking order so that you can hover
                // them if they overlap with longer ones. Otherwise, they might be below and won't trigger
                // their own mouseover events.
                children = taskRecord.children.slice().sort((lhs, rhs) => rhs.durationMS - lhs.durationMS);

            wrapperChildren.push({
                className : `${rollupCls}-wrap`,
                dataset   : {
                    taskFeature : 'rollups'
                },
                children : children.map(child => {
                    // skip inactive children if the task itself is active, skip unscheduled tasks
                    // (might be unscheduled because of delayed calculations)
                    if (child.rollup && child.isScheduled && (!child.inactive || taskRecord.inactive)) {
                        const positionData = this.client.getSizeAndPosition(child);

                        if (!positionData) {
                            return null;
                        }

                        const { position, width } = positionData;

                        return {
                            dataset : {
                                index        : child.parentIndex,
                                rollupTaskId : child.id
                            },
                            className : {
                                [rollupCls]   : rollupCls,
                                [child.cls]   : child.cls,
                                'b-milestone' : child.isMilestone,
                                'b-inactive'  : child.inactive
                            },
                            style : {
                                style,
                                width : child.isMilestone ? null : width,
                                left  : position - left
                            }
                        };
                    }
                    return null;
                }),
                syncOptions : {
                    syncIdField : 'rollupTaskId'
                }
            });
        }
    }

    //endregion
}

GridFeatureManager.registerFeature(Rollups, false, 'Gantt');
