import SchedulerTimeAxisColumn from '../../Scheduler/column/TimeAxisColumn.js';
import ColumnStore from '../../Grid/data/ColumnStore.js';

/**
 * @module Gantt/column/TimeAxisColumn
 */

/**
 * A column containing the timeline "viewport", in which tasks, dependencies etc are drawn.
 * Normally you do not need to interact with or create this column, it is handled by Gantt.
 *
 * @extends Scheduler/column/TimeAxisColumn
 * @typings Scheduler/column/TimeAxisColumn -> Scheduler/column/SchedulerTimeAxisColumn
 */
export default class TimeAxisColumn extends SchedulerTimeAxisColumn {

    static get defaults() {
        return {
            /**
             * Set to `false` to disable {@link Gantt.feature.TaskMenu TaskMenu} for the cell elements in this column.
             * @config {Boolean} enableCellContextMenu
             * @default true
             * @category Menu
             */
            enableCellContextMenu : true
        };
    }

}

ColumnStore.registerColumnType(TimeAxisColumn);
