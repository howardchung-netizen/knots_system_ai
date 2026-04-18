/**
 * Taken from the original example
 */
import { Combo } from '@bryntum/gantt';

/**
 * @module SpotlightCombo
 */

/**
 * A column showing the status of a task
 *
 * @extends Gantt/Combo
 * @classType SpotlightCombo
 */
export default class SpotlightCombo extends Combo {

  static get $name() {
    return 'SpotlightCombo';
  }

  static get type() {
    return 'SpotlightCombo';
  }

  static get isGanttColumn() {
    return false;
  }

  set parent(parent) {
    super.parent = parent;
  }

  get parent() {
    return super.parent;
  }

  static get configurable() {
    return {
      label: '顏色',
      width: "50%",
      cls: 'spotlight-editor',
      listCls: 'spotlight-editor-list',
      editable: false,
      value: 'white',
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
      chipView: {
        iconTpl: (record) => {
          console.log(record)
          return `<div style="background:${record.data.text ?? 'white'}; width:"100px;height: 150px">${record.data.text ?? null}</div>`
        }
      },
      listItemTpl: ({ value }) => {
        return `<div style="background:${value};color:${value}; width:100%"></div>`
      },
      displayValueRenderer: (v)=> v?.text??'#ffffff',
      listeners: {
        select: (e) => {
          this.value = e.record.data.text;
          let element = e.source.currentElement.querySelectorAll(".spotlight-color")[0];
          if (e.record.data.text) {
            element.classList.add("spotlight-color");
            element.style.backgroundColor = e.record.data.text;
          } else {
            element.classList.remove("spotlight-color");
            element.style.backgroundColor = null;
          }
        },
      },
    }
  }

  compose() {
    return {
      html: `<div class='spotlight-color' style='background:${this.config.value}'></div>`,
    }
  }

}

SpotlightCombo.initClass();



