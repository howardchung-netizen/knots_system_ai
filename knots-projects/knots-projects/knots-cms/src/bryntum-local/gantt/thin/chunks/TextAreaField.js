/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { Field, VersionHelper } from './Editor.js';

/**
 * @module Core/widget/TextAreaField
 */

/**
 * TextAreaField widget for multiline text input. Wraps a native &lt;textarea&gt; HTML element.
 *
 * ```javascript
 * const textAreaField = new TextAreaField({
 *   placeholder: 'Enter some text'
 * });
 *```
 *
 * @extends Core/widget/Field
 * @classType textareafield
 * @inlineexample Core/widget/TextAreaField.js
 */

class TextAreaField extends Field {
  static get $name() {
    return 'TextAreaField';
  } // Factoryable type name

  static get type() {
    return 'textareafield';
  } // Factoryable type alias

  static get alias() {
    return 'textarea';
  }

  static get configurable() {
    return {
      /**
       * The resize style to apply to the `<textarea>` element.
       * @config {String}
       * @default
       */
      resize: 'none',
      inputAttributes: {
        tag: 'textarea'
      }
    };
  }

  startConfigure(config) {
    if (typeof config.inline === 'boolean') {
      VersionHelper.deprecate('Core', '6.0.0', 'TextAreaField.inline config is deprecated and will be removed');
    }

    super.startConfigure(config);
  }

  get inputElement() {
    const result = super.inputElement;
    result.style = (result.style || '') + `;resize:${this.resize}`;
    return result;
  }

} // Register this widget type with its Factory

TextAreaField.initClass();
TextAreaField._$name = 'TextAreaField';

export { TextAreaField };
//# sourceMappingURL=TextAreaField.js.map
