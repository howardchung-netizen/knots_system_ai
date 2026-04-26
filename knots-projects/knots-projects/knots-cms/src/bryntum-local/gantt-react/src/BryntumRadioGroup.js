/**
 * React wrapper for Bryntum RadioGroup
 */
import React, { Component } from 'react';
import WrapperHelper from './WrapperHelper.js';
import { RadioGroup } from '@bryntum/gantt';

export default class BryntumRadioGroup extends Component {
    static instanceClass = RadioGroup;

    configNames = [
        'adopt',
        'align',
        'anchor',
        'appendTo',
        'ariaDescription',
        'ariaLabel',
        'bbar',
        'bodyCls',
        'bubbleEvents',
        'callOnFunctions',
        'centered',
        'clearable',
        'cls',
        'collapsed',
        'collapsible',
        'config',
        'constrainTo',
        'contentElementCls',
        'defaultBindProperty',
        'defaultFocus',
        'defaults',
        'dock',
        'draggable',
        'floating',
        'footer',
        'header',
        'hideAnimation',
        'hideWhenEmpty',
        'htmlCls',
        'inline',
        'insertBefore',
        'insertFirst',
        'itemCls',
        'labelCls',
        'labelPosition',
        'labelWidth',
        'lazyItems',
        'listeners',
        'localeClass',
        'localizableProperties',
        'maskDefaults',
        'masked',
        'monitorResize',
        'name',
        'namedItems',
        'options',
        'owner',
        'positioned',
        'preventTooltipOnTouch',
        'ripple',
        'rootElement',
        'scrollAction',
        'showAnimation',
        'showTooltipWhenDisabled',
        'strips',
        'tab',
        'tag',
        'tbar',
        'textAlign',
        'textContent',
        'title',
        'trapFocus',
        'ui',
        'weight'
    ];

    propertyConfigNames = [
        'alignSelf',
        'content',
        'dataset',
        'disabled',
        'extraData',
        'flex',
        'height',
        'hidden',
        'html',
        'id',
        'items',
        'label',
        'layout',
        'layoutStyle',
        'margin',
        'maxHeight',
        'maxWidth',
        'minHeight',
        'minWidth',
        'onBeforeDestroy',
        'onBeforeHide',
        'onBeforeSetRecord',
        'onBeforeShow',
        'onCatchAll',
        'onDestroy',
        'onFocusIn',
        'onFocusOut',
        'onHide',
        'onPaint',
        'onReadOnly',
        'onResize',
        'onShow',
        'onToolClick',
        'readOnly',
        'scrollable',
        'tools',
        'tooltip',
        'width',
        'x',
        'y'
    ];

    propertyNames = [
        'anchorSize',
        'isSettingValues',
        'isValid',
        'record',
        'type',
        'value',
        'values'
    ];

    // Component instance
    instance = undefined;

    // Component element
    element = undefined;

    /**
     * Invoked immediately after a component is mounted (inserted into the tree)
     */
    componentDidMount() {
        const { createWidget } = WrapperHelper();
        this.instance = createWidget(this);
    }

    // React component removed, destroy instance
    componentWillUnmount() {
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
    shouldComponentUpdate(nextProps, nextState) {
        const { shouldComponentUpdate } = WrapperHelper();
        return shouldComponentUpdate(this, nextProps, nextState);
    }

    render() {
        const className = `b-react-${this.constructor.instanceClass.$name.toLowerCase()}-container`;
        return (
            <div className={className} ref={(element) => (this.element = element)}></div>
        );
    }

}
