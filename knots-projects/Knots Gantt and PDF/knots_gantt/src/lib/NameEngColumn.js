/**
 * Taken from the original example
 */
import { Column, ColumnStore } from '@bryntum/gantt';

/**
 * @module NameEngColumn
 */

/**
 * A column showing the nameEng of a task
 *
 * @extends Gantt/column/Column
 * @classType nameengcolumn
 */
export default class NameEngColumn extends Column {
    static get $name() {
        return 'NameEngColumn';
    }

    static get type() {
        return 'nameEngColumn';
    }

    static get isGanttColumn() {
        return true;
    }

    static get defaults() {
        return {
            // Set your default instance config properties here
            field      : 'nameEng',
            text       : 'Task Eng',
            editor     : true,
            //cellCls    : 'b-status-column-cell',
            htmlEncode : false,
        };
    }

    //endregion

    renderer({ record }) {
        const nameEng = record.nameEng;
        return nameEng;
    }
}

ColumnStore.registerColumnType(NameEngColumn);
