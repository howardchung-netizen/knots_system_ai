/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import{Combo as t}from"./Editor.js";class e extends t{static get $name(){return"ProjectCombo"}static get type(){return"projectcombo"}static get configurable(){return{project:null,displayField:"title",valueField:"url",highlightExternalChange:!1,editable:!1}}updateProject(t){var e;null!==(e=t.transport.load)&&void 0!==e&&e.url&&(this.value=t.transport.load.url)}onChange({value:t,userAction:e}){e&&this.project&&(this.project.transport.load.url=t,this.project.load())}}e.initClass(),e._$name="ProjectCombo";export{e as ProjectCombo};
//# sourceMappingURL=ProjectCombo.js.map
