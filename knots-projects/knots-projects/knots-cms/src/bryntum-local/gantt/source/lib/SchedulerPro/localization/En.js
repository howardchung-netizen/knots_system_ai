import LocaleManager from '../../Core/localization/LocaleManager.js';
//<umd>
import schedulerLocale from '../../Scheduler/localization/En.js';
import engineLocale from '../../Engine/localization/En.js';
import LocaleHelper from '../../Core/localization/LocaleHelper.js';

const locale = LocaleHelper.mergeLocales(schedulerLocale, engineLocale, {

    ConstraintTypePicker : {
        none                : 'None',
        muststarton         : 'Must start on',
        mustfinishon        : 'Must finish on',
        startnoearlierthan  : 'Start no earlier than',
        startnolaterthan    : 'Start no later than',
        finishnoearlierthan : 'Finish no earlier than',
        finishnolaterthan   : 'Finish no later than'
    },

    CalendarField : {
        'Default calendar' : 'Default calendar'
    },

    TaskEditorBase : {
        Information   : 'Information',
        Save          : 'Save',
        Cancel        : 'Cancel',
        Delete        : 'Delete',
        calculateMask : 'Calculating...',
        saveError     : 'Can\'t save, please correct errors first'
    },

    TaskEdit : {
        'Edit task'            : 'Edit task',
        ConfirmDeletionTitle   : 'Confirm deletion',
        ConfirmDeletionMessage : 'Are you sure you want to delete the event?'
    },

    GanttTaskEditor : {
        editorWidth : '44em'
    },

    SchedulerTaskEditor : {
        editorWidth : '32em'
    },

    SchedulerGeneralTab : {
        labelWidth   : '6em',
        General      : 'General',
        Name         : 'Name',
        Resources    : 'Resources',
        '% complete' : '% complete',
        Duration     : 'Duration',
        Start        : 'Start',
        Finish       : 'Finish',
        Preamble     : 'Preamble',
        Postamble    : 'Postamble'
    },

    GeneralTab : {
        labelWidth   : '6.5em',
        General      : 'General',
        Name         : 'Name',
        '% complete' : '% complete',
        Duration     : 'Duration',
        Start        : 'Start',
        Finish       : 'Finish',
        Effort       : 'Effort',
        Dates        : 'Dates'
    },

    SchedulerAdvancedTab : {
        labelWidth           : '13em',
        Calendar             : 'Calendar',
        Advanced             : 'Advanced',
        'Manually scheduled' : 'Manually scheduled',
        'Constraint type'    : 'Constraint type',
        'Constraint date'    : 'Constraint date',
        Inactive             : 'Inactive'
    },

    AdvancedTab : {
        labelWidth           : '11.5em',
        Advanced             : 'Advanced',
        Calendar             : 'Calendar',
        'Scheduling mode'    : 'Scheduling mode',
        'Effort driven'      : 'Effort driven',
        'Manually scheduled' : 'Manually scheduled',
        'Constraint type'    : 'Constraint type',
        'Constraint date'    : 'Constraint date',
        Constraint           : 'Constraint',
        Rollup               : 'Rollup',
        Inactive             : 'Inactive'
    },

    DependencyTab : {
        Predecessors      : 'Predecessors',
        Successors        : 'Successors',
        ID                : 'ID',
        Name              : 'Name',
        Type              : 'Type',
        Lag               : 'Lag',
        cyclicDependency  : 'Cyclic dependency',
        invalidDependency : 'Invalid dependency'
    },

    NotesTab : {
        Notes : 'Notes'
    },

    ResourcesTab : {
        unitsTpl  : ({ value }) => `${value}%`,
        Resources : 'Resources',
        Resource  : 'Resource',
        Units     : 'Units'
    },

    SchedulingModePicker : {
        Normal           : 'Normal',
        'Fixed Duration' : 'Fixed Duration',
        'Fixed Units'    : 'Fixed Units',
        'Fixed Effort'   : 'Fixed Effort'
    },

    ResourceHistogram : {
        barTipInRange         : '<b>{resource}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated} of {available}</span> allocated',
        barTipOnDate          : '<b>{resource}</b> on {startDate}<br><span class="{cls}">{allocated} of {available}</span> allocated',
        groupBarTipAssignment : '<b>{resource}</b> - <span class="{cls}">{allocated} of {available}</span>',
        groupBarTipInRange    : '{startDate} - {endDate}<br><span class="{cls}">{allocated} of {available}</span> allocated:<br>{assignments}',
        groupBarTipOnDate     : 'On {startDate}<br><span class="{cls}">{allocated} of {available}</span> allocated:<br>{assignments}',
        plusMore              : '+{value} more'
    },

    ResourceUtilization : {
        barTipInRange         : '<b>{event}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated}</span> allocated',
        barTipOnDate          : '<b>{event}</b> on {startDate}<br><span class="{cls}">{allocated}</span> allocated',
        groupBarTipAssignment : '<b>{event}</b> - <span class="{cls}">{allocated}</span>',
        groupBarTipInRange    : '{startDate} - {endDate}<br><span class="{cls}">{allocated} of {available}</span> allocated:<br>{assignments}',
        groupBarTipOnDate     : 'On {startDate}<br><span class="{cls}">{allocated} of {available}</span> allocated:<br>{assignments}',
        plusMore              : '+{value} more',
        nameColumnText        : 'Resource / Event'
    },

    SchedulingIssueResolutionPopup : {
        'Cancel changes'   : 'Cancel the change and do nothing',
        schedulingConflict : 'Scheduling conflict',
        emptyCalendar      : 'Calendar configuration error',
        cycle              : 'Scheduling cycle',
        Apply              : 'Apply'
    },

    CycleResolutionPopup : {
        dependencyLabel        : 'Please select a dependency to apply a below change to:',
        invalidDependencyLabel : 'There are invalid dependencies involved that must be fixed:'
    },

    DependencyEdit : {
        Active : 'Active'
    },

    SchedulerProBase : {
        propagating     : 'Calculating project',
        storePopulation : 'Loading data',
        finalizing      : 'Finalizing results'
    }
});

export default locale;
//</umd>

LocaleManager.registerLocale('En', { desc : 'English', locale });
