/* eslint-disable quote-props */
import LocaleManager from '../../Core/localization/LocaleManager.js';
//<umd>
import parentLocale from '../../SchedulerPro/localization/Ru.js';
import LocaleHelper from '../../Core/localization/LocaleHelper.js';

const locale = LocaleHelper.mergeLocales(parentLocale, {

    //region Common

    Object : {
        Save : 'Сохранить'
    },

    //endregion

    //region Columns

    InactiveColumn : {
        Inactive : 'Неактивна'
    },

    AddNewColumn : {
        'New Column' : 'Добавить столбец...'
    },

    EarlyStartDateColumn : {
        'Early Start' : 'Раннее начало'
    },

    EarlyEndDateColumn : {
        'Early End' : 'Раннее окончание'
    },

    LateStartDateColumn : {
        'Late Start' : 'Позднее начало'
    },

    LateEndDateColumn : {
        'Late End' : 'Позднее окончание'
    },

    TotalSlackColumn : {
        'Total Slack' : 'Общий временной резерв'
    },

    MilestoneColumn : {
        Milestone : 'Веха'
    },

    EffortColumn : {
        Effort : 'Трудозатраты'
    },

    CalendarColumn : {
        Calendar : 'Календарь'
    },

    ConstraintDateColumn : {
        'Constraint Date' : 'Дата ограничения'
    },

    ConstraintTypeColumn : {
        'Constraint Type' : 'Тип ограничения'
    },

    DeadlineDateColumn : {
        Deadline : 'Крайний срок'
    },

    DependencyColumn : {
        'Invalid dependency' : 'Неверная зависимость'
    },

    DurationColumn : {
        Duration : 'Длительность'
    },

    EndDateColumn : {
        Finish : 'Конец'
    },

    NameColumn : {
        Name : 'Наименование задачи'
    },

    NoteColumn : {
        Note : 'Примечание'
    },

    PercentDoneColumn : {
        '% Done' : '% завершения'
    },

    PredecessorColumn : {
        Predecessors : 'Предшествующие'
    },

    ResourceAssignmentColumn : {
        'Assigned Resources' : 'Назначенные ресурсы',
        'more resources'     : 'ресурсов'
    },

    RollupColumn : {
        Rollup : 'Сведение'
    },

    SchedulingModeColumn : {
        'Scheduling Mode' : 'Режим'
    },

    SequenceColumn : {
        Sequence : '#'
    },

    StartDateColumn : {
        Start : 'Начало'
    },

    ShowInTimelineColumn : {
        'Show in timeline' : 'Показать на временной шкале'
    },

    SuccessorColumn : {
        Successors : 'Последующие'
    },

    TaskCopyPaste : {
        copyTask  : 'Копировать',
        cutTask   : 'Вырезать',
        pasteTask : 'Вставить'
    },

    WBSColumn : {
        WBS      : 'СДР',
        renumber : 'Обновить'
    },

    EventModeColumn : {
        'Event mode' : 'Режим расчёта',
        Manual       : 'Ручной',
        Auto         : 'Автоматический'
    },

    ManuallyScheduledColumn : {
        'Manually scheduled' : 'Ручное планирование'
    },

    //endregion

    DependencyField : {
        'invalidDependencyFormat' : 'Неверный формат зависимости'
    },

    ProjectLines : {
        'Project Start' : 'Начало проекта',
        'Project End'   : 'Окончание проекта'
    },

    TaskTooltip : {
        Start    : 'Начинается',
        End      : 'Заканчивается',
        Duration : 'Длительность',
        Complete : 'Выполнено'
    },

    AssignmentGrid : {
        Name     : 'Имя ресурса',
        Units    : 'Занятость',
        unitsTpl : ({ value }) => value ? value + '%' : ''
    },

    Gantt : {
        Edit                   : 'Изменить',
        Indent                 : 'Понизить уровень',
        Outdent                : 'Повысить уровень',
        'Convert to milestone' : 'Преобразовать в веху',
        Add                    : 'Добавить...',
        'New task'             : 'Новая задача',
        'New milestone'        : 'Новая веха',
        'Task above'           : 'Задачу выше',
        'Task below'           : 'Задачу ниже',
        'Delete task'          : 'Удалить',
        Milestone              : 'Веху',
        'Sub-task'             : 'Под-задачу',
        Successor              : 'Последующую задачу',
        Predecessor            : 'Предшествующую задачу',
        changeRejected         : 'Планирование двигателя отклонило изменения'
    },

    Indicators : {
        earlyDates   : 'Раннее начало/окончание',
        lateDates    : 'Позднее начало/окончание',
        deadlineDate : 'Крайний срок',
        Start        : 'Начало',
        End          : 'Конец'
    }
});

export default locale;
//</umd>

LocaleManager.registerLocale('Ru', { desc : 'Русский', locale });
