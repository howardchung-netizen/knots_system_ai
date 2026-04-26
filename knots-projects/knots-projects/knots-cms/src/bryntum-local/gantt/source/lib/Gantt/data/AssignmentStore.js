import SchedulerProAssignmentStore from '../../SchedulerPro/data/AssignmentStore.js';
import AssignmentModel from '../model/AssignmentModel.js';

/**
 * @module Gantt/data/AssignmentStore
 */

/**
 * A class representing a collection of assignments between tasks in the {@link Gantt/data/TaskStore} and resources
 * in the {@link Gantt/data/ResourceStore}.
 *
 * ```javascript
 * const assignmentStore = new AssignmentStore({
 *     data : [
 *         { "id" : 1, "event" : 11,  "resource" : 1 },
 *         { "id" : 2, "event" : 12,  "resource" : 1 },
 *     ]
 * })
 * ```
 *
 * Contains a collection of the {@link Gantt/model/AssignmentModel} records.
 *
 * @extends SchedulerPro/data/AssignmentStore
 * @typings SchedulerPro/data/AssignmentStore -> SchedulerPro/data/SchedulerProAssignmentStore
 */
export default class AssignmentStore extends SchedulerProAssignmentStore {
    static get defaultConfig() {
        return {
            modelClass : AssignmentModel,

            /**
             * CrudManager must load stores in the correct order. Lowest first.
             * @private
             */
            loadPriority : 500,

            /**
             * CrudManager must sync stores in the correct order. Lowest first.
             * @private
             */
            syncPriority : 400
        };
    }
}
