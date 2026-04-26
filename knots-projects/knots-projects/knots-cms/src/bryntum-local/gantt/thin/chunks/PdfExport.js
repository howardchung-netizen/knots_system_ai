/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { Base, InstancePlugin, DomHelper, Popup, LocaleManagerSingleton, Field, BrowserHelper, ObjectHelper, Toast, AjaxHelper, Mask } from './Editor.js';
import { GridFeatureManager } from './GridBase.js';
import { RowsRange, Orientation, FileFormat, PaperFormat, Exporter, FileMIMEType } from './Exporter.js';
import { LocalizableCombo } from './LocalizableCombo.js';
import { Checkbox } from './LocalizableComboItems.js';

/**
 * @module Grid/feature/mixin/SummaryFormatter
 */

/**
 * Mixin for Summary and GroupSummary that handles formatting sums.
 * @mixin
 * @private
 */

var SummaryFormatter = (Target => class SummaryFormatter extends (Target || Base) {
  static get $name() {
    return 'SummaryFormatter';
  }
  /**
   * Calculates sums and returns as a html table
   * @param {Grid.column.Column} column Column to calculate sum for
   * @param {Core.data.Model[]} records Records to include in calculation
   * @param {String} cls CSS class to apply to summary table
   * @param {Core.data.Model} groupRecord current group row record
   * @param {String} groupField Current groups field name
   * @param {String} groupValue Current groups value
   * @returns {String} html content
   */

  generateHtml(column, records, cls, groupRecord, groupField, groupValue) {
    const store = this.store,
          summaries = column.summaries || (column.sum ? [{
      sum: column.sum,
      renderer: column.summaryRenderer
    }] : []);
    let html = `<table class="${cls}">`;
    summaries.forEach(config => {
      let type = config.sum,
          sum = null;
      if (type === true) type = 'sum';

      switch (type) {
        case 'sum':
        case 'add':
          sum = store.sum(column.field, records);
          break;

        case 'max':
          sum = store.max(column.field, records);
          break;

        case 'min':
          sum = store.min(column.field, records);
          break;

        case 'average':
        case 'avg':
          sum = store.average(column.field, records);
          break;

        case 'count':
          sum = records.length;
          break;

        case 'countNotEmpty':
          sum = records.reduce((sum, record) => {
            const value = record[column.field];
            return sum + (value != null ? 1 : 0);
          }, 0);
          break;
      }

      if (typeof type === 'function') {
        sum = records.reduce(type, 'seed' in config ? config.seed : 0);
      }

      if (sum !== null) {
        const valueCls = 'b-grid-summary-value',
              // optional label
        labelHtml = config.label ? `<td class="b-grid-summary-label">${config.label}</td>` : ''; // value to display, either using renderer or as is

        let valueHtml = config.renderer ? config.renderer({
          config,
          sum
        }) : sum,
            summaryHtml;

        if (valueHtml == null) {
          valueHtml = '';
        } // no <td>s in html, wrap it (always the case when not using renderer)

        if (!String(valueHtml).includes('<td>')) {
          summaryHtml = labelHtml // has label, use returned html as value cell
          ? `${labelHtml}<td class="${valueCls}">${valueHtml}</td>` // no label, span entire table
          : `<td colspan="2" class="${valueCls}">${valueHtml}</td>`;
        } // user is in charge of giving correct formatting
        else {
          summaryHtml = valueHtml;
        }

        html += `<tr>${summaryHtml}</tr>`;
      }
    });
    return html + '</table>';
  }

});

/**
 * @module Grid/feature/Summary
 */

/**
 * Displays a summary row in the grid footer. Specify type of summary on columns, available types are:
 * <dl class="wide">
 * <dt>sum <dd>Sum of all values in the column
 * <dt>add <dd>Alias for sum
 * <dt>count <dd>Number of rows
 * <dt>countNotEmpty <dd>Number of rows containing a value
 * <dt>average <dd>Average of all values in the column
 * <dt>function <dd>A custom function, used with store.reduce. Should take arguments (sum, record)
 * </dl>
 * Columns can also specify a summaryRenderer to format the calculated sum.
 *
 * This feature is <strong>disabled</strong> by default.
 *
 * ```
 * { text : 'Score', data : 'score', width : 80, sum : true }
 * { text : 'Rank', data : 'rank', width : 80, sum : 'average', summaryRenderer: ({ sum }) => return 'Average rank ' + sum }
 * ```
 *
 * Also it is possible to set up multiple summaries as array of summary configs:
 * ```
 * { text : 'Rank', data : 'rank', summaries : [{ sum : 'average', label : 'Average' }, { sum : 'count', label : 'Count' }] }
 * ```
 *
 * @extends Core/mixin/InstancePlugin
 *
 * @demo Grid/features
 * @classtype summary
 * @inlineexample Grid/feature/Summary.js
 * @feature
 */

class Summary extends SummaryFormatter(InstancePlugin) {
  //region Config
  static get configurable() {
    return {
      /**
       * Set to `true` to sum values of selected row records
       * @config {Boolean}
       */
      selectedOnly: null,
      hideFooters: false
    };
  } // Plugin configuration. This plugin chains some of the functions in Grid.

  static get pluginConfig() {
    return {
      chain: ['renderRows', 'bindStore']
    };
  } //endregion
  //region Init

  static get $name() {
    return 'Summary';
  }

  construct(grid, config) {
    this.grid = grid;
    super.construct(grid, config);
    this.bindStore(grid.store);
    grid.hideFooters = this.hideFooters;
  }

  bindStore(store) {
    this.detachListeners('store');
    store.on({
      name: 'store',
      change: 'onStoreChange',
      thisObj: this
    });
  }

  get store() {
    return this.grid.store;
  }

  doDestroy() {
    super.doDestroy();
  }

  doDisable(disable) {
    super.doDisable(disable);

    if (disable) {
      this.grid.element.classList.add('b-summary-disabled');
    } else {
      this.updateSummaries();
      this.grid.element.classList.remove('b-summary-disabled');
    }
  } //endregion
  //region Render

  renderRows() {
    this.updateSummaries();
  }
  /**
   * Updates summaries. Summaries are displayed as tables in footer (styling left out to keep brief):
   * ```
   * <table>
   *     <tr><td colspan="2">0</td></tr> // { sum : 'min' } Only a calculation, span entire table
   *     <tr><td>Max</td><td>10</td></tr> // { sum : 'max', label: 'Max' } Label + calculation
   *     <tr><td>Max</td><td>10</td></tr> // { sum : 'sum', label: 'Max' } Label + calculation
   * </table>
   * ```
   * @private
   */

  updateSummaries() {
    const me = this,
          {
      grid,
      store
    } = me,
          cells = DomHelper.children(grid.element, '.b-grid-footer'),
          selectedOnly = me.selectedOnly && grid.selectedRecords.length > 0,
          records = (store.isFiltered ? store.storage.values : store.allRecords).filter(r => !r.isSpecialRow && (!selectedOnly || grid.isSelected(r))); // reset seeds, to not have ever increasing sums :)

    grid.columns.forEach(column => {
      column.summaries && column.summaries.forEach(config => {
        if ('seed' in config) {
          if (!('initialSeed' in config)) {
            config.initialSeed = config.seed;
          }

          if (['number', 'string', 'date'].includes(typeof config.initialSeed)) {
            config.seed = config.initialSeed;
          } else {
            // create shallow copy
            config.seed = Object.assign({}, config.initialSeed);
          }
        }
      });
    });
    cells.forEach(cellElement => {
      // Skip for special columns like checkbox selection
      if (!cellElement.dataset.column) {
        return;
      }

      const column = grid.columns.get(cellElement.dataset.column),
            html = me.generateHtml(column, records, 'b-grid-footer-summary');

      if (column.summaries ? column.summaries.length : column.sum ? 1 : 0) {
        // First time, set table
        if (!cellElement.children.length) {
          cellElement.innerHTML = html;
        } // Following times, sync changes
        else {
          DomHelper.sync(html, cellElement.firstElementChild);
        }
      }
    });
  } //endregion
  //region Events

  /**
   * Updates summaries on store changes (except record update, handled below)
   * @private
   */

  onStoreChange({
    action,
    changes
  }) {
    let shouldUpdate = true;

    if (this.disabled) {
      return;
    }

    if (action === 'update') {
      // only update summary when a field that affects summary is changed
      // TODO: this should maybe be removed, another column might depend on the value for its summary?
      shouldUpdate = Object.keys(changes).some(field => {
        const colField = this.grid.columns.get(field); // check existence, since a field not used in a column might have changed

        return Boolean(colField) && (Boolean(colField.sum) || Boolean(colField.summaries));
      });
    }

    if (shouldUpdate) {
      this.updateSummaries();
    }
  } //endregion

  updateSelectedOnly(value) {
    const me = this;
    me.detachListeners('selectionChange');

    if (value) {
      me.grid.on({
        name: 'selectionChange',
        selectionChange: me.refresh,
        thisObj: me
      });
    }

    me.refresh();
  }
  /**
   * Refreshes the summaries
   */

  refresh() {
    this.updateSummaries();
  }

}
Summary.featureClass = 'b-summary';
Summary._$name = 'Summary';
GridFeatureManager.registerFeature(Summary);

class ExportRowsCombo extends LocalizableCombo {
  //region Config
  static get $name() {
    return 'ExportRowsCombo';
  } // Factoryable type name

  static get type() {
    return 'exportrowscombo';
  }

  static get defaultConfig() {
    return {
      editable: false
    };
  } //endregion

  buildLocalizedItems() {
    const me = this;
    return [{
      id: RowsRange.all,
      text: me.L('L{all}')
    }, {
      id: RowsRange.visible,
      text: me.L('L{visible}')
    }];
  }

} // Register this widget type with its Factory

ExportRowsCombo.initClass();
ExportRowsCombo._$name = 'ExportRowsCombo';

class ExportOrientationCombo extends LocalizableCombo {
  //region Config
  static get $name() {
    return 'ExportOrientationCombo';
  } // Factoryable type name

  static get type() {
    return 'exportorientationcombo';
  }

  static get defaultConfig() {
    return {
      editable: false
    };
  } //endregion

  buildLocalizedItems() {
    const me = this;
    return [{
      id: Orientation.portrait,
      text: me.L('L{portrait}')
    }, {
      id: Orientation.landscape,
      text: me.L('L{landscape}')
    }];
  }

} // Register this widget type with its Factory

ExportOrientationCombo.initClass();
ExportOrientationCombo._$name = 'ExportOrientationCombo';

function buildComboItems(obj, fn = x => x) {
  return Object.keys(obj).map(key => ({
    id: key,
    text: fn(key)
  }));
}
/**
 * @module Grid/view/export/ExportDialog
 */

/**
 * Dialog window used by the {@link Grid/feature/export/PdfExport PDF export feature}. It allows users to select export
 * options like paper format and columns to export. This dialog contains a number of predefined
 * {@link Core/widget/Field fields} which you can access through the popup's {@link #property-widgetMap}.
 *
 * ## Default widgets
 *
 * The default widgets of this dialog are:
 *
 * | Widget ref             | Type                         | Weight | Description                                          |
 * |------------------------|------------------------------|--------|----------------------------------------------------- |
 * | `columnsField`         | {@link Core/widget/Combo}    | 100    | Choose columns to export                             |
 * | `rowsRangeField`       | {@link Core/widget/Combo}    | 200    | Choose which rows to export                          |
 * | `exporterTypeField`    | {@link Core/widget/Combo}    | 300    | Type of the exporter to use                          |
 * | `alignRowsField`       | {@link Core/widget/Checkbox} | 400    | Align row top to the page top on every exported page |
 * | `repeatHeaderField`    | {@link Core/widget/Checkbox} | 500    | Toggle repeating headers on / off                    |
 * | `fileFormatField`      | {@link Core/widget/Combo}    | 600    | Choose file format                                   |
 * | `paperFormatField`     | {@link Core/widget/Combo}    | 700    | Choose paper format                                  |
 * | `orientationField`     | {@link Core/widget/Combo}    | 800    | Choose orientation                                   |
 *
 * The default buttons are:
 *
 * | Widget ref             | Type                       | Weight | Description                                          |
 * |------------------------|----------------------------|--------|------------------------------------------------------|
 * | `exportButton`         | {@link Core/widget/Button} | 100    | Triggers export                                      |
 * | `cancelButton`         | {@link Core/widget/Button} | 200    | Cancel export                                        |
 *
 * Bottom buttons may be customized using `bbar` config passed to `exportDialog`:
 *
 * ```javascript
 * const grid = new Grid({
 *     features : {
 *         pdfExport : {
 *             editorConfig : {
 *                 bbar : {
 *                     items : {
 *                         exportButton : { text : 'Go!' }
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 *
 * ## Configuring default widgets
 *
 * Widgets can be customized with {@link Grid/feature/export/PdfExport#config-exportDialog} config:
 *
 * ```javascript
 * const grid = new Grid({
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
 *                     fileFormatField   : { value : 'png' }
 *                 }
 *             }
 *         }
 *     }
 * });
 *
 * grid.features.pdfExport.showExportDialog();
 * ```
 *
 * ## Configuring default columns
 *
 * By default all visible columns are selected in the export dialog. This is managed by the
 * {@link #config-autoSelectVisibleColumns} config. To change default selected columns you should disable this config
 * and set field value. Value should be an array of valid column ids (or column instances). This way you can
 * preselect hidden columns:
 *
 * ```javascript
 * const grid = new Grid({
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
 * grid.features.pdfExport.showExportDialog();
 * ```
 *
 * ## Adding fields
 *
 * You can add your own fields to the export dialog. To make such field value acessible to the feature it should follow
 * a specific naming pattern - it should have `ref` config ending with `Field`, see other fields for reference -
 * `orientationField`, `columnsField`, etc. Fields not matching this pattern are ignored. When values are collected from
 * the dialog, `Field` part of the widget reference is removed, so `orientationField` becomes `orientation`, `fooField`
 * becomes `foo`, etc.
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
 * const grid = new Grid({
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
 * grid.features.pdfExport.exportDialog.on({
 *     beforeShow() {
 *         this.widgetMap.columnsField.value = ['age', 'city']
 *     }
 * });
 * ```
 *
 * @extends Core/widget/Popup
 */

class ExportDialog extends Popup {
  //region Config
  static get $name() {
    return 'ExportDialog';
  }

  static get type() {
    return 'exportdialog';
  }

  static get configurable() {
    return {
      autoShow: false,
      autoClose: false,
      closable: true,
      centered: true,

      /**
       * Returns map of values of dialog fields.
       * @member {Object} values
       * @readonly
       */

      /**
       * Grid instance to build export dialog for
       * @config {Grid.view.Grid}
       */
      client: null,

      /**
       * Set to `false` to not preselect all visible columns when the dialog is shown
       * @config {Boolean}
       */
      autoSelectVisibleColumns: true,

      /**
       * Set to `false` to allow using PNG + Multipage config in export dialog
       * @config {Boolean}
       */
      hidePNGMultipageOption: true,
      title: 'L{exportSettings}',
      defaults: {
        localeClass: this
      },
      items: {
        columnsField: {
          type: 'combo',
          label: 'L{ExportDialog.columns}',
          store: {},
          valueField: 'id',
          displayField: 'text',
          multiSelect: true,
          weight: 100
        },
        rowsRangeField: {
          type: 'exportrowscombo',
          label: 'L{ExportDialog.rows}',
          value: 'all',
          weight: 200
        },
        exporterTypeField: {
          type: 'localizablecombo',
          label: 'L{ExportDialog.exporterType}',
          editable: false,
          value: 'singlepage',
          buildLocalizedItems: function () {
            const dialog = this.parent;
            return dialog.exporters.map(exporter => ({
              id: exporter.type,
              text: dialog.optionalL(exporter.title, this)
            }));
          },

          onChange({
            value
          }) {
            this.owner.widgetMap.alignRowsField.hidden = value === 'singlepage';
            this.owner.widgetMap.repeatHeaderField.hidden = value !== 'multipagevertical';
          },

          weight: 300
        },
        alignRowsField: {
          type: 'checkbox',
          label: 'L{ExportDialog.alignRows}',
          checked: false,
          hidden: true,
          weight: 400
        },
        repeatHeaderField: {
          type: 'checkbox',
          label: 'L{ExportDialog.repeatHeader}',
          localeClass: this,
          hidden: true,
          weight: 500
        },
        fileFormatField: {
          type: 'combo',
          label: 'L{ExportDialog.fileFormat}',
          localeClass: this,
          editable: false,
          value: 'pdf',
          items: [],

          onChange({
            value,
            oldValue
          }) {
            const dialog = this.parent;

            if (dialog.hidePNGMultipageOption) {
              const exporterField = dialog.widgetMap.exporterTypeField,
                    exporter = exporterField.store.find(r => r.id === 'singlepage');

              if (value === FileFormat.png && exporter) {
                this._previousDisabled = exporterField.disabled;
                exporterField.disabled = true;
                this._previousValue = exporterField.value;
                exporterField.value = 'singlepage';
              } else if (oldValue === FileFormat.png && this._previousValue) {
                exporterField.disabled = this._previousDisabled;
                exporterField.value = this._previousValue;
              }
            }
          },

          weight: 600
        },
        paperFormatField: {
          type: 'combo',
          label: 'L{ExportDialog.paperFormat}',
          editable: false,
          value: 'A4',
          items: [],
          weight: 700
        },
        orientationField: {
          type: 'exportorientationcombo',
          label: 'L{ExportDialog.orientation}',
          value: 'portrait',
          weight: 800
        }
      },
      bbar: {
        defaults: {
          localeClass: this
        },
        items: {
          exportButton: {
            color: 'b-green',
            text: 'L{ExportDialog.export}',
            weight: 100,
            onClick: 'up.onExportClick'
          },
          cancelButton: {
            color: 'b-gray',
            text: 'L{ExportDialog.cancel}',
            weight: 200,
            onClick: 'up.onCancelClick'
          }
        }
      }
    };
  } //endregion

  construct(config = {}) {
    const me = this,
          {
      client
    } = config;

    if (!client) {
      throw new Error('`client` config is required');
    }

    me.columnsStore = client.columns.chain(column => column.isLeaf && column.exportable);
    me.applyInitialValues(config);
    super.construct(config);
    LocaleManagerSingleton.on({
      locale: 'onLocaleChange',
      prio: -1,
      thisObj: me
    });
  }

  applyInitialValues(config) {
    const me = this,
          items = config.items = config.items || {};
    config.width = config.width || me.L('L{width}');
    config.defaults = config.defaults || {};
    config.defaults.labelWidth = config.defaults.labelWidth || me.L('L{ExportDialog.labelWidth}');
    items.columnsField = items.columnsField || {};
    items.fileFormatField = items.fileFormatField || {};
    items.paperFormatField = items.paperFormatField || {};
    items.fileFormatField.items = buildComboItems(FileFormat, value => value.toUpperCase());
    items.paperFormatField.items = buildComboItems(PaperFormat);
    items.columnsField.store = me.columnsStore;
  }

  onBeforeShow() {
    var _super$onBeforeShow;

    const {
      columnsField,
      alignRowsField,
      exporterTypeField,
      repeatHeaderField
    } = this.widgetMap;

    if (this.autoSelectVisibleColumns) {
      columnsField.value = this.columnsStore.query(c => !c.hidden);
    }

    alignRowsField.hidden = exporterTypeField.value === 'singlepage';
    repeatHeaderField.hidden = exporterTypeField.value !== 'multipagevertical';
    (_super$onBeforeShow = super.onBeforeShow) === null || _super$onBeforeShow === void 0 ? void 0 : _super$onBeforeShow.call(this, ...arguments);
  }

  onLocaleChange() {
    const labelWidth = this.L('L{labelWidth}');
    this.width = this.L('L{width}');
    this.eachWidget(widget => {
      if (widget instanceof Field) {
        widget.labelWidth = labelWidth;
      }
    });
  }

  onExportClick() {
    const values = this.values;
    /**
     * Fires when export button is clicked
     * @event export
     * @param {Object} values Object containing config for {@link Grid.feature.export.PdfExport#function-export export()} method
     * @category Export
     */

    this.trigger('export', {
      values
    });
  }

  onCancelClick() {
    /**
     * Fires when cancel button is clicked. Popup will hide itself.
     * @event cancel
     * @category Export
     */
    this.trigger('cancel');
    this.hide();
  }

  get values() {
    const fieldRe = /field/i,
          result = {};
    this.eachWidget(widget => {
      if (fieldRe.test(widget.ref)) {
        result[widget.ref.replace(fieldRe, '')] = widget instanceof Checkbox ? widget.checked : widget.value;
      }
    });
    return result;
  }

}
ExportDialog.initClass();
ExportDialog._$name = 'ExportDialog';

/**
 * @module Grid/feature/export/exporter/MultiPageExporter
 */

/**
 * A multiple page exporter. Used by the {@link Grid.feature.export.PdfExport} feature to export to multiple pages. You
 * do not need to use this class directly.
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
 * const grid = new Grid({
 *     features : {
 *         pdfExport : {
 *             // this export feature is configured with only one exporter
 *             exporters : [MyMultiPageExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * grid.features.pdfExport.export({ exporter : 'mymultipageexporter' });
 * ```
 *
 * @classType multipage
 * @feature
 * @extends Grid/feature/export/exporter/Exporter
 */

class MultiPageExporter extends Exporter {
  static get $name() {
    return 'MultiPageExporter';
  }

  static get type() {
    return 'multipage';
  }

  static get title() {
    // In case locale is missing exporter is still distinguishable
    return this.L('L{multipage}');
  }

  static get exportingPageText() {
    return 'L{exportingPage}';
  } //region State management

  async stateNextPage({
    client
  }) {
    const {
      exportMeta
    } = this;
    ++exportMeta.currentPage;
    ++exportMeta.verticalPosition;
    delete exportMeta.lastExportedRowBottom; // If current vertical position is greater than max vertical pages, switch to next column

    if (exportMeta.verticalPosition >= exportMeta.verticalPages) {
      exportMeta.verticalPosition = exportMeta.currentPageTopMargin = 0;
      ++exportMeta.horizontalPosition;
      delete exportMeta.lastRowDataIndex;
      await this.scrollRowIntoView(client, exportMeta.firstVisibleDataIndex, {
        block: 'start'
      });
    }
  } //endregion
  //region Preparation

  async prepareComponent(config) {
    await super.prepareComponent(config);
    const me = this,
          {
      exportMeta
    } = me,
          {
      client,
      headerTpl,
      footerTpl,
      alignRows,
      rowsRange
    } = config,
          paperFormat = PaperFormat[config.paperFormat],
          isPortrait = config.orientation === Orientation.portrait,
          paperWidth = isPortrait ? paperFormat.width : paperFormat.height,
          paperHeight = isPortrait ? paperFormat.height : paperFormat.width,
          pageWidth = me.inchToPx(paperWidth),
          pageHeight = me.inchToPx(paperHeight),
          horizontalPages = Math.ceil(exportMeta.totalWidth / pageWidth); // To estimate amount of pages correctly we need to know height of the header/footer on every page

    let contentHeight = pageHeight;

    if (headerTpl) {
      contentHeight -= me.measureElement(headerTpl({
        totalWidth: exportMeta.totalWidth,
        totalPages: -1,
        currentPage: -1
      }));
    }

    if (footerTpl) {
      contentHeight -= me.measureElement(footerTpl({
        totalWidth: exportMeta.totalWidth,
        totalPages: -1,
        currentPage: -1
      }));
    }

    let totalHeight,
        verticalPages,
        totalRows = client.store.count;

    if (rowsRange === RowsRange.visible) {
      totalRows = me.getVisibleRowsCount(client);
      totalHeight = exportMeta.totalHeight + client.height;
    } else {
      totalHeight = exportMeta.totalHeight + client.height - client.bodyHeight + client.scrollable.scrollHeight;
    } // alignRows config specifies if rows should be always fully visible. E.g. if row doesn't fit on the page, it goes
    // to the top of the next page

    if (alignRows && rowsRange !== RowsRange.visible) {
      // we need to estimate amount of vertical pages for case when we only put row on the page if it fits
      // first we need to know how much rows would fit one page, keeping in mind first page also contains header
      // This estimation is loose, because row height might differ much between pages
      const rowHeight = client.rowManager.rowOffsetHeight,
            rowsOnFirstPage = Math.floor((contentHeight - client.headerHeight) / rowHeight),
            rowsPerPage = Math.floor(contentHeight / rowHeight),
            remainingRows = totalRows - rowsOnFirstPage;
      verticalPages = 1 + Math.ceil(remainingRows / rowsPerPage);
    } else {
      verticalPages = Math.ceil(totalHeight / contentHeight);
    }

    Object.assign(exportMeta, {
      paperWidth,
      paperHeight,
      pageWidth,
      pageHeight,
      horizontalPages,
      verticalPages,
      totalHeight,
      contentHeight,
      totalRows,
      totalPages: horizontalPages * verticalPages,
      currentPage: 0,
      verticalPosition: 0,
      horizontalPosition: 0,
      currentPageTopMargin: 0
    });
    this.adjustRowBuffer(client);
  }

  async restoreComponent(config) {
    await super.restoreComponent(config);
    this.restoreRowBuffer(config.client);
  } //endregion

  async buildPage(config) {
    const me = this,
          {
      exportMeta
    } = me,
          {
      client,
      headerTpl,
      footerTpl,
      alignRows,
      rowsRange
    } = config,
          {
      totalWidth,
      totalPages,
      currentPage,
      subGrids,
      currentPageTopMargin,
      verticalPosition,
      totalRows,
      lastRowDataIndex
    } = exportMeta,
          {
      rowManager
    } = client,
          {
      rows
    } = rowManager,
          onlyVisible = rowsRange === RowsRange.visible; // Rows are stored in shared state object, need to clean it before exporting next page

    Object.values(subGrids).forEach(subGrid => subGrid.rows = []); // With variable row height total height might change after scroll, update it
    // to show content completely on the last page

    if (config.rowsRange === RowsRange.all) {
      exportMeta.totalHeight = client.height - client.bodyHeight + client.scrollable.scrollHeight - me.getVirtualScrollerHeight(client);
    }

    let headerHeight = 0,
        footerHeight = 0,
        remainingHeight,
        header,
        footer,
        index;

    if (onlyVisible && lastRowDataIndex != null) {
      if (lastRowDataIndex === rows[rows.length - 1].dataIndex) {
        index = rows.length - 1;
      } else {
        index = rows.findIndex(r => r.dataIndex === lastRowDataIndex);
      }
    } else {
      index = onlyVisible ? rows.findIndex(r => r.bottom > Math.ceil(client.scrollable.y)) : rows.findIndex(r => r.bottom + currentPageTopMargin + client.headerHeight > 0);
    }

    const firstRowIndex = index,
          // This is a portion of the row which is not visible, which means it shouldn't affect remaining height
    // Don't calculate for the first page
    overflowingHeight = onlyVisible || verticalPosition === 0 ? 0 : rows[index].top + currentPageTopMargin + client.headerHeight; // Measure header and footer height

    if (headerTpl) {
      header = me.prepareHTML(headerTpl({
        totalWidth,
        totalPages,
        currentPage
      }));
      headerHeight = me.measureElement(header);
    }

    if (footerTpl) {
      footer = me.prepareHTML(footerTpl({
        totalWidth,
        totalPages,
        currentPage
      }));
      footerHeight = me.measureElement(footer);
    } // Calculate remaining height to fill with rows
    // remainingHeight is height of the page content region to fill. When next row is exported, this heights gets
    // reduced. Since top rows may be partially visible, it would lead to increasing error and eventually to incorrect
    // exported rows for the page

    remainingHeight = exportMeta.pageHeight - headerHeight - footerHeight - overflowingHeight; // first exported page container header

    if (verticalPosition === 0) {
      remainingHeight -= client.headerHeight;
    } // data index of the last collected row

    let lastDataIndex,
        offset = 0;

    while (remainingHeight > 0) {
      const row = rows[index];

      if (alignRows && remainingHeight < row.offsetHeight) {
        offset = -remainingHeight;
        remainingHeight = 0; // If we skip a row save its bottom to meta data in order to align canvases height
        // properly

        me.exportMeta.lastExportedRowBottom = rows[index - 1].bottom;
      } else {
        me.collectRow(row);
        remainingHeight -= row.offsetHeight;
        lastDataIndex = row.dataIndex; // Last row is processed, still need to fill the view

        if (++index === rows.length && remainingHeight > 0) {
          remainingHeight = 0;
        } else if (onlyVisible && index - firstRowIndex === totalRows) {
          remainingHeight = 0;
        }
      }
    }

    const lastRow = rows[index - 1];

    if (lastRow) {
      // Calculate exact grid height according to the the last exported row
      exportMeta.exactGridHeight = lastRow.bottom + client.footerContainer.offsetHeight + client.headerContainer.offsetHeight;
      exportMeta.lastRowDataIndex = lastRow.dataIndex + 1;
    }

    await me.onRowsCollected(rows.slice(firstRowIndex, index), config); // No scrolling required if we are only exporting currently visible rows

    if (onlyVisible) {
      exportMeta.exactGridHeight -= exportMeta.scrollableTopMargin = client.scrollable.y;
    } else {
      // With variable row height row manager might relayout rows to fix position, moving them up or down.
      const detacher = rowManager.on('offsetrows', ({
        offset: value
      }) => offset += value);
      await me.scrollRowIntoView(client, lastDataIndex + 1);
      detacher();
    }

    const html = me.buildPageHtml();
    return {
      html,
      header,
      footer,
      offset
    };
  }

  async onRowsCollected() {}

  collectRow(row) {
    const subGrids = this.exportMeta.subGrids;
    Object.entries(row.elements).forEach(([key, value]) => {
      subGrids[key].rows.push(value.outerHTML);
    });
  }

  buildPageHtml() {
    const me = this,
          {
      subGrids
    } = me.exportMeta; // Now when rows are collected, we need to add them to exported grid

    let html = me.prepareExportElement();
    Object.values(subGrids).forEach(({
      placeHolder,
      rows
    }) => {
      const placeHolderText = placeHolder.outerHTML;
      html = html.replace(placeHolderText, rows.join(''));
    });
    return html;
  }

  prepareExportElement() {
    const me = this,
          {
      element,
      exportMeta
    } = me;

    if (exportMeta.scrollableTopMargin) {
      element.querySelector('.b-grid-vertical-scroller').style.marginTop = `-${exportMeta.scrollableTopMargin}px`;
    }

    return super.prepareExportElement();
  }

} // HACK: terser/obfuscator doesn't yet support async generators, when processing code it converts async generator to regular async
// function.

MultiPageExporter.prototype.pagesExtractor = async function* pagesExtractor(config) {
  const me = this,
        {
    exportMeta,
    stylesheets
  } = me,
        {
    totalWidth,
    totalPages,
    paperWidth,
    paperHeight,
    contentHeight
  } = exportMeta;
  let currentPage;

  while ((currentPage = exportMeta.currentPage) < totalPages) {
    me.trigger('exportStep', {
      text: me.L(MultiPageExporter.exportingPageText, {
        currentPage,
        totalPages
      }),
      progress: Math.round((currentPage + 1) / totalPages * 90)
    });
    const {
      html,
      header,
      footer,
      offset
    } = await me.buildPage(config); // TotalHeight might change in case of variable row heights
    // Move exported content in the visible frame

    const styles = [...stylesheets, `
                <style>
                    #${config.client.id} {
                        height: ${exportMeta.exactGridHeight}px !important;
                        width: ${totalWidth}px !important;
                    }
                    .b-export-body .b-export-viewport {
                        margin-left : ${-paperWidth * exportMeta.horizontalPosition}in;
                        margin-top  : ${exportMeta.currentPageTopMargin}px;
                    }
                </style>
            `]; // when aligning rows, offset gets accumulated, so we need to take it into account

    exportMeta.currentPageTopMargin -= contentHeight + offset;
    await me.stateNextPage(config);
    yield {
      html: me.pageTpl({
        html,
        header,
        footer,
        styles,
        paperWidth,
        paperHeight
      })
    };
  }
};

MultiPageExporter._$name = 'MultiPageExporter';

/**
 * @module Grid/feature/export/exporter/MultiPageVerticalExporter
 */

/**
 * A vertical multiple page exporter. Used by the {@link Grid.feature.export.PdfExport} feature to export to multiple
 * pages. Content will be scaled in a horizontal direction to fit the page.
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
 * const grid = new Grid({
 *     features : {
 *         pdfExport : {
 *             // this export feature is configured with only one exporter
 *             exporters : [MyMultiPageVerticalExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * grid.features.pdfExport.export({ exporter : 'mymultipageverticalexporter' });
 * ```
 *
 * @classType multipagevertical
 * @feature
 * @extends Grid/feature/export/exporter/Exporter
 */

class MultiPageVerticalExporter extends Exporter {
  static get $name() {
    return 'MultiPageVerticalExporter';
  }

  static get type() {
    return 'multipagevertical';
  }

  static get title() {
    // In case locale is missing exporter is still distinguishable
    return this.L('L{multipagevertical}');
  }

  static get exportingPageText() {
    return 'L{exportingPage}';
  } //region State management

  async stateNextPage({
    client
  }) {
    const {
      exportMeta
    } = this,
          {
      totalRows,
      processedRows,
      totalPages
    } = exportMeta;
    ++exportMeta.currentPage;
    ++exportMeta.verticalPosition; // With variable row heights it is possible that initial pages estimation is wrong. If we're out but there are
    // more rows to process - continue exporting

    if (exportMeta.currentPage === totalPages && processedRows.size !== totalRows) {
      ++exportMeta.totalPages;
      ++exportMeta.verticalPages;
    }
  } //endregion

  estimateTotalPages(config) {
    const me = this,
          {
      exportMeta
    } = me,
          {
      client,
      headerTpl,
      footerTpl,
      alignRows,
      rowsRange,
      repeatHeader
    } = config,
          {
      pageWidth,
      pageHeight,
      totalWidth
    } = exportMeta,
          scale = me.getScaleValue(pageWidth, totalWidth); // To estimate amount of pages correctly we need to know height of the header/footer on every page

    let totalHeight = 0 - me.getVirtualScrollerHeight(client) + client.height - client.bodyHeight + client.scrollable.scrollHeight,
        // We will be scaling content horizontally, need to adjust content height accordingly
    contentHeight = pageHeight / scale,
        totalRows = client.store.count,
        initialScroll = 0,
        verticalPages;

    if (headerTpl) {
      contentHeight -= me.measureElement(headerTpl({
        totalWidth,
        totalPages: -1,
        currentPage: -1
      }));
    }

    if (footerTpl) {
      contentHeight -= me.measureElement(footerTpl({
        totalWidth,
        totalPages: -1,
        currentPage: -1
      }));
    } // If we are repeating header on every page we have smaller contentHeight

    if (repeatHeader) {
      contentHeight -= client.headerHeight;
      totalHeight -= client.headerHeight;
    }

    if (rowsRange === RowsRange.visible) {
      const rowManager = client.rowManager,
            firstRow = rowManager.firstVisibleRow,
            lastRow = rowManager.lastVisibleRow;
      initialScroll = firstRow.top;
      totalRows = me.getVisibleRowsCount(client);
      totalHeight = totalHeight - client.scrollable.scrollHeight + lastRow.bottom - firstRow.top;
    } // alignRows config specifies if rows should be always fully visible. E.g. if row doesn't fit on the page, it goes
    // to the top of the next page

    if (alignRows && !repeatHeader && rowsRange !== RowsRange.visible) {
      // we need to estimate amount of vertical pages for case when we only put row on the page if it fits
      // first we need to know how much rows would fit one page, keeping in mind first page also contains header
      // This estimation is loose, because row height might differ much between pages
      const rowHeight = client.rowManager.rowOffsetHeight,
            rowsOnFirstPage = Math.floor((contentHeight - client.headerHeight) / rowHeight),
            rowsPerPage = Math.floor(contentHeight / rowHeight),
            remainingRows = totalRows - rowsOnFirstPage;
      verticalPages = 1 + Math.ceil(remainingRows / rowsPerPage);
    } else {
      verticalPages = Math.ceil(totalHeight / contentHeight);
    }

    Object.assign(exportMeta, {
      scale,
      contentHeight,
      totalRows,
      totalHeight,
      verticalPages,
      initialScroll,
      horizontalPages: 1,
      totalPages: verticalPages
    });
  }

  async prepareComponent(config) {
    await super.prepareComponent(config);
    const me = this,
          {
      exportMeta
    } = me,
          {
      client
    } = config,
          paperFormat = PaperFormat[config.paperFormat],
          isPortrait = config.orientation === Orientation.portrait,
          paperWidth = isPortrait ? paperFormat.width : paperFormat.height,
          paperHeight = isPortrait ? paperFormat.height : paperFormat.width,
          pageWidth = me.inchToPx(paperWidth),
          pageHeight = me.inchToPx(paperHeight),
          horizontalPages = 1;
    Object.assign(exportMeta, {
      paperWidth,
      paperHeight,
      pageWidth,
      pageHeight,
      horizontalPages,
      currentPage: 0,
      verticalPosition: 0,
      horizontalPosition: 0,
      currentPageTopMargin: 0,
      processedRows: new Set()
    });
    me.estimateTotalPages(config);
    me.adjustRowBuffer(client);
  }

  async restoreComponent(config) {
    await super.restoreComponent(config);
    this.restoreRowBuffer(config.client);
  }

  async buildPage(config) {
    const me = this,
          {
      exportMeta
    } = me,
          {
      client,
      headerTpl,
      footerTpl,
      alignRows,
      repeatHeader
    } = config,
          {
      totalWidth,
      totalPages,
      currentPage,
      subGrids,
      currentPageTopMargin,
      verticalPosition,
      totalRows,
      contentHeight
    } = exportMeta,
          // If we are repeating header we've already took header height into account when setting content height
    clientHeaderHeight = repeatHeader ? 0 : client.headerHeight,
          {
      rowManager
    } = client,
          {
      rows
    } = rowManager; // Rows are stored in shared state object, need to clean it before exporting next page

    Object.values(subGrids).forEach(subGrid => subGrid.rows = []); // With variable row height total height might change after scroll, update it
    // to show content completely on the last page

    if (config.rowsRange === RowsRange.all) {
      exportMeta.totalHeight = client.height - client.bodyHeight + client.scrollable.scrollHeight - me.getVirtualScrollerHeight(client);
    }

    let index = config.rowsRange === RowsRange.visible ? rows.findIndex(r => r.bottom > client.scrollable.y) : rows.findIndex(r => r.bottom + currentPageTopMargin + clientHeaderHeight > 0),
        remainingHeight,
        header,
        footer;
    const firstRowIndex = index,
          // This is a portion of the row which is not visible, which means it shouldn't affect remaining height
    // Don't calculate for the first page
    overflowingHeight = verticalPosition === 0 ? 0 : rows[index].top + currentPageTopMargin + clientHeaderHeight; // Measure header and footer height

    if (headerTpl) {
      header = me.prepareHTML(headerTpl({
        totalWidth,
        totalPages,
        currentPage
      }));
    }

    if (footerTpl) {
      footer = me.prepareHTML(footerTpl({
        totalWidth,
        totalPages,
        currentPage
      }));
    } // Calculate remaining height to fill with rows
    // remainingHeight is height of the page content region to fill. When next row is exported, this heights gets
    // reduced. Since top rows may be partially visible, it would lead to increasing error and eventually to incorrect
    // exported rows for the page

    remainingHeight = contentHeight - overflowingHeight; // first exported page container header

    if (verticalPosition === 0) {
      remainingHeight -= clientHeaderHeight;
    } // data index of the last collected row

    let lastDataIndex,
        offset = 0;

    while (remainingHeight > 0) {
      const row = rows[index];

      if (alignRows && remainingHeight < row.offsetHeight) {
        offset = -remainingHeight;
        remainingHeight = 0;
      } else {
        me.collectRow(row);
        remainingHeight -= row.offsetHeight; // only mark row as processed if it fitted without overflow

        if (remainingHeight > 0) {
          // We cannot use simple counter here because some rows appear on 2 pages. Need to track unique identifier
          exportMeta.processedRows.add(row.dataIndex);
        }

        lastDataIndex = row.dataIndex; // Last row is processed, still need to fill the view

        if (++index === rows.length && remainingHeight > 0) {
          remainingHeight = 0;
        } else if (config.rowsRange === RowsRange.visible && index - firstRowIndex === totalRows) {
          remainingHeight = 0;
        }
      }
    }

    const lastRow = rows[index - 1];

    if (lastRow) {
      // Calculate exact grid height according to the the last exported row
      exportMeta.exactGridHeight = lastRow.bottom + client.footerContainer.offsetHeight + client.headerContainer.offsetHeight;
    }

    await me.onRowsCollected(rows.slice(firstRowIndex, index), config); // No scrolling required if we are only exporting currently visible rows

    if (config.rowsRange === RowsRange.visible) {
      exportMeta.scrollableTopMargin = client.scrollable.y;
    } else {
      // With variable row height row manager might relayout rows to fix position, moving them up or down.
      const detacher = rowManager.on('offsetrows', ({
        offset: value
      }) => offset += value);
      await me.scrollRowIntoView(client, lastDataIndex + 1);
      detacher();
    }

    const html = me.buildPageHtml();
    return {
      html,
      header,
      footer,
      offset
    };
  }

  async onRowsCollected() {}

  collectRow(row) {
    const subGrids = this.exportMeta.subGrids;
    Object.entries(row.elements).forEach(([key, value]) => {
      subGrids[key].rows.push(value.outerHTML);
    });
  }

  buildPageHtml() {
    const me = this,
          {
      subGrids
    } = me.exportMeta; // Now when rows are collected, we need to add them to exported grid

    let html = me.prepareExportElement();
    Object.values(subGrids).forEach(({
      placeHolder,
      rows
    }) => {
      const placeHolderText = placeHolder.outerHTML;
      html = html.replace(placeHolderText, rows.join(''));
    });
    return html;
  }

} // HACK: terser/obfuscator doesn't yet support async generators, when processing code it converts async generator to regular async
// function.

MultiPageVerticalExporter.prototype.pagesExtractor = async function* pagesExtractor(config) {
  const me = this,
        {
    exportMeta,
    stylesheets
  } = me,
        {
    totalWidth,
    paperWidth,
    paperHeight,
    contentHeight,
    scale,
    initialScroll
  } = exportMeta;
  let {
    totalPages
  } = exportMeta,
      currentPage;

  while ((currentPage = exportMeta.currentPage) < totalPages) {
    me.trigger('exportStep', {
      text: me.L(MultiPageVerticalExporter.exportingPageText, {
        currentPage,
        totalPages
      }),
      progress: Math.round((currentPage + 1) / totalPages * 90)
    });
    const {
      html,
      header,
      footer,
      offset
    } = await me.buildPage(config); // TotalHeight might change in case of variable row heights
    // Move exported content in the visible frame

    const styles = [...stylesheets, `
                <style>
                    #${config.client.id} {
                        width: ${totalWidth}px !important;
                    }
                    .b-export .b-export-content {
                        transform: scale(${scale});
                        transform-origin: top left;
                        height: auto;
                    }
                </style>
            `];

    if (config.repeatHeader) {
      const gridHeight = exportMeta.exactGridHeight ? `${exportMeta.exactGridHeight + exportMeta.currentPageTopMargin}px` : '100%';
      styles.push(`
                <style>
                    #${config.client.id} {
                        height: ${gridHeight} !important;
                    }
                    .b-export .b-export-content {
                        height: ${100 / scale}%;
                    }
                    .b-export-body {
                        height: 100%;
                        display: flex;
                    }
                    .b-export-viewport {
                        height: 100%;
                    }
                    .b-grid-vertical-scroller {
                        margin-top: ${exportMeta.currentPageTopMargin - initialScroll}px;
                    }
                </style>
                `);
    } else {
      const gridHeight = exportMeta.exactGridHeight || contentHeight - exportMeta.currentPageTopMargin;
      styles.push(`
                <style>
                    #${config.client.id} {
                        height: ${gridHeight}px !important;
                    }
                    .b-export-body {
                        overflow: hidden;
                    }
                    .b-export .b-export-content {
                        height: ${100 / scale}%;
                    }
                    .b-export-body .b-export-viewport {
                        margin-top: ${exportMeta.currentPageTopMargin}px;
                    }
                    .b-grid-vertical-scroller {
                        margin-top: -${initialScroll}px;
                    }
                </style>
                `);
    } // when aligning rows, offset gets accumulated, so we need to take it into account

    exportMeta.currentPageTopMargin -= contentHeight + offset;
    await me.stateNextPage(config);
    ({
      totalPages
    } = exportMeta);
    yield {
      html: me.pageTpl({
        html,
        header,
        footer,
        styles,
        paperWidth,
        paperHeight
      })
    };
  }
};

MultiPageVerticalExporter._$name = 'MultiPageVerticalExporter';

/**
 * @module Grid/feature/export/exporter/SinglePageExporter
 */

/**
 * A single page exporter. Used by the {@link Grid.feature.export.PdfExport} feature to export to single page. Content
 * will be scaled in both directions to fit the page.
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
 * const grid = new Grid({
 *     features : {
 *         pdfExport : {
 *             // this export feature is configured with only one exporter
 *             exporters : [MySinglePageExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * grid.features.pdfExport.export({ exporter : 'mysinglepageexporter' });
 * ```
 *
 * @classType singlepage
 * @feature
 * @extends Grid/feature/export/exporter/Exporter
 */

class SinglePageExporter extends Exporter {
  static get $name() {
    return 'SinglePageExporter';
  }

  static get type() {
    return 'singlepage';
  }

  static get title() {
    // In case locale is missing exporter is still distinguishable
    return this.localize('L{singlepage}');
  }

  static get defaultConfig() {
    return {
      /**
       * Set to true to center content horizontally on the page
       * @config {Boolean}
       */
      centerContentHorizontally: false
    };
  }

  async prepareComponent(config) {
    await super.prepareComponent(config);
    Object.assign(this.exportMeta, {
      verticalPages: 1,
      horizontalPages: 1,
      totalPages: 1,
      currentPage: 0,
      verticalPosition: 0,
      horizontalPosition: 0
    });
  }

  async onRowsCollected() {}

  positionRows(rows) {
    let currentTop = 0; // In case of variable row height row vertical position is not guaranteed to increase
    // monotonously. Position row manually instead

    return rows.map(([html, height]) => {
      const result = html.replace(/translate\(\d+px, \d+px\)/, `translate(0px, ${currentTop}px)`);
      currentTop += height;
      return result;
    });
  }

  collectRow(row) {
    const subGrids = this.exportMeta.subGrids;
    Object.entries(row.elements).forEach(([key, value]) => {
      subGrids[key].rows.push([value.outerHTML, row.offsetHeight]);
    });
  }

  buildPageHtml() {
    const me = this,
          {
      subGrids
    } = me.exportMeta; // Now when rows are collected, we need to add them to exported grid

    let html = me.prepareExportElement();
    Object.values(subGrids).forEach(({
      placeHolder,
      rows
    }) => {
      const placeHolderText = placeHolder.outerHTML;
      html = html.replace(placeHolderText, me.positionRows(rows).join(''));
    });
    return html;
  }

} // HACK: terser/obfuscator doesn't yet support async generators, when processing code it converts async generator to regular async
// function.

SinglePageExporter.prototype.pagesExtractor = async function* pagesExtractor(config) {
  // When we prepared grid we stretched it horizontally, now we need to gather all rows
  // There are two ways:
  // 1. set component height to scrollable.scrollHeight value to render all rows at once (maybe a bit more complex
  // if rows have variable height)
  // 2. iterate over rows, scrolling new portion into view once in a while
  // #1 sounds simpler, but that might require too much rendering, let's scroll rows instead
  const me = this,
        {
    client
  } = config,
        {
    rowManager,
    store
  } = client,
        styles = me.stylesheets,
        portrait = config.orientation === Orientation.portrait,
        paperFormat = PaperFormat[config.paperFormat],
        paperWidth = portrait ? paperFormat.width : paperFormat.height,
        paperHeight = portrait ? paperFormat.height : paperFormat.width,
        totalRows = config.rowsRange === RowsRange.visible && store.count // visibleRowCount is a projection of how much rows will fit the view, which should be
  // maximum amount of exported rows. and there can be less
  ? me.getVisibleRowsCount(client) : store.count;
  let {
    totalHeight,
    totalWidth
  } = me.exportMeta,
      processedRows = 0,
      lastDataIndex = -1,
      header,
      footer;

  if (rowManager.rows.length > 0) {
    if (config.rowsRange === RowsRange.visible) {
      lastDataIndex = rowManager.firstVisibleRow.dataIndex - 1;
    } // Collecting rows

    while (processedRows < totalRows) {
      const rows = rowManager.rows,
            lastRow = rows[rows.length - 1],
            lastProcessedRowIndex = processedRows;
      rows.forEach(row => {
        // When we are scrolling rows will be duplicated even with disabled buffers (e.g. when we are trying to
        // scroll last record into view). So we store last processed row dataIndex (which is always growing
        // sequence) and filter all rows with lower/same dataIndex
        if (row.dataIndex > lastDataIndex && processedRows < totalRows) {
          ++processedRows;
          totalHeight += row.offsetHeight;
          me.collectRow(row);
        }
      }); // Calculate new rows processed in this iteration e.g. to collect events

      const firstNewRowIndex = rows.findIndex(r => r.dataIndex === lastDataIndex + 1),
            lastNewRowIndex = firstNewRowIndex + (processedRows - lastProcessedRowIndex);
      await me.onRowsCollected(rows.slice(firstNewRowIndex, lastNewRowIndex), config);

      if (processedRows < totalRows) {
        lastDataIndex = lastRow.dataIndex;
        await me.scrollRowIntoView(client, lastDataIndex + 1);
      }
    }
  }

  const html = me.buildPageHtml(); // Calculate header height

  totalHeight += client.height - client.bodyHeight;
  const totalClientHeight = totalHeight; // Measure header and footer height

  if (config.headerTpl) {
    header = me.prepareHTML(config.headerTpl({
      totalWidth
    }));
    const height = me.measureElement(header);
    totalHeight += height;
  }

  if (config.footerTpl) {
    footer = me.prepareHTML(config.footerTpl({
      totalWidth
    }));
    const height = me.measureElement(footer);
    totalHeight += height;
  }

  const widthScale = Math.min(1, me.getScaleValue(me.inchToPx(paperWidth), totalWidth)),
        heightScale = Math.min(1, me.getScaleValue(me.inchToPx(paperHeight), totalHeight)),
        scale = Math.min(widthScale, heightScale); // Now add style to stretch grid vertically

  styles.push(`<style>
                #${client.id} {
                    height: ${totalClientHeight}px !important;
                    width: ${totalWidth}px !important;
                }
                .b-export-content {
                    ${me.centerContentHorizontally ? 'left: 50%;' : ''}
                    transform: scale(${scale}) ${me.centerContentHorizontally ? 'translateX(-50%)' : ''};
                    transform-origin: top left;
                    height: ${scale === 1 ? 'inherit' : 'auto !important'};
                }
            </style>`);

  if (BrowserHelper.isIE11) {
    styles.push(`<style>
                .b-export-body {
                   min-height: ${totalClientHeight}px !important;
                }
         </style>`);
  } // This is a single page exporter so we only yield one page

  yield {
    html: me.pageTpl({
      html,
      header,
      footer,
      styles,
      paperWidth,
      paperHeight
    })
  };
};

SinglePageExporter._$name = 'SinglePageExporter';

/**
 * @module Grid/feature/export/PdfExport
 */

/**
 * Generates PDF/PNG files from the Grid component.
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
 * const grid = new Grid({
 *     features : {
 *         pdfExport : {
 *             exportServer : 'http://localhost:8080' // Required
 *         }
 *     }
 * })
 *
 * // Opens popup allowing to customize export settings
 * grid.features.pdfExport.showExportDialog();
 *
 * // Simple export
 * grid.features.pdfExport.export({
 *     // Required, set list of column ids to export
 *     columns : grid.columns.map(c => c.id)
 * }).then(result => {
 *     // Response instance and response content in JSON
 *     let { response } = result;
 * });
 * ```
 *
 * ## Exporters
 *
 * There are three exporters available by default: `singlepage`, `multipage` and `multipagevertical`:
 *  * `singlepage` -  generates single page with content scaled to fit the provided {@link #config-paperFormat}
 *  * `multipage` - generates as many pages as required to fit all requested content, unscaled
 *  * `multipagevertical` - a combination of two above: it scales content horizontally to fit into page width and then
 *  puts overflowing content on vertical pages. Like a scroll.
 *
 * ## Loading resources
 *
 * If you face a problem with loading resources when exporting, the cause might be that the application and the export server are hosted on different servers.
 * This is due to [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS). There are 2 options how to handle this:
 * - Allow cross origin requests from the server where your export is hosted to the server where your application is hosted;
 * - Copy all resources keeping the folder hierarchy from the server where your application is hosted to the server where your export is hosted
 * and setup paths using {@link #config-translateURLsToAbsolute} config and configure the export server to give access to the path:
 *
 * ```javascript
 * const grid = new Grid({
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
 * @extends Core/mixin/InstancePlugin
 *
 * @demo Grid/export
 * @classtype pdfExport
 * @feature
 */

class PdfExport extends InstancePlugin {
  static get $name() {
    return 'PdfExport';
  }

  static get configurable() {
    return {
      dialogClass: ExportDialog,

      /**
       * URL of the print server.
       * @config {String}
       */
      exportServer: undefined,

      /**
       * Returns the instantiated export dialog widget as configured by {@link #config-exportDialog}
       * @member {Grid.view.export.ExportDialog} exportDialog
       */

      /**
       * A config object to apply to the {@link Grid.view.export.ExportDialog} widget.
       * @config {Object}
       */
      exportDialog: {
        value: true,
        $config: ['lazy']
      },

      /**
       * Name of the exported file.
       * @config {String}
       */
      fileName: null,

      /**
       * Format of the exported file, either `pdf` or `png`.
       * @config {String}
       * @default
       * @category Export file config
       */
      fileFormat: 'pdf',

      /**
       * Export server will navigate to this url first and then will change page content to whatever client sent.
       * This option is useful with react dev server, which uses a strict CORS policy.
       * @config {String}
       */
      clientURL: null,

      /**
       * Export paper format. Available options are A1...A5, Legal, Letter.
       * @config {String}
       * @default
       * @category Export file config
       */
      paperFormat: 'A4',

      /**
       * Orientation. Options are `portrait` and `landscape`.
       * @config {String}
       * @default
       * @category Export file config
       */
      orientation: 'portrait',

      /**
       * Specifies which rows to export. `all` for complete set of rows, `visible` for only rows currently visible.
       * @config {String}
       * @category Export file config
       */
      rowsRange: 'all',

      /**
       * Set to true to align row top to the page top on every exported page. Only applied to multipage export.
       * @config {Boolean}
       * @default
       */
      alignRows: false,

      /**
       * Set to true to show column headers on every page. This will also set {@link #config-alignRows} to true.
       * Only applies to MultiPageVertical exporter.
       * @config {Boolean}
       * @default
       */
      repeatHeader: false,

      /**
       * By default subGrid width is changed to fit all exported columns. To keep certain subGrid size specify it
       * in the following form:
       * ```
       * keepRegionSizes : {
       *     locked : true
       * }
       * ```
       * @config {Object}
       * @default
       */
      keepRegionSizes: null,

      /**
       * When exporting large views (hundreds of pages) stringified HTML may exceed browser or server request
       * length limit. This config allows to specify how many pages to send to server in one request.
       * @config {Number}
       * @default
       * @private
       */
      pagesPerRequest: 0,

      /**
       * Config for exporter.
       * @config {Object}
       * @private
       */
      exporterConfig: null,

      /**
       * Type of the exporter to use. Should be one of the configured {@link #config-exporters}
       * @config {String}
       * @default
       */
      exporterType: 'singlepage',

      /**
       * List of exporter classes to use in export feature
       * @config {Grid.feature.export.exporter.Exporter[]}
       * @default
       */
      exporters: [SinglePageExporter, MultiPageExporter, MultiPageVerticalExporter],

      /**
       * `True` to replace all linked CSS files URLs to absolute before passing HTML to the server.
       * When passing a string the current origin of the CSS files URLS will be replaced by the passed origin.
       *
       * For example: css files pointing to /app.css will be translated from current origin to {translateURLsToAbsolute}/app.css
       * @config {Boolean|String}
       * @default
       */
      translateURLsToAbsolute: true,

      /**
       * When true links are converted to absolute by combining current window location (with replaced origin) with
       * resource link.
       * When false links are converted by combining new origin with resource link (for angular)
       * @config {Boolean}
       * @default
       */
      keepPathName: true,

      /**
       * When true, page will attempt to download generated file.
       * @config {Boolean}
       * @default
       */
      openAfterExport: true,

      /**
       * Set to true to receive binary file from the server instead of download link.
       * @config {Boolean}
       * @default
       */
      sendAsBinary: false,

      /**
       * False to open in the current tab, true - in a new tab
       * @config {Boolean}
       * @default
       */
      openInNewTab: false,

      /**
       * A template function used to generate a page header. It is passed an object with ´currentPage´ and `totalPages´ properties.
       *
       * ```javascript
       * let grid = new Grid({
       *     appendTo   : 'container',
       *     features : {
       *         pdfExport : {
       *             exportServer : 'http://localhost:8080/',
       *             headerTpl : ({ currentPage, totalPages }) => `
       *                 <div class="demo-export-header">
       *                     <img src="coolcorp-logo.png"/>
       *                     <dl>
       *                         <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
       *                         <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
       *                     </dl>
       *                 </div>`
       *          }
       *     }
       * });
       * ```
       * @config {Function}
       */
      headerTpl: null,

      /**
       * A template function used to generate a page footer. It is passed an object with ´currentPage´ and `totalPages´ properties.
       *
       * ```javascript
       * let grid = new Grid({
       *      appendTo   : 'container',
       *      features : {
       *          pdfExport : {
       *              exportServer : 'http://localhost:8080/',
       *              footerTpl    : () => '<div class="demo-export-footer"><h3>© 2020 CoolCorp Inc</h3></div>'
       *          }
       *      }
       * });
       * ```
       * @config {Function}
       */
      footerTpl: null,

      /**
       * An object containing the Fetch options to pass to the export server request. Use this to control if credentials are sent
       * and other options, read more at [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).
       * @config {Object}
       */
      fetchOptions: null,

      /**
       * A message to be shown when Export feature is performing export.
       * @config {String}
       * @default "Generating pages..."
       */
      exportMask: 'L{Generating pages}',

      /**
       * A message to be shown when export is almost done.
       * @config {String}
       * @default "Waiting for response from server..."
       */
      exportProgressMask: 'L{Waiting for response from server}',

      /**
       * Set to false to not show Toast message on export error.
       * @config {Boolean}
       * @default
       */
      showErrorToast: true,
      localizableProperties: ['exportMask', 'exportProgressMask']
    };
  }

  doDestroy() {
    var _this$exportDialog;

    (_this$exportDialog = this.exportDialog) === null || _this$exportDialog === void 0 ? void 0 : _this$exportDialog.destroy();
    this.exportersMap.forEach(exporter => exporter.destroy());
    super.doDestroy();
  }
  /**
   * When export is started from GUI ({@link Grid.view.export.ExportDialog}), export promise can be accessed via
   * this property.
   * @property {Promise|null}
   */

  get currentExportPromise() {
    return this._currentExportPromise;
  }

  set currentExportPromise(value) {
    this._currentExportPromise = value;
  }

  get exportersMap() {
    return this._exportersMap || (this._exportersMap = new Map());
  }

  getExporter(config = {}) {
    const me = this,
          {
      exportersMap
    } = me,
          {
      type
    } = config;
    let exporter;

    if (exportersMap.has(type)) {
      exporter = exportersMap.get(type);
    } else {
      const exporterClass = this.exporters.find(cls => cls.type === type);

      if (!exporterClass) {
        throw new Error(`Exporter type ${type} is not found. Make sure you've configured it`);
      }

      config = ObjectHelper.clone(config);
      delete config.type;
      exporter = new exporterClass(config);
      exporter.relayAll(me);
      exportersMap.set(type, exporter);
    }

    return exporter;
  }

  buildRequest(pages, config) {
    return {
      html: JSON.stringify(pages),
      fileFormat: config.fileFormat,
      format: config.paperFormat,
      orientation: config.orientation
    };
  }

  buildExportConfig(config = {}) {
    const me = this,
          {
      client,
      exportServer,
      clientURL,
      fileFormat,
      fileName,
      paperFormat,
      rowsRange,
      alignRows,
      repeatHeader,
      keepRegionSizes,
      orientation,
      translateURLsToAbsolute,
      keepPathName,
      sendAsBinary,
      headerTpl,
      footerTpl
    } = me;

    if (!config.columns) {
      config.columns = client.columns.visibleColumns.filter(column => column.exportable).map(column => column.id);
    }

    const result = ObjectHelper.assign({
      client,
      exportServer,
      clientURL,
      fileFormat,
      paperFormat,
      rowsRange,
      alignRows,
      repeatHeader,
      keepRegionSizes,
      orientation,
      translateURLsToAbsolute,
      keepPathName,
      sendAsBinary,
      headerTpl,
      footerTpl,
      exporterType: me.exporterType,
      fileName: fileName || client.$$name
    }, config); // slice columns array to not modify it during export

    result.columns = config.columns.slice(); // Only vertical exporter is supported

    if (result.exporterType !== 'multipagevertical') {
      result.repeatHeader = false;
    } // Align rows by default

    if (!('alignRows' in config) && config.repeatHeader) {
      result.alignRows = true;
    } // Only change this setting if it is default (false) and not provided directly in config

    if (!('keepRegionSizes' in config) && !result.keepRegionSizes) {
      const collapsed = [],
            keepRegionSizes = {}; // If there's at least one collapsed region - lock other region sizes

      client.eachSubGrid(s => s.collapsed && collapsed.push(s.region));

      if (collapsed.length) {
        client.eachSubGrid(s => {
          if (!collapsed.includes(s.region)) {
            keepRegionSizes[s.region] = true;
          }
        });
        result.keepRegionSizes = keepRegionSizes;
      }
    }

    result.exporterConfig = ObjectHelper.assign({
      type: result.exporterType,
      translateURLsToAbsolute: result.translateURLsToAbsolute,
      keepPathName: result.keepPathName
    }, result.exporterConfig || {});
    delete result.exporterType;
    delete result.translateURLsToAbsolute;
    delete result.keepPathName;
    return result;
  }
  /**
   * Starts the export process. Accepts a config object which overrides any default configs.
   * **NOTE**. Component should not be interacted with when export is in progress
   *
   * @param {Object} config
   * @param {String[]} config.columns (required) List of column ids to export. E.g.
   *
   * ```javascript
   * grid.features.pdfExport.export({ columns : grid.columns.map(c => c.id) })
   * ```
   * @returns {Promise} Object of the following structure
   * ```
   * {
   *     response // Response instance
   * }
   * ```
   * @async
   */

  async export(config = {}) {
    const me = this,
          {
      client,
      pagesPerRequest
    } = me;
    config = me.buildExportConfig(config);
    let result;
    /**
     * Fires on the owning Grid before export started. Return `false` to cancel the export.
     * @event beforePdfExport
     * @preventable
     * @on-owner
     * @param {Object} config Export config
     */

    if (client.trigger('beforePdfExport', {
      config
    }) !== false) {
      // This mask should be always visible to protect grid from changes even if the mask message is not visible
      // due to the export dialog which is rendered above the grid's mask. The dialog has its own mask which shares the export message.
      client.mask(me.exportMask);

      try {
        const exporter = me.getExporter(config.exporterConfig);

        if (pagesPerRequest === 0) {
          const pages = await exporter.export(config);
          /**
           * Fires when export progress changes
           * @event exportStep
           * @param {Number} progress Current progress, 0-100
           * @param {String} text Optional text to show
           */

          me.trigger('exportStep', {
            progress: 90,
            text: me.exportProgressMask
          });
          const response = await me.receiveExportContent(pages, config);
          result = {
            response
          };
          await me.processExportContent(response, config);
        }
      } catch (error) {
        if (error instanceof Response) {
          result = {
            response: error
          };
        } else {
          result = {
            error
          };
        }

        throw error;
      } finally {
        if (!me.isDestroying) {
          var _me$exportDialog;

          (_me$exportDialog = me.exportDialog) === null || _me$exportDialog === void 0 ? void 0 : _me$exportDialog.close();
          client.unmask();

          if (me.showErrorToast) {
            if (result.error) {
              Toast.show({
                html: me.L('L{Export failed}'),
                rootElement: this.rootElement
              });
            } else if (!result.response.ok) {
              Toast.show({
                html: me.L('L{Server error}'),
                rootElement: this.rootElement
              });
            }
          }
          /**
           * Fires on the owning Grid when export has finished
           * @event pdfExport
           * @on-owner
           * @param {Response} [response] Optional response, if received
           * @param {Error} [error] Optional error, if exception occurred
           */

          client.trigger('pdfExport', result);
        }
      }
    }

    return result;
  }
  /**
   * Sends request to the export server and returns Response instance.
   * @param {Object[]} pages Array of exported pages.
   * @param {String} pages[].html pages HTML of the exported page.
   * @param {Object} config Export config
   * @param {String} config.exportServer URL of the export server.
   * @param {String} config.orientation Page orientation. portrait/landscape.
   * @param {String} config.paperFormat Paper format as supported by puppeteer. A4/A3/...
   * @param {String} config.fileFormat File format. PDF/PNG.
   * @param {String} config.fileName Name to use for the saved file.
   * @param {String} config.clientURL URL to navigate before export. See {@link #config-clientURL}.
   * @param {String} config.sendAsBinary Tells server whether to return binary file instead of download link.
   * @returns {Promise} Returns Response instance
   */

  async receiveExportContent(pages, config) {
    return AjaxHelper.post(config.exportServer, {
      html: pages,
      orientation: config.orientation,
      format: config.paperFormat,
      fileFormat: config.fileFormat,
      fileName: config.fileName,
      clientURL: config.clientURL,
      sendAsBinary: config.sendAsBinary
    }, Object.assign({
      credentials: 'omit'
    }, this.fetchOptions));
  }
  /**
   * Handles output of the {@link #function-receiveExportContent}. Server response can be of two different types depending
   * on {@link #config-sendAsBinary} config:
   * - `application/json` In this case JSON response contains url of the file to download
   * - `application/octet-stream` In this case response contains stream of file binary data
   *
   * If {@link #config-openAfterExport} is true, this method will try to download content.
   * @param {Response} response
   * @param {Object} config Export config
   * @param {String} config.exportServer URL of the export server.
   * @param {String} config.orientation Page orientation. portrait/landscape.
   * @param {String} config.paperFormat Paper format as supported by puppeteer. A4/A3/...
   * @param {String} config.fileFormat File format. PDF/PNG.
   * @param {String} config.fileName Name to use for the saved file.
   * @param {String} config.clientURL URL to navigate before export. See {@link #config-clientURL}.
   * @param {String} config.sendAsBinary Tells server whether to return binary file instead of download link. See {@link #config-sendAsBinary}
   * @returns {Promise}
   */

  async processExportContent(response, config) {
    const me = this;

    if (response.ok && me.openAfterExport) {
      // Clone Response to not block response stream
      response = response.clone();
      const contentType = response.headers.get('content-type');

      if (contentType.match(/application\/octet-stream/)) {
        const MIMEType = FileMIMEType[config.fileFormat],
              objectURL = await me.responseBlobToObjectURL(response, MIMEType),
              link = me.getDownloadLink(config.fileName, objectURL);
        link.click();
      } else if (contentType.match(/application\/json/)) {
        const responseJSON = await response.json();

        if (responseJSON.success) {
          const link = me.getDownloadLink(config.fileName, responseJSON.url);
          link.click();
        } else {
          Toast.show({
            html: responseJSON.msg,
            rootElement: this.rootElement
          });
        }
      }
    }
  }
  /**
   * Creates object URL from response content with given mimeType
   * @param {Response} response Response instance
   * @param {String} mimeType
   * @returns {Promise} Returns string object URL
   * @private
   */

  async responseBlobToObjectURL(response, mimeType) {
    const blob = await response.blob();
    return URL.createObjectURL(blob.slice(0, blob.size, mimeType));
  }
  /**
   * Creates link to download the file.
   * @param {String} name File name
   * @param {String} href URL of the resource
   * @returns HTMLAnchorElement
   * @private
   */

  getDownloadLink(name, href) {
    const link = document.createElement('a');
    link.download = name;
    link.href = href;

    if (this.openInNewTab) {
      link.target = '_blank';
    }

    return link;
  }

  get defaultExportDialogConfig() {
    return ObjectHelper.copyProperties({}, this, ['client', 'exporters', 'exporterType', 'orientation', 'fileFormat', 'paperFormat', 'alignRows', 'rowsRange', 'repeatHeader']);
  }

  changeExportDialog(exportDialog, oldExportDialog) {
    const me = this;
    oldExportDialog === null || oldExportDialog === void 0 ? void 0 : oldExportDialog.destroy();

    if (exportDialog) {
      const config = me.dialogClass.mergeConfigs({
        rootElement: me.rootElement,
        client: me.client,
        items: {
          rowsRangeField: {
            value: me.rowsRange
          },
          exporterTypeField: {
            value: me.exporterType
          },
          orientationField: {
            value: me.orientation
          },
          paperFormatField: {
            value: me.paperFormat
          },
          repeatHeaderField: {
            value: me.repeatHeader
          },
          fileFormatField: {
            value: me.fileFormat
          },
          alignRowsField: {
            checked: me.alignRows
          }
        }
      }, me.defaultExportDialogConfig, exportDialog);
      exportDialog = me.dialogClass.new(config);
      exportDialog.on({
        export: me.onExportButtonClick,
        thisObj: me
      });
    }

    return exportDialog;
  }
  /**
   * Shows {@link Grid.view.export.ExportDialog export dialog}
   * @async
   * @returns {Promise}
   */

  showExportDialog() {
    return this.exportDialog.show();
  }

  onExportButtonClick({
    values
  }) {
    const me = this;
    me.mask = new Mask({
      progress: 0,
      maxProgress: 100,
      text: me.exportMask,
      target: me.exportDialog.element
    });
    const detacher = me.on({
      exportstep({
        progress,
        text
      }) {
        me.mask.progress = progress;

        if (text != null) {
          me.mask.text = text;
        }
      }

    });
    me.currentExportPromise = me.export(values); // Clear current export promise

    me.currentExportPromise.then(() => {
      me.currentExportPromise = null;
      detacher();
      return me.mask.close();
    });
  }

}
PdfExport._$name = 'PdfExport';
GridFeatureManager.registerFeature(PdfExport, false, 'Grid'); // Format expected by export server
// const pageFormat = {
//     html       : '',
//     column     : 1,
//     number     : 1,
//     row        : 1,
//     rowsHeight : 1
// };
//
// const format = {
//     fileFormat  : 'pdf',
//     format      : 'A4',
//     orientation : 'portrait',
//     range       : 'complete',
//     html        : { array : JSON.stringify(pageFormat) }
// };

export { ExportDialog, ExportOrientationCombo, ExportRowsCombo, MultiPageExporter, MultiPageVerticalExporter, PdfExport, SinglePageExporter, Summary, SummaryFormatter };
//# sourceMappingURL=PdfExport.js.map
