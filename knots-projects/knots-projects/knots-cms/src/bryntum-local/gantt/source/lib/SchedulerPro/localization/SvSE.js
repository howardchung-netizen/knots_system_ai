import LocaleManager from '../../Core/localization/LocaleManager.js';
//<umd>
import schedulerLocale from '../../Scheduler/localization/SvSE.js';
import engineLocale from '../../Engine/localization/SvSE.js';
import LocaleHelper from '../../Core/localization/LocaleHelper.js';

const locale = LocaleHelper.mergeLocales(schedulerLocale, engineLocale, {

    ConstraintTypePicker : {
        none                : 'Ingen',
        muststarton         : 'Måste starta',
        mustfinishon        : 'Måste avslutas',
        startnoearlierthan  : 'Starta tidigast',
        startnolaterthan    : 'Starta senast',
        finishnoearlierthan : 'Avsluta tidigast',
        finishnolaterthan   : 'Avsluta senast'
    },

    CalendarField : {
        'Default calendar' : 'Standardkalender'
    },

    TaskEditorBase : {
        Information   : 'Information',
        Save          : 'Spara',
        Cancel        : 'Avbryt',
        Delete        : 'Ta bort',
        calculateMask : 'Beräknar...',
        saveError     : 'Kan inte spara, vänligen korrigera fel först'
    },

    TaskEdit : {
        'Edit task'            : 'Redigera uppgift',
        ConfirmDeletionTitle   : 'Bekräfta borttagning',
        ConfirmDeletionMessage : 'Är du säker på att du vill ta bort händelsen?'
    },

    GanttTaskEditor : {
        editorWidth : '54em'
    },

    SchedulerTaskEditor : {
        editorWidth : '33em'
    },

    SchedulerGeneralTab : {
        labelWidth   : '8em',
        General      : 'Allmänt',
        Name         : 'Namn',
        Resources    : 'Resurser',
        '% complete' : '% Färdig',
        Duration     : 'Varaktighet',
        Start        : 'Start',
        Finish       : 'Slut',
        Preamble     : 'Inledning',
        Postamble    : 'Avslutning'
    },

    GeneralTab : {
        labelWidth   : '8em',
        General      : 'Allmänt',
        Name         : 'Namn',
        '% complete' : '% Färdig',
        Duration     : 'Varaktighet',
        Start        : 'Start',
        Finish       : 'Slut',
        Effort       : 'Arbetsinsats',
        Dates        : 'Datum'
    },

    SchedulerAdvancedTab : {
        labelWidth           : '11em',
        Advanced             : 'Avancerat',
        Calendar             : 'Kalender',
        'Manually scheduled' : 'Manuellt planerad',
        'Constraint type'    : 'Villkorstyp',
        'Constraint date'    : 'Måldatum',
        Inactive             : 'Inaktiv'
    },

    AdvancedTab : {
        labelWidth           : '11em',
        Advanced             : 'Avancerat',
        Calendar             : 'Kalender',
        'Scheduling mode'    : 'Aktivitetstyp',
        'Effort driven'      : 'Insatsdriven',
        'Manually scheduled' : 'Manuellt planerad',
        'Constraint type'    : 'Villkorstyp',
        'Constraint date'    : 'Måldatum',
        Constraint           : 'Villkor',
        Rollup               : 'Upplyft',
        Inactive             : 'Inaktiv'
    },

    DependencyTab : {
        Predecessors      : 'Föregångare',
        Successors        : 'Efterföljare',
        ID                : 'ID',
        Name              : 'Namn',
        Type              : 'Typ',
        Lag               : 'Fördröjning',
        cyclicDependency  : 'Cykliskt beroende',
        invalidDependency : 'Ogiltigt beroende'
    },

    ResourcesTab : {
        unitsTpl  : ({ value }) => `${value}%`,
        Resources : 'Resurser',
        Resource  : 'Resurs',
        Units     : 'Enheter'
    },

    NotesTab : {
        Notes : 'Anteckning'
    },

    SchedulingModePicker : {
        Normal           : 'Normal',
        'Fixed Duration' : 'Fast varaktighet',
        'Fixed Units'    : 'Fasta enheter',
        'Fixed Effort'   : 'Fast arbete'
    },

    ResourceHistogram : {
        barTipInRange         : '<b>{resource}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated} av {available}</span> allokerade',
        barTipOnDate          : '<b>{resource}</b> på {startDate}<br><span class="{cls}">{allocated} av {available}</span> allokerade',
        groupBarTipAssignment : '<b>{resource}</b> - <span class="{cls}">{allocated} av {available}</span>',
        groupBarTipInRange    : '{startDate} - {endDate}<br><span class="{cls}">{allocated} av {available}</span> allokerade:<br>{assignments}',
        groupBarTipOnDate     : 'On {startDate}<br><span class="{cls}">{allocated} av {available}</span> allokerade:<br>{assignments}',
        plusMore              : '+{value} more'
    },

    ResourceUtilization : {
        barTipInRange         : '<b>{event}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated}</span> allokerade',
        barTipOnDate          : '<b>{event}</b> på {startDate}<br><span class="{cls}">{allocated}</span> allokerade',
        groupBarTipAssignment : '<b>{event}</b> - <span class="{cls}">{allocated}</span>',
        groupBarTipInRange    : '{startDate} - {endDate}<br><span class="{cls}">{allocated} av {available}</span> allokerade:<br>{assignments}',
        groupBarTipOnDate     : 'På {startDate}<br><span class="{cls}">{allocated} av {available}</span> allokerade:<br>{assignments}',
        plusMore              : '+{value} more',
        nameColumnText        : 'Resurs / Bokning'
    },

    SchedulingIssueResolutionPopup : {
        'Cancel changes'   : 'Avbryt ändringen',
        schedulingConflict : 'Schemaläggningskonflikt',
        emptyCalendar      : 'Felaktig kalendarkonfiguration',
        cycle              : 'Cyklisk sekvens',
        Apply              : 'Utför'
    },

    CycleResolutionPopup : {
        dependencyLabel        : 'Välj ett beroende att ändra enligt nedanstående:',
        invalidDependencyLabel : 'Det finns ogiltiga beroenden som måste korrigeras:'
    },

    DependencyEdit : {
        Active : 'Aktiv'
    },

    SchedulerProBase : {
        propagating     : 'Beräknar',
        storePopulation : 'Laddar data',
        finalizing      : 'Slutför'
    }

});

export default locale;
//</umd>

LocaleManager.registerLocale('SvSE', { desc : 'Svenska', locale });
