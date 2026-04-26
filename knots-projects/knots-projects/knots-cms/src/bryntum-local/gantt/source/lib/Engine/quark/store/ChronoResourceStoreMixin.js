import { Mixin } from "../../../ChronoGraph/class/BetterMixin.js";
import { BaseResourceMixin } from "../model/scheduler_basic/BaseResourceMixin.js";
import { ChronoPartOfProjectStoreMixin } from "./mixin/ChronoPartOfProjectStoreMixin.js";
import { AbstractResourceStoreMixin } from "./AbstractResourceStoreMixin.js";
/**
 * A store mixin class, that represent collection of all resources in the [[SchedulerBasicProjectMixin|project]].
 */
export class ChronoResourceStoreMixin extends Mixin([AbstractResourceStoreMixin, ChronoPartOfProjectStoreMixin], (base) => {
    const superProto = base.prototype;
    class ChronoResourceStoreMixin extends base {
        static get defaultConfig() {
            return {
                modelClass: BaseResourceMixin
            };
        }
    }
    return ChronoResourceStoreMixin;
}) {
}
