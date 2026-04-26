/**
 * React wrapper for Bryntum EndDateField
 */
import React, { Component } from 'react';
import WrapperHelper from './WrapperHelper.js';
import { EndDateField } from '@bryntum/gantt';

export default class BryntumEndDateField extends Component {
    static instanceClass = EndDateField;

    configNames = [
        'adopt',
        'align',
        'anchor',
        'appendTo',
        'ariaDescription',
        'ariaLabel',
        'autoClose',
        'autoComplete',
        'autoExpand',
        'autoSelect',
        'bubbleEvents',
        'callOnFunctions',
        'centered',
        'clearable',
        'cls',
        'config',
        'constrainTo',
        'container',
        'containValues',
        'contentElementCls',
        'defaultBindProperty',
        'dock',
        'draggable',
        'editable',
        'eventRecord',
        'floating',
        'hideAnimation',
        'highlightExternalChange',
        'hint',
        'hintHtml',
        'htmlCls',
        'inline',
        'inputAlign',
        'inputAttributes',
        'inputType',
        'inputWidth',
        'insertBefore',
        'insertFirst',
        'keepTime',
        'keyStrokeChangeDelay',
        'labelCls',
        'labelPosition',
        'labels',
        'labelWidth',
        'listeners',
        'localeClass',
        'localizableProperties',
        'maskDefaults',
        'masked',
        'maxLength',
        'minLength',
        'monitorResize',
        'name',
        'owner',
        'picker',
        'pickerAlignElement',
        'pickerFormat',
        'placeholder',
        'positioned',
        'preventTooltipOnTouch',
        'project',
        'required',
        'revertOnEscape',
        'ripple',
        'rootElement',
        'scrollAction',
        'showAnimation',
        'showTooltipWhenDisabled',
        'spellCheck',
        'tab',
        'tabIndex',
        'tag',
        'textAlign',
        'title',
        'ui',
        'validateOnInput',
        'weekStartDay',
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
        'format',
        'height',
        'hidden',
        'html',
        'id',
        'label',
        'margin',
        'max',
        'maxHeight',
        'maxWidth',
        'min',
        'minHeight',
        'minWidth',
        'onAction',
        'onBeforeDestroy',
        'onBeforeHide',
        'onBeforeShow',
        'onCatchAll',
        'onChange',
        'onClear',
        'onDestroy',
        'onFocusIn',
        'onFocusOut',
        'onHide',
        'onInput',
        'onPaint',
        'onReadOnly',
        'onResize',
        'onShow',
        'onTrigger',
        'readOnly',
        'scrollable',
        'step',
        'tooltip',
        'triggers',
        'value',
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
