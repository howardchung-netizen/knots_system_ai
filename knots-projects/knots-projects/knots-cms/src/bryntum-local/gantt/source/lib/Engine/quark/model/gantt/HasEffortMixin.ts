import { ProposedOrPrevious } from "../../../../ChronoGraph/chrono/Effect.js"
import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { Identifier } from "../../../../ChronoGraph/chrono/Identifier.js"
import { Quark } from "../../../../ChronoGraph/chrono/Quark.js"
import { Transaction } from "../../../../ChronoGraph/chrono/Transaction.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { calculate, write } from "../../../../ChronoGraph/replica/Entity.js"
import DateHelper from "../../../../Core/helper/DateHelper.js"
import { CalendarCacheIntervalMultiple } from "../../../calendar/CalendarCacheIntervalMultiple.js"
import { model_field } from "../../../chrono/ModelFieldAtom.js"
import { Duration, TimeUnit } from "../../../scheduling/Types.js"
import { BaseCalendarMixin } from "../scheduler_basic/BaseCalendarMixin.js"
import { HasChildrenMixin } from "../scheduler_basic/HasChildrenMixin.js"
import { GanttHasAssignmentsMixin } from "./GanttHasAssignmentsMixin.js"
import { GanttAssignmentMixin } from "./GanttAssignmentMixin.js"

//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin provides an `effort` field which does not affect scheduling.

 * It also provides various generic methods to schedule task based on effort information. Those are
 * used in other mixins.
 */
export class HasEffortMixin extends Mixin(
    [ GanttHasAssignmentsMixin, HasChildrenMixin ],
    (base : AnyConstructor<GanttHasAssignmentsMixin & HasChildrenMixin, typeof GanttHasAssignmentsMixin & typeof HasChildrenMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class HasEffortMixin extends base {

        // default value breaks normalization of effort to duration, need to decide what we want,
        // current behavior is to normalize effort to duration
        /**
         * The effort of this event. See also [[effortUnit]].
         */
        @model_field({ 'type' : 'number'/*, defaultValue : 0*/ })
        effort          : Duration

        /**
         * The time unit of the [[effort]] field.
         */
        @model_field({ 'type' : 'string', defaultValue : TimeUnit.Hour }, { converter : DateHelper.normalizeUnit })
        effortUnit      : TimeUnit

        /**
         * Generated setter for the effort
         */
        setEffort : (effort : Duration, unit? : TimeUnit) => Promise<CommitResult>

        /**
         * Getter for the effort. Can return return effort in given unit, or will use [[effortUnit]].
         *
         * @param unit
         */
        getEffort (unit? : TimeUnit) : Duration {
            const effort        = this.effort

            return unit !== undefined ? this.getProject().convertDuration(effort, this.effortUnit, unit) : effort
        }


        @write('effort')
        writeEffort (me : Identifier, transaction : Transaction, quark : Quark, effort : Duration, unit? : TimeUnit) : Promise<CommitResult> {
            if (effort < 0) effort = 0

            if (!transaction.baseRevision.hasIdentifier(me) && effort == null) return

            if (unit != null && unit !== this.effortUnit) {
                this.$.effortUnit.write.call(this, this.$.effortUnit, transaction, null, unit)
            }

            me.constructor.prototype.write(me, transaction, quark, effort)
        }


        /**
         * Generated getter for the [[effortUnit]]
         */
        getEffortUnit : () => TimeUnit

        setEffortUnit (_value : TimeUnit) {
            throw new Error("Use `setEffort` instead")
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
        * shouldRollupChildEffort (childEvent : HasEffortMixin) : CalculationIterator<boolean> {
            return true
        }


        /**
         * Helper method to calculate the total effort of all child events.
         */
        * calculateTotalChildrenEffort () : CalculationIterator<Duration> {
            const childEvents : Set<HasEffortMixin> = yield this.$.childEvents

            const project                       = this.getProject()

            let totalEffortMs : Duration        = 0

            for (const childEvent of childEvents) {
                if (!(yield * this.shouldRollupChildEffort(childEvent))) continue

                const childEventEffortUnit : TimeUnit     = yield childEvent.$.effortUnit

                totalEffortMs += yield* project.$convertDuration(yield childEvent.$.effort, childEventEffortUnit, TimeUnit.Millisecond)
            }

            return yield* project.$convertDuration(totalEffortMs, TimeUnit.Millisecond, yield this.$.effortUnit)
        }


        @calculate('effort')
        * calculateEffort () : CalculationIterator<Duration> {
            const childEvents : Set<HasEffortMixin> = yield this.$.childEvents

            if (childEvents.size > 0)
                return yield* this.calculateTotalChildrenEffort()
            else {
                const proposed      = yield ProposedOrPrevious

                return proposed !== undefined ? proposed : yield* this.calculateEffortPure()
            }
        }


        * calculateEffortPure () : CalculationIterator<Duration> {
            const childEvents : Set<HasEffortMixin> = yield this.$.childEvents

            if (childEvents.size > 0)
                return yield* this.calculateTotalChildrenEffort()
            else {
                return yield* this.calculateProjectedEffort(yield this.$.startDate, yield this.$.endDate)
            }
        }


        * calculateEffortProposed () : CalculationIterator<Duration> {
            return yield ProposedOrPrevious
        }


        * calculateAssignmentUnits (assignment : GanttAssignmentMixin) : CalculationIterator<number> {
            return yield* this.calculateAssignmentUnitsProposed(assignment)
        }


        * calculateAssignmentUnitsPure (assignment : GanttAssignmentMixin) : CalculationIterator<number> {
            return yield* this.calculateUnitsByStartEndAndEffort(assignment)
        }


        * calculateAssignmentUnitsProposed (assignment : GanttAssignmentMixin) : CalculationIterator<number> {
            return yield ProposedOrPrevious
        }


        * getBaseOptionsForEffortCalculations () : CalculationIterator<{ ignoreResourceCalendars : boolean }> {
            return { ignoreResourceCalendars : false }
        }


        * calculateProjectedEffort (startDate : Date, endDate : Date) : CalculationIterator<Duration> {
            if (startDate == null || endDate == null || startDate > endDate) return null

            const assignmentsByCalendar : this[ 'assignmentsByCalendar' ]   = yield this.$.assignmentsByCalendar

            const totalUnitsByCalendar : Map<BaseCalendarMixin, number>         = new Map()

            for (const [ calendar, assignments ] of assignmentsByCalendar) {
                let intervalUnits = 0

                for (const assignment of assignments) {
                    intervalUnits           += (yield assignment.$.units)
                }

                totalUnitsByCalendar.set(calendar, intervalUnits)
            }

            //----------------------
            let resultN : number                    = 0

            const options   = Object.assign(
                yield* this.getBaseOptionsForEffortCalculations(),
                { startDate, endDate }
            )

            // if event has no assignments we treat that as it has a special, "virtual" assignment with 100 units and
            // the calendar matching the calendar of the task
            // we need to ignore resource calendars in this case, since there's no assigned resources
            if (totalUnitsByCalendar.size === 0) {
                totalUnitsByCalendar.set(yield this.$.effectiveCalendar, 100)
                options.ignoreResourceCalendars = true
            }

            yield* this.forEachAvailabilityInterval(
                options,

                (intervalStart : Date, intervalEnd : Date, calendarCacheIntervalMultiple : CalendarCacheIntervalMultiple) => {
                    const workCalendars     = calendarCacheIntervalMultiple.getCalendarsWorking() as BaseCalendarMixin[]

                    const intervalStartN : number   = intervalStart.getTime(),
                        intervalEndN : number       = intervalEnd.getTime(),
                        intervalDuration : Duration = intervalEndN - intervalStartN

                    let intervalUnits               = 0

                    for (const workingCalendar of workCalendars) {
                        // the calendar of the event itself will be in the `workCalendars`, but it
                        // will be missing in the `totalUnitsByCalendar` map, which is fine
                        intervalUnits               += totalUnitsByCalendar.get(workingCalendar) || 0
                    }

                    // Effort = Units * Duration
                    resultN                         += intervalUnits * intervalDuration * 0.01
                }
            )

            return yield* this.getProject().$convertDuration(resultN, TimeUnit.Millisecond, yield this.$.effortUnit)
        }


        * calculateUnitsByStartEndAndEffort (_assignment : GanttAssignmentMixin) : CalculationIterator<number> {
            const effort : Duration                 = yield this.$.effort,
                effortUnit : TimeUnit               = yield this.$.effortUnit,
                effortMS                            = yield* this.getProject().$convertDuration(effort, effortUnit, TimeUnit.Millisecond)

            let collectedEffort : number            = 0

            const options   = Object.assign(
                yield* this.getBaseOptionsForEffortCalculations(),
                { startDate : yield this.$.startDate, endDate : yield this.$.endDate}
            )

            const assignmentsByCalendar : this[ 'assignmentsByCalendar' ]   = yield this.$.assignmentsByCalendar

            yield* this.forEachAvailabilityInterval(
                options,
                (intervalStart, intervalEnd, calendarCacheIntervalMultiple) => {
                    const workCalendars             = calendarCacheIntervalMultiple.getCalendarsWorking() as BaseCalendarMixin[]

                    const intervalStartN : number   = intervalStart.getTime(),
                        intervalEndN : number       = intervalEnd.getTime(),
                        intervalDuration : Duration = intervalEndN - intervalStartN

                    for (const workingCalendar of workCalendars) {
                        collectedEffort             +=
                            (assignmentsByCalendar.has(workingCalendar) ? assignmentsByCalendar.get(workingCalendar).length : 0) * intervalDuration
                    }
                }
            )

            return collectedEffort ? 100 * effortMS / collectedEffort : 100
        }


        * calculateProjectedXDateByEffort (baseDate : Date, isForward : boolean = true) : CalculationIterator<Date> {
            const effort : Duration                 = yield this.$.effort,
                effortUnit : TimeUnit               = yield this.$.effortUnit,
                effortMS : number                   = yield* this.getProject().$convertDuration(effort, effortUnit, TimeUnit.Millisecond)

            if (baseDate == null || effort == null) return null

            let resultN : number                    = baseDate.getTime()
            let leftEffort : number                 = effortMS

            const calendar : BaseCalendarMixin          = yield this.$.effectiveCalendar

            const assignmentsByCalendar : this[ 'assignmentsByCalendar' ]   = yield this.$.assignmentsByCalendar

            const totalUnitsByCalendar : Map<BaseCalendarMixin, number>         = new Map()

            for (const [ calendar, assignments ] of assignmentsByCalendar) {
                let intervalUnits = 0

                for (const assignment of assignments) {
                    intervalUnits           += (yield assignment.$.units)
                }

                totalUnitsByCalendar.set(calendar, intervalUnits)
            }


            if (assignmentsByCalendar.size > 0) {
                const options   = Object.assign(
                    yield* this.getBaseOptionsForDurationCalculations(),
                    isForward ? { startDate : baseDate, isForward } : { endDate : baseDate, isForward }
                )

                yield* this.forEachAvailabilityInterval(
                    options,

                    (intervalStart : Date, intervalEnd : Date, calendarCacheIntervalMultiple : CalendarCacheIntervalMultiple) => {
                        const workCalendars             = calendarCacheIntervalMultiple.getCalendarsWorking() as BaseCalendarMixin[]

                        const intervalStartN : number   = intervalStart.getTime(),
                            intervalEndN : number       = intervalEnd.getTime(),
                            intervalDuration : Duration = intervalEndN - intervalStartN

                        let intervalUnits               = 0

                        for (const workingCalendar of workCalendars) {
                            // the calendar of the event itself will be in the `workCalendars`, but it
                            // will be missing in the `totalUnitsByCalendar` map, which is fine
                            intervalUnits               += totalUnitsByCalendar.get(workingCalendar) || 0
                        }

                        // Effort = Units * Duration
                        const intervalEffort            = intervalUnits * intervalDuration * 0.01

                        if (intervalEffort >= leftEffort) {
                            // resulting date is interval start plus left duration (Duration = Effort / Units)
                            resultN                     =
                                isForward
                                ?
                                    intervalStartN + leftEffort / (0.01 * intervalUnits)
                                :
                                    intervalEndN - leftEffort / (0.01 * intervalUnits)

                            return false

                        } else {
                            leftEffort                  -= intervalEffort
                        }
                    }
                )

                return new Date(resultN)
            }
            else {
                return calendar.accumulateWorkingTime(baseDate, effortMS, isForward).finalDate
            }
        }
    }

    return HasEffortMixin
}){}
