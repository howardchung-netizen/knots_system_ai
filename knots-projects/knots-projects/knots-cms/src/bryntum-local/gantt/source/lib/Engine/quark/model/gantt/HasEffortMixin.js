var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProposedOrPrevious } from "../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { calculate, write } from "../../../../ChronoGraph/replica/Entity.js";
import DateHelper from "../../../../Core/helper/DateHelper.js";
import { model_field } from "../../../chrono/ModelFieldAtom.js";
import { TimeUnit } from "../../../scheduling/Types.js";
import { HasChildrenMixin } from "../scheduler_basic/HasChildrenMixin.js";
import { GanttHasAssignmentsMixin } from "./GanttHasAssignmentsMixin.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin provides an `effort` field which does not affect scheduling.

 * It also provides various generic methods to schedule task based on effort information. Those are
 * used in other mixins.
 */
export class HasEffortMixin extends Mixin([GanttHasAssignmentsMixin, HasChildrenMixin], (base) => {
    const superProto = base.prototype;
    class HasEffortMixin extends base {
        /**
         * Getter for the effort. Can return return effort in given unit, or will use [[effortUnit]].
         *
         * @param unit
         */
        getEffort(unit) {
            const effort = this.effort;
            return unit !== undefined ? this.getProject().convertDuration(effort, this.effortUnit, unit) : effort;
        }
        writeEffort(me, transaction, quark, effort, unit) {
            if (effort < 0)
                effort = 0;
            if (!transaction.baseRevision.hasIdentifier(me) && effort == null)
                return;
            if (unit != null && unit !== this.effortUnit) {
                this.$.effortUnit.write.call(this, this.$.effortUnit, transaction, null, unit);
            }
            me.constructor.prototype.write(me, transaction, quark, effort);
        }
        setEffortUnit(_value) {
            throw new Error("Use `setEffort` instead");
        }
        /**
         * The method defines wether the provided child event should roll up its [[effort]] to this summary event or not.
         * If the method returns `true` the child event [[effort]] is summed up
         * when calculating this summary event [[effort]].
         * And if the method returns `false` the child effort is not taken into account.
         * By default the method returns `true` to include all child event [[effort]] values.
         * @param childEvent Child event to consider.
         * @returns `true` if the provided event [[effort]] should be included, `false` if not.
         */
        *shouldRollupChildEffort(childEvent) {
            return true;
        }
        /**
         * Helper method to calculate the total effort of all child events.
         */
        *calculateTotalChildrenEffort() {
            const childEvents = yield this.$.childEvents;
            const project = this.getProject();
            let totalEffortMs = 0;
            for (const childEvent of childEvents) {
                if (!(yield* this.shouldRollupChildEffort(childEvent)))
                    continue;
                const childEventEffortUnit = yield childEvent.$.effortUnit;
                totalEffortMs += yield* project.$convertDuration(yield childEvent.$.effort, childEventEffortUnit, TimeUnit.Millisecond);
            }
            return yield* project.$convertDuration(totalEffortMs, TimeUnit.Millisecond, yield this.$.effortUnit);
        }
        *calculateEffort() {
            const childEvents = yield this.$.childEvents;
            if (childEvents.size > 0)
                return yield* this.calculateTotalChildrenEffort();
            else {
                const proposed = yield ProposedOrPrevious;
                return proposed !== undefined ? proposed : yield* this.calculateEffortPure();
            }
        }
        *calculateEffortPure() {
            const childEvents = yield this.$.childEvents;
            if (childEvents.size > 0)
                return yield* this.calculateTotalChildrenEffort();
            else {
                return yield* this.calculateProjectedEffort(yield this.$.startDate, yield this.$.endDate);
            }
        }
        *calculateEffortProposed() {
            return yield ProposedOrPrevious;
        }
        *calculateAssignmentUnits(assignment) {
            return yield* this.calculateAssignmentUnitsProposed(assignment);
        }
        *calculateAssignmentUnitsPure(assignment) {
            return yield* this.calculateUnitsByStartEndAndEffort(assignment);
        }
        *calculateAssignmentUnitsProposed(assignment) {
            return yield ProposedOrPrevious;
        }
        *getBaseOptionsForEffortCalculations() {
            return { ignoreResourceCalendars: false };
        }
        *calculateProjectedEffort(startDate, endDate) {
            if (startDate == null || endDate == null || startDate > endDate)
                return null;
            const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
            const totalUnitsByCalendar = new Map();
            for (const [calendar, assignments] of assignmentsByCalendar) {
                let intervalUnits = 0;
                for (const assignment of assignments) {
                    intervalUnits += (yield assignment.$.units);
                }
                totalUnitsByCalendar.set(calendar, intervalUnits);
            }
            //----------------------
            let resultN = 0;
            const options = Object.assign(yield* this.getBaseOptionsForEffortCalculations(), { startDate, endDate });
            // if event has no assignments we treat that as it has a special, "virtual" assignment with 100 units and
            // the calendar matching the calendar of the task
            // we need to ignore resource calendars in this case, since there's no assigned resources
            if (totalUnitsByCalendar.size === 0) {
                totalUnitsByCalendar.set(yield this.$.effectiveCalendar, 100);
                options.ignoreResourceCalendars = true;
            }
            yield* this.forEachAvailabilityInterval(options, (intervalStart, intervalEnd, calendarCacheIntervalMultiple) => {
                const workCalendars = calendarCacheIntervalMultiple.getCalendarsWorking();
                const intervalStartN = intervalStart.getTime(), intervalEndN = intervalEnd.getTime(), intervalDuration = intervalEndN - intervalStartN;
                let intervalUnits = 0;
                for (const workingCalendar of workCalendars) {
                    // the calendar of the event itself will be in the `workCalendars`, but it
                    // will be missing in the `totalUnitsByCalendar` map, which is fine
                    intervalUnits += totalUnitsByCalendar.get(workingCalendar) || 0;
                }
                // Effort = Units * Duration
                resultN += intervalUnits * intervalDuration * 0.01;
            });
            return yield* this.getProject().$convertDuration(resultN, TimeUnit.Millisecond, yield this.$.effortUnit);
        }
        *calculateUnitsByStartEndAndEffort(_assignment) {
            const effort = yield this.$.effort, effortUnit = yield this.$.effortUnit, effortMS = yield* this.getProject().$convertDuration(effort, effortUnit, TimeUnit.Millisecond);
            let collectedEffort = 0;
            const options = Object.assign(yield* this.getBaseOptionsForEffortCalculations(), { startDate: yield this.$.startDate, endDate: yield this.$.endDate });
            const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
            yield* this.forEachAvailabilityInterval(options, (intervalStart, intervalEnd, calendarCacheIntervalMultiple) => {
                const workCalendars = calendarCacheIntervalMultiple.getCalendarsWorking();
                const intervalStartN = intervalStart.getTime(), intervalEndN = intervalEnd.getTime(), intervalDuration = intervalEndN - intervalStartN;
                for (const workingCalendar of workCalendars) {
                    collectedEffort +=
                        (assignmentsByCalendar.has(workingCalendar) ? assignmentsByCalendar.get(workingCalendar).length : 0) * intervalDuration;
                }
            });
            return collectedEffort ? 100 * effortMS / collectedEffort : 100;
        }
        *calculateProjectedXDateByEffort(baseDate, isForward = true) {
            const effort = yield this.$.effort, effortUnit = yield this.$.effortUnit, effortMS = yield* this.getProject().$convertDuration(effort, effortUnit, TimeUnit.Millisecond);
            if (baseDate == null || effort == null)
                return null;
            let resultN = baseDate.getTime();
            let leftEffort = effortMS;
            const calendar = yield this.$.effectiveCalendar;
            const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
            const totalUnitsByCalendar = new Map();
            for (const [calendar, assignments] of assignmentsByCalendar) {
                let intervalUnits = 0;
                for (const assignment of assignments) {
                    intervalUnits += (yield assignment.$.units);
                }
                totalUnitsByCalendar.set(calendar, intervalUnits);
            }
            if (assignmentsByCalendar.size > 0) {
                const options = Object.assign(yield* this.getBaseOptionsForDurationCalculations(), isForward ? { startDate: baseDate, isForward } : { endDate: baseDate, isForward });
                yield* this.forEachAvailabilityInterval(options, (intervalStart, intervalEnd, calendarCacheIntervalMultiple) => {
                    const workCalendars = calendarCacheIntervalMultiple.getCalendarsWorking();
                    const intervalStartN = intervalStart.getTime(), intervalEndN = intervalEnd.getTime(), intervalDuration = intervalEndN - intervalStartN;
                    let intervalUnits = 0;
                    for (const workingCalendar of workCalendars) {
                        // the calendar of the event itself will be in the `workCalendars`, but it
                        // will be missing in the `totalUnitsByCalendar` map, which is fine
                        intervalUnits += totalUnitsByCalendar.get(workingCalendar) || 0;
                    }
                    // Effort = Units * Duration
                    const intervalEffort = intervalUnits * intervalDuration * 0.01;
                    if (intervalEffort >= leftEffort) {
                        // resulting date is interval start plus left duration (Duration = Effort / Units)
                        resultN =
                            isForward
                                ?
                                    intervalStartN + leftEffort / (0.01 * intervalUnits)
                                :
                                    intervalEndN - leftEffort / (0.01 * intervalUnits);
                        return false;
                    }
                    else {
                        leftEffort -= intervalEffort;
                    }
                });
                return new Date(resultN);
            }
            else {
                return calendar.accumulateWorkingTime(baseDate, effortMS, isForward).finalDate;
            }
        }
    }
    __decorate([
        model_field({ 'type': 'number' /*, defaultValue : 0*/ })
    ], HasEffortMixin.prototype, "effort", void 0);
    __decorate([
        model_field({ 'type': 'string', defaultValue: TimeUnit.Hour }, { converter: DateHelper.normalizeUnit })
    ], HasEffortMixin.prototype, "effortUnit", void 0);
    __decorate([
        write('effort')
    ], HasEffortMixin.prototype, "writeEffort", null);
    __decorate([
        calculate('effort')
    ], HasEffortMixin.prototype, "calculateEffort", null);
    return HasEffortMixin;
}) {
}
