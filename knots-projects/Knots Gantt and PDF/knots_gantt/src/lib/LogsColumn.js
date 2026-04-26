/**
 * Taken from the original example
 */
import { Column, ColumnStore } from '@bryntum/gantt';

/**
 * @module LogsColumn
 */

/**
 * A column showing the status of a task
 *
 * @extends Gantt/column/Column
 * @classType logscolumn
 */
export default class LogsColumn extends Column {
    static get $name() {
        return 'LogsColumn';
    }

    static get type() {
        return 'logscolumn';
    }

    static get isGanttColumn() {
        return true;
    }

    static get defaults() {
        return {
            // Set your default instance config properties here
            field      : 'logs',
            text       : 'Logs',
            editor     : false,
            cellCls    : 'b-status-column-cell',
            htmlEncode : false,
            // filterable : {
            //     filterField: {
            //         type  : 'combo',
            //         items : ['Not Started', 'Started', 'Completed', 'Late']
            //     }
            // }
        };
    }

    //endregion

    renderer({ record }) {
        const logs = record.logs;

        return logs.length? logs[0].id : '';
            // ? {
            //       tag       : 'i',
            //       className : `b-fa b-fa-circle ${logs}`,
            //       html      : logs
            //   }
            //  :  '';
    }
}

ColumnStore.registerColumnType(LogsColumn);
