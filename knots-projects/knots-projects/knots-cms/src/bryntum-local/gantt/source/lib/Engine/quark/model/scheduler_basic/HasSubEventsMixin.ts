import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { Duration } from "../../../scheduling/Types.js"
import { MAX_DATE, MIN_DATE } from "../../../util/Constants.js"
import { BaseEventMixin } from "./BaseEventMixin.js"

// this mixin can be better named `ScheduledBySubEvents`
// it can also be defined as "HasChildrenOnly" - ie has child events, but does not have parent (not part of the tree structure)
// then the `HasChildrenMixin` would be `HasParent`

/**
 * This mixin provides the notion of "sub events" for the [[BaseEventMixin]], which is a bit more general concept
 * of the "child" events. This special notion is required, because the event store can be a flat store, not providing
 * any tree structuring. In the same time, we treat the project instance as a "parent" event for all events in the flat
 * event store - so it accumulates the same aggregation information as other "regular" parent events.
 *
 * The event with this mixin is scheduled according to the "sub events" information - it starts at the earliest date
 * among all sub events and ends at the latest. If there's no "sub events" - it delegates to previous behaviour.
 *
 * Scheduling by children can be disabled by setting [[manuallyScheduled]] flag to `true` which will
 * result [[startDate]] and [[endDate]] fields will keep their provided values.
 */
export class HasSubEventsMixin extends Mixin(
    [ BaseEventMixin ],
    (base : AnyConstructor<BaseEventMixin, typeof BaseEventMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class HasSubEventsMixin extends base {

        /**
         * The abstract method which should indicate whether this event has sub events
         */
        * hasSubEvents () : CalculationIterator<boolean> {
            throw new Error("Abstract method `hasSubEvents` has been called")
        }


        /**
         * The abstract method which should return an Iterable of [[BaseEventMixin]]
         */
        * subEventsIterable () : CalculationIterator<Iterable<BaseEventMixin>> {
            throw new Error("Abstract method `subEventsIterable` has been called")
        }


        * calculateStartDatePure () : CalculationIterator<Date> {
            const manuallyScheduled : boolean   = yield this.$.manuallyScheduled
            const hasSubEvents : boolean        = yield* this.hasSubEvents()

            if (!manuallyScheduled && hasSubEvents) {
                return yield* this.calculateMinChildrenStartDate()
            } else {
                return yield* superProto.calculateStartDatePure.call(this)
            }
        }


        * calculateEndDatePure () : CalculationIterator<Date> {
            const manuallyScheduled : boolean   = yield this.$.manuallyScheduled
            const hasSubEvents : boolean   = yield* this.hasSubEvents()

            if (!manuallyScheduled && hasSubEvents) {
                return yield* this.calculateMaxChildrenEndDate()
            } else {
                return yield* superProto.calculateEndDatePure.call(this)
            }
        }


        * calculateStartDateProposed () : CalculationIterator<Date> {
            const manuallyScheduled : boolean   = yield this.$.manuallyScheduled
            const hasSubEvents : boolean   = yield* this.hasSubEvents()

            if (!manuallyScheduled && hasSubEvents) {
                return yield* this.calculateStartDatePure()
            } else {
                return yield* superProto.calculateStartDateProposed.call(this)
            }
        }


        * calculateEndDateProposed () : CalculationIterator<Date> {
            const manuallyScheduled : boolean   = yield this.$.manuallyScheduled
            const hasSubEvents : boolean   = yield* this.hasSubEvents()

            if (!manuallyScheduled && hasSubEvents) {
                return yield* this.calculateEndDatePure()
            } else {
                return yield* superProto.calculateEndDateProposed.call(this)
            }
        }


        * calculateDurationProposed () : CalculationIterator<Duration> {
            const manuallyScheduled : boolean   = yield this.$.manuallyScheduled
            const hasSubEvents : boolean   = yield* this.hasSubEvents()

            if (!manuallyScheduled && hasSubEvents) {
                return yield* this.calculateDurationPure()
            } else {
                return yield* superProto.calculateDurationProposed.call(this)
            }
        }

        /**
         * The method defines wether the provided child event should be
         * taken into account when calculating this summary event [[startDate]].
         * Child events roll up their [[startDate]] values to their summary tasks.
         * So a summary task [[startDate|start]] date gets equal to
         * its minimal child [[startDate|start]].
         *
         * If the method returns `true` the child event is taken into account
         * and if the method returns `false` it's not.
         * By default the method returns `true` to include all child events data.
         * @param childEvent Child event to consider.
         * @returns `true` if the provided event should be taken into account, `false` if not.
         */
        * shouldRollupChildStartDate (child : BaseEventMixin) : CalculationIterator<boolean> {
            return true
        }


        /**
         * Calculates the minimal sub-events [[startDate]].
         * The method is used for calculating the event [[startDate]].
         */
        * calculateMinChildrenStartDate () : CalculationIterator<Date> {
            const children : Iterable<BaseEventMixin>       = yield* this.subEventsIterable()

            let timestamp                                   = MAX_DATE.getTime()

            for (const child of children) {
                if (yield* this.shouldRollupChildStartDate(child)) {

                    let date        = yield child.$.startDate

                    // if the child has endDate only - use that value
                    if (!date) {
                        date        = yield child.$.endDate
                    }

                    if (date && date.getTime() < timestamp) {
                        timestamp   = date.getTime()
                    }
                }
            }

            if (timestamp === MIN_DATE.getTime() || timestamp === MAX_DATE.getTime()) return null

            return new Date(timestamp)
        }


        /**
         * The method defines wether the provided child event should be
         * taken into account when calculating this summary event [[endDate]].
         * Child events roll up their [[endDate]] values to their summary tasks.
         * So a summary task [[endDate|end]] gets equal to its maximal child [[endDate|end]].
         *
         * If the method returns `true` the child event is taken into account
         * and if the method returns `false` it's not.
         * By default the method returns `true` to include all child events data.
         * @param childEvent Child event to consider.
         * @returns `true` if the provided event should be taken into account, `false` if not.
         */
        * shouldRollupChildEndDate (child : BaseEventMixin) : CalculationIterator<boolean> {
            return true
        }


        /**
         * Calculates the maximum sub-events [[endDate]].
         * The method is used for calculating the event [[endDate]].
         */
        * calculateMaxChildrenEndDate () : CalculationIterator<Date> {
            const children : Iterable<BaseEventMixin>       = yield* this.subEventsIterable()

            let timestamp                                   = MIN_DATE.getTime()

            for (const child of children) {
                if (yield* this.shouldRollupChildEndDate(child)) {
                    let date        = yield child.$.endDate

                    if (!date) {
                        date        = yield child.$.startDate
                    }

                    if (date && date.getTime() > timestamp) {
                        timestamp   = date.getTime()
                    }
                }
            }

            if (timestamp === MIN_DATE.getTime() || timestamp === MAX_DATE.getTime()) return null

            return new Date(timestamp)
        }
    }

    return HasSubEventsMixin
}){}
