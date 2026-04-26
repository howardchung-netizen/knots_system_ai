import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _createSuper from "@babel/runtime/helpers/esm/createSuper";

/**
 * React wrapper for Bryntum TrialButton
 */
import React, { Component } from 'react';
import WrapperHelper from './WrapperHelper.js';
import { TrialButton } from '@bryntum/gantt';

var BryntumTrialButton = /*#__PURE__*/function (_Component) {
  _inherits(BryntumTrialButton, _Component);

  var _super = _createSuper(BryntumTrialButton);

  function BryntumTrialButton() {
    var _this;

    _classCallCheck(this, BryntumTrialButton);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.configNames = ['adopt', 'align', 'anchor', 'appendTo', 'ariaDescription', 'ariaLabel', 'bubbleEvents', 'callOnFunctions', 'centered', 'cls', 'color', 'config', 'constrainTo', 'contentElementCls', 'defaultBindProperty', 'dock', 'draggable', 'floating', 'hideAnimation', 'href', 'htmlCls', 'insertBefore', 'insertFirst', 'listeners', 'localeClass', 'localizableProperties', 'maskDefaults', 'masked', 'menuIcon', 'monitorResize', 'owner', 'positioned', 'preventTooltipOnTouch', 'productId', 'ripple', 'rootElement', 'scrollAction', 'showAnimation', 'showTooltipWhenDisabled', 'storeEmail', 'tab', 'tag', 'target', 'textAlign', 'title', 'toggleable', 'toggleGroup', 'ui', 'weight'];
    _this.propertyConfigNames = ['alignSelf', 'badge', 'content', 'dataset', 'disabled', 'extraData', 'flex', 'height', 'hidden', 'html', 'icon', 'iconAlign', 'id', 'margin', 'maxHeight', 'maxWidth', 'menu', 'minHeight', 'minWidth', 'onAction', 'onBeforeDestroy', 'onBeforeHide', 'onBeforeShow', 'onCatchAll', 'onClick', 'onDestroy', 'onFocusIn', 'onFocusOut', 'onHide', 'onPaint', 'onReadOnly', 'onResize', 'onShow', 'onToggle', 'pressed', 'pressedIcon', 'readOnly', 'scrollable', 'text', 'tooltip', 'width', 'x', 'y'];
    _this.propertyNames = ['anchorSize', 'type'];
    _this.instance = undefined;
    _this.element = undefined;
    return _this;
  }

  _createClass(BryntumTrialButton, [{
    key: "componentDidMount",
    value:
    /**
     * Invoked immediately after a component is mounted (inserted into the tree)
     */
    function componentDidMount() {
      var _WrapperHelper = WrapperHelper(),
          createWidget = _WrapperHelper.createWidget;

      this.instance = createWidget(this);
    } // React component removed, destroy instance

  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this.instance) {
        this.instance.destroy();
      }
    }
    /**
     * Component about to be updated, from changing a prop using state.
     * React to it depending on what changed and prevent react from re-rendering our component.
     * @param nextProps
     * @param nextState
     * @return {boolean}
     */

  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      var _WrapperHelper2 = WrapperHelper(),
          shouldComponentUpdate = _WrapperHelper2.shouldComponentUpdate;

      return shouldComponentUpdate(this, nextProps, nextState);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var className = "b-react-".concat(this.constructor.instanceClass.$name.toLowerCase(), "-container");
      return /*#__PURE__*/React.createElement("div", {
        className: className,
        ref: function ref(element) {
          return _this2.element = element;
        }
      });
    }
  }]);

  return BryntumTrialButton;
}(Component);

BryntumTrialButton.instanceClass = TrialButton;
export { BryntumTrialButton as default };