/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { Base, StringHelper, _objectSpread2, DateHelper, ContextMenuBase, Popup, DomHelper, Objects, ObjectHelper, LocaleHelper, LocaleManagerSingleton, Delayable, Navigator } from './Editor.js';
import { ProjectModel } from './ProjectModel.js';
import { GridFeatureManager, locale as locale$1, Location } from './GridBase.js';

/**
 * @module Scheduler/data/mixin/ProjectConsumer
 */

/**
 * Creates a Project using any configured stores, and sets the stores configured into the project into
 * the host object.
 *
 * @mixin
 */

var ProjectConsumer = (Target => class ProjectConsumer extends (Target || Base) {
  static get $name() {
    return 'ProjectConsumer';
  } //region Default config

  static get declarable() {
    return ['projectStores'];
  }

  static get configurable() {
    return {
      projectModelClass: ProjectModel,
      // TODO: move to SchedulerProBase and SchedulerBase to specify different types

      /**
       * The {@link Scheduler.model.ProjectModel} instance, containing the data visualized by the Scheduler.
       *
       * **Note:** In SchedulerPro the project is instance of SchedulerPro.model.ProjectModel class.
       * @member {Scheduler.model.ProjectModel} project
       * @category Data
       */

      /**
       * A {@link Scheduler.model.ProjectModel} instance or a config object. The project holds all Scheduler data.
       * Can be omitted in favor of individual store configs or {@link Scheduler.view.mixin.SchedulerStores#config-crudManager} config.
       *
       * **Note:** This config is **mandatory** in SchedulerPro. See SchedulerPro.model.ProjectModel class.
       * @config {Scheduler.model.ProjectModel|Object} project
       * @category Data
       */
      project: {},

      /**
       * Configure as `true` to destroy the Project and stores when `this` is destroyed.
       * @config {Boolean}
       * @category Data
       */
      destroyStores: null,
      // Will be populated by AttachToProjectMixin which features mix in
      projectSubscribers: []
    };
  } //endregion

  startConfigure(config) {
    // process the project first which ingests any configured data sources,
    this.getConfig('project');
    super.startConfigure(config);
  } //region Project
  // This is where all the ingestion happens.
  // At config time, the changers inject incoming values into the project config object
  // that we are building. At the end we instantiate the project with all incoming
  // config values filled in.

  changeProject(project, oldProject) {
    const me = this,
          {
      projectStoreNames,
      projectDataNames
    } = me.constructor;
    me.projectCallbacks = new Set();

    if (project) {
      // Flag for changes to know what stage we are at
      me.buildingProjectConfig = true;

      if (!project.isModel) {
        // When configuring, prio order:
        // 1. If using an already existing CrudManager, it is assumed to already have the stores we should use,
        //    adopt them as ours.
        // 2. If a supplied store already has a project, it is assumed to be shared with another scheduler and
        //    that project is adopted as ours.
        // 3. Use stores from a supplied project config.
        // 4. Use stores configured on scheduler.
        // + Pass on inline data (events, resources, dependencies, assignments -> xxData on the project config)
        //
        // What happens during project initialization is this:
        // this._project is the project *config* object.
        // changeXxxx methods put incoming values directly into it through this.project
        // to be used as its configuration.
        // So when it is instantiated, it has had all configs injected.
        if (me.isConfiguring) {
          // Set property for changers to put incoming values into
          me._project = project; // crudManager will be a clone of the raw config if it is a raw config.

          const {
            crudManager
          } = me; // Pull in stores from the crudManager config first

          if (crudManager) {
            const {
              isCrudManager
            } = crudManager;

            for (const storeName of projectStoreNames) {
              if (crudManager[storeName]) {
                // We configure the project with the stores, and *not* the CrudManager.
                // The CrudManager ends up having its project set and thereby adopting ours.
                me[storeName] = crudManager[storeName]; // If it's just a config, take the stores out.
                // We will *configure* it with this project and it will ingest
                // its stores from there.

                if (!isCrudManager) {
                  delete crudManager[storeName];
                }
              }
            }
          } // Pull in all our configured stores into the project config object.
          // That also extracts any project into this._sharedProject

          me.getConfig('projectStores'); // Referencing these data configs causes them to be pulled into
          // the _project.xxxData config property if they are present.

          for (const dataName of projectDataNames) {
            me.getConfig(dataName);
          }
        }

        const {
          eventStore
        } = project; // Delay autoLoading until listeners are set up, to be able to inject params

        if (eventStore && !eventStore.isEventStoreMixin && eventStore.autoLoad && !eventStore.count) {
          eventStore.autoLoad = false;
          me.delayAutoLoad = true;
        } // Use sharedProject if found, else instantiate our config.

        project = me._sharedProject || new me.projectModelClass(project); // Clear the property so that the updater is called.

        delete me._project;
      } // In the updater, configs are live

      me.buildingProjectConfig = false;
    }

    return project;
  }
  /**
   * Implement in subclass to take action when project is replaced.
   *
   * __`super.updateProject(...arguments)` must be called first.__
   *
   * @param {Scheduler.model.ProjectModel} project
   */

  updateProject(project, oldProject) {
    const me = this,
          {
      projectListeners,
      crudManager
    } = me;
    me.detachListeners('projectConsumer'); // When we set the crudManager now, it will go through to the CrudManagerVIew

    delete me._crudManager;

    if (project) {
      projectListeners.thisObj = me;
      project.on(projectListeners); // If the project is a CrudManager, use it as such.

      if (project.isCrudManager) {
        me.crudManager = project;
      } // Apply the project to CrudManager, making sure the same stores are used there and here
      else if (crudManager) {
        crudManager.project = project; // CrudManager goes through the changer as usual and is initialized
        // from the Project, not any stores it was originally configured with.

        me.crudManager = crudManager;
      } // Notifies classes that mix AttachToProjectMixin that we have a new project

      me.projectSubscribers.forEach(subscriber => subscriber.attachToProject(project)); // Sets the project's stores into the host object

      for (const storeName of me.constructor.projectStoreNames) {
        me[storeName] = project[storeName];
      } // Listeners are set up, if EventStore was configured with autoLoad now is the time to load

      if (me.delayAutoLoad) {
        // Restore the flag, not needed but to look good on inspection
        project.eventStore.autoLoad = true;
        project.eventStore.load();
      }
    }

    me.trigger('projectChange', {
      project
    });
  } // Implementation here because we need to get first look at it to adopt its stores

  changeCrudManager(crudManager) {
    // Set the property to be scanned for incoming stores.
    // If it's a config, it will be stripped of those stores prior to construction.
    if (this.buildingProjectConfig) {
      this._crudManager = crudManager.isCrudManager ? crudManager : Object.assign({}, crudManager);
    } else {
      return super.changeCrudManager(crudManager);
    }
  } // Called when project changes are committed, after data is written back to records

  onProjectDataReady() {
    if (this.projectCallbacks.size) {
      this.projectCallbacks.forEach(callback => callback());
      this.projectCallbacks.clear();
    }
  }
  /**
   * Accepts a callback that will be called when the underlying project is ready (no commit pending and current commit
   * finalized)
   * @param {Function} callback
   */

  whenProjectReady(callback) {
    // Might already be ready, call directly
    if (this.isEngineReady) {
      callback();
    } else {
      this.projectCallbacks.add(callback);
    }
  }
  /**
   * Returns `true` if engine is in a stable calculated state, `false` otherwise.
   * @property {Boolean}
   */

  get isEngineReady() {
    var _this$project$isEngin, _this$project;

    // NonWorkingTime calls this during destruction, hence the ?.
    return Boolean((_this$project$isEngin = (_this$project = this.project).isEngineReady) === null || _this$project$isEngin === void 0 ? void 0 : _this$project$isEngin.call(_this$project));
  } //endregion
  //region Destroy
  // Cleanup, destroys stores if this.destroyStores is true.

  doDestroy() {
    super.doDestroy();

    if (this.destroyStores) {
      // Shared project might already be destroyed
      !this.project.isDestroyed && this.project.destroy();
    }
  } //endregion

  get projectStores() {
    const {
      projectStoreNames
    } = this.constructor;
    return projectStoreNames.map(storeName => this[storeName]);
  }

  static get projectStoreNames() {
    return Object.keys(this.projectStores);
  }

  static get projectDataNames() {
    return this.projectStoreNames.reduce((result, storeName) => {
      const {
        dataName
      } = this.projectStores[storeName];

      if (dataName) {
        result.push(dataName);
      }

      return result;
    }, []);
  }

  static setupProjectStores(cls, meta) {
    const {
      projectStores
    } = cls;

    if (projectStores) {
      const projectListeners = {
        name: 'projectConsumer',
        dataReady: 'onProjectDataReady',
        change: 'relayProjectDataChange'
      },
            storeConfigs = {
        projectListeners
      }; // Create property for dataName and change and updater for stores

      for (const storeName in projectStores) {
        const {
          dataName
        } = projectStores[storeName]; // Define "eventStore" config

        storeConfigs[storeName] = null; // Define up the "events" property

        if (dataName) {
          // Getter to return store data
          // Setter to update project config or live project
          Object.defineProperty(meta.class.prototype, dataName, {
            get() {
              var _this$project$storeNa;

              // get events() { return this.project.eventStore.records; }
              return (_this$project$storeNa = this.project[storeName]) === null || _this$project$storeNa === void 0 ? void 0 : _this$project$storeNa.records;
            },

            set(data) {
              const {
                project
              } = this;

              if (this.buildingProjectConfig) {
                // Set the property in the project config object.
                // eg project.eventsData = [...]
                project[`${dataName}Data`] = data;
              } else {
                // Live update the project when in use.
                project[storeName].data = data;
              }
            }

          });
        }

        this.createStoreDescriptor(meta, storeName, projectStores[storeName], projectListeners);
      } // Create the projectListeners config.

      this.setupConfigs(meta, storeConfigs);
    }
  }

  static createStoreDescriptor(meta, storeName, {
    listeners
  }, projectListeners) {
    const {
      prototype: clsProto
    } = meta.class,
          storeNameCap = StringHelper.capitalize(storeName); // Set up onProjectEventStoreChange to set this.eventStore

    projectListeners[`${storeName}Change`] = function ({
      store
    }) {
      this[storeName] = store;
    }; // create changeEventStore

    clsProto[`change${storeNameCap}`] = function (store, oldStore) {
      var _store;

      const me = this,
            {
        project
      } = me,
            storeProject = (_store = store) === null || _store === void 0 ? void 0 : _store.project;

      if (me.buildingProjectConfig) {
        // Capture any project found at project config time
        // to use as our shared project
        if (storeProject && storeProject.isProjectModel) {
          me._sharedProject = storeProject;
        } // Set the property in the project config object.
        // Must not go through the updater. It's too early to
        // inform host of store change.

        project[storeName] = store;
        return;
      } // Live update the project when in use.

      if (!me.initializingProject) {
        if (project[storeName] !== store) {
          project[`set${storeNameCap}`](store);
          store = project[storeName];
        }
      } // Implement processing here instead of creating a separate updater.
      // Subclasses can implement updaters.

      if (store !== oldStore) {
        if (listeners) {
          listeners.thisObj = me;
          listeners.name = `${storeName}Listeners`;
          me.detachListeners(listeners.name);
          store.on(listeners);
        } // Notifies classes that mix AttachToProjectMixin that we have a new XxxxxStore

        me.projectSubscribers.forEach(subscriber => {
          var _subscriber$;

          (_subscriber$ = subscriber[`attachTo${storeNameCap}`]) === null || _subscriber$ === void 0 ? void 0 : _subscriber$.call(subscriber, store);
        });
      }

      return store;
    };
  }

  relayProjectDataChange(event) {
    /**
     * Fired when data in any of the projects stores changes.
     *
     * Basically a relayed version of each stores own change event, decorated with which store it originates from.
     * See the {@link Core.data.Store#event-change store change event} documentation for more information.
     *
     * @event dataChange
     * @param {Scheduler.data.mixin.ProjectConsumer} source Owning component
     * @param {Scheduler.model.mixin.ProjectModelMixin} project Project model
     * @param {Core.data.Store} store Affected store
     * @param {String} action Name of action which triggered the change. May be one of:
     * * `'remove'`
     * * `'removeAll'`
     * * `'add'`
     * * `'updatemultiple'`
     * * `'clearchanges'`
     * * `'filter'`
     * * `'update'`
     * * `'dataset'`
     * * `'replace'`
     * @param {Core.data.Model} record Changed record, for actions that affects exactly one record (`'update'`)
     * @param {Core.data.Model[]} records Changed records, passed for all actions except `'removeAll'`
     * @param {Object} changes Passed for the `'update'` action, info on which record fields changed
     */
    return this.trigger('dataChange', _objectSpread2(_objectSpread2({
      project: event.source
    }, event), {}, {
      source: this
    }));
  } //region WidgetClass
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {} //endregion

});

/**
 * @module Scheduler/tooltip/ClockTemplate
 */

/**
 * A template showing a clock, it consumes an object containing a date and a text
 * @private
 */

class ClockTemplate extends Base {
  static get defaultConfig() {
    return {
      minuteHeight: 8,
      minuteTop: 2,
      hourHeight: 8,
      hourTop: 2,
      handLeft: 10,
      div: document.createElement('div'),
      scheduler: null,

      // may be passed to the constructor if needed
      // `b-sch-clock-day` for calendar icon
      // `b-sch-clock-hour` for clock icon
      template(data) {
        return `<div class="b-sch-clockwrap b-sch-clock-${data.mode || this.mode} ${data.cls || ''}">
                    <div class="b-sch-clock">
                        <div class="b-sch-hour-indicator">${DateHelper.format(data.date, 'MMM')}</div>
                        <div class="b-sch-minute-indicator">${DateHelper.format(data.date, 'D')}</div>
                        <div class="b-sch-clock-dot"></div>
                    </div>
                    <span class="b-sch-clock-text">${StringHelper.encodeHtml(data.text)}</span>
                </div>`;
      }

    };
  }

  generateContent(data) {
    const me = this,
          date = data.date,
          html = me.template(data),
          div = me.div;
    div.innerHTML = html;
    me.updateDateIndicator(div, date);
    return div.innerHTML;
  }

  updateDateIndicator(el, date) {
    const hourIndicatorEl = el === null || el === void 0 ? void 0 : el.querySelector('.b-sch-hour-indicator'),
          minuteIndicatorEl = el === null || el === void 0 ? void 0 : el.querySelector('.b-sch-minute-indicator');

    if (date && hourIndicatorEl && minuteIndicatorEl) {
      if (this.mode === 'hour') {
        hourIndicatorEl.style.transform = `rotate(${date.getHours() % 12 * 30}deg)`;
        minuteIndicatorEl.style.transform = `rotate(${date.getMinutes() * 6}deg)`;
      } else {
        hourIndicatorEl.style.transform = 'none';
        minuteIndicatorEl.style.transform = 'none';
      }
    }
  }

  set mode(mode) {
    this._mode = mode;
  } // `day` mode for calendar icon
  // `hour` mode for clock icon

  get mode() {
    if (this._mode) {
      return this._mode;
    }

    const unitLessThanDay = DateHelper.compareUnits(this.scheduler.timeAxisViewModel.timeResolution.unit, 'day') < 0,
          formatContainsHourInfo = DateHelper.formatContainsHourInfo(this.scheduler.displayDateFormat);
    return unitLessThanDay && formatContainsHourInfo ? 'hour' : 'day';
  }

  set template(template) {
    this._template = template;
  }
  /**
   * Get the clock template, which accepts an object of format { date, text }
   * @property {function(*): string}
   */

  get template() {
    return this._template;
  }

}
ClockTemplate._$name = 'ClockTemplate';

/**
 * @module Scheduler/feature/base/TimeSpanMenuBase
 */

/**
 * Abstract base class used by other context menu features which show the context menu for TimeAxis.
 * Using this class you can make sure the menu expects the target to disappear,
 * since it can be scroll out of the scheduling zone.
 *
 * Features that extend this class are:
 *  * {@link Scheduler/feature/EventMenu EventMenu};
 *  * {@link Scheduler/feature/ScheduleMenu ScheduleMenu};
 *  * {@link Scheduler/feature/TimeAxisHeaderMenu TimeAxisHeaderMenu};
 *
 * @extends Core/feature/base/ContextMenuBase
 * @abstract
 */

class TimeSpanMenuBase extends ContextMenuBase {}
TimeSpanMenuBase._$name = 'TimeSpanMenuBase';

/**
 * @module Scheduler/view/recurrence/RecurrenceConfirmationPopup
 */

/**
 * Confirmation dialog showing up before modifying a recurring event or some of its occurrences.
 * For recurring events the dialog notifies user that the event change/removal will cause all its occurrences
 * change/removal and asks to confirm the action.
 *
 * And for occurrences the dialog allows to choose if user wants to affect all further occurrences, this occurrence only or cancel the change.
 *
 * Usage example:
 *
 * ```javascript
 * const confirmation = new RecurrenceConfirmationPopup();
 *
 * confirmation.confirm({
 *     eventRecord : recurringEvent,
 *     actionType  : "delete",
 *     changerFn   : () => recurringEvent.remove(event)
 * });
 * ```
 *
 * @classType recurrenceconfirmation
 * @extends Core/widget/Popup
 */

class RecurrenceConfirmationPopup extends Popup {
  static get $name() {
    return 'RecurrenceConfirmationPopup';
  } // Factoryable type name

  static get type() {
    return 'recurrenceconfirmation';
  }

  static get defaultConfig() {
    return {
      localizableProperties: [],
      align: 'b-t',
      autoShow: false,
      autoClose: false,
      closeAction: 'onRecurrenceClose',
      modal: true,
      centered: true,
      scrollAction: 'realign',
      constrainTo: globalThis,
      draggable: true,
      closable: true,
      floating: true,
      eventRecord: null,
      cls: 'b-sch-recurrenceconfirmation',
      bbar: {
        defaults: {
          localeClass: this
        },
        items: {
          changeMultipleButton: {
            weight: 100,
            color: 'b-green',
            text: 'L{Object.Yes}',
            onClick: 'up.onChangeMultipleButtonClick'
          },
          changeSingleButton: {
            weight: 200,
            color: 'b-gray',
            text: 'L{update-only-this-btn-text}',
            onClick: 'up.onChangeSingleButtonClick'
          },
          cancelButton: {
            weight: 300,
            color: 'b-gray',
            text: 'L{Object.Cancel}',
            onClick: 'up.onCancelButtonClick'
          }
        }
      }
    };
  }
  /**
   * Reference to the "Apply changes to multiple occurrences" button, if used
   * @property {Core.widget.Button}
   * @readonly
   */

  get changeMultipleButton() {
    return this.widgetMap.changeMultipleButton;
  }
  /**
   * Reference to the button that causes changing of the event itself only, if used
   * @property {Core.widget.Button}
   * @readonly
   */

  get changeSingleButton() {
    return this.widgetMap.changeSingleButton;
  }
  /**
   * Reference to the cancel button, if used
   * @property {Core.widget.Button}
   * @readonly
   */

  get cancelButton() {
    return this.widgetMap.cancelButton;
  }
  /**
   * Handler for "Apply changes to multiple occurrences" {@link #property-changeMultipleButton button}.
   * It calls {@link #function-processMultipleRecords} and then hides the dialog.
   */

  onChangeMultipleButtonClick() {
    this.processMultipleRecords();
    this.hide();
  }
  /**
   * Handler for the {@link #property-changeSingleButton button} that causes changing of the event itself only.
   * It calls {@link #function-processSingleRecord} and then hides the dialog.
   */

  onChangeSingleButtonClick() {
    this.processSingleRecord();
    this.hide();
  }
  /**
   * Handler for {@link #property-cancelButton cancel button}.
   * It calls `cancelFn` provided to {@link #function-confirm} call and then hides the dialog.
   */

  onCancelButtonClick() {
    this.cancelFn && this.cancelFn.call(this.thisObj);
    this.hide();
  }

  onRecurrenceClose() {
    if (this.cancelFn) {
      this.cancelFn.call(this.thisObj);
    }

    this.hide();
  }
  /**
   * Displays the confirmation.
   * Usage example:
   *
   * ```javascript
   * const popup = new RecurrenceConfirmationPopup();
   *
   * popup.confirm({
   *     eventRecord,
   *     actionType : "delete",
   *     changerFn  : () => eventStore.remove(record)
   * });
   * ```
   *
   * @param {Object}                     config               The following config options are supported:
   * @param {Scheduler.model.EventModel} config.eventRecord   Event being modified.
   * @param {String}                     config.actionType    Type of modification to be applied to the event. Can be either "update" or "delete".
   * @param {Function}                   config.changerFn     A function that should be called to apply the change to the event upon user choice.
   * @param {Function}                   [config.thisObj]     `changerFn` and `cancelFn` functions scope.
   * @param {Function}                   [config.cancelFn]    Function called on `Cancel` button click.
   */

  confirm(config = {}) {
    const me = this;
    ['actionType', 'eventRecord', 'title', 'html', 'changerFn', 'cancelFn', 'thisObj'].forEach(prop => {
      if (prop in config) me[prop] = config[prop];
    });
    me.updatePopupContent();
    return super.show(config);
  }

  updatePopupContent() {
    const me = this,
          {
      changeMultipleButton,
      changeSingleButton,
      cancelButton
    } = me.widgetMap,
          {
      eventRecord,
      actionType = 'update'
    } = me,
          isMaster = eventRecord && eventRecord.isRecurring; // Do not remove. Assertion strings for Localization sanity check.
    // 'L{delete-further-message}'
    // 'L{update-further-message}'
    // 'L{delete-all-message}'
    // 'L{update-all-message}'
    // 'L{delete-further-btn-text}'
    // 'L{update-further-btn-text}'
    // 'L{delete-only-this-btn-text}'
    // 'L{update-only-this-btn-text}'

    if (isMaster) {
      changeMultipleButton.text = me.L('L{Object.Yes}');
      me.html = me.L(`${actionType}-all-message`);
    } else {
      changeMultipleButton.text = me.L(`${actionType}-further-btn-text`);
      me.html = me.L(`${actionType}-further-message`);
    }

    changeSingleButton.text = me.L(`${actionType}-only-this-btn-text`);
    cancelButton.text = me.L('L{Object.Cancel}'); // TODO: so far we hide 'Only this event' option for a recurring event itself until this case is supported

    if (isMaster) {
      changeSingleButton.hide();
    } else {
      changeSingleButton.show();
    }

    me.width = me.L('L{width}'); // the following lines are added to satisfy the 904_unused localization test
    // to let it know that these locales are used:
    // this.L('L{delete-title}') not found
    // this.L('L{update-title}') not found

    me.title = me.L(`${actionType}-title`);
  }
  /**
   * Applies changes to multiple occurrences as reaction on "Apply changes to multiple occurrences"
   * {@link #property-changeMultipleButton button} click.
   */

  processMultipleRecords() {
    const {
      eventRecord,
      changerFn,
      thisObj
    } = this;
    eventRecord.beginBatch(); // Apply changes to the occurrence.
    // It is not joined to any stores, so this has no consequence.

    this.callback(changerFn, thisObj, [eventRecord]); // afterChange will promote it to being an new recurring base because there's still recurrence

    eventRecord.endBatch();
  }
  /**
   * Applies changes to a single record by making it a "real" event and adding an exception to the recurrence.
   * The method is called as reaction on clicking the {@link #property-changeSingleButton button} that causes changing of the event itself only.
   */

  processSingleRecord() {
    const {
      eventRecord,
      changerFn,
      thisObj
    } = this;
    eventRecord.beginBatch(); // When the changes apply, because there's no recurrence, it will become an exception

    eventRecord.recurrence = null; // Apply changes to the occurrence.
    // It is not joined to any stores, so this has no consequence.

    this.callback(changerFn, thisObj, [eventRecord]); // Must also change after the callback in case the callback sets the rule.
    // This will update the batch update data block to prevent it being set back to recurring.

    eventRecord.recurrenceRule = null; // afterChange will promote it to being an exception because there's no recurrence

    eventRecord.endBatch();
  }

  updateLocalization() {
    this.updatePopupContent();
    super.updateLocalization();
  }

}

RecurrenceConfirmationPopup.initClass();
RecurrenceConfirmationPopup._$name = 'RecurrenceConfirmationPopup';

/**
 * @module Scheduler/feature/EventMenu
 */

/**
 * Displays a context menu for events. Items are populated by other features and/or application code.
 *
 * ### Default event menu items
 *
 * Here is the list of menu items provided by the feature and populated by the other features:
 *
 * | Reference       | Text           | Weight | Feature                             | Description                                                             |
 * |-----------------|----------------|--------|-------------------------------------|-------------------------------------------------------------------------|
 * | `editEvent`     | Edit event     | 100    | {@link Scheduler.feature.EventEdit} | Open the event editor. Hidden for read-only Scheduler                   |
 * | `deleteEvent`   | Delete event   | 200    | *This feature*                      | Remove the event. Hidden for read-only Scheduler                        |
 * | `unassignEvent` | Unassign event | 300    | *This feature*                      | Unassign the event. Shown when using multi-assignment and not read-only |
 *
 * ### Customizing the menu items
 *
 * The menu items in the Event menu can be customized, existing items can be changed or removed,
 * and new items can be added. This is handled using the `items` config of the feature.
 *
 * Add extra items for all events:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         eventMenu : {
 *             items : {
 *                 extraItem : {
 *                     text : 'Extra',
 *                     icon : 'b-fa b-fa-fw b-fa-flag',
 *                     onItem({eventRecord}) {
 *                         eventRecord.flagged = true;
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * Remove existing items:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         eventMenu : {
 *             items : {
 *                 deleteEvent   : false,
 *                 unassignEvent : false
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * Customize existing item:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         eventMenu : {
 *             items : {
 *                 deleteEvent : {
 *                     text : 'Delete booking'
 *                 }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * Manipulate existing items for all events or specific events:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         eventMenu : {
 *             // Process items before menu is shown
 *             processItems({eventRecord, items}) {
 *                  // Push an extra item for conferences
 *                  if (eventRecord.type === 'conference') {
 *                      items.showSessionItem = {
 *                          text : 'Show sessions',
 *                          onItem({eventRecord}) {
 *                              // ...
 *                          }
 *                      };
 *                  }
 *
 *                  // Do not show menu for secret events
 *                  if (eventRecord.type === 'secret') {
 *                      return false;
 *                  }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * Full information of the menu customization can be found in the "Customizing the Event menu, the Schedule menu, and the TimeAxisHeader menu" guide.
 *
 * This feature is **enabled** by default
 *
 * @extends Scheduler/feature/base/TimeSpanMenuBase
 * @demo Scheduler/eventmenu
 * @classtype eventMenu
 * @feature
 */

class EventMenu extends TimeSpanMenuBase {
  //region Config
  static get $name() {
    return 'EventMenu';
  }

  static get configurable() {
    return {
      /**
       * A function called before displaying the menu that allows manipulations of its items.
       * Returning `false` from this function prevents the menu being shown.
       *
       * ```javascript
       * features         : {
       *    eventMenu : {
       *         processItems({ items, eventRecord, assignmentRecord, resourceRecord }) {
       *             // Add or hide existing items here as needed
       *             items.myAction = {
       *                 text   : 'Cool action',
       *                 icon   : 'b-fa b-fa-fw b-fa-ban',
       *                 onItem : () => console.log(`Clicked ${eventRecord.name}`),
       *                 weight : 1000 // Move to end
       *             };
       *
       *            if (!eventRecord.allowDelete) {
       *                 items.deleteEvent.hidden = true;
       *             }
       *         }
       *     }
       * },
       * ```
       * @param {Object} context An object with information about the menu being shown
       * @param {Scheduler.model.EventModel} context.eventRecord The record representing the current event
       * @param {Scheduler.model.ResourceModel} context.resourceRecord The record representing the current resource
       * @param {Scheduler.model.AssignmentModel} context.assignmentRecord The assignment record
       * @param {Object} context.items An object containing the {@link Core.widget.MenuItem menu item} configs keyed by their id
       * @param {Event} context.event The DOM event object that triggered the show
       * @config {Function}
       * @preventable
       */
      processItems: null,
      type: 'event'
      /**
       * This is a preconfigured set of items used to create the default context menu.
       *
       * The `items` provided by this feature are listed below. These are the property names which you may
       * configure:
       *
       * - `deleteEvent` Deletes the context event.
       * - `unassignEvent` Unassigns the context event from the current resource (only added when multi assignment is used).
       *
       * To remove existing items, set corresponding keys to `false`
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         eventMenu : {
       *             items : {
       *                 deleteEvent   : false,
       *                 unassignEvent : false
       *             }
       *         }
       *     }
       * });
       * ```
       *
       * See the feature config in the above example for details.
       *
       * @config {Object} items
       */

    };
  }

  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push('populateEventMenu');
    return config;
  } //endregion
  //region Events

  /**
   * This event fires on the owning Scheduler before the context menu is shown for an event. Allows manipulation of the items
   * to show in the same way as in `processItems`. Returning `false` from a listener prevents the menu from
   * being shown.
   * @event eventMenuBeforeShow
   * @on-owner
   * @preventable
   * @param {Scheduler.view.Scheduler} source
   * @param {Object} items Menu item configs
   * @param {Scheduler.model.EventModel} eventRecord Event record for which the menu was triggered
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record, if assignments are used
   * @param {HTMLElement} eventElement
   * @param {MouseEvent} [event] Pointer event which triggered the context menu (if any)
   */

  /**
   * This event fires on the owning Scheduler when an item is selected in the context menu.
   * @event eventMenuItem
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Core.widget.MenuItem} item
   * @param {Scheduler.model.EventModel} eventRecord
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record, if assignments are used
   * @param {HTMLElement} eventElement
   */

  /**
   * This event fires on the owning Scheduler after showing the context menu for an event
   * @event eventMenuShow
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Core.widget.Menu} menu The menu
   * @param {Scheduler.model.EventModel} eventRecord Event record for which the menu was triggered
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record, if assignments are used
   * @param {HTMLElement} eventElement
   */
  //endregion

  onElementKeyDown(event) {
    if (!event.handled && event.target.matches(this.client.eventSelector)) {
      if (event.key === ' ') {
        this.internalShowContextMenu(this.createContextMenuEventForElement(event.target));
      }
    }
  }

  getDataFromEvent(event) {
    const data = super.getDataFromEvent(event),
          eventElement = data.targetElement,
          {
      client
    } = this,
          eventRecord = client.resolveEventRecord(eventElement),
          // For vertical mode the resource must be resolved from the event
    resourceRecord = eventRecord && (client.resolveResourceRecord(eventElement) || client.resourceStore.last),
          assignmentRecord = eventRecord && client.resolveAssignmentRecord(eventElement);
    return Object.assign(data, {
      eventElement,
      eventRecord,
      resourceRecord,
      assignmentRecord
    });
  }

  getTargetElementFromEvent({
    target
  }) {
    return DomHelper.up(target, this.client.eventSelector) || target;
  }

  shouldShowMenu(eventParams) {
    return eventParams.eventRecord;
  }
  /**
   * Shows context menu for the provided event. If record is not rendered (outside of time span/filtered)
   * menu won't appear.
   * @param {Scheduler.model.EventModel} eventRecord Event record to show menu for.
   * @param {Object} [options]
   * @param {HTMLElement} options.targetElement Element to align context menu to.
   * @param {MouseEvent} options.event Browser event.
   * If provided menu will be aligned according to clientX/clientY coordinates.
   * If omitted, context menu will be centered to event element.
   */

  showContextMenuFor(eventRecord, {
    targetElement,
    event
  } = {}) {
    if (this.disabled) {
      return;
    }

    if (!targetElement) {
      targetElement = this.getElementFromRecord(eventRecord); // If record is not rendered, do nothing

      if (!targetElement) {
        return;
      }
    }

    event = event || this.createContextMenuEventForElement(targetElement);
    this.internalShowContextMenu(event);
  }

  getElementFromRecord(record) {
    return this.client.getElementsFromEventRecord(record)[0];
  }

  populateEventMenu({
    items,
    eventRecord,
    assignmentRecord
  }) {
    const {
      client
    } = this;
    items.deleteEvent = {
      disabled: eventRecord.readOnly || (assignmentRecord === null || assignmentRecord === void 0 ? void 0 : assignmentRecord.readOnly),
      hidden: client.readOnly
    };
    items.unassignEvent = {
      disabled: eventRecord.readOnly || (assignmentRecord === null || assignmentRecord === void 0 ? void 0 : assignmentRecord.readOnly),
      hidden: client.readOnly || client.eventStore.usesSingleAssignment
    };
  } // This generates the fixed, unchanging part of the items and is only called once
  // to generate the baseItems of the feature.
  // The dynamic parts which are set by populateEventMenu have this merged into them.

  changeItems(items) {
    const {
      client
    } = this;
    return Objects.merge({
      deleteEvent: {
        text: 'L{SchedulerBase.Delete event}',
        icon: 'b-icon b-icon-trash',
        weight: 200,

        onItem({
          menu,
          eventRecord
        }) {
          var _menu$focusInEvent;

          // We must synchronously push focus back into the menu's triggering
          // event so that the our beforeRemove handlers can move focus onwards
          // to the closest remaining event.
          // Otherwise, the menu's default hide processing on hide will attempt
          // to move focus back to the menu's triggering event which will
          // by then have been deleted.
          const revertTarget = (_menu$focusInEvent = menu.focusInEvent) === null || _menu$focusInEvent === void 0 ? void 0 : _menu$focusInEvent.relatedTarget;

          if (revertTarget) {
            revertTarget.focus();
            client.navigator.activeItem = revertTarget;
          }

          client.removeEvents(client.isEventSelected(eventRecord) ? client.selectedEvents : [eventRecord]);
        }

      },
      unassignEvent: {
        text: 'L{SchedulerBase.Unassign event}',
        icon: 'b-icon b-icon-unassign',
        weight: 300,

        onItem({
          menu,
          eventRecord,
          resourceRecord
        }) {
          var _menu$focusInEvent2;

          // We must synchronously push focus back into the menu's triggering
          // event so that the our beforeRemove handlers can move focus onwards
          // to the closest remaining event.
          // Otherwise, the menu's default hide processing on hide will attempt
          // to move focus back to the menu's triggering event which will
          // by then have been deleted.
          const revertTarget = (_menu$focusInEvent2 = menu.focusInEvent) === null || _menu$focusInEvent2 === void 0 ? void 0 : _menu$focusInEvent2.relatedTarget;

          if (revertTarget) {
            revertTarget.focus();
            client.navigator.activeItem = revertTarget;
          }

          eventRecord.unassign(resourceRecord);
        }

      }
    }, items);
  }

}
EventMenu.featureClass = '';
EventMenu._$name = 'EventMenu';
GridFeatureManager.registerFeature(EventMenu, true, 'Scheduler');
GridFeatureManager.registerFeature(EventMenu, false, 'ResourceHistogram');

/**
 * @module Scheduler/feature/ScheduleMenu
 */

/**
 * Displays a context menu for empty parts of the schedule. Items are populated in the first place
 * by configurations of this Feature, then by other features and/or application code.
 *
 * ### Default scheduler zone menu items
 *
 * The Scheduler menu feature provides only one item:
 *
 * | Reference      | Text      | Weight | Feature        | Description                                                                                                          |
 * |----------------|-----------|--------|----------------|----------------------------------------------------------------------------------------------------------------------|
 * | `addEvent`     | Add event | 100    | *This feature* | Add a new event for the hovered resource starting at the clicked point in time. Hidden if the Scheduler is read-only |
 *
 * ### Customizing the menu items
 *
 * The menu items in the Scheduler menu can be customized, existing items can be changed or removed,
 * and new items can be added. This is handled using the `items` config of the feature.
 *
 * Add extra item:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         scheduleMenu : {
 *             items : {
 *                 extraItem : {
 *                     text : 'Extra',
 *                     icon : 'b-fa b-fa-fw b-fa-flag',
 *                     onItem({date, resourceRecord, items}) {
 *                         // Custom date based action
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * Remove existing item:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         scheduleMenu : {
 *             items : {
 *                 addEvent : false
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * Customize existing item:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         scheduleMenu : {
 *             items : {
 *                 addEvent : {
 *                     text : 'Create new booking'
 *                 }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * Manipulate existing items:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         scheduleMenu : {
 *             // Process items before menu is shown
 *             processItems({date, resourceRecord, items}) {
 *                  // Add an extra item for ancient times
 *                  if (date < new Date(2018, 11, 17)) {
 *                      items.modernize = {
 *                          text : 'Modernize',
 *                          ontItem({date}) {
 *                              // Custom date based action
 *                          }
 *                      };
 *                  }
 *
 *                  // Do not show menu for Sundays
 *                  if (date.getDay() === 0) {
 *                      return false;
 *                  }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * Full information of the menu customization can be found in the "Customizing the Event menu, the Schedule menu, and the TimeAxisHeader menu" guide.
 *
 * This feature is **enabled** by default
 *
 * @demo Scheduler/basic
 * @extends Scheduler/feature/base/TimeSpanMenuBase
 * @classtype scheduleMenu
 * @feature
 */

class ScheduleMenu extends TimeSpanMenuBase {
  //region Config
  static get $name() {
    return 'ScheduleMenu';
  }

  static get defaultConfig() {
    return {
      type: 'schedule',

      /**
       * This is a preconfigured set of items used to create the default context menu.
       *
       * The `items` provided by this feature are listed below. These are the predefined property names which you may
       * configure:
       *
       * - `addEvent` Add an event for at the resource and time indicated by the `contextmenu` event.
       *
       * To remove existing items, set corresponding keys to `false`
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *     features : {
       *         scheduleMenu : {
       *             items : {
       *                 addEvent : false
       *             }
       *         }
       *     }
       * });
       * ```
       *
       * @config {Object} items
       */
      items: null,

      /**
       * A function called before displaying the menu that allows manipulations of its items.
       * Returning `false` from this function prevents the menu being shown.
       *
       * ```javascript
       * features         : {
       *    scheduleMenu : {
       *         processItems({ items, date, resourceRecord }) {
       *            // Add or hide existing items here as needed
       *            items.myAction = {
       *                text   : 'Cool action',
       *                icon   : 'b-fa b-fa-cat',
       *                onItem : () => console.log(`Clicked on ${resourceRecord.name} at ${date}`),
       *                weight : 1000 // Move to end
       *            };
       *
       *            if (!resourceRecord.allowAdd) {
       *                items.addEvent.hidden = true;
       *            }
       *        }
       *    }
       * },
       * ```
       * @param {Object} context An object with information about the menu being shown
       * @param {Scheduler.model.ResourceModel} context.resourceRecord The record representing the current resource
       * @param {Date} context.date The clicked date
       * @param {Object} context.items An object containing the {@link Core.widget.MenuItem menu item} configs keyed by their id
       * @param {Event} context.event The DOM event object that triggered the show
       * @config {Function}
       * @preventable
       */
      processItems: null
    };
  }

  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push('populateScheduleMenu');
    return config;
  } //endregion
  //region Events

  /**
   * This event fires on the owning Scheduler before the context menu is shown for an event. Allows manipulation of the items
   * to show in the same way as in `processItems`. Returning `false` from a listener prevents the menu from
   * being shown.
   * @event scheduleMenuBeforeShow
   * @on-owner
   * @preventable
   * @param {Scheduler.view.Scheduler} source
   * @param {Object} items Menu item configs
   * @param {Scheduler.model.EventModel} eventRecord Event record for which the menu was triggered
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record, if assignments are used
   * @param {HTMLElement} eventElement
   */

  /**
   * This event fires on the owning Scheduler when an item is selected in the context menu.
   * @event scheduleMenuItem
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Core.widget.MenuItem} item
   * @param {Scheduler.model.EventModel} eventRecord
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record, if assignments are used
   * @param {HTMLElement} eventElement
   */

  /**
   * This event fires on the owning Scheduler after showing the context menu for an event
   * @event scheduleMenuShow
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Core.widget.Menu} menu The menu
   * @param {Scheduler.model.EventModel} eventRecord Event record for which the menu was triggered
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record, if assignments are used
   * @param {HTMLElement} eventElement
   */
  //endregion

  shouldShowMenu(eventParams) {
    const {
      client
    } = this,
          {
      column,
      targetElement,
      resourceRecord
    } = eventParams,
          isTimeAxisColumn = column ? column === client.timeAxisColumn : client.timeAxisSubGrid.element === targetElement;
    return isTimeAxisColumn && !(resourceRecord && resourceRecord.isSpecialRow);
  }

  getDataFromEvent(event) {
    // Process event if it wasn't yet processed
    if (DomHelper.isDOMEvent(event)) {
      const {
        client
      } = this,
            cellData = client.getCellDataFromEvent(event),
            date = client.getDateFromDomEvent(event, 'floor'),
            // For vertical mode the resource must be resolved from the event
      resourceRecord = client.resolveResourceRecord(event) || client.isVertical && client.resourceStore.last;
      return ObjectHelper.assign(super.getDataFromEvent(event), cellData, {
        date,
        resourceRecord
      });
    }

    return event;
  }

  populateScheduleMenu({
    items,
    resourceRecord,
    date
  }) {
    const {
      client
    } = this; // Menu can work for ResourceHistogram which doesn't have event store

    if (!client.readOnly && client.eventStore) {
      items.addEvent = {
        text: 'L{SchedulerBase.Add event}',
        icon: 'b-icon b-icon-add',
        disabled: !resourceRecord || resourceRecord.readOnly || !resourceRecord.isWorkingTime(date),
        weight: 100,

        onItem() {
          client.internalAddEvent(date, resourceRecord, client.getRowFor(resourceRecord));
        }

      };
    }
  }

}
ScheduleMenu.featureClass = '';
ScheduleMenu._$name = 'ScheduleMenu';
GridFeatureManager.registerFeature(ScheduleMenu, true, 'Scheduler');

/* eslint-disable quote-props */
const locale = LocaleHelper.mergeLocales(locale$1, {
  Object: {
    newEvent: 'New event'
  },
  ResourceInfoColumn: {
    eventCountText: function (data) {
      return data + ' event' + (data !== 1 ? 's' : '');
    }
  },
  Dependencies: {
    from: 'From',
    to: 'To',
    valid: 'Valid',
    invalid: 'Invalid'
  },
  DependencyType: {
    SS: 'SS',
    SF: 'SF',
    FS: 'FS',
    FF: 'FF',
    StartToStart: 'Start-to-Start',
    StartToEnd: 'Start-to-Finish',
    EndToStart: 'Finish-to-Start',
    EndToEnd: 'Finish-to-Finish',
    short: ['SS', 'SF', 'FS', 'FF'],
    long: ['Start-to-Start', 'Start-to-Finish', 'Finish-to-Start', 'Finish-to-Finish']
  },
  DependencyEdit: {
    From: 'From',
    To: 'To',
    Type: 'Type',
    Lag: 'Lag',
    'Edit dependency': 'Edit dependency',
    Save: 'Save',
    Delete: 'Delete',
    Cancel: 'Cancel',
    StartToStart: 'Start to Start',
    StartToEnd: 'Start to End',
    EndToStart: 'End to Start',
    EndToEnd: 'End to End'
  },
  EventEdit: {
    Name: 'Name',
    Resource: 'Resource',
    Start: 'Start',
    End: 'End',
    Save: 'Save',
    Delete: 'Delete',
    Cancel: 'Cancel',
    'Edit event': 'Edit event',
    Repeat: 'Repeat'
  },
  EventDrag: {
    eventOverlapsExisting: 'Event overlaps existing event for this resource',
    noDropOutsideTimeline: 'Event may not be dropped completely outside the timeline'
  },
  SchedulerBase: {
    'Add event': 'Add event',
    'Delete event': 'Delete event',
    'Unassign event': 'Unassign event'
  },
  TimeAxisHeaderMenu: {
    pickZoomLevel: 'Zoom',
    activeDateRange: 'Date range',
    startText: 'Start date',
    endText: 'End date',
    todayText: 'Today'
  },
  EventCopyPaste: {
    copyEvent: 'Copy event',
    cutEvent: 'Cut event',
    pasteEvent: 'Paste event'
  },
  EventFilter: {
    filterEvents: 'Filter tasks',
    byName: 'By name'
  },
  TimeRanges: {
    showCurrentTimeLine: 'Show current timeline'
  },
  PresetManager: {
    secondAndMinute: {
      displayDateFormat: 'll LTS'
    },
    minuteAndHour: {
      topDateFormat: 'ddd MM/DD, hA',
      displayDateFormat: 'll LST'
    },
    hourAndDay: {
      topDateFormat: 'ddd MM/DD',
      middleDateFormat: 'LST',
      displayDateFormat: 'll LST'
    },
    weekAndDay: {
      displayDateFormat: 'll LST'
    },
    dayAndWeek: {
      displayDateFormat: 'll LST'
    }
  },
  RecurrenceConfirmationPopup: {
    'delete-title': 'You are deleting an event',
    'delete-all-message': 'Do you want to delete all occurrences of this event?',
    'delete-further-message': 'Do you want to delete this and all future occurrences of this event, or only the selected occurrence?',
    'delete-further-btn-text': 'Delete All Future Events',
    'delete-only-this-btn-text': 'Delete Only This Event',
    'update-title': 'You are changing a repeating event',
    'update-all-message': 'Do you want to change all occurrences of this event?',
    'update-further-message': 'Do you want to change only this occurrence of the event, or this and all future occurrences?',
    'update-further-btn-text': 'All Future Events',
    'update-only-this-btn-text': 'Only This Event',
    Yes: 'Yes',
    Cancel: 'Cancel',
    width: 600
  },
  RecurrenceLegend: {
    ' and ': ' and ',
    // frequency patterns
    Daily: 'Daily',
    // Weekly on Sunday
    // Weekly on Sun, Mon and Tue
    'Weekly on {1}': ({
      days
    }) => `Weekly on ${days}`,
    // Monthly on 16
    // Monthly on the last weekday
    'Monthly on {1}': ({
      days
    }) => `Monthly on ${days}`,
    // Yearly on 16 of January
    // Yearly on the last weekday of January and February
    'Yearly on {1} of {2}': ({
      days,
      months
    }) => `Yearly on ${days} of ${months}`,
    // Every 11 days
    'Every {0} days': ({
      interval
    }) => `Every ${interval} days`,
    // Every 2 weeks on Sunday
    // Every 2 weeks on Sun, Mon and Tue
    'Every {0} weeks on {1}': ({
      interval,
      days
    }) => `Every ${interval} weeks on ${days}`,
    // Every 2 months on 16
    // Every 2 months on the last weekday
    'Every {0} months on {1}': ({
      interval,
      days
    }) => `Every ${interval} months on ${days}`,
    // Every 2 years on 16 of January
    // Every 2 years on the last weekday of January and February
    'Every {0} years on {1} of {2}': ({
      interval,
      days,
      months
    }) => `Every ${interval} years on ${days} of ${months}`,
    // day position translations
    position1: 'the first',
    position2: 'the second',
    position3: 'the third',
    position4: 'the fourth',
    position5: 'the fifth',
    'position-1': 'the last',
    // day options
    day: 'day',
    weekday: 'weekday',
    'weekend day': 'weekend day',
    // {0} - day position info ("the last"/"the first"/...)
    // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
    // For example:
    //  "the last Sunday"
    //  "the first weekday"
    //  "the second weekend day"
    daysFormat: ({
      position,
      days
    }) => `${position} ${days}`
  },
  RecurrenceEditor: {
    'Repeat event': 'Repeat event',
    Cancel: 'Cancel',
    Save: 'Save',
    Frequency: 'Frequency',
    Every: 'Every',
    DAILYintervalUnit: 'day(s)',
    WEEKLYintervalUnit: 'week(s)',
    MONTHLYintervalUnit: 'month(s)',
    YEARLYintervalUnit: 'year(s)',
    Each: 'Each',
    'On the': 'On the',
    'End repeat': 'End repeat',
    'time(s)': 'time(s)'
  },
  RecurrenceDaysCombo: {
    day: 'day',
    weekday: 'weekday',
    'weekend day': 'weekend day'
  },
  RecurrencePositionsCombo: {
    position1: 'first',
    position2: 'second',
    position3: 'third',
    position4: 'fourth',
    position5: 'fifth',
    'position-1': 'last'
  },
  RecurrenceStopConditionCombo: {
    Never: 'Never',
    After: 'After',
    'On date': 'On date'
  },
  RecurrenceFrequencyCombo: {
    Daily: 'Daily',
    Weekly: 'Weekly',
    Monthly: 'Monthly',
    Yearly: 'Yearly'
  },
  RecurrenceCombo: {
    None: 'None',
    Custom: 'Custom...'
  },
  //region Features
  Summary: {
    'Summary for': date => `Summary for ${date}`
  },
  //endregion
  //region Export
  ScheduleRangeCombo: {
    completeview: 'Complete schedule',
    currentview: 'Visible schedule',
    daterange: 'Date range',
    completedata: 'Complete schedule (for all events)'
  },
  SchedulerExportDialog: {
    'Schedule range': 'Schedule range',
    'Export from': 'From',
    'Export to': 'To'
  },
  ExcelExporter: {
    'No resource assigned': 'No resource assigned'
  },
  //endregion
  CrudManagerView: {
    serverResponseLabel: 'Server response:'
  },
  DurationColumn: {
    Duration: 'Duration'
  }
});

LocaleManagerSingleton.registerLocale('En', {
  desc: 'English',
  locale: locale
});

/**
 * @module Scheduler/view/mixin/CurrentConfig
 */
const stores = ['eventStore', 'taskStore', 'assignmentStore', 'resourceStore', 'dependencyStore', 'timeRangeStore', 'resourceTimeRangeStore'],
      inlineProperties = ['events', 'tasks', 'resources', 'assignments', 'dependencies', 'timeRanges', 'resourceTimeRanges'];
/**
 * Mixin that makes sure inline data & crud manager data are removed from current config for products using a project.
 * The data is instead inlined in the project (by ProjectModel.js)
 *
 * @mixin
 * @private
 */

var CurrentConfig = (Target => class CurrentConfig extends Target {
  static get $name() {
    return 'CurrentConfig';
  }

  preProcessCurrentConfigs(configs) {
    // Remove inline data on the component
    for (const prop of inlineProperties) {
      delete configs[prop];
    }

    super.preProcessCurrentConfigs(configs);
  } // This function is not meant to be called by any code other than Base#getCurrentConfig().

  getCurrentConfig(options) {
    const project = this.project.getCurrentConfig(options),
          result = super.getCurrentConfig(options); // Force project with inline data

    if (project) {
      result.project = project;
      const {
        crudManager
      } = result; // Transfer crud store configs to project (mainly fields)

      if (crudManager) {
        for (const store of stores) {
          if (crudManager[store]) {
            project[store] = crudManager[store];
          }
        }
      }

      if (Object.keys(project).length === 0) {
        delete result.project;
      }
    } // Store (resource store) data is included in project

    delete result.data; // Remove CrudManager, since data will be placed inline

    delete result.crudManager;
    return result;
  }

});

/**
 * @module Scheduler/view/mixin/EventNavigation
 */

const preventDefault = e => e.preventDefault(),
      isArrowKey = {
  ArrowRight: 1,
  ArrowLeft: 1,
  ArrowUp: 1,
  ArrowDown: 1
},
      animate100 = {
  animate: 100
},
      emptyObject = Object.freeze({});
/**
 * Mixin that tracks event or assignment selection by clicking on one or more events in the scheduler.
 * @mixin
 */

var SchedulerEventNavigation = (Target => class EventNavigation extends Delayable(Target || Base) {
  static get $name() {
    return 'EventNavigation';
  } //region Default config

  static get configurable() {
    return {
      /**
       * A config object to use when creating the {@link Core.helper.util.Navigator}
       * to use to perform keyboard navigation in the timeline.
       * @config {Object}
       * @default
       * @category Misc
       * @internal
       */
      navigator: {
        allowCtrlKey: true,
        scrollSilently: true,
        keys: {
          Space: 'onEventSpaceKey',
          Enter: 'onEventEnterKey',
          Delete: 'onDeleteKey',
          Backspace: 'onDeleteKey',
          ArrowUp: 'onArrowUpKey',
          ArrowDown: 'onArrowDownKey',
          Escape: 'onEscapeKey',
          // These are processed by GridNavigation's handlers
          Tab: 'onTab',
          'SHIFT+Tab': 'onShiftTab'
        }
      },
      isNavigationKey: {
        ArrowDown: 1,
        ArrowUp: 1,
        ArrowLeft: 1,
        ArrowRight: 1
      }
    };
  }

  static get defaultConfig() {
    return {
      /**
       * A CSS class name to add to focused events.
       * @config {String}
       * @default
       * @category CSS
       * @private
       */
      focusCls: 'b-active',

      /**
       * Allow using [Delete] and [Backspace] to remove events/assignments
       * @config {Boolean}
       * @default
       * @category Misc
       */
      enableDeleteKey: true,
      // Number in milliseconds to buffer handlers execution. See `Delayable.throttle` function docs.
      onDeleteKeyBuffer: 500,
      navigatePreviousBuffer: 200,
      navigateNextBuffer: 200,
      testConfig: {
        onDeleteKeyBuffer: 1
      }
    };
  } //endregion
  //region Events

  /**
   * Fired when a user gesture causes the active item to change.
   * @event navigate
   * @param {Event} event The browser event which instigated navigation. May be a click or key or focus event.
   * @param {HTMLElement|null} item The newly active item, or `null` if focus moved out.
   * @param {HTMLElement|null} oldItem The previously active item, or `null` if focus is moving in.
   */
  //endregion

  construct(config) {
    const me = this;
    me.isInTimeAxis = me.isInTimeAxis.bind(me);
    me.onDeleteKey = me.throttle(me.onDeleteKey, me.onDeleteKeyBuffer, me);
    super.construct(config);
  }

  changeNavigator(navigator) {
    const me = this;
    me.getConfig('subGridConfigs');
    return new Navigator(me.constructor.mergeConfigs({
      ownerCmp: me,
      target: me.timeAxisSubGridElement,
      processEvent: me.processEvent,
      itemSelector: `.${me.eventCls}-wrap`,
      focusCls: me.focusCls,
      navigatePrevious: me.throttle(me.navigatePrevious, {
        delay: me.navigatePreviousBuffer,
        throttled: preventDefault
      }),
      navigateNext: me.throttle(me.navigateNext, {
        delay: me.navigateNextBuffer,
        throttled: preventDefault
      })
    }, navigator));
  }

  doDestroy() {
    this.navigator.destroy();
    super.doDestroy();
  }

  isInTimeAxis(record) {
    // If event is hidden by workingTime configs, horizontal mapper would raise a flag on instance meta
    // We still need to check if time span is included in axis
    return !record.instanceMeta(this).excluded && this.timeAxis.isTimeSpanInAxis(record);
  }

  onElementKeyDown(keyEvent) {
    var _me$focusedCell, _me$focusedCell2;

    const me = this,
          {
      navigator
    } = me,
          composedKeyName = navigator.constructor.getComposedKeyName(keyEvent); // If we're focused in the time axis, and *not* on an event, then ENTER means
    // jump down into the first visible assignment in the cell.

    if (((_me$focusedCell = me.focusedCell) === null || _me$focusedCell === void 0 ? void 0 : _me$focusedCell.rowIndex) !== -1 && ((_me$focusedCell2 = me.focusedCell) === null || _me$focusedCell2 === void 0 ? void 0 : _me$focusedCell2.column) === me.timeAxisColumn && !keyEvent.target.closest(navigator.itemSelector) && keyEvent.key === 'Enter') {
      const firstAssignment = me.getFirstVisibleAssignment();

      if (firstAssignment) {
        me.navigateTo(firstAssignment, {
          uiEvent: keyEvent
        });
        return false;
      }
    } else {
      // Only pass up to superclass if it's not one of our navigation keys
      // or isn't from our navigation
      if (!me.isNavigationKey[composedKeyName] || !keyEvent.target.matches(me.navigator.itemSelector)) {
        var _super$onElementKeyDo;

        return (_super$onElementKeyDo = super.onElementKeyDown) === null || _super$onElementKeyDo === void 0 ? void 0 : _super$onElementKeyDo.call(this, keyEvent);
      }
    }
  }

  getFirstVisibleAssignment(location = this.focusedCell) {
    const me = this,
          {
      currentOrientation,
      rowManager,
      eventStore
    } = me;

    if (me.isHorizontal) {
      var _renderedEvents;

      let renderedEvents = currentOrientation.rowMap.get(rowManager.getRow(location.rowIndex));

      if ((_renderedEvents = renderedEvents) !== null && _renderedEvents !== void 0 && _renderedEvents.length) {
        var _renderedEvents$;

        return (_renderedEvents$ = renderedEvents[0]) === null || _renderedEvents$ === void 0 ? void 0 : _renderedEvents$.elementData.assignmentRecord;
      } else {
        var _currentOrientation$r, _renderedEvents2;

        renderedEvents = (_currentOrientation$r = currentOrientation.resourceMap.get(location.id)) === null || _currentOrientation$r === void 0 ? void 0 : _currentOrientation$r.eventsData;

        if ((_renderedEvents2 = renderedEvents) !== null && _renderedEvents2 !== void 0 && _renderedEvents2.length) {
          var _renderedEvents$filte;

          // When events are gathered from resource, we need to check they're available
          return (_renderedEvents$filte = renderedEvents.filter(e => eventStore.isAvailable(e.eventRecord))[0]) === null || _renderedEvents$filte === void 0 ? void 0 : _renderedEvents$filte.assignmentRecord;
        }
      }
    } else {
      const firstResource = [...currentOrientation.resourceMap.values()][0],
            renderedEvents = firstResource && Object.values(firstResource);

      if (renderedEvents !== null && renderedEvents !== void 0 && renderedEvents.length) {
        return renderedEvents.filter(e => eventStore.isAvailable(e.renderData.eventRecord))[0].renderData.assignmentRecord;
      }
    }
  }

  onGridBodyFocusIn(focusEvent) {
    const isGridCellFocus = focusEvent.target.closest(this.focusableSelector); // Event navigation only has a say when navigation is inside the TimeAxisSubGrid

    if (this.timeAxisSubGridElement.contains(focusEvent.target)) {
      const me = this,
            {
        navigationEvent
      } = me,
            {
        target
      } = focusEvent,
            eventFocus = target.closest(me.navigator.itemSelector),
            destinationCell = eventFocus ? me.normalizeCellContext({
        rowIndex: me.isVertical ? 0 : me.resourceStore.indexOf(me.resolveResourceRecord(target)),
        column: me.timeAxisColumn,
        target
      }) : new Location(target); // Don't take over what the event navigator does if it's doing event navigation.
      // Just silently cache our actionable location.

      if (eventFocus) {
        var _me$onCellNavigate;

        const {
          _focusedCell
        } = me;
        me._focusedCell = destinationCell;
        (_me$onCellNavigate = me.onCellNavigate) === null || _me$onCellNavigate === void 0 ? void 0 : _me$onCellNavigate.call(me, me, _focusedCell, destinationCell, navigationEvent, true);
        return;
      } // Depending on how we got here, try to focus the first event in the cell *if we're in a cell*.

      if (isGridCellFocus && (!navigationEvent || isArrowKey[navigationEvent.key])) {
        const firstAssignment = me.getFirstVisibleAssignment(destinationCell);

        if (firstAssignment) {
          me.navigateTo(firstAssignment, {
            scrollIntoView: Boolean((navigationEvent === null || navigationEvent === void 0 ? void 0 : navigationEvent.type) !== 'mousedown'),
            uiEvent: navigationEvent || focusEvent
          });
          return;
        }
      }
    } // Grid-level focus movement, let superclass handle it.

    if (isGridCellFocus) {
      super.onGridBodyFocusIn(focusEvent);
    }
  }
  /*
   * Override of GridNavigation#focusCell method to handle the TimeAxisColumn.
   * Not needed until we implement full keyboard accessibility.
   */

  accessibleFocusCell(cellSelector, options) {
    const me = this;
    cellSelector = me.normalizeCellContext(cellSelector);

    if (cellSelector.columnId === me.timeAxisColumn.id) ; else {
      return super.focusCell(cellSelector, options);
    }
  } // Interface method to extract the navigated to record from a populated 'navigate' event.
  // Gantt, Scheduler and Calendar handle event differently, adding different properties to it.
  // This method is meant to be overridden to return correct target from event

  normalizeTarget(event) {
    return event.assignmentRecord;
  }

  getPrevious(assignmentRecord, isDelete) {
    const me = this,
          {
      resourceStore
    } = me,
          {
      eventSorter
    } = me.currentOrientation,
          // start/end dates are required to limit time span to look at in case recurrence feature is enabled
    {
      startDate,
      endDate
    } = me.timeAxis,
          eventRecord = assignmentRecord.event,
          resourceEvents = me.eventStore.getEvents({
      resourceRecord: assignmentRecord.resource,
      startDate,
      endDate
    }).filter(this.isInTimeAxis).sort(eventSorter);
    let resourceRecord = assignmentRecord.resource,
        previousEvent = resourceEvents[resourceEvents.indexOf(eventRecord) - 1]; // At first event for resource, traverse up the resource store.

    if (!previousEvent) {
      // If we are deleting an event, skip other instances of the event which we may encounter
      // due to multi-assignment.
      for (let rowIdx = resourceStore.indexOf(resourceRecord) - 1; (!previousEvent || isDelete && previousEvent === eventRecord) && rowIdx >= 0; rowIdx--) {
        resourceRecord = resourceStore.getAt(rowIdx);
        const events = me.eventStore.getEvents({
          resourceRecord,
          startDate,
          endDate
        }).filter(me.isInTimeAxis).sort(eventSorter);
        previousEvent = events.length && events[events.length - 1];
      }
    }

    return me.assignmentStore.getAssignmentForEventAndResource(previousEvent, resourceRecord);
  }

  navigatePrevious(keyEvent) {
    const me = this,
          previousAssignment = me.getPrevious(me.normalizeTarget(keyEvent));
    keyEvent.preventDefault();

    if (previousAssignment) {
      if (!keyEvent.ctrlKey) {
        me.clearEventSelection();
      }

      return me.navigateTo(previousAssignment, {
        uiEvent: keyEvent
      });
    } // No previous event/task, fall back to Grid's handling of this gesture

    return me.doGridNavigation(keyEvent);
  }

  getNext(assignmentRecord, isDelete) {
    const me = this,
          {
      resourceStore
    } = me,
          {
      eventSorter
    } = me.currentOrientation,
          // start/end dates are required to limit time span to look at in case recurrence feature is enabled
    {
      startDate,
      endDate
    } = me.timeAxis,
          eventRecord = assignmentRecord.event,
          resourceEvents = me.eventStore.getEvents({
      resourceRecord: assignmentRecord.resource,
      // start/end are required to limit time
      startDate,
      endDate
    }).filter(this.isInTimeAxis).sort(eventSorter);
    let resourceRecord = assignmentRecord.resource,
        nextEvent = resourceEvents[resourceEvents.indexOf(eventRecord) + 1]; // At last event for resource, traverse down the resource store

    if (!nextEvent) {
      // If we are deleting an event, skip other instances of the event which we may encounter
      // due to multi-assignment.
      for (let rowIdx = resourceStore.indexOf(resourceRecord) + 1; (!nextEvent || isDelete && nextEvent === eventRecord) && rowIdx < resourceStore.count; rowIdx++) {
        resourceRecord = resourceStore.getAt(rowIdx);
        const events = me.eventStore.getEvents({
          resourceRecord,
          startDate,
          endDate
        }).filter(me.isInTimeAxis).sort(eventSorter);
        nextEvent = events[0];
      }
    }

    return me.assignmentStore.getAssignmentForEventAndResource(nextEvent, resourceRecord);
  }

  navigateNext(keyEvent) {
    const me = this,
          nextAssignment = me.getNext(me.normalizeTarget(keyEvent));
    keyEvent.preventDefault();

    if (nextAssignment) {
      if (!keyEvent.ctrlKey) {
        me.clearEventSelection();
      }

      return me.navigateTo(nextAssignment, {
        uiEvent: keyEvent
      });
    } // No next event/task, fall back to Grid's handling of this gesture

    return me.doGridNavigation(keyEvent);
  }

  async navigateTo(targetAssignment, {
    scrollIntoView = true,
    uiEvent = {}
  } = emptyObject) {
    const me = this,
          {
      navigator
    } = me,
          {
      skipScrollIntoView
    } = navigator;

    if (targetAssignment) {
      if (scrollIntoView) {
        // No key processing during scroll
        me.navigator.disabled = true;
        await me.scrollAssignmentIntoView(targetAssignment, null, animate100);
        me.navigator.disabled = false;
      } else {
        navigator.skipScrollIntoView = true;
      } // Panel can be destroyed before promise is resolved
      // Perform a sanity check to make sure element is still in the DOM (syncIdMap actually).

      if (!me.isDestroyed && this.getElementFromAssignmentRecord(targetAssignment)) {
        me.activeAssignment = targetAssignment;
        navigator.skipScrollIntoView = skipScrollIntoView;
        me.navigator.trigger('navigate', {
          event: uiEvent,
          item: DomHelper.up(me.getElementFromAssignmentRecord(targetAssignment), me.navigator.itemSelector)
        });
      }
    }
  }

  set activeAssignment(assignmentRecord) {
    const assignmentEl = this.getElementFromAssignmentRecord(assignmentRecord, true);

    if (assignmentEl) {
      this.navigator.activeItem = assignmentEl;
    }
  }

  get activeAssignment() {
    const {
      activeItem
    } = this.navigator;

    if (activeItem) {
      return this.resolveAssignmentRecord(activeItem);
    }
  }

  get previousActiveEvent() {
    const {
      previousActiveItem
    } = this.navigator;

    if (previousActiveItem) {
      return this.resolveEventRecord(previousActiveItem);
    }
  }

  processEvent(keyEvent) {
    const me = this,
          eventElement = DomHelper.up(keyEvent.target, me.eventSelector);

    if (!me.navigator.disabled && eventElement) {
      keyEvent.assignmentRecord = me.resolveAssignmentRecord(eventElement);
      keyEvent.eventRecord = me.resolveEventRecord(eventElement);
      keyEvent.resourceRecord = me.resolveResourceRecord(eventElement);
    }

    return keyEvent;
  }

  onDeleteKey(keyEvent) {
    const me = this;

    if (!me.readOnly && me.enableDeleteKey) {
      const records = me.eventStore.usesSingleAssignment ? me.selectedEvents : me.selectedAssignments;
      me.removeEvents(records.filter(r => !r.readOnly));
    }
  }

  onArrowUpKey(keyEvent) {
    this.focusCell({
      rowIndex: this.focusedCell.rowIndex - 1,
      column: this.timeAxisColumn
    });
  }

  onArrowDownKey(keyEvent) {
    if (this.focusedCell.rowIndex < this.resourceStore.count - 1) {
      this.focusCell({
        rowIndex: this.focusedCell.rowIndex + 1,
        column: this.timeAxisColumn
      });
    }
  }

  onEscapeKey(keyEvent) {
    if (!keyEvent.target.closest('.b-dragging')) {
      this.focusCell({
        rowIndex: this.focusedCell.rowIndex,
        column: this.timeAxisColumn
      });
    }
  }
  /**
   * Internal utility function to remove events. Used when pressing [DELETE] or [BACKSPACE] or when clicking the
   * delete button in the event editor. Triggers a preventable `beforeEventDelete` or `beforeAssignmentDelete` event.
   * @param {Scheduler.model.EventModel[]|Scheduler.model.AssignmentModel[]} eventRecords Records to remove
   * @param {Function} [callback] Optional callback executed after triggering the event but before deletion
   * @returns {Boolean} Returns `false` if the operation was prevented, otherwise `true`
   * @internal
   * @fires beforeEventDelete
   * @fires beforeAssignmentDelete
   */

  removeEvents(eventRecords, callback = null) {
    const me = this;

    if (!me.readOnly && eventRecords.length) {
      const context = {
        finalize(removeRecord = true) {
          if (callback) {
            callback(removeRecord);
          }

          if (removeRecord !== false) {
            if (eventRecords.some(record => {
              var _record$event;

              return record.isOccurrence || ((_record$event = record.event) === null || _record$event === void 0 ? void 0 : _record$event.isOccurrence);
            })) {
              eventRecords.forEach(record => record.isOccurrenceAssignment ? record.event.remove() : record.remove());
            } else {
              const store = eventRecords[0].isAssignment ? me.assignmentStore : me.eventStore;
              store.remove(eventRecords);
            }
          }
        }

      };
      let shouldFinalize;

      if (eventRecords[0].isAssignment) {
        /**
         * Fires before an assignment is removed. Can be triggered by user pressing [DELETE] or [BACKSPACE] or
         * by the event editor. Can for example be used to display a custom dialog to confirm deletion, in which
         * case records should be "manually" removed after confirmation:
         *
         * ```javascript
         * scheduler.on({
         *    beforeAssignmentDelete({ assignmentRecords, context }) {
         *        // Show custom confirmation dialog (pseudo code)
         *        confirm.show({
         *            listeners : {
         *                onOk() {
         *                    // Remove the assignments on confirmation
         *                    context.finalize(true);
         *                },
         *                onCancel() {
         *                    // do not remove the assignments if "Cancel" clicked
         *                    context.finalize(false);
         *                }
         *            }
         *        });
         *
         *        // Prevent default behaviour
         *        return false;
         *    }
         * });
         * ```
         *
         * @event beforeAssignmentDelete
         * @param {Scheduler.view.Scheduler} source  The Scheduler instance
         * @param {Scheduler.model.EventModel[]} eventRecords  The records about to be deleted
         * @param {Object} context  Additional removal context:
         * @param {Function} context.finalize  Function to call to finalize the removal.
         *      Used to asynchronously decide to remove the records or not. Provide `false` to the function to
         *      prevent the removal.
         * @param {Boolean} [context.finalize.removeRecords = true]   Provide `false` to the function to prevent
         *      the removal.
         * @preventable
         */
        shouldFinalize = me.trigger('beforeAssignmentDelete', {
          assignmentRecords: eventRecords,
          context
        });
      } else {
        /**
         * Fires before an event is removed. Can be triggered by user pressing [DELETE] or [BACKSPACE] or by the
         * event editor. Can for example be used to display a custom dialog to confirm deletion, in which case
         * records should be "manually" removed after confirmation:
         *
         * ```javascript
         * scheduler.on({
         *    beforeEventDelete({ eventRecords, context }) {
         *        // Show custom confirmation dialog (pseudo code)
         *        confirm.show({
         *            listeners : {
         *                onOk() {
         *                    // Remove the events on confirmation
         *                    context.finalize(true);
         *                },
         *                onCancel() {
         *                    // do not remove the events if "Cancel" clicked
         *                    context.finalize(false);
         *                }
         *            }
         *        });
         *
         *        // Prevent default behaviour
         *        return false;
         *    }
         * });
         * ```
         *
         * @event beforeEventDelete
         * @param {Scheduler.view.Scheduler} source  The Scheduler instance
         * @param {Scheduler.model.EventModel[]} eventRecords  The records about to be deleted
         * @param {Object} context  Additional removal context:
         * @param {Function} context.finalize  Function to call to finalize the removal.
         *      Used to asynchronously decide to remove the records or not. Provide `false` to the function to
         *      prevent the removal.
         * @param {Boolean} [context.finalize.removeRecords = true]  Provide `false` to the function to prevent
         *      the removal.
         * @preventable
         */
        shouldFinalize = me.trigger('beforeEventDelete', {
          eventRecords,
          context
        });
      }

      if (shouldFinalize !== false) {
        context.finalize();
        return true;
      }
    }

    return false;
  }

  onEventSpaceKey(keyEvent) {// Empty, to be chained by features
  }

  onEventEnterKey(keyEvent) {// Empty, to be chained by features
  }

  get isActionableLocation() {
    // Override from grid if the Navigator's location is an event (or task if we're in Gantt)
    // Being focused on a task/event means that it's *not* actionable. It's not valid to report
    // that we're "inside" the cell in a TimeLine, so ESC must not attempt to focus the cell.
    if (!this.navigator.activeItem) {
      return super.isActionableLocation;
    }
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

export { ClockTemplate, CurrentConfig, EventMenu, ProjectConsumer, RecurrenceConfirmationPopup, ScheduleMenu, SchedulerEventNavigation, TimeSpanMenuBase, locale };
//# sourceMappingURL=EventNavigation.js.map
