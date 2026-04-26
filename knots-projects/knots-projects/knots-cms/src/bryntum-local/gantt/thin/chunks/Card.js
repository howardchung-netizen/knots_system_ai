/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { Field, EventHelper, DateHelper, Widget, ObjectHelper, Layout } from './Editor.js';
import { TimeField } from './LocalizableComboItems.js';

/**
 * @module Core/widget/DateTimeField
 */

/**
 * A field combining a {@link Core.widget.DateField} and a {@link Core.widget.TimeField}.
 *
 * @extends Core/widget/Field
 * @classtype datetimefield
 * @inlineexample Core/widget/DateTimeField.js
 */

class DateTimeField extends Field {
  static get configurable() {
    return {
      /**
       * Returns the TimeField instance
       * @readonly
       * @member {Core.widget.TimeField} timeField
       */

      /**
       * Configuration for {@link Core.widget.TimeField}
       * @config {Object}
       */
      timeField: {},

      /**
       * Returns the DateField instance
       * @readonly
       * @member {Core.widget.DateField} dateField
       */

      /**
       * Configuration for {@link Core.widget.DateField}
       * @config {Object}
       */
      dateField: {
        // To be able to use transformDateValue for parsing without loosing time, a bit of a hack
        keepTime: true,
        step: '1 d'
      },

      /**
       * The week start day in the {@link Core.widget.DateField#config-picker}, 0 meaning Sunday, 6 meaning Saturday.
       * Uses localized value per default.
       *
       * @config {Number}
       */
      weekStartDay: null,
      inputTemplate: () => '',
      ariaElement: 'element'
    };
  }

  static get $name() {
    return 'DateTimeField';
  }

  static get type() {
    return 'datetimefield';
  } // Factoryable type alias

  static get alias() {
    return 'datetime';
  }

  get focusElement() {
    return this.dateField.input;
  } // Implementation needed at this level because it has two inner elements in its inputWrap

  get innerElements() {
    return [this.dateField.element, this.timeField.element];
  } // Each subfield handles its own keystrokes

  internalOnKeyEvent() {} // CellEdit sets this dynamically on its editor field

  updateRevertOnEscape(revertOnEscape) {
    this.timeField.revertOnEscape = revertOnEscape;
    this.dateField.revertOnEscape = revertOnEscape;
  } // Converts the timeField config into a TimeField

  changeTimeField(config) {
    const me = this,
          result = TimeField.new({
      revertOnEscape: me.revertOnEscape,

      syncInvalid(...args) {
        const updatingInvalid = me.updatingInvalid;
        TimeField.prototype.syncInvalid.apply(this, args);
        me.timeField && !updatingInvalid && me.syncInvalid();
      }

    }, config);
    EventHelper.on({
      element: result.element,
      keydown: 'onTimeFieldKeyDown',
      thisObj: me
    }); // Must set *after* construction, otherwise it becomes the default state
    // to reset readOnly back to

    if (me.readOnly) {
      result.readOnly = true;
    }

    return result;
  } // Set up change listener when TimeField is available. Not in timeField config to enable users to supply their own
  // listeners block there

  updateTimeField(timeField) {
    const me = this;
    timeField.on({
      change({
        userAction,
        value
      }) {
        if (userAction && !me.$settingValue) {
          const dateAndTime = me.dateField.value;
          me._isUserAction = true;
          me.value = dateAndTime ? DateHelper.copyTimeValues(dateAndTime, value) : null;
          me._isUserAction = false;
        }
      },

      thisObj: me
    });
  } // Converts the dateField config into a class based on { type : "..." } provided (DateField by default)

  changeDateField(config) {
    const me = this,
          type = (config === null || config === void 0 ? void 0 : config.type) || 'datefield',
          cls = Widget.resolveType(config.type || 'datefield'),
          result = Widget.create(ObjectHelper.assign({
      type,
      revertOnEscape: me.revertOnEscape,

      syncInvalid(...args) {
        const updatingInvalid = me.updatingInvalid;
        cls.prototype.syncInvalid.apply(this, args);
        me.dateField && !updatingInvalid && me.syncInvalid();
      }

    }, config));
    EventHelper.on({
      element: result.element,
      keydown: 'onDateFieldKeyDown',
      thisObj: me
    }); // Must set *after* construction, otherwise it becomes the default state
    // to reset readOnly back to

    if (me.readOnly) {
      result.readOnly = true;
    }

    result.on({
      keydown: ({
        event
      }) => {
        var _this$timeField;

        if (event.key === 'Tab' && !event.shiftKey && (_this$timeField = this.timeField) !== null && _this$timeField !== void 0 && _this$timeField.isVisible) {
          event.stopPropagation();
          event.cancelBubble = true;
        }
      }
    });
    return result;
  }

  get childItems() {
    return [this.dateField, this.timeField];
  } // Set up change listener when DateField is available. Not in dateField config to enable users to supply their own
  // listeners block there

  updateDateField(dateField) {
    const me = this;
    dateField.on({
      change({
        userAction,
        value
      }) {
        if (userAction && !me.$isInternalChange) {
          me._isUserAction = true;

          if (!me.timeField.value) {
            me.timeField.value = value;
          }

          me.value = value;
          me._isUserAction = false;
        }
      },

      thisObj: me
    });
  }

  updateWeekStartDay(weekStartDay) {
    if (this.dateField) {
      this.dateField.weekStartDay = weekStartDay;
    }
  }

  changeWeekStartDay(value) {
    var _this$dateField$weekS, _this$dateField;

    return typeof value === 'number' ? value : (_this$dateField$weekS = (_this$dateField = this.dateField) === null || _this$dateField === void 0 ? void 0 : _this$dateField.weekStartDay) !== null && _this$dateField$weekS !== void 0 ? _this$dateField$weekS : DateHelper.weekStartDay;
  } // Apply our value to our underlying fields

  syncInputFieldValue(skipHighlight = this.isConfiguring) {
    super.syncInputFieldValue(true);
    const me = this,
          {
      dateField,
      timeField
    } = me,
          highlightDate = dateField.highlightExternalChange,
          highlightTime = timeField.highlightExternalChange;

    if (!skipHighlight && !me.highlightExternalChange) {
      skipHighlight = true;
    }

    me.$isInternalChange = true;
    dateField.highlightExternalChange = false; // Prevent dateField from keeping its time value
    // TODO: Should be doable without this hack

    dateField.value = null;
    dateField.highlightExternalChange = highlightDate;

    if (skipHighlight) {
      timeField.highlightExternalChange = dateField.highlightExternalChange = false;
    }

    timeField.value = dateField.value = me.inputValue;
    dateField.highlightExternalChange = highlightDate;
    timeField.highlightExternalChange = highlightTime;
    me.$isInternalChange = false; // Must evaluate after child fields have been updated since our validity state depends on theirs.

    me.syncInvalid();
  }

  onTimeFieldKeyDown(e) {
    const me = this; // we need to handle keydown for composed field manually and before it's done by cellEdit feature

    if (e.key === 'Enter' || e.key === 'Tab') {
      const dateAndTime = me.dateField.value;
      me._isUserAction = true;
      me.value = dateAndTime ? DateHelper.copyTimeValues(dateAndTime, me.timeField.value) : null;
      me._isUserAction = false;
    }
  }

  onDateFieldKeyDown(e) {
    const me = this;

    if (e.key === 'Tab') {
      e.stopPropagation();
      e.preventDefault();
      me.timeField.focus();
    } // we need to handle keydown for composed field manually and before it's done by cellEdit feature

    if (e.key === 'Enter') {
      me.value = me.dateField.value;
    }
  } // Make us and our underlying fields required

  updateRequired(required, was) {
    this.timeField.required = this.dateField.required = required;
  }

  updateReadOnly(readOnly, was) {
    super.updateReadOnly(readOnly, was);

    if (!this.isConfiguring) {
      this.timeField.readOnly = this.dateField.readOnly = readOnly;
    }
  } // Make us and our underlying fields disabled

  onDisabled(value) {
    this.timeField.disabled = this.dateField.disabled = value;
  }

  focus() {
    this.dateField.focus();
  }

  hasChanged(oldValue, newValue) {
    return !DateHelper.isEqual(oldValue, newValue);
  }

  get isValid() {
    return this.timeField.isValid && this.dateField.isValid;
  }

  setError(error, silent) {
    [this.dateField, this.timeField].forEach(f => f.setError(error, silent));
  }

  getErrors() {
    const errors = [...(this.dateField.getErrors() || []), ...(this.timeField.getErrors() || [])];
    return errors.length ? errors : null;
  }

  clearError(error, silent) {
    [this.dateField, this.timeField].forEach(f => f.clearError(error, silent));
  }

  updateInvalid() {
    // use this flag in this level to avoid looping
    this.updatingInvalid = true;
    [this.dateField, this.timeField].forEach(f => f.updateInvalid());
    this.updatingInvalid = false;
  }

}
DateTimeField.initClass();
DateTimeField._$name = 'DateTimeField';

/**
 * @module Core/widget/layout/Card
 */

const animationClasses = ['b-slide-out-left', 'b-slide-out-right', 'b-slide-in-left', 'b-slide-in-right'];
/**
 * A helper class for containers which must manage multiple child widgets, of which only one may be visible at once such
 * as a {@link Core.widget.TabPanel}. This class offers an active widget switching API, and optional slide-in,
 * slide-out animations from child to child.
 * @extends Core/widget/layout/Layout
 */

class Card extends Layout {
  static get $name() {
    return 'Card';
  }

  static get type() {
    return 'card';
  }

  static get configurable() {
    return {
      containerCls: 'b-card-container',
      itemCls: 'b-card-item',
      hideChildHeaderCls: 'b-hide-child-headers',

      /**
       * Specifies whether to slide tabs in and out of visibility.
       * @config {Boolean}
       * @default
       */
      animateCardChange: true,

      /**
       * The active child item.
       * @config {Core.widget.Widget}
       */
      activeItem: null,

      /**
       * The active child index.
       * @config {Number}
       */
      activeIndex: null
    };
  }

  onChildAdd(item) {
    super.onChildAdd(item);
    const me = this,
          {
      activeItem,
      owner
    } = me,
          activeIndex = owner.activeIndex != null ? owner.activeIndex : me.activeIndex || 0,
          itemIndex = owner.items.indexOf(item),
          isActive = activeItem != null ? item === activeItem : itemIndex === activeIndex;
    item.on({
      beforeHide: 'onBeforeChildHide',
      beforeShow: 'onBeforeChildShow',
      thisObj: me
    }); // Ensure inactive child items start hidden, and the active one starts shown.
    // Sync our active indicators with reality ready for render.

    if (isActive) {
      item.show();
      me._activeIndex = itemIndex;
      me._activeItem = item;
    } else {
      item.$isDeactivating = true;
      item.hide();
      item.$isDeactivating = false;
    }
  }

  onChildRemove(item) {
    super.onChildRemove(item); // Active child has been removed without setting another child to be active.
    // Choose an immediate sibling to be the new active item

    if (this._activeItem === item) {
      this.activateSiblingOf(item);
    }

    item.un({
      beforeHide: 'onBeforeChildHide',
      beforeShow: 'onBeforeChildShow',
      thisObj: this
    });
  }
  /**
   * Detect external code showing a child. We veto that show and activate it through the API.
   * @internal
   */

  onBeforeChildShow({
    source: showingChild
  }) {
    // Some outside code is showing a child.
    // We must control this, so veto it and activate it in the standard way.
    if (!this.owner.isConfiguring && !showingChild.$isActivating) {
      this.activeItem = showingChild;
      return false;
    }
  }
  /**
   * Detect external code hiding a child. We veto that show and activate an immediate sibling through the API.
   * @internal
   */

  onBeforeChildHide({
    source: hidingChild
  }) {
    // Some outside code is hiding a child.
    // We must control this, so veto it and activate a sibling in the standard way.
    if (!this.owner.isConfiguring && !hidingChild.$isDeactivating) {
      this.activateSiblingOf(hidingChild);
      return false;
    }
  }

  activateSiblingOf(item) {
    const {
      owner
    } = this,
          items = owner.items.slice(),
          removeAt = items.indexOf(item);
    items.splice(removeAt, 1);
    this.activeIndex = Math.min(removeAt, items.length - 1);
  }
  /**
   * Get/set active item, using index or the Widget to activate
   * @param {Core.widget.Widget|Number} activeIndex
   * @param {Number} [prevActiveIndex]
   * @returns {Object} An object describing the card change containing the following properties:
   *
   *  - `prevActiveIndex` The previously active index.
   *  - `prevActiveItem ` The previously active child item.
   *  - `activeIndex    ` The newly active index.
   *  - `activeItem     ` The newly active child item.
   *  - `promise        ` A promise which completes when the slide-in animation finishes and the child item contains
   * focus if it is focusable.
   * @internal
   */

  setActiveItem(activeIndex, prevActiveIndex = this.activeIndex) {
    const me = this,
          {
      owner
    } = me,
          {
      items
    } = owner,
          widgetPassed = activeIndex instanceof Widget,
          prevActiveItem = items[prevActiveIndex],
          newActiveItem = owner.items[activeIndex = widgetPassed ? activeIndex = items.indexOf(activeIndex) : parseInt(activeIndex)],
          event = {
      prevActiveIndex,
      prevActiveItem
    }; // There's a child widget at that index to activate and we're not already activating it.

    if (newActiveItem && !newActiveItem.$isActivating && newActiveItem !== prevActiveItem) {
      var _owner$onBeginActiveI;

      const prevItemElement = prevActiveItem && prevActiveItem.element,
            newActiveElement = newActiveItem && newActiveItem.element; // A previous card change is in progress, abort it and clean the items it was operating upon

      if (me.animateDetacher) {
        const activeCardChange = me.animateDetacher.event; // The animation that is in flight is already doing what we are being asked for.
        // Allow it to complete.

        if (activeCardChange.activeItem === newActiveItem) {
          return activeCardChange.promise;
        }

        me.animateDetacher();
        activeCardChange.prevActiveItem.element.classList.remove(...animationClasses);
        activeCardChange.activeItem.element.classList.remove(...animationClasses);
        me.animateDetacher = null;
      }

      event.activeIndex = activeIndex;
      event.activeItem = newActiveItem;
      /**
       * The active item is about to be changed. Return `false` to prevent this.
       * @event beforeActiveItemChange
       * @preventable
       * @on-owner
       * @param {Number} activeIndex - The new active index.
       * @param {Core.widget.Widget} activeItem - The new active child widget.
       * @param {Number} prevActiveIndex - The previous active index.
       * @param {Core.widget.Widget} prevActiveItem - The previous active child widget.
       */

      if (owner.trigger('beforeActiveItemChange', event) === false) {
        return null;
      } // Since onBeforeActiveItemChange happens before event handlers run, the activation could be cancelled by
      // a listener, so we do a special hook once we are sure things are going down.
      // We pretend that we have already switched active index so that the owner
      // does not attempt to initiate the change.

      const reset = this._activeIndex !== event.activeIndex;

      if (reset) {
        this._activeIndex = event.activeIndex;
      }

      (_owner$onBeginActiveI = owner.onBeginActiveItemChange) === null || _owner$onBeginActiveI === void 0 ? void 0 : _owner$onBeginActiveI.call(owner, event);

      if (reset) {
        this._activeIndex = event.prevActiveIndex;
      }

      event.promise = me.cardChangeAnimation = new Promise((resolve, reject) => {
        // If there's something to slide out, slide it out, and slide the new item in
        if (prevItemElement && owner.isVisible && me.animateCardChange) {
          // During the card sliding trick, we don't want resize notifications.
          // The outgoing card should be as inert as if it were hidden.
          const wasMonitoringSize = prevActiveItem.monitorResize;
          prevActiveItem.monitorResize = false;
          me.contentElement.style.overflowX = 'hidden'; // The outgoing card must report its isVisible property as false from now on
          // even before we officially hide it.

          prevActiveItem._hidden = true; // Show the item so that it can be slid in.
          // Events will ensue, UIs can react to the show event.
          // The flag is so that our onBeforeChildShow listener can
          // tell if it's part of our orderly activate operation.

          newActiveItem.$isActivating = true;
          newActiveItem.show();
          newActiveItem.$isActivating = false;
          prevItemElement.classList.add(activeIndex > prevActiveIndex ? 'b-slide-out-left' : 'b-slide-out-right');
          newActiveElement.classList.add(activeIndex < prevActiveIndex ? 'b-slide-in-left' : 'b-slide-in-right');
          owner.isAnimating = true; // When the new widget is in place, clean up

          me.animateDetacher = EventHelper.onTransitionEnd({
            mode: 'animation',
            element: newActiveElement,
            // onTransitionEnd protects us from being called
            // after the thisObj is destroyed.
            thisObj: prevActiveItem,

            handler() {
              // Calendar got stuck with `b-animating` in some monkey scenarios, hoisted this to make
              // sure it was not left behind
              owner.isAnimating = me.cardChangeAnimation = false; // if animateDetacher variable has been cleared before this callback,
              // this means race-condition call happened. active item should be called again to
              // prevent unexpected layout behaviour

              if (!me.animateDetacher) {
                me.setActiveItem(activeIndex, prevActiveIndex);
                return;
              }

              me.animateDetacher = null; // Clean incoming widget's animation classes

              newActiveElement.classList.remove(...animationClasses); // If there's an outgoing item, clean its animation classes and hide it

              if (prevItemElement) {
                prevItemElement.classList.remove(...animationClasses); // The flag is so that our onBeforeChildHide listener can
                // tell if it's part of our orderly activate operation.

                prevActiveItem.$isDeactivating = true;
                prevActiveItem._hidden = false;
                prevActiveItem.hide();
                prevActiveItem.monitorResize = wasMonitoringSize;
                prevActiveItem.$isDeactivating = false;
              }

              me.contentElement.style.overflowX = '';
              me.onActiveItemChange(event, resolve);
            }

          });
          me.animateDetacher.reject = reject;
          me.animateDetacher.event = event;
        } // Nothing to slide out or we are not animating.
        else {
          // Show the new active items first, so that the hide listener doesn't
          // automatically set a new active item based on active item being hidden.
          // The flag is so that our onBeforeChildShow listener can
          // tell if it's part of our orderly activate operation.
          newActiveItem.$isActivating = true;
          newActiveItem.show(); // focus the new item before lost the component focus when hide the old one
          // (because losing focus closes owner if it is floatable)

          newActiveItem.focus();
          newActiveItem.$isActivating = false;

          if (prevActiveItem) {
            // The flag is so that our onBeforeChildHide listener can
            // tell if it's part of our orderly activate operation.
            prevActiveItem.$isDeactivating = true;
            prevActiveItem.hide();
            prevActiveItem.$isDeactivating = false;
          }

          me.onActiveItemChange(event, resolve);
        }
      });
    }

    return event;
  }

  onActiveItemChange(event, resolve) {
    const me = this;
    me._activeItem = event.activeItem;
    me._activeIndex = event.activeIndex;
    /**
     * The active item has changed.
     * @event activeItemChange
     * @on-owner
     * @param {Number} activeIndex - The new active index.
     * @param {Core.widget.Widget} activeItem - The new active child widget.
     * @param {Number} prevActiveIndex - The previous active index.
     * @param {Core.widget.Widget} prevActiveItem - The previous active child widget.
     */

    me.owner.trigger('activeItemChange', event); // Note that we have to call focus *after* the element is in its new position
    // because focus({preventScroll:true}) is not supported everywhere
    // and crazy browser scrolling behaviour on focus breaks the animation.

    event.activeItem.focus();
    resolve(event);
  }

  renderChildren() {
    const {
      owner
    } = this;
    owner.contentElement.classList.toggle(this.hideChildHeaderCls, owner.suppressChildHeaders);
    super.renderChildren();
  }

  changeActiveIndex(activeIndex) {
    const {
      owner
    } = this; // Sanitize it if possible

    return owner.isConfiguring && !owner._items ? activeIndex : Math.min(activeIndex, owner.items.length - 1);
  }

  updateActiveIndex(activeIndex, oldActiveIndex) {
    if (!this.owner.isConfiguring) {
      this.setActiveItem(activeIndex, oldActiveIndex);
    }
  }

  updateActiveItem(activeItem) {
    if (!this.owner.isConfiguring) {
      this.setActiveItem(activeItem, this.activeIndex);
    }
  }

} // Layouts must register themselves so that the static layout instantiation
// in Layout knows what to do with layout type names

Card.initClass();
Card._$name = 'Card';

export { DateTimeField };
//# sourceMappingURL=Card.js.map
