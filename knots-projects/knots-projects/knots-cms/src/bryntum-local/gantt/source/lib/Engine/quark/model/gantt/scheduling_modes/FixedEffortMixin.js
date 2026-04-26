import { HasProposedValue } from "../../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from "../../../../../ChronoGraph/class/BetterMixin.js";
import { Direction, SchedulingMode } from "../../../../scheduling/Types.js";
import { EffortVar, UnitsVar } from "../HasEffortDispatcher.js";
import { HasSchedulingModeMixin } from "../HasSchedulingModeMixin.js";
import { fixedEffortSEDWUBackward, fixedEffortSEDWUForward } from "./FixedEffortDispatcher.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin provides the fixed effort scheduling mode facility. The scheduling mode is controlled with the
 * [[HasSchedulingModeMixin.schedulingMode]] field.
 *
 * See [[HasSchedulingModeMixin]] for more details.
 *
 * In this mode, the effort of the task remains "fixed" as the name suggest. It is changed only if there's no other options,
 * for example if both "duration" and "units" has changed. In other cases, some other variable is updated.
 */
export class FixedEffortMixin extends Mixin([HasSchedulingModeMixin], (base) => {
    const superProto = base.prototype;
    class FixedEffortMixin extends base {
        *prepareDispatcher(YIELD) {
            const schedulingMode = yield* this.effectiveSchedulingMode();
            if (schedulingMode === SchedulingMode.FixedEffort) {
                const cycleDispatcher = yield* superProto.prepareDispatcher.call(this, YIELD);
                if (yield HasProposedValue(this.$.assigned))
                    cycleDispatcher.addProposedValueFlag(UnitsVar);
                cycleDispatcher.addKeepIfPossibleFlag(EffortVar);
                return cycleDispatcher;
            }
            else {
                return yield* superProto.prepareDispatcher.call(this, YIELD);
            }
        }
        cycleResolutionContext(Y) {
            const schedulingMode = this.effectiveSchedulingModeSync(Y);
            if (schedulingMode === SchedulingMode.FixedEffort) {
                const direction = Y(this.$.direction);
                return direction === Direction.Forward || direction === Direction.None ? fixedEffortSEDWUForward : fixedEffortSEDWUBackward;
            }
            else {
                return superProto.cycleResolutionContext.call(this, Y);
            }
        }
    }
    return FixedEffortMixin;
}) {
}
