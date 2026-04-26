import EventHelper from '../../Core/helper/EventHelper.js';
import EventResize from '../../Scheduler/feature/EventResize.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';

/**
 * @module Gantt/feature/TaskResize
 */

/**
 * Feature that allows resizing a task by dragging its end date. Resizing a task by dragging its start date is not allowed.
 *
 * This feature is **enabled** by default
 *
 * This feature updates the event's `endDate` live in order to leverage the
 * rendering pathway to always yield a correct appearance. The changes are done in
 * {@link Core.data.Model#function-beginBatch batched} mode so that changes do not become
 * eligible for data synchronization or propagation until the operation is completed.
 *
 * ## Customizing the resize tooltip
 *
 * To show custom HTML in the tooltip, please see the {@link #config-tooltipTemplate} config. Example:
 *
 * ```javascript
 * taskResize : {
 *     // A minimal end date tooltip
 *     tooltipTemplate : ({ record, endDate }) => {
 *         return DateHelper.format(endDate, 'MMM D');
 *     }
 * }
 * ```
 *
 * @extends Scheduler/feature/EventResize
 * @demo Gantt/basic
 * @classtype taskResize
 * @feature
 */
export default class TaskResize extends EventResize {

    static get $name() {
        return 'TaskResize';
    }

    static get configurable() {
        return {
            draggingItemCls : 'b-sch-event-resizing',

            resizingItemInnerCls : null,

            // internalUpdateRecord is based on the assumption only right edge can be resized
            leftHandle : false,

            /**
             * Gets or sets special key to activate successor pinning behavior. Supported values are:
             * * 'ctrl'
             * * 'shift'
             * * 'alt'
             * * 'meta'
             *
             * Assign false to disable it.
             * @member {Boolean|String} pinSuccessors
             */
            /**
             * Set to true to enable resizing task while pinning dependent tasks. By default, this behavior is activated
             * if you hold CTRL key during drag. Alternatively, you may provide key name to use. Supported values are:
             * * 'ctrl'
             * * 'shift'
             * * 'alt'
             * * 'meta'
             *
             * **Note**: Only supported in forward-scheduled project
             *
             * @config {Boolean|String}
             * @default
             */
            pinSuccessors : false
        };
    }

    changePinSuccessors(value) {
        return EventHelper.toSpecialKey(value);
    }

    //region Events

    /**
     * @event beforeEventResize
     * @hide
     */

    /**
     * @event eventResizeStart
     * @hide
     */

    /**
     * @event eventPartialResize
     * @hide
     */

    /**
     * @event beforeEventResizeFinalize
     * @hide
     */

    /**
     * @event eventResizeEnd
     * @hide
     */

    /**
     * Fires on the owning Gantt before resizing starts. Return false to prevent operation
     * @event beforeTaskResize
     * @on-owner
     * @param {Gantt.model.TaskModel} taskRecord
     * @param {Event} event
     */

    /**
     * Fires on the owning Gantt when task resizing starts
     * @event taskResizeStart
     * @on-owner
     * @param {Gantt.model.TaskModel} taskRecord
     * @param {Event} event
     */

    /**
     * Fires on the owning Gantt on each resize move event
     * @event taskPartialResize
     * @on-owner
     * @param {Gantt.model.TaskModel} taskRecord
     * @param {Date} start
     * @param {Date} end
     * @param {HTMLElement} element
     */

    /**
     * Fires on the owning Gantt to allow implementer to prevent immediate finalization by setting `data.context.async = true`
     * in the listener, to show a confirmation popup etc
     * ```
     *  gantt.on('beforetaskresizefinalize', ({context}) => {
     *      context.async = true;
     *      setTimeout(() => {
     *          // async code don't forget to call finalize
     *          context.finalize();
     *      }, 1000);
     *  })
     * ```
     * @event beforeTaskResizeFinalize
     * @on-owner
     * @param {Object} data
     * @param {Gantt.view.Gantt} data.source Gantt instance
     * @param {Object} data.context
     * @param {Boolean} data.context.async Set true to handle resize asynchronously (e.g. to wait for user
     * confirmation)
     * @param {Function} data.context.finalize Call this method to finalize resize. This method accepts one
     * argument: pass true to update records, or false, to ignore changes
     */

    /**
     * Fires on the owning Gantt after the resizing gesture has finished.
     * @event taskResizeEnd
     * @on-owner
     * @param {Boolean} changed
     * @param {Gantt.model.TaskModel} taskRecord
     */

    //endregion

    //region Gantt specifics

    checkValidity() {
        // Task resize just does basic validity checks which runs the validatorFn
        return this.basicValidityCheck(...arguments);
    }

    getBeforeResizeParams(context) {
        return {};
    }

    // Injects Gantt specific data into the drag context
    setupProductResizeContext(context, event) {
        const
            gantt      = this.client,
            taskRecord = gantt.resolveTaskRecord(context.element);

        Object.assign(context, {
            taskRecord,
            eventRecord     : taskRecord,
            dateConstraints : gantt.getDateConstraints?.(taskRecord)
        });
    }

    async internalUpdateRecord(context, timespanRecord) {
        const
            { client }     = this,
            { generation } = timespanRecord,
            {
                startDate,
                endDate
            }              = context,
            toSet          = { endDate };

        // Fix the duration according to the Entity's rules.
        context.duration = toSet.duration = timespanRecord.run('calculateProjectedDuration', startDate, endDate);

        // Fix the dragged date point according to the Entity's rules.
        const value = toSet[context.toSet] = timespanRecord.run('calculateProjectedXDateWithDuration', startDate, true, context.duration);

        // Update the record to its final correct state using *batched changes*
        // These will *not* be propagated, it's just to force the dragged event bar
        // into its corrected shape before the real changes which will propagate are applied below.
        // We MUST do it like this because the final state may not be a net change if the changes
        // got rejected, and in that case, the engine will not end up firing any change events.
        timespanRecord.set(toSet);

        // Quit listening for batchedUpdate *before* we cancel the batch so that the
        // change events from the revert do not update the UI.
        client.endListeningForBatchedUpdates();
        timespanRecord.cancelBatch();

        if (this.pinSuccessors && context.event[this.pinSuccessors]) {
            await timespanRecord.setEndDatePinningSuccessors(value);
        }
        else {
            await timespanRecord.setEndDate(value, false);
        }

        timespanRecord.endBatch();

        // If the record has been changed
        return timespanRecord.generation !== generation;
    }

    //endregion
}

GridFeatureManager.registerFeature(TaskResize, true, 'Gantt');
