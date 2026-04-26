/**
 * Taken from the original example
 */
import { Column, ColumnStore } from '@bryntum/gantt';

/**
 * @module MoveDayColumn
 */

/**
 * A column showing the moveDay of a task
 *
 * @extends Gantt/column/Column
 * @classType movedaycolumn
 */
export default class MoveDayColumn extends Column {
    static get $name() {
        return 'MoveDayColumn';
    }

    static get type() {
        return 'moveDayColumn';
    }

    static get isGanttColumn() {
        return false;
    }

    static get defaults() {
        return {
            // Set your default instance config properties here
            field      : 'moveDay',
            text       : 'Move Day',
            editor     : true,
            //cellCls    : 'b-status-column-cell',
            htmlEncode : false,
        };
    }

    renderer({ record }) {
        const moveDay = record.moveDay;
        return moveDay;
    }
}

ColumnStore.registerColumnType(MoveDayColumn);
