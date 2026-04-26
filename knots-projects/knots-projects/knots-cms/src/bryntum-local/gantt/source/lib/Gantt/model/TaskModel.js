import DateHelper from '../../Core/helper/DateHelper.js';
import Duration from '../../Core/data/Duration.js';
import Store from '../../Core/data/Store.js';
import TimeSpan from '../../Scheduler/model/TimeSpan.js';
import CalendarCompatMixin from '../../Scheduler/model/mixin/CalendarCompatMixin.js';
import DependencyBaseModel from '../../Scheduler/model/DependencyBaseModel.js';
import PercentDoneMixin from '../../SchedulerPro/model/mixin/PercentDoneMixin.js';
import { GanttEvent } from '../../Engine/quark/model/gantt/GanttEvent.js';
import PartOfProject from '../data/mixin/PartOfProject.js';
import Baseline from './Baseline.js';
import Wbs from '../data/Wbs.js';
import '../data/field/WbsField.js';

/**
 * @module Gantt/model/TaskModel
 */

const
    // A utility function to populate a Task's baseline with the Task's default values
    applyBaselineDefaults = (task, baselines) => {
        const {
            startDate, durationUnit, endDate
        } = task;

        return baselines ? baselines.map(baseline => {
            // Baseline has its own data if at least two of the following are defined.
            // The remaining data, if incomplete, will be calculated in Baseline normalize() method
            const
                hasData = (+Boolean(baseline.startDate) + Boolean(baseline.endDate) + Boolean(baseline.duration)) > 1,
                data    = { task, ...baseline };

            if (!hasData) {
                Object.assign(data, { startDate, endDate, durationUnit });
            }
            return data;
        }) : [];
    },

    descendingWbsSorter = s => s.field === 'wbsValue' && !s.ascending,
    isReversed = children => {
        for (let firstChildWbs, childWbs, i = 0, n = children.length; i < n; ++i) {
            childWbs = children[i].wbsValue;

            if (childWbs) {
                if (firstChildWbs) {
                    return childWbs < firstChildWbs;
                }

                firstChildWbs = childWbs;
            }
        }

        return false;
    },
    // Refresh siblings in depth when it's not initial WBS calculation
    refreshWbsOptions = { deep : true },
    // Record should not be considered modified by initial assignment of wbsValue
    refreshWbsOnJoinOptions = { deep : true, silent : true };

/**
 * This class represents a task in your Gantt project. Extend it to add your own custom task fields and methods.
 *
 * ## Subclassing the TaskModel class
 * To subclass the TaskModel and add extra {@link Core.data.Model#property-fields-static} and API methods, please see
 * the snippet below.
 *
 *```javascript
 * class MyTaskModel extends TaskModel {
 *   static get fields() {
 *       return [
 *           { name: 'importantDate', type: 'date' }
 *       ]
 *   }
 *```
 *
 * After creating your own Task model class, configure the {@link Gantt.model.ProjectModel#config-taskModelClass} on
 * Project to use it:
 *
 *```javascript
 * new Gantt({
 *     project : {
 *         taskModelClass : MyTaskModel
 *     }
 * });
 *```
 *
 * ## Creating a new Task programmatically
 *
 * To create a new task programmatically, simply call the TaskModel constructor and pass in any field values.
 *
 * ```javascript
 * const newTask = new TaskModel({
 *     name          : 'My awesome task',
 *     importantDate : new Date(2022, 0, 1),
 *     percentDone   : 80 // So awesome it's almost done
 *     // ...
 * });
 * ```
 *
 * ## Async scheduling
 *
 * A record created from an {@link Gantt/model/TaskModel} is normally part of a {@link Gantt/data/TaskStore}, which in
 * turn is part of a {@link Gantt/model/ProjectModel project}.
 * When dates or the duration of a task is changed, the project performs async calculations of the other related fields
 * (including the field of other tasks affected by the change).
 * For example if {@link #field-duration} is changed, it will recalculate {@link #field-endDate}.
 *
 * As a result of this being an async operation, the values of other fields are not guaranteed to be up to date
 * immediately after a change. To ensure data is up to date, `await` the calculations to finish.
 *
 * For example, `endDate` is not up to date after this operation:
 *
 * ```javascript
 * taskRecord.duration = 5;
 * // taskRecord.endDate not yet calculated
 * ```
 *
 * But if calculations are awaited it is up to date:
 *
 * ```javascript
 * taskRecord.duration = 5;
 * await taskRecord.project.commitAsync();
 * // endDate is calculated
 * ```
 *
 * In case of multiple changes no need to trigger recalculation after each of them:
 *
 * ```javascript
 * // change taskRecord1 start and duration
 * taskRecord1.startDate = '2021-11-15';
 * taskRecord1.duration = 5;
 * // change taskRecord2 duration
 * taskRecord2.duration = 1;
 * // change taskRecord3 finish date
 * taskRecord3.endDate = '2021-11-17';
 *
 * // now when all changes are done trigger rescheduling
 * await taskRecord.project.commitAsync();
 * ```
 *
 * ## Manually vs automatically scheduled tasks
 *
 * A task can be either **automatically** (default) or **manually** scheduled. This is defined by the
 * {@link #field-manuallyScheduled} field. Manually scheduled tasks are not affected by the automatic scheduling
 * process, which means their start/end dates are meant to be changed by user manually. Such tasks are not shifted
 * by their predecessors nor such summary tasks rollup their children start/end dates.
 * While automatically scheduled tasks start/end dates are calculated by the Gantt.
 *
 * ## Start and end dates
 *
 * For all tasks, the end date is non-inclusive: {@link #field-startDate} <= date < {@link #field-endDate}.
 * Example: a task which starts at 2020/07/18 and has 2 days duration, should have the end date: 2020/07/20, **not**
 * 2018/07/19 23:59:59.
 * The start and end dates of tasks in are *points* on the time axis and if you specify that a task starts
 * 01/01/2020 and has 1 day duration, that means the start point is 01/01/2020 00:00 and end point is 02/01/2020 00:00.
 *
 * @mixes SchedulerPro/data/mixin/PartOfProject
 * @mixes SchedulerPro/model/mixin/PercentDoneMixin
 *
 * @extends Scheduler/model/TimeSpan
 */
export default class TaskModel extends GanttEvent.derive(TimeSpan).mixin(
    PartOfProject,
    PercentDoneMixin,
    CalendarCompatMixin
) {
    //region Fields

    /**
     * This static configuration option allows you to control whether an empty parent task should be converted into a
     * leaf. Enable/disable it for a whole class:
     *
     * ```javascript
     * TaskModel.convertEmptyParentToLeaf = false;
     * ```
     *
     * By specifying `true`, all empty parents will be considered leafs. Can also be assigned a configuration object
     * with with the following Boolean properties to customize the behaviour:
     *
     * * `onLoad` - Apply the transformation on load to any parents without children (`children : []`)
     * * `onRemove` - Apply the transformation when all children have been removed from a parent
     *
     * ```javascript
     * TaskModel.convertEmptyParentToLeaf = {
     *     onLoad   : false,
     *     onRemove : true
     * }
     * ```
     *
     * @member {Boolean|Object} convertEmptyParentToLeaf
     * @default true
     * @static
     * @category Parent & children
     */

    static get fields() {
        return [
            /**
             * Unique identifier of task (mandatory)
             * @field {String|Number} id
             * @category Common
             */

            /**
             * Name of the task
             * @field {String} name
             * @category Common
             */

            /**
             * The initial expanded state for a parent task
             * @field {Boolean} expanded
             * @category Common
             */
            {
                name     : 'expanded',
                internal : true
            },

            /**
             * A set of resources assigned to this task
             * @field {Set} assigned
             * @readonly
             * @category Common
             */

            /**
             * Start date of the task in ISO 8601 format
             *
             * UI fields representing this data field are disabled for summary events
             * except the {@link #field-manuallyScheduled manually scheduled} events.
             * See {@link #function-isEditable} for details.
             *
             * Note that the field always returns a `Date`.
             *
             * @field {Date} startDate
             * @accepts {String|Date}
             * @category Scheduling
             */

            /**
             * End date of the task in ISO 8601 format
             *
             * UI fields representing this data field are disabled for summary events
             * except the {@link #field-manuallyScheduled manually scheduled} events.
             * See {@link #function-isEditable} for details.
             *
             * Note that the field always returns a `Date`.
             *
             * @field {Date} endDate
             * @accepts {String|Date}
             * @category Scheduling
             */

            /**
             * The numeric part of the task duration (the number of units).
             *
             * UI fields representing this data field are disabled for summary events
             * except the {@link #field-manuallyScheduled manually scheduled} events.
             * See {@link #function-isEditable} for details.
             *
             * @field {Number} duration
             * @category Scheduling
             */

            /**
             * An encapsulation of the CSS classes to be added to the rendered event element.
             *
             * Always returns a {@link Core.helper.util.DomClassList}, but may still be treated as a string. For
             * granular control of adding and removing individual classes, it is recommended to use the
             * {@link Core.helper.util.DomClassList} API.
             *
             * @field {Core.helper.util.DomClassList} cls
             * @accepts {Core.helper.util.DomClassList|String} cls
             * @category Styling
             */
            {
                name      : 'cls',
                serialize : (value) => {
                    return value.isDomClassList ? value.toString() : value;
                },
                persist : true
            },

            /**
             * The current status of a task, expressed as the percentage completed (integer from 0 to 100)
             *
             * UI fields representing this data field are disabled for summary events.
             * See {@link #function-isEditable} for details.
             *
             * @field {Number} percentDone
             * @category Scheduling
             */

            /**
             * The numeric part of the task effort (the number of units). The effort of the "parent" tasks will be automatically set to the sum
             * of efforts of their "child" tasks
             *
             * UI fields representing this data field are disabled for summary events.
             * See {@link #function-isEditable} for details.
             *
             * @field {Number} effort
             * @category Scheduling
             */

            /**
             * The unit part of the task duration, defaults to "day" (days). Valid values are:
             *
             * - "millisecond" - Milliseconds
             * - "second" - Seconds
             * - "minute" - Minutes
             * - "hour" - Hours
             * - "day" - Days
             * - "week" - Weeks
             * - "month" - Months
             * - "quarter" - Quarters
             * - "year"- Years
             *
             * This field is readonly after creation, to change it use the {@link #function-setDuration} call.
             * @field {String} durationUnit
             * @default "day"
             * @category Scheduling
             */

            /**
             * The unit part of the task's effort, defaults to "h" (hours). Valid values are:
             *
             * - "millisecond" - Milliseconds
             * - "second" - Seconds
             * - "minute" - Minutes
             * - "hour" - Hours
             * - "day" - Days
             * - "week" - Weeks
             * - "month" - Months
             * - "quarter" - Quarters
             * - "year"- Years
             *
             * This field is readonly after creation, to change it use the {@link #function-setEffort} call.
             * @field {String} effortUnit
             * @default "hour"
             * @category Scheduling
             */

            { name : 'fullEffort', persist : false },

            /**
             * The effective calendar used by the task.
             * Returns the task own {@link #field-calendar} if provided or the project {@link Gantt.model.ProjectModel#field-calendar calendar}.
             *
             * @field {Gantt.model.CalendarModel} effectiveCalendar
             * @category Scheduling
             * @calculated
             * @readonly
             */

            /**
             * The calendar, assigned to the task. Allows you to set the time when task can be performed.
             *
             * @field {Gantt.model.CalendarModel} calendar
             * @category Scheduling
             */

            /**
             * The getter will yield a {@link Core.data.Store Store} of {@link Gantt.model.Baseline}s.
             *
             * When constructing a task the baselines will be constructed from an array of
             * {@link Gantt.model.Baseline Baseline} data objects.
             * @field {Object[]} baselines
             * @category Features
             */
            { name : 'baselines' },

            /**
             * A freetext note about the task.
             * @field {String} note
             * @category Common
             */
            { name : 'note', type : 'string' },

            {
                name      : 'parentId',
                serialize : (value, record) => {
                    const eventStore = record.getEventStore(),
                        project    = record.getProject();

                    // By default we send root level tasks "parentId" as NULL
                    if (eventStore && eventStore.getById(value) === project) {
                        value = null;
                    }

                    return value;
                }
            },

            /**
             * Field storing the task constraint alias or `null` if not constraint set.
             * Valid values are:
             * - "finishnoearlierthan"
             * - "finishnolaterthan"
             * - "mustfinishon"
             * - "muststarton"
             * - "startnoearlierthan"
             * - "startnolaterthan"
             *
             * @field {String|null} constraintType
             * @category Scheduling
             */

            /**
             * Field defining the constraint boundary date or `null` if {@link #field-constraintType} is `null`.
             * @field {String|Date|null} constraintDate
             * @category Scheduling
             */

            /**
             * When set to `true`, the {@link #field-startDate} of the task will not be changed by any of its incoming
             * dependencies or constraints.
             *
             * @field {Boolean} manuallyScheduled
             * @category Scheduling
             */

            /**
             * When set to `true` the task becomes inactive and stops taking part in the project scheduling (doesn't
             * affect linked tasks, rolls up its attributes and affect its assigned resources allocation).
             *
             * @field {Boolean} inactive
             * @category Scheduling
             */

            /**
             * This field defines the scheduling mode for the task. Based on this field some fields of the task
             * will be "fixed" (should be provided by the user) and some - computed.
             *
             * Possible values are:
             *
             * - `Normal` is the default (and backward compatible) mode. It means the task will be scheduled based on
             * information about its start/end dates, task own calendar (project calendar if there's no one) and
             * calendars of the assigned resources.
             *
             * - `FixedDuration` mode means, that task has fixed start and end dates, but its effort will be computed
             * dynamically, based on the assigned resources information. Typical example of such task is - meeting.
             * Meetings typically have pre-defined start and end dates and the more people are participating in the
             * meeting, the more effort is spent on the task. When duration of such task increases, its effort is
             * increased too (and vice-versa). Note: fixed start and end dates here doesn't mean that a user can't
             * update them via GUI, the only field which won't be editable in GUI is the
             * {@link #field-effort effort field}, it will be calculated according to duration and resources assigned to
             * the task.
             *
             * - `FixedEffort` mode means, that task has fixed effort and computed duration. The more resources will be
             * assigned to this task, the less the duration will be. The typical example will be a "paint the walls"
             * task - several painters will complete it faster.
             *
             * - `FixedUnits` mode means, that the assignment level of all assigned resources will be kept as provided
             * by the user, and either {@link #field-effort} or duration of the task is recalculated, based on the
             * {@link #field-effortDriven} flag.
             *
             * @field {String} schedulingMode
             * @category Scheduling
             */

            /**
             * This boolean flag defines what part of task data should be updated in the `FixedUnits` scheduling mode.
             * If it is `true`, then {@link #field-effort} is kept intact, and duration is updated. If it is `false` -
             * vice-versa.
             *
             * @field {Boolean} effortDriven
             * @default false
             * @category Scheduling
             */

            /**
             * A calculated field storing the _early start date_ of the task.
             * The _early start date_ is the earliest possible date the task can start.
             * This value is calculated based on the earliest dates of the task predecessors and the task own
             * constraints. If the task has no predecessors nor other constraints, its early start date matches the
             * project start date.
             *
             * UI fields representing this data field are naturally disabled since the field is readonly.
             * See {@link #function-isEditable} for details.
             *
             * @field {Date} earlyStartDate
             * @calculated
             * @readonly
             * @category Scheduling
             */

            /**
             * A calculated field storing the _early end date_ of the task.
             * The _early end date_ is the earliest possible date the task can finish.
             * This value is calculated based on the earliest dates of the task predecessors and the task own
             * constraints. If the task has no predecessors nor other constraints, its early end date matches the
             * project start date plus the task duration.
             *
             * UI fields representing this data field are naturally disabled since the field is readonly.
             * See {@link #function-isEditable} for details.
             *
             * @field {Date} earlyEndDate
             * @calculated
             * @readonly
             * @category Scheduling
             */

            /**
             * A calculated field storing the _late start date_ of the task.
             * The _late start date_ is the latest possible date the task can start.
             * This value is calculated based on the latest dates of the task successors and the task own constraints.
             * If the task has no successors nor other constraints, its late start date matches the project end date
             * minus the task duration.
             *
             * UI fields representing this data field are naturally disabled since the field is readonly.
             * See {@link #function-isEditable} for details.
             *
             * @field {Date} lateStartDate
             * @calculated
             * @readonly
             * @category Scheduling
             */

            /**
             * A calculated field storing the _late end date_ of the task.
             * The _late end date_ is the latest possible date the task can finish.
             * This value is calculated based on the latest dates of the task successors and the task own constraints.
             * If the task has no successors nor other constraints, its late end date matches the project end date.
             *
             * UI fields representing this data field are naturally disabled since the field is readonly.
             * See {@link #function-isEditable} for details.
             *
             * @field {Date} lateEndDate
             * @calculated
             * @readonly
             * @category Scheduling
             */

            /**
             * A calculated field storing the _total slack_ (or _total float_) of the task.
             * The _total slack_ is the amount of working time the task can be delayed without causing a delay
             * to the project end.
             * The value is expressed in {@link #field-slackUnit} units.
             *
             * ```javascript
             * // let output slack info to the console
             * console.log(`The ${task.name} task can be delayed for ${task.totalSlack} ${slackUnit}s`)
             * ```
             *
             * UI fields representing this data field are naturally disabled since the field is readonly.
             * See {@link #function-isEditable} for details.
             *
             *
             * @field {Number} totalSlack
             * @calculated
             * @readonly
             * @category Scheduling
             */

            /**
             * A calculated field storing unit for the {@link #field-totalSlack} value.
             * @field {String} slackUnit
             * @default "day"
             * @category Scheduling
             */

            /**
             * A calculated field indicating if the task is _critical_.
             * A task considered _critical_ if its delaying causes the project delay.
             * The field value is calculated based on {@link #field-totalSlack} field value.
             *
             * ```javascript
             * if (task.critical) {
             *     Toast.show(`The ${task.name} is critical!`);
             * }
             * ```
             *
             * @field {Boolean} critical
             * @calculated
             * @readonly
             * @category Scheduling
             */

            // NOTE: These are not actually fields, they are never set during task lifespan and only used by crud manager
            // to send changes to the backend
            // Two fields which specify the relations between "phantom" tasks when they are
            // being sent to the server to be created (e.g. when you create a new task containing a new child task).
            // { name : 'phantomId', type : 'string' },
            // { name : 'phantomParentId', type : 'string' },

            /**
             * Child nodes. To allow loading children on demand, specify `children : true` in your data. Omit the field
             * for leaf tasks.
             *
             * Note, if the task store loads data from a remote origin, make sure {@link Core/data/AjaxStore#config-readUrl}
             * is specified, and optionally {@link Core/data/AjaxStore#config-parentIdParamName} is set, otherwise
             * {@link Core/data/Store#function-loadChildren} has to be implemented.
             *
             * @field {Gantt.model.TaskModel[]} children
             * @accepts {Boolean|Object[]|Gantt.model.TaskModel[]}
             * @category Parent & children
             */
            { name : 'children', persist : false },

            /**
             * Set this to true if this task should be shown in the Timeline widget
             * @field {Boolean} showInTimeline
             * @category Features
             */
            { name : 'showInTimeline', type : 'boolean' },

            /**
             * Set this to true to roll up a task to its closest parent
             * @field {Boolean} rollup
             * @category Features
             */
            { name : 'rollup', type : 'boolean' },

            /**
             * The {@link Gantt.data.Wbs WBS} for this task record. This field is automatically calculated and
             * maintained by the store. This calculation can be refreshed by calling {@link #function-refreshWbs}.
             *
             * To get string representation of the WBS value (e.g. '2.1.3'), use {@link Gantt.data.Wbs#property-value}
             * property.
             *
             * @readonly
             * @field {Gantt.data.Wbs} wbsValue
             * @accepts {Gantt.data.Wbs|String}
             * @category Scheduling
             */
            { name : 'wbsValue', type : 'wbs', persist : false },

            /**
             * A deadline date for this task. Does not affect scheduling logic.
             *
             * Note that the field always returns a `Date`.
             *
             * @field {Date} deadlineDate
             * @accepts {String|Date}
             * @category Scheduling
             */
            { name : 'deadlineDate', type : 'date' },

            // Override TreeNode parentIndex to make it persistable
            { name : 'parentIndex', type : 'number', persist : true },

            /**
             * CSS class specifying an icon to apply to the task row
             * @field {String} iconCls
             * @category Styling
             */
            'iconCls',

            /**
             * CSS class specifying an icon to apply to the task bar
             * @field {String} taskIconCls
             * @category Styling
             */
            'taskIconCls',

            /**
             * Specify false to prevent the event from being dragged (if {@link Gantt/feature/TaskDrag} feature is used)
             * @field {Boolean} draggable
             * @default true
             * @category Interaction
             */
            { name : 'draggable', type : 'boolean', persist : false, defaultValue : true },   // true or false

            /**
             * Specify false to prevent the task from being resized (if {@link Gantt/feature/TaskResize} feature is
             * used). You can also specify 'start' or 'end' to only allow resizing in one direction
             * @field {Boolean|String} resizable
             * @default true
             * @category Interaction
             */
            { name : 'resizable', persist : false, defaultValue : true }                  // true, false, 'start' or 'end'
        ];
    }

    //endregion

    //region Config

    // Flag for storing the initial manuallyScheduled value during tree transform. To avoid deoptimizing
    $manuallyScheduled = null;

    static get defaultConfig() {
        return {
            baselineModelClass : Baseline
        };
    }

    //endregion

    endBatch() {
        const { isPersistable : wasPersistable } = this;

        super.endBatch(...arguments);

        // If this event newly persistable, its assignments are eligible for syncing.
        if (this.isPersistable && !wasPersistable) {
            this.assignments.forEach(assignment => {
                assignment.stores.forEach(s => {
                    s.updateModifiedBagForRecord(assignment);
                });
            });
        }
    }

    /**
     * Returns all predecessor dependencies of this task
     * @member {Gantt.model.DependencyModel[]} predecessors
     * @readonly
     */

    /**
     * Returns all successor dependencies of this task
     * @member {Gantt.model.DependencyModel[]} successors
     * @readonly
     */

    get isTask() {
        return true;
    }

    get isTaskModel() {
        return true;
    }

    // To pass as an event when using a Gantt project with Scheduler Pro
    get isEvent() {
        return true;
    }

    get wbsCode() {
        return String(this.wbsValue);
    }

    set wbsCode(value) {
        this.wbsValue = Wbs.from(value);
    }

    copy(...args) {
        const copy = super.copy(...args);

        // Clean wbs but do not mark as dirty
        copy.setData('wbsValue', null);

        return copy;
    }

    /**
     * Propagates changes to the dependent tasks. For example:
     *
     * ```js
     * // double a task duration
     * task.duration *= 2;
     * // call commitAsync() to do further recalculations caused by the duration change
     * task.commitAsync().then(() => console.log('Schedule updated'));
     * ```
     *
     * @method commitAsync
     * @returns {Promise}
     * @propagating
     */

    /**
     * Either activates or deactivates the task depending on the passed value.
     * Will cause the schedule to be updated - returns a `Promise`
     *
     * @method
     * @name setInactive
     * @param {Boolean} inactive `true` to deactivate the task, `false` to activate it.
     * @returns {Promise}
     * @propagating
     */

    get hasBaselines() {
        const baselinesField = this.fieldMap.baselines;

        return Boolean(this.baselinesStore?.count || this.originalData[baselinesField.dataSource]);
    }

    /**
     * Applies the start/end dates from the task to the corresponding baseline.
     *
     * ```javascript
     * const task = new TaskModel({
     *      name: 'New task',
     *      startDate: '2019-01-14',
     *      endDate: '2019-01-17',
     *      duration: 3,
     *      baselines: [
     *          // Baseline version 1
     *          {
     *              startDate: '2019-01-13',
     *              endDate: '2019-01-16'
     *          },
     *          // Baseline version 2
     *          {
     *              startDate: '2019-01-14',
     *              endDate: '2019-01-17'
     *          },
     *          // Baseline version 3
     *          {
     *              startDate: '2019-01-15',
     *              endDate: '2019-01-18'
     *          }
     *      ]
     * });
     *
     * // Apply the task's start/end dates to the baseline version 3
     * task.setBaseline(3);
     * ```
     * @param {Number} version The baseline version to update
     */
    setBaseline(version) {
        if (version <= 0) {
            return;
        }

        const
            me               = this,
            { baselines }    = me,
            missingBaselines = version - baselines.count;

        // Add missing baselines up to the passed version
        if (missingBaselines > 0) {
            baselines.add(applyBaselineDefaults(me, new Array(missingBaselines).fill({})));
        }
        else {
            baselines.getAt(version - 1).set(applyBaselineDefaults(me, [{}])[0]);
        }
    }

    get baselines() {
        const me = this;

        if (!me.baselinesStore) {
            const baselinesField = this.fieldMap.baselines;

            me.baselinesStore = new Store({
                modelClass : me.constructor.getDefaultConfiguration().baselineModelClass,
                data       : applyBaselineDefaults(me, me.originalData[baselinesField.dataSource])
            });
        }
        return me.baselinesStore;
    }

    // TODO: drop and move to the engine, use outgoingDeps everywhere
    get successors() {
        return Array.from(this.outgoingDeps || []);
    }

    set successors(successors) {
        this.outgoingDeps = successors;
    }

    setSuccessors(successors) {
        this.replaceDependencies(successors, true);
    }

    // Updates either predecessors or successors with a new array, updating existing dependency records and
    // removing existing dependencies not part of current set
    replaceDependencies(dependencyRecords, isSuccessors) {
        const
            me                  = this,
            { dependencyStore } = me.project,
            updated             = new Set(),
            toAdd               = new Set(),
            toRemove            = [],
            currentSet          = isSuccessors ? me.outgoingDeps : me.incomingDeps,
            depsArr             = Array.from(currentSet);

        // TODO: All this collecting is added since chronograph
        // cannot handle removing and adding the same records at the moment.
        // We used to have here simple "removing all current & adding provided" approach

        // Collect already existing instances and new ones
        dependencyRecords.forEach(dependency => {
            const existingDep = depsArr.find(isSuccessors ? dep => dep.toEvent === dependency.toEvent : dep => dep.fromEvent === dependency.fromEvent);

            if (existingDep) {
                updated.add(existingDep);
                const data = Object.assign({}, dependency.data);
                delete data[dependency.constructor.idField];

                existingDep.set(data);
            }
            else {
                toAdd.add(dependency);
            }
        });

        // Collect records that should be removed
        currentSet.forEach(dependency => {
            if (!updated.has(dependency)) {
                toRemove.push(dependency);
            }
        });

        // remove records
        toRemove.forEach(dependency => dependencyStore.remove(dependency));

        // add new records
        toAdd.forEach(dependency => {
            if (isSuccessors) {
                dependency.fromEvent = me;
            }
            else {
                dependency.toEvent = me;
            }
            dependencyStore.add(dependency);
        });

        return me.commitAsync();
    }

    // TODO: drop and move to the engine, use outgoingDeps everywhere
    get predecessors() {
        return Array.from(this.incomingDeps || []);
    }

    set predecessors(predecessors) {
        this.incomingDeps = predecessors;
    }

    setPredecessors(predecessors) {
        this.replaceDependencies(predecessors, false);
    }

    get assignments() {
        return super.assignments;
    }

    set assignments(assignments) {
        const
            me                  = this,
            { assignmentStore } = me.project,
            toAdd               = [],
            currentAssignments = me.assignments,
            removedAssignments  = currentAssignments.filter(current => !assignments.find(newAss => newAss.resource === current.resource));

        assignments.forEach(assignment => {
            const currentAssignment = assignmentStore.getAssignmentForEventAndResource(this, assignment.resource);

            if (currentAssignment) {
                const clonedData = Object.assign({}, assignment.data);
                delete clonedData.id;

                currentAssignment.set(clonedData);
            }
            // New one
            else {
                assignment.remove();
                toAdd.push(assignment);
            }
        });

        assignmentStore.remove(removedAssignments);
        assignmentStore.add(toAdd);
    }

    get assigned() {
        const { project } = this;

        // Figure assignments out before buckets are created  (if part of project)
        if (project?.isDelayingCalculation) {
            return project.assignmentStore.storage.findItem('event', this);
        }

        return super.assigned;
    }

    set assigned(assigned) {
        super.assigned = assigned;
    }

    //region Is

    get isDraggable() {
        return this.draggable;
    }

    get isResizable() {
        return this.resizable && !this.milestone && !this.isParent;
    }

    //endregion

    //region Milestone

    get milestone() {
        // a summary task may have zero duration due to working time periods mismatch w/ its children
        // so we operate start and end date pair here
        if (!this.isLeaf) {
            const { startDate, endDate } = this;

            if (startDate && endDate) {
                return endDate.getTime() === startDate.getTime();
            }
        }

        return this.duration === 0;
    }

    // override `isMilestone` on TimeSpan model and make it to return the same value what `milestone` returns
    get isMilestone() {
        return this.milestone;
    }

    set milestone(value) {
        value ? this.convertToMilestone() : this.convertToRegular();
    }

    async setMilestone(value) {
        return value ? this.convertToMilestone() : this.convertToRegular();
    }

    /**
     * Converts this task to a milestone (start date will match the end date).
     * @propagating
     */
    async convertToMilestone() {
        return this.setDuration(0, this.durationUnit, false);
    }

    /**
     * Converts the milestone task to a regular task with a duration of 1 (keeping current {@link #field-durationUnit}).
     * @propagating
     */
    async convertToRegular() {
        if (this.milestone) {
            return this.setDuration(1, this.durationUnit, false);
        }
    }

    //endregion

    //region Dependencies

    /**
     * Returns all dependencies of this task (both incoming and outgoing)
     *
     * @property {Gantt.model.DependencyModel[]}
     */
    get allDependencies() {
        return this.dependencies;
    }

    get dependencies() {
        // Dont crash when calculations are delayed to after refresh
        if (this.project.isDelayingCalculation) {
            return [];
        }

        return [...this.incomingDeps || [], ...this.outgoingDeps || []];
    }

    set dependencies(dependencies) {
        const
            me           = this,
            predecessors = [],
            successors   = [];

        dependencies?.forEach(dependency => {
            if (dependency.fromEvent === me || dependency.fromEvent === me.id) {
                successors.push(dependency);
            }
            else if (dependency.toEvent === me || dependency.toEvent === me.id) {
                predecessors.push(dependency);
            }
        });

        me.setPredecessors(predecessors);
        me.setSuccessors(successors);
    }

    /**
     * Returns all predecessor tasks of a task
     *
     * @property {Gantt.model.TaskModel[]}
     */
    get predecessorTasks() {
        return [...this.incomingDeps || []].map(dependency => dependency.fromEvent);
    }

    /**
     * Returns all successor tasks of a task
     *
     * @readonly
     * @property {Gantt.model.TaskModel[]}
     */
    get successorTasks() {
        return [...this.outgoingDeps || []].map(dependency => dependency.toEvent);
    }

    //endregion

    //region Calculated fields

    /**
     * Returns count of all sibling nodes (including their children).
     * @property {Number}
     */
    get previousSiblingsTotalCount() {
        let task  = this.previousSibling,
            count = this.parentIndex;

        while (task) {
            count += task.descendantCount;
            task = task.previousSibling;
        }

        return count;
    }

    /**
     * Returns the sequential number of the task. A sequential number means the ordinal position of the task in the
     * total dataset, regardless of its nesting level and collapse/expand state of any parent tasks. The root node has a
     * sequential number equal to 0.
     *
     * For example, in the following tree data sample sequential numbers are specified in the comments:
     *
     *        root : {
     *            children : [
     *                {   // 1
     *                    leaf : true
     *                },
     *                {       // 2
     *                    children : [
     *                        {   // 3
     *                            children : [
     *                                {   // 4
     *                                    leaf : true
     *                                },
     *                                {   // 5
     *                                    leaf : true
     *                                }
     *                            ]
     *                        }]
     *                },
     *                {   // 6
     *                    leaf : true
     *                }
     *            ]
     *        }
     *
     * If we will collapse some of the parent tasks, sequential number of collapsed tasks won't change.
     *
     * @property {Number}
     */
    get sequenceNumber() {
        let code = 0,
            task = this;

        // TODO: store keeps allIndex, children are added before parents which makes order wrong. if that is changed
        // TODO: it can be used instead of calculating sequenceNumber

        while (task.parent) {
            code += task.previousSiblingsTotalCount + 1;
            task = task.parent;
        }

        return code;
    }

    //endregion

    //region Project related methods

    get isSubProject() {
        return false;
    }

    // TODO: cache project
    // /**
    //  * Returns the {@link Gantt.model.SubProjectModel project} instance, associated with this task if this task belongs to a project
    //  *
    //  * @private
    //  * @internal
    //  * @return {Gantt.model.SubProjectModel} project
    //  */
    get subProject() {
        const me = this;

        let project = null;

        if (me.isProject) { // TODO: implement is project
            project = me;
        }
        else {
            me.bubbleWhile(t => {
                if (t.isProject) {
                    project = t;
                }

                return !project;
            });
        }

        return project;
    }

    //endregion

    /**
     * Property which encapsulates the effort's magnitude and units.
     *
     *
     * UI fields representing this property are disabled for summary events.
     * See {@link #function-isEditable} for details.
     *
     * @property {Core.data.Duration}
     */
    get fullEffort() {
        return new Duration({
            unit      : this.effortUnit,
            magnitude : this.effort
        });
    }

    set fullEffort(effort) {
        this.setEffort(effort.magnitude, effort.unit);
    }

    //region Scheduler Pro compatibility

    /**
     * Returns all resources assigned to an event.
     *
     * @property {Gantt.model.ResourceModel[]}
     * @readonly
     */
    get resources() {
        // Only include valid resources, to not have nulls in the result
        return this.assignments.reduce((resources, assignment) => {
            assignment.resource && resources.push(assignment.resource);
            return resources;
        }, []);
    }

    //endregion

    /**
     * A `Set<Gantt.model.DependencyModel>` of the outgoing dependencies for this task
     * @member {Set} outgoingDeps
     * @readonly
     */

    /**
     * A `Set<Gantt.model.DependencyModel>` of the incoming dependencies for this task
     * @member {Set} incomingDeps
     * @readonly
     */

    /**
     * An array of the assignments, related to this task
     * @member {Gantt.model.AssignmentModel[]} assignments
     * @readonly
     */

    /**
     * If given resource is assigned to this task, returns a {@link Gantt.model.AssignmentModel} record.
     * Otherwise returns `null`
     *
     * @method getAssignmentFor
     * @param {Gantt.model.ResourceModel} resource The instance of {@link Gantt.model.ResourceModel}
     *
     * @return {Gantt.model.AssignmentModel|null}
     */

    /**
     * This method assigns a resource to this task.
     *
     * Will cause the schedule to be updated - returns a `Promise`
     *
     * @method assign
     * @param {Gantt.model.ResourceModel} resource The instance of {@link Gantt.model.ResourceModel}
     * @param {Number} [units=100] The `units` field of the new assignment
     *
     * @returns {Promise}
     * @propagating
     */

    /**
     * This method unassigns a resource from this task.
     *
     * Will cause the schedule to be updated - returns a `Promise`
     *
     * @method unassign
     * @param {Gantt.model.ResourceModel} resource The instance of {@link Gantt.model.ResourceModel}
     *
     * @returns {Promise}
     * @propagating
     */

    /**
     * Sets the calendar of the task. Will cause the schedule to be updated - returns a `Promise`
     *
     * @method setCalendar
     * @param {Gantt.model.CalendarModel} calendar The new calendar. Provide `null` to return back to the project calendar.
     * @returns {Promise}
     * @propagating
     */

    /**
     * Returns the task calendar.
     *
     * @method getCalendar
     * @returns {Gantt.model.CalendarModel} The task calendar.
     */

    /**
     * Sets the start date of the task. Will cause the schedule to be updated - returns a `Promise`
     *
     * Note, that the actually set start date may be adjusted, according to the calendar, by skipping the non-working time forward.
     *
     * @method setStartDate
     * @param {Date} date The new start date.
     * @param {Boolean} [keepDuration=true] Whether to keep the duration (and update the end date), while changing the start date, or vice-versa.
     * @returns {Promise}
     * @propagating
     */

    /**
     * Sets the end date of the task. Will cause the schedule to be updated - returns a `Promise`
     *
     * Note, that the actually set end date may be adjusted, according to the calendar, by skipping the non-working time backward.
     *
     * @method setEndDate
     * @param {Date} date The new end date.
     * @param {Boolean} [keepDuration=false] Whether to keep the duration (and update the start date), while changing the end date, or vice-versa.
     * @returns {Promise}
     * @propagating
     */

    /**
     * Updates the duration (and optionally unit) of the task. Will cause the schedule to be updated - returns a `Promise`
     *
     * @method setDuration
     * @param {Number} duration New duration value
     * @param {String} [unit] New duration unit
     * @returns {Promise}
     * @propagating
     */

    /**
     * Updates the effort (and optionally unit) of the task. Will cause the schedule to be updated - returns a `Promise`
     *
     * @method setEffort
     * @param {Number} effort New effort value
     * @param {String} [unit] New effort unit
     * @returns {Promise}
     * @propagating
     */

    /**
     * Sets the constraint type and (optionally) constraining date to the task.
     *
     * @method setConstraint
     * @param {String} constraintType Constraint type, please refer to the {@link Gantt.model.TaskModel#field-constraintType} for the valid values.
     * @param {Date}   [constraintDate] Constraint date.
     * @returns {Promise}
     * @propagating
     */

    //region Normalization

    normalize() {
        // Do nothing, normalization now happens as part of initial propagate and should use calendar anyway
    }

    inSetNormalize(field) {
        // Do nothing, normalization now happens as part of initial propagate and should use calendar anyway
    }

    /**
     * Not (yet) supported by the underlying scheduling engine
     * @function setStartEndDate
     * @hide
     * @param {Date} start The new start date
     * @param {Date} end The new end date
     */

    //endregion

    joinStore(store) {
        const me = this;

        if (!me.wbsValue) {
            if (me.taskStore?.isLoadingData || !(me.nextSibling?.wbsValue || me.previousSibling?.wbsValue)) {
                // If we are being loaded or have no siblings, then we can just process this node and its children.
                me.refreshWbs(refreshWbsOnJoinOptions);
            }
            else {
                // Otherwise, we need to also refresh this node's siblings. Since we only come here if we have a
                // sibling, we can be sure we also have a parent.
                me.parent.refreshWbs(refreshWbsOptions, -1);
            }
        }

        super.joinStore(store);
    }

    /**
     * Refreshes the {@link #field-wbsValue} of this record and its children. This is rarely needed but may be required
     * after a complex series of filtering, inserting, or removing nodes. In particular, removing nodes does create a
     * gap in `wbsValue` values that may be undesirable.
     * @param {Object} [options] A set of options for refreshing.
     * @param {Boolean} [options.deep=true] Pass `false` to not update the `wbsValue` of this node's children.
     * @param {Boolean} [options.silent=false] Pass `true` to update the `wbsValue` silently (no events). This is done
     * at load time since this value represents the clean state. Passing `true` also has the effect of not marking the
     * change as a dirty state on the record, in the case where `wbsValue` has been flagged as `persist: true`.
     * @param {Number} [index] The index of this node in its parent's children array. Pass -1 to ignore this node's
     * `wbsValue` and only operate on children (if `options.deep`).
     */
    refreshWbs(options, index) {
        const
            me = this,
            { parent } = me;

        if (parent && index !== -1 && me.fieldMap.wbsValue) {
            index = (index ?? me.unfilteredIndex ?? me.parentIndex) + 1;

            const wbs = parent.isRoot ? new Wbs(index) : parent.wbsValue.append(index);

            if (options?.silent) {
                me.setData('wbsValue', wbs);
            }
            else {
                me.set('wbsValue', wbs);
            }
        }

        if (options?.deep ?? true) {
            const
                children = me.unfilteredChildren ?? me.children,
                n = children?.length || 0;

            if (n) {
                // The array may be reversed, and if it is, then the sorter has been applied and we need to reverse
                // the WBS assignment to match
                const reverse = isReversed(children) && me.taskStore?.sorters?.findIndex(descendingWbsSorter) === 0;

                for (let i = 0; i < n; ++i) {
                    children[i].refreshWbs(options, reverse ? n - i - 1 : i);
                }
            }
        }
    }

    async tryInsertChild() {
        return this.getProject().tryPropagateWithChanges(() => {
            this.insertChild(...arguments);
        });
    }

    /**
     * Defines if the given task field should be manually editable in UI.
     * You can override this method to provide your own logic.
     *
     * By default the method defines:
     * - {@link #field-earlyStartDate}, {@link #field-earlyEndDate}, {@link #field-lateStartDate},
     * {@link #field-lateEndDate}, {@link #field-totalSlack} as not editable;
     * - {@link #field-effort}, {@link #property-fullEffort}, {@link #field-percentDone} as not editable for summary tasks;
     * - {@link #field-endDate}, {@link #field-duration} and {@link #property-fullDuration} fields
     *   as not editable for summary tasks except the {@link #field-manuallyScheduled manually scheduled} ones.
     *
     * @param {String} fieldName Name of the field
     * @returns {Boolean} Returns `true` if the field is editable, `false` if it is not and `undefined` if the task has no such field.
     */
    isEditable(fieldName) {
        switch (fieldName) {
            // r/o fields
            case 'earlyStartDate':
            case 'earlyEndDate':
            case 'lateStartDate':
            case 'lateEndDate':
            case 'totalSlack':
                return false;

            // disable effort & percentDone editing for summary tasks
            case 'effort' :
            case 'fullEffort' :
            case 'percentDone' :
            case 'renderedPercentDone' :
                return this.isLeaf;

            // end/duration is allowed to edit for leafs and manually scheduled summaries
            case 'endDate' :
            case 'duration' :
            case 'fullDuration' :
                return this.isLeaf || this.manuallyScheduled;
        }

        return super.isEditable(fieldName);
    }

    isFieldModified(fieldName) {
        if (fieldName === 'fullEffort') {
            return super.isFieldModified('effort') || super.isFieldModified('effortUnit');
        }
        return super.isFieldModified(fieldName);
    }

    updateDependencies(startDate, endDate) {
        this.outgoingDeps.forEach(dep => {
            // filter out wrong
            if (dep.toEvent.isScheduled) {
                const {
                    type,
                    lagUnit,
                    calendar,
                    toEvent
                } = dep;

                // Calculate lag value for the outgoing dependency to keep successor in place. Lag should be
                // calculated for future start/end dates and should skip non-working time
                if (startDate) {
                    if (type === DependencyBaseModel.Type.StartToStart) {
                        dep.lag = DateHelper.as(lagUnit, calendar.calculateDurationMs(startDate, toEvent.startDate, true));
                    }
                    else if (type === DependencyBaseModel.Type.StartToEnd) {
                        dep.lag = DateHelper.as(lagUnit, calendar.calculateDurationMs(startDate, toEvent.endDate, true));
                    }
                }

                if (endDate) {
                    if (type === DependencyBaseModel.Type.EndToStart) {
                        dep.lag = DateHelper.as(lagUnit, calendar.calculateDurationMs(endDate, toEvent.startDate, true));
                    }
                    else if (type === DependencyBaseModel.Type.EndToEnd) {
                        dep.lag = DateHelper.as(lagUnit, calendar.calculateDurationMs(endDate, toEvent.endDate, true));
                    }
                }
            }
        });
    }

    async moveTaskPinningSuccessors(date) {
        const me = this;

        // set start date, this will put new values to the engine and would allow to recalculate dates before
        // project is committed
        me.startDate = date;

        // Go up the tree processing outgoing dependencies for this task and all its parents
        me.bubble(node => {
            if (!node.isRoot) {
                const
                    // Peek new start/end dates
                    startDate        = node.run('calculateStartDate'),
                    endDate          = node.run('calculateEndDate');

                node.updateDependencies(startDate, endDate);
            }
        });

        return me.project.commitAsync();
    }

    async setStartDatePinningSuccessors(date) {
        const
            me      = this,
            promise = me.setStartDate(date, false);

        // Go up the tree processing outgoing dependencies for this task and all its parents
        me.bubble(node => {
            if (!node.isRoot) {
                // Peek new end date
                const startDate = node.run('calculateStartDate');

                node.updateDependencies(startDate, null);
            }
        });

        return promise;
    }

    async setEndDatePinningSuccessors(date) {
        const me = this;

        me.endDate = date;

        // Go up the tree processing outgoing dependencies for this task and all its parents
        me.bubble(node => {
            if (!node.isRoot) {
                // Peek new end date
                const endDate = node.run('calculateEndDate');

                node.updateDependencies(null, endDate);
            }
        });

        return me.project.commitAsync();
    }
}

TaskModel.convertEmptyParentToLeaf = true;

// TaskModel.$meta.fields.map.wbsCode.defineAccessor(TaskModel.prototype, /* force = */true);
