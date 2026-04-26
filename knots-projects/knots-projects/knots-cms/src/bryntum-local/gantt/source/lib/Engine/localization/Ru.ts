import LocaleManager from '../../Core/localization/LocaleManager.js'
//<umd>

const locale = {

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'Удалить зависимость'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'Деактивировать зависимость'
    },

    CycleEffectDescription : {
        descriptionTpl : 'Обнаружены циклические данные. Цикл образуют следующие задачи: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl : 'Календарь "{0}" не содержит ни одного интервала рабочего времени.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Использовать 24-часовой календарь с выходными субботой и воскресеньем.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Использовать 8-часовой календарь (08:00-12:00, 13:00-17:00) с выходными субботой и воскресеньем.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'Обнаружен конфликт планирования: {0} конфликтует с {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Начало проекта {0}',
        endDateDescriptionTpl   : 'Окончание проекта {0}'
    },

    DependencyType : {
        long : [
            'Начало-Начало',
            'Начало-Окончание',
            'Окончание-Начало',
            'Окончание-Окончание'
        ]
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'Зависимость ({2}) от <strong>{3}</strong> к <strong>{4}</strong>'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'Удалить зависимость от "{1}" к "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'Деактивировать зависимость от "{1}" к "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Ограничение {3} {0} задачи <strong>{2}</strong>',
        endDateDescriptionTpl   : 'Ограничение {3} {1} задачи <strong>{2}</strong>',
        constraintTypeTpl       : {
            startnoearlierthan  : 'Начало-не-раньше',
            finishnoearlierthan : 'Окончание-не-раньше',
            muststarton         : 'Фиксированное-начало',
            mustfinishon        : 'Фиксированное-окончание',
            startnolaterthan    : 'Начало-не-позднее',
            finishnolaterthan   : 'Окончание-не-позднее'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'Удалить ограничение "{1}" с задачи "{0}"'
    }

}

export default locale
//</umd>

LocaleManager.registerLocale('Ru', { desc : 'Русский', locale })
