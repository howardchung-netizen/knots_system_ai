/**
 * React wrapper for Bryntum TrialButton
 */
import React, { Component } from 'react';
import WrapperHelper from './WrapperHelper.js';
import { TrialButton } from '@bryntum/gantt';

export default class BryntumTrialButton extends Component {
    static instanceClass = TrialButton;

    configNames = [
        'adopt',
        'align',
        'anchor',
        'appendTo',
        'ariaDescription',
        'ariaLabel',
        'bubbleEvents',
        'callOnFunctions',
        'centered',
        'cls',
        'color',
        'config',
        'constrainTo',
        'contentElementCls',
        'defaultBindProperty',
        'dock',
        'draggable',
        'floating',
        'hideAnimation',
        'href',
        'htmlCls',
        'insertBefore',
        'insertFirst',
        'listeners',
        'localeClass',
        'localizableProperties',
        'maskDefaults',
        'masked',
        'menuIcon',
        'monitorResize',
        'owner',
        'positioned',
        'preventTooltipOnTouch',
        'productId',
        'ripple',
        'rootElement',
        'scrollAction',
        'showAnimation',
        'showTooltipWhenDisabled',
        'storeEmail',
        'tab',
        'tag',
        'target',
        'textAlign',
        'title',
        'toggleable',
        'toggleGroup',
        'ui',
        'weight'
    ];

    propertyConfigNames = [
        'alignSelf',
        'badge',
        'content',
        'dataset',
        'disabled',
        'extraData',
        'flex',
        'height',
        'hidden',
        'html',
        'icon',
        'iconAlign',
        'id',
        'margin',
        'maxHeight',
        'maxWidth',
        'menu',
        'minHeight',
        'minWidth',
        'onAction',
        'onBeforeDestroy',
        'onBeforeHide',
        'onBeforeShow',
        'onCatchAll',
        'onClick',
        'onDestroy',
        'onFocusIn',
        'onFocusOut',
        'onHide',
        'onPaint',
        'onReadOnly',
        'onResize',
        'onShow',
        'onToggle',
        'pressed',
        'pressedIcon',
        'readOnly',
        'scrollable',
        'text',
        'tooltip',
        'width',
        'x',
        'y'
    ];

    propertyNames = [
        'anchorSize',
        'type'
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
