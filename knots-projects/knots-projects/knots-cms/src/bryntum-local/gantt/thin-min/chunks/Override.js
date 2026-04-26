/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{VersionHelper as e}from"./Editor.js";const r={constructor:1,prototype:1,name:1,length:1,arguments:1,caller:1,callee:1,__proto__:1};class t{static apply(e){if(!e.target)throw new Error("Override must specify what it overrides, using static getter target");if(!e.target.class)throw new Error("Override must specify which class it overrides, using target.class");if(!this.shouldApplyOverride(e))return!1;const r=Object.getOwnPropertyNames(e),t=Object.getOwnPropertyNames(e.prototype);return r.splice(r.indexOf("target"),1),this.internalOverrideAll(e.target.class,r,e),this.internalOverrideAll(e.target.class.prototype,t,e.prototype),!0}static internalOverrideAll(e,t,i){Reflect.ownKeys(i).forEach((s=>{if(t.includes(s)&&!r[s]){const r=Object.getOwnPropertyDescriptor(i,s);let t=e,n=null;for(;!n&&t;)n=Object.getOwnPropertyDescriptor(t,s),n||(t=Object.getPrototypeOf(t));n&&this.internalOverride(t,s,r,n)}}))}static internalOverride(e,r,t,i){(e._overridden=e._overridden||{})[r]=e[r],i.get?Object.defineProperty(e,r,{enumerable:!1,configurable:!0,get:t.get}):e[r]=t.value}static shouldApplyOverride(r){const t=r.target;if(!t.maxVersion&&!t.minVersion)return!0;if(!t.product)throw new Error("Override must specify product when using versioning");return(!t.maxVersion||!e[t.product].isNewerThan(t.maxVersion))&&(!t.minVersion||!e[t.product].isOlderThan(t.minVersion))}}t._$name="Override";export{t as Override};
//# sourceMappingURL=Override.js.map
