var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Reject, RejectSymbol } from "../../ChronoGraph/chrono/Effect.js";
import { TombStone } from "../../ChronoGraph/chrono/Quark.js";
import { Revision } from "../../ChronoGraph/chrono/Revision.js";
import { Transaction } from "../../ChronoGraph/chrono/Transaction.js";
import { Mixin } from "../../ChronoGraph/class/BetterMixin.js";
import { Replica } from "../../ChronoGraph/replica/Replica.js";
import { prototypeValue } from "../../ChronoGraph/util/Helpers.js";
import Base from "../../Core/Base.js";
import Localizable from "../../Core/localization/Localizable.js";
import { EmptyCalendarSymbol } from "../quark/model/scheduler_basic/BaseCalendarMixin.js";
import { format } from "../util/Functions.js";
import { ConflictSymbol } from "./Conflict.js";
import { IsChronoModelSymbol, ModelBucketField } from "./ModelFieldAtom.js";
import { EffectResolutionResult, SchedulingIssueEffect, SchedulingIssueEffectResolution } from "./SchedulingIssueEffect.js";
export const CycleSymbol = Symbol('CycleSymbol');
//---------------------------------------------------------------------------------------------------------------------
export class EngineRevision extends Revision {
    constructor() {
        super(...arguments);
        this.failedResolutionReferences = new Map();
    }
}
//---------------------------------------------------------------------------------------------------------------------
export class EngineTransaction extends Transaction {
    constructor() {
        super(...arguments);
        this.candidateClass = EngineRevision;
    }
    initialize(props) {
        // Emit progress earlier and more frequently when using delayCalculation mode, to not lock up UI as much and to
        // have smoother progress bar updates.
        // Transactions created to validate deps does not reference project
        if (props.graph.project?.delayCalculation) {
            props.startProgressNotificationsAfterMs = 0;
            props.emitProgressNotificationsEveryMs = 100;
        }
        super.initialize(props);
        this.candidate.failedResolutionReferences = new Map(this.baseRevision.failedResolutionReferences);
    }
    addIdentifier(identifier, proposedValue, ...args) {
        this.markFailedResolutionReferences();
        return super.addIdentifier(identifier, proposedValue, ...args);
    }
    markFailedResolutionReferences() {
        this.candidate.failedResolutionReferences.forEach((failedResolutionValue, identifier) => {
            this.write(identifier, failedResolutionValue);
        });
        this.candidate.failedResolutionReferences.clear();
    }
}
//---------------------------------------------------------------------------------------------------------------------
/**
 * An extension of [[Replica]], specialized for interaction with [[AbstractProjectMixin|project]].
 */
export class EngineReplica extends Mixin([Replica], (base) => {
    const superProto = base.prototype;
    class EngineReplica extends base {
        constructor() {
            super(...arguments);
            this.baseRevision = EngineRevision.new();
            this.transactionClass = EngineTransaction;
            this.autoCommitMode = 'async';
            this.onComputationCycle = 'effect';
            this.cycleEffectClass = CycleEffect;
            this.silenceInitialCommit = true;
            this.ignoreInitialCommitComputationCycles = false;
        }
        // clear () {
        //     this.removeEntity(this.project)
        //
        //     super.clear()
        //
        //     this.addEntity(this.project)
        // }
        get dirty() {
            const activeTransaction = this.activeTransaction;
            return activeTransaction.entries.size > 0 && (activeTransaction.hasVariableEntry || activeTransaction.hasEntryWithProposedValue);
        }
        onPropagationProgressNotification(notification) {
            if (this.enableProgressNotifications && this.project)
                this.project.trigger('progress', notification);
        }
        async commitAsync(args) {
            this.project.trigger('beforeCommit');
            if (this.isInitialCommit && this.ignoreInitialCommitComputationCycles) {
                // backup onComputationCycle value to restore it after the commit
                this._onComputationCycle = this._onComputationCycle || this.onComputationCycle;
                // toggle onComputationCycle to ignore cycles to let the data get into the graph
                this.onComputationCycle = 'ignore';
            }
            const replacedReplicaResult = this.project.beforeCommitAsync();
            if (replacedReplicaResult)
                return replacedReplicaResult;
            return superProto.commitAsync.call(this, args);
        }
        get isInitialCommit() {
            // let the project defined which commit is "initial"
            return this.project.isInitialCommit || super.isInitialCommit;
        }
        set isInitialCommit(value) {
            super.isInitialCommit = value;
        }
        write(identifier, proposedValue, ...args) {
            const fieldName = identifier.field?.name;
            const record = identifier.self;
            if (fieldName && record) {
                // @ts-ignore
                const beforeHookResult = record.beforeChronoFieldSet?.(fieldName, proposedValue);
                superProto.write.call(this, identifier, proposedValue, ...args);
                // @ts-ignore
                record.afterChronoFieldSet?.(fieldName, proposedValue, beforeHookResult);
            }
            else {
                superProto.write.call(this, identifier, proposedValue, ...args);
            }
        }
        async finalizeCommitAsync(transactionResult) {
            // the `this.project` may be empty for the branch, where we validate the dependency
            // because if asyncness project might be destroyed when we get here
            const { project } = this;
            if (!project || project.isDestroyed)
                return;
            const { entries } = transactionResult;
            const autoCommitStores = new Set();
            if (globalThis.DEBUG)
                console.timeEnd('Time to visible');
            const { isInitialCommit, silenceInitialCommit } = this;
            // apply changes silently if this is initial commit and "silenceInitialCommit" option is enabled
            const silenceCommit = isInitialCommit && silenceInitialCommit;
            if (isInitialCommit) {
                project.isInitialCommitPerformed = true;
                // restore onComputationCycle back if we toggled it before committing
                if (this.ignoreInitialCommitComputationCycles)
                    this.onComputationCycle = this._onComputationCycle;
            }
            project.isWritingData = true;
            project.hasLoadedDataToCommit = false;
            // Let progress listeners know we are finalizing
            if (this.enableProgressNotifications) {
                project.trigger('progress', {
                    total: transactionResult.entries.size,
                    remaining: 0,
                    phase: 'finalizing'
                });
            }
            // It is triggered earlier because on that stage engine is ready and UI can be drawn.
            // dataReady happens up to like a second later in big datasets. We do not want to wait that long
            project.trigger('refresh', { isInitialCommit, isCalculated: true });
            // console.timeEnd('rendered')
            await new Promise(resolve => {
                setTimeout(() => {
                    // TODO: Should use Delayable
                    if (!project.isDestroyed) {
                        if (!transactionResult.transaction.rejectedWith) {
                            // @ts-ignore
                            project.suspendChangesTracking?.();
                            if (globalThis.DEBUG)
                                console.time('Finalize propagation');
                            const records = new Set();
                            for (const quark of entries.values()) {
                                const identifier = quark.identifier;
                                const quarkValue = quark.getValue();
                                const { field } = identifier;
                                if (quark.isShadow() || !identifier[IsChronoModelSymbol] || quarkValue === TombStone || field instanceof ModelBucketField)
                                    continue;
                                const record = identifier.self;
                                const store = record.firstStore;
                                // Begin batch once
                                if (!records.has(record)) {
                                    record.beginBatch(true);
                                    records.add(record);
                                }
                                // Avoid committing changes during refresh, commit below instead. Suspend once
                                if (store?.autoCommit && !autoCommitStores.has(store)) {
                                    store.suspendAutoCommit();
                                    autoCommitStores.add(store);
                                }
                                record.set(field.name, quarkValue);
                            }
                            for (const record of records) {
                                //@ts-ignore
                                record.ignoreBag = silenceCommit;
                                record.endBatch(silenceCommit, true);
                                //@ts-ignore
                                record.ignoreBag = false;
                            }
                            if (globalThis.DEBUG)
                                console.timeEnd('Finalize propagation');
                            // Calendar expects flag to be cleared before dataReady, was mismatch with engine stub
                            project.isWritingData = false;
                            project.trigger('dataReady', { records, isInitialCommit });
                            // @ts-ignore
                            project.resumeChangesTracking?.(silenceCommit);
                            autoCommitStores.forEach(store => store.resumeAutoCommit());
                            // clear all changes of the first graph commit
                            if (silenceCommit) {
                                project.eventStore.acceptChanges();
                                project.dependencyStore.acceptChanges();
                                project.resourceStore.acceptChanges();
                                project.assignmentStore.acceptChanges();
                                project.calendarManagerStore.acceptChanges();
                            }
                        }
                        // transaction rejected
                        else {
                            project.trigger('commitRejected', { isInitialCommit, transactionResult, silenceCommit });
                            project.isWritingData = false;
                        }
                        project.trigger('commitFinalized', { isInitialCommit, transactionResult });
                    }
                    resolve();
                }, 0);
            });
        }
        *onComputationCycleHandler(cycle) {
            if (this.onComputationCycle === 'effect') {
                const effect = this.project.cycleEffectClass.new({ cycle });
                if ((yield effect) === EffectResolutionResult.Cancel) {
                    yield Reject(effect);
                }
            }
            else {
                return yield* super.onComputationCycleHandler(cycle);
            }
        }
        async [CycleSymbol](effect, transaction) {
            // delegate to project
            return this.project.onCycleSchedulingIssue(effect, transaction);
        }
        async [EmptyCalendarSymbol](effect, transaction) {
            transaction.walkContext.startNewEpoch();
            // delegate to project
            return this.project.onEmptyCalendarSchedulingIssue(effect, transaction);
        }
        async [ConflictSymbol](effect, transaction) {
            transaction.walkContext.startNewEpoch();
            // delegate to project
            return this.project.onConflictSchedulingIssue(effect, transaction);
        }
        [RejectSymbol](effect, transaction) {
            // on transaction rejected
            return super[RejectSymbol](effect, transaction);
        }
    }
    return EngineReplica;
}) {
}
/**
 * A cycle resolution removing one of the [[getDependencies|related dependencies]].
 * The dependency instance should be passed to [[resolve]] method:
 *
 * ```ts
 * // this call will remove dependencyRecord
 * removalResolution.resolve(dependencyRecord)
 * ```
 */
export class RemoveDependencyCycleEffectResolution extends Localizable(SchedulingIssueEffectResolution) {
    static get $name() {
        return 'RemoveDependencyCycleEffectResolution';
    }
    getDescription() {
        return this.L('L{descriptionTpl}');
    }
    resolve(dependency) {
        dependency.remove();
    }
}
/**
 * Class providing a human readable localized description ofr a [[CycleEffect]] instance.
 */
export class CycleEffectDescription extends Localizable(Base) {
    static get $name() {
        return 'CycleEffectDescription';
    }
    static getDescription(effect) {
        return format(this.L('L{descriptionTpl}'), this.getShortDescription(effect));
    }
    static getShortDescription(effect) {
        const events = effect.getEvents().slice();
        events.push(events[0]);
        return '"' + events.map(event => event.name || '#' + event.id).join('" -> "') + '"';
    }
}
/**
 * Class implementing a special effect signalizing of a computation cycle.
 * The class suggests the only [[getResolutions|resolution]] option - removing one of the
 * [[getDependencies|related dependencies]].
 */
export class CycleEffect extends SchedulingIssueEffect {
    constructor() {
        super(...arguments);
        this.handler = CycleSymbol;
    }
    /**
     * Returns list of events building the cycle.
     */
    getEvents() {
        if (!this._events) {
            const result = new Set();
            this.cycle.cycle.forEach(({ context }) => result.add(context));
            this._events = [...result];
        }
        return this._events;
    }
    matchDependencyBySourceAndTargetEvent(dependency, from, to) {
        return dependency.fromEvent === from && dependency.toEvent === to;
    }
    getDependencyForSourceAndTargetEvents(from, to) {
        const events = this.getEvents();
        const project = events[0].project;
        const dependencyStore = project.getDependencyStore();
        return dependencyStore.find((dependency) => this.matchDependencyBySourceAndTargetEvent(dependency, from, to));
    }
    /**
     * Returns list of dependencies building the cycle.
     */
    getDependencies() {
        if (!this._dependencies) {
            const result = new Set();
            const events = this.getEvents();
            const numberOfEvents = events.length;
            let prevEvent = events[0], dependency;
            if (numberOfEvents === 1) {
                if ((dependency = this.getDependencyForSourceAndTargetEvents(prevEvent, prevEvent))) {
                    result.add(dependency);
                }
            }
            else {
                for (const event1 of events) {
                    for (const event2 of events) {
                        if ((dependency = this.getDependencyForSourceAndTargetEvents(event1, event2))) {
                            result.add(dependency);
                        }
                        if ((dependency = this.getDependencyForSourceAndTargetEvents(event2, event1))) {
                            result.add(dependency);
                        }
                    }
                }
            }
            this._dependencies = [...result];
        }
        return this._dependencies;
    }
    /**
     * Returns list of the cycle possible resolutions.
     *
     * The class provides a single parameterized [[RemoveDependencyCycleEffectResolution]] resolution
     * which implement removal of one of the [[getDependencies|dependencies]].
     */
    getResolutions() {
        if (!this._resolutions) {
            this._resolutions = [this.removeDependencyCycleEffectResolutionClass.new()];
        }
        return this._resolutions;
    }
}
__decorate([
    prototypeValue('cycle')
], CycleEffect.prototype, "type", void 0);
__decorate([
    prototypeValue(CycleEffectDescription)
], CycleEffect.prototype, "_descriptionBuilderClass", void 0);
__decorate([
    prototypeValue(RemoveDependencyCycleEffectResolution)
], CycleEffect.prototype, "removeDependencyCycleEffectResolutionClass", void 0);
