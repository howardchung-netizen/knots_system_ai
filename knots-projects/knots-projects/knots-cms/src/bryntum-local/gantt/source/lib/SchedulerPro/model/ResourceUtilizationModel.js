import Model from '../../Core/data/Model.js';

/**
 * @module SchedulerPro/model/ResourceUtilizationModel
 */

/**
 * A model representing a {@link SchedulerPro/view/ResourceUtilization} view row.
 * The view rows are of two possible types __resources__ and __assignments__.
 * The model wraps either a resource or an assignment model. And each wrapped resource keeps its corresponding
 * wrapped assignments as its __children__.
 *
 * **NOTE:** You don't normally need to construct this class instances. The view does that automatically
 * by processing the project resources and assignments, wrapping them with this model instances and
 * putting them to its {@link SchedulerPro/view/ResourceUtilization#property-store}.
 *
 * The wrapped model is provided to {@link #config-origin} config and can be retrieved from it:
 *
 * ```javascript
 * // get the real resource representing the first row of the view
 * resourceUtilizationView.store.first.origin
 * ```
 *
 * @extends Core/data/Model
 */

export default class ResourceUtilizationModel extends Model {

    static $name = 'ResourceUtilizationModel'

    static fields = [
        /**
         * Name of the represented resource or the assigned event.
         * If the model represents an assignment the field value is
         * automatically set to the assigned event {@link SchedulerPro/model/EventModel#field-name}.
         * @field {String} name
         * @category Common
         */
        'name',
        /**
         * Icon for the corresponding row.
         * If the model represents an assignment the field value is
         * automatically set to the assigned event {@link SchedulerPro/model/EventModel#field-iconCls}.
         * @field {String} iconCls
         * @category Styling
         */
        'iconCls'
    ]

    /**
     * A resource or an assignment wrapped by this model.
     *
     * ```javascript
     * // get the real resource representing the first row of the view
     * resourceUtilizationView.store.first.origin
     * ```
     * @config {SchedulerPro.model.ResourceModel|SchedulerPro.model.AssignmentModel} origin
     */

    construct(data, ...args) {
        this._childrenIndex = new Map();

        // copy some field values from origin to this model
        if (data.origin) {
            Object.assign(data, this.mapOriginValues(data.origin));
        }

        super.construct(data, ...args);

        if (this.origin) {
            this.fillChildren();
        }
    }

    mapOriginValues(origin) {
        const result = {};

        if (origin.isResourceModel) {
            result.name = origin.name;
        }
        else if (origin.isAssignmentModel) {
            result.name    = origin.event?.name;
            result.iconCls = origin.event?.iconCls;
        }

        return result;
    }

    fillChildren() {
        const
            me           = this,
            { children } = me,
            toRemove     = new Set(children),
            toAdd        = [];

        if (me.origin?.isResourceModel) {
            const { assigned } = me.origin;

            for (const assignment of assigned) {
                if (!me._childrenIndex.has(assignment)) {
                    toAdd.push(me.constructor.new({ origin : assignment }));
                }
                else {
                    toRemove.delete(me._childrenIndex.get(assignment));
                }
            }
        }

        if (toRemove.size) {
            this.removeChild([...toRemove]);
        }

        if (toAdd.length) {
            this.appendChild(toAdd);
        }
    }

    afterRemoveChild(records) {
        records.forEach(record => this._childrenIndex.delete(record.origin));
    }

    insertChild(...args) {
        let added = super.insertChild(...args);

        if (added) {
            const { stores } = this;

            if (!Array.isArray(added)) {
                added = [added];
            }

            if (this.origin?.isResourceModel) {
                for (const record of added) {
                    if (record.origin && !this._childrenIndex.has(record.origin)) {
                        this._childrenIndex.set(record.origin, record);
                    }
                }
            }

            // if the model is already in a store
            // fill the store real_model -> wrapper_model map
            if (stores?.length) {
                for (const store of stores) {
                    for (const record of added) {
                        record.traverse(node => store.setModelByOrigin(node.origin, node));
                    }
                }
            }
        }

        return added;
    }

    getChildByOrigin(origin) {
        return this._childrenIndex.get(origin);
    }
}

ResourceUtilizationModel.exposeProperties();
