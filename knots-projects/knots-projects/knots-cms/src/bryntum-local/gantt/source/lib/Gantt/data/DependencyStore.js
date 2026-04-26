import SchedulerProDependencyStore from '../../SchedulerPro/data/DependencyStore.js';
import DependencyModel from '../model/DependencyModel.js';

/**
 * @module Gantt/data/DependencyStore
 */

/**
 * A class representing a collection of dependencies between tasks in the {@link Gantt.data.TaskStore}.
 * Contains a collection of {@link Gantt.model.DependencyModel} records.
 *
 * ```javascript
 * const dependencyStore = new DependencyStore({
 *      data : [
 *         {
 *              "id"       : 1,
 *              "fromTask" : 11,
 *              "toTask"   : 15,
 *              "lag"      : 2
 *          },
 *          {
 *              "id"       : 2,
 *              "fromTask" : 12,
 *              "toTask"   : 15
 *          }
 *      ]
 * })
 * ```
 * @extends SchedulerPro/data/DependencyStore
 * @typings SchedulerPro/data/DependencyStore -> SchedulerPro/data/SchedulerProDependencyStore
 */
export default class DependencyStore extends SchedulerProDependencyStore {
    static get defaultConfig() {
        return {
            modelClass : DependencyModel,

            /**
             * CrudManager must load stores in the correct order. Lowest first.
             * @private
             */
            loadPriority : 300,

            /**
             * CrudManager must sync stores in the correct order. Lowest first.
             * @private
             */
            syncPriority : 500
        };
    }
}
