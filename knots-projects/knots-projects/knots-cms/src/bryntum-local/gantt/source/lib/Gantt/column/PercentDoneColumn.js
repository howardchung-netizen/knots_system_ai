import NumberColumn from '../../Grid/column/NumberColumn.js';
import ColumnStore from '../../Grid/data/ColumnStore.js';
import '../../Core/widget/NumberField.js';

/**
 * @module Gantt/column/PercentDoneColumn
 */

/**
 * A column representing the {@link SchedulerPro.model.mixin.PercentDoneMixin#field-percentDone percentDone} field of the task.
 *
 * Default editor is a {@link Core.widget.NumberField NumberField}.
 *
 * @extends Grid/column/NumberColumn
 * @classType percentdone
 */
export default class PercentDoneColumn extends NumberColumn {
    circleHeightPercentage = 0.75;

    static get $name() {
        return 'PercentDoneColumn';
    }

    static get type() {
        return 'percentdone';
    }

    static get isGanttColumn() {
        return true;
    }

    //region Config

    static get fields() {
        return [
            /**
             * Set to `true` to render a circular progress bar to visualize the task progress
             * @config {Boolean} showCircle
             */
            'showCircle'
        ];
    }

    static get defaults() {
        return {
            field : 'percentDone',
            text  : 'L{% Done}',
            unit  : '%',
            step  : 1,
            min   : 0,
            max   : 100,
            width : 90
        };
    }
    //endregion

    construct(config) {
        super.construct(...arguments);

        if (this.showCircle) {
            this.htmlEncode = false;
        }
    }

    defaultRenderer({ record, isExport, value }) {
        value = record.getFormattedPercentDone(value);

        if (isExport) {
            return value;
        }

        if (this.showCircle) {
            return {
                className : {
                    'b-percentdone-circle' : 1,
                    'b-full'               : value === 100,
                    'b-empty'              : value === 0
                },
                style : {
                    height                      : this.circleHeightPercentage * this.grid.rowHeight + 'px',
                    width                       : this.circleHeightPercentage * this.grid.rowHeight + 'px',
                    '--gantt-percentdone-angle' : `${value / 100}turn`
                },
                dataset : {
                    value
                }
            };

        }

        return value + this.unit;
    }

    // formatValue(value) {
    //     if (value <= 99) {
    //         return Math.round(value);
    //     }
    //     else {
    //         return Math.floor(value);
    //     }
    // }

    // * reactiveRenderer() {
    //     const
    //         { column : me, record, client } = this,
    //         value = me.formatValue(yield record.$.percentDone);
    //
    //     if (me.showCircle) {
    //         const size  = client.rowHeight * 0.8;
    //
    //         return {
    //             className : 'b-percentdone-circle',
    //             style     : {
    //                 animationDelay : `-${value - 0.1}s`,
    //                 width          : size,
    //                 height         : size
    //             },
    //             dataset : {
    //                 value
    //             }
    //         };
    //     }
    //
    //     return value + me.unit;
    // }
}

ColumnStore.registerColumnType(PercentDoneColumn);
