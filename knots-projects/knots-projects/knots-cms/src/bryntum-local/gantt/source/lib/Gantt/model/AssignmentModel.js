import SchedulerProAssignmentModel from '../../SchedulerPro/model/AssignmentModel.js';
import { GanttAssignmentMixin } from '../../Engine/quark/model/gantt/GanttAssignmentMixin.js';
import { isSerializableEqual } from '../../Engine/chrono/ModelFieldAtom.js';

/**
 * @module Gantt/model/AssignmentModel
 */

/**
 * This class represent a single assignment of a {@link Gantt.model.ResourceModel resource} to a
 * {@link Gantt.model.TaskModel task} in your gantt chart.
 *
 * @extends SchedulerPro/model/AssignmentModel
 *
 * @typings SchedulerPro/model/AssignmentModel -> SchedulerPro/model/SchedulerProAssignmentModel
 * @uninherit Core/data/mixin/TreeNode
 */
export default class AssignmentModel extends GanttAssignmentMixin.mix(SchedulerProAssignmentModel) {
    //region Fields
    static get fields() {
        /**
         * The numeric, percent-like value, indicating what is the "contribution level"
         * of the resource availability to the task.
         * Number 100, means that the assigned resource spends 100% of its working time to the task.
         * Number 50 means that the resource spends only half of its available time for the assigned task.
         * @field {Number} units
         */
        return [
            /**
             * Id for event to assign. Note that after load it will be populated with the actual event.
             * @field {Gantt.model.TaskModel} event
             * @accepts {String|Number|Gantt.model.TaskModel}
             */
            {
                name      : 'event',
                persist   : true,
                serialize : record => record?.id,
                isEqual   : isSerializableEqual
            },

            /**
             * Id for resource to assign to. Note that after load it will be populated with the actual resource.
             * @field {Gantt.model.ResourceModel} resource
             * @accepts {String|Number|Gantt.model.ResourceModel}
             */
            {
                name      : 'resource',
                persist   : true,
                serialize : record => record?.id,
                isEqual   : isSerializableEqual
            },

            /**
             * Hidden
             * @field {String|Number} eventId
             * @hide
             */
            'eventId',

            /**
             * Hidden
             * @field {String|Number} resourceId
             * @hide
             */
            'resourceId'
        ];
    }
    //endregion
}
