var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Reject } from "../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from '../../../../ChronoGraph/class/BetterMixin.js';
import { calculate, field } from '../../../../ChronoGraph/replica/Entity.js';
import { ConflictEffect, ConstraintInterval } from "../../../chrono/Conflict.js";
import { dateConverter, model_field } from '../../../chrono/ModelFieldAtom.js';
import { intersectIntervals } from '../../../scheduling/DateInterval.js';
import { Direction, ConstraintIntervalSide } from '../../../scheduling/Types.js';
import { isDateFinite, MAX_DATE, MIN_DATE } from "../../../util/Constants.js";
import { HasSubEventsMixin } from "../scheduler_basic/HasSubEventsMixin.js";
import { EffectResolutionResult } from "../../../chrono/SchedulingIssueEffect.js";
//---------------------------------------------------------------------------------------------------------------------
export const calculateEffectiveStartDateConstraintInterval = function* (event, startDateIntervalIntersection, endDateIntervalIntersection, duration, collectIntersectionMeta) {
    if (endDateIntervalIntersection.isIntervalEmpty())
        return endDateIntervalIntersection; //EMPTY_INTERVAL
    // If intersection details collecting is enabled (need this when preparing a scheduling conflict info)
    if (collectIntersectionMeta && endDateIntervalIntersection.intersectionOf) {
        const reflectedIntervals = new Set();
        // Iterate over the intervals that took part in "endDateIntervalIntersection" building
        // and reflect each of them to task "End" side.
        // So we could compare each interval one by one.
        for (const interval of endDateIntervalIntersection.intersectionOf) {
            if (interval.isInfinite()) {
                reflectedIntervals.add(interval);
            }
            else {
                const startDate = interval.startDateIsFinite()
                    ?
                        yield* event.calculateProjectedXDateWithDuration(interval.startDate, false, duration)
                    :
                        interval.startDate;
                const endDate = interval.endDateIsFinite()
                    ?
                        yield* event.calculateProjectedXDateWithDuration(interval.endDate, false, duration)
                    :
                        interval.endDate;
                // @ts-ignore
                reflectedIntervals.add(interval.copyWith({
                    reflectionOf: interval,
                    side: interval.side === ConstraintIntervalSide.Start ? ConstraintIntervalSide.End : ConstraintIntervalSide.Start,
                    startDate,
                    endDate,
                }));
            }
        }
        // override intersectionOf with reflected intervals
        endDateIntervalIntersection.intersectionOf = reflectedIntervals;
    }
    const startDate = endDateIntervalIntersection.startDateIsFinite()
        ?
            yield* event.calculateProjectedXDateWithDuration(endDateIntervalIntersection.startDate, false, duration)
        :
            null;
    const endDate = endDateIntervalIntersection.endDateIsFinite()
        ?
            yield* event.calculateProjectedXDateWithDuration(endDateIntervalIntersection.endDate, false, duration)
        :
            null;
    return intersectIntervals([
        startDateIntervalIntersection,
        ConstraintInterval.new({
            intersectionOf: endDateIntervalIntersection.intersectionOf,
            startDate,
            endDate
        })
    ], collectIntersectionMeta);
};
export const calculateEffectiveEndDateConstraintInterval = function* (event, startDateIntervalIntersection, endDateIntervalIntersection, duration, collectIntersectionMeta) {
    if (startDateIntervalIntersection.isIntervalEmpty())
        return startDateIntervalIntersection; //EMPTY_INTERVAL
    // If intersection details collecting is enabled (need this when preparing a scheduling conflict info)
    if (collectIntersectionMeta) {
        const reflectedIntervals = new Set();
        // Iterate over the intervals that took part in "startDateIntervalIntersection" building
        // and reflect each of them to task "End" side.
        // So we could compare each interval one by one.
        for (const interval of startDateIntervalIntersection.intersectionOf) {
            // no need to reflect infinite intervals
            if (interval.isInfinite()) {
                reflectedIntervals.add(interval);
            }
            // reflect finite interval
            else {
                const startDate = interval.startDateIsFinite()
                    ?
                        yield* event.calculateProjectedXDateWithDuration(interval.startDate, true, duration)
                    :
                        interval.startDate;
                const endDate = interval.endDateIsFinite()
                    ?
                        yield* event.calculateProjectedXDateWithDuration(interval.endDate, true, duration)
                    :
                        interval.endDate;
                // Make a reflection of the interval
                // @ts-ignore
                reflectedIntervals.add(interval.copyWith({
                    reflectionOf: interval,
                    side: interval.side === ConstraintIntervalSide.Start ? ConstraintIntervalSide.End : ConstraintIntervalSide.Start,
                    startDate,
                    endDate,
                }));
            }
        }
        // override intersectionOf with reflected intervals
        startDateIntervalIntersection.intersectionOf = reflectedIntervals;
    }
    const startDate = startDateIntervalIntersection.startDateIsFinite()
        ?
            yield* event.calculateProjectedXDateWithDuration(startDateIntervalIntersection.startDate, true, duration)
        :
            null;
    const endDate = startDateIntervalIntersection.endDateIsFinite()
        ?
            yield* event.calculateProjectedXDateWithDuration(startDateIntervalIntersection.endDate, true, duration)
        :
            null;
    return intersectIntervals([
        endDateIntervalIntersection,
        ConstraintInterval.new({
            reflectionOf: startDate || endDate ? startDateIntervalIntersection : undefined,
            intersectionOf: startDate || endDate ? startDateIntervalIntersection.intersectionOf : undefined,
            startDate,
            endDate
        }),
    ], collectIntersectionMeta);
};
export const EarlyLateLazyness = true;
//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin provides the constraint-based scheduling. Event is scheduled according to the set of _constraints_
 * which can be applied to start date or end date.
 *
 * Scheduling by constraints for an event can be disabled by setting its [[manuallyScheduled]] flag to `true`, which will delegate to previous behavior.
 *
 * The constraint is represented with the [[DateInterval]] class, which indicates the "allowed" interval for the
 * point being constrained.
 *
 * Scheduling by constraints algorithm
 * ---------------------------------
 *
 * Constraints for start date are accumulated in the [[earlyStartDateConstraintIntervals]] and [[startDateConstraintIntervals]] fields.
 * Constraints for end date are accumulated in the [[earlyEndDateConstraintIntervals]] and [[endDateConstraintIntervals]] fields.
 *
 * This mixin does not define where the constraints for the event comes from. The constraints are calculated in the field
 * calculation methods, (like [[calculateEarlyStartDateConstraintIntervals]]) which just return empty arrays. Some other mixins
 * may override those methods and can generate actual constraints (the [[ScheduledByDependenciesEarlyEventMixin]] is an example).

 * The "early" fields contains the constraints which are related to scheduling event in the as-soon-as-possible manner.
 * The fields w/o "early" prefix contains the constraints which do not related to the ASAP scheduling.
 *
 * "Early" and "normal" constraints for every date are combined, then intersected, which gives "combined" constraining interval.
 *
 * So at this point we have a "combined" constraining interval for start date and for end date.
 *
 * Then, the interval for start date is shifted on the event duration to the right and this gives an additional constraint for the
 * end date. The similar operation is done with the interval for the end date.
 *
 * After intersection with those additional intervals we receive the final constraining interval for both dates. Since we
 * are using the ASAP scheduling, we just pick the earliest possible date.
 *
 * If any of intervals is empty then we consider it as scheduling conflict, and [[EngineReplica.reject|reject]] the transaction.
 *
 */
export class ConstrainedEarlyEventMixin extends Mixin([HasSubEventsMixin], (base) => {
    const superProto = base.prototype;
    class ConstrainedEarlyEventMixin extends base {
        // Skips non-working time if it's needed to the event
        *maybeSkipNonWorkingTime(date, isForward = true) {
            let duration = yield* this.calculateEffectiveDuration();
            return date && duration > 0 ? yield* this.skipNonWorkingTime(date, isForward) : date;
        }
        *calculateEffectiveConstraintInterval(isStartDate, startDateConstraintIntervals, endDateConstraintIntervals, collectIntersectionMeta = false) {
            const effectiveDurationToUse = yield* this.calculateEffectiveDuration();
            if (effectiveDurationToUse == null) {
                return null;
            }
            const calculateIntervalFn = (isStartDate ? calculateEffectiveStartDateConstraintInterval : calculateEffectiveEndDateConstraintInterval);
            const effectiveInterval = yield* calculateIntervalFn(this, intersectIntervals(startDateConstraintIntervals, collectIntersectionMeta), intersectIntervals(endDateConstraintIntervals, collectIntersectionMeta), effectiveDurationToUse, collectIntersectionMeta);
            return effectiveInterval;
        }
        /**
         * Calculation method for the [[startDateConstraintIntervals]]. Returns empty array by default.
         * Override this method to return some extra constraints for the start date.
         */
        *calculateStartDateConstraintIntervals() {
            return [];
        }
        /**
         * Calculation method for the [[endDateConstraintIntervals]]. Returns empty array by default.
         * Override this method to return some extra constraints for the end date.
         */
        *calculateEndDateConstraintIntervals() {
            return [];
        }
        /**
         * Calculation method for the [[earlyStartDateConstraintIntervals]]. Returns empty array by default.
         * Override this method to return some extra constraints for the start date during the ASAP scheduling.
         */
        *calculateEarlyStartDateConstraintIntervals() {
            return [];
        }
        /**
         * Calculation method for the [[earlyEndDateConstraintIntervals]]. Returns empty array by default.
         * Override this method to return some extra constraints for the end date during the ASAP scheduling.
         */
        *calculateEarlyEndDateConstraintIntervals() {
            return [];
        }
        *doCalculateEarlyEffectiveStartDateInterval(collectIntersectionMeta = false) {
            const startDateConstraintIntervals = yield this.$.earlyStartDateConstraintIntervals;
            const endDateConstraintIntervals = yield this.$.earlyEndDateConstraintIntervals;
            return yield* this.calculateEffectiveConstraintInterval(true, 
            // need to use concat instead of directly mutating the `startDateConstraintIntervals` since that is
            // used as storage for `this.$.earlyStartDateConstraintIntervals`
            startDateConstraintIntervals.concat(yield this.$.startDateConstraintIntervals), endDateConstraintIntervals.concat(yield this.$.endDateConstraintIntervals), collectIntersectionMeta);
        }
        *calculateEarlyEffectiveStartDateInterval() {
            return yield* this.doCalculateEarlyEffectiveStartDateInterval();
        }
        *doCalculateEarlyEffectiveEndDateInterval(collectIntersectionMeta = false) {
            const startDateConstraintIntervals = yield this.$.earlyStartDateConstraintIntervals;
            const endDateConstraintIntervals = yield this.$.earlyEndDateConstraintIntervals;
            return yield* this.calculateEffectiveConstraintInterval(false, 
            // need to use concat instead of directly mutating the `startDateConstraintIntervals` since that is
            // used as storage for `this.$.earlyStartDateConstraintIntervals`
            startDateConstraintIntervals.concat(yield this.$.startDateConstraintIntervals), endDateConstraintIntervals.concat(yield this.$.endDateConstraintIntervals), collectIntersectionMeta);
        }
        *calculateEarlyEffectiveEndDateInterval() {
            return yield* this.doCalculateEarlyEffectiveEndDateInterval();
        }
        /**
         * The method defines wether the provided child event should be
         * taken into account when calculating this summary event [[earlyStartDate]].
         * Child events roll up their [[earlyStartDate]] values to their summary tasks.
         * So a summary task [[earlyStartDate]] date gets equal to its minimal child [[earlyStartDate]].
         *
         * If the method returns `true` the child event is taken into account
         * and if the method returns `false` it's not.
         * By default the method returns `true` to include all child events data.
         * @param childEvent Child event to consider.
         * @returns `true` if the provided event should be taken into account, `false` if not.
         */
        *shouldRollupChildEarlyStartDate(child) {
            return true;
        }
        *calculateMinChildrenEarlyStartDate() {
            let result = MAX_DATE;
            const subEventsIterator = yield* this.subEventsIterable();
            for (let childEvent of subEventsIterator) {
                let childDate;
                if (!(yield* this.shouldRollupChildEarlyStartDate(childEvent)))
                    continue;
                if ((yield childEvent.$.manuallyScheduled) && (yield* childEvent.hasSubEvents())) {
                    childDate = yield childEvent.$.minChildrenEarlyStartDate;
                }
                childDate = childDate || (yield childEvent.$.earlyStartDate);
                if (childDate && childDate < result)
                    result = childDate;
            }
            return result.getTime() - MAX_DATE.getTime() ? result : null;
        }
        /**
         * The method defines wether the provided child event should be
         * taken into account when calculating this summary event [[earlyEndDate]].
         * Child events roll up their [[earlyEndDate]] values to their summary tasks.
         * So a summary task [[earlyEndDate]] gets equal to its maximal child [[earlyEndDate]].
         *
         * If the method returns `true` the child event is taken into account
         * and if the method returns `false` it's not.
         * By default the method returns `true` to include all child events data.
         * @param childEvent Child event to consider.
         * @returns `true` if the provided event should be taken into account, `false` if not.
         */
        *shouldRollupChildEarlyEndDate(child) {
            return true;
        }
        *calculateMaxChildrenEarlyEndDate() {
            let result = MIN_DATE;
            const subEventsIterator = yield* this.subEventsIterable();
            for (let childEvent of subEventsIterator) {
                let childDate;
                if (!(yield* this.shouldRollupChildEarlyEndDate(childEvent)))
                    continue;
                if ((yield childEvent.$.manuallyScheduled) && (yield* childEvent.hasSubEvents())) {
                    childDate = yield childEvent.$.maxChildrenEarlyEndDate;
                }
                childDate = childDate || (yield childEvent.$.earlyEndDate);
                if (childDate && childDate > result)
                    result = childDate;
            }
            return result.getTime() - MIN_DATE.getTime() ? result : null;
        }
        *calculateEarlyStartDateRaw() {
            // Manually scheduled task treat its current start date as its early start date
            // in case of forward scheduling.
            // Late dates in that case are calculated the same way it happens for automatic tasks
            if ((yield this.$.manuallyScheduled) && (yield this.$.direction) === Direction.Forward) {
                return yield this.$.startDate;
            }
            // Parent task calculate its early start date as minimal early start date of its children
            if (yield* this.hasSubEvents()) {
                return yield this.$.minChildrenEarlyStartDate;
            }
            if (!(yield* this.isConstrainedEarly())) {
                return yield this.$.startDate;
            }
            let effectiveInterval = yield this.$.earlyEffectiveStartDateInterval;
            if (effectiveInterval === null) {
                return null;
            }
            else if (effectiveInterval.isIntervalEmpty()) {
                // re-calculate effective resulting interval gathering intersection history
                effectiveInterval = yield* this.doCalculateEarlyEffectiveStartDateInterval(true);
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
            return isDateFinite(effectiveInterval.startDate) ? effectiveInterval.startDate : null;
        }
        *calculateEarlyStartDate() {
            const date = yield this.$.earlyStartDateRaw;
            return yield* this.maybeSkipNonWorkingTime(date, true);
        }
        *calculateEarlyEndDateRaw() {
            // Manually scheduled task treat its current end date as its early end date
            // in case of forward scheduling.
            // Late dates in that case are calculated the same way it happens for automatic tasks
            if ((yield this.$.manuallyScheduled) && (yield this.$.direction) === Direction.Forward) {
                return yield this.$.endDate;
            }
            // Parent task calculate its early end date as maximum early end date of its children
            if (yield* this.hasSubEvents()) {
                return yield this.$.maxChildrenEarlyEndDate;
            }
            if (!(yield* this.isConstrainedEarly())) {
                return yield this.$.endDate;
            }
            let effectiveInterval = yield this.$.earlyEffectiveEndDateInterval;
            if (effectiveInterval === null) {
                return null;
            }
            else if (effectiveInterval.isIntervalEmpty()) {
                // re-calculate effective resulting interval gathering intersection history
                effectiveInterval = yield* this.doCalculateEarlyEffectiveEndDateInterval(true);
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
            return isDateFinite(effectiveInterval.startDate) ? effectiveInterval.startDate : null;
        }
        *calculateEarlyEndDate() {
            return yield this.$.earlyEndDateRaw;
        }
        *isConstrainedEarly() {
            const startDateIntervals = yield this.$.startDateConstraintIntervals;
            const endDateIntervals = yield this.$.endDateConstraintIntervals;
            const earlyStartDateConstraintIntervals = yield this.$.earlyStartDateConstraintIntervals;
            const earlyEndDateConstraintIntervals = yield this.$.earlyEndDateConstraintIntervals;
            return Boolean(startDateIntervals?.length || endDateIntervals?.length || earlyStartDateConstraintIntervals?.length || earlyEndDateConstraintIntervals?.length);
        }
        *calculateStartDatePure() {
            const direction = yield this.$.direction;
            if (direction === Direction.Forward) {
                // early exit if this mixin is not applicable, but only after(!) the direction check
                // this is because the `isConstrainedEarly` yield early constraint intervals, which are generally lazy,
                // depending from the direction
                if (!(yield* this.isConstrainedEarly()) || (yield this.$.manuallyScheduled)) {
                    return yield* superProto.calculateStartDatePure.call(this);
                }
                return (yield this.$.earlyStartDate) || (yield* superProto.calculateStartDatePure.call(this));
            }
            else {
                return yield* superProto.calculateStartDatePure.call(this);
            }
        }
        *calculateStartDateProposed() {
            const direction = yield this.$.direction;
            switch (direction) {
                case Direction.Forward:
                    // early exit if this mixin is not applicable, but only after(!) the direction check
                    // this is because the `isConstrainedEarly` yield early constraint intervals, which are generally lazy,
                    // depending from the direction
                    if (!(yield* this.isConstrainedEarly()) || (yield this.$.manuallyScheduled)) {
                        return yield* superProto.calculateStartDateProposed.call(this);
                    }
                    const autoStartDate = yield this.$.earlyStartDate;
                    if (autoStartDate) {
                        if (isDateFinite(autoStartDate))
                            return autoStartDate;
                        const baseSchedulingStartDate = yield* superProto.calculateStartDateProposed.call(this);
                        const earlyEffectiveStartDateInterval = yield this.$.earlyEffectiveStartDateInterval;
                        if (earlyEffectiveStartDateInterval.containsDate(baseSchedulingStartDate))
                            return baseSchedulingStartDate;
                        return isDateFinite(earlyEffectiveStartDateInterval.endDate) ? earlyEffectiveStartDateInterval.endDate : baseSchedulingStartDate;
                    }
                    else {
                        return yield* superProto.calculateStartDateProposed.call(this);
                    }
                default:
                    return yield* superProto.calculateStartDateProposed.call(this);
            }
        }
        *calculateEndDatePure() {
            const direction = yield this.$.direction;
            if (direction === Direction.Forward) {
                // early exit if this mixin is not applicable, but only after(!) the direction check
                // this is because the `isConstrainedEarly` yield early constraint intervals, which are generally lazy,
                // depending from the direction
                if (!(yield* this.isConstrainedEarly()) || (yield this.$.manuallyScheduled)) {
                    return yield* superProto.calculateEndDatePure.call(this);
                }
                return (yield this.$.earlyEndDate) || (yield* superProto.calculateEndDatePure.call(this));
            }
            else {
                return yield* superProto.calculateEndDatePure.call(this);
            }
        }
        *calculateEndDateProposed() {
            const direction = yield this.$.direction;
            switch (direction) {
                case Direction.Forward:
                    // early exit if this mixin is not applicable, but only after(!) the direction check
                    // this is because the `isConstrainedEarly` yield early constraint intervals, which are generally lazy,
                    // depending from the direction
                    if (!(yield* this.isConstrainedEarly()) || (yield this.$.manuallyScheduled)) {
                        return yield* superProto.calculateEndDateProposed.call(this);
                    }
                    const autoEndDate = yield this.$.earlyEndDate;
                    if (autoEndDate) {
                        if (isDateFinite(autoEndDate))
                            return autoEndDate;
                        const baseSchedulingEndDate = yield* superProto.calculateEndDateProposed.call(this);
                        const earlyEffectiveEndDateInterval = yield this.$.earlyEffectiveEndDateInterval;
                        if (earlyEffectiveEndDateInterval.containsDate(baseSchedulingEndDate))
                            return baseSchedulingEndDate;
                        return isDateFinite(earlyEffectiveEndDateInterval.endDate) ? earlyEffectiveEndDateInterval.endDate : baseSchedulingEndDate;
                    }
                    else {
                        return yield* superProto.calculateEndDateProposed.call(this);
                    }
                default:
                    return yield* superProto.calculateEndDateProposed.call(this);
            }
        }
        *calculateDirection() {
            const project = this.getProject();
            return yield project.$.direction;
        }
    }
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedEarlyEventMixin.prototype, "minChildrenEarlyStartDate", void 0);
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedEarlyEventMixin.prototype, "earlyStartDateRaw", void 0);
    __decorate([
        model_field({ type: 'date', persist: false }, { lazy: EarlyLateLazyness, converter: dateConverter, persistent: false })
    ], ConstrainedEarlyEventMixin.prototype, "earlyStartDate", void 0);
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedEarlyEventMixin.prototype, "maxChildrenEarlyEndDate", void 0);
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedEarlyEventMixin.prototype, "earlyEndDateRaw", void 0);
    __decorate([
        model_field({ type: 'date', persist: false }, { lazy: EarlyLateLazyness, converter: dateConverter, persistent: false })
    ], ConstrainedEarlyEventMixin.prototype, "earlyEndDate", void 0);
    __decorate([
        field()
    ], ConstrainedEarlyEventMixin.prototype, "startDateConstraintIntervals", void 0);
    __decorate([
        field()
    ], ConstrainedEarlyEventMixin.prototype, "endDateConstraintIntervals", void 0);
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedEarlyEventMixin.prototype, "earlyStartDateConstraintIntervals", void 0);
    __decorate([
        field({ lazy: EarlyLateLazyness })
    ], ConstrainedEarlyEventMixin.prototype, "earlyEndDateConstraintIntervals", void 0);
    __decorate([
        field()
    ], ConstrainedEarlyEventMixin.prototype, "earlyEffectiveStartDateInterval", void 0);
    __decorate([
        field()
    ], ConstrainedEarlyEventMixin.prototype, "earlyEffectiveEndDateInterval", void 0);
    __decorate([
        calculate('startDateConstraintIntervals')
    ], ConstrainedEarlyEventMixin.prototype, "calculateStartDateConstraintIntervals", null);
    __decorate([
        calculate('endDateConstraintIntervals')
    ], ConstrainedEarlyEventMixin.prototype, "calculateEndDateConstraintIntervals", null);
    __decorate([
        calculate('earlyStartDateConstraintIntervals')
    ], ConstrainedEarlyEventMixin.prototype, "calculateEarlyStartDateConstraintIntervals", null);
    __decorate([
        calculate('earlyEndDateConstraintIntervals')
    ], ConstrainedEarlyEventMixin.prototype, "calculateEarlyEndDateConstraintIntervals", null);
    __decorate([
        calculate('earlyEffectiveStartDateInterval')
    ], ConstrainedEarlyEventMixin.prototype, "calculateEarlyEffectiveStartDateInterval", null);
    __decorate([
        calculate('earlyEffectiveEndDateInterval')
    ], ConstrainedEarlyEventMixin.prototype, "calculateEarlyEffectiveEndDateInterval", null);
    __decorate([
        calculate('minChildrenEarlyStartDate')
    ], ConstrainedEarlyEventMixin.prototype, "calculateMinChildrenEarlyStartDate", null);
    __decorate([
        calculate('maxChildrenEarlyEndDate')
    ], ConstrainedEarlyEventMixin.prototype, "calculateMaxChildrenEarlyEndDate", null);
    __decorate([
        calculate('earlyStartDateRaw')
    ], ConstrainedEarlyEventMixin.prototype, "calculateEarlyStartDateRaw", null);
    __decorate([
        calculate('earlyStartDate')
    ], ConstrainedEarlyEventMixin.prototype, "calculateEarlyStartDate", null);
    __decorate([
        calculate('earlyEndDateRaw')
    ], ConstrainedEarlyEventMixin.prototype, "calculateEarlyEndDateRaw", null);
    __decorate([
        calculate('earlyEndDate')
    ], ConstrainedEarlyEventMixin.prototype, "calculateEarlyEndDate", null);
    __decorate([
        calculate('direction')
    ], ConstrainedEarlyEventMixin.prototype, "calculateDirection", null);
    return ConstrainedEarlyEventMixin;
}) {
}
