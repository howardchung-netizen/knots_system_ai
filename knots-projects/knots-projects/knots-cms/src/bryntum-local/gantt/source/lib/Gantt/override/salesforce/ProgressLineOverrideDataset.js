import ProgressLine from '../../feature/ProgressLine.js';
import Override from '../../../Core/mixin/Override.js';
import StringHelper from '../../../Core/helper/StringHelper.js';

/*
 * This override replaces dataset usage with reading individual attributes on SVG nodes
 */
class ProgressLineOverrideDataset {
    static get target() {
        return {
            class : ProgressLine
        };
    }

    // dataset attribute is not supported
    // https://github.com/salesforce/lwc/issues/1808
    drawLineSegment(data) {
        if ('dataset' in data) {
            Object.entries(data.dataset).forEach(([key, value]) => {
                data[`data-${StringHelper.hyphenate(key)}`] = value;
            });

            delete data.dataset;
        }

        return this._overridden.drawLineSegment.call(this, data);
    }
}

Override.apply(ProgressLineOverrideDataset);
