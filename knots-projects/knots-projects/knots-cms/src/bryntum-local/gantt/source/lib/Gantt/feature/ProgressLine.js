import InstancePlugin from '../../Core/mixin/InstancePlugin.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import Delayable from '../../Core/mixin/Delayable.js';
import DateHelper from '../../Core/helper/DateHelper.js';
import DomHelper from '../../Core/helper/DomHelper.js';
import ArrayHelper from '../../Core/helper/ArrayHelper.js';

/**
 * @module Gantt/feature/ProgressLine
 */

/**
 *
 * This feature draws project progress line with SVG lines. Requires {@link SchedulerPro/feature/PercentBar} to be enabled (which
 * by default, it is)
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid/view/mixin/GridFeatures}.
 *
 * ```javascript
 * let gantt = new Gantt({
 *     features : {
 *         progressLine : {
 *            statusDate : new Date(2017, 2, 8)
 *         }
 *     }
 * });
 * ```
 *
 * Status date can be changed dynamically:
 *
 * ```javascript
 * gantt.features.progressLine.statusDate = new Date();
 * ```
 *
 * If status date is not in the current Gantt time span, progress line will use view start or end coordinates. This
 * behavior can be customized with {@link #config-drawLineOnlyWhenStatusDateVisible} config. Or you can override {@link #function-shouldDrawProgressLine}
 * method and provide more complex condition.
 *
 * Progress line is a set of SVG <line> elements drawn between all the tasks.
 *
 * {@inlineexample Gantt/feature/ProgressLine.js}
 *
 * @demo Gantt/progressline
 * @extends Core/mixin/InstancePlugin
 * @mixes Core/mixin/Delayable
 * @classtype progressLine
 * @feature
 */
export default class ProgressLine extends Delayable(InstancePlugin) {
    /**
     * Fired when progress line is rendered
     * @event progressLineDrawn
     */

    //region Config

    static get $name() {
        return 'ProgressLine';
    }

    static get defaultConfig() {
        return {
            /**
             * Progress line status date. If not provided, current date is used.
             * @config {Date}
             */
            statusDate : new Date(),

            /**
             * Set to true to hide progress line, when status date is not in the current time axis.
             * @config {Boolean}
             */
            drawLineOnlyWhenStatusDateVisible : false,

            lineCls : 'b-gantt-progress-line',

            containerCls : 'b-progress-line-canvas'
        };
    }

    static get pluginConfig() {
        return {
            chain : ['onPaint']
        };
    }

    //endregion

    //region Init & destroy

    construct(client, config = {}) {
        const me = this;

        // Many things may schedule a draw. Ensure it only happens once, on the next frame.
        // And Ensure it really is on the *next* frame after invocation by passing
        // the cancelOutstanding flag.
        me.scheduleDraw = me.createOnFrame('draw', [], me, true);

        super.construct(client, config);

        this.lineSegments = [];
    }

    doDisable(disable) {
        const me = this;

        // attach/detach listeners
        me.attachToClient(disable ? null : me.client);

        if (me.client.rendered) {
            me.draw();
        }

        super.doDisable(disable);
    }

    //endregion

    get statusDate() {
        return this._statusDate;
    }

    /**
     * Progress line status date. If not provided, current date is used.
     * @property {Date}
     */
    set statusDate(date) {
        if (date instanceof Date) {
            this._statusDate = date;
            if (!this.disabled) {
                this.scheduleDraw();
            }
        }
    }

    // cannot use `get svgCanvas` because it will trigger svgCanvas getter on instance too early
    getSVGCanvas() {
        const
            me = this,
            { client } = me;

        if (!me._svgCanvas) {
            const svg = me._svgCanvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            // To not be touched when syncing tasks to DOM
            svg.retainElement = true;
            svg.classList.add(me.containerCls);
            client.foregroundCanvas.appendChild(svg);
        }
        return me._svgCanvas;
    }

    // region Event handlers

    attachToProject(project) {
        this.detachListeners('project');

        project?.on({
            name    : 'project',
            refresh : 'onProjectRefresh',
            thisObj : this
        });
    }

    attachToRowManager(rowManager) {
        this.detachListeners('rowManager');

        rowManager?.on({
            name              : 'rowManager',
            translaterow      : 'onTranslateRow',
            refresh           : 'scheduleDraw',
            rerender          : 'scheduleDraw',
            changetotalheight : 'scheduleDraw',
            thisObj           : this
        });
    }

    attachToClient(client) {
        const me = this;

        me.detachListeners('client');

        // dependencies are drawn on scroll, both horizontal and vertical
        client?.on({
            name                   : 'client',
            horizontalscroll       : 'scheduleDraw',
            togglenode             : 'scheduleDraw',
            taskdrag               : 'onTaskDrag',
            taskdragabortfinalized : 'scheduleDraw',
            aftertaskdrop          : 'scheduleDraw',
            timelineviewportresize : 'scheduleDraw',
            thisObj                : me
        });

        me.attachToProject(client?.project);
        me.attachToRowManager(client?.rowManager);
    }

    onPaint() {
        this.attachToProject(this.disabled ? null : this.client.project);
    }

    /**
     * Redraws the line when the project propagation is done
     * @private
     */
    onProjectRefresh() {
        this.scheduleDraw();
    }

    onTranslateRow({ row }) {
        // a changetotalheight event is fired after translations, if a rowHeight change is detected here it will redraw
        // the line
        if (row.lastTop >= 0 && row.top !== row.lastTop) {
            this.scheduleDraw();
        }
    }

    // Refreshing only lines for dragged task to avoid slowing down drag operation
    onTaskDrag({ taskRecords, dragData }) {
        taskRecords.forEach(record => {
            this.updateLineForTask(record, {
                [record.id] : DateHelper.add(record.startDate, dragData.timeDiff)
            });
        });
    }
    // endregion

    /**
     * Returns true if progress line should be drawn
     * @returns {Boolean}
     */
    shouldDrawProgressLine() {
        return !this.client.timeAxisSubGrid.collapsed && !this.disabled && (!this.drawLineOnlyWhenStatusDateVisible || this.client.timeAxis.dateInAxis(this.statusDate));
    }

    /**
     * Returns status date horizontal position relative to the foreground canvas
     * @returns {Number}
     * @private
     */
    getStatusDateX() {
        let { statusDate } = this;

        const
            { client } = this;

        if (!client.timeAxis.dateInAxis(statusDate)) {
            statusDate = statusDate < client.timeAxis.startDate ? client.timeAxis.startDate : client.timeAxis.endDate;
        }

        return client.getCoordinateFromDate(statusDate);
    }

    /**
     * Returns object with status date local coordinate and view x,y coordinates. Used to convert page coordinates to
     * view local.
     * @returns {{statusDateX: Number, viewXY: number[]}}
     * @private
     */
    getRenderData() {
        const
            statusDateX = this.getStatusDateX(),
            // We refer to the DOM to get status date horizontal coordinate (for segmented tasks which are not supported yet)
            // we need to adjust progress bar element box to view/scroll.
            viewBox     = this.client.timeAxisSubGridElement.getBoundingClientRect(),
            viewXY      = [this.client.scrollLeft - viewBox.left, -viewBox.top];

        return { statusDateX, viewXY };
    }

    // region Drawing

    /**
     * Renders the progress line.
     */
    draw() {
        const
            me         = this,
            { client } = me;

        me.lineSegments.forEach(el => el.remove());
        me.lineSegments = [];

        if (!me.shouldDrawProgressLine()) {
            return;
        }

        if (client.isAnimating) {
            client.on({
                transitionend() {
                    me.scheduleDraw();
                },
                once : true
            });

            return;
        }

        const
            data  = me.getRenderData(),
            lines = [];

        client.rowManager.forEach(row => {
            lines.push(...me.getLineSegmentRenderData(row, data));
        });

        // Batch rendering to avoid constant layout reflows
        // With batch drawing line takes ~8ms comparing to ~30ms prior
        lines.forEach(line => me.drawLineSegment(line));

        client.trigger('progressLineDrawn');
    }

    segmentBelongsToTask(el, taskRecord) {
        // Use getAttribute to not upset Salesforce LockerService
        return el.getAttribute('data-task-id') == taskRecord.id;
    }

    /**
     * Updates progress line segment for one task
     * @param {Gantt.model.TaskModel} taskRecord
     * @param {Object} [renderData] Optional render data, which is an object where keys are task ids and values are
     * new task start date
     * @private
     */
    updateLineForTask(taskRecord, renderData) {
        const me = this;

        if (me.disabled) {
            return;
        }

        const row = me.client.getRowFor(taskRecord);

        if (row) {
            const toRemove = [];

            me.lineSegments.forEach(el => {
                if (me.segmentBelongsToTask(el, taskRecord)) {
                    toRemove.push(el);
                    el.remove();
                }
            });

            ArrayHelper.remove(me.lineSegments, ...toRemove);

            me.getLineSegmentRenderData(row, me.getRenderData(), renderData)
                .forEach(line => me.drawLineSegment(line));
        }
    }

    /**
     * Draws line for a given row
     * @param {Grid.row.Row} row Row instance
     * @param {Object} data Output from {@link #function-getRenderData} method
     * @param {Object} [renderData] Optional render data, which is an object where keys are task ids and values are
     * new task start date
     * @internal
     */
    getLineSegmentRenderData(row, data, renderData = {}) {
        const
            me                      = this,
            { statusDateX, viewXY } = data,
            taskRecord              = me.client.getRecordFromElement(row.elements.normal),
            taskId                  = taskRecord.id,
            lineDefinitions         = [];

        let point;

        if (me.isStatusLineTask(taskRecord, renderData[taskRecord.id])) {
            point = me.calculateCoordinateForTask(taskRecord, viewXY);

            // If multiple rows are affected by event update, it could happen, that point
            // could not be resolved
            point && lineDefinitions.push(
                {
                    dataset : { taskId },
                    x1      : statusDateX,
                    y1      : row.top,
                    x2      : point.x,
                    y2      : point.y
                },
                {
                    dataset : { taskId },
                    x1      : point.x,
                    y1      : point.y,
                    x2      : statusDateX,
                    y2      : row.bottom
                }
            );
        }

        // otherwise we render vertical status line

        if (!point) {
            lineDefinitions.push(
                {
                    dataset : { taskId },
                    x1      : statusDateX,
                    y1      : row.top,
                    x2      : statusDateX,
                    y2      : row.bottom
                }
            );
        }

        return lineDefinitions;
    }

    /**
     * Draws line on svg canvas
     * @param {Object} data Line render data. Output from {@link #function-getLineSegmentRenderData}
     * @return {Element}
     * @internal
     */
    drawLineSegment(data) {
        const me = this;

        me.lineSegments.push(DomHelper.createElement(Object.assign({
            tag    : 'line',
            ns     : 'http://www.w3.org/2000/svg',
            // cannot use className when namespace is provided
            class  : me.lineCls,
            parent : me.getSVGCanvas()
        }, data)));
    }

    /**
     * Returns true if task should be connected to the progress line.
     * @param {Gantt.model.TaskModel} taskRecord
     * @param {Date} [startDate] Provide to check if task record should be connected to the progress line if it'd
     * start then
     * @returns {Boolean}
     * @internal
     */
    isStatusLineTask(taskRecord, startDate) {
        const statusDate = this.statusDate;

        startDate = startDate || taskRecord.startDate;

        // task should be visible and not inactive
        return taskRecord && !taskRecord.inactive && this.client.timeAxis.isTimeSpanInAxis(taskRecord) &&
            // - is in progress
            (taskRecord.isInProgress ||
                // .. or is not started and its start date is before statusDate
                (!taskRecord.isStarted && startDate < statusDate) ||
                // .. or is finished and its start date is after statusDate
                (taskRecord.isCompleted && startDate > statusDate));
    }

    /**
     * This method will calculate point inside task element to be connected with line.
     * @param {Gantt.model.TaskModel} record
     * @param {Number[]} translateBy View xy coordinates to calculate relative point position
     * @returns {Object} Object containing coordinates for point in progress line, or undefined if no progress bar el is found
     * @private
     */
    calculateCoordinateForTask(record, translateBy) {
        const
            { client }     = this,
            node           = client.getElementFromTaskRecord(record),
            isZeroDuration = record.milestone,
            progressBarEl  = isZeroDuration ? node : node?.querySelector('.b-task-percent-bar');

        if (progressBarEl) {
            const
                box       = progressBarEl.getBoundingClientRect(),
                totalSize = client.timeAxisViewModel.totalSize;

            return {
                x : Math.min((isZeroDuration ? box.left : box.right) + translateBy[0], totalSize),
                y : box.top + box.height / 2 + translateBy[1]
            };
        }
    }

    // endregion
}

GridFeatureManager.registerFeature(ProgressLine);
