/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { _defineProperty, Base, ObjectHelper, StringHelper } from './Editor.js';

/**
 * @module Core/widget/mixin/Responsive
 */

/**
 * A breakpoint definition. Used when defining breakpoints, see {@link #config-breakpoints}.
 *
 * ```javascript
 * {
 *     name    : 'Small',
 *     configs : {
 *         text  : null,
 *         color : 'b-blue'
 *     },
 *     callback() {
 *         console.log('Applied small');
 *     }
 * }
 * ```
 *
 * @typedef Breakpoint
 * @property {String} name Name of the breakpoint
 * @property {Object} [configs] An optional configuration object to apply to the widget when the breakpoint is activated
 * @property {Function} [callback] An optional callback, called when the breakpoint is activated
 */

/**
 * Mixin that simplifies adding responsive behaviour to widgets, by allowing them to define responsive
 * {@link #config-breakpoints} based on max-width/max-height.
 *
 * Each {@link #typedef-Breakpoint breakpoint} can contain configs that are applied to the widget and a callback called
 * when the breakpoint is activated.
 *
 * The mixin triggers an event when switching breakpoints, allowing the application to define its own behaviour. It also
 * uses the name of a breakpoint to apply a CSS class to Widget, for example `small` -> `b-breakpoint-small`.
 *
 * ```javascript
 * class ResponsiveButton extends Button.mixin(Responsive) {}
 *
 * const button = new ResponsiveButton({
 *     breakpoints : {
 *         width : {
 *             // When width drops to 50 or below, hide text and show icon
 *             50 : {
 *                 name    : 'small',
 *                 configs : { text : null, icon : 'b-fa b-fa-plus' },
 *                 callback() {
 *                     console.log('Applied small');
 *                 }
 *             },
 *             // When width is above 50, hide icon and show text
 *             '*' : {
 *                  name    : 'large',
 *                  configs : { text : 'Add', icon : null }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * @mixin
 */

var Responsive = (Target => {
  var _class;

  return _class = class Responsive extends (Target || Base) {
    changeBreakpoints(breakpoints) {
      ObjectHelper.assertObject(breakpoints, 'breakpoints'); // Normalize breakpoints

      if (breakpoints !== null && breakpoints !== void 0 && breakpoints.width) {
        Object.keys(breakpoints.width).forEach(key => {
          breakpoints.width[key].maxWidth = key;
        });
      }

      if (breakpoints !== null && breakpoints !== void 0 && breakpoints.height) {
        Object.keys(breakpoints.height).forEach(key => {
          breakpoints.height[key].maxHeight = key;
        });
      }

      return breakpoints;
    }

    updateBreakpoints(breakpoints) {
      if (breakpoints) {
        this.monitorResize = true;
      }
    } // Get a width/height breakpoint for the supplied dimension

    getBreakpoint(levels, dimension) {
      const // Breakpoints as reverse sorted array of numerical widths [NaN for *, 50, 100]
      ascendingLevels = Object.keys(levels).map(l => parseInt(l)).sort(),
            // Find first one larger than current width
      breakpoint = ascendingLevels.find(bp => dimension <= bp); // Return matched breakpoint or * if available and none matched

      return levels[breakpoint !== null && breakpoint !== void 0 ? breakpoint : levels['*'] && '*'];
    } // Apply a breakpoints configs, trigger event and call any callback

    activateBreakpoint(orientation, breakpoint) {
      const me = this,
            prevBreakpoint = me[`current${orientation}Breakpoint`];

      if (breakpoint !== prevBreakpoint) {
        var _breakpoint$callback, _me$recompose;

        me[`current${orientation}Breakpoint`] = breakpoint;
        me.setConfig(breakpoint.configs);
        prevBreakpoint && me.element.classList.remove(`b-breakpoint-${prevBreakpoint.name.toLowerCase()}`);
        me.element.classList.add(`b-breakpoint-${breakpoint.name.toLowerCase()}`);
        /**
         * Triggered when a new max-width based breakpoint is applied.
         * @event responsiveWidthChange
         * @param {Core.widget.Widget} source The widget
         * @param {Breakpoint} breakpoint The applied breakpoint
         * @param {Breakpoint} prevBreakpoint The previously applied breakpoint
         */

        /**
         * Triggered when a new max-height based breakpoint is applied.
         * @event responsiveHeightChange
         * @param {Core.widget.Widget} source The widget
         * @param {Breakpoint} breakpoint The applied breakpoint
         * @param {Breakpoint} prevBreakpoint The previously applied breakpoint
         */

        me.trigger(`responsive${orientation}Change`, {
          breakpoint,
          prevBreakpoint
        });
        (_breakpoint$callback = breakpoint.callback) === null || _breakpoint$callback === void 0 ? void 0 : _breakpoint$callback.call(breakpoint, {
          source: me,
          breakpoint,
          prevBreakpoint
        });
        (_me$recompose = me.recompose) === null || _me$recompose === void 0 ? void 0 : _me$recompose.call(me);
      }
    } // Called on resize to pick and apply a breakpoint, if size changed enough

    applyResponsiveness(width, height) {
      var _me$breakpoints;

      const me = this,
            {
        width: widths,
        height: heights
      } = (_me$breakpoints = me.breakpoints) !== null && _me$breakpoints !== void 0 ? _me$breakpoints : {};

      if (widths) {
        const breakpoint = me.getBreakpoint(widths, width);
        me.activateBreakpoint('Width', breakpoint);
      }

      if (heights) {
        const breakpoint = me.getBreakpoint(heights, height);
        me.activateBreakpoint('Height', breakpoint);
      }
    }

    onInternalResize(element, width, height, oldWidth, oldHeight) {
      super.onInternalResize(element, width, height, oldWidth, oldHeight);
      this.applyResponsiveness(width, height);
    }

  }, _defineProperty(_class, "$name", 'Responsive'), _defineProperty(_class, "configurable", {
    /**
     * Defines responsive breakpoints, based on max-width or max-height.
     *
     * When the widget is resized, the defined breakpoints are queried to find the closest larger or equal
     * breakpoint for both width and height. If the found breakpoint differs from the currently applied, it is
     * applied.
     *
     * Applying a breakpoint triggers an event that applications can catch to react to the change. It also
     * optionally applies a set of configs and calls a configured callback.
     *
     * ```javascript
     * breakpoints : {
     *     width : {
     *         50 : { name : 'small', configs : { text : 'Small', ... } }
     *         100 : { name : 'medium', configs : { text : 'Medium', ... } },
     *         '*' : { name : 'largem', configs : { text : 'Large', ... } }
     *     }
     * }
     * ```
     *
     * @config {Object}
     * @param {Object} width Max-width breakpoints, with keys as numerical widths (or '*' for larger widths than the
     * largest defined one) and the value as a {@link #typedef-Breakpoint breakpoint definition}
     * @param {Object} height Max-height breakpoints, with keys as numerical heights (or '*' for larger widths than
     * the largest defined one) and the value as a {@link #typedef-Breakpoint breakpoint definition}
     */
    breakpoints: null
  }), _class;
});

/**
 * @module Core/widget/mixin/Styleable
 */

/**
 * Mixin for widgets that allows manipulating CSS variables. Works by setting style properties of the target widgets
 * element.
 *
 * As part of configuration:
 *
 * ```javascript
 * const taskBoard = new TaskBoard({
 *    css : {
 *        cardBorderTop    : '5px solid currentColor',
 *        columnBackground : '#ddd'
 *    }
 * });
 * ```
 *
 * And/or at runtime:
 *
 * ```javascript
 * taskBoard.css.cardBackground = '#333';
 * ```
 *
 * @mixin
 */

var Styleable = (Target => {
  var _class;

  return _class = class Styleable extends (Target || Base) {
    changeCssVarPrefix(prefix) {
      ObjectHelper.assertString(prefix, 'prefix');

      if (prefix && !prefix.endsWith('-')) {
        prefix = prefix + '-';
      }

      return prefix || '';
    }

    changeCss(css) {
      ObjectHelper.assertObject(css, 'css');
      const me = this;

      if (!globalThis.Proxy) {
        throw new Error('Proxy not supported');
      }

      const proxy = new Proxy({}, {
        get(target, property) {
          var _styles$getPropertyVa;

          // TODO: Worth keeping the live css object? Or just overhead if not often used?
          const styles = getComputedStyle(me.element || document.documentElement);
          return (_styles$getPropertyVa = styles.getPropertyValue(`--${me.cssVarPrefix}${StringHelper.hyphenate(property)}`)) === null || _styles$getPropertyVa === void 0 ? void 0 : _styles$getPropertyVa.trim();
        },

        set(target, property, value) {
          const element = me.element || document.documentElement;
          element.style.setProperty(`--${me.cssVarPrefix}${StringHelper.hyphenate(property)}`, value);
          return true;
        }

      });

      if (css) {
        if (me._element) {
          ObjectHelper.assign(proxy, css);
        } else {
          me.$initialCSS = css;
        }
      }

      return proxy;
    } // Apply any initially supplied CSS when we have an element

    updateElement(element, ...args) {
      super.updateElement(element, ...args);

      if (this.$initialCSS) {
        ObjectHelper.assign(this.css, this.$initialCSS);
      }
    }

    get widgetClass() {}

  }, _defineProperty(_class, "$name", 'Styleable'), _defineProperty(_class, "configurable", {
    /**
     * CSS variable prefix, appended to the keys used in {@link #config-css}.
     *
     * For example:
     *
     * ```javascript
     * {
     *    cssVarPrefix : 'taskboard',
     *
     *    css : {
     *        cardBackground : '#333'
     *    }
     * }
     * ```
     *
     * Results in the css var `--taskboard-card-background` being set to `#333`.
     * @config {String}
     * @category CSS
     */
    cssVarPrefix: '',

    /**
     * Allows runtime manipulating of CSS variables.
     *
     * See {@link #config-css} for more information.
     *
     * ```javascript
     * taskBoard.css.columnBackground = '#ccc';
     *
     * // Will set "--taskboard-column-background : #ccc"
     * ```
     *
     * @member {Proxy} css
     * @category DOM
     */

    /**
     * Initial CSS variables to set.
     *
     * Each key will be applied as a CSS variable to the target elements style. Key names are hyphenated and
     * prefixed with {@link #config-cssVarPrefix} in the process. For example:
     *
     * ```javascript
     * {
     *    cssVarPrefix : 'taskboard',
     *
     *    css : {
     *        cardBackground : '#333'
     *    }
     * }
     * ```
     *
     * Results in the css var `--taskboard-card-background` being set to `#333`.
     *
     * @config {Object}
     * @category CSS
     */
    css: {}
  }), _class;
});

export { Responsive, Styleable };
//# sourceMappingURL=Styleable.js.map
