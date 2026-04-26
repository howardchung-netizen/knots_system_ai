var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { MixinAny } from "../../../../ChronoGraph/class/BetterMixin.js";
import { ReadMode, Replica } from "../../../../ChronoGraph/replica/Replica.js";
import { Schema } from "../../../../ChronoGraph/schema/Schema.js";
import { delay } from "../../../../ChronoGraph/util/Helpers.js";
import StateTrackingManager from "../../../../Core/data/stm/StateTrackingManager.js";
import Store from "../../../../Core/data/Store.js";
import { model_field, ModelReferenceField, IsChronoModelSymbol, ModelBucketField } from "../../../chrono/ModelFieldAtom.js";
import { EngineReplica, CycleEffect } from "../../../chrono/Replica.js";
import { DurationConverterMixin } from "../../../scheduling/DurationConverterMixin.js";
import { ProjectType } from "../../../scheduling/Types.js";
import { ChronoAssignmentStoreMixin } from "../../store/ChronoAssignmentStoreMixin.js";
import { ChronoCalendarManagerStoreMixin } from "../../store/ChronoCalendarManagerStoreMixin.js";
import { ChronoDependencyStoreMixin } from "../../store/ChronoDependencyStoreMixin.js";
import { ChronoEventStoreMixin } from "../../store/ChronoEventStoreMixin.js";
import { ChronoResourceStoreMixin } from "../../store/ChronoResourceStoreMixin.js";
import { ChronoAbstractProjectMixin } from "./ChronoAbstractProjectMixin.js";
import { BaseAssignmentMixin } from "./BaseAssignmentMixin.js";
import { BaseCalendarMixin } from "./BaseCalendarMixin.js";
import { BaseDependencyMixin } from "./BaseDependencyMixin.js";
import { BaseEventMixin } from "./BaseEventMixin.js";
import { BaseResourceMixin } from "./BaseResourceMixin.js";
import { CanCombineCalendarsMixin, HasCalendarMixin } from "./HasCalendarMixin.js";
import { HasSubEventsMixin } from "./HasSubEventsMixin.js";
import { SchedulerBasicEvent } from "./SchedulerBasicEvent.js";
import ObjectHelper from "../../../../Core/helper/ObjectHelper.js";
/**
 * Basic Scheduler project mixin type. At this level, events have assignments and dependencies, which both are, however,
 * only visual and do not affect the scheduling.
 */
export class SchedulerBasicProjectMixin extends MixinAny([
    ChronoAbstractProjectMixin,
    BaseEventMixin,
    HasSubEventsMixin,
    HasCalendarMixin,
    DurationConverterMixin,
    CanCombineCalendarsMixin
], (base) => {
    const superProto = base.prototype;
    class SchedulerBasicProjectMixin extends base {
        construct(config = {}) {
            this.delayCalculation = config.delayCalculation !== false;
            this.enableProgressNotifications = config.enableProgressNotifications || config.delayCalculation !== false;
            // Expand project by default to make getRange to work
            if (!('expanded' in config)) {
                // @ts-ignore
                config.expanded = true;
            }
            if (this.delayCalculation) {
                this.delayEnteringReplica = true;
            }
            if (!('skipNonWorkingTimeWhenSchedulingManually' in config)) {
                config.skipNonWorkingTimeWhenSchedulingManually = false;
            }
            superProto.construct.call(this, config);
            this.repopulateStores = new Set();
            this.ignoreInitialCommitComputationCycles = ('ignoreInitialCommitComputationCycles' in config) ? config.ignoreInitialCommitComputationCycles : false;
            if (this.ignoreInitialCommitComputationCycles) {
                console.warn('Project "ignoreInitialCommitComputationCycles" option is deprecated and will be dropped in the next major release');
            }
            if (!this.eventModelClass)
                this.eventModelClass = this.getDefaultEventModelClass();
            if (!this.eventStoreClass)
                this.eventStoreClass = this.getDefaultEventStoreClass();
            if (!this.dependencyModelClass)
                this.dependencyModelClass = this.getDefaultDependencyModelClass();
            if (!this.dependencyStoreClass)
                this.dependencyStoreClass = this.getDefaultDependencyStoreClass();
            if (!this.resourceModelClass)
                this.resourceModelClass = this.getDefaultResourceModelClass();
            if (!this.resourceStoreClass)
                this.resourceStoreClass = this.getDefaultResourceStoreClass();
            if (!this.assignmentModelClass)
                this.assignmentModelClass = this.getDefaultAssignmentModelClass();
            if (!this.assignmentStoreClass)
                this.assignmentStoreClass = this.getDefaultAssignmentStoreClass();
            if (!this.calendarModelClass)
                this.calendarModelClass = this.getDefaultCalendarModelClass();
            if (!this.calendarManagerStoreClass)
                this.calendarManagerStoreClass = this.getDefaultCalendarManagerStoreClass();
            if (!this.cycleEffectClass)
                this.cycleEffectClass = this.getDefaultCycleEffectClass();
            this.initializeStm();
            if (!this.delayEnteringReplica)
                this.enterReplica(false);
            this.setCalendarManagerStore(this.calendarManagerStore);
            this.setEventStore(this.eventStore);
            this.setDependencyStore(this.dependencyStore);
            this.setResourceStore(this.resourceStore);
            this.setAssignmentStore(this.assignmentStore);
            const hasInlineData = Boolean(this.calendarsData || this.eventsData || this.dependenciesData || this.resourcesData || this.assignmentsData);
            if (hasInlineData) {
                this.loadInlineData({
                    calendarsData: this.calendarsData,
                    eventsData: this.eventsData,
                    dependenciesData: this.dependenciesData,
                    resourcesData: this.resourcesData,
                    assignmentsData: this.assignmentsData
                });
                delete this.calendarsData;
                delete this.eventsData;
                delete this.dependenciesData;
                delete this.resourcesData;
                delete this.assignmentsData;
            }
        }
        enterReplica(enterRecords) {
            const me = this;
            if (!me.replica) {
                me.replica = me.createReplica();
                me.replica.addEntity(me);
                // not part of the CalendarManagerStore intentionally, not persisted
                me.defaultCalendar = new me.calendarModelClass({
                    unspecifiedTimeIsWorking: me.unspecifiedTimeIsWorking
                });
                me.defaultCalendar.project = me;
                me.replica.addEntity(me.defaultCalendar);
                me.trigger('graphReady');
            }
            // In delayCalculation mode no records entered the graph on construction,
            // instead we enter them now after first draw
            if (enterRecords && !me.isRepopulatingStores) {
                // Only enter "new" records, we are called when records are added later on
                me.calendarManagerStore.forEach(r => { !r.graph && r.joinProject(); }, undefined, { includeFilteredOutRecords: true });
                me.eventStore.forEach(r => { !r.graph && r.joinProject(); }, undefined, { includeFilteredOutRecords: true });
                me.resourceStore.forEach(r => { !r.graph && r.joinProject(); }, undefined, { includeFilteredOutRecords: true });
                me.dependencyStore.forEach(r => { !r.graph && r.joinProject(); }, undefined, { includeFilteredOutRecords: true });
                me.assignmentStore.forEach(r => { !r.graph && r.joinProject(); }, undefined, { includeFilteredOutRecords: true });
            }
        }
        resetStmQueue() {
            const wasDisabled = this.stm.disabled;
            this.stm.disable();
            this.stm.resetQueue();
            if (!wasDisabled) {
                this.stm.enable();
            }
        }
        doDestroy() {
            const me = this;
            me.eventStore?.destroy();
            me.dependencyStore?.destroy();
            me.assignmentStore?.destroy();
            me.resourceStore?.destroy();
            me.calendarManagerStore?.destroy();
            me.defaultCalendar?.destroy();
            me.replica?.clear();
            me.stm?.destroy();
            superProto.doDestroy.call(this);
        }
        getReplicaConfig() {
            return {
                project: this,
                schema: Schema.new(),
                enableProgressNotifications: this.enableProgressNotifications,
                silenceInitialCommit: this.silenceInitialCommit,
                ignoreInitialCommitComputationCycles: this.ignoreInitialCommitComputationCycles,
                cycleEffectClass: this.cycleEffectClass,
                onWriteDuringCommit: 'ignore',
                readMode: ReadMode.CurrentOrProposedOrPrevious
            };
        }
        // Creates a new Replica, used during construction and when repopulating
        createReplica() {
            return EngineReplica.mix(Replica).new(this.getReplicaConfig());
        }
        *hasSubEvents() {
            return this.getEventStore().count > 0;
        }
        *subEventsIterable() {
            return this.getEventStore().getRange();
        }
        getType() {
            return ProjectType.SchedulerBasic;
        }
        get enableProgressNotifications() {
            return this._enableProgressNotifications;
        }
        /**
         * Enables/disables the calculation progress notifications.
         */
        set enableProgressNotifications(value) {
            this._enableProgressNotifications = value;
            if (this.replica)
                this.replica.enableProgressNotifications = value;
        }
        getDefaultCycleEffectClass() {
            return CycleEffect;
        }
        /**
         * Returns the default event model class to use
         */
        getDefaultEventModelClass() {
            return SchedulerBasicEvent;
        }
        /**
         * Returns the default event store class to use
         */
        getDefaultEventStoreClass() {
            return ChronoEventStoreMixin;
        }
        /**
         * Returns the default dependency model class to use
         */
        getDefaultDependencyModelClass() {
            return BaseDependencyMixin;
        }
        /**
         * Returns the default dependency store class to use
         */
        getDefaultDependencyStoreClass() {
            return ChronoDependencyStoreMixin;
        }
        /**
         * Returns the default resource model class to use
         */
        getDefaultResourceModelClass() {
            return BaseResourceMixin;
        }
        /**
         * Returns the default resource store class to use
         */
        getDefaultResourceStoreClass() {
            return ChronoResourceStoreMixin;
        }
        /**
         * Returns the default assignment model class to use
         */
        getDefaultAssignmentModelClass() {
            return BaseAssignmentMixin;
        }
        /**
         * Returns the default assignment store class to use
         */
        getDefaultAssignmentStoreClass() {
            return ChronoAssignmentStoreMixin;
        }
        /**
         * Returns the default calendar model class to use
         */
        getDefaultCalendarModelClass() {
            return BaseCalendarMixin;
        }
        /**
         * Returns the default calendar manager store class to use
         */
        getDefaultCalendarManagerStoreClass() {
            return ChronoCalendarManagerStoreMixin;
        }
        /**
         * This method loads the "raw" data into the project. The loading is basically happening by
         * assigning the individual data entries to the `data` property of the corresponding store.
         *
         * @param data
         */
        async loadInlineData(data) {
            const { calendarManagerStore, eventStore, dependencyStore, assignmentStore, resourceStore, replica } = this;
            // Prevent initial commit from happening before inline data is loaded
            replica?.unScheduleAutoCommit();
            if (replica?.enableProgressNotifications && !this.delayCalculation) {
                // First delay needed to allow assignment of Project -> Gantt to happen before carrying on,
                // to make sure progress listener is in place
                await delay(0);
                // wait till the current propagation completes (if any)
                // otherwise the mask shown due to the next line call will be
                // destroyed as the propagation gets done
                await this.commitAsync();
                replica.onPropagationProgressNotification({ total: 0, remaining: 0, phase: 'storePopulation' });
                // Second delay needed to allow mask to appear, not clear why delay(0) is not enough, it works in other
                // places
                await delay(50);
            }
            this.isInitialCommitPerformed = false;
            this.isLoadingInlineData = true;
            if (globalThis.DEBUG) {
                console.log(`%cInitializing project`, 'font-weight:bold;color:darkgreen;text-transform:uppercase;margin-top: 2em');
                console.time('Time to visible');
                console.time('Populating project');
            }
            // Prevent records from entering replica on reload, schedule delayed entering / calculation
            if (this.delayCalculation && !this.delayedCalculationPromise) {
                this.scheduleDelayedCalculation();
            }
            if (data.calendarsData) {
                this.repopulateStore(calendarManagerStore);
                calendarManagerStore.data = data.calendarsData;
            }
            if (data.eventsData || data.tasksData) {
                this.repopulateStore(eventStore);
                eventStore.data = data.eventsData || data.tasksData;
            }
            if (data.dependenciesData) {
                this.repopulateStore(dependencyStore);
                dependencyStore.data = data.dependenciesData;
            }
            if (data.resourcesData) {
                this.repopulateStore(resourceStore);
                resourceStore.data = data.resourcesData;
            }
            if (data.assignmentsData) {
                this.repopulateStore(assignmentStore);
                assignmentStore.data = data.assignmentsData;
            }
            if (globalThis.DEBUG)
                console.timeEnd('Populating project');
            const result = await this.commitLoad();
            this.isLoadingInlineData = false;
            return result;
        }
        // Called from scheduleDelayedCalculation() & setAssignmentStore to set up indices used to look events and
        // resources up before calculations has finished
        setupTemporaryIndices() {
            const { storage } = this.assignmentStore || {};
            // First delayed calculation starts before assignmentStore is created => no storage
            if (storage) {
                // Set up indices to mimic buckets (removed again in below)
                storage.addIndex({ property: 'event', unique: false });
                storage.addIndex({ property: 'resource', unique: false });
            }
        }
        removeTemporaryIndices() {
            const { storage } = this.assignmentStore;
            // Indices mimicking buckets are no longer needed now, get rid of them
            storage.removeIndex('event');
            storage.removeIndex('resource');
        }
        scheduleDelayedCalculation() {
            const me = this;
            if (me.delayedCalculationPromise) {
                return me.delayedCalculationPromise;
            }
            if (me.delayCalculation !== false) {
                return me.delayedCalculationPromise = new Promise(async (resolve) => {
                    me.delayEnteringReplica = true;
                    me.setupTemporaryIndices();
                    // If listeners are defined on project, we have to wait until after construction before they can
                    // catch any events
                    await delay(0);
                    if (me.isDestroyed)
                        return;
                    me.trigger('delayCalculationStart');
                    // In delayCalculation mode, we trigger refresh before calculating to let UI draw early
                    me.trigger('refresh', { isCalculated: false });
                    await delay(0);
                    if (me.isDestroyed)
                        return;
                    me.delayEnteringReplica = false;
                    // After triggering (and thus drawing) we let everything enter the graph, either by repopulating
                    // a new replica or by entering the existing (or a new from scratch the first time)
                    if (me.isRepopulatingStores && me.replica) {
                        // @ts-ignore
                        me.repopulateReplica.now();
                    }
                    else {
                        me.enterReplica(true);
                    }
                    const result = await me.replica.commitAsync();
                    resolve(result);
                    if (me.isDestroyed)
                        return;
                    me.delayedCalculationPromise = null;
                    me.trigger('delayCalculationEnd');
                    me.removeTemporaryIndices();
                });
            }
        }
        async commitLoad() {
            // if (globalThis.DEBUG) console.time('Initial propagation')
            const result = await this.commitAsync();
            // Might have been destroyed during the async operation above
            if (!this.isDestroyed)
                this.trigger('load');
            return result;
        }
        initializeStm() {
            this.setStm(new StateTrackingManager(ObjectHelper.assign({
                disabled: true
            }, this.stm)));
            if (this.resetUndoRedoQueuesAfterLoad) {
                this.on({
                    load: this.resetStmQueue,
                    thisObj: this
                });
            }
            this.on({
                beforeCommit: this.onCommitInitialization,
                commitFinalized: this.onCommitFinalization,
                commitRejected: this.onCommitRejection,
                thisObj: this
            });
        }
        removeRejectedRecordsAdd({ transactionResult, silenceCommit }) {
            const recordsToDrop = new Map();
            for (const quark of transactionResult.entries.values()) {
                const identifier = quark.identifier;
                const { field } = identifier;
                if (quark.isShadow() || !identifier[IsChronoModelSymbol] || field instanceof ModelBucketField)
                    continue;
                const record = identifier.self;
                const store = record.firstStore;
                // collect records w/ atoms not having a previous value
                if (store && !quark.previous && !transactionResult.transaction.getLatestStableEntryFor(record.$$)?.previous) {
                    if (!recordsToDrop.has(store)) {
                        recordsToDrop.set(store, new Set([record]));
                    }
                    else if (!recordsToDrop.get(store).has(record)) {
                        recordsToDrop.get(store).add(record);
                    }
                }
            }
            // @ts-ignore
            this.suspendChangesTracking?.();
            // remove the collected records
            recordsToDrop.forEach((records, store) => store.remove(records));
            // @ts-ignore
            this.resumeChangesTracking?.(silenceCommit);
            if (silenceCommit) {
                this.eventStore.acceptChanges();
                this.dependencyStore.acceptChanges();
                this.resourceStore.acceptChanges();
                this.assignmentStore.acceptChanges();
                this.calendarManagerStore.acceptChanges();
            }
        }
        onCommitRejection(event) {
            // if STM is disabled we trying to revert changes w/o it
            if (this._stmDisabled) {
                // TODO reject removals as well
                this.removeRejectedRecordsAdd(event);
            }
            // reject last transaction STM has
            else {
                this.rejectStmTransaction();
            }
        }
        // https://github.com/bryntum/support/issues/1270
        onCommitInitialization() {
            const { stm } = this;
            this._stmDisabled = stm.disabled;
            if (stm.isRecording && stm.autoRecord) {
                this._stmAutoRecord = true;
                // If auto recording is enabled when we are entering a commit, we need to move autoRecording
                // state to Recording in order to make sure all changes from the project will become a single
                // transaction
                stm.autoRecord = false;
            }
        }
        onCommitFinalization() {
            if (this._stmAutoRecord) {
                // This will restore autoRecording state and trigger timer to stop transaction after a delay
                this.stm.autoRecord = true;
                this._stmAutoRecord = false;
            }
        }
        // Propagate on undo/redo
        async onSTMRestoringStop({ source }) {
            const stm = source;
            // Disable STM meanwhile to not pick it up as a new STM transaction
            stm.disable();
            await this.commitAsync();
            if (!this.isDestroyed) {
                stm.enable();
                this.trigger('stateRestoringDone');
            }
        }
        //region Repopulate
        get isRepopulatingStores() {
            return Boolean(this.repopulateStores?.size);
        }
        // Remember which stores are being repopulated, they dont have to care about unjoining graph later
        repopulateStore(store) {
            const me = this;
            if (me.repopulateOnDataset && store.count) {
                if (!me.repopulateStores)
                    me.repopulateStores = new Set();
                me.repopulateStores.add(store);
                // Trigger buffered repopulate of replica
                me.repopulateReplica();
            }
        }
        // Creates a new replica, populating it with data from the stores
        repopulateReplica() {
            const me = this;
            // Will repopulate as part of scheduled delayed calculations
            if (me.delayEnteringReplica) {
                return;
            }
            const { calendarManagerStore, eventStore, dependencyStore, assignmentStore, resourceStore, replica: oldReplica } = me;
            // Unlink all old records that are going to be re-entered into new replica
            me.unlinkStoreRecords(calendarManagerStore, eventStore, dependencyStore, resourceStore, assignmentStore);
            me.unlinkRecord(me);
            me.unlinkRecord(me.defaultCalendar);
            me.trigger('recordsUnlinked');
            oldReplica.clear();
            const replica = me.replica = me.createReplica();
            // Now enter all new and old reused records into the new replica
            replica.addEntity(me);
            replica.addEntity(me.defaultCalendar);
            me.joinStoreRecords(calendarManagerStore, true);
            me.joinStoreRecords(eventStore, true);
            me.joinStoreRecords(dependencyStore, true);
            me.joinStoreRecords(resourceStore, true);
            me.joinStoreRecords(assignmentStore, true);
            me.repopulateStores.clear();
            me.trigger('repopulateReplica');
        }
        // If there is a commit when we are supposed to replace the replica, we hijack that and commit the new replica
        beforeCommitAsync() {
            //@ts-ignore
            if (this.repopulateReplica.isPending && !this.isDelayingCalculation) {
                //@ts-ignore
                this.repopulateReplica.now();
                return this.replica.commitAsync();
            }
            return null;
        }
        // Unlinks a single record from the graph, writing back identifiers values from the graph to DATA to allow them
        // to enter another replica
        unlinkRecord(record) {
            // Might not have entered replica yet when using delayed calculation
            if (record?.graph) {
                const { activeTransaction } = this.replica;
                const { $ } = record;
                const keys = Object.keys($);
                // Write current values to identifier.DATA, to have correct value entering new replica later
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const identifier = $[key];
                    // Relations: assignment.event, replace event instance with event id
                    if (identifier.field instanceof ModelReferenceField) {
                        const value = record[key];
                        // id for records, value for atomics, undefined otherwise
                        identifier.DATA = value?.id ?? value;
                    }
                    // Everything else, use latest value
                    else {
                        const entry = activeTransaction.getLatestStableEntryFor(identifier);
                        if (entry)
                            identifier.DATA = entry.getValue();
                    }
                }
                // Cut the link, to enable joining another replica
                record.graph = null;
            }
        }
        // Unlinks all records from a store, unless the store has been repopulated
        unlinkStoreRecords(...stores) {
            // Must pass includeFilteredOutRecords and includeCollapsedGroupRecords as true
            // so that we work on full, unfiltered dataset
            stores.forEach(store => {
                // Unlink records only in stores that are not repopulated
                // or if store has syncDataOnLoad (in this case records stay in the store so need to unlink them)
                if (!this.repopulateStores.has(store) || store.syncDataOnLoad) {
                    store.traverse((record) => {
                        this.unlinkRecord(record);
                    }, false, false, {
                        includeFilteredOutRecords: true,
                        includeCollapsedGroupRecords: true
                    });
                }
            });
        }
        //endregion
        getGraph() {
            return this.replica;
        }
        // keep this private
        async addEvents(events) {
            this.eventStore.add(events);
            return this.commitAsync();
        }
        // keep this private
        async addEvent(event) {
            this.eventStore.add(event);
            return this.commitAsync();
        }
        // keep this private
        includeEvent(event) {
            this.eventStore.add(event);
        }
        // keep this private
        async removeEvents(events) {
            this.eventStore.remove(events);
            return this.commitAsync();
        }
        // keep this private
        excludeEvent(event) {
            this.eventStore.remove(event);
        }
        // keep this private
        async removeEvent(event) {
            this.eventStore.remove(event);
            return this.commitAsync();
        }
        getStm() {
            return this.stm;
        }
        setStm(stm) {
            this.stm = stm;
            this.stm.on('restoringStop', this.onSTMRestoringStop, this);
        }
        calculateProject() {
            return this;
        }
        *calculateEffectiveCalendar() {
            let calendar = yield this.$.calendar;
            if (calendar) {
                // this will create an incoming edge from the calendar's version atom, which changes on calendar's data update
                yield calendar.$.version;
            }
            else {
                calendar = this.defaultCalendar;
            }
            return calendar;
        }
        joinStoreRecords(store, skipRoot = false) {
            const fn = (record) => {
                record.setProject(this);
                record.joinProject();
            };
            // Both iteration methods must pass includeFilteredOutRecords as true
            // so that we work on full, unfiltered dataset
            if (store.rootNode) {
                store.rootNode.traverse(fn, skipRoot, true);
            }
            else {
                store.forEach(fn, null, {
                    includeFilteredOutRecords: true,
                    includeCollapsedGroupRecords: true
                });
            }
        }
        unjoinStoreRecords(store) {
            const fn = (record) => {
                record.leaveProject();
                record.setProject(this);
            };
            // Both iteration methods must pass includeFilteredOutRecords as true
            // so that we work on full, unfiltered dataset
            if (store.rootNode) {
                store.rootNode.traverse(node => {
                    // do not unjoin/leave project for the root node, which is the project itself
                    if (node !== store.rootNode)
                        fn(node);
                }, false, true);
            }
            else {
                store.forEach(fn, null, {
                    includeFilteredOutRecords: true,
                    includeCollapsedGroupRecords: true
                });
            }
        }
        /**
         * This method sets the event store instance for the project.
         * @param store
         */
        setEventStore(store) {
            const oldEventStore = this.eventStore;
            if (oldEventStore && this.stm.hasStore(oldEventStore)) {
                this.stm.removeStore(oldEventStore);
                this.unjoinStoreRecords(oldEventStore);
                this.detachStore(oldEventStore);
                const assignmentsForRemoval = oldEventStore.assignmentsForRemoval;
                // remap the assignment
                assignmentsForRemoval.forEach(assignment => {
                    const oldEvent = assignment.event;
                    if (oldEvent) {
                        const newEvent = store.getById(oldEvent.id);
                        if (newEvent) {
                            assignment.event = newEvent;
                            // keep the assignment
                            assignmentsForRemoval.delete(assignment);
                        }
                    }
                });
                oldEventStore.afterEventRemoval();
            }
            if (!store || !(store instanceof Store)) {
                const storeClass = store?.storeClass || this.eventStoreClass;
                this.eventStore = new storeClass(ObjectHelper.assign({
                    modelClass: this.eventModelClass,
                    project: this,
                    stm: this.stm
                }, store || {}));
            }
            else {
                this.eventStore = store;
                store.setProject(this);
                this.stm.addStore(store);
                // we've been given an event store from the outside
                // need to change its root node to be the project
                if (store.tree && store.rootNode !== this) {
                    this.appendChild(store.rootNode.children || []);
                    // Assigning a new root will make all children join store
                    store.rootNode = this;
                }
                // TODO: Not sure about this, was always performed previously
                else {
                    this.joinStoreRecords(store);
                }
            }
            this.attachStore(this.eventStore);
            this.trigger('eventStoreChange', { store: this.eventStore });
        }
        /**
         * This method sets the dependency store instance for the project.
         * @param store
         */
        setDependencyStore(store) {
            const oldDependencyStore = this.dependencyStore;
            if (oldDependencyStore && this.stm.hasStore(oldDependencyStore)) {
                this.stm.removeStore(oldDependencyStore);
                this.detachStore(oldDependencyStore);
            }
            if (!store || !(store instanceof Store)) {
                const storeClass = store?.storeClass || this.dependencyStoreClass;
                this.dependencyStore = new storeClass(ObjectHelper.assign({
                    modelClass: this.dependencyModelClass,
                    project: this,
                    stm: this.stm
                }, store || {}));
            }
            else {
                this.dependencyStore = store;
                store.setProject(this);
                this.stm.addStore(store);
                this.joinStoreRecords(store);
            }
            this.attachStore(this.dependencyStore);
            this.trigger('dependencyStoreChange', { store: this.dependencyStore });
        }
        /**
         * This method sets the resource store instance for the project.
         * @param store
         */
        setResourceStore(store) {
            const oldResourceStore = this.resourceStore;
            if (oldResourceStore && this.stm.hasStore(oldResourceStore)) {
                this.stm.removeStore(oldResourceStore);
                this.unjoinStoreRecords(oldResourceStore);
                this.detachStore(oldResourceStore);
                const assignmentsForRemoval = oldResourceStore.assignmentsForRemoval;
                // remap the assignment
                assignmentsForRemoval.forEach(assignment => {
                    const oldResource = assignment.resource;
                    if (oldResource) {
                        const newResource = store.getById(oldResource.id);
                        if (newResource) {
                            assignment.resource = newResource;
                            // keep the assignment
                            assignmentsForRemoval.delete(assignment);
                        }
                    }
                });
                oldResourceStore.afterResourceRemoval();
            }
            if (!store || !(store instanceof Store)) {
                const storeClass = store?.storeClass || this.resourceStoreClass;
                this.resourceStore = new storeClass(ObjectHelper.assign({
                    modelClass: this.resourceModelClass,
                    project: this,
                    stm: this.stm
                }, store || {}));
            }
            else {
                this.resourceStore = store;
                store.setProject(this);
                this.stm.addStore(store);
                this.joinStoreRecords(store);
            }
            this.attachStore(this.resourceStore);
            this.trigger('resourceStoreChange', { store: this.resourceStore });
        }
        /**
         * This method sets the assignment store instance for the project.
         * @param store
         */
        setAssignmentStore(store) {
            const oldAssignmentStore = this.assignmentStore;
            if (oldAssignmentStore && this.stm.hasStore(oldAssignmentStore)) {
                this.stm.removeStore(oldAssignmentStore);
                this.unjoinStoreRecords(oldAssignmentStore);
                this.detachStore(oldAssignmentStore);
            }
            if (!store || !(store instanceof Store)) {
                const storeClass = store?.storeClass || this.assignmentStoreClass;
                this.assignmentStore = new storeClass(ObjectHelper.assign({
                    modelClass: this.assignmentModelClass,
                    project: this,
                    stm: this.stm
                }, store || {}));
            }
            else {
                this.assignmentStore = store;
                store.setProject(this);
                this.stm.addStore(store);
                this.joinStoreRecords(store);
            }
            this.isDelayingCalculation && this.setupTemporaryIndices();
            this.attachStore(this.assignmentStore);
            this.trigger('assignmentStoreChange', { store: this.assignmentStore });
        }
        /**
         * This method sets the calendar manager store instance for the project.
         * @param store
         */
        setCalendarManagerStore(store) {
            const oldCalendarManagerStore = this.calendarManagerStore;
            if (oldCalendarManagerStore && this.stm.hasStore(oldCalendarManagerStore)) {
                this.stm.removeStore(oldCalendarManagerStore);
                this.detachStore(oldCalendarManagerStore);
            }
            if (!store || !(store instanceof Store)) {
                const storeClass = store?.storeClass || this.calendarManagerStoreClass;
                this.calendarManagerStore = new storeClass(ObjectHelper.assign({
                    modelClass: this.calendarModelClass,
                    project: this,
                    stm: this.stm
                }, store || {}));
            }
            else {
                this.calendarManagerStore = store;
                if (store) {
                    store.setProject(this);
                    this.stm.addStore(store);
                    this.joinStoreRecords(store);
                }
            }
            this.attachStore(this.calendarManagerStore);
            this.trigger('calendarManagerStoreChange', { store: this.calendarManagerStore });
        }
        // this does not account for possible scheduling conflicts
        async isValidDependency(...args) {
            return true;
        }
        rejectStmTransaction(stm) {
            stm = stm || this.stm;
            if (stm.transaction) {
                if (stm.transaction.length) {
                    stm.forEachStore(s => s.beginBatch());
                    stm.rejectTransaction();
                    stm.forEachStore(s => s.endBatch());
                }
                else {
                    stm.stopTransaction();
                }
            }
        }
        async tryPropagateWithChanges(changerFn) {
            const stm = this.stm, 
            // remember STM initial settings
            stmInitiallyDisabled = stm.disabled, stmInitiallyAutoRecord = stm.autoRecord;
            // if STM is disabled we turn it on so we could revert changes later
            if (stmInitiallyDisabled) {
                stm.enable();
            }
            // if it's enabled
            else {
                // if auto-recording is enabled - disable it
                if (stmInitiallyAutoRecord) {
                    stm.autoRecord = false;
                }
                // stop the current transaction to not mess it
                if (stm.isRecording) {
                    stm.stopTransaction();
                }
            }
            // start a new transaction
            stm.startTransaction();
            // In case anything in, or called by the changerFn attempts to propagate.
            // We must only propagate after the changes have been made.
            // this.suspendPropagate()
            changerFn();
            // Resume propagation, but do *not* propagate if any propagate calls were attempted during suspension.
            // this.resumePropagate(false)
            let result = true;
            try {
                const commitResult = await this.commitAsync();
                // setting "result" to false if the propagation was rejected
                result = !commitResult.rejectedWith;
            }
            catch (e) {
                // rethrow non-cycle exception
                if (!/cycle/i.test(e))
                    throw e;
                result = false;
            }
            // if the transaction succeed
            if (result) {
                stm.stopTransaction();
                // if STM is not used - reset its queue
                if (stmInitiallyDisabled) {
                    stm.resetQueue();
                }
            }
            // reject the failed transaction changes
            else {
                this.replica.reject();
                this.rejectStmTransaction(stm);
            }
            // restore STM settings
            stm.disabled = stmInitiallyDisabled;
            stm.autoRecord = stmInitiallyAutoRecord;
            return result;
        }
        isEngineReady() {
            const { replica } = this;
            return this.delayEnteringReplica || !this.isRepopulatingStores && !(replica.dirty && (replica.hasPendingAutoCommit() || replica.isCommitting));
        }
        // Needed to separate configs from data, for tests to pass. Normally handled in ProjectModel outside of engine
        static get defaultConfig() {
            return {
                assignmentsData: null,
                calendarsData: null,
                dependenciesData: null,
                eventsData: null,
                resourcesData: null,
                // need to distinguish the stores from fields
                // https://bryntum.com/examples/gantt/advanced/index.umd.html
                // bryntum.gantt.ObjectHelper.isEqual({}, new bryntum.gantt.Store()) // true
                eventStore: null,
                resourceStore: null,
                assignmentStore: null,
                dependencyStore: null,
                calendarManagerStore: null,
                eventModelClass: null,
                resourceModelClass: null,
                assignmentModelClass: null,
                dependencyModelClass: null,
                calendarModelClass: null,
                repopulateOnDataset: true
            };
        }
        static get delayable() {
            return {
                repopulateReplica: 10
            };
        }
    }
    SchedulerBasicProjectMixin.applyConfigs = true;
    __decorate([
        model_field({ type: 'boolean', defaultValue: true })
    ], SchedulerBasicProjectMixin.prototype, "unspecifiedTimeIsWorking", void 0);
    __decorate([
        model_field({ type: 'boolean', defaultValue: false })
    ], SchedulerBasicProjectMixin.prototype, "skipNonWorkingTimeWhenSchedulingManually", void 0);
    return SchedulerBasicProjectMixin;
}) {
}
