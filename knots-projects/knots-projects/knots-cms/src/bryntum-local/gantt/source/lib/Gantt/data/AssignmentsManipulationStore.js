import AssignmentStore from '../../SchedulerPro/data/AssignmentStore.js';

/**
 * @module Gantt/data/AssignmentsManipulationStore
 */

/**
 * Special store class for _single_ task/event assignments manipulation, used by {@link Gantt/widget/AssignmentGrid}
 *
 * Contains a collection of {@link Gantt/model/AssignmentModel} records.
 *
 * @extends Scheduler/data/AssignmentStore
 * @internal
 */
export default class AssignmentsManipulationStore extends AssignmentStore {
    //region Config
    static get defaultConfig() {
        return {
            storage : {
                extraKeys : ['resource']
            },
            callOnFunctions : true,

            /**
             * Event model to manipulate assignments of, the event should be part of a project.
             *
             * @config {Gantt.model.TaskModel}
             */
            projectEvent : null,

            /**
             * Flag indicating whether assigned resources should be placed (floated) before unassigned ones.
             *
             * @config {Boolean}
             * @private
             */
            floatAssignedResources : true,

            /**
             * Flag indicating whether assigned resources should be floated live
             *
             * @config {Boolean}
             * @private
             */
            liveFloatAssignedResources : false
        };
    }

    afterConfigure() {
        const me = this;

        super.afterConfigure();

        me.addSorter({
            fn : me.defaultSort.bind(me)
        });
    }

    //endregion

    get projectEvent() {
        return this._projectEvent;
    }

    set projectEvent(projectEvent) {
        const me = this;

        // If the event is the same, but some underlying data has changed, we must still update
        if (projectEvent != me._projectEvent || (projectEvent && (projectEvent.generation !== me._projectEventGeneration))) {

            me._projectEvent = projectEvent;
            me._projectEventGeneration = projectEvent.generation;

            if (projectEvent) {


                me.fillFromMaster();

                me.sort();
            }
            else {
                me.removeAll();
            }
        }
    }

    get floatAssignedResources() {
        return this._floatAssignedResources;
    }

    set floatAssignedResources(value) {
        const me = this;

        if (value !== me.floatAssignedResources) {
            me._floatAssignedResources = value;
            me.sort();
        }
    }

    /**
     * Fills this store from master {@link Gantt/data/ResourceStore resource} store and {@link Gantt/data/AssignmentStore assignment} store.
     * @internal
     */
    fillFromMaster() {
        const
            me               = this,
            { projectEvent } = me;

        if (projectEvent) {
            const
                {
                    assignmentStore,
                    resourceStore
                }                  = projectEvent,
                resourceDataSource = assignmentStore.modelClass.getFieldDefinition('resource').dataSource,
                eventDataSource    = assignmentStore.modelClass.getFieldDefinition('event').dataSource,
                storeData          = [];

            // For each excludes group header records - ResourceStore might be grouped externally
            resourceStore.forEach(
                resource => {
                    const
                        existingAssignment = assignmentStore.getAssignmentForEventAndResource(projectEvent, resource),
                        data               = Object.assign(
                            { units : 0 },
                            existingAssignment?.data
                        );

                    delete data.id;
                    delete data.eventId;
                    delete data.resourceId;
                    // handle data mapping cases
                    delete data[resourceDataSource];
                    delete data[eventDataSource];

                    // apply resource and event after cleaning data mapping
                    Object.assign(data, { resource, event : projectEvent });

                    storeData.push(data);
                },
                this,
                {
                    includeFilteredOutRecords    : true,
                    includeCollapsedGroupRecords : true
                }
            );

            me.data = storeData;
        }
    }

    toValueString() {
        const activeAssignments = this.query(a => a.units > 0);

        return activeAssignments.join(', ');
    }

    defaultSort(lhs, rhs) {
        let result = 0;

        if (this.floatAssignedResources) {
            if (!rhs.units && lhs.units) {
                result = -1;
            }
            else if (!lhs.units && rhs.units) {
                result = 1;
            }
            else {
                result = lhs.resourceName.localeCompare(rhs.resourceName);
            }
        }
        else {
            result = lhs.resourceName.localeCompare(rhs.resourceName);
        }

        return result;
    }

    onUpdate({ changes }) {
        const me = this;

        if (!me.isConfiguring) {
            if (Object.hasOwnProperty.call(changes, 'event')) {
                if (me.floatAssignedResources && me.liveFloatAssignedResources) {
                    me.sort();
                }
            }
        }
    }
}
