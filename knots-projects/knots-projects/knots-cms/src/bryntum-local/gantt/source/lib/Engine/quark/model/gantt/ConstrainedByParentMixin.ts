import { AnyConstructor, Mixin } from '../../../../ChronoGraph/class/Mixin.js'
import { CalculationIterator } from '../../../../ChronoGraph/primitives/Calculation.js'
import { calculate } from '../../../../ChronoGraph/replica/Entity.js'
import { DateInterval } from '../../../scheduling/DateInterval.js'
import { Direction } from "../../../scheduling/Types.js"
import { BaseEventMixin } from "../scheduler_basic/BaseEventMixin.js"
import { HasChildrenMixin } from '../scheduler_basic/HasChildrenMixin.js'
import { ConstrainedEarlyEventMixin } from "../scheduler_pro/ConstrainedEarlyEventMixin.js"

//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin makes the event to "inherit" the constraints from its parent event.
 */
export class ConstrainedByParentMixin extends Mixin(
    [ BaseEventMixin, HasChildrenMixin, ConstrainedEarlyEventMixin ],
    (base : AnyConstructor<BaseEventMixin & HasChildrenMixin & ConstrainedEarlyEventMixin, typeof BaseEventMixin & typeof HasChildrenMixin & typeof ConstrainedEarlyEventMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class ConstrainedByParentMixin extends base {

        * maybeSkipNonWorkingTime (date : Date, isForward : boolean = true) : CalculationIterator<Date> {
            const childEvents : Set<HasChildrenMixin>   = yield this.$.childEvents

            // summary tasks are simply aligned by their children so they should not skip non-working time at all
            if (childEvents.size > 0) return date

            return yield* superProto.maybeSkipNonWorkingTime.call(this, date, isForward)
        }


        @calculate('startDateConstraintIntervals')
        * calculateStartDateConstraintIntervals () : CalculationIterator<this[ 'startDateConstraintIntervals' ]> {
            const intervals : DateInterval[] = yield* superProto.calculateStartDateConstraintIntervals.call(this)

            const parentEvent : HasChildrenMixin & ConstrainedByParentMixin = yield this.$.parentEvent

            if (parentEvent) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.startDateConstraintIntervals

                intervals.push.apply(intervals, parentIntervals)
            }

            return intervals
        }


        @calculate('endDateConstraintIntervals')
        * calculateEndDateConstraintIntervals () : CalculationIterator<this[ 'endDateConstraintIntervals' ]> {
            const intervals : DateInterval[] = yield* superProto.calculateEndDateConstraintIntervals.call(this)

            const parentEvent : HasChildrenMixin & ConstrainedByParentMixin = yield this.$.parentEvent

            if (parentEvent) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.endDateConstraintIntervals

                intervals.push.apply(intervals, parentIntervals)
            }

            return intervals
        }


        @calculate('earlyStartDateConstraintIntervals')
        * calculateEarlyStartDateConstraintIntervals () : CalculationIterator<this[ 'earlyStartDateConstraintIntervals' ]> {
            const intervals : DateInterval[] = yield* superProto.calculateEarlyStartDateConstraintIntervals.call(this)

            const parentEvent : HasChildrenMixin & ConstrainedByParentMixin = yield this.$.parentEvent

            if (parentEvent) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.earlyStartDateConstraintIntervals

                intervals.push.apply(intervals, parentIntervals)

                // If the parent is scheduled manually it should still restrict its children (even though it has no a constraint set)
                // so we append an artificial constraining interval
                if ((yield parentEvent.$.manuallyScheduled) && (yield this.$.direction) === Direction.Forward) {
                    intervals.push(DateInterval.new({
                        startDate   : yield parentEvent.$.startDate
                    }))
                }
            }

            return intervals
        }


        @calculate('earlyEndDateConstraintIntervals')
        * calculateEarlyEndDateConstraintIntervals () : CalculationIterator<this[ 'earlyEndDateConstraintIntervals' ]> {
            const intervals : DateInterval[] = yield* superProto.calculateEarlyEndDateConstraintIntervals.call(this)

            const parentEvent : HasChildrenMixin & ConstrainedByParentMixin = yield this.$.parentEvent

            if (parentEvent) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.earlyEndDateConstraintIntervals

                intervals.push.apply(intervals, parentIntervals)
            }

            return intervals
        }
    }

    return ConstrainedByParentMixin
}){}
