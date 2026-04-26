import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import SchedulerDependencies from '../../Scheduler/feature/Dependencies.js';
import DependencyStore from '../data/DependencyStore.js';
import TemplateHelper from '../../Core/helper/TemplateHelper.js';
import TaskModel from '../model/TaskModel.js';
import { DependencyType } from '../../Engine/scheduling/Types.js';
import StringHelper from '../../Core/helper/StringHelper.js';

/**
 * @module Gantt/feature/Dependencies
 */

const fromBoxSide = [
        'left',
        'left',
        'right',
        'right'
    ],
    toBoxSide = [
        'left',
        'right',
        'left',
        'right'
    ];

// noinspection JSClosureCompilerSyntax
/**
 * Feature that draws dependencies between tasks. Uses a dependency {@link Gantt.model.ProjectModel#property-dependencyStore store}
 * to determine which dependencies to draw.
 *
 * To customize the dependency tooltip, you can provide the {@link Scheduler.feature.Dependencies#config-tooltip} config and specify a {@link Core.widget.Tooltip#config-getHtml} function.
 * For example:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         dependencies : {
 *             tooltip : {
 *                 getHtml({ activeTarget }) {
 *                     const dependencyModel = gantt.resolveDependencyRecord(activeTarget);
 *
 *                     if (!dependencyModel) return null;
 *
 *                     const { fromEvent, toEvent } = dependencyModel;
 *
 *                     return `${fromEvent.name} (${fromEvent.id}) -> ${toEvent.name} (${toEvent.id})`;
 *                 }
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * ## Styling dependency lines
 *
 * You can easily customize the arrows drawn between events. To change all arrows, apply
 * the following basic SVG CSS:
 *
 * ```css
 * .b-sch-dependency {
 *    stroke-width: 2;
 *    stroke : red;
 * }
 *
 * .b-sch-dependency-arrow {
 *     fill: red;
 * }
 * ```
 *
 * To style an individual dependency line, you can provide a [cls](#Scheduler/model/DependencyModel#field-cls) in your data:
 *
 * ```json
 * {
 *     "id"   : 9,
 *     "from" : 7,
 *     "to"   : 8,
 *     "cls"  : "special-dependency"
 * }
 * ```
 *
 * ```scss
 * // Make line dashed
 * .b-sch-dependency {
 *    stroke-dasharray: 5, 5;
 * }
 * ```
 *
 * This feature is **enabled** by default
 *
 * By default predecessors and successors in columns and the task editor are displayed using task id and name. The id part is configurable, any task field may be used instead (for example wbsCode or sequence number)
 * by {@link Gantt/view/GanttBase#config-dependencyIdField Gantt#dependencyIdField} property.
 * ```javascript
 * const gantt = new Gantt({
 *    dependencyIdField: 'wbsCode',
 *
 *    project,
 *    columns : [
 *        { type : 'name', width : 250 }
 *    ],
 * });
 * ```
 *
 * Also see {@link Gantt/column/DependencyColumn#config-dependencyIdField DependencyColumn#dependencyIdField} to configure columns only if required.
 *
 * {@inlineexample Gantt/guides/gettingstarted/basic.js}
 * @extends Scheduler/feature/Dependencies
 * @typings Scheduler/feature/Dependencies -> Scheduler/feature/SchedulerDependencies
 * @demo Gantt/basic
 * @classtype dependencies
 * @feature
 */
export default class Dependencies extends SchedulerDependencies {

    //region Config

    static get $name() {
        return 'Dependencies';
    }

    static get defaultConfig() {
        return {
            terminalSides                     : ['left', 'right'],
            storeClass                        : DependencyStore,
            highlightDependenciesOnEventHover : true
        };
    }

    //endregion

    //region Init

    construct(gantt, config = {}) {
        const me = this;

        // Scheduler might be using gantt's feature, when on same page
        if (gantt.isGantt) {
            me.gantt = gantt;
        }

        if (Object.prototype.hasOwnProperty.call(config, 'pathFinderConfig')) {
            if (!Object.prototype.hasOwnProperty.call(config.pathFinderConfig, 'otherHorizontalMargin')) {
                config.pathFinderConfig.otherHorizontalMargin = 0;
            }

            if (!Object.prototype.hasOwnProperty.call(config.pathFinderConfig, 'otherVerticalMargin')) {
                config.pathFinderConfig.otherVerticalMargin = 0;
            }
        }
        else {
            config.pathFinderConfig = {
                otherHorizontalMargin : 0,
                otherVerticalMargin   : 0
            };
        }

        me.added = new Set();

        super.construct(gantt, config);
    }

    //endregion

    //region Scheduler overrides

    /**
     * Returns the dependency record for a DOM element
     * @function resolveDependencyRecord
     * @param {HTMLElement} element The dependency line element
     * @return {Gantt.model.DependencyModel} The dependency record
     */

    // TaskStore needs some special handling, being the row store in Gantt
    attachToEventStore(store) {
        super.attachToEventStore(store);

        this.detachListeners('taskStore');

        if (store) {
            store.on({
                name             : 'taskStore',
                refreshPreCommit : 'onTaskStoreRefresh',
                thisObj          : this
            });
        }
    }

    onDependencyChange({ action, record, records }) {
        // We don't need this listener in case the gantt is loading data
        // since it does (here in onProjectRefresh() method) full dependencies draw in that case
        if (!this.client.project.propagatingLoadChanges) {
            switch (action) {
                case 'add':
                    records.forEach(dependencyRecord => this.added.add(dependencyRecord));
                    return;
            }

            super.onDependencyChange(...arguments);
        }
    }

    onTaskStoreRefresh({ action }) {
        const me = this;

        switch (action) {
            case 'sort':
                me.scheduleDraw(true);
                break;
            case 'filter':
                // https://github.com/bryntum/support/issues/1815
                // Refresh dependencies after filter
                me.resetGridCache();
                me.scheduleDraw(true);

                break;
        }
    }

    //endregion

    //region Determining dependencies to draw

    getIteratableDependencyAssignments(dependency) {
        return [null]; // Gantt doesn't use assignments to designated what raw task occupies
    }

    // Neither task can be hidden for a dependency to be considered visible
    isDependencyVisible(dependency, assignmentData = null) {
        const
            { client } = this,
            from       = dependency.fromEvent,
            to         = dependency.toEvent;

        // ignore dependency with bad data, the `Object(from) !== from` handles the case
        // when the from is an id of missing task
        // this might change in the future (from will be always either a Task model or undefined)
        // so only the `if (!from || !to) return;` will be needed
        if (!from || !to || Object(from) !== from || Object(to) !== to) return;

        // assignmentData only used in Scheduler with multi assignment, let it handle the call
        if (!(from instanceof TaskModel) || assignmentData) {
            return super.isDependencyVisible(dependency, assignmentData);
        }

        // placeHolder set if either end of the dependency does not exist in store
        return !from.placeHolder && client.store.isAvailable(from) &&
            !to.placeHolder && client.store.isAvailable(to);
    }

    // Get the bounding box for either the source or the target event
    getBox(dependency, source, assignmentData = null) {
        const taskRecord = this.getTimeSpanRecordFromDependency(dependency, source);

        if (!this.gantt) {
            // Scheduler using gantt's feature (happens when using single bundle)
            if (taskRecord.isEvent || assignmentData) {
                return super.getBox(dependency, source, assignmentData);
            }

            // Scheduler with taskStore, might not have any resource assigned
            return taskRecord.assignments.length ? this.client.getResourceEventBox(taskRecord, taskRecord.assignments[0].resource, true) : null;
        }

        return this.gantt.getTaskBox(taskRecord, true, true);
    }

    // Get source or target events resource
    getRowRecordFromDependency(dependency, source) {
        if (!this.gantt) {
            // Scheduler with taskStore, we want the resource
            const taskRecord = this.getTimeSpanRecordFromDependency(dependency, source);
            // Scheduler using gantt's feature (happens when using single bundle)
            if (taskRecord.isEvent) {
                return super.getRowRecordFromDependency(dependency, source);
            }
            // Might not have one assigned
            return taskRecord.assignments.length ? taskRecord.assignments[0].resource : null;
        }

        return this.getTimeSpanRecordFromDependency(dependency, source);
    }

    //endregion

    //region Draw & render
    onProjectRefresh(event) {
        const { added } = this;

        // In Scheduler this happens directly on add, in Gantt it needs to happen after propagate since tasks at each
        // end might move
        if (added.size) {
            for (const dependencyRecord of added) {
                this.addToGridCache(dependencyRecord);
            }
            added.clear();
        }

        // Need to call super method here to include all the complex logic of `toDrawOnProjectRefresh` map
        super.onProjectRefresh(event);

        const { isInitialCommit, isCalculated } = event;

        // First time we are guaranteed to have normalized data
        if (isInitialCommit && isCalculated) {
            // Reset grid cache to ensure we cache based on correct dates
            this.resetGridCache();
        }

        this.scheduleDraw();
    }

    drawLine(canvas, dependency, points, assignmentData = null, cache = true) {
        super.drawLine(canvas, dependency, points, assignmentData);

        const
            line       = super.drawLine(canvas, dependency, points, assignmentData, cache),
            { client } = this,
            to         = dependency.toEvent;

        // If target event is outside of the view add special CSS class to hide marker (arrow)
        if (
            (!to.milestone && (to.endDate <= client.startDate || client.endDate <= to.startDate)) ||
            (to.milestone && (to.endDate < client.startDate || client.endDate < to.startDate))
        ) {
            line.classList.add('b-sch-dependency-ends-outside');
        }
    }

    prepareLineDef(dependency, dependencyDrawData, assignmentData = null) {
        const
            me      = this,
            source    = me.getTimeSpanRecordFromDependency(dependency, true),
            target    = me.getTimeSpanRecordFromDependency(dependency, false),
            type      = dependency.type,
            arrowMargin = this.pathFinder.startArrowMargin;

        let startSide = dependency.fromSide,
            endSide   = dependency.toSide;

        // Fallback to view trait if dependency start side is not given
        if (!startSide) {
            switch (true) {
                case type === DependencyType.StartToEnd:
                    startSide = me.getConnectorStartSide(source);
                    break;

                case type === DependencyType.StartToStart:
                    startSide = me.getConnectorStartSide(source);
                    break;

                case type === DependencyType.EndToStart:
                    startSide = me.getConnectorEndSide(source);
                    break;

                case type === DependencyType.EndToEnd:
                    startSide = me.getConnectorEndSide(source);
                    break;

                default:
                    throw new Error('Invalid dependency type: ' + type);
            }
        }

        // Fallback to view trait if dependency end side is not given
        if (!endSide) {
            switch (true) {
                case type === DependencyType.StartToEnd:
                    endSide = me.getConnectorEndSide(target);
                    break;

                case type === DependencyType.StartToStart:
                    endSide = me.getConnectorStartSide(target);
                    break;

                case type === DependencyType.EndToStart:
                    endSide = me.getConnectorStartSide(target);
                    break;

                case type === DependencyType.EndToEnd:
                    endSide = me.getConnectorEndSide(target);
                    break;

                default:
                    throw new Error('Invalid dependency type: ' + type);
            }
        }

        const { startRectangle, endRectangle } = dependencyDrawData;

        if (
            type === DependencyType.EndToStart &&
            // Target box is below source box
            startRectangle.bottom < endRectangle.y &&
            // If source box ends before target box start - draw line to target box top edge
            // Round coordinates to make behavior more consistent on zoomed page
            Math.round(endRectangle.left) >= Math.round(startRectangle.right) &&
            Math.round(endRectangle.right) >= (Math.round(startRectangle.right) + arrowMargin)
        ) {
            // arrow to left part of top
            endSide = 'top';

            // The default entry point for top is the center, but for Gantt Tasks,
            // we join to startArrowMargin inwards from top/left.
            // Milestones always have the top entry point left in the center.
            if (!dependency.toEvent.milestone) {
                endRectangle.right = endRectangle.x + arrowMargin * 2;
            }
        }

        // append boxes that extend to row boundaries to make sure line is contained there
        // Always consider arrow margin for `otherBoxes`, otherwise, when gap between source and target is less than
        // arrowMargin * 2 (start arrow + end arrow margin), we will have line breaking not on the row boundary
        const
            sourceRowBox = me.client.getRecordCoords(source, true),
            targetRowBox = me.client.getRecordCoords(target, true),
            // Add vertical box for each task. They are supposed to push line to row boundary
            otherBoxes = [
                {
                    start  : startRectangle.x,
                    end    : startRectangle.right,
                    top    : sourceRowBox.y,
                    bottom : sourceRowBox.y + sourceRowBox.height
                },
                {
                    start  : endRectangle.x,
                    end    : endRectangle.right,
                    top    : targetRowBox.y,
                    bottom : targetRowBox.y + targetRowBox.height
                }
            ];

        // Reversing start/end endpoints generate more Gantt-friendly arrows
        return {
            endBox : {
                start  : startRectangle.x,
                end    : startRectangle.right,
                top    : startRectangle.y,
                bottom : startRectangle.bottom
            },

            startBox : {
                start  : endRectangle.x,
                end    : endRectangle.right,
                top    : endRectangle.y,
                bottom : endRectangle.bottom
            },
            endSide       : startSide,
            startSide     : endSide,
            boxesReversed : true,
            otherBoxes
        };
    }

    // onEventChanged({ action, record }) {
    //     switch (action) {
    //         case 'update':
    //             // event updated, redraw its dependencies
    //             return this.drawForTask(record);
    //     }
    // }

    /**
     * Draws all dependencies for the specified task.
     */
    drawForTask(taskRecord) {
        this.drawForTimeSpan(taskRecord);
    }

    /**
     * Sort dependencies with critical dependencies at the end to draw the red path later to avoid gray paths overlap
     * @returns {Map} Dependencies sorted by critical (first non critical)
     * @private
     */
    getSortedDependenciesToRefresh() {
        const criticalFeature = this.client.features.criticalPaths;

        if (criticalFeature && !criticalFeature.disabled) {
            return new Map([...this.dependenciesToRefresh].sort(([{ fromTask: taskA }], [{ fromTask: taskB }]) => (taskA?.critical === taskB?.critical) ? 0 : taskA?.critical ? 1 : -1));
        }
        else {
            return this.dependenciesToRefresh;
        }
    }

    //endregion

    //region Tooltip

    /**
     * Generates html for the tooltip shown when hovering a dependency
     * @param {Object} tooltipConfig
     * @returns {String} Html to display in the tooltip
     * @private
     */
    getHoverTipHtml({ activeTarget }) {
        const
            me                = this,
            dependencyModel   = me.resolveDependencyRecord(activeTarget),
            dependencyIdField = me.client.dependencyIdField;

        if (!dependencyModel) {
            return null;
        }

        const
            { fromEvent, toEvent } = dependencyModel,
            lagStr                 = dependencyModel.lag ? `<tr>
                    <td>${me.L('L{DependencyEdit.Lag}')}: </td>
                    <td>${StringHelper.encodeHtml(dependencyModel.fullLag)}</td>
                    <td></td>
                </tr>` : '';

        return TemplateHelper.tpl`
             <table class="b-sch-dependency-tooltip">
                <tr>
                    <td>${me.L('L{Dependencies.from}')}: </td>
                    <td>${fromEvent.name} ${fromEvent[dependencyIdField]}</td>
                    <td><div class="b-sch-box b-${fromBoxSide[dependencyModel.type]}"></div></td>
                </tr>
                <tr>
                    <td>${me.L('L{Dependencies.to}')}: </td>
                    <td>${toEvent.name} ${toEvent[dependencyIdField]}</td>
                    <td><div class="b-sch-box b-${toBoxSide[dependencyModel.type]}"></div></td>
                </tr>
                 ${lagStr}
            </table>
        `;
    }

    //endregion

    //region Dependency creation

    /**
     * Create a new dependency from source terminal to target terminal
     * @internal
     */
    async createDependency(data) {
        const
            me         = this,
            { source, target, fromSide, toSide } = data,
            type       = (fromSide === 'left' ? 0 : 2) + (toSide === 'right' ? 1 : 0),
            dependency = me.dependencyStore.add({
                fromEvent : source,
                toEvent   : target,
                type
            })[0];

        await me.dependencyStore.project.propagateAsync();

        return dependency;
    }

    // endregion

    // Add critical path marker which has different color
    createMarkers() {
        super.createMarkers();

        // Since Edge and IE11 cannot reverse marker we use one in a
        // required orientation, which exists only in those two browsers
        const endMarker = (this.startMarker || this.endMarker).cloneNode(true);

        endMarker.setAttribute('id', 'arrowEndCritical');

        this.client.svgCanvas.appendChild(endMarker);
    }
}

GridFeatureManager.registerFeature(Dependencies, true, 'Gantt');
