var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProposedOrPrevious } from "../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { calculate, field } from "../../../../ChronoGraph/replica/Entity.js";
import { model_field } from "../../../chrono/ModelFieldAtom.js";
import { TimeUnit } from "../../../scheduling/Types.js";
import { HasChildrenMixin } from "../scheduler_basic/HasChildrenMixin.js";
/* TODO
The percentdone logic calculation is a bit different from the Ext version, in regard of milestones
In Ext, the parent task with milestones only has 100% if all its child milestones have 100%, and 0% otherwise
In engine, the % for milestones is calculated just as average. There are other small nuances too.
Personally I think engine's behavior is more logical and we can change it to Ext version behavior
because we have all data.
*/
/**
 * This mixin provides [[percentDone]] field for the event and methods for its calculation.
 *
 * For the parent events percent done is calculated based on the child events (ignores user input).
 * This behavior is controlled with the [[SchedulerProProjectMixin.autoCalculatePercentDoneForParentTasks]] config option.
 * The calculation is implemented in [[calculatePercentDone]] method.
 */
export class HasPercentDoneMixin extends Mixin([HasChildrenMixin], (base) => {
    const superProto = base.prototype;
    class HasPercentDoneMixin extends base {
        /**
         * Method calculates the task [[percentDone]] field value.
         * For a summary task it calculates the value based on the task children if the project
         * [[SchedulerProProjectMixin.autoCalculatePercentDoneForParentTasks|autoCalculatePercentDoneForParentTasks]] is true (default).
         * And for a regular (leaf) task it just returns the field provded value as-is.
         */
        *calculatePercentDone() {
            const childEvents = yield this.$.childEvents;
            const project = this.getProject();
            const autoCalculatePercentDoneForParentTasks = yield project.$.autoCalculatePercentDoneForParentTasks;
            if (childEvents.size && autoCalculatePercentDoneForParentTasks) {
                const summaryData = yield this.$.percentDoneSummaryData;
                if (summaryData.totalDuration > 0) {
                    return summaryData.completedDuration / summaryData.totalDuration;
                }
                else if (summaryData.milestonesNum > 0) {
                    return summaryData.milestonesTotalPercentDone / summaryData.milestonesNum;
                }
                else {
                    return null;
                }
            }
            else {
                return yield ProposedOrPrevious;
            }
        }
        /**
         * The method defines wether the provided child event should be
         * taken into account when calculating this summary event [[percentDone]].
         *
         * If the method returns `true` the child event is taken into account
         * and if the method returns `false` it's not.
         * By default the method returns `true` to include all child events data.
         * @param childEvent Child event to consider.
         * @returns `true` if the provided event should be taken into account, `false` if not.
         */
        *shouldRollupChildPercentDoneSummaryData(childEvent) {
            return true;
        }
        *calculatePercentDoneSummaryData() {
            const childEvents = yield this.$.childEvents;
            if (childEvents.size) {
                let summary = {
                    totalDuration: 0,
                    completedDuration: 0,
                    milestonesNum: 0,
                    milestonesTotalPercentDone: 0
                };
                for (const childEvent of childEvents) {
                    if (!(yield* this.shouldRollupChildPercentDoneSummaryData(childEvent)))
                        continue;
                    const childSummaryData = yield childEvent.$.percentDoneSummaryData;
                    if (childSummaryData) {
                        summary.totalDuration += childSummaryData.totalDuration;
                        summary.completedDuration += childSummaryData.completedDuration;
                        summary.milestonesNum += childSummaryData.milestonesNum;
                        summary.milestonesTotalPercentDone += childSummaryData.milestonesTotalPercentDone;
                    }
                }
                return summary;
            }
            else {
                const duration = yield this.$.duration;
                if (typeof duration == 'number') {
                    const durationInMs = yield* this.getProject().$convertDuration(duration, yield this.$.durationUnit, TimeUnit.Millisecond);
                    const percentDone = yield this.$.percentDone;
                    return {
                        totalDuration: durationInMs,
                        completedDuration: durationInMs * percentDone,
                        milestonesNum: durationInMs === 0 ? 1 : 0,
                        milestonesTotalPercentDone: durationInMs === 0 ? percentDone : 0,
                    };
                    // we can't calculate w/o duration
                }
                else {
                    return null;
                }
            }
        }
    }
    __decorate([
        model_field({ type: 'number', defaultValue: 0 })
    ], HasPercentDoneMixin.prototype, "percentDone", void 0);
    __decorate([
        field()
    ], HasPercentDoneMixin.prototype, "percentDoneSummaryData", void 0);
    __decorate([
        calculate('percentDone')
    ], HasPercentDoneMixin.prototype, "calculatePercentDone", null);
    __decorate([
        calculate('percentDoneSummaryData')
    ], HasPercentDoneMixin.prototype, "calculatePercentDoneSummaryData", null);
    return HasPercentDoneMixin;
}) {
}
