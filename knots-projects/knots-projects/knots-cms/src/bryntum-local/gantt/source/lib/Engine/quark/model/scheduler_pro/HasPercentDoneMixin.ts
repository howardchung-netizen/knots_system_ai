import { ProposedOrPrevious } from "../../../../ChronoGraph/chrono/Effect.js"
import { ChronoIterator } from "../../../../ChronoGraph/chrono/Graph.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { calculate, field } from "../../../../ChronoGraph/replica/Entity.js"
import { model_field } from "../../../chrono/ModelFieldAtom.js"
import { Duration, TimeUnit } from "../../../scheduling/Types.js"
import { HasChildrenMixin } from "../scheduler_basic/HasChildrenMixin.js"
import { SchedulerProProjectMixin } from "./SchedulerProProjectMixin.js"


type PercentDoneSummaryData = {
    totalDuration               : Duration,
    completedDuration           : Duration,
    milestonesNum               : number,
    milestonesTotalPercentDone  : number
}

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
export class HasPercentDoneMixin extends Mixin(
    [ HasChildrenMixin ],
    (base : AnyConstructor<HasChildrenMixin, typeof HasChildrenMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class HasPercentDoneMixin extends base {
        /**
         * The percent done for this event.
         */
        @model_field({ type: 'number', defaultValue: 0 })
        percentDone                 : number

        @field()
        percentDoneSummaryData      : PercentDoneSummaryData


        /**
         * Method calculates the task [[percentDone]] field value.
         * For a summary task it calculates the value based on the task children if the project
         * [[SchedulerProProjectMixin.autoCalculatePercentDoneForParentTasks|autoCalculatePercentDoneForParentTasks]] is true (default).
         * And for a regular (leaf) task it just returns the field provded value as-is.
         */
        @calculate('percentDone')
        * calculatePercentDone () : ChronoIterator<number> {
            const childEvents : Set<HasPercentDoneMixin> = yield this.$.childEvents
            const project                                = this.getProject() as SchedulerProProjectMixin

            const autoCalculatePercentDoneForParentTasks = yield project.$.autoCalculatePercentDoneForParentTasks

            if (childEvents.size && autoCalculatePercentDoneForParentTasks) {
                const summaryData : PercentDoneSummaryData = yield this.$.percentDoneSummaryData

                if (summaryData.totalDuration > 0) {
                    return summaryData.completedDuration / summaryData.totalDuration
                }
                else if (summaryData.milestonesNum > 0) {
                    return summaryData.milestonesTotalPercentDone / summaryData.milestonesNum
                } else {
                    return null
                }
            }
            else {
                return yield ProposedOrPrevious
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
        * shouldRollupChildPercentDoneSummaryData (childEvent : HasPercentDoneMixin) : ChronoIterator<boolean> {
            return true
        }


        @calculate('percentDoneSummaryData')
        * calculatePercentDoneSummaryData () : ChronoIterator<PercentDoneSummaryData> {
            const childEvents : Set<HasPercentDoneMixin> = yield this.$.childEvents

            if (childEvents.size) {
                let summary : PercentDoneSummaryData = {
                    totalDuration               : 0,
                    completedDuration           : 0,
                    milestonesNum               : 0,
                    milestonesTotalPercentDone  : 0
                }

                for (const childEvent of childEvents) {
                    if (!(yield * this.shouldRollupChildPercentDoneSummaryData(childEvent))) continue

                    const childSummaryData : PercentDoneSummaryData = yield childEvent.$.percentDoneSummaryData

                    if (childSummaryData) {
                        summary.totalDuration               += childSummaryData.totalDuration
                        summary.completedDuration           += childSummaryData.completedDuration
                        summary.milestonesNum               += childSummaryData.milestonesNum
                        summary.milestonesTotalPercentDone  += childSummaryData.milestonesTotalPercentDone
                    }
                }

                return summary
            }
            else {
                const duration : Duration = yield this.$.duration

                if (typeof duration == 'number') {

                    const durationInMs : Duration   = yield* this.getProject().$convertDuration(duration, yield this.$.durationUnit, TimeUnit.Millisecond)
                    const percentDone : number      = yield this.$.percentDone

                    return {
                        totalDuration               : durationInMs,
                        completedDuration           : durationInMs * percentDone,
                        milestonesNum               : durationInMs === 0 ? 1 : 0,
                        milestonesTotalPercentDone  : durationInMs === 0 ? percentDone : 0,
                    }

                // we can't calculate w/o duration
                } else {
                    return null
                }
            }
        }
    }

    return HasPercentDoneMixin
}){}
