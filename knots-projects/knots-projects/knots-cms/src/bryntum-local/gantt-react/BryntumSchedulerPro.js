import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _createSuper from "@babel/runtime/helpers/esm/createSuper";

/**
 * React wrapper for Bryntum SchedulerPro
 */
import React, { Component } from 'react';
import WrapperHelper from './WrapperHelper.js';
import { SchedulerPro } from '@bryntum/gantt';

var BryntumSchedulerPro = /*#__PURE__*/function (_Component) {
  _inherits(BryntumSchedulerPro, _Component);

  var _super = _createSuper(BryntumSchedulerPro);

  function BryntumSchedulerPro() {
    var _this;

    _classCallCheck(this, BryntumSchedulerPro);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.projectStores = false;
    _this.featureNames = ['calendarHighlightFeature', 'cellEditFeature', 'cellMenuFeature', 'cellTooltipFeature', 'columnAutoWidthFeature', 'columnDragToolbarFeature', 'columnLinesFeature', 'columnPickerFeature', 'columnReorderFeature', 'columnResizeFeature', 'dependenciesFeature', 'dependencyEditFeature', 'eventBufferFeature', 'eventCopyPasteFeature', 'eventDragFeature', 'eventDragCreateFeature', 'eventDragSelectFeature', 'eventEditFeature', 'eventFilterFeature', 'eventMenuFeature', 'eventResizeFeature', 'eventTooltipFeature', 'excelExporterFeature', 'filterFeature', 'filterBarFeature', 'groupFeature', 'groupSummaryFeature', 'headerMenuFeature', 'headerZoomFeature', 'labelsFeature', 'mergeCellsFeature', 'multipageFeature', 'multipageverticalFeature', 'nonWorkingTimeFeature', 'panFeature', 'pdfExportFeature', 'percentBarFeature', 'quickFindFeature', 'regionResizeFeature', 'resourceNonWorkingTimeFeature', 'resourceTimeRangesFeature', 'rowCopyPasteFeature', 'rowReorderFeature', 'scheduleContextFeature', 'scheduleMenuFeature', 'scheduleTooltipFeature', 'searchFeature', 'simpleEventEditFeature', 'singlepageFeature', 'sortFeature', 'stickyCellsFeature', 'stickyEventsFeature', 'stripeFeature', 'summaryFeature', 'taskEditFeature', 'timeAxisHeaderMenuFeature', 'timeRangesFeature', 'timeSpanHighlightFeature', 'treeFeature', 'treeGroupFeature'];
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
      'dependencyStore': 'dependencies',
      'eventStore': 'events',
      'resourceStore': 'resources',
      'resourceTimeRangeStore': 'resourceTimeRanges',
      'timeRangeStore': 'timeRanges'
    };
    _this.configNames = ['adopt', 'align', 'allowCreate', 'allowOver', 'allowOverlap', 'anchor', 'anchorToTarget', 'animateRemovingRows', 'appendTo', 'ariaDescription', 'ariaLabel', 'autoAdjustTimeAxis', 'autoClose', 'autoHeight', 'autoShow', 'bbar', 'bodyCls', 'bubbleEvents', 'bufferCoef', 'bufferThreshold', 'callOnFunctions', 'centered', 'closable', 'closeAction', 'cls', 'collapsed', 'collapsible', 'columns', 'config', 'constrainTo', 'contentElementCls', 'contextMenuTriggerEvent', 'createEventOnDblClick', 'creationTooltip', 'crudManagerClass', 'cycleResolutionPopupClass', 'date', 'defaultBindProperty', 'defaultFocus', 'defaultRegion', 'defaultResourceImageName', 'defaults', 'dependencyIdField', 'descriptionRenderer', 'deselectOnClick', 'destroyStore', 'destroyStores', 'disableGridRowModelWarning', 'dismissDelay', 'displaySchedulingIssueResolutionPopup', 'dock', 'draggable', 'durationDisplayPrecision', 'emptyText', 'enableDeleteKey', 'enableEventAnimations', 'enableRecurringEvents', 'enableSticky', 'enableTextSelection', 'enableUndoRedoKeys', 'endParamName', 'eventBarTextField', 'eventBodyTemplate', 'eventRenderer', 'eventRendererThisObj', 'eventSelectionDisabled', 'eventStyle', 'features', 'fillLastColumn', 'fixedRowHeight', 'floating', 'focusOnToFront', 'footer', 'forceFit', 'forElement', 'forSelector', 'fullRowRefresh', 'getDateConstraints', 'getHtml', 'getRowHeight', 'header', 'hideAnimation', 'hideDelay', 'hideHeaders', 'hideOnDelegateChange', 'hideWhenEmpty', 'highlightPredecessors', 'highlightSuccessors', 'horizontalEventSorterFn', 'hoverDelay', 'htmlCls', 'infiniteScroll', 'insertBefore', 'insertFirst', 'itemCls', 'lazyItems', 'listeners', 'loadingMsg', 'loadMask', 'loadMaskDefaults', 'loadMaskError', 'localeClass', 'localizableProperties', 'longPressTime', 'maintainSelectionOnDatasetChange', 'managedEventSizing', 'maskDefaults', 'masked', 'maximizable', 'maximized', 'modal', 'mode', 'monitorResize', 'mouseOffsetX', 'mouseOffsetY', 'multiEventSelect', 'namedItems', 'owner', 'partner', 'passStartEndParameters', 'plugins', 'positioned', 'preCalculateHeightLimit', 'preserveFocusOnDatasetChange', 'preserveScrollOnDatasetChange', 'preventTooltipOnTouch', 'projectProgressReporting', 'range', 'removeUnassignedEvent', 'resizeToFitIncludesHeader', 'resourceColumns', 'resourceImageExtension', 'resourceImagePath', 'responsiveLevels', 'ripple', 'rootElement', 'schedulingIssueResolutionPopupClass', 'scrollAction', 'scrollerClass', 'scrollManager', 'selectionMode', 'showAnimation', 'showCreationTooltip', 'showDirty', 'showOnClick', 'showOnHover', 'showRecurringUI', 'showTooltipWhenDisabled', 'snapRelativeToEventStartDate', 'startParamName', 'stateful', 'statefulEvents', 'stateId', 'stateProvider', 'stepUnit', 'stickyHeaders', 'strips', 'subGridConfigs', 'suppressFit', 'syncMask', 'tab', 'tag', 'tbar', 'terminalCls', 'terminalSides', 'textAlign', 'textContent', 'timeAxis', 'title', 'trackMouse', 'trapFocus', 'triggerSelectionChangeOnRemove', 'ui', 'verticalTimeAxisColumn', 'visibleDate', 'visibleZoomFactor', 'weekStartDay', 'weight', 'zoomKeepsOriginalTimespan', 'zoomOnMouseWheel', 'zoomOnTimeAxisDoubleClick'];
    _this.propertyConfigNames = ['alignSelf', 'allowDropOnEventBar', 'assignments', 'assignmentStore', 'barMargin', 'calendars', 'columnLines', 'content', 'crudManager', 'data', 'dataset', 'dependencies', 'dependencyStore', 'disabled', 'displayDateFormat', 'endDate', 'eventColor', 'eventLayout', 'events', 'eventStore', 'extraData', 'fillTicks', 'flex', 'height', 'hidden', 'html', 'id', 'items', 'layout', 'layoutStyle', 'margin', 'maxHeight', 'maxWidth', 'maxZoomLevel', 'milestoneAlign', 'milestoneCharWidth', 'milestoneLayoutMode', 'milestoneTextPosition', 'minHeight', 'minWidth', 'minZoomLevel', 'onAfterDependencyCreateDrop', 'onAfterDependencySave', 'onAfterDragCreate', 'onAfterEventDrop', 'onAfterEventSave', 'onAfterTaskSave', 'onAssignmentSelectionChange', 'onBeforeAssignmentDelete', 'onBeforeCellEditStart', 'onBeforeColumnDragStart', 'onBeforeColumnDropFinalize', 'onBeforeCopy', 'onBeforeDependencyAdd', 'onBeforeDependencyCreateDrag', 'onBeforeDependencyCreateFinalize', 'onBeforeDependencyDelete', 'onBeforeDependencyEdit', 'onBeforeDependencyEditShow', 'onBeforeDependencySave', 'onBeforeDestroy', 'onBeforeDragCreate', 'onBeforeDragCreateFinalize', 'onBeforeEventAdd', 'onBeforeEventDelete', 'onBeforeEventDrag', 'onBeforeEventDropFinalize', 'onBeforeEventEdit', 'onBeforeEventEditShow', 'onBeforeEventResize', 'onBeforeEventResizeFinalize', 'onBeforeEventSave', 'onBeforeFinishCellEdit', 'onBeforeHide', 'onBeforePaste', 'onBeforePdfExport', 'onBeforePresetChange', 'onBeforeRenderRow', 'onBeforeRenderRows', 'onBeforeSetRecord', 'onBeforeShow', 'onBeforeTaskDelete', 'onBeforeTaskEdit', 'onBeforeTaskEditShow', 'onBeforeTaskSave', 'onBeforeToggleNode', 'onCancelCellEdit', 'onCatchAll', 'onCellClick', 'onCellContextMenu', 'onCellDblClick', 'onCellMenuBeforeShow', 'onCellMenuItem', 'onCellMenuShow', 'onCellMenuToggleItem', 'onCellMouseOut', 'onCellMouseOver', 'onCollapseNode', 'onColumnDragStart', 'onColumnDrop', 'onContextMenuItem', 'onContextMenuToggleItem', 'onDataChange', 'onDependencyClick', 'onDependencyCreateDragStart', 'onDependencyCreateDrop', 'onDependencyDblClick', 'onDependencyMouseOut', 'onDependencyMouseOver', 'onDependencyValidationComplete', 'onDependencyValidationStart', 'onDestroy', 'onDragCreateEnd', 'onDragCreateStart', 'onEventClick', 'onEventContextMenu', 'onEventDblClick', 'onEventDrag', 'onEventDragAbort', 'onEventDragReset', 'onEventDragStart', 'onEventDrop', 'onEventEditBeforeSetRecord', 'onEventKeyDown', 'onEventKeyUp', 'onEventMenuBeforeShow', 'onEventMenuItem', 'onEventMenuShow', 'onEventMouseDown', 'onEventMouseOut', 'onEventMouseOver', 'onEventMouseUp', 'onEventPartialResize', 'onEventResizeEnd', 'onEventResizeStart', 'onEventSelectionChange', 'onExpandNode', 'onFinishCellEdit', 'onFocusIn', 'onFocusOut', 'onHeaderMenuBeforeShow', 'onHeaderMenuItem', 'onHeaderMenuShow', 'onHeaderMenuToggleItem', 'onHide', 'onMouseOut', 'onMouseOver', 'onNavigate', 'onPaint', 'onPdfExport', 'onPresetChange', 'onReadOnly', 'onReleaseEvent', 'onRenderEvent', 'onRenderRow', 'onRenderRows', 'onResize', 'onResourceHeaderClick', 'onResourceHeaderContextmenu', 'onResourceHeaderDblclick', 'onResponsive', 'onScheduleClick', 'onScheduleContextMenu', 'onScheduleDblClick', 'onScheduleMenuBeforeShow', 'onScheduleMenuItem', 'onScheduleMenuShow', 'onScheduleMouseMove', 'onScroll', 'onSelectionChange', 'onShow', 'onStartCellEdit', 'onSubGridCollapse', 'onSubGridExpand', 'onTimeAxisChange', 'onTimeAxisHeaderClick', 'onTimeAxisHeaderContextMenu', 'onTimeAxisHeaderContextMenuBeforeShow', 'onTimeAxisHeaderContextMenuItem', 'onTimeAxisHeaderContextMenuShow', 'onTimeAxisHeaderDblClick', 'onTimelineViewportResize', 'onToggleNode', 'onToolClick', 'overlappingEventSorter', 'presets', 'project', 'readOnly', 'resourceMargin', 'resources', 'resourceStore', 'resourceTimeRanges', 'resourceTimeRangeStore', 'rowHeight', 'scrollable', 'snap', 'startDate', 'store', 'tickSize', 'timeRanges', 'timeRangeStore', 'tools', 'tooltip', 'transitionDuration', 'useInitialAnimation', 'viewPreset', 'width', 'workingTime', 'x', 'y'];
    _this.propertyNames = ['anchorSize', 'eventColors', 'eventStyles', 'isEngineReady', 'isSettingValues', 'isValid', 'record', 'scrollLeft', 'scrollTop', 'selectedAssignments', 'selectedCell', 'selectedEvents', 'selectedRecord', 'selectedRecords', 'state', 'timeResolution', 'type', 'values', 'zoomLevel'];
    _this.instance = undefined;
    _this.element = undefined;
    return _this;
  }

  _createClass(BryntumSchedulerPro, [{
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

  return BryntumSchedulerPro;
}(Component);

BryntumSchedulerPro.instanceClass = SchedulerPro;
BryntumSchedulerPro.isView = true;
export { BryntumSchedulerPro as default };