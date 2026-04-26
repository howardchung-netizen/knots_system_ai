import TooltipBase from '../../Scheduler/feature/base/TooltipBase.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import DateHelper from '../../Core/helper/DateHelper.js';

/**
 * @module Gantt/feature/Baselines
 */

const baselineSelector = '.b-task-baseline';

/**
 * Displays a {@link Gantt.model.TaskModel task}'s {@link Gantt.model.TaskModel#field-baselines baselines}
 * below the tasks in the timeline.
 *
 * This feature also optionally shows a tooltip when hovering any of the task's baseline elements. The
 * tooltip's content may be customized
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid.view.mixin.GridFeatures}.
 *
 * @extends Scheduler/feature/base/TooltipBase
 * @inlineexample Gantt/feature/Baselines.js
 * @demo Gantt/baselines
 * @classtype baselines
 * @feature
 */
export default class Baselines extends TooltipBase {
    //region Config

    static get $name() {
        return 'Baselines';
    }

    // Default configuration.
    static get defaultConfig() {
        return {
            cls         : 'b-gantt-task-tooltip',
            align       : 't-b',
            forSelector : baselineSelector,
            recordType  : 'baseline'
        };
    }

    static get pluginConfig() {
        return {
            chain : [
                // onTaskDataGenerated for populating task with baselines
                'onTaskDataGenerated',
                // onPaint for creating tooltip (in TooltipBase)
                'onPaint'
            ]
        };
    }

    //endregion

    //region Init & destroy

    construct(gantt, config) {
        this.tipId = `${gantt.id}-baselines-tip`;
        this.gantt = gantt;

        super.construct(gantt, config);
    }

    doDisable(disable) {
        const
            { client }       = this,
            { dependencies } = client.features;

        // Hide or show the baseline elements
        client.refreshWithTransition();

        // Redraw dependencies *after* elements have animated to new position,
        // and we must clear cache because of position changes.
        if (dependencies) {
            client.setTimeout(() => dependencies.scheduleDraw(true), 300);
        }

        super.doDisable(disable);
    }

    //endregion

    //region Element & template

    resolveTimeSpanRecord(forElement) {
        const baselineElement = forElement.closest(baselineSelector);
        return baselineElement?.elementData.baseline;
    }

    /**
     * Template (a function accepting event data and returning a string) used to display info in the tooltip.
     * The template will be called with an object as with fields as detailed below
     * @config {Function}
     * @param {Object} data A data block containing the information needed to create tooltip content.
     * @param {Gantt.model.Baseline} data.baseline The Baseline record to display
     * @param {Gantt.model.TaskModel} data.baseline.task The owning task of the baseline.
     * @param {String} data.startClockHtml Predefined HTML to show the start time.
     * @param {String} data.endClockHtml Predefined HTML to show the end time.
     */
    template(data) {
        const
            me              = this,
            { baseline }    = data,
            { task }        = baseline,
            displayDuration = me.client.formatDuration(baseline.duration);

        return `
            <div class="b-gantt-task-title">${task.name} (baseline ${baseline.parentIndex + 1})</div>
            <table>
            <tr><td>${me.L('L{TaskTooltip.Start}')}:</td><td>${data.startClockHtml}</td></tr>
            ${baseline.milestone ? '' : `
                <tr><td>${me.L('L{TaskTooltip.End}')}:</td><td>${data.endClockHtml}</td></tr>
                <tr><td>${me.L('L{TaskTooltip.Duration}')}:</td><td class="b-right">${displayDuration + ' ' + DateHelper.getLocalizedNameOfUnit(baseline.durationUnit, baseline.duration !== 1)}</td></tr>
            `}
            </table>
            `;
    }

    getTaskDOMConfig(taskRecord, top) {
        const baselines = taskRecord.baselines.allRecords;

        return {
            className : {
                'b-baseline-wrap' : true
            },
            style : {
                transform : `translateY(${top}px)`
            },
            dataset : {
                // Prefix task id to allow element reusage also for baseline wrap
                taskId : `baselinesFor${taskRecord.id}`
            },
            children : baselines.map((baseline, i) => {
                const baselineBox = this.gantt.taskRendering.getTaskBox(baseline);

                return baselineBox ? {
                    className : {
                        [baseline.cls]              : baseline.cls,
                        'b-task-baseline'           : 1,
                        'b-task-baseline-milestone' : baseline.milestone
                    },
                    style : {
                        width : baselineBox.width,
                        left  : baselineBox.left
                    },
                    dataset : {
                        index : i
                    },
                    elementData : {
                        baseline
                    }
                } : null;
            }),
            syncOptions : {
                syncIdField : 'index'
            }
        };
    }

    onTaskDataGenerated({ taskRecord, top, extraConfigs, wrapperCls }) {
        if (!this.disabled && taskRecord.hasBaselines) {
            wrapperCls['b-has-baselines'] = 1;
            extraConfigs.push(this.getTaskDOMConfig(taskRecord, top));
        }
    }

    //endregion
}

GridFeatureManager.registerFeature(Baselines, false, 'Gantt');
