import Column from '../../Grid/column/Column.js';
import ColumnStore from '../../Grid/data/ColumnStore.js';
import DependencyField from '../widget/DependencyField.js';
import Delayable from '../../Core/mixin/Delayable.js';

/**
 * @module Gantt/column/DependencyColumn
 */
const
    hasNoProject = v => !v.project,
    depIsValid   = v => v;

/**
 * A column which displays, in textual form, the dependencies which either link to the
 * contextual task from other, preceding tasks, or dependencies which link the
 * contextual task to successor tasks.
 *
 * Default editor is a {@link Gantt/widget/DependencyField}.
 *
 * The {@link Grid/column/Column#config-field} MUST be either `predecessors` or `successors` in order
 * for this column to know what kind of dependency it is showing.
 *
 * By default predecessors and successors have a task ID as a value. But it's configurable and any field may be used to display there (as example: wbsCode or sequenceNumber)
 * using {@link #config-dependencyIdField}
 *
 * @classType dependency
 * @extends Grid/column/Column
 */
export default class DependencyColumn extends Delayable(Column) {

    static get $name() {
        return 'DependencyColumn';
    }

    static get type() {
        return 'dependency';
    }

    static get fields() {
        return [
            /**
             * Delimiter used for displayed value and editor
             * @config {String} delimiter
             */
            { name : 'delimiter', defaultValue : ';' },

            /**
             * A task field (id, wbsCode, sequenceNumber etc) that will be used when displaying and editing linked tasks. Defaults to {@link Gantt/view/GanttBase#config-dependencyIdField}
             * @config {String} dependencyIdField
             */
            { name : 'dependencyIdField', defaultValue : null }
        ];
    }

    static get defaults() {
        return {
            htmlEncode : false,
            width      : 120,

            renderer({ record, grid }) {
                const dependencyIdField = this.dependencyIdField || grid.dependencyIdField;
                return DependencyField.dependenciesToString(record[this.field], this.field === 'predecessors' ? 'from' : 'to', this.delimiter, dependencyIdField);
            },

            filterable({ value, record : taskRecord, column }) {
                const
                    dependencyIdField = column.dependencyIdField || column.grid.dependencyIdField;

                value = value.toLowerCase();

                return taskRecord[`${column.field === 'predecessors' ? 'predecessorTasks' : 'successorTasks'}`].some(linkedTask => {
                    return linkedTask && value.includes(linkedTask[dependencyIdField]?.toString().toLowerCase());
                });
            }
        };
    }

    afterConstruct() {


        super.afterConstruct();
    }

    getFilterableValue(record) {
        return this.renderer({ record, grid : this.grid });
    }

    async finalizeCellEdit({ grid, record, inputField, value, oldValue, editorContext }) {
        inputField.clearError();

        if (record && value) {
            const
                toValidate      = value.filter(hasNoProject),
                project         = grid.dependencyStore.getProject(),
                oldDependencies = record[this.field];

            await project.commitAsync();

            if (project.isDestroyed) return;

            const
                results  = await Promise.all(
                    toValidate.map(dependency => project.isValidDependencyModel(dependency, oldDependencies))
                ),
                valid = results.every(depIsValid);

            if (!valid) {
                return editorContext.column.L('L{Invalid dependency}');
            }
            return true;
        }
    }

    get defaultEditor() {
        const
            me = this,
            { grid } = me,
            isPredecessor = me.field === 'predecessors';

        return {
            type              : 'dependencyfield',
            grid              : grid,
            name              : me.field,
            delimiter         : me.delimiter,
            dependencyIdField : me.dependencyIdField || grid.dependencyIdField,
            ourSide           : isPredecessor ? 'to' : 'from',
            otherSide         : isPredecessor ? 'from' : 'to',
            store             : grid.eventStore || grid.taskStore,
            dependencyStore   : grid.dependencyStore
        };
    }
}

ColumnStore.registerColumnType(DependencyColumn);
