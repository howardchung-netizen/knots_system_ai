import LocaleManager from '../../Core/localization/LocaleManager.js';
//<umd>
import schedulerLocale from '../../Scheduler/localization/Ru.js';
import engineLocale from '../../Engine/localization/Ru.js';
import LocaleHelper from '../../Core/localization/LocaleHelper.js';

const locale = LocaleHelper.mergeLocales(schedulerLocale, engineLocale, {

    ConstraintTypePicker : {
        none                : 'Нет',
        muststarton         : 'Фиксированное начало',
        mustfinishon        : 'Фиксированное окончание',
        startnoearlierthan  : 'Начало не раньше',
        startnolaterthan    : 'Начало не позднее',
        finishnoearlierthan : 'Окончание не раньше',
        finishnolaterthan   : 'Окончание не позднее'
    },

    CalendarField : {
        'Default calendar' : 'Основной календарь'
    },

    TaskEditorBase : {
        Information   : 'Информация',
        Save          : 'Сохранить',
        Cancel        : 'Отменить',
        Delete        : 'Удалить',
        calculateMask : 'Рассчитываю задачи...',
        saveError     : 'Сохранение невозможно, исправьте ошибки'
    },

    TaskEdit : {
        'Edit task'            : 'Изменить задачу',
        ConfirmDeletionTitle   : 'Подтвердите удаление',
        ConfirmDeletionMessage : 'Вы уверены, что хотите удалить событие?'
    },

    GanttTaskEditor : {
        editorWidth : '54em'
    },

    SchedulerTaskEditor : {
        editorWidth : '35em'
    },

    SchedulerGeneralTab : {
        labelWidth   : '9em',
        General      : 'Основные',
        Name         : 'Имя',
        Resources    : 'Ресурсы',
        '% complete' : '% выполнено',
        Duration     : 'Длительность',
        Start        : 'Начало',
        Finish       : 'Окончание',
        Preamble     : 'Вхождение',
        Postamble    : 'Выход'
    },

    GeneralTab : {
        labelWidth   : '9em',
        General      : 'Основные',
        Name         : 'Имя',
        '% complete' : '% выполнено',
        Duration     : 'Длительность',
        Start        : 'Начало',
        Finish       : 'Окончание',
        Effort       : 'Трудозатраты',
        Dates        : 'Даты'
    },

    SchedulerAdvancedTab : {
        labelWidth           : '13em',
        Advanced             : 'Дополнительно',
        Calendar             : 'Календарь',
        'Manually scheduled' : 'Ручное планирование',
        'Constraint type'    : 'Тип ограничения',
        'Constraint date'    : 'Дата ограничения',
        Inactive             : 'Неактивна'
    },

    AdvancedTab : {
        labelWidth           : '18em',
        Advanced             : 'Дополнительные',
        Calendar             : 'Календарь',
        'Scheduling mode'    : 'Тип планирования',
        'Effort driven'      : 'Управляемое трудозатратами',
        'Manually scheduled' : 'Ручное планирование',
        'Constraint type'    : 'Тип ограничения',
        'Constraint date'    : 'Дата ограничения',
        Constraint           : 'Ограничение',
        Rollup               : 'Сведение',
        Inactive             : 'Неактивна'
    },

    DependencyTab : {
        Predecessors      : 'Предшественники',
        Successors        : 'Последователи',
        ID                : 'Идентификатор',
        Name              : 'Имя',
        Type              : 'Тип',
        Lag               : 'Запаздывание',
        cyclicDependency  : 'Обнаружена цикличная зависимость',
        invalidDependency : 'Неверная зависимость'
    },

    ResourcesTab : {
        unitsTpl  : ({ value }) => `${value}%`,
        Resources : 'Ресурсы',
        Resource  : 'Ресурс',
        Units     : '% Занятости'
    },

    NotesTab : {
        Notes : 'Заметки'
    },

    SchedulingModePicker : {
        Normal           : 'Нормальный',
        'Fixed Duration' : 'Фиксированная длительность',
        'Fixed Units'    : 'Фиксированные единицы',
        'Fixed Effort'   : 'Фиксированные трудозатраты'
    },

    ResourceHistogram : {
        barTipInRange         : '<b>{resource}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated} из {available}</span> использовано',
        barTipOnDate          : '<b>{resource}</b> {startDate}<br><span class="{cls}">{allocated} из {available}</span> использовано',
        groupBarTipAssignment : '<b>{resource}</b> - <span class="{cls}">{allocated} из {available}</span>',
        groupBarTipInRange    : '{startDate} - {endDate}<br><span class="{cls}">{allocated} из {available}</span> использовано:<br>{assignments}',
        groupBarTipOnDate     : '{startDate}<br><span class="{cls}">{allocated} из {available}</span> использовано:<br>{assignments}',
        plusMore              : 'Еще +{value}'
    },

    ResourceUtilization : {
        barTipInRange         : '<b>{event}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated}</span> использовано',
        barTipOnDate          : '<b>{event}</b> {startDate}<br><span class="{cls}">{allocated}</span> использовано',
        groupBarTipAssignment : '<b>{event}</b> - <span class="{cls}">{allocated}</span>',
        groupBarTipInRange    : '{startDate} - {endDate}<br><span class="{cls}">{allocated} из {available}</span> использовано:<br>{assignments}',
        groupBarTipOnDate     : '{startDate}<br><span class="{cls}">{allocated} из {available}</span> использовано:<br>{assignments}',
        plusMore              : 'Еще +{value}',
        nameColumnText        : 'Ресурс / Событие'
    },

    SchedulingIssueResolutionPopup : {
        'Cancel changes'   : 'Отменить изменения',
        schedulingConflict : 'Конфликт планирования',
        emptyCalendar      : 'Ошибка данных календаря',
        cycle              : 'Цикл планирования',
        Apply              : 'Применить'
    },

    CycleResolutionPopup : {
        dependencyLabel        : 'Пожалуйста выберите зависимость для исправления:',
        invalidDependencyLabel : 'Есть неверные зависимости которые необходимо исправить:'
    },

    DependencyEdit : {
        Active : 'Действующая'
    },

    SchedulerProBase : {
        propagating     : 'Расчет проекта',
        storePopulation : 'Загрузка данных',
        finalizing      : 'Завершение'
    }

});

export default locale;
//</umd>

LocaleManager.registerLocale('Ru', { desc : 'Русский', locale });
