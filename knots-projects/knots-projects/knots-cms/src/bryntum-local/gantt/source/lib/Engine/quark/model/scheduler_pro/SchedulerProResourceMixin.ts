import { AnyConstructor, Base, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { calculate, Entity, field } from "../../../../ChronoGraph/replica/Entity.js"
import { Replica } from "../../../../ChronoGraph/replica/Replica.js"
import { CalendarCacheIntervalMultiple } from "../../../calendar/CalendarCacheIntervalMultiple.js"
import { CalendarCacheMultiple } from "../../../calendar/CalendarCacheMultiple.js"
import { CalendarIntervalMixin } from "../../../calendar/CalendarIntervalMixin.js"
import { CalendarIntervalStore } from "../../../calendar/CalendarIntervalStore.js"
import { CalendarIteratorResult } from "../../../calendar/CalendarCache.js"
import { model_field } from "../../../chrono/ModelFieldAtom.js"
import { BaseCalendarMixin } from "../scheduler_basic/BaseCalendarMixin.js"
import { BaseEventMixin } from "../scheduler_basic/BaseEventMixin.js"
import { BaseResourceMixin } from "../scheduler_basic/BaseResourceMixin.js"
import { SchedulerProProjectMixin } from "./SchedulerProProjectMixin.js"
import { SchedulerProAssignmentMixin } from "./SchedulerProAssignmentMixin.js"
import { CalculatedValueGen, Identifier } from "../../../../ChronoGraph/chrono/Identifier.js"
import { SchedulerProEvent } from "./SchedulerProEvent.js"
import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"

export class ResourceAllocationEventRangeCalendarIntervalMixin extends CalendarIntervalMixin {

    // @model_field({ type : 'boolean', defaultValue : true })
    // isWorking : boolean

    // Calendar classes not entering graph, thus not using @model_field
    static get fields () {
        return [
            { name : 'isWorking', type : 'boolean', defaultValue : true }
        ]
    }

    assignment : SchedulerProAssignmentMixin
}

export class ResourceAllocationEventRangeCalendarIntervalStore extends CalendarIntervalStore {

    modelClass : typeof ResourceAllocationEventRangeCalendarIntervalMixin

    static get defaultConfig () {
        return {
            modelClass      : ResourceAllocationEventRangeCalendarIntervalMixin
        }
    }
}

export class ResourceAllocationEventRangeCalendar extends BaseCalendarMixin {

    intervalStore               : ResourceAllocationEventRangeCalendarIntervalStore

    get intervalStoreClass () : typeof ResourceAllocationEventRangeCalendarIntervalStore {
        return ResourceAllocationEventRangeCalendarIntervalStore
    }

    @model_field({ type : 'boolean', defaultValue : false })
    unspecifiedTimeIsWorking : boolean
}

export class BaseAllocationInterval extends Base {
    /**
     * Tick (time interval) the allocation is collected for.
     */
    tick                : CalendarIntervalMixin

    /**
     * Effort in the [[tick|interval]] in milliseconds.
     */
    effort              : number = 0

    /**
     * Utilization level of the resource (or the assignment if the interval represents the one) in percent.
     */
    units               : number = 0
}

export class AssignmentAllocationInterval extends BaseAllocationInterval {

    /**
     * The assignment.
     */
    assignment          : SchedulerProAssignmentMixin

}

/**
 * Resource allocation information for a certain tick.
 */
export class ResourceAllocationInterval extends BaseAllocationInterval {

    /**
     * The allocated resource.
     */
    resource            : BaseResourceMixin

    /**
     * Maximum possible effort in the [[tick|interval]] in milliseconds.
     */
    maxEffort           : number = 0

    /**
     * Indicates that the resource (or the assignment if the interval represents the one) is over-allocated in the [[tick|interval]].
     * So `true` when [[effort]] is more than [[maxEffort|possible maximum]].
     */
    isOverallocated     : boolean = false

     /**
      * Indicates that the resource (or assignment if the interval represents the one) is under-allocated in the [[tick|interval]].
      * So `true` when [[effort]] is less than [[maxEffort|possible maximum]].
      */
    isUnderallocated    : boolean = false

    /**
     * Resource assignments ingoing in the [[tick|interval]].
     */
    assignments         : Set<SchedulerProAssignmentMixin> = null

    assignmentIntervals : Map<SchedulerProAssignmentMixin, AssignmentAllocationInterval> = null

}

export type Allocation = BaseAllocationInterval[]

/**
 * Resource allocation information.
 */
export type ResourceAllocation = {
    total         : ResourceAllocationInterval[],
    byAssignments : Map<SchedulerProAssignmentMixin, Allocation>
}

export class BaseAllocationInfo extends Entity.mix(Base) {

    /**
     * Ticks to group allocation by.
     * This also specifies the time period to collect allocation for.
     * So the first tick `startDate` is treated as the period start and the last tick `endDate` is the period end.
     */
    ticks                   : CalculatedValueGen<BaseCalendarMixin>

    /**
     * Set to `true` to include inactive events allocation and `false` to skip inactive events (default).
     */
    @field()
    includeInactiveEvents   : boolean

    setIncludeInactiveEvents : (value : boolean) => Promise<CommitResult>

    /**
     * The collected allocation info.
     */
    @field()
    allocation              : any


    allocationIntervalClass : typeof BaseAllocationInterval


    getDefaultAllocationIntervalClass() : this['allocationIntervalClass'] {
        return BaseAllocationInterval
    }


    initialize(props? : Partial<BaseAllocationInfo>) {
        props       = Object.assign({
            includeInactiveEvents   : false,
            allocationIntervalClass : this.getDefaultAllocationIntervalClass()
        }, props)

        super.initialize(props)
    }

}

/**
 * Class implementing _resource allocation report_ - a data representing the provided [[resource]]
 * utilization in the provided period of time.
 * The data is grouped by the provided [[ticks|time intervals]]
 */
export class ResourceAllocationInfo extends BaseAllocationInfo {

    /**
     * Resource to build collect the utilization info of.
     */
    @field()
    resource                : SchedulerProResourceMixin


    allocation              : ResourceAllocation


    allocationIntervalClass : typeof ResourceAllocationInterval


    enterGraph (graph) {
        super.enterGraph(graph)
    }


    leaveGraph (graph) {
        super.leaveGraph(graph)

        if (this.resource) {
            this.resource.entities.delete(this)
        }
    }


    getDefaultAllocationIntervalClass() : this['allocationIntervalClass'] {
        return ResourceAllocationInterval
    }


    * shouldIncludeAssignmentInAllocation(assignment : SchedulerProAssignmentMixin) : CalculationIterator<boolean> {
        const
            event : SchedulerProEvent   = yield assignment.$.event,
            units : number              = yield assignment.$.units,
            includeInactiveEvents       = yield this.$.includeInactiveEvents,
            inactive                    = event && (yield event.$.inactive),// includeInactiveEvents
            startDate : Date            = event && (yield event.$.startDate),
            endDate : Date              = event && (yield event.$.endDate)

        return Boolean(event && units && startDate && endDate && (includeInactiveEvents || !inactive))
    }

    @calculate('allocation')
    * calculateAllocation () : CalculationIterator<this[ 'allocation' ]> {
        const
            total : this[ 'allocation' ]['total']                                               = [],
            ticksCalendar : BaseCalendarMixin                                                   = yield this.ticks,
            resource : SchedulerProResourceMixin                                                = yield this.$.resource,
            includeInactiveEvents : boolean                                                     = yield this.$.includeInactiveEvents,
            assignments : Set<SchedulerProAssignmentMixin>                                      = yield resource.$.assigned,
            assignmentsByCalendar : Map<BaseCalendarMixin, SchedulerProAssignmentMixin[]>       = new Map(),
            eventRanges : Partial<ResourceAllocationEventRangeCalendarIntervalMixin>[]          = []

        const assignmentTicksData : Map<SchedulerProAssignmentMixin, Map<CalendarIntervalMixin, AssignmentAllocationInterval>> = new Map()
        const byAssignments : Map<SchedulerProAssignmentMixin, Allocation> = new Map()

        // collect the resource assignments into assignmentsByCalendar map
        for (const assignment of assignments) {
            // skip missing or unscheduled event assignments
            if (!(yield * this.shouldIncludeAssignmentInAllocation(assignment))) continue

            // we're going to need up-to-date assignment "units" below in this method ..so we yield it here
            yield assignment.$.units

            const
                event : BaseEventMixin  = yield assignment.$.event,
                startDate : Date        = yield event.$.startDate,
                endDate : Date          = yield event.$.endDate

            eventRanges.push({ startDate, endDate, assignment })

            const eventCalendar : BaseCalendarMixin   = yield event.$.effectiveCalendar

            let assignments     = assignmentsByCalendar.get(eventCalendar)

            if (!assignments) {
                assignments     = []
                assignmentsByCalendar.set(eventCalendar, assignments)
            }

            assignmentTicksData.set(assignment, new Map())
            byAssignments.set(assignment, [])

            assignments.push(assignment)
        }

        const eventRangesCalendar : ResourceAllocationEventRangeCalendar = new ResourceAllocationEventRangeCalendar({ intervals : eventRanges })

        // Provide extra calendars:
        // 1) a calendar containing list of ticks to group the resource allocation by
        // 2) a calendar containing list of assigned event start/end ranges
        // 3) assigned task calendars
        const calendars : BaseCalendarMixin[]   = [ ticksCalendar, eventRangesCalendar, ...assignmentsByCalendar.keys() ]

        const ticksData : Map<CalendarIntervalMixin, ResourceAllocationInterval> = new Map()

        // Initialize the resulting array with empty items

        ticksCalendar.intervalStore.forEach(tick => {
            const tickData : ResourceAllocationInterval   = ResourceAllocationInterval.new({ tick, resource })

            ticksData.set(tick, tickData)
            total.push(tickData)

            assignmentTicksData.forEach((ticksData, assignment) => {
                const assignmentTickData : AssignmentAllocationInterval   = AssignmentAllocationInterval.new({ tick, assignment })

                ticksData.set(tick, assignmentTickData)
                byAssignments.get(assignment).push(assignmentTickData)
            })

        })

        let weightedUnitsSum : number,
            weightsSum : number

        const
            startDate               = total[0].tick.startDate,
            endDate                 = total[total.length - 1].tick.endDate,
            iterationOptions : any  = {
                startDate,
                endDate,
                calendars
            },
            ticksTotalDuration  = endDate.getTime() - startDate.getTime()

        // provide extended maxRange if total ticks duration is greater than it
        // TODO change this line when maxRange config is made public on the project
        if (ticksTotalDuration > 5 * 12 * 30 * 24 * 60 * 60 * 1000) {
            iterationOptions.maxRange   = ticksTotalDuration
        }

        yield* resource.forEachAvailabilityInterval(iterationOptions,
            (intervalStartDate, intervalEndDate, intervalData) => {
                const isWorkingCalendar = intervalData.getCalendarsWorkStatus()

                // We are inside a tick interval and it's a working time according
                // to a resource calendar

                if (isWorkingCalendar.get(ticksCalendar)) {

                    const
                        tick                                                                                        = intervalData.intervalsByCalendar.get(ticksCalendar)[0],
                        intervalDuration : number                                                                   = intervalEndDate.getTime() - intervalStartDate.getTime(),
                        tickData : ResourceAllocationInterval                                                       = ticksData.get(tick),
                        tickAssignments : Set<SchedulerProAssignmentMixin>                                          = tickData.assignments || new Set(),
                        tickAssignmentIntervals : Map<SchedulerProAssignmentMixin, AssignmentAllocationInterval>    = tickData.assignmentIntervals || new Map()

                    if (!tickData.assignments) {
                        weightedUnitsSum        = 0
                        weightsSum              = 0
                    }

                    let units : number          = 0,
                        duration : number,
                        intervalHasAssignments  = false

                    intervalData.intervalsByCalendar.get(eventRangesCalendar).forEach((interval : ResourceAllocationEventRangeCalendarIntervalMixin) => {
                        const assignment : SchedulerProAssignmentMixin = interval.assignment

                        // TODO:
                        // We don't do yield "assignment.event.*" expressions since we did it previously
                        // while looping the assignments because we cannot yield from the iterator callback
                        if (assignment && isWorkingCalendar.get(assignment.event.effectiveCalendar)) {
                            // constrain the event start/end with the tick borders
                            const workingStartDate      = Math.max(intervalStartDate.getTime(), assignment.event.startDate.getTime())
                            const workingEndDate        = Math.min(intervalEndDate.getTime(), assignment.event.endDate.getTime())

                            intervalHasAssignments      = true

                            duration                    = workingEndDate - workingStartDate

                            const assignmentInterval        = assignmentTicksData.get(assignment).get(tick)

                            const assignmentEffort : number = duration * assignment.units / 100

                            assignmentInterval.effort   += assignmentEffort
                            assignmentInterval.units    = assignment.units

                            tickData.effort             += assignmentEffort

                            // collect total resource usage percent in the current interval
                            units                       += assignment.units

                            tickAssignments.add(assignment)

                            tickAssignmentIntervals.set(assignment, assignmentInterval)
                        }
                    })

                    tickData.maxEffort          += intervalDuration //duration || 0

                    // if we have assignments running in the interval - calculate average allocation %
                    if (units) {
                        if (duration) {
                            // keep weightedUnitsSum & weightsSum since there might be another intervals in the tick
                            weightedUnitsSum            += duration * units
                            weightsSum                  += duration
                            // "units" weighted arithmetic mean w/ duration values as weights
                            tickData.units              = weightedUnitsSum / weightsSum
                        } else if (!weightedUnitsSum) {
                            tickData.units              = units
                        }
                    }

                    if (intervalHasAssignments) {
                        tickData.assignments            = tickAssignments
                        tickData.assignmentIntervals    = tickAssignmentIntervals
                        tickData.isOverallocated        = tickData.isOverallocated || units > 100
                        tickData.isUnderallocated       = tickData.isUnderallocated || units < 100
                    }
                }
            }
        )

        return {
            total,
            byAssignments
        }
    }

}


/**
 * A mixin for the resource entity at the Scheduler Pro level.
 */
export class SchedulerProResourceMixin extends Mixin(
    [ BaseResourceMixin ],
    (base : AnyConstructor<BaseResourceMixin, typeof BaseResourceMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class SchedulerProResourceMixin extends base {

        // w/o this `Omit` incremental compilation report false compilation error
        project                             : Omit<SchedulerProProjectMixin, 'resourceModelClass'> & { resourceModelClass : typeof SchedulerProResourceMixin }

        observers                           : Set<Identifier> = new Set()

        entities                            : Set<Entity> = new Set()

        addObserver(observer) {
            this.graph.addIdentifier(observer)

            this.observers.add(observer)
        }

        removeObserver(observer) {
            if (this.graph) {
                this.graph.removeIdentifier(observer)
            }

            this.observers.delete(observer)
        }

        addEntity(entity) {
            this.graph.addEntity(entity)

            this.entities.add(entity)
        }

        removeEntity(entity) {
            if (this.graph) {
                this.graph.removeEntity(entity)
            }

            this.entities.delete(entity)
        }

        leaveGraph (replica : Replica) {
            const { graph } = this

            for (const observer of this.observers) {
                this.removeObserver(observer)
            }

            for (const entity of this.entities) {
                this.removeEntity(entity)
            }

            superProto.leaveGraph.call(this, replica)
        }

        * forEachAvailabilityInterval (
            options     : {
                startDate?                          : Date,
                endDate?                            : Date,
                isForward?                          : boolean,
                calendars?                          : BaseCalendarMixin[],
                maxRange?                           : number
            },
            func        : (
                startDate                           : Date,
                endDate                             : Date,
                calendarCacheIntervalMultiple       : CalendarCacheIntervalMultiple
            ) => false | void
        ) : CalculationIterator<CalendarIteratorResult>
        {
            const calendar : BaseCalendarMixin = yield this.$.effectiveCalendar

            const effectiveCalendarsCombination : CalendarCacheMultiple = this.getProject().combineCalendars([ calendar ].concat(options.calendars || []))

            return effectiveCalendarsCombination.forEachAvailabilityInterval(
                options,
                (startDate : Date, endDate : Date, calendarCacheIntervalMultiple : CalendarCacheIntervalMultiple) => {
                    const calendarsStatus   = calendarCacheIntervalMultiple.getCalendarsWorkStatus()

                    if (calendarsStatus.get(calendar)) {
                        return func(startDate, endDate, calendarCacheIntervalMultiple)
                    }
                }
            )
        }

    }

    return SchedulerProResourceMixin
}){}
