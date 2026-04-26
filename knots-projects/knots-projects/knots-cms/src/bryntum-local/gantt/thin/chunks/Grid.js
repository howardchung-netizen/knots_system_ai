/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { GridFeatureManager, GridBase } from './GridBase.js';
import { Delayable, InstancePlugin, KeyMap } from './Editor.js';

const storeListenerName = 'store';
/**
 * @module Grid/feature/ColumnAutoWidth
 */

/**
 * Enables the {@link Grid.column.Column#config-autoWidth} config for a grid's columns.
 *
 * This feature is <strong>enabled</strong> by default.
 *
 * @extends Core/mixin/InstancePlugin
 * @mixes Core/mixin/Delayable
 * @classtype columnAutoWidth
 * @feature
 */

class ColumnAutoWidth extends Delayable(InstancePlugin) {
  static get $name() {
    return 'ColumnAutoWidth';
  } //region Config

  static get configurable() {
    return {
      /**
       * The default `autoWidth` option for columns with `autoWidth: true`. This can
       * be a single number for the minimum column width, or an array of two numbers
       * for the `[minWidth, maxWidth]`.
       * @config {Number|Number[]}
       */
      default: null,

      /**
       * The amount of time (in milliseconds) to delay after a store modification
       * before synchronizing `autoWidth` columns.
       * @config {Number}
       * @default
       */
      delay: 0
    };
  } //endregion
  //region Internals

  static get pluginConfig() {
    return {
      after: {
        bindStore: 'bindStore',
        unbindStore: 'unbindStore',
        renderRows: 'syncAutoWidthColumns',
        onInternalResize: 'onInternalResize'
      },
      assign: ['columnAutoWidthPending', 'syncAutoWidthColumns']
    };
  }

  construct(config) {
    super.construct(config);
    const {
      client: grid
    } = this,
          {
      store
    } = grid; // The initial bindStore can come super early such that our hooks won't catch it:

    if (store) {
      this.bindStore(store);
    }
  }

  doDestroy() {
    this.unbindStore();
    super.doDestroy();
  }

  bindStore(store) {
    this.lastSync = null;
    store.on({
      name: storeListenerName,
      [`change${this.client.asyncEventSuffix}`]: 'onStoreChange'
    }, this);
  }

  unbindStore() {
    this.detachListeners(storeListenerName);
  }

  get columnAutoWidthPending() {
    return this.lastSync === null || this.hasTimeout('syncAutoWidthColumns');
  }

  onStoreChange({
    action
  }) {
    if (action !== 'move') {
      var _me$client$features$c;

      const me = this;
      ++me.storeGeneration; // If we are editing, sync right away so cell editing can align correctly to next cell

      if ((_me$client$features$c = me.client.features.cellEdit) !== null && _me$client$features$c !== void 0 && _me$client$features$c.isEditing) {
        me.syncAutoWidthColumns();
      } else if (!me.hasTimeout('syncAutoWidthColumns')) {
        me.setTimeout('syncAutoWidthColumns', me.delay);
      }
    }
  } // Handle scenario with Grid being inside DIV with display none, and no width. Sync column widths after being shown

  onInternalResize(element, newWidth, newHeight, oldWidth) {
    if (oldWidth === 0) {
      // Force remeasure after we get a width
      this.lastSync = null;
      this.syncAutoWidthColumns();
    }
  }

  syncAutoWidthColumns() {
    const me = this,
          grid = me.client,
          storeGeneration = me.storeGeneration;

    if (me.lastSync !== storeGeneration) {
      me.lastSync = storeGeneration;
      let autoWidth, resizingColumns;

      for (const column of grid.columns.visibleColumns) {
        autoWidth = column.autoWidth;

        if (autoWidth) {
          if (autoWidth === true) {
            autoWidth = me.default;
          }

          grid.resizingColumns = resizingColumns = true;
          column.resizeToFitContent(autoWidth);
        }
      }

      if (resizingColumns) {
        grid.resizingColumns = false;
        grid.afterColumnsResized();
      }
    }

    if (me.hasTimeout('syncAutoWidthColumns')) {
      me.clearTimeout('syncAutoWidthColumns');
    }
  } //endregion

}
ColumnAutoWidth.prototype.storeGeneration = 0;
ColumnAutoWidth._$name = 'ColumnAutoWidth';
GridFeatureManager.registerFeature(ColumnAutoWidth, true);

/**
 * @module Grid/feature/RowCopyPaste
 */

/**
 * Allow using [Ctrl/CMD + C/X] and [Ctrl/CMD + V] to copy/cut and paste rows. You can configure how a newly pasted record
 * is named using {@link #function-generateNewName}
 *
 * This feature is **enabled** by default
 *
 * ```javascript
 * const grid = new Grid({
 *     features : {
 *         rowCopyPaste : true
 *     }
 * });
 * ```
 *
 * ## Keyboard shortcuts
 *
 * By default, this feature will react to Ctrl+C, Ctrl+X and Ctrl+V for standard clipboard actions.
 * You can reconfigure the keys used to trigger these actions, see {@link #config-keyMap} for more details.
 *
 *
 * @extends Core/mixin/InstancePlugin
 * @inlineexample Grid/feature/RowCopyPaste.js
 * @classtype rowCopyPaste
 * @feature
 */

class RowCopyPaste extends InstancePlugin.mixin(KeyMap) {
  static get $name() {
    return 'RowCopyPaste';
  }

  static get type() {
    return 'rowCopyPaste';
  }

  static get pluginConfig() {
    return {
      assign: ['copyRows', 'pasteRows'],
      chain: ['onElementKeyDown', 'populateCellMenu']
    };
  }

  static get properties() {
    return {
      clipboardRecords: []
    };
  }

  static get configurable() {
    return {
      /**
       * The field to use as the name field when updating the name of copied records
       * @config {String}
       * @default
       */
      nameField: 'name',

      /**
       * The feature has the following default key mappings during editing:
       *
       * | Keys        | Action       |
       * |-------------|--------------|
       * | Ctrl+C      | copy         |
       * | Ctrl+X      | cut          |
       * | Ctrl+V      | paste        |
       *
       * You can supply your own key map if you want to change any mapping, or set it to `null` to disable all keyboard
       * shortcuts.
       *
       * ```javascript
       * const grid = new Grid({
       *    features : {
       *        rowCopyPaste : {
       *            keyMap : {
       *                // disable cut via keyboard
       *                'Ctrl-X' : null
       *            }
       *        }
       *    }
       * });
       * ```
       *
       * @config {Object}
       */
      keyMap: {
        'Ctrl+C': 'copy',
        'Ctrl+X': 'cut',
        'Ctrl+V': 'paste'
      },
      copyRecordText: 'L{copyRecord}',
      cutRecordText: 'L{cutRecord}',
      pasteRecordText: 'L{pasteRecord}',
      localizableProperties: ['copyRecordText', 'cutRecordText', 'pasteRecordText']
    };
  }

  construct(grid, config) {
    super.construct(grid, config);
    grid.rowManager.on({
      beforeRenderRow: 'onBeforeRenderRow',
      thisObj: this
    });
    this.grid = grid;
  }

  onBeforeRenderRow({
    row,
    record
  }) {
    row.cls['b-cut-row'] = this._isCut && this.clipboardRecords.includes(record);
  }

  onElementKeyDown({
    ctrlKey,
    target,
    key
  }) {
    const me = this,
          cellEdit = me.grid.features.cellEdit; // No action if
    // 1. there is selected text on the page
    // 2. cell editing is active
    // 3. cursor is not in the grid (filter bar etc)

    if (!me.disabled && globalThis.getSelection().toString().length === 0 && (!cellEdit || !cellEdit.isEditing) && target.closest('.b-grid-body-container')) {
      me.performKeyMapAction(...arguments);
    }
  }

  copy() {
    this.copyRows();
  }

  cut() {
    this.copyRows(true);
  }

  paste() {
    this.pasteRows();
  }
  /**
   * Copy or cut rows to clipboard to paste later
   *
   * @fires beforeCopy
   * @param {Boolean} [isCut] Copies by default, pass `true` to cut
   * @category Common
   * @on-owner
   */

  copyRows(isCut = false) {
    const me = this,
          {
      client
    } = me,
          // Dont cut readOnly records
    records = client.selectedRecords.filter(r => !r.readOnly || !isCut);
    /**
     * Fires on the owning Grid before a copy action is performed, return `false` to prevent the action
     * @event beforeCopy
     * @preventable
     * @on-owner
     * @param {Grid.view.Grid} source Owner grid
     * @param {Core.data.Model[]} records The records about to be copied
     * @param {Boolean} isCut `true` if this is a cut action
     */

    if (!records.length || client.readOnly || client.trigger('beforeCopy', {
      records,
      isCut
    }) === false) {
      return;
    }

    me._isCut = isCut;
    me.clipboardRecords.forEach(rec => {
      var _client$rowManager$ge;

      return (_client$rowManager$ge = client.rowManager.getRowById(rec)) === null || _client$rowManager$ge === void 0 ? void 0 : _client$rowManager$ge.removeCls('b-cut-row');
    });
    me.clipboardRecords = client.selectedRecords.slice();
    client.store.forEach(rec => {
      rec.meta.isCut = me._isCut && me.clipboardRecords.includes(rec);
    }); // refresh to call reapply the cls for records where the cut was canceled

    client.selectedRecords.forEach(record => this.onRowCutOrCopy(record, isCut));
  }

  onRowCutOrCopy(record, isCut) {
    var _this$client$rowManag;

    (_this$client$rowManag = this.client.rowManager.getRowById(record)) === null || _this$client$rowManag === void 0 ? void 0 : _this$client$rowManag.toggleCls('b-cut-row', isCut);
  }
  /**
   * Paste rows above selected or passed record
   *
   * @fires beforePaste
   * @param {Core.data.Model} [record] Paste above this record, or currently selected record if left out
   * @category Common
   * @on-owner
   */

  pasteRows(record) {
    const me = this,
          records = me.clipboardRecords,
          {
      client
    } = me,
          referenceRecord = record || client.selectedRecord;
    /**
     * Fires on the owning Grid before a paste action is performed, return `false` to prevent the action
     * @event beforePaste
     * @preventable
     * @on-owner
     * @param {Grid.view.Grid} source Owner grid
     * @param {Core.data.Model} referenceRecord The reference record, the clipboard event records will
     * be pasted above this record
     * @param {Core.data.Model[]} records The records about to be pasted
     * @param {Boolean} isCut `true` if this is a cut action
     */

    if (client.readOnly || client.isTreeGrouped || !records.length || client.trigger('beforePaste', {
      records,
      referenceRecord,
      isCut: me._isCut
    }) === false) {
      return [];
    } // sort selected to move records to make sure it will be added in correct order independent of how it was selected.
    // Should be done with real records in the clipboard, after records are copied, all indexes will be changed

    me.sortByIndex(records);
    const recordsToProcess = records.map(rec => {
      if (me._isCut) {
        // reset record cut state
        rec.meta.isCut = false;
      } else {
        rec = rec.copy();
        rec[me.nameField] = me.generateNewName(rec);
      }

      return rec;
    });

    if (me._isCut) {
      client.store.move(recordsToProcess, referenceRecord); // reset clipboard

      me.clearClipboard();
    } else {
      me.insertCopiedRecords(referenceRecord, recordsToProcess);
      client.selectedRecords = recordsToProcess;
    }

    return recordsToProcess;
  }

  clearClipboard() {
    this.clipboardRecords.forEach(rec => {
      var _this$client$rowManag2;

      return (_this$client$rowManag2 = this.client.rowManager.getRowById(rec)) === null || _this$client$rowManag2 === void 0 ? void 0 : _this$client$rowManag2.removeCls('b-cut-row');
    });
    this._isCut = false;
    this.clipboardRecords = [];
  }
  /**
   * A method used to generate the name for a copy-pasted record. By defaults appends "- 2", "- 3" as a suffix. Override
   * it to provide your own naming of pasted records.
   *
   * @param {Core.data.Model} record The new record being pasted
   * @return {String}
   */

  generateNewName(record) {
    const originalName = record[this.nameField];
    let counter = 2;

    while (this.client.store.findRecord(this.nameField, `${originalName} - ${counter}`)) {
      counter++;
    }

    return `${originalName} - ${counter}`;
  }

  insertCopiedRecords(recordReference, toInsert) {
    const {
      store
    } = this.client;

    if (store.tree) {
      return recordReference.parent.insertChild(toInsert, recordReference.nextSibling);
    } else {
      const idxPaste = store.indexOf(recordReference);
      return store.insert(idxPaste + 1, toInsert);
    }
  }

  populateCellMenu({
    record,
    items
  }) {
    const me = this;

    if (!me.client.readOnly && !me.client.isTreeGrouped && record && !record.isSpecialRow) {
      items.cut = {
        text: me.cutRecordText,
        localeClass: me,
        cls: 'b-separator',
        icon: 'b-icon b-icon-cut',
        weight: 110,
        disabled: record.readOnly,
        onItem: () => me.copyRows(true)
      };
      items.copy = {
        text: me.copyRecordText,
        localeClass: me,
        icon: 'b-icon b-icon-copy',
        weight: 120,
        onItem: () => me.copyRows()
      };

      if (me.clipboardRecords.length) {
        items.paste = {
          text: me.pasteRecordText,
          localeClass: me,
          icon: 'b-icon b-icon-paste',
          weight: 130,
          onItem: () => me.pasteRows(record)
        };
      }
    }
  }
  /**
   * Sort array of records ASC by its indexes stored in indexPath
   * @param {Core.data.Model[]} array array to sort
   * @private
   */

  sortByIndex(array) {
    return array.sort((rec1, rec2) => {
      const idx1 = rec1.indexPath,
            idx2 = rec2.indexPath;

      for (let i = 0; i <= idx1.length; i++) {
        if (idx1[i] < idx2[i]) {
          return -1;
        }

        if (idx1[i] > idx2[i]) {
          return 1;
        }
      }
    });
  }

}
RowCopyPaste.featureClass = 'b-row-copypaste';
RowCopyPaste._$name = 'RowCopyPaste';
GridFeatureManager.registerFeature(RowCopyPaste, true, 'Grid');
GridFeatureManager.registerFeature(RowCopyPaste, false, 'Gantt');
GridFeatureManager.registerFeature(RowCopyPaste, false, 'SchedulerPro');
GridFeatureManager.registerFeature(RowCopyPaste, false, 'ResourceHistogram');

//region Import

/**
 * @module Grid/view/Grid
 */

/**
 * The Grid component is a very powerful and performant UI component that shows tabular data (or tree data using the {@link Grid.view.TreeGrid}).
 *
 * <h2>Intro</h2>
 * The Grid widget has a wide range of features and a large API to allow users to work with data efficiently in the browser. The two
 * most important configs are {@link #config-store} and {@link #config-columns}. With the store config, you decide which data to load into the grid.
 * You can work with both in-memory arrays or load data using ajax. See the {@link Core.data.Store} class to learn more about loading data into stores.
 *
 * The columns config accepts an array of {@link Grid.column.Column Column} descriptors defining which fields that will be displayed in the grid.
 * The {@link Grid.column.Column#config-field} property in the column descriptor maps to a field in your dataset. The simplest grid configured with inline data and two columns would
 * look like this:
 *
 *      let grid = new Grid({
 *          appendTo : document.body,
 *
 *          columns: [
 *              { field: 'name', text: 'Name' },
 *              { field: 'job', text: 'Job', renderer: ({value}) => value || 'Unemployed' }
 *          ],
 *
 *          data: [
 *              { name: 'Bill', job: 'Retired' },
 *              { name: 'Elon', job: 'Visionary' },
 *              { name: 'Me' }
 *          ]
 *      });
 *
 * {@inlineexample Grid/view/Grid.js}
 * <h2>Features</h2>
 * To avoid the Grid core being bloated, its main features are implemented in separate ´feature´ classes. These can be turned on and off based
 * on your requirements. To configure (or disable) a feature, use the {@link #config-features} object to provide your desired configuration for the features
 * you want to use. Each feature has an ´id´ that you use as a key in the features object:
 *
 *      let grid = new Grid({
 *          appendTo : document.body,
 *
 *          features : {
 *              cellEdit     : false,
 *              regionResize : true,
 *              cellTooltip  : {
 *                  tooltipRenderer : (data) => {
 *                  }
 *              },
 *              ...
 *          }
 *      });
 *
 * {@region Column configuration options}
 * A grid contains a number of columns that control how your data is rendered. The simplest option is to simply point a Column to a field in your dataset, or define a custom {@link Grid.column.Column#config-renderer}.
 * The renderer function receives one object parameter containing rendering data for the current cell being rendered.
 *
 *      let grid = new Grid({
 *          appendTo : document.body,
 *
 *          columns: [
 *              {
 *                  field: 'task',
 *                  text: 'Task',
 *                  renderer: (renderData) => {
 *                      const record = renderData.record;
 *
 *                      if (record.percentDone === 100) {
 *                          renderData.cellElement.classList.add('taskDone');
 *                          renderData.cellElement.style.background = 'green';
 *                      }
 *
 *                      return renderData.value;
 *                  }
 *              }
 *          ]
 *      });
 *
 * {@endregion}
 * {@region Grid sections (aka "locked" or "frozen" columns)}
 * The grid can be divided horizontally into individually scrollable sections. This is great if you have lots of columns that
 * don't fit the available width of the screen. To enable this feature, simply mark the columns you want to `lock`.
 * Locked columns are then displayed in their own section to the left of the other columns:
 *
 * ```javascript
 * let grid = new Grid({
 *     appendTo : document.body,
 *     width    : 500,
 *     subGridConfigs : {
 *         // set a fixed locked section width if desired
 *         locked : { width: 300 }
 *     },
 *     columns : [
 *         { field : 'name', text : 'Name', width : 200, locked : true },
 *         { field : 'firstName', text : 'First name', width : 100, locked : true },
 *         { field : 'surName', text : 'Last name', width : 100, locked : true },
 *         { field : 'city', text : 'City', width : 100 },
 *         { type : 'number', field : 'age', text : 'Age', width : 200 },
 *         { field : 'food', text : 'Food', width : 200 }
 *     ]
 * });
 * ```
 *
 * {@inlineexample Grid/view/LockedGrid.js}
 * You can also move columns between sections by using drag and drop, or use the built-in header context menu. If you want to be able to resize the
 * locked grid section, enable the {@link Grid.feature.RegionResize regionResize} feature.
 * {@endregion}
 * {@region Filtering}
 * One important requirement of a good Grid component is the ability to filter large datasets to quickly find what you're looking for. To
 * enable filtering (through the context menu), add the {@link Grid.feature.Filter filter} feature:
 *
 *      let grid = new Grid({
 *          features: {
 *              filter: true
 *          }
 *      });
 *
 * Or activate a default filter at initial rendering:
 *
 *      let grid = new Grid({
 *          features: {
 *              filter: { property : 'city', value : 'New York' }
 *          }
 *      });
 *
 * {@inlineexample Grid/feature/Filter.js}
 * {@endregion}
 * {@region Tooltips}
 * If you have a data models with many fields, and you want to show
 * additional data when hovering over a cell, use the {@link Grid.feature.CellTooltip cellTooltip} feature. To show a tooltip for all cells:
 *
 *      let grid = new Grid({
 *          features: {
 *              cellTooltip: ({value}) => value
 *          }
 *      });
 *
 * {@inlineexample Grid/feature/CellTooltip.js}
 * {@endregion}
 * {@region Inline Editing (default <strong>on</strong>)}
 * To enable inline cell editing in the grid, simply add the {@link Grid.feature.CellEdit cellEdit} feature:
 *
 * ```javascript
 * let grid = new Grid({
 *     appendTo : document.body,
 *
 *     features : {
 *         cellEdit : true
 *     },
 *     columns: [
 *         {
 *             field: 'task',
 *             text: 'Task'
 *         }
 *     ]
 * });
 * ```
 *
 * {@inlineexample Grid/feature/CellEdit.js}
 * {@endregion}
 * {@region Context Menu}
 * Use {@link Grid.feature.CellMenu CellMenu} and {@link Grid.feature.HeaderMenu HeaderMenu}
 * features if you want your users to be able to interact with the data through the context menu:
 *
 * ```javascript
 * let grid = new Grid({
 *     features : {
 *         headerMenu : {
 *             items : {
 *                 showInfo : {
 *                     text   : 'Show info',
 *                     icon   : 'fa fa-info-circle',
 *                     weight : 200,
 *                     onItem : ({ item }) => console.log(item.text)
 *                 }
 *             }
 *         },
 *         cellMenu :  {
 *             items : {
 *                 showOptions : {
 *                     text   : 'Show options',
 *                     icon   : 'fa fa-gear',
 *                     weight : 200
 *                 }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * {@inlineexample Grid/feature/CellMenu.js}
 * {@endregion}
 * {@region Grouping}
 * To group rows by a field in your dataset, use the {@link Grid.feature.Group group} feature.
 * {@inlineexample Grid/feature/Group.js}
 * {@endregion}
 * {@region Searching}
 * When working with lots of data, a quick alternative to filtering is the {@link Grid.feature.Search search} feature. It highlights
 * matching values in the grid as you type.
 * {@inlineexample Grid/feature/Search.js}
 * {@endregion}
 * {@region Loading and saving data}
 * The grid keeps all its data in a {@link Core.data.Store}, which is essentially an Array of {@link Core.data.Model Model} items.
 * You define your own Model representing your data entities and use the Model API to get and set values.
 *
 *      class Person extends Model {}
 *
 *      let person = new Person({
 *          name: 'Steve',
 *          age: 38
 *      });
 *
 *      person.name = 'Linda'; // person object is now `dirty`
 *
 *      let store = new Store({
 *          data : [
 *              { name : 'Don', age : 40 }
 *          ]
 *      });
 *
 *      store.add(person);
 *
 *      console.log(store.count()); // === 2
 *
 *      store.remove(person); // Remove from store
 *
 * When you update a record in a store, it's considered dirty, until you call {@link Core.data.mixin.StoreCRUD#function-commit commit} on the containing Store. You can also configure your Store to commit automatically (like Google docs).
 * If you use an AjaxStore, it will send changes to your server when commit is called.
 *
 * Any changes you make to the Store or its records are immediately reflected in the Grid, so there is no need to tell
 * it to refresh manually.
 *
 * To create a custom load mask, subscribe to the grid's store events and {@link Core.widget.Widget#config-masked mask}
 * on {@link Core.data.AjaxStore#event-beforeRequest} and unmask on {@link Core.data.AjaxStore#event-afterRequest}. The
 * mask can also be used to display error messages if an {@link Core.data.AjaxStore#event-exception} occurs.
 *
 * ```javascript
 *  const grid = new Grid({
 *      loadMask : null
 *  });
 *
 *  grid.store.on({
 *      beforeRequest() {
 *          grid.masked = {
 *              text : 'Data is loading...'
 *          };
 *      },
 *      afterRequest() {
 *          grid.masked = null;
 *      },
 *      exception({ response }) {
 *          grid.masked.error = response.message || 'Load failed';
 *      }
 *  });
 *
 *  store.load();
 * ```
 *
 * To learn more about loading and saving data, please refer to [this guide](#Grid/guides/data/displayingdata.md).
 * {@endregion}
 * {@region Default configs}
 * There is a myriad of configs and features available for Grid, some of them on by default and some of them requiring
 * extra configuration. The code below tries to illustrate the major things that are used by default:
 *
 * ```javascript
 * let grid = new Grid({
 *    // The following features are enabled by default:
 *    features : {
 *        cellEdit      : true,
 *        columnPicker  : true,
 *        columnReorder : true,
 *        columnResize  : true,
 *        cellMenu      : true,
 *        headerMenu    : true,
 *        group         : true,
 *        rowCopyPaste  : true, // Allow using [Ctrl/CMD + C/X] and [Ctrl/CMD + V] to copy/cut and paste rows
 *        sort          : true
 *    },
 *
 *    animateRemovingRows       : true,  // Rows will slide out on removal
 *    autoHeight                : false, // Grid needs to have a height supplied through CSS (strongly recommended) or by specifying `height`
 *    columnLines               : true,  // Themes might override it to hide lines anyway
 *    emptyText                 : 'No rows to display',
 *    enableTextSelection       : false, // Not allowed to select text in cells by default,
 *    fillLastColumn            : true,  // By default the last column is stretched to fill the grid
 *    fullRowRefresh            : true,  // Refreshes entire row when a cell value changes
 *    loadMask                  : 'Loading...',
 *    resizeToFitIncludesHeader : true,  // Also measure header when auto resizing columns
 *    responsiveLevels : {
 *      small : 400,
 *      medium : 600,
 *      large : '*'
 *    },
 *    rowHeight                  : null,  // Determined using CSS, it will measure rowHeight
 *    showDirty                  : false, // No indicator for changed cells
 * });
 * ```
 * {@endregion}
 * {@region Performance}
 * In general the Grid widget has very good performance and you can try loading any amount of data in the <a target="_blank" href="../examples/bigdataset">bigdataset</a> demo.
 * The overall rendering performance is naturally affected by many other things than
 * the data volume. Other important factors that can impact performance: number of columns, complex cell renderers, locked columns, the number of features enabled
 * and of course the browser (Chrome fastest, IE slowest).
 * {@endregion}
 *
 * <h2>Accessibility</h2>
 * As far as possible, the grid is accessible to WAI-ARIA standards. Every cell, including column
 * header cells is visitable. The arrow keys navigate, and if a cell contains focusable content,
 * navigating to that cell focuses the content. `Escape` will exit from that and focus the encpsulating
 * cell.
 *
 * When tabbing back into a grid that has previously been entered, focus moves to the last focused
 * cell.
 *
 * The column menu is invoked using the `Space` key when focused on a column header.
 *
 * The cell menu is invoked using the `Space` key when focused on a data cell.
 * @extends Grid/view/GridBase
 *
 * @classType grid
 */

class Grid extends GridBase {
  static get $name() {
    return 'Grid';
  } // Factoryable type name

  static get type() {
    return 'grid';
  }

} // Register this widget type with its Factory

Grid.initClass();
Grid._$name = 'Grid';

export { ColumnAutoWidth, Grid, RowCopyPaste };
//# sourceMappingURL=Grid.js.map
