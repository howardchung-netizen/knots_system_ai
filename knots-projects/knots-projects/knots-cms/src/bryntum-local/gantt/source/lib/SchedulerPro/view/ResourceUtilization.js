import ResourceHistogram from './ResourceHistogram.js';
import ResourceUtilizationStore from '../data/ResourceUtilizationStore.js';
import DateHelper from '../../Core/helper/DateHelper.js';
import { TimeUnit } from '../../Engine/scheduling/Types.js';
import '../../Grid/column/TreeColumn.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import Tree from '../../Grid/feature/Tree.js';

/**
 * @module SchedulerPro/view/ResourceUtilization
 */

/**
 * Widget showing the utilization levels of the project resources.
 * The resources are displayed in a summary list where each row can
 * be expanded to show the events assigned for the resource.
 *
 * This demo shows the Resource utilization widget:
 * {@inlineexample SchedulerPro/view/ResourceUtilization.js}
 *
 * The view requires a {@link #config-project Project instance} to be provided:
 *
 * ```javascript
 * const project = new ProjectModel({
 *     autoLoad  : true,
 *     transport : {
 *         load : {
 *             url : 'examples/schedulerpro/view/data.json'
 *         }
 *     }
 * });
 *
 * const resourceUtilization = new ResourceUtilization({
 *     project,
 *     appendTo    : 'targetDiv',
 *     rowHeight   : 60,
 *     minHeight   : '20em',
 *     flex        : '1 1 50%',
 *     showBarTip  : true
 * });
 * ```
 *
 * You can also pair the view with other timeline views such as the Gantt or Scheduler,
 * using the {@link #config-partner} config.
 *
 * @extends SchedulerPro/view/ResourceHistogram
 * @classtype resourceutilization
 */

export default class ResourceUtilization extends ResourceHistogram {

    //region Config

    static $name = 'ResourceUtilization'
    static type = 'resourceutilization'

    static configurable = {
        /**
         * @hideconfigs crudManager, crudManagerClass, assignments, resources, events, dependencies, assignmentStore,
         * resourceStore, eventStore, dependencyStore, data
         */

        timeAxisColumnCellCls : 'b-sch-timeaxis-cell b-resourceutilization-cell',

        /**
         * A ProjectModel instance (or a config object) to display resource allocation of.
         *
         * Note: This config is mandatory.
         * @config {Object|SchedulerPro.model.ProjectModel} project
         */

        rowHeight : 30,

        showEffortUnit : false,

        /**
         * @config {Boolean} showMaxEffort
         * @hide
         */

        showMaxEffort : false,

        /**
         * Set to `true` if you want to display resources effort values in bars
         * (for example: `24h`, `7d`, `60min` etc.).
         * The text contents can be changed by providing {@link #config-getBarText} function.
         * @config {Boolean}
         * @default
         */
        showBarText : true,

        /**
         * A Function which returns the tooltip text to display when hovering a bar.
         * The following parameters are passed:
         * @param {Object} data - The backing data of the histogram rectangle
         * @param {Object} data.rectConfig - The rectangle configuration object
         * @param {Object} data.datum - The datum being rendered
         * @param {Number} data.index - The index of the datum being rendered
         * @config {Function}
         */
        barTooltipTemplate({ effort, isGroup, resource, assignment }) {
            let result = '';

            // const barTip = this.callback('getBarTextTip', me, [renderData, data[index], index]);
            if (effort) {
                if (resource) {
                    result = this.getResourceBarTip(...arguments);
                }
                else if (assignment) {
                    result = this.getAssignmentBarTip(...arguments);
                }
                else if (isGroup) {
                    result = this.getGroupBarTip(...arguments);
                }
            }

            return result;
        },

        series : {
            effort : {
                type  : 'bar',
                field : 'effort'
            }
        },

        readOnly : true,

        columns : [
            {
                type        : 'tree',
                field       : 'name',
                text        : 'L{nameColumnText}',
                localeClass : this
            }
        ]
    }

    //endregion

    updateProject(project) {
        super.updateProject(project);

        this.store = this.buildStore(project);
    }

    buildStore(project) {
        return ResourceUtilizationStore.new({ project });
    }

    insertScaleColumn() {}

    //region Render

    getTipHtml({ activeTarget }) {
        const
            index          = activeTarget.dataset.index,
            record         = this.getRecordFromElement(activeTarget),
            allocationData = this.allocationDataByRecord.get(record.origin),
            data           = allocationData[parseInt(index, 10)];

        return this.barTooltipTemplate(data);
    }

    registerRecordAllocationReport(record) {
        if (record.isResourceModel) {
            return super.registerRecordAllocationReport(record);
        }

        if (record.isAssignmentModel) {
            return this.registerAssignmentAllocationReport(record);
        }
    }

    onDestroy() {
        const me = this;

        // destroy observers & entities made for assignments displayed by this view

        for (const [record, observer] of me.allocationObserverByRecord?.entries()) {
            if (record.isAssignmentModel) {
                record.resource.removeObserver(observer);
                me.allocationObserverByRecord.delete(record);
            }
        }

        for (const [record, entity] of me.allocationReportByRecord?.entries()) {
            if (record.isAssignmentModel) {
                record.resource.removeEntity(entity);
                me.allocationReportByRecord.delete(entity);
            }
        }

        if (me.destroyStores) {
            me.store?.destroy();
        }

        super.onDestroy();
    }

    registerAssignmentAllocationReport(record) {
        const
            me               = this,
            graph            = me.project.getGraph(),
            allocationReport = me.allocationReportByRecord.get(record.resource);

        if (allocationReport) {
            // store resource allocation report reference
            me.allocationReportByRecord.set(record, allocationReport);

            // track allocation report changes
            const allocationObserver = graph.observe(
                function * () {
                    return yield allocationReport.$.allocation;
                },
                allocation => me.onRecordAllocationCalculated(record, allocation, allocationReport)
            );

            me.allocationObserverByRecord.set(record, allocationObserver);

            // trigger rendering on allocation report changes
            record.resource.addObserver(allocationObserver);
        }

        return allocationReport;
    }

    onRecordAllocationCalculated(record, allocation, allocationReport) {
        // if that's an assignment row
        if (record.isAssignmentModel) {
            if (allocation.byAssignments.get(record)) {
                super.onRecordAllocationCalculated(record, allocation, allocationReport);
            }
            // If allocation report is calculated w/o the assignment
            // it means that the assignment was moved to another resource.
            // Then we drop linkage of that assignment to that allocation report
            else {
                // remove reference of the assignment to the allocation repoort
                this.allocationReportByRecord.delete(record);

                const observer = this.allocationObserverByRecord.get(record);

                // remove the allcation report observer that tracks changes and refreshes the assignment row
                if (observer) {
                    allocationReport.resource.removeObserver(observer);
                    this.allocationObserverByRecord.delete(record);
                }
            }
        }
        else {
            super.onRecordAllocationCalculated(record, allocation, allocationReport);
        }
    }

    onRowManagerRenderRow({ row, record }) {
        // indicate row kinds
        row.assignCls({
            'b-resource-row'   : record.origin?.isResourceModel,
            'b-assignment-row' : record.origin?.isAssignmentModel
        });
    }

    getResourceGroupParent(resource) {
        const instanceMeta = resource.instanceMeta(this.store);

        return instanceMeta?.groupParent;
    }

    renderResourceHistogram(data) {
        const { project } = data.grid;

        if (project.isInitialCommitPerformed && !data.record.isSpecialRow) {
            // renderResourceHistogram() expects a real resource model
            // so get it from its wrapper model
            data.record = data.record.origin;

            return super.renderResourceHistogram(data);
        }
    }

    getCell(data) {
        // if real resource or assignment is provided
        if (data.record?.isResourceModel || data.record?.isAssignmentModel) {
            // use its wrapper record to find proper cell
            data.record = this.store.getModelByOrigin(data.record);
        }

        return super.getCell(data);
    }

    buildHistogramWidget(config = {}, ...args) {
        if (!this.getBarTextRenderData && !config?.getBarTextRenderData) {
            config.getBarTextRenderData = this.getBarTextRenderDataDefault;
        }

        config.cls = 'b-hide-offscreen b-resourceutilization-histogram';

        config.height = this.rowHeight;

        return super.buildHistogramWidget(config, ...args);
    }

    getBarTextRenderDataDefault(renderData, datum, index) {
        // place effort text centered vertically
        renderData.y = '50%';

        return renderData;
    }

    getRecordAllocationInfoRenderData(record, allocation, cellElement, histogramWidget = null) {
        let data;

        if (record.isResourceModel) {
            data = allocation.total;
        }
        else if (record.isAssignmentModel) {
            data = allocation.byAssignments.get(record);
        }

        // if allocation is collected
        if (data) {
            // we don't want the histogram bar heights based on effort
            // so set heights to 1 here to fit row heights fully
            for (let i = 0, { length } = data; i < length; i++) {
                if (data[i].effort) data[i].height = 1;
            }
        }

        return data;
    }

    //endregion

    getResourceBarTip(datum) {
        const
            me                       = this,
            { showBarTip, timeAxis } = me;

        let result = '';

        if (showBarTip && datum.effort) {
            const
                unit          = me.getBarTipEffortUnit(...arguments),
                allocated     = me.getEffortText(datum.effort, unit, true),
                available     = me.getEffortText(datum.maxEffort, unit, true),
                assignmentTpl = me.L('L{groupBarTipAssignment}');

            let
                dateFormat        = 'L',
                resultFormat      = me.L('L{groupBarTipInRange}'),
                assignmentsSuffix = '';

            if (DateHelper.compareUnits(timeAxis.unit, TimeUnit.Day) === 0) {
                resultFormat = me.L('L{groupBarTipOnDate}');
            }
            else if (DateHelper.compareUnits(timeAxis.unit, TimeUnit.Second) <= 0) {
                dateFormat = 'HH:mm:ss A';
            }
            else if (DateHelper.compareUnits(timeAxis.unit, TimeUnit.Hour) <= 0) {
                dateFormat = 'LT';
            }

            let assignmentsArray = [...datum.assignmentIntervals.entries()]
                .filter(([assignment, data]) => data.effort)
                .sort(([key1, value1], [key2, value2]) => value1.effort > value2.effort ? -1 : 1);

            if (assignmentsArray.length > me.groupBarTipAssignmentLimit) {
                assignmentsSuffix = '<br>' + me.L('L{plusMore}').replace('{value}', assignmentsArray.length - me.groupBarTipAssignmentLimit);
                assignmentsArray = assignmentsArray.slice(0, this.groupBarTipAssignmentLimit);
            }

            const assignments = assignmentsArray.map(([assignment, info]) => {

                return assignmentTpl.replace('{event}', assignment.event.name)
                    .replace('{allocated}', me.getEffortText(info.effort, unit, true))
                    .replace('{available}', me.getEffortText(info.maxEffort, unit, true))
                    .replace('{cls}', info.isOverallocated ? 'b-overallocated' : info.isUnderallocated ? 'b-underallocated' : '');

            }).join('<br>') + assignmentsSuffix;

            // TODO: we need smth like sprintf("has {0} of {1} items", cnt, total)
            // to be able to test localizable strings
            result = resultFormat
                .replace('{assignments}', assignments)
                .replace('{startDate}', DateHelper.format(datum.tick.startDate, dateFormat))
                .replace('{endDate}', DateHelper.format(datum.tick.endDate, dateFormat))
                .replace('{allocated}', allocated)
                .replace('{available}', available)
                .replace('{cls}', datum.isOverallocated ? 'b-overallocated' : datum.isUnderallocated ? 'b-underallocated' : '');

            result = `<div class="b-histogram-bar-tooltip">${result}</div>`;
        }

        return result;
    }

    getAssignmentBarTip(datum) {
        const
            me                       = this,
            { showBarTip, timeAxis } = me;

        let result = '';

        if (showBarTip && datum.effort) {
            const
                unit      = me.getBarTipEffortUnit(...arguments),
                allocated = me.getEffortText(datum.effort, unit, true),
                available = me.getEffortText(datum.maxEffort, unit, true);

            let
                dateFormat   = 'L',
                resultFormat = me.L('L{barTipInRange}');

            if (DateHelper.compareUnits(timeAxis.unit, TimeUnit.Day) === 0) {
                resultFormat = me.L('L{barTipOnDate}');
            }
            else if (DateHelper.compareUnits(timeAxis.unit, TimeUnit.Second) <= 0) {
                dateFormat = 'HH:mm:ss A';
            }
            else if (DateHelper.compareUnits(timeAxis.unit, TimeUnit.Hour) <= 0) {
                dateFormat = 'LT';
            }

            // TODO: we need smth like sprintf("has {0} of {1} items", cnt, total)
            // to be able to test localizable strings
            result = resultFormat
                .replace('{startDate}', DateHelper.format(datum.tick.startDate, dateFormat))
                .replace('{endDate}', DateHelper.format(datum.tick.endDate, dateFormat))
                .replace('{allocated}', allocated)
                .replace('{available}', available)
                .replace('{cls}', datum.cls || '');

            if (datum.assignment) {
                result = result.replace('{event}', datum.assignment.event.name);
            }

            result = `<div class="b-histogram-bar-tooltip">${result}</div>`;
        }

        return result;
    }

}

ResourceUtilization.initClass();

// enable tree feature for the utilization panel by default
GridFeatureManager.registerFeature(Tree, true, 'ResourceUtilization');
