import { ProposedOrPrevious } from "../../../../ChronoGraph/chrono/Effect.js"
import { Identifier } from "../../../../ChronoGraph/chrono/Identifier.js"
import { Quark } from "../../../../ChronoGraph/chrono/Quark.js"
import { Transaction } from "../../../../ChronoGraph/chrono/Transaction.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/Mixin.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { calculate, write } from "../../../../ChronoGraph/replica/Entity.js"
import { ScheduledByDependenciesLateEventMixin } from "../gantt/ScheduledByDependenciesLateEventMixin.js"


export class InactiveEventMixin extends Mixin(
    [ ScheduledByDependenciesLateEventMixin ],
    (base : AnyConstructor<ScheduledByDependenciesLateEventMixin, typeof ScheduledByDependenciesLateEventMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype

    class InactiveEventMixin extends base {

        @write('inactive')
        writeInactive (me : Identifier, transaction : Transaction, quark : Quark, inactive : boolean) {
            const isLoading         = !transaction.baseRevision.hasIdentifier(me)

            me.constructor.prototype.write.call(this, me, transaction, quark, inactive)

            // @ts-ignore
            // Apply parent inactive state to children unless we are loading data or undoing/redoing some changes
            // in such cases both parent and children data are supposed to be provided
            if (!isLoading && this.children && !this.stm?.state.isRestoringStateClass) {
                for (const child of this.children) {
                    child.inactive  = inactive
                }
            }
        }


        @calculate('inactive')
        * calculateInactive () : CalculationIterator<Boolean> {
            const inactive : boolean    = yield ProposedOrPrevious

            // A summary task is active if it has at least one active sub-event
            if (yield* this.hasSubEvents()) {

                const subEvents : Iterable<InactiveEventMixin>  = yield* this.subEventsIterable() as Iterable<InactiveEventMixin>

                let activeCnt = 0

                for (const subEvent of subEvents) {
                    // calculate active sub-events count
                    if (!(yield subEvent.$.inactive)) activeCnt++
                }

                // inactive if it has no active sub-events
                return !activeCnt
            }

            return inactive
        }


        * shouldRollupChildEffort (child : InactiveEventMixin) : CalculationIterator<boolean> {
            return !(yield child.$.inactive) || (yield this.$.inactive)
        }


        * shouldRollupChildPercentDoneSummaryData (child : InactiveEventMixin) : CalculationIterator<boolean> {
            return !(yield child.$.inactive) || (yield this.$.inactive)
        }


        * shouldRollupChildStartDate (child : InactiveEventMixin) : CalculationIterator<boolean> {
            // Do not take into account inactive children dates when calculating
            // their parent start/end dates (unless the parent is also inactive)
            return !(yield child.$.inactive) || (yield this.$.inactive)
        }


        * shouldRollupChildEndDate (child : InactiveEventMixin) : CalculationIterator<boolean> {
            // Do not take into account inactive children dates when calculating
            // their parent start/end dates (unless the parent is also inactive)
            return !(yield child.$.inactive) || (yield this.$.inactive)
        }


        * shouldRollupChildEarlyStartDate (childEvent : InactiveEventMixin) : CalculationIterator<boolean> {
            // Do not take into account inactive children dates when calculating
            // their parent start end dates (unless the parent is also inactive)
            return !(yield childEvent.$.inactive) || (yield this.$.inactive)
        }


        * shouldRollupChildEarlyEndDate (childEvent : InactiveEventMixin) : CalculationIterator<boolean> {
            // Do not take into account inactive children dates when calculating
            // their parent start end dates (unless the parent is also inactive)
            return !(yield childEvent.$.inactive) || (yield this.$.inactive)
        }


        * shouldRollupChildLateStartDate(childEvent : InactiveEventMixin) : CalculationIterator<boolean> {
            // Do not take into account inactive children dates when calculating
            // their parent start end dates (unless the parent is also inactive)
            return !(yield childEvent.$.inactive) || (yield this.$.inactive)
        }


        * shouldRollupChildLateEndDate(childEvent : InactiveEventMixin) : CalculationIterator<boolean> {
            // Do not take into account inactive children dates when calculating
            // their parent start end dates (unless the parent is also inactive)
            return !(yield childEvent.$.inactive) || (yield this.$.inactive)
        }


    }

    return InactiveEventMixin
}){}
