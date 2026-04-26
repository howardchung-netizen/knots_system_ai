import CheckColumn from '../../Grid/column/CheckColumn.js';
import ColumnStore from '../../Grid/data/ColumnStore.js';

/**
 * @module Gantt/column/InactiveColumn
 */

/**
 * A column that displays (and allows user to update) the task's
 * {@link Gantt/model/TaskModel#field-inactive} field.
 *
 * This column uses a {@link Core/widget/Checkbox} as its editor, and it is not intended to be changed.
 *
 * @extends Grid/column/CheckColumn
 * @classType inactive
 */
export default class InactiveColumn extends CheckColumn {

    static get $name() {
        return 'InactiveColumn';
    }

    static get type() {
        return 'inactive';
    }

    static get isGanttColumn() {
        return true;
    }

    static get defaults() {
        return {
            field : 'inactive',
            text  : 'L{Inactive}'
        };
    }
}

ColumnStore.registerColumnType(InactiveColumn);
