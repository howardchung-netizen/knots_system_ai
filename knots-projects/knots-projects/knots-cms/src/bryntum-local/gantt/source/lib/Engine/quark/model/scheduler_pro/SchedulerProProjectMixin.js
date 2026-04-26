var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProposedOrPrevious } from "../../../../ChronoGraph/chrono/Effect.js";
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { CI } from "../../../../ChronoGraph/collection/Iterator.js";
import { model_field } from "../../../chrono/ModelFieldAtom.js";
import { DependenciesCalendar, DependencyValidationResult, ProjectType } from "../../../scheduling/Types.js";
import { SchedulerBasicProjectMixin } from "../scheduler_basic/SchedulerBasicProjectMixin.js";
import { ConstrainedEarlyEventMixin } from "./ConstrainedEarlyEventMixin.js";
import { SchedulerProDependencyMixin } from "./SchedulerProDependencyMixin.js";
import { SchedulerProEvent } from "./SchedulerProEvent.js";
import { SchedulerProAssignmentMixin } from "./SchedulerProAssignmentMixin.js";
import { SchedulerProResourceMixin, ResourceAllocationInfo } from "./SchedulerProResourceMixin.js";
import { DateConstraintInterval } from "./HasDateConstraintMixin.js";
import { DependencyConstraintInterval, RemoveDependencyResolution, DeactivateDependencyResolution } from "./ScheduledByDependenciesEarlyEventMixin.js";
import { CycleEffect } from "../../../chrono/Replica.js";
import { SchedulingIssueEffectResolution } from "../../../chrono/SchedulingIssueEffect.js";
import Localizable from "../../../../Core/localization/Localizable.js";
import { prototypeValue } from "../../../../ChronoGraph/util/Helpers.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * Scheduler Pro project mixin type. At this level, events are scheduled according to the incoming dependencies
 * and calendars of the assigned resources.
 *
 * The base event class for this level is [[SchedulerProEvent]]. The base dependency class is [[SchedulerProDependencyMixin]]
 */
export class SchedulerProProjectMixin extends Mixin([SchedulerBasicProjectMixin, ConstrainedEarlyEventMixin], (base) => {
    const superProto = base.prototype;
    class SchedulerProProjectMixin extends base {
        construct(config = {}) {
            superProto.construct.call(this, config);
            if (!this.resourceAllocationInfoClass)
                this.resourceAllocationInfoClass = this.getDefaultResourceAllocationInfoClass();
        }
        getDefaultResourceAllocationInfoClass() {
            return ResourceAllocationInfo;
        }
        *calculateDirection() {
            return yield ProposedOrPrevious;
        }
        afterConfigure() {
            superProto.afterConfigure.apply(this, arguments);
            this.dateConstraintIntervalClass = this.dateConstraintIntervalClass || DateConstraintInterval;
            this.dependencyConstraintIntervalClass = this.dependencyConstraintIntervalClass || DependencyConstraintInterval;
        }
        getType() {
            return ProjectType.SchedulerPro;
        }
        getDefaultCycleEffectClass() {
            return SchedulerProCycleEffect;
        }
        getDefaultEventModelClass() {
            return SchedulerProEvent;
        }
        getDefaultDependencyModelClass() {
            return SchedulerProDependencyMixin;
        }
        getDefaultAssignmentModelClass() {
            return SchedulerProAssignmentMixin;
        }
        getDefaultResourceModelClass() {
            return SchedulerProResourceMixin;
        }
        /**
         * Validates a hypothetical dependency with provided parameters.
         *
         * ```ts
         * // let's check if a EndToStart dependency linking event1 with event2 will be valid
         * const validationResult = await project.validateDependency(event1, event2, DependencyType.EndToStart);
         *
         * switch (validationResult) {
         *     const DependencyValidationResult.CyclicDependency :
         *         console.log('Dependency builds a cycle');
         *         break;
         *
         *     const DependencyValidationResult.DuplicatingDependency :
         *         console.log('Such dependency already exists');
         *         break;
         *
         *     const DependencyValidationResult.NoError :
         *         console.log('Dependency is valid');
         * }
         * ```
         *
         * See also [[isValidDependency]] method for more basic usage.
         *
         * @param fromEvent The dependency predecessor
         * @param toEvent The dependency successor
         * @param type The dependency type
         * @param ignoreDependency Dependencies to ignore while validating. This parameter can be used for example if one plans to change
         * an existing dependency properties and wants to know if the change will lead to an error:
         *
         * ```ts
         * // let's check if changing of the dependency predecessor to newPredecessor will make it invalid
         * const validationResult = await project.validateDependency(newPredecessor, dependency.toEvent, dependency.type, dependency);
         *
         * if (validationResult !== DependencyValidationResult.NoError) console.log("The dependency is invalid");
         * ```
         * @return The validation result
         */
        async validateDependency(fromEvent, toEvent, type, ignoreDependency) {
            let ingoredDependencies;
            if (ignoreDependency) {
                ingoredDependencies = Array.isArray(ignoreDependency) ? ignoreDependency : [ignoreDependency];
            }
            const alreadyLinked = CI(fromEvent.outgoingDeps).some((dependency) => dependency.toEvent === toEvent && !ingoredDependencies?.includes(dependency));
            if (alreadyLinked)
                return DependencyValidationResult.DuplicatingDependency;
            if (await this.isDependencyCyclic(fromEvent, toEvent, type, ingoredDependencies)) {
                return DependencyValidationResult.CyclicDependency;
            }
            return DependencyValidationResult.NoError;
        }
        /**
         * Validates a hypothetical dependency with provided parameters.
         *
         * ```ts
         * // let's check if a EndToStart dependency linking event1 with event2 will be valid
         * if (await project.isValidDependency(event1, event2, DependencyType.EndToStart)) {
         *     console.log('Dependency is valid');
         * } else {
         *     console.log('Dependency is invalid');
         * }
         * ```
         *
         * See also [[validateDependency]] method for more detailed validation results.
         *
         * @param fromEvent The dependency predecessor
         * @param toEvent The dependency successor
         * @param type The dependency type
         * @param ignoreDependency Dependencies to ignore while validating. This parameter can be used for example if one plans to change
         * an existing dependency properties and wants to know if the change will lead to an error:
         *
         * ```ts
         * // let's check if changing of the dependency predecessor to newPredecessor will make it invalid
         * if (await project.isValidDependency(newPredecessor, dependency.toEvent, dependency.type, dependency)) console.log("The dependency is valid");
         * ```
         * @return The validation result
         */
        // this does not account for possible scheduling conflicts
        async isValidDependency(fromEvent, toEvent, type, ignoreDependency) {
            const validationResult = await this.validateDependency(fromEvent, toEvent, type, ignoreDependency);
            return validationResult === DependencyValidationResult.NoError;
        }
        getDependencyCycleDetectionIdentifiers(fromEvent, toEvent) {
            return [
                // @ts-ignore
                toEvent.$.earlyStartDateConstraintIntervals,
                // @ts-ignore
                toEvent.$.earlyEndDateConstraintIntervals
            ];
        }
        async isDependencyCyclic(fromEvent, toEvent, type, ignoreDependency) {
            const dependencyClass = this.getDependencyStore().modelClass;
            const dependency = new dependencyClass({ fromEvent, toEvent, type });
            const branch = this.replica.branch({ autoCommit: false, onComputationCycle: 'throw' });
            if (ignoreDependency) {
                if (!Array.isArray(ignoreDependency)) {
                    ignoreDependency = [ignoreDependency];
                }
                ignoreDependency.forEach(dependency => branch.removeEntity(dependency));
            }
            branch.addEntity(dependency);
            dependency.project = this;
            // search for identifiers reading of which finds a cycle
            // for (const i of Object.keys(toEvent.$)) {
            //     try {
            //         await branch.readAsync(toEvent.$[i])
            //     } catch (e) {
            //         if (/cycle/i.test(e)) {
            //             // dump found identifier names to console
            //             console.log(i)
            //         }
            //         else
            //             throw e
            //     }
            // }
            try {
                await Promise.all(this.getDependencyCycleDetectionIdentifiers(fromEvent, toEvent).map(i => branch.readAsync(i)));
                return false;
            }
            catch (e) {
                // return true for the cycle exception and re-throw all others
                if (/cycle/i.test(e))
                    return true;
                // We don't throw on conflicts here ..it's supposed to happen when the changes really reach the graph
                if (!/conflict/i.test(e)) {
                    throw e;
                }
            }
        }
        // work in progress
        // This method validates changes (e.g. type) for existing dependencies (which are already in the store)
        async isValidDependencyModel(dependency, ignoreDependencies) {
            return this.isValidDependency(dependency.fromEvent, dependency.toEvent, dependency.type, ignoreDependencies);
        }
    }
    __decorate([
        model_field({ type: 'string', defaultValue: DependenciesCalendar.ToEvent })
    ], SchedulerProProjectMixin.prototype, "dependenciesCalendar", void 0);
    __decorate([
        model_field({ type: 'boolean', defaultValue: true })
    ], SchedulerProProjectMixin.prototype, "autoCalculatePercentDoneForParentTasks", void 0);
    return SchedulerProProjectMixin;
}) {
}
/**
 * A cycle resolution deactivating one of the [[getDependencies|related dependencies]].
 * The dependency instance should be passed to [[resolve]] method:
 *
 * ```ts
 * // this call will deactivate dependencyRecord
 * removalResolution.resolve(dependencyRecord)
 * ```
 */
export class DeactivateDependencyCycleEffectResolution extends Localizable(SchedulingIssueEffectResolution) {
    static get $name() {
        return 'DeactivateDependencyCycleEffectResolution';
    }
    getDescription() {
        return this.L('L{descriptionTpl}');
    }
    resolve(dependency) {
        dependency.active = false;
    }
}
/**
 * Class implementing a special effect signalizing of a computation cycle.
 * The class suggests two [[getResolutions|resolutions]] - either removing or deactivating one of
 * the [[getDependencies|related dependencies]].
 */
export class SchedulerProCycleEffect extends CycleEffect {
    /**
     * Returns dependencies taking part in the cycle that are treated as invalid.
     * For example a "parent-child" dependency or a dependency linking a task to itself.
     */
    getInvalidDependencies() {
        if (!this._invalidDependencies) {
            const dependencies = this.getDependencies();
            this._invalidDependencies = dependencies.filter(dependency => 
            // @ts-ignore
            dependency.fromEvent === dependency.toEvent || (dependency.fromEvent.contains(dependency.toEvent) || dependency.toEvent.contains(dependency.fromEvent)));
        }
        return this._invalidDependencies;
    }
    buildInvalidDependencyResolutions(config) {
        return [
            this.removeDependencyConflictResolutionClass.new(config),
            this.deactivateDependencyConflictResolutionClass.new(config)
        ];
    }
    matchDependencyBySourceAndTargetEvent(dependency, from, to) {
        return dependency.active && super.matchDependencyBySourceAndTargetEvent(dependency, from, to);
    }
    getResolutions() {
        if (!this._resolutions) {
            const invalidDependencies = this.getInvalidDependencies();
            const result = [];
            for (const dependency of invalidDependencies) {
                result.push(...this.buildInvalidDependencyResolutions({ dependency }));
            }
            // If we have invalid dependencies we do not suggest other dependency resolutions
            // to force resolving the invalid ones first
            if (!invalidDependencies.length) {
                result.push(this.deactivateDependencyCycleEffectResolutionClass.new(), ...super.getResolutions());
            }
            this._resolutions = result;
        }
        return this._resolutions;
    }
}
__decorate([
    prototypeValue(DeactivateDependencyCycleEffectResolution)
], SchedulerProCycleEffect.prototype, "deactivateDependencyCycleEffectResolutionClass", void 0);
__decorate([
    prototypeValue(RemoveDependencyResolution)
], SchedulerProCycleEffect.prototype, "removeDependencyConflictResolutionClass", void 0);
__decorate([
    prototypeValue(DeactivateDependencyResolution)
], SchedulerProCycleEffect.prototype, "deactivateDependencyConflictResolutionClass", void 0);
