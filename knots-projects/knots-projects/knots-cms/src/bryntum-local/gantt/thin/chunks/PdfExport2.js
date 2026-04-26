/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { ColumnStore, Column, GridFeatureManager } from './GridBase.js';
import { VersionHelper, StringHelper, InstancePlugin, Editor, EventHelper, DateHelper, DomHelper, DomSync, Tooltip, Rectangle, Field, ObjectHelper } from './Editor.js';
import { AvatarRendering } from './AvatarRendering.js';
import { Summary, MultiPageExporter as MultiPageExporter$1, MultiPageVerticalExporter as MultiPageVerticalExporter$1, ExportDialog, SinglePageExporter as SinglePageExporter$1, PdfExport as PdfExport$1 } from './PdfExport.js';
import { LocalizableCombo } from './LocalizableCombo.js';

/**
 * @module Scheduler/column/ResourceInfoColumn
 */

/**
 * Displays basic resource information. Defaults to showing an image + name + event count (all configurable).
 *
 * If a resource has no image, you can either provide an icon using `iconCls` in the data (you then need to specify
 * `image === false` in your data) or the resource initials will be shown.
 *
 * Be sure to specify {@link Scheduler.view.mixin.SchedulerEventRendering#config-resourceImagePath} to instruct the
 * column where to look for the images.
 *
 * If a image fails to load or if a resource lacks an image, the resource name initials will be rendered. If the
 * resource has an {@link Scheduler/model/mixin/ResourceModelMixin#field-eventColor} specified, it will be used as the
 * background color of the initials.
 *
 * @inlineexample Scheduler/column/ResourceInfoColumn.js
 * @classType resourceInfo
 * @extends Grid/column/Column
 */

class ResourceInfoColumn extends Column {
  static get $name() {
    return 'ResourceInfoColumn';
  }

  static get type() {
    return 'resourceInfo';
  }

  static get fields() {
    return ['showEventCount', 'showRole', 'showMeta', 'showImage', 'validNames', 'autoScaleThreshold', 'useNameAsImageName'];
  }

  static get defaults() {
    return {
      /** @hideconfigs renderer */

      /**
       * Show image. Looks for image name in fields on the resource in the following order: 'imageUrl', 'image',
       * 'name'. Set `showImage` to a field name to use a custom field. Set `Scheduler.resourceImagePath` to
       * specify where to load images from. If no extension found, defaults to
       * {@link Scheduler.view.mixin.SchedulerEventRendering#config-resourceImageExtension}.
       * @config {Boolean}
       * @default
       */
      showImage: true,

      /**
       * Show number of events assigned to the resource below the name.
       * @config {Boolean}
       * @default
       */
      showEventCount: true,

      /**
       * A template string to render any extra information about the resource below the name
       * @config {Function}
       * @param {Scheduler.model.ResourceModel} resourceRecord The record representing the current row
       */
      showMeta: null,

      /**
       * Show resource role below the name. Specify `true` to display data from the `role` field, or specify a field
       * name to read this value from.
       * @config {Boolean|String}
       * @default
       */
      showRole: false,

      /**
       * Valid image names. Set to `null` to allow all names.
       * @deprecated This will be removed in 6.0
       * @config {String[]}
       */
      validNames: null,

      /**
       * Specify 0 to prevent the column from adapting its content according to the used row height, or specify a
       * a threshold (row height) at which scaling should start.
       * @config {Number}
       * @default
       */
      autoScaleThreshold: 40,
      field: 'name',
      htmlEncode: false,
      width: 140,
      cellCls: 'b-resourceinfo-cell',
      useNameAsImageName: true,
      editor: VersionHelper.isTestEnv ? false : 'text'
    };
  }

  construct(...args) {
    super.construct(...args);
    this.avatarRendering = new AvatarRendering({
      element: this.grid.element
    });
  }

  doDestroy() {
    super.doDestroy();
    this.avatarRendering.destroy();
  }

  getImageURL(imageName) {
    const resourceImagePath = this.grid.resourceImagePath || '',
          parts = resourceImagePath.split('//'),
          urlPart = parts.length > 1 ? parts[1] : resourceImagePath,
          joined = StringHelper.joinPaths([urlPart || '', imageName || '']);
    return parts.length > 1 ? parts[0] + '//' + joined : joined;
  }

  template(resourceRecord, value) {
    const me = this,
          {
      showImage,
      showRole,
      showMeta,
      showEventCount,
      grid
    } = me,
          {
      timeAxis,
      resourceImageExtension = '',
      defaultResourceImageName
    } = grid,
          roleField = typeof showRole === 'string' ? showRole : 'role',
          count = showEventCount && resourceRecord.eventStore.getEvents({
      includeOccurrences: grid.enableRecurringEvents,
      resourceRecord,
      startDate: timeAxis.startDate,
      endDate: timeAxis.endDate
    }).length;
    let imageUrl;

    if (showImage && resourceRecord.image !== false) {
      if (resourceRecord.imageUrl) {
        imageUrl = resourceRecord.imageUrl;
      } else {
        // record.image is supposed to be a file name, located at resourceImagePath
        const imageName = typeof showImage === 'string' ? showImage : resourceRecord.image || value && me.useNameAsImageName && value.toLowerCase() + resourceImageExtension || defaultResourceImageName || '';
        imageUrl = imageName && me.getImageURL(imageName); // Image name should have an extension

        if (imageUrl && !imageName.includes('.')) {
          // If validNames is specified, check that imageName is valid
          if (!me.validNames || me.validNames.includes(imageName)) {
            imageUrl += resourceImageExtension;
          }
        }
      }
    }

    return {
      class: 'b-resource-info',
      children: [showImage && me.avatarRendering.getResourceAvatar({
        initials: resourceRecord.initials,
        color: resourceRecord.eventColor,
        iconCls: resourceRecord.iconCls,
        imageUrl,
        defaultImageUrl: defaultResourceImageName && this.getImageURL(defaultResourceImageName)
      }), showRole || showEventCount || showMeta ? {
        tag: 'dl',
        children: [{
          tag: 'dt',
          text: value
        }, showRole ? {
          tag: 'dd',
          class: 'b-resource-role',
          text: resourceRecord[roleField]
        } : null, showEventCount ? {
          tag: 'dd',
          class: 'b-resource-events',
          html: me.L('L{eventCountText}', count)
        } : null, showMeta ? {
          tag: 'dd',
          class: 'b-resource-meta',
          html: me.showMeta(resourceRecord)
        } : null]
      } : value // This becomes a text node, no HTML encoding needed
      ]
    };
  }

  defaultRenderer({
    grid,
    record,
    cellElement,
    value,
    isExport
  }) {
    let result;

    if (record.isSpecialRow) {
      result = '';
    } else if (isExport) {
      result = value;
    } else {
      if (this.autoScaleThreshold && grid.rowHeight < this.autoScaleThreshold) {
        cellElement.style.fontSize = grid.rowHeight / 40 + 'em';
      } else {
        cellElement.style.fontSize = '';
      }

      result = this.template(record, value);
    }

    return result;
  }

}
ColumnStore.registerColumnType(ResourceInfoColumn);
ResourceInfoColumn._$name = 'ResourceInfoColumn';

/**
 * @module Scheduler/feature/Labels
 */

const sides = ['top', 'left', 'right', 'bottom'],
      editorAlign = {
  top: 'b-b',
  right: 'l-l',
  bottom: 't-t',
  left: 'r-r'
},
      topBottom = {
  top: 1,
  bottom: 1
},
      layoutModes = {
  estimate: 1,
  measure: 1
},
      layoutSides = {
  left: 1,
  right: 1
};
/**
 * Displays labels at positions {@link #config-top}, {@link #config-right}, {@link #config-bottom} and
 * {@link #config-left}.
 *
 * Text in labels can be set from a field on the {@link Scheduler.model.EventModel EventModel} or the
 * {@link Scheduler.model.ResourceModel ResourceModel} or using a custom renderer.
 *
 * Since `top` and `bottom` labels occupy space that would otherwise be used by the event we recommend using bigger
 * rowHeights (>55px for both labels with default styling) and zero barMargins because `top`/`bottom` labels give space
 * around events anyway.
 *
 * To prevent labels from being overlapped by other events, see {@link #config-labelLayoutMode}.
 *
 * This feature is **off** by default. It is **not** supported in vertical mode.
 * For info on enabling it, see {@link Grid.view.mixin.GridFeatures}.
 *
 * @extends Core/mixin/InstancePlugin
 * @demo Scheduler/labels
 * @inlineexample Scheduler/feature/Labels.js
 * @classtype labels
 * @feature
 */

class Labels extends InstancePlugin {
  //region Config
  static get $name() {
    return 'Labels';
  }

  static get configurable() {
    return {
      /**
       * CSS class to apply to label elements
       * @config {String}
       * @default
       */
      labelCls: 'b-sch-label',

      /**
       * Top label configuration object. May contain the following properties:
       * @param {String} field The name of a field in one of the associated records,
       *   {@link Scheduler.model.EventModel EventModel} or {@link Scheduler.model.ResourceModel ResourceModel}.
       *   The record from which the field value is drawn will be ascertained by checking for field definitions by
       *   the specified name.
       * @param {Function} renderer A function, which when passed an object containing `eventRecord`,
       *   `resourceRecord`, `assignmentRecord` and `domConfig` properties, returns the HTML to display as the
       *   label
       * @param {Object} thisObj The `this` reference to use in the `renderer`.
       * @param {Object|Core.widget.Field} editor If the label is to be editable, a field configuration object
       *   with a `type` property, or an instantiated Field. **The `field` property is mandatory for editing to
       *   work**.
       * @config {Object}
       * @default
       */
      top: null,

      /**
       * Right label configuration object. May contain the following properties:
       * @param {String} field The name of a field in one of the associated records,
       *   {@link Scheduler.model.EventModel EventModel} or {@link Scheduler.model.ResourceModel ResourceModel}.
       *   The record from which the field value is drawn will be ascertained by checking for field definitions by
       *   the specified name.
       * @param {Function} renderer A function, which when passed an object containing `eventRecord`,
       *   `resourceRecord`, `assignmentRecord` and `domConfig` properties, returns the HTML to display as the
       *   label
       * @param {Object} thisObj The `this` reference to use in the `renderer`.
       * @param {Object|Core.widget.Field} editor If the label is to be editable, a field configuration object
       *   with a `type` property, or an instantiated Field. **The `field` property is mandatory for editing to
       *   work**.
       * @config {Object}
       * @default
       */
      right: null,

      /**
       * Bottom label configuration object. May contain the following properties:
       * @param {String} field The name of a field in one of the associated records,
       *   {@link Scheduler.model.EventModel EventModel} or {@link Scheduler.model.ResourceModel ResourceModel}.
       *   The record from which the field value is drawn will be ascertained by checking for field definitions by
       *   the specified name.
       * @param {Function} renderer A function, which when passed an object containing `eventRecord`,
       *   `resourceRecord`, `assignmentRecord` and `domConfig` properties, returns the HTML to display as the
       *   label
       * @param {Object} thisObj The `this` reference to use in the `renderer`.
       * @param {Object|Core.widget.Field} editor If the label is to be editable, a field configuration object
       *   with a `type` property, or an instantiated Field. **The `field` property is mandatory for editing to
       *   work**.
       * @config {Object}
       * @default
       */
      bottom: null,

      /**
       * Left label configuration object. May contain the following properties:
       * @param {String} field The name of a field in one of the associated records,
       *   {@link Scheduler.model.EventModel EventModel} or {@link Scheduler.model.ResourceModel ResourceModel}.
       *   The record from which the field value is drawn will be ascertained by checking for field definitions by
       *   the specified name.
       * @param {Function} renderer A function, which when passed an object containing `eventRecord`,
       *   `resourceRecord`, `assignmentRecord` and `domConfig` properties, returns the HTML to display as the
       *   label
       * @param {Object} thisObj The `this` reference to use in the `renderer`.
       * @param {Object|Core.widget.Field} editor If the label is to be editable, a field configuration object
       *   with a `type` property, or an instantiated Field. **The `field` property is mandatory for editing to
       *   work**.
       * @config {Object}
       * @default
       */
      left: null,
      thisObj: null,

      /**
       * What action should be taken when focus moves leaves the cell editor, for example when clicking outside.
       * May be `'complete'` or `'cancel`'.
       * @config {String}
       * @default
       */
      blurAction: 'cancel',

      /**
       * How to handle labels during event layout. Options are:
       *
       * * default - Labels do not affect event layout, events will overlap labels
       * * estimate - Label width is estimated by multiplying text length with {@link #config-labelCharWidth}
       * * measure - Label width is determined by measuring the label, precise but slow
       *
       * Note that this only applies to the left and right labels, top and bottom labels does not take part in the
       * event layout process.
       *
       * @config {String}
       * @default
       */
      labelLayoutMode: 'default',

      /**
       * Factor representing the average char width in pixels used to determine label width when configured
       * with `labelLayoutMode: 'estimate'`.
       * @config {Number}
       * @default
       */
      labelCharWidth: 7
    };
  } // Plugin configuration. This plugin chains some of the functions in Grid.

  static get pluginConfig() {
    return {
      chain: ['onEventDataGenerated']
    };
  } //endregion
  //region Init & destroy

  construct(scheduler, config) {
    const me = this;

    if (scheduler.isVertical) {
      throw new Error('Labels feature is not supported in vertical mode');
    }

    me.scheduler = scheduler;
    super.construct(scheduler, config);

    if (me.top || me.bottom || me.left || me.right) {
      me.updateHostClasslist(); // rowHeight warning, not in use
      //const labelCount = !!me.topLabel + !!me.bottomLabel;
      //if (scheduler.rowHeight < 60 - labelCount * 12) console.log('')
    }
  }

  updateHostClasslist() {
    const {
      top,
      bottom
    } = this,
          {
      classList
    } = this.scheduler.element;
    classList.remove('b-labels-topbottom');
    classList.remove('b-labels-top');
    classList.remove('b-labels-bottom'); // OR is correct. This means that there are labels above OR below.

    if (top || bottom) {
      classList.add('b-labels-topbottom');

      if (top) {
        classList.add('b-labels-top');
      }

      if (bottom) {
        classList.add('b-labels-bottom');
      }
    }
  }

  onLabelDblClick(event) {
    const me = this,
          target = event.target;

    if (target && !me.scheduler.readOnly) {
      const {
        side
      } = target.dataset,
            labelConfig = me[side],
            {
        editor,
        field
      } = labelConfig;

      if (editor) {
        const eventRecord = this.scheduler.resolveEventRecord(event.target);

        if (eventRecord.readOnly) {
          return;
        }

        if (!(editor instanceof Editor)) {
          labelConfig.editor = new Editor({
            blurAction: me.blurAction,
            inputField: editor,
            scrollAction: 'realign'
          });
        } // Editor removes itself from the DOM after being hidden

        me.scheduler.element.appendChild(labelConfig.editor.element);
        labelConfig.editor.startEdit({
          target,
          align: editorAlign[side],
          matchSize: false,
          record: eventRecord,
          field
        });
        event.stopImmediatePropagation();
        return false;
      }
    }
  }

  changeTop(top) {
    return this.processLabelSpec(top, 'top');
  }

  updateTop() {
    this.updateHostClasslist();
  }

  changeRight(right) {
    return this.processLabelSpec(right, 'right');
  }

  updateRight() {
    this.updateHostClasslist();
  }

  changeBottom(bottom) {
    return this.processLabelSpec(bottom, 'bottom');
  }

  updateBottom() {
    this.updateHostClasslist();
  }

  changeLeft(left) {
    return this.processLabelSpec(left, 'left');
  }

  updateLeft() {
    this.updateHostClasslist();
  }

  processLabelSpec(labelSpec, side) {
    if (typeof labelSpec === 'function') {
      labelSpec = {
        renderer: labelSpec
      };
    } else if (typeof labelSpec === 'string') {
      labelSpec = {
        field: labelSpec
      };
    } // Allow us to mutate ownProperties in the labelSpec without mutating outside object
    else if (labelSpec) {
      labelSpec = Object.setPrototypeOf({}, labelSpec);
    } // Clear label
    else {
      return null;
    }

    const {
      scheduler
    } = this,
          {
      eventStore,
      resourceStore,
      taskStore,
      id
    } = scheduler,
          {
      field,
      editor
    } = labelSpec; // If there are milestones, and we are changing the available height
    // either by adding a top/bottom label, or adding a top/bottom label
    // then during the next dependency refresh, milestone width must be recalculated.

    if (topBottom[side]) {
      scheduler.milestoneWidth = null;
    }

    if (eventStore && !taskStore) {
      labelSpec.recordType = 'event';
    } else {
      labelSpec.recordType = 'task';
    } // Find the field definition or property from whichever store and cache the type.

    if (field) {
      let fieldDef;

      if (eventStore && !taskStore) {
        fieldDef = eventStore.modelClass.fieldMap[field];

        if (fieldDef) {
          labelSpec.fieldDef = fieldDef;
          labelSpec.recordType = 'event';
        } // Check if it references a property
        else if (Reflect.has(eventStore.modelClass.prototype, field)) {
          labelSpec.recordType = 'event';
        }
      }

      if (!fieldDef && taskStore) {
        fieldDef = taskStore.modelClass.fieldMap[field];

        if (fieldDef) {
          labelSpec.fieldDef = fieldDef;
          labelSpec.recordType = 'task';
        } // Check if it references a property
        else if (Reflect.has(resourceStore.modelClass.prototype, field)) {
          labelSpec.recordType = 'task';
        }
      }

      if (!fieldDef && resourceStore) {
        fieldDef = resourceStore.modelClass.fieldMap[field];

        if (fieldDef) {
          labelSpec.fieldDef = fieldDef;
          labelSpec.recordType = 'resource';
        } // Check if it references a property
        else if (Reflect.has(resourceStore.modelClass.prototype, field)) {
          labelSpec.recordType = 'resource';
        }
      }

      if (editor) {
        if (typeof editor === 'boolean') {
          scheduler.editor = {
            type: 'textfield'
          };
        } else if (typeof editor === 'string') {
          scheduler.editor = {
            type: editor
          };
        }

        EventHelper.on({
          element: scheduler.timeAxisSubGrid.element,
          delegate: '.b-sch-label',
          dblclick: 'onLabelDblClick',
          thisObj: this
        });
      }
    }

    return labelSpec;
  }

  doDisable(disable) {
    super.doDisable(disable);

    if (this.client.isPainted) {
      this.client.refresh();
    }
  } //endregion

  generateLabelConfigs(data) {
    const me = this,
          configs = []; // Insert all configured labels

    for (const side of sides) {
      if (me[side]) {
        const {
          field,
          fieldDef,
          recordType,
          renderer,
          thisObj
        } = me[side],
              domConfig = {
          tag: 'label',
          className: {
            [me.labelCls]: 1,
            [`${me.labelCls}-${side}`]: 1
          },
          dataset: {
            side,
            taskFeature: `label-${side}`
          }
        };
        let value;
        const eventRecordProperty = `${recordType}Record`,
              eventRecord = data[eventRecordProperty]; // If there's a renderer, use that by preference

        if (renderer) {
          value = renderer.call(thisObj || me.thisObj || me, {
            [eventRecordProperty]: eventRecord,
            resourceRecord: data.resourceRecord,
            assignmentRecord: data.assignmentRecord,
            domConfig
          });
        } else {
          value = eventRecord[field]; // If it's a date, format it according to the Scheduler's defaults

          if ((fieldDef === null || fieldDef === void 0 ? void 0 : fieldDef.type) === 'date' && !renderer) {
            value = DateHelper.format(value, me.client.displayDateFormat);
          } else {
            value = StringHelper.encodeHtml(value);
          }
        }

        domConfig.html = value || '\xa0';
        configs.push(domConfig);
      }
    }

    return configs;
  }

  measureLabels(configs, data) {
    const me = this,
          pxPerMS = me.client.timeAxisViewModel.getSingleUnitInPixels('millisecond');

    for (const config of configs) {
      if (layoutSides[config.dataset.side]) {
        let {
          html
        } = config;
        let length = 0; // Calculate length based on string length

        if (me.labelLayoutMode === 'estimate') {
          // Strip tags before estimating
          if (html.includes('<')) {
            html = DomHelper.stripTags(html);
          }

          length = html.length * me.labelCharWidth + 18; // 18 = 1.5em, margin from event
        } // Measure
        else {
          const element = me.labelMeasureElement || (me.labelMeasureElement = DomHelper.createElement({
            className: 'b-sch-event-wrap b-measure-label',
            parent: me.client.foregroundCanvas
          })); // Outer DomSync should not remove

          element.retainElement = true;
          DomSync.sync({
            targetElement: element,
            childrenOnly: true,
            domConfig: {
              children: [config]
            }
          });
          length = element.firstElementChild.offsetWidth;
        } // Convert from px to ms

        const ms = length / pxPerMS; // Adjust values used for event layout (not event position)

        switch (config.dataset.side) {
          case 'left':
            data.startMS -= ms;
            break;

          case 'right':
            data.endMS += ms;
            break;
        }
      }
    }
  }

  onEventDataGenerated(data) {
    var _data$eventRecord;

    if (!this.disabled && !((_data$eventRecord = data.eventRecord) !== null && _data$eventRecord !== void 0 && _data$eventRecord.isResourceTimeRange)) {
      const configs = this.generateLabelConfigs(data);

      if (layoutModes[this.labelLayoutMode]) {
        this.measureLabels(configs, data);
      }

      data.wrapperChildren.push(...configs);
    }
  }

  updateLabelLayoutMode() {
    if (!this.isConfiguring) {
      this.client.refreshWithTransition();
    }
  }

  updateLabelCharWidth() {
    if (!this.isConfiguring) {
      this.client.refreshWithTransition();
    }
  }

} // TODO: Refactor the SASS, so that the auto-generated class name of ''b-' + cls.name.toLowerCase() can be used.

Labels.featureClass = 'b-sch-labels';
Labels._$name = 'Labels';
GridFeatureManager.registerFeature(Labels, false, 'Scheduler');

/**
 * @module Scheduler/feature/TimelineSummary
 */
// noinspection JSClosureCompilerSyntax

/**
 * Base class, not to be used directly.
 * @extends Grid/feature/Summary
 * @abstract
 */

class TimelineSummary extends Summary {
  //region Config
  static get $name() {
    return 'TimelineSummary';
  }

  static get configurable() {
    return {
      /**
       * Show tooltip containing summary values and labels
       * @config {Boolean}
       * @default
       */
      showTooltip: true
    };
  } // Plugin configuration. This plugin chains some of the functions in Grid.

  static get pluginConfig() {
    return {
      chain: ['renderRows', 'updateProject']
    };
  } //endregion
  //region Init

  construct(client, config) {
    const me = this;
    super.construct(client, config);

    if (!me.summaries) {
      me.summaries = [{
        renderer: me.renderer
      }];
    } // Feature might be run from Grid (in docs), should not crash
    // https://app.assembla.com/spaces/bryntum/tickets/6801/details

    if (client.isTimelineBase) {
      me.updateProject(client.project);
      client.on({
        timeAxisViewModelUpdate: me.renderRows,
        thisObj: me
      });
    }
  } //endregion
  //region Render

  updateProject(project) {
    this.detachListeners('summaryProject');
    project.on({
      name: 'summaryProject',
      dataReady: 'updateTimelineSummaries',
      thisObj: this
    });
  }

  renderRows() {
    if (this.client.isHorizontal) {
      this.client.timeAxisSubGrid.footer.element.querySelector('.b-grid-footer').classList.add('b-sch-summarybar');
    }

    super.renderRows();

    if (!this.disabled) {
      this.render();
    }
  }

  get summaryBarElement() {
    return this.client.element.querySelector('.b-sch-summarybar');
  }

  render() {
    const me = this,
          {
      client: timeline
    } = me,
          sizeProp = timeline.isHorizontal ? 'width' : 'height',
          colCfg = timeline.timeAxisViewModel.columnConfig,
          summaryContainer = me.summaryBarElement;

    if (summaryContainer) {
      // if any sum config has a label, init tooltip
      if (!me._tip && me.showTooltip && me.summaries.some(config => config.label)) {
        me._tip = new Tooltip({
          id: `${timeline.id}-summary-tip`,
          cls: 'b-timeaxis-summary-tip',
          hoverDelay: 0,
          hideDelay: 100,
          forElement: summaryContainer,
          anchorToTarget: true,
          trackMouse: false,
          forSelector: '.b-timeaxis-tick',
          getHtml: ({
            activeTarget
          }) => activeTarget._tipHtml
        });
      }

      summaryContainer.innerHTML = colCfg[colCfg.length - 1].map(col => `<div class="b-timeaxis-tick" style="${sizeProp}: ${col.width}px"></div>`).join('');
      me.updateTimelineSummaries();
    }
  } //endregion

  /**
   * Refreshes the summaries
   */

  refresh() {
    super.refresh();
    this.updateTimelineSummaries();
  }

  doDisable(disable) {
    var _this$summaryColumn;

    const {
      isConfiguring
    } = this.client;
    super.doDisable(disable);
    (_this$summaryColumn = this.summaryColumn) === null || _this$summaryColumn === void 0 ? void 0 : _this$summaryColumn.toggle(!disable);

    if (!isConfiguring && !disable) {
      this.render();
    }
  }

  doDestroy() {
    var _this$_tip;

    (_this$_tip = this._tip) === null || _this$_tip === void 0 ? void 0 : _this$_tip.destroy();
    super.doDestroy();
  }

}
TimelineSummary._$name = 'TimelineSummary';

const ScheduleRange = {
  completeview: 'completeview',
  // completedata : 'completedata',
  currentview: 'currentview',
  daterange: 'daterange'
};

const immediatePromise = Promise.resolve();
var SchedulerExporterMixin = (base => class SchedulerExporterMixin extends base {
  async scrollRowIntoView(client, index) {
    const {
      rowManager,
      scrollable
    } = client,
          oldY = scrollable.y; // If it's a valid index to scroll to, then try it.

    if (index < client.store.count) {
      // Scroll the requested row to the viewport top
      scrollable.scrollTo(null, rowManager.calculateTop(index)); // If that initiated a scroll, we need to wait for the row to be rendered, so return
      // a Promise which resolves when that happens.

      if (scrollable.y !== oldY) {
        // GridBase adds listener to vertical scroll to update rows. Rows might be or might not be updated,
        // but at the end of each scroll grid will trigger `scroll` event. So far this is the only scroll event
        // triggered by the grid itself and it is different from `scroll` event on scrollable.
        return new Promise(resolve => {
          const detacher = client.on({
            scroll({
              scrollTop
            }) {
              // future-proof: only react to scroll event with certain argument
              if (scrollTop != null && rowManager.getRow(index)) {
                detacher();
                resolve();
              }
            }

          });
        });
      }
    } // No scroll occurred. Promise must be resolved immediately

    return immediatePromise;
  }

  async scrollToDate(client, date) {
    let scrollFired = false;
    const promises = []; // Time axis is updated on element scroll, which is async event. We need to synchronize this logic.
    // If element horizontal scroll is changed then sync event is fired. We add listener to that one specific event
    // and remove it right after scrollToDate sync code, keeping listeners clean. If scrolling occurred, we need
    // to wait until time header is updated.

    const detacher = client.timeAxisSubGrid.scrollable.on({
      scrollStart({
        x
      }) {
        if (x != null) {
          scrollFired = true;
        }
      }

    }); // added `block: start` to do scrolling faster
    // it moves data to begin of visible area that is longer section for re-render

    promises.push(client.scrollToDate(date, {
      block: 'start'
    }));
    detacher();

    if (scrollFired) {
      // We have to wait for scrollEnd event before moving forward. When exporting large view we might have to scroll
      // extensively and it might occur that requested scroll position would not be reached because concurrent
      // scrollEnd events would move scroll back.
      // scrollEnd is on a 100ms timer *after* the last scroll event fired, so all necessary
      // updated will have occurred.
      // Covered by Gantt/tests/feature/export/MultiPageVertical.t.js
      promises.push(client.timeAxisSubGrid.header.scrollable.await('scrollEnd', {
        checkLog: false
      }));
    }

    await Promise.all(promises);
  }

  async prepareComponent(config) {
    const me = this,
          {
      client
    } = config,
          {
      currentOrientation
    } = client,
          includeTimeline = client.timeAxisSubGrid.width > 0;

    switch (config.scheduleRange) {
      case ScheduleRange.completeview:
        config.rangeStart = client.startDate;
        config.rangeEnd = client.endDate;
        break;

      case ScheduleRange.currentview:
        const {
          startDate,
          endDate
        } = client.visibleDateRange;
        config.rangeStart = startDate;
        config.rangeEnd = endDate;
        break;
    }

    await client.waitForAnimations(); // Don't change timespan if time axis subgrid is not visible

    if (includeTimeline) {
      // set new timespan before calling parent to get proper scheduler header/content size
      client.setTimeSpan(config.rangeStart, config.rangeEnd); // Access svgCanvas el to create dependency canvas early
      // eslint-disable-next-line no-unused-expressions

      client.svgCanvas;
    } // Disable event animations during export

    me._oldEnableEventAnimations = client.enableEventAnimations;
    client.enableEventAnimations = false; // Add scroll buffer for the horizontal rendering

    if (currentOrientation.isHorizontalRendering) {
      me._oldScrollBuffer = currentOrientation.scrollBuffer;
      me._oldVerticalBuffer = currentOrientation.verticalBufferSize;
      currentOrientation.scrollBuffer = 100;
      currentOrientation.verticalBufferSize = -1;
    } // Raise flag on the client to render all suggested dependencies

    client.ignoreViewBox = true;
    await super.prepareComponent(config);
    const {
      exportMeta,
      element
    } = me,
          fgCanvasEl = element.querySelector('.b-sch-foreground-canvas'),
          timeAxisEl = element.querySelector('.b-horizontaltimeaxis');
    exportMeta.includeTimeline = includeTimeline;

    if (includeTimeline && config.scheduleRange !== ScheduleRange.completeview) {
      // If we are exporting subrange of dates we need to change subgrid size accordingly
      exportMeta.totalWidth -= exportMeta.subGrids.normal.width;
      exportMeta.totalWidth += exportMeta.subGrids.normal.width = client.timeAxisViewModel.getDistanceBetweenDates(config.rangeStart, config.rangeEnd);
      const horizontalPages = Math.ceil(exportMeta.totalWidth / exportMeta.pageWidth),
            totalPages = horizontalPages * exportMeta.verticalPages;
      exportMeta.horizontalPages = horizontalPages;
      exportMeta.totalPages = totalPages; // store left scroll to imitate normal grid/header scroll using margin

      exportMeta.subGrids.normal.scrollLeft = client.getCoordinateFromDate(config.rangeStart);
    }

    exportMeta.timeAxisHeaders = [];
    exportMeta.timeAxisPlaceholders = [];
    exportMeta.headersColleted = false;
    DomHelper.forEachSelector(timeAxisEl, '.b-sch-header-row', headerRow => {
      exportMeta.timeAxisPlaceholders.push(me.createPlaceholder(headerRow));
      exportMeta.timeAxisHeaders.push(new Map());
    }); // Add placeholder for events, clear all event elements, but not the entire elements as it contains svg canvas

    exportMeta.subGrids.normal.eventsPlaceholder = me.createPlaceholder(fgCanvasEl, false);
    DomHelper.removeEachSelector(fgCanvasEl, '.b-sch-event-wrap,.b-sch-resourcetimerange');
    DomHelper.removeEachSelector(me.element, '.b-released');
    exportMeta.eventsBoxes = new Map();
    exportMeta.client = client;

    if (client.features.columnLines && !client.features.columnLines.disabled) {
      const columnLinesCanvas = element.querySelector('.b-column-lines-canvas');
      exportMeta.columnLinesPlaceholder = me.createPlaceholder(columnLinesCanvas);
      exportMeta.columnLines = {
        lines: new Map(),
        majorLines: new Map()
      };
    }

    if (client.features.dependencies && !client.features.dependencies.disabled) {
      const svgCanvasEl = element.querySelector(`[id="${client.svgCanvas.getAttribute('id')}"]`); // Same as above, clear only dependency lines, because there might be markers added by user

      if (exportMeta.dependenciesPlaceholder = svgCanvasEl) {
        DomHelper.removeEachSelector(svgCanvasEl, '.b-sch-dependency');
      }
    } // We need to scroll component to date to calculate correct start margin

    if (includeTimeline && !DateHelper.betweenLesser(config.rangeStart, client.startDate, client.endDate)) {
      await me.scrollToDate(client, config.rangeStart);
    }
  }

  async restoreState(config) {
    let waitForHorizontalScroll = false;
    const {
      client
    } = config,
          promises = []; // If scroll will be changed during restoring state (and it will likely be), raise a flag that exporter should
    // wait for scrollEnd event before releasing control

    const detacher = client.timeAxisSubGrid.scrollable.on({
      scrollStart({
        x
      }) {
        // HACK: scrollStart might actually fire when scroll is set to existing value
        if (this.element.scrollLeft !== x) {
          waitForHorizontalScroll = true;
        }
      }

    });
    promises.push(super.restoreState(config)); // Scroll start will be fired synchronously

    detacher();

    if (waitForHorizontalScroll) {
      promises.push(client.timeAxisSubGrid.header.scrollable.await('scrollEnd', {
        checkLog: false
      }));
    }

    await Promise.all(promises);
  }

  async restoreComponent(config) {
    const {
      client
    } = config,
          {
      currentOrientation
    } = client;
    client.ignoreViewBox = false;
    client.enableEventAnimations = this._oldEnableEventAnimations;

    if (currentOrientation.isHorizontalRendering) {
      currentOrientation.scrollBuffer = this._oldScrollBuffer;
      currentOrientation.verticalBufferSize = this._oldVerticalBuffer;
    }

    await super.restoreComponent(config);
  }

  async onRowsCollected(rows, config) {
    const me = this;
    await super.onRowsCollected(rows); // Only collect this data if timeline is visible

    if (me.exportMeta.includeTimeline) {
      const {
        client
      } = config,
            {
        timeView
      } = client,
            {
        pageRangeStart,
        pageRangeEnd
      } = me.getCurrentPageDateRange(config); // Exported page may not contain timeline view, in which case we need to fall through

      if (pageRangeStart) {
        let rangeProcessed = false;
        await me.scrollToDate(client, pageRangeStart); // Time axis and events are only rendered for the visible time span
        // we need to scroll the view and gather events/timeline elements
        // while (timeView.endDate <= config.rangeEnd) {

        while (!rangeProcessed) {
          me.collectLines(config);
          me.collectHeaders(config);
          me.collectEvents(rows, config);

          if (DateHelper.timeSpanContains(timeView.startDate, timeView.endDate, pageRangeStart, pageRangeEnd)) {
            rangeProcessed = true;
          } else if (timeView.endDate.getTime() >= pageRangeEnd.getTime()) {
            rangeProcessed = true;
          } else {
            const endDate = timeView.endDate;
            await me.scrollToDate(client, timeView.endDate); // If timeview end date is same as before scroll it means client is not able to scroll to date
            // and will go into infinite loop unless we stop it

            if (endDate.getTime() === timeView.endDate.getTime()) {
              throw new Error('Could not scroll to date');
            }
          }
        }
      }

      await me.scrollToDate(client, config.rangeStart);
    }
  }

  getCurrentPageDateRange({
    rangeStart,
    rangeEnd,
    client
  }) {
    const me = this,
          {
      exportMeta
    } = me,
          {
      horizontalPages,
      horizontalPosition,
      pageWidth,
      subGrids
    } = exportMeta;
    let pageRangeStart, pageRangeEnd; // when exporting to multiple pages we only need to scroll sub-range within visible time span

    if (horizontalPages > 1) {
      const pageStartX = horizontalPosition * pageWidth,
            pageEndX = (horizontalPosition + 1) * pageWidth,
            // Assuming normal grid is right next to right side of the locked grid
      // There is also a default splitter
      normalGridX = subGrids.locked.width + subGrids.locked.splitterWidth;

      if (pageEndX <= normalGridX) {
        pageRangeEnd = pageRangeStart = null;
      } else {
        pageRangeStart = client.getDateFromCoordinate(Math.max(pageStartX - normalGridX, 0)); // Extend visible schedule by 20% to cover up possible splitter

        pageRangeEnd = client.getDateFromCoordinate((pageEndX - normalGridX) * 1.2) || rangeEnd;
      }
    } else {
      pageRangeStart = rangeStart;
      pageRangeEnd = rangeEnd;
    }

    return {
      pageRangeStart,
      pageRangeEnd
    };
  }

  prepareExportElement() {
    const {
      element,
      exportMeta
    } = this,
          {
      id,
      headerId,
      footerId,
      scrollLeft
    } = exportMeta.subGrids.normal,
          el = element.querySelector(`[id="${id}"]`);
    ['.b-sch-background-canvas', '.b-sch-foreground-canvas'].forEach(selector => {
      const canvasEl = el.querySelector(selector);

      if (canvasEl) {
        // Align canvases to last exported row bottom. If no such property exists - remove inline height
        if (exportMeta.lastExportedRowBottom) {
          canvasEl.style.height = `${exportMeta.lastExportedRowBottom}px`;
        } else {
          canvasEl.style.height = '';
        } // Simulate horizontal scroll

        if (scrollLeft) {
          canvasEl.style.marginLeft = `-${scrollLeft}px`;
        }
      }
    });

    if (scrollLeft) {
      [headerId, footerId].forEach(id => {
        const el = element.querySelector(`[id="${id}"] .b-widget-scroller`);

        if (el) {
          el.style.marginLeft = `-${scrollLeft}px`;
        }
      });
    }

    return super.prepareExportElement();
  }

  collectRow(row) {
    const me = this,
          {
      subGrids
    } = me.exportMeta;
    Object.entries(row.elements).forEach(([key, value]) => {
      const rowConfig = [value.outerHTML, row.top, row.offsetHeight];

      if (key === 'normal') {
        rowConfig.push(new Map());
      }

      subGrids[key].rows.push(rowConfig);
    });
  }

  collectHeaders(config) {
    const me = this,
          {
      client
    } = config,
          {
      exportMeta
    } = me; // We only need to collect headers once, this flag is raised once they are collected along all exported range

    if (!exportMeta.headersCollected) {
      const timeAxisEl = client.timeView.element,
            timeAxisHeaders = exportMeta.timeAxisHeaders;
      DomHelper.forEachSelector(timeAxisEl, '.b-sch-header-row', (headerRow, index, headerRows) => {
        const headersMap = timeAxisHeaders[index];
        DomHelper.forEachSelector(headerRow, '.b-sch-header-timeaxis-cell', el => {
          if (!headersMap.has(el.dataset.tickIndex)) {
            headersMap.set(el.dataset.tickIndex, el.outerHTML);
          }
        });

        if (index === headerRows.length - 1 && headersMap.has(String(client.timeAxis.count - 1))) {
          exportMeta.headersCollected = true;
        }
      });
    }
  }

  collectLines(config) {
    const me = this,
          {
      client
    } = config,
          {
      exportMeta
    } = me,
          {
      columnLines
    } = exportMeta; // We only need to collect headers once, this flag is raised once they are collected along all exported range

    if (!exportMeta.headersCollected && columnLines) {
      const bgCanvas = client.backgroundCanvas;
      DomHelper.forEachSelector(bgCanvas, '.b-column-line, .b-column-line-major', lineEl => {
        if (lineEl.classList.contains('b-column-line')) {
          const lineIndex = Number(lineEl.dataset.line.replace(/line-/, ''));
          columnLines.lines.set(lineIndex, lineEl.outerHTML);
        } else {
          const lineIndex = Number(lineEl.dataset.line.replace(/major-/, ''));
          columnLines.majorLines.set(lineIndex, lineEl.outerHTML);
        }
      });
    }
  }

  collectEvents(rows, config) {
    const me = this,
          addedRows = rows.length,
          {
      client
    } = config,
          normalRows = me.exportMeta.subGrids.normal.rows;
    rows.forEach((row, index) => {
      var _resource$events, _resource$timeRanges;

      const rowConfig = normalRows[normalRows.length - addedRows + index],
            resource = client.store.getAt(row.dataIndex),
            eventsMap = rowConfig[3];
      (_resource$events = resource.events) === null || _resource$events === void 0 ? void 0 : _resource$events.forEach(event => {
        if (event.isScheduled) {
          let el = client.getElementFromEventRecord(event, resource);

          if (el && (el = el.parentElement) && !eventsMap.has(event.id)) {
            eventsMap.set(event.id, [el.outerHTML, Rectangle.from(el, el.offsetParent)]);
          }
        }
      });
      (_resource$timeRanges = resource.timeRanges) === null || _resource$timeRanges === void 0 ? void 0 : _resource$timeRanges.forEach(timeRange => {
        var _client$features$reso;

        const elId = ((_client$features$reso = client.features.resourceTimeRanges) === null || _client$features$reso === void 0 ? void 0 : _client$features$reso.generateElementId(timeRange)) || '',
              el = client.foregroundCanvas.syncIdMap[elId];

        if (el && !eventsMap.has(elId)) {
          eventsMap.set(elId, [el.outerHTML, Rectangle.from(el, el.offsetParent)]);
        }
      });
    });
  }

  buildPageHtml() {
    const me = this,
          {
      subGrids,
      timeAxisHeaders,
      timeAxisPlaceholders,
      columnLines,
      columnLinesPlaceholder
    } = me.exportMeta; // Now when rows are collected, we need to add them to exported grid

    let html = me.prepareExportElement();
    Object.values(subGrids).forEach(({
      placeHolder,
      eventsPlaceholder,
      rows
    }) => {
      const placeHolderText = placeHolder.outerHTML,
            // Rows can be repositioned, in which case event related to that row should also be translated
      {
        resources,
        events
      } = me.positionRows(rows);
      html = html.replace(placeHolderText, resources.join(''));

      if (eventsPlaceholder) {
        html = html.replace(eventsPlaceholder.outerHTML, events.join(''));
      }
    });
    timeAxisHeaders.forEach((headers, index) => {
      html = html.replace(timeAxisPlaceholders[index].outerHTML, Array.from(headers.values()).join(''));
    });

    if (columnLines) {
      const lineElements = Array.from(columnLines.lines.values()).concat(Array.from(columnLines.majorLines.values()));
      html = html.replace(columnLinesPlaceholder.outerHTML, lineElements.join(''));
    }

    html = me.buildDependenciesHtml(html);
    return html;
  }

  getDependenciesOuterHTML() {
    return this.exportMeta.dependenciesPlaceholder.outerHTML;
  }

  renderDependencies() {
    const me = this,
          {
      client,
      dependenciesPlaceholder,
      eventsBoxes
    } = me.exportMeta,
          {
      dependencies
    } = client,
          dependencyFeature = client.features.dependencies,
          eventsInView = Array.from(eventsBoxes.keys());
    dependencies.forEach(dependency => {
      if (!eventsInView.includes(String(dependency.from)) && !eventsInView.includes(String(dependency.to)) || !dependencyFeature.isDependencyVisible(dependency)) {
        return;
      }

      let fromBox = eventsBoxes.get(String(dependency.from)),
          toBox = eventsBoxes.get(String(dependency.to));
      const assignments = dependencyFeature.getIteratableDependencyAssignments(dependency),
            {
        fromEvent,
        toEvent
      } = dependency;
      assignments.forEach(assignmentData => {
        var _fromBox, _toBox;

        // In case of single page export from/to boxes will always be present, also we cannot trust boxes from cache
        // because single page exporter can possible change row/event vertical position
        // In case of multipage we will get box from the dependency feature
        if (!fromBox) {
          if (fromEvent) {
            const box = dependencyFeature.getBox(dependency, true, assignmentData);

            if (box) {
              fromBox = box instanceof Rectangle ? box : new Rectangle(box.start, box.top, box.end - box.start, box.bottom - box.top);
            }
          }
        }

        if (!toBox) {
          if (toEvent) {
            const box = dependencyFeature.getBox(dependency, false, assignmentData);

            if (box) {
              toBox = box instanceof Rectangle ? box : new Rectangle(box.start, box.top, box.end - box.start, box.bottom - box.top);
            }
          }
        } // Gantt dependencies feature modifies box size to point arrow to the top, clone box to keep original size

        const drawData = {
          startRectangle: (_fromBox = fromBox) === null || _fromBox === void 0 ? void 0 : _fromBox.clone(),
          endRectangle: (_toBox = toBox) === null || _toBox === void 0 ? void 0 : _toBox.clone()
        };

        if (fromBox && toBox) {
          dependencyFeature.drawDependency(dependency, drawData, assignmentData, dependenciesPlaceholder, false);
        }
      });
    });
    const result = me.getDependenciesOuterHTML();
    DomHelper.removeEachSelector(dependenciesPlaceholder, '.b-sch-dependency');
    return result;
  }

  buildDependenciesHtml(html) {
    const {
      dependenciesPlaceholder,
      includeTimeline
    } = this.exportMeta;

    if (dependenciesPlaceholder && includeTimeline) {
      const placeholder = this.getDependenciesOuterHTML();
      html = html.replace(placeholder, this.renderDependencies());
    }

    return html;
  }

});

/**
 * @module Scheduler/feature/export/exporter/MultiPageExporter
 */

/**
 * A multiple page exporter. Used by the {@link Scheduler.feature.export.PdfExport} feature to export to multiple pages.
 * You do not need to use this class directly.
 *
 * ### Extending exporter
 *
 * ```javascript
 * class MyMultiPageExporter extends MultiPageExporter {
 *     // type is required for exporter
 *     static get type() {
 *         return 'mymultipageexporter';
 *     }
 *
 *     get stylesheets() {
 *         const stylesheets = super.stylesheets;
 *
 *         stylesheets.forEach(styleNodeOrLinkTag => doSmth(styleNodeOrLinkTag))
 *
 *         return stylesheets;
 *     }
 * }
 *
 * const scheduler = new Scheduler({
 *     features : {
 *         pdfExport : {
 *             // this export feature is configured with only one exporter
 *             exporters : [MyMultiPageExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * scheduler.features.pdfExport.export({ exporter : 'mymultipageexporter' });
 * ```
 *
 * @classType multipage
 * @feature
 * @extends Grid/feature/export/exporter/MultiPageExporter
 * @typings Grid/feature/export/exporter/MultiPageExporter -> Grid/feature/export/exporter/GridMultiPageExporter
 */

class MultiPageExporter extends SchedulerExporterMixin(MultiPageExporter$1) {
  static get $name() {
    return 'MultiPageExporter';
  }

  static get type() {
    return 'multipage';
  }

  async stateNextPage(config) {
    await super.stateNextPage(config);
    this.exportMeta.eventsBoxes.clear();
  }

  positionRows(rows) {
    const resources = [],
          events = []; // In case of variable row height row vertical position is not guaranteed to increase
    // monotonously. Position row manually instead

    rows.forEach(([html, top, height, eventsHtml]) => {
      resources.push(html);
      eventsHtml && Array.from(eventsHtml.entries()).forEach(([key, [html, box]]) => {
        events.push(html); // Store event box to render dependencies later

        this.exportMeta.eventsBoxes.set(String(key), box);
      });
    });
    return {
      resources,
      events
    };
  }

}
MultiPageExporter._$name = 'MultiPageExporter';

/**
 * @module Scheduler/feature/export/exporter/MultiPageVerticalExporter
 */

/**
 * A vertical multiple page exporter. Used by the {@link Scheduler.feature.export.PdfExport} feature to export to
 * multiple pages. Content will be scaled in a horizontal direction to fit the page.
 *
 * You do not need to use this class directly.
 *
 * ### Extending exporter
 *
 * ```javascript
 * class MyMultiPageVerticalExporter extends MultiPageVerticalExporter {
 *     // type is required for exporter
 *     static get type() {
 *         return 'mymultipageverticalexporter';
 *     }
 *
 *     get stylesheets() {
 *         const stylesheets = super.stylesheets;
 *
 *         stylesheets.forEach(styleNodeOrLinkTag => doSmth(styleNodeOrLinkTag))
 *
 *         return stylesheets;
 *     }
 * }
 *
 * const scheduler = new Scheduler({
 *     features : {
 *         pdfExport : {
 *             // this export feature is configured with only one exporter
 *             exporters : [MyMultiPageVerticalExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * scheduler.features.pdfExport.export({ exporter : 'mymultipageverticalexporter' });
 * ```
 *
 * @classType multipagevertical
 * @feature
 * @extends Grid/feature/export/exporter/MultiPageVerticalExporter
 * @typings Grid/feature/export/exporter/MultiPageVerticalExporter -> Grid/feature/export/exporter/GridMultiPageVerticalExporter
 */

class MultiPageVerticalExporter extends SchedulerExporterMixin(MultiPageVerticalExporter$1) {
  static get $name() {
    return 'MultiPageVerticalExporter';
  }

  static get type() {
    return 'multipagevertical';
  }

  async stateNextPage(config) {
    await super.stateNextPage(config);
    this.exportMeta.eventsBoxes.clear();
  }

  async prepareComponent(config) {
    await super.prepareComponent(config); // Scheduler exporter mixin can update totalWidth, so we need to adjust pages and scale here again

    if (config.scheduleRange !== ScheduleRange.completeview) {
      this.estimateTotalPages(config);
    }
  }

  positionRows(rows) {
    const resources = [],
          events = []; // In case of variable row height row vertical position is not guaranteed to increase
    // monotonously. Position row manually instead

    rows.forEach(([html, top, height, eventsHtml]) => {
      resources.push(html);
      eventsHtml && Array.from(eventsHtml.entries()).forEach(([key, [html, box]]) => {
        events.push(html); // Store event box to render dependencies later

        this.exportMeta.eventsBoxes.set(String(key), box);
      });
    });
    return {
      resources,
      events
    };
  }

}
MultiPageVerticalExporter._$name = 'MultiPageVerticalExporter';

class ScheduleRangeCombo extends LocalizableCombo {
  static get $name() {
    return 'ScheduleRangeCombo';
  } // Factoryable type name

  static get type() {
    return 'schedulerangecombo';
  }

  static get defaultConfig() {
    return {
      editable: false
    };
  }

  buildLocalizedItems() {
    // Do not remove. Assertion strings for Localization sanity check.
    // 'L{completeview}'
    // 'L{currentview}'
    // 'L{daterange}'
    // 'L{completedata}'
    return Object.entries(ScheduleRange).map(([id, text]) => ({
      id,
      text: this.L(text)
    }));
  }

} // Register this widget type with its Factory

ScheduleRangeCombo.initClass();
ScheduleRangeCombo._$name = 'ScheduleRangeCombo';

/**
 * @module Scheduler/view/export/SchedulerExportDialog
 */

/**
 * Extends the Grid's {@link Grid.view.export.ExportDialog} and adds a few extra fields specific to the scheduler.
 *
 * ## Default widgets
 *
 * The default widgets of this dialog are:
 *
 * | Widget ref             | Type                                     | Weight | Description                                          |
 * |------------------------|------------------------------------------|--------|----------------------------------------------------- |
 * | `columnsField`         | {@link Core.widget.Combo Combo}          | 100    | Choose columns to export                             |
 * | `scheduleRangeField`   | {@link Core.widget.Combo Combo}          | 150    | Choose date range to export                          |
 * | `rangesContainer`      | {@link Core.widget.Container Container}  | 151    | Container for range fields                           |
 * | \>`rangeStartField`    | {@link Core.widget.DateField DateField}  | 10     | Choose date range start                              |
 * | \>`rangeEndField`      | {@link Core.widget.DateField DateField}  | 30     | Choose date range end                                |
 * | `rowsRangeField`       | {@link Core.widget.Combo Combo}          | 200    | Choose which rows to export                          |
 * | `exporterTypeField`    | {@link Core.widget.Combo Combo}          | 300    | Type of the exporter to use                          |
 * | `alignRowsField`       | {@link Core.widget.Checkbox Checkbox}    | 400    | Align row top to the page top on every exported page |
 * | `repeatHeaderField`    | {@link Core.widget.Checkbox Checkbox}    | 500    | Toggle repeating headers on / off                    |
 * | `fileFormatField`      | {@link Core.widget.Combo Combo}          | 600    | Choose file format                                   |
 * | `paperFormatField`     | {@link Core.widget.Combo Combo}          | 700    | Choose paper format                                  |
 * | `orientationField`     | {@link Core.widget.Combo Combo}          | 800    | Choose orientation                                   |
 *
 * The default buttons are:
 *
 * | Widget ref             | Type                                     | Weight | Description                                          |
 * |------------------------|------------------------------------------|--------|------------------------------------------------------|
 * | `exportButton`         | {@link Core.widget.Button Button}        | 100    | Triggers export                                      |
 * | `cancelButton`         | {@link Core.widget.Button Button}        | 200    | Cancel export                                        |
 *
 * *\> nested items*
 *
 * ## Configuring default widgets
 *
 * Widgets can be customized with {@link Scheduler.feature.export.PdfExport#config-exportDialog} config:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         pdfExport : {
 *             exportDialog : {
 *                 items : {
 *                     // hide the field
 *                     orientationField  : { hidden : true },
 *
 *                     // reorder fields
 *                     exporterTypeField : { weight : 150 },
 *
 *                     // change default format in exporter
 *                     fileFormatField   : { value : 'png' },
 *
 *                     // Configure nested fields
 *                     rangesContainer : {
 *                         items : {
 *                             rangeStartField : { value : new Date() },
 *                             rangeEndField : { value : new Date() }
 *                         }
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * });
 *
 * scheduler.features.pdfExport.showExportDialog();
 * ```
 *
 * ## Using DateTime fields for range start/end
 *
 * This config system is also capable (but not limited to) of changing layout of the container and replacing widget type:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         pdfExport : {
 *             exportDialog : {
 *                 items : {
 *                     rangesContainer : {
 *                         // DateTime fields are longer, so we better lay them out
 *                         // vertically
 *                         layoutStyle : {
 *                             flexDirection : 'column'
 *                         },
 *                         items : {
 *                             rangeStartField : {
 *                                 // Use DateTime widget for ranges
 *                                 type       : 'datetime',
 *
 *                                 // Sync label width with other fields
 *                                 labelWidth : '12em'
 *                             },
 *                             rangeEndField : {
 *                                 type       : 'datetime',
 *                                 labelWidth : '12em'
 *                             },
 *                             // Add a filler widget that would add a margin at the bottom
 *                             filler : {
 *                                 height : '0.6em',
 *                                 weight : 900
 *                             }
 *                         }
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * });
 *
 * ```
 *
 * ## Configuring default columns
 *
 * By default all visible columns are selected in the export dialog. This is managed by
 * {@link #config-autoSelectVisibleColumns} config. To change default selected columns you should disable this config
 * and set field value. Value should be an array of valid column ids (or column instances). This way you can
 * preselect hidden columns:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     columns : [
 *         { id : 'name', text : 'Name', field : 'name' },
 *         { id : 'age', text : 'Age', field : 'age' },
 *         { id : 'city', text : 'City', field : 'city', hidden : true }
 *     ],
 *     features : {
 *         pdfExport : {
 *             exportDialog : {
 *                 autoSelectVisibleColumns : false,
 *                 items : {
 *                     columnsField : { value : ['name', 'city'] }
 *                 }
 *             }
 *         }
 *     }
 * })
 *
 * // This will show export dialog with Name and City columns selected
 * // even though City column is hidden in the UI
 * scheduler.features.pdfExport.showExportDialog();
 * ```
 *
 * ## Adding fields
 *
 * You can add your own fields to the export dialog. To make such field value acessible to the feature it should follow
 * naming pattern - it should have `ref` config ending with `Field`, see other fields for reference - `orientationField`,
 * `columnsField`, etc. Fields not matching this pattern are ignored. When values are collected from the dialog, `Field`
 * part of the widget reference is removed, so `orientationField` becomes `orientation`, `fooField` becomes `foo`, etc.
 *
 * ```javascript
 * const grid = new Grid({
 *     features : {
 *         pdfExport : {
 *             exportDialog : {
 *                 items : {
 *                     // This field gets into export config
 *                     fooField : {
 *                         type : 'text',
 *                         label : 'Foo',
 *                         value : 'FOO'
 *                     },
 *
 *                     // This one does not, because name doesn't end with `Field`
 *                     bar : {
 *                         type : 'text',
 *                         label : 'Bar',
 *                         value : 'BAR'
 *                     },
 *
 *                     // Add a container widget to wrap some fields together
 *                     myContainer : {
 *                         type : 'container',
 *                         items : {
 *                             // This one gets into config too despite the nesting level
 *                             bazField : {
 *                                 type : 'text',
 *                                 label : 'Baz',
 *                                 value : 'BAZ'
 *                             }
 *                         }
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * });
 *
 * // Assuming export dialog is opened and export triggered with default values
 * // you can receive custom field values here
 * grid.on({
 *     beforePdfExport({ config }) {
 *         console.log(config.foo) // 'FOO'
 *         console.log(config.bar) // undefined
 *         console.log(config.baz) // 'BAZ'
 *     }
 * });
 * ```
 *
 * ## Configuring widgets at runtime
 *
 * If you don't know column ids before grid instantiation or you want a flexible config, you can change widget values
 * before dialog pops up:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     columns : [
 *         { id : 'name', text : 'Name', field : 'name' },
 *         { id : 'age', text : 'Age', field : 'age' },
 *         { id : 'city', text : 'City', field : 'city', hidden : true }
 *     ],
 *     features : {
 *         pdfExport : true
 *     }
 * });
 *
 * // Such listener would ignore autoSelectVisibleColumns config. Similar to the snippet
 * // above this will show Name and City columns
 * scheduler.features.pdfExport.exportDialog.on({
 *     beforeShow() {
 *         this.widgetMap.columnsField.value = ['age', 'city']
 *     }
 * });
 * ```
 *
 * @extends Grid/view/export/ExportDialog
 */

class SchedulerExportDialog extends ExportDialog {
  //region Config
  static get $name() {
    return 'SchedulerExportDialog';
  }

  static get type() {
    return 'schedulerexportdialog';
  }

  static get configurable() {
    return {
      defaults: {
        localeClass: this
      },
      items: {
        scheduleRangeField: {
          type: 'schedulerangecombo',
          label: 'L{Schedule range}',
          value: 'completeview',
          weight: 150,

          onChange({
            value
          }) {
            this.parent.widgetMap.rangesContainer.hidden = value !== ScheduleRange.daterange;
          }

        },
        rangesContainer: {
          type: 'container',
          flex: '1 0 100%',
          weight: 151,
          hidden: true,
          defaults: {
            localeClass: this
          },
          items: {
            filler: {
              // Filler widget to align date fields
              weight: 0,
              type: 'widget'
            },
            rangeStartField: {
              type: 'datefield',
              label: 'L{Export from}',
              labelWidth: '3em',
              flex: '1 0 25%',
              weight: 10,

              onChange({
                value
              }) {
                this.parent.widgetMap.rangeEndField.min = DateHelper.add(value, 1, 'd');
              }

            },
            filler2: {
              // Another filler to move label further from previous field
              type: 'widget',
              weight: 20,
              width: '0.5em'
            },
            rangeEndField: {
              type: 'datefield',
              label: 'L{Export to}',
              labelWidth: '1em',
              flex: '1 0 25%',
              weight: 30,

              onChange({
                value
              }) {
                this.parent.widgetMap.rangeStartField.max = DateHelper.add(value, -1, 'd');
              }

            }
          }
        }
      }
    };
  } //endregion

  onLocaleChange() {
    const labelWidth = this.L('labelWidth');
    this.width = this.L('L{width}');
    this.items.forEach(widget => {
      if (widget instanceof Field) {
        widget.labelWidth = labelWidth;
      } else if (widget.ref === 'rangesContainer') {
        widget.items[0].width = labelWidth;
      }
    });
  }

  applyInitialValues(config) {
    super.applyInitialValues(config);
    const me = this,
          {
      client,
      scheduleRange
    } = config,
          items = config.items = config.items || {},
          scheduleRangeField = items.scheduleRangeField = items.scheduleRangeField || {},
          rangesContainer = items.rangesContainer = items.rangesContainer || {},
          rangesContainerItems = rangesContainer.items = rangesContainer.items || {},
          filler = rangesContainerItems.filler = rangesContainerItems.filler || {},
          rangeStartField = rangesContainerItems.rangeStartField = rangesContainerItems.rangeStartField || {},
          rangeEndField = rangesContainerItems.rangeEndField = rangesContainerItems.rangeEndField || {};
    filler.width = me.L('labelWidth');
    scheduleRangeField.value = scheduleRangeField.value || scheduleRange;

    if (scheduleRangeField.value === ScheduleRange.daterange) {
      rangesContainer.hidden = false;
    }

    const rangeStart = rangeStartField.value = rangeStartField.value || client.startDate;
    rangeStartField.max = DateHelper.max(client.startDate, DateHelper.add(client.endDate, -1, 'd'));
    let rangeEnd = rangeEndField.value || client.endDate; // This is the only place where we can validate date range before it gets to export feature

    if (rangeEnd <= rangeStart) {
      rangeEnd = DateHelper.add(rangeStart, 1, 'd');
    }

    rangeEndField.value = rangeEnd;
    rangeEndField.min = DateHelper.min(client.endDate, DateHelper.add(client.startDate, 1, 'd'));
  }

}
SchedulerExportDialog._$name = 'SchedulerExportDialog';

/**
 * @module Scheduler/feature/export/exporter/SinglePageExporter
 */

/**
 * A single page exporter. Used by the {@link Scheduler.feature.export.PdfExport} feature to export to single page.
 * Content will be scaled in both directions to fit the page.
 *
 * You do not need to use this class directly.
 *
 * ### Extending exporter
 *
 * ```javascript
 * class MySinglePageExporter extends SinglePageExporter {
 *     // type is required for exporter
 *     static get type() {
 *         return 'mysinglepageexporter';
 *     }
 *
 *     get stylesheets() {
 *         const stylesheets = super.stylesheets;
 *
 *         stylesheets.forEach(styleNodeOrLinkTag => doSmth(styleNodeOrLinkTag))
 *
 *         return stylesheets;
 *     }
 * }
 *
 * const scheduler = new Scheduler({
 *     features : {
 *         pdfExport : {
 *             // this export feature is configured with only one exporter
 *             exporters : [MySinglePageExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * scheduler.features.pdfExport.export({ exporter : 'mysinglepageexporter' });
 * ```
 *
 * @classType singlepage
 * @feature
 * @extends Grid/feature/export/exporter/SinglePageExporter
 * @typings Grid/feature/export/exporter/SinglePageExporter -> Grid/feature/export/exporter/GridSinglePageExporter
 */

class SinglePageExporter extends SchedulerExporterMixin(SinglePageExporter$1) {
  static get $name() {
    return 'SinglePageExporter';
  }

  static get type() {
    return 'singlepage';
  } // We should not collect dependencies per each page, instead we'd render them once

  collectDependencies() {}

  positionRows(rows) {
    const resources = [],
          events = [],
          translateRe = /translate\((\d+.?\d*)px, (\d+.?\d*)px\)/,
          topRe = /top:.+?px/;
    let currentTop = 0; // In case of variable row height row vertical position is not guaranteed to increase
    // monotonously. Position row manually instead

    rows.forEach(([html, top, height, eventsHtml]) => {
      // Adjust row vertical position by changing `translate` style
      resources.push(html.replace(translateRe, `translate($1px, ${currentTop}px)`));
      const rowTopDelta = currentTop - top;
      eventsHtml && Array.from(eventsHtml.entries()).forEach(([key, [html, box]]) => {
        // Fix event vertical position according to the row top
        box.translate(0, rowTopDelta); // Store event box to render dependencies later

        this.exportMeta.eventsBoxes.set(String(key), box); // Adjust event vertical position by replacing `top` style

        events.push(html.replace(topRe, `top: ${box.y}px`));
      });
      currentTop += height;
    });
    return {
      resources,
      events
    };
  }

}
SinglePageExporter._$name = 'SinglePageExporter';

/**
 * @module Scheduler/feature/export/PdfExport
 */

/**
 * Generates PDF/PNG files from the Scheduler component.
 *
 * <img src="Scheduler/export-dialog.png" style="max-width : 300px" alt="Scheduler Export dialog">
 *
 * **NOTE:** Server side is required to make export work!
 *
 * The export server is written in nodejs and it is shipped with our examples. You can find setup instructions in
 * `examples/_shared/server/README.md` and `examples/export/README.md` files.
 *
 * When your server is up and running, it listens to requests. The Export feature sends a request to the specified URL
 * with the HTML fragments. The server generates a PDF (or PNG) file and returns a download link (or binary, depending
 * on {@link #config-sendAsBinary} config). Then the Export feature opens the link in a new tab and the file is
 * automatically downloaded by your browser. This is configurable, see {@link #config-openAfterExport} config.
 *
 * The {@link #config-exportServer} URL must be configured. The URL can be localhost if you start the server locally,
 * or your remote server address.
 *
 * ## Usage
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         pdfExport : {
 *             exportServer : 'http://localhost:8080' // Required
 *         }
 *     }
 * })
 *
 * // Opens popup allowing to customize export settings
 * scheduler.features.pdfExport.showExportDialog();
 *
 * // Simple export
 * scheduler.features.pdfExport.export({
 *     // Required, set list of column ids to export
 *     columns : scheduler.columns.map(c => c.id)
 * }).then(result => {
 *     // Response instance and response content in JSON
 *     let { response, responseJSON } = result;
 * });
 * ```
 *
 * Appends configs related to exporting time axis: {@link #config-scheduleRange}, {@link #config-rangeStart},
 * {@link #config-rangeEnd}
 *
 * ## Loading resources
 *
 * If you face a problem with loading resources when exporting, the cause might be that the application and the export server are hosted on different servers.
 * This is due to [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS). There are 2 options how to handle this:
 * - Allow cross origin requests from the server where your export is hosted to the server where your application is hosted;
 * - Copy all resources keeping the folder hierarchy from the server where your application is hosted to the server where your export is hosted
 * and setup paths using {@link Grid.feature.export.PdfExport#config-translateURLsToAbsolute} config and configure the export server to give access to the path:
 *
 * ```javascript
 * const scheduler = new Scheduler({
 *     features : {
 *         pdfExport : {
 *             exportServer : 'http://localhost:8080',
 *             // '/resources' is hardcoded in WebServer implementation
 *             translateURLsToAbsolute : 'http://localhost:8080/resources'
 *         }
 *     }
 * })
 * ```
 *
 * ```javascript
 * // Following path would be served by this address: http://localhost:8080/resources/
 * node ./src/server.js -h 8080 -r web/application/styles
 * ```
 *
 * where `web/application/styles` is a physical root location of the copied resources, for example:
 *
 * <img src="Grid/export-server-resources.png" style="max-width : 500px" alt="Export server structure with copied resources" />
 *
 * @extends Grid/feature/export/PdfExport
 * @classtype pdfExport
 * @feature
 * @typings Grid/feature/export/PdfExport -> Grid/feature/export/GridPdfExport
 */

class PdfExport extends PdfExport$1 {
  static get $name() {
    return 'PdfExport';
  }

  static get defaultConfig() {
    return {
      exporters: [SinglePageExporter, MultiPageExporter, MultiPageVerticalExporter],
      dialogClass: SchedulerExportDialog,

      /**
       * Specifies how to export time span.
       *  * completeview - Complete configured time span, from scheduler start date to end date
       *  * currentview  - Currently visible time span
       *  * daterange    - Use specific date range, provided additionally in config. See {@link #config-rangeStart}/
       *  {@link #config-rangeEnd}
       * @config {String}
       * @default
       * @category Export file config
       */
      scheduleRange: 'completeview',

      /**
       * Exported time span range start. Used with `daterange` config of the {@link #config-scheduleRange}
       * @config {Date}
       * @category Export file config
       */
      rangeStart: null,

      /**
       * Returns the instantiated export dialog widget as configured by {@link #config-exportDialog}
       * @member {Scheduler.view.export.SchedulerExportDialog} exportDialog
       */

      /**
       * A config object to apply to the {@link Scheduler.view.export.SchedulerExportDialog} widget.
       * @config {Object} exportDialog
       */

      /**
       * Exported time span range end. Used with `daterange` config of the {@link #config-scheduleRange}
       * @config {Date}
       * @category Export file config
       */
      rangeEnd: null
    };
  }

  get defaultExportDialogConfig() {
    return ObjectHelper.copyProperties(super.defaultExportDialogConfig, this, ['scheduleRange']);
  }

  buildExportConfig(config) {
    config = super.buildExportConfig(config);
    const {
      scheduleRange,
      rangeStart,
      rangeEnd
    } = this; // Time axis is filtered from UI, need to append it

    if (config.columns && !config.columns.find(col => col.type === 'timeAxis')) {
      config.columns.push(config.client.timeAxisColumn.id);
    }

    return ObjectHelper.assign({
      scheduleRange,
      rangeStart,
      rangeEnd
    }, config);
  }

}
PdfExport._$name = 'PdfExport';
GridFeatureManager.registerFeature(PdfExport, false, 'Scheduler');

export { Labels, MultiPageExporter, MultiPageVerticalExporter, PdfExport, ResourceInfoColumn, ScheduleRange, ScheduleRangeCombo, SchedulerExportDialog, SinglePageExporter, TimelineSummary };
//# sourceMappingURL=PdfExport2.js.map
