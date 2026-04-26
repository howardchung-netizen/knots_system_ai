import CheckColumn from '../../Grid/column/CheckColumn.js';
import ColumnStore from '../../Grid/data/ColumnStore.js';

/**
 * @module Gantt/column/MilestoneColumn
 */

/**
 * A Column that indicates whether a task is a milestone. This column uses a {@link Core.widget.Checkbox checkbox} as
 * its editor.
 *
 * @extends Grid/column/CheckColumn
 * @classType milestone
 */
export default class MilestoneColumn extends CheckColumn {

    static get $name() {
        return 'MilestoneColumn';
    }

    static get type() {
        return 'milestone';
    }

    static get isGanttColumn() {
        return true;
    }

    static get defaults() {
        return {
            field : 'milestone',
            text  : 'L{Milestone}'
        };
    }
}

ColumnStore.registerColumnType(MilestoneColumn);
