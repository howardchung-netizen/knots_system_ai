import Base from '../../../Core/Base.js';
import ProjectConsumer from '../../../Scheduler/data/mixin/ProjectConsumer.js';
import ProjectModel from '../../model/ProjectModel.js';
import DateHelper from '../../../Core/helper/DateHelper.js';

/**
 * @module Gantt/view/mixin/GanttStores
 */

/**
 * Functions for store assignment and store event listeners.
 * Properties are aliases to corresponding
 * ones of Gantt's {@link Gantt.model.ProjectModel project} instance.
 *
 * @mixin
 */
export default Target => class GanttStores extends ProjectConsumer(Target || Base) {
    static get $name() {
        return 'GanttStores';
    }

    // This is the static definition of the Stores we consume from the project, and
    // which we must provide *TO* the project if we or our CrudManager is configured
    // with them.
    // The property name is the store name, and within that there is the dataname which
    // is the property which provides static data definition. And there is a listeners
    // definition which specifies the listeners *on this object* for each store.
    //
    // To process incoming stores, implement an updateXxxxxStore method such
    // as `updateEventStore(eventStore)`.
    //
    // To process an incoming Project implement `updateProject`. __Note that
    // `super.updateProject(...arguments)` must be called first.__
    static get projectStores() {
        return {
            calendarManagerStore : {},

            resourceStore : {
                dataName : 'resources'
            },

            eventStore : {
                dataName : 'events'
            },

            dependencyStore : {
                dataName : 'dependencies'
            },

            assignmentStore : {
                dataName : 'assignments'
            }
        };
    }

    static get configurable() {
        return {
            // Overridden. ProjectConsumer defaults to Scheduler's ProjectModel
            projectModelClass : ProjectModel,

            /**
             * Inline tasks, will be loaded into an internally created TaskStore.
             * @config {Gantt.model.TaskModel[]|Object[]}
             * @category Data
             */
            tasks : null,

            /**
             * The {@link Gantt.data.TaskStore} holding the tasks to be rendered into the Gantt.
             * @config {Gantt.data.TaskStore}
             * @category Data
             */
            taskStore : null
        };
    }

    updateProject(project, oldProject) {
        super.updateProject(project, oldProject);

        this.detachListeners('ganttStores');

        this.bindCrudManager(project);

        if (project) {
            project.on({
                name               : 'ganttStores',
                startApplyResponse : 'onProjectStartApplyResponse',
                refresh            : 'internalOnProjectRefresh',
                thisObj            : this
            });
        }
    }

    get replica() {
        return this.project.replica;
    }

    onProjectStartApplyResponse() {
        if (!this.isPainted) {
            return;
        }
        this.suspendRefresh();
        this.$suspendedByResponse = true;
    }

    internalOnProjectRefresh({ isInitialCommit, isCalculated }) {
        const
            me          = this,
            { project } = me;

        if (!me.isPainted) {
            return;
        }

        if (!me.appliedViewStartDate && !('startDate' in me.initialConfig) && project.startDate) {
            const
                requestedVisibleDate   = me.visibleDate?.date || me.visibleDate,
                { startDate, endDate } = project,
                min                    = requestedVisibleDate ? DateHelper.min(startDate, requestedVisibleDate) : startDate,
                max                    = requestedVisibleDate ? DateHelper.max(endDate, requestedVisibleDate) : endDate;

            // if managed to calculated start/end dates
            if (min && max) {
                me.setTimeSpan(min, max, {
                    visibleDate : me.visibleDate
                });
                me.appliedViewStartDate = true;
            }
        }

        if (!me.suspendRendering) {
            if (me.$suspendedByResponse) {
                me.resumeRefresh(true);
                me.$suspendedByResponse = false;
            }
            // Transition all refreshes except the initial one or any used for early rendering
            else if (!isInitialCommit && isCalculated) {
                me.refreshWithTransition();
            }
            // No transition on initial refresh, nothing to transition and don't want to delay dependency drawing more
            // than necessary
            else {
                me.refresh();
            }

            me.trigger('projectRefresh', { isInitialCommit, isCalculated });
        }
    }

    //endregion

    //region Inline data

    //region Store & model docs

    // Configs

    /**
     * Inline resources, will be loaded into the backing project's ResourceStore.
     * @config {Gantt.model.ResourceModel[]|Object[]} resources
     * @category Data
     */

    /**
     * Inline assignments, will be loaded into the backing project's AssignmentStore.
     * @config {Gantt.model.AssignmentModel[]|Object[]} assignments
     * @category Data
     */

    /**
     * Inline dependencies, will be loaded into the backing project's DependencyStore.
     * @config {Gantt.model.DependencyModel[]|Object[]} dependencies
     * @category Data
     */

    /**
     * Inline time ranges, will be loaded into the backing project's time range store.
     * @config {Scheduler.model.TimeSpan[]|Object[]} timeRanges
     * @category Data
     */

    /**
     * Inline calendars, will be loaded into the backing project's CalendarManagerStore.
     * @config {Gantt.model.CalendarModel[]|Object[]} calendars
     * @category Data
     */

    // Properties

    /**
     * Get/set resources, applies to the backing project's ResourceStore.
     * @member {Gantt.model.ResourceModel[]} resources
     * @accepts {Gantt.model.ResourceModel[]|Object[]}
     * @category Data
     */

    /**
     * Get/set assignments, applies to the backing project's AssignmentStore.
     * @member {Gantt.model.AssignmentModel[]} assignments
     * @accepts {Gantt.model.AssignmentModel[]|Object[]}
     * @category Data
     */

    /**
     * Get/set dependencies, applies to the backing projects DependencyStore.
     * @member {Gantt.model.DependencyModel[]} dependencies
     * @accepts {Gantt.model.DependencyModel[]|Object[]}
     * @category Data
     */

    /**
     * Get/set time ranges, applies to the backing project's TimeRangeStore.
     * @member {Scheduler.model.TimeSpan[]} timeRanges
     * @accepts {Scheduler.model.TimeSpan[]|Object[]}
     * @category Data
     */

    /**
     * Get/set calendars, applies to the backing projects CalendarManagerStore.
     * @member {Gantt.model.CalendarModel[]} calendars
     * @accepts {Gantt.model.CalendarModel[]|Object[]}
     * @category Data
     */

    //endregion

    get timeRanges() {
        return this.project.timeRanges;
    }

    set timeRanges(timeRanges) {
        this.project.timeRanges = timeRanges;
    }

    get calendars() {
        return this.project.calendars;
    }

    set calendars(calendars) {
        this.project.calendars = calendars;
    }

    //endregion

    //region TaskStore

    /**
     * Get/set tasks, applies to the backing project's EventStore.
     * @property {Gantt.model.TaskModel[]|Object[]}
     * @category Data
     */
    get tasks() {
        return this.project.eventStore.records;
    }

    changeTasks(tasks) {
        const { project } = this;

        if (this.buildingProjectConfig) {
            // Set the property in the project config object.
            project.eventsData = tasks;
        }
        else {
            // Live update the project when in use.
            project.eventStore.data = tasks;
        }
    }

    /**
     * Get/set the task store instance of the backing project.
     * @member {Gantt.data.TaskStore} taskStore
     * @category Data
     */
    changeTaskStore(taskStore) {
        const { project } = this;

        if (this.buildingProjectConfig) {
            // Set the property in the project config object.
            // Must not go through the updater. It's too early to
            // inform host of store change.
            project.eventStore = taskStore;
            return;
        }

        // Live update the project when in use.
        if (!this.initializingProject) {
            if (project.eventStore !== taskStore) {
                project.setEventStore(taskStore);
                taskStore = project.eventStore;
            }
        }
        return taskStore;
    }

    updateEventStore(eventStore) {
        const me = this;

        eventStore.metaMapId = me.id;

        // taskStore is used for rows (store) and tasks
        me.taskStore = me.store = me.timeAxisViewModel.store = eventStore;

        me.currentOrientation.bindTaskStore(eventStore);

        // Occasionally we need to track batched changes.
        // TaskResize requires this as it changes the endDate with task batched.
        eventStore.detachListeners('eventStoreBatchedUpdateListener');
        eventStore.on({
            name          : 'eventStoreBatchedUpdateListener',
            batchedUpdate : 'onEventStoreBatchedUpdate',
            thisObj       : me
        });
    }

    /**
     * Listener to the batchedUpdate event which fires when a field is changed on a record which
     * is batch updating. Occasionally UIs must keep in sync with batched changes.
     * For example, the TaskResize feature performs batched updating of the startDate/endDate
     * and it tells its client to listen to batchedUpdate.
     * @private
     */
    onEventStoreBatchedUpdate(event) {
        if (this.listenToBatchedUpdates) {
            const wasEnabled = this.enableEventAnimations;

            // This pathway is used from TaskResize during dragging, so we do not
            // want the size animating. It should follow the pointer in real time.
            this.enableEventAnimations = false;
            this.onStoreUpdateRecord(event);
            this.enableEventAnimations = wasEnabled;
        }
    }

    //endregion

    //region Internal

    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {}

    //endregion
};
