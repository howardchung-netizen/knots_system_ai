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
import { NumberFormat, LocalizableComboItems } from './LocalizableComboItems.js';
import { ObjectHelper, InstancePlugin, DomHelper, Combo } from './Editor.js';

/**
 * @module Grid/column/NumberColumn
 */

/**
 * A column for showing/editing numbers.
 *
 * Default editor is a {@link Core.widget.NumberField NumberField}.
 *
 * @extends Grid/column/Column
 * @example
 * new Grid({
 *     appendTo : document.body,
 *
 *     columns : [
 *         { type: 'number', min: 0, max : 100, field: 'score' }
 *     ]
 * });
 *
 * @classType number
 * @inlineexample Grid/column/NumberColumn.js
 */

class NumberColumn extends Column {
  //region Config
  static get type() {
    return 'number';
  } // Type to use when auto adding field

  static get fieldType() {
    return 'number';
  }

  static get fields() {
    return ['format',
    /**
     * The minimum value for the field used during editing.
     * @config {Number} min
     * @category Common
     */
    'min',
    /**
     * The maximum value for the field used during editing.
     * @config {Number} max
     * @category Common
     */
    'max',
    /**
     * Step size for the field used during editing.
     * @config {Number} step
     * @category Common
     */
    'step',
    /**
     * Large step size for the field used during editing. In effect for `SHIFT + click/arrows`
     * @config {Number} largeStep
     * @category Common
     */
    'largeStep',
    /**
     * Unit to append to displayed value.
     * @config {String} unit
     * @category Common
     */
    'unit'];
  }

  static get defaults() {
    return {
      filterType: 'number',

      /**
       * The format to use for rendering numbers.
       *
       * By default, the locale's default number formatter is used. For `en-US`, the
       * locale default is a maximum of 3 decimal digits, using thousands-based grouping.
       * This would render the number `1234567.98765` as `'1,234,567.988'`.
       *
       * @config {String|Object|Core.helper.util.NumberFormat}
       */
      format: ''
    };
  }

  constructor(config, store) {
    super(...arguments);
    this.internalCellCls = 'b-number-cell';
  } //endregion
  //region Init

  get defaultEditor() {
    const {
      format,
      name,
      max,
      min,
      step,
      largeStep,
      align
    } = this; // Remove any undefined configs, to allow config system to use default values instead

    return ObjectHelper.cleanupProperties({
      type: 'numberfield',
      format,
      name,
      max,
      min,
      step,
      largeStep,
      textAlign: align
    });
  }

  get formatter() {
    const me = this,
          {
      format
    } = me;
    let formatter = me._formatter;

    if (!formatter || me._lastFormat !== format) {
      me._formatter = formatter = NumberFormat.get(me._lastFormat = format);
    }

    return formatter;
  }
  /**
   * Renderer that displays value + optional unit in the cell
   * @private
   */

  defaultRenderer({
    value
  }) {
    var _value;

    if (value != null) {
      value = this.formatter.format(value);

      if (this.unit) {
        value = `${value}${this.unit}`;
      }
    }

    return (_value = value) !== null && _value !== void 0 ? _value : '';
  }

}
ColumnStore.registerColumnType(NumberColumn, true);
NumberColumn.exposeProperties();
NumberColumn._$name = 'NumberColumn';

/**
 * @module Grid/feature/RegionResize
 */

/**
 * Makes the splitter between grid section draggable so you can resize grid sections.
 *
 * This feature is <strong>disabled</strong> by default.
 *
 * @extends Core/mixin/InstancePlugin
 *
 * @example
 * // enable RegionResize
 * let grid = new Grid({
 *   features: {
 *     regionResize: true
 *   }
 * });
 *
 * @demo Grid/features
 * @classtype regionResize
 * @inlineexample Grid/feature/RegionResize.js
 * @feature
 */

class RegionResize extends InstancePlugin {
  // region Init
  static get $name() {
    return 'RegionResize';
  }

  construct(grid, config) {
    this.grid = grid;
    super.construct(grid, config);
  }

  doDestroy() {
    // TODO: Cleanup
    super.doDestroy();
  } //endregion
  //region Plugin config
  // Plugin configuration. This plugin chains some of the functions in Grid.

  static get pluginConfig() {
    return {
      chain: ['onElementTouchStart', 'onElementTouchMove', 'onElementTouchEnd', 'onElementMouseDown', 'onElementMouseMove', 'onElementDblClick', 'onElementMouseUp', 'onSubGridCollapse', 'onSubGridExpand', 'render']
    };
  } //endregion

  onElementDblClick(event) {
    const me = this,
          grid = me.grid,
          splitterEl = DomHelper.up(event.target, '.b-grid-splitter-collapsed'); // If collapsed splitter is dblclicked and region is not expanding
    // It is unlikely that user might dblclick splitter twice and even if he does, nothing should happen.
    // But just in case lets not expand twice.

    if (splitterEl && !me.expanding) {
      me.expanding = true;
      let region = splitterEl.dataset.region,
          subGrid = grid.getSubGrid(region); // Usually collapsed splitter means corresponding region is collapsed. But in case of last two regions one
      // splitter can be collapsed in two directions. So, if corresponding region is expanded then last one is collapsed

      if (!subGrid.collapsed) {
        region = grid.getLastRegions()[1];
        subGrid = grid.getSubGrid(region);
      }

      subGrid.expand().then(() => me.expanding = false);
    }
  } //region Move splitter

  /**
   * Begin moving splitter.
   * @private
   * @param splitterElement Splitter element
   * @param clientX Initial x position from which new width will be calculated on move
   */

  startMove(splitterElement, clientX) {
    const me = this,
          {
      grid
    } = me,
          region = splitterElement.dataset.region,
          gridEl = grid.element,
          nextRegion = grid.regions[grid.regions.indexOf(region) + 1],
          nextSubGrid = grid.getSubGrid(nextRegion),
          splitterSubGrid = grid.getSubGrid(region);
    let subGrid = splitterSubGrid,
        flip = 1;

    if (subGrid.flex != null) {
      // If subgrid has flex, check if next one does not
      if (nextSubGrid.flex == null) {
        subGrid = nextSubGrid;
        flip = -1;
      }
    }

    if (grid.rtl) {
      flip *= -1;
    }

    if (splitterElement.classList.contains('b-grid-splitter-collapsed')) {
      return;
    }

    const availableWidth = subGrid.element.offsetWidth + nextSubGrid.element.offsetWidth;
    me.dragContext = {
      element: splitterElement,
      headerEl: subGrid.header.element,
      subGridEl: subGrid.element,
      subGrid,
      splitterSubGrid,
      originalWidth: subGrid.element.offsetWidth,
      originalX: clientX,
      minWidth: subGrid.minWidth || 0,
      maxWidth: Math.min(availableWidth, subGrid.maxWidth || availableWidth),
      flip
    };
    gridEl.classList.add('b-moving-splitter');
    splitterSubGrid.toggleSplitterCls('b-moving');
  }
  /**
   * Stop moving splitter.
   * @private
   */

  endMove() {
    const dragContext = this.dragContext;

    if (dragContext) {
      this.grid.element.classList.remove('b-moving-splitter');
      dragContext.splitterSubGrid.toggleSplitterCls('b-moving', false);
      this.dragContext = null;
    }
  }

  onCollapseClick(subGrid, splitterEl) {
    const me = this,
          grid = me.grid,
          region = splitterEl.dataset.region,
          regions = grid.getLastRegions(); // Last splitter in the grid is responsible for collapsing/expanding last 2 regions and is always related to the
    // left one. Check if we are working with last splitter

    if (regions[0] === region) {
      const lastSubGrid = grid.getSubGrid(regions[1]);

      if (lastSubGrid.collapsed) {
        lastSubGrid.expand();
        return;
      }
    }

    subGrid.collapse();
  }

  onExpandClick(subGrid, splitterEl) {
    const me = this,
          grid = me.grid,
          region = splitterEl.dataset.region,
          regions = grid.getLastRegions(); // Last splitter in the grid is responsible for collapsing/expanding last 2 regions and is always related to the
    // left one. Check if we are working with last splitter

    if (regions[0] === region) {
      if (!subGrid.collapsed) {
        const lastSubGrid = grid.getSubGrid(regions[1]);
        lastSubGrid.collapse();
        return;
      }
    }

    subGrid.expand();
  }
  /**
   * Update splitter position.
   * @private
   * @param newClientX
   */

  updateMove(newClientX) {
    const {
      dragContext
    } = this;

    if (dragContext) {
      const difX = newClientX - dragContext.originalX,
            newWidth = Math.min(dragContext.maxWidth, dragContext.originalWidth + difX * dragContext.flip); // SubGrids monitor their own size and keep any splitters synced

      dragContext.subGrid.width = Math.max(newWidth, dragContext.minWidth);
    }
  } //endregion
  //region Events

  /**
   * Start moving splitter on touch start.
   * @private
   * @param event
   */

  onElementTouchStart(event) {
    const target = event.target.closest('.b-grid-splitter');

    if (target) {
      this.startMove(target, event.touches[0].clientX);
    }
  }
  /**
   * Move splitter on touch move.
   * @private
   * @param event
   */

  onElementTouchMove(event) {
    if (this.dragContext) {
      this.updateMove(event.touches[0].clientX);
      event.preventDefault();
    }
  }
  /**
   * Stop moving splitter on touch end.
   * @private
   * @param event
   */

  onElementTouchEnd(event) {
    if (this.dragContext) {
      this.endMove();
      event.preventDefault();
    }
  }
  /**
   * Start moving splitter on mouse down (on splitter).
   * @private
   * @param event
   */

  onElementMouseDown(event) {
    const me = this,
          {
      target
    } = event,
          // Only care about left clicks, avoids a bug found by monkeys
    splitter = event.button === 0 && target.closest(':not(.b-row-reordering):not(.b-dragging-event):not(.b-dragging-task):not(.b-dragging-header):not(.b-dragselecting) .b-grid-splitter'),
          subGrid = splitter && me.grid.getSubGrid(splitter.dataset.region),
          {
      classList
    } = target;

    if (splitter) {
      // In case of touch screen inner splitter has 100% height and we should handle
      // it as target too
      if (classList.contains('b-grid-splitter') || classList.contains('b-grid-splitter-inner')) {
        me.startMove(splitter, event.clientX);
      } else if (classList.contains('b-icon-collapse-gridregion')) {
        me.onCollapseClick(subGrid, splitter);
      } else if (classList.contains('b-icon-expand-gridregion')) {
        me.onExpandClick(subGrid, splitter);
      }
    }
  }
  /**
   * Move splitter on mouse move.
   * @private
   * @param event
   */

  onElementMouseMove(event) {
    if (this.dragContext) {
      this.updateMove(event.clientX);
      event.preventDefault();
    }
  }
  /**
   * Stop moving splitter on mouse up.
   * @private
   * @param event
   */

  onElementMouseUp(event) {
    if (this.dragContext) {
      this.endMove();
      event.preventDefault();
    }
  }

  onSubGridCollapse({
    subGrid
  }) {
    const splitterEl = this.grid.resolveSplitter(subGrid),
          regions = this.grid.getLastRegions(); // if last region was collapsed

    if (regions[1] === subGrid.region) {
      splitterEl.classList.add('b-grid-splitter-allow-collapse');
    }
  }

  onSubGridExpand({
    subGrid
  }) {
    const splitterEl = this.grid.resolveSplitter(subGrid);
    splitterEl.classList.remove('b-grid-splitter-allow-collapse');
  } //endregion

  render() {
    const {
      regions,
      subGrids
    } = this.grid; // Multiple regions, only allow collapsing to the edges by hiding buttons

    if (regions.length > 2) {
      // Only works in a 3 subgrid scenario. To support more subgrids we have to merge splitters or something
      // on collapse. Not going down that path currently...
      subGrids[regions[0]].splitterElement.classList.add('b-left-only');
      subGrids[regions[1]].splitterElement.classList.add('b-right-only');
    }
  }

}
RegionResize.featureClass = 'b-split';
RegionResize._$name = 'RegionResize';
GridFeatureManager.registerFeature(RegionResize);

class LocalizableCombo extends LocalizableComboItems(Combo) {
  static get $name() {
    return 'LocalizableCombo';
  } // Factoryable type name

  static get type() {
    return 'localizablecombo';
  }

} // Register this widget type with its Factory

LocalizableCombo.initClass();
LocalizableCombo._$name = 'LocalizableCombo';

export { LocalizableCombo, NumberColumn, RegionResize };
//# sourceMappingURL=LocalizableCombo.js.map
