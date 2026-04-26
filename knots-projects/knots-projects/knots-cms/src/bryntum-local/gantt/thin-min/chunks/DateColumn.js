/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{ColumnStore as t,Column as e}from"./GridBase.js";import{DateHelper as r}from"./Editor.js";class a extends e{static get $name(){return"DateColumn"}static get type(){return"date"}static get fieldType(){return"date"}static get fields(){return["format","pickerFormat","step"]}static get defaults(){return{format:"L",step:1,minWidth:85,filterType:"date"}}constructor(t,e){super(...arguments),this.internalCellCls="b-date-cell"}defaultRenderer({value:t}){return t?this.formatValue(t):""}groupRenderer({cellElement:t,groupRowFor:e}){t.innerHTML=this.formatValue(e)}formatValue(t){return"string"==typeof t&&(t=r.parse(t,this.format||void 0)),r.format(t,this.format||void 0)}set format(t){const{editor:e}=this.data;this.set("format",t),e&&(e.format=t)}get format(){return this.get("format")}get defaultEditor(){const t=this;return{name:t.field,type:"date",calendarContainerCls:"b-grid-cell-editor-related",weekStartDay:t.grid.weekStartDay,format:t.format,step:t.step}}}t.registerColumnType(a,!0),a.exposeProperties(),a._$name="DateColumn";export{a as DateColumn};
//# sourceMappingURL=DateColumn.js.map
