/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { GridFeatureManager } from './GridBase.js';
import { DragHelper } from './LocalizableComboItems.js';
import { Delayable, InstancePlugin, DomHelper, _defineProperty, ObjectHelper, WalkHelper } from './Editor.js';
import { TreeColumn } from './Tree.js';

/**
 * @module Grid/feature/RowReorder
 */
/**
 * Allows user to reorder rows by dragging them. To get notified about row reorder listen to `change` event
 * on the grid {@link Core.data.Store store}.
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid.view.mixin.GridFeatures}.
 * This feature is **enabled** by default for Gantt.
 *
 * {@inlineexample Grid/feature/RowReorder.js}
 *
 * If the grid is set to {@link Grid.view.Grid#config-readOnly}, reordering is disabled. Inside all event listeners you
 * have access a `context` object which has a `record` property (the dragged record).
 *
 * ## Validation
 * You can validate the drag drop flow by listening to the `gridrowdrag` event. Inside this listener you have access to
 * the `index` property which is the target drop position. For trees you get access to the `parent` record and `index`,
 * where index means the child index inside the parent.
 *
 * You can also have an async finalization step using the {@link #event-gridRowBeforeDropFinalize}, for showing a
 * confirmation dialog or making a network request to decide if drag operation is valid (see code snippet below)
 *
 * ```javascript
 * features : {
 *     rowReorder : {
 *         listeners : {
 *             gridRowDrag : ({ context }) => {
 *                // Here you have access to context.insertBefore, and additionally context.parent for trees
 *             },
 *
 *             gridRowBeforeDropFinalize : async ({ context }) => {
 *                const result = await MessageDialog.confirm({
 *                    title   : 'Please confirm',
 *                    message : 'Did you want the row here?'
 *                });
 *
 *                // true to accept the drop or false to reject
 *                return result === MessageDialog.yesButton;
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * Note, that this feature uses the concept of "insert before" when choosing a drop point in the data. So the dropped
 * record's position is *before the visual next record's position*.
 *
 * This may look like a pointless distinction, but consider the case when a Store is filtered. The record *above* the
 * drop point may have several filtered out records below it. When unfiltered, the dropped record will be *below* these
 * because of the "insert before" behaviour.
 *
 * ## Behavior with multiple subgrids
 *
 * For grids with multiple subgrids, row reordering is only enabled for the first subgrid.
 *
 * @extends Core/mixin/InstancePlugin
 * @demo Grid/rowreordering
 * @classtype rowReorder
 * @feature
 */

class RowReorder extends Delayable(InstancePlugin) {
  //region Events

  /**
   * Fired before dragging starts, return false to prevent the drag operation.
   * @preventable
   * @event gridRowBeforeDragStart
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {Core.data.Model[]} context.records The dragged row records
   * @param {MouseEvent|TouchEvent} event
   */

  /**
   * Fired when dragging starts.
   * @event gridRowDragStart
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {Core.data.Model[]} context.records The dragged row records
   * @param {MouseEvent|TouchEvent} event
   */

  /**
   * Fired while the row is being dragged, in the listener function you have access to `context.insertBefore` a grid /
   * tree record, and additionally `context.parent` (a TreeNode) for trees. You can signal that the drop position is
   * valid or invalid by setting `context.valid = false;`
   * @event gridRowDrag
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {Boolean} context.valid Set this to true or false to indicate whether the drop position is valid.
   * @param {Core.data.Model} context.insertBefore The record to insert before (`null` if inserting at last position of a parent node)
   * @param {Core.data.Model} context.parent The parent record of the current drop position (only applicable for trees)
   * @param {Core.data.Model[]} context.records The dragged row records
   * @param {MouseEvent} event
   */

  /**
   * Fired before the row drop operation is finalized. You can return false to abort the drop operation, or a
   * Promise yielding `true` / `false` which allows for asynchronous abort (e.g. first show user a confirmation dialog).
   * @event gridRowBeforeDropFinalize
   * @preventable
   * @async
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {Boolean} context.valid Set this to true or false to indicate whether the drop position is valid
   * @param {Core.data.Model} context.insertBefore The record to insert before (`null` if inserting at last position of a parent node)
   * @param {Core.data.Model} context.parent The parent record of the current drop position (only applicable for trees)
   * @param {Core.data.Model[]} context.records The dragged row records
   * @param {Object[]} context.oldPositionContext An array of objects with information about the previous tree position.
   * Objects contain the record, and its original `parentIndex` and `parentId` values
   * @param {MouseEvent} event
   */

  /**
   * Fired after the row drop operation has completed, regardless of validity
   * @event gridRowDrop
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {Boolean} context.valid true or false depending on whether the drop position was valid
   * @param {Core.data.Model} context.insertBefore The record to insert before (`null` if inserting at last position of a parent node)
   * @param {Core.data.Model} context.parent The parent record of the current drop position (only applicable for trees)
   * @param {Core.data.Model} context.record [DEPRECATED] The dragged row record
   * @param {Core.data.Model[]} context.records The dragged row records
   * @param {Object[]} context.oldPositionContext An array of objects with information about the previous tree position.
   * Objects contain the record, and its original `parentIndex` and `parentId` values
   * @param {MouseEvent} event
   */

  /**
   * Fired when a row drag operation is aborted
   * @event gridRowAbort
   * @param {Core.helper.DragHelper} source
   * @param {Object} context
   * @param {MouseEvent} event
   */
  //endregion
  //region Init
  static get $name() {
    return 'RowReorder';
  }

  static get configurable() {
    return {
      /**
       * Set to `true` to show a grip icon in the left side of each row.
       * @config {Boolean}
       */
      showGrip: null,

      /**
       * If hovering over a parent node for this period of a time in a tree, the node will expand
       * @config {Number}
       */
      hoverExpandTimeout: 1000,

      /**
       * The amount of milliseconds to wait after a touchstart, before a drag gesture will be allowed to start.
       * @config {Number}
       * @default
       */
      touchStartDelay: 300
    };
  }

  construct(grid, config) {
    this.grid = grid;
    super.construct(...arguments);
  }

  doDestroy() {
    var _this$dragHelper;

    (_this$dragHelper = this.dragHelper) === null || _this$dragHelper === void 0 ? void 0 : _this$dragHelper.destroy();
    super.doDestroy();
  }
  /**
   * Initialize drag & drop (called from render)
   * @private
   */

  init() {
    const me = this,
          {
      grid
    } = me;
    me.dragHelper = new DragHelper({
      name: 'rowReorder',
      cloneTarget: true,
      dragThreshold: 10,
      targetSelector: '.b-grid-row',
      lockX: true,
      scrollManager: grid.scrollManager,
      dragWithin: grid.element,
      outerElement: me.targetSubGridElement,
      touchStartDelay: me.touchStartDelay,
      monitoringConfig: {
        scrollables: [{
          element: grid.scrollable.element,
          direction: 'vertical'
        }]
      },
      // Since parent nodes can expand after hovering, meaning original drag start position now refers to a different point in the tree
      ignoreSamePositionDrop: false,

      createProxy(element) {
        const clone = element.cloneNode(true),
              container = document.createElement('div');
        clone.removeAttribute('id'); // The containing element will be positioned instead

        clone.style.transform = '';
        container.appendChild(clone);

        if (grid.selectedRecords.length > 1) {
          const clone2 = clone.cloneNode(true);
          clone2.classList.add('b-row-dragging-multiple');
          container.appendChild(clone2);
        }

        DomHelper.removeClsGlobally(container, 'b-selected', 'b-hover', 'b-focused');
        return container;
      },

      listeners: {
        beforedragstart: 'onBeforeDragStart',
        dragstart: 'onDragStart',
        drag: 'onDrag',
        drop: 'onDrop',
        reset: 'onReset',
        prio: 10000,
        // To ensure our listener is run before the relayed listeners (for the outside world)
        thisObj: me
      }
    });
    me.dropIndicator = DomHelper.createElement({
      className: 'b-row-drop-indicator'
    });
    me.relayEvents(me.dragHelper, ['beforeDragStart', 'dragStart', 'drag', 'abort'], 'gridRow');
  } //endregion
  //region Plugin config

  static get pluginConfig() {
    return {
      after: ['onPaint']
    };
  }

  get targetSubGridElement() {
    const targetSubGrid = this.grid.regions[0];
    return this.grid.subGrids[targetSubGrid].element;
  } //endregion
  //region Events (drop)

  onBeforeDragStart({
    source,
    context
  }) {
    const me = this,
          {
      grid
    } = me,
          subGridEl = me.targetSubGridElement; // Only dragging enabled in the leftmost grid section

    if (me.disabled || grid.readOnly || grid.isTreeGrouped || !subGridEl.contains(context.element)) {
      return false;
    }

    context.startRecord = grid.getRecordFromElement(context.element); // Dont allow starting drag on a readOnly record

    if (context.startRecord.readOnly) {
      return false;
    }

    context.originalRowTop = grid.rowManager.getRowFor(context.startRecord).top; // Touchstart doesn't focus/navigate on its own, so we do it at the last moment before drag start

    if (source.startEvent.type === 'touchstart') {
      if (!grid.isSelected(context.startRecord)) {
        grid.selectRow({
          record: context.startRecord,
          addToSelection: true
        });
      }
    } // Filter out any readOnly records from the drag

    const records = context.records = grid.selectedRecords.filter(r => !r.readOnly).slice().sort((r1, r2) => grid.store.indexOf(r1) - grid.store.indexOf(r2));
    return records.length > 0 && !records.some(rec => rec.isSpecialRow);
  }

  onDragStart({
    context
  }) {
    var _cellMenu$hideContext, _headerMenu$hideConte;

    const me = this,
          {
      grid
    } = me,
          {
      cellEdit,
      cellMenu,
      headerMenu
    } = grid.features;

    if (cellEdit) {
      me.cellEditDisabledState = cellEdit.disabled;
      cellEdit.disabled = true; // prevent editing from being started through keystroke during row reordering
    }

    cellMenu === null || cellMenu === void 0 ? void 0 : (_cellMenu$hideContext = cellMenu.hideContextMenu) === null || _cellMenu$hideContext === void 0 ? void 0 : _cellMenu$hideContext.call(cellMenu, false);
    headerMenu === null || headerMenu === void 0 ? void 0 : (_headerMenu$hideConte = headerMenu.hideContextMenu) === null || _headerMenu$hideConte === void 0 ? void 0 : _headerMenu$hideConte.call(headerMenu, false);
    grid.element.classList.add('b-row-reordering');
    const focusedCell = context.element.querySelector('.b-focused');
    focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.classList.remove('b-focused');
    context.element.firstElementChild.classList.remove('b-selected', 'b-hover');
    grid.bodyContainer.appendChild(me.dropIndicator);
  }

  onDrag({
    context,
    event
  }) {
    const me = this,
          {
      grid
    } = me,
          {
      store,
      rowManager
    } = grid;
    let valid = true,
        row = grid.rowManager.getRowAt(event.clientY),
        overRecord,
        dataIndex,
        after,
        insertBefore;

    if (row) {
      const rowTop = row.top + grid._bodyRectangle.y - grid.scrollable.y,
            middleY = rowTop + row.height / 2;
      dataIndex = row.dataIndex;
      overRecord = store.getAt(dataIndex); // Drop after row below if mouse is in bottom half of hovered row

      after = event.clientY > middleY;
    } // User dragged below last row or above the top row.
    else {
      if (event.clientY < grid._bodyRectangle.y) {
        dataIndex = 0;
        overRecord = store.first;
        after = false;
      } else {
        dataIndex = store.count - 1;
        overRecord = store.last;
        after = true;
      }

      row = grid.rowManager.getRow(dataIndex);
    }

    if (overRecord === me.overRecord && me.after === after) {
      context.valid = me.reorderValid; // nothing's changed

      return;
    }

    me.overRecord = overRecord;
    me.after = after; // Hovering the dragged record. This is a no-op.
    // But still gather the contextual data.

    if (overRecord === context.startRecord) {
      valid = false;
    }

    if (store.tree) {
      insertBefore = after ? overRecord.nextSibling : overRecord; // For trees, prevent moving a parent into its own hierarchy

      if (context.records.some(rec => rec.contains(overRecord))) {
        valid = false;
      }

      if (context.parent) {
        const oldParentRow = rowManager.getRowById(context.parent);
        oldParentRow === null || oldParentRow === void 0 ? void 0 : oldParentRow.removeCls('b-row-reordering-target-parent');
      }

      context.parent = overRecord.parent;

      if (!context.parent.isRoot) {
        const parentRow = rowManager.getRowById(context.parent);
        parentRow === null || parentRow === void 0 ? void 0 : parentRow.addCls('b-row-reordering-target-parent');
      }

      me.clearTimeout(me.hoverTimer);

      if (overRecord && overRecord.isParent && !overRecord.isExpanded(store)) {
        me.hoverTimer = me.setTimeout(() => grid.expand(overRecord), me.hoverExpandTimeout);
      }
    } else {
      insertBefore = after ? store.getAt(dataIndex + 1) : overRecord;
    } // Provide visual clue to user of the drop position
    // In FF (in tests) it might not have had time to redraw rows after scroll before getting here

    row && DomHelper.setTranslateY(me.dropIndicator, row.top + (after ? row.height : 0)); // Public property used for validation

    context.insertBefore = insertBefore;
    context.valid = me.reorderValid = valid;
  }
  /**
   * Handle drop
   * @private
   */

  async onDrop(event) {
    const me = this,
          context = event.context;
    context.valid = context.valid && me.reorderValid;

    if (context.valid) {
      context.async = true;

      if (me.client.store.tree) {
        // For tree scenario, add context about previous positions of dragged tree nodes
        context.oldPositionContext = context.records.map(record => {
          var _record$parent;

          return {
            record,
            parentId: (_record$parent = record.parent) === null || _record$parent === void 0 ? void 0 : _record$parent.id,
            parentIndex: record.parentIndex
          };
        });
      } // Outside world provided us one or more Promises to wait for

      const result = await me.trigger('gridRowBeforeDropFinalize', event);

      if (result === false) {
        context.valid = false;
      }

      await me.dragHelper.animateProxyTo(me.dropIndicator, {
        align: 'l0-l0'
      });
      await me.finalizeReorder(context);
    } // already dropped the node, don't have to expand any node hovered anymore
    // (cancelling expand action after timeout)

    me.clearTimeout(me.hoverTimer);
    me.overRecord = me.after = null;
    me.trigger('gridRowDrop', event);
  }

  async finalizeReorder(context) {
    const me = this,
          {
      grid
    } = me,
          {
      store
    } = grid;
    let records = context.records;
    context.valid = context.valid && !records.some(rec => !store.includes(rec));

    if (context.valid) {
      let result;

      if (store.tree) {
        // Remove any selected child records of parent nodes
        records = records.filter(record => !record.parent || !records.includes(record.parent));
        result = await context.parent.tryInsertChild(records, context.insertBefore); // remove reorder cls from preview parent element dropped

        grid.rowManager.forEach(r => r.removeCls('b-row-reordering-target-parent'));
        context.valid = result !== false;
      } else {
        store.move(records, context.insertBefore);
      }

      store.clearSorters();
    }

    context.finalize(context.valid);
    grid.element.classList.remove('b-row-reordering');
  }
  /**
   * Clean up on reset
   * @private
   */

  onReset() {
    const me = this,
          cellEdit = me.grid.features.cellEdit;
    me.grid.element.classList.remove('b-row-reordering');

    if (cellEdit) {
      cellEdit.disabled = me.cellEditDisabledState;
    }

    me.dropIndicator.remove();
    DomHelper.removeClsGlobally(me.grid.element, 'b-row-reordering-target-parent');
  } //endregion
  //region Render

  /**
   * Updates DragHelper with updated headers when grid contents is rerendered
   * @private
   */

  onPaint() {
    // columns shown, hidden or reordered
    this.init();
  } //endregion

  updateShowGrip(show) {
    this.grid.element.classList.toggle('b-row-reorder-with-grip', show);
  }

}
RowReorder.featureClass = '';
RowReorder._$name = 'RowReorder';
GridFeatureManager.registerFeature(RowReorder, false);
GridFeatureManager.registerFeature(RowReorder, true, 'Gantt');

/**
 * @module Grid/feature/TreeGroup
 */

/**
 * A feature that allows transforming a flat dataset (or the leaves of a hierarchical) into a tree by specifying a
 * record field per parent level. Parents are generated based on each leaf's value for those fields.
 *
 * {@inlineexample Grid/feature/TreeGroup.js}
 *
 * This feature can be used to mimic multi grouping or to generate another view for hierarchical data. The original data
 * is kept in memory and can be easily restored.
 *
 * <div class="note">
 * Please note that this feature requires using a {@link Grid.view.TreeGrid} or having the {@link Grid.feature.Tree}
 * feature enabled.
 * </div>
 *
 * This snippet shows how the sample dataset used in the demo above is transformed:
 *
 * ```javascript
 * const grid = new TreeGrid({
 *     // Original data
 *     data : [
 *         { id : 1, name : 'Project 1', children : [
 *             { id : 11, name : 'Task 11', status : 'wip', prio : 'high' },
 *             { id : 12, name : 'Task 12', status : 'done', prio : 'low' },
 *             { id : 13, name : 'Task 13', status : 'done', prio : 'high' }
 *         ]},
 *         { id : 2, name : 'Project 2', children : [
 *             { id : 21, name : 'Task 21', status : 'wip', prio : 'high' },
 *         ]}
 *     ],
 *
 *     features : {
 *         treeGroup : {
 *             // Fields to build a new tree from
 *             levels : [ 'prio', 'status' ]
 *         }
 *     }
 * });
 *
 * // Resulting data
 * [
 *     { name : 'low', children : [
 *         { name : 'done', children : [
 *             { id : 12, name : 'Task 12', status : 'done', prio : 'low' }
 *         ]}
 *     ]},
 *     { name : 'high', children : [
 *         { name : 'done', children : [
 *             { id : 13, name : 'Task 13', status : 'done', prio : 'high' }
 *         ]},
 *         { name : 'wip', children : [
 *             { id : 11, name : 'Task 11', status : 'wip', prio : 'high' },
 *             { id : 21, name : 'Task 21', status : 'wip', prio : 'low' }
 *         ]}
 *     ]}
 * ]
 * ```
 *
 * ## Important information
 *
 * Using the TreeGroup feature comes with some caveats:
 *
 * * Grouping completely replaces the dataset of the store with a new generated tree structure. Any uncommitted new or
 *   removed records will be lost
 * * Generated parents are read-only, they cannot be edited using the default UI
 * * Leaves in the new tree are still editable as usual, and any changes to them survives the grouping operation
 * * Moving nodes manually in the tree is not supported while tree is grouped.
 *
 * <div class="note">
 * Please note that this feature is currently only supported by Grid and Gantt.
 * </div>
 *
 * This feature is <strong>disabled</strong> by default.
 *
 * @extends Core/mixin/InstancePlugin
 *
 * @classtype treeGroup
 * @feature
 */

class TreeGroup extends InstancePlugin {
  construct(grid, config) {
    super.construct(grid, config);

    if (!grid.hasFeature('tree')) {
      throw new Error('The TreeGroup feature requires the Tree feature to be enabled');
    }
  }

  processParentData(parentData) {
    // Apply cls to allow custom styling of generated parents
    if (this.parentCls) {
      parentData.cls = this.parentCls;
    }
  }

  restoreChildRecord(record) {
    var _record$children;

    if (((_record$children = record.children) === null || _record$children === void 0 ? void 0 : _record$children.length) === 0) {
      record.appendChild(record.$originalChildren);
    }
  } // Override in subclasses to wait for initial data readiness before transforming, for example to wait for engine
  // calculations in Gantt

  async waitForReadiness() {
    // Wait for store to finish loading before transforming the data
    if (this.client.store.isLoading) {
      await this.client.store.await('load', false);
    }
  }

  async applyLevels(levels, applyToStore = true) {
    const me = this,
          {
      store
    } = me.client,
          treeColumn = me.client.columns.find(col => col instanceof TreeColumn);
    me._levels = levels;
    me.isApplying++;
    await me.waitForReadiness();

    if (me.isDestroyed) {
      return;
    } // Applying custom levels

    if (levels) {
      // Store original children for each current parent first time we pass through here
      if (!me.$originalChildren) {
        store.traverse(r => {
          if (r.isParent && r.children.length) {
            r.$originalChildren = r.children.slice();
          }
        });
        me.$originalChildren = store.rootNode.children.slice();
      } // Transform it according to levels

      const transformedData = store.treeify(levels, parentData => {
        // Use group key as tree columns content
        ObjectHelper.setPath(parentData, store.modelClass.getFieldDataSource(treeColumn.field), parentData.key); // Let the outside world manipulate generated parents data before turning it into a record

        me.processParentData(parentData);
      });

      if (applyToStore) {
        store.data = transformedData.children;
      }

      me.isApplying--;
      return transformedData;
    } // Clearing custom levels
    else {
      // Return children to their original parents
      WalkHelper.preWalk({
        $originalChildren: me.$originalChildren
      }, r => r.$originalChildren, r => me.restoreChildRecord(r));

      if (applyToStore) {
        store.data = me.$originalChildren;
      }

      me.$originalChildren = null;
      me.isApplying--;
    }
  }

  updateLevels(levels) {
    this.applyLevels(levels);
  }
  /**
   * Transforms the data according to the supplied levels.
   *
   * Yields the same result as assigning to {@link #property-levels}.
   *
   * ```javascript
   * // Transform into a tree with two parent levels
   * grid.group('status', record => (record.percentDone % 10) * 10);
   * ```
   *
   * @param {Array<String|Function(Core.data.Model) : any>} levels Field names or functions use to generate parents in resulting tree.
   * @on-owner
   * @async
   * @category Common
   */

  async group(levels) {
    ObjectHelper.assertArray(levels, 'group()');
    await this.applyLevels(levels);
  }
  /**
   * Clears the previously applied transformation, restoring data to its initial state.
   *
   * Yields the same result as assigning `null` to {@link #property-levels}.
   *
   * ```javascript
   * // Restore original data
   * grid.clearGroupers();
   * ```
   * @on-owner
   * @async
   * @category Common
   */

  async clearGroups() {
    await this.applyLevels(null);
  }

  get isGrouped() {
    return Boolean(this._levels);
  }

}

_defineProperty(TreeGroup, "$name", 'TreeGroup');

_defineProperty(TreeGroup, "configurable", {
  /**
   * An array of model field names or functions used to determine the levels in the resulting tree.
   *
   * Assigning `null` restores data to its original state.
   *
   * See the {@link #config-levels levels config} for more information.
   *
   * @member {Array<String|Function(Core.data.Model) : any>} levels
   */

  /**
   * An array of model field names or functions used to determine the levels in the resulting tree.
   *
   * When supplying a function, it will be called for each leaf in the original data and it is expected to return
   * an atomic value used to determine which parent the leaf will be added to at that level.
   *
   * ```javascript
   * const grid = new TreeGrid({
   *     features : {
   *         treeGroup : {
   *             levels : [
   *                 // First level is determined by the value of the status field
   *                 'status',
   *                 // Second level by the result of this function
   *                 // (which puts percentdone 0-9 in one group, 10-19 into another and so on)
   *                 record => (record.percentDone % 10) * 10
   *             ]
   *         }
   *     }
   * });
   * ```
   *
   * The function form can also be used as a formatter/renderer of sorts, simply by returning a string:
   *
   * ```javascript
   * const grid = new TreeGrid({
   *     features : {
   *         treeGroup : {
   *             levels : [
   *                 record => `Status: ${record.status}`
   *             ]
   *         }
   *     }
   * });
   * ```
   *
   * @config {Array<String|Function(Core.data.Model) : any>}
   */
  levels: null,

  /**
   * CSS class to apply to the generated parents.
   *
   * @config {String}
   * @default
   */
  parentCls: 'b-generated-parent'
});

_defineProperty(TreeGroup, "pluginConfig", {
  assign: ['group', 'clearGroups']
});

_defineProperty(TreeGroup, "properties", {
  isApplying: 0
});

TreeGroup._$name = 'TreeGroup';
GridFeatureManager.registerFeature(TreeGroup);

export { RowReorder, TreeGroup };
//# sourceMappingURL=TreeGroup.js.map
