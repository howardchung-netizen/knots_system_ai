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
import { DomHelper, InstancePlugin, Delayable } from './Editor.js';

/**
 * @module Grid/column/TreeColumn
 */

let currentParentHasIcon = false;
/**
 * A column that displays a tree structure when using the {@link Grid.feature.Tree tree} feature.
 *
 * Default editor is a {@link Core.widget.TextField TextField}.
 *
 * TreeColumn provides configs to define icons for {@link #config-expandIconCls expanded} / {@link #config-collapseIconCls collapsed} nodes,
 * {@link #config-expandedFolderIconCls expanded folder} / {@link #config-collapsedFolderIconCls collapsed folder} nodes and
 * {@link #config-leafIconCls leaf} nodes.
 *
 * When the TreeColumn renders its cells, it will look for two special fields {@link Grid.data.GridRowModel#field-href}
 * and {@link Grid.data.GridRowModel#field-target}. Specifying `href` will produce a link for the TreeNode,
 * and `target` will have the same meaning as in an A tag:
 *
 * ```javascript
 * {
 *    id        : 1,
 *    name      : 'Some external link'
 *    href      : '//www.website.com",
 *    target    : '_blank"
 * }
 * ```
 *
 * @example
 * new TreeGrid({
 *     appendTo : document.body,
 *
 *     columns : [
 *          { type: 'tree', field: 'name' }
 *     ]
 * });
 *
 * @classType tree
 * @extends Grid/column/Column
 * @inlineexample Grid/column/TreeColumn.js
 */

class TreeColumn extends Column {
  static get defaults() {
    return {
      tree: true,
      hideable: false,
      minWidth: 150
    };
  }

  static get fields() {
    return [
    /**
     * The icon to use for the collapse icon in collapsed state
     * @config {String} expandIconCls
     */
    {
      name: 'expandIconCls',
      defaultValue: 'b-icon b-icon-tree-expand'
    },
    /**
     * The icon to use for the collapse icon in expanded state
     * @config {String} collapseIconCls
     */
    {
      name: 'collapseIconCls',
      defaultValue: 'b-icon b-icon-tree-collapse'
    },
    /**
     * The icon to use for the collapse icon in expanded state
     * @config {String} collapsedFolderIconCls
     */
    {
      name: 'collapsedFolderIconCls'
    },
    /**
     * The icon to use for the collapse icon in expanded state
     * @config {String} expandedFolderIconCls
     */
    {
      name: 'expandedFolderIconCls'
    },
    /**
     * Size of the child indent in em. Resulting indent is indentSize multiplied by child level.
     * @config {Number} indentSize
     * @default 1.7
     */
    {
      name: 'indentSize',
      defaultValue: 1.7
    },
    /**
     * The icon to use for the leaf nodes in the tree
     * @config {String} leafIconCls
     */
    {
      name: 'leafIconCls',
      defaultValue: 'b-icon b-icon-tree-leaf'
    }, {
      name: 'editTargetSelector',
      defaultValue: '.b-tree-cell-value'
    }];
  }

  static get type() {
    return 'tree';
  }

  constructor(config, store) {
    super(...arguments);
    const me = this;
    me.internalCellCls = 'b-tree-cell'; // We handle htmlEncoding in this class rather than relying on the generic Row DOM manipulation
    // since this class requires quite a lot of DOM infrastructure around the actual rendered content

    me.shouldHtmlEncode = me.htmlEncode;
    me.setData('htmlEncode', false); // add tree renderer (which calls original renderer internally)

    if (me.renderer) {
      me.originalRenderer = me.renderer;
    }

    me.renderer = me.treeRenderer.bind(me);
  }
  /**
   * A column renderer that is automatically added to the column with { tree: true }. It adds padding and node icons
   * to the cell to make the grid appear to be a tree. The original renderer is called in the process.
   * @private
   */

  treeRenderer(renderData) {
    const me = this,
          {
      grid,
      column,
      cellElement,
      row,
      record,
      isExport
    } = renderData,
          gridMeta = record.instanceMeta(grid.store),
          isCollapsed = !record.isLeaf && gridMeta.collapsed,
          innerConfig = {
      className: 'b-tree-cell-value'
    },
          children = [innerConfig],
          result = {
      className: 'b-tree-cell-inner',
      tag: record.href ? 'a' : 'div',
      href: record.href,
      target: record.target,
      children
    },
          rowClasses = {
      'b-tree-parent-row': 0,
      'b-tree-collapsed': 0,
      'b-tree-expanded': 0,
      'b-loading-children': 0
    };
    let outputIsObject,
        iconCls,
        {
      value
    } = renderData;

    if (me.originalRenderer) {
      var _grid$hasFrameworkRen;

      const rendererHtml = me.originalRenderer(renderData),
            // Check if the cell content is going to be rendered by framework
      hasFrameworkRenderer = (_grid$hasFrameworkRen = grid.hasFrameworkRenderer) === null || _grid$hasFrameworkRen === void 0 ? void 0 : _grid$hasFrameworkRen.call(grid, {
        cellContent: rendererHtml,
        column
      });
      outputIsObject = typeof rendererHtml === 'object' && !hasFrameworkRenderer; // Reset the value when framework is responsible for the cell content

      value = hasFrameworkRenderer ? '' : rendererHtml === false ? cellElement.innerHTML : rendererHtml; // Save content to the `rendererHtml` to be used in processCellContent implemented by framework

      renderData.rendererHtml = rendererHtml;
    }

    if (!outputIsObject) {
      var _value;

      value = String((_value = value) !== null && _value !== void 0 ? _value : '');
    }

    if (isExport) {
      return value;
    }

    if (!record.isLeaf) {
      var _record$children;

      const isCollapsed = !record.isExpanded(grid.store),
            expanderIconCls = isCollapsed ? me.expandIconCls : me.collapseIconCls,
            folderIconCls = isCollapsed ? me.collapsedFolderIconCls : me.expandedFolderIconCls;
      rowClasses['b-tree-parent-row'] = 1;
      rowClasses['b-tree-collapsed'] = isCollapsed;
      rowClasses['b-tree-expanded'] = !isCollapsed;
      rowClasses['b-loading-children'] = gridMeta.isLoadingChildren;
      cellElement.classList.add('b-tree-parent-cell');
      children.unshift({
        tag: 'i',
        className: {
          'b-tree-expander': 1,
          [expanderIconCls]: 1,
          'b-empty-parent': !gridMeta.isLoadingChildren && record.children !== true && !((_record$children = record.children) !== null && _record$children !== void 0 && _record$children.length)
        }
      }); // Allow user to customize tree icon or opt out entirely

      currentParentHasIcon = iconCls = renderData.iconCls || record.iconCls || folderIconCls;
    } else {
      // TODO: Cleanup for reusing dom nodes should be done elsewhere, also cleanup selection
      cellElement.classList.add('b-tree-leaf-cell'); // Allow user to customize tree icon or opt out entirely

      iconCls = renderData.iconCls || record.iconCls || me.leafIconCls;
    }

    if (iconCls) {
      children.splice(children.length - 1, 0, {
        tag: 'i',
        className: {
          'b-tree-icon': 1,
          [iconCls]: 1
        }
      });
    } // Row can be just a dummy object for example when the renderer is called from Column#resizeToFitContent.
    // Add/remove the various tree node classes.
    // Keep row's aria state up to date

    if (row.isRow) {
      row.assignCls(rowClasses);

      if (!record.isLeaf) {
        row.setAttribute('aria-expanded', !isCollapsed);

        if (isCollapsed) {
          row.removeAttribute('aria-owns');
        } else {
          for (const region in grid.subGrids) {
            var _record$children2, _record$children3;

            const el = row.elements[region]; // A branch node may be configured expanded, but yet have no children.
            // They may be added dynamically.

            DomHelper.setAttributes(el, {
              'aria-owns': (_record$children2 = record.children) !== null && _record$children2 !== void 0 && _record$children2.length ? (_record$children3 = record.children) === null || _record$children3 === void 0 ? void 0 : _record$children3.map(r => `${grid.id}-${region}-${r.id}`).join(' ') : null
            });
          }
        }
      }
    } // If we are encoding HTML, or there's no raw HTML, we can use the children property
    // with the raw value as a child, and DomSync will create a TextNode from that.

    if (outputIsObject || me.shouldHtmlEncode || !value.includes('<')) {
      if (outputIsObject) {
        Object.assign(innerConfig, value);
      }

      innerConfig.children = innerConfig.children || [];
      innerConfig.children.unshift(outputIsObject ? null : value);
    } // If we are accepting HTML without encoding it, and there is HTML we must use html property
    else {
      innerConfig.html = value;
    }

    const padding = record.childLevel * me.indentSize + (record.isLeaf ? currentParentHasIcon ? 2.0 : iconCls ? 0.5 : 0.4 : 0);
    result.style = `padding-inline-start:${padding}em`;
    return result;
  } // This function is not meant to be called by any code other than Base#getCurrentConfig().
  // It extracts the current configs (fields) for the column, with special handling for the renderer

  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options); // Use app renderer

    result.renderer = this.originalRenderer;
    return result;
  }

}
ColumnStore.registerColumnType(TreeColumn, true);
TreeColumn.exposeProperties();
TreeColumn._$name = 'TreeColumn';

/**
 * @module Grid/feature/Tree
 */

const immediatePromise = Promise.resolve();
/**
 * Feature that makes the grid work more like a tree. Included by default in {@link Grid.view.TreeGrid}. Requires
 * exactly one {@link Grid.column.TreeColumn} among grids columns. That column will have its renderer replaced with a
 * tree renderer that adds padding and icon to give the appearance of a tree. The original renderer is preserved and
 * also called.
 *
 * This feature is <strong>disabled</strong> by default. When enabled, the feature cannot be disabled during runtime.
 *
 * @extends Core/mixin/InstancePlugin
 *
 * @demo Grid/tree
 * @classtype tree
 * @inlineexample Grid/feature/Tree.js
 * @feature
 */

class Tree extends InstancePlugin.mixin(Delayable) {
  //region Config
  static get $name() {
    return 'Tree';
  }

  static get defaultConfig() {
    return {
      /**
       * Expand parent nodes when clicking on their cell
       * @config {Boolean}
       * @default
       */
      expandOnCellClick: false
    };
  } // Plugin configuration. This plugin chains some of the functions in Grid.

  static get pluginConfig() {
    return {
      assign: ['collapseAll', 'expandAll', 'collapse', 'expand', 'expandTo', 'toggleCollapse'],
      before: ['onArrowRight', 'onArrowLeft'],
      chain: ['onElementClick', 'onElementKeyDown', 'bindStore']
    };
  } //endregion
  //region Init

  construct(grid, config) {
    super.construct(grid, config); // find column

    const me = this,
          treeColumn = grid.columns.find(col => col instanceof TreeColumn);

    if (!treeColumn) {
      throw new Error('To use the tree feature one column must be configured with tree: true');
    }

    Object.assign(me, {
      grid,
      rowManager: grid.rowManager,
      treeColumn
    });
    grid.store && this.bindStore(grid.store);
  }

  doDisable(disable) {
    if (disable) {
      throw new Error('Tree feature cannot be disabled');
    }
  }

  get store() {
    return this.grid.store;
  }

  bindStore(store) {
    this.detachListeners('store');
    store.on({
      name: 'store',
      beforeLoadChildren: 'onBeforeLoadChildren',
      loadChildren: 'onLoadChildren',
      loadChildrenException: 'onLoadChildrenException',
      beforeToggleNode: 'onBeforeToggleNode',
      thisObj: this
    });
  } //endregion
  //region Expand & collapse

  /**
   * Collapse an expanded node or expand a collapsed. Optionally forcing a certain state.
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node to toggle
   * @param {Boolean} [collapse] Force collapse (true) or expand (false)
   * @param {Boolean} [skipRefresh] Set to true to not refresh rows (if calling in batch)
   * @returns {Promise}
   * @async
   */

  async toggleCollapse(idOrRecord, collapse, skipRefresh = false) {
    if (idOrRecord == null) {
      throw new Error('Tree#toggleCollapse must be passed a record');
    }

    const me = this,
          {
      store,
      grid
    } = me,
          {
      rowManager
    } = grid,
          record = store.getById(idOrRecord),
          meta = record.instanceMeta(store);

    if (await store.toggleCollapse(record, collapse)) {
      const row = rowManager.getRowFor(record);

      if (row && record.ancestorsExpanded()) {
        const cellElement = row.getCell(me.treeColumn.id); // Toggle cell's expanded/collapsed state

        cellElement && row.renderCell(cellElement);
      } // Add a temporary cls, used by Scheduler & Gantt to prevent transitions on events/tasks
      // Block multiple applications in the case of a recursive collapseAll operation

      if (!me.isTogglingNode) {
        grid.element.classList.add('b-toggling-node');
        me.isTogglingNode = true;
        me.requestAnimationFrame(() => {
          grid.element.classList.remove('b-toggling-node');
          me.isTogglingNode = false;
        });
      }

      grid.trigger(meta.collapsed ? 'collapseNode' : 'expandNode', {
        source: grid,
        record
      });
      grid.trigger('toggleNode', {
        source: grid,
        record,
        collapse: meta.collapsed
      });
    }
  }
  /**
   * Collapse a single node. This function is exposed on Grid and can thus be called as `grid.collapse()`
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node to collapse
   * @returns {Promise}
   */

  async collapse(idOrRecord) {
    return this.toggleCollapse(idOrRecord, true);
  }
  /**
   * Expand a single node. This function is exposed on Grid and can thus be called as `grid.expand()`
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node to expand
   * @returns {Promise}
   */

  async expand(idOrRecord) {
    return this.toggleCollapse(idOrRecord, false);
  }

  onBeforeToggleNode({
    record,
    collapse
  }) {
    this.grid.trigger('beforeToggleNode', {
      record,
      collapse
    });
  }

  onBeforeLoadChildren({
    source: store,
    params
  }) {
    const parent = store.getById(params[store.modelClass.idField]),
          row = this.grid.rowManager.getRowFor(parent);

    if (row) {
      row.addCls('b-loading-children');
    }
  }

  onLoadChildren({
    source: store,
    params
  }) {
    const parent = store.getById(params[store.modelClass.idField]),
          row = this.grid.rowManager.getRowFor(parent);

    if (row) {
      row.removeCls('b-loading-children');
    }
  }

  onLoadChildrenException({
    record
  }) {
    const row = this.grid.rowManager.getRowFor(record);

    if (row) {
      row.removeCls('b-loading-children');
    }
  }
  /**
   * Expand or collapse all nodes, as specified by param, starting at the passed node (which defaults to the root node)
   * @param {Boolean} [collapse] Set to true to collapse, false to expand (defaults to true)
   * @param {Core.data.Model} [topNode] The topmost node from which to cascade a collapse.
   * Defaults to the {@link Core.data.Store#property-rootNode}. Not included in the cascade if
   * the root node is being used.
   * @returns {Promise}
   */

  expandOrCollapseAll(collapse = true, topNode = this.store.rootNode) {
    // TODO: Some logic here and some in the store, keep in same place maybe
    const {
      grid,
      store
    } = this,
          promises = [],
          childRecords = [];
    grid.trigger('beforeToggleAllNodes', {
      source: grid,
      collapse
    }); // Each collapse/expand will trigger events on store, avoid that by suspending

    store.suspendEvents();
    store.traverse(record => {
      const gridMeta = record.instanceMeta(store);

      if (!record.isLeaf) {
        if (collapse && !gridMeta.collapsed) {
          this.toggleCollapse(record, true, true);
          childRecords.push(...record.children);
        } else if (!collapse && gridMeta.collapsed) {
          if (Array.isArray(record.children)) {
            childRecords.push(...record.children);
          }

          promises.push(this.toggleCollapse(record, false, true));
        }
      }
    }, topNode, topNode === store.rootNode);
    store.resumeEvents();
    return (collapse ? immediatePromise : Promise.all(promises)).then(() => {
      // Return to top when collapsing all
      grid.refreshRows(collapse);

      if (childRecords.length) {
        if (collapse) {
          store.trigger('remove', {
            records: childRecords,
            isCollapse: true,
            isCollapseAll: true
          });
        } else {
          store.trigger('add', {
            records: childRecords,
            isExpand: true,
            isExpandAll: true
          });
        }
      }

      grid.trigger('toggleAllNodes', {
        source: grid,
        collapse
      });
    });
  }
  /**
   * Collapse all nodes. This function is exposed on Grid and can thus be called as `grid.collapseAll()`
   * @returns {Promise}
   */

  async collapseAll() {
    return this.expandOrCollapseAll(true);
  }
  /**
   * Expand all nodes. This function is exposed on Grid and can thus be called as `grid.expandAll()`
   * @returns {Promise}
   */

  async expandAll() {
    return this.expandOrCollapseAll(false);
  }
  /**
   * Expands parent nodes to make this node "visible". This function is exposed on Grid and can thus be called as
   * `grid.expandTo()`
   * @param {String|Number|Core.data.Model} idOrRecord Record (the node itself) or id of a node
   * @returns {Promise}
   */

  async expandTo(idOrRecord) {
    const me = this,
          {
      store
    } = me,
          record = store.getById(idOrRecord); // Hidden because it's in a collapsed Group: abort

    if (record.instanceMeta(me.store).hiddenByCollapse === false) return; // Expand any parents that need to be expanded to allow the record to be rendered.

    if (!record.ancestorsExpanded()) {
      const parents = []; // Collect parents which need expanding

      for (let parent = record.parent; parent && !parent.isRoot; parent = parent.parent) {
        if (!parent.isExpanded(store)) {
          parents.unshift(parent);
        }
      } // Expand them from the top down

      await parents.forEach(async parent => {
        if (!me.isDestroyed) {
          await me.toggleCollapse(parent, false, true);
        }
      }); // Refreshing on expand was inhibited in toggleCollapse calls

      me.grid.refreshRows();
    }

    if (!me.isDestroyed) {
      await me.grid.scrollRowIntoView(record);
    }
  } //endregion
  //region Renderer
  //endregion
  //region Events

  /**
   * Called when user clicks somewhere in the grid. Expand/collapse node on icon click.
   * @private
   */

  onElementClick(event) {
    const me = this,
          target = event.target,
          cellData = me.grid.getCellDataFromEvent(event),
          clickedExpander = target.closest('.b-tree-expander'); // Checks if click is on node expander icon, then toggles expand/collapse. Also toggles on entire cell if expandOnCellClick is true

    if (clickedExpander || me.expandOnCellClick && cellData !== null && cellData !== void 0 && cellData.record.isParent) {
      clickedExpander && event.preventDefault();
      me.toggleCollapse(cellData.record);
    }
  }
  /**
   * Called on key down in grid. Expand/collapse node on [space]
   * @private
   */

  onElementKeyDown(event) {
    var _grid$focusedCell;

    const grid = this.grid; // Only catch space on grid cell element, not in header, editors etc...

    if (((_grid$focusedCell = grid.focusedCell) === null || _grid$focusedCell === void 0 ? void 0 : _grid$focusedCell.rowIndex) > -1 && !grid.focusedCell.isActionable && event.key === ' ') {
      event.preventDefault();
      this.toggleCollapse(grid.focusedCell.id); // Other features (like context menu) must not process this.

      event.handled = true;
    }
  } //endregion

  onArrowRight(event) {
    const me = this,
          {
      grid
    } = me,
          {
      focusedCell
    } = grid,
          record = focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.record; // shift triggers tree navigation behaviour, also used by default for single column which is tree

    if (focusedCell !== null && focusedCell !== void 0 && focusedCell.column.tree && (event.shiftKey || grid.columns.count === 1)) {
      // on collapsed parent, expand
      if (record.isParent && record.instanceMeta(grid.store).collapsed) {
        me.expand(record);
      } // otherwise go down
      else {
        grid.onArrowDown(event);
      }

      return false;
    }
  }

  onArrowLeft(event) {
    const me = this,
          {
      grid
    } = me,
          {
      focusedCell
    } = grid,
          record = focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.record; // shift triggers tree navigation behaviour, also used by default for single column which is tree

    if (focusedCell !== null && focusedCell !== void 0 && focusedCell.column.tree && (event.shiftKey || grid.columns.count === 1)) {
      // on expanded parent, collapse
      if (record.isParent && !record.instanceMeta(grid.store).collapsed) {
        me.collapse(record);
      } // otherwise go to parent
      else if (record.parent && !record.parent.isRoot) {
        grid.focusCell({
          record: record.parent,
          column: focusedCell.column
        });
      }

      return false;
    }
  }

}
Tree.featureClass = 'b-tree';
Tree._$name = 'Tree';
GridFeatureManager.registerFeature(Tree, false, 'Grid');
GridFeatureManager.registerFeature(Tree, true, 'TreeGrid');

export { Tree, TreeColumn };
//# sourceMappingURL=Tree.js.map
