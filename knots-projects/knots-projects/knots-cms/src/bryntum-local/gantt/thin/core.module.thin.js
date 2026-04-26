/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { BrowserHelper, DomHelper, StringHelper, Tooltip, DateHelper, Events, Delayable, EventHelper, Rectangle, Widget, Combo, Store, Panel, Labelable, Field, Container, _defineProperty, Toolbar, ObjectHelper, _objectSpread2, Popup, Toast, VersionHelper, Button } from './chunks/Editor.js';
export { AjaxHelper, AjaxStore, Animator, ArrayDataField, ArrayHelper, AsyncHelper, Badge, Bag, Base, BooleanDataField, BrowserHelper, Button, ChipView, ClickRepeater, CollapseTool, Collection, CollectionFilter, CollectionSorter, Combo, Config, Container, ContextMenuBase, DataField, DateDataField, DateHelper, DayTime, Delayable, DomClassList, DomDataStore, DomHelper, DomSync, Duration, DynamicObject, Editor, EventHelper, Events, Factoryable, Field, FieldContainer, Fullscreen, FunctionHelper, GlobalEvents, IdHelper, Identifiable, InstancePlugin, IntegerDataField, KeyMap, Labelable, Layout, List, LoadMaskable, LocaleHelper, LocaleManagerSingleton as LocaleManager, Localizable, Mask, Menu, MenuItem, Model, ModelDataField, ModelStm, Navigator, NumberDataField, ObjectDataField, ObjectHelper, Objects, Panel, PanelCollapser, PickerField, Pluggable, Point, Popup, Promissory, RTL, Rectangle, Renderable, ResizeMonitor, Ripple, Rotatable, ScrollManager, Scroller, State, StateProvider, StateStorage, Store, StoreCRUD, StoreChained, StoreFilter, StoreGroup, StoreProxy, StoreRelation, StoreSearch, StoreSort, StoreState, StoreStm, StoreSum, StoreSync, StoreTree, StringDataField, StringHelper, TemplateHelper, TextField, Toast, Tool, Toolable, Toolbar, Tooltip, TreeNode, VersionHelper, WalkHelper, Widget, unitMagnitudes } from './chunks/Editor.js';
export { ActionBase, AvatarRendering, DragContext, DragProxy, Draggable, Droppable, Finalizable, StateBase, StateTrackingManager, Transaction } from './chunks/AvatarRendering.js';
import { Checkbox } from './chunks/LocalizableComboItems.js';
export { CalendarPanel, Checkbox, DateField, DatePicker, DragHelper, Formatter, LocalizableComboItems, MessageDialog, Month, NumberField, NumberFormat, ResizeHelper, TimeField, TimePicker, WidgetHelper } from './chunks/LocalizableComboItems.js';
import { RandomGenerator } from './chunks/TextAreaPickerField.js';
export { Parser, RandomGenerator, TextAreaPickerField, XMLHelper } from './chunks/TextAreaPickerField.js';
export { Featureable, FilterField } from './chunks/FilterField.js';
export { DragTipProxy, Hoverable, PanelCollapserOverlay } from './chunks/PanelCollapserOverlay.js';
export { Override } from './chunks/Override.js';
export { UndoRedoBase } from './chunks/UndoRedoBase.js';
export { ButtonGroup } from './chunks/ButtonGroup.js';
export { DateTimeField } from './chunks/Card.js';
export { DisplayField } from './chunks/DisplayField.js';
export { DurationField } from './chunks/DurationField.js';
export { Radio, Tab, TabBar, TabPanel } from './chunks/TabPanel.js';
export { Slider } from './chunks/Slider.js';
export { TextAreaField } from './chunks/TextAreaField.js';
export { Responsive, Styleable } from './chunks/Styleable.js';
export { Histogram, Scale } from './chunks/Scale.js';

/**
 * @module Core/customElements/WidgetTag
 */
/**
 * A base class for a custom web component element wrapping one {@link Core.widget.Widget}.
 */

class WidgetTag extends (globalThis.customElements ? HTMLElement : Object) {
  /**
   * The widget instance rendered in the shadow root
   * @member {Core.widget.Widget} widget
   */

  /**
   * Path to theme to use within the web component.
   *
   * ```html
   * <bryntum-grid stylesheet="resources/grid.stockholm.css">
   * </bryntum-grid>
   * ```
   *
   * @config {String} stylesheet
   */

  /**
   * Path to folder containing Font Awesome 6 Free.
   *
   * ```html
   * <bryntum-grid fa-path="resources/fonts">
   * </bryntum-grid>
   * ```
   *
   * @config {String} faPath
   */
  connectedCallback() {
    this.setup();
  }

  async setup() {
    const me = this; // Setup just once

    if (me.shadowRoot) {
      return;
    }

    let linkResolver, font;
    const product = me.tagName.substring('BRYNTUM-'.length).toLowerCase(),
          // Only load fa if not already on page, otherwise each instance will load it
    faPath = (!BrowserHelper.isChrome || !document.fonts.check(`normal 14px "Font Awesome 6 Free"`)) && me.getAttribute('fa-path'),
          themeLink = document.getElementById('bryntum-theme'),
          theme = me.getAttribute('theme') || 'stockholm',
          stylesheet = me.getAttribute('stylesheet') || (themeLink === null || themeLink === void 0 ? void 0 : themeLink.href) || `${product}.${theme}.css`,
          mode = me.getAttribute('mode') || 'open',
          // Go over to the dark side
    shadowRoot = me.attachShadow({
      mode
    }),
          // Include css and target div in shadow dom
    link = me.linkTag = DomHelper.createElement({
      tag: 'link',
      rel: 'stylesheet',
      href: stylesheet,
      parent: shadowRoot
    }),
          promises = [new Promise(resolve => {
      linkResolver = resolve;
    })],
          config = {
      appendTo: shadowRoot,
      features: {}
    };
    me.convertDatasetToConfigs(me.dataset, config);

    link.onload = () => linkResolver(); // Load FontAwesome if path was supplied

    if (faPath) {
      // FF cannot use the name "Font Awesome 6 Free", have if fixed in CSS to handle it also without spaces
      font = new FontFace(BrowserHelper.isFirefox ? 'FontAwesome5Free' : 'Font Awesome 6 Free', `url("${faPath}/fa-solid-900.woff2")`);
      promises.push(font.load());
    }

    await Promise.all(promises);

    if (font) {
      document.fonts.add(font);
    } // Create columns, data and configure features

    for (const tag of me.children) {
      const tagName = tag.tagName;

      if (tagName === 'FEATURE') {
        const name = tag.dataset.name,
              featureConfig = me.convertDatasetToConfigs(tag.dataset);
        delete featureConfig.name;

        if (Object.keys(featureConfig).length) {
          config.features[name] = featureConfig.use === 'false' ? false : featureConfig;
        } else {
          config.features[name] = tag.textContent !== 'false';
        }
      } else if (tagName === 'TBAR' || tagName === 'BBAR') {
        config[tagName.toLowerCase()] = Array.from(tag.children).map(item => me.convertDatasetToConfigs(item.dataset));
      } else if (tagName === 'INLINESTYLE') {
        const style = document.createElement('style');
        style.innerHTML = tag.innerHTML;
        shadowRoot.appendChild(style);
      }
    }

    me.widget = me.createInstance(config);
  }

  convertDatasetToConfigs(dataset, config = {}, ignoreObjects = false) {
    for (const key in dataset) {
      let value = dataset[key];

      if (!ignoreObjects && typeof value === 'string' && value.startsWith('{')) {
        value = this.convertDatasetToConfigs(JSON.parse(value.replace(/'/g, '"')));
      } else {
        var _StringHelper$safeJso;

        value = (_StringHelper$safeJso = StringHelper.safeJsonParse(value)) !== null && _StringHelper$safeJso !== void 0 ? _StringHelper$safeJso : value;
      }

      config[key] = value;
    }

    return config;
  }
  /**
   * Destroys the inner widget instance and cleans up
   */

  destroy() {
    var _sharedTips$tooltip, _sharedTips$tooltip$g, _sharedTips$errorTool;

    const me = this;

    if (!me.widget) {
      // Removed before anything could be created
      return;
    }

    const {
      shadowRoot
    } = me,
          sharedTips = shadowRoot.bryntum,
          constructor = me.widget.constructor,
          floatRoot = shadowRoot.querySelector('.b-float-root');
    sharedTips === null || sharedTips === void 0 ? void 0 : (_sharedTips$tooltip = sharedTips.tooltip) === null || _sharedTips$tooltip === void 0 ? void 0 : (_sharedTips$tooltip$g = _sharedTips$tooltip.get(Tooltip)) === null || _sharedTips$tooltip$g === void 0 ? void 0 : _sharedTips$tooltip$g.destroy();
    sharedTips === null || sharedTips === void 0 ? void 0 : (_sharedTips$errorTool = sharedTips.errorTooltip) === null || _sharedTips$errorTool === void 0 ? void 0 : _sharedTips$errorTool.destroy();
    me.widget.destroy();
    floatRoot === null || floatRoot === void 0 ? void 0 : floatRoot.remove();
    constructor.removeFloatRoot(floatRoot);
    me.linkTag.remove();
    me.widget = null;
  }

}
WidgetTag._$name = 'WidgetTag';

/**
 * @module Core/helper/CSSHelper
 */

/**
 * Provides methods to add and manipulate CSS style rules.
 *
 * Note that this class is incompatible with [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
 *
 * ```
 * this.criticalRule = CSSHelper.insertRule(`#${this.id} .b-sch-event.critical {background-color:${this.criticalColor}}`);
 * ```
 */

class CSSHelper {
  /**
   * Inserts a CSS style rule based upon the passed text
   * @param {String} cssText The text of the rule including selector and rule body just as it would
   * be specified in a CSS file.
   * @returns {CSSRule} The resulting CSS Rule object if the add was successful.
   */
  static insertRule(cssText) {
    const styleSheet = this.getStyleSheet(document.head),
          oldCount = styleSheet.cssRules.length;
    styleSheet.insertRule(cssText, 0); // Only return element zero if the add was successful.

    if (styleSheet.cssRules.length > oldCount) {
      return styleSheet.cssRules[0];
    }
  }
  /**
   * Looks up the first rule which matched the passed selector.
   * @param {String|Function} selector Either the selector string to exactly match or a function which
   * when passed a required selector, returns `true`.
   * @returns {CSSRule} The first matching CSS Rule object if any found.
   */

  static findRule(selector) {
    let result,
        isFn = typeof selector === 'function'; // Array#find will stop when the function returns true, stop when the inner
    // find call yields a value from the search string.
    // Array#find better: to http://www.andygup.net/fastest-way-to-find-an-item-in-a-javascript-array/

    Array.prototype.find.call(document.head.querySelectorAll('link[rel=stylesheet],style[type*=css]'), element => {
      result = Array.prototype.find.call(element.sheet.rules || element.sheet.cssRules, r => {
        return isFn ? selector(r) : r.selectorText === selector;
      });

      if (result) {
        return true;
      }
    });
    return result;
  }

  static getStyleSheet(parentElement = document.head) {
    if (!parentElement.$bryntumStylesheet) {
      parentElement.$bryntumStylesheet = DomHelper.createElement({
        tag: 'style',
        id: 'bryntum-private-styles',
        // no-sanity
        type: 'text/css',
        parent: parentElement
      }).sheet;
    }

    return parentElement.$bryntumStylesheet;
  }

}
CSSHelper._$name = 'CSSHelper';

/**
 * @module Core/helper/util/DataGenerator
 */

const lorem = ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.', 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui atione voluptatem sequi nesciunt.', 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.', 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?', 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'];
/**
 * Generates a pseudo random data for Grid records.
 * Used to provide data in examples.
 */

class DataGenerator {
  //region Random
  static reset() {
    this.rnd.reset();
    this.rndTime.reset();
    this.rndRating.reset();
  } //endregion
  //region Generate data

  static *generate(count, randomHeight = false, initialId = 1) {
    const me = this,
          rnd = me.rnd,
          rndTime = me.rndTime,
          rndRating = me.rndRating,
          rndText = me.rndText,
          firstNames = me.firstNames,
          surNames = me.surNames,
          teams = me.teams,
          foods = me.foods,
          colors = me.colors,
          cities = me.cities;

    for (let i = 0; i < count; i++) {
      const firstName = rnd.fromArray(firstNames),
            surName = rnd.fromArray(surNames),
            name = `${firstName} ${String.fromCharCode(65 + i % 25)} ${surName}`,
            startDay = rnd.nextRandom(60) + 1,
            start = new Date(2019, 0, startDay),
            finish = new Date(2019, 0, startDay + rnd.nextRandom(30) + 2),
            row = {
        id: initialId > -1 ? i + initialId : undefined,
        title: 'Row ' + i,
        name: name,
        firstName: firstName,
        surName: surName,
        city: rnd.fromArray(cities),
        team: rnd.fromArray(cities) + ' ' + rnd.fromArray(teams),
        age: 10 + rnd.nextRandom(80),
        food: rnd.fromArray(foods),
        color: rnd.fromArray(colors),
        score: rnd.nextRandom(100) * 10,
        rank: rnd.nextRandom(100) + 1,
        start: start,
        finish: finish,
        time: DateHelper.getTime(rndTime.nextRandom(24), rndTime.nextRandom(12) * 5),
        percent: rnd.nextRandom(100),
        done: rnd.nextRandom(100) < 50,
        rating: rndRating.nextRandom(5),
        relatedTo: Math.min(count - 1, i + initialId + rnd.nextRandom(10)),
        notes: lorem[rndText.nextRandom(7) + 1]
      };

      if (randomHeight) {
        row.rowHeight = rnd.nextRandom(randomHeight === true ? 20 : randomHeight) * 5 + 20;
      }

      yield row;
    }
  }
  /**
   * Generates a pseudo random data for Grid records.
   * @param {Number} count number of records
   * @param {Boolean} [randomHeight] generate random row height
   * @param {Number} [initialId] row initial id. Set -1 to disable Id generation. Defaults to 1.
   * @param {Boolean} [reset] set true to ensure we get the same dataset on consecutive calls. Defaults to true
   * @return {Object[]} generated rows array
   */

  static generateData(count, randomHeight = false, initialId = 1, reset = true) {
    if (reset) this.reset();
    const rows = [],
          number = DataGenerator.overrideRowCount ? DataGenerator.overrideRowCount : count,
          generator = this.generate(number, randomHeight, initialId);

    for (let i = 0; i < number; i++) {
      rows.push(generator.next().value);
    }

    return rows;
  }
  /**
   * Generates a pseudo random data for Grid row.
   * @return {Object} generated row
   */

  static generateRow() {
    return DataGenerator.generateData(1, false, -1, false)[0];
  } //endregion

}
Object.assign(DataGenerator, {
  rnd: new RandomGenerator(),
  rndTime: new RandomGenerator(),
  rndRating: new RandomGenerator(),
  rndText: new RandomGenerator(),
  cities: ['Stockholm', 'Barcelona', 'Paris', 'Dubai', 'New York', 'San Francisco', 'Washington', 'Moscow'],
  firstNames: ['Mike', 'Linda', 'Don', 'Karen', 'Doug', 'Jenny', 'Daniel', 'Melissa', 'John', 'Jane', 'Theo', 'Lisa', 'Adam', 'Mary', 'Barbara', 'James', 'David'],
  surNames: ['McGregor', 'Ewans', 'Scott', 'Smith', 'Johnson', 'Adams', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'More', 'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson'],
  teams: ['Lions', 'Eagles', 'Tigers', 'Horses', 'Dogs', 'Cats', 'Panthers', 'Rats', 'Ducks', 'Cougars', 'Hens', 'Roosters'],
  foods: ['Pancake', 'Burger', 'Fish n chips', 'Carbonara', 'Taco', 'Salad', 'Bolognese', 'Mac n cheese', 'Waffles'],
  colors: ['Blue', 'Green', 'Red', 'Yellow', 'Pink', 'Purple', 'Orange', 'Teal', 'Black']
});
DataGenerator._$name = 'DataGenerator';

const knownProps = ['action', 'target', 'to', 'deltaX', 'deltaY', 'x', 'y', 'text'];
class DemoBot extends Events(Delayable()) {
  static get defaultConfig() {
    return {
      repeat: true,
      outerElement: document.body,
      callOnFunctions: true
    };
  } // expects an outer element (grid.element/scheduler.element) and an array of steps similar to chain steps in siesta

  construct(config) {
    super.construct(config);
    const me = this;

    if (me.widget) {
      me.outerElement = me.widget.element;
      me.widget.playingDemo = true;
    }

    EventHelper.playingDemo = true;
    Object.assign(me, {
      prevTarget: null,
      currentStep: 0,
      mouse: DomHelper.createElement({
        parent: me.outerElement,
        tag: 'div',
        className: 'simulated-mouse'
      }),
      timeoutId: null,
      innerIntervalId: null,
      mouseOutElements: []
    });
    me.intervalId = me.setInterval(me.nextStep.bind(me), 1000);
    me.outerElement.classList.add('b-playing-demo');
    me.outerElement.addEventListener('click', event => {
      if (event.isTrusted) {
        me.abort();
      }
    });
  }

  doDestroy() {
    this.abort();
  } // stops the bot

  abort(atEnd = false) {
    const me = this;
    me.mouse.style.top = '-100px';
    me.clearInterval(me.intervalId);
    me.timeoutId && me.clearTimeout(me.timeoutId);
    me.innerIntervalId && me.clearInterval(me.innerIntervalId);
    me.outerElement.classList.remove('b-playing-demo');

    if (me.widget) {
      me.widget.playingDemo = false;
    }

    EventHelper.playingDemo = false;
    me.trigger(atEnd ? 'done' : 'abort');
  } // triggers a synthetic event

  triggerEvent(element, type, data) {
    if (!element) return null;
    let event;

    if (type.startsWith('mouse')) {
      const box = this.mouse.getBoundingClientRect();
      event = new MouseEvent(type, Object.assign({
        view: globalThis,
        bubbles: true,
        cancelable: true,
        clientX: box.left,
        clientY: box.top
      }, data || {}));
    } else {
      event = document.createEvent('Event');
      event.initEvent(type, true, false);
    }

    element.dispatchEvent(event);
    return event;
  } // moves mouse to target in 10 steps, with animated transition between steps

  handleMouseMove(step, target) {
    const me = this,
          mouse = me.mouse;
    mouse.classList.add('quick');
    if (me.mouseDown) mouse.classList.add('drag');
    const mouseBox = Rectangle.from(mouse, me.outerElement),
          x = mouseBox.x,
          y = mouseBox.y;
    let deltaX = 0,
        deltaY = 0;

    if (step.to) {
      if (typeof step.to === 'string') {
        const toElement = me.outerElement.querySelector(step.to);

        if (toElement) {
          const rect = Rectangle.from(toElement, me.outerElement),
                toX = rect.x + rect.width / 2,
                toY = rect.y + rect.height / 2;
          deltaX = (toX - x) / 10;
          deltaY = (toY - y) / 10;
        }
      } else if (step.to.x) {
        deltaX = (step.to.x - x) / 10;
      } else {
        deltaX = step.to[0] / 10;
        deltaY = step.to[1] / 10;
      }
    } else if (step.deltaX) {
      deltaX = step.deltaX / 10;
    } else if (step.x) {
      deltaX = (step.x - x) / 10;
    }

    if (step.deltaY) {
      deltaY = step.deltaY / 10;
    }

    let i = 0;
    me.innerIntervalId = me.setInterval(() => {
      // Only move mouse if in view and not scrolling
      if (me.shouldPause) {
        return;
      }

      if (i++ === 9) {
        clearInterval(me.innerIntervalId);

        if (step.then) {
          step.then();
        }
      }

      const mouseX = x + deltaX * i,
            mouseY = y + deltaY * i; // Move mouse there also

      mouse.style.left = mouseX + 'px';
      mouse.style.top = mouseY + 'px';
      const mouseBounds = mouse.getBoundingClientRect(),
            clientX = mouseBounds.left,
            clientY = mouseBounds.top,
            eventTarget = DomHelper.elementFromPoint(clientX, clientY);

      if (eventTarget !== me.prevTarget) {
        if (me.prevTarget) {
          me.mouseOutElements.push(me.prevTarget);

          if (!DomHelper.isDescendant(me.mouseOutElements[0], eventTarget)) {
            me.mouseOutElements.forEach(element => me.triggerEvent(element, 'mouseout'));
            me.mouseOutElements.length = 0;
          }
        }

        me.prevTarget = eventTarget;
        me.triggerEvent(eventTarget, 'mouseover');
      }

      me.triggerEvent(eventTarget, step.action, {
        clientX,
        clientY
      });
    }, 50);
  } // target can be a string selector, a function or blank to use last target or outerElement if first time

  getTarget(step) {
    const me = this,
          target = step.target;

    if (!target) {
      return me.prevTarget || me.outerElement;
    }

    if (typeof target === 'function') {
      return target(step);
    }

    return document.querySelector(target);
  } // action can be a function, a string or extracted from a property by scanning for unknown names

  normalizeStep(step) {
    if (step.action) {
      if (typeof step.action === 'function') {
        return step.action(step);
      }

      return step;
    }

    if (typeof step === 'function') {
      step();
      return step;
    } // try to find action among properties

    for (const prop in step) {
      if (Object.hasOwnProperty.call(step, prop) && !knownProps.includes(prop)) {
        step.action = prop.toLowerCase();
        step.to = step[prop];
      }
    }

    if (!step.target && (typeof step.to === 'string' || typeof step.to === 'function')) step.target = step.to;
    return step;
  }

  get isScrolling() {
    const me = this,
          box = me.outerElement.getBoundingClientRect(),
          scrolled = me.lastTop && box.top !== me.lastTop;
    me.lastTop = box.top;
    return scrolled;
  }

  get isInView() {
    const box = this.outerElement.getBoundingClientRect();
    return box.top < globalThis.innerHeight && box.bottom > 0;
  }

  get shouldPause() {
    return !this.isInView || this.isScrolling || document.hidden || !document.hasFocus();
  } // process the next step

  nextStep() {
    const me = this; // Only perform step if in view and not scrolling

    if (me.shouldPause) {
      return;
    }

    if (me.currentStep === me.steps.length) {
      if (me.repeat) {
        me.currentStep = 0;
      } else {
        return me.abort(true);
      }
    } // First step, signal to let demo initialize stuff

    if (me.currentStep === 0) {
      me.trigger('initialize');
    }

    const mouse = me.mouse,
          step = me.normalizeStep(me.steps[me.currentStep++]),
          target = me.getTarget(step),
          action = step.action;

    if (target && action) {
      mouse.className = 'simulated-mouse';

      if (action === 'mousemove') {
        me.handleMouseMove(step, target);
      } else {
        // First move mouse into position
        if (target !== me.prevTarget) {
          const rect = Rectangle.from(target, me.outerElement);
          mouse.style.left = rect.x + rect.width / 2 + 'px';
          mouse.style.top = rect.y + rect.height / 2 + 'px';
        }

        if (action === 'mousedown') {
          me.mouseDown = true;
        }

        if (action === 'mouseup') {
          me.mouseDown = false;
        } // Then trigger action

        me.timeoutId = me.setTimeout(() => {
          me.prevTarget = target; // Animate click etc.

          mouse.classList.add(action);

          if (action === 'type') {
            const field = Widget.fromElement(target),
                  parts = step.text.split('|');
            field.value = parts[parts.length === 1 || field.value != parts[0] ? 0 : 1];
          } else {
            me.triggerEvent(target, action);
          }
        }, action === 'type' ? 100 : 550);
      }
    }
  }

}
DemoBot._$name = 'DemoBot';

/**
 * @module Core/widget/BooleanCombo
 * Boolean combo, a combo box with two options corresponding to true or false.
 *
 * This field can be used as an {@link Grid/column/Column#config-editor} for the {@link Grid/column/Column}.
 *
 * @classType booleancombo
 * @extends Core/widget/Combo
 */

class BooleanCombo extends Combo {
  static get $name() {
    return 'BooleanCombo';
  }

  static get type() {
    return 'booleancombo';
  } //region Config

  static get configurable() {
    return {
      /**
       * Positive option value
       *
       * @config {*}
       */
      positiveValue: true,

      /**
       * Positive option display value
       *
       * @config {String}
       */
      positiveText: null,

      /**
       * Negative option value
       *
       * @config {*}
       */
      negativeValue: false,

      /**
       * False option display value
       *
       * @config {String}
       */
      negativeText: null,
      store: {
        value: [],
        $config: 'lazy'
      },

      /**
       * Default value
       *
       * @config {*}
       */
      value: false
    };
  } //endregion

  changeStore(store, oldStore) {
    const me = this; // We must call super.changeStore() in order to deduce valueField. We also cannot just pass an array since it
    // will convert to a store and call back here (infinite recursion).

    return super.changeStore(new Store({
      data: [{
        id: me.positiveValue,
        text: me.positiveText || me.L('L{Object.Yes}')
      }, {
        id: me.negativeValue,
        text: me.negativeText || me.L('L{Object.No}')
      }]
    }), oldStore);
  }

} // Register this widget type with its Factory

BooleanCombo.initClass();
BooleanCombo._$name = 'BooleanCombo';

/**
 * @module Core/widget/FieldSet
 */

/**
 * The `FieldSet` widget wraps an <code>&lt;fieldset&gt;</code> element. A fieldset is a specially styled
 * {@link Core.widget.Panel} intended to hold form fields.
 *
 * @extends Core/widget/Panel
 * @mixes Core/widget/mixin/Labelable
 * @classType fieldset
 */

class FieldSet extends Panel.mixin(Labelable) {
  //region Config
  static get $name() {
    return 'FieldSet';
  } // Factoryable type name

  static get type() {
    return 'fieldset';
  }

  static get configurable() {
    return {
      bodyTag: 'fieldset',

      /**
       * Setting this config to `true` assigns a horizontal box layout (`flex-flow: row`) to the items in this
       * container, while `false` assigns a vertical box layout (`flex-flow: column`).
       *
       * By default, this value is automatically determined based on the {@link #config-label} and
       * {@link #config-labelPosition} configs.
       * @config {Boolean}
       */
      inline: null,
      inlineInternal: null,
      layout: {
        type: 'box',
        horizontal: false
      }
    };
  }

  static get prototypeProperties() {
    return {
      flexRowCls: 'b-hbox',
      flexColCls: 'b-vbox'
    };
  } //endregion
  //region Composition

  get bodyConfig() {
    const result = super.bodyConfig,
          {
      className
    } = result,
          {
      inlineInternal: inline,
      hasLabel,
      title
    } = this;
    delete result.html;
    className['b-inline'] = inline;
    className['b-fieldset-has-label'] = hasLabel;

    if (title) {
      result.children = {
        // We render the <legend> element for a11y (not 100% sure it is needed)
        legendElement: {
          tag: 'legend',
          text: title,
          class: {
            'b-fieldset-legend': 1
          }
        }
      };
    }

    return result;
  }

  compose() {
    const {
      inlineInternal: inline,
      label,
      labelCls,
      labelWidth
    } = this;
    return {
      class: {
        'b-field': label,
        'b-vbox': !inline // override panel

      },
      children: {
        'labelElement > headerElement': (label || null) && {
          tag: 'label',
          html: label,
          class: {
            'b-label': 1,
            'b-align-start': 1,
            [labelCls]: labelCls
          },
          style: {
            width: DomHelper.unitize('width', labelWidth)[1]
          }
        }
      }
    };
  } //endregion

  syncInlineInternal() {
    var _this$inline;

    this.inlineInternal = (_this$inline = this.inline) !== null && _this$inline !== void 0 ? _this$inline : this.label != null && this.labelPosition === 'before';
  }

  updateInline() {
    this.syncInlineInternal();
  }

  updateInlineInternal(inline) {
    this.layout.horizontal = inline;
  }

  updateLabel() {
    this.syncInlineInternal();
  }

  updateLabelPosition() {
    this.syncInlineInternal();
  }

} // Register this widget type with its Factory

FieldSet.initClass();
FieldSet._$name = 'FieldSet';

/**
 * @module Core/widget/FileField
 */

/**
 * FileField widget. Wraps native &lt;input type="file"&gt;.
 *
 * {@inlineexample Core/widget/FileField.js vertical}
 *
 * There is a nicer styled wrapper for this field, see {@link Core/widget/FilePicker}
 *
 * @extends Core/widget/Field
 * @classType filefield
 */

class FileField extends Field {
  static get $name() {
    return 'FileField';
  } // Factoryable type name

  static get type() {
    return 'filefield';
  }

  static get configurable() {
    return {
      /**
       * Set to true to allow picking multiple files. Note that when set to a truthy value,
       * the field is set to accept multiple files, but the value returned will be
       * an empty string since this is what is rendered into the HTML.
       * @config {Boolean}
       * @default
       */
      multiple: null,

      /**
       * Comma-separated list of file extensions or MIME type to to accept. E.g.
       * ".jpg,.png,.doc" or "image/*". Null by default, allowing all files.
       * @config {String}
       */
      accept: null,
      inputType: 'file',
      attributes: ['multiple', 'accept']
    };
  }
  /**
   * Returns list of selected files
   * @property {FileList}
   * @readonly
   */

  get files() {
    return this.input.files;
  }
  /**
   * Opens browser file picker
   * @internal
   */

  pickFile() {
    this.input.click();
  }

  get multiple() {
    return this._multiple ? '' : null;
  }
  /**
   * Clears field value
   */

  clear() {
    this.input.value = null;
  }

  triggerChange(event) {
    this.triggerFieldChange({
      event,
      value: this.input.value,
      oldValue: this._lastValue,
      userAction: true,
      valid: true
    });
  }

} // Register this widget type with its Factory

FileField.initClass();
FileField._$name = 'FileField';

/**
 * @module Core/widget/FilePicker
 */

/**
 * File input field wrapped into {@link Core/widget/Button button}. Clicking button opens browser file picker window.
 * When files are chosen, badge appears showing amount of files. Hovering the button shows tip with file names.
 *
 * By default only single file allowed.
 *
 * @extends Core/widget/Container
 * @example
 *
 * let fileField = new FilePicker({
 *   fileFieldConfig : {
 *      multiple : true,
 *      accept   : "image/*"
 *   },
 *   buttonConfig : {
 *       text : 'Pick file...'
 *   }
 * });
 *
 * @classType filepicker
 * @inlineexample Core/widget/FilePicker.js
 */

class FilePicker extends Container {
  static get $name() {
    return 'FilePicker';
  } // Factoryable type name

  static get type() {
    return 'filepicker';
  }

  static get defaultConfig() {
    return {
      /**
       * The name of the property to set when a single value is to be applied to this FilePicker. Such as when used
       * in a grid WidgetColumn, this is the property to which the column's `field` is applied.
       * @config {String}
       * @default
       * @category Misc
       */
      defaultBindProperty: 'value',

      /**
       * Fires after user closes file picker dialog.
       * @event change
       * @param {FileList} files List of picked files
       */

      /**
       * Fires when field is cleared with {@link #function-clear} method
       * @event clear
       */

      /**
       * Wrapper button config object. See {@link Core/widget/Button} for list of available configs.
       * @config {Object}
       */
      buttonConfig: null,

      /**
       * Underlying field config object. See {@link Core/widget/FileField} for list of available configs.
       * @config {Object}
       */
      fileFieldConfig: null
    };
  }

  construct(config = {}) {
    const me = this;
    config.items = [Object.assign({
      type: 'button',
      ref: 'fileButton',
      text: 'L{FilePicker.file}',
      localeClass: this
    }, config.buttonConfig), Object.assign({
      type: 'filefield',
      ref: 'fileField',
      style: 'display: none'
    }, config.fileFieldConfig)].concat(config.items || []);
    super.construct(config);
    me.button.on({
      click: me.onButtonClick,
      thisObj: me
    });
    me.fileField.on({
      change: me.onFileFieldChange,
      thisObj: me
    });

    me._thisIsAUsedExpression(me.fileTip);
  }

  get button() {
    return this.widgetMap.fileButton;
  }

  get fileField() {
    return this.widgetMap.fileField;
  }
  /**
   * List of selected files
   * @property {FileList}
   * @readonly
   */

  get files() {
    return this.fileField.files;
  }

  get fileTip() {
    const me = this;
    return me._fileTip || (me._fileTip = new Tooltip({
      cls: 'b-file-tip',
      forElement: me.button.element,
      showOnHover: true,
      align: 'b-t',
      scrollAction: 'realign',
      listeners: {
        beforeshow() {
          const tip = this,
                files = me.files;

          if (files && files.length) {
            tip.html = `${Array.from(files).map(file => file.name).join('<br>')}`;
            return true;
          } // Veto show

          return false;
        }

      }
    }));
  }
  /**
   * Clears field
   */

  clear() {
    const me = this;
    me.fileField.clear();
    me.button.badge = '';
    me.trigger('clear');
  }

  onButtonClick({
    event
  }) {
    const me = this; // forward click to the file input to open browser file picker
    // me.fileField.input.click();

    me.fileField.pickFile();
    event.preventDefault();
  }

  onFileFieldChange({
    valid
  }) {
    const me = this;
    me.button.badge = me.files.length || '';
    me.triggerFieldChange({
      files: me.files,
      valid
    });
  }

} // Register this widget type with its Factory

FilePicker.initClass();
FilePicker._$name = 'FilePicker';

class Label extends Widget {
  compose() {
    const {
      text,
      html
    } = this;
    return {
      tag: 'label',
      text,
      html
    };
  }

}

_defineProperty(Label, "$name", 'Label');

_defineProperty(Label, "type", 'label');

_defineProperty(Label, "configurable", {
  text: null
});

Label.initClass();
Label._$name = 'Label';

/**
 * @module Core/widget/PagingToolbar
 */

/**
 * A special Toolbar class, which, when attached to an {@link Core.data.AjaxStore AjaxStore}, which has been configured
 * to be {@link Core.data.AjaxStore#property-isPaged paged}, controls the loading of that store to page through the data
 * set.
 *
 * ```javascript
 * new Grid({
 *      bbar : {
 *          type  : 'pagingtoolbar'
 *      }
 * });
 * ```
 *
 * ### Default toolbar items
 *
 * The toolbar provides some default buttons and other items as described below:
 *
 * | Reference              | Weight  Description                                              |
 * |------------------------|--------|---------------------------------------------------------|
 * | `firstPageButton`      | 100    | Go to first page                                        |
 * | `previousPageButton`   | 110    | Go to previous page                                     |
 * | `pageNumber`           | 120    | TextCurrent page number                                 |
 * | `pageCount`            | 130    | Label showing number of pages                           |
 * | `nextPageButton`       | 140    | Go to next page                                         |
 * | `lastPageButton`       | 150    | Go to last page                                         |
 * | `reloadButton`         | 160    | Reload data                                             |
 * | `dataSummary`          | 170    | Summary text                                            |
 *
 * ### Customizing the toolbar items
 *
 * The toolbar items can be customized, existing items can be changed or removed,
 * and new items can be added. This is handled using the {@link #config-items} config.
 *
 * Adding additional buttons or widgets to the paging toolbar can be done like so:
 *
 * ```javascript
 * bbar : {
 *     type  : 'pagingtoolbar',
 *     items : {
 *         click : {
 *             type : 'button',
 *             text : 'Click me',
 *             weight : 175 // Add after last item
 *         }
 *     }
 * }
 * ```
 *
 * @extends Core/widget/Toolbar
 * @classType toolbar
 */

class PagingToolbar extends Toolbar {
  static get $name() {
    return 'PagingToolbar';
  } // Factoryable type name

  static get type() {
    return 'pagingtoolbar';
  }

  static get defaultConfig() {
    return {
      /**
       * The {@link Core.data.AjaxStore AjaxStore} that this PagingToolbar is to control.
       * @config {Core.data.AjaxStore}
       */
      store: null,
      defaults: {
        localeClass: this
      },
      items: {
        firstPageButton: {
          onClick: 'up.onFirstPageClick',
          icon: 'b-icon-first',
          weight: 100,
          tooltip: 'L{PagingToolbar.firstPage}'
        },
        previousPageButton: {
          onClick: 'up.onPreviousPageClick',
          icon: 'b-icon-previous',
          weight: 110,
          tooltip: 'L{PagingToolbar.prevPage}'
        },
        pageNumber: {
          type: 'numberfield',
          label: 'L{page}',
          min: 1,
          max: 1,
          triggers: null,
          onChange: 'up.onPageNumberChange',
          highlightExternalChange: false,
          weight: 120
        },
        pageCount: {
          type: 'widget',
          cls: 'b-pagecount b-toolbar-text',
          weight: 130
        },
        nextPageButton: {
          onClick: 'up.onNextPageClick',
          icon: 'b-icon-next',
          weight: 140,
          tooltip: 'L{PagingToolbar.nextPage}'
        },
        lastPageButton: {
          onClick: 'up.onLastPageClick',
          icon: 'b-icon-last',
          weight: 150,
          tooltip: 'L{PagingToolbar.lastPage}'
        },
        separator: {
          type: 'widget',
          cls: 'b-toolbar-separator',
          weight: 151
        },
        reloadButton: {
          onClick: 'up.onReloadClick',
          icon: 'b-icon-reload',
          weight: 160,
          tooltip: 'L{PagingToolbar.reload}'
        },
        spacer: {
          type: 'widget',
          cls: 'b-toolbar-fill',
          weight: 161
        },
        dataSummary: {
          type: 'widget',
          cls: 'b-toolbar-text',
          weight: 170
        }
      }
    };
  } // Retrieve store from grid when "assigned" to it

  set parent(parent) {
    super.parent = parent;

    if (!this.store) {
      this.store = parent.store;
    }
  }

  get parent() {
    return super.parent;
  }

  set store(store) {
    const me = this;
    me.detachListeners('store');
    me._store = store;

    if (store) {
      store.on({
        name: 'store',
        beforerequest: 'onStoreBeforeRequest',
        afterrequest: 'onStoreChange',
        change: 'onStoreChange',
        thisObj: me
      });

      if (store.isLoading) {
        me.onStoreBeforeRequest();
      }
    }
  }

  get store() {
    return this._store;
  }

  onStoreBeforeRequest() {
    this.eachWidget(w => w.disable());
  }

  updateLocalization() {
    this.updateSummary();
    super.updateLocalization();
  }

  updateSummary() {
    const me = this,
          {
      pageCount,
      dataSummary
    } = me.widgetMap;
    let count = 0,
        lastPage = 0,
        start = 0,
        end = 0,
        allCount = 0;

    if (me.store) {
      const {
        store
      } = me,
            {
        pageSize,
        currentPage
      } = store;
      count = store.count;
      lastPage = store.lastPage;
      allCount = store.allCount;
      start = Math.max(0, (currentPage - 1) * pageSize + 1);
      end = Math.min(allCount, start + pageSize - 1);
    }

    pageCount.html = me.L('L{pageCountTemplate}')({
      lastPage
    });
    dataSummary.html = count ? me.L('L{summaryTemplate}')({
      start,
      end,
      allCount
    }) : me.L('L{noRecords}');
  }

  onStoreChange() {
    const me = this,
          {
      widgetMap,
      store
    } = me,
          {
      count,
      lastPage,
      currentPage
    } = store,
          {
      pageNumber,
      pageCount,
      firstPageButton,
      previousPageButton,
      nextPageButton,
      lastPageButton,
      dataSummary
    } = widgetMap;
    me.eachWidget(w => w.enable());
    pageNumber.value = currentPage;
    pageNumber.max = lastPage;
    dataSummary.disabled = pageNumber.disabled = pageCount.disabled = !count;
    firstPageButton.disabled = previousPageButton.disabled = currentPage <= 1 || !count;
    nextPageButton.disabled = lastPageButton.disabled = currentPage >= lastPage || !count;
    me.updateSummary();
  }

  onPageNumberChange({
    value
  }) {
    if (this.store.currentPage !== value) {
      this.store.loadPage(value);
    }
  }

  onFirstPageClick() {
    this.store.loadPage(1);
  }

  onPreviousPageClick() {
    this.store.previousPage();
  }

  onNextPageClick() {
    this.store.nextPage();
  }

  onLastPageClick() {
    this.store.loadPage(this.store.lastPage);
  }

  onReloadClick() {
    this.store.loadPage(this.store.currentPage);
  }

} // Register this widget type with its Factory

PagingToolbar.initClass();
PagingToolbar._$name = 'PagingToolbar';

/**
 * @module Core/widget/PasswordField
 */

/**
 * Password field widget. Wraps native &lt;input type="password"&gt;
 *
 * ```javascript
 * let textField = new PasswordField({
 *     placeholder : 'Enter password'
 * });
 * ```
 *
 * {@inlineexample Core/widget/PasswordField.js}
 * @classType passwordfield
 * @extends Core/widget/Field
 */

class PasswordField extends Field {
  // Factoryable type name
  static get type() {
    return 'passwordfield';
  } // Factoryable type alias

  static get alias() {
    return 'password';
  }

  static get $name() {
    return 'PasswordField';
  }

  construct(config = {}) {
    config.inputType = 'password';
    super.construct(...arguments);
    this.element.classList.add('b-textfield');
  }

} // Register this widget type with its Factory

PasswordField.initClass();
PasswordField._$name = 'PasswordField';

/**
 * @module Core/widget/RadioGroup
 */

/**
 * The `RadioGroup` widget contains a set of related `Radio` button widgets.
 *
 * For example, to present three choices and have the user select one of them:
 *
 * ```javascript
 *  {
 *      type    : 'radiogroup',
 *      title   : 'Resolve Conflict',
 *      name    : 'resolution',
 *      value   : 'A',  // the default choice
 *      options : {
 *          A : 'Keep the original version',
 *          B : 'Use the new version',
 *          C : 'Reconcile individual conflicts'
 *      }
 *  }
 * ```
 * The {@link #config-name} config is required for this widget and it will be assigned to all radio buttons created by
 * processing the {@link #config-options} config.
 *
 * ## Nested Items
 * Radio buttons can also have a {@link Core.widget.Radio#config-container} of additional
 * {@link Core.widget.Container#config-items}. These items can be displayed immediately following the field's label
 * (which is the default when there is only one item) or below the radio button. This can be controlled using the
 * {@link Core.widget.Radio#config-inline} config.
 *
 * In the demo below notice how additional fields are displayed for the checked radio button:
 *
 * {@inlineexample Core/widget/RadioGroup.js vertical}
 *
 * @extends Core/widget/FieldSet
 * @classType radiogroup
 */

class RadioGroup extends FieldSet {
  //region Config
  static get $name() {
    return 'RadioGroup';
  } // Factoryable type name

  static get type() {
    return 'radiogroup';
  }

  static get configurable() {
    return {
      defaultType: 'radio',

      /**
       * Set this to `true` so that clicking the currently checked radio button will clear the check from all
       * radio buttons in the group.
       * @config {Boolean}
       * @default false
       */
      clearable: null,

      /**
       * The name by which this widget's {@link #property-value} is accessed using the parent container's
       * {@link Core.widget.Container#property-values}.
       *
       * The config must be provided as it is used to set the {@link Core.widget.Radio#config-name} of the
       * child {@link Core.widget.Radio radio buttons}.
       * @config {String}
       */
      name: null,

      /**
       * The set of radio button options for this radio button group. This is a shorthand for defining these in
       * the {@link Core.widget.Container#config-items}. The keys of this object hold the radio button's
       * {@link Core.widget.Radio#config-checkedValue} while the object values are a string for the radio button's
       * {@link Core.widget.Radio#config-text} or a config object for that radio button.
       *
       * The {@link #property-value} of this radio button group will be one of the keys in this object or `null`
       * if no radio button is checked.
       *
       * For example, consider the following configuration:
       * ```javascript
       *  {
       *      type    : 'radiogroup',
       *      name    : 'resolution',
       *      value   : 'A',
       *      options : {
       *          A : 'Keep the original version',
       *          B : 'Use the new version',
       *          C : 'Reconcile individual conflicts'
       *      }
       *  }
       * ```
       *
       * The above is equivalent to this configuration below using {@link #config-items}:
       * ```javascript
       *  {
       *      type  : 'radiogroup',
       *      items : [{
       *          text         : 'Keep the original version',
       *          name         : 'resolution',
       *          ref          : 'resolution_A',
       *          checked      : true,
       *          checkedValue : 'A'
       *      }, {
       *          text         : 'Use the new version',
       *          name         : 'resolution',
       *          ref          : 'resolution_B',
       *          checkedValue : 'B'
       *      }, {
       *          text         : 'Reconcile individual conflicts',
       *          name         : 'resolution',
       *          ref          : 'resolution_C',
       *          checkedValue : 'C'
       *      }]
       *  }
       * ```
       * @config {Object} options
       */
      options: {
        value: null,
        $config: {
          merge: 'items'
        }
      },
      defaultBindProperty: 'value'
    };
  }

  get existingOptions() {
    const {
      name
    } = this;
    return this.ensureItems().filter(c => c.name === name);
  }

  get refPrefix() {
    return `${this.name || this.ref || this.id}_`;
  }

  get selected() {
    return this.existingOptions.filter(c => c.input.checked)[0] || null;
  }
  /**
   * This property corresponds to the {@link Core.widget.Radio#config-checkedValue} of the currently
   * {@link Core.widget.Radio#property-checked} radio button.
   * @property {String}
   */

  get value() {
    const {
      selected
    } = this;
    return selected ? selected.checkedValue : null;
  }

  set value(v) {
    this.existingOptions.forEach(c => {
      c.checked = c.checkedValue === v;
    });
  }

  changeOptions(options, was) {
    if (!(options && was && ObjectHelper.isDeeplyEqual(was, options))) {
      return options;
    }
  }

  convertOption(key, option, existing) {
    const me = this,
          {
      name
    } = me,
          ret = {
      name,
      type: 'radio',
      value: key === me.value,
      ref: `${me.refPrefix}${key}`,
      checkedValue: key
    };

    if (typeof option === 'string') {
      ret.text = option;
    } else {
      ObjectHelper.assign(ret, option);
    }

    return existing ? Widget.reconfigure(existing, ret) : ret;
  }

  isOurRadio(item) {
    // Radio groups could be nested using field containers, so we need isRadio and name equality check:
    return item.isRadio && item.name === this.name;
  }

  isolateFieldChange(field) {
    // if this is one of our radio buttons, swallow the field change:
    return this.isOurRadio(field);
  }

  onChildAdd(item) {
    super.onChildAdd(item);

    if (this.isOurRadio(item)) {
      item.on({
        name: item.id,
        beforeChange: 'onRadioItemBeforeChange',
        change: 'onRadioItemChange',
        click: 'onRadioClick',
        thisObj: this
      });
    }
  }

  onChildRemove(item) {
    if (this.isOurRadio(item)) {
      this.detachListeners(item.id);
    }

    super.onChildRemove(item);
  }

  onRadioClick(ev) {
    const {
      source
    } = ev;

    if (source.checked && this.clearable && source.clearable == null) {
      source.checked = false;
    }
  }

  onRadioItemBeforeChange(ev) {
    if (ev.checked) {
      const me = this,
            {
        lastValue
      } = me;

      if (!me.reverting && me.trigger('beforeChange', me.wrapRadioEvent(ev)) === false) {
        if (lastValue != null && lastValue !== me.value) {
          me.reverting = true;
          ev.source.uncheckToggleGroupMembers();
          me.value = lastValue;
          me.lastValue = lastValue;
          me.reverting = false;
          return false;
        }
      }
    }
  }

  onRadioItemChange(ev) {
    const me = this;

    if (ev.checked && !me.reverting) {
      me.triggerFieldChange(me.wrapRadioEvent(ev));
      me.lastValue = me.value;
    }
  }

  wrapRadioEvent(ev) {
    return {
      from: ev,
      item: ev.source,
      userAction: ev.userAction,
      lastValue: this.lastValue,
      value: this.value
    };
  }

  updateOptions() {
    var _existing;

    const me = this,
          {
      options,
      refPrefix
    } = me,
          existingOptions = me.existingOptions.reduce((m, c) => {
      m[c.ref.substring(refPrefix.length)] = c;
      return m;
    }, {});
    let index = 0,
        existing,
        key,
        option;

    if (options) {
      for (key in options) {
        option = me.convertOption(key, options[key], existingOptions[key]);
        delete existingOptions[key];
        me.insert(option, index++);
      }
    }

    existing = Object.values(existingOptions);

    if ((_existing = existing) !== null && _existing !== void 0 && _existing.length) {
      me.remove(existing);
      existing.forEach(c => c.destroy());
    }
  } //endregion

} // Register this widget type with its Factory

RadioGroup.initClass();
RadioGroup._$name = 'RadioGroup';

/**
 * @module Core/widget/SlideToggle
 */

/**
 * SlideToggle field is a variation of {@link Core.widget.Checkbox} with a sliding toggle instead of box with check mark.
 * It wraps <code>&lt;input type="checkbox"&gt;</code>.
 * Color can be specified and you can optionally configure {@link #config-text} to display in a label to the right of
 * the toggle in addition to a standard field {@link #config-label}.
 *
 * {@inlineexample Core/widget/SlideToggle.js vertical}
 *
 * This field can be used as an {@link Grid.column.Column#config-editor} for the {@link Grid.column.Column}.
 *
 * @extends Core/widget/Checkbox
 * @classType slidetoggle
 */

class SlideToggle extends Checkbox {
  static get $name() {
    return 'SlideToggle';
  }

  static get type() {
    return 'slidetoggle';
  }

  static get properties() {
    return {
      toggledCls: 'b-slidetoggle-checked'
    };
  }

  construct(config) {
    if (config !== null && config !== void 0 && config.checked) {
      config.cls = (config.cls || '') + ' ' + this.constructor.properties.toggledCls;
    }

    super.construct(config);
  }

  get innerElements() {
    const innerEls = super.innerElements;
    innerEls.splice(1, 0, this.toggleElement);

    if (this.text) {
      innerEls[innerEls.length - 1].class = 'b-slidetoggle-label';
    } else {
      // Remove label, not used
      innerEls.pop();
    }

    return innerEls;
  }

  get toggleElement() {
    return {
      class: 'b-slidetoggle-toggle',
      reference: 'slideToggle',
      children: [{
        class: 'b-slidetoggle-thumb',
        reference: 'slideThumb'
      }]
    };
  }

  internalOnChange() {
    super.internalOnChange();
    this.element.classList[this.value ? 'add' : 'remove'](this.toggledCls);
  }

  updateRtl(...args) {
    // Skip transition when changing `direction`, otherwise the thumb will animate weirdly
    this.slideThumb.style.transition = 'none';
    super.updateRtl(...args);
    this.setTimeout(() => this.slideThumb.style.transition = '', 0);
  }

}
SlideToggle.initClass();
SlideToggle._$name = 'SlideToggle';

/**
 * @module Core/widget/Splitter
 */

const classesHV = ['b-horizontal', 'b-vertical'],
      hasFlex = el => DomHelper.getStyleValue(el.parentElement, 'display') === 'flex' && (parseInt(DomHelper.getStyleValue(el, 'flex-basis'), 10) || parseInt(DomHelper.getStyleValue(el, 'flex-grow'), 10)),
      verticality = {
  horizontal: false,
  vertical: true
};
/**
 * A simple splitter widget that resizes the elements next to it or above/below it depending on orientation.
 *
 * @extends Core/widget/Widget
 * @classType splitter
 * @inlineexample Core/widget/Splitter.js
 */

class Splitter extends Widget {
  //region Config
  static get $name() {
    return 'Splitter';
  } // Factoryable type name

  static get type() {
    return 'splitter';
  }

  static get configurable() {
    return {
      /**
       * Splitter orientation, see {@link #config-orientation}. When set to 'auto' then actually used orientation
       * can be retrieved using {@link #property-currentOrientation}.
       * @member {String} orientation
       * @readonly
       */

      /**
       * The splitters orientation, configurable with 'auto', 'horizontal' or 'vertical'.
       *
       * 'auto' tries to determine the orientation by either checking the `flex-direction` of the parent element
       * or by comparing the positions of the closest sibling elements to the splitter. If they are above and
       * below 'horizontal' is used, if not it uses 'vertical'.
       *
       * ```
       * new Splitter({
       *    orientation : 'horizontal'
       * });
       * ```
       *
       * To receive the actually used orientation when configured with 'auto', see
       * {@link #property-currentOrientation}.
       *
       * @config {String}
       * @default
       */
      orientation: 'auto',
      vertical: null,
      containerElement: {
        $config: 'nullify',
        value: null
      },
      nextNeighbor: {
        $config: 'nullify',
        value: null
      },
      previousNeighbor: {
        $config: 'nullify',
        value: null
      }
      /**
       * Fired when a drag starts
       * @event dragStart
       * @param {Core.widget.Splitter} source The Splitter
       * @param {MouseEvent|TouchEvent} event The DOM event
       */

      /**
       * Fired while dragging
       * @event drag
       * @param {Core.widget.Splitter} source The Splitter
       * @param {MouseEvent|TouchEvent} event The DOM event
       */

      /**
       * Fired after a drop
       * @event drop
       * @param {Core.widget.Splitter} source The Splitter
       * @param {MouseEvent|TouchEvent} event The DOM event
       */

    };
  }

  static get delayable() {
    return {
      syncState: 'raf'
    };
  } //endregion
  //region Init & destroy

  doDestroy() {
    var _this$mouseDetacher;

    (_this$mouseDetacher = this.mouseDetacher) === null || _this$mouseDetacher === void 0 ? void 0 : _this$mouseDetacher.call(this);
    super.doDestroy();
  } //endregion
  //region Template & element

  compose() {
    return {
      class: {
        'b-splitter': 1
      },
      listeners: _objectSpread2({
        pointerdown: 'onMouseDown',
        mouseenter: 'syncState'
      }, !BrowserHelper.supportsPointerEvents && {
        mousedown: 'onMouseDown',
        touchstart: 'onMouseDown'
      })
    };
  } //endregion
  //region Orientation

  /**
   * Get actually used orientation, which is either the configured value for `orientation` or if configured with
   * 'auto' the currently used orientation.
   * @property {String}
   * @readonly
   */

  get currentOrientation() {
    return this.vertical ? 'vertical' : 'horizontal';
  }

  get nextWidget() {
    return Widget.fromElement(this.element.nextElementSibling, 1);
  }

  get previousWidget() {
    return Widget.fromElement(this.element.previousElementSibling, 1);
  }

  updateContainerElement(containerElement) {
    var _me$stateDetector;

    const me = this;
    me.stateDetector = (_me$stateDetector = me.stateDetector) === null || _me$stateDetector === void 0 ? void 0 : _me$stateDetector.disconnect();

    if (containerElement) {
      me.stateDetector = new MutationObserver(() => me.syncState()); // syncState runs on next raf

      me.stateDetector.observe(containerElement, {
        attributes: true,
        // in case style changes flip our orientation (when == 'auto')
        childList: true // watch for our neighbors to render (so we can disable on hidden/collapsed state)

      });
    }
  }

  updateNextNeighbor(next) {
    this.watchNeighbor(next, 'next');
  }

  updatePreviousNeighbor(previous) {
    this.watchNeighbor(previous, 'previous');
  }

  watchNeighbor(neighbor, name) {
    this.detachListeners(name);
    neighbor === null || neighbor === void 0 ? void 0 : neighbor.on({
      name,
      thisObj: this,
      collapse: 'syncState',
      expand: 'syncState',
      hide: 'syncState',
      show: 'syncState'
    });
  }

  updateOrientation() {
    this.syncState.now();
  }

  updateVertical(vertical) {
    var _this$element;

    const classList = (_this$element = this.element) === null || _this$element === void 0 ? void 0 : _this$element.classList;
    classList === null || classList === void 0 ? void 0 : classList.add(classesHV[vertical ? 1 : 0]);
    classList === null || classList === void 0 ? void 0 : classList.remove(classesHV[vertical ? 0 : 1]);
  }
  /**
   * Determine orientation when set to `'auto'` and detects neighboring widgets to monitor their hidden/collapsed
   * states.
   * @private
   */

  syncState() {
    var _verticality$me$orien;

    const me = this,
          {
      element,
      nextWidget,
      previousWidget
    } = me;
    let vertical = (_verticality$me$orien = verticality[me.orientation]) !== null && _verticality$me$orien !== void 0 ? _verticality$me$orien : null;
    me.nextNeighbor = nextWidget;
    me.previousNeighbor = previousWidget;
    me.disabled = nextWidget && (nextWidget.collapsible && nextWidget.collapsed || nextWidget.hidden) || previousWidget && (previousWidget.collapsible && previousWidget.collapsed || previousWidget.hidden);

    if (vertical !== null && nextWidget && previousWidget) {
      me.containerElement = null;
    } else {
      // we'll need to monitor parent element child list changes until our neighbors are added to the DOM
      me.containerElement = element.parentElement; // Orientation auto and already rendered, determine orientation to use

      if (me.rendered && element.offsetParent) {
        const flexDirection = DomHelper.getStyleValue(element.parentElement, 'flex-direction'); // If used in a flex layout, determine orientation from flex-direction

        if (flexDirection) {
          vertical = !flexDirection.startsWith('column');
        } // If used in some other layout, try to determine from sibling elements position
        else {
          const previous = element.previousElementSibling,
                next = element.nextElementSibling;

          if (!previous || !next) {
            // To early in rendering, next sibling not rendered yet
            return;
          }

          const prevRect = previous.getBoundingClientRect(),
                nextRect = next.getBoundingClientRect(),
                topMost = prevRect.top < nextRect.top ? prevRect : nextRect,
                bottomMost = topMost === nextRect ? prevRect : nextRect; // orientation = topMost.top !== bottomMost.top ? 'horizontal' : 'vertical';

          vertical = topMost.top === bottomMost.top;
        }
      }
    }

    me.vertical = vertical;
  } //endregion
  //region Events

  onMouseDown(event) {
    var _me$mouseDetacher;

    event.preventDefault();

    if (event.touches) {
      event = event.touches[0];
    }

    const me = this,
          {
      element
    } = me,
          prev = element.previousElementSibling,
          next = element.nextElementSibling,
          prevHasFlex = hasFlex(prev),
          nextHasFlex = hasFlex(next),
          flexed = []; // First stop any ongoing drag operation, since we cannot trust that we always get the mouseup event

    (_me$mouseDetacher = me.mouseDetacher) === null || _me$mouseDetacher === void 0 ? void 0 : _me$mouseDetacher.call(me); // Remember flexed children, to enable maintaining their proportions on resize

    for (const child of element.parentElement.children) {
      if (hasFlex(child) && child !== element) {
        flexed.push({
          element: child,
          width: child.offsetWidth,
          height: child.offsetHeight
        });
      }
    }

    me.context = {
      startX: event.pageX,
      startY: event.pageY,
      prevWidth: prev.offsetWidth,
      prevHeight: prev.offsetHeight,
      nextWidth: next.offsetWidth,
      nextHeight: next.offsetHeight,
      prevHasFlex,
      nextHasFlex,
      flexed,
      prev,
      next
    };
    const events = {
      element: document,
      pointermove: 'onMouseMove',
      pointerup: 'onMouseUp',
      thisObj: me
    }; // TODO : Re-evaluate if this is needed in 2023, https://caniuse.com/pointer

    if (!BrowserHelper.supportsPointerEvents) {
      events.mousemove = events.touchmove = 'onMouseMove';
      events.mouseup = events.touchend = 'onMouseUp';
    }

    element.classList.add('b-moving');
    me.mouseDetacher = EventHelper.on(events);
  }

  onMouseMove(event) {
    const me = this,
          {
      context,
      nextWidget,
      previousWidget
    } = me,
          prevStyle = context.prev.style,
          nextStyle = context.next.style,
          deltaX = (event.pageX - context.startX) * (me.rtl ? -1 : 1),
          deltaY = event.pageY - context.startY;
    event.preventDefault();
    Object.assign(context, {
      deltaX,
      deltaY
    });

    if (!context.started) {
      context.started = true;
      me.trigger('dragStart', {
        context,
        event
      }); // Convert heights/widths to flex for flexed elements to maintain proportions
      // 100px high -> flex-grow 100

      context.flexed.forEach(flexed => {
        flexed.element.style.flexGrow = me.vertical ? flexed.width : flexed.height; //Remove flex-basis, since it interferes with resizing

        flexed.element.style.flexBasis = '0';
      });
    } // Adjust flex-grow or width/height for splitters closest siblings

    if (me.vertical) {
      const newPrevWidth = context.prevWidth + deltaX,
            newNextWidth = context.nextWidth - deltaX;

      if (context.prevHasFlex) {
        prevStyle.flexGrow = newPrevWidth;
      } else if (previousWidget) {
        previousWidget.width = newPrevWidth;
      } else {
        prevStyle.width = `${newPrevWidth}px`;
      }

      if (context.nextHasFlex) {
        nextStyle.flexGrow = newNextWidth;
      } else if (nextWidget) {
        nextWidget.width = newNextWidth;
      } else {
        nextStyle.width = `${newNextWidth}px`;
      }
    } else {
      const newPrevHeight = context.prevHeight + deltaY,
            newNextHeight = context.nextHeight - deltaY;

      if (context.prevHasFlex) {
        prevStyle.flexGrow = newPrevHeight;
      } else if (previousWidget) {
        previousWidget.height = newPrevHeight;
      } else {
        prevStyle.height = `${newPrevHeight}px`;
      }

      if (context.nextHasFlex) {
        nextStyle.flexGrow = newNextHeight;
      } else if (nextWidget) {
        nextWidget.height = newNextHeight;
      } else {
        nextStyle.height = `${newNextHeight}px`;
      }
    }

    me.trigger('drag', {
      context,
      event
    });
  }

  onMouseUp(event) {
    var _me$mouseDetacher2;

    const me = this;
    (_me$mouseDetacher2 = me.mouseDetacher) === null || _me$mouseDetacher2 === void 0 ? void 0 : _me$mouseDetacher2.call(me);
    me.mouseDetacher = null;
    me.element.classList.remove('b-moving');

    if (me.context.started) {
      me.trigger('drop', {
        context: me.context,
        event
      });
    }

    me.context = null;
  } //endregion

  render() {
    super.render(...arguments);
    this.syncState.now();

    if (this.vertical === null) {
      this.syncState(); // try again on next raf
    }
  }

} // Register this widget type with its Factory

Splitter.initClass();
Splitter._$name = 'Splitter';

class TrialPanel extends Popup {
  static get configurable() {
    return {
      productId: null,
      storeEmail: false,
      width: 400,
      anchor: true,
      title: 'L{title}',
      align: {
        align: 't-b',
        constrainPadding: 20
      },
      defaults: {
        labelWidth: 100
      },
      items: [{
        type: 'textfield',
        localeClass: this,
        label: 'L{name} <sup>*</sup>',
        name: 'name',
        ref: 'nameField',
        required: true
      }, {
        type: 'textfield',
        inputType: 'email',
        localeClass: this,
        label: 'L{email} <sup>*</sup>',
        name: 'email',
        ref: 'emailField',
        required: true
      }, {
        type: 'textfield',
        localeClass: this,
        label: 'L{company} <sup>*</sup>',
        name: 'company',
        ref: 'companyField',
        required: true
      }, {
        type: 'combo',
        localeClass: this,
        label: 'L{product}',
        editable: false,
        ref: 'productField',
        name: 'productId',
        style: 'margin-bottom : 0',
        items: [{
          id: 'calendar',
          // no-sanity
          downloadId: 'calendar-vanilla',
          text: 'Bryntum Calendar'
        }, {
          id: 'gantt',
          // no-sanity
          downloadId: 'gantt-vanilla',
          text: 'Bryntum Gantt'
        }, {
          id: 'grid',
          // no-sanity
          downloadId: 'grid',
          text: 'Bryntum Grid'
        }, {
          id: 'scheduler',
          // no-sanity
          downloadId: 'scheduler-vanilla',
          text: 'Bryntum Scheduler'
        }, {
          id: 'schedulerpro',
          // no-sanity
          downloadId: 'schedulerpro',
          text: 'Bryntum Scheduler Pro'
        }, {
          id: 'taskboard',
          // no-sanity
          downloadId: 'taskboard-vanilla',
          text: 'Bryntum TaskBoard'
        }],
        required: true
      }, {
        type: 'textfield',
        inputType: 'hidden',
        ref: 'listNameField',
        name: 'listname'
      }, {
        type: 'textfield',
        inputType: 'hidden',
        ref: 'trackingField',
        name: 'custom meta_adtracking'
      }, {
        type: 'textfield',
        inputType: 'hidden',
        ref: 'redirectField',
        name: 'redirect'
      }, {
        type: 'textfield',
        inputType: 'hidden',
        name: 'meta_message',
        value: '1'
      }, {
        type: 'textfield',
        inputType: 'hidden',
        name: 'meta_required',
        value: 'name,email,custom company'
      }, {
        type: 'textfield',
        inputType: 'hidden',
        name: 'meta_forward_vars',
        value: '0'
      }],
      bbar: [{
        localeClass: this,
        text: 'L{cancel}',
        width: '12em',
        onClick: 'up.onCancelClick'
      }, {
        localeClass: this,
        text: 'L{submit}',
        width: '12em',
        cls: 'b-blue b-raised',
        onClick: 'up.onSubmitClick'
      }]
    };
  }

  get bodyConfig() {
    return this.storeEmail ? Object.assign(super.bodyConfig, {
      tag: 'form',
      method: 'post',
      target: 'aweberFrame',
      action: 'https://www.aweber.com/scripts/addlead.pl'
    }) : super.bodyConfig;
  }

  changeProductId(value) {
    this.widgetMap.productField.value = value;
  }

  async onSubmitClick() {
    const me = this;

    if (!me.isValid) {
      return;
    }

    if (me.storeEmail) {
      me.addToMailList();
    }

    await me.triggerDownload();
  }

  addToMailList() {
    const {
      trackingField,
      redirectField,
      listNameField,
      companyField
    } = this.widgetMap,
          {
      productId
    } = this.values;
    trackingField.value = BrowserHelper.getCookie('aw');
    redirectField.value = globalThis.location.href;
    companyField.input.name = 'custom company';

    switch (productId) {
      case 'gantt':
        listNameField.value = 'awlist5314739';
        break;

      case 'scheduler':
      case 'schedulerpro':
        listNameField.value = 'awlist5074881';
        break;

      case 'grid':
        listNameField.value = 'awlist5074883';
        break;

      case 'calendar':
        listNameField.value = 'awlist4475287';
        break;
    }

    this.bodyElement.submit();
  }

  async onCancelClick() {
    await this.hide();
  }

  async triggerDownload() {
    const me = this,
          {
      name,
      email,
      company
    } = me.values;
    let productId = me.values.productId;

    switch (productId) {
      case 'gantt':
      case 'scheduler':
      case 'taskboard':
      case 'calendar':
        productId = `${productId}-vanilla`;
        break;
    }

    const a = DomHelper.createElement({
      parent: document.body,
      tag: 'a',
      download: `bryntum-${productId}-trial.zip`,
      href: `/do_download.php?product_id=${productId}&thename=${name}&email=${email}&company=${company}`
    });
    a.click();
    a.parentElement.removeChild(a);
    await me.hide();
    Toast.show({
      html: me.L('L{downloadStarting}'),
      timeout: 15000
    });

    if (!me.gaScript && !VersionHelper.isTestEnv) {
      me.gaScript = DomHelper.createElement({
        parent: document.head,
        tag: 'script',
        src: 'https://www.googletagmanager.com/gtag/js?id=UA-11046863-1'
      });
      me.gaScript.addEventListener('load', me.trackDownload.bind(me));
    }
  } // Google Analytics

  trackDownload() {
    globalThis.dataLayer = globalThis.dataLayer || [];

    function gtag() {
      globalThis.dataLayer.push(arguments);
    } // gtag('consent', 'default', {
    //     ad_storage        : 'denied',
    //     analytics_storage : 'denied'
    // });

    gtag('event', 'conversion', {
      send_to: 'AW-1042491458/eweSCPibpAEQwtCM8QM',
      value: 1.0,
      currency: 'USD'
    });
    gtag('event', 'Trial download started', {
      value: 1.0,
      currency: 'USD'
    });
  }

} // Register this widget type with its Factory

_defineProperty(TrialPanel, "$name", 'TrialPanel');

_defineProperty(TrialPanel, "type", 'trialpanel');

TrialPanel.initClass();
TrialPanel._$name = 'TrialPanel';

/**
 * @module Core/widget/trial/TrialButton
 */

/**
 * Download trial button.
 *
 * @classType trialbutton
 * @extends Core/widget/Button
 * @internal
 */

class TrialButton extends Button {
  static get configurable() {
    return {
      /**
       * Product identifier.
       * @config {String}
       */
      productId: null,

      /**
       * Store emails using aweber mail list posting.
       * @config {Boolean}
       */
      storeEmail: false,
      hidden: !BrowserHelper.isBryntumOnline(['online', 'test']),
      cls: 'b-raised b-green',
      ref: 'downloadTrial',
      icon: 'b-fa-download',
      text: 'L{downloadTrial}',
      menuIcon: null
    };
  }

  construct(...args) {
    super.construct(...args);
    this.menu = new TrialPanel({
      autoShow: false,
      productId: this.productId,
      storeEmail: this.storeEmail
    });
  }

}

_defineProperty(TrialButton, "$name", 'TrialButton');

_defineProperty(TrialButton, "type", 'trialbutton');

TrialButton.initClass();
TrialButton._$name = 'TrialButton';

if (window && !window.bryntum) {
  window.bryntum = {};
} //region Core
 //endregion

export { BooleanCombo, CSSHelper, DataGenerator, DemoBot, FieldSet, FileField, FilePicker, Label, PagingToolbar, PasswordField, RadioGroup, SlideToggle, Splitter, TrialButton, TrialPanel, WidgetTag };
//# sourceMappingURL=core.module.thin.js.map
