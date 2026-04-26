import SchedulerProBase from './SchedulerProBase.js';
import '../column/ScaleColumn.js';
import '../../Scheduler/feature/NonWorkingTime.js';

import '../localization/En.js';
import '../../Scheduler/column/TimeAxisColumn.js';

// Always required features
import '../../Grid/feature/Tree.js';
import '../../Grid/feature/RegionResize.js';
import Histogram from '../../Core/widget/graph/Histogram.js';
import { TimeUnit } from '../../Engine/scheduling/Types.js';
import { CalculatedValueGen } from '../../ChronoGraph/chrono/Identifier.js';
import DateHelper from '../../Core/helper/DateHelper.js';
import { BaseCalendarMixin } from '../../Engine/quark/model/scheduler_basic/BaseCalendarMixin.js';
import NumberFormat from '../../Core/helper/util/NumberFormat.js';
import Tooltip from '../../Core/widget/Tooltip.js';

/**
 * @module SchedulerPro/view/ResourceHistogram
 */

const emptyFn = () => {};

/**
 * This widget displays a read-only timeline report of the workload for the resources in a
 * {@link SchedulerPro/model/ProjectModel project}. The resource allocation is visualized as bars along the time axis
 * with an optional line indicating the maximum available time for each resource. A {@link SchedulerPro/column/ScaleColumn}
 * is also added automatically.
 *
 * To create a standalone histogram, simply configure it with a Project instance:
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
 * const histogram = new ResourceHistogram({
 *     project,
 *     appendTo    : 'targetDiv',
 *     rowHeight   : 60,
 *     minHeight   : '20em',
 *     flex        : '1 1 50%',
 *     showBarTip  : true,
 *     columns     : [
 *         {
 *             width : 200,
 *             field : 'name',
 *             text  : 'Resource'
 *         }
 *     ]
 * });
 * ```
 *
 * You can also pair the histogram with other timeline views such as the Gantt or Scheduler, using the {@link Scheduler/view/TimelineBase#config-partner} config.
 *
 * You can configure (or hide completely) the built-in scale column easily:
 *
 * ```javascript
 * const histogram = new ResourceHistogram({
 *    project,
 *    appendTo    : 'targetDiv',
 *    columns     : [
 *        {
 *            width : 200,
 *            field : 'name',
 *            text  : 'Resource'
 *        },
 *        // Hide the scale column (or add any other column configs)
 *        {
 *            type   : 'scale',
 *            hidden : true
 *        }
 *    ]
 * });
 * ```
 *
 * {@inlineexample SchedulerPro/view/ResourceHistogram.js}
 * @extends SchedulerPro/view/SchedulerProBase
 * @classtype resourcehistogram
 */
export default class ResourceHistogram extends SchedulerProBase {

    //region Config

    static $name = 'ResourceHistogram'

    static type = 'resourcehistogram'

    /**
     * @hideconfigs durationDisplayPrecision, resourceColumns, enableRecurringEvents, eventBarTextField,
     * eventBodyTemplate, eventColor, eventLayout, eventRenderer, eventRendererThisObj, eventStyle,
     * horizontalEventSorterFn, horizontalLayoutPackClass, horizontalLayoutStackClass, milestoneAlign,
     * milestoneTextPosition, highlightPredecessors, highlightSuccessors, removeUnassignedEvent,
     * eventAssignHighlightCls, eventCls, eventSelectedCls, fixedEventCls, overScheduledEventClass
     */

    static configurable = {

        timeAxisColumnCellCls : 'b-sch-timeaxis-cell b-resourcehistogram-cell',

        effortFormat : '0',

        showEffortUnit : true,

        rowHeight : 50,

        /**
         * Default time unit to display resources effort values.
         * The value is used as default when displaying effort in tooltips and bars text.
         * Yet the effective time unit used might change dynamically when zooming in the histogram
         * so its ticks unit gets smaller than the default unit.
         * Please use {@link #config-barTipEffortUnit} to customize default units for tooltips only
         * and {@link #config-barTextEffortUnit} to customize default units in bar texts.
         * @config {String}
         * @default hour
         */
        effortUnit : TimeUnit.Hour,

        /**
         * Default time unit used for displaying resources effort in bars.
         * Yet the effective time unit used might change dynamically when zooming in the histogram
         * so its ticks unit gets smaller than the default unit.
         * Please use {@link #config-barTipEffortUnit} to customize default units for tooltips
         * (or {@link #config-effortUnit} to customize both texts and tooltips default units).
         * @config {String}
         * @default hour
         */
        barTextEffortUnit : null,

        /**
         * Default time unit used when displaying resources effort in tooltips.
         * Yet the effective time unit used might change dynamically when zooming in the histogram
         * so its ticks unit gets smaller than the default unit.
         * Please use {@link #config-barTextEffortUnit} to customize default units for bar texts
         * (or {@link #config-effortUnit} to customize both texts and tooltips default units).
         * @config {String}
         * @default hour
         */
        barTipEffortUnit : null,

        /**
         * Set to `true` if you want to display the maximum resource allocation line.
         * @config {Boolean}
         * @default
         */
        showMaxEffort : true,

        /**
         * Set to `true` if you want to display resources effort values in bars
         * (for example: `24h`, `7d`, `60min` etc.).
         * The text contents can be changed by providing {@link #config-getBarText} function.
         * @config {Boolean}
         */
        showBarText : false,

        /**
         * Set to `true` if you want to display a tooltip when hovering an allocation bar. You can also pass a
         * {@link Core/widget/Tooltip} config object.
         * Please use {@link #config-barTooltipTemplate} function to customize the tooltip contents.
         * @config {Boolean|Object}
         */
        showBarTip : false,

        barTooltip : null,

        barTooltipClass : Tooltip,

        series : {
            maxEffort : {
                type  : 'outline',
                field : 'maxEffort'
            },
            effort : {
                type  : 'bar',
                field : 'effort'
            }
        },

        /**
         * A Function which returns a CSS class name to add to a rectangle element.
         * The following parameters are passed:
         * @param {Object} series - The series being rendered
         * @param {Object} rectConfig - The rectangle configuration object
         * @param {Object} datum - The datum being rendered
         * @param {Number} index - The index of the datum being rendered
         * @config {Function}
         */
        getRectClass : null,

        // TODO get rid of getBarTip in 5.1.0
        /**
         * **DEPRECATED** A Function which returns the tooltip text to display when hovering a bar.
         * The following parameters are passed:
         * @param {Object} series - The series being rendered
         * @param {Object} rectConfig - The rectangle configuration object
         * @param {Object} datum - The datum being rendered
         * @param {Number} index - The index of the datum being rendered
         * @deprecated Please use {@link config-barTooltipTemplate}
         * @config {Function}
         */
        getBarTip : null,

        /**
         * A Function which returns the tooltip text to display when hovering a bar.
         * The following parameters are passed:
         * @param {Object} context The tooltip context info
         * @param {Object} context.datum The histogram bar being hovered info:
         * @param {SchedulerPro.model.ResourceModel} context.resource Resource model
         * @param {Set} context.datum.assignments Set of assignments ongoing for the interval
         * @param {Map} context.datum.assignmentIntervals Individual ongoing assignments allocation indexed by assignments
         * @param {Number} context.datum.effort Resource effort in the interval (in milliseconds)
         * @param {Boolean} context.datum.isOverallocated `True` if the interval contains a fact of the resource overallocation
         * @param {Boolean} context.datum.isUnderallocated `True` if the resource is underallocated in the interval
         * @param {Number} context.datum.maxEffort Maximum possible resource effort in the interval (in milliseconds)
         * @param {Object} context.datum.rectConfig The rectangle DOM configuration object
         * @param {Object} context.datum.tick Timeaxis interval
         * @param {Number} context.datum.units Resource allocation in percents
         * @param {Core.widget.Tooltip} context.tip The tooltip instance
         * @param {HTMLElement} context.element The Element for which the Tooltip is monitoring mouse movement
         * @param {HTMLElement} context.activeTarget The target element that triggered the show
         * @param {Event} context.event The raw DOM event
         * @config {Function}
         */
        barTooltipTemplate({ datum }) {
            let result = '';

            const { effort, isGroup } = datum;

            if (effort) {
                if (isGroup) {
                    result = this.getGroupBarTip(...arguments);
                }
                else {
                    result = this.getResourceBarTip(...arguments);
                }
            }

            return result;
        },

        /**
         * A Function which returns the text to render inside a bar.
         * The following parameters are passed:
         * @param {Object} datum - The datum being rendered
         * @param {Number} index - The index of the datum being rendered
         * @config {Function}
         */
        getBarText : null,

        getBarTextRenderData : undefined,

        groupBarTipAssignmentLimit : 5,

        histogramWidgetClass : Histogram,

        histogramWidgetConfig : null,

        /**
         * Set to `true` to include inactive tasks allocation and `false` to not take such tasks into account.
         * @config {Boolean}
         * @default
         */
        includeInactiveEvents : false,

        fixedRowHeight : true
    }

    static properties = {
        allocationReportByRecord   : new Map(),
        allocationDataByRecord     : new Map(),
        allocationObserverByRecord : new Map(),
        resourceGroupsToUpdate     : new Set(),
        resourceGroupsAllocation   : new Map()
    }

    //endregion

    //region Constructor/Destructor

    construct(config) {
        super.construct(config);

        const me = this;

        // debounce refreshRows calls
        me.scheduleRefreshRows = me.createOnFrame(me.refreshRows, [], me, true);

        // TODO: hack to get rid of "Horizontal" store tracking approach.
        // It seems there is no need to use 99% of the "Horizontal" mode for the histogram
        // so ideally we need to make a special class for it.
        me.horizontal.refreshResourcesWhenReady = me.horizontal.onAssignmentStoreChange = me.horizontal.renderer = function() {};

        me.rowManager.on({
            beforeRowHeight : 'onBeforeRowHeight',
            renderRow       : 'onRowManagerRenderRow',
            thisObj         : me
        });

        me.timeAxis.on({
            endReconfigure : 'onTimeAxisEndReconfigure',
            thisObj        : this
        });
    }

    async onRowManagerRenderRow({ record }) {
        // render group level histogram and scale (when project is calculated)
        if (record.isSpecialRow) {
            const me = this;

            if (me.project.isDelayingCalculation) {
                await me.project.commitAsync();

                if (me.isDestroyed) {
                    return;
                }
            }

            me.renderGroupHistogram(record);
            me.renderGroupScale(record);
        }
    }

    onDestroy() {
        const me = this;

        for (const [record, observer] of me.allocationObserverByRecord?.entries()) {
            if (record.removeObserver) {
                record.removeObserver(observer);
                me.allocationObserverByRecord.delete(record);
            }
        }

        for (const [record, entity] of me.allocationReportByRecord?.entries()) {
            if (record.removeEntity) {
                record.removeEntity?.(entity);
                me.allocationReportByRecord.delete(entity);
            }
        }

        me.allocationDataByRecord.clear();

        me._histogramWidget?.destroy();
        me._groupHistogramWidget?.destroy();
        me.barTooltip = null;
    }

    //endregion

    //region Project

    updateProject(project) {
        this.detachListeners('resourceHistogramProject');

        project.on({
            name               : 'resourceHistogramProject',
            startApplyResponse : 'onProjectStartApplyResponse',
            refresh            : 'internalOnProjectRefresh',
            repopulateReplica  : 'onRepopulateReplica',

            thisObj : this
        });

        this.store = project.resourceStore;
    }

    //endregion

    //region Internal

    scheduleRefreshRows() {}

    // TODO: hack to get rid of "HorizontalRendering" events rendering logic
    getEventsToRender() {}

    getRowHeight() {
        return this.rowHeight;
    }

    get scaleColumn() {
        return this.columns.query(column => column.isScaleColumn)[0];
    }

    get scalePoints() {
        return this._scalePoints;
    }

    set scalePoints(scalePoints) {
        const
            { project, histogramWidget, scaleColumn } = this,
            lastPoint                                 = scalePoints[scalePoints.length - 1],
            { value : scaleMax, unit : scaleUnit }    = lastPoint;

        this.scaleUnit    = scaleUnit;
        this._scalePoints = scalePoints;

        let maxInScaleUnits = scaleMax;

        if (scaleColumn) {
            const { scaleWidget } = scaleColumn;

            maxInScaleUnits += scaleWidget.scaleMaxPadding * scaleMax;
        }

        // Applying new maximum value to the histogram.
        // We have to convert scale units to milliseconds since allocation report provides values in milliseconds.
        histogramWidget.topValue = project.run('$convertDuration', maxInScaleUnits, scaleUnit, TimeUnit.Millisecond);

        // Applying new points to the scale column
        if (scaleColumn) {
            scaleColumn.scalePoints = scalePoints;
        }
    }

    buildScalePointText(scalePoint) {
        return `${scalePoint.value}${DateHelper.getShortNameOfUnit(scalePoint.unit)}`;
    }

    generateScalePoints(unit, scaleMax) {
        const
            { timeAxis } = this,
            scalePoints           = [];

        if (!unit) {
            unit     = timeAxis.unit;
            scaleMax = timeAxis.increment;
        }

        let scaleStep;

        // If the ticks are defined as 1 unit let's break it down to smaller units
        if (scaleMax === 1) {
            // getting timeaxis tick sub-unit and number of them in a tick
            unit     = DateHelper.getSmallerUnit(unit);
            scaleMax = Math.round(DateHelper.as(unit, scaleMax, timeAxis.unit));
        }

        // Let's try to guess how many points in the scale will work nicely
        for (const factor of [7, 5, 4, 3, 2]) {
            // unitsNumber is multiple of "factor" -> we generate "factor"-number of points
            if (!(scaleMax % factor)) {
                scaleStep = scaleMax / factor;
                break;
            }
        }

        // fallback to a single point equal to maximum value
        if (!scaleStep) {
            scaleStep = scaleMax;
        }

        for (let value = scaleStep; value <= scaleMax; value += scaleStep) {
            scalePoints.push({
                value
            });
        }

        const lastPoint = scalePoints[scalePoints.length - 1];
        // put unit and label to the last point
        lastPoint.unit = unit;
        lastPoint.text = this.buildScalePointText(lastPoint);

        return scalePoints;
    }

    updateViewPreset(viewPreset) {
        const me = this;

        // Set a flag indicating that we're inside of `updateViewPreset` so our `onTimeAxisEndReconfigure` will skip its call.
        // We call it here later.
        me._updatingViewPreset = true;
        super.updateViewPreset(...arguments);
        me._updatingViewPreset = false;

        // In `super,updateViewPreset` function `this.render` is called which checks if the engine is not dirty
        // ..and we modify `ticksIdentifier` atom in `onTimeAxisEndReconfigure`
        // so the engine state gets dirty and rendering gets delayed which ends up an exception.
        // So we call `onTimeAxisEndReconfigure` after super `updateViewPreset` code
        // to keep the engine non-dirty while zooming/setting a preset.
        // This scenario is covered w/ SchedulerPro/tests/pro/view/ResourceHistogramZoom.t.js
        if (me.project.isInitialCommitPerformed && me.isPainted) {
            me.onTimeAxisEndReconfigure();
        }
    }

    onPaint({ firstPaint }) {
        super.onPaint({ firstPaint });

        if (firstPaint && this.showBarTip) {
            this.barTooltip = {};
        }
    }

    updateGetBarTip(value) {
        // reset barTooltipTemplate if custom getBarTip function is provided
        if (value) {
            this.barTooltipTemplate = null;
        }

        return value;
    }

    changeBarTooltip(tooltip, oldTooltip) {
        oldTooltip?.destroy();

        if (tooltip) {
            return tooltip.isTooltip ? tooltip : this.barTooltipClass.new({
                forElement  : this.timeAxisSubGridElement,
                forSelector : '.b-histogram rect',
                hoverDelay  : 0,
                trackMouse  : false,
                cls         : 'b-celltooltip-tip',
                getHtml     : this.getTipHtml.bind(this)
            }, this.showBarTip, tooltip);
        }

        return null;
    }

    onRepopulateReplica() {
        this.ticksIdentifier = null;
        this.allocationReportByRecord.clear();
        this.allocationDataByRecord.clear();
        this.allocationObserverByRecord.clear();
    }

    getTipHtml(args) {
        const
            { activeTarget } = args,
            index         = activeTarget.dataset.index,
            record        = this.getRecordFromElement(activeTarget),
            histogramData = this.allocationDataByRecord.get(record);

        args = Object.assign({}, args);

        args.index = parseInt(index, 10);
        args.datum = histogramData[args.index];

        return this.barTooltipTemplate?.(args);
    }

    buildTicksIdentifier() {
        const
            me    = this,
            graph = me.project.getGraph();

        if (!me.ticksIdentifier) {
            me.ticksIdentifier = graph.addIdentifier(CalculatedValueGen.new());
        }

        me.ticksIdentifier.writeToGraph(graph, new BaseCalendarMixin({
            unspecifiedTimeIsWorking : false,
            intervals                : me.timeAxis.ticks.map(tick => {
                return {
                    startDate : tick.startDate,
                    endDate   : tick.endDate,
                    isWorking : true
                };
            })
        }));

        // process ticks to detect if their widths are monotonous
        // or some tick has a different width value
        me.collectTicksWidth();

        return me.ticksIdentifier;
    }

    collectTicksWidth() {
        const
            { ticks }     = this.timeAxis,
            prevDuration  = ticks[0].endDate - ticks[0].startDate,
            tickDurations = { 0 : prevDuration };

        let
            totalDuration = prevDuration,
            isMonotonous  = true;

        for (let i = 1, { length } = ticks; i < length; i++) {
            const
                tick   = ticks[i],
                duration = tick.endDate - tick.startDate;

            // the ticks width is different -> reset isMonotonous flag
            if (prevDuration !== duration) {
                isMonotonous = false;
            }

            totalDuration    += duration;
            tickDurations[i] = duration;
        }

        // if the ticks widths are not monotonous we need to calculate
        // each bar width to provide it to the histogram widget later
        if (!isMonotonous) {
            const ticksWidth = {};
            for (let i = 0, { length } = ticks; i < length; i++) {
                ticksWidth[i] = tickDurations[i] / totalDuration;
            }
            this.ticksWidth = ticksWidth;
        }
        else {
            this.ticksWidth = null;
        }
    }

    resumeRefresh(trigger) {
        super.resumeRefresh(false);

        const me = this;

        if (!me.refreshSuspended && trigger) {
            if (!me.rowManager.topRow) {
                // TODO: investigate why we need this
                me.rowManager.reinitialize();
                // To clear histogram when no rows to refresh
                me.histogramWidget.data = [];
                me.histogramWidget.refresh();
            }
            else {
                me.refreshWithTransition();
            }
        }
    }

    internalOnProjectRefresh({ isInitialCommit, isCalculated }) {
        if (isCalculated) {
            if (!this.ticksIdentifier) {
                this.onTimeAxisEndReconfigure();
            }

            this.resumeRefresh(isInitialCommit || !this.rowManager.topRow);
        }
    }

    get columns() {
        return super.columns;
    }

    set columns(columns) {
        const me = this;

        super.columns = columns;

        if (!me.isDestroying) {
            me.timeAxisColumn.renderer = me.renderResourceHistogram;
            me.timeAxisColumn.cellCls = me.timeAxisColumnCellCls;

            // Unless provided from outside, insert the scale column in the correct place
            if (!columns.some(col => col.type === 'scale')) {
                me.insertScaleColumn();
            }
        }
    }

    insertScaleColumn() {
        this.columns.rootNode.insertChild({
            type : 'scale'
        }, this.timeAxisColumn);
    }

    onProjectStartApplyResponse() {
        this.suspendRefresh();
    }

    buildHistogramWidget(config) {
        const me = this;

        if (me.getBarTextRenderData && !config.getBarTextRenderData) {
            config.getBarTextRenderData = me.getBarTextRenderData;
        }

        return this.histogramWidgetClass.new({
            owner              : me,
            appendTo           : me.element,
            cls                : 'b-hide-offscreen b-resourcehistogram-histogram',
            height             : me.rowHeight,
            width              : me.timeAxisColumn?.width || 0,
            omitZeroHeightBars : true,
            data               : [],
            getBarTip          : !this.barTooltipTemplate && this.getBarTip || emptyFn,
            getRectClass       : me.getRectClass || me.getRectClassDefault,
            getBarText         : me.getBarText || me.getBarTextDefault,
            series             : me.series
        }, me.histogramWidgetConfig, config);
    }

    get histogramWidget() {
        const me = this;

        if (!me._histogramWidget) {

            const series = me.series;

            if (!me.showMaxEffort && series.maxEffort) {
                series.maxEffort = false;
            }

            me._histogramWidget = me.buildHistogramWidget();
        }

        return me._histogramWidget;
    }

    // Injectable method.
    getRectClassDefault(series, rectConfig, datum) {
        if (series.id === 'effort') {
            switch (true) {
                case datum.isOverallocated :
                    return 'b-overallocated';

                case datum.isUnderallocated :
                    return 'b-underallocated';
            }
        }

        return '';
    }

    get effortFormatter() {
        const
            me     = this,
            format = me.effortFormat;

        let formatter = me._effortFormatter;

        if (!formatter || me._effortFormat !== format) {
            formatter = NumberFormat.get(me._lastFormat = format);

            me._effortFormatter = formatter;
        }

        return formatter;
    }

    getEffortText(effort, unit, showEffortUnit = this.showEffortUnit) {
        const { scaleUnit, effortFormatter } = this;

        unit = unit || scaleUnit;

        const
            localizedUnit = DateHelper.getShortNameOfUnit(unit),
            effortInUnits = DateHelper.as(unit, effort, TimeUnit.Millisecond);

        return effortFormatter.format(effortInUnits) + (showEffortUnit ? localizedUnit : '');
    }

    getBarTipEffortUnit() {
        const
            { effortUnit, barTipEffortUnit, timeAxis } = this,
            defaultUnit                                = barTipEffortUnit || effortUnit;

        return DateHelper.compareUnits(timeAxis.unit, defaultUnit) < 0 ? timeAxis.unit : defaultUnit;
    }

    getGroupBarTip({ datum }) {
        const
            me                       = this,
            { showBarTip, timeAxis } = me;

        let result = '';

        if (showBarTip && datum.effort) {
            const
                unit          = me.getBarTipEffortUnit(...arguments),
                allocated     = me.getEffortText(datum.effort, unit),
                available     = me.getEffortText(datum.maxEffort, unit),
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

            let assignmentsArray = [...datum.resourceAllocation.entries()]
                .filter(([resource, data]) => data.effort)
                .sort(([key1, value1], [key2, value2]) => value1.effort > value2.effort ? -1 : 1);

            if (assignmentsArray.length > me.groupBarTipAssignmentLimit) {
                assignmentsSuffix = '<br>' + me.L('L{plusMore}').replace('{value}', assignmentsArray.length - me.groupBarTipAssignmentLimit);
                assignmentsArray = assignmentsArray.slice(0, this.groupBarTipAssignmentLimit);
            }

            const assignments = assignmentsArray.map(([resource, info]) => {

                return assignmentTpl.replace('{resource}', resource.name)
                    .replace('{allocated}', me.getEffortText(info.effort, unit))
                    .replace('{available}', me.getEffortText(info.maxEffort, unit))
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

    getResourceBarTip({ datum }) {
        const
            me                       = this,
            { showBarTip, timeAxis } = me;

        let result = '';

        if (showBarTip && datum.effort) {
            const
                unit       = me.getBarTipEffortUnit(),
                allocated  = me.getEffortText(datum.effort, unit),
                available  = me.getEffortText(datum.maxEffort, unit);

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
                .replace('{cls}', datum.isOverallocated ? 'b-overallocated' : datum.isUnderallocated ? 'b-underallocated' : '');

            if (datum.resource) {
                result = result
                    .replace('{resource}', datum.resource.name);
            }

            result = `<div class="b-histogram-bar-tooltip">${result}</div>`;
        }

        return result;
    }

    getBarTextEffortUnit() {
        const
            { effortUnit, barTextEffortUnit, timeAxis } = this,
            defaultUnit                                 = barTextEffortUnit || effortUnit;

        return DateHelper.compareUnits(timeAxis.unit, defaultUnit) < 0 ? timeAxis.unit : defaultUnit;
    }

    // Injectable method.
    getBarTextDefault(datum) {
        const { showBarText } = this.owner;

        let result = '';

        if (showBarText && datum.effort) {
            const unit = this.owner.getBarTextEffortUnit(...arguments);
            result     = this.owner.getEffortText(datum.effort, unit);
        }

        return result;
    }

    updateShowBarText(value) {
        this.scheduleRefreshRows();
    }

    updateShowBarTip(value) {
        this.barTooltip = value;
    }

    updateShowMaxEffort(value) {
        const me = this;

        me._showMaxEffort = value;

        let needsRefresh = false;

        [me._histogramWidget, me._groupHistogramWidget].forEach(widget => {
            // bail out in case there is no widget constructed yet
            if (!widget) {
                return;
            }

            const { series } = widget;

            if (!value) {
                if (series.maxEffort) {
                    widget._seriesMaxEffort = series.maxEffort;
                    delete series.maxEffort;
                }
            }
            else if (typeof value === 'object') {
                series.maxEffort = value;
            }
            else if (typeof widget._seriesMaxEffort === 'object') {
                series.maxEffort = widget._seriesMaxEffort;
            }
            else {
                series.maxEffort = {
                    type  : 'outline',
                    field : 'maxEffort'
                };
                series.maxEffort.id = 'maxEffort';
            }

            needsRefresh = true;
        });

        if (needsRefresh) {
            me.scheduleRefreshRows();
        }
    }

    updateIncludeInactiveEvents(value) {
        // update collected reports wih new includeInactiveEvents flag state
        this.allocationReportByRecord.forEach(allocationReport => allocationReport.includeInactiveEvents = value);
    }

    //endregion

    //region Events

    onTimeAxisEndReconfigureInternal() {
        const me = this;

        // Skip call triggered by viewPreset setting we have `updateViewPreset` method overridden where we call `onTimeAxisEndReconfigure` later
        if (!me._updatingViewPreset) {
            const { unit, increment } = me.timeAxis;

            // re-generate scale point on zooming in/out
            if (unit !== me._lastTimeAxisUnit || increment !== me._lastTimeAxisIncrement) {
                // remember last used unit & increment to distinguish zooming from timespan changes
                me._lastTimeAxisUnit = unit;
                me._lastTimeAxisIncrement = increment;

                me._generatedScalePoints = me.scalePoints = me.generateScalePoints();
            }

            me.buildTicksIdentifier();
        }
    }

    onTimeAxisEndReconfigure() {
        const me = this;

        // Skip call triggered by viewPreset setting we have `updateViewPreset` method overridden where we call `onTimeAxisEndReconfigure` later
        if (!me._updatingViewPreset) {
            if (me.project.graph) {
                me.onTimeAxisEndReconfigureInternal();
            }
            // In delayed calculation mode (the default) we might not be in graph yet, postpone buildTicksIdentifier until we are
            else {
                me.project.on({
                    graphReady() {
                        me.onTimeAxisEndReconfigureInternal();
                    },
                    thisObj : me,
                    once    : true
                });
            }
        }
    }

    onBeforeRowHeight({ height }) {
        // TODO: histogramWidget getter requests timeAxisColumn column too early which causes an infinite cycle
        if (this._timeAxisColumn) {
            for (const widget of [this._histogramWidget, this._groupHistogramWidget]) {
                if (!widget) continue;

                widget.height = height;
                widget.onElementResize(widget.element);
            }
        }
    }

    onTimeAxisViewModelUpdate() {
        super.onTimeAxisViewModelUpdate(...arguments);

        for (const widget of [this._histogramWidget, this._groupHistogramWidget]) {
            if (!widget) continue;

            widget.width = this.timeAxisViewModel.totalSize;
            widget.onElementResize(widget.element);
        }
    }

    //endregion

    //region Render

    getRecordAllocationInfoRenderData(record, allocation, cellElement, histogramWidget = null) {
        allocation = Array.isArray(allocation) ? allocation : allocation.total;

        // if ticks widths are not monotonous
        // we provide width for each bar since in that case the histogram widget won't be able to calculate widths properly
        if (this.ticksWidth) {
            for (let i = 0, { length } = allocation; i < length; i++) {
                allocation[i].width = this.ticksWidth[i];
            }
        }

        return allocation;
    }

    renderRecordAllocationInfo(record, allocation, cellElement, histogramWidget = null) {
        // histogram pattern
        histogramWidget = histogramWidget || this.histogramWidget;

        const data = this.getRecordAllocationInfoRenderData(record, allocation, cellElement, histogramWidget);

        // skip render attempts if allocation is not collected yet
        if (!data) {
            return;
        }

        this.allocationDataByRecord.set(record, data);

        histogramWidget.data = data;

        histogramWidget.refresh();

        const histogramCloneElement = histogramWidget.element.cloneNode(true);
        histogramCloneElement.removeAttribute('id');
        histogramCloneElement.classList.remove('b-hide-offscreen');

        cellElement.innerHTML = '';
        cellElement.appendChild(histogramCloneElement);
    }

    renderRows() {
        const me = this;

        if (!me.ticksIdentifier && me.project.isInitialCommitPerformed) {
            // If we render rows but have no ticksIdentifier means data loading and 1st commit
            // happened before the histogram was created.
            // Handle timeaxis settings to build ticksIdentifier and scale column points.
            me.onTimeAxisEndReconfigure();

            // If timeView range is not defined then the timeaxis header looks empty so fill it in here (it triggers the column refresh)
            if (!me.timeView.startDate || !me.timeView.endDate) {
                me.timeView.range = {
                    startDate : me.startDate,
                    endDate   : me.endDate
                };
            }
        }

        return super.renderRows(...arguments);
    }

    onRecordAllocationCalculated(record, allocation, allocationReport) {
        const me = this;

        if (!me.isDestroying) {
            const cell = me.getCell({ record, columnId : me.timeAxisColumn.id });

            if (cell) {
                me.renderRecordAllocationInfo(record, allocation, cell);
            }

            // announce resource allocation got calculated
            me.trigger('allocationChange', { record, allocation });

            const groupParent = me.getResourceGroupParent(record);

            if (groupParent) {
                // reset cached allocation for the resource group
                me.resourceGroupsAllocation.delete(groupParent);

                // schedule updating of resource group histograms
                me.scheduleGroupRender(groupParent);
            }
        }
    }

    buildResourceAllocationReport(resource) {
        return this.project.resourceAllocationInfoClass.new({
            includeInactiveEvents : this.includeInactiveEvents,
            ticks                 : this.ticksIdentifier,
            resource
        });
    }

    registerRecordAllocationReport(record) {
        const
            me               = this,
            graph            = me.project.getGraph(),
            allocationReport = me.buildResourceAllocationReport(record);

        // store resource allocation report reference
        me.allocationReportByRecord.set(record, allocationReport);

        record.addEntity(allocationReport);

        // track allocation report changes
        const allocationObserver = graph.observe(
            function * () {
                return yield allocationReport.$.allocation;
            },
            allocation => me.onRecordAllocationCalculated(record, allocation, allocationReport)
        );

        me.allocationObserverByRecord.set(record, allocationObserver);

        // trigger rendering on allocation report changes
        record.addObserver(allocationObserver);

        return allocationReport;
    }

    renderResourceHistogram({ grid : me, cellElement, record }) {
        const { project } = me;

        // No drawing before engine's initial commit
        // Skip special rows, e.g. group records
        if (me.ticksIdentifier && project.isInitialCommitPerformed && !record.isSpecialRow) {
            const { allocationReportByRecord, allocationObserverByRecord } = me;

            let allocationReport = allocationReportByRecord.get(record);

            // If we have no allocation report built for the resource yet
            // let's initialize it here
            if (!allocationReport) {
                allocationReport = me.registerRecordAllocationReport(record);
            }

            // rendering was triggered by not allocation report change so we render based on existing "resource.allocation"
            if (allocationReport?.allocation) {
                if (allocationReport.graph) {
                    me.renderRecordAllocationInfo(record, allocationReport.allocation, cellElement);
                }
                // allocation data had left the graph probably after the resource was removed
                else {
                    allocationReportByRecord.delete(record);
                    me.allocationDataByRecord.delete(record);
                    allocationObserverByRecord.delete(record);
                }

                const groupParent = me.getResourceGroupParent(record);

                // if grouped - schedule updating of the resource group histograms
                if (groupParent && me.store.includes(groupParent)) {
                    me.scheduleGroupRender(groupParent);
                }
            }
        }
    }

    renderScheduledGroups() {
        // Clone set to avoid infinite cycle when we add new entry to this.resourceGroupsToUpdate
        // in this.renderGroupHistogram() call
        for (const groupParent of Array.from(this.resourceGroupsToUpdate)) {
            this.renderGroupHistogram(groupParent);
        }
        this.clearTimeout(this.renderScheduledGroupTimer);
    }

    scheduleGroupRender(groupParent) {
        this.resourceGroupsToUpdate.add(groupParent);

        this.renderScheduledGroupTimer = this.setTimeout({
            fn                : 'renderScheduledGroups',
            delay             : 10,
            cancelOutstanding : true
        });
    }

    getResourceGroupParent(resource) {
        const instanceMeta = resource.instanceMeta(this.project.resourceStore.id);

        return instanceMeta?.groupParent;
    }

    calculateResourceGroupAllocation(groupParent) {
        const
            me                           = this,
            { allocationReportByRecord } = me,
            { groupChildren }            = groupParent,
            allocationReports            = groupChildren.map(resource => allocationReportByRecord.get(resource)),
            newAllocation                = allocationReports[0]?.allocation?.total,
            newAllocationLength          = newAllocation?.length;

        // All child resource allocations are calculated (their lengths should be equal)
        if (newAllocation && allocationReports.every(({ allocation }) => allocation && allocation.total.length === newAllocationLength)) {

            const combinedAllocation = [];

            // Iterate over the group resources
            // and aggregate resource allocations to show the group level histogram
            allocationReports.forEach(({ allocation }) => {
                // iterate over ticks
                allocation.total.forEach((a, index) => {
                    let combined = combinedAllocation[index];

                    if (!combined) {
                        combined = combinedAllocation[index] = {
                            tick               : a.tick,
                            effort             : 0,
                            maxEffort          : 0,
                            units              : 0,
                            isGroup            : true,
                            resourceAllocation : new Map()
                        };
                    }

                    combined.resourceAllocation.set(a.resource, {
                        effort           : a.effort,
                        maxEffort        : a.maxEffort,
                        units            : a.units,
                        isOverallocated  : a.effort > a.maxEffort,
                        isUnderallocated : a.effort < a.maxEffort
                    });

                    combined.isOverallocated  = combined.isOverallocated || a.isOverallocated;
                    combined.isUnderallocated = combined.isUnderallocated || a.isUnderallocated;
                    combined.effort           += a.effort;
                    combined.maxEffort        += a.maxEffort;

                    if (a.assignments) {
                        if (combined.assignments) {
                            a.assignments.forEach(assignment => combined.assignments.add(assignment));
                        }
                        else {
                            combined.assignments = new Set(a.assignments);
                        }
                    }
                });
            });

            return combinedAllocation;
        }
    }

    renderGroupHistogram(groupParent) {
        const me = this;

        me.resourceGroupsToUpdate.delete(groupParent);

        // if the group is not in the store
        if (!me.store.includes(groupParent)) {
            me.resourceGroupsAllocation.delete(groupParent);
        }

        const combinedAllocation = me.resourceGroupsAllocation.get(groupParent) || me.calculateResourceGroupAllocation(groupParent);

        if (combinedAllocation) {
            // cache calculated allocation
            me.resourceGroupsAllocation.set(groupParent, combinedAllocation);

            const
                { groupChildren } = groupParent,
                cellElement       = me.getCell({ id : groupParent.id, columnId : me.timeAxisColumn.id }),
                scalePoints       = me.generateScalePoints(me.timeAxis.unit, me.timeAxis.increment * groupChildren.length),
                lastPoint         = scalePoints[scalePoints.length - 1],
                scaleMax          = DateHelper.asMilliseconds(lastPoint.value, lastPoint.unit),
                topValue          = scaleMax + (me.scaleColumn?.scaleWidget.scaleMaxPadding || 0) * scaleMax,
                widget            = me._groupHistogramWidget || me.buildHistogramWidget({ topValue });

            // if we have group level histogram widget cached - update its topValue
            if (me._groupHistogramWidget) {
                widget.topValue          = topValue;
            }
            // cache constructed histogram widget
            else {
                me._groupHistogramWidget = widget;
            }

            // render the group histogram
            if (cellElement) {
                me.renderRecordAllocationInfo(groupParent, combinedAllocation, cellElement, widget);
                me.trigger('groupRendered', { groupParent });
            }
        }
        // if some allocations are not recalculated yet - reschedule this group update
        else if (me.store.includes(groupParent)) {
            me.scheduleGroupRender(groupParent);
        }
    }

    renderGroupScale(groupParent) {
        const
            me              = this,
            { scaleColumn } = me;

        // Render scale only if scale column is there
        if (scaleColumn) {
            const
                { groupChildren } = groupParent,
                scalePoints       = me.generateScalePoints(me.timeAxis.unit, me.timeAxis.increment * groupChildren.length),
                cellElement       = me.getCell({ id : groupParent.id, columnId : scaleColumn.id });

            let scaleWidget = me._groupScaleWidget;

            if (!scaleWidget) {
                scaleWidget = me._groupScaleWidget = scaleColumn.buildScaleWidget();
            }

            scaleWidget.scalePoints = scalePoints;

            return scaleColumn.renderer({ cellElement, scaleWidget });
        }
    }

    //endregion

    //region Localization

    updateLocalization() {
        const me = this;

        // Translate scale points if we have them (update localization on construction step is called too early)
        // and the scale points is generated by the histogram which means their labels use localized unit abbreviations
        if (me._generatedScalePoints === me.scalePoints && me.scalePoints) {
            me.scalePoints.forEach(scalePoint => {
                // if the point is labeled let's rebuild its text using new locale
                if (scalePoint.text && scalePoint.unit) {
                    scalePoint.text = me.buildScalePointText(scalePoint);
                }
            });
        }

        super.updateLocalization(...arguments);
    }

    //endregion

}

ResourceHistogram.initClass();
