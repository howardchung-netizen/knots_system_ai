import ColumnStore from '../../Grid/data/ColumnStore.js';
import DurationColumn from '../../Scheduler/column/DurationColumn.js';
import EffortField from '../../SchedulerPro/widget/EffortField.js';

/**
 * @module Gantt/column/EffortColumn
 */

/**
 * A column showing the task {@link Gantt.model.TaskModel#field-effort effort} and {@link Gantt.model.TaskModel#field-effortUnit units}.
 * The editor of this column understands the time units, so user can enter "4d" indicating 4 days effort, or "4h" indicating 4 hours, etc.
 * The numeric magnitude can be either an integer or a float value. Both "," and "." are valid decimal separators.
 * For example, you can enter "4.5d" indicating 4.5 days duration, or "4,5h" indicating 4.5 hours.
 *
 * Default editor is a {@link Core.widget.DurationField DurationField}.
 *
 * @extends Scheduler/column/DurationColumn
 * @classType effort
 */
export default class EffortColumn extends DurationColumn {

    static get $name() {
        return 'EffortColumn';
    }

    static get type() {
        return 'effort';
    }

    //region Config

    static get defaults() {
        return {
            field : 'fullEffort',
            text  : 'L{Effort}'
        };
    }

    //endregion

    get defaultEditor() {
        return {
            type : EffortField.type,
            name : this.field
        };
    }
}

ColumnStore.registerColumnType(EffortColumn);
