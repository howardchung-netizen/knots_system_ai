import { ProposedOrPrevious, ProposedOrPreviousValueOf } from "../../../../ChronoGraph/chrono/Effect.js"
import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { Identifier } from "../../../../ChronoGraph/chrono/Identifier.js"
import { Quark } from "../../../../ChronoGraph/chrono/Quark.js"
import { SyncEffectHandler, Transaction } from "../../../../ChronoGraph/chrono/Transaction.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculateProposed, FormulaId } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { calculate, field } from "../../../../ChronoGraph/replica/Entity.js"
import { model_field } from "../../../chrono/ModelFieldAtom.js"
import { Duration, SchedulingMode } from "../../../scheduling/Types.js"
import { durationFormula, DurationVar, EndDateVar, SEDDispatcher, StartDateVar } from "../scheduler_basic/BaseEventDispatcher.js"
import { GanttAssignmentMixin } from "./GanttAssignmentMixin.js"
import {
    effortFormula,
    EffortVar,
    endDateByEffortFormula,
    SEDWUDispatcher,
    SEDWUDispatcherIdentifier,
    startDateByEffortFormula,
    unitsFormula,
    UnitsVar
} from "./HasEffortDispatcher.js"
import { HasEffortMixin } from "./HasEffortMixin.js"


//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin serves as a "base class" for the individual scheduling modes mixins: [[FixedDurationMixin]], [[FixedEffortMixin]]
 * and [[FixedUnitsMixin]].
 *
 * Scheduling mode indicates, in which order the duration, effort and assignment units are changed. All these variables
 * are tied together with this invariant (in pseudo-code):
 *
 * ```
 * Effort = Duration * Units
 * ```
 *
 * For example, if we've doubled the effort of the task, we have the choice - we can either double its duration,
 * or double the assignment units, to keep the invariant.
 *
 * We have the same choices for every variable. The scheduling mode
 * basically defines the order in which the "duration", "effort" and "units" variables are updated when one of them changes.
 */
export class HasSchedulingModeMixin extends Mixin(
    [ HasEffortMixin ],
    (base : AnyConstructor<HasEffortMixin, typeof HasEffortMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class HasSchedulingModeMixin extends base {

        /**
         * Whether the effort of the task is "fixed". The [[FixedEffortMixin]] operates as if this flag is always enabled.
         */
        @model_field({ 'type' : 'boolean', defaultValue : false })
        effortDriven    : boolean

        /**
         * The scheduling mode of the task.
         */
        @model_field({ type : 'string', defaultValue : SchedulingMode.Normal }, { sync : true })
        schedulingMode  : SchedulingMode

        @field({ identifierCls : SEDWUDispatcherIdentifier })
        dispatcher      : SEDWUDispatcher


        /**
         * Generated setter for the [[schedulingMode]] field.
         */
        setSchedulingMode : (schedulingMode : SchedulingMode) => Promise<CommitResult>
        /**
         * Generated getter for the [[schedulingMode]] field.
         */
        getSchedulingMode : () => SchedulingMode


        /**
         * Generated setter for the [[effortDriven]] field.
         */
        setEffortDriven : (effortDriven : boolean) => Promise<CommitResult>
        /**
         * Generated getter for the [[effortDriven]] field.
         */
        getEffortDriven : () => boolean


        @calculate('schedulingMode')
        * calculateSchedulingMode () : CalculationIterator<SchedulingMode> {
            return (yield ProposedOrPrevious) || SchedulingMode.Normal
        }


        * effectiveSchedulingMode () : CalculationIterator<SchedulingMode> {
            const assignmentsByCalendar : this[ 'assignmentsByCalendar' ]   = yield this.$.assignmentsByCalendar

            return assignmentsByCalendar.size > 0 ? yield this.$.schedulingMode : SchedulingMode.Normal
        }


        effectiveSchedulingModeSync (Y) : SchedulingMode {
            const assignmentsByCalendar : this[ 'assignmentsByCalendar' ]   = Y(this.$.assignmentsByCalendar)

            return assignmentsByCalendar.size > 0 ? Y(this.$.schedulingMode) : SchedulingMode.Normal
        }


        * prepareDispatcher (YIELD : SyncEffectHandler) : CalculationIterator<SEDDispatcher> {
            const schedulingMode    = yield* this.effectiveSchedulingMode()

            if (schedulingMode !== SchedulingMode.Normal) {
                const cycleDispatcher               = yield* superProto.prepareDispatcher.call(this, YIELD)

                cycleDispatcher.collectInfo(YIELD, this.$.effort, EffortVar)

                if (yield* this.hasProposedValueForUnits()) cycleDispatcher.addProposedValueFlag(UnitsVar)
                // units are always available
                cycleDispatcher.addPreviousValueFlag(UnitsVar)

                return cycleDispatcher
            }
            else {
                return yield* superProto.prepareDispatcher.call(this, YIELD)
            }
        }


        dispatcherClass (Y) : typeof SEDDispatcher {
            const schedulingMode    = this.effectiveSchedulingModeSync(Y)

            if (schedulingMode !== SchedulingMode.Normal) {
                return SEDWUDispatcher
            }
            else {
                return superProto.dispatcherClass.call(this, Y)
            }
        }


        buildProposedDispatcher (me : Identifier, quark : Quark, transaction : Transaction) : SEDDispatcher {
            const dispatcher = superProto.buildProposedDispatcher.call(this, me, quark, transaction)

            // TODO should check for dispatcher class probably
            dispatcher.addPreviousValueFlag(EffortVar)
            dispatcher.addPreviousValueFlag(UnitsVar)

            return dispatcher
        }


        * calculateAssignmentUnits (assignment : GanttAssignmentMixin) : CalculationIterator<number> {
            const schedulingMode    = yield* this.effectiveSchedulingMode()

            if (schedulingMode !== SchedulingMode.Normal) {
                const dispatch : SEDWUDispatcher        = yield this.$.dispatcher

                const formulaId : FormulaId = dispatch.resolution.get(UnitsVar)

                if (formulaId === CalculateProposed) {
                    return yield* this.calculateAssignmentUnitsProposed(assignment)
                }
                else if (formulaId === unitsFormula.formulaId) {
                    return yield* this.calculateAssignmentUnitsPure(assignment)
                } else {
                    throw new Error("Unknown formula for `units`")
                }
            }
            else {
                return yield* superProto.calculateAssignmentUnits.call(this, assignment)
            }
        }


        @calculate('effort')
        * calculateEffort () : CalculationIterator<Duration> {
            const schedulingMode    = yield* this.effectiveSchedulingMode()

            if (schedulingMode !== SchedulingMode.Normal) {
                const dispatch : SEDWUDispatcher        = yield this.$.dispatcher

                const formulaId : FormulaId = dispatch.resolution.get(EffortVar)

                if (formulaId === CalculateProposed) {
                    return yield* this.calculateEffortProposed()
                }
                else if (formulaId === effortFormula.formulaId) {
                    return yield* this.calculateEffortPure()
                } else {
                    throw new Error("Unknown formula for `effort`")
                }
            }
            else {
                return yield* superProto.calculateEffort.call(this)
            }
        }


        @calculate('startDate')
        * calculateStartDate () : CalculationIterator<Date> {
            const schedulingMode    = yield* this.effectiveSchedulingMode()

            if (schedulingMode !== SchedulingMode.Normal) {
                const dispatch : SEDWUDispatcher        = yield this.$.dispatcher

                const formulaId : FormulaId = dispatch.resolution.get(StartDateVar)

                if (formulaId === startDateByEffortFormula.formulaId) {
                    return yield* this.calculateProjectedXDateByEffort(yield this.$.endDate, false)
                } else {
                    return yield* superProto.calculateStartDate.call(this)
                }
            }
            else {
                return yield* superProto.calculateStartDate.call(this)
            }
        }


        @calculate('endDate')
        * calculateEndDate () : CalculationIterator<Date> {
            const schedulingMode    = yield* this.effectiveSchedulingMode()

            if (schedulingMode !== SchedulingMode.Normal) {
                const dispatch : SEDWUDispatcher        = yield this.$.dispatcher

                const formulaId : FormulaId = dispatch.resolution.get(EndDateVar)

                if (formulaId === endDateByEffortFormula.formulaId) {
                    return yield* this.calculateProjectedXDateByEffort(yield this.$.startDate, true)
                } else {
                    return yield* superProto.calculateEndDate.call(this)
                }
            }
            else {
                return yield* superProto.calculateEndDate.call(this)
            }
        }


        * calculateEffectiveDuration () : CalculationIterator<Duration> {
            const dispatch : SEDWUDispatcher            = yield this.$.dispatcher
            const schedulingMode : SchedulingMode       = yield* this.effectiveSchedulingMode()

            const durationResolution : FormulaId        = dispatch.resolution.get(DurationVar)
            const effortResolution : FormulaId          = dispatch.resolution.get(EffortVar)

            let effectiveDurationToUse : Duration

            if (durationResolution === durationFormula.formulaId && schedulingMode != SchedulingMode.Normal) {
                const proposedOrPreviousStartDate : Date    = yield ProposedOrPreviousValueOf(this.$.startDate)
                const proposedOrPreviousEndDate : Date      = yield ProposedOrPreviousValueOf(this.$.endDate)

                const startDateResolution : FormulaId       = dispatch.resolution.get(StartDateVar)
                const endDateResolution : FormulaId         = dispatch.resolution.get(EndDateVar)

                const effortDriven : boolean                = yield this.$.effortDriven

                if (proposedOrPreviousEndDate && startDateResolution === startDateByEffortFormula.formulaId) {
                    effectiveDurationToUse  = yield* this.calculateProjectedDuration(
                        yield* this.calculateProjectedXDateByEffort(proposedOrPreviousEndDate, false),
                        proposedOrPreviousEndDate
                    )
                }
                else if (proposedOrPreviousStartDate && endDateResolution === endDateByEffortFormula.formulaId) {
                    effectiveDurationToUse  = yield* this.calculateProjectedDuration(
                        proposedOrPreviousStartDate,
                        yield* this.calculateProjectedXDateByEffort(proposedOrPreviousStartDate, true)
                    )
                }
                else if (
                    proposedOrPreviousStartDate && proposedOrPreviousEndDate
                    || !proposedOrPreviousStartDate && !proposedOrPreviousEndDate
                ) {
                    effectiveDurationToUse  = yield* superProto.calculateEffectiveDuration.call(this)
                }
            }
            else
                effectiveDurationToUse  = yield* superProto.calculateEffectiveDuration.call(this)

            return effectiveDurationToUse
        }

    }

    return HasSchedulingModeMixin
}){}
