/**
 * @module SchedulerPro/widget/SchedulerTaskEditor
 */
import TaskEditorBase from './TaskEditorBase.js';
import './taskeditor/SchedulerGeneralTab.js';
import './taskeditor/SuccessorsTab.js';
import './taskeditor/PredecessorsTab.js';
import './taskeditor/ResourcesTab.js';
import './taskeditor/SchedulerAdvancedTab.js';
import './taskeditor/NotesTab.js';

const bufferRe = /(pre|post)amble/;

/**
 * {@link SchedulerPro/widget/TaskEditorBase} subclass for SchedulerPro projects. Provides a UI to edit tasks in a
 * dialog.
 *
 * This demo shows how to use TaskEditor as a standalone widget:
 *
 * {@inlineexample SchedulerPro/widget/SchedulerTaskEditor.js}
 *
 * ## Task editor customization
 *
 * To append Widgets to any of the built-in tabs, use the `items` config. The Task editor contains tabs by default.
 * Each tab contains built in widgets: text fields, grids, etc.
 *
 * | Tab ref           | Text                                                        | Weight | Description                                                                          |
 * |-------------------|-------------------------------------------------------------|--------|--------------------------------------------------------------------------------------|
 * | `generalTab`      | {@link SchedulerPro/widget/taskeditor/SchedulerGeneralTab}  | 100    | Shows basic configuration: name, resources, start/end dates, duration, percent done. |
 * | `predecessorsTab` | {@link SchedulerPro/widget/taskeditor/PredecessorsTab}      | 200    | Shows a grid with incoming dependencies                                              |
 * | `successorsTab`   | {@link SchedulerPro/widget/taskeditor/SuccessorsTab}        | 300    | Shows a grid with outgoing dependencies                                              |
 * | `advancedTab`     | {@link SchedulerPro/widget/taskeditor/SchedulerAdvancedTab} | 500    | Shows advanced configuration: constraints and manual scheduling mode                 |
 * | `notesTab`        | {@link SchedulerPro/widget/taskeditor/NotesTab}             | 600    | Shows a text area to add notes to the selected task                                  |
 *
 * This demo shows adding of custom widgets to the task editor, double-click child task bar to start editing:
 *
 * {@inlineexample SchedulerPro/feature/TaskEditExtraItems.js}
 *
 * @extends SchedulerPro/widget/TaskEditorBase
 */
export default class SchedulerTaskEditor extends TaskEditorBase {
    // Factoryable type name
    static get type() {
        return 'schedulertaskeditor';
    }

    //region Config

    static get $name() {
        return 'SchedulerTaskEditor';
    }

    static get defaultConfig() {
        return {
            enableEventSpanBuffer : false,

            items : [
                {
                    type        : 'tabpanel',
                    defaultType : 'formtab',
                    ref         : 'tabs',
                    flex        : '1 0 100%',
                    autoHeight  : true,

                    layoutConfig : {
                        alignItems   : 'stretch',
                        alignContent : 'stretch'
                    },

                    items : {
                        generalTab : {
                            type   : 'schedulergeneraltab',
                            weight : 100
                        },
                        predecessorsTab : {
                            type   : 'predecessorstab',
                            weight : 200
                        },
                        successorsTab : {
                            type   : 'successorstab',
                            weight : 300
                        },
                        // Replaced with combo on general tab
                        //{ type : 'resourcestab', weight : 400 },
                        advancedTab : {
                            type   : 'scheduleradvancedtab',
                            weight : 500
                        },
                        notesTab : {
                            type   : 'notestab',
                            weight : 600
                        }
                    }
                }
            ]
        };
    }

    processWidgetConfig(widgetConfig) {
        if (widgetConfig.ref?.match(bufferRe)) {
            widgetConfig.hidden = !this.enableEventSpanBuffer;
        }

        return super.processWidgetConfig(widgetConfig);
    }

    //endregion

}

// Register this widget type with its Factory
SchedulerTaskEditor.initClass();
