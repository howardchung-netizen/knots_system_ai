/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{Container as e,Rotatable as t}from"./Editor.js";class o extends(e.mixin(t)){static get $name(){return"ButtonGroup"}static get type(){return"buttongroup"}static get configurable(){return{defaultType:"button",cls:null,items:null,color:null,toggleGroup:null,valueSeparator:",",columns:null,hideWhenEmpty:!0,defaultBindProperty:"value"}}onChildAdd(e){super.onChildAdd(e),e.on({click:"onItemClick",thisObj:this,prio:1e4})}onChildRemove(e){e.un({click:"onItemClick",thisObj:this}),super.onChildRemove(e)}onItemClick(){this._value=null}createWidget(e){const t=this;return t.constructor.resolveType(e.type||"button").isButton&&(t.color&&!e.color&&(e.color=t.color),t.toggleGroup&&!e.toggleGroup&&("boolean"==typeof t.toggleGroup&&(t.toggleGroup=o.generateId("toggleGroup")),e.toggleGroup=t.toggleGroup)),t.columns&&(e.width=100/t.columns+"%"),e=super.createWidget(e),t.relayEvents(e,["click","action","toggle"]),e}updateRotate(e){this.eachWidget((t=>{!1!==t.rotate&&(t.rotate=e)}))}get value(){if(!this._value){const e=[];this.items.forEach((t=>{t.pressed&&void 0!==t.value&&e.push(t.value)})),this._value=e.join(this.valueSeparator)}return this._value}set value(e){Array.isArray(e)||(e=null==e?[]:"string"==typeof e?e.split(this.valueSeparator):[e]),this._value=e,this.items.forEach((t=>{void 0!==t.value&&(t.pressed=e.indexOf(t.value)>-1)}))}get disabled(){return super.disabled}set disabled(e){super.disabled=e,this.items.forEach((t=>t.disabled=e))}get widgetClassList(){const e=super.widgetClassList;return this.columns&&e.push("b-columned"),e}}o.initClass(),o._$name="ButtonGroup";export{o as ButtonGroup};
//# sourceMappingURL=ButtonGroup.js.map
