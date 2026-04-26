import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import GridCellEdit from '../../Grid/feature/CellEdit.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';

/**
 * @module Gantt/feature/CellEdit
 */

/**
 * Extends the {@link Grid.feature.CellEdit} to encapsulate Gantt functionality. This feature is enabled by <b>default</b>
 *
 * {@inlineexample Gantt/feature/CellEdit.js}
 *
 * Editing can be started by a user by double-clicking an editable cell in the gantt's data grid, or it can be started programmatically
 * by calling {@link Grid/feature/CellEdit#function-startEditing} and providing it with correct cell context.
 *
 * See {@link #function-doAddNewAtEnd}.
 *
 * ## Instant update
 * If {@link Grid.column.Column#config-instantUpdate} on the column is set to true, record will be
 * updated instantly as value in the editor is changed. In combination with
 * {@link Gantt.model.ProjectModel#config-autoSync} it could result in excessive requests to the backend.
 *
 * Instant update is enabled for these columns by default:
 * - {@link Scheduler.column.DurationColumn}
 * - {@link Gantt.column.StartDateColumn}
 * - {@link Gantt.column.EndDateColumn}
 * - {@link Gantt.column.ConstraintDateColumn}
 * - {@link Gantt.column.DeadlineDateColumn}
 * - {@link Gantt.column.EarlyStartDateColumn}
 * - {@link Gantt.column.EarlyEndDateColumn}
 * - {@link Gantt.column.LateStartDateColumn}
 * - {@link Gantt.column.LateEndDateColumn}
 *
 * To disable instant update on the column set config to false:
 * ```
 * new Gantt({
 *     columns: [
 *         {
 *             type: 'startdate',
 *             instantUpdate: false
 *         }
 *     ]
 * })
 * ```
 *
 * @extends Grid/feature/CellEdit
 *
 * @classtype cellEdit
 * @feature
 * @typings Grid/feature/CellEdit -> Grid/feature/GridCellEdit
 */
export default class CellEdit extends GridCellEdit {

    static get $name() {
        // NOTE: Even though the class name matches the one defined on the base class
        // we need this method in order registerFeature() to work properly
        // (it uses hasOwnProperty when detecting the class name)
        return 'CellEdit';
    }

    // Default configuration
    static get defaultConfig() {
        return {
            addNewAtEnd : {
                duration : 1
            }
        };
    }

    static get pluginConfig() {
        const cfg = super.pluginConfig;

        cfg.chain = [...cfg.chain, 'onProjectChange'];

        return cfg;
    }

    onProjectChange() {
        // Cancel editing if project is changed
        this.cancelEditing(true);
    }

    // Provide any editor with access to the current project
    getEditorForCell({ record }) {
        const
            editor     = super.getEditorForCell(...arguments),
            inputField = editor.inputField;

        inputField.project = record.project;
        inputField.eventRecord = record;

        return editor;
    }

    /**
     * Adds a new, empty record at the end of the TaskStore with the initial
     * data specified by the {@link Grid.feature.CellEdit#config-addNewAtEnd} setting.
     *
     * @returns {Promise} Newly added record wrapped in a promise.
     */
    async doAddNewAtEnd() {
        const
            gantt       = this.grid,
            addNewAtEnd = this.addNewAtEnd,
            { project } = gantt;

        // First finish any ongoing calculations
        await project.commitAsync();

        if (gantt.isDestroyed) {
            return;
        }

        const newTask = gantt.taskStore.rootNode.appendChild(ObjectHelper.assign({
            name      : this.L('L{Gantt.New task}'),
            startDate : project.startDate
        }, addNewAtEnd));

        await project.commitAsync();

        if (gantt.isDestroyed) {
            return;
        }

        // If the new record was not added due to it being off the end of the rendered block
        // ensure we force it to be there before we attempt to edit it.
        if (!gantt.rowManager.getRowFor(newTask)) {
            gantt.rowManager.displayRecordAtBottom();
        }

        return newTask;
    }
}

GridFeatureManager.registerFeature(CellEdit, true, 'Gantt');
