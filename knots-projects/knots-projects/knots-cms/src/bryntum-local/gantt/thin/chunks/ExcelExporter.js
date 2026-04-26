/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { InstancePlugin, ObjectHelper, DomHelper, Base, DateHelper } from './Editor.js';
import { GridFeatureManager } from './GridBase.js';
import { SummaryFormatter } from './PdfExport.js';

/**
 * @module Grid/feature/GroupSummary
 */

/**
 * Displays a summary row as a group footer in a grouped grid. Uses same configuration options on columns as
 * {@link Grid.feature.Summary}.
 *
 * This feature is <strong>disabled</strong> by default.
 *
 * ```
 * features : {
 *     group        : 'city',
 *     groupSummary : true
 * }
 * ```
 *
 * @extends Core/mixin/InstancePlugin
 *
 * @demo Grid/groupsummary
 * @classtype groupSummary
 * @feature
 *
 * @inlineexample Grid/feature/GroupSummary.js
 */

class GroupSummary extends SummaryFormatter(InstancePlugin) {
  //region Init
  static get $name() {
    return 'GroupSummary';
  }

  static get configurable() {
    return {
      /**
       * Set to `true` to have group summaries rendered in the group header when a group is collapsed.
       *
       * Only applies when {@link #config-target} is `'footer'` (the default).
       *
       * @member {Boolean} collapseToHeader
       */

      /**
       * Configure as `true` to have group summaries rendered in the group header when a group is collapsed.
       *
       * ```javascript
       * const grid = new Grid({
       *    features : {
       *        groupSummary : {
       *            collapseToHeader : true
       *        }
       *    }
       * });
       * ```
       *
       * Only applies when {@link #config-target} is `'footer'` (the default).
       *
       * @config {Boolean}
       */
      collapseToHeader: null,

      /**
       * Where to render the group summaries to, either `header` to display them in the group header or `footer`
       * to display them in the group footer (the default).
       *
       * @member {String} target
       */

      /**
       * Where to render the group summaries to, either `header` to display them in the group header or `footer`
       * to display them in the group footer (the default).
       *
       * ```javascript
       * const grid = new Grid({
       *    features : {
       *        groupSummary : {
       *            target : 'header'
       *        }
       *    }
       * });
       * ```
       *
       * @config {String}
       * @default
       */
      target: 'footer'
    };
  }

  construct(grid, config) {
    this.grid = grid;
    super.construct(grid, config);

    if (!grid.features.group) {
      throw new Error('Requires Group feature to work, please enable');
    }

    this.bindStore(grid.store);
    grid.rowManager.on({
      beforeRenderRow: 'onBeforeRenderRow',
      renderCell: 'renderCell',
      // The feature gets to see cells being rendered after the Group feature
      // because the Group feature injects header content into group header rows
      // and adds rendering info to the cells renderData which we must comply with.
      // In particular, it calculates the isFirstColumn flag which it adds to
      // the cell renderData which we interrogate.
      prio: 1000,
      thisObj: this
    });
  }

  bindStore(store) {
    this.detachListeners('store');
    store.on({
      name: 'store',
      update: 'onStoreUpdate',
      // need to run before grids listener, to flag for full refresh
      prio: 1,
      thisObj: this
    });
  }

  get store() {
    return this.grid.store;
  }

  doDisable(disable) {
    // Toggle footers if needed
    this.updateTarget(this.target);
    super.doDisable(disable);
  }

  changeTarget(target) {
    ObjectHelper.assertString(target, 'target');
    return target;
  }

  updateTarget(target) {
    // Flag that will make the Store insert rows for group footers
    this.store.useGroupFooters = !this.disabled && target === 'footer'; // Refresh groups to show/hide footers

    if (!this.isConfiguring) {
      this.store.group();
    }
  }

  changeCollapseToHeader(collapseToHeader) {
    ObjectHelper.assertBoolean(collapseToHeader, 'collapseToHeader');
    return collapseToHeader;
  }

  updateCollapseToHeader() {
    if (!this.isConfiguring) {
      this.store.group();
    }
  } //endregion
  //region Plugin config
  // Plugin configuration. This plugin chains some of the functions in Grid.

  static get pluginConfig() {
    return {
      chain: ['bindStore']
    };
  } //endregion
  //region Render

  /**
   * Called before rendering row contents, used to reset rows no longer used as group summary rows
   * @private
   */

  onBeforeRenderRow({
    row,
    record
  }) {
    if (row.isGroupFooter && !('groupFooterFor' in record.meta)) {
      // not a group row.
      row.isGroupFooter = false; // force full "redraw" when rendering cells

      row.forceInnerHTML = true;
    } else if (row.isGroupHeader && !record.meta.collapsed) {
      // remove any summary elements
      row.eachElement(this.removeSummaryElements);
    }
  }

  removeSummaryElements(rowEl) {}
  /**
   * Called when a cell is rendered, styles the group rows first cell.
   * @private
   */

  renderCell({
    column,
    cellElement,
    row,
    record,
    size,
    isFirstColumn
  }) {
    const me = this,
          {
      meta
    } = record,
          {
      rowHeight
    } = me.grid,
          isGroupHeader = ('groupRowFor' in meta),
          isGroupFooter = ('groupFooterFor' in meta),
          targetsHeader = me.target === 'header',
          rowClasses = {
      'b-group-footer': 0,
      'b-header-summary': 0
    },
          isSummaryTarget = // Header cell should have summary content if we are targeting the header or if the group is collapsed
    // and we are configured with collapseToHeader, excluding the first column which holds the group title
    isGroupHeader && (targetsHeader || me.collapseToHeader && meta.collapsed) && !isFirstColumn || // Footer cell should have summary content if we are targeting the footer (wont render if collapsed)
    isGroupFooter && !targetsHeader; // Needed to restore height when summary is no longer displayed

    if (isGroupHeader || isGroupFooter) {
      size.height = rowHeight;
    }

    if (me.store.isGrouped && isSummaryTarget && !me.disabled) {
      // clear cell before add any HTML in it. if the cell contained widgets, they will be properly destroyed.
      column.clearCell(cellElement);
      const groupRecord = isGroupHeader ? record : meta.groupRecord;
      row.isGroupFooter = isGroupFooter;
      row.isGroupHeader = isGroupHeader; // This is a group footer row, add css

      if (isGroupFooter) {
        rowClasses['b-group-footer'] = 1;
      } // This is a group header row, add css
      else {
        rowClasses['b-header-summary'] = 1;
      } // returns height config or count. config format is { height, count }. where `height is in px and should be
      // added to value calculated from `count

      const heightSetting = me.updateSummaryHtml(cellElement, column, groupRecord),
            count = typeof heightSetting === 'number' ? heightSetting : heightSetting.count; // number of summaries returned, use to calculate cell height

      if (count > 1) {
        size.height += meta.collapsed && !targetsHeader ? 0 : count * rowHeight * 0.1;
      } // height config with height specified, added to cell height

      if (heightSetting.height) {
        size.height += heightSetting.height;
      }
    } // Sync row's classes with its status as a group header or footer.

    row.assignCls(rowClasses);
  }

  updateSummaryHtml(cellElement, column, groupRecord) {
    const records = groupRecord.groupChildren.slice(); // Group footers should not be included in summary calculations

    if (records[records.length - 1].isGroupFooter) {
      records.pop();
    }

    const html = this.generateHtml(column, records, 'b-grid-group-summary', groupRecord, groupRecord.meta.groupField, groupRecord.meta.groupRowFor); // First time, set table

    if (!cellElement.children.length) {
      cellElement.innerHTML = html;
    } // Following times, sync changes
    else {
      DomHelper.sync(html, cellElement.firstElementChild);
    } // return summary "count", used to set row height

    return column.summaries ? column.summaries.length : column.sum ? 1 : 0;
  } //endregion
  //region Events

  /**
   * Updates summaries on store changes (except record update, handled below)
   * @private
   */

  onStoreUpdate({
    source: store,
    changes
  }) {
    if (!this.disabled && store.isGrouped) {
      // If a grouping field is among the changes, StoreGroup#onDataChanged will
      // take care of the update by re-sorting.
      if (changes && store.groupers.find(grouper => grouper.field in changes)) {
        return;
      } // only update summary when a field that affects summary is changed
      // TODO: this should maybe be removed, another column might depend on the value for its summary?

      const shouldUpdate = Object.keys(changes).some(field => {
        const colField = this.grid.columns.get(field); // check existence, since a field not used in a column might have changed

        return Boolean(colField) && (Boolean(colField.sum) || Boolean(colField.summaries));
      });

      if (shouldUpdate) {
        this.grid.forceFullRefresh = true;
      }
    }
  } //endregion

  /**
   * Refreshes the summaries
   */

  refresh() {
    this.grid.columns.visibleColumns.forEach(column => {
      if (this.hasSummary(column)) {
        this.grid.refreshColumn(column);
      }
    });
  }

  hasSummary(column) {
    return column.sum || column.summaries;
  }

}
GroupSummary.featureClass = 'b-group-summary';
GroupSummary._$name = 'GroupSummary';
GridFeatureManager.registerFeature(GroupSummary);

/**
 * @module Grid/util/TableExporter
 */

/**
 * This class transforms grid component into two arrays: rows and columns. Columns array contains objects with
 * meta information about column: field name, column name, width and type of the rendered value, rows array contains
 * arrays of cell values.
 *
 * ```javascript
 * const exporter = new TableExporter({ target : grid });
 * exporter.export()
 *
 * // Output
 * {
 *     columns : [
 *         { field : 'name',     value : 'First name', type : 'string',  width : 100 },
 *         { field : 'surname',  value : 'Last name',  type : 'string',  width : 100 },
 *         { field : 'age',      value : 'Age',        type : 'number',  width : 50  },
 *         { field : 'married',  value : 'Married',    type : 'boolean', width : 50  },
 *         { field : 'children', value : 'Children',   type : 'object',  width : 100 }
 *     ],
 *     rows : [
 *         ['Michael', 'Scott',   40, false, []],
 *         ['Jim',     'Halpert', 30, true,  [...]]
 *     ]
 * }
 * ```
 *
 * ## How data is exported
 *
 * Exporter iterates over store records and processes each record for each column being exported. Exporter uses same
 * approach to retrieve data as column: reading record field, configured on the column, or calling renderer function
 * if one is provided. This means data can be of any type: primitives or objects. So children array in the above code
 * snippet may contain instances of child record class.
 *
 * ## Column renderers
 *
 * Column renderers are commonly used to style the cell, or even render more HTML into it, like {@link Grid.column.WidgetColumn}
 * does. This is not applicable in case of export. Also, given grid uses virtual rendering (only renders visible rows) and
 * exporter iterates over all records, not just visible ones, we cannot provide all data necessary to the renderer. Some
 * arguments, like cellElement and row, wouldn't exist. Thus renderer is called with as much data we have: value,
 * record, column, grid, other {@link Grid.column.Column#config-renderer documented arguments} would be undefined.
 *
 * Exporter adds one more flag for renderer function: isExport. When renderer receives this flag it knows
 * data is being exported and can skip DOM work to return simpler value. Below snippet shows simplified code of the
 * widget column handling export:
 *
 * ```javascript
 * renderer({ isExport }) {
 *     if (isExport) {
 *         return null;
 *     }
 *     else {
 *         // widget rendering routine
 *         ...
 *     }
 * }
 * ```
 *
 * ## Column types
 *
 * Column types are not actually a complete list of JavaScript types (you can get actual type of the cell using typeof) it
 * is a simple and helpful meta information.
 *
 * Available column types are:
 *  * string
 *  * number
 *  * boolean
 *  * date
 *  * object
 *
 * Everything which is not primitive like string/number/bool (or a date) is considered an object. This includes null, undefined,
 * arrays, classes, functions etc.
 *
 * ## Getting column type
 *
 * If existing grid column is used, column type first would be checked with {@link Grid.column.Column#config-exportedType exportedType}
 * config. If exportedType is undefined or column does not exist in grid, type is read from a record field definition.
 * If the field is not defined, object type is used.
 *
 * Configuring exported type:
 *
 * ```javascript
 * new Grid({
 *     columns : [
 *         {
 *             name         : 'Name',
 *             field        : 'name',
 *             exportedType : 'object',
 *             renderer     : ({ value, isExport }) => {
 *                 if (isExport) {
 *                     return { value }; // return value wrapped into object
 *                 }
 *             }
 *     ]
 * })
 * ```
 *
 * @extends Core/Base
 */

class TableExporter extends Base {
  static get defaultConfig() {
    return {
      /**
       * Target grid instance to export data from
       * @config {Grid.view.Grid} target
       */
      target: null,

      /**
       * Specifies a default column width if no width specified
       * @config {Number} defaultColumnWidth
       * @default
       */
      defaultColumnWidth: 100,

      /**
       * Set to false to export date as it is displayed by Date column formatter
       * @config {Boolean}
       * @default
       */
      exportDateAsInstance: true,

      /**
       * If true and the grid is grouped, shows the grouped value in the first column. True by default.
       * @config {Boolean} showGroupHeader
       * @default
       */
      showGroupHeader: true,

      /**
       * An array of columns configuration used to specify columns width, headers name, and column fields to get the data from.
       * 'field' config is required. If 'text' is missing, it will try to get it retrieved from the grid column or the 'field' config.
       * If 'width' is missing, it will try to get it retrieved from the grid column or {@link #config-defaultColumnWidth} config.
       * If no columns provided the config will be generated from the grid columns.
       *
       * For example:
       * ```javascript
       * columns : [
       *     'firstName', // field
       *     'age', // field
       *     { text : 'Starts', field : 'start', width : 140 },
       *     { text : 'Ends', field : 'finish', width : 140 }
       * ]
       * ```
       *
       * @config {String[]|Object[]} columns
       * @default
       */
      columns: null,

      /**
       * When true and tree is being exported, node names are indented with {@link #config-indentationSymbol}
       * @config {Boolean}
       * @default
       */
      indent: true,

      /**
       * This symbol (four spaces by default) is used to indent node names when {@link #config-indent} is true
       * @config {String}
       * @default
       */
      indentationSymbol: '\u00A0\u00A0\u00A0\u00A0'
    };
  }
  /**
   * Exports grid data according to provided config
   * @param {Object} config
   * @returns {{ rows : Object[][], columns : Object[] }}
   */

  export(config = {}) {
    const me = this;
    config = ObjectHelper.assign({}, me.config, config);
    me.normalizeColumns(config);
    return me.generateExportData(config);
  }

  generateExportData(config) {
    const me = this,
          columns = me.generateColumns(config),
          rows = me.generateRows(config);
    return {
      rows,
      columns
    };
  }

  normalizeColumns(config) {
    // In case columns are provided we need to use normalized config. If those are not provided, we are going
    // to use real columns, possible invoking renderers (we need to pass column instance to the renderer to
    // avoid breaking API too much)
    const columns = config.columns || this.target.columns.visibleColumns.filter(rec => rec.exportable !== false);
    config.columns = columns.map(col => {
      if (typeof col === 'string') {
        return this.target.columns.find(column => column.field === col) || {
          field: col
        };
      } else {
        return col;
      }
    });
  }

  generateColumns(config) {
    return config.columns.map(col => this.processColumn(col, config));
  }

  generateRows(config) {
    const {
      columns
    } = config;

    if (!columns.length) {
      return [];
    }

    const me = this,
          {
      target
    } = me;
    return target.store // although columns are taken from config, it is convenient to provide them as a separate argument
    // because that allows to override set of columns to process
    .map(record => me.processRecord(record, columns, config)) // filter out empty rows
    .filter(cells => cells === null || cells === void 0 ? void 0 : cells.length);
  }

  getColumnType(column, store = this.target.store) {
    let result = column.exportedType || 'object';

    if (column.exportedType === undefined) {
      if (column.field) {
        const fieldDefinition = store.modelClass.getFieldDefinition(column.field);

        if (fieldDefinition && fieldDefinition.type !== 'auto') {
          result = fieldDefinition.type;
        }
      }
    }

    return result;
  }
  /**
   * Extracts export data from the column instance
   * @param {Grid.column.Column} column
   * @param {Object} config
   * @private
   * @returns {Object}
   */

  processColumn(column, config) {
    const me = this,
          {
      target
    } = me,
          {
      defaultColumnWidth
    } = config;
    let {
      field,
      text: value,
      width,
      minWidth
    } = column; // If column is not configured with field, field is generated (see Column.js around line 514).
    // In export we want empty string there

    if (!(field in target.store.modelClass.fieldMap)) {
      field = '';
    } // If name or width is missing try to retrieve them from the grid column and the field, or use default values.

    if (!value || !width) {
      const gridColumn = target.columns.find(col => col.field === field);

      if (!value) {
        value = gridColumn && gridColumn.text || field;
      } // null or undefined

      if (width == null) {
        width = gridColumn && gridColumn.width || defaultColumnWidth;
      }
    }

    width = Math.max(width || defaultColumnWidth, minWidth || defaultColumnWidth);
    return {
      field,
      value,
      width,
      type: me.getColumnType(column)
    };
  }
  /**
   * Extracts export data from the record instance reading supplied column configs
   * @param {Core.data.Model|null} record If null is passed, all columns will be filled with empty strings
   * @param {Grid.column.Column[]} columns
   * @param {Object} config
   * @private
   * @returns {Object[]}
   */

  processRecord(record, columns, config) {
    const {
      target
    } = this,
          {
      showGroupHeader,
      indent,
      indentationSymbol
    } = config;
    let cells;

    if (!record) {
      cells = columns.map(() => '');
    } else if (record.isSpecialRow) {
      if (showGroupHeader && record.meta.groupRowFor) {
        cells = columns.map(column => {
          return target.features.group.buildGroupHeader({
            // Create dummy element to get html from
            cellElement: DomHelper.createElement(),
            grid: target,
            record,
            column
          });
        });
      }
    } else {
      cells = columns.map(column => {
        var _column$field;

        let value = (_column$field = column.field) !== null && _column$field !== void 0 && _column$field.includes('.') ? record.get(column.field) : record[column.field],
            useRenderer = column.renderer || column.defaultRenderer;

        if (useRenderer && !(value && column.isDateColumn && config.exportDateAsInstance)) {
          value = useRenderer.call(column, {
            value,
            record,
            column,
            grid: target,
            isExport: true
          });
        }

        if (indent && column.tree) {
          value = `${indentationSymbol.repeat(record.childLevel)}${value}`;
        }

        return value;
      });
    }

    return cells;
  }

}
TableExporter._$name = 'TableExporter';

class BooleanUnicodeSymbol {
  constructor(value) {
    this._value = value;
  }

  get value() {
    return this._value;
  }

  toString() {
    return Boolean(this.value) ? '✓' : '';
  }

}
BooleanUnicodeSymbol._$name = 'BooleanUnicodeSymbol';

/**
 * @module Grid/feature/experimental/ExcelExporter
 */

/**
 * **NOTE**: This class requires a 3rd party library to operate.
 *
 * A feature that allows exporting Grid data to Excel without involving the server. It uses {@link Grid.util.TableExporter}
 * class as data provider, [zipcelx library](https://www.npmjs.com/package/zipcelx)
 * forked and adjusted to support [column width config](https://github.com/bryntum/zipcelx/tree/column-width-build)
 * and [Microsoft XML specification](https://msdn.microsoft.com/en-us/library/office/documentformat.openxml.spreadsheet.aspx).
 * Zipcelx should be either in global scope (window) or can be provided with {@link #config-zipcelx} config.
 *
 * ```
 * // Global scope
 * <script src="zipcelx.js"></script>
 *
 * // importing from package
 * import zipcelx from 'zipcelx';
 *
 * const grid = new Grid({
 *     features : {
 *         excelExporter : {
 *             zipcelx
 *         }
 *     }
 * })
 * ```
 *
 * Here is an example of how to add the feature:
 *
 * ```javascript
 * const grid = new Grid({
 *     features : {
 *         excelExporter : {
 *             // Choose the date format for date fields
 *             dateFormat : 'YYYY-MM-DD HH:mm',
 *
 *             exporterConfig : {
 *                 // Choose the columns to include in the exported file
 *                 columns : ['name', 'role']
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * And how to call it:
 *
 * ```javascript
 * grid.features.excelExporter.export({
 *     filename : 'Export',
 *     exporterConfig : {
 *         columns : [
 *             { text : 'First Name', field : 'firstName', width : 90 },
 *             { text : 'Age', field : 'age', width : 40 },
 *             { text : 'Starts', field : 'start', width : 140 },
 *             { text : 'Ends', field : 'finish', width : 140 }
 *         ]
 *     }
 * })
 * ```
 *
 * @extends Core/mixin/InstancePlugin
 * @demo Grid/exporttoexcel
 * @classtype excelExporter
 * @feature
 */

class ExcelExporter extends InstancePlugin {
  static get $name() {
    return 'ExcelExporter';
  }

  static get defaultConfig() {
    return {
      /**
       * Name of the exported file
       * @config {String} filename
       * @default
       */
      filename: null,

      /**
       * Defines how date in a cell will be formatted
       * @config {String} dateFormat
       * @default
       */
      dateFormat: 'YYYY-MM-DD',

      /**
       * Exporter class to use as a data provider. {@link Grid.util.TableExporter} by default.
       * @config {Grid.util.TableExporter}
       * @typings {typeof TableExporter}
       * @default
       */
      exporterClass: TableExporter,

      /**
       * Configuration object for {@link #config-exporterClass exporter class}.
       * @config {Object}
       */
      exporterConfig: null,

      /**
       * Reference to zipcelx library. If not provided, exporter will look in the global scope.
       * @config {Object}
       */
      zipcelx: null,

      /**
       * If this config is true, exporter will convert all empty values to ''. Empty values are:
       * * undefined, null, NaN
       * * Objects/class instances that do not have toString method defined and are stringified to [object Object]
       * * functions
       * @config {Boolean}
       */
      convertEmptyValueToEmptyString: true
    };
  }

  processValue(value) {
    if (value === undefined || value === null || Number.isNaN(value) || typeof value === 'function' || typeof value === 'object' && String(value) === '[object Object]') {
      return '';
    } else {
      return value;
    }
  }

  generateExportData(config) {
    const me = this,
          {
      rows,
      columns
    } = me.exporter.export(config.exporterConfig);
    return {
      rows: rows.map(row => {
        return row.map((value, index) => {
          var _columns$index;

          if (value instanceof Date) {
            value = DateHelper.format(value, config.dateFormat);
          } else if (typeof value === 'boolean') {
            value = new BooleanUnicodeSymbol(value);
          }

          if (me.convertEmptyValueToEmptyString) {
            value = me.processValue(value);
          }

          const type = ((_columns$index = columns[index]) === null || _columns$index === void 0 ? void 0 : _columns$index.type) === 'number' ? 'number' : 'string';
          return {
            value,
            type
          };
        });
      }),
      columns: columns.map(col => {
        let {
          field,
          value,
          width,
          type
        } = col; // when number column is exported with zipcelx, excel warns that sheet is broken and asks for repair
        // repair works, but having error on open doesn't look acceptable
        // type = type === 'number' ? 'number' : 'string';

        type = 'string';
        return {
          field,
          value,
          width,
          type
        };
      })
    };
  }
  /**
   * Generate and download a .xslx file.
   * @param {Object} config Optional configuration object, which overrides initial settings of the feature/exporter.
   * @returns {Promise} Promise that resolves when the export is completed
   */

  export(config = {}) {
    const me = this,
          zipcelx = me.zipcelx || globalThis.zipcelx;

    if (!zipcelx) {
      throw new Error('ExcelExporter: "zipcelx" library is required');
    }

    if (me.disabled) {
      return;
    }

    config = ObjectHelper.assign({}, me.config, config);

    if (!config.filename) {
      config.filename = me.client.$$name;
    }

    const {
      filename
    } = config,
          {
      rows,
      columns
    } = me.generateExportData(config);
    return zipcelx({
      filename,
      sheet: {
        data: [columns].concat(rows),
        cols: columns
      }
    });
  }

  construct(grid, config) {
    super.construct(grid, config);

    if (!this.zipcelx) {
      if (typeof zipcelx !== 'undefined') {
        this.zipcelx = globalThis.zipcelx;
      }
    }
  }

  get exporter() {
    const me = this;
    return me._exporter || (me._exporter = me.exporterClass.new({
      target: me.client
    }, me.exporterConfig));
  }

}
ExcelExporter._$name = 'ExcelExporter';
GridFeatureManager.registerFeature(ExcelExporter, false, 'Grid');

export { ExcelExporter, GroupSummary, TableExporter };
//# sourceMappingURL=ExcelExporter.js.map
