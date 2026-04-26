import SchedulerProResourceModel from '../../SchedulerPro/model/ResourceModel.js';

/**
 * @module Gantt/model/ResourceModel
 */

/**
 * This class represents a single resource in your Gantt project.
 *
 * If you want to add or change some fields, describing resources - subclass this class:
 *
 * ```javascript
 * class MyResourceModel extends ResourceModel {
 *
 *   static get fields() {
 *     return [
 *       { name: 'company', type: 'string' }
 *     ]
 *   }
 * }
 * ```
 *
 * See also: {@link Gantt.model.AssignmentModel}
 * @extends SchedulerPro/model/ResourceModel
 *
 * @typings SchedulerPro/model/ResourceModel -> SchedulerPro/model/SchedulerProResourceModel
 */
export default class ResourceModel extends SchedulerProResourceModel {}
