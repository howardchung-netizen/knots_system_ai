import LocaleManager from '../../Core/localization/LocaleManager.js';
//<umd>
const locale = {
    RemoveDependencyCycleEffectResolution: {
        descriptionTpl: 'Ta bort beroende'
    },
    DeactivateDependencyCycleEffectResolution: {
        descriptionTpl: 'Avaktivera beroende'
    },
    CycleEffectDescription: {
        descriptionTpl: 'En cyklisk sekvens upptäcktes av följande uppgifter: {0}'
    },
    EmptyCalendarEffectDescription: {
        descriptionTpl: 'Kalender “{0}” innehåller inga arbetstidsintervall.'
    },
    Use24hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Använd 24-timmarskalender (måndag-fredag).'
    },
    Use8hrsEmptyCalendarEffectResolution: {
        descriptionTpl: 'Använd 8-timmarskalender  (måndag-fredag 08:00-12:00, 13:00-17:00)'
    },
    ConflictEffectDescription: {
        descriptionTpl: 'En schemaläggningskonflikt har uppstått, {0} är oförenlig med {1}'
    },
    ConstraintIntervalDescription: {
        dateFormat: 'LLL'
    },
    ProjectConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Projektets startdatum {0}',
        endDateDescriptionTpl: 'Projektets slutdatum {0}'
    },
    DependencyType: {
        long: [
            'Start-Till-Start',
            'Start-Till-Avslut',
            'Avslut-Till-Start',
            'Avslut-Till-Avslut'
        ]
    },
    DependencyConstraintIntervalDescription: {
        descriptionTpl: 'Beroende ({2}) från <strong>{3}</strong> till <strong>{4}</strong>'
    },
    RemoveDependencyResolution: {
        descriptionTpl: 'Ta bort beroende från "{1}" till "{2}"'
    },
    DeactivateDependencyResolution: {
        descriptionTpl: 'Avaktivera beroende från "{1}" till "{2}"'
    },
    DateConstraintIntervalDescription: {
        startDateDescriptionTpl: 'Aktivitet <strong>{2}</strong> {3} {0} villkor',
        endDateDescriptionTpl: 'Aktivitet <strong>{2}</strong> {3} {1} villkor',
        constraintTypeTpl: {
            startnoearlierthan: 'Starta-tidigast',
            finishnoearlierthan: 'Avsluta-tidigast',
            muststarton: 'Måste-starta',
            mustfinishon: 'Måste-avslutas',
            startnolaterthan: 'Starta-senast',
            finishnolaterthan: 'Avsluta-senast'
        }
    },
    RemoveDateConstraintConflictResolution: {
        descriptionTpl: 'Ta bort "{1}" villkoret för aktiviteten "{0}"'
    }
};
export default locale;
//</umd>
LocaleManager.registerLocale('SvSE', { desc: 'Svenska', locale });
