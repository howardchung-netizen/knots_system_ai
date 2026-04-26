var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Reject } from "../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from '../../../../ChronoGraph/class/BetterMixin.js';
import { calculate, field } from '../../../../ChronoGraph/replica/Entity.js';
import DateHelper from '../../../../Core/helper/DateHelper.js';
import { dateConverter, model_field } from '../../../chrono/ModelFieldAtom.js';
import { DateInterval } from '../../../scheduling/DateInterval.js';
import { Direction, TimeUnit } from '../../../scheduling/Types.js';
import { MAX_DATE, MIN_DATE, isDateFinite } from "../../../util/Constants.js";
import { HasChildrenMixin } from '../scheduler_basic/HasChildrenMixin.js';
import { ConstrainedEarlyEventMixin, EarlyLateLazyness } from "../scheduler_pro/ConstrainedEarlyEventMixin.js";
import { ConflictEffect } from '../../../chrono/Conflict.js';
import { EffectResolutionResult } from "../../../chrono/SchedulingIssueEffect.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin provides the constraint-based as-late-as-possible scheduling. See the [[ConstrainedEarlyEventMixin]]
 * for the description of the ASAP constraints-based scheduling. See [[GanttProjectMixin]] for more details about
 * forward/backward, ASAP/ALAP scheduling.
 *
 * It also provides the facilities for calculating the event's [[totalSlack]] and the [[critical]] flag.
 *
 * The ALAP-specific constraints are accumulated in [[lateStartDateConstraintIntervals]], [[lateEndDateConstraintIntervals]] fields.
 */
export class ConstrainedLateEventMixin extends Mixin([ConstrainedEarlyEventMixin, HasChildrenMixin], (base) => {
    const superProto = base.prototype;
    class ConstrainedLateEventMixin extends base {
        /**
         * Calculation method for the [[lateStartDateConstraintIntervals]]. Returns empty array by default.
         * Override this method to return some extra constraints for the start date during the ALAP scheduling.
         */
        *calculateLateStartDateConstraintIntervals() {
            const intervals = [];
            const parentEvent = yield this.$.parentEvent;
            if (parentEvent) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.lateStartDateConstraintIntervals;
                intervals.push.apply(intervals, parentIntervals);
            }
            return intervals;
        }
        /**
         * Calculation method for the [[lateEndDateConstraintIntervals]]. Returns empty array by default.
         * Override this method to return some extra constraints for the end date during the ALAP scheduling.
         */
        *calculateLateEndDateConstraintIntervals() {
            const intervals = [];
            const parentEvent = yield this.$.parentEvent;
            if (parentEvent) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.lateEndDateConstraintIntervals;
                intervals.push.apply(intervals, parentIntervals);
                // If the parent is scheduled manually it should still restrict its children (even though it has no a constraint set)
                // so we append an artificial constraining interval
                if ((yield parentEvent.$.manuallyScheduled) && (yield this.$.direction) === Direction.Backward) {
                    intervals.push(DateInterval.new({
                        endDate: yield parentEvent.$.endDate
                    }));
                }
            }
            return intervals;
        }
        /**
         * The method defines wether the provided child event should be
         * taken into account when calculating this summary event [[lateStartDate]].
         * Child events roll up their [[lateStartDate]] values to their summary tasks.
         * So a summary task [[lateStartDate]] date gets equal to its minimal child [[lateStartDate]].
         *
         * If the method returns `true` the child event is taken into account
         * and if the method returns `false` it's not.
         * By default the method returns `true` to include all child events data.
         * @param childEvent Child event to consider.
         * @returns `true` if the provided event should be taken into account, `false` if not.
         */
        *shouldRollupChildLateStartDate(childEvent) {
            return true;
        }
        *calculateMinChildrenLateStartDate() {
            let result = MAX_DATE;
            const subEventsIterator = yield* this.subEventsIterable();
            for (let childEvent of subEventsIterator) {
                if (!(yield* this.shouldRollupChildLateStartDate(childEvent)))
                    continue;
                let childDate;
                if ((yield childEvent.$.manuallyScheduled) && (yield* childEvent.hasSubEvents())) {
                    childDate = yield childEvent.$.minChildrenLateStartDate;
                }
                childDate = childDate || (yield childEvent.$.lateStartDate);
                if (childDate && childDate < result)
                    result = childDate;
            }
            return result.getTime() - MAX_DATE.getTime() ? result : null;
        }
        *calculateLateStartDateRaw() {
            // Manually scheduled task treat its current start date as late start date
            // in case of backward scheduling.
            // Early dates in that case are calculated the same way it happens for automatic tasks
            if ((yield this.$.manuallyScheduled) && (yield this.$.direction) === Direction.Backward) {
                return yield this.$.startDate;
            }
            // Parent task calculate its late start date as minimal late start date of its children
            if (yield* this.hasSubEvents()) {
                return yield this.$.minChildrenLateStartDate;
            }
            if (!(yield* this.isConstrainedLate())) {
                return yield this.$.startDate;
            }
            // need to use concat instead of directly mutating the `startDateConstraintIntervals` since that is
            // used as storage for `this.$.lateStartDateConstraintIntervals`
            const startDateConstraintIntervals = (yield this.$.lateStartDateConstraintIntervals).concat(yield this.$.startDateConstraintIntervals);
            const endDateConstraintIntervals = (yield this.$.lateEndDateConstraintIntervals).concat(yield this.$.endDateConstraintIntervals);
            let effectiveInterval = yield* this.calculateEffectiveConstraintInterval(true, startDateConstraintIntervals, endDateConstraintIntervals);
            if (effectiveInterval === null) {
                return null;
            }
            else if (effectiveInterval.isIntervalEmpty()) {
                // re-calculate effective resulting interval gathering intersection history
                effectiveInterval = yield* this.calculateEffectiveConstraintInterval(true, startDateConstraintIntervals, endDateConstraintIntervals, true);
                const conflict = ConflictEffect.new({
                    intervals: [...effectiveInterval.intersectionOf]
                });
                if ((yield conflict) === EffectResolutionResult.Cancel) {
                    yield Reject(conflict);
                }
                else {
                    return null;
                }
            }
            return isDateFinite(effectiveInterval.endDate) ? effectiveInterval.endDate : null;
        }
        /**
         * The method defines wether the provided child event should be
         * taken into account when calculating this summary event [[lateEndDate]].
         * Child events roll up their [[lateEndDate]] values to their summary tasks.
         * So a summary task [[lateEndDate]] gets equal to its maximal child [[lateEndDate]].
         *
         * If the method returns `true` the child event is taken into account
         * and if the method returns `false` it's not.
         * By default the method returns `true` to include all child events data.
         * @param childEvent Child event to consider.
         * @returns `true` if the provided event should be taken into account, `false` if not.
         */
        *shouldRollupChildLateEndDate(childEvent) {
            return true;
        }
        *calculateMaxChildrenLateEndDate() {
            let result = MIN_DATE;
            const subEventsIterator = yield* this.subEventsIterable();
            for (let childEvent of subEventsIterator) {
                if (!(yield* this.shouldRollupChildLateEndDate(childEvent)))
                    continue;
                let childDate;
                if ((yield childEvent.$.manuallyScheduled) && (yield* childEvent.hasSubEvents())) {
                    childDate = yield childEvent.$.maxChildrenLateEndDate;
                }
                childDate = childDate || (yield childEvent.$.lateEndDate);
                if (childDate && childDate > result)
                    result = childDate;
            }
            return result.getTime() - MIN_DATE.getTime() ? result : null;
        }
        *calculateLateStartDate() {
            return yield this.$.lateStartDateRaw;
        }
        *calculateLateEndDateRaw() {
            // Manually scheduled task treat its current end date as late end date
            // in case of backward scheduling.
            // Early dates in that case are calculated the same way it happens for automatic tasks
            if ((yield this.$.manuallyScheduled) && (yield this.$.direction) === Direction.Backward) {
                return yield this.$.endDate;
            }
            // Parent task calculate its late end date as minimal early end date of its children
            if (yield* this.hasSubEvents()) {
                return yield this.$.maxChildrenLateEndDate;
            }
            if (!(yield* this.isConstrainedLate())) {
                return yield this.$.endDate;
            }
            const startDateConstraintIntervals = yield this.$.lateStartDateConstraintIntervals;
            const endDateConstraintIntervals = yield this.$.lateEndDateConstraintIntervals;
            let effectiveInterval = (yield* this.calculateEffectiveConstraintInterval(false, 
            // need to use concat instead of directly mutating the `startDateConstraintIntervals` since that is
            // used as storage for `this.$.lateStartDateConstraintIntervals`
            startDateConstraintIntervals.concat(yield this.$.startDateConstraintIntervals), endDateConstraintIntervals.concat(yield this.$.endDateConstraintIntervals)));
            if (effectiveInterval === null) {
                return null;
            }
            else if (effectiveInterval.isIntervalEmpty()) {
                // re-calculate effective resulting interval gathering intersection history
                effectiveInterval = (yield* this.calculateEffectiveConstraintInterval(false, 
                // need to use concat instead of directly mutating the `startDateConstraintIntervals` since that is
                // used as storage for `this.$.lateStartDateConstraintIntervals`
                (yield this.$.lateStartDateConstraintIntervals).concat(yield this.$.startDateConstraintIntervals), (yield this.$.lateEndDateConstraintIntervals).concat(yield this.$.endDateConstraintIntervals), true));
                const conflict = ConflictEffect.new({
                    intervals: [...effectiveInterval.intersectionOf]
                });
                if ((yield conflict) === EffectResolutionResult.Cancel) {
                    yield Reject(conflict);
                }
                else {
                    return null;
                }
            }
            return isDateFinite(effectiveInterval.endDate) ? effectiveInterval.endDate : null;
        }
        *calculateLateEndDate() {
            const date = yield this.$.lateEndDateRaw;
            return yield* this.maybeSkipNonWorkingTime(date, false);
        }
        *calculateTotalSlack() {
            const earlyStartDate = yield this.$.earlyStartDateRaw;
            const lateStartDate = yield this.$.lateStartDateRaw;
            const earlyEndDate = yield this.$.earlyEndDateRaw;
            const lateEndDate = yield this.$.lateEndDateRaw;
            const slackUnit = yield this.$.slackUnit;
            let endSlack, result;
            if ((earlyStartDate && lateStartDate) || (earlyEndDate && lateEndDate)) {
                if (earlyStartDate && lateStartDate) {
                    result = yield* this.calculateProjectedDuration(earlyStartDate, lateStartDate, slackUnit);
                    if (earlyEndDate && lateEndDate) {
                        endSlack = yield* this.calculateProjectedDuration(earlyEndDate, lateEndDate, slackUnit);
                        if (endSlack < result)
                            result = endSlack;
                    }
                }
                else if (earlyEndDate && lateEndDate) {
                    result = yield* this.calculateProjectedDuration(earlyEndDate, lateEndDate, slackUnit);
                }
            }
            return result;
        }
        *calculateCritical() {
            const totalSlack = yield this.$.totalSlack;
            return totalSlack <= 0;
        }
        *isConstrainedLate() {
            const startDateIntervals = yield this.$.startDateConstraintIntervals;
            const endDateIntervals = yield this.$.endDateConstraintIntervals;
            const lateStartDateConstraintIntervals = yield this.$.lateStartDateConstraintIntervals;
            const lateEndDateConstraintIntervals = yield this.$.lateEndDateConstraintIntervals;
            return Boolean(startDateIntervals?.length || endDateIntervals?.length || lateStartDateConstraintIntervals?.length || lateEndDateConstraintIntervals?.length);
        }
        *calculateStartDatePure() {
            const direction = yield this.$.direction;
            if (direction === Direction.Backward) {
                // early exit if this mixin is not applicable, but only after(!) the direction check
                // this is because the `isConstrainedLate` yield early constraint intervals, which are generally lazy,
                // depending from the direction
                if (!(yield* this.isConstrainedLate()) || (yield this.$.manuallyScheduled)) {
                    return yield* superProto.calculateStartDatePure.call(this);
                }
                return yield this.$.lateStartDate;
            }
            else {
                return yield* superProto.calculateStartDatePure.call(this);
            }
        }
        *calculateStartDateProposed() {
            const direction = yield this.$.direction;
            switch (direction) {
                case Direction.Backward:
                    // early exit if this mixin is not applicable, but only after(!) the direction check
                    // this is because the `isConstrainedLate` yield early constraint intervals, which are generally lazy,
                    // depending from the direction
                    if (!(yield* this.isConstrainedLate()) || (yield this.$.manuallyScheduled)) {
                        return yield* superProto.calculateStartDateProposed.call(this);
                    }
                    return (yield this.$.lateStartDate) || (yield* superProto.calculateStartDateProposed.call(this));
                default:
                    return yield* superProto.calculateStartDateProposed.call(this);
            }
        }
        *calculateEndDatePure() {
            const direction = yield this.$.direction;
            if (direction === Direction.Backward) {
                // early exit if this mixin is not applicable, but only after(!) the direction check
                // this is because the `isConstrainedLate` yield early constraint intervals, which are generally lazy,
                // depending from the direction
                if (!(yield* this.isConstrainedLate()) || (yield this.$.manuallyScheduled)) {
                    return yield* superProto.calculateEndDatePure.call(this);
                }
                return yield this.$.lateEndDate;
            }
            else {
                return yield* superProto.calculateEndDatePure.call(this);
            }
        }
        *calculateEndDateProposed() {
            const direction = yield this.$.direction;
            switch (direction) {
                case Direction.Backward:
                    // early exit if this mixin is not applicable, but only after(!) the direction check
                    // this is because the `isConstrainedLate` yield early constraint intervals, which are generally lazy,
                    // depending from the direction
                    if (!(yield* this.isConstrainedLate()) || (yield this.$.manuallyScheduled)) {
                        return yield* superProto.calculateEndDateProposed.call(this);
                    }
                    return (yield this.$.lateEndDate) || (yield* superProto.calculateEndDateProposed.call(this));
                default:
                    return yield* superProto.calculateEndDateProposed.call(this);
            }
        }
    }
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedLateEventMixin.prototype, "minChildrenLateStartDate", void 0);
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedLateEventMixin.prototype, "lateStartDateRaw", void 0);
    __decorate([
        model_field({ type: 'date', persist: false }, { lazy: EarlyLateLazyness, converter: dateConverter, persistent: false })
    ], ConstrainedLateEventMixin.prototype, "lateStartDate", void 0);
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedLateEventMixin.prototype, "maxChildrenLateEndDate", void 0);
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedLateEventMixin.prototype, "lateEndDateRaw", void 0);
    __decorate([
        model_field({ type: 'date', persist: false }, { lazy: EarlyLateLazyness, converter: dateConverter, persistent: false })
    ], ConstrainedLateEventMixin.prototype, "lateEndDate", void 0);
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedLateEventMixin.prototype, "lateStartDateConstraintIntervals", void 0);
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedLateEventMixin.prototype, "lateEndDateConstraintIntervals", void 0);
    __decorate([
        model_field({ type: 'number', persist: false }, { lazy: EarlyLateLazyness, persistent: false })
    ], ConstrainedLateEventMixin.prototype, "totalSlack", void 0);
    __decorate([
        model_field({ type: 'string', defaultValue: TimeUnit.Day, persist: false }, { lazy: EarlyLateLazyness, converter: DateHelper.normalizeUnit, persistent: false })
    ], ConstrainedLateEventMixin.prototype, "slackUnit", void 0);
    __decorate([
        model_field({ type: 'boolean', defaultValue: false, persist: false }, { persistent: false, lazy: EarlyLateLazyness })
    ], ConstrainedLateEventMixin.prototype, "critical", void 0);
    __decorate([
        calculate('lateStartDateConstraintIntervals')
    ], ConstrainedLateEventMixin.prototype, "calculateLateStartDateConstraintIntervals", null);
    __decorate([
        calculate('lateEndDateConstraintIntervals')
    ], ConstrainedLateEventMixin.prototype, "calculateLateEndDateConstraintIntervals", null);
    __decorate([
        calculate('minChildrenLateStartDate')
    ], ConstrainedLateEventMixin.prototype, "calculateMinChildrenLateStartDate", null);
    __decorate([
        calculate('lateStartDateRaw')
    ], ConstrainedLateEventMixin.prototype, "calculateLateStartDateRaw", null);
    __decorate([
        calculate('maxChildrenLateEndDate')
    ], ConstrainedLateEventMixin.prototype, "calculateMaxChildrenLateEndDate", null);
    __decorate([
        calculate('lateStartDate')
    ], ConstrainedLateEventMixin.prototype, "calculateLateStartDate", null);
    __decorate([
        calculate('lateEndDateRaw')
    ], ConstrainedLateEventMixin.prototype, "calculateLateEndDateRaw", null);
    __decorate([
        calculate('lateEndDate')
    ], ConstrainedLateEventMixin.prototype, "calculateLateEndDate", null);
    __decorate([
        calculate('totalSlack')
    ], ConstrainedLateEventMixin.prototype, "calculateTotalSlack", null);
    __decorate([
        calculate('critical')
    ], ConstrainedLateEventMixin.prototype, "calculateCritical", null);
    return ConstrainedLateEventMixin;
}) {
}
