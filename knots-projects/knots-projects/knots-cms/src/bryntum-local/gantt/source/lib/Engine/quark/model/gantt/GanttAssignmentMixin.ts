import { ProposedOrPrevious } from '../../../../ChronoGraph/chrono/Effect.js'
import { AnyConstructor, Mixin } from '../../../../ChronoGraph/class/BetterMixin.js'
import { CalculationIterator } from '../../../../ChronoGraph/primitives/Calculation.js'
import { calculate } from '../../../../ChronoGraph/replica/Entity.js'
import { HasEffortMixin } from "./HasEffortMixin.js"
import { SchedulerProAssignmentMixin } from '../scheduler_pro/SchedulerProAssignmentMixin.js'


/**
 * A mixin for the assignment entity at the Gantt level. It adds [[units]] field.
 */
export class GanttAssignmentMixin extends Mixin(
    [ SchedulerProAssignmentMixin ],
    (base : AnyConstructor<SchedulerProAssignmentMixin, typeof SchedulerProAssignmentMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class GanttAssignmentMixin extends base {

        event               : HasEffortMixin

        @calculate('units')
        * calculateUnits () : CalculationIterator<number> {
            const event : HasEffortMixin   = yield this.$.event

            // if event of assignment presents - we always delegate to it
            // (so that various assignment logic can be overridden by single event mixin)
            if (event) return yield* event.calculateAssignmentUnits(this)

            // otherwise use proposed or current consistent value
            return yield ProposedOrPrevious
        }
    }

    return GanttAssignmentMixin
}){}
