import { CommitResult } from "../../../../ChronoGraph/chrono/Graph.js"
import { Transaction } from "../../../../ChronoGraph/chrono/Transaction.js"
import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { ChronoModelMixin } from "../../../chrono/ChronoModelMixin.js"
import { ConflictEffect } from "../../../chrono/Conflict.js"
import { EngineReplica, CycleEffect } from "../../../chrono/Replica.js"
import { ChronoStoreMixin } from "../../store/mixin/ChronoStoreMixin.js"
import { AbstractProjectMixin } from "../AbstractProjectMixin.js"
import { EffectResolutionResult, SchedulingIssueEffect } from "../../../chrono/SchedulingIssueEffect.js"
import { EmptyCalendarEffect } from "./BaseCalendarMixin.js"
import { ChronoPartOfProjectModelMixin } from "../mixin/ChronoPartOfProjectModelMixin.js"

/**
 * This is an abstract project, which just lists the available stores.
 *
 * The actual project classes are [[SchedulerBasicProjectMixin]], [[SchedulerProProjectMixin]], [[GanttProjectMixin]].
 */
export class ChronoAbstractProjectMixin extends Mixin(
    [ ChronoModelMixin, AbstractProjectMixin ],
    (base : AnyConstructor<ChronoModelMixin & AbstractProjectMixin , typeof ChronoModelMixin & typeof AbstractProjectMixin>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class ChronoAbstractProjectMixin extends base {

        /**
         * The [[Replica]] instance containing all data for this project.
         */
        replica                   : EngineReplica

        eventModelClass           : typeof ChronoModelMixin

        dependencyModelClass      : typeof ChronoModelMixin

        resourceModelClass        : typeof ChronoModelMixin

        assignmentModelClass      : typeof ChronoModelMixin

        calendarModelClass        : typeof ChronoModelMixin

        eventStoreClass           : typeof ChronoStoreMixin

        dependencyStoreClass      : typeof ChronoStoreMixin

        resourceStoreClass        : typeof ChronoStoreMixin

        assignmentStoreClass      : typeof ChronoStoreMixin

        calendarManagerStoreClass : typeof ChronoStoreMixin

        eventStore                : ChronoStoreMixin

        dependencyStore           : ChronoStoreMixin

        resourceStore             : ChronoStoreMixin

        assignmentStore           : ChronoStoreMixin

        calendarManagerStore      : ChronoStoreMixin

        cycleEffectClass          : typeof CycleEffect

        delayCalculation          : boolean
        // Internal flag, toggled early when finalizing to allow entering the replica
        delayEnteringReplica      : boolean
        delayedCalculationPromise : Promise<CommitResult>


        // External flag, toggled late in finalization when already entered replica
        get isDelayingCalculation () {
            return Boolean(this.delayEnteringReplica || this.delayedCalculationPromise)
        }


        getGraph () : EngineReplica {
            return this.replica
        }


        beforeCommitAsync () : Promise<CommitResult> { return null }


        enterReplica (enterRecords : boolean) {}


        // If we are delaying calculations, return its promise which will be resolved when calculations are finished.
        // As part of that process it will commit replica
        async commitAsync () : Promise<CommitResult> {
            return this.delayedCalculationPromise || this.replica?.commitAsync()
        }


        getSchedulingIssueEventArguments (schedulingIssue : SchedulingIssueEffect<any>, transaction : Transaction, resolve, reject) : Array<any> {
            const result : [string, any] = [
                schedulingIssue.type,
                {
                    continueWithResolutionResult    : resolve,
                    schedulingIssue
                }
            ]

            // For scheduling conflict public API expects to have "conflict" property w/ the ConflictEffect instance
            if (schedulingIssue instanceof ConflictEffect) result[1].conflict = schedulingIssue

            return result
        }


        async onSchedulingIssueCall (schedulingIssue : SchedulingIssueEffect<any>, transaction : Transaction) : Promise<EffectResolutionResult> {
            // is there is a "schedulingConflict" event listener we expect resolution option will be picked there
            if (schedulingIssue.type && this.hasListener(schedulingIssue.type)) {
                return new Promise((resolve, reject) => {
                    this.trigger(...this.getSchedulingIssueEventArguments(schedulingIssue, transaction, resolve, reject))
                })
            }

            // by default we cancel the committed changes
            return EffectResolutionResult.Cancel
        }

        async onCycleSchedulingIssue (schedulingIssue : CycleEffect, transaction : Transaction) : Promise<EffectResolutionResult> {
            return this.onSchedulingIssueCall(schedulingIssue, transaction)
        }

        async onEmptyCalendarSchedulingIssue (schedulingIssue : EmptyCalendarEffect, transaction : Transaction) : Promise<EffectResolutionResult> {
            return this.onSchedulingIssueCall(schedulingIssue, transaction)
        }

        async onConflictSchedulingIssue (schedulingIssue : ConflictEffect, transaction : Transaction) : Promise<EffectResolutionResult> {
            return this.onSchedulingIssueCall(schedulingIssue, transaction)
        }


        setModelCalculations (model : typeof ChronoModelMixin, calculations : Object): Object {
            if (!calculations) return

            const oldValues         = {}

            // backup current calculations
            for (const field in calculations) {
                oldValues[field]    = model.prototype.$calculations[field]
            }

            // Patch model prototype settings
            Object.assign(model.prototype.$calculations, calculations)

            return oldValues
        }


        setRecordCalculations (record : ChronoModelMixin & ChronoPartOfProjectModelMixin | ChronoAbstractProjectMixin, calculations : Object) {
            const oldValues     = this.setModelCalculations(record.constructor as typeof ChronoModelMixin, calculations)

            const skeleton      = record.$entity.$skeleton

            Object.keys(calculations).forEach(field => {
                skeleton[field].prototype.calculation = record[calculations[field]]
            })

            return oldValues
        }


        setStoreCalculations (store : ChronoStoreMixin, calculations : Object) : Object {
            if (!calculations) return

            // Rebuild corresponding identifiers
            const record                = store.first as ChronoModelMixin & ChronoPartOfProjectModelMixin

            if (record) {
                return this.setRecordCalculations(record, calculations)
            }
            else {
                return this.setModelCalculations(store.modelClass, calculations)
            }
        }


        /**
         * Overrides the project owned store identifiers calculation.
         * @param calculations Object providing new identifier calculation function names.
         * The object is grouped by store identifiers. For example below code
         * overrides event `startDate`, `endDate` and `duration` calculation so
         * the fields will always simply return their current values:
         *
         * ```ts
         * // event startDate, endDate and duration will use their userProvidedValue method
         * // which simply returns their current values as-is
         * const oldCalculations = await project.setCalculations({
         *     events : {
         *         startDate : "userProvidedValue",
         *         endDate   : "userProvidedValue",
         *         duration  : "userProvidedValue"
         *     }
         * })
         * ```
         * @returns Promise that resolves with an object having the overridden calculations.
         * The object can be used to toggle the calculations back in the future:
         * ```ts
         * // override event duration calculation
         * const oldCalculations = await project.setCalculations({
         *     events : {
         *         duration  : "userProvidedValue"
         *     }
         * })
         * // revert the duration calculation back
         * project.setCalculations(oldCalculations)
         * ```
         */
        async setCalculations (calculations : Record<string, unknown>) : Promise<Record<string, unknown>> {
            // Graph might not be created if using delayed calculations
            this.replica && await this.commitAsync()

            const oldCalculations : Record<string, unknown>  = {}

            const stores            = {
                tasks           : this.eventStore,
                events          : this.eventStore,
                dependencies    : this.dependencyStore,
                resources       : this.resourceStore,
                assignments     : this.assignmentStore,
                calendars       : this.calendarManagerStore
            }

            Object.keys(stores).forEach(id => {
                // Apply calculation change to every owned store
                if (calculations[id]) {
                    oldCalculations[id]   = this.setStoreCalculations(stores[id], calculations[id])
                }
            })

            // Apply calculation changes to the project af provided

            let projectCalculations         = calculations.project

            if (projectCalculations) {
                oldCalculations.project     = this.setRecordCalculations(this, projectCalculations)
            }

            // Repopulate replica w/ updated identifiers

            //@ts-ignore
            this.replica && this.repopulateReplica.now()

            this.replica && await this.commitAsync()

            // return previous calculation settings
            return oldCalculations
        }

    }

    return ChronoAbstractProjectMixin
}){}
