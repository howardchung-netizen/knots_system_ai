import SchedulerProCalendarManagerStore from '../../SchedulerPro/data/CalendarManagerStore.js';
import CalendarModel from '../model/CalendarModel.js';

/**
 * @module Gantt/data/CalendarManagerStore
 */

/**
 * A class representing the tree of calendars in the Gantt chart. An individual calendar is represented as an instance of the
 * {@link Gantt.model.CalendarModel} class. The store expects the data loaded to be hierarchical. Each parent node should
 * contain its children in a property called 'children'.
 *
 * Please refer to the [calendars guide](#Gantt/guides/basics/calendars.md) for details
 *
 * @extends SchedulerPro/data/CalendarManagerStore
 * @typings SchedulerPro/data/CalendarManagerStore -> SchedulerPro/data/SchedulerProCalendarManagerStore
 */
export default class CalendarManagerStore extends SchedulerProCalendarManagerStore {
    static get defaultConfig() {
        return {
            modelClass : CalendarModel
        };
    }
}
