var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProposedOrPrevious } from "../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from "../../../../ChronoGraph/class/Mixin.js";
import { calculate, write } from "../../../../ChronoGraph/replica/Entity.js";
import { ScheduledByDependenciesLateEventMixin } from "../gantt/ScheduledByDependenciesLateEventMixin.js";
export class InactiveEventMixin extends Mixin([ScheduledByDependenciesLateEventMixin], (base) => {
    const superProto = base.prototype;
    class InactiveEventMixin extends base {
        writeInactive(me, transaction, quark, inactive) {
            const isLoading = !transaction.baseRevision.hasIdentifier(me);
            me.constructor.prototype.write.call(this, me, transaction, quark, inactive);
            // @ts-ignore
            // Apply parent inactive state to children unless we are loading data or undoing/redoing some changes
            // in such cases both parent and children data are supposed to be provided
            if (!isLoading && this.children && !this.stm?.state.isRestoringStateClass) {
                for (const child of this.children) {
                    child.inactive = inactive;
                }
            }
        }
        *calculateInactive() {
            const inactive = yield ProposedOrPrevious;
            // A summary task is active if it has at least one active sub-event
            if (yield* this.hasSubEvents()) {
                const subEvents = yield* this.subEventsIterable();
                let activeCnt = 0;
                for (const subEvent of subEvents) {
                    // calculate active sub-events count
                    if (!(yield subEvent.$.inactive))
                        activeCnt++;
                }
                // inactive if it has no active sub-events
                return !activeCnt;
            }
            return inactive;
        }
        *shouldRollupChildEffort(child) {
            return !(yield child.$.inactive) || (yield this.$.inactive);
        }
        *shouldRollupChildPercentDoneSummaryData(child) {
            return !(yield child.$.inactive) || (yield this.$.inactive);
        }
        *shouldRollupChildStartDate(child) {
            // Do not take into account inactive children dates when calculating
            // their parent start/end dates (unless the parent is also inactive)
            return !(yield child.$.inactive) || (yield this.$.inactive);
        }
        *shouldRollupChildEndDate(child) {
            // Do not take into account inactive children dates when calculating
            // their parent start/end dates (unless the parent is also inactive)
            return !(yield child.$.inactive) || (yield this.$.inactive);
        }
        *shouldRollupChildEarlyStartDate(childEvent) {
            // Do not take into account inactive children dates when calculating
            // their parent start end dates (unless the parent is also inactive)
            return !(yield childEvent.$.inactive) || (yield this.$.inactive);
        }
        *shouldRollupChildEarlyEndDate(childEvent) {
            // Do not take into account inactive children dates when calculating
            // their parent start end dates (unless the parent is also inactive)
            return !(yield childEvent.$.inactive) || (yield this.$.inactive);
        }
        *shouldRollupChildLateStartDate(childEvent) {
            // Do not take into account inactive children dates when calculating
            // their parent start end dates (unless the parent is also inactive)
            return !(yield childEvent.$.inactive) || (yield this.$.inactive);
        }
        *shouldRollupChildLateEndDate(childEvent) {
            // Do not take into account inactive children dates when calculating
            // their parent start end dates (unless the parent is also inactive)
            return !(yield childEvent.$.inactive) || (yield this.$.inactive);
        }
    }
    __decorate([
        write('inactive')
    ], InactiveEventMixin.prototype, "writeInactive", null);
    __decorate([
        calculate('inactive')
    ], InactiveEventMixin.prototype, "calculateInactive", null);
    return InactiveEventMixin;
}) {
}
