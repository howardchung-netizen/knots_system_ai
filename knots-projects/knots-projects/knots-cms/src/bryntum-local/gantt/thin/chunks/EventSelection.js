/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { AbstractCrudManagerMixin, ProjectCrudManager, AjaxTransport, JsonEncoder, ProjectModel, ResourceStore, EventStore, AssignmentStore, DependencyStore } from './ProjectModel.js';
import { Base, StringHelper, ObjectHelper, Store, DateHelper, Collection, ArrayHelper } from './Editor.js';

/**
 * @module Scheduler/crud/AbstractCrudManager
 */

/**
 * This is an abstract class serving as the base for the {@link Scheduler.data.CrudManager} class.
 * It implements basic mechanisms to organize batch communication with a server.
 * Yet it does not contain methods related to _data transfer_ nor _encoding_.
 * These methods are to be provided in sub-classes by consuming the appropriate mixins.
 *
 * For example, this is how the class can be used to implement an JSON encoding system:
 *
 * ```javascript
 * // let's make new CrudManager using AJAX as a transport system and JSON for encoding
 * class MyCrudManager extends JsonEncode(AjaxTransport(AbstractCrudManager)) {
 *
 * }
 * ```
 *
 * ## Data transfer and encoding methods
 *
 * These are methods that must be provided by subclasses of this class:
 *
 * - [#sendRequest](#Scheduler/crud/AbstractCrudManagerMixin#function-sendRequest)
 * - [#cancelRequest](#Scheduler/crud/AbstractCrudManagerMixin#function-cancelRequest)
 * - [#encode](#Scheduler/crud/AbstractCrudManagerMixin#function-encode)
 * - [#decode](#Scheduler/crud/AbstractCrudManagerMixin#function-decode)
 *
 * @extends Core/Base
 * @mixes Scheduler/crud/AbstractCrudManagerMixin
 * @abstract
 */

class AbstractCrudManager extends Base.mixin(AbstractCrudManagerMixin) {
  //region Default config

  /**
   * The server revision stamp.
   * The _revision stamp_ is a number which should be incremented after each server-side change.
   * This property reflects the current version of the data retrieved from the server and gets updated after each {@link Scheduler/crud/AbstractCrudManagerMixin#function-load} and {@link Scheduler/crud/AbstractCrudManagerMixin#function-sync} call.
   * @property {Number}
   * @readonly
   */
  get revision() {
    return this.crudRevision;
  }

  set revision(value) {
    this.crudRevision = value;
  }
  /**
   * Get or set data of {@link #property-crudStores} as a JSON string.
   *
   * Get a JSON string:
   * ```javascript
   *
   * const jsonString = scheduler.crudManager.json;
   *
   * // returned jsonString:
   * '{"eventsData":[...],"resourcesData":[...],...}'
   *
   * // object representation of the returned jsonString:
   * {
   *     resourcesData    : [...],
   *     eventsData       : [...],
   *     assignmentsData  : [...],
   *     dependenciesData : [...],
   *     timeRangesData   : [...],
   *     // data from other stores
   * }
   * ```
   *
   * Set a JSON string (to populate the CrudManager stores):
   *
   * ```javascript
   * scheduler.crudManager.json = '{"eventsData":[...],"resourcesData":[...],...}'
   * ```
   *
   * @property {String}
   */

  get json() {
    return StringHelper.safeJsonStringify(this);
  }

  set json(json) {
    if (typeof json === 'string') {
      json = StringHelper.safeJsonParse(json);
    }

    this.forEachCrudStore(store => {
      const dataName = `${store.storeId}Data`;

      if (json[dataName]) {
        store.data = json[dataName];
      }
    });
  }

  static get defaultConfig() {
    return {
      /**
       * Sets the list of stores controlled by the CRUD manager.
       *
       * When adding a store to the CrudManager, make sure the server response format is correct for `load` and `sync` requests.
       * Learn more in the [Working with data](#Scheduler/guides/data/crud_manager.md#loading-data) guide.
       *
       * Store can be provided by itself, its storeId or an object having the following structure:
       * @property {String} stores.storeId Unique store identifier. Under this name the store related requests/responses will be sent.
       * @property {Core.data.Store} stores.store The store itself.
       * @property {String} [stores.phantomIdField] Set this if the store model has a predefined field to keep phantom record identifier.
       * @property {String} [stores.idField] id field name, if it's not specified then class will try to get it from a store model.
       * @config {Core.data.Store[]|String[]|Object[]}
       */
      stores: null
      /**
       * Encodes request to the server.
       * @function encode
       * @param {Object} request The request to encode.
       * @returns {String} The encoded request.
       * @abstract
       */

      /**
       * Decodes response from the server.
       * @function decode
       * @param {String} response The response to decode.
       * @returns {Object} The decoded response.
       * @abstract
       */

    };
  } //endregion
  //region Init

  construct(config = {}) {
    if (config.stores) {
      config.crudStores = config.stores;
      delete config.stores;
    }

    super.construct(config);
  } //endregion
  //region inline data

  /**
   * Returns the data from all CrudManager `crudStores` in a format that can be consumed by `inlineData`.
   *
   * Used by JSON.stringify to correctly convert this CrudManager to json.
   *
   * The returned data is identical to what {@link Scheduler/crud/AbstractCrudManager#property-inlineData} contains.
   *
   * ```javascript
   *
   * const json = scheduler.crudManager.toJSON();
   *
   * // json:
   * {
   *     eventsData : [...],
   *     resourcesData : [...],
   *     dependenciesData : [...],
   *     assignmentsData : [...],
   *     timeRangesData : [...],
   *     resourceTimeRangesData : [...],
   *     // ... other stores data
   * }
   * ```
   *
   * Output can be consumed by `inlineData`.
   *
   * ```javascript
   * const json = scheduler.crudManager.toJSON();
   *
   * // Plug it back in later
   * scheduler.crudManager.inlineData = json;
   * ```
   *
   * @function toJSON
   * @returns {Object}
   * @category JSON
   */

  toJSON() {
    // Collect data from crudStores
    const result = {};
    this.forEachCrudStore((store, storeId) => result[`${storeId}Data`] = store.toJSON());
    return result;
  }
  /**
   * Get or set data of CrudManager stores. The returned data is identical to what
   * {@link Scheduler/crud/AbstractCrudManager#function-toJSON} returns:
   *
   * ```javascript
   *
   * const data = scheduler.crudManager.inlineData;
   *
   * // data:
   * {
   *     eventsData : [...],
   *     resourcesData : [...],
   *     dependenciesData : [...],
   *     assignmentsData : [...],
   *     timeRangesData : [...],
   *     resourceTimeRangesData : [...],
   *     ... other stores data
   * }
   *
   *
   * // Plug it back in later
   * scheduler.crudManager.inlineData = data;
   * ```
   *
   * @property {Object}
   */

  get inlineData() {
    return this.toJSON();
  }

  set inlineData(data) {
    this.json = data;
  } //endregion
  //region Store collection (add, remove, get & iterate)

  set stores(stores) {
    if (stores !== this.crudStores) {
      this.crudStores = stores;
    }
  }
  /**
   * A list of registered stores whose server communication will be collected into a single batch.
   * Each store is represented by a _store descriptor_, an object having following structure:
   * @member {Object[]} stores
   * @property {String} stores.storeId Unique store identifier.
   * @property {Core.data.Store} stores.store Store itself.
   * @property {String} [stores.phantomIdField] Set this if store model has a predefined field to keep phantom record identifier.
   * @property {String} [stores.idField] id field name, if it's not specified then class will try to get it from a store model.
   */

  get stores() {
    return this.crudStores;
  } //endregion

  /**
   * Returns true if the crud manager is currently loading data
   * @property {Boolean}
   * @readonly
   * @category CRUD
   */

  get isLoading() {
    return this.isCrudManagerLoading;
  }
  /**
   * Adds a store to the collection.
   *
   *```javascript
   * // append stores to the end of collection
   * crudManager.addStore([
   *     store1,
   *     // storeId
   *     'bar',
   *     // store descriptor
   *     {
   *         storeId : 'foo',
   *         store   : store3
   *     },
   *     {
   *         storeId         : 'bar',
   *         store           : store4,
   *         // to write all fields of modified records
   *         writeAllFields  : true
   *     }
   * ]);
   *```
   *
   * **Note:** Order in which stores are kept in the collection is very essential sometimes.
   * Exactly in this order the loaded data will be put into each store.
   *
   * When adding a store to the CrudManager, make sure the server response format is correct for `load` and `sync` requests.
   * Learn more in the [Working with data](#Scheduler/guides/data/crud_manager.md#loading-data) guide.
   *
   * @param {Core.data.Store|String|Object|Core.data.Store[]|String[]|Object[]} store
   * A store or list of stores. Each store might be specified by its instance, `storeId` or _descriptor_.
   * The _store descriptor_ is an object having following properties:
   * @param {String} store.storeId The store identifier that will be used as a key in requests.
   * @param {Core.data.Store} store.store The store itself.
   * @param {String} [store.idField] The idField of the store. If not specified will be taken from the store model.
   * @param {String} [store.phantomIdField] The field holding unique Ids of phantom records (if store has such model).
   * @param {Boolean} [store.writeAllFields] Set to true to write all fields from modified records
   * @param {Number} [position] The relative position of the store. If `fromStore` is specified the this position will be taken relative to it.
   * If not specified then store(s) will be appended to the end of collection.
   * Otherwise it will be just a position in stores collection.
   *
   * ```javascript
   * // insert stores store4, store5 to the start of collection
   * crudManager.addStore([ store4, store5 ], 0);
   * ```
   *
   * @param {String|Core.data.Store|Object} [fromStore] The store relative to which position should be calculated. Can be defined as a store identifier, instance or descriptor (the result of {@link Scheduler/crud/AbstractCrudManagerMixin#function-getStoreDescriptor} call).
   *
   * ```javascript
   * // insert store6 just before a store having storeId equal to 'foo'
   * crudManager.addStore(store6, 0, 'foo');
   *
   * // insert store7 just after store3 store
   * crudManager.addStore(store7, 1, store3);
   * ```
   */

  addStore(...args) {
    return this.addCrudStore(...args);
  }

  removeStore(...args) {
    return this.removeCrudStore(...args);
  }

  getStore(...args) {
    return this.getCrudStore(...args);
  }

  hasChanges(...args) {
    return this.crudStoreHasChanges(...args);
  }

  loadData(...args) {
    return this.loadCrudManagerData(...args);
  }

}
AbstractCrudManager._$name = 'AbstractCrudManager';

/**
 * @module Scheduler/data/CrudManager
 */

/**
 * The Crud Manager (or "CM") is a class implementing centralized loading and saving of data in multiple stores.
 * Loading the stores and saving all changes is done using a single request. The stores managed by CRUD manager should
 * not be configured with their own CRUD URLs or use {@link Core/data/AjaxStore#config-autoLoad}/{@link Core/data/AjaxStore#config-autoCommit}.
 *
 * This class uses JSON as its data encoding format.
 *
 * ## Scheduler stores
 *
 * The class supports Scheduler specific stores (namely: resource, event, assignment and dependency stores).
 * For these stores, the CM has separate configs ({@link #config-resourceStore}, {@link #config-eventStore},
 * {@link #config-assignmentStore}) to register them.
 *
 * ```javascript
 * const crudManager = new CrudManager({
 *     autoLoad        : true,
 *     resourceStore   : resourceStore,
 *     eventStore      : eventStore,
 *     assignmentStore : assignmentStore,
 *     transport       : {
 *         load : {
 *             url : 'php/read.php'
 *         },
 *         sync : {
 *             url : 'php/save.php'
 *         }
 *     }
 * });
 * ```
 *
 * ## AJAX request configuration
 *
 * To configure AJAX request parameters please take a look at the
 * {@link Scheduler/crud/transport/AjaxTransport} docs.
 *
 * ```javascript
 * const crudManager = new CrudManager({
 *     autoLoad        : true,
 *     resourceStore,
 *     eventStore,
 *     assignmentStore,
 *     transport       : {
 *         load    : {
 *             url         : 'php/read.php',
 *             // use GET request
 *             method      : 'GET',
 *             // pass request JSON in "rq" parameter
 *             paramName   : 'rq',
 *             // extra HTTP request parameters
 *             params      : {
 *                 foo     : 'bar'
 *             },
 *             // pass some extra Fetch API option
 *             credentials : 'include'
 *         },
 *         sync : {
 *             url : 'php/save.php'
 *         }
 *     }
 * });
 * ```
 * ## Using inline data
 *
 * The CrudManager provides settable property {@link #property-inlineData} that can
 * be used to get data from all {@link #property-crudStores} at once and to set this
 * data as well. Populating the stores this way can be useful if you cannot or you do not want to use CrudManager for
 * server requests but you pull the data by other means and have it ready outside CrudManager. Also, the data from all
 * stores is available in a single assignment statement.
 *
 * ### Getting data
 * ```javascript
 * const data = scheduler.crudManager.inlineData;
 *
 * // use the data in your application
 * ```
 *
 * ### Setting data
 * ```javascript
 * const data = // your function to pull server data
 *
 * scheduler.crudManager.inlineData = data;
 * ```
 *
 * ## Load order
 *
 * The CM is aware of the proper load order for Scheduler specific stores so you don't need to worry about it.
 * If you provide any extra stores (using {@link #config-stores} config) they will be
 * added to the start of collection before the Scheduler specific stores.
 * If you need a different loading order, you should use {@link #function-addStore} method to
 * register your store:
 *
 * ```javascript
 * const crudManager = new CrudManager({
 *     resourceStore   : resourceStore,
 *     eventStore      : eventStore,
 *     assignmentStore : assignmentStore,
 *     // extra user defined stores will get to the start of collection
 *     // so they will be loaded first
 *     stores          : [ store1, store2 ],
 *     transport       : {
 *         load : {
 *             url : 'php/read.php'
 *         },
 *         sync : {
 *             url : 'php/save.php'
 *         }
 *     }
 * });
 *
 * // append store3 to the end so it will be loaded last
 * crudManager.addStore(store3);
 *
 * // now when we registered all the stores let's load them
 * crudManager.load();
 * ```
 *
 * ## Assignment store
 *
 * The Crud Manager is designed to use {@link Scheduler/data/AssignmentStore} for assigning events to one or multiple resources.
 * However if server provides `resourceId` for any of the `events` then the Crud Manager enables backward compatible mode when
 * an event could have a single assignment only. This also disables multiple assignments in Scheduler UI.
 * In order to use multiple assignments server backend should be able to receive/send `assignments` for `load` and `sync` requests.
 *
 * ## Project
 *
 * The Crud Manager automatically consumes stores of the provided project (namely its {@link Scheduler/model/ProjectModel#property-eventStore},
 * {@link Scheduler/model/ProjectModel#property-resourceStore}, {@link Scheduler/model/ProjectModel#property-assignmentStore},
 * {@link Scheduler/model/ProjectModel#property-dependencyStore}, {@link Scheduler/model/ProjectModel#property-timeRangeStore} and
 * {@link Scheduler/model/ProjectModel#property-resourceTimeRangeStore}):
 *
 * ```javascript
 * const crudManager = new CrudManager({
 *     // crud manager will get stores from myAppProject project
 *     project   : myAppProject,
 *     transport : {
 *         load : {
 *             url : 'php/read.php'
 *         },
 *         sync : {
 *             url : 'php/save.php'
 *         }
 *     }
 * });
 * ```
 *
 * @mixes Scheduler/data/mixin/ProjectCrudManager
 * @mixes Scheduler/crud/encoder/JsonEncoder
 * @mixes Scheduler/crud/transport/AjaxTransport
 * @extends Scheduler/crud/AbstractCrudManager
 */

class CrudManager extends AbstractCrudManager.mixin(ProjectCrudManager, AjaxTransport, JsonEncoder) {
  //region Config
  static get defaultConfig() {
    return {
      projectClass: ProjectModel,
      resourceStoreClass: ResourceStore,
      eventStoreClass: EventStore,
      assignmentStoreClass: AssignmentStore,
      dependencyStoreClass: DependencyStore,

      /**
       * A store with resources (or its descriptor).
       * @config {Scheduler.data.ResourceStore|Object}
       */
      resourceStore: {},

      /**
       * A store with events (or its descriptor).
       *
       * ```
       * crudManager : {
       *      eventStore {
       *          storeClass : MyEventStore
       *      }
       * }
       * ```
       * @config {Scheduler.data.EventStore|Object}
       */
      eventStore: {},

      /**
       * A store with assignments (or its descriptor).
       * @config {Scheduler.data.AssignmentStore|Object}
       */
      assignmentStore: {},

      /**
       * A store with dependencies (or its descriptor).
       * @config {Scheduler.data.DependencyStore|Object}
       */
      dependencyStore: {},

      /**
       * A project that holds and links stores
       * @config {Scheduler.model.ProjectModel}
       */
      project: null
    };
  } //endregion

  buildProject() {
    return new this.projectClass(this.buildProjectConfig());
  }

  buildProjectConfig() {
    return ObjectHelper.cleanupProperties({
      eventStore: this.eventStore,
      resourceStore: this.resourceStore,
      assignmentStore: this.assignmentStore,
      dependencyStore: this.dependencyStore,
      resourceTimeRangeStore: this.resourceTimeRangeStore
    });
  } //region Stores

  set project(project) {
    const me = this;

    if (project !== me._project) {
      me.detachListeners('beforeDataReady');
      me.detachListeners('afterDataReady');
      me._project = project;

      if (project) {
        me.eventStore = project.eventStore;
        me.resourceStore = project.resourceStore;
        me.assignmentStore = project.assignmentStore;
        me.dependencyStore = project.dependencyStore;
        me.timeRangeStore = project.timeRangeStore;
        me.resourceTimeRangeStore = project.resourceTimeRangeStore; // When adding multiple events to the store it will trigger multiple change events each of which will
        // call crudManager.hasChanges, which will try to actually get the changeset package. It takes some time
        // and we better skip that part for the dataready event, suspending changes tracking.

        project.on({
          name: 'beforeDataReady',
          dataReady: () => me.suspendChangesTracking(),
          prio: 100,
          thisObj: me
        });
        project.on({
          name: 'afterDataReady',
          dataReady: () => me.resumeChangesTracking(),
          prio: -100,
          thisObj: me
        });
      }

      if (!me.eventStore) {
        me.eventStore = {};
      }

      if (!me.resourceStore) {
        me.resourceStore = {};
      }

      if (!me.assignmentStore) {
        me.assignmentStore = {};
      }

      if (!me.dependencyStore) {
        me.dependencyStore = {};
      }
    }
  }

  get project() {
    return this._project;
  }
  /**
   * Store for {@link Scheduler/feature/TimeRanges timeRanges} feature.
   * @property {Core.data.Store}
   */

  get timeRangeStore() {
    var _this$_timeRangeStore;

    return (_this$_timeRangeStore = this._timeRangeStore) === null || _this$_timeRangeStore === void 0 ? void 0 : _this$_timeRangeStore.store;
  }

  set timeRangeStore(store) {
    var _this$project;

    this.setFeaturedStore('_timeRangeStore', store, (_this$project = this.project) === null || _this$project === void 0 ? void 0 : _this$project.timeRangeStoreClass);
  }
  /**
   * Store for {@link Scheduler/feature/ResourceTimeRanges resourceTimeRanges} feature.
   * @property {Core.data.Store}
   */

  get resourceTimeRangeStore() {
    var _this$_resourceTimeRa;

    return (_this$_resourceTimeRa = this._resourceTimeRangeStore) === null || _this$_resourceTimeRa === void 0 ? void 0 : _this$_resourceTimeRa.store;
  }

  set resourceTimeRangeStore(store) {
    var _this$project2;

    this.setFeaturedStore('_resourceTimeRangeStore', store, (_this$project2 = this.project) === null || _this$project2 === void 0 ? void 0 : _this$project2.resourceTimeRangeStoreClass);
  }
  /**
   * Get/set the resource store bound to the CRUD manager.
   * @property {Scheduler.data.ResourceStore}
   */

  get resourceStore() {
    var _this$_resourceStore;

    return (_this$_resourceStore = this._resourceStore) === null || _this$_resourceStore === void 0 ? void 0 : _this$_resourceStore.store;
  }

  set resourceStore(store) {
    const me = this;
    me.setFeaturedStore('_resourceStore', store, me.resourceStoreClass);
  }
  /**
   * Get/set the event store bound to the CRUD manager.
   * @property {Scheduler.data.EventStore}
   */

  get eventStore() {
    var _this$_eventStore;

    return (_this$_eventStore = this._eventStore) === null || _this$_eventStore === void 0 ? void 0 : _this$_eventStore.store;
  }

  set eventStore(store) {
    const me = this;
    me.setFeaturedStore('_eventStore', store, me.eventStoreClass);
  }
  /**
   * Get/set the assignment store bound to the CRUD manager.
   * @property {Scheduler.data.AssignmentStore}
   */

  get assignmentStore() {
    var _this$_assignmentStor;

    return (_this$_assignmentStor = this._assignmentStore) === null || _this$_assignmentStor === void 0 ? void 0 : _this$_assignmentStor.store;
  }

  set assignmentStore(store) {
    this.setFeaturedStore('_assignmentStore', store, this.assignmentStoreClass);
  }
  /**
   * Get/set the dependency store bound to the CRUD manager.
   * @property {Scheduler.data.DependencyStore}
   */

  get dependencyStore() {
    var _this$_dependencyStor;

    return (_this$_dependencyStor = this._dependencyStore) === null || _this$_dependencyStor === void 0 ? void 0 : _this$_dependencyStor.store;
  }

  set dependencyStore(store) {
    this.setFeaturedStore('_dependencyStore', store, this.dependencyStoreClass);
  }

  setFeaturedStore(property, store, storeClass) {
    var _me$property;

    const me = this,
          oldStore = (_me$property = me[property]) === null || _me$property === void 0 ? void 0 : _me$property.store; // if not the same store

    if (oldStore !== store) {
      var _store;

      // normalize store value (turn it into a storeClass instance if needed)
      store = Store.getStore(store, ((_store = store) === null || _store === void 0 ? void 0 : _store.storeClass) || storeClass);

      if (oldStore) {
        me.removeStore(oldStore);
      }

      me[property] = store && {
        store
      } || null; // Adds configured scheduler stores to the store collection ensuring correct order
      // unless they're already registered.

      me.addPrioritizedStore(me[property]);
    }

    return me[property];
  }

  getChangeSetPackage() {
    const pack = super.getChangeSetPackage(); // Remove assignments from changes if using single assignment mode (resourceId)

    if (pack && this.eventStore.usesSingleAssignment) {
      delete pack[this.assignmentStore.storeId]; // No other changes?

      if (!this.crudStores.some(storeInfo => pack[storeInfo.storeId])) {
        return null;
      }
    }

    return pack;
  } //endregion

  get crudLoadValidationMandatoryStores() {
    return [this._eventStore.storeId, this._resourceStore.storeId];
  }

}
CrudManager._$name = 'CrudManager';

/**
 * @module Scheduler/eventlayout/PackMixin
 */

/**
 * Mixin holding functionality shared between HorizontalLayoutPack and VerticalLayout.
 *
 * @mixin
 * @private
 */

var PackMixin = (Target => class PackMixin extends (Target || Base) {
  static get $name() {
    return 'PackMixin';
  }

  static get defaultConfig() {
    return {
      coordProp: 'top',
      sizeProp: 'height',
      inBandCoordProp: 'inBandTop',
      inBandSizeProp: 'inBandHeight'
    };
  }

  isSameGroup(a, b) {
    return this.grouped ? a.group === b.group : true;
  } // Packs the events to consume as little space as possible

  packEventsInBands(events, applyClusterFn) {
    const me = this,
          {
      coordProp,
      sizeProp
    } = me;
    let slot, firstInCluster, cluster, j;

    for (let i = 0, l = events.length; i < l; i++) {
      firstInCluster = events[i];
      slot = me.findStartSlot(events, firstInCluster);
      cluster = me.getCluster(events, i);

      if (cluster.length > 1) {
        firstInCluster[coordProp] = slot.start;
        firstInCluster[sizeProp] = slot.end - slot.start; // If there are multiple slots, and events in the cluster have multiple start dates, group all same-start events into first slot

        j = 1;

        while (j < cluster.length - 1 && cluster[j + 1].start - firstInCluster.start === 0) {
          j++;
        } // See if there's more than 1 slot available for this cluster, if so - first group in cluster consumes the entire first slot

        const nextSlot = me.findStartSlot(events, cluster[j]);

        if (nextSlot && nextSlot.start < 0.8) {
          cluster.length = j;
        }
      }

      const clusterSize = cluster.length,
            slotSize = (slot.end - slot.start) / clusterSize; // Apply fraction values

      for (j = 0; j < clusterSize; j++) {
        applyClusterFn(cluster[j], j, slot, slotSize);
      }

      i += clusterSize - 1;
    }

    return 1;
  }

  findStartSlot(events, event) {
    const {
      inBandSizeProp,
      inBandCoordProp,
      coordProp,
      sizeProp
    } = this,
          priorOverlappers = this.getPriorOverlappingEvents(events, event);
    let i;

    if (priorOverlappers.length === 0) {
      return {
        start: 0,
        end: 1
      };
    }

    for (i = 0; i < priorOverlappers.length; i++) {
      const item = priorOverlappers[i],
            COORD_PROP = inBandCoordProp in item ? inBandCoordProp : coordProp,
            SIZE_PROP = inBandSizeProp in item ? inBandSizeProp : sizeProp;

      if (i === 0 && item[COORD_PROP] > 0) {
        return {
          start: 0,
          end: item[COORD_PROP]
        };
      } else {
        if (item[COORD_PROP] + item[SIZE_PROP] < (i < priorOverlappers.length - 1 ? priorOverlappers[i + 1][COORD_PROP] : 1)) {
          return {
            start: item[COORD_PROP] + item[SIZE_PROP],
            end: i < priorOverlappers.length - 1 ? priorOverlappers[i + 1][COORD_PROP] : 1
          };
        }
      }
    }

    return false;
  }

  getPriorOverlappingEvents(events, event) {
    const start = event.start,
          end = event.end,
          overlappers = [];

    for (let i = 0, l = events.indexOf(event); i < l; i++) {
      const item = events[i];

      if (this.isSameGroup(item, event) && DateHelper.intersectSpans(start, end, item.start, item.end)) {
        overlappers.push(item);
      }
    }

    overlappers.sort(this.sortOverlappers.bind(this));
    return overlappers;
  }

  sortOverlappers(e1, e2) {
    const {
      coordProp
    } = this;
    return e1[coordProp] - e2[coordProp];
  }

  getCluster(events, startIndex) {
    const startEvent = events[startIndex],
          result = [startEvent];

    if (startIndex >= events.length - 1) {
      return result;
    }

    let {
      start,
      end
    } = startEvent;

    for (let i = startIndex + 1, l = events.length; i < l; i++) {
      const item = events[i];

      if (!this.isSameGroup(item, startEvent) || !DateHelper.intersectSpans(start, end, item.start, item.end)) {
        break;
      }

      result.push(item);
      start = DateHelper.max(start, item.start);
      end = DateHelper.min(item.end, end);
    }

    return result;
  }

});

/**
 * @module Scheduler/view/mixin/EventSelection
 */

/**
 * Mixin that tracks event or assignment selection by clicking on one or more events in the scheduler.
 * @mixin
 */

var SchedulerEventSelection = (Target => class EventSelection extends (Target || Base) {
  static get $name() {
    return 'EventSelection';
  } //region Default config

  static get configurable() {
    return {
      /**
       * Configure as `true`, or set property to `true` to highlight dependent events as well when selecting an event.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      highlightPredecessors: false,

      /**
       * Configure as `true`, or set property to `true` to highlight dependent events as well when selecting an event.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      highlightSuccessors: false,

      /**
       * Configure as `true` to deselect a selected event upon click.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      deselectOnClick: false
    };
  }

  static get defaultConfig() {
    return {
      /**
       * Configure as `true` to allow `CTRL+click` to select multiple events in the scheduler.
       * @config {Boolean}
       * @category Selection
       */
      multiEventSelect: false,

      /**
       * Configure as `true`, or set property to `true` to disable event selection.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      eventSelectionDisabled: false,

      /**
       * CSS class to add to selected events.
       * @config {String}
       * @default
       * @category CSS
       * @private
       */
      eventSelectedCls: 'b-sch-event-selected',

      /**
       * Configure as `true` to trigger `selectionChange` when removing a selected event/assignment.
       * @config {Boolean}
       * @default
       * @category Selection
       */
      triggerSelectionChangeOnRemove: false,

      /**
       * This flag controls whether Scheduler should preserve its selection of events when loading a new dataset
       * (if selected event ids are included in the newly loaded dataset).
       * @config {Boolean}
       * @default
       * @category Selection
       */
      maintainSelectionOnDatasetChange: true,

      /**
       * CSS class to add to other instances of a selected event, to highlight them.
       * @config {String}
       * @default
       * @category CSS
       * @private
       */
      eventAssignHighlightCls: 'b-sch-event-assign-selected',

      /**
       * Collection to store selection.
       * @config {Core.util.Collection}
       * @private
       */
      selectedCollection: {}
    };
  } //endregion
  //region Events

  /**
   * Fired any time there is a change to the events selected in the Scheduler.
   * @event eventSelectionChange
   * @param {String} action One of the actions 'select', 'deselect', 'update', 'clear'
   * @param {Scheduler.model.EventModel[]} selected An array of the Events added to the selection.
   * @param {Scheduler.model.EventModel[]} deselected An array of the Event removed from the selection.
   * @param {Scheduler.model.EventModel[]} selection The new selection.
   */

  /**
   * Fired any time there is a change to the assignments selected in the Scheduler.
   * @event assignmentSelectionChange
   * @param {String} action One of the actions 'select', 'deselect', 'update', 'clear'
   * @param {Scheduler.model.AssignmentModel[]} selected An array of the Assignments added to the selection.
   * @param {Scheduler.model.AssignmentModel[]} deselected An array of the Assignments removed from the selection.
   * @param {Scheduler.model.AssignmentModel[]} selection The new selection.
   */
  //endregion
  //region Init

  afterConstruct() {
    var _this$navigator;

    super.afterConstruct();
    (_this$navigator = this.navigator) === null || _this$navigator === void 0 ? void 0 : _this$navigator.on({
      navigate: 'onEventNavigate',
      thisObj: this
    });
  } //endregion
  //region Selected Collection

  set selectedCollection(selectedCollection) {
    if (!(selectedCollection instanceof Collection)) {
      selectedCollection = new Collection(selectedCollection);
    }

    this._selectedCollection = selectedCollection; // Fire row change events from onSelectedCollectionChange

    selectedCollection.on({
      change: 'onSelectedCollectionChange',
      thisObj: this
    });
  }

  get selectedCollection() {
    return this._selectedCollection;
  } //endregion
  //region Modify selection

  getEventsFromAssignments(assignments) {
    return ArrayHelper.unique(assignments.map(assignment => assignment.event));
  }
  /**
   * The {@link Scheduler.model.EventModel events} which are selected.
   * @property {Scheduler.model.EventModel[]}
   * @category Selection
   */

  get selectedEvents() {
    return this.getEventsFromAssignments(this.selectedCollection.values);
  }

  set selectedEvents(events) {
    var _events;

    // Select all assignments
    const assignments = [];
    events = ArrayHelper.asArray(events);
    (_events = events) === null || _events === void 0 ? void 0 : _events.forEach(event => {
      if (this.isEventSelectable(event) !== false) {
        assignments.push(...event.assignments);
      }
    }); // Replace the entire selected collection with the new record set

    this.selectedCollection.splice(0, this.selectedCollection.count, assignments);
  }
  /**
   * The {@link Scheduler.model.AssignmentModel events} which are selected.
   * @property {Scheduler.model.AssignmentModel[]}
   * @category Selection
   */

  get selectedAssignments() {
    return this.selectedCollection.values;
  }

  set selectedAssignments(assignments) {
    // Replace the entire selected collection with the new record set
    this.selectedCollection.splice(0, this.selectedCollection.count, assignments || []);
  }
  /**
   * Returns `true` if the {@link Scheduler.model.EventModel event} is selected.
   * @param {Scheduler.model.EventModel} event The event
   * @return {Boolean} Returns `true` if the event is selected
   * @category Selection
   */

  isEventSelected(event) {
    return this.selectedEvents.includes(event);
  }
  /**
   * A template method (empty by default) allowing you to control if an event can be selected or not.
   *
   * ```javascript
   * new Scheduler({
   *     isEventSelectable(event) {
   *         return event.startDate >= Date.now();
   *     }
   * })
   * ```
   *
   * @param {Scheduler.model.EventModel} event The event record
   * @returns {Boolean} true if event can be selected, otherwise false
   * @category Selection
   */

  isEventSelectable(event) {}
  /**
   * Returns `true` if the {@link Scheduler.model.AssignmentModel assignment} is selected.
   * @param {Scheduler.model.AssignmentModel} assignment The assignment
   * @return {Boolean} Returns `true` if the assignment is selected
   * @category Selection
   */

  isAssignmentSelected(assignment) {
    return this.selectedCollection.includes(assignment);
  }
  /**
   * Selects the passed {@link Scheduler.model.EventModel event} or {@link Scheduler.model.AssignmentModel assignment}
   * *if it is not selected*. Selecting events results in all their assignments being selected.
   * @param {Scheduler.model.EventModel|Scheduler.model.AssignmentModel} eventOrAssignment The event or assignment to select
   * @param {Boolean} [preserveSelection] Pass `true` to preserve any other selected events or assignments
   * @category Selection
   */

  select(eventOrAssignment, preserveSelection = false) {
    if (eventOrAssignment.isAssignment) {
      this.selectAssignment(eventOrAssignment, preserveSelection);
    } else {
      this.selectEvent(eventOrAssignment, preserveSelection);
    }
  }
  /**
   * Selects the passed {@link Scheduler.model.EventModel event} *if it is not selected*. Selecting an event will
   * select all its assignments.
   * @param {Scheduler.model.EventModel} event The event select
   * @param {Boolean} [preserveSelection] Pass `true` to preserve any other selected events
   * @category Selection
   */

  selectEvent(event, preserveSelection = false) {
    // If the event is already selected, this is a no-op.
    // In this case, selection must not be cleared even in the absence of preserveSelection
    if (!this.isEventSelected(event)) {
      this.selectEvents([event], preserveSelection);
    }
  }
  /**
   * Selects the passed {@link Scheduler.model.AssignmentModel assignment} *if it is not selected*.
   * @param {Scheduler.model.AssignmentModel} assignment The assignment to select
   * @param {Boolean} [preserveSelection] Pass `true` to preserve any other selected assignments
   * @param {Event} [event] If this method was invoked as a result of a user action, this is the DOM event that triggered it
   * @category Selection
   */

  selectAssignment(assignment, preserveSelection = false, event) {
    // If the event is already selected, this is a no-op.
    // In this case, selection must not be cleared even in the absence of preserveSelection
    if (!this.isAssignmentSelected(assignment)) {
      preserveSelection ? this.selectedCollection.add(assignment) : this.selectedAssignments = assignment;
    }
  }
  /**
   * Deselects the passed {@link Scheduler.model.EventModel event} or {@link Scheduler.model.AssignmentModel assignment}
   * *if it is selected*.
   * @param {Scheduler.model.EventModel|Scheduler.model.AssignmentModel} eventOrAssignment The event or assignment to deselect.
   * @category Selection
   */

  deselect(eventOrAssignment) {
    if (eventOrAssignment.isAssignment) {
      this.deselectAssignment(eventOrAssignment);
    } else {
      this.deselectEvent(eventOrAssignment);
    }
  }
  /**
   * Deselects the passed {@link Scheduler.model.EventModel event} *if it is selected*.
   * @param {Scheduler.model.EventModel} event The event to deselect.
   * @category Selection
   */

  deselectEvent(event) {
    if (this.isEventSelected(event)) {
      this.selectedCollection.remove(...event.assignments);
    }
  }
  /**
   * Deselects the passed {@link Scheduler.model.AssignmentModel assignment} *if it is selected*.
   * @param {Scheduler.model.AssignmentModel} assignment The assignment to deselect
   * @param {Event} [event] If this method was invoked as a result of a user action, this is the DOM event that triggered it
   * @category Selection
   */

  deselectAssignment(assignment) {
    if (this.isAssignmentSelected(assignment)) {
      this.selectedCollection.remove(assignment);
    }
  }
  /**
   * Adds {@link Scheduler.model.EventModel events} to the selection.
   * @param {Scheduler.model.EventModel[]} events Events to be selected
   * @param {Boolean} [preserveSelection] Pass `true` to preserve any other selected events
   * @category Selection
   */

  selectEvents(events, preserveSelection = false) {
    if (preserveSelection) {
      const assignments = events.reduce((assignments, event) => {
        if (this.isEventSelectable(event) !== false) {
          assignments.push(...event.assignments);
        }

        return assignments;
      }, []);
      this.selectedCollection.add(assignments);
    } else {
      this.selectedEvents = events;
    }
  }
  /**
   * Removes {@link Scheduler.model.EventModel events} from the selection.
   * @param {Scheduler.model.EventModel[]} events Events or assignments  to be deselected
   * @category Selection
   */

  deselectEvents(events) {
    this.selectedCollection.remove(events.reduce((assignments, event) => {
      assignments.push(...event.assignments);
      return assignments;
    }, []));
  }
  /**
   * Adds {@link Scheduler.model.AssignmentModel assignments} to the selection.
   * @param {Scheduler.model.AssignmentModel[]} assignments Assignments to be selected
   * @category Selection
   */

  selectAssignments(assignments) {
    this.selectedCollection.add(assignments);
  }
  /**
   * Removes {@link Scheduler.model.AssignmentModel assignments} from the selection.
   * @param {Scheduler.model.AssignmentModel[]} assignments Assignments  to be deselected
   * @category Selection
   */

  deselectAssignments(assignments) {
    this.selectedCollection.remove(assignments);
  }
  /**
   * Deselects all {@link Scheduler.model.EventModel events} and {@link Scheduler.model.AssignmentModel assignments}.
   * @category Selection
   */

  clearEventSelection() {
    this.selectedAssignments = [];
  } //endregion
  //region Events

  /**
   * Responds to mutations of the underlying selection Collection.
   * Keeps the UI synced, eventSelectionChange and assignmentSelectionChange event is fired when `me.silent` is falsy.
   * @private
   */

  onSelectedCollectionChange({
    added,
    removed
  }) {
    const me = this,
          selection = me.selectedAssignments,
          selected = added || [],
          deselected = removed || [];

    function updateSelection(assignmentRecord, select) {
      const eventRecord = assignmentRecord.event;

      if (eventRecord) {
        const element = me.getElementFromAssignmentRecord(assignmentRecord);
        me.currentOrientation.toggleCls(assignmentRecord, me.eventSelectedCls, select);
        me.getElementsFromEventRecord(eventRecord).forEach(el => {
          if (el !== element) {
            const otherAssignmentRecord = me.resolveAssignmentRecord(el);
            me.currentOrientation.toggleCls(otherAssignmentRecord, me.eventAssignHighlightCls, select);

            if (select) {
              // Need to force a reflow to get the highlightning animation triggered
              el.style.animation = 'none';
              el.offsetHeight;
              el.style.animation = '';
            }

            el.classList[select ? 'add' : 'remove'](me.eventAssignHighlightCls);
          }
        });
      }
    }

    deselected.forEach(record => updateSelection(record, false));
    selected.forEach(record => updateSelection(record, true));

    if (me.highlightSuccessors || me.highlightPredecessors) {
      me.highlightLinkedEvents(me.selectedEvents);
    } // To be able to restore selection after reloading resources (which might lead to regenerated assignments in
    // the single assignment scenario, so cannot rely on records or ids)

    me.$selectedAssignments = selection.map(assignment => ({
      eventId: assignment.eventId,
      resourceId: assignment.resourceId
    }));

    if (!me.silent) {
      const action = selection.length > 0 ? selected.length > 0 && deselected.length > 0 ? 'update' : selected.length > 0 ? 'select' : 'deselect' : 'clear';
      me.trigger('assignmentSelectionChange', {
        action,
        selection,
        selected,
        deselected
      });
      me.trigger('eventSelectionChange', {
        action,
        selection: me.selectedEvents,
        selected: me.getEventsFromAssignments(selected),
        deselected: me.getEventsFromAssignments(deselected)
      });
    }
  }
  /**
   * Assignment change listener to remove events from selection which are no longer in the assignments.
   * @private
   */

  onAssignmentChange({
    action,
    records: assignments
  }) {
    const me = this;
    me.silent = !me.triggerSelectionChangeOnRemove;

    if (action === 'remove') {
      me.deselectAssignments(assignments);
    } else if (action === 'removeall' && !me.eventStore.isSettingData) {
      me.clearEventSelection();
    } else if (action === 'dataset' && me.$selectedAssignments) {
      if (!me.maintainSelectionOnDatasetChange) {
        me.clearEventSelection();
      } else {
        const newAssignments = me.$selectedAssignments.map(selector => assignments.find(a => a.eventId === selector.eventId && a.resourceId === selector.resourceId));
        me.selectedAssignments = ArrayHelper.clean(newAssignments);
      }
    }

    me.silent = false;
  }

  onInternalEventStoreChange({
    source,
    action,
    records
  }) {
    // Setting empty event dataset cannot be handled in onAssignmentChange above, no assignments might be affected
    if (!source.isResourceTimeRangeStore && action === 'dataset' && !records.length) {
      this.clearEventSelection();
    }

    super.onInternalEventStoreChange(...arguments);
  }
  /**
   * Mouse listener to update selection.
   * @private
   */

  onAssignmentSelectionClick(event, clickedRecord) {
    const me = this; // Multi selection: CTRL means preserve selection, just add or remove the event.
    // Single selection: CTRL deselects already selected event

    if (me.isAssignmentSelected(clickedRecord)) {
      if (me.deselectOnClick || event.ctrlKey) {
        me.deselectAssignment(clickedRecord, me.multiEventSelect, event);
      }
    } else if (this.isEventSelectable(clickedRecord.event) !== false) {
      me.selectAssignment(clickedRecord, event.ctrlKey && me.multiEventSelect, event);
    }
  }
  /**
   * Navigation listener to update selection.
   * @private
   */

  onEventNavigate({
    event,
    item
  }) {
    if (!this.eventSelectionDisabled) {
      const assignment = item && (item.nodeType === Element.ELEMENT_NODE ? this.resolveAssignmentRecord(item) : item);

      if (assignment) {
        this.onAssignmentSelectionClick(event, assignment);
      } // Click outside of an event/assignment;
      else {
        this.clearEventSelection();
      }
    }
  }

  changeHighlightSuccessors(value) {
    return this.changeLinkedEvents(value);
  }

  changeHighlightPredecessors(value) {
    return this.changeLinkedEvents(value);
  }

  changeLinkedEvents(value) {
    const me = this;

    if (value) {
      me.highlighted = me.highlighted || new Set();
      me.highlightLinkedEvents(me.selectedEvents);
    } else if (me.highlighted) {
      me.highlightLinkedEvents();
    }

    return value;
  } // Function that highlights/unhighlights events in a dependency chain

  highlightLinkedEvents(eventRecords = []) {
    const me = this,
          {
      highlighted
    } = me,
          dependenciesFeature = me.features.dependencies;
    me.eventStore.beginBatch(); // Unhighlight previously highlighted records

    highlighted.forEach(eventRecord => {
      if (!eventRecords.includes(eventRecord)) {
        eventRecord.$highlight = false;
        highlighted.delete(eventRecord);

        if (me.eventStore.includes(eventRecord)) {
          eventRecord.dependencies.forEach(dep => dependenciesFeature.unhighlight(dep, 'b-highlight'));
        }
      }
    });
    eventRecords.forEach(eventRecord => {
      const toWalk = [eventRecord]; // Collect all events along the dependency chain

      while (toWalk.length) {
        const record = toWalk.pop();
        highlighted.add(record);

        if (me.highlightSuccessors) {
          record.outgoingDeps.forEach(outgoing => {
            dependenciesFeature.highlight(outgoing, 'b-highlight');
            !highlighted.has(outgoing.toEvent) && toWalk.push(outgoing.toEvent);
          });
        }

        if (me.highlightPredecessors) {
          record.incomingDeps.forEach(incoming => {
            dependenciesFeature.highlight(incoming, 'b-highlight');
            !highlighted.has(incoming.fromEvent) && toWalk.push(incoming.fromEvent);
          });
        }
      } // Highlight them

      highlighted.forEach(record => record.$highlight = true);
    });
    me.eventStore.endBatch();

    if (eventRecords.length > 0) {
      // And flag schedulers element, to fade others out
      me.element.classList.add('b-highlighting');
    } else {
      // Fade all in again
      me.element.classList.remove('b-highlighting');
    }
  }

  onEventDataGenerated(renderData) {
    if (this.highlightSuccessors || this.highlightPredecessors) {
      renderData.cls['b-highlight'] = renderData.eventRecord.$highlight;
    }

    super.onEventDataGenerated(renderData);
  }

  updateProject(project, old) {
    // Clear selection when the whole world shifts :)
    this.clearEventSelection();
    super.updateProject(project, old);
  } //endregion

  doDestroy() {
    var _this$_selectedCollec;

    (_this$_selectedCollec = this._selectedCollection) === null || _this$_selectedCollec === void 0 ? void 0 : _this$_selectedCollec.destroy();
    super.doDestroy();
  } //region Getters/Setters
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {} //endregion

});

export { AbstractCrudManager, CrudManager, PackMixin, SchedulerEventSelection };
//# sourceMappingURL=EventSelection.js.map
