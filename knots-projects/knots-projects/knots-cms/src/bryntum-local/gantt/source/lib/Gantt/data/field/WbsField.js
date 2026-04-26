import DataField from '../../../Core/data/field/DataField.js';
import Wbs from '../Wbs.js';

/**
 * @module Gantt/data/field/WbsField
 */

/**
 * This class is used for a WBS (Work Breakdown Structure) field. These fields hold a {@link Gantt.data.Wbs}
 * object for their value.
 *
 * @extends Core/data/field/DataField
 */
export default class WbsField extends DataField {
    static get type() {
        return 'wbs';
    }

    convert(value) {
        return Wbs.from(value);
    }

    serialize(value) {
        // the wbsValue field is not persistent, so this is likely not going to be called... however, the user could
        // flip that option so we implement this method in case that happens.
        return String(value);
    }
}

WbsField.prototype.compare = Wbs.compare;

WbsField.initClass();
