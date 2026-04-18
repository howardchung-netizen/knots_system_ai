/**
 * Taken from the original example
 */
import { Column, ColumnStore } from '@bryntum/gantt';

/**
 * @module SpotlightColumn
 */

/**
 * A column showing the status of a task
 *
 * @extends Gantt/column
 * @classType SpotlightColumn
 */
export default class SpotlightColumn extends Column {
    
    static get $name() {
        return 'SpotlightColumn';
    }

    static get type() {
        return 'SpotlightColumn';
    }

    static get isGanttColumn() {
        return true;
    }

    static colorCode = null;

    static get defaults() {
        return {
            // Set your default instance config properties here
            type: "taskcolorcombo",
            field: 'spotlight',
            text: '顏色',
            cellCls: 'task-spotlight-cell',
            htmlEncode: false,
            width: '100px',
            searchable: false,
            sortable: false,
            filterable: false,
            resizable: false,
            editor: {
                style:{ backgroundColor: this.colorCode },
                id: "spotlightEditor",
                cls: 'spotlight-editor',
                listCls: 'spotlight-editor-list',
                type: "combo",
                editable: false,
                items: [
                    "#ff43f9",
                    "#F44336",
                    "#E91E63",
                    "#9C27B0",
                    "#673AB7",
                    "#3F51B5",
                    "#2196F3",
                    "#03A9F4",
                    "#00BCD4",
                    "#009688",
                    "#4CAF50",
                    "#8BC34A",
                    "#CDDC39",
                    "#FFEB3B",
                    "#FFC107",
                    "#FF9800",
                    "#FF5722",
                    "#795548",
                    "#9E9E9E",
                    "#607D8B"
                ],
                listItemTpl: ({ value }) => { 
                    console.log("listItemTpl")
                    return `<div style="background:${value};color:${value}; width:"20px;"></div>`
                },
                renderer: (value) => { 
                    console.log("renderer")
                    return `<div style="background:black; width:"100px;height: 150px">${value}</div>`
                },
                listeners: {
                    focusIn: (e) => { 
                        console.log(this)
                        // console.log(e.toWidget.byRef.input.value)
                        // this.colorCode = e.toWidget.byRef.input.value                       
                  }
               }
            }
        };
    }

    renderer({ value }) {
        return `<div class='spotlight-color' style='background:${value}'></div>`
    }
}

ColumnStore.registerColumnType(SpotlightColumn);
