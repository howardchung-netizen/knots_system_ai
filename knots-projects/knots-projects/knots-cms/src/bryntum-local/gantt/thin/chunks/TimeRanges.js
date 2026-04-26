/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { _objectSpread2, Base, InstancePlugin, Popup, ObjectHelper, Rectangle, Duration, DomHelper, DateHelper, DomSync, StringHelper, _defineProperty, VersionHelper, DomClassList, EventHelper, BrowserHelper, Store, GlobalEvents, ArrayHelper, Model, Delayable } from './Editor.js';
import { TimeAxisBase, AttachToProjectMixin, DragBase, DragCreateBase, TooltipBase, TimelineBase, AbstractTimeRanges } from './TimeAxisHeaderMenu.js';
import { ColumnStore, Column, GridFeatureManager } from './GridBase.js';
import './DisplayField.js';
import './DurationField.js';
import { DependencyModel, CrudManagerView } from './ProjectModel.js';
import './LocalizableCombo.js';
import { PackMixin, SchedulerEventSelection, CrudManager } from './EventSelection.js';
import { ProjectConsumer, SchedulerEventNavigation, CurrentConfig } from './EventNavigation.js';

/**
 * @module Scheduler/view/VerticalTimeAxis
 */

/**
 * Widget that renders a vertical time axis. Only renders ticks in view. Used in vertical mode.
 * @extends Core/widget/Widget
 * @private
 */

class VerticalTimeAxis extends TimeAxisBase {
  static get $name() {
    return 'VerticalTimeAxis';
  }

  static get configurable() {
    return {
      cls: 'b-verticaltimeaxis',
      sizeProperty: 'height',
      positionProperty: 'top',
      wrapText: true
    };
  } // All cells overlayed in the same space.
  // For future use.

  buildHorizontalCells() {
    const me = this,
          {
      client
    } = me,
          stickyHeaders = client === null || client === void 0 ? void 0 : client.stickyHeaders,
          featureHeaderConfigs = [],
          cellConfigs = me.levels.reduce((result, level, i) => {
      if (level.cells) {
        var _level$cells;

        result.push(...((_level$cells = level.cells) === null || _level$cells === void 0 ? void 0 : _level$cells.filter(cell => cell.start < me.endDate && cell.end > me.startDate).map((cell, j, cells) => ({
          className: {
            'b-sch-header-timeaxis-cell': 1,
            [cell.headerCellCls]: cell.headerCellCls,
            [`b-align-${cell.align}`]: cell.align,
            'b-last': j === cells.length - 1,
            'b-lowest': i === me.levels.length - 1
          },
          dataset: _objectSpread2({
            tickIndex: cell.index,
            cellId: `${i}-${cell.index}`,
            headerPosition: i
          }, globalThis.DEBUG && {
            date: cell.start.getTime()
          }),
          style: {
            // DomHelper appends px to numeric dimensions
            top: cell.coord,
            height: cell.width,
            minHeight: cell.width
          },
          children: [{
            className: {
              'b-sch-header-text': 1,
              'b-sticky-header': stickyHeaders
            },
            html: cell.value
          }]
        }))));
      }

      return result;
    }, []); // When tested in isolation there is no client

    client === null || client === void 0 ? void 0 : client.getHeaderDomConfigs(featureHeaderConfigs);
    cellConfigs.push(...featureHeaderConfigs); // noinspection JSSuspiciousNameCombination

    return {
      className: me.widgetClassList,
      dataset: {
        headerFeature: `headerRow0`,
        headerPosition: 0
      },
      syncOptions: {
        // Keep a maximum of 5 released cells. Might be fine with fewer since ticks are fixed width.
        // Prevents an unnecessary amount of cells from sticking around when switching from narrow to
        // wide tickSizes
        releaseThreshold: 5,
        syncIdField: 'cellId'
      },
      children: cellConfigs
    };
  }

  get height() {
    return this.size;
  }

}
VerticalTimeAxis._$name = 'VerticalTimeAxis';

/**
 * @module Scheduler/column/VerticalTimeAxisColumn
 */

/**
 * A column containing the time axis labels for vertical mode. Normally you do not need to interact with or
 * create this column, it is handled by Scheduler/Gantt.
 *
 * @extends Grid/column/Column
 */

class VerticalTimeAxisColumn extends Column {
  static get type() {
    return 'verticalTimeAxis';
  }

  static get defaults() {
    return {
      /**
       * Set to false to prevent this column header from being dragged.
       * @config {Boolean} draggable
       * @category Interaction
       * @default false
       * @hide
       */
      draggable: false,

      /**
       * Set to false to prevent grouping by this column.
       * @config {Boolean} groupable
       * @category Interaction
       * @default false
       * @hide
       */
      groupable: false,

      /**
       * Allow column visibility to be toggled through UI.
       * @config {Boolean} hideable
       * @default false
       * @category Interaction
       * @hide
       */
      hideable: false,

      /**
       * Show column picker for the column.
       * @config {Boolean} showColumnPicker
       * @default false
       * @category Menu
       * @hide
       */
      showColumnPicker: false,

      /**
       * Allow filtering data in the column (if Filter feature is enabled)
       * @config {Boolean} filterable
       * @default false
       * @category Interaction
       * @hide
       */
      filterable: false,

      /**
       * Allow sorting of data in the column
       * @config {Boolean} sortable
       * @category Interaction
       * @default false
       * @hide
       */
      sortable: false,
      // /**
      //  * Set to `false` to prevent the column from being drag-resized when the ColumnResize plugin is enabled.
      //  * @config {Boolean} resizable
      //  * @default false
      //  * @category Interaction
      //  * @hide
      //  */
      // resizable : false,

      /**
       * Allow searching in the column (respected by QuickFind and Search features)
       * @config {Boolean} searchable
       * @default false
       * @category Interaction
       * @hide
       */
      searchable: false,

      /**
       * Specifies if this column should be editable, and define which editor to use for editing cells in the column (if CellEdit feature is enabled)
       * @config {String} editor
       * @default false
       * @category Interaction
       * @hide
       */
      editor: false,

      /**
       * Set to `true` to show a context menu on the cell elements in this column
       * @config {Boolean} enableCellContextMenu
       * @default false
       * @category Menu
       * @hide
       */
      enableCellContextMenu: false,

      /**
       * @config {Function} tooltipRenderer
       * @hide
       */
      tooltipRenderer: false,

      /**
       * Column minimal width. If value is Number then minimal width is in pixels
       * @config {Number|String} minWidth
       * @default 0
       * @category Layout
       */
      minWidth: 0,
      resizable: false,
      cellCls: 'b-verticaltimeaxiscolumn',
      flex: 1
    };
  }

  get isFocusable() {
    return false;
  }

  construct(data) {
    super.construct(...arguments);
    this.view = new VerticalTimeAxis({
      model: this.grid.timeAxisViewModel,
      client: this.grid
    });
  }

  renderer({
    cellElement,
    size
  }) {
    this.view.render(cellElement);
    size.height = this.view.height;
  } // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs (fields) for the column, removing irrelevant ones

  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options); // Remove irrelevant configs

    delete result.id;
    delete result.region;
    delete result.type;
    delete result.field;
    delete result.ariaLabel;
    delete result.cellAriaLabel;
    return result;
  }

}
ColumnStore.registerColumnType(VerticalTimeAxisColumn);
VerticalTimeAxisColumn._$name = 'VerticalTimeAxisColumn';

/**
 * @module Scheduler/eventlayout/HorizontalLayout
 */

/**
 * Base class for horizontal layouts (HorizontalLayoutPack and HorizontalLayoutStack). Should not be used directly,
 * instead specify {@link Scheduler.view.mixin.SchedulerEventRendering#config-eventLayout} in Scheduler config (stack,
 * pack or none):
 *
 * @example
 * let scheduler = new Scheduler({
 *   eventLayout: 'stack'
 * });
 *
 * @abstract
 * @private
 */

class HorizontalLayout extends Base {
  static get defaultConfig() {
    return {
      nbrOfBandsByResource: {},
      bandIndexToPxConvertFn: null,
      bandIndexToPxConvertThisObj: null
    };
  }

  clearCache(resource) {
    if (resource) {
      delete this.nbrOfBandsByResource[resource.id];
    } else {
      this.nbrOfBandsByResource = {};
    }
  }
  /**
   * This method performs layout on an array of event render data and returns amount of _bands_. Band is a multiplier of a
   * configured {@link Scheduler.view.Scheduler#config-rowHeight} to calculate total row height required to fit all
   * events.
   * This method should not be used directly, it is called by the Scheduler during the row rendering process.
   * @param {EventRenderData[]} events
   * @param {Scheduler.model.ResourceModel} resource
   * @return {Number}
   */

  applyLayout(events, resource) {
    const rowEvents = events.slice(),
          // return a number of bands required
    newNbrBands = this.layoutEventsInBands(rowEvents);
    return this.nbrOfBandsByResource[resource.id] = newNbrBands;
  }
  /**
   * This method iterates over events and calculates top position for each of them. Default layouts calculate
   * positions to avoid events overlapping horizontally (except for the 'none' layout). Pack layout will squeeze events to a single
   * row by reducing their height, Stack layout will increase the row height and keep event height intact.
   * This method should not be used directly, it is called by the Scheduler during the row rendering process.
   * @param {EventRenderData[]} events
   */

  layoutEventsInBands(events) {
    throw new Error('Implement in subclass');
  }

}
HorizontalLayout._$name = 'HorizontalLayout';

/**
 * @module Scheduler/eventlayout/HorizontalLayoutPack
 */

/**
 * Handles layout of events within a row (resource) in horizontal mode. Packs events (adjusts their height) to fit
 * available row height
 *
 * @extends Scheduler/eventlayout/HorizontalLayout
 * @mixes Scheduler/eventlayout/PackMixin
 * @private
 */

class HorizontalLayoutPack extends HorizontalLayout.mixin(PackMixin) {
  static get $name() {
    return 'HorizontalLayoutPack';
  }

  static get configurable() {
    return {
      type: 'pack'
    };
  } // Packs the events to consume as little space as possible

  layoutEventsInBands(events) {
    const result = this.packEventsInBands(events, (event, j, slot, slotSize) => {
      event.height = slotSize;
      event.top = slot.start + j * slotSize;
    });
    events.forEach(event => {
      Object.assign(event, this.bandIndexToPxConvertFn.call(this.bandIndexToPxConvertThisObj || this, event.top, event.height, event.eventRecord, event.resourceRecord));
    });
    return result;
  }

}
HorizontalLayoutPack._$name = 'HorizontalLayoutPack';

/**
 * @module Scheduler/eventlayout/HorizontalLayoutStack
 */

/**
 * Handles layout of events within a row (resource) in horizontal mode. Stacks events, increasing row height when to fit
 * all overlapping events.
 *
 * This layout is used by default in horizontal mode.
 *
 * @extends Scheduler/eventlayout/HorizontalLayout
 * @private
 */

class HorizontalLayoutStack extends HorizontalLayout {
  static get $name() {
    return 'HorizontalLayoutStack';
  }

  static get configurable() {
    return {
      type: 'stack'
    };
  } // Input: Array of event layout data
  // heightRun is used when pre-calculating row heights, taking a cheaper path

  layoutEventsInBands(events, heightRun = false) {
    let verticalPosition = 0;

    do {
      let eventIndex = 0,
          event = events[0];

      while (event) {
        if (!heightRun) {
          // Apply band height to the event cfg
          event.top = this.bandIndexToPxConvertFn.call(this.bandIndexToPxConvertThisObj || this, verticalPosition, event.eventRecord, event.resourceRecord);
        } // Remove it from the array and continue searching

        events.splice(eventIndex, 1);
        eventIndex = this.findClosestSuccessor(event, events);
        event = events[eventIndex];
      }

      verticalPosition++;
    } while (events.length > 0); // Done!

    return verticalPosition;
  } // TODO: optimize this for better performance with many events per resource

  findClosestSuccessor(eventRenderData, events) {
    const {
      endMS,
      group
    } = eventRenderData,
          isMilestone = eventRenderData.eventRecord && eventRenderData.eventRecord.duration === 0;
    let minGap = Infinity,
        closest,
        gap,
        event;

    for (let i = 0, l = events.length; i < l; i++) {
      event = events[i];
      gap = event.startMS - endMS;

      if (gap >= 0 && gap < minGap && ( // Two milestones should not overlap
      gap > 0 || event.endMS - event.startMS > 0 || !isMilestone)) {
        // Events are sorted by group, so when we find first event with a different group, we can stop iteration
        if (this.grouped && group !== event.group) {
          break;
        }

        closest = i;
        minGap = gap;
      }
    }

    return closest;
  }

}
HorizontalLayoutStack._$name = 'HorizontalLayoutStack';

/**
 * @module Scheduler/feature/base/ResourceTimeRangesBase
 */

/**
 * Abstract base class for ResourceTimeRanges and ResourceNonWorkingTime features.
 * You should not use this class directly.
 *
 * @extends Core/mixin/InstancePlugin
 * @abstract
 */

class ResourceTimeRangesBase extends InstancePlugin.mixin(AttachToProjectMixin) {
  //region Config
  static get configurable() {
    return {
      /**
       * Specify value to use for the tabIndex attribute of range elements
       * @config {Number}
       * @default
       */
      tabIndex: null
    };
  } // Plugin configuration. This plugin chains some of the functions in Grid.

  static get pluginConfig() {
    return {
      chain: ['getEventsToRender', 'onEventDataGenerated', 'noFeatureElementsInAxis']
    };
  } // Let Scheduler know if we have ResourceTimeRanges in view or not

  noFeatureElementsInAxis() {
    const {
      timeAxis
    } = this.client;
    return !this.needsRefresh && this.store && !this.store.storage.values.some(t => timeAxis.isTimeSpanInAxis(t));
  } //endregion
  //region Init

  doDisable(disable) {
    if (this.client.isPainted) {
      this.client.refresh();
    }

    super.doDisable(disable);
  }

  updateTabIndex() {
    if (!this.isConfiguring) {
      this.client.refresh();
    }
  } //endregion

  getEventsToRender(resource, events) {
    throw new Error('Implement in subclass');
  } // Called for each event during render, allows manipulation of render data. Adjust any resource time ranges
  // (chained function from Scheduler)

  onEventDataGenerated(renderData) {
    const me = this,
          {
      eventRecord,
      iconCls
    } = renderData;

    if (me.shouldInclude(eventRecord)) {
      if (me.client.isVertical) {
        renderData.width = me.client.resourceColumnWidth;
      } else {
        renderData.top = 0;
      } // Flag that we should fill entire row/col

      renderData.fillSize = true; // Add our own cls

      renderData.wrapperCls[me.rangeCls] = 1;
      renderData.wrapperCls[`b-sch-color-${eventRecord.timeRangeColor}`] = eventRecord.timeRangeColor; // Add label

      renderData.eventContent.text = eventRecord.name;
      renderData.children.push(renderData.eventContent); // Allow configuring tabIndex

      renderData.tabIndex = me.tabIndex != null ? String(me.tabIndex) : null; // Add icon

      if ((iconCls === null || iconCls === void 0 ? void 0 : iconCls.length) > 0) {
        renderData.children.unshift({
          tag: 'i',
          className: iconCls.toString()
        });
      } // Event data for DOMSync comparison

      renderData.eventId = me.generateElementId(eventRecord);
    }
  }
  /**
   * Generates ID from the passed time range record
   * @param {Scheduler.model.TimeSpan} record
   * @returns {String} Generated ID for the DOM element
   * @internal
   */

  generateElementId(record) {
    return record.domId;
  }

  shouldInclude(eventRecord) {
    throw new Error('Implement in subclass');
  } // Called when a ResourceTimeRangeModel is manipulated, relays to Scheduler#onInternalEventStoreChange which updates to UI

  onStoreChange(event) {
    // Edge case for scheduler not using any events, it has to refresh anyway to get rid of ResourceTimeRanges
    if (event.action === 'removeall' || event.action === 'dataset') {
      this.needsRefresh = true;
    }

    this.client.onInternalEventStoreChange(event);
    this.needsRefresh = false;
  }

} // No feature based styling needed, do not add a cls to Scheduler

ResourceTimeRangesBase.featureClass = '';
ResourceTimeRangesBase._$name = 'ResourceTimeRangesBase';

/**
 * @module Scheduler/view/DependencyEditor
 */

/**
 * A dependency editor popup.
 *
 * @extends Core/widget/Popup
 * @private
 */

class DependencyEditor extends Popup {
  static get $name() {
    return 'DependencyEditor';
  }

  static get defaultConfig() {
    return {
      items: [],
      draggable: {
        handleSelector: ':not(button,.b-field-inner)' // blacklist buttons and field inners

      },
      axisLock: 'flexible'
    };
  }

  processWidgetConfig(widget) {
    const {
      dependencyEditFeature
    } = this;

    if (widget.ref === 'lagField' && !dependencyEditFeature.showLagField) {
      return false;
    }

    if (widget.ref === 'deleteButton' && !dependencyEditFeature.showDeleteButton) {
      return false;
    }

    return super.processWidgetConfig(widget);
  }

  afterShow(...args) {
    const {
      deleteButton
    } = this.widgetMap; // Only show delete button if the dependency record belongs to a store

    if (deleteButton) {
      deleteButton.hidden = !this.record.isPartOfStore();
    }

    super.afterShow(...args);
  }

  onInternalKeyDown(event) {
    this.trigger('keyDown', {
      event
    });
    super.onInternalKeyDown(event);
  }

}
DependencyEditor._$name = 'DependencyEditor';

/* eslint-disable no-unused-expressions */
/**
 * @module Scheduler/feature/DependencyEdit
 */

/**
 * Feature that displays a popup containing fields for editing a dependency. Requires the {@link Scheduler.feature.Dependencies Dependencies} feature to be enabled.
 *
 * This feature is **off** by default. It does **not** support vertical mode.
 * For info on enabling it, see {@link Grid.view.mixin.GridFeatures}.
 *
 * @extends Core/mixin/InstancePlugin
 * @inlineexample Scheduler/feature/Dependencies.js
 * @demo Scheduler/dependencies
 * @classtype dependencyEdit
 * @feature
 */

class DependencyEdit extends InstancePlugin {
  //region Config
  static get $name() {
    return 'DependencyEdit';
  }

  static get configurable() {
    return {
      /**
       * True to hide this editor if a click is detected outside it (defaults to true)
       * @config {Boolean}
       * @default
       * @category Editor
       */
      autoClose: true,

      /**
       * True to save and close this panel if ENTER is pressed in one of the input fields inside the panel.
       * @config {Boolean}
       * @default
       * @category Editor
       */
      saveAndCloseOnEnter: true,

      /**
       * True to show a delete button in the form.
       * @config {Boolean}
       * @default
       * @category Editor widgets
       */
      showDeleteButton: true,

      /**
       * The event that shall trigger showing the editor. Defaults to `dependencydblclick`, set to empty string or `null` to disable editing of dependencies.
       * @config {String}
       * @default
       * @category Editor
       */
      triggerEvent: 'dependencydblclick',

      /**
       * True to show the lag field for the dependency
       * @config {Boolean}
       * @default
       * @category Editor widgets
       */
      showLagField: false,
      dependencyRecord: null,

      /**
       * Default editor configuration, used to configure the Popup.
       * @config {Object}
       * @category Editor
       */
      editorConfig: {
        title: 'L{Edit dependency}',
        localeClass: this,
        closable: true,
        defaults: {
          localeClass: this
        },
        items: {
          /**
           * Reference to the from name
           * @member {Core.widget.DisplayField} fromNameField
           * @readonly
           */
          fromNameField: {
            type: 'display',
            label: 'L{From}',
            editable: false
          },

          /**
           * Reference to the to name field
           * @member {Core.widget.DisplayField} toNameField
           * @readonly
           */
          toNameField: {
            type: 'display',
            label: 'L{To}'
          },

          /**
           * Reference to the type field
           * @member {Core.widget.Combo} typeField
           * @readonly
           */
          typeField: {
            type: 'localizablecombo',
            label: 'L{Type}',
            name: 'type',
            editable: false,
            valueField: 'id',
            displayField: 'name',
            buildLocalizedItems: function () {
              const dialog = this.parent;
              return Object.keys(DependencyModel.Type).map(type => {
                // Do not remove. Assertion strings for Localization sanity check.
                // 'L{StartToStart}'
                // 'L{StartToEnd}'
                // 'L{EndToStart}'
                // 'L{EndToEnd}'
                return {
                  id: DependencyModel.Type[type],
                  name: dialog.L(type),
                  localeKey: type
                };
              });
            }
          },

          /**
           * Reference to the lag field
           * @member {Core.widget.DurationField} lagField
           * @readonly
           */
          lagField: {
            type: 'duration',
            label: 'L{Lag}',
            name: 'lag',
            allowNegative: true
          }
        },
        bbar: {
          defaults: {
            localeClass: this
          },
          items: {
            foo: {
              type: 'widget',
              cls: 'b-label-filler'
            },

            /**
             * Reference to the save button, if used
             * @member {Core.widget.Button} saveButton
             * @readonly
             */
            saveButton: {
              color: 'b-green',
              text: 'L{Save}'
            },

            /**
             * Reference to the delete button, if used
             * @member {Core.widget.Button} deleteButton
             * @readonly
             */
            deleteButton: {
              color: 'b-gray',
              text: 'L{Delete}'
            },

            /**
             * Reference to the cancel button, if used
             * @member {Core.widget.Button} cancelButton
             * @readonly
             */
            cancelButton: {
              color: 'b-gray',
              text: 'L{Object.Cancel}'
            }
          }
        }
      }
    };
  } //endregion
  //region Init & destroy

  construct(client, config) {
    const me = this;
    client.dependencyEdit = me;
    super.construct(client, config);

    if (!client.features.dependencies) {
      throw new Error('Dependencies feature required when using DependencyEdit');
    }

    me.clientListenersDetacher = client.on({
      [me.triggerEvent]: me.onActivateEditor,
      thisObj: me
    });
  }

  doDestroy() {
    var _this$editor;

    this.clientListenersDetacher();
    (_this$editor = this.editor) === null || _this$editor === void 0 ? void 0 : _this$editor.destroy();
    super.doDestroy();
  } //endregion
  //region Editing

  changeEditorConfig(config) {
    const me = this,
          {
      autoClose,
      cls,
      client
    } = me;
    return ObjectHelper.assign({
      owner: client,
      align: 'b-t',

      /* eslint-disable quote-props */
      'id': `${client.id}-dependency-editor`,

      /* eslint-enable quote-props */
      autoShow: false,
      anchor: true,
      scrollAction: 'realign',
      clippedBy: [client.timeAxisSubGridElement, client.bodyContainer],
      constrainTo: globalThis,
      autoClose,
      cls
    }, config);
  } //endregion
  //region Save

  get isValid() {
    return Object.values(this.editor.widgetMap).every(field => {
      if (!field.name || field.hidden) {
        return true;
      }

      return field.isValid !== false;
    });
  }

  get values() {
    const values = {};
    this.editor.eachWidget(widget => {
      if (!widget.name || widget.hidden) return;
      values[widget.name] = widget.value;
    }, true);
    return values;
  }
  /**
   * Template method, intended to be overridden. Called before the dependency record has been updated.
   * @param {Scheduler.model.DependencyModel} dependencyRecord The dependency record
   *
   **/

  onBeforeSave(dependencyRecord) {}
  /**
   * Template method, intended to be overridden. Called after the dependency record has been updated.
   * @param {Scheduler.model.DependencyModel} dependencyRecord The dependency record
   *
   **/

  onAfterSave(dependencyRecord) {}
  /**
   * Updates record being edited with values from the editor
   * @private
   */

  updateRecord(dependencyRecord) {
    const {
      values
    } = this; // Engine does not understand { magnitude, unit } syntax

    if (values.lag) {
      values.lagUnit = values.lag.unit;
      values.lag = values.lag.magnitude;
    } // Type replaces fromSide/toSide, if they are used

    if ('type' in values) {
      dependencyRecord.fromSide != null && (values.fromSide = null);
      dependencyRecord.toSide != null && (values.toSide = null);
    } // Chronograph doesn't filter out undefined fields, it nullifies them instead
    // https://github.com/bryntum/chronograph/issues/11

    ObjectHelper.cleanupProperties(values, true);
    dependencyRecord.set(values);
  } //endregion
  //region Events

  onPopupKeyDown({
    event
  }) {
    if (event.key === 'Enter' && this.saveAndCloseOnEnter && event.target.tagName.toLowerCase() === 'input') {
      // Need to prevent this key events from being fired on whatever receives focus after the editor is hidden
      event.preventDefault();
      this.onSaveClick();
    }
  }

  onSaveClick() {
    if (this.save()) {
      this.editor.hide();
    }
  }

  onDeleteClick() {
    this.deleteDependency();
    this.editor.hide();
  }

  onCancelClick() {
    this.editor.hide();
  } //region Editing
  // Called from editDependency() to actually show the editor

  internalShowEditor(dependencyRecord) {
    const me = this,
          {
      client
    } = me;
    let showPoint = me.lastPointerDownCoordinate;
    /**
     * Fires on the owning Scheduler before an dependency is displayed in the editor.
     * This may be listened for to allow an application to take over dependency editing duties. Returning `false`
     * stops the default editing UI from being shown.
     * @event beforeDependencyEdit
     * @on-owner
     * @param {Scheduler.view.Scheduler} source The scheduler
     * @param {Scheduler.feature.DependencyEdit} dependencyEdit The dependencyEdit feature
     * @param {Scheduler.model.DependencyModel} dependencyRecord The record about to be shown in the editor.
     * @preventable
     */

    if (client.trigger('beforeDependencyEdit', {
      dependencyEdit: me,
      dependencyRecord
    }) === false) {
      return;
    }

    const editor = me.getEditor(dependencyRecord);
    me.loadRecord(dependencyRecord);
    /**
     * Fires on the owning Scheduler when the editor for a dependency is available but before it is shown. Allows
     * manipulating fields before the widget is shown.
     * @event beforeDependencyEditShow
     * @on-owner
     * @param {Scheduler.view.Scheduler} source The scheduler
     * @param {Scheduler.feature.DependencyEdit} dependencyEdit The dependencyEdit feature
     * @param {Scheduler.model.DependencyModel} dependencyRecord The record about to be shown in the editor.
     * @param {Core.widget.Popup} editor The editor popup
     */

    client.trigger('beforeDependencyEditShow', {
      dependencyEdit: me,
      dependencyRecord,
      editor
    });

    if (!showPoint) {
      const center = Rectangle.from(me.client.element).center;
      showPoint = [center.x - editor.width / 2, center.y - editor.height / 2];
    }

    editor.showByPoint(showPoint);
  }
  /**
   * Opens a popup to edit the passed dependency.
   * @param {Scheduler.model.DependencyModel} dependencyRecord The dependency to edit
   */

  editDependency(dependencyRecord) {
    if (this.client.readOnly || dependencyRecord.readOnly) {
      return;
    }

    this.internalShowEditor(dependencyRecord);
  } //endregion
  //region Save

  /**
   * Gets an editor instance. Creates on first call, reuses on consecutive
   * @internal
   * @returns {Scheduler.view.DependencyEditor} Editor popup
   */

  getEditor() {
    var _me$saveButton, _me$deleteButton, _me$cancelButton;

    const me = this;
    let {
      editor
    } = me;

    if (editor) {
      return editor;
    }

    editor = me.editor = DependencyEditor.new({
      dependencyEditFeature: me,
      autoShow: false,
      anchor: true,
      scrollAction: 'realign',
      constrainTo: globalThis,
      autoClose: me.autoClose,
      cls: me.cls,
      rootElement: me.client.rootElement,
      listeners: {
        keydown: me.onPopupKeyDown,
        thisObj: me
      }
    }, me.editorConfig);

    if (editor.items.length === 0) {
      console.warn('Editor configured without any `items`');
    } // assign widget refs

    editor.eachWidget(widget => {
      const ref = widget.ref || widget.id; // don't overwrite if already defined

      if (ref && !me[ref]) {
        me[ref] = widget;
      }
    });
    (_me$saveButton = me.saveButton) === null || _me$saveButton === void 0 ? void 0 : _me$saveButton.on('click', me.onSaveClick, me);
    (_me$deleteButton = me.deleteButton) === null || _me$deleteButton === void 0 ? void 0 : _me$deleteButton.on('click', me.onDeleteClick, me);
    (_me$cancelButton = me.cancelButton) === null || _me$cancelButton === void 0 ? void 0 : _me$cancelButton.on('click', me.onCancelClick, me);
    return me.editor;
  } //endregion
  //region Delete

  /**
   * Sets fields values from record being edited
   * @private
   */

  loadRecord(dependency) {
    const me = this;
    me.fromNameField.value = dependency.fromEvent.name;
    me.toNameField.value = dependency.toEvent.name;

    if (me.lagField) {
      me.lagField.value = new Duration(dependency.lag, dependency.lagUnit);
    }

    me.editor.record = me.dependencyRecord = dependency;
  } //endregion
  //region Stores

  /**
   * Saves the changes (applies them to record if valid, if invalid editor stays open)
   * @private
   * @fires beforeDependencySave
   * @fires beforeDependencyAdd
   * @fires afterDependencySave
   * @returns {*}
   */

  async save() {
    const me = this,
          {
      client,
      dependencyRecord
    } = me;

    if (!dependencyRecord || !me.isValid) {
      return;
    }

    const {
      dependencyStore,
      values
    } = me;
    /**
     * Fires on the owning Scheduler before a dependency is saved
     * @event beforeDependencySave
     * @on-owner
     * @param {Scheduler.view.Scheduler} source The scheduler instance
     * @param {Scheduler.model.DependencyModel} dependencyRecord The dependency about to be saved
     * @param {Object} values The new values
     * @preventable
     */

    if (client.trigger('beforeDependencySave', {
      dependencyRecord,
      values
    }) !== false) {
      var _client$project;

      me.onBeforeSave(dependencyRecord);
      me.updateRecord(dependencyRecord); // Check if this is a new record

      if (dependencyStore && !dependencyRecord.stores.length) {
        /**
         * Fires on the owning Scheduler before a dependency is added
         * @event beforeDependencyAdd
         * @on-owner
         * @param {Scheduler.view.Scheduler} source The scheduler
         * @param {Scheduler.feature.DependencyEdit} dependencyEdit The dependency edit feature
         * @param {Scheduler.model.DependencyModel} dependencyRecord The dependency about to be added
         * @preventable
         */
        if (client.trigger('beforeDependencyAdd', {
          dependencyRecord,
          dependencyEdit: me
        }) === false) {
          return;
        }

        dependencyStore.add(dependencyRecord);
      }

      await ((_client$project = client.project) === null || _client$project === void 0 ? void 0 : _client$project.commitAsync());
      /**
       * Fires on the owning Scheduler after a dependency is successfully saved
       * @event afterDependencySave
       * @on-owner
       * @param {Scheduler.view.Scheduler} source The scheduler instance
       * @param {Scheduler.model.DependencyModel} dependencyRecord The dependency about to be saved
       */

      client.trigger('afterDependencySave', {
        dependencyRecord
      });
      me.onAfterSave(dependencyRecord);
    }

    return dependencyRecord;
  }
  /**
   * Delete dependency being edited
   * @private
   * @fires beforeDependencyDelete
   */

  async deleteDependency() {
    const {
      client,
      editor,
      dependencyRecord
    } = this;
    /**
     * Fires on the owning Scheduler before a dependency is deleted
     * @event beforeDependencyDelete
     * @on-owner
     * @param {Scheduler.view.Scheduler} source The scheduler instance
     * @param {Scheduler.model.DependencyModel} dependencyRecord The dependency record about to be deleted
     * @preventable
     */

    if (client.trigger('beforeDependencyDelete', {
      dependencyRecord
    }) !== false) {
      var _client$project2;

      if (editor.containsFocus) {
        editor.revertFocus();
      }

      client.dependencyStore.remove(dependencyRecord);
      await ((_client$project2 = client.project) === null || _client$project2 === void 0 ? void 0 : _client$project2.commitAsync());
      return true;
    }

    return false;
  }

  get dependencyStore() {
    return this.client.dependencyStore;
  } //endregion
  //region Events

  onActivateEditor({
    dependency,
    event
  }) {
    if (!this.disabled) {
      this.lastPointerDownCoordinate = [event.clientX, event.clientY];
      this.editDependency(dependency);
    }
  } //endregion

}
DependencyEdit._$name = 'DependencyEdit';
GridFeatureManager.registerFeature(DependencyEdit, false);

/**
 * @module Scheduler/feature/EventDrag
 */

/**
 * Allows user to drag and drop events within the scheduler, to change startDate or resource assignment.
 *
 * This feature is **enabled** by default
 *
 * ## Customizing the drag drop tooltip
 *
 * To show custom HTML in the tooltip, please see the {@link #config-tooltipTemplate} config. Example:
 *
 * ```javascript
 * features: {
 *     eventDrag : {
 *         // A minimal start date tooltip
 *         tooltipTemplate : ({ eventRecord, startDate }) => {
 *             return DateHelper.format(startDate, 'HH:mm');
 *         }
 *     }
 * }
 * ```
 *
 * ## Constraining the drag drop area
 *
 * You can constrain how the dragged event is allowed to move by using the following configs
 * * {@link #config-constrainDragToResource} Resource fixed, only allowed to change start date
 * * {@link #config-constrainDragToTimeSlot} Start date is fixed, only move between resources
 * * {@link Scheduler.view.Scheduler#config-getDateConstraints} A method on the Scheduler instance
 *    which lets you define the date range for the dragged event programmatically
 *
 * ```js
 * // Enable dragging + constrain drag to current resource
 * const scheduler = new Scheduler({
 *     features : {
 *         eventDrag : {
 *             constrainDragToResource : true
 *         }
 *     }
 * });
 * ```
 * ## Drag drop events from outside
 *
 * Dragging unplanned events from an external grid is a very popular use case. There are
 * several demos showing you how to do this. Please see the [Drag from grid demo](../examples/dragfromgrid)
 * and study the **Drag from grid guide** to learn more.
 *
 * ## Drag drop events to outside target
 *
 * You can also drag events outside the schedule area by setting {@link #config-constrainDragToTimeline} to `false`. You
 * should also either:
 * * provide a {@link #config-validatorFn} to programmatically define if a drop location is valid or not
 * * configure a {@link #config-externalDropTargetSelector} CSS selector to define where drops are allowed
 *
 * See [this demo](../examples/drag-outside) to see this in action.
 *
 * ## Validating drag drop
 *
 * It is easy to programmatically decide what is a valid drag drop operation. Use the {@link #config-validatorFn}
 * and return either `true` / `false` (optionally a message to show to the user).
 *
 * ```javascript
 * features : {
 *     eventDrag : {
 *        validatorFn({ eventRecords, newResource }) {
 *            const task  = eventRecords[0],
 *                  valid = newResource.role === task.resource.role;
 *
 *            return {
 *                valid   : newResource.role === task.resource.role,
 *                message : valid ? '' : 'Resource role does not match required role for this task'
 *            };
 *        }
 *     }
 * }
 * ```
 * See [this demo](../examples/validation) to see validation in action.
 *
 * If you instead want to do a single validation upon drop, you can listen to {@link #event-beforeEventDropFinalize}
 * and set the `valid` flag on the context object provided.
 *
 * ```javascript
 *   const scheduler = new Scheduler({
 *      listeners : {
 *          beforeEventDropFinalize({ context }) {
 *              const { eventRecords } = context;
 *              // Don't allow dropping events in the past
 *              context.valid = Date.now() <= eventRecords[0].startDate;
 *          }
 *      }
 *  });
 * ```
 *
 * ## Preventing drag of certain events
 *
 * To prevent certain events from being dragged, you have two options. You can set {@link Scheduler.model.EventModel#field-draggable}
 * to `false` in your data, or you can listen for the {@link Scheduler.view.Scheduler#event-beforeEventDrag} event and
 * return `false` to block the drag.
 *
 * ```javascript
 * new Scheduler({
 *    listeners : {
 *        beforeEventDrag({ eventRecord }) {
 *            // Don't allow dragging events that have already started
 *            return Date.now() <= eventRecord.startDate;
 *        }
 *    }
 * })
 * ```
 *
 * @extends Scheduler/feature/base/DragBase
 * @demo Scheduler/basic
 * @inlineexample Scheduler/feature/EventDrag.js
 * @classtype eventDrag
 * @feature
 */

class EventDrag extends DragBase {
  //region Config
  static get $name() {
    return 'EventDrag';
  }

  static get defaultConfig() {
    return {
      /**
       * Template used to generate drag tooltip contents.
       * ```
       * const scheduler = new Scheduler({
       *   features : {
       *     eventDrag : {
       *       dragTipTemplate({eventRecord, startText}) {
       *         return `${eventRecord.name}: ${startText}`
       *       }
       *     }
       *   }
       * });
       * ```
       * @config {Function} tooltipTemplate
       * @param {Object} data Tooltip data
       * @param {Scheduler.model.EventModel} data.eventRecord
       * @param {Boolean} data.valid Currently over a valid drop target or not
       * @param {Date} data.startDate New start date
       * @param {Date} data.endDate New end date
       * @returns {String}
       */

      /**
       * Set to true to only allow dragging events within the same resource.
       * @member {Boolean} constrainDragToResource
       */

      /**
       * Set to true to only allow dragging events within the same resource.
       * @config {Boolean}
       * @default
       */
      constrainDragToResource: false,

      /**
       * Set to true to only allow dragging events to different resources, and disallow rescheduling by dragging.
       * @member {Boolean} constrainDragToTimeSlot
       */

      /**
       * Set to true to only allow dragging events to different resources, and disallow rescheduling by dragging.
       * @config {Boolean}
       * @default
       */
      constrainDragToTimeSlot: false,

      /**
       * A CSS selector specifying elements outside the scheduler element which are valid drop targets.
       * @config {String}
       */
      externalDropTargetSelector: null,

      /**
       * An empty function by default, but provided so that you can perform custom validation on
       * the item being dragged. This function is called during the drag and drop process and also after the drop is made.
       * Return true if the new position is valid, false to prevent the drag.
       *
       * ```javascript
       * features : {
       *     eventDrag : {
       *        validatorFn({ eventRecords, newResource }) {
       *            const task  = eventRecords[0],
       *                  valid = newResource.role === task.resource.role;
       *
       *            return {
       *                valid   : newResource.role === task.resource.role,
       *                message : valid ? '' : 'Resource role does not match required role for this task'
       *            };
       *        }
       *     }
       * }
       * ```
       * @param {Object} context A drag drop context object
       * @param {Date} context.startDate New start date
       * @param {Date} context.endDate New end date
       * @param {Scheduler.model.AssignmentModel[]} context.assignmentRecords Assignment records which were dragged
       * @param {Scheduler.model.EventModel[]} context.eventRecords Event records which were dragged
       * @param {Scheduler.model.ResourceModel} context.newResource New resource record
       * @param {Event} event The event object
       * @return {Boolean|Object} `true` if this validation passes, `false` if it does not.
       *
       * Or an object with 2 properties: `valid` -  Boolean `true`/`false` depending on validity,
       * and `message` - String with a custom error message to display when invalid.
       * @config {Function}
       */
      validatorFn: () => {},

      /**
       * The `this` reference for the validatorFn
       * @config {Object}
       */
      validatorFnThisObj: null,

      /**
       * When the host Scheduler is `{@link Scheduler.view.mixin.EventSelection#config-multiEventSelect multiEventSelect}: true`
       * then, there are two modes of dragging *within the same Scheduler*.
       *
       * Non unified means that all selected events are dragged by the same number of resource rows.
       *
       * Unified means that all selected events are collected together and dragged as one, and are all dropped
       * on the same targeted resource row at the same targeted time.
       * @member {Boolean} unifiedDrag
       */

      /**
       * When the host Scheduler is `{@link Scheduler.view.mixin.EventSelection#config-multiEventSelect multiEventSelect}: true`
       * then, there are two modes of dragging *within the same Scheduler*.
       *
       * Non unified means that all selected events are dragged by the same number of resource rows.
       *
       * Unified means that all selected events are collected together and dragged as one, and are all dropped
       * on the same targeted resource row at the same targeted time.
       * @config {Boolean}
       * @default false
       */
      unifiedDrag: null,

      /**
       * A hook that allows manipulating the position the drag proxy snaps to. Manipulate the `snapTo` property
       * to alter snap position.
       *
       * ```javascript
       * const scheduler = new Scheduler({
       *    features : {
       *        eventDrag : {
       *            snapToPosition({ eventRecord, snapTo }) {
       *                if (eventRecord.late) {
       *                    snapTo.x = 400;
       *                }
       *            }
       *        }
       *    }
       * });
       * ```
       *
       * @config {Function}
       * @param {Object} context
       * @param {Scheduler.model.AssignmentModel} context.assignmentRecord Dragged assignment
       * @param {Scheduler.model.EventModel} context.eventRecord Dragged event
       * @param {Scheduler.model.ResourceModel} context.resourceRecord Currently over this resource
       * @param {Date} context.startDate Start date for current position
       * @param {Date} context.endDate End date for current position
       * @param {Object} context.snapTo
       * @param {Number} context.snapTo.x X to snap to
       * @param {Number} context.snapTo.y Y to snap to
       */
      snapToPosition: null
    };
  } //endregion
  //region Events

  /**
   * Fired on the owning Scheduler to allow implementer to use asynchronous finalization by setting `context.async = true`
   * in the listener, to show a confirmation popup etc.
   * ```
   *  scheduler.on('beforeeventdropfinalize', ({ context }) => {
   *      context.async = true;
   *      setTimeout(() => {
   *          // async code don't forget to call finalize
   *          context.finalize();
   *      }, 1000);
   *  })
   * ```
   *
   * For synchronous one-time validation, simply set `context.valid` to true or false.
   * ```
   *  scheduler.on('beforeeventdropfinalize', ({ context }) => {
   *      context.valid = false;
   *  })
   * ```
   * @event beforeEventDropFinalize
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Object} context
   * @param {Boolean} context.async Set true to not finalize the drag-drop operation immediately (e.g. to wait for user confirmation)
   * @param {Scheduler.model.EventModel[]} context.eventRecords Event records being dragged
   * @param {Scheduler.model.AssignmentModel[]} context.assignmentRecords Assignment records being dragged
   * @param {Scheduler.model.EventModel} context.targetEventRecord Event record for drop target
   * @param {Scheduler.model.ResourceModel} context.newResource Resource record for drop target
   * @param {Boolean} context.valid Set this to `false` to abort the drop immediately.
   * @param {Function} context.finalize Call this method after an **async** finalization flow, to finalize the drag-drop operation. This method accepts one
   * argument: pass `true` to update records, or `false` to ignore changes
   */

  /**
   * Fired on the owning Scheduler after event drop
   * @event afterEventDrop
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords
   * @param {Scheduler.model.EventModel[]} eventRecords
   * @param {Boolean} valid
   * @param {Object} context
   */

  /**
   * Fired on the owning Scheduler when an event is dropped
   * @event eventDrop
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.EventModel[]} eventRecords
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords
   * @param {HTMLElement} externalDropTarget The HTML element dropped upon, if drop happened on a valid external drop target
   * @param {Boolean} isCopy
   * @param {Object} context
   * @param {Scheduler.model.EventModel} context.targetEventRecord Event record for drop target
   * @param {Scheduler.model.ResourceModel} context.newResource Resource record for drop target
   */

  /**
   * Fired on the owning Scheduler before event dragging starts. Return `false` to prevent the action.
   * @event beforeEventDrag
   * @on-owner
   * @preventable
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel} eventRecord Event record the drag starts from
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record the drag starts from
   * @param {Scheduler.model.EventModel[]} eventRecords Event records being dragged
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords Assignment records being dragged
   * @param {MouseEvent} event Browser event
   */

  /**
   * Fired on the owning Scheduler when event dragging starts
   * @event eventDragStart
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record the drag starts from
   * @param {Scheduler.model.EventModel[]} eventRecords Event records being dragged
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords Assignment records being dragged
   * @param {MouseEvent} event Browser event
   */

  /**
   * Fired on the owning Scheduler when event is dragged
   * @event eventDrag
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel[]} eventRecords Event records being dragged
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords Assignment records being dragged
   * @param {Date} startDate Start date for the current location
   * @param {Date} endDate End date for the current location
   * @param {Scheduler.model.ResourceModel} newResource Resource at the current location
   */

  /**
   * Fired on the owning Scheduler after an event drag operation has been aborted
   * @event eventDragAbort
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel[]} eventRecords Event records being dragged
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecords Assignment records being dragged
   */

  /**
   * Fired on the owning Scheduler after an event drag operation regardless of the operation being cancelled or not
   * @event eventDragReset
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   */
  //endregion
  //region Data layer
  // Deprecated. Use this.client instead

  get scheduler() {
    return this.client;
  } //endregion
  //region Drag events

  isElementDraggable(el, event) {
    const {
      scheduler
    } = this,
          eventElement = DomHelper.up(el, scheduler.eventSelector),
          {
      eventResize
    } = scheduler.features;

    if (!eventElement || this.disabled) {
      return false;
    } // displaying something resizable within the event?

    if (el.matches('[class$="-handle"]')) {
      return false;
    }

    const // It is possible to click element for non-existing event. It works like this:
    // 1. you drag create event with eventEdit feature turned on
    // 2. you click event element
    // 3. editor loses focus, removes record from the store, but `remove` event is not triggered until project
    // update
    eventRecord = scheduler.resolveEventRecord(eventElement),
          eventResizable = eventRecord === null || eventRecord === void 0 ? void 0 : eventRecord.resizable,
          resizable = eventResizable && // EventResize feature present?
    eventResize && !eventResize.disabled && // Milestones cannot be resized
    !eventRecord.isMilestone && ( // over a virtual handle?
    (eventResizable === true || eventResizable === 'start') && eventResize.isOverStartHandle(event, eventElement) || (eventResizable === true || eventResizable === 'end') && eventResize.isOverEndHandle(event, eventElement));
    return !resizable && !scheduler.readOnly;
  }

  getTriggerParams(dragData) {
    const {
      assignmentRecords,
      eventRecords,
      resourceRecord,
      browserEvent: event
    } = dragData;
    return {
      // `context` is now private, but used in WebSocketHelper
      context: dragData,
      eventRecords,
      resourceRecord,
      assignmentRecords,
      event
    };
  }

  triggerEventDrag(dragData, start) {
    this.scheduler.trigger('eventDrag', Object.assign(this.getTriggerParams(dragData), {
      startDate: dragData.startDate,
      endDate: dragData.endDate,
      newResource: dragData.newResource
    }));
  }

  triggerDragStart(dragData) {
    this.scheduler.navigator.skipNextClick = true;
    this.scheduler.trigger('eventDragStart', this.getTriggerParams(dragData));
  }

  triggerDragAbort(dragData) {
    this.scheduler.trigger('eventDragAbort', this.getTriggerParams(dragData));
  }

  triggerDragAbortFinalized(dragData) {
    this.scheduler.trigger('eventDragAbortFinalized', this.getTriggerParams(dragData));
  }

  triggerAfterDrop(dragData, valid) {
    this.currentOverClient.trigger('afterEventDrop', Object.assign(this.getTriggerParams(dragData), {
      valid
    }));

    if (!valid) {
      // Edge cases:
      // 1. If this drag was a no-op, and underlying data was changed while drag was ongoing (e.g. web socket
      // push), we need to manually force a view refresh to ensure a correct render state
      //
      // or
      // 2. Events were removed before we dropped at an invalid point
      const {
        assignmentStore,
        eventStore
      } = this.client,
            needRefresh = this.dragData.initialAssignmentsState.find(({
        resource,
        assignment
      }, i) => {
        var _this$dragData$assign;

        return !assignmentStore.includes(assignment) || !eventStore.includes(assignment.event) || resource.id !== ((_this$dragData$assign = this.dragData.assignmentRecords[i]) === null || _this$dragData$assign === void 0 ? void 0 : _this$dragData$assign.resourceId);
      });

      if (needRefresh) {
        this.client.refresh();
      }
    }
  } //endregion
  //region Finalization & validation

  /**
   * Checks if an event can be dropped on the specified position.
   * @private
   * @returns {Boolean} Valid (true) or invalid (false)
   */

  isValidDrop(dragData) {
    const {
      newResource,
      resourceRecord
    } = dragData,
          sourceRecord = dragData.draggedEntities[0]; // Only allowed to drop outside scheduler element if we hit an element matching the externalDropTargetSelector

    if (!newResource) {
      return !this.constrainDragToTimeline && this.externalDropTargetSelector ? Boolean(dragData.browserEvent.target.closest(this.externalDropTargetSelector)) : false;
    } // Not allowed to drop an event to group header
    else if (newResource.isSpecialRow) {
      return false;
    } // Not allowed to assign an event twice to the same resource

    if (resourceRecord !== newResource) {
      return !sourceRecord.event.resources.includes(newResource);
    }

    return true;
  }

  checkDragValidity(dragData, event) {
    const me = this,
          scheduler = me.currentOverClient;
    let result; // First make sure there's no overlap, if not run the external validatorFn

    if (!scheduler.allowOverlap && !scheduler.isDateRangeAvailable(dragData.startDate, dragData.endDate, dragData.draggedEntities[0], dragData.newResource)) {
      result = {
        valid: false,
        message: me.L('L{eventOverlapsExisting}')
      };
    } else {
      result = me.validatorFn.call(me.validatorFnThisObj || me, dragData, event);
    }

    return result;
  } //endregion
  //region Update records

  /**
   * Update events being dragged.
   * @private
   * @param context Drag data.
   * @async
   */

  async updateRecords(context) {
    const me = this,
          fromScheduler = me.scheduler,
          toScheduler = me.currentOverClient,
          copyKeyPressed = false;
    let result;

    if (!context.externalDropTarget) {
      fromScheduler.eventStore.suspendAutoCommit();
      toScheduler.eventStore.suspendAutoCommit();
      result = await me.updateAssignments(fromScheduler, toScheduler, context, copyKeyPressed);
      fromScheduler.eventStore.resumeAutoCommit();
      toScheduler.eventStore.resumeAutoCommit();
    } // Tell the world there was a successful drop

    toScheduler.trigger('eventDrop', Object.assign(me.getTriggerParams(context), {
      isCopy: copyKeyPressed,
      event: context.browserEvent,
      targetEventRecord: context.targetEventRecord,
      targetResourceRecord: context.newResource,
      externalDropTarget: context.externalDropTarget
    }));
    return result;
  }
  /**
   * Update assignments being dragged
   * @private
   * @async
   */

  async updateAssignments(fromScheduler, toScheduler, context, copy) {
    // The code is written to emit as few store events as possible
    const me = this,
          isCrossScheduler = fromScheduler !== toScheduler,
          isVertical = toScheduler.mode === 'vertical',
          {
      assignmentStore: fromAssignmentStore,
      eventStore: fromEventStore,
      resourceStore
    } = fromScheduler,
          {
      assignmentStore: toAssignmentStore,
      eventStore: toEventStore,
      resourceStore: toResourceStore
    } = toScheduler,
          {
      eventRecords,
      assignmentRecords,
      timeDiff,
      initialAssignmentsState,
      resourceRecord: fromResource,
      newResource: toResource
    } = context,
          unifiedDrag = me.unifiedDrag,
          event1Date = me.adjustStartDate(assignmentRecords[0].event.startDate, timeDiff),
          eventsToAdd = [],
          eventsToRemove = [],
          assignmentsToAdd = [],
          assignmentsToRemove = [],
          eventsToCheck = [],
          resourcesToRefresh = new Set(),
          eventsToBatch = new Set();
    fromScheduler.suspendRefresh();
    toScheduler.suspendRefresh();
    let updated = false,
        updatedEvent = false,
        indexDiff; // By how many resource rows has the drag moved.

    if (isCrossScheduler) {
      // The difference in indices via first dragged event will help us to find resources for all the rest events accordingly
      indexDiff = toResourceStore.indexOf(toResource) - resourceStore.indexOf(fromResource);
    } else {
      indexDiff = me.constrainDragToResource ? 0 : resourceStore.indexOf(fromResource) - resourceStore.indexOf(toResource);
    }

    if (isVertical) {
      // TODO : Broken after merge, figure it out
      eventRecords.forEach((draggedEvent, i) => {
        const eventBar = context.eventBarEls[i];
        delete draggedEvent.instanceMeta(fromScheduler).hasTemporaryDragElement; // If it was created by a call to scheduler.currentOrientation.addTemporaryDragElement
        // then release it back to be available to DomSync next time the rendered event block
        // is synced.

        if (eventBar.dataset.transient) {
          eventBar.remove();
        }
      });
    }

    const eventBarEls = context.eventBarEls.slice(); // Using for to support await inside

    for (let i = 0; i < assignmentRecords.length; i++) {
      // Reassigned when dropped on other scheduler, thus not const
      let draggedAssignment = assignmentRecords[i],
          draggedEvent = draggedAssignment.event;

      if (!draggedAssignment.isOccurrenceAssignment && (!fromAssignmentStore.includes(draggedAssignment) || !fromEventStore.includes(draggedEvent))) {
        // Event was removed externally during the drag, just remove element from DOM (DomSync already has
        // tried to clean it up at this point, but could not due to retainElement being set)
        eventBarEls[i].remove();
        eventBarEls.splice(i, 1);
        assignmentRecords.splice(i, 1);
        i--;
        continue;
      }

      const initialState = initialAssignmentsState[i],
            originalEventRecord = draggedEvent,
            originalStartDate = initialState.startDate,
            // grabbing resource early, since after ".copy()" the record won't belong to any store
      // and ".getResources()" won't work. If it's a move to another scheduler, ensure the
      // array still has a length. The process function will do an assign as opposed
      // to a reassign
      originalResourceRecord = initialState.resource,
            // Calculate new startDate (and round it) based on timeDiff up here, might be added to another
      // eventstore below in which case it is invalidated. But this is anyway the target date
      newStartDate = this.constrainDragToTimeSlot ? originalStartDate : unifiedDrag ? event1Date : me.adjustStartDate(originalStartDate, timeDiff);
      resourcesToRefresh.add(originalResourceRecord);

      if (copy) {
        draggedAssignment = draggedAssignment.copy(null);
        assignmentsToAdd.push(draggedAssignment);
      } // Dropped on another scheduler, not sharing assignmentStore
      else if (fromAssignmentStore !== toAssignmentStore) {
        const // Single assignment from a multi assigned event dragged over, event needs to be copied over
        keepEvent = originalEventRecord.assignments.length > 1,
              newAssignment = draggedAssignment.copy(); // Remove assignment from source scheduler

        assignmentsToRemove.push(draggedAssignment); // If it was the last assignment, the event should also be removed

        if (!keepEvent) {
          eventsToRemove.push(originalEventRecord);
        } // If event does not already exist in target scheduler a copy is added

        if (!toEventStore.getById(originalEventRecord.id)) {
          // Clone keeping the same id
          const clonedData = Object.assign({}, originalEventRecord.data, {
            id: originalEventRecord.id,
            // Engine gets mad if not nulled
            calendar: null
          });
          draggedEvent = clonedData;
          eventsToAdd.push(clonedData);
        } // And add it to the target scheduler
        // TODO: Should be handled on the data layer ideally

        if (!toEventStore.usesSingleAssignment) {
          assignmentsToAdd.push(newAssignment);
        }

        draggedAssignment = newAssignment;
      }

      let newResource = toResource;

      if (!unifiedDrag) {
        if (!isCrossScheduler) {
          // If not dragging events as a unified block, distribute each to a new resource
          // using the same offset as the dragged event.
          if (indexDiff !== 0) {
            const newIndex = Math.max(Math.min(resourceStore.indexOf(originalResourceRecord) - indexDiff, resourceStore.count - 1), 0);
            newResource = resourceStore.getAt(newIndex);
          } else {
            newResource = originalResourceRecord;
          }
        } // we have a resource for first dragged event in toResource
        else if (i > 0) {
          const draggedEventResourceIndex = originalResourceRecord.resourceStore.indexOf(originalResourceRecord);
          newResource = newResource.resourceStore.getAt(draggedEventResourceIndex + indexDiff) || newResource;
        }
      }

      resourcesToRefresh.add(newResource); // Cannot rely on assignment generation to detect update, since it might be a new assignment

      if (draggedAssignment.resource !== newResource) {
        draggedAssignment.resource = newResource; // Actual events should be batched, not data for new events when dragging between

        draggedEvent.isEvent && eventsToBatch.add(draggedEvent);
        updated = true; // When dragging an occurrence, the assignment is only temporary. We have to tag the newResource along
        // to be picked up by the occurrence -> event conversion
        // TODO: A hack, figure a better way out

        if (draggedEvent.isOccurrence) {
          draggedEvent.set('newResource', newResource);
        } // TODO: Should be handled on the datalayer somehow, but it is kind of edge casey

        if (isCrossScheduler && toEventStore.usesSingleAssignment) {
          // In single assignment mode, when dragged to another scheduler it will not copy the assignment
          // over but instead set the resourceId of the event. To better match expected behaviour
          draggedEvent.resourceId = newResource.id;
        }
      } // Same for event

      if (!eventsToCheck.find(ev => ev.draggedEvent === draggedEvent) && !DateHelper.isEqual(draggedEvent.startDate, newStartDate)) {
        var _draggedEvent$resourc;

        draggedEvent.startDate = newStartDate;
        eventsToCheck.push({
          draggedEvent,
          originalStartDate
        });
        draggedEvent.isEvent && eventsToBatch.add(draggedEvent);
        updatedEvent = true; // When changing date, all assignments are affected so might need to redraw more resources
        // (might be a clone, no resources then)

        (_draggedEvent$resourc = draggedEvent.resources) === null || _draggedEvent$resourc === void 0 ? void 0 : _draggedEvent$resourc.forEach(resource => resourcesToRefresh.add(resource));
      }
    }

    fromAssignmentStore.remove(assignmentsToRemove);
    fromEventStore.remove(eventsToRemove);
    toAssignmentStore.add(assignmentsToAdd);
    const addedEvents = toEventStore.add(eventsToAdd); // When not constrained to timeline we are dragging a clone and need to manually do some cleanup if
    // dropped in view

    if (!me.constrainDragToTimeline) {
      // go through assignmentRecords again after events has been added to toEventStore (if any)
      // now we have updated assignment ids and can properly reuse event HTML elements
      for (let i = 0; i < assignmentRecords.length; i++) {
        const originalDraggedEvent = assignmentRecords[i].event,
              // try to get dragged event from addedEvents array, it will be there with updated ids
        // if toScheduler is different
        draggedEvent = (addedEvents === null || addedEvents === void 0 ? void 0 : addedEvents.find(r => r.id === originalDraggedEvent.id)) || originalDraggedEvent,
              eventBar = context.eventBarEls[i],
              element = i === 0 ? context.context.element : context.context.relatedElements[i - 1],
              // Determine if in time axis here also, since the records date might be invalidated further below
        inTimeAxis = toScheduler.isInTimeAxis(draggedEvent); // Remove original element properly

        DomSync.removeChild(fromScheduler.foregroundCanvas, eventBar);

        if (draggedEvent.resource && toScheduler.rowManager.getRowFor(draggedEvent.resource) && inTimeAxis) {
          const elRect = Rectangle.from(element, toScheduler.foregroundCanvas, true); // Ensure that after inserting the dragged element clone into the toScheduler's foregroundCanvas
          // it's at the same visual position that it was dragged to.

          DomHelper.setTopLeft(element, elRect.y, elRect.x);
          element.classList.remove('b-sch-event-hover', 'b-active', 'b-drag-proxy', 'b-dragging');
          element.retainElement = false; // Add element properly, so that DomSync will reuse it on next update

          DomSync.addChild(toScheduler.foregroundCanvas, element, draggedEvent.assignments[0].id);
        }
      }
    }

    addedEvents === null || addedEvents === void 0 ? void 0 : addedEvents.forEach(added => eventsToBatch.add(added)); // addedEvents order is the same with [context.element, ..context.relatedElements]
    // Any added or removed events or assignments => something changed

    if (assignmentsToRemove.length || eventsToRemove.length || assignmentsToAdd.length || eventsToAdd.length) {
      updated = true;
    } // Commit changes to affected projects

    if (updated || updatedEvent) {
      // By batching event changes when using single assignment we avoid two updates, without it there will be one
      // for date change and one when changed assignment updates resourceId on the event
      toEventStore.usesSingleAssignment && eventsToBatch.forEach(eventRecord => eventRecord.beginBatch());
      await Promise.all([toScheduler.project !== fromScheduler.project ? toScheduler.project.commitAsync() : null, fromScheduler.project.commitAsync()]); // End batch in engine friendly way, avoiding to have `set()` trigger another round of calculations

      toEventStore.usesSingleAssignment && eventsToBatch.forEach(eventRecord => eventRecord.endBatch(false, true));
    }

    if (!updated) {
      // Engine might have reverted the date change, in which case this should be considered an invalid op
      updated = eventsToCheck.some(({
        draggedEvent,
        originalStartDate
      }) => !DateHelper.isEqual(draggedEvent.startDate, originalStartDate));
    } // Resumes self twice if not cross scheduler, but was suspended twice above also so all good

    toScheduler.resumeRefresh();
    fromScheduler.resumeRefresh();

    if (assignmentRecords.length > 0) {
      if (!updated) {
        context.valid = false;
      } else {
        // https://github.com/bryntum/support/issues/630
        // Force re-render when using fillTicks. If date changed within same tick the element wont actually
        // change and since we hijacked it for drag it wont be returned to its original position
        if (toScheduler.fillTicks) {
          eventBarEls.forEach(el => delete el.lastDomConfig);
        } // Not doing full refresh above, to allow for animations

        toScheduler.refreshWithTransition();

        if (isCrossScheduler) {
          fromScheduler.refreshWithTransition();
          toScheduler.selectedEvents = addedEvents;
        }
      }
    }
  } //endregion
  //region Drag data

  getProductDragContext(dragData) {
    const {
      currentOverClient: scheduler
    } = this,
          target = dragData.browserEvent.target,
          targetEventRecord = scheduler === null || scheduler === void 0 ? void 0 : scheduler.resolveEventRecord(target),
          previousResolvedResource = dragData.newResource || dragData.resourceRecord;
    let newResource, externalDropTarget;

    if (this.constrainDragToResource) {
      newResource = dragData.resourceRecord;
    } else if (!this.constrainDragToTimeline) {
      newResource = this.resolveResource();
    } else if (scheduler) {
      newResource = this.resolveResource() || dragData.newResource || dragData.resourceRecord;
    }

    const {
      assignmentRecords,
      eventRecords
    } = dragData,
          isOverNewResource = previousResolvedResource !== newResource;
    let valid = Boolean(newResource && !newResource.isSpecialRow);

    if (!newResource && this.externalDropTargetSelector) {
      externalDropTarget = target.closest(this.externalDropTargetSelector);
      valid = Boolean(externalDropTarget);
    }

    return {
      valid,
      externalDropTarget,
      eventRecords,
      assignmentRecords,
      newResource,
      targetEventRecord,
      dirty: isOverNewResource
    };
  }

  getMinimalDragData(info) {
    const me = this,
          {
      scheduler
    } = me,
          element = me.getElementFromContext(info),
          eventRecord = scheduler.resolveEventRecord(element),
          resourceRecord = scheduler.resolveResourceRecord(element),
          assignmentRecord = scheduler.resolveAssignmentRecord(element),
          assignmentRecords = assignmentRecord ? [assignmentRecord] : []; // We multi drag other selected events if multiEventSelect is set and
    // (the dragged event is already selected, or the ctrl key is pressed)

    if (scheduler.multiEventSelect && assignmentRecord && (scheduler.isAssignmentSelected(assignmentRecords[0]) || me.drag.startEvent.ctrlKey)) {
      assignmentRecords.push.apply(assignmentRecords, me.getRelatedRecords(assignmentRecord));
    }

    const eventRecords = [...new Set(assignmentRecords.map(assignment => assignment.event))];
    return {
      eventRecord,
      resourceRecord,
      assignmentRecord,
      eventRecords,
      assignmentRecords
    };
  }

  setupProductDragData(info) {
    var _dateConstraints;

    const me = this,
          {
      scheduler
    } = me,
          element = me.getElementFromContext(info),
          {
      eventRecord,
      resourceRecord,
      assignmentRecord,
      assignmentRecords
    } = me.getMinimalDragData(info),
          eventBarEls = [];

    if (me.constrainDragToResource && !resourceRecord) {
      throw new Error('Resource could not be resolved for event: ' + eventRecord.id);
    }

    let dateConstraints;

    if (me.constrainDragToTimeline) {
      var _me$getDateConstraint;

      dateConstraints = (_me$getDateConstraint = me.getDateConstraints) === null || _me$getDateConstraint === void 0 ? void 0 : _me$getDateConstraint.call(me, resourceRecord, eventRecord);
      const constrainRectangle = me.constrainRectangle = me.getConstrainingRectangle(dateConstraints, resourceRecord, eventRecord),
            eventRegion = Rectangle.from(element);
      super.setupConstraints(constrainRectangle, eventRegion, scheduler.timeAxisViewModel.snapPixelAmount, Boolean(dateConstraints.start));
    } // Collecting all elements to drag

    assignmentRecords.forEach(assignment => {
      let eventBarEl = scheduler.getElementFromAssignmentRecord(assignment);

      if (!eventBarEl) {
        eventBarEl = scheduler.currentOrientation.addTemporaryDragElement(assignment.event, assignment.resource);
        eventBarEl = eventBarEl.innerElement;
      }

      eventBarEls.push(eventBarEl);
    }); // What is dragged is the wrapper.

    eventBarEls.forEach((el, i) => eventBarEls[i] = el.parentNode);
    return {
      record: assignmentRecord,
      draggedEntities: assignmentRecords,
      dateConstraints: (_dateConstraints = dateConstraints) !== null && _dateConstraints !== void 0 && _dateConstraints.start ? dateConstraints : null,
      eventBarEls
    };
  }

  getDateConstraints(resourceRecord, eventRecord) {
    var _scheduler$getDateCon;

    const {
      scheduler
    } = this,
          externalDateConstraints = (_scheduler$getDateCon = scheduler.getDateConstraints) === null || _scheduler$getDateCon === void 0 ? void 0 : _scheduler$getDateCon.call(scheduler, resourceRecord, eventRecord);
    let minDate, maxDate;

    if (this.constrainDragToTimeSlot) {
      minDate = eventRecord.startDate;
      maxDate = eventRecord.endDate;
    } else if (externalDateConstraints) {
      minDate = externalDateConstraints.start;
      maxDate = externalDateConstraints.end;
    }

    return {
      start: minDate,
      end: maxDate
    };
  }

  getConstrainingRectangle(dateRange, resourceRecord, eventRecord) {
    return this.scheduler.getScheduleRegion(this.constrainDragToResource && resourceRecord, eventRecord, true, dateRange && {
      start: dateRange.startDate,
      end: dateRange.endDate
    });
  }
  /**
   * Initializes drag data (dates, constraints, dragged events etc). Called when drag starts.
   * @private
   * @param info
   * @returns {*}
   */

  getDragData(info) {
    const dragData = this.getMinimalDragData(info) || {};
    return _objectSpread2(_objectSpread2(_objectSpread2({}, super.getDragData(info)), dragData), {}, {
      initialAssignmentsState: dragData.assignmentRecords.map(assignment => ({
        startDate: assignment.event.startDate,
        resource: assignment.resource,
        assignment
      }))
    });
  }
  /**
   * Provide your custom implementation of this to allow additional selected records to be dragged together with the original one.
   * @param {Scheduler.model.AssignmentModel} assignmentRecord The assignment about to be dragged
   * @return {Scheduler.model.AssignmentModel[]} An array of assignment records to drag together with the original
   */

  getRelatedRecords(assignmentRecord) {
    return this.scheduler.selectedAssignments.filter(selectedRecord => selectedRecord !== assignmentRecord && selectedRecord.event.isDraggable);
  }
  /**
   * Get correct axis coordinate depending on schedulers mode (horizontal -> x, vertical -> y). Also takes milestone
   * layout into account.
   * @private
   * @param {Scheduler.model.EventModel} eventRecord Record being dragged
   * @param {HTMLElement} element Element being dragged
   * @param {Number[]} coord XY coordinates
   * @returns {Number|Number[]} X,Y or XY
   */

  getCoordinate(eventRecord, element, coord) {
    const scheduler = this.currentOverClient;

    if (scheduler.isHorizontal) {
      let x = coord[0]; // Adjust coordinate for milestones if using a layout mode, since they are aligned differently than events

      if (scheduler.milestoneLayoutMode !== 'default' && eventRecord.isMilestone) {
        switch (scheduler.milestoneAlign) {
          case 'center':
            x += element.offsetWidth / 2;
            break;

          case 'end':
            x += element.offsetWidth;
            break;
        }
      }

      return x;
    } else {
      let y = coord[1]; // Adjust coordinate for milestones if using a layout mode, since they are aligned differently than events

      if (scheduler.milestoneLayoutMode !== 'default' && eventRecord.isMilestone) {
        switch (scheduler.milestoneAlign) {
          case 'center':
            y += element.offsetHeight / 2;
            break;

          case 'end':
            y += element.offsetHeight;
            break;
        }
      }

      return y;
    }
  }
  /**
   * Get resource record occluded by the drag proxy.
   * @private
   * @returns {Scheduler.model.ResourceModel}
   */

  resolveResource() {
    const element = this.dragData.dragProxy || this.dragData.context.element,
          client = this.currentOverClient,
          {
      isHorizontal
    } = client,
          {
      context
    } = this.dragData,
          // Page coords for elementFromPoint
    pageRect = Rectangle.from(element, null, true),
          y = client.isVertical || this.unifiedDrag ? context.clientY : pageRect.center.y,
          // Local coords to resolve resource in vertical
    localRect = Rectangle.from(element, client.timeAxisSubGridElement, true),
          {
      x: lx,
      y: ly
    } = localRect.center;
    let resource = null;

    if (client.element.contains(this.dragData.browserEvent.target)) {
      // This is benchmarked as the fastest way to find a Grid Row from a viewport Y coordinate
      // so use it in preference to elementFromPoint (which causes a forced synchronous layout) in horizontal mode.
      if (isHorizontal) {
        const row = client.rowManager.getRowAt(y);
        resource = row && client.resourceStore.getAt(row.dataIndex);
      } else {
        // In vertical mode, just use the X coordinate to find out which resource we are under.
        // The method requires that a .b-sch-timeaxis-cell element be passed.
        // There is only one in vertical mode, so use that.
        resource = client.resolveResourceRecord(client.timeAxisSubGridElement.querySelector('.b-sch-timeaxis-cell'), [lx, ly]);
      }
    }

    return resource;
  } //endregion
  //region Other stuff

  adjustStartDate(startDate, timeDiff) {
    const scheduler = this.currentOverClient;
    return scheduler.timeAxis.roundDate(new Date(startDate - 0 + timeDiff), scheduler.snapRelativeToEventStartDate ? startDate : false);
  }

  getRecordElement(assignmentRecord) {
    return this.scheduler.getElementFromAssignmentRecord(assignmentRecord, true);
  } //endregion

}
EventDrag._$name = 'EventDrag';
GridFeatureManager.registerFeature(EventDrag, true, 'Scheduler');
GridFeatureManager.registerFeature(EventDrag, false, 'ResourceHistogram');

/**
 * @module Scheduler/feature/EventDragCreate
 */

/**
 * Feature that allows the user to create new events by dragging in empty parts of the scheduler rows.
 *
 * This feature is **enabled** by default
 *
 * **NOTE:** Incompatible with the {@link Scheduler.feature.EventDragSelect EventDragSelect} and
 * {@link Scheduler.feature.Pan Pan} features. If either of those features are enabled, this feature has no effect.
 *
 * @extends Scheduler/feature/base/DragCreateBase
 * @demo Scheduler/basic
 * @inlineexample Scheduler/feature/EventDragCreate.js
 * @classtype eventDragCreate
 * @feature
 */

class EventDragCreate extends DragCreateBase {
  //region Config
  static get $name() {
    return 'EventDragCreate';
  }

  static get configurable() {
    return {
      /**
       * An empty function by default, but provided so that you can perform custom validation on the event being created.
       * Return true if the new event is valid, false to prevent an event being created.
       * @param {Object} context A drag create context
       * @param {Date} context.startDate Event start date
       * @param {Date} context.endDate Event end date
       * @param {Scheduler.model.EventModel} context.record Event record
       * @param {Scheduler.model.ResourceModel} context.resourceRecord Resource record
       * @param {Event} event The event object
       * @return {Boolean} `true` if this validation passes
       * @config {function}
       */
      validatorFn: () => true,

      /**
       * Locks the layout during drag create, overriding the default behaviour that uses the same rendering
       * pathway for drag creation as for already existing events.
       *
       * This more closely resembles the behaviour of versions prior to 4.2.0.
       *
       * @config {Boolean}
       * @default
       */
      lockLayout: false
    };
  } //endregion
  //region Events

  /**
   * Fires on the owning Scheduler after the new event has been created.
   * @event dragCreateEnd
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.EventModel} eventRecord The new `EventModel` record.
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource for the row in which the event is being created.
   * @param {MouseEvent} event The ending mouseup event.
   * @param {HTMLElement} eventElement The DOM element representing the newly created event un the UI.
   */

  /**
   * Fires on the owning Scheduler at the beginning of the drag gesture
   * @event beforeDragCreate
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @param {Date} date The datetime associated with the drag start point.
   */

  /**
   * Fires on the owning Scheduler after the drag start has created a proxy element.
   * @event dragCreateStart
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.EventModel} eventRecord The event record being created
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {HTMLElement} eventElement The element representing the new event.
   */

  /**
   * Fires on the owning Scheduler to allow implementer to prevent immediate finalization by setting `data.context.async = true`
   * in the listener, to show a confirmation popup etc
   * ```
   *  scheduler.on('beforedragcreatefinalize', ({context}) => {
   *      context.async = true;
   *      setTimeout(() => {
   *          // async code don't forget to call finalize
   *          context.finalize();
   *      }, 1000);
   *  })
   * ```
   * @event beforeDragCreateFinalize
   * @on-owner
   * @param {Scheduler.view.Scheduler} source Scheduler instance
   * @param {Scheduler.model.EventModel} eventRecord The event record being created
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {HTMLElement} eventElement Proxy element, representing future event
   * @param {Object} context
   * @param {Boolean} context.async Set true to handle drag create asynchronously (e.g. to wait for user
   * confirmation)
   * @param {Function} context.finalize Call this method to finalize drag create. This method accepts one
   * argument: pass true to update records, or false, to ignore changes
   */

  /**
   * Fires on the owning Scheduler at the end of the drag create gesture whether or not
   * a new event was created by the gesture.
   * @event afterDragCreate
   * @on-owner
   * @param {Scheduler.view.Scheduler} source
   * @param {Scheduler.model.EventModel} eventRecord The event record being created
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {HTMLElement} eventElement The element representing the created event record
   */
  //endregion
  //region Init

  /* @private */

  construct(scheduler, config) {
    this.scheduler = scheduler;
    super.construct(scheduler, config);
  }

  get store() {
    return this.scheduler.eventStore;
  }

  updateLockLayout(lock) {
    this.dragActiveCls = 'b-dragcreating' + (lock ? ' b-dragcreate-lock' : '');
  } //endregion
  //region Scheduler specific implementation

  handleBeforeDragCreate(drag, eventRecord, event) {
    var _scheduler$getDateCon;

    const {
      resourceRecord
    } = drag,
          {
      scheduler
    } = this,
          // For resources with a calendar, ensure the date is inside a working time range
    isWorkingTime = !scheduler.isSchedulerPro || resourceRecord.isWorkingTime(drag.mousedownDate),
          result = isWorkingTime && scheduler.trigger('beforeDragCreate', {
      resourceRecord,
      date: drag.mousedownDate,
      event
    }); // Save date constraints

    this.dateConstraints = (_scheduler$getDateCon = scheduler.getDateConstraints) === null || _scheduler$getDateCon === void 0 ? void 0 : _scheduler$getDateCon.call(scheduler, resourceRecord, eventRecord);
    return result;
  }

  dragStart(drag) {
    var _client$onEventCreate;

    const me = this,
          {
      client
    } = me,
          {
      eventStore,
      assignmentStore,
      enableEventAnimations
    } = client,
          {
      resourceRecord
    } = drag,
          eventRecord = me.createEventRecord(drag),
          resourceRecords = [resourceRecord];
    eventRecord.set('duration', DateHelper.diff(eventRecord.startDate, eventRecord.endDate, eventRecord.durationUnit, true)); // It's only a provisional event until gesture is completed (possibly longer if an editor dialog is shown after)

    eventRecord.isCreating = true; // Flag used by rendering to not draw a zero length event being drag created as a milestone

    eventRecord.meta.isDragCreating = true; // Date to flip around when changing direction

    drag.initialDate = eventRecord.get(this.draggingEnd ? 'startDate' : 'endDate'); // This presents the event to be scheduled for validation at the proposed mouse/date point
    // If rejected, we cancel operation

    if (me.handleBeforeDragCreate(drag, eventRecord, drag.event) === false) {
      return false;
    } // Vetoable beforeEventAdd allows cancel of this operation

    if (client.trigger('beforeEventAdd', {
      eventRecord,
      resourceRecords
    }) === false) {
      assignmentStore.unassignEventFromResource(eventRecord, resourceRecord);
      eventStore.remove(eventRecord);
      return false;
    } // If we're drag-creating in a resource-based view...
    // Assign resource before toggling isCreating to process assignments

    if (resourceRecord) {
      assignmentStore.assignEventToResource(eventRecord, resourceRecord);
    } // When configured to lock layout during drag create, set a flag that HorizontalRendering will pick up to
    // exclude the new event from the layout calculations. It will then be at the topmost position in the "cell"

    if (me.lockLayout) {
      eventRecord.meta.excludeFromLayout = true;
    }

    (_client$onEventCreate = client.onEventCreated) === null || _client$onEventCreate === void 0 ? void 0 : _client$onEventCreate.call(client, eventRecord);
    client.enableEventAnimations = false;
    eventStore.addAsync(eventRecord).then(() => client.enableEventAnimations = enableEventAnimations); // Element must be created synchronously, not after the project's normalizing delays.
    // Overrides the check for isEngineReady in VerticalRendering so that the newly added record
    // will be rendered when we call refreshRows.

    client.isCreating = true;
    client.refreshRows();
    client.isCreating = false; // Set the element we are dragging

    drag.itemElement = drag.element = client.getElementFromEventRecord(eventRecord);
    return super.dragStart(drag);
  }

  checkValidity(context, event) {
    const me = this,
          {
      client
    } = me; // Nicer for users of validatorFn

    context.resourceRecord = me.dragging.resourceRecord;
    return (client.allowOverlap || client.isDateRangeAvailable(context.startDate, context.endDate, context.eventRecord, context.resourceRecord)) && me.createValidatorFn.call(me.validatorFnThisObj || me, context, event);
  } // Determine if resource already has events or not

  isRowEmpty(resourceRecord) {
    const events = this.store.getEventsForResource(resourceRecord);
    return !events || !events.length;
  } //endregion

  triggerBeforeFinalize(event) {
    this.client.trigger(`beforeDragCreateFinalize`, event);
  }
  /**
   * Creates an event by the event object coordinates
   * @param {Object} drag The Bryntum event object
   * @private
   */

  createEventRecord(drag) {
    const me = this,
          {
      client
    } = me,
          dimension = client.isHorizontal ? 'X' : 'Y',
          {
      timeAxis,
      eventStore,
      weekStartDay
    } = client,
          {
      event,
      mousedownDate
    } = drag,
          draggingEnd = me.draggingEnd = event[`page${dimension}`] > drag.startEvent[`page${dimension}`],
          eventConfig = {
      name: eventStore.modelClass.fieldMap.name.defaultValue || me.L('L{Object.newEvent}'),
      startDate: draggingEnd ? DateHelper.floor(mousedownDate, timeAxis.resolution, null, weekStartDay) : mousedownDate,
      endDate: draggingEnd ? mousedownDate : DateHelper.ceil(mousedownDate, timeAxis.resolution, null, weekStartDay)
    }; // if project model has been imported from Gantt, we have to define constraint data directly to correct
    // auto-scheduling while dragCreate

    if (client.project.isGanttProjectMixin) {
      ObjectHelper.assign(eventConfig, {
        constraintDate: eventConfig.startDate,
        constraintType: 'startnoearlierthan'
      });
    }

    return eventStore.createRecord(eventConfig);
  }

  async finalizeDragCreate(context) {
    const {
      features
    } = this.client,
          {
      meta
    } = context.eventRecord,
          eventEditAvailable = Boolean(features.eventEdit && !features.eventEdit.disabled || features.taskEdit && !features.taskEdit.disabled || features.simpleEventEdit && !features.simpleEventEdit.disabled); // Remove the layout lock flag, event will jump into place as part of the finalization

    meta.excludeFromLayout = false; // Also allow new event to become a milestone now

    meta.isDragCreating = false;

    if (!eventEditAvailable) {
      meta.isCreating = false;
    }

    return super.finalizeDragCreate(context);
  }

  getTipHtml(...args) {
    const html = super.getTipHtml(...args),
          {
      element
    } = this.tip;
    element.classList.add('b-sch-dragcreate-tooltip');
    element.classList.toggle('b-too-narrow', this.dragging.context.tooNarrow);
    return html;
  }

  onAborted(context) {
    var _this$store$unassignE, _this$store;

    const {
      eventRecord,
      resourceRecord
    } = context; // The product this is being used in may not have resources.

    (_this$store$unassignE = (_this$store = this.store).unassignEventFromResource) === null || _this$store$unassignE === void 0 ? void 0 : _this$store$unassignE.call(_this$store, eventRecord, resourceRecord);
    this.store.remove(eventRecord);
  }

}
EventDragCreate._$name = 'EventDragCreate';
GridFeatureManager.registerFeature(EventDragCreate, true, 'Scheduler');
GridFeatureManager.registerFeature(EventDragCreate, false, 'ResourceHistogram');

/**
 * @module Scheduler/feature/EventTooltip
 */

/**
 * Displays a tooltip when hovering events. The template used to render the tooltip can be customized, see {@link #config-template}.
 * Config options are also applied to the tooltip shown, see {@link Core.widget.Tooltip} for available options.
 *
 * ## Showing local data
 * To show a basic "local" tooltip (with data available in the Event record) upon hover:
 * ```javascript
 * new Scheduler({
 *   features : {
 *     eventTooltip : {
 *         // Tooltip configs can be used here
 *         align : 'l-r' // Align left to right,
 *         // A custom HTML template
 *         template : data => `<dl>
 *           <dt>Assigned to:</dt>
 *              <dt>Time:</dt>
 *              <dd>
 *                  ${DateHelper.format(data.eventRecord.startDate, 'LT')} - ${DateHelper.format(data.eventRecord.endDate, 'LT')}
 *              </dd>
 *              ${data.eventRecord.get('note') ? `<dt>Note:</dt><dd>${data.eventRecord.note}</dd>` : ''}
 *
 *              ${data.eventRecord.get('image') ? `<dt>Image:</dt><dd><img class="image" src="${data.eventRecord.get('image')}"/></dd>` : ''}
 *          </dl>`
 *     }
 *   }
 * });
 * ```
 *
 * ## Showing remotely loaded data
 * Loading remote data into the event tooltip is easy. Simply use the {@link #config-template} and return a Promise which yields the content to show.
 * ```javascript
 * new Scheduler({
 *   features : {
 *     eventTooltip : {
 *        template : ({ eventRecord }) => AjaxHelper.get(`./fakeServer?name=${eventRecord.name}`).then(response => response.text())
 *     }
 *   }
 * });
 * ```
 * This feature is **enabled** by default
 *
 * By default, the tooltip {@link Core.widget.Widget#config-scrollAction realigns on scroll}
 * meaning that it will stay aligned with its target should a scroll interaction make the target move.
 *
 * If this is causing performance issues in a Scheduler, such as if there are many dozens of events
 * visible, you can configure this feature with `scrollAction: 'hide'`. This feature's configuration is
 * applied to the tooltip, so that will mean that the tooltip will hide if its target is moved by a
 * scroll interaction.
 *
 * @extends Scheduler/feature/base/TooltipBase
 * @demo Scheduler/basic
 * @inlineexample Scheduler/feature/EventTooltip.js
 * @classtype eventTooltip
 * @feature
 */

class EventTooltip extends TooltipBase {
  //region Config
  static get $name() {
    return 'EventTooltip';
  }

  static get defaultConfig() {
    return {
      /**
       * A function which receives data about the event and returns a string,
       * or a Promise yielding a string (for async tooltips), to be displayed in the tooltip.
       * This method will be called with an object containing the fields below
       * @param {Object} data
       * @param {Scheduler.model.EventModel} data.eventRecord
       * @param {Date} data.startDate
       * @param {Date} data.endDate
       * @param {String} data.startText
       * @param {String} data.endText
       * @config {Function} template
       */
      template: data => `
                ${data.eventRecord.name ? StringHelper.xss`<div class="b-sch-event-title">${data.eventRecord.name}</div>` : ''}
                ${data.startClockHtml}
                ${data.endClockHtml}`,
      cls: 'b-sch-event-tooltip',
      monitorRecordUpdate: true,

      /**
       * Defines what to do if document is scrolled while the tooltip is visible.
       *
       * Valid values: ´null´: do nothing, ´hide´: hide the tooltip or ´realign´: realign to the target if possible.
       *
       * @config {String}
       * @default
       */
      scrollAction: 'hide'
    };
  } //endregion

  construct(client, config) {
    const me = this;
    super.construct(client, config);

    if (typeof me.align === 'string') {
      me.align = {
        align: me.align
      };
    }
  }

  onPaint({
    firstPaint
  }) {
    super.onPaint(...arguments);

    if (firstPaint) {
      const me = this,
            dependencies = me.client.features.dependencies;

      if (dependencies) {
        const configuredOffset = me.align.offset;
        me.tooltip.on('beforeshow', ({
          source: tooltip
        }) => {
          // Don't let dependency terminal interfere with this tooltip
          if (!dependencies.disabled) {
            tooltip.align.offset = [0, 10];
          } else {
            tooltip.align.offset = configuredOffset;
          }
        });
      }
    }
  }

}
EventTooltip._$name = 'EventTooltip';
GridFeatureManager.registerFeature(EventTooltip, true, 'Scheduler');
GridFeatureManager.registerFeature(EventTooltip, false, 'ResourceHistogram');

/**
 * @module Scheduler/feature/StickyEvents
 */

const zeroMargins = {
  width: 0,
  height: 0
};
/**
 * This feature applies native `position: sticky` to event contents in horizontal mode, keeping the contents in view as
 * long as possible on scroll. For vertical mode it uses a programmatic solution to achieve the same result.
 *
 * Assign `eventRecord.stickyContents = false` to disable stickiness on a per event level (docs for
 * {@link Scheduler/model/EventModel#field-stickyContents}).
 *
 * This feature is **enabled** by default.
 *
 * @extends Core/mixin/InstancePlugin
 * @classtype stickyEvents
 * @feature
 */

class StickyEvents extends InstancePlugin {
  construct(scheduler, config) {
    super.construct(scheduler, config);

    if (scheduler.isVertical) {
      this.toUpdate = new Set();
      scheduler.on({
        scroll: 'onSchedulerScroll',
        thisObj: this,
        prio: 10000
      });
    }
  }

  onEventDataGenerated(renderData) {
    if (this.client.isHorizontal) {
      renderData.wrapperCls['b-disable-sticky'] = renderData.eventRecord.stickyContents === false;
    } else {
      this.syncEventContentPosition(renderData, undefined, true);
      this.updateStyles();
    }
  } //region Vertical mode

  onSchedulerScroll() {
    if (!this.disabled) {
      this.verticalSyncAllEventsContentPosition(this.client);
    }
  }

  updateStyles() {
    for (const {
      contentEl,
      style
    } of this.toUpdate) {
      DomHelper.applyStyle(contentEl, style);
    }

    this.toUpdate.clear();
  }

  verticalSyncAllEventsContentPosition(scheduler) {
    const {
      resourceMap
    } = scheduler.currentOrientation;

    for (const eventsData of resourceMap.values()) {
      for (const {
        renderData,
        elementConfig
      } of Object.values(eventsData)) {
        const args = [renderData];

        if (elementConfig && renderData.eventRecord.isResourceTimeRange) {
          args.push(elementConfig.children[0]);
        }

        this.syncEventContentPosition.apply(this, args);
      }
    }

    this.toUpdate.size && this.updateStyles();
  }

  syncEventContentPosition(renderData, eventContent = renderData.eventContent, duringGeneration = false) {
    if (this.disabled || // Allow client disable stickiness for certain events
    renderData.eventRecord.stickyContents === false) {
      return;
    }

    const {
      client
    } = this,
          {
      eventRecord,
      resourceRecord,
      useEventBuffer,
      bufferAfterWidth,
      bufferBeforeWidth,
      top,
      height
    } = renderData,
          scrollPosition = client.scrollable.y,
          wrapperEl = duringGeneration ? null : client.getElementFromEventRecord(eventRecord, resourceRecord, true),
          contentEl = wrapperEl && DomSync.getChild(wrapperEl, 'event.content'),
          meta = eventRecord.instanceMeta(client),
          style = typeof eventContent.style === 'string' ? eventContent.style = DomHelper.parseStyle(eventContent.style) : eventContent.style || (eventContent.style = {}); // Do not process events being dragged

    if (wrapperEl !== null && wrapperEl !== void 0 && wrapperEl.classList.contains('b-dragging')) {
      return;
    }

    let start = top,
        contentSize = height,
        end = start + contentSize;

    if (useEventBuffer) {
      start += bufferBeforeWidth;
      contentSize = contentSize - bufferBeforeWidth - bufferAfterWidth;
      end = start + contentSize;
    } // Only process non-milestones that are partially out of view

    if (start < scrollPosition && end >= scrollPosition && !eventRecord.isMilestone) {
      const contentWidth = contentEl === null || contentEl === void 0 ? void 0 : contentEl.offsetWidth,
            justify = (contentEl === null || contentEl === void 0 ? void 0 : contentEl.parentNode) && DomHelper.getStyleValue(contentEl.parentNode, 'justifyContent'),
            c = justify === 'center' ? (renderData.width - contentWidth) / 2 : 0,
            eventStart = start,
            eventEnd = eventStart + contentSize - 1; // Only process non-milestone events. Milestones have no width.
      // If there's no offsetWidth, it's still b-released, so we cannot measure it.
      // If the event starts off the left edge, but its right edge is still visible,
      // translate the contentEl to compensate. If not, undo any translation.

      if ((!contentEl || contentWidth) && eventStart < scrollPosition && eventEnd >= scrollPosition) {
        const edgeSizes = this.getEventContentMargins(contentEl),
              maxOffset = contentEl ? contentSize - contentEl.offsetHeight - edgeSizes.height - c : Number.MAX_SAFE_INTEGER,
              offset = Math.min(scrollPosition - eventStart, maxOffset - 2);
        style.transform = offset > 0 ? `translateY(${offset}px)` : '';
        meta.stuck = true;
      } else {
        style.transform = '';
        meta.stuck = false;
      }

      if (contentEl) {
        this.toUpdate.add({
          contentEl,
          style
        });
      }
    } else if (contentEl && meta.stuck) {
      style.transform = '';
      meta.stuck = false;
      this.toUpdate.add({
        contentEl,
        style
      });
    }
  } // Only measure the margins of an event's contentEl once

  getEventContentMargins(contentEl) {
    if (contentEl !== null && contentEl !== void 0 && contentEl.classList.contains('b-sch-event-content')) {
      return DomHelper.getEdgeSize(contentEl, 'margin');
    }

    return zeroMargins;
  } //endregion

  doDisable() {
    super.doDisable(...arguments);

    if (!this.isConfiguring) {
      this.client.refreshWithTransition();
    }
  }

}

_defineProperty(StickyEvents, "$name", 'StickyEvents');

_defineProperty(StickyEvents, "type", 'stickyEvents');

_defineProperty(StickyEvents, "pluginConfig", {
  chain: ['onEventDataGenerated']
});

StickyEvents._$name = 'StickyEvents';
GridFeatureManager.registerFeature(StickyEvents, true, 'Scheduler');
GridFeatureManager.registerFeature(StickyEvents, false, 'ResourceHistogram');

/**
 * @module Scheduler/view/mixin/SchedulerDom
 */

/**
 * Mixin with EventModel and ResourceModel <-> HTMLElement mapping functions
 *
 * @mixin
 */

var SchedulerDom = (Target => class SchedulerDom extends (Target || Base) {
  static get $name() {
    return 'SchedulerDom';
  } //region Get

  /**
   * Returns a single HTMLElement representing an event record assigned to a specific resource.
   * @param {Scheduler.model.AssignmentModel} assignmentRecord An assignment record
   * @return {HTMLElement} The element representing the event record
   */

  getElementFromAssignmentRecord(assignmentRecord, returnWrapper = false) {
    return this.currentOrientation.getElementFromAssignmentRecord(assignmentRecord, returnWrapper);
  }
  /**
   * Returns a single HTMLElement representing an event record assigned to a specific resource.
   * @param {Scheduler.model.EventModel} eventRecord An event record
   * @param {Scheduler.model.ResourceModel} resourceRecord A resource record
   * @return {HTMLElement} The element representing the event record
   */

  getElementFromEventRecord(eventRecord, resourceRecord, returnWrapper = false) {
    if (eventRecord.isResourceTimeRange) {
      var _this$foregroundCanva;

      const wrapper = (_this$foregroundCanva = this.foregroundCanvas.syncIdMap) === null || _this$foregroundCanva === void 0 ? void 0 : _this$foregroundCanva[eventRecord.domId];
      return returnWrapper ? wrapper : wrapper === null || wrapper === void 0 ? void 0 : wrapper.syncIdMap.event;
    }

    return this.currentOrientation.getElementFromEventRecord(eventRecord, resourceRecord, returnWrapper);
  }
  /**
   * Returns all the HTMLElements representing an event record.
   *
   * @param {Scheduler.model.EventModel} eventRecord An event record
   * @param {Scheduler.model.ResourceModel} [resourceRecord] A resource record
   *
   * @return {HTMLElement[]} The element(s) representing the event record
   */

  getElementsFromEventRecord(eventRecord, resourceRecord, returnWrapper = false) {
    return this.currentOrientation.getElementsFromEventRecord(eventRecord, resourceRecord, returnWrapper);
  } //endregion
  //region Resolve

  /**
   * Resolves the resource based on a dom element or event. In vertical mode, if resolving from an element higher up in
   * the hierarchy than event elements, then it is required to supply an coordinates since resources are virtual
   * columns.
   * @param {HTMLElement|Event} elementOrEvent The HTML element or DOM event to resolve a resource from
   * @param {Number[]} [xy] X and Y coordinates, required in some cases in vertical mode, disregarded in horizontal
   * @return {Scheduler.model.ResourceModel} The resource corresponding to the element, or null if not found.
   */

  resolveResourceRecord(elementOrEvent, xy) {
    return this.currentOrientation.resolveRowRecord(elementOrEvent, xy);
  }
  /**
   * Returns the event record for a DOM element
   * @param {HTMLElement} element The DOM node to lookup
   * @return {Scheduler.model.EventModel} The event record
   */

  resolveEventRecord(element) {
    element = DomHelper.up(element, this.eventSelector);

    if (element) {
      if (element.dataset.eventId) {
        return this.eventStore.getById(element.dataset.eventId);
      }

      if (element.dataset.assignmentId) {
        return this.assignmentStore.getById(element.dataset.assignmentId).event;
      }
    }

    return null;
  } // Used by shared features to resolve an event or task

  resolveTimeSpanRecord(element) {
    return this.resolveEventRecord(element);
  }
  /**
   * Returns an assignment record for a DOM element
   * @param {HTMLElement} element The DOM node to lookup
   * @return {Scheduler.model.AssignmentModel} The assignment record
   */

  resolveAssignmentRecord(element) {
    const eventElement = DomHelper.up(element, this.eventSelector),
          assignmentRecord = eventElement && this.assignmentStore.getById(eventElement.dataset.assignmentId),
          eventRecord = eventElement && this.eventStore.getById(eventElement.dataset.eventId); // When resolving a recurring event, we might be resolving an occurrence

    return this.assignmentStore.getOccurrence(assignmentRecord, eventRecord);
  } //endregion
  // Decide if a record is inside a collapsed tree node, or inside a collapsed group (using grouping feature)

  isRowVisible(resourceRecord) {
    // records in collapsed groups/branches etc are removed from processedRecords
    return this.store.indexOf(resourceRecord) >= 0;
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module Scheduler/view/mixin/SchedulerDomEvents
 */

/**
 * Mixin that handles dom events (click etc) for scheduler and rendered events.
 *
 * @mixin
 */

var SchedulerDomEvents = (Target => class SchedulerDomEvents extends (Target || Base) {
  static get $name() {
    return 'SchedulerDomEvents';
  } //region Events

  /**
   * Triggered when user moves mouse over an empty area in the schedule.
   * @event scheduleMouseMove
   * @param {Scheduler.view.TimelineBase} source This TimelineBase
   * @param {Date} date Date at mouse position
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Clicked row (in horizontal mode only)
   * @param {Number} index Index of clicked resource
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */

  /**
   * Triggered when user clicks an empty area in the schedule.
   * @event scheduleClick
   * @param {Scheduler.view.TimelineBase} source This TimelineBase
   * @param {Date} date Date at mouse position
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Clicked row (in horizontal mode only)
   * @param {Number} index Index of clicked resource
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */

  /**
   * Triggered when user clicks an empty area in the schedule.
   * @event scheduleDblClick
   * @param {Scheduler.view.TimelineBase} source This TimelineBase
   * @param {Date} date Date at mouse position
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Double clicked row (in horizontal mode only)
   * @param {Number} index Index of double clicked resource
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */

  /**
   * Triggered when user right clicks an empty area in the schedule.
   * @event scheduleContextMenu
   * @param {Scheduler.view.TimelineBase} source This TimelineBase
   * @param {Date} date Date at mouse position
   * @param {Date} tickStartDate The start date of the current time axis tick
   * @param {Date} tickEndDate The end date of the current time axis tick
   * @param {Grid.row.Row} row Clicked row (in horizontal mode only)
   * @param {Number} index Index of clicked resource
   * @param {Scheduler.model.ResourceModel} resourceRecord Resource record
   * @param {MouseEvent} event Browser event
   */

  /**
   * Triggered for mouse down on an event.
   * @event eventMouseDown
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */

  /**
   * Triggered for mouse up on an event.
   * @event eventMouseUp
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */

  /**
   * Triggered for click on an event.
   * @event eventClick
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */

  /**
   * Triggered for double click on an event.
   * @event eventDblClick
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */

  /**
   * Triggered for right click on an event.
   * @event eventContextMenu
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */

  /**
   * Triggered for mouse over on an event.
   * @event eventMouseOver
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */

  /**
   * Triggered for mouse out from an event.
   * @event eventMouseOut
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord Event record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord Assignment record
   * @param {MouseEvent} event Browser event
   */
  //endregion
  //region Event handling

  getTimeSpanMouseEventParams(eventElement, event) {
    // May have hovered a record being removed / faded out
    const eventRecord = this.resolveEventRecord(eventElement);
    return eventRecord && {
      eventRecord,
      resourceRecord: this.resolveResourceRecord(eventElement),
      assignmentRecord: this.resolveAssignmentRecord(eventElement),
      eventElement,
      event
    };
  }

  getScheduleMouseEventParams(cellData, event) {
    const resourceRecord = this.isVertical ? this.resolveResourceRecord(event) : this.store.getById(cellData.id);
    return {
      resourceRecord
    };
  }
  /**
   * Relays keydown events as eventkeydown if we have a selected task.
   * @private
   */

  onElementKeyDown(event) {
    const result = super.onElementKeyDown(event),
          me = this;

    if (me.selectedEvents.length) {
      me.trigger(me.scheduledEventName + 'KeyDown', {
        eventRecords: me.selectedEvents,
        assignmentRecords: me.selectedAssignments,
        event,
        // TODO REMOVE FOR 5.0
        eventRecord: me.selectedEvents,
        assignmentRecord: me.selectedAssignments
      });
    }

    return result;
  }
  /**
   * Relays keyup events as eventkeyup if we have a selected task.
   * @private
   */

  onElementKeyUp(event) {
    super.onElementKeyUp(event);
    const me = this;

    if (me.selectedEvents.length) {
      me.trigger(me.scheduledEventName + 'KeyUp', {
        eventRecords: me.selectedEvents,
        assignmentRecords: me.selectedAssignments,
        event,
        // TODO REMOVE FOR 5.0
        eventRecord: me.selectedEvents,
        assignmentRecord: me.selectedAssignments
      });
    }
  } //endregion
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module Scheduler/view/mixin/SchedulerEventRendering
 */

/**
 * Layout data object used to render an event record.
 * @typedef {Object} EventRenderData
 * @property {Scheduler.model.EventModel} eventRecord Event instance
 * @property {Scheduler.model.ResourceModel} resourceRecord Assigned resource
 * @property {Scheduler.model.AssignmentModel} assignmentRecord Assignment instance
 * @property {Number} startMS Event start date time in milliseconds
 * @property {Number} endMS Event end date in milliseconds
 * @property {Number} height Calculated event element height
 * @property {Number} width Calculated event element width
 * @property {Number} top Calculated event element top position in the row (or column)
 * @property {Number} left Calculated event element left position in the row (or column)
 */

/**
 * Functions to handle event rendering (EventModel -> dom elements).
 *
 * @mixin
 */

var SchedulerEventRendering = (Target => class SchedulerEventRendering extends (Target || Base) {
  static get $name() {
    return 'SchedulerEventRendering';
  } //region Default config

  static get configurable() {
    return {
      /**
       * Position of the milestone text, either 'inside' (for short 1-char text) or 'outside' for longer text. Not
       * applicable when using {@link #config-milestoneLayoutMode}.
       * @member {String} milestoneTextPosition
       * @category Milestones
       */

      /**
       * Position of the milestone text, either 'inside' (for short 1-char text) or 'outside' for longer text. Not
       * applicable when using {@link #config-milestoneLayoutMode}.
       * @config {String}
       * @default
       * @category Milestones
       */
      milestoneTextPosition: 'outside',

      /**
       * Get/set how to align milestones in relation to their startDate. Only applies when using a
       * `milestoneLayoutMode` other than `default`. Valid values are:
       * * start
       * * center (default)
       * * end
       * @member {String} milestoneAlign
       * @category Milestones
       */

      /**
       * How to align milestones in relation to their startDate. Only applies when using a `milestoneLayoutMode`
       * other than `default`. Valid values are:
       * * start
       * * center (default)
       * * end
       * @config {String}
       * @default
       * @category Milestones
       */
      milestoneAlign: 'center',

      /**
       * Factor representing the average char width in pixels used to determine milestone width when configured
       * with `milestoneLayoutMode: 'estimate'`.
       * @member {Number} milestoneCharWidth
       * @category Milestones
       */

      /**
       * Factor representing the average char width in pixels used to determine milestone width when configured
       * with `milestoneLayoutMode: 'estimate'`.
       * @config {Number}
       * @default
       * @category Milestones
       */
      milestoneCharWidth: 10,

      /**
       * How to handle milestones during event layout. Options are:
       * * default - Milestones do not affect event layout
       * * estimate - Milestone width is estimated by multiplying text length with Scheduler#milestoneCharWidth
       * * data - Milestone width is determined by checking EventModel#milestoneWidth
       * * measure - Milestone width is determined by measuring label width
       * Please note that currently text width is always determined using EventModel#name.
       * Also note that only 'default' is supported by eventStyles line, dashed and minimal.
       * @member {String} milestoneLayoutMode
       * @category Milestones
       */

      /**
       * How to handle milestones during event layout. Options are:
       * * default - Milestones do not affect event layout
       * * estimate - Milestone width is estimated by multiplying text length with Scheduler#milestoneCharWidth
       * * data - Milestone width is determined by checking EventModel#milestoneWidth
       * * measure - Milestone width is determined by measuring label width
       * Please note that currently text width is always determined using EventModel#name.
       * Also note that only 'default' is supported by eventStyles line, dashed and minimal.
       * @config {String}
       * @default
       * @category Milestones
       */
      milestoneLayoutMode: 'default',
      // This is determined by styling, in the future it should be measured
      milestoneMinWidth: 40,

      /**
       * Get/set overlap mode. See {@link #config-eventLayout} config, valid values are `stack` (horizontal), `pack`, `mixed`
       * (vertical) and `none`
       * @member {String|Object} eventLayout
       * @category Scheduled events
       */

      /**
       * This config defines how to handle overlapping events. Valid values are:
       * - `stack`, adjusts row height (only horizontal)
       * - `pack`, adjusts event height
       * - `mixed`, allows two events to overlap, more packs (only vertical)
       * - `none`, allows events to overlap
       *
       * This config can also accept an object:
       *
       * ```javascript
       * new Scheduler({
       *     eventLayout : { type : 'stack' }
       * })
       * ```
       *
       * @config {String|Object}
       * @default
       * @category Scheduled events
       */
      eventLayout: 'stack',

      /**
       * Override this method to provide a custom sort function to sort any overlapping events. See {@link
       * #config-overlappingEventSorter} for more details.
       *
       * @param  {Scheduler.model.EventModel} a First event
       * @param  {Scheduler.model.EventModel} b Second event
       * @return {Number} Return -1 to display `a` above `b`, 1 for `b` above `a`
       * @member {Function} overlappingEventSorter
       * @category Misc
       */

      /**
       * Override this method to provide a custom sort function to sort any overlapping events. This only applies
       * to the horizontal mode, where the order the events are sorted in determines their vertical placement
       * within a resource.
       *
       * By default, overlapping events are laid out based on the start date. If the start date is equal, events
       * with earlier end date go first. And lastly the name of events is taken into account.
       *
       * Here's a sample sort function, sorting on start- and end date. If this function returns -1, then event
       * `a` is placed above event `b`:
       *
       * ```javascript
       * overlappingEventSorter(a, b) {
       *
       *   const startA = a.startDate, endA = a.endDate;
       *   const startB = b.startDate, endB = b.endDate;
       *
       *   const sameStart = (startA - startB === 0);
       *
       *   if (sameStart) {
       *     return endA > endB ? -1 : 1;
       *   } else {
       *     return (startA < startB) ? -1 : 1;
       *   }
       * }
       * ```
       *
       * NOTE: The algorithms (stack, pack) that lay the events out expects them to be served in chronological
       * order, be sure to first sort by `startDate` to get predictable results.
       *
       * @param  {Scheduler.model.EventModel} a First event
       * @param  {Scheduler.model.EventModel} b Second event
       * @return {Number} Return -1 to display `a` above `b`, 1 for `b` above `a`
       * @config {function}
       * @category Misc
       */
      overlappingEventSorter: null,

      /**
       * Deprecated, to be removed in version 6.0. Replaced by {@link #config-overlappingEventSorter}.
       * @deprecated 5.0 Use {@link #config-overlappingEventSorter} instead.
       * @config {function}
       */
      horizontalEventSorterFn: null,

      /**
       * Get/set fillTicks setting. If set to `true` it forces the rendered events to fill entire ticks.
       * @member {Boolean} fillTicks
       * @category Scheduled events
       */

      /**
       * Specify `true` to force rendered events to fill entire ticks. This only affects rendering, events retain
       * their set start and end dates on the data level. When enabling this config you should probably also
       * disable EventDrag and EventResize, otherwise their behaviour will not be what a user expects.
       * @config {Boolean}
       * @default
       * @category Scheduled events
       */
      fillTicks: false,

      /**
       * Control how much space to leave between the first event/last event and the resources edge (top/bottom
       * margin within the resource row in horizontal mode, left/right margin within the resource column in
       * vertical mode), in px. Defaults to the value of {@link Scheduler.view.Scheduler#config-barMargin}.
       *
       * Can be configured per resource by setting {@link Scheduler.model.ResourceModel#field-resourceMargin
       * resource.resourceMargin}.
       *
       * @member {Number} resourceMargin
       * @category Scheduled events
       */

      /**
       * Control how much space to leave between the first event/last event and the resources edge (top/bottom
       * margin within the resource row in horizontal mode, left/right margin within the resource column in
       * vertical mode), in px. Defaults to the value of {@link Scheduler.view.Scheduler#config-barMargin}.
       *
       * Can be configured per resource by setting {@link Scheduler.model.ResourceModel#field-resourceMargin
       * resource.resourceMargin}.
       *
       * @config {Number}
       * @category Scheduled events
       */
      resourceMargin: null,

      /**
       * Specify initial animation at runtime, see {@link #config-useInitialAnimation useInitialAnimation}
       * @member {Boolean|String} useInitialAnimation
       */

      /**
       * By default scheduler fades events in on load. Specify `false` to prevent this animation or specify one
       * of the available animation types to use it (`true` equals `'fade-in'`):
       * * fade-in (default)
       * * slide-from-left
       * * slide-from-top
       * ```
       * // Slide events in from the left on load
       * scheduler = new Scheduler({
       *     useInitialAnimation : 'slide-from-left'
       * });
       * ```
       * @config {Boolean|String}
       * @default
       * @category Misc
       */
      useInitialAnimation: true,

      /**
       * An empty function by default, but provided so that you can override it. This function is called each time
       * an event is rendered into the schedule to render the contents of the event. It's called with the event,
       * its resource and a `renderData` object which allows you to populate data placeholders inside the event
       * template. **IMPORTANT** You should never modify any data on the EventModel inside this method.
       *
       * By default, the DOM markup of an event bar includes placeholders for 'cls' and 'style'. The cls property
       * is a {@link Core.helper.util.DomClassList} which will be added to the event element. The style property
       * is an inline style declaration for the event element.
       *
       * IMPORTANT: When returning content, be sure to consider how that content should be encoded to avoid XSS
       * (Cross-Site Scripting) attacks. This is especially important when including user-controlled data such as
       * the event's `name`. The function {@link Core.helper.StringHelper#function-encodeHtml-static} as well as
       * {@link Core.helper.StringHelper#function-xss-static} can be helpful in these cases.
       *
       * ```javascript
       *  eventRenderer({ eventRecord, resourceRecord, renderData }) {
       *      renderData.style = 'color:white';                 // You can use inline styles too.
       *
       *      // Property names with truthy values are added to the resulting elements CSS class.
       *      renderData.cls.isImportant = this.isImportant(eventRecord);
       *      renderData.cls.isModified = eventRecord.isModified;
       *
       *      // Remove a class name by setting the property to false
       *      renderData.cls[scheduler.generatedIdCls] = false;
       *
       *      // Or, you can treat it as a string, but this is less efficient, especially
       *      // if your renderer wants to *remove* classes that may be there.
       *      renderData.cls += ' extra-class';
       *
       *      return StringHelper.xss`${DateHelper.format(eventRecord.startDate, 'YYYY-MM-DD')}: ${eventRecord.name}`;
       *  }
       * ```
       *
       * @param {Object} detail An object containing the information needed to render an Event.
       * @param {Scheduler.model.EventModel} detail.eventRecord The event record.
       * @param {Scheduler.model.ResourceModel} detail.resourceRecord The resource record.
       * @param {Scheduler.model.AssignmentModel} detail.assignmentRecord The assignment record.
       * @param {Object} detail.renderData An object containing details about the event rendering.
       * @param {Scheduler.model.EventModel} detail.renderData.event The event record.
       * @param {Core.helper.util.DomClassList|String} detail.renderData.cls An object whose property names
       * represent the CSS class names to be added to the event bar element. Set a property's value to truthy or
       * falsy to add or remove the class name based on the property name. Using this technique, you do not have
       * to know whether the class is already there, or deal with concatenation.
       * @param {Core.helper.util.DomClassList|String} detail.renderData.wrapperCls An object whose property names
       * represent the CSS class names to be added to the event wrapper element. Set a property's value to truthy
       * or falsy to add or remove the class name based on the property name. Using this technique, you do not
       * have to know whether the class is already there, or deal with concatenation.
       * @param {Core.helper.util.DomClassList|String} detail.renderData.iconCls An object whose property names
       * represent the CSS class names to be added to an event icon element.
       *
       * Note that an element carrying this icon class is injected into the event element *after*
       * the renderer completes, *before* the renderer's created content.
       *
       * To disable this if the renderer takes full control and creates content using the iconCls,
       * you can set `renderData.iconCls = null`.
       * @param {Number} detail.renderData.left Vertical offset position (in pixels) on the time axis.
       * @param {Number} detail.renderData.width Width in pixels of the event element.
       * @param {Number} detail.renderData.height Height in pixels of the event element.
       * @param {String} detail.renderData.eventStyle The `eventStyle` of the event. Use this to apply custom
       * styles to the event DOM element
       * @param {String} detail.renderData.eventColor The `eventColor` of the event. Use this to set a custom
       * color for the rendered event
       * @param {Object[]} detail.renderData.children An array of DOM configs used as children to the
       * `b-sch-event` element. Can be populated with additional DOM configs to have more control over contents.
       * @returns {String|Object} A simple string, or a custom object which will be applied to the
       * {@link #config-eventBodyTemplate}, creating the actual HTML
       * @config {function}
       * @category Scheduled events
       */
      eventRenderer: null,

      /**
       * `this` reference for the {@link #config-eventRenderer} function
       * @config {Object}
       * @category Scheduled events
       */
      eventRendererThisObj: null,

      /**
       * Field from EventModel displayed as text in the bar when rendering
       * @config {String}
       * @default
       * @category Scheduled events
       */
      eventBarTextField: 'name',

      /**
       * The template used to generate the markup of your events in the scheduler. To 'populate' the
       * eventBodyTemplate with data, use the {@link #config-eventRenderer} method.
       * @config {Function}
       * @category Scheduled events
       */
      eventBodyTemplate: null,

      /**
       * The class responsible for the packing horizontal event layout process.
       * Override this to take control over the layout process.
       * @config {Scheduler.eventlayout.HorizontalLayout}
       * @typings {typeof HorizontalLayout}
       * @default
       * @private
       * @category Misc
       */
      horizontalLayoutPackClass: HorizontalLayoutPack,

      /**
       * The class name responsible for the stacking horizontal event layout process.
       * Override this to take control over the layout process.
       * @config {Scheduler.eventlayout.HorizontalLayout}
       * @typings {typeof HorizontalLayout}
       * @default
       * @private
       * @category Misc
       */
      horizontalLayoutStackClass: HorizontalLayoutStack,

      /**
       * A config object used to configure the resource columns in vertical mode.
       * See {@link Scheduler.view.ResourceHeader} for more details on available properties.
       *
       * ```
       * new Scheduler({
       *   resourceColumns : {
       *     columnWidth    : 100,
       *     headerRenderer : ({ resourceRecord }) => `${resourceRecord.id} - ${resourceRecord.name}`
       *   }
       * })
       * ```
       * @config {Object}
       * @category Resources
       */
      resourceColumns: null,

      /**
       * Path to load resource images from. Used by the resource header in vertical mode and the
       * {@link Scheduler.column.ResourceInfoColumn} in horizontal mode. Set this to display miniature
       * images for each resource using their `image` or `imageUrl` fields.
       *
       * * `image` represents image name inside the specified `resourceImagePath`,
       * * `imageUrl` represents fully qualified image URL.
       *
       *  If set and a resource has no `imageUrl` or `image` specified it will try show miniature using
       *  the resource's name with {@link #config-resourceImageExtension} appended.
       *
       * **NOTE**: The path should end with a `/`:
       *
       * ```
       * new Scheduler({
       *   resourceImagePath : 'images/resources/'
       * });
       * ```
       * @config {String}
       * @category Resources
       */
      resourceImagePath: null,

      /**
       * Generic resource image, used when provided `imageUrl` or `image` fields or path calculated from resource
       * name are all invalid. If left blank, resource name initials will be shown when no image can be loaded.
       * @default
       * @config {String}
       * @category Resources
       */
      defaultResourceImageName: null,

      /**
       * Resource image extension, used when creating image path from resource name.
       * @default
       * @config {String}
       * @category Resources
       */
      resourceImageExtension: '.jpg',

      /**
       * Controls how much space to leave between stacked event bars in px.
       *
       * Can be configured per resource by setting {@link Scheduler.model.ResourceModel#field-barMargin
       * resource.barMargin}.
       *
       * @config {Number} barMargin
       * @default
       * @category Scheduled events
       */
      // Used to animate events on first render
      isFirstRender: true,
      initialAnimationDuration: 2000,
      internalEventLayout: null,
      eventPositionMode: 'translate',
      eventScrollMode: 'move'
    };
  } //endregion
  //region Settings

  changeEventLayout(eventLayout) {
    // Pass layout config to internal config to normalize its form
    this.internalEventLayout = eventLayout; // Return normalized string type

    return this.internalEventLayout.type;
  }

  changeInternalEventLayout(eventLayout) {
    return this.getEventLayout(eventLayout);
  }

  updateInternalEventLayout(eventLayout, oldEventLayout) {
    const me = this;

    if (oldEventLayout) {
      me.element.classList.remove(`b-eventlayout-${oldEventLayout.type}`);
    }

    me.element.classList.add(`b-eventlayout-${eventLayout.type}`);

    if (!me.isConfiguring) {
      me.refreshWithTransition();
      me.trigger('stateChange');
    }
  }

  updateFillTicks() {
    if (!this.isConfiguring) {
      this.refreshWithTransition();
      this.trigger('stateChange');
    }
  }

  changeHorizontalEventSorterFn(fn) {
    VersionHelper.deprecate('Scheduler', '6.0.0', 'Replaced by overlappingEventSorter()');
    this.overlappingEventSorter = fn;
  }

  updateOverlappingEventSorter(fn) {
    if (!this.isConfiguring) {
      this.refreshWithTransition();
    }
  } //endregion
  //region Layout helpers
  // Wraps string config to object with type

  getEventLayout(value) {
    var _value;

    if ((_value = value) !== null && _value !== void 0 && _value.isModel) {
      value = value.eventLayout || this.internalEventLayout;
    }

    if (typeof value === 'string') {
      value = {
        type: value
      };
    }

    return value;
  }
  /**
   * Get event layout handler. The handler decides the vertical placement of events within a resource.
   * Returns null if no eventLayout is used (if {@link #config-eventLayout} is set to "none")
   * @internal
   * @returns {Scheduler.eventlayout.HorizontalLayout}
   * @readonly
   * @category Scheduled events
   */

  getEventLayoutHandler(eventLayout) {
    const me = this;

    if (!me.isHorizontal) {
      return null;
    }

    const {
      timeAxisViewModel,
      horizontal
    } = me,
          {
      type
    } = eventLayout;

    if (!me.layouts) {
      me.layouts = {};
    }

    switch (type) {
      // stack, adjust row height to fit all events
      case 'stack':
        {
          if (!me.layouts.horizontalStack) {
            me.layouts.horizontalStack = new me.horizontalLayoutStackClass(ObjectHelper.assign({
              scheduler: me,
              timeAxisViewModel,
              bandIndexToPxConvertFn: horizontal.layoutEventVerticallyStack,
              bandIndexToPxConvertThisObj: horizontal
            }, eventLayout));
          }

          return me.layouts.horizontalStack;
        }
      // pack, fit all events in available height by adjusting their height

      case 'pack':
        {
          if (!me.layouts.horizontalPack) {
            me.layouts.horizontalPack = new me.horizontalLayoutPackClass(ObjectHelper.assign({
              scheduler: me,
              timeAxisViewModel,
              bandIndexToPxConvertFn: horizontal.layoutEventVerticallyPack,
              bandIndexToPxConvertThisObj: horizontal
            }, eventLayout));
          }

          return me.layouts.horizontalPack;
        }

      default:
        return null;
    }
  } //endregion
  //region Resource header/columns
  // NOTE: The configs below are initially applied to the resource header in `TimeAxisColumn#set mode`

  /**
   * Use it to manipulate resource column properties at runtime.
   * @property {Scheduler.view.ResourceHeader}
   * @readonly
   */

  get resourceColumns() {
    var _this$timeAxisColumn;

    return ((_this$timeAxisColumn = this.timeAxisColumn) === null || _this$timeAxisColumn === void 0 ? void 0 : _this$timeAxisColumn.resourceColumns) || this._resourceColumns;
  }
  /**
   * Get resource column width. Only applies to vertical mode. To set it, assign to
   * `scheduler.resourceColumns.columnWidth`.
   * @property {Number}
   * @readonly
   */

  get resourceColumnWidth() {
    return this.resourceColumns ? this.resourceColumns.columnWidth : null;
  } //endregion
  //region Event rendering
  // Chainable function called with the events to render for a specific resource. Allows features to add/remove.
  // Chained by ResourceTimeRanges

  getEventsToRender(resource, events) {
    return events;
  }
  /**
   * Rerenders events for specified resource (by rerendering the entire row).
   * @param {Scheduler.model.ResourceModel} resourceRecord
   */

  repaintEventsForResource(resourceRecord) {
    this.currentOrientation.repaintEventsForResource(resourceRecord);
  }
  /**
   * Rerenders the events for all resources connected to the specified event
   * @param {Scheduler.model.EventModel} eventRecord
   * @private
   */

  repaintEvent(eventRecord) {
    const resources = this.eventStore.getResourcesForEvent(eventRecord);
    resources.forEach(resourceRecord => this.repaintEventsForResource(resourceRecord));
  } // Returns a resource specific resourceMargin, falling back to Schedulers setting
  // This fn could be made public to allow hooking it as an alternative to only setting this in data

  getResourceMargin(resourceRecord) {
    var _resourceRecord$resou;

    return (_resourceRecord$resou = resourceRecord === null || resourceRecord === void 0 ? void 0 : resourceRecord.resourceMargin) !== null && _resourceRecord$resou !== void 0 ? _resourceRecord$resou : this.resourceMargin;
  } // Returns a resource specific barMargin, falling back to Schedulers setting
  // This fn could be made public to allow hooking it as an alternative to only setting this in data

  getBarMargin(resourceRecord) {
    var _resourceRecord$barMa;

    return (_resourceRecord$barMa = resourceRecord === null || resourceRecord === void 0 ? void 0 : resourceRecord.barMargin) !== null && _resourceRecord$barMa !== void 0 ? _resourceRecord$barMa : this.barMargin;
  } // Returns a resource specific rowHeight, falling back to Schedulers setting
  // Prio order: Height from record, configured height
  // This fn could be made public to allow hooking it as an alternative to only setting this in data

  getResourceHeight(resourceRecord) {
    var _resourceRecord$rowHe;

    return (_resourceRecord$rowHe = resourceRecord.rowHeight) !== null && _resourceRecord$rowHe !== void 0 ? _resourceRecord$rowHe : this.rowHeight;
  } // Similar to getResourceHeight(), but for usage later in the process to take height set by renderers into account.
  // Cant be used earlier in the process because then the row will grow
  // Prio order: Height requested by renderer, height from record, configured height

  getAppliedResourceHeight(resourceRecord) {
    var _row$maxRequestedHeig;

    const row = this.getRowById(resourceRecord);
    return (_row$maxRequestedHeig = row === null || row === void 0 ? void 0 : row.maxRequestedHeight) !== null && _row$maxRequestedHeig !== void 0 ? _row$maxRequestedHeig : this.getResourceHeight(resourceRecord);
  } // Combined convenience getter for destructuring on calling side

  getResourceLayoutSettings(resourceRecord) {
    return {
      resourceMargin: this.getResourceMargin(resourceRecord),
      barMargin: this.getBarMargin(resourceRecord),
      rowHeight: this.getAppliedResourceHeight(resourceRecord)
    };
  } //endregion
  //region Template

  /**
   * Generates data used in the template when rendering an event. For example which css classes to use. Also applies
   * #eventBodyTemplate and calls the {@link #config-eventRenderer}.
   * @private
   * @param {Scheduler.model.EventModel} eventRecord Event to generate data for
   * @param {Scheduler.model.ResourceModel} resourceRecord Events resource
   * @param {Boolean|Object} includeOutside Specify true to get boxes for timespans outside of the rendered zone in both
   * dimensions. This option is used when calculating dependency lines, and we need to include routes from timespans
   * which may be outside the rendered zone.
   * @param {Boolean} includeOutside.timeAxis Pass as `true` to include timespans outside of the TimeAxis's bounds
   * @param {Boolean} includeOutside.viewport Pass as `true` to include timespans outside of the vertical timespan viewport's bounds.
   * @returns {Object} Data to use in event template, or `undefined` if the event is outside of the rendered zone.
   */

  generateRenderData(eventRecord, resourceRecord, includeOutside = {
    viewport: true
  }) {
    // TODO: Change this fn to accept an assignment instead of event + resource
    const me = this,
          // generateRenderData calculates layout for events which are outside of the vertical viewport
    // because the RowManager needs to know a row height.
    renderData = me.currentOrientation.getTimeSpanRenderData(eventRecord, resourceRecord, includeOutside),
          {
      isEvent
    } = eventRecord,
          // Dont want events drag created to zero duration to render as milestones
    isMilestone = !eventRecord.meta.isDragCreating && eventRecord.isMilestone,
          assignmentRecord = isEvent && eventRecord.assignments.find(a => a.resourceId === resourceRecord.id),
          // Events inner element, will be populated by renderer and/or eventBodyTemplate
    eventContent = {
      className: 'b-sch-event-content',
      dataset: {
        taskBarFeature: 'content'
      }
    };

    if (renderData) {
      var _renderData$iconCls2;

      renderData.tabIndex = '0';
      let resizable = eventRecord.isResizable;

      if (renderData.startsOutsideView) {
        if (resizable === true) resizable = 'end';else if (resizable === 'start') resizable = false;
      }

      if (renderData.endsOutsideView) {
        if (resizable === true) resizable = 'start';else if (resizable === 'end') resizable = false;
      } // Event record cls properties are now DomClassList instances, so clone them
      // so that they can be manipulated here and by renderers.
      // Truthy value means the key will be added as a class name.
      // ResourceTimeRanges applies custom cls to wrapper.

      const // Boolean needed here, otherwise DomSync will dig into comparing the modifications
      isDirty = Boolean(eventRecord.hasPersistableChanges || (assignmentRecord === null || assignmentRecord === void 0 ? void 0 : assignmentRecord.hasPersistableChanges)),
            clsListObj = {
        [resourceRecord.cls]: resourceRecord.cls,
        [me.generatedIdCls]: eventRecord.hasGeneratedId,
        [me.dirtyCls]: isDirty,
        [me.committingCls]: eventRecord.isCommitting,
        [me.endsOutsideViewCls]: renderData.endsOutsideView,
        [me.startsOutsideViewCls]: renderData.startsOutsideView,
        'b-clipped-start': renderData.clippedStart,
        'b-clipped-end': renderData.clippedEnd,
        'b-iscreating': eventRecord.isCreating
      },
            wrapperClsListObj = {
        [`${me.eventCls}-parent`]: resourceRecord.isParent,
        'b-readonly': eventRecord.readOnly || (assignmentRecord === null || assignmentRecord === void 0 ? void 0 : assignmentRecord.readOnly)
      },
            clsList = eventRecord.isResourceTimeRange ? new DomClassList() : eventRecord.internalCls.clone(),
            wrapperClsList = eventRecord.isResourceTimeRange ? eventRecord.internalCls.clone() : new DomClassList();
      renderData.wrapperStyle = ''; // mark as wrapper to make sure fire render events for this level only

      renderData.isWrap = true; // Event specifics, things that do not apply to ResourceTimeRanges

      if (isEvent) {
        const selected = assignmentRecord && me.isAssignmentSelected(assignmentRecord);
        ObjectHelper.assign(clsListObj, {
          [me.eventCls]: 1,
          'b-milestone': isMilestone,
          'b-sch-event-narrow': renderData.width < 10,
          [me.fixedEventCls]: eventRecord.isDraggable === false,
          [`b-sch-event-resizable-${resizable}`]: Boolean(me.features.eventResize && !eventRecord.readOnly),
          [me.eventSelectedCls]: selected,
          [me.eventAssignHighlightCls]: me.isEventSelected(eventRecord) && !selected,
          'b-recurring': eventRecord.isRecurring,
          'b-occurrence': eventRecord.isOccurrence,
          'b-inactive': eventRecord.inactive
        });
        renderData.eventId = eventRecord.id;
        const eventStyle = eventRecord.eventStyle || resourceRecord.eventStyle || me.eventStyle,
              eventColor = eventRecord.eventColor || resourceRecord.eventColor || me.eventColor,
              hasAnimation = me.isFirstRender && me.useInitialAnimation;
        ObjectHelper.assign(wrapperClsListObj, {
          [`${me.eventCls}-wrap`]: 1,
          'b-milestone-wrap': isMilestone
        });

        if (hasAnimation) {
          const index = renderData.row ? renderData.row.index : renderData.top / me.tickSize,
                delayMS = index / 20 * 1000;
          renderData.wrapperStyle = `animation-delay: ${delayMS}ms;`;
          me.maxDelay = Math.max(me.maxDelay || 0, delayMS); // Add an extra delay to wait for the most delayed animation to finish
          // before we call stopInitialAnimation. In this way, we allow them all to finish
          // before we remove the b-initial-${me._useInitialAnimation} class.

          if (!me.initialAnimationDetacher) {
            me.initialAnimationDetacher = EventHelper.on({
              element: me.foregroundCanvas,
              delegate: me.eventSelector,
              // Just listen for the first animation end fired by our event els
              once: true,
              animationend: () => me.setTimeout('stopInitialAnimation', me.maxDelay),
              // Fallback in case animation is interrupted
              expires: {
                alt: 'stopInitialAnimation',
                delay: me.initialAnimationDuration + me.maxDelay
              },
              thisObj: me
            });
          }
        }

        renderData.eventColor = eventColor;
        renderData.eventStyle = eventStyle; // TODO: Deprecate assignment, use assignmentRecord

        renderData.assignmentRecord = renderData.assignment = assignmentRecord;
      } // If not using a wrapping div, this cls will be added to event div for correct rendering

      renderData.wrapperCls = ObjectHelper.assign(wrapperClsList, wrapperClsListObj);
      renderData.cls = ObjectHelper.assign(clsList, clsListObj);
      renderData.iconCls = new DomClassList(eventRecord.get(me.eventBarIconClsField) || eventRecord.iconCls); // ResourceTimeRanges applies custom style to the wrapper

      if (eventRecord.isResourceTimeRange) {
        renderData.style = '';
        renderData.wrapperStyle += eventRecord.style || '';
      } // Others to inner
      else {
        renderData.style = eventRecord.style || '';
      } // TODO: Deprecate resource in favor of resourceRecord

      renderData.resource = renderData.resourceRecord = resourceRecord;
      renderData.resourceId = renderData.rowId;

      if (isEvent) {
        let childContent = null,
            milestoneLabelConfig = null,
            value;

        if (me.eventRenderer) {
          // User has specified a renderer fn, either to return a simple string, or an object intended for the eventBodyTemplate
          const rendererValue = me.eventRenderer.call(me.eventRendererThisObj || me, {
            eventRecord,
            resourceRecord,
            assignmentRecord: renderData.assignmentRecord,
            renderData
          }); // If the user's renderer coerced it into a string, recreate a DomClassList.

          if (typeof renderData.cls === 'string') {
            renderData.cls = new DomClassList(renderData.cls);
          }

          if (typeof renderData.wrapperCls === 'string') {
            renderData.wrapperCls = new DomClassList(renderData.wrapperCls);
          } // Same goes for iconCls

          if (typeof renderData.iconCls === 'string') {
            renderData.iconCls = new DomClassList(renderData.iconCls);
          }

          if (me.eventBodyTemplate) {
            value = me.eventBodyTemplate(rendererValue);
          } else {
            value = rendererValue;
          }
        } else if (me.eventBodyTemplate) {
          // User has specified an eventBodyTemplate, but no renderer - just apply the entire event record data.
          value = me.eventBodyTemplate(eventRecord);
        } else if (me.eventBarTextField) {
          // User has specified a field in the data model to read from
          value = StringHelper.encodeHtml(eventRecord[me.eventBarTextField] || '');
        }

        if (!me.eventBodyTemplate || Array.isArray(value)) {
          var _renderData$iconCls;

          eventContent.children = []; // Give milestone a dedicated label element so we can use padding

          if (isMilestone && me.milestoneLayoutMode === 'default' && value != null && value !== '') {
            eventContent.children.unshift(milestoneLabelConfig = {
              tag: 'label',
              children: []
            });
          }

          if ((_renderData$iconCls = renderData.iconCls) !== null && _renderData$iconCls !== void 0 && _renderData$iconCls.length) {
            eventContent.children.unshift({
              tag: 'i',
              className: renderData.iconCls
            });
          } // Array, assumed to contain DOM configs for eventContent children (or milestone label)

          if (Array.isArray(value)) {
            (milestoneLabelConfig || eventContent).children.push(...value);
          } // Likely HTML content
          else if (StringHelper.isHtml(value)) {
            if (eventContent.children.length) {
              childContent = {
                tag: 'span',
                html: value
              };
            } else {
              eventContent.children = null;
              eventContent.html = value;
            }
          } // DOM config or plain string can be used as is
          else if (typeof value === 'string' || typeof value === 'object') {
            childContent = value;
          } // Other, use string
          else if (value != null) {
            childContent = String(value);
          } // Must allow empty string as valid content

          if (childContent != null) {
            // Milestones have content in their label, other events in their "body"
            (milestoneLabelConfig || eventContent).children.push(childContent);
            renderData.cls.add('b-has-content');
          }

          if (eventContent.html != null || eventContent.children.length) {
            renderData.children.push(eventContent);
          }
        } else {
          eventContent.html = value;
          renderData.children.push(eventContent);
        }

        const {
          eventStyle,
          eventColor
        } = renderData; // Renderers have last say on style & color

        renderData.wrapperCls[`b-sch-style-${eventStyle}`] = eventStyle; // Named colors are applied as a class to the wrapper

        if (DomHelper.isNamedColor(eventColor)) {
          renderData.wrapperCls[`b-sch-color-${eventColor}`] = eventColor;
        } else if (eventColor) {
          const colorProp = eventStyle ? 'color' : 'background-color';
          renderData.style = `${colorProp}:${eventColor};` + renderData.style;
          renderData.wrapperCls['b-sch-custom-color'] = 1;
        } // Milestones has to apply styling to b-sch-event-content

        if (renderData.style && isMilestone && eventContent) {
          eventContent.style = renderData.style;
          delete renderData.style;
        }
      } // If there are any iconCls entries...

      renderData.cls['b-sch-event-withicon'] = (_renderData$iconCls2 = renderData.iconCls) === null || _renderData$iconCls2 === void 0 ? void 0 : _renderData$iconCls2.length; // For comparison in sync, cheaper than comparing DocumentFragments

      renderData.eventContent = eventContent;
      renderData.wrapperChildren = []; // Method which features may chain in to

      me.onEventDataGenerated(renderData);
    }

    return renderData;
  }
  /**
   * A method which may be chained by features. It is called when an event's render
   * data is calculated so that features may update the style, class list or body.
   * @param {Object} eventData
   * @internal
   */

  onEventDataGenerated(eventData) {} //endregion
  //region Initial animation

  changeUseInitialAnimation(name) {
    return name === true ? 'fade-in' : name;
  }

  updateUseInitialAnimation(name, old) {
    const {
      classList
    } = this.element;

    if (old) {
      classList.remove(`b-initial-${old}`);
    }

    if (name) {
      classList.add(`b-initial-${name}`); // Transition block for FF, to not interfere with animations

      if (BrowserHelper.isFirefox) {
        classList.add('b-prevent-event-transitions');
      }
    }
  }
  /**
   * Restarts initial events animation with new value {@link #config-useInitialAnimation}.
   * @param {Boolean|String} initialAnimation new initial animation value
   */

  restartInitialAnimation(initialAnimation) {
    var _me$initialAnimationD;

    const me = this;
    (_me$initialAnimationD = me.initialAnimationDetacher) === null || _me$initialAnimationD === void 0 ? void 0 : _me$initialAnimationD.call(me);
    me.initialAnimationDetacher = null;
    me.useInitialAnimation = initialAnimation;
    me.isFirstRender = true;
    me.refresh();
  }

  stopInitialAnimation() {
    const me = this;
    me.initialAnimationDetacher();
    me.isFirstRender = false; // Prevent any further initial animations

    me.useInitialAnimation = false; // Remove transition block for FF a bit later, to not interfere with animations

    if (BrowserHelper.isFirefox) {
      me.setTimeout(() => me.element.classList.remove('b-prevent-event-transitions'), 100);
    }
  } //endregion
  //region Milestones

  /**
   * Determines width of a milestones label. How width is determined is decided by configuring Scheduler#milestoneLayoutMode.
   * Please note that currently text width is always determined using EventModel#name.
   * @param {Scheduler.model.EventModel} eventRecord
   * @returns {Number}
   */

  getMilestoneLabelWidth(eventRecord) {
    const me = this,
          mode = me.milestoneLayoutMode;

    if (mode === 'measure') {
      const element = me.milestoneMeasureElement || (me.milestoneMeasureElement = DomHelper.createElement({
        className: 'b-sch-event-wrap b-milestone-wrap b-measure',
        children: [{
          className: 'b-sch-event b-milestone',
          children: [{
            className: 'b-sch-event-content'
          }]
        }],
        parent: me.foregroundCanvas
      })); // DomSync should not touch

      element.retainElement = true;
      element.firstElementChild.firstElementChild.innerHTML = eventRecord.name;
      return element.offsetWidth;
    }

    if (mode === 'estimate') {
      return Math.max(eventRecord.name.length * me.milestoneCharWidth, me.milestoneMinWidth);
    }

    if (mode === 'data') {
      return Math.max(eventRecord.milestoneWidth, me.milestoneMinWidth);
    }

    return 0;
  }

  updateMilestoneLayoutMode(mode) {
    this.element.classList[mode !== 'default' ? 'add' : 'remove']('b-sch-layout-milestones');

    if (!this.isConfiguring) {
      this.refreshWithTransition();
    }
  }

  updateMilestoneTextPosition(position) {
    this.element.classList.toggle('b-sch-layout-milestone-text-position-inside', position === 'inside');
  }

  updateMilestoneAlign() {
    if (!this.isConfiguring) {
      this.refreshWithTransition();
    }
  }

  updateMilestoneCharWidth() {
    if (!this.isConfiguring) {
      this.refreshWithTransition();
    }
  } // endregion
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module Scheduler/view/mixin/SchedulerStores
 */

/**
 * Functions for store assignment and store event listeners.
 *
 * @mixin
 * @extends Scheduler/data/mixin/ProjectConsumer
 */

var SchedulerStores = (Target => class SchedulerStores extends ProjectConsumer(Target || Base) {
  static get $name() {
    return 'SchedulerStores';
  } //region Default config
  // This is the static definition of the Stores we consume from the project, and
  // which we must provide *TO* the project if we or our CrudManager is configured
  // with them.
  // The property name is the store name, and within that there is the dataname which
  // is the property which provides static data definition. And there is a listeners
  // definition which specifies the listeners *on this object* for each store.
  //
  // To process incoming stores, implement an updateXxxxxStore method such
  // as `updateEventStore(eventStore)`.
  //
  // To process an incoming Project implement `updateProject`. __Note that
  // `super.updateProject(...arguments)` must be called first.__

  static get projectStores() {
    return {
      resourceStore: {
        dataName: 'resources'
      },
      eventStore: {
        dataName: 'events',
        listeners: {
          batchedUpdate: 'onEventStoreBatchedUpdate',
          changePreCommit: 'onInternalEventStoreChange',
          commitStart: 'onEventCommitStart',
          commit: 'onEventCommit',
          exception: 'onEventException',
          idchange: 'onEventIdChange',
          beforeLoad: 'applyStartEndParameters'
        }
      },
      assignmentStore: {
        dataName: 'assignments',
        listeners: {
          changePreCommit: 'onAssignmentChange',
          // In EventSelection.js
          commitStart: 'onAssignmentCommitStart',
          commit: 'onAssignmentCommit',
          exception: 'onAssignmentException',
          beforeRemove: {
            fn: 'onAssignmentBeforeRemove',
            // We must go last in case an app vetoes a remove
            // by returning false from a handler.
            prio: -1000
          }
        }
      },
      dependencyStore: {
        dataName: 'dependencies'
      },
      calendarManagerStore: {},
      timeRangeStore: {},
      resourceTimeRangeStore: {}
    };
  }

  static get configurable() {
    return {
      /**
       * Overridden to *not* auto create a store at the Scheduler level.
       * The store is the {@link Scheduler.data.ResourceStore} of the backing project
       * @config {Core.data.Store}
       * @private
       */
      store: null,

      /**
       * The name of the start date parameter that will be passed to in every `eventStore` load request.
       * @config {String}
       * @category Data
       */
      startParamName: 'startDate',

      /**
       * The name of the end date parameter that will be passed to in every `eventStore` load request.
       * @config {String}
       * @category Data
       */
      endParamName: 'endDate',

      /**
       * true to apply start and end dates of the current view to any `eventStore` load requests.
       * @config {Boolean}
       * @category Data
       */
      passStartEndParameters: false,

      /**
       * Configure with `true` to also remove the event when removing the last assignment.
       * @config {Boolean}
       * @default
       * @category Misc
       */
      removeUnassignedEvent: true,

      /**
       * Class that should be used to instantiate a CrudManager in case it's provided as a simple object to
       * {@link #config-crudManager} config.
       * @config {Scheduler.data.CrudManager}
       * @typings {typeof CrudManager}
       * @category Data
       */
      crudManagerClass: null,

      /**
       * Get/set the CrudManager instance
       * @member {Scheduler.data.CrudManager} crudManager
       * @category Data
       */

      /**
       * Supply a {@link Scheduler.data.CrudManager CrudManager} instance or a config object if you want to use
       * CrudManager for handling data.
       * @config {Object|Scheduler.data.CrudManager}
       * @category Data
       */
      crudManager: null
    };
  } //endregion
  //region Project

  updateProject(project, oldProject) {
    super.updateProject(project, oldProject);
    this.detachListeners('schedulerStores');
    project.on({
      name: 'schedulerStores',
      refresh: 'onProjectRefresh',
      thisObj: this
    });
  } // Called when project changes are committed, before data is written back to records (but still ready to render
  // since data is fetched from engine)

  onProjectRefresh({
    isInitialCommit
  }) {
    const me = this;

    if (isInitialCommit) {
      if (me.isVertical) {
        me.refreshAfterProjectRefresh = false;
        me.refreshWithTransition();
      }
    }

    if (me.navigateToAfterRefresh) {
      me.navigateTo(me.navigateToAfterRefresh);
      me.navigateToAfterRefresh = null;
    }

    if (me.refreshAfterProjectRefresh) {
      me.refreshWithTransition(false, !isInitialCommit);
      me.refreshAfterProjectRefresh = false;
    }
  } //endregion
  //region CrudManager

  changeCrudManager(crudManager) {
    const me = this;

    if (crudManager && !crudManager.isCrudManager) {
      // CrudManager injects itself into is Scheduler's _crudManager property
      // because code it triggers needs to access it through its getter.
      crudManager = me.crudManagerClass.new({
        scheduler: me
      }, crudManager);
    } // config setter will veto because of above described behaviour
    // of setting the property early on creation

    me._crudManager = crudManager;
    me.bindCrudManager(crudManager);
  } //endregion
  //region Row store

  get store() {
    // Vertical uses a dummy store
    if (!this._store && this.isVertical) {
      // TODO: Make this store readonly, since we are using single cell approach
      this._store = new Store({
        data: [{
          // Quoted to avoid commit-hook check:
          'id': 'verticalTimeAxisRow',
          // eslint-disable-line quote-props
          cls: 'b-verticaltimeaxis-row'
        }]
      });
    }

    return super.store;
  }

  set store(store) {
    super.store = store;
  } // Wrap w/ transition refreshFromRowOnStoreAdd() inherited from Grid

  refreshFromRowOnStoreAdd(row, {
    isExpand
  }) {
    const args = arguments;
    this.runWithTransition(() => {
      // Postpone drawing of events for a new resource until the following project refresh. Previously the draw
      // would not happen because engine was not ready, but now when we allow commits and can read values during
      // commit that block is no longer there
      this.currentOrientation.suspended = !isExpand;
      super.refreshFromRowOnStoreAdd(row, ...args);
      this.currentOrientation.suspended = false;
    }, !isExpand);
  }

  onStoreAdd(event) {
    super.onStoreAdd(event);

    if (this.isPainted) {
      this.calculateRowHeights(event.records);
    }
  }

  onStoreUpdateRecord({
    source: store,
    record,
    changes
  }) {
    // Ignore engine changes that do not affect row rendering
    let ignoreCount = 0;

    if ('assigned' in changes) {
      ignoreCount++;
    }

    if ('calendar' in changes) {
      ignoreCount++;
    }

    if (ignoreCount !== Object.keys(changes).length) {
      super.onStoreUpdateRecord(...arguments);
    }
  } //endregion
  //region ResourceStore

  updateResourceStore(resourceStore) {
    // Reconfigure grid if resourceStore is backing the rows
    if (resourceStore && this.isHorizontal) {
      resourceStore.metaMapId = this.id;
      this.store = resourceStore;
    }
  } //endregion
  //region Events

  onEventIdChange(params) {
    this.currentOrientation.onEventStoreIdChange && this.currentOrientation.onEventStoreIdChange(params);
  }
  /**
   * Listener to the batchedUpdate event which fires when a field is changed on a record which
   * is batch updating. Occasionally UIs must keep in sync with batched changes.
   * For example, the EventResize feature performs batched updating of the startDate/endDate
   * and it tells its client to listen to batchedUpdate.
   * @private
   */

  onEventStoreBatchedUpdate(event) {
    if (this.listenToBatchedUpdates) {
      return this.onInternalEventStoreChange(event);
    }
  }
  /**
   * Calls appropriate functions for current event layout when the event store is modified.
   * @private
   */
  // Named as Internal to avoid naming collision with wrappers that relay events

  onInternalEventStoreChange(params) {
    // Too early, bail out
    // Also bail out if this is a reassign using resourceId, any updates will be handled by AssignmentStore instead
    if (!this.isPainted || !this._mode || params.isAssign || this.assignmentStore.isRemovingAssignment) {
      return;
    }

    this.currentOrientation.onEventStoreChange(params);
  }
  /**
   * Refreshes committed events, to remove dirty/committing flag.
   * CSS is added
   * @private
   */

  onEventCommit({
    changes
  }) {
    let resourcesToRepaint = [...changes.added, ...changes.modified].map(eventRecord => this.eventStore.getResourcesForEvent(eventRecord)); // getResourcesForEvent returns an array, so need to flatten resourcesToRepaint

    resourcesToRepaint = Array.prototype.concat.apply([], resourcesToRepaint); // repaint relevant resource rows

    new Set(resourcesToRepaint).forEach(resourceRecord => this.repaintEventsForResource(resourceRecord));
  }
  /**
   * Adds the committing flag to changed events before commit.
   * @private
   */

  onEventCommitStart({
    changes
  }) {
    const {
      currentOrientation,
      committingCls
    } = this; // Committing sets a flag in meta that during event rendering applies a CSS class. But to not mess up drag and
    // drop between resources no redraw is performed before committing, so class is never applied to the element(s).
    // Applying here instead

    [...changes.added, ...changes.modified].forEach(eventRecord => eventRecord.assignments.forEach(assignmentRecord => currentOrientation.toggleCls(assignmentRecord, committingCls, true)));
  } // Clear committing flag

  onEventException({
    action
  }) {
    if (action === 'commit') {
      const {
        changes
      } = this.eventStore;
      [...changes.added, ...changes.modified, ...changes.removed].forEach(eventRecord => this.repaintEvent(eventRecord));
    }
  }

  onAssignmentCommit({
    changes
  }) {
    this.repaintEventsForAssignmentChanges(changes);
  }

  onAssignmentCommitStart({
    changes
  }) {
    const {
      currentOrientation,
      committingCls
    } = this;
    [...changes.added, ...changes.modified].forEach(assignmentRecord => {
      currentOrientation.toggleCls(assignmentRecord, committingCls, true);
    });
  } // Clear committing flag

  onAssignmentException({
    action
  }) {
    if (action === 'commit') {
      this.repaintEventsForAssignmentChanges(this.assignmentStore.changes);
    }
  }

  repaintEventsForAssignmentChanges(changes) {
    const resourcesToRepaint = [...changes.added, ...changes.modified, ...changes.removed].map(assignmentRecord => assignmentRecord.getResource()); // repaint relevant resource rows

    new Set(resourcesToRepaint).forEach(resourceRecord => this.repaintEventsForResource(resourceRecord));
  }

  onAssignmentBeforeRemove({
    records,
    removingAll
  }) {
    if (removingAll) {
      return;
    }

    const me = this;
    let moveTo; // Deassigning the active assignment

    if (!me.isConfiguring && ( // If we have current active assignment or we scheduled navigating to an assignment, we should check
    // if we're removing that assignment in order to avoid navigating to it
    me.navigateToAfterRefresh || me.activeAssignment && records.includes(me.activeAssignment))) {
      // If next navigation target is removed, clean up the flag
      if (records.includes(me.navigateToAfterRefresh)) {
        me.navigateToAfterRefresh = null;
      } // If being done by a keyboard gesture then look for a close target until we find an existing record, not
      // scheduled for removal. Otherwise, push focus outside of the Scheduler.
      // This condition will react not only on meaningful keyboard action - like pressing DELETE key on selected
      // event - but also in case user started dragging and pressed CTRL (or any other key) in process.
      // https://github.com/bryntum/support/issues/3479

      if (GlobalEvents.lastInteractionType === 'key') {
        // Look for a close target until we find an existing record, not scheduled for removal. Provided
        // assignment position in store is arbitrary as well as order of removed records, it does not make much
        // sense trying to apply any specific order to them. Existing assignment next to any removed one is as
        // good as any.
        for (let i = 0, l = records.length; i < l && !moveTo; i++) {
          const assignment = records[i];

          if (assignment.resource && assignment.resource.isModel) {
            // Find next record
            let next = me.getNext(assignment); // If next record is not found or also removed, look for previous. This should not become a
            // performance bottleneck because we only can get to this code if project is committing, if
            // records are removed on a dragdrop listener and user pressed any key after mousedown, or if
            // user is operating with a keyboard and pressed [DELETE] to remove multiple records.

            if (!next || records.includes(next)) {
              next = me.getPrevious(assignment);
            }

            if (next && !records.includes(next)) {
              moveTo = next;
            }
          }
        }
      } // Move focus away from the element which will soon have no backing data.

      if (moveTo) {
        // Although removing records from assignment store will trigger project commit and consequently
        // `refresh` event on the project which will use this record to navigate to, some tests expect
        // immediate navigation
        me.navigateTo(moveTo);
        me.navigateToAfterRefresh = moveTo;
      } // Focus must exit the Scheduler's subgrid, otherwise, if a navigation
      // key gesture is delivered before the outgoing event's element has faded
      // out and been removed, navigation will be attempted from a deleted
      // event. Animated hiding is problematic.
      //
      // We cannot just revertFocus() because that might move focus back to an
      // element in a floating EventEditor which is not yet faded out and
      // been removed. Animated hiding is problematic.
      //
      // We cannot focus scheduler.timeAxisColumn.element because the browser
      // would scroll it in some way if we have horizontal overflow.
      //
      // The only thing we can know about to focus here is the Scheduler itself.
      else {
        DomHelper.focusWithoutScrolling(me.focusElement);
      }
    }
  } //endregion
  //region TimeRangeStore & TimeRanges

  /**
   * Inline time ranges, will be loaded into an internally created store if {@link Scheduler.feature.TimeRanges}
   * is enabled.
   * @config {Scheduler.model.TimeSpan[]|Object[]} timeRanges
   * @category Data
   */

  /**
   * Get/set time ranges, applies to the backing project's TimeRangeStore.
   * @member {Scheduler.model.TimeSpan[]} timeRanges
   * @accepts {Scheduler.model.TimeSpan[]|Object[]}
   * @category Data
   */

  /**
   * Get/set the time ranges store instance or config object for {@link Scheduler.feature.TimeRanges} feature.
   * @member {Core.data.Store} timeRangeStore
   * @accepts {Core.data.Store|Object}
   * @category Data
   */

  /**
   * The time ranges store instance for {@link Scheduler.feature.TimeRanges} feature.
   * @config {Core.data.Store|Object} timeRangeStore
   * @category Data
   */

  set timeRanges(timeRanges) {
    this.project.timeRanges = timeRanges;
  }

  get timeRanges() {
    return this.project.timeRanges;
  } //endregion
  //region ResourceTimeRangeStore

  /**
   * Inline resource time ranges, will be loaded into an internally created store if
   * {@link Scheduler.feature.ResourceTimeRanges ResourceTimeRanges} is enabled.
   * @config {Scheduler.model.ResourceTimeRangeModel[]|Object[]} resourceTimeRanges
   * @category Data
   */

  /**
   * Get/set time ranges, applies to the backing project's ResourceTimeRangeStore.
   * @member {Scheduler.model.ResourceTimeRangeModel[]} resourceTimeRanges
   * @accepts {Scheduler.model.ResourceTimeRangeModel[]|Object[]}
   * @category Data
   */

  /**
   * Get/set the resource time ranges store instance for {@link Scheduler.feature.ResourceTimeRanges} feature.
   * @member {Scheduler.data.ResourceTimeRangeStore} resourceTimeRangeStore
   * @accepts {Scheduler.data.ResourceTimeRangeStore|Object}
   * @category Data
   */

  /**
   * Resource time ranges store instance or config object for {@link Scheduler.feature.ResourceTimeRanges} feature.
   * @config {Scheduler.data.ResourceTimeRangeStore|Object} resourceTimeRangeStore
   * @category Data
   */

  set resourceTimeRanges(resourceTimeRanges) {
    this.project.resourceTimeRanges = resourceTimeRanges;
  }

  get resourceTimeRanges() {
    return this.project.resourceTimeRanges;
  } //endregion
  //region Other functions

  /**
   * Applies the start and end date to each event store request (formatted in the same way as the start date, defined
   * in the EventStore Model class).
   * @category Data
   */

  applyStartEndParameters({
    source: eventStore,
    params
  }) {
    const me = this,
          field = eventStore.modelClass.fieldMap.startDate;

    if (me.passStartEndParameters) {
      params[me.startParamName] = field.print(me.startDate);
      params[me.endParamName] = field.print(me.endDate);
    }
  }
  /**
   * Get events grouped by timeAxis ticks from resources array
   * @category Data
   * @param {Scheduler.model.ResourceModel[]} resources An array of resources to process. If not passed, all resources
   * will be used.
   * @param {Function} filterFn filter function to filter events if required. Optional.
   * @private
   */

  getResourcesEventsPerTick(resources, filterFn) {
    const {
      timeAxis,
      resourceStore
    } = this,
          eventsByTick = [];
    resources = resources || resourceStore.records;
    resources.forEach(resource => {
      resource.events.forEach(event => {
        if (!timeAxis.isTimeSpanInAxis(event) || filterFn && !filterFn.call(this, {
          resource,
          event
        })) {
          return;
        } // getTickFromDate may return float if event starts/ends in a middle of a tick

        let startTick = Math.floor(timeAxis.getTickFromDate(event.startDate)),
            endTick = Math.ceil(timeAxis.getTickFromDate(event.endDate)); // if startDate/endDate of the event is out of timeAxis' bounds, use first/last tick id instead

        if (startTick == -1) {
          startTick = 0;
        }

        if (endTick === -1) {
          endTick = timeAxis.ticks.length;
        }

        do {
          if (!eventsByTick[startTick]) {
            eventsByTick[startTick] = [event];
          } else {
            eventsByTick[startTick].push(event);
          }
        } while (++startTick < endTick);
      });
    });
    return eventsByTick;
  } //endregion
  //region WidgetClass
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {} //endregion

});

/**
 * @module Scheduler/view/mixin/SchedulerScroll
 */

const immediatePromise = Promise.resolve(),
      defaultScrollOptions = {
  block: 'nearest',
  edgeOffset: 20
},
      unrenderedScrollOptions = {
  highlight: false,
  focus: false
};
/**
 * Functions for scrolling to events, dates etc.
 *
 * @mixin
 */

var SchedulerScroll = (Target => class SchedulerScroll extends (Target || Base) {
  static get $name() {
    return 'SchedulerScroll';
  } //region Scroll to event

  /**
   * Scrolls an event record into the viewport.
   * If the resource store is a tree store, this method will also expand all relevant parent nodes to locate the event.
   *
   * This function is not applicable for events with multiple assignments, please use #scrollResourceEventIntoView instead.
   *
   * @param {Scheduler.model.EventModel} eventRecord the event record to scroll into view
   * @param {Object} [options] How to scroll.
   * @param {String} [options.block=nearest] How far to scroll the event: `start/end/center/nearest`.
   * @param {Number} [options.edgeOffset=20] edgeOffset A margin *in pixels* around the event to bring into view.
   * @param {Boolean|Number} [options.animate] Set to `true` to animate the scroll, or the number of milliseconds to animate over.
   * @param {Boolean} [options.highlight] Set to `true` to highlight the event element when it is in view.
   * @param {Boolean} [options.focus] Set to `true` to focus the event element when it is in view.
   * @returns {Promise} A Promise which resolves when the scrolling is complete.
   */

  scrollEventIntoView(eventRecord, options = defaultScrollOptions) {
    const me = this,
          resources = eventRecord.resources || [eventRecord];

    if (resources.length > 1) {
      throw new Error('scrollEventIntoView() is not applicable for events with multiple assignments, please use scrollResourceEventIntoView() instead.');
    }

    if (!resources.length) {
      console.warn('You have asked to scroll to an event which is not assigned to a resource');
      return immediatePromise;
    }

    return me.scrollResourceEventIntoView(resources[0], eventRecord, null, options);
  }
  /**
   * Scrolls an assignment record into the viewport.
   *
   * If the resource store is a tree store, this method will also expand all relevant parent nodes
   * to locate the event.
   *
   * @param {Scheduler.model.AssignmentModel} assignmentRecord A resource record an event record is assigned to
   * @param {Number} index DOM node index, applicable only for weekview
   * @param {Object} [options] How to scroll.
   * @param {String} [options.block=nearest] How far to scroll the event: `start/end/center/nearest`.
   * @param {Number} [options.edgeOffset=20] edgeOffset A margin *in pixels* around the event to bring into view.
   * @param {Boolean/Number} [options.animate] Set to `true` to animate the scroll, or the number of milliseconds to animate over.
   * @param {Boolean} [options.extendTimeAxis=true] By default, if the requested event is outside the time axis, the time axis is extended.
   * @param {Boolean} [options.highlight] Set to `true` to highlight the event element when it is in view.
   * @param {Boolean} [options.focus] Set to `true` to focus the event element when it is in view.
   * @returns {Promise} A Promise which resolves when the scrolling is complete.
   */

  scrollAssignmentIntoView(assignmentRecord, ...args) {
    return this.scrollResourceEventIntoView(assignmentRecord.resource, assignmentRecord.event, ...args);
  }
  /**
   * Scrolls a resource event record into the viewport.
   *
   * If the resource store is a tree store, this method will also expand all relevant parent nodes
   * to locate the event.
   *
   * @param {Scheduler.model.ResourceModel} resourceRecord A resource record an event record is assigned to
   * @param {Scheduler.model.EventModel} eventRecord An event record to scroll into view
   * @param {Number} index DOM node index, applicable only for weekview
   * @param {Object} [options] How to scroll.
   * @param {String} [options.block=nearest] How far to scroll the event: `start/end/center/nearest`.
   * @param {Number} [options.edgeOffset=20] edgeOffset A margin *in pixels* around the event to bring into view.
   * @param {Boolean|Number} [options.animate] Set to `true` to animate the scroll, or the number of milliseconds to animate over.
   * @param {Boolean} [options.extendTimeAxis=true] By default, if the requested event is outside the time axis, the time axis is extended.
   * @param {Boolean} [options.highlight] Set to `true` to highlight the event element when it is in view.
   * @param {Boolean} [options.focus] Set to `true` to focus the event element when it is in view.
   * @returns {Promise} A Promise which resolves when the scrolling is complete.
   */

  scrollResourceEventIntoView(resourceRecord, eventRecord, index, options = defaultScrollOptions) {
    var _me$expandTo;

    const me = this,
          eventStart = eventRecord.startDate,
          eventEnd = eventRecord.endDate,
          eventIsOutside = eventRecord.isScheduled && eventStart < me.timeAxis.startDate | (eventEnd > me.timeAxis.endDate) << 1;
    let el;

    if (options.edgeOffset == null) {
      options.edgeOffset = 20;
    } // Make sure event is within TimeAxis time span unless extendTimeAxis passed as false.
    // The EventEdit feature passes false because it must not mutate the TimeAxis.
    // Bitwise flag:
    //  1 === start is before TimeAxis start.
    //  2 === end is after TimeAxis end.

    if (eventIsOutside && options.extendTimeAxis !== false) {
      const currentTimeSpanRange = me.timeAxis.endDate - me.timeAxis.startDate; // Event is too wide, expand the range to encompass it.

      if (eventIsOutside === 3) {
        me.setTimeSpan(new Date(eventStart.valueOf() - currentTimeSpanRange / 2), new Date(eventEnd.getTime() + currentTimeSpanRange / 2));
      } // Event is partially or wholly outside but will fit.
      // Move the TimeAxis to include it. That will maintain visual position.
      else {
        // Event starts before
        if (eventIsOutside & 1) {
          me.setTimeSpan(new Date(eventStart), new Date(eventStart.valueOf() + currentTimeSpanRange));
        } // Event ends after
        else {
          me.setTimeSpan(new Date(eventEnd.valueOf() - currentTimeSpanRange), new Date(eventEnd));
        }
      }
    } // If we're a tree, ensure parents are expanded first

    (_me$expandTo = me.expandTo) === null || _me$expandTo === void 0 ? void 0 : _me$expandTo.call(me, resourceRecord); // Establishing element to scroll to

    el = me.getElementFromEventRecord(eventRecord, resourceRecord);

    if (el) {
      // It's usually the event wrapper that holds focus
      if (!DomHelper.isFocusable(el)) {
        el = el.parentNode;
      }

      const scroller = me.timeAxisSubGrid.scrollable; // Force horizontalscroll to be triggered directly on scroll instead of on next frame, to have events
      // already drawn when promise resolves

      me.timeAxisSubGrid.forceScrollUpdate = true; // Scroll into view with animation and highlighting if needed.

      return scroller.scrollIntoView(el, options);
    } else if (eventIsOutside && options.extendTimeAxis === false) {
      console.warn('You have asked to scroll to an event which is outside the current view and extending timeaxis is disabled');
      return immediatePromise;
    } else if (!eventRecord.isOccurrence && !me.eventStore.isAvailable(eventRecord)) {
      console.warn('You have asked to scroll to an event which is not available');
      return immediatePromise;
    } else if (eventRecord.isScheduled) {
      // Event scheduled but not rendered, scroll to calculated location
      return me.scrollUnrenderedEventIntoView(resourceRecord, eventRecord, options);
    } else {
      // Event not scheduled, just scroll resource row into view
      return me.scrollResourceIntoView(resourceRecord, options);
    }
  }
  /**
   * Scrolls an unrendered event into view. Internal function used from #scrollResourceEventIntoView.
   * @private
   */

  scrollUnrenderedEventIntoView(resourceRec, eventRec, options = defaultScrollOptions) {
    // We must only resolve when the event's element has been painted
    // *and* the scroll has fully completed.
    return new Promise(resolve => {
      const me = this,
            // Knock out highlight and focus options. They must be applied after the scroll
      // has fully completed and we have an element. Use a default edgeOffset of 20.
      modifiedOptions = Object.assign({
        edgeOffset: 20
      }, options, unrenderedScrollOptions),
            scroller = me.timeAxisSubGrid.scrollable,
            box = me.getResourceEventBox(eventRec, resourceRec),
            scrollerViewport = scroller.viewport; // Event may fall on a time not included by workingTime settings

      if (!scrollerViewport || !box) {
        resolve();
        return;
      } // In case of subPixel position, scroll the whole pixel into view

      box.x = Math.ceil(box.x);
      box.y = Math.ceil(box.y);

      const targetRect = box.translate(scrollerViewport.x - scroller.x, scrollerViewport.y - scroller.y),
            delta = scroller.getDeltaTo(targetRect, modifiedOptions)[me.isHorizontal ? 'xDelta' : 'yDelta'],
            onEventRender = async ({
        eventRecord,
        element,
        targetElement
      }) => {
        if (eventRecord === eventRec) {
          // Vertical's renderEvent is different to horizontal's
          const el = element || targetElement;
          detacher(); // Don't resolve until the scroll has fully completed.

          await initialScrollPromise; // If we were scrolling rightwards, then because the rectangle was only *estimated*
          // we must now ensure that the scroll position is fully correct for the *element*.
          // TODO: Needed? The position should be correct with the new rendering

          if (delta > 0) {
            await scroller.scrollIntoView(el, {
              edgeOffset: options.edgeOffset
            });
          }

          options.highlight && DomHelper.highlight(el);
          options.focus && el.focus();
          resolve();
        }
      },
            // On either paint or repaint of the event, resolve the scroll promise and detach the listeners.
      detacher = me.on({
        renderEvent: onEventRender
      }),
            initialScrollPromise = scroller.scrollIntoView(targetRect, modifiedOptions);
    });
  }
  /**
   * Scrolls the specified resource into view, works for both horizontal and vertical modes.
   * @param {Scheduler.model.ResourceModel} resourceRecord A resource record an event record is assigned to
   * @param {Object} [options] How to scroll.
   * @param {String} [options.column] Field name or ID of the column, or the Column instance to scroll to (in horizontal mode).
   * @param {String} [options.block] How far to scroll the element: `start/end/center/nearest`.
   * @param {Number} [options.edgeOffset] edgeOffset A margin around the element or rectangle to bring into view.
   * @param {Boolean|Number} [options.animate] Set to `true` to animate the scroll, or the number of milliseconds to animate over.
   * @param {Boolean} [options.highlight] Set to `true` to highlight the element when it is in view.
   * @returns {Promise} A promise which is resolved when the scrolling has finished.
   */

  scrollResourceIntoView(resourceRecord, options = defaultScrollOptions) {
    if (this.isVertical) {
      return this.currentOrientation.scrollResourceIntoView(resourceRecord, options);
    } else {
      return this.scrollRowIntoView(resourceRecord, options);
    }
  } //endregion
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module Scheduler/view/mixin/SchedulerRegions
 */

/**
 * Functions to get regions (bounding boxes) for scheduler, events etc.
 *
 * @mixin
 */

var SchedulerRegions = (Target => class SchedulerRegions extends (Target || Base) {
  static get $name() {
    return 'SchedulerRegions';
  } //region Orientation dependent regions

  /**
   * Gets the region represented by the schedule and optionally only for a single resource. The view will ask the
   * scheduler for the resource availability by calling getResourceAvailability. By overriding that method you can
   * constrain events differently for different resources.
   * @param {Scheduler.model.ResourceModel} resourceRecord (optional) The resource record
   * @param {Scheduler.model.EventModel} eventRecord (optional) The event record
   * @return {Core.helper.util.Rectangle} The region of the schedule
   */

  getScheduleRegion(resourceRecord, eventRecord, local = true, dateConstraints) {
    return this.currentOrientation.getScheduleRegion(...arguments);
  }
  /**
   * Gets the region, relative to the timeline view element, representing the passed resource and optionally just for a certain date interval.
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Date} startDate A start date constraining the region
   * @param {Date} endDate An end date constraining the region
   * @return {Core.helper.util.Rectangle} A Rectangle which encapsulates the resource time span
   */

  getResourceRegion(resourceRecord, startDate, endDate) {
    return this.currentOrientation.getRowRegion(...arguments);
  } //endregion
  //region ResourceEventBox

  getAssignmentEventBox(assignmentRecord, includesOutside) {
    return this.getResourceEventBox(assignmentRecord.event, assignmentRecord.resource, includesOutside);
  }
  /**
   * Get the region for a specified resources specified event.
   * @param {Scheduler.model.EventModel} eventRecord
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @param {Boolean} includeOutside Specify true to get boxes for events outside of the rendered zone in both
   *   dimensions. This option is used when calculating dependency lines, and we need to include routes from events
   *   which may be outside the rendered zone.
   * @returns {Core.helper.util.Rectangle}
   */

  getResourceEventBox(eventRecord, resourceRecord, includeOutside = false, roughly = false) {
    return this.currentOrientation.getResourceEventBox(...arguments);
  } //endregion
  //region Item box

  /**
   * Gets box for displayed item designated by the record. If several boxes are displayed for the given item
   * then the method returns all of them. Box coordinates are in view coordinate system.
   *
   * Boxes outside scheduling view timeaxis timespan and inside collapsed rows (if row defining store is a tree store)
   * will not be returned. Boxes outside scheduling view vertical visible area (i.e. boxes above currently visible
   * top row or below currently visible bottom row) will be calculated approximately.
   *
   * @param {Scheduler.model.EventModel} event
   * @return {Object|Object[]}
   * @return {Boolean} return.isPainted Whether the box was calculated for the rendered scheduled record or was
   *    approximately calculated for the scheduled record outside of the current vertical view area.
   * @return {Number} return.top
   * @return {Number} return.bottom
   * @return {Number} return.start
   * @return {Number} return.end
   * @return {String} return.relPos if the item is not rendered then provides a view relative position one of 'before', 'after'
   * @internal
   */

  getItemBox(event, includeOutside = false) {
    return event.resources.map(resource => this.getResourceEventBox(event, resource, includeOutside));
  } //endregion
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module Scheduler/view/mixin/SchedulerState
 */

const copyProperties = ['eventLayout', 'mode', 'eventColor', 'eventStyle', 'tickSize', 'fillTicks'];
/**
 * A Mixin for Scheduler that handles state. It serializes the following scheduler properties, in addition to what
 * is already stored by its superclass {@link Grid/view/mixin/GridState}:
 *
 * * eventLayout
 * * barMargin
 * * mode
 * * tickSize
 * * zoomLevel
 * * eventColor
 * * eventStyle
 *
 * See {@link Grid.view.mixin.GridState} and {@link Core.mixin.State} for more information on state.
 *
 * @mixin
 */

var SchedulerState = (Target => class SchedulerState extends (Target || Base) {
  static get $name() {
    return 'SchedulerState';
  }
  /**
   * Gets or sets scheduler's state. Check out {@link Scheduler.view.mixin.SchedulerState SchedulerState} mixin
   * and {@link Grid.view.mixin.GridState} for more details.
   * @member {Object} state
   * @property {String} state.eventLayout
   * @property {String} state.eventStyle
   * @property {String} state.eventColor
   * @property {Number} state.barMargin
   * @property {Number} state.tickSize
   * @property {Boolean} state.fillTicks
   * @property {Number} state.zoomLevel
   * @property {String} state.mode
   * @property {Object[]} state.columns
   * @property {Boolean} state.readOnly
   * @property {Number} state.rowHeight
   * @property {Object} state.scroll
   * @property {Number} state.scroll.scrollLeft
   * @property {Number} state.scroll.scrollTop
   * @property {Array} state.selectedRecords
   * @property {String} state.style
   * @property {Object} state.subGrids
   * @property {Object} state.store
   * @property {Object} state.store.sorters
   * @property {Object} state.store.groupers
   * @property {Object} state.store.filters
   */

  /**
   * Get scheduler's current state for serialization. State includes rowHeight, headerHeight, readOnly, selectedCell,
   * selectedRecordId, column states and store state etc.
   * @returns {Object} State object to be serialized
   * @private
   */

  getState() {
    return ObjectHelper.copyProperties(super.getState(), this, copyProperties);
  }
  /**
   * Apply previously stored state.
   * @param {Object} state
   * @private
   */

  applyState(state) {
    this.suspendRefresh();
    ObjectHelper.copyProperties(this, state, copyProperties);
    super.applyState(state);
    this.resumeRefresh(true);
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

var BaseRendering = (Target => class extends (Target || Base) {
  getElementFromAssignmentRecord(assignmentRecord, returnWrapper = false) {
    if (this.scheduler.isPainted && assignmentRecord) {
      var _this$scheduler$foreg, _wrapper$syncIdMap;

      const wrapper = (_this$scheduler$foreg = this.scheduler.foregroundCanvas.syncIdMap) === null || _this$scheduler$foreg === void 0 ? void 0 : _this$scheduler$foreg[assignmentRecord.id]; // Wrapper wont have syncIdMap when saving dragcreated event from editor

      return returnWrapper ? wrapper : wrapper === null || wrapper === void 0 ? void 0 : (_wrapper$syncIdMap = wrapper.syncIdMap) === null || _wrapper$syncIdMap === void 0 ? void 0 : _wrapper$syncIdMap.event;
    }

    return null;
  }

  getElementFromEventRecord(eventRecord, resourceRecord = (() => {
    var _eventRecord$resource;

    return (_eventRecord$resource = eventRecord.resources) === null || _eventRecord$resource === void 0 ? void 0 : _eventRecord$resource[0];
  })(), returnWrapper = false) {
    const assignmentRecord = this.assignmentStore.getAssignmentForEventAndResource(eventRecord, resourceRecord);
    return this.getElementFromAssignmentRecord(assignmentRecord, returnWrapper);
  }

  getElementsFromEventRecord(eventRecord, resourceRecord, returnWrapper = false) {
    const me = this; // Single event instance, as array

    if (resourceRecord) {
      return [me.getElementFromEventRecord(eventRecord, resourceRecord, returnWrapper)];
    } // All instances
    else {
      return eventRecord.resources.reduce((result, resourceRecord) => {
        const el = me.getElementFromEventRecord(eventRecord, resourceRecord, returnWrapper);
        el && result.push(el);
        return result;
      }, []);
    }
  }

});

/**
 * @module Scheduler/view/orientation/HorizontalRendering
 */

/**
 * @typedef HorizontalRenderData
 * @property {Scheduler.model.EventModel} eventRecord
 * @property {Date} start Span start
 * @property {Date} end Span end
 * @property {String} rowId Id of the resource row
 * @property {Object[]} children Child elements
 * @property {Number} startMS Wrap element start in milliseconds
 * @property {Number} endMS Span Wrap element end in milliseconds
 * @property {Number} durationMS Wrap duration in milliseconds (not just a difference between start and end)
 * @property {Number} innerStartMS Actual event start in milliseconds
 * @property {Number} innerEndMS Actual event end in milliseconds
 * @property {Number} innerDurationMS Actual event duration in milliseconds
 * @property {Boolean} startsOutsideView True if span starts before time axis start
 * @property {Boolean} endsOutsideView True if span ends after time axis end
 * @property {Number} left Absolute left coordinate of the wrap element
 * @property {Number} width
 * @property {Number} top Absolute top coordinate of the wrap element (can be changed by layout)
 * @property {Number} height
 * @property {Boolean} clippedStart True if start is clipped
 * @property {Boolean} clippedEnd True if end is clipped
 * @private
 */

const releaseEventActions$1 = {
  releaseElement: 1,
  // Not used at all at the moment
  reuseElement: 1 // Used by some other element

},
      renderEventActions$1 = {
  newElement: 1,
  reuseOwnElement: 1,
  reuseElement: 1
},
      MAX_WIDTH = 9999999,
      heightEventSorter = ({
  startDateMS: lhs
}, {
  startDateMS: rhs
}) => lhs - rhs,
      chronoFields$1 = {
  startDate: 1,
  endDate: 1,
  duration: 1
};

function getStartEnd(scheduler, eventRecord, useEnd, fieldName) {
  var _eventRecord$hasBatch;

  // Must use Model.get in order to get latest values in case we are inside a batch.
  // EventResize changes the endDate using batching to enable a tentative change
  // via the batchedUpdate event which is triggered when changing a field in a batch.
  // Fall back to accessor if propagation has not populated date fields.
  const {
    timeAxis
  } = scheduler,
        date = eventRecord.isBatchUpdating ? eventRecord.get(fieldName) : eventRecord[fieldName],
        hasBatchedChange = (_eventRecord$hasBatch = eventRecord.hasBatchedChange) === null || _eventRecord$hasBatch === void 0 ? void 0 : _eventRecord$hasBatch.call(eventRecord, fieldName),
        // fillTicks shouldn't be used during resizing for changing date for smooth animation.
  // correct date will be applied after resize, when `isResizing` will be falsy
  useTickDates = scheduler.fillTicks && (!eventRecord.meta.isResizing || !hasBatchedChange);

  if (useTickDates) {
    let tick = timeAxis.getTickFromDate(date);

    if (tick >= 0) {
      // If date matches a tick start/end, use the earlier tick
      if (useEnd && tick === Math.round(tick) && tick > 0) {
        tick--;
      }

      const tickIndex = Math.floor(tick),
            tickRecord = timeAxis.getAt(tickIndex);
      return tickRecord[fieldName].getTime();
    }
  }

  return date === null || date === void 0 ? void 0 : date.getTime();
}
/**
 * Handles event rendering in Schedulers horizontal mode. Reacts to project/store changes to keep the UI up to date.
 *
 * @internal
 */

class HorizontalRendering extends Base.mixin(BaseRendering, AttachToProjectMixin) {
  //region Config & Init
  static get configurable() {
    return {
      // It's needed to adjust visible date range in Export. Set to 100 to render additional 100px
      // worth of ticks which helps to scroll faster during export and fixes
      // issue when scrollToDate cannot reach panel end date on exceptionally narrow view
      scrollBuffer: 0,

      /**
       * Amount of pixels to extend the current visible range at both ends with when deciding which events to
       * render. Only applies when using labels or for milestones
       * @config {Number}
       * @default
       */
      bufferSize: 150,
      verticalBufferSize: 150
    };
  }

  static get properties() {
    return {
      // Map with event DOM configs, keyed by resource id
      resourceMap: new Map(),
      // Map with visible events DOM configs, keyed by row instance
      rowMap: new Map(),
      eventConfigs: [],
      // Flag to avoid transitioning on first refresh
      isFirstRefresh: true,
      toDrawOnProjectRefresh: new Set(),
      toDrawOnDataReady: new Set()
    };
  }

  construct(scheduler) {
    const me = this;
    me.client = me.scheduler = scheduler;
    me.eventSorter = me.eventSorter.bind(scheduler); // Catch scroll before renderers are called

    scheduler.scrollable.on({
      scroll: 'onEarlyScroll',
      prio: 1,
      thisObj: me
    });
    scheduler.rowManager.on({
      name: 'rowManager',
      renderDone: 'onRenderDone',
      removeRows: 'onRemoveRows',
      translateRow: 'onTranslateRow',
      beforeRowHeight: 'onBeforeRowHeightChange',
      thisObj: me
    });
    super.construct({});
  }

  init() {}

  updateVerticalBufferSize() {
    const {
      rowManager
    } = this.scheduler;

    if (this.scheduler.isPainted) {
      // Refresh rows when vertical buffer size changes to trigger event repaint. Required for the export feature.
      rowManager.renderRows(rowManager.rows);
    }
  } //endregion
  //region Region, dates & coordinates

  get visibleDateRange() {
    return this._visibleDateRange;
  }

  getDateFromXY(xy, roundingMethod, local, allowOutOfRange = false) {
    let coord = xy[0];

    if (!local) {
      coord = this.translateToScheduleCoordinate(coord);
    }

    return this.scheduler.timeAxisViewModel.getDateFromPosition(coord, roundingMethod, allowOutOfRange);
  }

  translateToScheduleCoordinate(x) {
    // Get rid of fractional pixels, to not end up with negative fractional values for pos
    const pos = x - this.scheduler.timeAxisSubGridElement.getBoundingClientRect().left; // Because we use getBoundingClientRect's left, we have to adjust for page scroll.
    // The vertical counterpart uses the _bodyRectangle which was created with that adjustment.

    return pos + this.scheduler.scrollLeft - globalThis.pageXOffset;
  }

  translateToPageCoordinate(x) {
    const element = this.scheduler.timeAxisSubGridElement;
    return x + element.getBoundingClientRect().left - element.scrollLeft;
  }
  /**
   * Gets the region, relative to the page, represented by the schedule and optionally only for a single resource.
   * This method will call getDateConstraints to allow for additional resource/event based constraints. By overriding
   * that method you can constrain events differently for different resources.
   * @param {Scheduler.model.ResourceModel} [resourceRecord] (optional) The row record
   * @param {Scheduler.model.EventModel} [eventRecord] (optional) The event record
   * @return {Core.helper.util.Rectangle} The region of the schedule
   */

  getScheduleRegion(resourceRecord, eventRecord, local = true, dateConstraints, stretch = false) {
    var _dateConstraints, _scheduler$getDateCon;

    const me = this,
          {
      scheduler
    } = me,
          {
      timeAxisSubGridElement,
      timeAxis
    } = scheduler,
          resourceMargin = (!stretch || resourceRecord) && scheduler.getResourceMargin(resourceRecord) || 0;
    let region;

    if (resourceRecord) {
      const eventElement = eventRecord && me.getElementsFromEventRecord(eventRecord, resourceRecord)[0];
      region = Rectangle.from(scheduler.getRowById(resourceRecord.id).getElement('normal'), timeAxisSubGridElement);

      if (eventElement) {
        const eventRegion = Rectangle.from(eventElement, timeAxisSubGridElement);
        region.y = eventRegion.y;
        region.bottom = eventRegion.bottom;
      } else {
        region.y = region.y + resourceMargin;
        region.bottom = region.bottom - resourceMargin;
      }
    } else {
      // TODO: This is what the function that was removed here did.
      // The coordinate space needs to be sorted out here!
      region = Rectangle.from(timeAxisSubGridElement).moveTo(null, 0);
      region.width = timeAxisSubGridElement.scrollWidth;
      region.y = region.y + resourceMargin;
      region.bottom = region.bottom - resourceMargin;
    }

    const taStart = timeAxis.startDate,
          taEnd = timeAxis.endDate;
    dateConstraints = ((_dateConstraints = dateConstraints) === null || _dateConstraints === void 0 ? void 0 : _dateConstraints.start) && dateConstraints || ((_scheduler$getDateCon = scheduler.getDateConstraints) === null || _scheduler$getDateCon === void 0 ? void 0 : _scheduler$getDateCon.call(scheduler, resourceRecord, eventRecord)) || {
      start: taStart,
      end: taEnd
    };
    let startX = scheduler.getCoordinateFromDate(dateConstraints.start ? DateHelper.max(taStart, dateConstraints.start) : taStart),
        endX = scheduler.getCoordinateFromDate(dateConstraints.end ? DateHelper.min(taEnd, dateConstraints.end) : taEnd);

    if (!local) {
      startX = me.translateToPageCoordinate(startX);
      endX = me.translateToPageCoordinate(endX);
    }

    region.left = Math.min(startX, endX);
    region.right = Math.max(startX, endX);
    return region;
  }
  /**
   * Gets the Region, relative to the timeline view element, representing the passed row and optionally just for a
   * certain date interval.
   * @param {Core.data.Model} rowRecord The row record
   * @param {Date} startDate A start date constraining the region
   * @param {Date} endDate An end date constraining the region
   * @return {Core.helper.util.Rectangle} The Rectangle which encapsulates the row
   */

  getRowRegion(rowRecord, startDate, endDate) {
    const {
      scheduler
    } = this,
          {
      timeAxis
    } = scheduler,
          row = scheduler.getRowById(rowRecord.id); // might not be rendered

    if (!row) {
      return null;
    }

    const taStart = timeAxis.startDate,
          taEnd = timeAxis.endDate,
          start = startDate ? DateHelper.max(taStart, startDate) : taStart,
          end = endDate ? DateHelper.min(taEnd, endDate) : taEnd,
          startX = scheduler.getCoordinateFromDate(start),
          endX = scheduler.getCoordinateFromDate(end, true, true),
          y = row.top,
          x = Math.min(startX, endX),
          bottom = y + row.offsetHeight;
    return new Rectangle(x, y, Math.max(startX, endX) - x, bottom - y);
  }

  getResourceEventBox(eventRecord, resourceRecord, includeOutside, roughly = false) {
    const resourceData = this.resourceMap.get(resourceRecord.id);
    let eventLayout = null,
        approx = false;

    if (resourceData) {
      eventLayout = resourceData.eventsData.find(d => d.eventRecord === eventRecord);
    } // Outside of view, layout now if supposed to be included

    if (!eventLayout) {
      eventLayout = this.getTimeSpanRenderData(eventRecord, resourceRecord, {
        viewport: true,
        timeAxis: includeOutside
      });
      approx = true;
    }

    if (eventLayout) {
      // Event layout is relative to row, need to make to absolute before returning
      const rowBox = this.scheduler.rowManager.getRecordCoords(resourceRecord, true, roughly),
            absoluteTop = eventLayout.top + rowBox.top,
            box = new Rectangle(eventLayout.left, absoluteTop, eventLayout.width, eventLayout.height); // Flag informing other parts of the code that this box is approximated

      box.layout = !approx;
      box.rowTop = rowBox.top;
      box.rowBottom = rowBox.bottom;
      box.resourceId = resourceRecord.id;
      return box;
    }

    return null;
  } //endregion
  //region Element <-> Record mapping

  resolveRowRecord(elementOrEvent) {
    const me = this,
          {
      scheduler
    } = me,
          element = elementOrEvent.nodeType ? elementOrEvent : elementOrEvent.target,
          // Fix for FF on Linux having text nodes as event.target
    el = element.nodeType === Element.TEXT_NODE ? element.parentElement : element,
          eventNode = DomHelper.up(el, scheduler.eventSelector);

    if (eventNode) {
      return me.resourceStore.getById(eventNode.dataset.resourceId);
    }

    return scheduler.getRecordFromElement(el);
  } //endregion
  //region Project

  attachToProject(project) {
    super.attachToProject(project);
    this.refreshAllWhenReady = true; // Perform a full clear when replacing the project, to not leave any references to old project in DOM

    if (!this.scheduler.isConfiguring) {
      this.clearAll({
        clearDom: true
      });
    }

    project === null || project === void 0 ? void 0 : project.on({
      name: 'project',
      refresh: 'onProjectRefresh',
      commitFinalized: 'onProjectCommitFinalized',
      thisObj: this
    });
  }

  onProjectCommitFinalized() {
    const {
      scheduler,
      toDrawOnDataReady
    } = this;

    if (scheduler.isPainted && !scheduler.refreshSuspended) {
      if (toDrawOnDataReady.size) {
        this.clearResources(toDrawOnDataReady);
        this.refreshResources(toDrawOnDataReady);
      }

      toDrawOnDataReady.clear();
    }
  }

  onProjectRefresh({
    isCalculated,
    isInitialCommit
  }) {
    const me = this,
          {
      scheduler,
      toDrawOnProjectRefresh
    } = me;

    if (scheduler.isPainted && !scheduler.isConfiguring && !scheduler.refreshSuspended) {
      // Either refresh all rows (on for example dataset or when delayed calculations are finished)
      if (me.refreshAllWhenReady || isInitialCommit && isCalculated) {
        scheduler.calculateAllRowHeights(true);
        const {
          rowManager
        } = scheduler; // Rows rendered? Refresh

        if (rowManager.topRow) {
          me.clearAll(); // Refresh only if it won't be refreshed elsewhere (SchedulerStore#onProjectRefresh())

          if (!scheduler.refreshAfterProjectRefresh) {
            // If refresh was suspended when replacing the dataset in a scrolled view we might end up with a
            // topRow outside of available range -> reset it. Call renderRows() to mimic what normally happens
            // when refresh is not suspended
            if (rowManager.topRow.dataIndex >= scheduler.store.count) {
              scheduler.renderRows(false);
            } else {
              // Dont transition first refresh / early render
              scheduler.refreshWithTransition(false, !me.isFirstRefresh && isCalculated && !isInitialCommit);
            }
          }

          me.isFirstRefresh = false;
        } // No rows yet, reinitialize (happens if initial project empty and then non empty project assigned)
        else {
          rowManager.reinitialize();
        }

        me.refreshAllWhenReady = false;
      } // Or only affected rows (if any)
      else if (toDrawOnProjectRefresh.size) {
        //me.clearResources(toDrawOnProjectRefresh);
        me.refreshResources(toDrawOnProjectRefresh);
      }

      toDrawOnProjectRefresh.clear();
    }
  } //endregion
  //region AssignmentStore

  attachToAssignmentStore(assignmentStore) {
    this.refreshAllWhenReady = true;
    super.attachToAssignmentStore(assignmentStore);

    if (assignmentStore) {
      assignmentStore.on({
        name: 'assignmentStore',
        changePreCommit: 'onAssignmentStoreChange',
        refreshPreCommit: 'onAssignmentStoreRefresh',
        thisObj: this
      });
    }
  }

  onAssignmentStoreChange({
    action,
    records: assignmentRecords = [],
    replaced,
    changes
  }) {
    const me = this,
          {
      scheduler
    } = me,
          resourceIds = new Set(assignmentRecords.map(assignmentRecord => assignmentRecord.resourceId)); // Ignore assignment changes caused by removing resources, the remove will redraw things anyway
    // Also ignore case when resource id is changed. In this case row will be refreshed by the grid

    if (me.resourceStore.isRemoving || me.resourceStore.isChangingId) {
      return;
    }

    switch (action) {
      // These operations will invalidate the graph, need to draw later
      case 'dataset':
        {
          // Ignore dataset when using single assignment mode
          if (!me.eventStore.usesSingleAssignment) {
            if (resourceIds.size) {
              me.refreshResourcesWhenReady(resourceIds);
            } else {
              me.clearAll();
              scheduler.refreshWithTransition();
            }
          }

          return;
        }

      case 'add':
      case 'remove':
      case 'updateMultiple':
        // TODO: Dont think updateMultiple is covered by any test...
        me.refreshResourcesWhenReady(resourceIds);
        return;

      case 'removeall':
        me.refreshAllWhenReady = true;
        return;

      case 'replace':
        // Gather resources from both the old record and the new one
        replaced.forEach(([oldAssignment, newAssignment]) => {
          resourceIds.add(oldAssignment.resourceId);
          resourceIds.add(newAssignment.resourceId);
        }); // And refresh them

        me.refreshResourcesWhenReady(resourceIds);
        return;
      // These operations wont invalidate the graph, redraw now

      case 'filter':
        me.clearAll();
        scheduler.calculateAllRowHeights(true);
        scheduler.refreshWithTransition();
        return;

      case 'update':
        {
          if ('eventId' in changes || 'resourceId' in changes || 'id' in changes) {
            // When reassigning, clear old resource also
            if ('resourceId' in changes) {
              resourceIds.add(changes.resourceId.oldValue);
            }

            me.refreshResourcesOnDataReady(resourceIds);
          }
        }
    }
  }

  onAssignmentStoreRefresh({
    action,
    records
  }) {
    if (action === 'batch') {
      this.clearAll();
      this.scheduler.refreshWithTransition();
    }
  } //endregion
  //region EventStore

  attachToEventStore(eventStore) {
    this.refreshAllWhenReady = true;
    super.attachToEventStore(eventStore);

    if (eventStore) {
      eventStore.on({
        name: 'eventStore',
        refreshPreCommit: 'onEventStoreRefresh',
        thisObj: this
      });
    }
  }

  onEventStoreRefresh({
    action
  }) {
    if (action === 'batch') {
      const {
        scheduler
      } = this;

      if (scheduler.isEngineReady && scheduler.isPainted) {
        this.clearAll();
        scheduler.refreshWithTransition();
      } // else {
      //     this.refreshAllWhenReady = true;
      // }

    }
  }

  onEventStoreChange({
    action,
    records: eventRecords = [],
    record,
    replaced,
    changes,
    source
  }) {
    const me = this,
          {
      scheduler
    } = me,
          isResourceTimeRange = source.isResourceTimeRangeStore,
          resourceIds = new Set();

    if (!scheduler.isPainted) {
      return;
    }

    eventRecords.forEach(eventRecord => {
      var _eventRecord$resource;

      // When rendering a Gantt project, the project model also passes through here -> no `resources`
      (_eventRecord$resource = eventRecord.resources) === null || _eventRecord$resource === void 0 ? void 0 : _eventRecord$resource.forEach(resourceRecord => resourceIds.add(resourceRecord.id));
    });

    if (isResourceTimeRange) {
      switch (action) {
        // - dataset cant pass through same path as events, which relies on project being invalidated. and
        // resource time ranges does not pass through engine
        // - removeall also needs special path, since no resources to redraw will be collected
        case 'removeall':
        case 'dataset':
          me.clearAll();
          scheduler.refreshWithTransition();
          return;
      }

      me.refreshResources(resourceIds);
    } else {
      switch (action) {
        // No-ops
        case 'batch': // Handled elsewhere, dont want it to clear again

        case 'sort': // Order in EventStore does not matter, so these actions are no-ops

        case 'group':
        case 'move':
          return;

        case 'remove':
          // Remove is a no-op since assignment will also be removed
          return;

        case 'clearchanges':
          me.clearAll();
          scheduler.refreshWithTransition();
          return;

        case 'dataset':
          me.clearAll();
          me.refreshAllWhenReady = true;
          return;

        case 'add':
        case 'updateMultiple':
          // Just refresh below
          break;

        case 'replace':
          // Gather resources from both the old record and the new one
          replaced.forEach(([, newEvent]) => {
            // Old cleared by changed assignment
            newEvent.resources.map(resourceRecord => resourceIds.add(resourceRecord.id));
          });
          break;

        case 'removeall':
        case 'filter':
          // Filter might be caused by add retriggering filters, in which case we need to refresh later
          if (!scheduler.isEngineReady) {
            me.refreshAllWhenReady = true;
            return;
          } // Clear all when filtering for simplicity. If that turns out to give bad performance, one would need to
          // figure out which events was filtered out and only clear their resources.

          me.clearAll();
          scheduler.calculateAllRowHeights(true);
          scheduler.refreshWithTransition();
          return;

        case 'update':
          {
            // Check if changes are graph related or not
            const allChrono = record.$entity ? !Object.keys(changes).some(name => !record.$entity.getField(name)) : !Object.keys(changes).some(name => !chronoFields$1[name]);
            let dateChanges = 0;
            'startDate' in changes && dateChanges++;
            'endDate' in changes && dateChanges++;
            'duration' in changes && dateChanges++;

            if ('resourceId' in changes) {
              resourceIds.add(changes.resourceId.oldValue);
            } // Always redraw non chrono changes (name etc) and chrono changes that can affect appearance

            if (!allChrono || // skip case when changed "duration" only (w/o start/end affected)
            dateChanges && !('duration' in changes && dateChanges === 1) || 'percentDone' in changes || 'inactive' in changes) {
              var _me$project, _me$project2;

              // if we are finalizing data loading let's delay the resources refresh till all the
              // propagation results get into stores
              if ((_me$project = me.project) !== null && _me$project !== void 0 && _me$project.propagatingLoadChanges || (_me$project2 = me.project) !== null && _me$project2 !== void 0 && _me$project2.isWritingData) {
                me.refreshResourcesOnDataReady(resourceIds);
              } else {
                me.refreshResources(resourceIds);
              }
            }

            return;
          }
      }

      me.refreshResourcesWhenReady(resourceIds);
    }
  } //endregion
  //region ResourceStore

  attachToResourceStore(resourceStore) {
    this.refreshAllWhenReady = true;
    super.attachToResourceStore(resourceStore);

    if (resourceStore) {
      this.clearAll({
        clearLayoutCache: true
      });
      resourceStore.on({
        name: 'resourceStore',
        changePreCommit: 'onResourceStoreChange',
        thisObj: this
      });
    }
  }

  onResourceStoreChange({
    action,
    isExpand,
    records,
    changes
  }) {
    const me = this,
          resourceIds = records === null || records === void 0 ? void 0 : records.map(r => r.id);

    if (!me.scheduler.isPainted) {
      return;
    }

    switch (action) {
      case 'add':
        // #635 Events disappear when toggling other node
        // If we are expanding project won't fire refresh event
        if (!isExpand) {
          me.refreshResourcesWhenReady(resourceIds);
        }

        return;

      case 'update':
        {
          // Ignore changes from project commit, if they affect events they will be redrawn anyway
          // Also ignore explicit transformation of leaf <-> parent
          if (!me.project.isBatchingChanges && !changes.isLeaf) {
            // Resource changes might affect events, refresh
            me.refreshResources(resourceIds);
          }

          return;
        }

      case 'filter':
        // Bail out on filter action. Map was already updated on `refresh` event triggered before this `change`
        // one. And extra records are removed from rowMap by `onRemoveRows`
        return;

      case 'removeall':
        me.clearAll({
          clearLayoutCache: true
        });
        return;
      // We must not clear all resources when whole dataset changes
      // https://github.com/bryntum/support/issues/3292

      case 'dataset':
        return;
    }

    resourceIds && me.clearResources(resourceIds);
  } //endregion
  //region RowManager

  onTranslateRow({
    row
  }) {
    // Newly added rows are translated prior to having an id, rule those out since they will be rendered later
    if (row.id != null) {
      // Event layouts are stored relative to the resource, only need to rerender the row to have its absolute
      // position updated to match new translation
      this.refreshEventsForResource(row, false);
    }
  } // Used to pre-calculate row heights

  calculateRowHeight(resourceRecord) {
    const {
      scheduler
    } = this,
          rowHeight = scheduler.getResourceHeight(resourceRecord),
          eventLayout = scheduler.getEventLayout(resourceRecord),
          layoutType = eventLayout.type;

    if (layoutType === 'stack' && scheduler.isEngineReady && !resourceRecord.isSpecialRow && resourceRecord.assigned.size > 1) {
      const {
        assignmentStore,
        eventStore,
        timeAxis
      } = scheduler,
            {
        barMargin,
        resourceMargin
      } = scheduler.getResourceLayoutSettings(resourceRecord),
            heightPerEvent = rowHeight - resourceMargin * 2,
            // When using an AssignmentStore we will get all events for the resource even if the EventStore is
      // filtered
      eventFilter = (eventStore.isFiltered || assignmentStore.isFiltered) && (eventRecord => eventRecord.assignments.some(a => a.resource === resourceRecord && assignmentStore.includes(a))),
            events = eventStore.getEvents({
        resourceRecord,
        includeOccurrences: scheduler.enableRecurringEvents,
        startDate: timeAxis.startDate,
        endDate: timeAxis.endDate,
        filter: eventFilter
      }).sort(heightEventSorter).map(eventRecord => {
        const // Must use Model.get in order to get latest values in case we are inside a batch.
        // EventResize changes the endDate using batching to enable a tentative change
        // via the batchedUpdate event which is triggered when changing a field in a batch.
        // Fall back to accessor if propagation has not populated date fields.
        startDate = eventRecord.isBatchUpdating ? eventRecord.get('startDate') : eventRecord.startDate,
              endDate = eventRecord.isBatchUpdating ? eventRecord.get('endDate') : eventRecord.endDate || startDate;
        return {
          eventRecord,
          resourceRecord,
          startMS: startDate.getTime(),
          endMS: endDate.getTime()
        };
      }),
            layoutHandler = scheduler.getEventLayoutHandler(eventLayout),
            nbrOfBandsRequired = layoutHandler.layoutEventsInBands(events, true);

      if (layoutHandler.type === 'layoutFn') {
        return nbrOfBandsRequired;
      } else {
        return nbrOfBandsRequired * heightPerEvent + (nbrOfBandsRequired - 1) * barMargin + resourceMargin * 2;
      }
    } else {
      return rowHeight;
    }
  } //endregion
  //region TimeAxis

  doUpdateTimeView() {
    this.updateFromHorizontalScroll(this.scheduler.timeAxisSubGrid.scrollable.x);
  }

  onTimeAxisViewModelUpdate() {
    const me = this,
          {
      scheduler
    } = me;
    me.clearAll(); // If refresh is suspended, update timeView as soon as refresh gets unsuspended

    if (scheduler.refreshSuspended) {
      me.detachListeners('renderingSuspend');
      scheduler.on({
        name: 'renderingSuspend',

        resumeRefresh({
          trigger
        }) {
          // This code will try to refresh rows, but resumeRefresh event doesn't guarantee rowManager rows are
          // in actual state. e.g. if resources were removed during a suspended refresh rowManager won't get a
          // chance to update them until `refresh` event from the project. We can safely update the view only
          // if engine in ready (not committing), otherwise we leave refresh a liability of normal project refresh
          // logic. Covered by SchedulerRendering.t.js
          // https://github.com/bryntum/support/issues/1462
          if (scheduler.isEngineReady && trigger) {
            me.doUpdateTimeView();
          }
        },

        thisObj: me,
        once: true
      });
    } // Call update anyway. If refresh is suspended this call will only update visible date range and will not redraw rows

    me.doUpdateTimeView();
  } //endregion
  //region Dependency connectors

  /**
   * Gets displaying item start side
   *
   * @param {Scheduler.model.EventModel} eventRecord
   * @return {String} 'left' / 'right' / 'top' / 'bottom'
   */

  getConnectorStartSide(eventRecord) {
    return 'left';
  }
  /**
   * Gets displaying item end side
   *
   * @param {Scheduler.model.EventModel} eventRecord
   * @return {String} 'left' / 'right' / 'top' / 'bottom'
   */

  getConnectorEndSide(eventRecord) {
    return 'right';
  } //endregion
  //region Scheduler hooks

  refreshRows(reLayoutEvents) {
    if (reLayoutEvents) {
      this.clearAll();
    }
  } // Clear events in case they use date as part of displayed info

  onLocaleChange() {
    this.clearAll();
  } // Called when viewport size changes

  onViewportResize(width, height, oldWidth, oldHeight) {
    // We dont draw events for all rendered rows, "refresh" when height changes to make sure events in previously
    // invisible rows gets displayed
    if (height > oldHeight) {
      this.onRenderDone();
    }
  } // Called from EventDrag

  onDragAbort({
    context,
    dragData
  }) {
    // Aborted a drag in a scrolled scheduler, with origin now out of view. Element is no longer needed
    if (this.resourceStore.indexOf(dragData.record.resource) < this.scheduler.topRow.dataIndex) {
      context.element.remove();
    }
  } // Called from EventSelection

  toggleCls(assignmentRecord, cls, add = true, useWrapper = false) {
    const element = this.getElementFromAssignmentRecord(assignmentRecord, useWrapper),
          // TODO: Should be assignmentRecord.resourceId, but breaks engine. Hoping https://github.com/bryntum/bryntum-suite/pull/1252 will fix it
    resourceData = this.resourceMap.get(assignmentRecord.isModel ? assignmentRecord.get('resourceId') : assignmentRecord.resourceId),
          eventData = resourceData === null || resourceData === void 0 ? void 0 : resourceData.eventsData.find(d => d.eventId === assignmentRecord.eventId); // Update cached config

    if (eventData) {
      eventData[useWrapper ? 'wrapperCls' : 'cls'][cls] = add;
    } // Live update element

    if (element) {
      // Update element
      element.classList[add ? 'add' : 'remove'](cls); // And its DOM config

      element.lastDomConfig.className[cls] = add;
    }
  } // React to rows being removed, refreshes view without any relayouting needed since layout is cached relative to row

  onRemoveRows({
    rows
  }) {
    rows.forEach(row => this.rowMap.delete(row));
    this.onRenderDone();
  } // Reset renderer flag before any renderers are called

  onEarlyScroll() {
    this.rendererCalled = false;
  } // If vertical scroll did not cause a renderer to be called we still want to update since we only draw events in
  // view, "independent" from their rows

  updateFromVerticalScroll() {
    if (!this.rendererCalled) {
      this.onRenderDone();
    }
  } // Update header range on horizontal scroll. No need to draw any tasks, Gantt only cares about vertical scroll

  updateFromHorizontalScroll(scrollLeft) {
    const me = this,
          {
      scheduler,
      // scrollBuffer is an export only thing
      scrollBuffer
    } = me,
          {
      timeAxisSubGrid,
      timeAxis
    } = scheduler,
          width = timeAxisSubGrid.width,
          // If there are few pixels left from the right most position then just render all remaining ticks,
    // there wouldn't be many. It makes end date reachable with more page zoom levels while not having any poor
    // implications.
    // 5px to make TimeViewRangePageZoom test stable in puppeteer.
    returnEnd = timeAxisSubGrid.scrollable.maxX <= Math.round(scrollLeft) + 5,
          startDate = scheduler.getDateFromCoordinate(Math.max(0, scrollLeft - scrollBuffer)),
          endDate = returnEnd ? timeAxis.endDate : scheduler.getDateFromCoordinate(scrollLeft + width + scrollBuffer) || timeAxis.endDate;

    if (startDate && !scheduler._viewPresetChanging) {
      me._visibleDateRange = {
        startDate,
        endDate,
        startMS: startDate.getTime(),
        endMS: endDate.getTime()
      };
      me.viewportCoords = {
        left: scrollLeft - scrollBuffer,
        right: scrollLeft + width + scrollBuffer
      }; // Update timeaxis header making it display the new dates

      const range = scheduler.timeView.range = {
        startDate,
        endDate
      };
      scheduler.onVisibleDateRangeChange(range);
      scheduler.trigger('visibleRangeChange', range); // If refresh is suspended, someone else is responsible for updating the UI later

      if (!scheduler.refreshSuspended && scheduler.rowManager.rows.length) {
        // Gets here too early in Safari for ResourceHistogram. ResizeObserver triggers a scroll before rows are
        // rendered first time. Could not track down why, bailing out
        if (scheduler.rowManager.rows[0].id === null) {
          return;
        }

        scheduler.rowManager.rows.forEach(row => me.refreshEventsForResource(row, false));
        me.onRenderDone();
      }
    }
  } // Called from SchedulerEventRendering

  repaintEventsForResource(resourceRecord) {
    this.refreshResources([resourceRecord.id]);
  }

  onBeforeRowHeightChange() {
    // Row height is cached per resource, all have to be re-laid out
    this.clearAll();
  } //endregion
  //region Refresh resources

  refreshResourcesOnDataReady(resourceIds) {
    resourceIds.forEach(id => this.toDrawOnDataReady.add(id));
  }
  /**
   * Clears resources directly and redraws them on next project refresh
   * @param {Number[]|String[]} resourceIds
   * @private
   */

  refreshResourcesWhenReady(resourceIds) {
    this.clearResources(resourceIds);
    resourceIds.forEach(id => this.toDrawOnProjectRefresh.add(id));
  }
  /**
   * Clears and redraws resources directly. Respects schedulers refresh suspension
   * @param {Number[]|String[]} ids Resource ids
   * @param {Boolean} [transition] Use transition or not
   * @private
   */

  refreshResources(ids, transition = true) {
    const me = this,
          {
      scheduler
    } = me,
          rows = [],
          noRows = [];
    me.clearResources(ids);

    if (!scheduler.refreshSuspended) {
      ids.forEach(id => {
        const row = scheduler.getRowById(id);

        if (row) {
          rows.push(row);
        } else {
          noRows.push(row);
        }
      });
      scheduler.runWithTransition(() => {
        // Rendering rows populates row heights, but not all resources might have a row in view
        scheduler.calculateRowHeights(noRows.map(id => this.resourceStore.getById(id)), true); // Render those that do

        scheduler.rowManager.renderRows(rows);
      }, transition);
    }
  } //endregion
  //region Stack & pack

  layoutEventVerticallyStack(bandIndex, eventRecord, resourceRecord) {
    const {
      barMargin,
      resourceMargin,
      rowHeight
    } = this.scheduler.getResourceLayoutSettings(resourceRecord);
    return bandIndex === 0 ? resourceMargin : resourceMargin + bandIndex * (rowHeight - resourceMargin * 2) + bandIndex * barMargin;
  }

  layoutEventVerticallyPack(topFraction, heightFraction, eventRecord, resourceRecord) {
    const {
      barMargin,
      resourceMargin,
      rowHeight
    } = this.scheduler.getResourceLayoutSettings(resourceRecord),
          // TODO reduce grid row borders when available, https://app.assembla.com/spaces/bryntum/tickets/5840-measure-grid-row-border-at-first-render/details#
    availableHeight = rowHeight - 2 * resourceMargin,
          count = 1 / heightFraction,
          bandIndex = topFraction * count,
          // "y" within row
    height = (availableHeight - (count - 1) * barMargin) * heightFraction,
          top = resourceMargin + bandIndex * height + bandIndex * barMargin;
    return {
      top,
      height
    };
  } //endregion
  //region Render

  /**
   * Used by event drag features to bring into existence event elements that are outside of the rendered block.
   * @param {Scheduler.model.TimeSpan} eventRecord The event to render
   * @param {Scheduler.model.ResourceModel} [resourceRecord] The event to render
   * @private
   */

  addTemporaryDragElement(eventRecord, resourceRecord = eventRecord.resource) {
    const {
      scheduler
    } = this,
          renderData = scheduler.generateRenderData(eventRecord, resourceRecord, {
      timeAxis: true,
      viewport: true
    });
    renderData.absoluteTop = renderData.row ? renderData.top + renderData.row.top : scheduler.getResourceEventBox(eventRecord, resourceRecord, true).top;
    const domConfig = this.renderEvent(renderData),
          {
      dataset
    } = domConfig;
    delete domConfig.tabIndex;
    delete dataset.eventId;
    delete dataset.resourceId;
    delete dataset.assignmentId;
    delete dataset.syncId;
    dataset.transient = true;
    domConfig.parent = this.scheduler.foregroundCanvas; // So that the regular DomSyncing which may happen during scroll does not
    // sweep up and reuse the temporary element.

    domConfig.retainElement = true;
    const result = DomHelper.createElement(domConfig);
    result.innerElement = result.firstChild;
    eventRecord.instanceMeta(scheduler).hasTemporaryDragElement = true;
    return result;
  } // Earlier start dates are above later tasks
  // If same start date, longer tasks float to top
  // If same start + duration, sort by name
  // Fn can be called with layout date or event records (from EventNavigation)

  eventSorter(a, b) {
    if (this.overlappingEventSorter) {
      return this.overlappingEventSorter(a.eventRecord || a, b.eventRecord || b);
    }

    const // TODO: Rename startMS -> startDateMS to not have to have isModel check here (and to be consistent)
    startA = a.isModel ? a.startDateMS : a.dataStartMS || a.startMS,
          // dataXX are used if configured with fillTicks
    endA = a.isModel ? a.endDateMS : a.dataEndMS || a.endMS,
          startB = b.isModel ? b.startDateMS : b.dataStartMS || b.startMS,
          endB = b.isModel ? b.endDateMS : b.dataEndMS || b.endMS,
          nameA = a.isModel ? a.name : a.eventRecord.name,
          nameB = b.isModel ? b.name : b.eventRecord.name;
    return startA - startB || endB - endA || (nameA < nameB ? -1 : nameA == nameB ? 0 : 1);
  }
  /**
   * Converts a start/endDate into a MS value used when rendering the event. If scheduler is configured with
   * `fillTicks: true` the value returned will be snapped to tick start/end.
   * @private
   * @param {Scheduler.model.TimeSpan} eventRecord
   * @param {String} startDateField
   * @param {String} endDateField
   * @returns {Object} Object of format { startMS, endMS, durationMS }
   */

  calculateMS(eventRecord, startDateField, endDateField) {
    const me = this,
          {
      scheduler
    } = me,
          {
      timeAxisViewModel
    } = scheduler;
    let startMS = getStartEnd(scheduler, eventRecord, false, startDateField),
        endMS = getStartEnd(scheduler, eventRecord, true, endDateField),
        durationMS = endMS - startMS;

    if (scheduler.milestoneLayoutMode !== 'default' && durationMS === 0) {
      const pxPerMinute = timeAxisViewModel.getSingleUnitInPixels('minute'),
            lengthInPx = scheduler.getMilestoneLabelWidth(eventRecord),
            duration = lengthInPx * (1 / pxPerMinute);
      durationMS = duration * 60 * 1000;

      switch (scheduler.milestoneAlign) {
        case 'start':
        case 'left':
          endMS = startMS + durationMS;
          break;

        case 'end':
        case 'right':
          endMS = startMS;
          startMS = endMS - durationMS;
          break;

        default:
          // using center as default
          endMS = startMS + durationMS / 2;
          startMS = endMS - durationMS;
          break;
      }
    }

    return {
      startMS,
      endMS,
      durationMS
    };
  }
  /**
   * Returns event render data except actual position information.
   * @param timeSpan
   * @param rowRecord
   * @returns {HorizontalRenderData}
   * @private
   */

  setupRenderData(timeSpan, rowRecord) {
    var _scheduler$features$e;

    const me = this,
          {
      scheduler
    } = me,
          {
      timeAxis,
      timeAxisViewModel
    } = scheduler,
          {
      preamble,
      postamble
    } = timeSpan,
          useEventBuffer = ((_scheduler$features$e = scheduler.features.eventBuffer) === null || _scheduler$features$e === void 0 ? void 0 : _scheduler$features$e.enabled) && me.isProHorizontalRendering && (preamble || postamble) && !timeSpan.isMilestone,
          pxPerMinute = timeAxisViewModel.getSingleUnitInPixels('minute'),
          {
      isBatchUpdating
    } = timeSpan,
          startDateField = useEventBuffer ? 'wrapStartDate' : 'startDate',
          endDateField = useEventBuffer ? 'wrapEndDate' : 'endDate',
          // Must use Model.get in order to get latest values in case we are inside a batch.
    // EventResize changes the endDate using batching to enable a tentative change
    // via the batchedUpdate event which is triggered when changing a field in a batch.
    // Fall back to accessor if propagation has not populated date fields.
    // Use endDate accessor if duration has not been propagated to create endDate
    timespanStart = isBatchUpdating ? timeSpan.get(startDateField) : timeSpan[startDateField],
          // Allow timespans to be rendered even when they are missing an end date
    timespanEnd = isBatchUpdating ? timeSpan.get(endDateField) : timeSpan[endDateField] || timespanStart,
          viewStartMS = timeAxis.startMS,
          viewEndMS = timeAxis.endMS,
          {
      startMS,
      endMS,
      durationMS
    } = me.calculateMS(timeSpan, startDateField, endDateField),
          // These flags have two components because includeOutsideViewport
    // means that we can be calculating data for events either side of
    // the TimeAxis.
    // The start is outside of the view if it's before *or after* the TimeAxis range.
    // 1 set means the start is before the TimeAxis
    // 2 set means the start is after the TimeAxis
    // Either way, a truthy value means that the start is outside of the TimeAxis.
    startsOutsideView = startMS < viewStartMS | (startMS > viewEndMS) << 1,
          // The end is outside of the view if it's before *or after* the TimeAxis range.
    // 1 set means the end is after the TimeAxis
    // 2 set means the end is before the TimeAxis
    // Either way, a truthy value means that the end is outside of the TimeAxis.
    endsOutsideView = endMS > viewEndMS | (endMS <= viewStartMS) << 1,
          durationMinutes = durationMS / (1000 * 60),
          width = endsOutsideView ? pxPerMinute * durationMinutes : null,
          row = scheduler.getRowById(rowRecord);
    return {
      eventRecord: timeSpan,
      taskRecord: timeSpan,
      // Helps with using Gantt projects in Scheduler Pro
      start: timespanStart,
      end: timespanEnd,
      rowId: rowRecord.id,
      children: [],
      startMS,
      endMS,
      durationMS,
      startsOutsideView,
      endsOutsideView,
      width,
      row,
      useEventBuffer
    };
  }
  /**
   * Populates render data with information about width and horizontal position of the wrap.
   * @param {HorizontalRenderData} renderData
   * @returns {Boolean}
   * @private
   */

  fillTimeSpanHorizontalPosition(renderData) {
    const {
      startMS,
      endMS,
      durationMS
    } = renderData;
    const result = this.calculateHorizontalPosition(renderData, startMS, endMS, durationMS);

    if (result) {
      Object.assign(renderData, result);
      return true;
    } else {
      return false;
    }
  }
  /**
   * Fills render data with `left` and `width` properties
   * @param {HorizontalRenderData} renderData
   * @param {Number} startMS
   * @param {Number} endMS
   * @param {Number} durationMS
   * @returns {{left: number, width: number, clippedStart: boolean, clippedEnd: boolean}|null}
   * @private
   */

  calculateHorizontalPosition(renderData, startMS, endMS, durationMS) {
    const {
      scheduler
    } = this,
          {
      timeAxis,
      timeAxisViewModel
    } = scheduler,
          {
      startsOutsideView,
      endsOutsideView,
      eventRecord
    } = renderData,
          viewStartMS = timeAxis.startMS,
          pxPerMinute = timeAxisViewModel.getSingleUnitInPixels('minute'),
          durationMinutes = durationMS / (1000 * 60),
          width = endsOutsideView ? pxPerMinute * durationMinutes : null;
    let endX = scheduler.getCoordinateFromDate(endMS, {
      local: true,
      respectExclusion: true,
      isEnd: true
    }),
        startX,
        clippedStart = false,
        clippedEnd = false; // If event starts outside of view, estimate where.

    if (startsOutsideView) {
      startX = (startMS - viewStartMS) / (1000 * 60) * pxPerMinute;
    } // Starts in view, calculate exactly
    else {
      // If end date is included in time axis but start date is not (when using time axis exclusions), snap start date to next included data
      startX = scheduler.getCoordinateFromDate(startMS, {
        local: true,
        respectExclusion: true,
        isEnd: false,
        snapToNextIncluded: endX !== -1
      });
      clippedStart = startX === -1;
    }

    if (endsOutsideView) {
      // Have to clip the events in Safari when using stickyEvents, it does not support `overflow: clip`
      if (BrowserHelper.isSafari && scheduler.features.stickyEvents) {
        endX = scheduler.getCoordinateFromDate(timeAxis.endMS);
      } else {
        endX = startX + width;
      }
    } else {
      clippedEnd = endX === -1;
    }

    if (clippedEnd && !clippedStart) {
      // We know where to start but not where to end, snap it (the opposite is already handled by the
      // snapToNextIncluded flag when calculating startX above)
      endX = scheduler.getCoordinateFromDate(endMS, {
        local: true,
        respectExclusion: true,
        isEnd: true,
        snapToNextIncluded: true
      });
    } // If the element is very wide there's no point in displaying it all.
    // Indeed the element may not be displayable at extremely large widths.

    if (width > MAX_WIDTH) {
      // The start is before the TimeAxis start
      if (startsOutsideView === 1) {
        // Both ends outside - spans TimeAxis
        if (endsOutsideView === 1) {
          startX = -100;
          endX = scheduler.timeAxisColumn.width + 100;
        } // End is in view
        else {
          startX = endX - MAX_WIDTH;
        }
      } // The end is after, but the start is in view
      else if (endsOutsideView === 1) {
        endX = startX + MAX_WIDTH;
      }
    }

    if (clippedStart && clippedEnd) {
      // Both ends excluded, but there might be some part in between that should be displayed...
      startX = scheduler.getCoordinateFromDate(startMS, {
        local: true,
        respectExclusion: true,
        isEnd: false,
        snapToNextIncluded: true,
        max: endMS
      });
      endX = scheduler.getCoordinateFromDate(endMS, {
        local: true,
        respectExclusion: true,
        isEnd: true,
        snapToNextIncluded: true,
        min: startMS
      });

      if (startX === endX) {
        // Raise flag on instance meta to avoid duplicating this logic
        eventRecord.instanceMeta(scheduler).excluded = true; // Excluded by time axis exclusion rules, render nothing

        return null;
      }
    }

    return {
      left: Math.min(startX, endX),
      // Use min width 5 for normal events, 0 for milestones (wont have width specified at all in the
      // end). During drag create a normal event can get 0 duration, in this case we still want it to
      // get a min width of 5 (6px for wrapper, -1 px for event element
      width: Math.abs(endX - startX) || (eventRecord.isMilestone && !eventRecord.meta.isDragCreating ? 0 : 6),
      clippedStart,
      clippedEnd
    };
  }

  fillTimeSpanVerticalPosition(renderData, rowRecord) {
    const {
      scheduler
    } = this,
          {
      start,
      end
    } = renderData,
          {
      resourceMargin,
      rowHeight
    } = scheduler.getResourceLayoutSettings(rowRecord); // If filling ticks we need to also keep data's MS values, since they are used for sorting timespans

    if (scheduler.fillTicks) {
      renderData.dataStartMS = start.getTime();
      renderData.dataEndMS = end.getTime();
    }

    renderData.top = Math.max(0, resourceMargin);

    if (scheduler.managedEventSizing) {
      // Timespan height should be at least 1px
      renderData.height = Math.max(rowHeight - 2 * resourceMargin, 1);
    }
  }
  /**
   * Gets timespan coordinates etc. Relative to containing row. If the timespan is outside of the zone in
   * which timespans are rendered, that is outside of the TimeAxis, or outside of the vertical zone in which timespans
   * are rendered, then `undefined` is returned.
   * @private
   * @param {Scheduler.model.TimeSpan} timeSpan TimeSpan record
   * @param {Core.data.Model} rowRecord Row record
   * @param {Boolean|Object} includeOutside Specify true to get boxes for timespans outside of the rendered zone in both
   * dimensions. This option is used when calculating dependency lines, and we need to include routes from timespans
   * which may be outside the rendered zone.
   * @param {Boolean} includeOutside.timeAxis Pass as `true` to include timespans outside of the TimeAxis's bounds
   * @param {Boolean} includeOutside.viewport Pass as `true` to include timespans outside of the vertical timespan viewport's bounds.
   * @returns {{event/task: *, left: number, width: number, start: (Date), end: (Date), startMS: number, endMS: number, startsOutsideView: boolean, endsOutsideView: boolean}}
   */

  getTimeSpanRenderData(timeSpan, rowRecord, includeOutside = false) {
    const me = this,
          {
      scheduler
    } = me,
          {
      timeAxis
    } = scheduler,
          includeOutsideTimeAxis = includeOutside === true || includeOutside.timeAxis,
          includeOutsideViewport = includeOutside === true || includeOutside.viewport; // If timespan is outside the TimeAxis, give up trying to calculate a layout (Unless we're including timespans
    // outside our zone)

    if (includeOutsideTimeAxis || timeAxis.isTimeSpanInAxis(timeSpan)) {
      const row = scheduler.getRowById(rowRecord);

      if (row || includeOutsideViewport) {
        const data = me.setupRenderData(timeSpan, rowRecord);

        if (!me.fillTimeSpanHorizontalPosition(data)) {
          return null;
        }

        me.fillTimeSpanVerticalPosition(data, rowRecord);
        return data;
      }
    }
  } // Lay out events within a resource, relative to the resource

  layoutResourceEvents(resourceRecord, includeOutside = false) {
    const me = this,
          {
      scheduler
    } = me,
          {
      eventStore,
      assignmentStore,
      timeAxis
    } = scheduler,
          // Events for this resource
    resourceEvents = eventStore.getEvents({
      includeOccurrences: scheduler.enableRecurringEvents,
      resourceRecord,
      startDate: timeAxis.startDate,
      endDate: timeAxis.endDate,
      filter: (assignmentStore.isFiltered || eventStore.isFiltered) && (eventRecord => eventRecord.assignments.some(a => a.resource === resourceRecord && assignmentStore.includes(a)))
    }),
          // Call a chainable template function on scheduler to allow features to add additional "events" to render
    // Currently used by ResourceTimeRanges & CalendarHighlight
    allEvents = scheduler.getEventsToRender(resourceRecord, resourceEvents) || [],
          // Generate layout data
    eventsData = allEvents.reduce((result, eventRecord) => {
      // Only those in time axis (by default)
      if (includeOutside || timeAxis.isTimeSpanInAxis(eventRecord)) {
        const eventBox = scheduler.generateRenderData(eventRecord, resourceRecord, false); // Collect layouts of visible events

        if (eventBox) {
          result.push(eventBox);
        }
      }

      return result;
    }, []); // Ensure the events are rendered in natural order so that navigation works.

    eventsData.sort(me.eventSorter);
    let rowHeight = scheduler.getAppliedResourceHeight(resourceRecord);
    const // Only events and tasks should be considered during layout (not resource time ranges if any, or events
    // being drag created when configured with lockLayout)
    layoutEventData = eventsData.filter(({
      eventRecord
    }) => eventRecord.isEvent && !eventRecord.meta.excludeFromLayout),
          eventLayout = scheduler.getEventLayout(resourceRecord),
          layoutHandler = scheduler.getEventLayoutHandler(eventLayout);

    if (layoutHandler) {
      const {
        barMargin,
        resourceMargin
      } = scheduler.getResourceLayoutSettings(resourceRecord),
            heightPerEvent = rowHeight - resourceMargin * 2,
            bandsRequired = layoutHandler.applyLayout(layoutEventData, resourceRecord) || 1;

      if (layoutHandler.type === 'layoutFn') {
        rowHeight = bandsRequired;
      } else {
        rowHeight = bandsRequired * heightPerEvent + (bandsRequired - 1) * barMargin + resourceMargin * 2;
      }
    }

    return {
      rowHeight,
      eventsData
    };
  } // Generates a DOMConfig for an EventRecord

  renderEvent(data, rowHeight) {
    const {
      scheduler
    } = this,
          {
      resourceRecord,
      assignmentRecord,
      eventRecord
    } = data,
          // Sync using assignment id for events and event id for ResourceTimeRanges. Add eventId for occurrences to make them unique
    syncId = assignmentRecord // Assignment, might be an occurrence
    ? this.assignmentStore.getOccurrence(assignmentRecord, eventRecord).id // Something else, probably a ResourceTimeRange
    : data.eventId,
          eventElementConfig = {
      className: data.cls,
      style: data.style || '',
      children: data.children,
      dataset: {
        // Each feature putting contents in the event wrap should have this to simplify syncing and
        // element retrieval after sync
        taskFeature: 'event'
      },
      syncOptions: {
        syncIdField: 'taskBarFeature'
      }
    },
          // Event element config, applied to existing element or used to create a new one below
    elementConfig = {
      className: data.wrapperCls,
      tabIndex: 'tabIndex' in data ? data.tabIndex : -1,
      children: [eventElementConfig, ...data.wrapperChildren],
      style: {
        top: data.absoluteTop,
        left: data.left,
        // ResourceTimeRanges fill row height, cannot be done earlier than this since row height is not
        // known initially
        height: data.fillSize ? rowHeight : data.height,
        // DomHelper appends px to dimensions when using numbers.
        // Do not ignore width for milestones, use height value. It is required to properly center
        // pseudo element with top/bottom labels
        width: data.width || data.height,
        style: data.wrapperStyle,
        fontSize: data.height + 'px'
      },
      dataset: {
        // assignmentId is set in this function conditionally
        resourceId: resourceRecord.id,
        eventId: data.eventId,
        // Not using eventRecord.id to distinguish between Event and ResourceTimeRange
        syncId
      },
      // Will not be part of DOM, but attached to the element
      elementData: data,
      // Dragging etc. flags element as retained, to not reuse/release it during that operation. Events
      // always use assignments, but ResourceTimeRanges does not
      retainElement: (assignmentRecord === null || assignmentRecord === void 0 ? void 0 : assignmentRecord.instanceMeta(scheduler).retainElement) || eventRecord.instanceMeta(scheduler).retainElement,
      // Options for this level of sync, lower levels can have their own
      syncOptions: {
        syncIdField: 'taskFeature',
        // Remove instead of release when a feature is disabled
        releaseThreshold: 0
      }
    }; // Write back the correct height for elements filling the row, to not derender them later based on wrong height

    if (data.fillSize) {
      data.height = rowHeight;
    } // Some browsers throw warnings on zIndex = ''

    if (data.zIndex) {
      elementConfig.zIndex = data.zIndex;
    } // Do not want to spam dataset with empty prop when not using assignments (ResourceTimeRanges)

    if (assignmentRecord) {
      elementConfig.dataset.assignmentId = assignmentRecord.id;
    }

    data.elementConfig = elementConfig;
    scheduler.trigger('beforeRenderEvent', {
      renderData: data,
      domConfig: elementConfig
    });
    return elementConfig;
  }
  /**
   * Refresh events for resource record (or Row), clearing its cache and forcing DOM refresh.
   * @param {Scheduler.model.ResourceModel} recordOrRow Record or row to refresh
   * @param {Boolean} [force] Specify `false` to prevent clearing cache and forcing DOM refresh
   * @internal
   */

  refreshEventsForResource(recordOrRow, force = true, draw = true) {
    let row, record;

    if (recordOrRow.isModel) {
      row = this.scheduler.rowManager.getRowFor(recordOrRow);
      record = recordOrRow;
    } else {
      row = recordOrRow;
      record = this.resourceStore.getById(recordOrRow.id);
    }

    if (force) {
      this.clearResources([recordOrRow]);
    }

    if (row && record) {
      this.renderer({
        row,
        record
      });

      if (force && draw) {
        this.onRenderDone();
      }
    }
  } // Called per row in "view", collect configs

  renderer({
    row,
    record: resourceRecord,
    size = {}
  }) {
    var _scheduler$features$l, _scheduler$features$l2;

    // Bail out for group headers/footers
    if (resourceRecord.isSpecialRow) {
      // Clear any cached layout for row retooled to special row, and bail out
      this.rowMap.delete(row);
      return;
    }

    const me = this,
          {
      bufferSize,
      scheduler
    } = me,
          // Left/right labels require using a buffer to not derender too early
    usesLabels = ((_scheduler$features$l = scheduler.features.labels) === null || _scheduler$features$l === void 0 ? void 0 : _scheduler$features$l.left) || ((_scheduler$features$l2 = scheduler.features.labels) === null || _scheduler$features$l2 === void 0 ? void 0 : _scheduler$features$l2.right),
          {
      left,
      right
    } = me.viewportCoords,
          eventDOMConfigs = [];
    let useLeft,
        useRight,
        // Used stored layouts if available
    resourceLayout = me.resourceMap.get(resourceRecord.id);

    if (!resourceLayout || resourceLayout.invalid) {
      // Previously we would bail out here if engine wasn't ready. Now we instead allow drawing in most cases,
      // since data can be read and written during commit (previously it could not)
      if (me.suspended) {
        return;
      }

      resourceLayout = me.layoutResourceEvents(resourceRecord, false);
      me.resourceMap.set(resourceRecord.id, resourceLayout);
    } // Size row to fit events

    size.height = resourceLayout.rowHeight; // Avoid storing our calculated height as the rows max height, to not affect next round of calculations

    size.transient = true; // Only collect configs for those actually in view

    resourceLayout.eventsData.forEach(layout => {
      useLeft = left;
      useRight = right; // Labels/milestones requires keeping events rendered longer

      if (usesLabels || layout.width === 0) {
        useLeft -= bufferSize;
        useRight += bufferSize;
      }

      if (layout.left + layout.width >= useLeft && layout.left <= useRight) {
        layout.absoluteTop = layout.top + row.top;
        eventDOMConfigs.push(me.renderEvent(layout, resourceLayout.rowHeight));
      }
    });
    me.rowMap.set(row, eventDOMConfigs); // Keep track if we need to draw on vertical scroll or not, to not get multiple onRenderDone() calls

    me.rendererCalled = true;
  } // Called when the current row rendering "pass" is complete, sync collected configs to DOM

  onRenderDone() {
    var _scheduler$_scrollTop;

    const {
      scheduler,
      rowMap,
      verticalBufferSize
    } = this,
          visibleEventDOMConfigs = [],
          bodyTop = (_scheduler$_scrollTop = scheduler._scrollTop) !== null && _scheduler$_scrollTop !== void 0 ? _scheduler$_scrollTop : 0,
          viewTop = bodyTop - verticalBufferSize,
          viewBottom = bodyTop + scheduler._bodyRectangle.height + verticalBufferSize,
          unbuffered = verticalBufferSize < 0,
          unmanagedSize = !scheduler.managedEventSizing; // Event configs are collected when rows are rendered, but we do not want to waste resources on rendering
    // events far out of view. Especially with many events per row giving large row heights, rows in the RowManagers
    // buffer might far away -> collect events for rows within viewport + small vertical buffer

    rowMap.forEach((eventDOMConfigs, row) => {
      // Render events "in view". Export specifies a negative verticalBufferSize to disable it
      if (unbuffered || row.bottom > viewTop && row.top < viewBottom) {
        for (let i = 0; i < eventDOMConfigs.length; i++) {
          const config = eventDOMConfigs[i],
                data = config.elementData;

          if (unbuffered || unmanagedSize || data.absoluteTop + data.height > viewTop && data.absoluteTop < viewBottom) {
            visibleEventDOMConfigs.push(config);
          }
        }
      } // We are using cached DomConfigs. When DomSync releases an element, it also flags the config as released.
      // Next time we pass it that very same config, it says it is released and nothing shows up.
      //
      // We are breaching the DomSync contract a bit with the cached approach. DomSync expects new configs on each
      // call, so to facilitate that we clone the configs shallowly (nothing deep is affected by sync releasing).
      // That way we can always pass it fresh unreleased configs.

      for (let i = 0; i < eventDOMConfigs.length; i++) {
        eventDOMConfigs[i] = _objectSpread2({}, eventDOMConfigs[i]);
      }
    });
    this.visibleEventDOMConfigs = visibleEventDOMConfigs;
    DomSync.sync({
      domConfig: {
        onlyChildren: true,
        children: visibleEventDOMConfigs
      },
      targetElement: scheduler.foregroundCanvas,
      syncIdField: 'syncId',

      // Called by DomHelper when it creates, releases or reuses elements
      callback({
        action,
        domConfig,
        lastDomConfig,
        targetElement
      }) {
        var _domConfig$elementDat;

        if (action === 'none' || !(domConfig !== null && domConfig !== void 0 && (_domConfig$elementDat = domConfig.elementData) !== null && _domConfig$elementDat !== void 0 && _domConfig$elementDat.isWrap)) {
          return;
        }

        const // Some actions are considered first a release and then a render (reusing another element).
        // This gives clients code a chance to clean up before reusing an element
        isRelease = releaseEventActions$1[action],
              isRender = renderEventActions$1[action]; // Trigger release for events (it might be a proxy element, skip those)

        if (isRelease && lastDomConfig !== null && lastDomConfig !== void 0 && lastDomConfig.elementData) {
          const {
            eventRecord,
            resourceRecord,
            assignmentRecord
          } = lastDomConfig.elementData,
                event = {
            renderData: lastDomConfig.elementData,
            element: targetElement,
            eventRecord,
            resourceRecord,
            assignmentRecord
          }; // Some browsers do not blur on set to display:none, so releasing the active element
          // must *explicitly* move focus outwards to the view.

          if (targetElement === DomHelper.getActiveElement(targetElement)) {
            scheduler.focusElement.focus();
          } // This event is documented on Scheduler

          scheduler.trigger('releaseEvent', event);
        }

        if (isRender) {
          const {
            eventRecord,
            resourceRecord,
            assignmentRecord
          } = domConfig.elementData,
                event = {
            renderData: domConfig.elementData,
            element: targetElement,
            isReusingElement: action === 'reuseElement',
            isRepaint: action === 'reuseOwnElement',
            eventRecord,
            resourceRecord,
            assignmentRecord
          }; // This event is documented on Scheduler

          scheduler.trigger('renderEvent', event);
        }
      }

    });
  } //endregion
  //region Cache
  // Clears cached resource layout

  clearResources(recordsOrIds) {
    recordsOrIds = ArrayHelper.asArray(recordsOrIds);
    const resourceIds = recordsOrIds.map(Model.asId);
    resourceIds.forEach(resourceId => {
      // Invalidate resourceLayout, keeping it around in case we need it before next refresh
      const cached = this.resourceMap.get(resourceId);

      if (cached) {
        cached.invalid = true;
      }

      const row = this.scheduler.getRowById(resourceId);
      row && this.rowMap.delete(row);
    });
  }

  clearAll({
    clearDom = false,
    clearLayoutCache = false
  } = {}) {
    const {
      layouts
    } = this.scheduler;

    if (clearLayoutCache && layouts) {
      for (const layout in layouts) {
        layouts[layout].clearCache();
      }
    }

    if (clearDom) {
      const {
        foregroundCanvas
      } = this.scheduler; // Start from scratch when replacing the project, to not retain anything in maps or released elements

      foregroundCanvas.syncIdMap = foregroundCanvas.lastDomConfig = null;

      for (const child of foregroundCanvas.children) {
        // child.remove();
        child.lastDomConfig = child.elementData = null;
      }
    }

    this.resourceMap.clear();
    this.rowMap.clear();
  } //endregion

}
HorizontalRendering._$name = 'HorizontalRendering';

/**
 * @module Scheduler/eventlayout/VerticalLayout
 */

/**
 * Assists with event layout in vertical mode, handles `eventLayout: none|pack|mixed`
 * @private
 * @mixes Scheduler/eventlayout/PackMixin
 */

class VerticalLayout extends PackMixin() {
  static get defaultConfig() {
    return {
      coordProp: 'leftFactor',
      sizeProp: 'widthFactor'
    };
  } // Try to pack the events to consume as little space as possible

  applyLayout(events, columnWidth, resourceMargin, barMargin, columnIndex, eventLayout) {
    const layoutType = eventLayout.type;
    return this.packEventsInBands(events, (tplData, clusterIndex, slot, slotSize) => {
      // Stretch events to fill available width
      if (layoutType === 'none') {
        tplData.width = columnWidth - resourceMargin * 2;
        tplData.left += resourceMargin;
      } else {
        // Fractions of resource column
        tplData.widthFactor = slotSize;
        const leftFactor = tplData.leftFactor = slot.start + clusterIndex * slotSize,
              // Number of "columns" in the current slot
        packColumnCount = Math.round(1 / slotSize),
              // Index among those columns for current event
        packColumnIndex = leftFactor / slotSize,
              // Width with all bar margins subtracted
        availableWidth = columnWidth - resourceMargin * 2 - barMargin * (packColumnCount - 1); // Allowing two events to overlap? Slightly offset the second

        if (layoutType === 'mixed' && packColumnCount === 2) {
          tplData.left += leftFactor * columnWidth / 5 + barMargin;
          tplData.width = columnWidth - leftFactor * columnWidth / 5 - barMargin * 2;
          tplData.zIndex = 5 + packColumnIndex;
        } // Pack by default
        else {
          // Fractional width
          tplData.width = slotSize * availableWidth; // Translate to absolute position

          tplData.left += leftFactor * availableWidth + resourceMargin + barMargin * packColumnIndex;
        }
      }
    });
  }

}
VerticalLayout._$name = 'VerticalLayout';

/**
 * @module Scheduler/view/orientation/VerticalRendering
 */

const releaseEventActions = {
  releaseElement: 1,
  // Not used at all at the moment
  reuseElement: 1 // Used by some other element

},
      renderEventActions = {
  newElement: 1,
  reuseOwnElement: 1,
  reuseElement: 1
},
      chronoFields = {
  startDate: 1,
  endDate: 1,
  duration: 1
},
      emptyObject = Object.freeze({});
/**
 * Handles event rendering in Schedulers vertical mode. Reacts to project/store changes to keep the UI up to date.
 *
 * @internal
 */

class VerticalRendering extends Base.mixin(Delayable, BaseRendering, AttachToProjectMixin) {
  //region Config & Init
  static get properties() {
    return {
      eventMap: new Map(),
      resourceMap: new Map(),
      releasedElements: {},
      toDrawOnProjectRefresh: new Set(),
      resourceBufferSize: 1
    };
  }

  construct(scheduler) {
    this.client = this.scheduler = scheduler;
    this.verticalLayout = new VerticalLayout({
      scheduler
    });
    super.construct({});
  }

  init() {
    const me = this,
          {
      scheduler
    } = me; // Resource header/columns

    me.resourceColumns.resourceStore = me.resourceStore;
    me.resourceColumns.on({
      name: 'resourceColumns',
      columnWidthChange: 'onResourceColumnWidthChange',
      thisObj: me
    });
    me.initialized = true;

    if (scheduler.isPainted) {
      me.renderer();
    }

    me.resourceColumns.availableWidth = scheduler.timeAxisSubGridElement.offsetWidth;
  } //endregion
  //region Elements <-> Records

  resolveRowRecord(elementOrEvent, xy) {
    const me = this,
          {
      scheduler
    } = me,
          event = elementOrEvent.nodeType ? null : elementOrEvent,
          element = event ? event.target : elementOrEvent,
          coords = event ? [event.offsetX, event.offsetY] : xy,
          // Fix for FF on Linux having text nodes as event.target
    el = element.nodeType === Element.TEXT_NODE ? element.parentElement : element,
          eventElement = DomHelper.up(el, scheduler.eventSelector);

    if (eventElement) {
      return scheduler.resourceStore.getById(eventElement.dataset.resourceId);
    } // Need to be inside schedule at least

    if (!DomHelper.up(element, '.b-sch-timeaxis-cell')) {
      return null;
    }

    if (!coords) {
      throw new Error(`Vertical mode needs coordinates to resolve this element. Can also be called with a browser
                event instead of element to extract element and coordinates from`);
    }

    const index = Math.floor(coords[0] / me.resourceColumns.columnWidth);
    return scheduler.resourceStore.getAt(index);
  }

  toggleCls(assignmentRecord, cls, add = true, useWrapper = false) {
    var _this$eventMap$get;

    const eventData = (_this$eventMap$get = this.eventMap.get(assignmentRecord.eventId)) === null || _this$eventMap$get === void 0 ? void 0 : _this$eventMap$get[assignmentRecord.resourceId];

    if (eventData) {
      eventData.renderData[useWrapper ? 'wrapperCls' : 'cls'][cls] = add; // Element from the map cannot be trusted, might be reused in which case map is not updated to reflect that.
      // To be safe, retrieve using `getElementFromAssignmentRecord`

      const element = this.getElementFromAssignmentRecord(assignmentRecord, useWrapper);

      if (element) {
        element.classList[add ? 'add' : 'remove'](cls);
      }
    }
  } //endregion
  //region Coordinate <-> Date

  getDateFromXY(xy, roundingMethod, local, allowOutOfRange = false) {
    let coord = xy[1];

    if (!local) {
      coord = this.translateToScheduleCoordinate(coord);
    }

    return this.scheduler.timeAxisViewModel.getDateFromPosition(coord, roundingMethod, allowOutOfRange);
  }

  translateToScheduleCoordinate(y) {
    // We do not have to account for page scroll here because _bodyRectangle was created
    // with that adjustment.
    return y - this.scheduler._bodyRectangle.y + this.scheduler.scrollTop;
  }

  translateToPageCoordinate(y) {
    return y + this.scheduler._bodyRectangle.y - this.scheduler.scrollTop;
  } //endregion
  //region Regions

  getResourceEventBox(event, resource) {
    var _this$eventMap$get2;

    const eventId = event.id,
          resourceId = resource.id;
    let {
      renderData
    } = ((_this$eventMap$get2 = this.eventMap.get(eventId)) === null || _this$eventMap$get2 === void 0 ? void 0 : _this$eventMap$get2[resourceId]) || emptyObject;

    if (!renderData) {
      var _this$eventMap$get3, _this$eventMap$get3$r;

      // Never been in view, lay it out
      this.layoutResource(this.scheduler.resourceStore.getById(resourceId)); // Have another go at getting the layout data

      renderData = (_this$eventMap$get3 = this.eventMap.get(eventId)) === null || _this$eventMap$get3 === void 0 ? void 0 : (_this$eventMap$get3$r = _this$eventMap$get3[resourceId]) === null || _this$eventMap$get3$r === void 0 ? void 0 : _this$eventMap$get3$r.renderData;
    }

    return renderData ? new Rectangle(renderData.left, renderData.top, renderData.width, renderData.bottom - renderData.top) : null;
  }

  getScheduleRegion(resourceRecord, eventRecord, local) {
    var _scheduler$getDateCon;

    const me = this,
          {
      scheduler
    } = me,
          // Only interested in width / height (in "local" coordinates)
    region = Rectangle.from(scheduler.timeAxisSubGridElement, scheduler.timeAxisSubGridElement);

    if (resourceRecord) {
      // TODO: How to account for eventRecord here?
      region.left = me.resourceStore.indexOf(resourceRecord) * scheduler.resourceColumnWidth;
      region.right = region.left + scheduler.resourceColumnWidth;
    }

    const start = scheduler.timeAxis.startDate,
          end = scheduler.timeAxis.endDate,
          dateConstraints = ((_scheduler$getDateCon = scheduler.getDateConstraints) === null || _scheduler$getDateCon === void 0 ? void 0 : _scheduler$getDateCon.call(scheduler, resourceRecord, eventRecord)) || {
      start,
      end
    },
          startY = scheduler.getCoordinateFromDate(DateHelper.max(start, dateConstraints.start)),
          endY = scheduler.getCoordinateFromDate(DateHelper.min(end, dateConstraints.end));

    if (!local) {
      region.top = me.translateToPageCoordinate(startY);
      region.bottom = me.translateToPageCoordinate(endY);
    } else {
      region.top = startY;
      region.bottom = endY;
    }

    return region;
  }

  getRowRegion(resourceRecord, startDate, endDate) {
    const me = this,
          {
      scheduler
    } = me,
          x = me.resourceStore.indexOf(resourceRecord) * scheduler.resourceColumnWidth,
          taStart = scheduler.timeAxis.startDate,
          taEnd = scheduler.timeAxis.endDate,
          start = startDate ? DateHelper.max(taStart, startDate) : taStart,
          end = endDate ? DateHelper.min(taEnd, endDate) : taEnd,
          startY = scheduler.getCoordinateFromDate(start),
          endY = scheduler.getCoordinateFromDate(end, true, true),
          y = Math.min(startY, endY),
          height = Math.abs(startY - endY);
    return new Rectangle(x, y, scheduler.resourceColumnWidth, height);
  }

  get visibleDateRange() {
    const scheduler = this.scheduler,
          scrollPos = scheduler.scrollable.y,
          height = scheduler.scrollable.clientHeight;
    return {
      startDate: scheduler.getDateFromCoordinate(scrollPos),
      endDate: scheduler.getDateFromCoordinate(scrollPos + height) || scheduler.timeAxis.endDate
    };
  } //endregion
  //region Events
  // Column width changed, rerender fully

  onResourceColumnWidthChange({
    width,
    oldWidth
  }) {
    const me = this,
          {
      scheduler
    } = me; // Fix width of column & header

    me.resourceColumns.width = scheduler.timeAxisColumn.width = me.resourceStore.count * width;
    me.clearAll(); // Only transition large changes, otherwise it is janky when dragging slider in demo

    me.refresh(Math.abs(width - oldWidth) > 30); // Not detected by resizeobserver? Need to call this for virtual scrolling to react to update
    //        scheduler.callEachSubGrid('refreshFakeScroll');
    //        scheduler.refreshVirtualScrollbars();
  } //endregion
  //region Project

  attachToProject(project) {
    super.attachToProject(project);

    if (project) {
      project.on({
        name: 'project',
        refresh: 'onProjectRefresh',
        thisObj: this
      });
    }
  }

  onProjectRefresh() {
    const me = this,
          {
      scheduler,
      toDrawOnProjectRefresh
    } = me;

    if (scheduler.rendered && !scheduler.refreshSuspended) {
      // Either refresh all rows (on for example dataset)
      if (me.refreshAllWhenReady) {
        me.clearAll(); //scheduler.refreshWithTransition();

        me.refresh();
        me.refreshAllWhenReady = false;
      } // Or only affected rows (if any)
      else if (toDrawOnProjectRefresh.size) {
        me.refresh();
      }

      toDrawOnProjectRefresh.clear();
    }
  } //endregion
  //region EventStore

  attachToEventStore(eventStore) {
    super.attachToEventStore(eventStore);
    this.refreshAllWhenReady = true;

    if (eventStore) {
      eventStore.on({
        name: 'eventStore',
        refreshPreCommit: 'onEventStoreRefresh',
        thisObj: this
      });
    }
  }

  onEventStoreRefresh({
    action
  }) {
    if (action === 'batch') {
      this.refreshAllWhenReady = true;
    }
  }

  onEventStoreChange({
    action,
    records: eventRecords = [],
    record,
    replaced,
    changes,
    isAssign
  }) {
    const me = this,
          resourceIds = new Set();
    eventRecords.forEach(eventRecord => {
      eventRecord.resources.forEach(resourceRecord => resourceIds.add(resourceRecord.id));
    });

    switch (action) {
      // No-ops
      case 'sort': // Order in EventStore does not matter, so these actions are no-ops

      case 'group':
      case 'move':
      case 'remove':
        // Remove is a no-op since assignment will also be removed
        return;

      case 'dataset':
        me.refreshAllResourcesWhenReady();
        return;

      case 'add':
      case 'updateMultiple':
        // Just refresh below
        break;

      case 'replace':
        // Gather resources from both the old record and the new one
        replaced.forEach(([, newEvent]) => {
          // Old cleared by changed assignment
          newEvent.resources.map(resourceRecord => resourceIds.add(resourceRecord.id));
        }); // And clear them

        me.clearResources(resourceIds);
        break;

      case 'removeall':
      case 'filter':
        // Clear all when filtering for simplicity. If that turns out to give bad performance, one would need to
        // figure out which events was filtered out and only clear their resources.
        me.clearAll();
        me.refresh();
        return;

      case 'update':
        {
          // Check if changes are graph related or not
          const allChrono = record.$entity ? !Object.keys(changes).some(name => !record.$entity.getField(name)) : !Object.keys(changes).some(name => !chronoFields[name]); // If any one of these in changes, it will affect visuals

          let changeCount = 0;
          if ('startDate' in changes) changeCount++;
          if ('endDate' in changes) changeCount++;
          if ('duration' in changes) changeCount++; // Always redraw non chrono changes (name etc)

          if (!allChrono || changeCount) {
            me.clearResources(resourceIds);
            me.refresh();
          }

          return;
        }
    }

    me.refreshResourcesWhenReady(resourceIds);
  } //endregion
  //region ResourceStore

  attachToResourceStore(resourceStore) {
    const me = this;
    super.attachToResourceStore(resourceStore);
    me.refreshAllWhenReady = true;

    if (me.resourceColumns) {
      me.resourceColumns.resourceStore = resourceStore;
    }

    resourceStore.on({
      name: 'resourceStore',
      changePreCommit: 'onResourceStoreChange',
      refreshPreCommit: 'onResourceStoreRefresh',
      // In vertical, resource store is not the row store but should toggle the load mask
      load: () => me.scheduler.unmaskBody(),
      thisObj: me,
      prio: 1 // Call before others to clear cache before redraw

    });

    if (me.initialized && me.scheduler.isPainted) {
      // Invalidate resource range and events
      me.firstResource = me.lastResource = null;
      me.clearAll();
      me.renderer();
    }
  }

  onResourceStoreChange({
    source: resourceStore,
    action,
    records = [],
    record,
    replaced,
    changes
  }) {
    const me = this,
          // records for add, record for update, replaced [[old, new]] for replace
    resourceRecords = replaced ? replaced.map(r => r[1]) : records,
          resourceIds = new Set(resourceRecords.map(resourceRecord => resourceRecord.id)); // Invalidate resource range

    me.firstResource = me.lastResource = null; // Operation that did not invalidate engine, refresh directly

    if (me.scheduler.isEngineReady) {
      switch (action) {
        case 'update':
          if (changes !== null && changes !== void 0 && changes.id) {
            me.clearResources([changes.id.oldValue, changes.id.value]);
          } else {
            me.clearResources([record.id]);
          } // Only the invalidation above needed

          break;

        case 'filter':
          // All filtered out resources needs clearing and so does those not filtered out since they might have
          // moved horizontally when others hide
          me.clearAll();
          break;
      }

      me.refresh(true);
    } // Operation that did invalidate project, update on project refresh
    else {
      switch (action) {
        case 'dataset':
        case 'remove': // Cannot tell from which index it was removed

        case 'removeall':
          me.refreshAllResourcesWhenReady();
          return;

        case 'replace':
        case 'add':
          {
            // Make sure all existing events following added resources are offset correctly
            const firstIndex = resourceRecords.reduce((index, record) => Math.min(index, resourceStore.indexOf(record)), resourceStore.count);

            for (let i = firstIndex; i < resourceStore.count; i++) {
              resourceIds.add(resourceStore.getAt(i).id);
            }
          }
      }

      me.refreshResourcesWhenReady(resourceIds);
    }
  }

  onResourceStoreRefresh({
    action
  }) {
    const me = this;

    if (action === 'group') {
      throw new Error('Grouping of resources not supported in vertical mode');
    }

    if (action === 'sort') {
      // Invalidate resource range
      me.firstResource = me.lastResource = null;
      me.clearAll();
      me.refresh();
    }
  } //endregion
  //region AssignmentStore

  attachToAssignmentStore(assignmentStore) {
    super.attachToAssignmentStore(assignmentStore);
    this.refreshAllWhenReady = true;

    if (assignmentStore) {
      assignmentStore.on({
        name: 'assignmentStore',
        changePreCommit: 'onAssignmentStoreChange',
        refreshPreCommit: 'onAssignmentStoreRefresh',
        thisObj: this
      });
    }
  }

  onAssignmentStoreChange({
    action,
    records: assignmentRecords = [],
    replaced,
    changes
  }) {
    const me = this,
          resourceIds = new Set(assignmentRecords.map(assignmentRecord => assignmentRecord.resourceId)); // Operation that did not invalidate engine, refresh directly

    if (me.scheduler.isEngineReady) {
      switch (action) {
        case 'filter':
          me.clearAll();
          break;

        case 'update':
          {
            // When reassigning, clear old resource also
            if ('resourceId' in changes) {
              resourceIds.add(changes.resourceId.oldValue);
            } // Ignore engine resolving resourceId -> resource, eventId -> event

            if (!Object.keys(changes).filter(field => field !== 'resource' && field !== 'event').length) {
              return;
            }

            me.clearResources(resourceIds);
          }
      }

      me.refresh(true);
    } // Operation that did invalidate project, update on project refresh
    else {
      if (changes && 'resourceId' in changes) {
        resourceIds.add(changes.resourceId.oldValue);
      }

      switch (action) {
        case 'removeall':
          me.refreshAllResourcesWhenReady();
          return;

        case 'replace':
          // Gather resources from both the old record and the new one
          replaced.forEach(([oldAssignment, newAssignment]) => {
            resourceIds.add(oldAssignment.resourceId);
            resourceIds.add(newAssignment.resourceId);
          });
      }

      me.refreshResourcesWhenReady(resourceIds);
    }
  }

  onAssignmentStoreRefresh({
    action,
    records
  }) {
    if (action === 'batch') {
      this.clearAll();
      this.refreshAllResourcesWhenReady();
    }
  } //endregion
  //region View hooks

  refreshRows(reLayoutEvents) {
    if (reLayoutEvents) {
      this.clearAll();
      this.scheduler.refreshFromRerender = false;
    }
  } // Called from SchedulerEventRendering

  repaintEventsForResource(resourceRecord) {
    this.renderResource(resourceRecord);
  }

  updateFromHorizontalScroll(scrollLeft) {
    if (scrollLeft !== this.prevScrollLeft) {
      this.renderer();
      this.prevScrollLeft = scrollLeft;
    }
  }

  updateFromVerticalScroll() {
    this.renderer();
  }

  scrollResourceIntoView(resourceRecord, options) {
    const {
      scheduler
    } = this,
          x = scheduler.resourceStore.indexOf(resourceRecord) * scheduler.resourceColumnWidth;
    return scheduler.scrollHorizontallyTo(x, options);
  } // Called when viewport size changes

  onViewportResize(width) {
    this.resourceColumns.availableWidth = width;
    this.renderer();
  }

  get resourceColumns() {
    return this.scheduler.timeAxisColumn.resourceColumns;
  } // Clear events in case they use date as part of displayed info

  onLocaleChange() {
    this.clearAll();
  } // No need to do anything special

  onDragAbort() {}

  onBeforeRowHeightChange() {}

  onTimeAxisViewModelUpdate() {}

  updateElementId() {}

  releaseTimeSpanDiv() {} //endregion
  //region Refresh resources

  /**
   * Clears resources directly and redraws them on next project refresh
   * @param {Number[]|String[]} resourceIds
   * @private
   */

  refreshResourcesWhenReady(resourceIds) {
    this.clearResources(resourceIds);
    resourceIds.forEach(id => this.toDrawOnProjectRefresh.add(id));
  }
  /**
   * Clears all resources directly and redraws them on next project refresh
   * @private
   */

  refreshAllResourcesWhenReady() {
    this.clearAll();
    this.refreshAllWhenReady = true;
  } //region Rendering
  // Resources in view + buffer

  get resourceRange() {
    return this.getResourceRange(true);
  } // Resources strictly in view

  get visibleResources() {
    const {
      first,
      last
    } = this.getResourceRange();
    return {
      first: this.resourceStore.getAt(first),
      last: this.resourceStore.getAt(last)
    };
  }

  getResourceRange(withBuffer) {
    const {
      scheduler,
      resourceStore
    } = this;
    let resourceBufferSize = this.resourceBufferSize;

    if (!withBuffer) {
      resourceBufferSize = 0;
    }

    if (!resourceStore || !resourceStore.count) {
      return {
        first: -1,
        last: -1
      };
    }

    return {
      first: Math.max(Math.floor(scheduler.scrollLeft / scheduler.resourceColumnWidth) - resourceBufferSize, 0),
      last: Math.min(Math.floor((scheduler.scrollLeft + scheduler.timeAxisSubGrid.width) / scheduler.resourceColumnWidth) + resourceBufferSize, resourceStore.count - 1)
    };
  } // Dates in view + buffer

  get dateRange() {
    const {
      scheduler
    } = this;
    let bottomDate = scheduler.getDateFromCoordinate(Math.min(scheduler.scrollTop + scheduler.bodyHeight + scheduler.tickSize - 1, (scheduler.virtualScrollHeight || scheduler.scrollable.scrollHeight) - 1)); // Might end up below time axis (out of ticks)
    // TODO: Change call order on refresh to make sure this is not needed?

    if (!bottomDate) {
      bottomDate = scheduler.timeAxis.last.endDate;
    }

    let topDate = scheduler.getDateFromCoordinate(Math.max(scheduler.scrollTop - scheduler.tickSize, 0)); // Might end up above time axis when reconfiguring (since this happens as part of rendering)

    if (!topDate) {
      topDate = scheduler.timeAxis.first.startDate;
      bottomDate = scheduler.getDateFromCoordinate(scheduler.bodyHeight + scheduler.tickSize - 1);
    }

    return {
      topDate,
      bottomDate
    };
  }

  getTimeSpanRenderData(eventRecord, resourceRecord, includeOutside = false) {
    var _scheduler$features$e;

    const me = this,
          {
      scheduler
    } = me,
          {
      preamble,
      postamble
    } = eventRecord,
          useEventBuffer = ((_scheduler$features$e = scheduler.features.eventBuffer) === null || _scheduler$features$e === void 0 ? void 0 : _scheduler$features$e.enabled) && me.isProVerticalRendering && (preamble || postamble) && !eventRecord.isMilestone,
          startDateField = useEventBuffer ? 'wrapStartDate' : 'startDate',
          endDateField = useEventBuffer ? 'wrapEndDate' : 'endDate',
          // Must use Model.get in order to get latest values in case we are inside a batch.
    // EventResize changes the endDate using batching to enable a tentative change
    // via the batchedUpdate event which is triggered when changing a field in a batch.
    // Fall back to accessor if propagation has not populated date fields.
    startDate = eventRecord.isBatchUpdating && eventRecord.hasBatchedChange(startDateField) ? eventRecord.get(startDateField) : eventRecord[startDateField],
          endDate = eventRecord.isBatchUpdating && eventRecord.hasBatchedChange(endDateField) ? eventRecord.get(endDateField) : eventRecord[endDateField],
          resourceMargin = scheduler.getResourceMargin(resourceRecord),
          top = scheduler.getCoordinateFromDate(startDate),
          // Preliminary values for left & width, used for proxy. Will be changed on layout
    left = me.resourceStore.indexOf(resourceRecord) * scheduler.resourceColumnWidth,
          width = scheduler.resourceColumnWidth - resourceMargin * 2,
          startDateMS = startDate.getTime(),
          endDateMS = endDate.getTime();
    let bottom = scheduler.getCoordinateFromDate(endDate),
        height = bottom - top; // Below, estimate height

    if (bottom === -1) {
      height = Math.round((endDateMS - startDateMS) * scheduler.timeAxisViewModel.getSingleUnitInPixels('millisecond'));
      bottom = top + height;
    }

    return {
      eventRecord,
      resourceRecord,
      left,
      top,
      bottom,
      width,
      height,
      startDate,
      endDate,
      startDateMS,
      endDateMS,
      useEventBuffer,
      children: [],
      // to match horizontal, TODO: should change there
      start: startDate,
      end: endDate,
      startMs: startDateMS,
      endMs: endDateMS
    };
  } // Earlier start dates are above later tasks
  // If same start date, longer tasks float to top
  // If same start + duration, sort by name

  eventSorter(a, b) {
    const startA = a.dataStartMs || a.startDateMS,
          // dataXX are used if configured with fillTicks
    endA = a.dataEndMs || a.endDateMS,
          startB = b.dataStartMs || b.startDateMS,
          endB = b.dataEndMs || b.endDateMS,
          nameA = a.isModel ? a.name : a.eventRecord.name,
          nameB = b.isModel ? b.name : b.eventRecord.name;
    return startA - startB || endB - endA || (nameA < nameB ? -1 : nameA == nameB ? 0 : 1);
  } // Calculate the layout for all events assigned to a resource. Since we are never stacking, the layout of one
  // resource will never affect the others

  layoutResource(resourceRecord) {
    const me = this,
          {
      scheduler
    } = me,
          {
      id: resourceId
    } = resourceRecord,
          // Used in loop, reduce access time a wee bit
    {
      assignmentStore,
      eventStore,
      timeAxis
    } = scheduler,
          // Cache per resource
    cache = me.resourceMap.set(resourceId, {}).get(resourceId),
          // Resource "column"
    resourceIndex = scheduler.resourceStore.indexOf(resourceRecord),
          {
      barMargin,
      resourceMargin
    } = scheduler.getResourceLayoutSettings(resourceRecord); // Events for the resource, minus those that are filtered out by filtering assignments and events

    let events = eventStore.getEvents({
      includeOccurrences: scheduler.enableRecurringEvents,
      resourceRecord,
      startDate: timeAxis.startDate,
      endDate: timeAxis.endDate,
      filter: (assignmentStore.isFiltered || eventStore.isFiltered) && (eventRecord => eventRecord.assignments.some(a => a.resource === resourceRecord && assignmentStore.includes(a)))
    }); // Hook for features to inject additional timespans to render

    events = scheduler.getEventsToRender(resourceRecord, events);
    const layoutData = events.reduce((toLayout, eventRecord) => {
      if (eventRecord.isScheduled) {
        const renderData = scheduler.generateRenderData(eventRecord, resourceRecord, false),
              // Elements will be appended to eventData during syncing
        eventData = {
          renderData
        },
              eventResources = ObjectHelper.getMapPath(me.eventMap, renderData.eventId, {}); // Cache per event, { e1 : { r1 : { xxx }, r2 : ... }, e2 : ... }
        // Uses renderData.eventId in favor of eventRecord.id to work with ResourceTimeRanges

        eventResources[resourceId] = eventData; // Cache per resource

        cache[renderData.eventId] = eventData; // Position ResourceTimeRanges directly, they do not affect the layout of others

        if (renderData.fillSize) {
          renderData.left = resourceIndex * scheduler.resourceColumnWidth;
          renderData.width = scheduler.resourceColumnWidth;
        } // Anything not flagged with `fillSize` should take part in layout
        else {
          toLayout.push(renderData);
        }
      }

      return toLayout;
    }, []); // Ensure the events are rendered in natural order so that navigation works.

    layoutData.sort(me.eventSorter); // Apply per resource event layout (pack, overlap or mixed)

    me.verticalLayout.applyLayout(layoutData, scheduler.resourceColumnWidth, resourceMargin, barMargin, resourceIndex, scheduler.getEventLayout(resourceRecord));
    return cache;
  }
  /**
   * Used by event drag features to bring into existence event elements that are outside of the rendered block.
   * @param {Scheduler.model.TimeSpan} eventRecord The event to render
   * @private
   */

  addTemporaryDragElement(eventRecord) {
    const {
      scheduler
    } = this,
          renderData = scheduler.generateRenderData(eventRecord, eventRecord.resource, {
      timeAxis: true,
      viewport: true
    });
    renderData.top = renderData.row ? renderData.top + renderData.row.top : scheduler.getResourceEventBox(eventRecord, eventRecord.resource, true).top;
    const domConfig = this.renderEvent({
      renderData
    }),
          {
      dataset
    } = domConfig;
    delete domConfig.tabIndex;
    delete dataset.eventId;
    delete dataset.resourceId;
    delete dataset.assignmentId;
    delete dataset.syncId;
    dataset.transient = true;
    domConfig.parent = this.scheduler.foregroundCanvas; // So that the regular DomSyncing which may happen during scroll does not
    // sweep up and reuse the temporary element.

    domConfig.retainElement = true;
    const result = DomHelper.createElement(domConfig);
    result.innerElement = result.firstChild;
    eventRecord.instanceMeta(scheduler).hasTemporaryDragElement = true;
    return result;
  } // TODO: Pretty much identical to HorizontalRendering#renderEvent. Make shared base class
  // Render a single event, aborting if already in DOM. To update an event, first release its element and then render
  // it again. The element will be reused and updated. Keeps code simpler

  renderEvent(eventData) {
    // No point in rendering event that already has an element
    const data = eventData.renderData,
          {
      resourceRecord,
      assignmentRecord,
      eventRecord
    } = data,
          // Event element config, applied to existing element or used to create a new one below
    elementConfig = {
      className: data.wrapperCls,
      tabIndex: -1,
      children: [{
        className: data.cls,
        style: (data.internalStyle || '') + (data.style || ''),
        children: data.children,
        dataset: {
          // Each feature putting contents in the event wrap should have this to simplify syncing and
          // element retrieval after sync
          taskFeature: 'event'
        },
        syncOptions: {
          syncIdField: 'taskBarFeature'
        }
      }, ...data.wrapperChildren],
      style: {
        top: data.top,
        left: data.left,
        // DomHelper appends px to dimensions when using numbers
        height: data.height,
        width: data.width,
        style: data.wrapperStyle || ''
      },
      dataset: {
        // assignmentId is set in this function conditionally
        resourceId: resourceRecord.id,
        eventId: data.eventId,
        // Not using eventRecord.id to distinguish between Event and ResourceTimeRange
        // Sync using assignment id for events and event id for ResourceTimeRanges
        syncId: assignmentRecord ? this.assignmentStore.getOccurrence(assignmentRecord, eventRecord).id : data.eventId
      },
      // Will not be part of DOM, but attached to the element
      elementData: eventData,
      // Dragging etc. flags element as retained, to not reuse/release it during that operation. Events
      // always use assignments, but ResourceTimeRanges does not
      retainElement: (assignmentRecord || eventRecord).instanceMeta(this.scheduler).retainElement,
      // Options for this level of sync, lower levels can have their own
      syncOptions: {
        syncIdField: 'taskFeature',
        // Remove instead of release when a feature is disabled
        releaseThreshold: 0
      }
    }; // Some browsers throw warnings on zIndex = ''

    if (data.zIndex) {
      elementConfig.zIndex = data.zIndex;
    } // Do not want to spam dataset with empty prop when not using assignments (ResourceTimeRanges)

    if (assignmentRecord) {
      elementConfig.dataset.assignmentId = assignmentRecord.id;
    }

    this.scheduler.trigger('beforeRenderEvent', {
      renderData: data,
      domConfig: elementConfig
    }); // Allows access to the used config later, for example to retrieve element

    eventData.elementConfig = elementConfig;
    return elementConfig;
  }

  renderResource(resourceRecord) {
    const me = this,
          // Date at top and bottom for determining which events to include
    {
      topDateMS,
      bottomDateMS
    } = me,
          // Will hold element configs
    syncConfigs = [];
    let resourceEntry = me.resourceMap.get(resourceRecord.id); // Layout all events for the resource unless already done

    if (!resourceEntry) {
      resourceEntry = me.layoutResource(resourceRecord);
    } // Iterate over all events for the resource

    for (const eventId in resourceEntry) {
      const eventData = resourceEntry[eventId],
            {
        endDateMS,
        startDateMS,
        eventRecord
      } = eventData.renderData;

      if ( // Only collect configs for those actually in view
      endDateMS >= topDateMS && startDateMS <= bottomDateMS && // And not being dragged, those has a temporary element already
      !eventRecord.instanceMeta(me.scheduler).hasTemporaryDragElement) {
        syncConfigs.push(me.renderEvent(eventData));
      }
    }

    return syncConfigs;
  }

  isEventElement(domConfig) {
    const className = domConfig && domConfig.className;
    return className && className[this.scheduler.eventCls + '-wrap'];
  } // Single cell so only one call to this renderer, determine which events are in view and draw them.
  // Drawing on scroll is triggered by `updateFromVerticalScroll()` and `updateFromHorizontalScroll()`

  renderer() {
    const me = this,
          {
      scheduler
    } = me,
          {
      resourceStore
    } = scheduler,
          // Determine resource range to draw events for
    {
      first: firstResource,
      last: lastResource
    } = me.resourceRange,
          // Date at top and bottom for determining which events to include
    {
      topDate,
      bottomDate
    } = me.dateRange,
          syncConfigs = [],
          featureDomConfigs = []; // If scheduler is creating a new event, the render needs to be synchronous, so
    // we cannot wait for the engine to normalize - the new event will have correct data set.

    if (!me.initialized || !scheduler.isEngineReady && !scheduler.isCreating) {
      return;
    } // Update current time range, reflecting the change on the vertical time axis header

    if (!DateHelper.isEqual(topDate, me.topDate) || !DateHelper.isEqual(bottomDate, me.bottomDate)) {
      // Calculated values used by `renderResource()`
      me.topDate = topDate;
      me.bottomDate = bottomDate;
      me.topDateMS = topDate.getTime();
      me.bottomDateMS = bottomDate.getTime();
      const range = me.timeView.range = {
        startDate: topDate,
        endDate: bottomDate
      };
      scheduler.onVisibleDateRangeChange(range);
      scheduler.trigger('visibleRangeChange', range);
    }

    if (firstResource !== -1 && lastResource !== -1) {
      // Collect all events for resources in view
      for (let i = firstResource; i <= lastResource; i++) {
        syncConfigs.push.apply(syncConfigs, me.renderResource(resourceStore.getAt(i)));
      }
    }

    scheduler.getForegroundDomConfigs(featureDomConfigs);
    syncConfigs.push.apply(syncConfigs, featureDomConfigs);
    DomSync.sync({
      domConfig: {
        onlyChildren: true,
        children: syncConfigs
      },
      targetElement: scheduler.foregroundCanvas,
      syncIdField: 'syncId',

      // Called by DomHelper when it creates, releases or reuses elements
      callback({
        action,
        domConfig,
        lastDomConfig,
        targetElement
      }) {
        // If element is an event wrap, trigger appropriate events
        if (me.isEventElement(domConfig)) {
          const // Some actions are considered first a release and then a render (reusing another element).
          // This gives clients code a chance to clean up before reusing an element
          isRelease = releaseEventActions[action],
                isRender = renderEventActions[action]; // If we are reusing an element that was previously released we should not trigger again

          if (isRelease && me.isEventElement(lastDomConfig) && !lastDomConfig.isReleased) {
            const data = lastDomConfig.elementData.renderData,
                  event = {
              renderData: data,
              assignmentRecord: data.assignmentRecord,
              eventRecord: data.eventRecord,
              resourceRecord: data.resourceRecord,
              element: targetElement
            }; // Some browsers do not blur on set to display:none, so releasing the active element
            // must *explicitly* move focus outwards to the view.

            if (targetElement === DomHelper.getActiveElement(targetElement)) {
              scheduler.focusElement.focus();
            } // This event is documented on Scheduler

            scheduler.trigger('releaseEvent', event);
          }

          if (isRender) {
            const data = domConfig.elementData.renderData,
                  event = {
              renderData: data,
              assignmentRecord: data.assignmentRecord,
              eventRecord: data.eventRecord,
              resourceRecord: data.resourceRecord,
              element: targetElement,
              isReusingElement: action === 'reuseElement',
              isRepaint: action === 'reuseOwnElement'
            };
            event.reusingElement = action === 'reuseElement'; // This event is documented on Scheduler

            scheduler.trigger('renderEvent', event);
          }
        }
      }

    }); // Change in displayed resources?

    if (me.firstResource !== firstResource || me.lastResource !== lastResource) {
      // Update header to match
      const range = me.resourceColumns.visibleResources = {
        firstResource,
        lastResource
      }; // Store which resources are currently in view

      me.firstResource = firstResource;
      me.lastResource = lastResource;
      scheduler.onVisibleResourceRangeChange(range);
      scheduler.trigger('resourceRangeChange', range);
    }
  }

  refresh(transition) {
    this.scheduler.runWithTransition(() => this.renderer(), transition);
  } // To match horizontals API, used from EventDrag

  refreshResources(resourceIds) {
    this.clearResources(resourceIds);
    this.refresh();
  } // To match horizontals API, used from EventDrag

  refreshEventsForResource(recordOrRow, force = true, draw = true) {
    this.refreshResources([recordOrRow.id]);
  }

  onRenderDone() {} //endregion
  //region Other

  get timeView() {
    return this.scheduler.timeView;
  } //endregion
  //region Cache
  // Clears cached resource layout

  clearResources(resourceIds) {
    const {
      resourceMap,
      eventMap
    } = this;
    resourceIds.forEach(resourceId => {
      if (resourceMap.has(resourceId)) {
        // The *keys* of an Object are strings, so we must iterate the values
        // and use the original eventId to look up in the Map which preserves key type.
        Object.values(resourceMap.get(resourceId)).forEach(({
          renderData: {
            eventId
          }
        }) => {
          delete eventMap.get(eventId)[resourceId];
        });
        resourceMap.delete(resourceId);
      }
    });
  }

  clearAll() {
    this.resourceMap.clear();
    this.eventMap.clear();
  } //endregion

}
VerticalRendering._$name = 'VerticalRendering';

/**
 * @module Scheduler/view/SchedulerBase
 */

/**
 * A thin base class for {@link Scheduler.view.Scheduler}. Does not include any features by default, allowing smaller
 * custom built bundles if used in place of {@link Scheduler.view.Scheduler}.
 *
 * **NOTE:** In most scenarios you do probably want to use Scheduler instead of SchedulerBase.
 *
 * @mixes Scheduler/view/mixin/EventNavigation
 * @mixes Scheduler/view/mixin/EventSelection
 * @mixes Scheduler/view/mixin/SchedulerDom
 * @mixes Scheduler/view/mixin/SchedulerDomEvents
 * @mixes Scheduler/view/mixin/SchedulerEventRendering
 * @mixes Scheduler/view/mixin/SchedulerRegions
 * @mixes Scheduler/view/mixin/SchedulerScroll
 * @mixes Scheduler/view/mixin/SchedulerState
 * @mixes Scheduler/view/mixin/SchedulerStores
 * @mixes Scheduler/view/mixin/TimelineDateMapper
 * @mixes Scheduler/view/mixin/TimelineDomEvents
 * @mixes Scheduler/view/mixin/TimelineEventRendering
 * @mixes Scheduler/view/mixin/TimelineScroll
 * @mixes Scheduler/view/mixin/TimelineViewPresets
 * @mixes Scheduler/view/mixin/TimelineZoomable
 * @mixes Scheduler/crud/mixin/CrudManagerView
 * @mixes Scheduler/data/mixin/ProjectConsumer
 *
 * @features Scheduler/feature/ColumnLines
 * @features Scheduler/feature/Dependencies
 * @features Scheduler/feature/DependencyEdit
 * @features Scheduler/feature/EventCopyPaste
 * @features Scheduler/feature/EventDrag
 * @features Scheduler/feature/EventDragCreate
 * @features Scheduler/feature/EventDragSelect
 * @features Scheduler/feature/EventEdit
 * @features Scheduler/feature/EventFilter
 * @features Scheduler/feature/EventMenu
 * @features Scheduler/feature/EventResize
 * @features Scheduler/feature/EventTooltip
 * @features Scheduler/feature/GroupSummary
 * @features Scheduler/feature/HeaderZoom
 * @features Scheduler/feature/Labels
 * @features Scheduler/feature/NonWorkingTime
 * @features Scheduler/feature/Pan
 * @features Scheduler/feature/ResourceTimeRanges
 * @features Scheduler/feature/ScheduleContext
 * @features Scheduler/feature/ScheduleMenu
 * @features Scheduler/feature/ScheduleTooltip
 * @features Scheduler/feature/SimpleEventEdit
 * @features Scheduler/feature/StickyEvents
 * @features Scheduler/feature/Summary
 * @features Scheduler/feature/TimeAxisHeaderMenu
 * @features Scheduler/feature/TimeRanges
 *
 * @features Scheduler/feature/experimental/ExcelExporter
 *
 * @features Scheduler/feature/export/PdfExport
 * @features Scheduler/feature/export/exporter/MultiPageExporter
 * @features Scheduler/feature/export/exporter/MultiPageVerticalExporter
 * @features Scheduler/feature/export/exporter/SinglePageExporter
 *
 * @extends Scheduler/view/TimelineBase
 */

class SchedulerBase extends TimelineBase.mixin(CrudManagerView, SchedulerDom, SchedulerDomEvents, SchedulerStores, SchedulerScroll, SchedulerState, SchedulerEventRendering, SchedulerRegions, SchedulerEventSelection, SchedulerEventNavigation, CurrentConfig) {
  //region Config
  static get $name() {
    return 'SchedulerBase';
  } // Factoryable type name

  static get type() {
    return 'schedulerbase';
  }

  static get configurable() {
    return {
      /**
       * Get/set the scheduler's read-only state. When set to `true`, any UIs for modifying data are disabled.
       * @member {Boolean} readOnly
       */

      /**
       * Configure as `true` to make the scheduler read-only, by disabling any UIs for modifying data.
       *
       * __Note that checks MUST always also be applied at the server side.__
       * @config {Boolean} readOnly
       * @default false
       */

      /**
       * The date to display when used as a component of a Calendar.
       *
       * This is required by the Calendar Mode Interface.
       *
       * @config {Date}
       * @category Calendar integration
       */
      date: {
        value: null,
        $config: {
          equal: 'date'
        }
      },

      /**
       * Unit used to control how large steps to take when clicking the previous and next buttons in the Calendar
       * UI. Only applies when used as a component of a Calendar.
       *
       * Suitable units depend on configured {@link #config-range}, a smaller or equal unit is recommended.
       *
       * @config {String}
       * @category Calendar integration
       */
      stepUnit: 'week',

      /**
       * Unit used to set the length of the time axis when used as a component of a Calendar. Suitable units are
       * `'month'`, `'week'` and `'day'`.
       *
       * @config {String}
       * @category Calendar integration
       */
      range: 'week',

      /**
       * When the scheduler is used in a Calendar, this function provides the textual description for the
       * Calendar's toolbar.
       *
       * ```javascript
       *  descriptionRenderer : scheduler => {
       *      const
       *          count = scheduler.eventStore.records.filter(
       *              eventRec => DateHelper.intersectSpans(
       *                  scheduler.startDate, scheduler.endDate,
       *                  eventRec.startDate, eventRec.endDate)).length,
       *          startDate = DateHelper.format(scheduler.startDate, 'DD/MM/YYY'),
       *          endData = DateHelper.format(scheduler.endDate, 'DD/MM/YYY');
       *
       *      return `${startDate} - ${endData}, ${count} event${count === 1 ? '' : 's'}`;
       *  }
       * ```
       * @config {Function}
       * @param {Scheduler.view.SchedulerBase} view The active view.
       * @category Calendar integration
       */
      descriptionRenderer: {
        value: null,
        $config: null,
        default: view => {
          switch (view.range) {
            case 'month':
              return DateHelper.format(view.startDate, 'MMMM, YYYY');

            case 'week':
              return `${DateHelper.getLocalizedNameOfUnit('Week')} ${DateHelper.getWeekDescription(view.startDate, view.endDate)}`;

            case 'day':
              return DateHelper.format(view.startDate, 'MMMM D, YYYY');
          }
        }
      },

      /**
       * A method allowing you to define date boundaries that will constrain resize, create and drag drop operations. The method will be called with the
       * Resource record, and the Event record.
       *
       * ```javascript
       *  new Scheduler({
       *      getDateConstraints(resourceRecord, eventRecord) {
       *          // Assuming you have added these extra fields to your own EventModel subclass
       *          const { minStartDate, maxEndDate } = eventRecord;
       *
       *          return {
       *              start : minStartDate,
       *              end   : maxEndDate
       *          };
       *      }
       *  });
       * ```
       * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
       * @param {Scheduler.model.EventModel} eventRecord The event record
       * @return {Object} Constraining object containing `start` and `end` constraints. Omitting either
       * will mean that end is not constrained. So you can prevent a resize or move from moving *before*
       * a certain time while not constraining the end date.
       * @return {Date} [return.start] Start date
       * @return {Date} [return.end] End date
       * @config {Function}
       * @category Scheduled events
       */
      getDateConstraints: null,

      /**
       * The time axis column config for vertical {@link Scheduler.view.SchedulerBase#config-mode}.
       *
       * Object with {@link Scheduler.column.VerticalTimeAxisColumn} configuration.
       *
       * This object will be used to configure the vertical time axis column instance.
       *
       * The config allows configuring the `VerticalTimeAxisColumn` instance used in vertical mode with any Column options that apply to it.
       *
       * Example:
       *
       * ```javascript
       * new Scheduler({
       *     mode     : 'vertical',
       *     features : {
       *         filterBar : true
       *     },
       *     verticalTimeAxisColumn : {
       *         text  : 'Filter by event name',
       *         width : 180,
       *         filterable : {
       *             // add a filter field to the vertical column access header
       *             filterField : {
       *                 type        : 'text',
       *                 placeholder : 'Type to search',
       *                 onChange    : ({ value }) => {
       *                     // filter event by name converting to lowerCase to be equal comparison
       *                     scheduler.eventStore.filter({
       *                         filters : event => event.name.toLowerCase().includes(value.toLowerCase()),
       *                         replace : true
       *                     });
       *                 }
       *             }
       *         }
       *     },
       *     ...
       * });
       * ```
       *
       * @config {Object}
       * @category Time axis
       */
      verticalTimeAxisColumn: {},

      /**
       * If true, a new event will be created when user double clicks on a time axis cell (if scheduler is not in read only mode).
       * The duration / durationUnit of the new event will be 1 time axis tick (default),
       * or it can be read from the {@link Scheduler.model.EventModel#field-duration}
       * and {@link Scheduler.model.EventModel#field-durationUnit} fields.
       * Set to false to not create events on double click.
       * @config {Boolean|Object} createEventOnDblClick
       * @param {Boolean} [createEventOnDblClick.useEventModelDefaults] set to true to set default duration based on the defaults
       * specified by the {@link Scheduler.model.EventModel#field-duration} and {@link Scheduler.model.EventModel#field-durationUnit}
       * fields.
       * @default
       * @category Scheduled events
       */
      createEventOnDblClick: true,
      scheduledEventName: 'event'
    };
  }

  static get defaultConfig() {
    return {
      /**
       * Scheduler mode. Supported values: horizontal, vertical
       * @config {String} mode
       * @default
       */
      mode: 'horizontal',

      /**
       * CSS class to add to rendered events
       * @config {String}
       * @category CSS
       * @private
       * @default
       */
      eventCls: 'b-sch-event',

      /**
       * CSS class to add to cells in the timeaxis column
       * @config {String}
       * @category CSS
       * @private
       * @default
       */
      timeCellCls: 'b-sch-timeaxis-cell',
      timeCellSelector: '.b-sch-timeaxis-cell',

      /**
       * A CSS class to apply to each event in the view on mouseover (defaults to 'b-sch-event-hover').
       * @config {String}
       * @default
       * @category CSS
       * @private
       */
      overScheduledEventClass: 'b-sch-event-hover',

      /**
       * Set to false if you don't want to allow events overlapping times for any one resource (defaults to true).
       * @config {Boolean}
       * @default
       * @category Scheduled events
       */
      allowOverlap: true,

      /**
       * The height in pixels of Scheduler rows.
       * @config {Number}
       * @default
       */
      rowHeight: 60,

      /**
       * Scheduler overrides Grids default implementation of {@link Grid.view.GridBase#config-getRowHeight} to
       * pre-calculate row heights based on events in the rows.
       *
       * The amount of rows that are pre-calculated is limited for performance reasons. The limit is configurable
       * by specifying the {@link Scheduler.view.SchedulerBase#config-preCalculateHeightLimit} config.
       *
       * The results of the calculation are cached internally.
       *
       * @config {Function} getRowHeight
       * @param {Scheduler.model.ResourceModel} getRowHeight.record Resource record to determine row height for
       * @returns {Number} Desired row height
       * @category Layout
       */

      /**
       * Maximum number of resources for which height is pre-calculated. If you have many events per
       * resource you might want to lower this number to gain some initial rendering performance.
       *
       * Specify a falsy value to opt out of row height pre-calculation.
       *
       * @config {Number}
       * @default
       * @category Layout
       */
      preCalculateHeightLimit: 10000,
      crudManagerClass: CrudManager,
      testConfig: {
        loadMaskError: {
          autoClose: 10,
          showDelay: 0
        }
      }
    };
  } // Keep this commented out to have easy access to the syntax next time we need to use it
  // static get deprecatedEvents() {
  //     return {
  //         eventContextMenuBeforeShow : {
  //             product            : 'Scheduler',
  //             invalidAsOfVersion : '5.0.0',
  //             message            : '`eventContextMenuBeforeShow` event is deprecated, in favor of `eventMenuBeforeShow` event. Please see https://bryntum.com/docs/scheduler/#Scheduler/guides/upgrades/3.1.0.md for more information.'
  //         }
  //     };
  // }
  //endregion
  //region Store & model docs
  // Documented here instead of in SchedulerStores since SchedulerPro uses different types
  // Configs

  /**
   * Inline events, will be loaded into an internally created EventStore.
   * @config {Scheduler.model.EventModel[]|Object[]} events
   * @category Data
   */

  /**
   * The {@link Scheduler.data.EventStore} holding the events to be rendered into the scheduler (required).
   * @config {Scheduler.data.EventStore|Object} eventStore
   * @category Data
   */

  /**
   * Inline resources, will be loaded into an internally created ResourceStore.
   * @config {Scheduler.model.ResourceModel[]|Object[]} resources
   * @category Data
   */

  /**
   * The {@link Scheduler.data.ResourceStore} holding the resources to be rendered into the scheduler (required).
   * @config {Scheduler.data.ResourceStore|Object} resourceStore
   * @category Data
   */

  /**
   * Inline assignments, will be loaded into an internally created AssignmentStore.
   * @config {Scheduler.model.AssignmentModel[]|Object[]} assignments
   * @category Data
   */

  /**
   * The optional {@link Scheduler.data.AssignmentStore}, holding assignments between resources and events.
   * Required for multi assignments.
   * @config {Scheduler.data.AssignmentStore|Object} assignmentStore
   * @category Data
   */

  /**
   * Inline dependencies, will be loaded into an internally created DependencyStore.
   * @config {Scheduler.model.DependencyModel[]|Object[]} dependencies
   * @category Data
   */

  /**
   * The optional {@link Scheduler.data.DependencyStore}.
   * @config {Scheduler.data.DependencyStore|Object} dependencyStore
   * @category Data
   */
  // Properties

  /**
   * Get/set events, applies to the backing project's EventStore.
   * @member {Scheduler.model.EventModel[]} events
   * @accepts {Scheduler.model.EventModel[]|Object[]}
   * @category Data
   */

  /**
   * Get/set the event store instance of the backing project.
   * @member {Scheduler.data.EventStore} eventStore
   * @category Data
   */

  /**
   * Get/set resources, applies to the backing project's ResourceStore.
   * @member {Scheduler.model.ResourceModel[]} resources
   * @accepts {Scheduler.model.ResourceModel[]|Object[]}
   * @category Data
   */

  /**
   * Get/set the resource store instance of the backing project
   * @member {Scheduler.data.ResourceStore} resourceStore
   * @category Data
   */

  /**
   * Get/set assignments, applies to the backing project's AssignmentStore.
   * @member {Scheduler.model.AssignmentModel[]} assignments
   * @accepts {Scheduler.model.AssignmentModel[]|Object[]}
   * @category Data
   */

  /**
   * Get/set the event store instance of the backing project.
   * @member {Scheduler.data.AssignmentStore} assignmentStore
   * @category Data
   */

  /**
   * Get/set dependencies, applies to the backing projects DependencyStore.
   * @member {Scheduler.model.DependencyModel[]} dependencies
   * @accepts {Scheduler.model.DependencyModel[]|Object[]}
   * @category Data
   */

  /**
   * Get/set the dependencies store instance of the backing project.
   * @member {Scheduler.data.DependencyStore} dependencyStore
   * @category Data
   */
  //endregion
  //region Events

  /**
   * Fired after rendering an event, when its element is available in DOM.
   * @event renderEvent
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord The event record
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord The assignment record
   * @param {Object} renderData An object containing details about the event rendering, see
   *   {@link Scheduler.view.mixin.SchedulerEventRendering#config-eventRenderer} for details
   * @param {Boolean} isRepaint `true` if this render is a repaint of the event, updating its existing element
   * @param {Boolean} isReusingElement `true` if this render lead to the event reusing a released events element
   * @param {HTMLElement} element The event bar element
   */

  /**
   * Fired after releasing an event, useful to cleanup of custom content added on `renderEvent` or in `eventRenderer`.
   * @event releaseEvent
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel} eventRecord The event record
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Scheduler.model.AssignmentModel} assignmentRecord The assignment record
   * @param {Object} renderData An object containing details about the event rendering
   * @param {HTMLElement} element The event bar element
   */

  /**
   * Fired when clicking a resource header cell
   * @event resourceHeaderClick
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Event} event The event
   */

  /**
   * Fired when double clicking a resource header cell
   * @event resourceHeaderDblclick
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Event} event The event
   */

  /**
   * Fired when activating context menu on a resource header cell
   * @event resourceHeaderContextmenu
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.ResourceModel} resourceRecord The resource record
   * @param {Event} event The event
   */

  /**
   * Triggered when a keydown event is observed if there are selected events.
   * @event eventKeyDown
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel[]} eventRecord The selected event records
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecord The selected assignment records
   * @param {KeyboardEvent} event Browser event
   */

  /**
   * Triggered when a keyup event is observed if there are selected events.
   * @event eventKeyUp
   * @param {Scheduler.view.Scheduler} source This Scheduler
   * @param {Scheduler.model.EventModel[]} eventRecord The selected event records
   * @param {Scheduler.model.AssignmentModel[]} assignmentRecord The selected assignment records
   * @param {KeyboardEvent} event Browser event
   */
  //endregion
  //region Functions injected by features
  // For documentation & typings purposes

  /**
   * Opens an editor UI to edit the passed event.
   *
   * *NOTE: Only available when the {@link Scheduler/feature/EventEdit EventEdit} feature is enabled.*
   *
   * @function editEvent
   * @param {Scheduler.model.EventModel} eventRecord Event to edit
   * @param {Scheduler.model.ResourceModel} [resourceRecord] The Resource record for the event.
   * This parameter is needed if the event is newly created for a resource and has not been assigned, or when using
   * multi assignment.
   * @param {HTMLElement} [element] Element to anchor editor to (defaults to events element)
   * @category Feature shortcuts
   */

  /**
   * Returns the dependency record for a DOM element
   *
   * *NOTE: Only available when the {@link Scheduler/feature/Dependencies Dependencies} feature is enabled.*
   *
   * @function resolveDependencyRecord
   * @param {HTMLElement} element The dependency line element
   * @return {Scheduler.model.DependencyModel} The dependency record
   * @category Feature shortcuts
   */
  //endregion
  //region Init

  afterConstruct() {
    const me = this;
    super.afterConstruct();
    me.on('scroll', me.onVerticalScroll, me);

    if (me.createEventOnDblClick) {
      me.on('scheduledblclick', me.onTimeAxisCellDblClick);
    }
  } //endregion
  //region Overrides

  onPaintOverride() {// Internal procedure used for paint method overrides
    // Not used in onPaint() because it may be chained on instance and Override won't be applied
  } //endregion
  //region Config getters/setters
  // Placeholder getter/setter for mixins, please make any changes needed to SchedulerStores#store instead

  get store() {
    return super.store;
  }

  set store(store) {
    super.store = store;
  }
  /**
   * Returns an object defining the range of visible resources
   * @property {Object}
   * @property {Number} visibleResources.first First visible resource
   * @property {Number} visibleResources.last Last visible resource
   * @readonly
   */

  get visibleResources() {
    const me = this;

    if (me.isVertical) {
      return me.currentOrientation.visibleResources;
    }

    return {
      first: me.store.getById(me.firstVisibleRow.id),
      last: me.store.getById(me.lastVisibleRow.id)
    };
  } //endregion
  //region Event handlers

  onLocaleChange() {
    this.currentOrientation.onLocaleChange();
    super.onLocaleChange();
  }

  onTimeAxisCellDblClick({
    date: startDate,
    resourceRecord,
    row
  }) {
    const me = this;

    if (me.readOnly || resourceRecord.isSpecialRow) {
      return;
    }

    me.internalAddEvent(startDate, resourceRecord, row);
  }

  onVerticalScroll({
    scrollTop
  }) {
    this.currentOrientation.updateFromVerticalScroll(scrollTop);
  }
  /**
   * Called when new event is created.
   * Сan be overriden to supply default record values etc.
   * @param {Scheduler.model.EventModel} eventRecord Newly created event
   */

  onEventCreated(eventRecord) {} //endregion
  //region Mode

  /**
   * Checks if scheduler is in horizontal mode
   * @returns {Boolean}
   * @readonly
   * @category Common
   * @private
   */

  get isHorizontal() {
    return this.mode === 'horizontal';
  }
  /**
   * Checks if scheduler is in vertical mode
   * @returns {Boolean}
   * @readonly
   * @category Common
   * @private
   */

  get isVertical() {
    return this.mode === 'vertical';
  }
  /**
   * Get mode (horizontal/vertical)
   * @property {String}
   * @readonly
   * @category Common
   */

  get mode() {
    return this._mode;
  }

  set mode(mode) {
    const me = this;
    me._mode = mode;

    if (!me[mode]) {
      me.element.classList.add(`b-sch-${mode}`);

      if (mode === 'horizontal') {
        me.horizontal = new HorizontalRendering(me);

        if (me.isPainted) {
          me.horizontal.init();
        }
      } else if (mode === 'vertical') {
        me.vertical = new VerticalRendering(me);

        if (me.rendered) {
          me.vertical.init();
        }
      }
    }
  }

  get currentOrientation() {
    return this[this.mode];
  } //endregion
  //region Dom event dummies
  // this is ugly, but needed since super cannot be called from SchedulerDomEvents mixin...

  onElementKeyDown(event) {
    return super.onElementKeyDown(event);
  }

  onElementKeyUp(event) {
    return super.onElementKeyUp(event);
  }

  onElementMouseOver(event) {
    return super.onElementMouseOver(event);
  }

  onElementMouseOut(event) {
    return super.onElementMouseOut(event);
  } //endregion
  //region Feature hooks

  /**
   * Populates the event context menu. Chained in features to add menu items.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown.
   * @param {Scheduler.model.EventModel} options.eventRecord The context event.
   * @param {Scheduler.model.ResourceModel} options.resourceRecord The context resource.
   * @param {Scheduler.model.AssignmentModel} options.assignmentRecord The context assignment if any.
   * @param {Object} options.items A named object to describe menu items.
   * @internal
   */

  populateEventMenu() {}
  /**
   * Populates the time axis context menu. Chained in features to add menu items.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown.
   * @param {Scheduler.model.ResourceModel} options.resourceRecord The context resource.
   * @param {Date} options.date The Date corresponding to the mouse position in the time axis.
   * @param {Object} options.items A named object to describe menu items.
   * @internal
   */

  populateScheduleMenu() {} // Called when visible date range changes

  onVisibleDateRangeChange() {} // Called when visible resource range changes in vertical mode

  onVisibleResourceRangeChange() {} //endregion
  //region Scheduler specific date mapping functions
  // Method is chained by event editing features. Ensure that the event is in the store.

  editEvent(eventRecord, resourceRecord, element) {
    const me = this,
          {
      eventStore,
      assignmentStore,
      features
    } = me,
          {
      eventEdit,
      taskEdit,
      simpleEventEdit
    } = features,
          eventEditAvailable = Boolean(eventEdit && !eventEdit.disabled || taskEdit && !taskEdit.disabled || simpleEventEdit && !simpleEventEdit.disabled); // Abort the chain if no event editing features available

    if (!eventEditAvailable) {
      return false;
    }

    if (eventRecord.eventStore !== eventStore) {
      const {
        enableEventAnimations
      } = me,
            resourceRecords = []; // It's only a provisional event because we are going to edit it which will
      // allow an opportunity to cancel the add (by removing it).

      eventRecord.isCreating = true;
      let assignments = null;

      if (resourceRecord) {
        resourceRecords.push(resourceRecord);
        assignments = assignmentStore.assignEventToResource(eventRecord, resourceRecord);
      } // Vetoable beforeEventAdd allows cancel of this operation

      if (me.trigger('beforeEventAdd', {
        eventRecord,
        resourceRecords
      }) === false) {
        // Remove any assignment created above, to leave store as it was
        assignmentStore === null || assignmentStore === void 0 ? void 0 : assignmentStore.remove(assignments);
        return false;
      }

      me.enableEventAnimations = false;
      eventStore.add(eventRecord);
      me.project.commitAsync().then(() => me.enableEventAnimations = enableEventAnimations); // Element must be created synchronously, not after the project's normalizing delays.

      me.refreshRows();
    }
  }

  async internalAddEvent(startDate, resourceRecord, row) {
    const me = this,
          {
      enableEventAnimations,
      features,
      eventStore,
      assignmentStore
    } = me,
          resourceRecords = [resourceRecord],
          useEventModelDefaults = me.createEventOnDblClick.useEventModelDefaults,
          defaultDuration = useEventModelDefaults ? eventStore.modelClass.fieldMap.duration.defaultValue : 1,
          defaultDurationUnit = useEventModelDefaults ? eventStore.modelClass.fieldMap.durationUnit.defaultValue : me.timeAxis.unit,
          eventRecord = eventStore.createRecord({
      startDate,
      endDate: DateHelper.add(startDate, defaultDuration, defaultDurationUnit),
      duration: defaultDuration,
      durationUnit: defaultDurationUnit,
      name: me.L('L{Object.newEvent}')
    }),
          eventEditAvailable = Boolean(features.eventEdit && !features.eventEdit.disabled || features.taskEdit && !features.taskEdit.disabled || features.simpleEventEdit && !features.simpleEventEdit.disabled); // It's only a provisional event if there is an event edit feature available to
    // cancel the add (by removing it). Otherwise it's a definite event creation.

    eventRecord.isCreating = eventEditAvailable;
    me.onEventCreated(eventRecord);
    const assignments = assignmentStore === null || assignmentStore === void 0 ? void 0 : assignmentStore.assignEventToResource(eventRecord, resourceRecord);
    /**
     * Fires before an event is added. Can be triggered by schedule double click or drag create action.
     * @event beforeEventAdd
     * @param {Scheduler.view.Scheduler} source The Scheduler instance
     * @param {Scheduler.model.EventModel} eventRecord The record about to be added
     * @param {Scheduler.model.ResourceModel[]} resourceRecords Resources that the record is assigned to
     * @preventable
     */

    if (me.trigger('beforeEventAdd', {
      eventRecord,
      resourceRecords
    }) === false) {
      // Remove any assignment created above, to leave store as it was
      assignmentStore === null || assignmentStore === void 0 ? void 0 : assignmentStore.remove(assignments);
      return;
    }

    me.enableEventAnimations = false;
    eventStore.add(eventRecord);
    me.project.commitAsync().then(() => me.enableEventAnimations = enableEventAnimations); // Element must be created synchronously, not after the project's normalizing delays.
    // Overrides the check for isEngineReady in VerticalRendering so that the newly added record
    // will be rendered when we call refreshRows.

    me.isCreating = true;
    me.refreshRows();
    me.isCreating = false;

    if (eventEditAvailable) {
      me.editEvent(eventRecord, resourceRecord, me.getEventElement(eventRecord));
    }
  }
  /**
   * Checks if a date range is allocated or not for a given resource.
   * @param {Date} start The start date
   * @param {Date} end The end date
   * @param {Scheduler.model.EventModel|null} excludeEvent An event to exclude from the check (or null)
   * @param {Scheduler.model.ResourceModel} resource The resource
   * @return {Boolean} True if the timespan is available for the resource
   * @category Dates
   */

  isDateRangeAvailable(start, end, excludeEvent, resource) {
    return this.eventStore.isDateRangeAvailable(start, end, excludeEvent, resource);
  } //endregion

  /**
   * Suspends UI refresh on store operations.
   *
   * Multiple calls to `suspendRefresh` stack up, and will require an equal number of `resumeRefresh` calls to
   * actually resume UI refresh.
   *
   * @function suspendRefresh
   */

  /**
   * Resumes UI refresh on store operations.
   *
   * Multiple calls to `suspendRefresh` stack up, and will require an equal number of `resumeRefresh` calls to
   * actually resume UI refresh.
   *
   * Specify `true` as the first param to trigger a refresh if this call unblocked the refresh suspension.
   * If the underlying project is calculating changes, the refresh will be postponed until it is done.
   *
   * @param {Boolean} trigger `true` to trigger a refresh, if this resume unblocks the suspend
   * @returns {Promise}
   */

  async resumeRefresh(trigger) {
    super.resumeRefresh(false);
    const me = this;

    if (!me.refreshSuspended && trigger) {
      // Do not refresh until project is in a valid state
      if (!me.isEngineReady) {
        // Refresh will happen because of the commit, bail out of this one after forcing rendering to consider
        // next one a full refresh
        me.currentOrientation.refreshAllWhenReady = true;
        return me.project.commitAsync();
      } // View could've been destroyed while we waited for engine

      if (!me.isDestroyed) {
        // If it already is, refresh now
        me.refreshWithTransition();
      }
    }
  } //region Appearance
  // Overrides grid to take crudManager loading into account

  toggleEmptyText() {
    const me = this;

    if (me.bodyContainer) {
      var _me$crudManager;

      DomHelper.toggleClasses(me.bodyContainer, 'b-grid-empty', !(me.resourceStore.count > 0 || (_me$crudManager = me.crudManager) !== null && _me$crudManager !== void 0 && _me$crudManager.isLoading));
    }
  } // Overrides Grids base implementation to return a correctly calculated height for the row. Also stores it in
  // RowManagers height map, which is used to calculate total height etc.

  getRowHeight(resourceRecord) {
    if (this.currentOrientation.calculateRowHeight) {
      const height = this.currentOrientation.calculateRowHeight(resourceRecord);
      this.rowManager.storeKnownHeight(resourceRecord.id, height);
      return height;
    }
  } // Calculates the height for specified rows. Call when changes potentially makes its height invalid

  calculateRowHeights(resourceRecords, silent = false) {
    // Array allowed to have nulls in it for easier code when calling this fn
    resourceRecords.forEach(resourceRecord => resourceRecord && this.getRowHeight(resourceRecord));

    if (!silent) {
      this.rowManager.estimateTotalHeight(true);
    }
  } // Calculate heights for all rows (up to the preCalculateHeightLimit)

  calculateAllRowHeights(silent = false) {
    const {
      store,
      rowManager
    } = this,
          count = Math.min(store.count, this.preCalculateHeightLimit); // Allow opt out by specifying falsy value.

    if (count) {
      rowManager.clearKnownHeights();

      for (let i = 0; i < count; i++) {
        // This will both calculate and store the height
        this.getRowHeight(store.getAt(i));
      } // Make sure height is reflected on scroller etc.

      if (!silent) {
        rowManager.estimateTotalHeight(true);
      }
    }
  } //endregion
  //region Calendar Mode Interface
  // These are all internal and match up w/CalendarMixin

  get description() {
    return this.callback(this.descriptionRenderer, this, [this]);
  }

  getEventRecord(target) {
    target = DomHelper.getEventElement(target);
    return this.resolveEventRecord(target);
  }

  getEventElement(eventRecord) {
    return this.getElementFromEventRecord(eventRecord);
  }

  changeRange(unit) {
    return DateHelper.normalizeUnit(unit);
  }

  updateRange(unit) {
    if (!this.isConfiguring) {
      const currentDate = this.date,
            newDate = this.date = DateHelper.startOf(currentDate, unit); // Force a span update if changing the range did not change the date

      if (currentDate.getTime() === newDate.getTime()) {
        this.updateDate(newDate);
      }
    }
  }

  changeStepUnit(unit) {
    return DateHelper.normalizeUnit(unit);
  }

  updateDate(newDate) {
    const me = this,
          start = DateHelper.startOf(newDate, me.range);
    me.setTimeSpan(start, DateHelper.add(start, 1, me.range)); // Cant always use newDate here in case timeAxis is filtered

    me.visibleDate = {
      date: DateHelper.max(newDate, me.timeAxis.startDate),
      block: 'start',
      animate: true
    };
    me.trigger('descriptionChange');
  }

  previous() {
    this.date = DateHelper.add(this.date, -1, this.stepUnit);
  }

  next() {
    this.date = DateHelper.add(this.date, 1, this.stepUnit);
  } //endregion

  /**
   * Assigns and schedules an unassigned event record (+ adds it to this Scheduler's event store unless already in it).
   * @param {Object} config The config containing data about the event record to schedule
   * @param {Date} config.startDate The start date
   * @param {Scheduler.model.EventModel} config.eventRecord An event to exclude from the check (or null)
   * @param {Scheduler.model.ResourceModel} config.resourceRecord The resource
   * @param {HTMLElement} [config.element] The element if you are dragging an element from outside the scheduler
   * @return {Promise}
   */

  async scheduleEvent({
    startDate,
    eventRecord,
    resourceRecord,
    element
  }) {
    if (!this.eventStore.includes(eventRecord)) {
      this.eventStore.add(eventRecord);
    }

    eventRecord.startDate = startDate;
    eventRecord.assign(resourceRecord);

    if (element) {
      const eventRect = Rectangle.from(element, this.foregroundCanvas); // Clear translate styles used by DragHelper

      DomHelper.setTranslateXY(element, 0, 0);
      DomHelper.setTopLeft(element, eventRect.y, eventRect.x);
      DomSync.addChild(this.foregroundCanvas, element, eventRecord.assignments[0].id);
    }

    await this.project.commitAsync();
  }

} // Register this widget type with its Factory

SchedulerBase.initClass(); // Scheduler version is specified in TimelineBase because Gantt extends it

SchedulerBase._$name = 'SchedulerBase';

/**
 * @module Scheduler/feature/TimeRanges
 */

/**
 * Feature that renders global ranges of time in the timeline. Use this feature to visualize a `range` like a 1 hr lunch or some important point in time
 * (a `line`, i.e. a range with 0 duration). This feature can also show a current time indicator if you set {@link #config-showCurrentTimeLine} to true. To style
 * the rendered elements, use the {@link Scheduler.model.TimeSpan#field-cls cls} field of the `TimeSpan` class.
 *
 * Each time range is represented by an instances of {@link Scheduler.model.TimeSpan}, held in a simple {@link Core.data.Store}.
 * The feature uses {@link Scheduler/model/ProjectModel#property-timeRangeStore} defined on the project.
 * The store/persisting loading is handled by Crud Manager (if it's used by the component).
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid.view.mixin.GridFeatures}.
 *
 * ## Showing an icon in the time range header
 *
 * You can use Font Awesome icons easily (or set any other icon using CSS) by using the {@link Scheduler.model.TimeSpan#field-cls cls}
 * field. The JSON data below will show a flag icon:
 *
 * ```json
 * {
 *     "id"        : 5,
 *     "cls"       : "b-fa b-fa-flag",
 *     "name"      : "v5.0",
 *     "startDate" : "2019-02-07 15:45"
 * },
 * ```
 *
 * ## Recurring time ranges
 *
 * The feature supports recurring ranges in case the provided store and models
 * have {@link Scheduler/data/mixin/RecurringTimeSpansMixin} and {@link Scheduler/model/mixin/RecurringTimeSpan}
 * mixins applied:
 *
 * ```javascript
 * // We want to use recurring time ranges so we make a special model extending standard TimeSpan model with
 * // RecurringTimeSpan which adds recurrence support
 * class MyTimeRange extends RecurringTimeSpan(TimeSpan) {}
 *
 * // Define a new store extending standard Store with RecurringTimeSpansMixin mixin to add recurrence support to the
 * // store. This store will contain time ranges.
 * class MyTimeRangeStore extends RecurringTimeSpansMixin(Store) {
 *     static get defaultConfig() {
 *         return {
 *             // use our new MyResourceTimeRange model
 *             modelClass : MyTimeRange
 *         };
 *     }
 * };
 *
 * // Instantiate store for timeRanges using our new classes
 * const timeRangeStore = new MyTimeRangeStore({
 *     data : [{
 *         id             : 1,
 *         resourceId     : 'r1',
 *         startDate      : '2019-01-01T11:00',
 *         endDate        : '2019-01-01T13:00',
 *         name           : 'Lunch',
 *         // this time range should repeat every day
 *         recurrenceRule : 'FREQ=DAILY'
 *     }]
 * });
 *
 * const scheduler = new Scheduler({
 *     ...
 *     features : {
 *         timeRanges : true
 *     },
 *
 *     crudManager : {
 *         // store for "timeRanges" feature
 *         timeRangeStore
 *     }
 * });
 * ```
 *
 * @extends Scheduler/feature/AbstractTimeRanges
 * @classtype timeRanges
 * @feature
 * @demo Scheduler/timeranges
 * @inlineexample Scheduler/feature/TimeRanges.js
 */

class TimeRanges extends AbstractTimeRanges.mixin(AttachToProjectMixin) {
  //region Config
  static get $name() {
    return 'TimeRanges';
  }

  static get defaultConfig() {
    return {
      store: true,

      /**
       * The interval (as amount of ms) defining how frequently the current timeline will be updated
       * @config {Number}
       * @default
       */
      currentTimeLineUpdateInterval: 10000,

      /**
       * The date format to show in the header for the current time line (when {@link #config-showCurrentTimeLine} is configured).
       * See {@link Core.helper.DateHelper} for the possible formats to use.
       * @config {String}
       * @default
       */
      currentDateFormat: 'HH:mm',

      /**
       * Show a line indicating current time. Either `true` or `false` or a {@link Scheduler.model.TimeSpan} configuration object to apply to this
       * special time range (allowing you to provide a custom text):
       *
       * ```javascript
       * showCurrentTimeLine : {
       *     name : 'Now'
       * }
       * ```
       *
       * The line carries the CSS class name `b-sch-current-time`, and this may be used to add custom styling to the current time line.
       *
       * @config {Boolean|Object}
       * @default
       */
      showCurrentTimeLine: false
    };
  } //endregion
  //region Init & destroy

  construct(client, config = {}) {
    super.construct(client, config);

    if (!client._timeRangesExposed) {
      // expose getter/setter for timeRanges on scheduler/gantt
      Object.defineProperty(client, 'timeRanges', {
        get: () => this.timeRanges,
        set: timeRanges => client.project.timeRangeStore.data = timeRanges
      });
      client._timeRangesExposed = true;
    } // Pull in the timeRanges config before the store config if it exists.

    this.getConfig('timeRanges');
  }
  /**
   * Returns the TimeRanges which occur within the client Scheduler's time axis.
   * @property {Scheduler.model.TimeSpan[]}
   */

  get timeRanges() {
    const {
      store
    } = this,
          {
      records
    } = store;

    if (store.recurringEvents) {
      const result = [],
            {
        startDate,
        endDate
      } = this.client.timeAxis; // Collect occurrences for the recurring events in the record set

      records.forEach(timeSpan => {
        if (timeSpan.isRecurring) {
          result.push.apply(result, timeSpan.getOccurrencesForDateRange(startDate, endDate));
        } else {
          result.push(timeSpan);
        }
      });
      return result;
    }

    return records;
  } //endregion
  //region Current time line

  initCurrentTimeLine() {
    const me = this;

    if (me.currentTimeLine || !me.showCurrentTimeLine) {
      return;
    }

    const data = typeof me.showCurrentTimeLine === 'object' ? me.showCurrentTimeLine : {};
    me.currentTimeLine = me.store.modelClass.new({
      // eslint-disable-next-line quote-props
      'id': 'currentTime',
      cls: 'b-sch-current-time'
    }, data);
    me.updateCurrentTimeLine = me.updateCurrentTimeLine.bind(me);
    me.currentTimeInterval = me.setInterval(me.updateCurrentTimeLine, me.currentTimeLineUpdateInterval);
    me.updateCurrentTimeLine();

    if (me.client.isPainted) {
      me.renderRanges();
    }
  }

  updateCurrentTimeLine() {
    const me = this,
          currentTimeRecord = me.currentTimeLine;
    currentTimeRecord.startDate = new Date();

    if (!currentTimeRecord.originalData.name) {
      currentTimeRecord.name = DateHelper.format(currentTimeRecord.startDate, me.currentDateFormat);
    }

    me.onStoreChanged({
      action: 'update',
      record: currentTimeRecord,
      changes: {}
    });
  }

  hideCurrentTimeLine() {
    const me = this;

    if (!me.currentTimeLine) {
      return;
    }

    me.clearInterval(me.currentTimeInterval);
    me.currentTimeLine = null;

    if (me.client.isPainted) {
      me.renderRanges();
    }
  }

  renderRanges() {
    const me = this;
    super.renderRanges();

    if (me.showCurrentTimeLine && !me.disabled) {
      me.renderRange(me.currentTimeLine, true);
    }
  }
  /**
   * Get/set the current time line display state
   * @property {Boolean}
   */

  get showCurrentTimeLine() {
    return this._showCurrentTimeLine;
  }

  set showCurrentTimeLine(show) {
    this._showCurrentTimeLine = show;

    if (show) {
      this.initCurrentTimeLine();
    } else {
      this.hideCurrentTimeLine();
    }
  } //endregion
  //region Menu items

  /**
   * Adds a menu item to show/hide current time line.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown
   * @param {Object} options.items A named object to describe menu items
   * @internal
   */

  populateTimeAxisHeaderMenu({
    column,
    items
  }) {
    items.currentTimeLine = {
      weight: 400,
      text: this.L('L{showCurrentTimeLine}'),
      checked: this.showCurrentTimeLine,
      onToggle: ({
        checked
      }) => {
        this.showCurrentTimeLine = checked;
      }
    };
  } //endregion
  //region Disable

  /**
   * Get/set the features disabled state
   * @property {Boolean}
   */

  get disabled() {
    return this._disabled;
  }

  set disabled(disabled) {
    this._disabled = disabled;

    if (this.client.isPainted) {
      this.renderRanges();
    }
  }

  attachToProject(project) {
    // If the client's project has a timeRangeStore, we must use that
    // unless we've configured feature with a store (e.g. with recurrence mixin)
    if (!this.hasOwnStore) {
      this.store = project.timeRangeStore;
    }
  }

  get store() {
    return this.client.project.timeRangeStore;
  }

  set store(store) {
    const me = this,
          {
      client
    } = me,
          {
      project
    } = client;
    store = project.timeRangeStore;
    me.attachToStore(store); // timeRanges can be set on scheduler/gantt, for convenience. Should only be processed by the TimeRanges and not
    // any subclasses

    if (client.timeRanges && !client._timeRangesExposed) {
      store.add(client.timeRanges);
      delete client.timeRanges;
    }
  } // Called by ProjectConsumer after a new store is assigned at runtime

  attachToTimeRangeStore(store) {
    this.store = store;
  } //endregion

}
TimeRanges._$name = 'TimeRanges';
GridFeatureManager.registerFeature(TimeRanges, false, ['Scheduler', 'Gantt']);

export { DependencyEdit, EventDrag, EventDragCreate, EventTooltip, HorizontalLayoutPack, HorizontalLayoutStack, HorizontalRendering, ResourceTimeRangesBase, SchedulerBase, SchedulerDom, SchedulerDomEvents, SchedulerEventRendering, SchedulerRegions, SchedulerScroll, SchedulerState, SchedulerStores, StickyEvents, TimeRanges, VerticalRendering, VerticalTimeAxisColumn };
//# sourceMappingURL=TimeRanges.js.map
