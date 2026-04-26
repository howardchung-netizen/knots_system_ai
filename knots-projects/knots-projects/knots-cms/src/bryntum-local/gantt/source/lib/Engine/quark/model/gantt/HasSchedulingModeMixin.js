var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProposedOrPrevious, ProposedOrPreviousValueOf } from "../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { CalculateProposed } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js";
import { calculate, field } from "../../../../ChronoGraph/replica/Entity.js";
import { model_field } from "../../../chrono/ModelFieldAtom.js";
import { SchedulingMode } from "../../../scheduling/Types.js";
import { durationFormula, DurationVar, EndDateVar, StartDateVar } from "../scheduler_basic/BaseEventDispatcher.js";
import { effortFormula, EffortVar, endDateByEffortFormula, SEDWUDispatcher, SEDWUDispatcherIdentifier, startDateByEffortFormula, unitsFormula, UnitsVar } from "./HasEffortDispatcher.js";
import { HasEffortMixin } from "./HasEffortMixin.js";
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
export class HasSchedulingModeMixin extends Mixin([HasEffortMixin], (base) => {
    const superProto = base.prototype;
    class HasSchedulingModeMixin extends base {
        *calculateSchedulingMode() {
            return (yield ProposedOrPrevious) || SchedulingMode.Normal;
        }
        *effectiveSchedulingMode() {
            const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
            return assignmentsByCalendar.size > 0 ? yield this.$.schedulingMode : SchedulingMode.Normal;
        }
        effectiveSchedulingModeSync(Y) {
            const assignmentsByCalendar = Y(this.$.assignmentsByCalendar);
            return assignmentsByCalendar.size > 0 ? Y(this.$.schedulingMode) : SchedulingMode.Normal;
        }
        *prepareDispatcher(YIELD) {
            const schedulingMode = yield* this.effectiveSchedulingMode();
            if (schedulingMode !== SchedulingMode.Normal) {
                const cycleDispatcher = yield* superProto.prepareDispatcher.call(this, YIELD);
                cycleDispatcher.collectInfo(YIELD, this.$.effort, EffortVar);
                if (yield* this.hasProposedValueForUnits())
                    cycleDispatcher.addProposedValueFlag(UnitsVar);
                // units are always available
                cycleDispatcher.addPreviousValueFlag(UnitsVar);
                return cycleDispatcher;
            }
            else {
                return yield* superProto.prepareDispatcher.call(this, YIELD);
            }
        }
        dispatcherClass(Y) {
            const schedulingMode = this.effectiveSchedulingModeSync(Y);
            if (schedulingMode !== SchedulingMode.Normal) {
                return SEDWUDispatcher;
            }
            else {
                return superProto.dispatcherClass.call(this, Y);
            }
        }
        buildProposedDispatcher(me, quark, transaction) {
            const dispatcher = superProto.buildProposedDispatcher.call(this, me, quark, transaction);
            // TODO should check for dispatcher class probably
            dispatcher.addPreviousValueFlag(EffortVar);
            dispatcher.addPreviousValueFlag(UnitsVar);
            return dispatcher;
        }
        *calculateAssignmentUnits(assignment) {
            const schedulingMode = yield* this.effectiveSchedulingMode();
            if (schedulingMode !== SchedulingMode.Normal) {
                const dispatch = yield this.$.dispatcher;
                const formulaId = dispatch.resolution.get(UnitsVar);
                if (formulaId === CalculateProposed) {
                    return yield* this.calculateAssignmentUnitsProposed(assignment);
                }
                else if (formulaId === unitsFormula.formulaId) {
                    return yield* this.calculateAssignmentUnitsPure(assignment);
                }
                else {
                    throw new Error("Unknown formula for `units`");
                }
            }
            else {
                return yield* superProto.calculateAssignmentUnits.call(this, assignment);
            }
        }
        *calculateEffort() {
            const schedulingMode = yield* this.effectiveSchedulingMode();
            if (schedulingMode !== SchedulingMode.Normal) {
                const dispatch = yield this.$.dispatcher;
                const formulaId = dispatch.resolution.get(EffortVar);
                if (formulaId === CalculateProposed) {
                    return yield* this.calculateEffortProposed();
                }
                else if (formulaId === effortFormula.formulaId) {
                    return yield* this.calculateEffortPure();
                }
                else {
                    throw new Error("Unknown formula for `effort`");
                }
            }
            else {
                return yield* superProto.calculateEffort.call(this);
            }
        }
        *calculateStartDate() {
            const schedulingMode = yield* this.effectiveSchedulingMode();
            if (schedulingMode !== SchedulingMode.Normal) {
                const dispatch = yield this.$.dispatcher;
                const formulaId = dispatch.resolution.get(StartDateVar);
                if (formulaId === startDateByEffortFormula.formulaId) {
                    return yield* this.calculateProjectedXDateByEffort(yield this.$.endDate, false);
                }
                else {
                    return yield* superProto.calculateStartDate.call(this);
                }
            }
            else {
                return yield* superProto.calculateStartDate.call(this);
            }
        }
        *calculateEndDate() {
            const schedulingMode = yield* this.effectiveSchedulingMode();
            if (schedulingMode !== SchedulingMode.Normal) {
                const dispatch = yield this.$.dispatcher;
                const formulaId = dispatch.resolution.get(EndDateVar);
                if (formulaId === endDateByEffortFormula.formulaId) {
                    return yield* this.calculateProjectedXDateByEffort(yield this.$.startDate, true);
                }
                else {
                    return yield* superProto.calculateEndDate.call(this);
                }
            }
            else {
                return yield* superProto.calculateEndDate.call(this);
            }
        }
        *calculateEffectiveDuration() {
            const dispatch = yield this.$.dispatcher;
            const schedulingMode = yield* this.effectiveSchedulingMode();
            const durationResolution = dispatch.resolution.get(DurationVar);
            const effortResolution = dispatch.resolution.get(EffortVar);
            let effectiveDurationToUse;
            if (durationResolution === durationFormula.formulaId && schedulingMode != SchedulingMode.Normal) {
                const proposedOrPreviousStartDate = yield ProposedOrPreviousValueOf(this.$.startDate);
                const proposedOrPreviousEndDate = yield ProposedOrPreviousValueOf(this.$.endDate);
                const startDateResolution = dispatch.resolution.get(StartDateVar);
                const endDateResolution = dispatch.resolution.get(EndDateVar);
                const effortDriven = yield this.$.effortDriven;
                if (proposedOrPreviousEndDate && startDateResolution === startDateByEffortFormula.formulaId) {
                    effectiveDurationToUse = yield* this.calculateProjectedDuration(yield* this.calculateProjectedXDateByEffort(proposedOrPreviousEndDate, false), proposedOrPreviousEndDate);
                }
                else if (proposedOrPreviousStartDate && endDateResolution === endDateByEffortFormula.formulaId) {
                    effectiveDurationToUse = yield* this.calculateProjectedDuration(proposedOrPreviousStartDate, yield* this.calculateProjectedXDateByEffort(proposedOrPreviousStartDate, true));
                }
                else if (proposedOrPreviousStartDate && proposedOrPreviousEndDate
                    || !proposedOrPreviousStartDate && !proposedOrPreviousEndDate) {
                    effectiveDurationToUse = yield* superProto.calculateEffectiveDuration.call(this);
                }
            }
            else
                effectiveDurationToUse = yield* superProto.calculateEffectiveDuration.call(this);
            return effectiveDurationToUse;
        }
    }
    __decorate([
        model_field({ 'type': 'boolean', defaultValue: false })
    ], HasSchedulingModeMixin.prototype, "effortDriven", void 0);
    __decorate([
        model_field({ type: 'string', defaultValue: SchedulingMode.Normal }, { sync: true })
    ], HasSchedulingModeMixin.prototype, "schedulingMode", void 0);
    __decorate([
        field({ identifierCls: SEDWUDispatcherIdentifier })
    ], HasSchedulingModeMixin.prototype, "dispatcher", void 0);
    __decorate([
        calculate('schedulingMode')
    ], HasSchedulingModeMixin.prototype, "calculateSchedulingMode", null);
    __decorate([
        calculate('effort')
    ], HasSchedulingModeMixin.prototype, "calculateEffort", null);
    __decorate([
        calculate('startDate')
    ], HasSchedulingModeMixin.prototype, "calculateStartDate", null);
    __decorate([
        calculate('endDate')
    ], HasSchedulingModeMixin.prototype, "calculateEndDate", null);
    return HasSchedulingModeMixin;
}) {
}
