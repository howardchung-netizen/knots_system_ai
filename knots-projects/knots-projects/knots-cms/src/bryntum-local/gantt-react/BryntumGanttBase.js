import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _createSuper from "@babel/runtime/helpers/esm/createSuper";

/**
 * React wrapper for Bryntum GanttBase
 */
import React, { Component } from 'react';
import WrapperHelper from './WrapperHelper.js';
import { GanttBase } from '@bryntum/gantt';

var BryntumGanttBase = /*#__PURE__*/function (_Component) {
  _inherits(BryntumGanttBase, _Component);

  var _super = _createSuper(BryntumGanttBase);

  function BryntumGanttBase() {
    var _this;

    _classCallCheck(this, BryntumGanttBase);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.projectStores = true;
    _this.featureNames = ['baselinesFeature', 'cellEditFeature', 'cellMenuFeature', 'cellTooltipFeature', 'columnAutoWidthFeature', 'columnDragToolbarFeature', 'columnLinesFeature', 'columnPickerFeature', 'columnReorderFeature', 'columnResizeFeature', 'criticalPathsFeature', 'dependenciesFeature', 'dependencyEditFeature', 'eventFilterFeature', 'excelExporterFeature', 'filterFeature', 'filterBarFeature', 'groupFeature', 'groupSummaryFeature', 'headerMenuFeature', 'headerZoomFeature', 'indicatorsFeature', 'labelsFeature', 'mergeCellsFeature', 'mspExportFeature', 'multipageFeature', 'multipageverticalFeature', 'nonWorkingTimeFeature', 'panFeature', 'parentAreaFeature', 'pdfExportFeature', 'percentBarFeature', 'progressLineFeature', 'projectLinesFeature', 'quickFindFeature', 'regionResizeFeature', 'rollupsFeature', 'rowCopyPasteFeature', 'rowReorderFeature', 'scheduleMenuFeature', 'scheduleTooltipFeature', 'searchFeature', 'singlepageFeature', 'sortFeature', 'stickyCellsFeature', 'stripeFeature', 'summaryFeature', 'taskCopyPasteFeature', 'taskDragFeature', 'taskDragCreateFeature', 'taskEditFeature', 'taskMenuFeature', 'taskResizeFeature', 'taskTooltipFeature', 'timeAxisHeaderMenuFeature', 'timeRangesFeature', 'treeFeature', 'treeGroupFeature'];
    _this.portalsCache = undefined;
    _this.portalContainerClass = 'b-react-portal-container';
    _this.state = {
      // Holds React portals
      portals: new Map(),
      // Needed to trigger refresh when portals change
      generation: 0
    };
    _this.dataStores = {
      'assignmentStore': 'assignments',
      'calendarManagerStore': 'calendars',
      'dependencyStore': 'dependencies',
      'eventStore': 'events',
      'resourceStore': 'resources',
      'taskStore': 'tasks',
      'timeRangeStore': 'timeRanges'
    };
    _this.configNames = ['adopt', 'align', 'allowCreate', 'allowOver', 'anchor', 'anchorToTarget', 'animateRemovingRows', 'appendTo', 'ariaDescription', 'ariaLabel', 'autoAdjustTimeAxis', 'autoClose', 'autoHeight', 'autoShow', 'bbar', 'bodyCls', 'bubbleEvents', 'bufferCoef', 'bufferThreshold', 'callOnFunctions', 'centered', 'closable', 'closeAction', 'cls', 'collapsed', 'collapsible', 'columns', 'config', 'constrainTo', 'contentElementCls', 'contextMenuTriggerEvent', 'creationTooltip', 'cycleResolutionPopupClass', 'defaultBindProperty', 'defaultFocus', 'defaultRegion', 'defaultResourceImageName', 'defaults', 'dependencyIdField', 'destroyStore', 'disableGridRowModelWarning', 'dismissDelay', 'displaySchedulingIssueResolutionPopup', 'dock', 'draggable', 'durationDisplayPrecision', 'emptyText', 'enableDeleteKey', 'enableEventAnimations', 'enableRecurringEvents', 'enableSticky', 'enableTextSelection', 'enableUndoRedoKeys', 'eventStyle', 'features', 'fillLastColumn', 'fixedRowHeight', 'floating', 'focusOnToFront', 'footer', 'forceFit', 'forElement', 'forSelector', 'fullRowRefresh', 'getDateConstraints', 'getHtml', 'getRowHeight', 'header', 'hideAnimation', 'hideDelay', 'hideHeaders', 'hideOnDelegateChange', 'hideWhenEmpty', 'hoverDelay', 'htmlCls', 'infiniteScroll', 'insertBefore', 'insertFirst', 'itemCls', 'lazyItems', 'listeners', 'loadingMsg', 'loadMask', 'loadMaskDefaults', 'loadMaskError', 'localeClass', 'localizableProperties', 'longPressTime', 'managedEventSizing', 'maskDefaults', 'masked', 'maximizable', 'maximized', 'modal', 'monitorResize', 'mouseOffsetX', 'mouseOffsetY', 'namedItems', 'newTaskDefaults', 'owner', 'partner', 'plugins', 'positioned', 'preserveFocusOnDatasetChange', 'preserveScrollOnDatasetChange', 'preventTooltipOnTouch', 'projectProgressReporting', 'resizeToFitIncludesHeader', 'resourceImageFolderPath', 'responsiveLevels', 'ripple', 'rootElement', 'schedulingIssueResolutionPopupClass', 'scrollAction', 'scrollerClass', 'scrollManager', 'scrollTaskIntoViewOnCellClick', 'selectionMode', 'showAnimation', 'showCreationTooltip', 'showDirty', 'showOnClick', 'showOnHover', 'showTooltipWhenDisabled', 'snapRelativeToEventStartDate', 'stateful', 'statefulEvents', 'stateId', 'stateProvider', 'stickyHeaders', 'strips', 'subGridConfigs', 'suppressFit', 'syncMask', 'tab', 'tag', 'taskRenderer', 'tbar', 'terminalCls', 'terminalSides', 'textAlign', 'textContent', 'timeAxis', 'title', 'trackMouse', 'trapFocus', 'ui', 'visibleDate', 'visibleZoomFactor', 'weekStartDay', 'weight', 'zoomKeepsOriginalTimespan', 'zoomOnMouseWheel', 'zoomOnTimeAxisDoubleClick'];
    _this.propertyConfigNames = ['alignSelf', 'allowDropOnEventBar', 'assignments', 'barMargin', 'calendars', 'columnLines', 'content', 'data', 'dataset', 'dependencies', 'disabled', 'displayDateFormat', 'endDate', 'eventColor', 'extraData', 'flex', 'height', 'hidden', 'html', 'id', 'items', 'layout', 'layoutStyle', 'margin', 'maxHeight', 'maxWidth', 'maxZoomLevel', 'minHeight', 'minWidth', 'minZoomLevel', 'onAfterDependencyCreateDrop', 'onAfterDependencySave', 'onAfterDragCreate', 'onAfterEventSave', 'onAfterTaskDrop', 'onAfterTaskSave', 'onBeforeAssignmentDelete', 'onBeforeCellEditStart', 'onBeforeColumnDragStart', 'onBeforeColumnDropFinalize', 'onBeforeCopy', 'onBeforeDependencyAdd', 'onBeforeDependencyCreateDrag', 'onBeforeDependencyCreateFinalize', 'onBeforeDependencyDelete', 'onBeforeDependencyEdit', 'onBeforeDependencyEditShow', 'onBeforeDependencySave', 'onBeforeDestroy', 'onBeforeDragCreate', 'onBeforeDragCreateFinalize', 'onBeforeEventDelete', 'onBeforeEventResize', 'onBeforeEventResizeFinalize', 'onBeforeEventSave', 'onBeforeFinishCellEdit', 'onBeforeHide', 'onBeforeMspExport', 'onBeforePaste', 'onBeforePdfExport', 'onBeforePresetChange', 'onBeforeRenderRow', 'onBeforeRenderRows', 'onBeforeSetRecord', 'onBeforeShow', 'onBeforeTaskDelete', 'onBeforeTaskDrag', 'onBeforeTaskDropFinalize', 'onBeforeTaskEdit', 'onBeforeTaskEditShow', 'onBeforeTaskResize', 'onBeforeTaskResizeFinalize', 'onBeforeTaskSave', 'onBeforeToggleNode', 'onCancelCellEdit', 'onCatchAll', 'onCellClick', 'onCellContextMenu', 'onCellDblClick', 'onCellMenuBeforeShow', 'onCellMenuItem', 'onCellMenuShow', 'onCellMenuToggleItem', 'onCellMouseOut', 'onCellMouseOver', 'onCollapseNode', 'onColumnDragStart', 'onColumnDrop', 'onContextMenuItem', 'onContextMenuToggleItem', 'onDataChange', 'onDependencyClick', 'onDependencyCreateDragStart', 'onDependencyCreateDrop', 'onDependencyDblClick', 'onDependencyMouseOut', 'onDependencyMouseOver', 'onDependencyValidationComplete', 'onDependencyValidationStart', 'onDestroy', 'onDragCreateEnd', 'onDragCreateStart', 'onEventMenuBeforeShow', 'onEventMenuItem', 'onEventMenuShow', 'onEventPartialResize', 'onEventResizeEnd', 'onEventResizeStart', 'onExpandNode', 'onFinishCellEdit', 'onFocusIn', 'onFocusOut', 'onHeaderMenuBeforeShow', 'onHeaderMenuItem', 'onHeaderMenuShow', 'onHeaderMenuToggleItem', 'onHide', 'onMouseOut', 'onMouseOver', 'onMspExport', 'onNavigate', 'onPaint', 'onPdfExport', 'onPresetChange', 'onReadOnly', 'onReleaseTask', 'onRenderRow', 'onRenderRows', 'onRenderTask', 'onResize', 'onResponsive', 'onScheduleMenuBeforeShow', 'onScheduleMenuItem', 'onScheduleMenuShow', 'onScroll', 'onSelectionChange', 'onShow', 'onStartCellEdit', 'onSubGridCollapse', 'onSubGridExpand', 'onTaskClick', 'onTaskContextMenu', 'onTaskDblClick', 'onTaskDrag', 'onTaskDragStart', 'onTaskDrop', 'onTaskKeyDown', 'onTaskKeyUp', 'onTaskMenuBeforeShow', 'onTaskMenuItem', 'onTaskMenuShow', 'onTaskMouseDown', 'onTaskMouseOut', 'onTaskMouseOver', 'onTaskMouseUp', 'onTaskPartialResize', 'onTaskResizeEnd', 'onTaskResizeStart', 'onTimeAxisChange', 'onTimeAxisHeaderClick', 'onTimeAxisHeaderContextMenu', 'onTimeAxisHeaderContextMenuBeforeShow', 'onTimeAxisHeaderContextMenuItem', 'onTimeAxisHeaderContextMenuShow', 'onTimeAxisHeaderDblClick', 'onTimelineViewportResize', 'onToggleNode', 'onToolClick', 'presets', 'project', 'readOnly', 'resources', 'rowHeight', 'scrollable', 'snap', 'startDate', 'store', 'tasks', 'taskStore', 'tickSize', 'timeRanges', 'toggleParentTasksOnClick', 'tools', 'tooltip', 'transitionDuration', 'viewPreset', 'width', 'workingTime', 'x', 'y'];
    _this.propertyNames = ['anchorSize', 'eventColors', 'eventStyles', 'isSettingValues', 'isValid', 'record', 'scrollLeft', 'scrollTop', 'selectedCell', 'selectedRecord', 'selectedRecords', 'state', 'timeResolution', 'type', 'values', 'zoomLevel'];
    _this.instance = undefined;
    _this.element = undefined;
    return _this;
  }

  _createClass(BryntumGanttBase, [{
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
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: className,
        ref: function ref(element) {
          return _this2.element = element;
        }
      }, _toConsumableArray(this.state.portals).map(function (item) {
        return item[1];
      })), /*#__PURE__*/React.createElement("div", {
        ref: function ref(el) {
          return _this2.portalsCache = el;
        },
        className: "b-react-portals-cache",
        style: {
          display: 'none'
        }
      }));
    }
  }]);

  return BryntumGanttBase;
}(Component);

BryntumGanttBase.instanceClass = GanttBase;
BryntumGanttBase.isView = true;
export { BryntumGanttBase as default };