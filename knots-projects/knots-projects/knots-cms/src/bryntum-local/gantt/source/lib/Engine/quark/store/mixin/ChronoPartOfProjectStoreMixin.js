import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { ChronoPartOfProjectGenericMixin } from "../../ChronoPartOfProjectGenericMixin.js";
import { ChronoStoreMixin } from "./ChronoStoreMixin.js";
import { AbstractPartOfProjectStoreMixin } from "./AbstractPartOfProjectStoreMixin.js";
/**
 * This a base mixin for every Store, that belongs to a ChronoGraph powered project.
 */
export class ChronoPartOfProjectStoreMixin extends Mixin([
    AbstractPartOfProjectStoreMixin,
    ChronoPartOfProjectGenericMixin,
    ChronoStoreMixin
], (base) => {
    const superProto = base.prototype;
    class ChronoPartOfProjectStoreMixin extends base {
        setStoreData(data) {
            // Inform project that a store is being repopulated, to avoid expensive unjoins
            this.project?.repopulateStore(this);
            superProto.setStoreData.call(this, data);
        }
        register(record) {
            superProto.register.call(this, record);
            // NOTE: Remove check for `this.project.graph` if we want records added after the initial calculations to also have
            //       delayed entry into the replica
            // @ts-ignore
            !record.isRoot && !this.project?.graph && this.project?.scheduleDelayedCalculation();
        }
    }
    return ChronoPartOfProjectStoreMixin;
}) {
}
