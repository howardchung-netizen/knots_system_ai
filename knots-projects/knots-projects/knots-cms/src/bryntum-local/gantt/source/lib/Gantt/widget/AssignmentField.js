import Combo from '../../Core/widget/Combo.js';
import PickerField from '../../Core/widget/PickerField.js';
import AssignmentPicker from './AssignmentPicker.js';
import AssignmentsManipulationStore from '../data/AssignmentsManipulationStore.js';
import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import StringHelper from '../../Core/helper/StringHelper.js';

/**
 * @module Gantt/widget/AssignmentField
 */

/**
 * Special field class to edit single event assignments.
 *
 * This field is used as the default editor for the {@link Gantt.column.ResourceAssignmentColumn ResourceAssignmentColumn}
 *
 * {@inlineexample Gantt/widget/AssignmentField.js}
 *
 * ## Customizing the drop down grid
 *
 * The field is a {@link Core/widget/Combo} which has a {@link Gantt/widget/AssignmentGrid} as its picker. Here's a
 * snippet showing how simple it is to configure the grid:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     appendTo                : 'container',
 *     resourceImageFolderPath : '../_shared/images/users/',
 *     columns                 : [
 *         { type : 'name', field : 'name', text : 'Name', width : 250 },
 *         {
 *             type        : 'resourceassignment',
 *             width       : 250,
 *             showAvatars : true,
 *             editor      : {
 *                 type   : 'assignmentfield',
 *                 // The picker config is applied to the Grid
 *                 picker : {
 *                     height   : 350,
 *                     width    : 450,
 *                     features : {
 *                         filterBar  : true,
 *                         group      : 'resource.city',
 *                         headerMenu : false,
 *                         cellMenu   : false
 *                     },
 *                     // The extra columns are concatenated onto the base column set.
 *                     columns : [{
 *                         text       : 'Calendar',
 *                         // Read a nested property (name) from the resource calendar
 *                         field      : 'resource.calendar.name',
 *                         filterable : false,
 *                         editor     : false,
 *                         width      : 85
 *                     }]
 *                 }
 *             }
 *         }
 *     ],
 *
 *     project
 *  });
 * ```
 *
 * @extends Core/widget/Combo
 * @classType 'assignmentfield'
 * @demo Gantt/resourceassignment
 */
export default class AssignmentField extends Combo {

    static get $name() {
        return 'AssignmentField';
    }

    // Factoryable type name
    static get type() {
        return 'assignmentfield';
    }

    //region Config
    static get configurable() {
        return {
            // Let the editor know that the selectable records are also editable
            editingRecords : true,

            chipView : {
                cls : 'b-assignment-chipview',
                itemTpl(assignment, i) {
                    return StringHelper.xss`${assignment.resourceName} ${Math.round(assignment.units)}%`;
                },
                scrollable : {
                    overflowX : 'hidden-scroll'
                }
            },

            triggers : {
                expand : {
                    cls     : 'b-icon-down',
                    handler : 'onTriggerClick'
                }
            },

            multiSelect : true,
            clearable   : false, // TODO: change when it's back to editable
            editable    : false,
            value       : null,

            /**
             * A config object used to configure the {@link Gantt.widget.AssignmentGrid assignment grid}
             * used to select resources to assign.
             *
             * Any `columns` provided are concatenated onto the default column set.
             * @config {Object|Gantt.widget.AssignmentGrid} picker
             */
            picker : {
                type         : AssignmentPicker.type,
                floating     : true,
                scrollAction : 'realign'
            },

            /**
             * Width of picker, defaults to this field's {@link Core/widget/PickerField#config-pickerAlignElement} width
             *
             * @config {Number}
             */
            pickerWidth : null,

            /**
             * Event to load resource assignments for.
             * Either event or {@link #config-store store} should be given.
             *
             * @config {Gantt.model.TaskModel}
             */
            projectEvent : null,

            /**
             * Assignment manipulation store to use or it's configuration object.
             * Either store or {@link #config-projectEvent projectEvent} should be given
             *
             * @config {Core.data.Store|Object}
             */
            store : {}
        };
    }

    //endregion

    // Any change must offer the save/cancel UI since THAT is what actually makes the edit
    onChipClose(records) {
        this.showPicker();

        this.picker.deselectRows(records);
    }

    syncInputFieldValue() {
        super.syncInputFieldValue();

        if (this.store) {
            this.tooltip = StringHelper.encodeHtml(this.store.toValueString());
        }
    }

    //region Picker

    // Override. This field does not have a primary filter, so
    // down arrow/trigger click should just show the picker.
    onTriggerClick(event) {
        if (this.pickerVisible) {
            this.hidePicker();
        }
        else {
            PickerField.prototype.showPicker.call(this, event && ('key' in event));
        }
    }

    focusPicker() {
        this.picker.focus();
    }

    changePicker(picker, oldPicker) {
        const me = this;

        return AssignmentPicker.reconfigure(oldPicker, picker, {
            owner    : me,
            defaults : {
                projectEvent      : me.projectEvent,
                store             : me.store,
                readOnly          : me.readOnly,
                owner             : me,
                resourceImagePath : me.resourceImageFolderPath,
                forElement        : me[me.pickerAlignElement],
                assignments       : me.valueCollection,

                onCancelClick() {
                    me.value = this.originalSelected;
                    this.hide();
                },

                align : {
                    anchor : me.overlayAnchor,
                    target : me[me.pickerAlignElement]
                },

                listeners : {
                    hide : () => {
                        if (!me.isDestroying) {
                            // Only apply the filters and refresh the UI if we are focused.
                            // If the hide is due to focusout, the refresh will be applied next time.
                            me.store.clearFilters(me.containsFocus);
                        }
                    }
                }
            }
        });
    }

    //endregion

    //region Value

    changeProjectEvent(projectEvent) {
        // NOTE: This kind of thing would normally be handled in updateProjectEvent, however, the setter of the
        //  AssignmentManipulationStore pulls double duty and resyncs some fields, even if presented with the same
        //  projectEvent.
        const { picker, store }      = this;
        this._projectEvent           = projectEvent;

        if (store) {
            store.projectEvent = projectEvent;
        }

        if (picker) {
            picker.projectEvent = projectEvent;
        }

        return projectEvent;
    }

    changeStore(store) {
        if (store && !(store instanceof AssignmentsManipulationStore)) {
            store = new AssignmentsManipulationStore(store);
        }

        return store;
    }

    updateStore(store) {
        const me = this;

        me.detachListeners('storeMutation');

        if (store instanceof AssignmentsManipulationStore) {
            const { projectEvent } = store;

            if (projectEvent) {
                me.projectEvent = projectEvent;
            }
            else {
                // This is to not do the store::fillFromMaster() call, otherwise editor will be unhappy
                store.projectEvent = me.projectEvent;
            }
        }

        store.on({
            name    : 'storeMutation',
            change  : 'syncInputFieldValue',
            thisObj : me
        });
    }

    // This return an array of special Assignment records created
    // by the picker / grid
    get value() {
        return super.value;
    }

    set value(assignments) {
        // either real (=== currently assigned resources)
        // Or to-be assigned resources coming from the assignment grid

        // Map over to the special assignment records created by the AssignmentGrid store
        assignments = assignments?.map(as => {
            const
                { [as.constructor.idField] : notUsed, event, resource, eventId, resourceId, ...data } = as.data,
                ourStoreVersion = this.store.find(a => a.resource === as.resource, true);

            ourStoreVersion?.set(data);

            return ourStoreVersion;
        });

        super.value = assignments;
    }

    hasChanged(initialValue, value) {
        return !ObjectHelper.isEqual(initialValue, value);
    }

    //endregion

    // Override. Picker is completely self-contained. Prevent any
    // field action on its key events.
    onPickerKeyDown(event) {
        const grid = this.picker;

        // Move "down" into the grid body
        if (event.key === 'ArrowDown' && event.target.compareDocumentPosition(grid.bodyContainer) === document.DOCUMENT_POSITION_FOLLOWING) {
            grid.element.focus();
        }
    }

    // Caching a copy of each record since the grid picker of this class will allow editing
    // A change to the records will constitute a change of this field
    cacheCurrentValue(records) {
        if (Array.isArray(records)) {
            return this._value = records.map(rec => rec.copy(rec.id));
        }

        return super.cacheCurrentValue(records);
    }
}

// Register this widget type with its Factory
AssignmentField.initClass();
