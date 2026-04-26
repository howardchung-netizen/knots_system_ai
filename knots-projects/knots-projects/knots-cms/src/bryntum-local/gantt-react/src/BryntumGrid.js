/**
 * React wrapper for Bryntum Grid
 */
import React, { Component } from 'react';
import WrapperHelper from './WrapperHelper.js';
import { Grid } from '@bryntum/gantt';

export default class BryntumGrid extends Component {
    static instanceClass = Grid;

    // Component is View class
    static isView = true;

    projectStores = false;

    featureNames = [
        'cellEditFeature',
        'cellMenuFeature',
        'cellTooltipFeature',
        'columnAutoWidthFeature',
        'columnDragToolbarFeature',
        'columnPickerFeature',
        'columnReorderFeature',
        'columnResizeFeature',
        'excelExporterFeature',
        'filterFeature',
        'filterBarFeature',
        'groupFeature',
        'groupSummaryFeature',
        'headerMenuFeature',
        'mergeCellsFeature',
        'multipageFeature',
        'multipageverticalFeature',
        'pdfExportFeature',
        'quickFindFeature',
        'regionResizeFeature',
        'rowCopyPasteFeature',
        'rowReorderFeature',
        'searchFeature',
        'singlepageFeature',
        'sortFeature',
        'stickyCellsFeature',
        'stripeFeature',
        'summaryFeature',
        'treeFeature',
        'treeGroupFeature'
    ];

    // Hidden div to host unused portals DOM
    portalsCache = undefined;

    // CSS class used for individual portal containers
    portalContainerClass = 'b-react-portal-container';

    state = {
        // Holds React portals
        portals: new Map(),

        // Needed to trigger refresh when portals change
        generation: 0
    };

    dataStores = {
        'store': 'data'
    };

    configNames = [
        'adopt',
        'align',
        'anchor',
        'animateRemovingRows',
        'appendTo',
        'ariaDescription',
        'ariaLabel',
        'autoHeight',
        'bbar',
        'bodyCls',
        'bubbleEvents',
        'callOnFunctions',
        'centered',
        'cls',
        'collapsed',
        'collapsible',
        'columns',
        'config',
        'constrainTo',
        'contentElementCls',
        'contextMenuTriggerEvent',
        'defaultBindProperty',
        'defaultFocus',
        'defaultRegion',
        'defaults',
        'destroyStore',
        'disableGridRowModelWarning',
        'dock',
        'draggable',
        'emptyText',
        'enableSticky',
        'enableTextSelection',
        'enableUndoRedoKeys',
        'features',
        'fillLastColumn',
        'fixedRowHeight',
        'floating',
        'footer',
        'fullRowRefresh',
        'getRowHeight',
        'header',
        'hideAnimation',
        'hideHeaders',
        'hideWhenEmpty',
        'htmlCls',
        'insertBefore',
        'insertFirst',
        'itemCls',
        'lazyItems',
        'listeners',
        'loadMask',
        'loadMaskDefaults',
        'loadMaskError',
        'localeClass',
        'localizableProperties',
        'longPressTime',
        'maskDefaults',
        'masked',
        'monitorResize',
        'namedItems',
        'owner',
        'plugins',
        'positioned',
        'preserveFocusOnDatasetChange',
        'preserveScrollOnDatasetChange',
        'preventTooltipOnTouch',
        'resizeToFitIncludesHeader',
        'responsiveLevels',
        'ripple',
        'rootElement',
        'scrollAction',
        'scrollerClass',
        'scrollManager',
        'selectionMode',
        'showAnimation',
        'showDirty',
        'showTooltipWhenDisabled',
        'stateful',
        'statefulEvents',
        'stateId',
        'stateProvider',
        'strips',
        'subGridConfigs',
        'syncMask',
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
        'columnLines',
        'content',
        'data',
        'dataset',
        'disabled',
        'extraData',
        'flex',
        'height',
        'hidden',
        'html',
        'id',
        'items',
        'layout',
        'layoutStyle',
        'margin',
        'maxHeight',
        'maxWidth',
        'minHeight',
        'minWidth',
        'onBeforeCellEditStart',
        'onBeforeColumnDragStart',
        'onBeforeColumnDropFinalize',
        'onBeforeCopy',
        'onBeforeDestroy',
        'onBeforeFinishCellEdit',
        'onBeforeHide',
        'onBeforePaste',
        'onBeforePdfExport',
        'onBeforeRenderRow',
        'onBeforeRenderRows',
        'onBeforeSetRecord',
        'onBeforeShow',
        'onBeforeToggleNode',
        'onCancelCellEdit',
        'onCatchAll',
        'onCellClick',
        'onCellContextMenu',
        'onCellDblClick',
        'onCellMenuBeforeShow',
        'onCellMenuItem',
        'onCellMenuShow',
        'onCellMenuToggleItem',
        'onCellMouseOut',
        'onCellMouseOver',
        'onCollapseNode',
        'onColumnDragStart',
        'onColumnDrop',
        'onContextMenuItem',
        'onContextMenuToggleItem',
        'onDataChange',
        'onDestroy',
        'onExpandNode',
        'onFinishCellEdit',
        'onFocusIn',
        'onFocusOut',
        'onHeaderMenuBeforeShow',
        'onHeaderMenuItem',
        'onHeaderMenuShow',
        'onHeaderMenuToggleItem',
        'onHide',
        'onMouseOut',
        'onMouseOver',
        'onPaint',
        'onPdfExport',
        'onReadOnly',
        'onRenderRow',
        'onRenderRows',
        'onResize',
        'onResponsive',
        'onScroll',
        'onSelectionChange',
        'onShow',
        'onStartCellEdit',
        'onSubGridCollapse',
        'onSubGridExpand',
        'onToggleNode',
        'onToolClick',
        'readOnly',
        'rowHeight',
        'scrollable',
        'store',
        'tools',
        'tooltip',
        'transitionDuration',
        'width',
        'x',
        'y'
    ];

    propertyNames = [
        'anchorSize',
        'isSettingValues',
        'isValid',
        'record',
        'selectedCell',
        'selectedRecord',
        'selectedRecords',
        'state',
        'type',
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
            <React.Fragment>
                <div className={className} ref={(element) => (this.element = element)}>
                    {[...this.state.portals].map((item) => item[1])}
                </div>
                <div ref={(el) => (this.portalsCache = el)} className="b-react-portals-cache" style={{ display: 'none' }}></div>
            </React.Fragment>
        );
    }

}
