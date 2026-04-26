/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{Field as e,VersionHelper as t}from"./Editor.js";class r extends e{static get $name(){return"TextAreaField"}static get type(){return"textareafield"}static get alias(){return"textarea"}static get configurable(){return{resize:"none",inputAttributes:{tag:"textarea"}}}startConfigure(e){"boolean"==typeof e.inline&&t.deprecate("Core","6.0.0","TextAreaField.inline config is deprecated and will be removed"),super.startConfigure(e)}get inputElement(){const e=super.inputElement;return e.style=(e.style||"")+`;resize:${this.resize}`,e}}r.initClass(),r._$name="TextAreaField";export{r as TextAreaField};
//# sourceMappingURL=TextAreaField.js.map
