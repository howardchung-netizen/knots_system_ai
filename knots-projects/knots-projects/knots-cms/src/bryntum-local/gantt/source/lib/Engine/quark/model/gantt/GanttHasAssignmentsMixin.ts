import { HasProposedValue } from "../../../../ChronoGraph/chrono/Effect.js"
import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { BaseResourceMixin } from "../scheduler_basic/BaseResourceMixin.js"
import { SchedulerProHasAssignmentsMixin } from "../scheduler_pro/SchedulerProHasAssignmentsMixin.js"
import { SchedulerProProjectMixin } from "../scheduler_pro/SchedulerProProjectMixin.js"
import { GanttAssignmentMixin } from "./GanttAssignmentMixin.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixins enhances the [[SchedulerProHasAssignmentsMixin]] with few helper methods.
 */
export class GanttHasAssignmentsMixin extends Mixin(
    [ SchedulerProHasAssignmentsMixin ],
    (base : AnyConstructor<SchedulerProHasAssignmentsMixin, typeof SchedulerProHasAssignmentsMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class GanttHasAssignmentsMixin extends base {

        // w/o this `Omit` incremental compilation report false compilation error
        project                             : Omit<SchedulerProProjectMixin, 'assignmentModelClass'> & { assignmentModelClass : typeof GanttAssignmentMixin }

        * hasProposedValueForUnits () : CalculationIterator<boolean> {
            const assignments : Set<GanttAssignmentMixin>      = yield this.$.assigned

            for (const assignment of assignments) {
                const resource : BaseResourceMixin              = yield assignment.$.resource

                if (resource && (yield HasProposedValue(assignment.$.units))) return true
            }

            return false
        }
    }

    return GanttHasAssignmentsMixin
}){}

