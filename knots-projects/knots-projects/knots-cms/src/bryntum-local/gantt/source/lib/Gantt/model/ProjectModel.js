import Model from '../../Core/data/Model.js';
import Store from '../../Core/data/Store.js';
import StringHelper from '../../Core/helper/StringHelper.js';
import { GanttProjectMixin, ProjectConstraintInterval } from '../../Engine/quark/model/gantt/GanttProjectMixin.js';
import { DateConstraintInterval } from '../../Engine/quark/model/scheduler_pro/HasDateConstraintMixin.js';
import { DependencyConstraintInterval } from '../../Engine/quark/model/scheduler_pro/ScheduledByDependenciesEarlyEventMixin.js';
import TimeSpan from '../../Scheduler/model/TimeSpan.js';
import ProjectCurrentConfig from '../../Scheduler/model/mixin/ProjectCurrentConfig.js';
import ProjectCrudManager from '../../SchedulerPro/data/mixin/ProjectCrudManager.js';
import AssignmentStore from '../data/AssignmentStore.js';
import CalendarManagerStore from '../data/CalendarManagerStore.js';
import DependencyStore from '../data/DependencyStore.js';
import ResourceStore from '../data/ResourceStore.js';
import TaskStore from '../data/TaskStore.js';
import AssignmentModel from './AssignmentModel.js';
import CalendarModel from './CalendarModel.js';
import DependencyModel from './DependencyModel.js';
import ResourceModel from './ResourceModel.js';
import TaskModel from './TaskModel.js';

/**
 * @module Gantt/model/ProjectModel
 */

/**
 * This class represents a global project of your Project plan or Gantt - a central place for all data.
 *
 * It holds and links the stores usually used by Gantt:
 *
 * - {@link Gantt/data/TaskStore}
 * - {@link Gantt/data/ResourceStore}
 * - {@link Gantt/data/AssignmentStore}
 * - {@link Gantt/data/DependencyStore}
 * - {@link Gantt/data/CalendarManagerStore}
 * - {@link #config-timeRangeStore TimeRangeStore}
 *
 * The project uses a scheduling engine to calculate dates, durations and such. It is also responsible for
 * handling references between models, for example to link an task via an assignment to a resource. These operations
 * are asynchronous, a fact that is hidden when working in the Gantt UI but which you must know about when performing
 * operations on the data level.
 *
 * When there is a change to data that requires something else to be recalculated, the project schedules a calculation
 * (a commit) which happens moments later. It is also possible to trigger these calculations directly. This flow
 * illustrates the process:
 *
 * 1. Something changes which requires the project to recalculate, for example adding a new task:
 *
 * ```javascript
 * const [task] = project.taskStore.add({ startDate, endDate });
 * ```
 *
 * 2. A recalculation is scheduled, thus:
 *
 * ```javascript
 * task.duration; // <- Not yet calculated
 * ```
 *
 * 3. Calculate now instead of waiting for the scheduled calculation
 *
 * ```javascript
 * await project.commitAsync();
 *
 * task.duration; // <- Now available
 * ```
 *
 * Please refer to [this guide](#Gantt/guides/data/project_data.md) for more information.
 *
 * ## Built in CrudManager
 *
 * Gantt's project has a {@link Scheduler/crud/AbstractCrudManagerMixin CrudManager} built in. Using it is the recommended way of
 * syncing data between Gantt and a backend. Example usage:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     project : {
 *         // Configure urls used by the built in CrudManager
 *         transport : {
 *             load : {
 *                 url : 'php/load.php'
 *             },
 *             sync : {
 *                 url : 'php/sync.php'
 *             }
 *         }
 *     }
 * });
 *
 * // Load data from the backend
 * gantt.project.load()
 * ```
 *
 * For more information on CrudManager, see Schedulers docs on {@link Scheduler/data/CrudManager}.
 * For a detailed description of the protocol used by CrudManager, please see the
 * [Crud manager guide](#Gantt/guides/data/crud_manager.md)
 *
 * You can access the current Project data changes anytime using the {@link #property-changes} property.
 *
 * ## Working with inline data
 *
 * The project provides an {@link #property-inlineData} getter/setter that can
 * be used to manage data from all Project stores at once. Populating the stores this way can
 * be useful if you do not want to use the CrudManager for server communication but instead load data using Axios
 * or similar.
 *
 * ### Getting data
 * ```javascript
 * const data = gantt.project.inlineData;
 *
 * // use the data in your application
 * ```
 *
 * ### Setting data
 * ```javascript
 * // Get data from server manually
 * const data = await axios.get('/project?id=12345');
 *
 * // Feed it to the project
 * gantt.project.inlineData = data;
 * ```
 *
 * See also {@link #function-loadInlineData}
 *
 * ### Getting changed records
 *
 * You can access the changes in the current Project dataset anytime using the {@link #property-changes} property. It
 * returns an object with all changes:
 * ```
 * const changes = project.changes;
 *
 * console.log(changes);
 *
 * > {
 *   tasks : {
 *       updated : [{
 *           name : 'My task',
 *           id   : 12
 *       }]
 *   },
 *   assignments : {
 *       added : [{
 *           event      : 12,
 *           resource   : 7,
 *           units      : 100,
 *           $PhantomId : 'abc123'
 *       }]
 *     }
 * };
 * ```
 *
 * ## Monitoring data changes
 *
 * While it is possible to listen for data changes on the projects individual stores, it is sometimes more convenient
 * to have a centralized place to handle all data changes. By listening for the {@link #event-change change event} your
 * code gets notified when data in any of the stores changes. Useful for example to keep an external data model up to
 * date:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     project: {
 *         listeners : {
 *             change({ store, action, records }) {
 *                 const { $name } = store.constructor;
 *
 *                 if (action === 'add') {
 *                     externalDataModel.add($name, records);
 *                 }
 *
 *                 if (action === 'remove') {
 *                     externalDataModel.remove($name, records);
 *                 }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * ## Processing the data loaded from the server
 *
 * If you want to process the data received from the server after loading, you can use
 * the {@link #event-beforeLoadApply} or {@link #event-beforeSyncApply} events:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     project: {
 *         listeners : {
 *             beforeLoadApply({ response }) {
 *                 // do something with load-response object before it is provided to all the project stores
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * ## Built in StateTrackingManager
 *
 * The project also has a built in {@link Core/data/stm/StateTrackingManager} (STM for short), that
 * handles undo/redo for the project stores (additional stores can also be added). By default, it is only used while
 * editing tasks using the task editor, the editor updates tasks live and uses STM to rollback changes if canceled. But
 * you can enable it to track all project store changes:
 *
 * ```javascript
 * // Enable automatic transaction creation and start recording
 * project.stm.autoRecord = true;
 * project.stm.enable();
 *
 * // Undo a transaction
 * project.stm.undo();
 *
 * // Redo
 * project.stm.redo();
 * ```
 *
 * Check out the `undoredo` demo to see it in action.
 *
 * @extends Core/data/Model
 *
 * @mixes SchedulerPro/data/mixin/ProjectCrudManager
 * @mixes Core/mixin/Events
 *
 * @typings SchedulerPro/model/ProjectModel -> SchedulerPro/model/SchedulerProProjectModel
 */
export default class ProjectModel extends ProjectCurrentConfig(ProjectCrudManager(GanttProjectMixin.derive(Model))) {
    //region Config

    /**
     * @hidefields id, readOnly, children, parentId, parentIndex
     */

    /**
     * Silences propagations caused by the project loading.
     *
     * Applying the loaded data to the project occurs in two basic stages:
     *
     * 1. Data gets into the engine graph which triggers changes propagation
     * 2. The changes caused by the propagation get written to related stores
     *
     * Setting this flag to `true` makes the component perform step 2 silently without triggering events causing reactions on those changes
     * (like sending changes back to the server if `autoSync` is enabled) and keeping stores in unmodified state.
     *
     * This is safe if the loaded data is consistent so propagation doesn't really do any adjustments.
     * By default the system treats the data as consistent so this option is `true`.
     *
     * ```javascript
     * new Gantt({
     *     project : {
     *         // We want scheduling engine to recalculate the data properly
     *         // so then we could save it back to the server
     *         silenceInitialCommit : false,
     *         ...
     *     }
     *     ...
     * })
     * ```
     *
     * @config {Boolean} silenceInitialCommit
     * @default true
     * @category Advanced
     */

    /**
     * When `true` the project manually scheduled tasks will adjust their proposed start/end dates
     * to skip non working time.
     *
     * @field {Boolean} skipNonWorkingTimeWhenSchedulingManually
     * @default false
     */

    /**
     * This config manages DST correction in the scheduling engine. It only has effect when DST transition hour is
     * working time. Usually DST transition occurs on Sunday, so with non working weekends the DST correction logic
     * is not involved.
     *
     * If **true**, it will add/remove one hour when calculating duration from start/end dates. For example:
     * Assume weekends are working and on Sunday, 2020-10-25 at 03:00 clocks are set back 1 hour. Assume there is a task:
     *
     * ```javascript
     * {
     *     startDate    : '2020-10-20',
     *     duration     : 10,
     *     durationUnit : 'day'
     * }
     * ```
     * It will end on 2020-10-29 23:00. Because of the DST transition Sunday is actually 25 hours long and when the
     * Gantt project calculates the end date it converts days to hours multiplying by 24. If you're setting duration
     * and want task to end on the end of the day you should manually correct for DST, like so:
     *
     * ```javascript
     * {
     *     startDate    : '2020-10-20',
     *     duration     : 10 * 24 + 1,
     *     durationUnit : 'hour'
     * },
     * ```
     *
     * If task has start and end dates it will correct for DST twice:
     *
     * ```javascript
     * {
     *     startDate    : '2020-10-20',
     *     endDate      : '2020-10-30'
     * }
     * ```
     * This task will end on 2020-10-29 22:00 which is a known quirk.
     *
     * If **false**, the Gantt project will not add DST correction which fixes the quirk mentioned above and such task
     * will end on 2020-10-30 exactly, having hours duration of 10 days * 24 hours + 1 hour.
     *
     * Also, for this task days duration will be a floating point number due to extra (or missing) hour:
     *
     * ```javascript
     * task.getDuration('day')  // 10.041666666666666
     * task.getDuration('hour') // 241
     * ```
     *
     * @config {Boolean} adjustDurationToDST
     * @default false
     * @category Advanced
     */
    // TODO: This config is introduced only to make behavior transition smooth. If nobody complains about it for
    // a couple of releases, it should be removed

    /**
     * Set to `true` to enable calculation progress notifications.
     * When enabled, the project fires {@link #event-progress} events and the Gantt chart load mask reacts by showing a progress bar for the Engine calculations.
     *
     * **Note**: Enabling progress notifications will impact calculation performance, since it needs to pause calculations to allow the UI to redraw.
     *
     * @config {Boolean} enableProgressNotifications
     * @category Advanced
     */
    /**
     * Enables/disables the calculation progress notifications.
     * @member {Boolean} enableProgressNotifications
     * @category Advanced
     */

    // region Events

    /**
     * Fired during the Engine calculation if {@link #config-enableProgressNotifications} config is `true`
     * @event progress
     * @param {Number} total The total number of operations
     * @param {Number} remaining The number of remaining operations
     * @param {String} phase The phase of the calculation, either 'storePopulation' when data is getting loaded, or 'propagating' when data is getting calculated
     */

    /**
     * Fired when the Engine detects a computation cycle.
     * @event cycle
     * @param {Object} schedulingIssue Scheduling error describing the case:
     * @param {Function} schedulingIssue.getDescription Returns the cycle description
     * @param {Object} schedulingIssue.cycle Object providing the cycle info
     * @param {Function} schedulingIssue.getResolutions Returns possible resolutions
     * @param {Function} continueWithResolutionResult Function to call after a resolution is chosen to
     * proceed with the Engine calculations:
     * ```javascript
     * project.on('cycle', ({ continueWithResolutionResult }) => {
     *     // cancel changes in case of a cycle
     *     continueWithResolutionResult(EffectResolutionResult.Cancel);
     * })
     * ```
     */

    /**
     * Fired when the Engine detects a scheduling conflict.
     * @event schedulingConflict
     * @param {Object} schedulingIssue The conflict details:
     * @param {Function} schedulingIssue.getDescription Returns the conflict description
     * @param {Object[]} schedulingIssue.intervals Array of conflicting intervals
     * @param {Function} schedulingIssue.getResolutions Function to get possible resolutions
     * @param {Function} continueWithResolutionResult Function to call after a resolution is chosen to
     * proceed with the Engine calculations:
     * ```javascript
     * project.on('schedulingConflict', ({ schedulingIssue, continueWithResolutionResult }) => {
     *     // apply the first resolution and continue
     *     schedulingIssue.getResolutions()[0].resolve();
     *     continueWithResolutionResult(EffectResolutionResult.Resume);
     * })
     * ```
     */

    /**
     * Fired when the Engine detects a calendar misconfiguration when the calendar does
     * not provide any working periods of time which makes usage impossible.
     * @event emptyCalendar
     * @param {Object} schedulingIssue Scheduling error describing the case:
     * @param {Function} schedulingIssue.getDescription Returns the error description
     * @param {Function} schedulingIssue.getCalendar Returns the calendar that must be fixed
     * @param {Function} schedulingIssue.getResolutions Returns possible resolutions
     * @param {Function} continueWithResolutionResult Function to call after a resolution is chosen to
     * proceed with the Engine calculations:
     * ```javascript
     * project.on('emptyCalendar', ({ schedulingIssue, continueWithResolutionResult }) => {
     *     // apply the first resolution and continue
     *     schedulingIssue.getResolutions()[0].resolve();
     *     continueWithResolutionResult(EffectResolutionResult.Resume);
     * })
     * ```
     */

    /**
     * Fired when the engine has finished its calculations and the results has been written back to the records.
     *
     * ```javascript
     * gantt.project.on({
     *     dataReady() {
     *        console.log('Calculations finished');
     *     }
     * });
     *
     * gantt.project.taskStore.first.duration = 10;
     *
     * // At some point a bit later it will log 'Calculations finished'
     * ```
     *
     * @event dataReady
     * @param {Gantt.model.ProjectModel} source The project
     */

    //endregion

    static get defaults() {
        return {
            /**
             * The number of hours per day (is used when converting the duration from one unit to another).
             * @field {Number} hoursPerDay
             * @default 24
             */

            /**
             * The number of days per week (is used when converting the duration from one unit to another).
             * @field {Number} daysPerWeek
             * @default 7
             */

            /**
             * The number of days per month (is used when converting the duration from one unit to another).
             * @field {Number} daysPerMonth
             * @default 30
             */

            /**
             * The source of the calendar for dependencies (the calendar used for taking dependencies lag into account).
             * Possible values are:
             *
             * - `ToEvent` - successor calendar will be used (default);
             * - `FromEvent` - predecessor calendar will be used;
             * - `Project` - the project calendar will be used.
             *
             * @field {String} dependenciesCalendar
             * @default 'ToEvent'
             */

            /**
             * The project calendar.
             * @config {String|Object|Gantt.model.CalendarModel} calendar
             */

            /**
             * The project calendar.
             * @field {Gantt.model.CalendarModel} calendar
             */

            /**
             * `true` to enable automatic {@link Gantt/model/TaskModel#field-percentDone % done} calculation for summary
             * tasks, `false` to disable it.
             * @field {Boolean} autoCalculatePercentDoneForParentTasks
             * @default true
             */

            /**
             * State tracking manager instance the project relies on
             * @member {Core.data.stm.StateTrackingManager} stm
             * @category Advanced
             */

            /**
             * The {@link Gantt.data.TaskStore store} holding the task information.
             *
             * See also {@link Gantt.model.TaskModel}
             * @member {Gantt.data.TaskStore} eventStore
             * @category Models & Stores
             */
            /**
             * A {@link Gantt.data.TaskStore} instance or a config object.
             * @config {Gantt.data.TaskStore|Object} eventStore
             * @category Models & Stores
             */

            /**
             * An alias for the {@link #property-eventStore}.
             *
             * See also {@link Gantt.model.TaskModel}
             * @member {Gantt.data.TaskStore} taskStore
             * @category Models & Stores
             */
            /**
             * An alias for the {@link #config-eventStore}.
             * @config {Gantt.data.TaskStore|Object} taskStore
             * @category Models & Stores
             */

            /**
             * The {@link Gantt.data.DependencyStore store} holding the dependency information.
             *
             * See also {@link Gantt.model.DependencyModel}
             * @member {Gantt.data.DependencyStore} dependencyStore
             * @category Models & Stores
             */
            /**
             * A {@link Gantt.data.DependencyStore} instance or a config object.
             * @config {Gantt.data.DependencyStore|Object} dependencyStore
             * @category Models & Stores
             */

            /**
             * The {@link Gantt.data.ResourceStore store} holding the resources that can be assigned to the tasks in the
             * task store.
             *
             * See also {@link Gantt.model.ResourceModel}
             * @member {Gantt.data.ResourceStore} resourceStore
             * @category Models & Stores
             */
            /**
             * A {@link Gantt.data.ResourceStore} instance or a config object.
             * @config {Gantt.data.ResourceStore|Object} resourceStore
             * @category Models & Stores
             */

            /**
             * The {@link Gantt.data.AssignmentStore store} holding the assignment information.
             *
             * See also {@link Gantt.model.AssignmentModel}
             * @member {Gantt.data.AssignmentStore} assignmentStore
             * @category Models & Stores
             */
            /**
             * An {@link Gantt.data.AssignmentStore} instance or a config object.
             * @config {Gantt.data.AssignmentStore|Object} assignmentStore
             * @category Models & Stores
             */

            /**
             * The {@link Gantt.data.CalendarManagerStore store} holding the calendar information.
             *
             * See also {@link Gantt.model.CalendarModel}
             * @member {Gantt.data.CalendarManagerStore} calendarManagerStore
             * @category Models & Stores
             */
            /**
             * A {@link Gantt.data.CalendarManagerStore} instance or a config object.
             * @config {Gantt.data.CalendarManagerStore|Object} calendarManagerStore
             * @category Models & Stores
             */

            /**
             * The {@link Core.data.Store store} containing time ranges to be visualized.
             *
             * See also {@link Scheduler.model.TimeSpan}
             * @member {Core.data.Store} timeRangeStore
             * @category Models & Stores
             */

            /**
             * Returns an array of critical paths.
             * Each _critical path_ is an array of critical path nodes.
             * Each _critical path node_ is an object which contains {@link Gantt/model/TaskModel#field-critical critical task}
             * and {@link Gantt/model/DependencyModel dependency} leading to the next critical path node.
             * Dependency is missing if it is the last critical path node in the critical path.
             * To highlight critical paths, enable {@link Gantt/feature/CriticalPaths} feature.
             *
             * ```javascript
             * // This is an example of critical paths structure
             * [
             *      // First path
             *      [
             *          {
             *              event : Gantt.model.TaskModel
             *              dependency : Gantt.model.DependencyModel
             *          },
             *          {
             *              event : Gantt.model.TaskModel
             *          }
             *      ],
             *      // Second path
             *      [
             *          {
             *              event : Gantt.model.TaskModel
             *          }
             *      ]
             *      // and so on....
             * ]
             * ```
             *
             * For more details on the _critical path method_ theory please check
             * this article: https://en.wikipedia.org/wiki/Critical_path_method
             *
             * @member {Array[]} criticalPaths
             * @category Scheduling
             */

            // root should be always expanded
            expanded : true
        };
    }

    static get defaultConfig() {
        return {
            projectConstraintIntervalClass    : ProjectConstraintInterval,
            dateConstraintIntervalClass       : DateConstraintInterval,
            dependencyConstraintIntervalClass : DependencyConstraintInterval,

            /**
             * The constructor of the event model class, to be used in the project. Will be set as the {@link Core.data.Store#config-modelClass modelClass}
             * property of the {@link #property-eventStore}
             *
             * @config {Gantt.model.TaskModel} [taskModelClass]
             * @typings {typeof TaskModel}
             * @category Models & Stores
             */
            taskModelClass : TaskModel,

            /**
             * The constructor of the dependency model class, to be used in the project. Will be set as the {@link Core.data.Store#config-modelClass modelClass}
             * property of the {@link #property-dependencyStore}
             *
             * @config {Gantt.model.DependencyModel} [dependencyModelClass]
             * @typings {typeof DependencyModel}
             * @category Models & Stores
             */
            dependencyModelClass : DependencyModel,

            /**
             * The constructor of the resource model class, to be used in the project. Will be set as the {@link Core.data.Store#config-modelClass modelClass}
             * property of the {@link #property-resourceStore}
             *
             * @config {Gantt.model.ResourceModel} [resourceModelClass]
             * @typings {typeof ResourceModel}
             * @category Models & Stores
             */
            resourceModelClass : ResourceModel,

            /**
             * The constructor of the assignment model class, to be used in the project. Will be set as the {@link Core.data.Store#config-modelClass modelClass}
             * property of the {@link #property-assignmentStore}
             *
             * @config {Gantt.model.AssignmentModel} [assignmentModelClass]
             * @typings {typeof AssignmentModel}
             * @category Models & Stores
             */
            assignmentModelClass : AssignmentModel,

            /**
             * The constructor of the calendar model class, to be used in the project. Will be set as the {@link Core.data.Store#config-modelClass modelClass}
             * property of the {@link #property-calendarManagerStore}
             *
             * @config {Gantt.model.CalendarModel} [calendarModelClass]
             * @typings {typeof CalendarModel}
             * @category Models & Stores
             */
            calendarModelClass : CalendarModel,

            /**
             * The constructor to create an task store instance with. Should be a class, subclassing the {@link Gantt.data.TaskStore}
             * @config {Gantt.data.TaskStore}
             * @typings {typeof TaskStore}
             * @category Models & Stores
             */
            taskStoreClass : TaskStore,

            /**
             * The constructor to create a dependency store instance with. Should be a class, subclassing the {@link Gantt.data.DependencyStore}
             * @config {Gantt.data.DependencyStore}
             * @typings {typeof DependencyStore}
             * @category Models & Stores
             */
            dependencyStoreClass : DependencyStore,

            /**
             * The constructor to create a dependency store instance with. Should be a class, subclassing the {@link Gantt.data.ResourceStore}
             * @config {Gantt.data.ResourceStore}
             * @typings {typeof ResourceStore}
             * @category Models & Stores
             */
            resourceStoreClass : ResourceStore,

            /**
             * The constructor to create a dependency store instance with. Should be a class, subclassing the {@link Gantt.data.AssignmentStore}
             * @config {Gantt.data.AssignmentStore}
             * @typings {typeof AssignmentStore}
             * @category Models & Stores
             */
            assignmentStoreClass : AssignmentStore,

            /**
             * The constructor to create a calendar store instance with. Should be a class, subclassing the {@link Gantt.data.CalendarManagerStore}
             * @config {Gantt.data.CalendarManagerStore}
             * @typings {typeof CalendarManagerStore}
             * @category Models & Stores
             */
            calendarManagerStoreClass : CalendarManagerStore,

            /**
             * Start date of the project in the ISO 8601 format. Setting this date will constrain all other tasks in the
             * project to start no earlier than it.
             *
             * If this date is not provided, it will be calculated as the earliest date among all tasks.
             *
             * Note that the field always returns a `Date`.
             *
             * @field {Date} startDate
             * @accepts {String|Date}
             */

            /**
             * End date of the project in the ISO 8601 format.
             * The value is calculated as the latest date among all tasks.
             *
             * Note that the field always returns a `Date`.
             *
             * @field {Date} endDate
             * @accepts {String|Date}
             */

            /**
             * The scheduling direction of the project events.
             * The `Forward` direction corresponds to the As-Soon-As-Possible (ASAP) scheduling,
             * `Backward` - to As-Late-As-Possible (ALAP).
             *
             * @field {String} direction
             * @default 'Forward'
             */

            /**
             * The initial data, to fill the {@link #property-taskStore taskStore} with.
             * Should be an array of {@link Gantt.model.TaskModel TaskModels} or configuration objects.
             *
             * @config {Object[]|Gantt.model.TaskModel[]}
             * @category Legacy inline data
             */
            tasksData : null,

            // What is actually used to hold initial tasks, tasksData is transformed in construct()
            /**
             * Alias to {@link #config-tasksData}.
             *
             * @config {Object[]|Gantt.model.TaskModel[]}
             * @category Legacy inline data
             */
            eventsData : null,

            /**
             * The initial data, to fill the {@link #property-dependencyStore dependencyStore} with.
             * Should be an array of {@link Gantt.model.DependencyModel DependencyModels} or configuration objects.
             *
             * @config {Object[]|Gantt.model.DependencyModel[]}
             * @category Legacy inline data
             */
            dependenciesData : null,

            /**
             * The initial data, to fill the {@link #property-resourceStore resourceStore} with.
             * Should be an array of {@link Gantt.model.ResourceModel ResourceModels} or configuration objects.
             *
             * @config {Object[]|Gantt.model.ResourceModel[]}
             * @category Legacy inline data
             */
            resourcesData : null,

            /**
             * The initial data, to fill the {@link #property-assignmentStore assignmentStore} with.
             * Should be an array of {@link Gantt.model.AssignmentModel AssignmentModels} or configuration objects.
             *
             * @config {Object[]|Gantt.model.AssignmentModel[]}
             * @category Legacy inline data
             */
            assignmentsData : null,

            /**
             * The initial data, to fill the {@link #property-calendarManagerStore calendarManagerStore} with.
             * Should be an array of {@link Gantt.model.CalendarModel CalendarModels} or configuration objects.
             *
             * @config {Object[]|Gantt.model.CalendarModel[]}
             * @category Legacy inline data
             */
            calendarsData : null,

            /**
             * Store that holds time ranges (using the {@link Scheduler.model.TimeSpan} model or subclass thereof) for
             * {@link Scheduler.feature.TimeRanges} feature. A store will be automatically created if none is specified.
             * @config {Object|Core.data.Store}
             * @category Models & Stores
             */
            timeRangeStore : {
                modelClass : TimeSpan,
                storeId    : 'timeRanges'
            },

            /**
             * Set to `true` to reset the undo/redo queues of the internal {@link Core.data.stm.StateTrackingManager}
             * after the Project has loaded. Defaults to `false`
             * @config {Boolean} resetUndoRedoQueuesAfterLoad
             * @category Advanced
             */

            convertEmptyParentToLeaf : false,

            supportShortSyncResponseNote : 'Note: Please consider enabling "supportShortSyncResponse" option to allow less detailed sync responses (https://bryntum.com/docs/gantt/api/Gantt/model/ProjectModel#config-supportShortSyncResponse)',

            /**
             * Enables early rendering in Gantt, by postponing calculations to after the first refresh.
             *
             * Requires task data loaded in Gantt to be pre-normalized to function as intended, since it will be used to
             * render tasks before engine has normalized the data. Given un-normalized data tasks will snap into place
             * when calculations are finished.
             *
             * The Gantt chart will be read-only until the initial calculations are finished.
             *
             * @config {Boolean}
             * @default
             * @category Advanced
             */
            delayCalculation : true,

            eventStore           : {},
            assignmentStore      : {},
            resourceStore        : {},
            dependencyStore      : {},
            calendarManagerStore : {}
        };
    }

    static get configurable() {
        return {

            /**
             * Get/set {@link #property-taskStore} data.
             *
             * Always returns an array of {@link Gantt.model.TaskModel TaskModels} but also accepts an array of
             * its configuration objects as input.
             *
             * @member {Gantt.model.TaskModel[]} tasks
             * @accepts {Gantt.model.TaskModel[]|Object[]}
             * @category Inline data
             */
            /**
             * Data use to fill the {@link #property-taskStore}. Should be an array of
             * {@link Gantt.model.TaskModel TaskModels} or its configuration objects.
             *
             * @config {Gantt.model.TaskModel[]|Object[]}
             * @category Inline data
             */
            tasks : null,

            /**
             * Get/set {@link #property-resourceStore} data.
             *
             * Always returns an array of {@link Gantt.model.ResourceModel ResourceModels} but also accepts an array
             * of its configuration objects as input.
             *
             * @member {Gantt.model.ResourceModel[]} resources
             * @accepts {Gantt.model.ResourceModel[]|Object[]}
             * @category Inline data
             */
            /**
             * Data use to fill the {@link #property-resourceStore}. Should be an array of
             * {@link Gantt.model.ResourceModel ResourceModels} or its configuration objects.
             *
             * @config {Gantt.model.ResourceModel[]|Object[]}
             * @category Inline data
             */
            resources : null,

            /**
             * Get/set {@link #property-assignmentStore} data.
             *
             * Always returns an array of {@link Gantt.model.AssignmentModel AssignmentModels} but also accepts an
             * array of its configuration objects as input.
             *
             * @member {Gantt.model.AssignmentModel[]} assignments
             * @accepts {Gantt.model.AssignmentModel[]|Object[]}
             * @category Inline data
             */
            /**
             * Data use to fill the {@link #property-assignmentStore}. Should be an array of
             * {@link Gantt.model.AssignmentModel AssignmentModels} or its configuration objects.
             *
             * @config {Gantt.model.AssignmentModel[]|Object[]}
             * @category Inline data
             */
            assignments : null,

            /**
             * Get/set {@link #property-dependencyStore} data.
             *
             * Always returns an array of {@link Gantt.model.DependencyModel DependencyModels} but also accepts an
             * array of its configuration objects as input.
             *
             * @member {Gantt.model.DependencyModel[]} dependencies
             * @accepts {Gantt.model.DependencyModel[]|Object[]}
             * @category Inline data
             */
            /**
             * Data use to fill the {@link #property-dependencyStore}. Should be an array of
             * {@link Gantt.model.DependencyModel DependencyModels} or its configuration objects.
             *
             * @config {Gantt.model.DependencyModel[]|Object[]}
             * @category Inline data
             */
            dependencies : null,

            /**
             * Get/set {@link #property-timeRangeStore} data.
             *
             * Always returns an array of {@link Scheduler.model.TimeSpan TimeSpans} but also accepts an
             * array of its configuration objects as input.
             *
             * @member {Scheduler.model.TimeSpan[]} timeRanges
             * @accepts {Scheduler.model.TimeSpan[]|Object[]}
             * @category Inline data
             */
            /**
             * Data use to fill the {@link #property-timeRangeStore}. Should be an array of
             * {@link Scheduler.model.TimeSpan TimeSpans} or its configuration objects.
             *
             * @config {Scheduler.model.TimeSpan[]|Object[]}
             * @category Inline data
             */
            timeRanges : null,

            /**
             * Get/set {@link #property-calendarManagerStore} data.
             *
             * Always returns a {@link Gantt.model.CalendarModel} array but also accepts an array of its configuration
             * objects as input.
             *
             * @member {Gantt.model.CalendarModel[]} calendars
             * @accepts {Gantt.model.CalendarModel[]|Object[]}
             * @category Inline data
             */
            /**
             * Data use to fill the {@link #property-calendarManagerStore}. Should be a
             * {@link Gantt.model.CalendarModel} array or its configuration objects.
             *
             * @config {Gantt.model.CalendarModel[]|Object[]}
             * @category Inline data
             */
            calendars : null,

            /**
             * The initial data, to fill the {@link #property-timeRangeStore timeRangeStore} with.
             * Should be an array of {@link Scheduler.model.TimeSpan TimeSpans} or configuration objects.
             *
             * @config {Object[]|Scheduler.model.TimeSpan[]}
             * @category Legacy inline data
             */
            timeRangesData : null
        };
    }

    //endregion

    construct(...args) {
        const config = args[0] || {};

        // put config to arguments (passed to the parent class "construct")
        args[0] = config;

        if ('tasksData' in config) {
            config.eventsData   = config.tasksData;
            delete config.tasksData;
        }

        if ('taskStore' in config) {
            config.eventStore = config.taskStore;
            delete config.taskStore;
        }

        // Maintain backwards compatibility
        // default config will be exposed later and won't be applied if a value is exists,
        // but we should sync eventModelClass/eventStoreClass with taskModelClass/taskStoreClass before all further actions
        // to apply the correct value in all mixins that uses eventModelClass/eventStoreClass properties only
        config.eventModelClass = config.taskModelClass || config.eventModelClass || this.getDefaultConfiguration().taskModelClass || this.defaultEventModelClass;
        config.eventStoreClass = config.taskStoreClass || config.eventStoreClass || this.getDefaultConfiguration().taskStoreClass || this.defaultEventStoreClass;

        super.construct(...args);
    }

    //region Attaching stores

    // Attach to a store, relaying its change events
    attachStore(store) {
        store.on({
            name    : store.$$name,
            change  : 'relayStoreChange',
            thisObj : this
        });
    }

    // Detach a store, stop relaying its change events
    detachStore(store) {
        store && this.detachListeners(store.$$name);
    }

    relayStoreChange(event) {
        /**
         * Fired when data in any of the projects stores changes.
         *
         * Basically a relayed version of each stores own change event, decorated with which store it originates from.
         * See the {@link Core.data.Store#event-change store change event} documentation for more information.
         *
         * @event change
         * @param {Gantt.model.ProjectModel} source This project
         * @param {Core.data.Store} store Affected store
         * @param {String} action Name of action which triggered the change. May be one of:
         * * `'remove'`
         * * `'removeAll'`
         * * `'add'`
         * * `'updatemultiple'`
         * * `'clearchanges'`
         * * `'filter'`
         * * `'update'`
         * * `'dataset'`
         * * `'replace'`
         * @param {Core.data.Model} record Changed record, for actions that affects exactly one record (`'update'`)
         * @param {Core.data.Model[]} records Changed records, passed for all actions except `'removeAll'`
         * @param {Object} changes Passed for the `'update'` action, info on which record fields changed
         */
        return this.trigger('change', { store : event.source, ...event, source : this });
    }

    //endregion

    get defaultEventModelClass() {
        return TaskModel;
    }

    get defaultEventStoreClass() {
        return TaskStore;
    }

    set taskStore(store) {
        this.eventStore = store;
    }

    get taskStore() {
        return this.eventStore;
    }

    get timeRangeStore() {
        return this._timeRangeStore;
    }

    set timeRangeStore(store) {
        const me = this;

        me.detachStore(me._timeRangeStore);

        me._timeRangeStore = Store.getStore(store, Store);

        if (!me._timeRangeStore.storeId) {
            me._timeRangeStore.storeId = 'timeRanges';
        }

        me.attachStore(me._timeRangeStore);
    }

    async tryInsertChild() {
        return this.tryPropagateWithChanges(() => {
            this.insertChild(...arguments);
        });
    }

    /**
     * Overrides the project owned store identifiers calculation and launches rescheduling.
     * @method setCalculations
     * @param {Object} calculations Object providing new _engine_ fields calculation function names.
     * The object is grouped by store identifiers. For example below code
     * overrides task {@link Gantt/model/TaskModel#field-startDate}, {@link Gantt/model/TaskModel#field-endDate}
     * and {@link Gantt/model/TaskModel#field-duration} calculation so
     * the fields will always simply return their current values:
     *
     * ```javascript
     * // task startDate, endDate and duration will use their userProvidedValue method
     * // which simply returns their current values as-is
     * const oldCalculations = await project.setCalculations({
     *     tasks : {
     *         startDate : "userProvidedValue",
     *         endDate   : "userProvidedValue",
     *         duration  : "userProvidedValue"
     *     }
     * })
     * ```
     * @returns {Promise} Promise that resolves with an object having the overridden calculations.
     * The object can be used to toggle the calculations back in the future:
     * ```javascript
     * // override event duration calculation
     * const oldCalculations = await project.setCalculations({
     *     events : {
     *         duration  : "userProvidedValue"
     *     }
     * })
     * // revert the duration calculation back
     * project.setCalculations(oldCalculations)
     * ```
     * @category Advanced
     */

    /**
     * Returns a calendar of the project. If task has never been assigned a calendar a project's calendar will be returned.
     *
     * @method getCalendar
     * @returns {Gantt.model.CalendarModel}
     * @category Scheduling
     */

    /**
     * Sets the calendar of the project. Will cause the schedule to be updated - returns a `Promise`
     *
     * @method setCalendar
     * @param {Gantt.model.CalendarModel} calendar The new calendar.
     * @returns {Promise}
     * @propagating
     * @category Scheduling
     */

    /**
     * Causes the scheduling engine to re-evaluate the task data and all associated data and constraints
     * and apply necessary changes.
     * @returns {Promise}
     * @function propagate
     * @propagating
     * @category Scheduling
     */

    /**
     * Suspend {@link #function-propagate propagation} processing. When propagation is suspended,
     * calls to {@link #function-propagate} do not proceed, instead a propagate call is deferred
     * until a matching {@link #function-resumePropagate} is called.
     * @function suspendPropagate
     * @category Scheduling
     */

    /**
     * Resume {@link #function-propagate propagation}. If propagation is resumed (calls may be nested
     * which increments a suspension counter), then if a call to propagate was made during suspension,
     * {@link #function-propagate} is executed.
     * @param {Boolean} [trigger] Pass `false` to inhibit automatic propagation if propagate was requested during suspension.
     * @returns {Promise}
     * @function resumePropagate
     * @category Scheduling
     */

    /**
     * Accepts a "data package" consisting of data for the projects stores, which is then loaded into the stores.
     *
     * The package can hold data for EventStore, AssignmentStore, ResourceStore and DependencyStore. It uses the same
     * format as when creating a project with inline data:
     *
     * ```javascript
     * await project.loadInlineData({
     *     eventsData       : [...],
     *     resourcesData    : [...],
     *     assignmentsData  : [...],
     *     dependenciesData : [...]
     * });
     * ```
     *
     * After populating the stores it commits the project, starting its calculations. By awaiting `loadInlineData()` you
     * can be sure that project calculations are finished.
     *
     * @function loadInlineData
     * @param {Object} dataPackage A data package as described above
     * @fires load
     * @async
     * @category Inline data
     */

    /**
     * Project changes (CRUD operations to records in its stores) are automatically committed on a buffer to the
     * underlying graph based calculation engine. The engine performs it calculations async.
     *
     * By calling this function, the commit happens right away. And by awaiting it you are sure that project
     * calculations are finished and that references between records are up to date.
     *
     * The returned promise is resolved with an object. If that object has `rejectedWith` set, there has been a conflict and the calculation failed.
     *
     * ```javascript
     * // Move a task in time
     * taskStore.first.shift(1);
     *
     * // Trigger calculations directly and wait for them to finish
     * const result = await project.commitAsync();
     *
     * if (result.rejectedWith) {
     *     // there was a conflict during the scheduling
     * }
     * ```
     *
     * @async
     * @propagating
     * @returns {Promise}
     * @function commitAsync
     * @category Scheduling
     */

    //region JSON

    /**
     * Returns the data from the records of the projects stores, in a format that can be consumed by `loadInlineData()`.
     *
     * Used by JSON.stringify to correctly convert this record to json.
     *
     *
     * ```javascript
     * const project = new ProjectModel({
     *     eventsData       : [...],
     *     resourcesData    : [...],
     *     assignmentsData  : [...],
     *     dependenciesData : [...]
     * });
     *
     * const json = project.toJSON();
     *
     * // json:
     * {
     *     eventsData : [...],
     *     resourcesData : [...],
     *     dependenciesData : [...],
     *     assignmentsData : [...]
     * }
     * ```
     *
     * Output can be consumed by `loadInlineData()`:
     *
     * ```javascript
     * const json = project.toJSON();
     *
     * // Plug it back in later
     * project.loadInlineData(json);
     * ```
     *
     * @returns {Object}
     * @category Inline data
     */
    toJSON() {
        return {
            eventsData       : this.eventStore.toJSON(),
            resourcesData    : this.resourceStore.toJSON(),
            dependenciesData : this.dependencyStore.toJSON(),
            assignmentsData  : this.assignmentStore.toJSON()
        };
    }

    /**
     * Get or set project data (records from its stores) as a JSON string.
     *
     * Get a JSON string:
     *
     * ```javascript
     * const project = new ProjectModel({
     *     eventsData       : [...],
     *     resourcesData    : [...],
     *     assignmentsData  : [...],
     *     dependenciesData : [...]
     * });
     *
     * const jsonString = project.json;
     *
     * // jsonString:
     * '{"eventsData":[...],"resourcesData":[...],...}'
     * ```
     *
     * Set a JSON string (to populate the project stores):
     *
     * ```javascript
     * project.json = '{"eventsData":[...],"resourcesData":[...],...}'
     * ```
     *
     * @property {String}
     * @category Inline data
     */
    get json() {
        return super.json;
    }

    set json(json) {
        if (typeof json === 'string') {
            json = StringHelper.safeJsonParse(json);
        }

        this.loadInlineData(json);
    }

    //endregion

    //region Inline data

    get tasks() {
        return this.taskStore.records;
    }

    updateTasks(events) {
        this.taskStore.data = events;
    }

    get resources() {
        return this.resourceStore.records;
    }

    updateResources(resources) {
        this.resourceStore.data = resources;
    }

    get assignments() {
        return this.assignmentStore.records;
    }

    updateAssignments(assignments) {
        this.assignmentStore.data = assignments;
    }

    get dependencies() {
        return this.dependencyStore.records;
    }

    updateDependencies(dependencies) {
        this.dependencyStore.data = dependencies;
    }

    get timeRanges() {
        return this.timeRangeStore.records;
    }

    updateTimeRanges(timeRanges) {
        this.timeRangeStore.data = timeRanges;
    }

    get calendars() {
        return this.calendarManagerStore.records;
    }

    updateCalendars(calendars) {
        this.calendarManagerStore.data = calendars;
    }

    updateTimeRangesData(ranges) {
        this.timeRangeStore.data = ranges;
    }

    /**
     * Get or set data of project stores. The returned data is identical to what
     * {@link #function-toJSON} returns:
     *
     * ```javascript
     *
     * const data = scheduler.project.inlineData;
     *
     * // data:
     * {
     *     eventsData : [...],
     *     resourcesData : [...],
     *     dependenciesData : [...],
     *     assignmentsData : [...]
     * }
     *
     *
     * // Plug it back in later
     * scheduler.project.inlineData = data;
     * ```
     *
     * @member {Object} inlineData
     * @category Inline data
     */
    get inlineData() {
        return this.toJSON();
    }

    set inlineData(inlineData) {
        this.json = inlineData;
    }

    afterChange(toSet, wasSet) {
        super.afterChange(...arguments);

        if (wasSet.calendar) {
            this.trigger('calendarChange');
        }
    }

    refreshWbs(options) {
        const
            me = this,
            children = me.unfilteredChildren ?? me.children;

        if (children?.length) {
            // We leverage the refreshWbs() method of TaskModel (our children) to do the work. This node does not
            // have a wbsValue, so we pass -1 for the index to skip on to just our children.
            children[0].refreshWbs?.call(me, options, -1);
        }
    }
}

ProjectModel.applyConfigs = true;
