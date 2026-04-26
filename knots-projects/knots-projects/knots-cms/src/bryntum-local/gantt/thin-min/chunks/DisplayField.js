/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{TextField as e,StringHelper as t}from"./Editor.js";class l extends e{static get $name(){return"DisplayField"}static get type(){return"displayfield"}static get alias(){return"display"}static get configurable(){return{readOnly:!0,editable:!1,cls:"b-display-field",template:null,ariaElement:"displayElement"}}get focusElement(){}changeReadOnly(){return!0}changeEditable(){return!1}get inputElement(){return{tag:"span",id:`${this.id}-input`,reference:"displayElement",html:this.template?this.template(this.value):t.encodeHtml(this.value)}}}l.initClass(),l._$name="DisplayField";export{l as DisplayField};
//# sourceMappingURL=DisplayField.js.map
