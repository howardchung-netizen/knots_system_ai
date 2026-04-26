import SchedulerProjectCrudManager from '../../../Scheduler/data/mixin/ProjectCrudManager.js';
import Base from '../../../Core/Base.js';

/**
 * @module SchedulerPro/data/mixin/ProjectCrudManager
 */

// the order of the @mixes tags is important below, as the "AbstractCrudManagerMixin"
// contains the abstract methods, which are then overwritten by the concrete
// implementation in the AjaxTransport and JsonEncoder

/**
 * This mixin provides Crud manager functionality to a Scheduler Pro project.
 * The mixin turns the provided project model into a Crud manager instance.
 *
 * @mixin
 * @mixes Scheduler/data/mixin/ProjectCrudManager
 * @typings Scheduler/data/mixin/ProjectCrudManager -> Scheduler/data/mixin/SchedulerProjectCrudManager
 */
export default Target => class ProjectCrudManager extends (Target || Base).mixin(SchedulerProjectCrudManager) {
    static get configurable() {
        return {
            crudLoadValidationWarningPrefix : 'Project load response error(s):',

            crudSyncValidationWarningPrefix : 'Project sync response error(s):'
        };
    }

    construct(...args) {
        const me = this;

        super.construct(...args);

        // add the Engine specific stores to the crud manager
        me.addPrioritizedStore(me.calendarManagerStore);
        me.addPrioritizedStore(me.assignmentStore);
        me.addPrioritizedStore(me.dependencyStore);
        me.addPrioritizedStore(me.resourceStore);
        me.addPrioritizedStore(me.eventStore);
        if (me.timeRangeStore) {
            me.addPrioritizedStore(me.timeRangeStore);
        }
        if (me.resourceTimeRangeStore) {
            me.addPrioritizedStore(me.resourceTimeRangeStore);
        }
    }

    get project() {
        return this;
    }

    set project(value) {
        super.project = value;
    }

    get crudLoadValidationMandatoryStores() {
        return [this.getStoreDescriptor(this.eventStore).storeId];
    }

    loadCrudManagerData(...args) {
        if (this.delayCalculation && !this.isDelayingCalculation) {
            this.scheduleDelayedCalculation();
        }

        super.loadCrudManagerData(...args);
    }

};
