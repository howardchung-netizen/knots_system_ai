import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _createSuper from "@babel/runtime/helpers/esm/createSuper";

/**
 * React wrapper for Bryntum AssignmentGrid
 */
import React, { Component } from 'react';
import WrapperHelper from './WrapperHelper.js';
import { AssignmentGrid } from '@bryntum/gantt';

var BryntumAssignmentGrid = /*#__PURE__*/function (_Component) {
  _inherits(BryntumAssignmentGrid, _Component);

  var _super = _createSuper(BryntumAssignmentGrid);

  function BryntumAssignmentGrid() {
    var _this;

    _classCallCheck(this, BryntumAssignmentGrid);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.configNames = ['adopt', 'align', 'anchor', 'animateRemovingRows', 'appendTo', 'ariaDescription', 'ariaLabel', 'autoHeight', 'bbar', 'bodyCls', 'bubbleEvents', 'callOnFunctions', 'centered', 'cls', 'collapsed', 'collapsible', 'columns', 'config', 'constrainTo', 'contentElementCls', 'contextMenuTriggerEvent', 'defaultBindProperty', 'defaultFocus', 'defaultRegion', 'defaults', 'destroyStore', 'disableGridRowModelWarning', 'dock', 'draggable', 'emptyText', 'enableSticky', 'enableTextSelection', 'enableUndoRedoKeys', 'features', 'fillLastColumn', 'fixedRowHeight', 'floating', 'footer', 'fullRowRefresh', 'getRowHeight', 'header', 'hideAnimation', 'hideHeaders', 'hideWhenEmpty', 'htmlCls', 'insertBefore', 'insertFirst', 'itemCls', 'lazyItems', 'listeners', 'loadMask', 'loadMaskDefaults', 'loadMaskError', 'localeClass', 'localizableProperties', 'longPressTime', 'maskDefaults', 'masked', 'monitorResize', 'namedItems', 'owner', 'plugins', 'positioned', 'preserveFocusOnDatasetChange', 'preserveScrollOnDatasetChange', 'preventTooltipOnTouch', 'projectEvent', 'resizeToFitIncludesHeader', 'resourceColumn', 'responsiveLevels', 'ripple', 'rootElement', 'scrollAction', 'scrollerClass', 'scrollManager', 'selectionMode', 'showAnimation', 'showDirty', 'showTooltipWhenDisabled', 'stateful', 'statefulEvents', 'stateId', 'stateProvider', 'strips', 'subGridConfigs', 'syncMask', 'tab', 'tag', 'tbar', 'textAlign', 'textContent', 'title', 'trapFocus', 'ui', 'unitsColumn', 'weight'];
    _this.propertyConfigNames = ['alignSelf', 'columnLines', 'content', 'data', 'dataset', 'disabled', 'extraData', 'flex', 'height', 'hidden', 'html', 'id', 'items', 'layout', 'layoutStyle', 'margin', 'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'onBeforeCellEditStart', 'onBeforeColumnDragStart', 'onBeforeColumnDropFinalize', 'onBeforeCopy', 'onBeforeDestroy', 'onBeforeFinishCellEdit', 'onBeforeHide', 'onBeforePaste', 'onBeforePdfExport', 'onBeforeRenderRow', 'onBeforeRenderRows', 'onBeforeSetRecord', 'onBeforeShow', 'onBeforeToggleNode', 'onCancelCellEdit', 'onCatchAll', 'onCellClick', 'onCellContextMenu', 'onCellDblClick', 'onCellMenuBeforeShow', 'onCellMenuItem', 'onCellMenuShow', 'onCellMenuToggleItem', 'onCellMouseOut', 'onCellMouseOver', 'onCollapseNode', 'onColumnDragStart', 'onColumnDrop', 'onContextMenuItem', 'onContextMenuToggleItem', 'onDataChange', 'onDestroy', 'onExpandNode', 'onFinishCellEdit', 'onFocusIn', 'onFocusOut', 'onHeaderMenuBeforeShow', 'onHeaderMenuItem', 'onHeaderMenuShow', 'onHeaderMenuToggleItem', 'onHide', 'onMouseOut', 'onMouseOver', 'onPaint', 'onPdfExport', 'onReadOnly', 'onRenderRow', 'onRenderRows', 'onResize', 'onResponsive', 'onScroll', 'onSelectionChange', 'onShow', 'onStartCellEdit', 'onSubGridCollapse', 'onSubGridExpand', 'onToggleNode', 'onToolClick', 'readOnly', 'rowHeight', 'scrollable', 'store', 'tools', 'tooltip', 'transitionDuration', 'width', 'x', 'y'];
    _this.propertyNames = ['anchorSize', 'isSettingValues', 'isValid', 'record', 'selectedCell', 'selectedRecord', 'selectedRecords', 'state', 'type', 'values'];
    _this.instance = undefined;
    _this.element = undefined;
    return _this;
  }

  _createClass(BryntumAssignmentGrid, [{
    key: "componentDidMount",
    value:
    /**
     * Invoked immediately after a component is mounted (inserted into the tree)
     */
    function componentDidMount() {
      var _WrapperHelper = WrapperHelper(),
          createWidget = _WrapperHelper.createWidget;

      this.instance = createWidget(this);
    } // React component removed, destroy instance

  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this.instance) {
        this.instance.destroy();
      }
    }
    /**
     * Component about to be updated, from changing a prop using state.
     * React to it depending on what changed and prevent react from re-rendering our component.
     * @param nextProps
     * @param nextState
     * @return {boolean}
     */

  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      var _WrapperHelper2 = WrapperHelper(),
          shouldComponentUpdate = _WrapperHelper2.shouldComponentUpdate;

      return shouldComponentUpdate(this, nextProps, nextState);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var className = "b-react-".concat(this.constructor.instanceClass.$name.toLowerCase(), "-container");
      return /*#__PURE__*/React.createElement("div", {
        className: className,
        ref: function ref(element) {
          return _this2.element = element;
        }
      });
    }
  }]);

  return BryntumAssignmentGrid;
}(Component);

BryntumAssignmentGrid.instanceClass = AssignmentGrid;
export { BryntumAssignmentGrid as default };