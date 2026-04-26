/**
 * Taken from the original example
 */
import { Column, ColumnStore } from '@bryntum/gantt';

/**
 * @module StatusColumn
 */

/**
 * A column showing the status of a task
 *
 * @extends Gantt/column/Column
 * @classType statuscolumn
 */
export default class StatusColumn extends Column {
    static get $name() {
        return 'StatusColumn';
    }

    static get type() {
        return 'statuscolumn';
    }

    static get isGanttColumn() {
        return true;
    }

    static get defaults() {
        return {
            // Set your default instance config properties here
            field      : 'status',
            text       : 'Status',
            editor     : false,
            cellCls    : 'b-status-column-cell',
            htmlEncode : false,
            filterable : {
                filterField: {
                    type  : 'combo',
                    items : ['Not Started', 'Started', 'Completed', 'Late']
                }
            }
        };
    }

    //endregion

    renderer({ record }) {
        const status = record.status;

        return status
            ? {
                  tag       : 'i',
                  className : `b-fa b-fa-circle ${status.replace(/\s/g, "")}`,
                  html      : status
              }
             :  '';
    }
}

ColumnStore.registerColumnType(StatusColumn);
