import { HasProposedValue } from "../../../../../ChronoGraph/chrono/Effect.js"
import { SyncEffectHandler } from "../../../../../ChronoGraph/chrono/Transaction.js"
import { AnyConstructor, Mixin } from "../../../../../ChronoGraph/class/BetterMixin.js"
import { CycleResolution } from "../../../../../ChronoGraph/cycle_resolver/CycleResolver.js"
import { CalculationIterator } from "../../../../../ChronoGraph/primitives/Calculation.js"
import { Direction, SchedulingMode } from "../../../../scheduling/Types.js"
import { SEDDispatcher } from "../../scheduler_basic/BaseEventDispatcher.js"
import { EffortVar, UnitsVar } from "../HasEffortDispatcher.js"
import { HasSchedulingModeMixin } from "../HasSchedulingModeMixin.js"
import {
    fixedUnitsSEDWUBackwardEffortDriven,
    fixedUnitsSEDWUBackwardNonEffortDriven,
    fixedUnitsSEDWUForwardEffortDriven,
    fixedUnitsSEDWUForwardNonEffortDriven
} from "./FixedUnitsDispatcher.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin provides the fixed units scheduling mode facility. The scheduling mode is controlled with the
 * [[HasSchedulingModeMixin.schedulingMode]] field.
 *
 * See [[HasSchedulingModeMixin]] for more details.
 *
 * In this mode, the assignment units of the task's assignments remains "fixed" as the name suggest.
 * Those are changed only if there's no other options, for example if both "duration" and "effort" has changed.
 *
 * If the [[HasSchedulingModeMixin.effortDriven]] flag is enabled, effort variable becomes "fixed" as well, so normally the "duration"
 * variable will change. If that flag is disabled, then "effort" will be changed.
 */
export class FixedUnitsMixin extends Mixin(
    [ HasSchedulingModeMixin ],
    (base : AnyConstructor<HasSchedulingModeMixin, typeof HasSchedulingModeMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class FixedUnitsMixin extends base {

        * prepareDispatcher (YIELD : SyncEffectHandler) : CalculationIterator<SEDDispatcher> {
            const schedulingMode    = yield* this.effectiveSchedulingMode()

            if (schedulingMode === SchedulingMode.FixedUnits) {
                const cycleDispatcher               = yield* superProto.prepareDispatcher.call(this, YIELD)

                if (yield HasProposedValue(this.$.assigned)) cycleDispatcher.addProposedValueFlag(UnitsVar)

                if (yield this.$.effortDriven) cycleDispatcher.addKeepIfPossibleFlag(EffortVar)

                cycleDispatcher.addKeepIfPossibleFlag(UnitsVar)

                return cycleDispatcher
            }
            else {
                return yield* superProto.prepareDispatcher.call(this, YIELD)
            }
        }


        cycleResolutionContext (Y) : CycleResolution {
            const schedulingMode    = this.effectiveSchedulingModeSync(Y)

            if (schedulingMode === SchedulingMode.FixedUnits) {
                const direction : Direction         = Y(this.$.direction)
                const effortDriven : boolean        = Y(this.$.effortDriven)

                if (direction === Direction.Forward || direction === Direction.None) {
                    return effortDriven ? fixedUnitsSEDWUForwardEffortDriven : fixedUnitsSEDWUForwardNonEffortDriven
                } else {
                    return effortDriven ? fixedUnitsSEDWUBackwardEffortDriven : fixedUnitsSEDWUBackwardNonEffortDriven
                }
            }
            else {
                return superProto.cycleResolutionContext.call(this, Y)
            }

        }
    }

    return FixedUnitsMixin
}){}
