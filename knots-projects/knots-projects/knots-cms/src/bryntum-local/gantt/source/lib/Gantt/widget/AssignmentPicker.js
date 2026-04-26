import AssignmentGrid from './AssignmentGrid.js';
import '../../Core/widget/Container.js';
import '../../Core/widget/Button.js';

/**
 * @module Gantt/widget/AssignmentPicker
 */

/**
 * Class for assignment field dropdown, wraps {@link Gantt/widget/AssignmentGrid} within a frame and adds two buttons: Save and Cancel
 * @private
 */
export default class AssignmentPicker extends AssignmentGrid {

    static get $name() {
        return 'AssignmentPicker';
    }

    // Factoryable type name
    static get type() {
        return 'assignmentpicker';
    }

    static get defaultConfig() {
        return {
            focusable : true,
            trapFocus : true,
            height    : '20em',
            minWidth  : '25em',
            bbar      : [
                {
                    type        : 'button',
                    text        : this.L('L{Object.Save}'),
                    localeClass : this,
                    ref         : 'saveBtn',
                    color       : 'b-green'
                },
                {
                    type        : 'button',
                    text        : this.L('L{Object.Cancel}'),
                    localeClass : this,
                    ref         : 'cancelBtn',
                    color       : 'b-gray'
                }
            ],
            /**
             * The Event to load resource assignments for.
             * Either an Event or {@link #config-store store} should be given.
             *
             * @config {Gantt.model.TaskModel}
             */
            projectEvent : null,

            /**
             * Store for the picker.
             * Either store or {@link #config-projectEvent projectEvent} should be given
             *
             * @config {Gantt.data.AssignmentsManipulationStore}
             */
            store : null
        };
    }

    configure(config) {
        config.selectedRecordCollection = config.assignments;

        super.configure(config);
    }

    show() {
        this.originalSelected = this.selectedRecords.map(a => a.copy());
        return super.show();
    }

    afterConfigure() {
        const me = this;

        super.afterConfigure();

        me.bbar.widgetMap.saveBtn?.on('click', me.onSaveClick, me);
        me.bbar.widgetMap.cancelBtn?.on('click', me.onCancelClick, me);
    }

    //region Event handlers
    onSaveClick() {
        this.hide();
    }

    onCancelClick() {
        this.hide();
    }
    //endregion
}

// Register this widget type with its Factory
AssignmentPicker.initClass();
