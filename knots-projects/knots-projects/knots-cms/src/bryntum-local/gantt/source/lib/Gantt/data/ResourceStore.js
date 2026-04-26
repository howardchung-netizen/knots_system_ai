import SchedulerProResourceStore from '../../SchedulerPro/data/ResourceStore.js';
import ResourceModel from '../model/ResourceModel.js';

/**
 * @module Gantt/data/ResourceStore
 */

/**
 * A class representing the collection of the resources - {@link Gantt.model.ResourceModel} records.
 *
 * ```javascript
 * const resourceStore = new ResourceStore({
 *      data : [
 *          { "id" : 1, "name" : "John Doe" },
 *          { "id" : 2, "name" : "Jane Doe" }
 *      ]
 * })
 * ```
 * @extends SchedulerPro/data/ResourceStore
 * @typings SchedulerPro/data/ResourceStore -> SchedulerPro/data/SchedulerProResourceStore
 */
export default class ResourceStore extends SchedulerProResourceStore {
    static get defaultConfig() {
        return {
            modelClass : ResourceModel,

            /**
             * CrudManager must load stores in the correct order. Lowest first.
             * @private
             */
            loadPriority : 400,

            /**
             * CrudManager must sync stores in the correct order. Lowest first.
             * @private
             */
            syncPriority : 200
        };
    }
}
