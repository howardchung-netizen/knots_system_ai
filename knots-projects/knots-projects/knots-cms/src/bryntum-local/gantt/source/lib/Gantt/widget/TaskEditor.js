import GanttTaskEditor from '../../SchedulerPro/widget/GanttTaskEditor.js';

/**
 * @module Gantt/widget/TaskEditor
 */

/**
 * Provides a UI to edit tasks in a popup dialog. It is implemented as a Tab Panel with several preconfigured built-in
 * tabs. Although the default configuration may be adequate in many cases, the Task Editor is easily configurable.
 *
 * This demo shows how to use TaskEditor as a standalone widget:
 *
 * {@inlineexample Gantt/widget/TaskEditor.js}
 *
 * To hide built-in tabs or to add custom tabs, or to append widgets to any of the built-in tabs
 * use the {@link Gantt.feature.TaskEdit#config-items items} config.
 *
 * The Task editor contains tabs by default. Each tab is a container with built in widgets: text fields, grids, etc.
 *
 * | Tab ref           | Text         | Weight | Description                                           |
 * |-------------------|--------------|--------|-------------------------------------------------------|
 * | `generalTab`      | General      | 100    | Name, start/end dates, duration, percent done, effort |
 * | `predecessorsTab` | Predecessors | 200    | Grid with incoming dependencies                       |
 * | `successorsTab`   | Successors   | 300    | Grid with outgoing dependencies                       |
 * | `resourcesTab`    | Resources    | 400    | Grid with assigned resources                          |
 * | `advancedTab`     | Advanced     | 500    | Assigned calendar, scheduling mode, constraints, etc  |
 * | `notesTab`        | Notes        | 600    | Text area to add notes to the selected task           |
 *
 * ## Task editor customization example
 *
 * This example shows a custom Task Editor configuration. The built-in "Notes" tab is hidden, a custom "Files" tab is
 * added, the "General" tab is renamed to "Common" and "Custom" field is appended to it. Double-click on a task bar to
 * start editing:
 *
 * {@inlineexample Gantt/feature/TaskEditCustom.js}
 *
 * @extends SchedulerPro/widget/GanttTaskEditor
 */
export default class TaskEditor extends GanttTaskEditor {
    // Factoryable type name
    static get type() {
        return 'taskeditor';
    }

    static get $name() {
        return 'TaskEditor';
    }

    static get defaultConfig() {
        return {
            cls : 'b-gantt-taskeditor b-schedulerpro-taskeditor'
        };
    }
}

// Register this widget type with its Factory
TaskEditor.initClass();
