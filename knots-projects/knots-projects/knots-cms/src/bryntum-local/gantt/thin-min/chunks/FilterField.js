/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{Base as e,_objectSpread2 as t,DynamicObject as r,TextField as a}from"./Editor.js";var n=a=>class extends(a||e){static get $name(){return"Featureable"}static get configurable(){return{features:null}}static get declarable(){return["featureable"]}static setupFeatureable(e){const r=t({ownerName:"client"},e.featureable);r.factory.initClass(),Reflect.defineProperty(e,"featureable",{get:()=>r})}doDestroy(){const e=this.features;super.doDestroy();for(const r in e){var t;const a=e[r];null===(t=a.destroy)||void 0===t||t.call(a)}}hasFeature(e){var t;return Boolean(null===(t=this.features)||void 0===t?void 0:t[e])}changeFeatures(e,t){if(this.isDestroying)return;const a=this,{featureable:n}=a.constructor,i=a.$features||(a.$features=new r({configName:"features",factory:n.factory,owner:a,ownerName:n.ownerName}));return i.update(e),t?void 0:i.target}get widgetClass(){}getCurrentConfig(e){const t=super.getCurrentConfig(e),{features:r}=t;if(r)for(const e in r)0===Object.keys(r[e]).length&&(r[e]=!0);return t}};class i extends a{static get $name(){return"FilterField"}static get type(){return"filterfield"}static get configurable(){return{field:null,store:null,filterFunction:null,clearable:!0,keyStrokeChangeDelay:100,onChange({value:e}){const{store:t,field:r,filterFunction:a}=this;if(t){const n=`${r||this.id}-Filter`;if(0===e.length)t.removeFilter(n);else{let i;a?i=t=>a(t,e):(e=e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),i=t=>t.get(r).match(new RegExp(e,"i"))),t.filter({id:n,filterBy:i})}}}}}updateValue(e,t){super.updateValue(e,t),e&&this.isConfiguring&&this.onChange({value:e})}}i.initClass(),i._$name="FilterField";export{n as Featureable,i as FilterField};
//# sourceMappingURL=FilterField.js.map
