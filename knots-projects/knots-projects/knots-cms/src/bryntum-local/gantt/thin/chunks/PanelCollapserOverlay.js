/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { Delayable, DomClassList, EventHelper, Rectangle, Widget, PanelCollapser, Animator, DomHelper, _objectSpread2, ObjectHelper } from './Editor.js';
import { DragProxy } from './AvatarRendering.js';

/**
 * @module Core/mixin/Hoverable
 */

const EDGES = {
  e: 'b-hover-edge',
  t: 'b-hover-top',
  r: 'b-hover-right',
  b: 'b-hover-bottom',
  l: 'b-hover-left'
},
      EDGE_CLASSES = {
  [EDGES.e]: 1,
  [EDGES.t]: 1,
  [EDGES.r]: 1,
  [EDGES.b]: 1,
  [EDGES.l]: 1
},
      ZONES = {
  t: [EDGES.e, EDGES.t],
  r: [EDGES.e, EDGES.r],
  b: [EDGES.e, EDGES.b],
  l: [EDGES.e, EDGES.l],
  tr: [EDGES.e, EDGES.t, EDGES.r],
  bl: [EDGES.e, EDGES.b, EDGES.l],
  tl: [EDGES.e, EDGES.t, EDGES.l],
  br: [EDGES.e, EDGES.b, EDGES.r]
};
/**
 * This mixin provides mouse hover tracking.
 * ```
 *  class Tracker extends Base.mixin(Hoverable) {
 *      hoverEnter(leaving) {
 *          // this.hoverTarget has been entered from "leaving"
 *          // this.hoverTarget will never be null, but leaving may be null
 *      }
 *
 *      hoverLeave(leaving) {
 *          // this.hoverTarget has been entered from "leaving"
 *          // this.hoverTarget may be null, but leaving will never be null
 *      }
 *
 *      hoverMove(event) {
 *          // called when a mousemove is made within a hover target
 *          // this.hoverTarget will never be null
 *      }
 *  }
 *
 *  let tracker = new Tracker({
 *      hoverRootElement : document.body,
 *      hoverSelector    : '.hoverable'
 *  });
 * ```
 * @mixin
 * @internal
 */

var Hoverable = (Target => class Hoverable extends Target.mixin(Delayable) {
  static get $name() {
    return 'Hoverable';
  } //region Configs

  static get configurable() {
    return {
      /**
       * A CSS class to add to the {@link #config-hoverTarget target} element.
       * @config {String}
       */
      hoverCls: null,

      /**
       * A CSS class to add to the {@link #config-hoverTarget target} element to enable CSS animations. This class
       * is added after calling {@link #function-hoverEnter}.
       * @config {String}
       */
      hoverAnimationCls: null,

      /**
       * A CSS class to add to the {@link #config-hoverRootElement root} element.
       * @config {String}
       */
      hoverRootCls: null,

      /**
       * A CSS class to add to the {@link #config-hoverRootElement root} element when there is an active
       * {@link #config-hoverTarget target}.
       * @config {String}
       */
      hoverRootActiveCls: null,

      /**
       * The number of milliseconds to delay notification of changes in the {@link #config-hoverTarget}.
       * @config {Number}
       */
      hoverDelay: null,

      /**
       * The current element that the cursor is inside as determined by `mouseover` and `mouseout`. Changes in
       * this config trigger re-evaluation of the {@link #config-hoverSelector} to determine if there is a
       * {@link #config-hoverTarget}.
       * @config {HTMLElement}
       * @private
       */
      hoverElement: null,

      /**
       * An element to ignore. Mouse entry into this element will not trigger a change in either of the
       * {@link #config-hoverElement} or {@link #config-hoverTarget} values.
       * @config {HTMLElement}
       */
      hoverIgnoreElement: null,

      /**
       * This property is a string containing one character for each edge that is hoverable. For example, a
       * value of "tb" indicates that the top and bottom edges are hoverable.
       * @config {String}
       */
      hoverEdges: null,

      /**
       * When {@link #config-hoverEdges} is used, this value determines the size (in pixels) of the edge. When
       * the cursor is within this number of pixels of an edge listed in `hoverEdges`, the appropriate CSS class
       * is added to the {@link #config-hoverTarget}:
       *
       *  - `b-hover-top`
       *  - `b-hover-right`
       *  - `b-hover-bottom`
       *  - `b-hover-left`
       *
       * Depending on the values of `hoverEdges`, it is possible to have at most two of these classes present at
       * any one time (when the cursor is in a corner).
       * @config {Number}
       * @default
       */
      hoverEdgeSize: 10,

      /**
       * The outer element where hover tracking will operate (attach events to it and use as root limit when
       * looking for ancestors).
       *
       * A common choice for this will be `document.body`.
       * @config {HTMLElement}
       */
      hoverRootElement: {
        $config: 'nullify',
        value: null
      },

      /**
       * A selector for the [closest](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest) API to
       * determine the actual element of interest. This selector is used to process changes to the
       * {@link #config-hoverElement} to determine the {@link #config-hoverTarget}.
       * @config {String}
       */
      hoverSelector: null,

      /**
       * The currently active hover target. This will be the same as {@link #config-hoverElement} unless there is
       * a {@link #config-hoverSelector}.
       * @config {HTMLElement}
       */
      hoverTarget: {
        $config: 'nullify',
        value: null
      },

      /**
       * Set to `true` to include tracking of `mousemove` events for the active {@link #config-hoverTarget}. This
       * is required for the {@link #function-hoverMove} method to be called.
       * @config {Boolean}
       * @default false
       */
      hoverTrack: null,

      /**
       * A string value containing one character per active edge (e.g., "tr").
       * @config {String}
       * @private
       */
      hoverZone: null
    };
  }

  static get delayable() {
    return {
      setHoverTarget: 0
    };
  } //endregion
  //region State Handling

  /**
   * This method is called when the cursor enters the {@link #config-hoverTarget}. The `hoverTarget` will not be
   * `null`.
   * @param {HTMLElement} leaving The element that was previously the `hoverTarget`. This value may be null.
   */

  hoverEnter(leaving) {// template
  }
  /**
   * This method should return true if the given `element` should be ignored. By default, this is `true` if the
   * `element` is contained inside the {@link #config-hoverIgnoreElement}.
   * @param {HTMLElement} element
   * @returns {Boolean}
   * @protected
   */

  hoverIgnore(element) {
    var _this$hoverIgnoreElem;

    return (_this$hoverIgnoreElem = this.hoverIgnoreElement) === null || _this$hoverIgnoreElem === void 0 ? void 0 : _this$hoverIgnoreElem.contains(element);
  }
  /**
   * This method is called when the cursor leaves the {@link #config-hoverTarget}. The `hoverTarget` may be `null`
   * or refer to the new `hoverTarget`
   * @param {HTMLElement} leaving The element that was previously the `hoverTarget`. This value will not be null.
   */

  hoverLeave(leaving) {// template
  }
  /**
   * This method is called when the mouse moves within a {@link #config-hoverTarget}, but only if enabled by the
   * {@link #config-hoverTrack} config.
   * @param {Event} event
   */

  hoverMove(event) {// template
  } //endregion
  //region Events

  onHoverMouseMove(event) {
    const me = this,
          {
      hoverEdges,
      hoverEdgeSize,
      hoverTarget
    } = me;

    if (hoverTarget) {
      if (hoverEdges) {
        const {
          top,
          left,
          width,
          height,
          right,
          bottom
        } = hoverTarget.getBoundingClientRect(),
              {
          clientX,
          clientY
        } = event,
              centerX = left + width / 2,
              centerY = top + height / 2,
              t = clientY < (hoverEdgeSize ? top + hoverEdgeSize : centerY),
              r = clientX >= (hoverEdgeSize ? right - hoverEdgeSize : centerX),
              b = clientY >= (hoverEdgeSize ? bottom - hoverEdgeSize : centerY),
              l = clientX < (hoverEdgeSize ? left + hoverEdgeSize : centerX),
              tb = t || b ? t ? 't' : 'b' : '',
              rl = r || l ? r ? 'r' : 'l' : '';
        me.hoverZone = (hoverEdges.includes(tb) ? tb : '') + (hoverEdges.includes(rl) ? rl : '');
      }

      me.hoverEvent = event;
      me.hoverTrack && me.hoverMove(event);
    }
  }

  onHoverMouseOver(event) {
    this.hoverEvent = event;
    this.hoverElement = event.target;
  }

  onHoverMouseOut(event) {
    this.hoverEvent = event;
    this.hoverElement = event.relatedTarget;
  } //endregion
  //region Configs
  // hoverDelay

  updateHoverDelay(delay) {
    this.setHoverTarget.delay = delay;
  } // hoverEdges

  changeHoverEdges(edges) {
    return edges === true ? 'trbl' : (edges || '').replace('v', 'tb').replace('h', 'lr');
  }

  updateHoverEdges() {
    this.syncHoverListeners();
  } // hoverElement

  changeHoverElement(element) {
    if (!this.hoverIgnore(element)) {
      return element;
    }
  }

  updateHoverElement(hoverEl) {
    const {
      hoverSelector
    } = this;

    if (hoverSelector) {
      var _hoverEl;

      hoverEl = (_hoverEl = hoverEl) === null || _hoverEl === void 0 ? void 0 : _hoverEl.closest(hoverSelector);
    }

    this.setHoverTarget(hoverEl); // this may be delayed
  } // hoverRootElement

  updateHoverRootElement(rootEl, was) {
    const {
      hoverRootCls
    } = this;

    if (hoverRootCls) {
      was === null || was === void 0 ? void 0 : was.classList.remove(hoverRootCls);
      rootEl === null || rootEl === void 0 ? void 0 : rootEl.classList.add(hoverRootCls);
    }

    this.syncHoverListeners();
  } // hoverTarget

  changeHoverTarget(hoverEl, was) {
    if (was) {
      this.hoverZone = null;
    }

    return hoverEl;
  }

  updateHoverTarget(hoverEl, was) {
    const me = this,
          {
      hoverCls,
      hoverAnimationCls,
      hoverRootActiveCls,
      hoverRootElement
    } = me;

    if (hoverRootActiveCls) {
      hoverRootElement === null || hoverRootElement === void 0 ? void 0 : hoverRootElement.classList[hoverEl ? 'add' : 'remove'](hoverRootActiveCls);
    }

    if (was) {
      hoverCls && was.classList.remove(hoverCls);
      hoverAnimationCls && was.classList.remove(hoverAnimationCls);
      me.hoverLeave(was);
    }

    if (hoverEl) {
      hoverCls && hoverEl.classList.add(hoverCls);
      me.hoverEnter(was);

      if (me.hoverTrack) {
        me.hoverMove(me.hoverEvent);
      }

      if (hoverAnimationCls) {
        hoverEl.getBoundingClientRect(); // force layout so next change starts animation

        hoverEl.classList.add(hoverAnimationCls);
      }
    }
  } // hoverTrack

  updateHoverTrack() {
    this.syncHoverListeners();
  } // hoverZone

  updateHoverZone(zone) {
    const {
      hoverAnimationCls,
      hoverTarget
    } = this;

    if (hoverTarget) {
      const {
        className
      } = hoverTarget,
            cls = DomClassList.change(className,
      /* add= */
      zone ? ZONES[zone] : null,
      /* remove= */
      EDGE_CLASSES);

      if (className !== cls) {
        hoverTarget.className = cls;

        if (zone && hoverAnimationCls) {
          hoverTarget.classList.remove(hoverAnimationCls);
          hoverTarget.getBoundingClientRect(); // force layout so next change starts animation

          hoverTarget.classList.add(hoverAnimationCls);
        }
      }
    }
  } //endregion
  //region Misc

  setHoverTarget(target) {
    // this method runs later based on the hoverDelay
    this.hoverTarget = target;
  }

  syncHoverListeners() {
    var _me$_hoverRootDetache;

    const me = this,
          element = me.hoverRootElement,
          listeners = {
      element,
      thisObj: me,
      mouseover: 'onHoverMouseOver',
      mouseout: 'onHoverMouseOut'
    };

    if (me.hoverTrack || me.hoverEdges) {
      listeners.mousemove = 'onHoverMouseMove';
    }

    (_me$_hoverRootDetache = me._hoverRootDetacher) === null || _me$_hoverRootDetache === void 0 ? void 0 : _me$_hoverRootDetache.call(me);
    me._hoverRootDetacher = element && EventHelper.on(listeners);
  } //endregion

});

/**
 * @module Core/util/drag/DragTipProxy
 */

/**
 * This drag proxy manages a {@link #config-tooltip} (or derived class) and aligns the tooltip to the current drag
 * position adjusted by the {@link #config-align} config.
 * @extends Core/util/drag/DragProxy
 * @classtype tip
 * @internal
 */

class DragTipProxy extends DragProxy {
  static get type() {
    return 'tip';
  }

  static get configurable() {
    return {
      /**
       * Controls how the tooltip will be aligned to the current drag position.
       *
       * See {@link Core.helper.util.Rectangle#function-alignTo} for details.
       * @config {String}
       * @default
       */
      align: 't10-b50',

      /**
       * The number of pixels to offset from the drag position.
       * @config {Number}
       * @default
       */
      offset: 20,

      /**
       * The tooltip to be shown, hidden and repositioned to track the drag position.
       * @config {Core.widget.Tooltip}
       */
      tooltip: {
        $config: ['lazy', 'nullify'],
        value: {
          type: 'tooltip'
        }
      }
    };
  }

  open() {
    this.getConfig('tooltip'); // trigger creation
  }

  close() {
    var _this$tooltip;

    (_this$tooltip = this.tooltip) === null || _this$tooltip === void 0 ? void 0 : _this$tooltip.hide();
  }

  dragMove(drag) {
    const {
      offset,
      tooltip
    } = this,
          {
      event
    } = drag;

    if (tooltip) {
      if (!tooltip.isVisible) {
        tooltip.show();
      }

      tooltip.alignTo({
        align: this.align,
        target: new Rectangle(event.clientX - offset, event.clientY - offset, offset * 2, offset * 2)
      });
    }
  }

  changeTooltip(config, existing) {
    return Widget.reconfigure(existing, config,
    /* owner = */
    this);
  }

}
DragTipProxy.initClass();
DragTipProxy._$name = 'DragTipProxy';

/**
 * @module Core/widget/panel/PanelCollapserOverlay
 */

const {
  dockIsHorz
} = PanelCollapser.maps,
      clipByDir = {
  up: ['top', 'bottom'],
  right: ['right', 'left'],
  down: ['bottom', 'top'],
  left: ['left', 'right']
},
      collapseExposeEdge = {
  top: 0,
  down: 0,
  left: 1,
  bottom: 2,
  up: 2,
  right: 3
},
      emptyObject = {},
      translateByDir = {
  up: {
    from: `translate(0,0)`,
    to: 'translate(0,-100%)'
  },
  down: {
    from: `translate(0,0)`,
    to: 'translate(0,100%)'
  },
  left: {
    from: `translate(0,0)`,
    to: 'translate(-100%,0)'
  },
  right: {
    from: `translate(0,0)`,
    to: 'translate(100%,0)'
  }
};
/**
 * A panel collapse implementation that adds the ability to reveal the collapsed panel as a floating overlay.
 * @extends Core/widget/panel/PanelCollapser
 * @classtype overlay
 */

class PanelCollapserOverlay extends PanelCollapser.mixin(Delayable) {
  static get $name() {
    return 'PanelCollapserOverlay';
  }

  static get type() {
    return 'overlay';
  }

  static get configurable() {
    return {
      /**
       * The number of milliseconds to wait once the mouse leaves a {@link Core.widget.Panel#config-revealed}
       * panel before returning to an unrevealed state. Clicking outside the revealed panel will immediately
       * return the panel to its collapsed state.
       *
       * This may be disabled by configuring {@link #config-autoClose} as `null`.
       *
       * If this value is negative, the panel will not automatically recollapse due to the mouse leaving, however,
       * clicks outside the panel will still recollapse it.
       *
       * If this value is `null`, the panel will not automatically recollapse for either outside clicks or if
       * the mouse leaves the panel.
       * @config {Number}
       * @default
       */
      autoCloseDelay: 1000,

      /**
       * By default, clicking outside the revealed overlay hides the revealed overlay.
       *
       * If the revealed overlay was shown using the {@link #property-recollapseTool}
       * then moving the mouse outside of the revealed overlay hides the revealed overlay.
       *
       * Configure this as `false` to disable auto hiding, making overlayed
       * state permanent, and changeable using the {@link #function-toggleReveal} method.
       * @config {Boolean}
       * @default
       */
      autoClose: true,
      revealing: {
        value: null,
        $config: null,
        default: false
      },

      /**
       * The reveal/hide tool which slides the collapsed panel over the top of the UI.
       * @member {Core.widget.Tool} recollapseTool
       */

      /**
       * The reveal/hide tool which slides the collapsed panel over the top of the UI.
       *
       * The `type` of this instance should not be changed but the tool instance can be
       * configured in other ways via this config property.
       * @config {Object|Core.widget.Tool}
       */
      recollapseTool: {
        type: 'collapsetool',
        cls: 'b-recollapse',
        collapsify: 'overlay',

        handler() {
          var _this$collapsible;

          // NOTE: As a tool, our this pointer is the Panel so we use it to access the current collapser
          (_this$collapsible = this.collapsible) === null || _this$collapsible === void 0 ? void 0 : _this$collapsible.toggleReveal();
        }

      }
    };
  }

  static get delayable() {
    return {
      doAutoClose: 0
    };
  }

  doAutoClose() {
    this.toggleReveal(false);
  }

  updateAutoCloseDelay(delay) {
    const {
      doAutoClose
    } = this;

    if (!(doAutoClose.suspended = delay == null || delay < 0)) {
      doAutoClose.delay = delay;
      doAutoClose.immediate = !delay;
    }
  }

  changeRecollapseTool(tool) {
    const me = this,
          {
      panel
    } = me;

    if (me.isConfiguring || me.isDestroying || !panel || panel.isDestroying) {
      return tool;
    }

    panel.tools = {
      recollapse: tool
    };
  }

  beforeCollapse(operation) {
    if (super.beforeCollapse(operation) === false) {
      return false;
    }

    if (this.panel.revealed) {
      operation.animation = null;
    }
  }

  applyHeaderDock(collapsed, flush = true) {
    var _this$panel;

    (_this$panel = this.panel) === null || _this$panel === void 0 ? void 0 : _this$panel.recompose();
    super.applyHeaderDock(collapsed, flush);
  }

  collapseBegin(operation) {
    const me = this,
          {
      collapseDir,
      innerElement
    } = me,
          {
      animation
    } = operation,
          {
      collapseTool,
      panel
    } = me;
    me.configuredWidth = panel._lastWidth;
    me.configuredHeight = panel._lastHeight;
    me.applyHeaderDock(true);
    const innerElementRect = me.lockInnerSize();
    collapseTool === null || collapseTool === void 0 ? void 0 : collapseTool.element.classList.add('b-collapsed');

    if (animation) {
      panel.element.classList.add('b-collapsing');
      innerElementRect.moveTo(0, 0);
      const innerElementClipRect = innerElementRect.clone(),
            clipDir = clipByDir[collapseDir];
      innerElementClipRect[clipDir[0]] = innerElementClipRect[clipDir[1]];
      animation.element = me.innerElement;
      animation.transform = translateByDir[collapseDir];
      animation.items = [{
        element: innerElement,
        clip: {
          from: `rect(${innerElementRect})`,
          to: `rect(${innerElementClipRect})`
        }
      }];
      operation.animation = Animator.run(animation);
    }
  }

  onComplete(action) {
    var _me$autoCloseLeaveDet, _me$autoCloseClickDet;

    super.onComplete(action);
    const me = this,
          {
      panel
    } = me,
          {
      element
    } = panel;
    me.autoCloseLeaveDetacher = (_me$autoCloseLeaveDet = me.autoCloseLeaveDetacher) === null || _me$autoCloseLeaveDet === void 0 ? void 0 : _me$autoCloseLeaveDet.call(me);
    me.autoCloseClickDetacher = (_me$autoCloseClickDet = me.autoCloseClickDetacher) === null || _me$autoCloseClickDet === void 0 ? void 0 : _me$autoCloseClickDet.call(me); // The act of hiding the revealed panel ("unrevealing") causes a mouseleave event (once the panel slides out
    // from under the cursor) and that starts the autoClose timer. If the user then reveals the panel again within
    // the 1sec delay (by default), the autoClose timer will still fire and unreveal the panel.

    me.doAutoClose.cancel();

    if (action === 'reveal' && me.autoClose) {
      // Only listen for mouseleave to close if we contain focus.
      // If we do not, then we have been revealed using the API from some other
      // part of the UI, so mouseleave closing would not be appropriate.
      if (panel.containsFocus) {
        me.autoCloseLeaveDetacher = EventHelper.on({
          element,
          mouseenter: ev => {
            me.doAutoClose.cancel();
          },
          mouseleave: ev => {
            me.doAutoClose();
          }
        });
      }

      me.autoCloseClickDetacher = EventHelper.on({
        element: document.body,
        mousedown: ev => {
          if (ev.target !== element && !element.contains(ev.target) && me.autoCloseDelay != null) {
            var _panel$focusInEvent;

            // Detect the UI element which invoked the reveal.
            // If the panel contains focus, use the "from" element.
            // If not, then the focus is still on the invoking element.
            const invokingElement = panel.containsFocus ? (_panel$focusInEvent = panel.focusInEvent) === null || _panel$focusInEvent === void 0 ? void 0 : _panel$focusInEvent.relatedTarget : DomHelper.getActiveElement(element);

            if (!invokingElement.contains(ev.target)) {
              me.doAutoClose.now();
            }
          }
        }
      });
    }
  }

  expandBegin(operation) {
    const me = this,
          {
      animation
    } = operation,
          {
      collapseDir,
      collapseTool,
      innerElement,
      panel
    } = me,
          {
      element
    } = panel;
    element.classList.remove('b-collapsed', 'b-collapsing');
    me.restoreConfiguredSize();
    me.lockInnerSize(false); // unlock the bodyWrap size

    const toRect = me.lockInnerSize().moveTo(0, 0),
          clipRect = toRect.clone(),
          clipDir = clipByDir[collapseDir];
    collapseTool === null || collapseTool === void 0 ? void 0 : collapseTool.element.classList.remove('b-collapsed');

    if (animation) {
      element.classList.add('b-collapsed', 'b-expanding');
      clipRect[clipDir[0]] = clipRect[clipDir[1]];
      animation.element = innerElement;
      animation.transform = {
        from: translateByDir[collapseDir].to,
        to: translateByDir[collapseDir].from
      };
      animation.clip = {
        from: `rect(${clipRect})`,
        to: `rect(${toRect})`
      };
      operation.animation = Animator.run(animation);
    }
  }

  expandEnd(operation) {
    super.expandEnd(operation);
    const {
      panel
    } = this;

    if (operation.completed) {
      panel.revealed = false;
    }

    panel.element.classList.remove('b-expanding');
  }

  expandRevert(operation) {
    super.expandRevert(operation);
    this.panel.element.classList.add('b-expanding');
  }

  get innerElement() {
    return this.panel.overlayElement;
  }

  get innerSizeElement() {
    return this.panel.element;
  }

  get toolsConfig() {
    const me = this,
          {
      direction
    } = me,
          config = super.toolsConfig,
          tool = me.recollapseTool;

    if (tool) {
      return _objectSpread2(_objectSpread2({}, config), {}, {
        recollapse: tool && ObjectHelper.assign({
          direction: direction.toLowerCase()
        }, tool)
      });
    }

    return config;
  }

  lockInnerSize(lock = true) {
    const me = this,
          {
      panel
    } = me,
          panelRect = lock && panel.rectangle(),
          // must read this before we call super
    inset = lock ? [0, 0, 0, 0] : '',
          // now we can call super:
    innerRect = super.lockInnerSize(lock); // The panel overlay is visible because we switch to "overflow:visible" in collapsed state. By doing this,
    // however, the header animation undesirably escapes as well. Fortunately, we can use the clip-path to hide
    // this by only allowing the desired side to escape while all other sides remain clipped. Even more fortunate
    // for us is that clip-path is expressed as an inset from the normal rectangle of the element (so we don't
    // need to adjust it if the collapsed panel is resized), and further, unlike CSS path style, clip-path works
    // for all elements not only absolutely positioned ones.

    if (lock) {
      // TODO see if there's a way to read the box-shadow style to pick up the right value (10 is the default)
      inset[collapseExposeEdge[me.collapseDir]] = `-${panelRect[me.collapseDim] + 10}px`;
    }

    panel.element.style.clipPath = lock ? `inset(${inset.join(' ')}` : '';
    return innerRect;
  }

  onOverlayTransitionDone(ev) {
    const me = this,
          {
      panel
    } = me;

    if (ev.srcElement === panel.overlayElement && me.revealing) {
      me.revealing = false;
      me.onComplete(panel.revealed ? 'reveal' : 'unreveal');
    }
  }

  onRevealerClick() {
    this.toggleReveal();
  }

  splitHeaderItems({
    as,
    dock
  } = emptyObject) {
    var _this$panel2;

    return (_this$panel2 = this.panel) === null || _this$panel2 === void 0 ? void 0 : _this$panel2.splitHeaderItems({
      as,
      dock,
      overlay: true
    });
  }
  /**
   * Toggles the revealed state of the Panel to match the passed boolean flag.
   * @param {Boolean} state `true` to reveal the overlay, `false` to hide it.
   */

  toggleReveal(state) {
    const {
      panel
    } = this;

    if (panel.collapsed) {
      if (state == null) {
        state = !panel.revealed;
      }

      if (panel.revealed !== state) {
        this.revealing = true;
        panel.revealed = !panel.revealed;
      }
    }
  }

  updateRevealing(value) {
    const me = this,
          horzDirRe = /left|right/i,
          {
      panel
    } = me,
          dim = horzDirRe.test(me.collapseDir) ? 'height' : 'width';

    if (panel) {
      me.innerElement.style[dim] = panel.rectangle()[dim] + 'px';
      panel.element.classList[value ? 'add' : 'remove']('b-panel-overlay-revealing');
    }
  }

  wrapCollapser(key, body) {
    var _panel$tools;

    const me = this,
          {
      collapseDir,
      panel
    } = me,
          {
      expandedHeaderDock,
      header,
      uiClassList
    } = panel,
          recollapse = (_panel$tools = panel.tools) === null || _panel$tools === void 0 ? void 0 : _panel$tools.recollapse,
          [before, after] = me.splitHeaderItems({
      dock: me.collapseDock,
      as: 'element'
    }),
          horz = dockIsHorz[expandedHeaderDock],
          title = panel.hasHeader ? panel.title || (header === null || header === void 0 ? void 0 : header.title) || '\xA0' : null;

    if (recollapse) {
      recollapse.direction = collapseDir;
    }

    return ['overlayElement', {
      class: _objectSpread2(_objectSpread2({}, uiClassList), {}, {
        [`b-panel-overlay-header-${expandedHeaderDock}`]: 1,
        [`b-panel-overlay-${collapseDir}`]: 1,
        [`b-${horz ? 'h' : 'v'}box`]: 1,
        'b-panel-overlay': 1,
        'b-box-center': 1
      }),
      listeners: {
        transitionend: ev => me.onOverlayTransitionDone(ev)
      },
      children: {
        overlayHeaderElement: title && {
          tag: 'header',
          class: _objectSpread2(_objectSpread2({}, uiClassList), {}, {
            [`b-dock-${expandedHeaderDock}`]: 1,
            'b-panel-header': 1,
            'b-panel-overlay-header': 1
          }),
          children: [...before, {
            reference: 'overlayTitleElement',
            html: title,
            class: _objectSpread2(_objectSpread2({}, uiClassList), {}, {
              [`b-align-${(header === null || header === void 0 ? void 0 : header.titleAlign) || 'start'}`]: 1,
              'b-header-title': 1
            })
          }, ...after]
        },
        [key]: body
      }
    }];
  }

} // Register this widget type with its Factory

PanelCollapserOverlay.initClass();
PanelCollapserOverlay._$name = 'PanelCollapserOverlay';

export { DragTipProxy, Hoverable, PanelCollapserOverlay };
//# sourceMappingURL=PanelCollapserOverlay.js.map
