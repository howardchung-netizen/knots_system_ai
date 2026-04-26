import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _createSuper from "@babel/runtime/helpers/esm/createSuper";

/**
 * React wrapper for Bryntum ProjectModel
 */
import React, { Component } from 'react';
import WrapperHelper from './WrapperHelper.js';
import { ProjectModel } from '@bryntum/gantt';

var BryntumProjectModel = /*#__PURE__*/function (_Component) {
  _inherits(BryntumProjectModel, _Component);

  var _super = _createSuper(BryntumProjectModel);

  function BryntumProjectModel() {
    var _this;

    _classCallCheck(this, BryntumProjectModel);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.dataStores = {
      'assignmentStore': 'assignments',
      'calendarManagerStore': 'calendars',
      'dependencyStore': 'dependencies',
      'eventStore': 'events',
      'resourceStore': 'resources',
      'taskStore': 'tasks',
      'timeRangeStore': 'timeRanges'
    };
    _this.configNames = ['adjustDurationToDST', 'assignmentModelClass', 'assignmentsData', 'assignmentStoreClass', 'autoLoad', 'autoSync', 'autoSyncTimeout', 'bubbleEvents', 'calendarManagerStoreClass', 'calendarModelClass', 'calendarsData', 'callOnFunctions', 'delayCalculation', 'dependenciesData', 'dependencyModelClass', 'dependencyStoreClass', 'encoder', 'eventsData', 'listeners', 'parentId', 'parentIndex', 'phantomIdField', 'phantomParentIdField', 'resetIdsBeforeSync', 'resetUndoRedoQueuesAfterLoad', 'resourceModelClass', 'resourcesData', 'resourceStoreClass', 'silenceInitialCommit', 'skipSuccessProperty', 'storeIdProperty', 'supportShortSyncResponse', 'taskModelClass', 'tasksData', 'taskStoreClass', 'timeRangesData', 'trackResponseType', 'transport', 'validateResponse', 'writeAllFields'];
    _this.propertyConfigNames = ['assignments', 'assignmentStore', 'autoCalculatePercentDoneForParentTasks', 'calendar', 'calendarManagerStore', 'calendars', 'children', 'crudStores', 'daysPerMonth', 'daysPerWeek', 'dependencies', 'dependenciesCalendar', 'dependencyStore', 'direction', 'enableProgressNotifications', 'endDate', 'eventStore', 'hoursPerDay', 'id', 'onBeforeDestroy', 'onBeforeLoad', 'onBeforeLoadApply', 'onBeforeResponseApply', 'onBeforeSend', 'onBeforeSync', 'onBeforeSyncApply', 'onCatchAll', 'onChange', 'onCycle', 'onDataReady', 'onDestroy', 'onEmptyCalendar', 'onHasChanges', 'onLoad', 'onLoadCanceled', 'onLoadFail', 'onNoChanges', 'onProgress', 'onRequestDone', 'onRequestFail', 'onSchedulingConflict', 'onSync', 'onSyncCanceled', 'onSyncDelayed', 'onSyncFail', 'readOnly', 'resources', 'resourceStore', 'skipNonWorkingTimeWhenSchedulingManually', 'startDate', 'syncApplySequence', 'tasks', 'taskStore', 'timeRanges', 'timeRangeStore'];
    _this.propertyNames = ['allChildren', 'autoExposeFields', 'childrenField', 'convertEmptyParentToLeaf', 'criticalPaths', 'defaults', 'descendantCount', 'hasGeneratedId', 'idField', 'inlineData', 'internalId', 'isCommitting', 'isCreating', 'isValid', 'json', 'previousSiblingsTotalCount', 'stm', 'visibleDescendantCount'];
    _this.instance = undefined;
    _this.element = undefined;
    return _this;
  }

  _createClass(BryntumProjectModel, [{
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
      return null;
    }
  }]);

  return BryntumProjectModel;
}(Component);

BryntumProjectModel.instanceClass = ProjectModel;
export { BryntumProjectModel as default };