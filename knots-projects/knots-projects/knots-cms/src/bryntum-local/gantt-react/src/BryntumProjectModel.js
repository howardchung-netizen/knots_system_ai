/**
 * React wrapper for Bryntum ProjectModel
 */
import React, { Component } from 'react';
import WrapperHelper from './WrapperHelper.js';
import { ProjectModel } from '@bryntum/gantt';

export default class BryntumProjectModel extends Component {
    static instanceClass = ProjectModel;

    dataStores = {
        'assignmentStore': 'assignments',
        'calendarManagerStore': 'calendars',
        'dependencyStore': 'dependencies',
        'eventStore': 'events',
        'resourceStore': 'resources',
        'taskStore': 'tasks',
        'timeRangeStore': 'timeRanges'
    };

    configNames = [
        'adjustDurationToDST',
        'assignmentModelClass',
        'assignmentsData',
        'assignmentStoreClass',
        'autoLoad',
        'autoSync',
        'autoSyncTimeout',
        'bubbleEvents',
        'calendarManagerStoreClass',
        'calendarModelClass',
        'calendarsData',
        'callOnFunctions',
        'delayCalculation',
        'dependenciesData',
        'dependencyModelClass',
        'dependencyStoreClass',
        'encoder',
        'eventsData',
        'listeners',
        'parentId',
        'parentIndex',
        'phantomIdField',
        'phantomParentIdField',
        'resetIdsBeforeSync',
        'resetUndoRedoQueuesAfterLoad',
        'resourceModelClass',
        'resourcesData',
        'resourceStoreClass',
        'silenceInitialCommit',
        'skipSuccessProperty',
        'storeIdProperty',
        'supportShortSyncResponse',
        'taskModelClass',
        'tasksData',
        'taskStoreClass',
        'timeRangesData',
        'trackResponseType',
        'transport',
        'validateResponse',
        'writeAllFields'
    ];

    propertyConfigNames = [
        'assignments',
        'assignmentStore',
        'autoCalculatePercentDoneForParentTasks',
        'calendar',
        'calendarManagerStore',
        'calendars',
        'children',
        'crudStores',
        'daysPerMonth',
        'daysPerWeek',
        'dependencies',
        'dependenciesCalendar',
        'dependencyStore',
        'direction',
        'enableProgressNotifications',
        'endDate',
        'eventStore',
        'hoursPerDay',
        'id',
        'onBeforeDestroy',
        'onBeforeLoad',
        'onBeforeLoadApply',
        'onBeforeResponseApply',
        'onBeforeSend',
        'onBeforeSync',
        'onBeforeSyncApply',
        'onCatchAll',
        'onChange',
        'onCycle',
        'onDataReady',
        'onDestroy',
        'onEmptyCalendar',
        'onHasChanges',
        'onLoad',
        'onLoadCanceled',
        'onLoadFail',
        'onNoChanges',
        'onProgress',
        'onRequestDone',
        'onRequestFail',
        'onSchedulingConflict',
        'onSync',
        'onSyncCanceled',
        'onSyncDelayed',
        'onSyncFail',
        'readOnly',
        'resources',
        'resourceStore',
        'skipNonWorkingTimeWhenSchedulingManually',
        'startDate',
        'syncApplySequence',
        'tasks',
        'taskStore',
        'timeRanges',
        'timeRangeStore'
    ];

    propertyNames = [
        'allChildren',
        'autoExposeFields',
        'childrenField',
        'convertEmptyParentToLeaf',
        'criticalPaths',
        'defaults',
        'descendantCount',
        'hasGeneratedId',
        'idField',
        'inlineData',
        'internalId',
        'isCommitting',
        'isCreating',
        'isValid',
        'json',
        'previousSiblingsTotalCount',
        'stm',
        'visibleDescendantCount'
    ];

    // Component instance
    instance = undefined;

    // Component element
    element = undefined;

    /**
     * Invoked immediately after a component is mounted (inserted into the tree)
     */
    componentDidMount() {
        const { createWidget } = WrapperHelper();
        this.instance = createWidget(this);
    }

    // React component removed, destroy instance
    componentWillUnmount() {
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
    shouldComponentUpdate(nextProps, nextState) {
        const { shouldComponentUpdate } = WrapperHelper();
        return shouldComponentUpdate(this, nextProps, nextState);
    }

     render() {
        return null
     }

}
