import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import ResourceTimeRangesBase from '../../Scheduler/feature/base/ResourceTimeRangesBase.js';
import ResourceTimeRangeModel from '../../Scheduler/model/ResourceTimeRangeModel.js';
import DateHelper from '../../Core/helper/DateHelper.js';

/**
 * @module SchedulerPro/feature/ResourceNonWorkingTime
 */

/**
 * Feature that highlights the non-working intervals for resources based on their {@link SchedulerPro.model.ResourceModel#field-calendar}.
 * If a resource has no calendar defined, the project's calendar will be used. The non-working time interval can
 * also be recurring. You can find a live example showing how to achieve this in the [Resource Non-Working Time Demo](../examples/resource-non-working-time/).
 *
 * {@inlineexample SchedulerPro/feature/ResourceNonWorkingTime.js}
 *
 * ## Data structure
 * Example data defining calendars and assigning the resources a calendar:
 * ```javascript
 * {
 *   "success"   : true,
 *   "calendars" : {
 *       "rows" : [
 *           {
 *               "id"                       : "day",
 *               "name"                     : "Day shift",
 *               "unspecifiedTimeIsWorking" : false,
 *               "cls"                      : "dayshift",
 *               "intervals"                : [
 *                   {
 *                       "recurrentStartDate" : "at 8:00",
 *                       "recurrentEndDate"   : "at 17:00",
 *                       "isWorking"          : true,
 *                   }
 *               ]
 *           }
 *    ],
 *    "resources" : {
 *       "rows" : [
 *           {
 *               "id"         : 1,
 *               "name"       : "George",
 *               "calendar"   : "day",
 *               "role"       : "Office",
 *               "eventColor" : "blue"
 *           },
 *           {
 *               "id"         : 2,
 *               "name"       : "Rob",
 *               "calendar"   : "day",
 *               "role"       : "Office",
 *               "eventColor" : "blue"
 *           }
 *        ]
 *   [...]
 * ```
 *
 * ```javascript
 * const scheduler = new SchedulerPro({
 *   // A Project holding the data and the calculation engine for Scheduler Pro. It also acts as a CrudManager, allowing
 *   // loading data into all stores at once
 *   project : {
 *       autoLoad  : true,
 *       transport : {
 *           load : {
 *               url : './data/data.json'
 *           }
 *       }
 *   },
 *   features : {
 *       resourceNonWorkingTime : true
 *   },
 *   [...]
 * }):
 * ```
 * ## Styling non-working time interval elements
 *
 * To style the elements representing the non-working time elements you can set the {@link SchedulerPro.model.CalendarModel#field-cls}
 * field in your data. This will add a CSS class to all non-working time elements for the calendar. You can also add
 * an {@link SchedulerPro.model.CalendarModel#field-iconCls} value specifying an icon to display inside the interval.
 *
 * ```javascript
 * {
 *   "success"   : true,
 *   "calendars" : {
 *       "rows" : [
 *           {
 *               "id"                       : "day",
 *               "name"                     : "Day shift",
 *               "unspecifiedTimeIsWorking" : false,
 *               "cls"                      : "dayshift",
 *               "intervals"                : [
 *                   {
 *                       "recurrentStartDate" : "at 8:00",
 *                       "recurrentEndDate"   : "at 17:00",
 *                       "isWorking"          : true
 *                   }
 *               ]
 *           }
 *       ]
 *    }
 * }
 * ```
 *
 * You can also add a `cls` value and an `iconCls` to **individual** intervals:
 *
 * ```javascript
 * {
 *   "success"   : true,
 *   "calendars" : {
 *       "rows" : [
 *           {
 *               "id"                       : "day",
 *               "name"                     : "Day shift",
 *               "unspecifiedTimeIsWorking" : true,
 *               "intervals"                : [
 *                   {
 *                      "startDate"          : "2022-03-23T02:00",
 *                      "endDate"            : "2022-03-23T04:00",
 *                      "isWorking"          : false,
 *                      "cls"                : "factoryShutdown",
 *                      "iconCls"            : "warningIcon"
 *                  }
 *               ]
 *           }
 *       ]
 *    }
 * }
 * ```
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid.view.mixin.GridFeatures}.
 *
 * @extends Scheduler/feature/base/ResourceTimeRangesBase
 * @demo SchedulerPro/resource-non-working-time
 * @classtype resourceNonWorkingTime
 * @feature
 */
export default class ResourceNonWorkingTime extends ResourceTimeRangesBase {

    //region Config

    static get $name() {
        return 'ResourceNonWorkingTime';
    }

    static get configurable() {
        return {
            rangeCls        : 'b-sch-resourcetimerange b-sch-resourcenonworkingtime',
            /**
             * The largest time axis unit to display non working ranges for ('hour' or 'day' etc).
             * When zooming to a view with a larger unit, no non-working time elements will be rendered.
             *
             * **Note:** Be careful with setting this config to big units like 'year'. When doing this,
             * make sure the timeline {@link Scheduler.view.TimelineBase#config-startDate start} and
             * {@link Scheduler.view.TimelineBase#config-endDate end} dates are set tightly.
             * When using a long range (for example many years) with non-working time elements rendered per hour,
             * you will end up with millions of elements, impacting performance.
             * When zooming, use the {@link Scheduler.view.mixin.TimelineZoomable#config-zoomKeepsOriginalTimespan} config.
             * @config {String}
             * @default
             */
            maxTimeAxisUnit : 'hour',

            /**
             * The Model class to use for representing a {@link Scheduler.model.ResourceTimeRangeModel}
             * @config {Function}
             */
            resourceTimeRangeModelClass : ResourceTimeRangeModel
        };
    }

    static get properties() {
        return {
            resourceMap : new Map()
        };
    }

    //endregion

    //region Constructor

    construct() {
        super.construct(...arguments);

        this.resourceTimeRangeModelClass = class ResourceNonWorkingTimeModel extends this.resourceTimeRangeModelClass {
            static get $name() {
                return 'ResourceNonWorkingTimeModel';
            }

            static domIdPrefix = 'resourcenonworkingtimemodel'
        };

        this.client.timeAxis.on({
            name        : 'timeAxis',
            reconfigure : 'onTimeAxisReconfigure',
            // should trigger before event rendering chain
            prio        : 100,
            thisObj     : this
        });
    }

    //endregion

    //region Init

    attachToResourceStore(resourceStore) {
        super.attachToResourceStore(resourceStore);

        resourceStore?.on({
            name            : 'resourceStore',
            changePreCommit : 'onResourceChange',
            thisObj         : this
        });
    }

    attachToCalendarManagerStore(calendarManagerStore) {
        super.attachToCalendarManagerStore(calendarManagerStore);

        calendarManagerStore?.on({
            name            : 'calendarManagerStore',
            changePreCommit : 'onCalendarChange',
            thisObj         : this
        });
    }

    //endregion

    //region Events

    onTimeAxisReconfigure() {
        // reset ranges cache on timeAxis change
        this.resourceMap.clear();
    }

    onResourceChange({ action, records, record, changes }) {
        const me = this;

        // Might need to redraw on update
        if (action === 'update') {
            const change = changes.calendar;

            // Ignore calendar normalization
            if (change && (typeof change.oldValue !== 'string' || change.value?.id !== change.oldValue)) {
                me.resourceMap.delete(record.id);
                // Redraw row in case calendar change did not affect any events
                me.client.runWithTransition(() => {
                    me.client.currentOrientation.refreshEventsForResource(record);
                });
            }
        }

        // Keep map up to date on removals (adds are handled through rendering in getEventsToRender)
        if (action === 'remove') {
            records.forEach(record => me.resourceMap.delete(record.id));
        }

        if (action === 'removeall') {
            me.resourceMap.clear();
        }
    }

    onCalendarChange({ action, records, record, changes }) {
        // TODO
    }

    //endregion

    //region Internal

    // Called on render of resources events to get events to render. Add any ranges
    // (chained function from Scheduler)
    getEventsToRender(resource, events) {
        const
            me                      = this,
            { resourceMap, client } = me,
            { timeAxis }            = client,
            shouldPaint             = !me.maxTimeAxisUnit || DateHelper.compareUnits(timeAxis.unit, me.maxTimeAxisUnit) <= 0;

        if (!me.disabled && shouldPaint && resource.effectiveCalendar) {
            if (!resourceMap.has(resource.id)) {
                const
                    ranges  = resource.effectiveCalendar.getNonWorkingTimeRanges(
                        client.startDate,
                        client.endDate
                    ),
                    records = ranges.map((range, i) => new me.resourceTimeRangeModelClass({
                        id           : `r${resource.id}i${i}`,
                        iconCls      : range.iconCls || resource.effectiveCalendar.iconCls || '',
                        cls          : `${resource.effectiveCalendar.cls || ''} ${range.cls || ''}`,
                        startDate    : range.startDate,
                        endDate      : range.endDate,
                        resourceId   : resource.id,
                        isNonWorking : true
                    }));

                resourceMap.set(resource.id, records);
            }

            events.push(...resourceMap.get(resource.id));
        }

        return events;
    }

    shouldInclude({ isNonWorking }) {
        return isNonWorking;
    }

    //endregion

}

// No feature based styling needed, do not add a cls to Scheduler
ResourceNonWorkingTime.featureClass = '';

GridFeatureManager.registerFeature(ResourceNonWorkingTime, false, 'SchedulerPro');
