/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { Combo } from './Editor.js';

/**
 * @module Scheduler/widget/ProjectCombo
 */

/**
 * Combo that allows picking a dataset to use for a {@link Scheduler.model.ProjectModel}. Each item holds a title and
 * a load url to reconfigure the project with.
 *
 * @extends Core/widget/Combo
 * @classType projectcombo
 */

class ProjectCombo extends Combo {
  static get $name() {
    return 'ProjectCombo';
  }

  static get type() {
    return 'projectcombo';
  }

  static get configurable() {
    return {
      /**
       * Project to reconfigure when picking an item.
       * @config {Scheduler.model.ProjectModel}
       * @category Common
       */
      project: null,

      /**
       * Field used as projects title.
       * @config {String}
       * @default
       * @category Common
       */
      displayField: 'title',

      /**
       * Field used as projects load url.
       * @config {String}
       * @default
       * @category Common
       */
      valueField: 'url',
      highlightExternalChange: false,
      editable: false
    };
  }

  updateProject(project) {
    var _project$transport$lo;

    if ((_project$transport$lo = project.transport.load) !== null && _project$transport$lo !== void 0 && _project$transport$lo.url) {
      this.value = project.transport.load.url;
    }
  }

  onChange({
    value,
    userAction
  }) {
    if (userAction && this.project) {
      this.project.transport.load.url = value;
      this.project.load();
    }
  }

} // Register this widget type with its Factory

ProjectCombo.initClass();
ProjectCombo._$name = 'ProjectCombo';

export { ProjectCombo };
//# sourceMappingURL=ProjectCombo.js.map
