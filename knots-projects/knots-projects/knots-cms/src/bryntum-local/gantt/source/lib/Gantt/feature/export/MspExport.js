import BrowserHelper from '../../../Core/helper/BrowserHelper.js';
import DH from '../../../Core/helper/DateHelper.js';
import GridFeatureManager from '../../../Grid/feature/GridFeatureManager.js';
import InstancePlugin from '../../../Core/mixin/InstancePlugin.js';
import ObjectHelper from '../../../Core/helper/ObjectHelper.js';
import XMLHelper from '../../../Core/helper/XMLHelper.js';

const
    MIN_DATE = DH.clearTime(new Date(1900, 5, 15)), // TODO some early date to safely not intersect w/ some calendar exceptions
    taskUnitMap = {
        minute : 3,
        hour   : 5,
        day    : 7,
        week   : 9,
        month  : 11
    },
    projectUnitMap = {
        minute : 1,
        hour   : 2,
        day    : 3,
        week   : 4,
        month  : 5
    },
    constraintMap = {
        finishnoearlierthan : 6,
        finishnolaterthan   : 7,
        mustfinishon        : 3,
        muststarton         : 2,
        startnoearlierthan  : 4,
        startnolaterthan    : 5
    },
    typeMap = {
        FixedDuration : 1,
        FixedUnits    : 0,
        FixedEffort   : 2,
        Normal        : 0
    },
    dependencyTypeMap = {
        0 : 3,
        1 : 2,
        2 : 1,
        3 : 0
    };

/**
 * @module Gantt/feature/export/MspExport
 */

/**
 * A feature that allows exporting Gantt to Microsoft Project without involving a server.
 *
 * [Microsoft Project XML specification](https://docs.microsoft.com/en-us/office-project/xml-data-interchange/introduction-to-project-xml-data)
 *
 * This feature supports exporting to an XML format that can be imported by MS Project Professional 2013 / 2019.
 *
 * Here is an example of how to add the feature:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         mspExport : {
 *             // Choose the filename for the exported file
 *             filename : 'Gantt Export'
 *         }
 *     }
 * });
 * ```
 *
 * And how to trigger an export:
 *
 * ```javascript
 * gantt.features.mspExport.export({
 *     filename : 'Gantt Export'
 * })
 * ```
 *
 * ## Processing of exported data
 *
 * Use the {@link #event-dataCollected} event to process exported data before it is written to the XML-file:
 *
 * ```javascript
 * // set listener on Gantt construction step
 * const gantt = new Gantt({
 *     ---
 *     features : {
 *         mspExport : {
 *             listeners : {
 *                 dataCollected : {{ data }} => {
 *                     // patch <Project><Name> tag content
 *                     data.Name = 'My Cool Project';
 *                 }
 *             }
 *         }
 *     }
 * });
 *
 * // set listener at runtime
 * gantt.features.mspExport.on({
 *     dataCollected : {{ data }} => {
 *         // patch <Project><Name> tag content
 *         data.Name = 'My Cool Project';
 *     }
 * })
 * ```
 *
 * @classtype mspExport
 *
 * @extends Core/mixin/InstancePlugin
 * @feature
 * @demo Gantt/msprojectexport
 */
export default class MspExport extends InstancePlugin {
    static get $name() {
        return 'MspExport';
    }

    resourceCalendar = new Map()

    static configurable = {
        /**
         * Name of the exported file (including extension)
         * @config {String}
         * @default
         */
        filename : null,

        /**
         * Defines how dates are formatted for MS Project. Information about formats can be found in {@link Core.helper.DateHelper}
         * @config {String}
         * @default
         */
        dateFormat : 'YYYY-MM-DDTHH:mm:ss',

        /**
         * Defines how time is formatted for MSProject. Information about formats can be found in {@link Core.helper.DateHelper}
         * @config {String}
         * @default
         */
        timeFormat : 'HH:mm:ss',

        /**
         * Defines the version used for MSProject (2013 or 2019)
         * @config {Number}
         * @default
         */
        msProjectVersion : 2019
    }

    /**
     * Generate the export data to generate the XML.
     * @returns {Object} Gantt data on MS Project structure to generate the XML
     * @private
     */
    generateExportData() {
        const me = this;

        return {
            ...me.getMsProjectConfig(),
            Calendars : {
                Calendar : me.getCalendarsData()
            },
            Tasks : {
                Task : me.getTasksData()
            },
            Resources : {
                Resource : me.getResourcesData()
            },
            Assignments : {
                Assignment : me.getAssignmentsData()
            }
        };
    }

    /**
     * Generates and downloads the .XML file.
     * @param {Object} [config] Optional configuration object, which overrides the initial settings of the feature/exporter.
     * @param {String} [config.filename] The filename to use
     */
    export(config = {}) {
        const me = this;

        if (me.disabled) {
            return;
        }

        me.resourceCalendar.clear();

        config = ObjectHelper.assign({}, me.config, config);

        if (!config.filename) {
            config.filename = `${me.client.$$name}.xml`;
        }

        /**
         * Fires on the owning Gantt before export starts. Return `false` to cancel the export.
         * @event beforeMspExport
         * @preventable
         * @on-owner
         * @param {Object} config Export config
         */
        if (me.client.trigger('beforeMspExport', { config }) !== false) {

            const data = me.generateExportData(config);

            /**
             * Fires when project data is collected to an object
             * that is going to be exported as XML text.
             *
             * The event can be used to modify exported data before it is written to the XML-file:
             *
             * ```javascript
             * const gantt = new Gantt({
             *     ---
             *     features : {
             *         mspExport : {
             *             listeners : {
             *                 // listener to process exported data
             *                 dataCollected : {{ data }} => {
             *                     // patch <Project><Name> tag content
             *                     data.Name = 'My Cool Project';
             *                 }
             *             }
             *         }
             *     }
             * });
             * ```
             * @event dataCollected
             * @param {Object} config Export config
             * @param {Object} data Collected data to export
             */
            me.trigger('dataCollected', { config, data });

            const
                fileContent = me.convertToXml(data),
                eventParams = { config, data, fileContent };

            /**
             * Fires on the owning Gantt when project content is exported
             * to XML, before the XML is downloaded by the browser.
             * @event mspExport
             * @on-owner
             * @param {Object} config Export config
             * @param {String} fileContent Exported XML-file content
             */
            me.client.trigger('mspExport', eventParams);

            BrowserHelper.download(config.filename, `data:text/xml;charset=utf-8,${encodeURIComponent(eventParams.fileContent)}`);
        }
    }

    /**
     * Convert Object data to XML.
     * @param {Object} data The Object with data.
     * @returns {String} The XML data.
     * @private
     */
    convertToXml(data) {
        return XMLHelper.convertFromObject(data, {
            rootName            : 'Project',
            elementName         : '',
            xmlns               : 'http://schemas.microsoft.com/project',
            rootElementForArray : false
        });
    }

    /**
     * Get the XML configurations in MS Project format.
     * @returns {Object} MS Project configurations for the XML
     * @private
     */
    getMsProjectConfig() {
        const
            me = this,
            dateFormat = me.dateFormat,
            { project } = me.client,
            fileName = me.filename || me.client.$$name;

        return {
            CalendarUID             : me.getCalendarUID(project.effectiveCalendar),
            CreationDate            : DH.format(new Date(), dateFormat),
            CurrentDate             : DH.format(new Date(), dateFormat),
            DaysPerMonth            : project.daysPerMonth,
            FinishDate              : DH.format(project.endDate, dateFormat),
            MinutesPerDay           : project.hoursPerDay * 60,
            MinutesPerWeek          : project.daysPerWeek * project.hoursPerDay * 60,
            Name                    : fileName,
            ScheduleFromStart       : project.direction === 'Forward' ? 1 : 0,
            StartDate               : DH.format(project.startDate, dateFormat),
            Title                   : fileName,
            WorkFormat              : projectUnitMap[project.effortUnit],
            ProjectExternallyEdited : 1
        };
    }

    /**
     * Format Calendars from Gantt to MS Project format.
     * @returns {Array} Calendars array formatted
     * @private
     */
    getCalendarsData() {
        const
            me = this,
            {
                calendarManagerStore,
                project
            } = me.client,
            { effectiveCalendar } = project,
            calendars             = calendarManagerStore.allRecords || [];

        // if project's calendar is not included on calendars array, include it
        if (!calendarManagerStore.getByInternalId(effectiveCalendar.internalId)) {
            calendars.push(effectiveCalendar);
        }

        // Each resource in MS Project data model has its own calendar
        // so let's make dummy calendars for all resources

        me.client.resources.forEach(resource => {
            const calendar = new resource.effectiveCalendar.constructor({ name : resource.name });

            // parent calendar for this dummy will be the real calendar the resource uses
            calendar.parent = resource.effectiveCalendar;

            calendar.isResourceCalendar = true;

            // remember the resource calendar
            me.resourceCalendar.set(resource, calendar);

            calendars.push(calendar);
        });

        return calendars.map(calendar => ({
            // MS Project does not support calendars hierarchy fully
            // it has two level hierarchy:
            // - first level - so called base calendars
            // - second level - any other calendars (including resource calendars) that extend the base ones
            BaseCalendarUID : calendar.isResourceCalendar ? me.getCalendarUID(calendar.parent, 0) : 0,
            // all non-dummy calendars we import as base calendars (the one that can be extended in MSP)
            IsBaseCalendar  : !calendar.isResourceCalendar,
            Name            : `${calendar.name || calendar.internalId} - imported`,
            UID             : me.getCalendarUID(calendar),
            WeekDays        : {
                WeekDay : me.formatWeekDays(calendar)
            }//,
            // TODO
            // WorkWeeks : {
            //     WorkWeek : this.formatWorkWeeks(calendar)
            // }
        }));
    }

    /**
     * Format intervals to MS project format for the WeekDays property.
     * @param {Array} Array of intervals data.
     * @returns {Array} Array with data formatted
     * @private
     */
    formatWeekDays(calendar) {
        const
            { timeFormat } = this,
            ticks          = [],
            daysData       = {};

        let startDate = MIN_DATE,
            endDate;

        for (let i = 0; i < 7; i++) {
            // week day index
            const day = startDate.getDay();

            daysData[day] = {
                DayType    : day + 1,
                DayWorking : 0
            };

            endDate = DH.clearTime(DH.add(startDate, 1, 'day'));

            ticks.push({ startDate, endDate });

            // proceed to next day
            startDate = endDate;
        }

        const
            // dummy calendar with 7 day borders ..to force forEachAvailabilityInterval to stop on each day start
            dummyCalendar        = new calendar.constructor({ intervals : ticks }),
            calendarsCombination = this.client.project.combineCalendars([calendar, dummyCalendar]);

        calendarsCombination.forEachAvailabilityInterval(
            { startDate : MIN_DATE, endDate },
            (startDate, endDate, calendarCacheInterval) => {
                const
                    calendarsStatus   = calendarCacheInterval.getCalendarsWorkStatus(),
                    dayData           = daysData[startDate.getDay()];

                // if the calendar has working interval for that period
                if (calendarsStatus.get(calendar)) {
                    // consider the day as working
                    dayData.DayWorking = 1;

                    dayData.WorkingTimes = dayData.WorkingTimes || { WorkingTime : [] };

                    // put that time range
                    dayData.WorkingTimes.WorkingTime.push({
                        FromTime : DH.format(startDate, timeFormat),
                        ToTime   : DH.format(endDate, timeFormat)
                    });
                }
            }
        );

        return Object.values(daysData);
    }

    /**
     * Format intervals to MS project format for the WorkWeeks property.
     * @param {Array} Array of intervals data.
     * @returns {Array} Array with data formatted
     * @private
     */
    // formatWorkWeeks(calendar) {
    //     // TODO: implement
    // }

    collectProjectTasks(project = this.client.project) {
        const result = [];

        project.taskStore.rootNode.traverse(node => result.push(node), true);

        return result;
    }

    /**
     * Format Tasks from Gantt to MS Project format.
     * @returns {Array} Tasks array formatted
     * @private
     */
    getTasksData() {
        const
            me             = this,
            { dateFormat } = me,
            { project }    = me.client,
            tasks          = me.collectProjectTasks(project);

        return tasks.map(task => {
            const
                { startDate, endDate, wbsCode } = task,
                // filter out broken dependencies
                predecessors     = task.predecessors.filter(({ fromEvent }) => fromEvent),
                durationMs       = project.convertDuration(task.duration, task.durationUnit, 'millisecond'),
                effortMs         = project.convertDuration(task.effort, task.effortUnit, 'millisecond'),
                actualDurationMs = task.percentDone * 0.01 * durationMs,
                startDateStr     = DH.format(startDate, dateFormat),
                endDateStr       = DH.format(endDate, dateFormat),
                durationStr      = me.convertDurationToMspDuration(durationMs, 'ms'),
                result           = {
                    IsNull          : startDate && endDate ? 0 : 1,
                    ActualDuration  : me.convertDurationToMspDuration(actualDurationMs, 'ms'),
                    Duration        : durationStr,
                    DurationFormat  : taskUnitMap[task.durationUnit],
                    EarlyFinish     : DH.format(task.earlyEndDate, dateFormat),
                    EarlyStart      : DH.format(task.earlyStartDate, dateFormat),
                    EffortDriven    : task.effortDriven ? 1 : 0,
                    Estimated       : 0,
                    Finish          : endDateStr,
                    LateFinish      : DH.format(task.lateEndDate, dateFormat),
                    LateStart       : DH.format(task.lateStartDate, dateFormat),
                    Manual          : task.manuallyScheduled ? 1 : 0,
                    ManualDuration  : durationStr,
                    ManualFinish    : endDateStr,
                    ManualStart     : startDateStr,
                    Milestone       : task.isMilestone ? 1 : 0,
                    Name            : task.name,
                    OutlineLevel    : wbsCode.split('.').length,
                    OutlineNumber   : wbsCode,
                    PercentComplete : Math.round(task.percentDone),
                    PredecessorLink : predecessors.map(predecessor => ({
                        LagFormat      : taskUnitMap[predecessor.lagUnit],
                        LinkLag        : project.convertDuration(predecessor.lag, predecessor.lagUnit, 'minute') * 10,
                        PredecessorUID : me.getTaskUID(predecessor.fromEvent),
                        Type           : dependencyTypeMap[predecessor.type]
                    })),
                    Baseline : task.baselines.map((baseline, index) => ({
                        Number   : index,
                        Finish   : DH.format(baseline.endDate, dateFormat),
                        Start    : DH.format(baseline.startDate, dateFormat),
                        Duration : me.convertDurationToMspDuration(baseline.duration, baseline.durationUnit)
                    })),
                    RemainingDuration : me.convertDurationToMspDuration(durationMs - actualDurationMs, 'ms'),
                    Rollup            : task.rollup ? 1 : 0,
                    Start             : startDateStr,
                    Summary           : task.isLeaf ? 0 : 1,
                    TotalSlack        : task.totalSlack,
                    Type              : task.isLeaf ? typeMap[task.schedulingMode] : 1,
                    UID               : me.getTaskUID(task),
                    WBS               : wbsCode,
                    Work              : me.convertDurationToMspDuration(effortMs, 'ms')
                };

            if (task.constraintType) {
                result.ConstraintDate = DH.format(task.constraintDate, dateFormat);
                result.ConstraintType = constraintMap[task.constraintType];
            }

            if (task.deadlineDate) {
                result.Deadline = DH.format(task.deadlineDate, dateFormat);
            }

            if (task.calendar) {
                result.CalendarUID = me.getCalendarUID(task.calendar, 0);
            }

            if (task.note) {
                result.Notes = task.note;
            }

            return result;
        });
    }

    getTaskUID(task) {
        return task.internalId;
    }

    getCalendarUID(calendar, fallbackValue = -1) {
        return calendar && !calendar.isRoot ? calendar.internalId : fallbackValue;
    }

    /**
     * Format Resources from Gantt to MS Project format.
     * @returns {Array} Resources array formatted
     * @private
     */
    getResourcesData() {
        return this.client.resources.map(resource => ({
            // seems for version 2013 setting the calendar id it breaks so only Project level calendar is importable
            CalendarUID : this.msProjectVersion === 2013 ? null : this.getCalendarUID(this.resourceCalendar.get(resource)),
            Name        : resource.name,
            UID         : resource.internalId,
            Type        : 1
        }));
    }

    /**
     * Format Assignments from Gantt to MS Project format.
     * @returns {Array} Assignments array formatted
     * @private
     */
    getAssignmentsData() {
        // for version 2013 the assignments doesn't work
        if (this.msProjectVersion === 2013) {
            return [];
        }

        return this.client.assignments.map(assignment => ({
            Finish      : DH.format(assignment.event.endDate, this.dateFormat),
            // TODO it seems we need to provide effort per assignment value ..there is no ready to use field for that yet
            // PercentWorkComplete : Math.round(event.percentDone),
            ResourceUID : assignment.resource.internalId,
            Start       : DH.format(assignment.event.startDate, this.dateFormat),
            TaskUID     : this.getTaskUID(assignment.event),
            UID         : assignment.internalId,
            Units       : assignment.units / 100
        }));
    }

    /**
     * Convert to MS Project Span Date Time format.
     * @param {Number} value The value to be converted.
     * @param {String} unit The unit of the value to be converted
     * @returns {String} The value formatted to "PTnHnMnS". E.g: PT10H30M, PT6H20M13S
     * @private
     */
    convertDurationToMspDuration(value, unit) {
        if (value == null) {
            return '';
        }

        const
            delta = DH.getDelta(DH.as('ms', value, unit), { abbrev : true }),
            { w : weeks, min : mins, s : secs } = delta;

        let { yr : years, mon : months, d : days, h : hours } = delta;

        hours = hours || 0;

        // convert years, months, weeks and days to hours because MS Project work only with hours, minutes and seconds
        if (years) {
            hours += DH.as('h', years, 'y');
        }

        if (months) {
            hours += DH.as('h', months, 'month');
        }

        if (weeks) {
            hours += DH.as('h', weeks, 'w');
        }

        if (days) {
            hours += DH.as('h', days, 'd');
        }

        return `PT${hours}H${mins || 0}M${secs || 0}S`;
    }
}

GridFeatureManager.registerFeature(MspExport, false, 'Gantt');
