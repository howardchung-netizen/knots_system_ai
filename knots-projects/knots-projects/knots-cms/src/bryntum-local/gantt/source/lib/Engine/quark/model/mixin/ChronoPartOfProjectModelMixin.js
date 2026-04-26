import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { ChronoModelMixin } from "../../../chrono/ChronoModelMixin.js";
import { ChronoPartOfProjectGenericMixin } from "../../ChronoPartOfProjectGenericMixin.js";
import { ChronoPartOfProjectStoreMixin } from "../../store/mixin/ChronoPartOfProjectStoreMixin.js";
import { AbstractPartOfProjectModelMixin } from "./AbstractPartOfProjectModelMixin.js";
import { isInstanceOf } from '../../../../ChronoGraph/class/Mixin.js';
/**
 * This a base mixin for every Model that belongs to a ChronoGraph powered project.
 *
 * The model with this mixin, supposes that it will be "joining" a store that is already part of a project,
 * so that such model can take a reference to the project from it.
 *
 * It provides 2 template methods [[joinProject]] and [[leaveProject]], which can be overridden in other mixins
 * (they should always call `super` implementation, because it adds/remove the model to/from the ChronoGraph instance)
 */
export class ChronoPartOfProjectModelMixin extends Mixin([
    AbstractPartOfProjectModelMixin,
    ChronoPartOfProjectGenericMixin,
    ChronoModelMixin
], (base) => {
    const superProto = base.prototype;
    class ChronoPartOfProjectModelMixin extends base {
        /**
         * Template method, which is called when model is joining the project (through joining some store that
         * has already joined the project)
         */
        joinProject() {
            if (!this.project?.delayEnteringReplica) {
                if (this.graph && this.graph != this.getGraph()) {
                    this.graph = null;
                }
                this.getGraph().addEntity(this);
            }
        }
        /**
         * Template method, which is called when model is leaving the project (through leaving some store usually)
         */
        leaveProject(isReplacing = false) {
            superProto.leaveProject.call(this, isReplacing);
            const replica = this.getGraph();
            // Because of delayCalculation it might not have joined the graph at all
            replica?.removeEntity(this);
            // @ts-ignore
            this.graph = null;
        }
        /**
         * Returns a [[SchedulerBasicProjectMixin|project]] instance
         */
        getProject() {
            return superProto.getProject.call(this);
        }
        calculateProject() {
            const store = this.stores.find(s => (isInstanceOf(s, ChronoPartOfProjectStoreMixin)) && !!s.getProject());
            return store?.getProject();
        }
        // Report that there is no graph when delaying calculations, to not let anything enter it on reloads
        get graph() {
            return this.project?.delayEnteringReplica ? null : this._graph;
        }
        set graph(graph) {
            this._graph = graph;
        }
    }
    return ChronoPartOfProjectModelMixin;
}) {
}
