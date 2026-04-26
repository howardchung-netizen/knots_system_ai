import { AnyConstructor, Mixin } from '../../../../ChronoGraph/class/BetterMixin.js'
import { CalculationIterator } from "../../../../ChronoGraph/primitives/Calculation.js"
import { isAtomicValue, prototypeValue } from '../../../../ChronoGraph/util/Helpers.js'
import { DateInterval } from '../../../scheduling/DateInterval.js'
import { DependencyType, Duration, TimeUnit } from '../../../scheduling/Types.js'
import { BaseCalendarMixin } from '../scheduler_basic/BaseCalendarMixin.js'
import { HasDependenciesMixin } from "../scheduler_basic/HasDependenciesMixin.js"
import { ConstrainedEarlyEventMixin } from './ConstrainedEarlyEventMixin.js'
import { SchedulerProProjectMixin } from "./SchedulerProProjectMixin.js"
import { ConstraintInterval, ConflictResolution, ConstraintIntervalDescription } from '../../../chrono/Conflict.js'
import { SchedulerProDependencyMixin } from './SchedulerProDependencyMixin.js'
import DateHelper from '../../../../Core/helper/DateHelper.js'
import { format } from '../../../util/Functions.js'
import { Transaction } from '../../../../ChronoGraph/chrono/Transaction.js'
import Localizable from '../../../../Core/localization/Localizable.js'
import "../../../localization/En.js"
import { model_field } from '../../../chrono/ModelFieldAtom.js'
import { CommitResult } from '../../../../ChronoGraph/chrono/Graph.js'


//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin adds support for scheduling event ASAP, by dependencies. All it does is
 * create the constraint interval for every incoming dependency. See [[ConstrainedEarlyEventMixin]] for
 * more details about constraint-based scheduling.
 *
 * The supported dependency types are listed in this enum: [[DependencyType]]
 */
export class ScheduledByDependenciesEarlyEventMixin extends Mixin(
    [ ConstrainedEarlyEventMixin, HasDependenciesMixin ],
    (base : AnyConstructor<ConstrainedEarlyEventMixin & HasDependenciesMixin, typeof ConstrainedEarlyEventMixin & typeof HasDependenciesMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class ScheduledByDependenciesEarlyEventMixin extends base {

        project             : SchedulerProProjectMixin


        /**
         * Inactive events do not affect successors nor rollup their attributes to parent events.
         */
        @model_field({ type : 'boolean' })
        inactive            : Boolean


        setInactive : (value : boolean) => Promise<CommitResult>

        /**
         * The method defines wether the provided dependency should constrain the successor or not.
         * If the method returns `true` the dependency constrains the successor and does not do that when `false` returned.
         * By default the method returns `true` if the dependency is [[SchedulerProDependencyMixin.active|active]]
         * and if this event is [[inactive|active]] (or both this event and the successor are [[inactive]]).
         *
         * This is used when calculating [[earlyStartDateConstraintIntervals]].
         * @param dependency Dependency to consider.
         * @returns `true` if the dependency should constrain successor, `false` if not.
         */
        * shouldPredecessorAffectScheduling (dependency : SchedulerProDependencyMixin) : CalculationIterator<boolean> {
            const fromEvent : ScheduledByDependenciesEarlyEventMixin = yield dependency.$.fromEvent

            // ignore missing from events and inactive dependencies
            return fromEvent && !isAtomicValue(fromEvent) && (yield dependency.$.active)
                // ignore inactive predecessor (unless we both are inactive)
                && (!(yield fromEvent.$.inactive) || (yield this.$.inactive))
        }


        * calculateEarlyStartDateConstraintIntervals () : CalculationIterator<DateInterval[]> {
            const intervals : DateInterval[]    = yield* superProto.calculateEarlyStartDateConstraintIntervals.call(this)

            const project : SchedulerProProjectMixin   = this.getProject()
            const dependencyConstraintIntervalClass    = project.dependencyConstraintIntervalClass

            for (const dependency of (yield this.$.incomingDeps)) {
                // ignore missing from events and inactive predecessors/dependencies
                if (!(yield* this.shouldPredecessorAffectScheduling(dependency))) continue

                const fromEvent : ScheduledByDependenciesEarlyEventMixin = yield dependency.$.fromEvent

                let interval : DateInterval

                switch (yield dependency.$.type) {
                    case DependencyType.EndToStart:
                        const fromEventEndDate : Date           = yield fromEvent.$.earlyEndDateRaw

                        if (fromEventEndDate) {
                            const lag : Duration                = yield dependency.$.lag
                            const lagUnit : TimeUnit            = yield dependency.$.lagUnit
                            const calendar : BaseCalendarMixin  = yield dependency.$.calendar

                            interval = dependencyConstraintIntervalClass.new({
                                owner       : dependency,
                                startDate   : calendar.calculateEndDate(
                                    fromEventEndDate,
                                    yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)
                                ),
                                endDate     : null
                            })
                        }
                        break

                    case DependencyType.StartToStart:
                        const fromEventStartDate : Date         = yield fromEvent.$.earlyStartDateRaw

                        if (fromEventStartDate) {
                            const lag : Duration                = yield dependency.$.lag
                            const lagUnit : TimeUnit            = yield dependency.$.lagUnit
                            const calendar : BaseCalendarMixin  = yield dependency.$.calendar

                            interval = dependencyConstraintIntervalClass.new({
                                owner       : dependency,
                                startDate   : calendar.calculateEndDate(
                                    fromEventStartDate,
                                    yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)
                                ),
                                endDate     : null
                            })
                        }
                        break
                }

                interval && intervals.unshift(interval)
            }

            return intervals
        }


        * calculateEarlyEndDateConstraintIntervals () : CalculationIterator<DateInterval[]> {
            const intervals : DateInterval[]    = yield* superProto.calculateEarlyEndDateConstraintIntervals.call(this)

            const project : SchedulerProProjectMixin   = this.getProject()
            const dependencyConstraintIntervalClass    = project.dependencyConstraintIntervalClass

            for (const dependency of (yield this.$.incomingDeps)) {
                // ignore missing from events and inactive dependencies
                if (!(yield* this.shouldPredecessorAffectScheduling(dependency))) continue

                const fromEvent : ScheduledByDependenciesEarlyEventMixin = yield dependency.$.fromEvent

                let interval : DateInterval

                switch (yield dependency.$.type) {
                    case DependencyType.EndToEnd:
                        const fromEventEndDate : Date = yield fromEvent.$.earlyEndDateRaw

                        if (fromEventEndDate) {
                            const lag : Duration                = yield dependency.$.lag
                            const lagUnit : TimeUnit            = yield dependency.$.lagUnit
                            const calendar : BaseCalendarMixin  = yield dependency.$.calendar

                            interval = dependencyConstraintIntervalClass.new({
                                owner       : dependency,
                                startDate   : calendar.calculateEndDate(
                                    fromEventEndDate,
                                    yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)
                                ),
                                endDate     : null
                            })
                        }
                        break

                    case DependencyType.StartToEnd:
                        const fromEventStartDate : Date = yield fromEvent.$.earlyStartDateRaw

                        if (fromEventStartDate) {
                            const lag : Duration                = yield dependency.$.lag
                            const lagUnit : TimeUnit            = yield dependency.$.lagUnit
                            const calendar : BaseCalendarMixin  = yield dependency.$.calendar

                            interval = dependencyConstraintIntervalClass.new({
                                owner       : dependency,
                                startDate   : calendar.calculateEndDate(
                                    fromEventStartDate,
                                    yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)
                                ),
                                endDate     : null
                            })
                        }
                        break
                }

                interval && intervals.unshift(interval)
            }

            return intervals
        }
    }

    return ScheduledByDependenciesEarlyEventMixin
}){}

/**
 * Base class for dependency interval resolutions.
 */
export class BaseDependencyResolution extends Localizable(ConflictResolution) {

    static get $name () {
        return 'BaseDependencyResolution'
    }

    /**
     * Dependency to resolve.
     */
    dependency          : SchedulerProDependencyMixin

    getDescription () : string {
        const
            { dependency }                  = this,
            { type, fromEvent, toEvent }    = dependency

        return format(this.L('L{descriptionTpl}'),
            this.L('L{DependencyType.long}')[type],
            fromEvent.name || fromEvent.id,
            toEvent.name || toEvent.id
        )
    }
}

/**
 * Dependency resolution removing the dependency.
 */
export class RemoveDependencyResolution extends BaseDependencyResolution {

    static get $name () {
        return 'RemoveDependencyResolution'
    }

    /**
     * Resolves the conflict by removing the dependency.
     */
    resolve () {
        this.dependency.remove()
    }
}

/**
 * Dependency resolution deactivating the dependency.
 */
export class DeactivateDependencyResolution extends BaseDependencyResolution {

    static get $name () {
        return 'DeactivateDependencyResolution'
    }

    /**
     * Resolves the conflict by deactivating the dependency.
     */
    resolve () {
        this.dependency.active = false
    }
}

/**
 * Description builder for a [[DependencyConstraintInterval|dependency constraint interval]].
 */
export class DependencyConstraintIntervalDescription extends ConstraintIntervalDescription {

    static get $name () {
        return 'DependencyConstraintIntervalDescription'
    }

    static getDescriptionParameters (interval : DependencyConstraintInterval) : any[] {
        const dependency = interval.owner

        return [
            DateHelper.format(interval.startDate, this.L('L{dateFormat}')),
            DateHelper.format(interval.endDate, this.L('L{dateFormat}')),

            this.L('L{DependencyType.long}')[dependency.type],
            dependency.fromEvent.name,
            dependency.toEvent.name
        ]
    }

}

/**
 * Constraint interval applied by a dependency.
 *
 * In case for a conflict the class [[getResolutions|suggests]] two resolution options:
 * either [[RemoveDependencyResolution|removing]] or [[DeactivateDependencyResolution|deactivating]] the dependency.
 */
export class DependencyConstraintInterval extends ConstraintInterval {

    /**
     * The dependency applying the constraint interval.
     */
    owner                                       : SchedulerProDependencyMixin

    /**
     * Class implementing "removing the dependency" resolution
     */
    @prototypeValue(RemoveDependencyResolution)
    removeDependencyConflictResolutionClass     : typeof RemoveDependencyResolution

    /**
     * Class implementing "deactivating the dependency" resolution
     */
    @prototypeValue(DeactivateDependencyResolution)
    deactivateDependencyConflictResolutionClass : typeof DeactivateDependencyResolution

    /**
     * Class implementing the interval description builder.
     */
    @prototypeValue(DependencyConstraintIntervalDescription)
    descriptionBuilderClass                     : typeof DependencyConstraintIntervalDescription

    isAffectedByTransaction (transaction? : Transaction) : boolean {
        const dependency = this.owner

        transaction = transaction || dependency.graph.activeTransaction

        const
            { entries }     = transaction,
            // dependency identifiers to check
            {
                fromEvent,
                toEvent,
                lag,
                lagUnit,
                type
            }               = dependency.$,
            fromEventQuark  = entries.get(fromEvent),
            toEventQuark    = entries.get(toEvent),
            lagQuark        = entries.get(lag),
            lagUnitQuark    = entries.get(lagUnit),
            typeQuark       = entries.get(type)

        // new or modified dependency
        return !transaction.baseRevision.hasIdentifier(dependency.$$) ||
            fromEventQuark && !fromEventQuark.isShadow() ||
            toEventQuark && !toEventQuark.isShadow() ||
            lagQuark && !lagQuark.isShadow() ||
            lagUnitQuark && !lagUnitQuark.isShadow() ||
            typeQuark && !typeQuark.isShadow()
    }

    /**
     * Returns the interval resolution options.
     * There are two resolutions:
     * - [[RemoveDependencyResolution|removing the dependency]]
     * - [[DeactivateDependencyResolution|deactivating the dependency]].
     */
    getResolutions () : ConflictResolution[] {
        return this.resolutions || (this.resolutions = [
            this.deactivateDependencyConflictResolutionClass.new({ dependency : this.owner }),
            this.removeDependencyConflictResolutionClass.new({ dependency : this.owner })
        ])
    }

}
