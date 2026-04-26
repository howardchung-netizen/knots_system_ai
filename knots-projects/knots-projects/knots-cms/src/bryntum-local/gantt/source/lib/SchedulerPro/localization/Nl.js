import LocaleManager from '../../Core/localization/LocaleManager.js';
//<umd>
import schedulerLocale from '../../Scheduler/localization/Nl.js';
import engineLocale from '../../Engine/localization/Nl.js';
import LocaleHelper from '../../Core/localization/LocaleHelper.js';

const locale = LocaleHelper.mergeLocales(schedulerLocale, engineLocale, {

    ConstraintTypePicker : {
        none                : 'Geen',
        muststarton         : 'Niet eerder eindigen dan',
        mustfinishon        : 'Niet later eindigen dan',
        startnoearlierthan  : 'Moet beginnen op',
        startnolaterthan    : 'Moet eindigen op',
        finishnoearlierthan : 'Niet eerder beginnen dan',
        finishnolaterthan   : 'Niet later beginnen dan'
    },

    CalendarField : {
        'Default calendar' : 'Standaardkalender'
    },

    TaskEditorBase : {
        Information   : 'Informatie',
        Save          : 'Opslaan',
        Cancel        : 'Annuleer',
        Delete        : 'Verwijder',
        calculateMask : 'Taken berekenen...',
        saveError     : 'Kan niet opslaan. Corrigeer eerst de fouten'
    },

    TaskEdit : {
        'Edit task'            : 'Bewerk taak',
        ConfirmDeletionTitle   : 'Bevestig verwijderen',
        ConfirmDeletionMessage : 'Weet u zeker dat u dit item wilt verwijderen?'
    },

    GanttTaskEditor : {
        editorWidth : '54em'
    },

    SchedulerTaskEditor : {
        editorWidth : '30em'
    },

    SchedulerGeneralTab : {
        labelWidth   : '6em',
        General      : 'Algemeen',
        Name         : 'Naam',
        Resources    : 'Resources',
        '% complete' : '% compleet',
        Duration     : 'Duur',
        Start        : 'Begin',
        Finish       : 'Einde',
        Preamble     : 'Preamble',
        Postamble    : 'Postamble'
    },

    GeneralTab : {
        labelWidth   : '6em',
        General      : 'Algemeen',
        Name         : 'Naam',
        '% complete' : '% compleet',
        Duration     : 'Duur',
        Start        : 'Begin',
        Finish       : 'Einde',
        Effort       : 'Inspanning',
        Dates        : 'Datums'
    },

    SchedulerAdvancedTab : {
        labelWidth           : '10em',
        Advanced             : 'Geavanceerd',
        Calendar             : 'Kalender',
        'Manually scheduled' : 'Handmatig',
        'Constraint type'    : 'Beperkingstype',
        'Constraint date'    : 'Beperkingsdatum',
        Inactive             : 'Inactief'
    },

    AdvancedTab : {
        labelWidth           : '12em',
        Advanced             : 'Geavanceerd',
        Calendar             : 'Kalender',
        'Scheduling mode'    : 'Taaktype',
        'Effort driven'      : 'Op inspanning',
        'Manually scheduled' : 'Handmatig',
        'Constraint type'    : 'Beperkingstype',
        'Constraint date'    : 'Beperkingsdatum',
        Constraint           : 'Beperking',
        Rollup               : 'Samenvouwen',
        Inactive             : 'Inactief'
    },

    DependencyTab : {
        Predecessors      : 'Voorafgaande taken',
        Successors        : 'Opvolgende taken',
        ID                : 'ID',
        Name              : 'Naam',
        Type              : 'Type',
        Lag               : 'Vertraging',
        cyclicDependency  : 'Cyclische afhankelijkheid',
        invalidDependency : 'Ongeldige afhankelijkheid'
    },

    ResourcesTab : {
        unitsTpl  : ({ value }) => `${value}%`,
        Resources : 'Middelen',
        Resource  : 'Hulpbron',
        Units     : 'Eenheden'
    },

    NotesTab : {
        Notes : 'Notities'
    },

    SchedulingModePicker : {
        Normal           : 'Normaal',
        'Fixed Duration' : 'Vaste duur',
        'Fixed Units'    : 'Vaste eenheden',
        'Fixed Effort'   : 'Vast werk'
    },

    ResourceHistogram : {
        barTipInRange         : '<b>{resource}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated} van de {available}</span> toegewezen',
        barTipOnDate          : '<b>{resource}</b> op {startDate}<br><span class="{cls}">{allocated} van de {available}</span> toegewezen',
        groupBarTipAssignment : '<b>{resource}</b> - <span class="{cls}">{allocated} van de {available}</span>',
        groupBarTipInRange    : '{startDate} - {endDate}<br><span class="{cls}">{allocated} van de {available}</span> toegewezen:<br>{assignments}',
        groupBarTipOnDate     : 'On {startDate}<br><span class="{cls}">{allocated} van de {available}</span> toegewezen:<br>{assignments}',
        plusMore              : '+{value} meer'
    },

    ResourceUtilization : {
        barTipInRange         : '<b>{event}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated}</span> toegewezen',
        barTipOnDate          : '<b>{event}</b> op {startDate}<br><span class="{cls}">{allocated}</span> toegewezen',
        groupBarTipAssignment : '<b>{event}</b> - <span class="{cls}">{allocated}</span>',
        groupBarTipInRange    : '{startDate} - {endDate}<br><span class="{cls}">{allocated} van de {available}</span> toegewezen:<br>{assignments}',
        groupBarTipOnDate     : 'On {startDate}<br><span class="{cls}">{allocated} van de {available}</span> toegewezen:<br>{assignments}',
        plusMore              : '+{value} meer',
        nameColumnText        : 'Hulpbron / Boeking'
    },

    SchedulingIssueResolutionPopup : {
        'Cancel changes'   : 'Annuleer wijziging en doe niks',
        schedulingConflict : 'Planningsconflict',
        emptyCalendar      : 'Kalender configuratie fout',
        cycle              : 'Planning lus',
        Apply              : 'Pas toe'
    },

    CycleResolutionPopup : {
        dependencyLabel        : 'Selecteer een afhankelijkheid om beneden aan te passen:',
        invalidDependencyLabel : 'Er zijn een aantal niet valide afhankelijkheden die moeten worden opgelost:'
    },

    DependencyEdit : {
        Active : 'Actief'
    },

    SchedulerProBase : {
        propagating     : 'Beregning',
        storePopulation : 'Indlæser data',
        finalizing      : 'Finaliseren'
    }

});

export default locale;
//</umd>

LocaleManager.registerLocale('Nl', { desc : 'Nederlands', locale });
