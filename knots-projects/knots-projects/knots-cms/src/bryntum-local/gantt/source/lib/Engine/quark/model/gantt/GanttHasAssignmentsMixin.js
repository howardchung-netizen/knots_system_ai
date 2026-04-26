import { HasProposedValue } from "../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { SchedulerProHasAssignmentsMixin } from "../scheduler_pro/SchedulerProHasAssignmentsMixin.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixins enhances the [[SchedulerProHasAssignmentsMixin]] with few helper methods.
 */
export class GanttHasAssignmentsMixin extends Mixin([SchedulerProHasAssignmentsMixin], (base) => {
    const superProto = base.prototype;
    class GanttHasAssignmentsMixin extends base {
        *hasProposedValueForUnits() {
            const assignments = yield this.$.assigned;
            for (const assignment of assignments) {
                const resource = yield assignment.$.resource;
                if (resource && (yield HasProposedValue(assignment.$.units)))
                    return true;
            }
            return false;
        }
    }
    return GanttHasAssignmentsMixin;
}) {
}
