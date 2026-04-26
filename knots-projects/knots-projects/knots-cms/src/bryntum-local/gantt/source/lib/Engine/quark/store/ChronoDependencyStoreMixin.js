import { Mixin } from "../../../ChronoGraph/class/BetterMixin.js";
import { ChronoPartOfProjectStoreMixin } from "./mixin/ChronoPartOfProjectStoreMixin.js";
import { AbstractDependencyStoreMixin } from "./AbstractDependencyStoreMixin.js";
/**
 * A store mixin class, that represent collection of all dependencies in the [[SchedulerBasicProjectMixin|project]].
 */
export class ChronoDependencyStoreMixin extends Mixin([AbstractDependencyStoreMixin, ChronoPartOfProjectStoreMixin], (base) => {
    const superProto = base.prototype;
    class ChronoDependencyStoreMixin extends base {
        set data(value) {
            this.allDependenciesForRemoval = true;
            super.data = value;
            this.allDependenciesForRemoval = false;
        }
    }
    return ChronoDependencyStoreMixin;
}) {
}
