/**
 * Taken from the original example
 */
import { Column, ColumnStore } from '@bryntum/gantt';

/**
 * @module StyleColumn
 */

/**
 * A column showing the status of a task
 *
 * @extends Gantt/column/Column
 * @classType statuscolumn
 */
export default class StyleColumn extends Column {
    static get $name() {
        return 'StyleColumn';
    }

    static get type() {
        return 'stylecolumn';
    }

    static get isGanttColumn() {
        return true;
    }

    static get defaults() {
        return {
            // Set your default instance config properties here
            field: 'style',
            text: 'Color',
            editor: {
                type: 'combo',
                items    : [
                    { value : '', text : 'Default' },
                    { value : 'background:#FFEB3B;', text : 'Yellow' },
                    { value : 'background:#FF9966;', text : 'Orange' },
                    { value : 'background:#E74C3C;', text : 'Red' },
                    { value : 'background:#8E44AD;', text : 'Purple' },
                    { value : 'background:#BDC3C7;', text : 'Gray' },
                ],
                label: '',
                style: { marginRight: '.5em' },
            },
            cellCls: 'b-status-column-cell',
            htmlEncode: false,
        };
    }

    //endregion

    renderer({ record }) {
        const colorType = {
            'FFEB3B': 'Yellow',
            'FF9966': 'Orange',
            'E74C3C': 'Red',
            '8E44AD': 'Purple',
            'BDC3C7': 'Gray',
        }
        const style = record.style;
        const re = /^.+#(.+?);$/;
        const colorCode = style? style.match(re)? style.match(re)[1] : '' : '';
        const colorText = (colorCode in colorType)?colorType[colorCode]:'';
        return style
            ? [{
                tag       : 'i',
                className : `b-fa b-fa-circle`,
                style: {
                    style: {color:`#${colorCode}`},
                    fontSize: 16,
                    marginRight: 0,
                },
                html: ''
            },
            {
                style: {
                    fontSize: 14,
                },
                html: colorText
            }
        ]
            : {
                style: {
                    fontSize: 14,
                },
                html: ''
            };
    }
}

ColumnStore.registerColumnType(StyleColumn);
