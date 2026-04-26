import ResourceInfoColumn from '../../Scheduler/column/ResourceInfoColumn.js';
import ColumnStore from '../../Grid/data/ColumnStore.js';

/**
 * @module Gantt/column/ResourceAssignmentGridResourceColumn.js
 */

/**
 * Column showing the resource name / avatar inside the AssignmentGrid
 *
 * @internal
 * @extends Scheduler/column/ResourceInfoColumn
 * @classType resourceassignment
 */
export default class ResourceAssignmentGridResourceColumn extends ResourceInfoColumn {

    static get $name() {
        return 'ResourceAssignmentGridResourceColumn';
    }

    static get type() {
        return 'assignmentResource';
    }

    static get defaults() {
        return {
            showEventCount     : false,
            cls                : 'b-assignmentgrid-resource-column',
            field              : 'resourceName',
            flex               : 1,
            editor             : null,
            useNameAsImageName : false,
            filterable         : {
                filterField : {
                    placeholder : 'L{AssignmentGrid.Name}',
                    triggers    : {
                        filter : {
                            align : 'start',
                            cls   : 'b-icon b-icon-filter'
                        }
                    }
                }
            }
        };
    }

    defaultRenderer({ grid, record, cellElement, value, isExport }) {
        if (!record.isSpecialRow) {
            record = record.resource;
        }

        return super.defaultRenderer({ grid, record, cellElement, value, isExport });
    }
}

ColumnStore.registerColumnType(ResourceAssignmentGridResourceColumn);
