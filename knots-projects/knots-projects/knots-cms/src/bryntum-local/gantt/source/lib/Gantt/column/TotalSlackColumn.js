import ColumnStore from '../../Grid/data/ColumnStore.js';
import DurationColumn from '../../Scheduler/column/DurationColumn.js';

/**
 * @module Gantt/column/TotalSlackColumn
 */

/**
 * A column that displays the task's {@link Gantt.model.TaskModel#field-totalSlack total slack}.
 *
 * Default editor is a {@link Core.widget.DurationField DurationField}.
 *
 * @extends Scheduler/column/DurationColumn
 * @classType totalslack
 */
export default class TotalSlackColumn extends DurationColumn {

    static get $name() {
        return 'TotalSlackColumn';
    }

    static get type() {
        return 'totalslack';
    }

    static get isGanttColumn() {
        return true;
    }

    get durationUnitField() {
        return 'slackUnit';
    }

    static get defaults() {
        return {
            field : 'totalSlack',
            text  : 'L{Total Slack}'
        };
    }
}

ColumnStore.registerColumnType(TotalSlackColumn);
