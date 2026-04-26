import { Mixin } from "../../ChronoGraph/class/BetterMixin.js";
import { AbstractPartOfProjectGenericMixin } from "./AbstractPartOfProjectGenericMixin.js";
/**
 * This a base generic mixin for every class, that belongs to a chronograph powered project.
 *
 * It just provides getter/setter for the `project` property, along with some convenience methods
 * to access the project's stores.
 */
export class ChronoPartOfProjectGenericMixin extends Mixin([AbstractPartOfProjectGenericMixin], (base) => {
    const superProto = base.prototype;
    class ChronoPartOfProjectGenericMixin extends base {
        /**
         * The method to get the `ChronoGraph` instance, this entity belongs to.
         */
        getGraph() {
            const project = this.getProject();
            return project?.getGraph();
        }
        //region Entity getters
        /**
         * Convenience method to get the instance of event by its id.
         */
        getEventById(id) {
            return this.getEventStore()?.getById(id);
        }
        /**
         * Convenience method to get the instance of dependency by its id.
         */
        getDependencyById(id) {
            return this.getDependencyStore()?.getById(id);
        }
        /**
         * Convenience method to get the instance of resource by its id.
         */
        getResourceById(id) {
            return this.getResourceStore()?.getById(id);
        }
        /**
         * Convenience method to get the instance of assignment by its id.
         */
        getAssignmentById(id) {
            return this.getAssignmentStore()?.getById(id);
        }
        /**
         * Convenience method to get the instance of calendar by its id.
         */
        getCalendarById(id) {
            return this.getCalendarManagerStore()?.getById(id);
        }
    }
    return ChronoPartOfProjectGenericMixin;
}) {
}
