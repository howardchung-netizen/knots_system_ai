import SchedulerProCalendarModel from '../../SchedulerPro/model/CalendarModel.js';

/**
 * @module Gantt/model/CalendarModel
 */

/**
 * This class represents a calendar in the Gantt project. It contains a collection of the {@link SchedulerPro.model.CalendarIntervalModel}.
 * Every interval can be either recurrent (regularly repeating in time) or static.
 *
 * Please refer to the [calendars guide](#Gantt/guides/basics/calendars.md) for details
 *
 * @extends SchedulerPro/model/CalendarModel
 *
 * @typings SchedulerPro/model/CalendarModel -> SchedulerPro/model/SchedulerProCalendarModel
 */
export default class CalendarModel extends SchedulerProCalendarModel {}
