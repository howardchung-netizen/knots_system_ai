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
    fixedDurationSEDWUBackwardEffortDriven,
    fixedDurationSEDWUBackwardNonEffortDriven,
    fixedDurationSEDWUForwardEffortDriven,
    fixedDurationSEDWUForwardNonEffortDriven
} from "./FixedDurationDispatcher.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin provides the fixed duration scheduling mode facility. The scheduling mode is controlled with the
 * [[HasSchedulingModeMixin.schedulingMode]] field.
 *
 * See [[HasSchedulingModeMixin]] for more details.
 *
 * In this mode, the duration of the task remains "fixed" as the name suggest. It is changed only if there's no other options,
 * for example if both "effort" and "units" has changed. In other cases, some other variable is updated.
 *
 * If the [[HasSchedulingModeMixin.effortDriven]] flag is enabled, effort variable becomes "fixed" as well, so normally the "units"
 * variable will change. If that flag is disabled, then "effort" will be changed.
 */
export class FixedDurationMixin extends Mixin(
    [ HasSchedulingModeMixin ],
    (base : AnyConstructor<HasSchedulingModeMixin, typeof HasSchedulingModeMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class FixedDurationMixin extends base {

        * prepareDispatcher (YIELD : SyncEffectHandler) : CalculationIterator<SEDDispatcher> {
            const schedulingMode    = yield* this.effectiveSchedulingMode()

            if (schedulingMode === SchedulingMode.FixedDuration) {
                const cycleDispatcher           = yield* superProto.prepareDispatcher.call(this, YIELD)

                const effortDriven : boolean    = yield this.$.effortDriven

                if (effortDriven) cycleDispatcher.addKeepIfPossibleFlag(EffortVar)

                if (yield HasProposedValue(this.$.assigned)) {
                    // for effort driven case, we treat adding/removing of assignments as changing effort
                    // instead of units (this will trigger both, but units formula will win in presence of effort change)
                    if (effortDriven) {
                        cycleDispatcher.addProposedValueFlag(EffortVar)
                    }
                    else {
                        cycleDispatcher.addProposedValueFlag(UnitsVar)
                    }
                }

                return cycleDispatcher
            }
            else {
                return yield* superProto.prepareDispatcher.call(this, YIELD)
            }
        }


        cycleResolutionContext (Y) : CycleResolution {
            const schedulingMode    = this.effectiveSchedulingModeSync(Y)

            if (schedulingMode === SchedulingMode.FixedDuration) {
                const direction : Direction         = Y(this.$.direction)
                const effortDriven : boolean        = Y(this.$.effortDriven)

                if (direction === Direction.Forward || direction === Direction.None) {
                    return effortDriven ? fixedDurationSEDWUForwardEffortDriven : fixedDurationSEDWUForwardNonEffortDriven
                } else {
                    return effortDriven ? fixedDurationSEDWUBackwardEffortDriven : fixedDurationSEDWUBackwardNonEffortDriven
                }
            }
            else {
                return superProto.cycleResolutionContext.call(this, Y)
            }

        }


        * getBaseOptionsForDurationCalculations () : CalculationIterator<{ ignoreResourceCalendars : boolean }> {
            const schedulingMode    = yield* this.effectiveSchedulingMode()

            if (schedulingMode === SchedulingMode.FixedDuration) {
                return { ignoreResourceCalendars : true }
            }
            else {
                return yield* superProto.getBaseOptionsForDurationCalculations.call(this)
            }
        }

    }

    return FixedDurationMixin
}){}
