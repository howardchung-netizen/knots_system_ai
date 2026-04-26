var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProposedArgumentsOf, ProposedOrPrevious, ProposedOrPreviousValueOf, Reject, Write } from "../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { CalculateProposed } from "../../../../ChronoGraph/cycle_resolver/CycleResolver.js";
import { build_proposed, calculate, field, write } from "../../../../ChronoGraph/replica/Entity.js";
import DateHelper from "../../../../Core/helper/DateHelper.js";
import { dateConverter, model_field } from "../../../chrono/ModelFieldAtom.js";
import { Direction, TimeUnit } from "../../../scheduling/Types.js";
import { isNotNumber } from "../../../util/Functions.js";
import { EmptyCalendarEffect } from "./BaseCalendarMixin.js";
import { durationFormula, DurationVar, endDateFormula, EndDateVar, Instruction, SEDBackwardCycleResolutionContext, SEDDispatcher, SEDDispatcherIdentifier, SEDForwardCycleResolutionContext, startDateFormula, StartDateVar } from "./BaseEventDispatcher.js";
import { HasCalendarMixin } from "./HasCalendarMixin.js";
import { EffectResolutionResult } from "../../../chrono/SchedulingIssueEffect.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * Base event entity mixin type.
 *
 * At this level event is only aware about its calendar (which is inherited from project, if not provided).
 * The functionality, related to the dependencies, constraints etc is provided in other mixins.
 *
 * A time interval will be "counted" into the event duration, only if the event's calendar has that interval
 * as working. Otherwise the time is skipped and not counted into event's duration.
 *
 */
export class BaseEventMixin extends Mixin([HasCalendarMixin], (base) => {
    const superProto = base.prototype;
    class BaseEventMixin extends base {
        *calculateDispatcher(YIELD) {
            // this value is not used directly, but it contains a default cycle resolution
            // if we calculate different resolution, dispatcher will be marked dirty
            // on next revision
            const proposed = yield ProposedOrPrevious;
            const cycleDispatcher = yield* this.prepareDispatcher(YIELD);
            //--------------
            const startDateProposedArgs = yield ProposedArgumentsOf(this.$.startDate);
            const startInstruction = startDateProposedArgs ? (startDateProposedArgs[0] ? Instruction.KeepDuration : Instruction.KeepEndDate) : undefined;
            if (startInstruction)
                cycleDispatcher.addInstruction(startInstruction);
            //--------------
            const endDateProposedArgs = yield ProposedArgumentsOf(this.$.endDate);
            const endInstruction = endDateProposedArgs ? (endDateProposedArgs[0] ? Instruction.KeepDuration : Instruction.KeepStartDate) : undefined;
            if (endInstruction)
                cycleDispatcher.addInstruction(endInstruction);
            //--------------
            const directionValue = yield this.$.direction;
            const durationProposedArgs = yield ProposedArgumentsOf(this.$.duration);
            let durationInstruction;
            if (durationProposedArgs) {
                switch (durationProposedArgs[0]) {
                    case true:
                        durationInstruction = Instruction.KeepStartDate;
                        break;
                    case false:
                        durationInstruction = Instruction.KeepEndDate;
                        break;
                }
            }
            if (!durationInstruction && cycleDispatcher.hasProposedValue(DurationVar)) {
                durationInstruction = directionValue === Direction.Forward || directionValue === Direction.None ? Instruction.KeepStartDate : Instruction.KeepEndDate;
            }
            if (durationInstruction)
                cycleDispatcher.addInstruction(durationInstruction);
            return cycleDispatcher;
        }
        *prepareDispatcher(Y) {
            const dispatcherClass = this.dispatcherClass(Y);
            const cycleDispatcher = dispatcherClass.new({
                context: this.cycleResolutionContext(Y)
            });
            cycleDispatcher.collectInfo(Y, this.$.startDate, StartDateVar);
            cycleDispatcher.collectInfo(Y, this.$.endDate, EndDateVar);
            cycleDispatcher.collectInfo(Y, this.$.duration, DurationVar);
            return cycleDispatcher;
        }
        cycleResolutionContext(Y) {
            const direction = Y(this.$.direction);
            return direction === Direction.Forward || direction === Direction.None ? SEDForwardCycleResolutionContext : SEDBackwardCycleResolutionContext;
        }
        dispatcherClass(Y) {
            return SEDDispatcher;
        }
        buildProposedDispatcher(me, quark, transaction) {
            const dispatcher = this.dispatcherClass(transaction.onEffectSync).new({
                context: this.cycleResolutionContext(transaction.onEffectSync)
            });
            dispatcher.addPreviousValueFlag(StartDateVar);
            dispatcher.addPreviousValueFlag(EndDateVar);
            dispatcher.addPreviousValueFlag(DurationVar);
            return dispatcher;
        }
        /**
         * The method skips the event non working time starting from the provided `date` and
         * going either _forward_ or _backward_ in time.
         * It uses the event [[effectiveCalendar|effective calendar]] to detect which time is not working.
         * @param date Date to start skipping from
         * @param isForward Skip direction (`true` to go forward in time, `false` - backwards)
         */
        *skipNonWorkingTime(date, isForward) {
            const calendar = yield this.$.effectiveCalendar;
            if (!date)
                return null;
            const skippingRes = calendar.skipNonWorkingTime(date, isForward);
            if (skippingRes instanceof Date) {
                return skippingRes;
            }
            else {
                const effect = EmptyCalendarEffect.new({
                    calendars: [calendar],
                    event: this,
                    date,
                    isForward
                });
                if ((yield effect) === EffectResolutionResult.Cancel) {
                    yield Reject(effect);
                }
                else {
                    return null;
                }
            }
        }
        /**
         * The method skips the provided amount of the event _working time_
         * starting from the `date` and going either _forward_ or _backward_ in time.
         * It uses the event [[effectiveCalendar|effective calendar]] to detect which time is not working.
         * @param date Date to start skipping from
         * @param isForward Skip direction (`true` to go forward in time, `false` - backwards)
         * @param duration Amount of working time to skip
         * @param unit Units the `duration` value in (if not provided then duration is considered provided in [[durationUnit]])
         */
        *skipWorkingTime(date, isForward, duration, unit) {
            const durationUnit = yield this.$.durationUnit;
            // Convert duration to duration unit if needed
            if (unit && unit !== durationUnit) {
                duration = yield* this.getProject().$convertDuration(duration, unit, durationUnit);
            }
            return yield* this.calculateProjectedXDateWithDuration(date, isForward, duration);
        }
        // copied generated method, to avoid compilation error when it is overridden in HasDateConstraintMixin
        /**
         * Sets the event [[startDate|start date]]
         *
         * @param date The new start date to set
         * @param keepDuration Whether the intention is to keep the `duration` field (`keepDuration = true`) or `endDate` (`keepDuration = false`)
         */
        setStartDate(date, keepDuration = true) {
            const { graph, project } = this;
            if (graph) {
                graph.write(this.$.startDate, date, keepDuration);
                return graph.commitAsync();
            }
            else {
                this.$.startDate.DATA = date;
                // Possibly about to enter replica, wait for that
                return project?.delayedCalculationPromise;
            }
        }
        writeStartDate(me, transaction, quark, date, keepDuration = true) {
            // we use the approach, that when user sets some atom to `null`
            // that `null` is propagated as a normal valid value through all calculation formulas
            // turning the result of all calculations to `null`
            // this works well, except the initial data load case, when don't want to do such propagation
            // but instead wants to "normalize" the data
            // because of that we ignore the `null` writes, for the initial data load case
            if (!transaction.baseRevision.hasIdentifier(me) && date == null)
                return;
            const instruction = keepDuration ? Instruction.KeepDuration : Instruction.KeepEndDate;
            me.constructor.prototype.write.call(this, me, transaction, quark, date, keepDuration);
        }
        /**
         * The main calculation method for the [[startDate]] field. Delegates to either [[calculateStartDateProposed]]
         * or [[calculateStartDatePure]], depending on the information from [[dispatcher]]
         */
        *calculateStartDate() {
            const dispatch = yield this.$.dispatcher;
            const formulaId = dispatch.resolution.get(StartDateVar);
            if (formulaId === CalculateProposed) {
                return yield* this.calculateStartDateProposed();
            }
            else if (formulaId === startDateFormula.formulaId) {
                return yield* this.calculateStartDatePure();
            }
            else {
                throw new Error("Unknown formula for `startDate`");
            }
        }
        /**
         * The "pure" calculation function of the [[startDate]] field. It should calculate the [[startDate]] as if
         * there's no user input for it and no previous value - "purely" based on the values of other fields.
         *
         * At this level it delegates to [[calculateProjectedXDateWithDuration]]
         *
         * See also [[calculateStartDateProposed]].
         */
        *calculateStartDatePure() {
            return yield* this.calculateProjectedXDateWithDuration(yield this.$.endDate, false, yield this.$.duration);
        }
        /**
         * The "proposed" calculation function of the [[startDate]] field. It should calculate the [[startDate]] as if
         * there's a user input for it or a previous value. It can also use the values of other fields to "validate"
         * the "proposed" value.
         *
         * See also [[calculateStartDatePure]]
         */
        *calculateStartDateProposed() {
            const project = this.getProject();
            const startDate = yield ProposedOrPrevious;
            const manuallyScheduled = yield this.$.manuallyScheduled;
            return (!manuallyScheduled || project.skipNonWorkingTimeWhenSchedulingManually) ? yield* this.skipNonWorkingTime(startDate, true) : startDate;
        }
        /**
         * This method calculates the opposite date of the event.
         *
         * @param baseDate The base date of the event (start or end date)
         * @param isForward Boolean flag, indicating whether the given `baseDate` is start date (`true`) or end date (`false`)
         * @param duration Duration of the event, in its [[durationUnit|durationUnits]]
         */
        *calculateProjectedXDateWithDuration(baseDate, isForward, duration) {
            const durationUnit = yield this.$.durationUnit;
            const calendar = yield this.$.effectiveCalendar;
            const project = this.getProject();
            if (!baseDate || isNotNumber(duration))
                return null;
            // calculate forward by default
            isForward = isForward === undefined ? true : isForward;
            if (isForward) {
                return calendar.calculateEndDate(baseDate, yield* project.$convertDuration(duration, durationUnit, TimeUnit.Millisecond));
            }
            else {
                return calendar.calculateStartDate(baseDate, yield* project.$convertDuration(duration, durationUnit, TimeUnit.Millisecond));
            }
        }
        // copied generated method, to specify the default value for `keepDuration`
        // and to avoid compilation error when it is overridden in HasDateConstraintMixin
        /**
         * Sets the event [[endDate|end date]].
         *
         * @param date The new end date to set
         * @param keepDuration Whether the intention is to keep the `duration` field (`keepDuration = true`) or `startDate` (`keepDuration = false`)
         */
        setEndDate(date, keepDuration = false) {
            const { graph, project } = this;
            if (graph) {
                graph.write(this.$.endDate, date, keepDuration);
                return graph.commitAsync();
            }
            else {
                this.$.endDate.DATA = date;
                // Possibly about to enter replica, wait for that
                return project?.delayedCalculationPromise;
            }
        }
        writeEndDate(me, transaction, quark, date, keepDuration = false) {
            if (!transaction.baseRevision.hasIdentifier(me) && date == null)
                return;
            me.constructor.prototype.write.call(this, me, transaction, quark, date, keepDuration);
            // TODO: review
            // const instruction : Instruction   = keepDuration ? Instruction.KeepDuration : Instruction.KeepStartDate
            // const dispatcher    = this.$.dispatcher as DispatcherIdentifier
        }
        /**
         * The main calculation method for the [[endDate]] field. Delegates to either [[calculateEndDateProposed]]
         * or [[calculateEndDatePure]], depending on the information from [[dispatcher]]
         */
        *calculateEndDate() {
            const dispatch = yield this.$.dispatcher;
            const formulaId = dispatch.resolution.get(EndDateVar);
            if (formulaId === CalculateProposed) {
                return yield* this.calculateEndDateProposed();
            }
            else if (formulaId === endDateFormula.formulaId) {
                return yield* this.calculateEndDatePure();
                // the "new way" would be
                // return yield* this.calculateProjectedEndDateWithDuration(yield this.$.startDate, yield this.$.duration)
            }
            else {
                throw new Error("Unknown formula for `endDate`");
            }
        }
        /**
         * The "pure" calculation function of the [[endDate]] field. It should calculate the [[endDate]] as if
         * there's no user input for it and no previous value - "purely" based on the values of other fields.
         *
         * At this level it delegates to [[calculateProjectedXDateWithDuration]]
         *
         * See also [[calculateEndDateProposed]].
         */
        *calculateEndDatePure() {
            return yield* this.calculateProjectedXDateWithDuration(yield this.$.startDate, true, yield this.$.duration);
        }
        /**
         * The "proposed" calculation function of the [[endDate]] field. It should calculate the [[endDate]] as if
         * there's a user input for it or a previous value. It can also use the values of other fields to "validate"
         * the "proposed" value.
         *
         * See also [[calculateEndDatePure]]
         */
        *calculateEndDateProposed() {
            const project = this.getProject();
            const endDate = yield ProposedOrPrevious;
            const manuallyScheduled = yield this.$.manuallyScheduled;
            return (!manuallyScheduled || project.skipNonWorkingTimeWhenSchedulingManually) ? yield* this.skipNonWorkingTime(endDate, false) : endDate;
        }
        //endregion
        //region duration
        /**
         * Duration getter. Returns the duration of the event, in the given unit. If unit is not given, returns duration in [[durationUnit]].
         *
         * @param unit
         */
        getDuration(unit) {
            const duration = this.duration;
            return unit !== undefined ? this.getProject().convertDuration(duration, this.durationUnit, unit) : duration;
        }
        /**
         * Duration setter.
         *
         * @param duration The new duration to set.
         * @param unit The unit for new duration. Optional, if missing the [[durationUnit]] value will be used.
         * @param keepStart A boolean flag, indicating, whether the intention is to keep the start date (`true`) or end date (`false`)
         */
        setDuration(duration, unit, keepStart) {
            const { graph, project } = this;
            if (graph) {
                // Chronograph started to treat undefined as null, but we need to filter that case
                // https://github.com/bryntum/chronograph/issues/11
                if (duration !== undefined) {
                    graph.write(this.$.duration, duration, unit, keepStart);
                    return graph.commitAsync();
                }
            }
            else {
                const toSet = { duration };
                this.$.duration.DATA = duration;
                if (unit != null)
                    toSet.durationUnit = this.$.durationUnit.DATA = unit;
                // Also has to make sure record data is updated in case this detached record is displayed elsewhere
                this.set(toSet);
                // Possibly about to enter replica, wait for that
                return project?.delayedCalculationPromise;
            }
        }
        setDurationUnit(_value) {
            throw new Error("Use `setDuration` instead");
        }
        writeDuration(me, transaction, quark, duration, unit, keepStart = undefined) {
            if (duration < 0)
                duration = 0;
            if (!transaction.baseRevision.hasIdentifier(me) && duration == null)
                return;
            me.constructor.prototype.write.call(this, me, transaction, quark, duration, keepStart);
            if (unit != null)
                transaction.write(this.$.durationUnit, unit);
        }
        /**
         * The main calculation method for the [[duration]] field. Delegates to either [[calculateDurationProposed]]
         * or [[calculateDurationPure]], depending on the information from [[dispatcher]]
         */
        *calculateDuration() {
            const dispatch = yield this.$.dispatcher;
            const formulaId = dispatch.resolution.get(DurationVar);
            if (formulaId === CalculateProposed) {
                return yield* this.calculateDurationProposed();
            }
            else if (formulaId === durationFormula.formulaId) {
                return yield* this.calculateDurationPure();
                // the "new way" would be
                // return yield* this.calculateProjectedDuration(yield this.$.startDate, yield this.$.endDate)
            }
            else {
                throw new Error("Unknown formula for `duration`");
            }
        }
        /**
         * The "pure" calculation function of the [[duration]] field. It should calculate the [[duration]] as if
         * there's no user input for it and no previous value - "purely" based on the values of other fields.
         *
         * If start date of event is less or equal then end date (normal case) it delegates to [[calculateProjectedDuration]].
         * Otherwise duration is set to 0.
         *
         * See also [[calculateDurationProposed]].
         */
        *calculateDurationPure() {
            const startDate = yield this.$.startDate;
            const endDate = yield this.$.endDate;
            if (!startDate || !endDate)
                return yield ProposedOrPrevious;
            if (startDate > endDate) {
                yield Write(this.$.duration, 0, null);
            }
            else {
                return yield* this.calculateProjectedDuration(startDate, endDate);
            }
        }
        /**
         * The "proposed" calculation function of the [[duration]] field. It should calculate the [[duration]] as if
         * there's a user input for it or a previous value. It can also use the values of other fields to "validate"
         * the "proposed" value.
         *
         * See also [[calculateDurationPure]]
         */
        *calculateDurationProposed() {
            return yield ProposedOrPrevious;
        }
        /**
         * This method calculates the duration of the given time span, in the provided `durationUnit` or in the [[durationUnit]].
         *
         * @param startDate
         * @param endDate
         * @param durationUnit
         */
        *calculateProjectedDuration(startDate, endDate, durationUnit) {
            if (!startDate || !endDate)
                return null;
            if (!durationUnit)
                durationUnit = yield this.$.durationUnit;
            const calendar = yield this.$.effectiveCalendar;
            const project = this.getProject();
            return yield* project.$convertDuration(calendar.calculateDurationMs(startDate, endDate), TimeUnit.Millisecond, durationUnit);
        }
        // effective duration is either a "normal" duration, or, if the duration itself is being calculated
        // (so that yielding it will cause a cycle)
        // an "estimated" duration, calculated based on proposed/previous start/end date values
        *calculateEffectiveDuration() {
            const dispatch = yield this.$.dispatcher;
            let effectiveDurationToUse;
            const durationResolution = dispatch.resolution.get(DurationVar);
            if (durationResolution === CalculateProposed) {
                effectiveDurationToUse = yield this.$.duration;
            }
            else if (durationResolution === durationFormula.formulaId) {
                effectiveDurationToUse = yield* this.calculateProjectedDuration(yield ProposedOrPreviousValueOf(this.$.startDate), yield ProposedOrPreviousValueOf(this.$.endDate));
            }
            return effectiveDurationToUse;
        }
    }
    __decorate([
        model_field({ type: 'date' }, { converter: dateConverter })
    ], BaseEventMixin.prototype, "startDate", void 0);
    __decorate([
        model_field({ type: 'date' }, { converter: dateConverter })
    ], BaseEventMixin.prototype, "endDate", void 0);
    __decorate([
        model_field({ type: 'number', allowNull: true })
    ], BaseEventMixin.prototype, "duration", void 0);
    __decorate([
        model_field({ type: 'string', defaultValue: TimeUnit.Day }, { converter: DateHelper.normalizeUnit })
    ], BaseEventMixin.prototype, "durationUnit", void 0);
    __decorate([
        model_field({ type: 'string', defaultValue: Direction.Forward }, { sync: true })
    ], BaseEventMixin.prototype, "direction", void 0);
    __decorate([
        field({ identifierCls: SEDDispatcherIdentifier })
    ], BaseEventMixin.prototype, "dispatcher", void 0);
    __decorate([
        model_field({ type: 'boolean', defaultValue: false })
    ], BaseEventMixin.prototype, "manuallyScheduled", void 0);
    __decorate([
        calculate('dispatcher')
    ], BaseEventMixin.prototype, "calculateDispatcher", null);
    __decorate([
        build_proposed('dispatcher')
    ], BaseEventMixin.prototype, "buildProposedDispatcher", null);
    __decorate([
        write('startDate')
    ], BaseEventMixin.prototype, "writeStartDate", null);
    __decorate([
        calculate('startDate')
    ], BaseEventMixin.prototype, "calculateStartDate", null);
    __decorate([
        write('endDate')
    ], BaseEventMixin.prototype, "writeEndDate", null);
    __decorate([
        calculate('endDate')
    ], BaseEventMixin.prototype, "calculateEndDate", null);
    __decorate([
        write('duration')
    ], BaseEventMixin.prototype, "writeDuration", null);
    __decorate([
        calculate('duration')
    ], BaseEventMixin.prototype, "calculateDuration", null);
    return BaseEventMixin;
}) {
}
