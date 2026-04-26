import Base from '../../../Core/Base.js';
import Rectangle from '../../../Core/helper/util/Rectangle.js';
import Location from '../../util/Location.js';
import DomHelper from '../../../Core/helper/DomHelper.js';

/**
 * @module Grid/view/mixin/GridNavigation
 */

const
    defaultFocusOptions = Object.freeze({}),
    disableScrolling = Object.freeze({
        x : false,
        y : false
    }),
    containedFocusable = function(e) {
        // When we step outside of the target cell, throw.
        // The TreeWalker silences the exception and terminates the traverse.
        if (!this.focusableFinderCell.contains(e)) {
            return NodeFilter.FILTER_REJECT;
        }
        if (DomHelper.isFocusable(e)) {
            return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
    };

/**
 * Mixin for Grid that handles cell to cell navigation.
 *
 * @mixin
 */
export default Target => class GridNavigation extends (Target || Base) {
    static get $name() {
        return 'GridNavigation';
    }

    static get configurable() {
        return {
            focusable : false,

            focusableSelector : '.b-grid-cell,.b-grid-header.b-depth-0'
        };
    }

    onElementKeyDown(keyEvent) {
        const result = super.onElementKeyDown(keyEvent);

        if (result !== false) {
            return this.doGridNavigation(keyEvent);
        }
        return result;
    }

    onElementMouseDown(event) {
        // Cache this so that focusin handling can tell whether its a mousedown focus
        // in which case it must be obeyed. If not, it's taken to be a TAB in and that
        // must redirect to the last focused cell.
        this.lastMousedownEvent = event;
        super.onElementMouseDown(event);
    }

    /**
     * Called by the RowManager when the row which contains the focus location is derendered.
     *
     * This keeps focus in a consistent place.
     * @protected
     */
    onFocusedRowDerender() {
        const
            me              = this,
            { focusedCell } = me;

        if (focusedCell?.id != null && focusedCell.cell) {
            const isActive = focusedCell.cell.contains(DomHelper.getActiveElement(me));

            if (me.hideHeaders) {
                if (isActive) {
                    me.revertFocus();
                }
            }
            else {
                const headerContext = me.normalizeCellContext({
                    rowIndex    : -1,
                    columnIndex : isActive ? focusedCell.columnIndex : 0
                });

                // The row contained focus, focus the corresponding header
                if (isActive) {
                    me.focusCell(headerContext);
                }
                else {
                    headerContext.cell.tabIndex = 0;
                }
            }
            focusedCell.cell.tabIndex = -1;
        }
    }

    doGridNavigation(keyEvent) {
        const
            keyName         = (keyEvent.key || '').trim() || keyEvent.code,
            composedKeyName = `${keyEvent.ctrlKey ? 'Ctrl' : ''}${keyEvent.shiftKey ? 'Shift' : ''}${keyEvent.altKey ? 'Alt' : ''}${keyName}`,
            handler         = this[`on${composedKeyName}`] || this[`on${keyName}`];

        if (handler && !keyEvent.handled) {
            this.navigationEvent = keyEvent;
            return handler.call(this, keyEvent);
        }
    }

    onEscape(keyEvent) {
        const { focusedCell } = this;

        if (!keyEvent.target.closest('.b-dragging') && focusedCell?.isActionable) {
            // To prevent the focusCell from being rejected as a no-op
            this._focusedCell = null;

            // Focus the cell with an explicit request to not jump in
            this.focusCell({
                rowIndex : focusedCell.rowIndex,
                column   : focusedCell.column
            }, {
                disableActionable : true
            });
        }
    }

    onArrowUp(keyEvent) {
        keyEvent.preventDefault();
        this.focusCell(Location.UP);
    }

    onArrowDown(keyEvent) {
        keyEvent.preventDefault();
        this.focusCell(Location.DOWN);
    }

    onArrowLeft(keyEvent) {
        keyEvent.preventDefault();
        this.focusCell(this.rtl ? Location.NEXT_CELL : Location.PREV_CELL);
    }

    onArrowRight(keyEvent) {
        keyEvent.preventDefault();
        this.focusCell(this.rtl ? Location.PREV_CELL : Location.NEXT_CELL);
    }

    onCtrlHome(keyEvent) {
        keyEvent.preventDefault();
        this.focusCell(Location.FIRST_CELL);
    }

    onHome(keyEvent) {
        keyEvent.preventDefault();
        this.focusCell(Location.FIRST_COLUMN);
    }

    onCtrlEnd(keyEvent) {
        keyEvent.preventDefault();
        this.focusCell(Location.LAST_CELL);
    }

    onEnd(keyEvent) {
        keyEvent.preventDefault();
        this.focusCell(Location.LAST_COLUMN);
    }

    onPageUp(keyEvent) {
        keyEvent.preventDefault();
        this.focusCell(Location.PREV_PAGE);
    }

    onPageDown(keyEvent) {
        keyEvent.preventDefault();
        this.focusCell(Location.NEXT_PAGE);
    }

    onShiftTab(keyEvent) {
        const
            me = this,
            {
                focusedCell,
                bodyElement
            }   = me,
            {
                cell,
                isActionable
            } = focusedCell;

        // If we're *on* a cell, or on first subtarget, SHIFT+TAB moves off the grid.
        if (!isActionable || keyEvent.target === focusedCell.actionTargets[0]) {
            // Focus the first header cell and then let the key's default action take its course
            const f = !me.hideHeaders && me.focusCell({
                rowIndex : -1,
                column   : 0
            }, {
                disableActionable : true
            });

            // If that was successful then reset the tabIndex
            if (f) {
                f.cell.tabIndex = -1;
                cell.tabIndex = 0;
                me._focusedCell = focusedCell;
            }
            // Otherwise, temporarily hide the grid body, and let TAB take effect from there
            else {
                bodyElement.style.display = 'none';
                me.requestAnimationFrame(() => bodyElement.style.display = '');
            }

            // So that Navigator#onKeyDown does not continue to preventDefault;
            return false;
        }
    }

    onTab(keyEvent) {
        const
            {
                focusedCell,
                bodyElement
            }                = this,
            { isActionable } = focusedCell;

        // If we're *on* a cell, or on last subtarget, TAB moves off the grid.
        // Temporarily hide the grid body, and let TAB take effect from there
        if (!isActionable || keyEvent.target === focusedCell.actionTargets[focusedCell.actionTargets.length - 1]) {
            bodyElement.style.display = 'none';
            this.requestAnimationFrame(() => bodyElement.style.display = '');

            // So that Navigator#onKeyDown does not continue to preventDefault;
            return false;
        }
    }

    onSpace(keyEvent) {
        // SPACE scrolls, so disable that
        if (!this.focusedCell.isActionable) {
            keyEvent.preventDefault();
        }
    }

    onEnter(keyEvent) {
        if (this.focusedCell.isColumnHeader) {
            const { column } = this.focusedCell;

            column.onKeyDown?.(keyEvent);

            this.getHeaderElement(this.focusedCell.column.id).click();
        }
    }

    //region Cell

    /**
     * Triggered when a user navigates to a grid cell
     * @event navigate
     * @param {Grid.view.Grid} grid The grid instance
     * @param {Grid.util.Location} last The previously focused location
     * @param {Grid.util.Location} location The new focused location
     * @param {Event} [event] The UI event which caused navigation.
     */

    /**
     * Grid Location which encapsulates the currently focused cell.
     * Set to focus a cell or use {@link #function-focusCell}.
     * @property {Grid.util.Location}
     */
    get focusedCell() {
        return this._focusedCell;
    }

    /**
     * This property is `true` if an element _within_ a cell is focused.
     * @property {Boolean}
     * @readonly
     */
    get isActionableLocation() {
        return this._focusedCell?.isActionable;
    }

    set focusedCell(cellSelector) {
        this.focusCell(cellSelector);
    }

    get focusedRecord() {
        return this._focusedCell?.record;
    }

    /**
     * CSS selector for currently focused cell. Format is "[data-index=index] [data-column-id=columnId]".
     * @property {String}
     * @readonly
     */
    get cellCSSSelector() {
        const cell = this._focusedCell;

        return cell ? `[data-index=${cell.rowIndex}] [data-column-id=${cell.columnId}]` : '';
    }

    afterHide() {
        super.afterHide(...arguments);

        // Do not scroll back to the last focused cell/last moused over cell upon reshow
        this.lastFocusedCell = this.mouseMoveEvent = null;
    }

    /**
     * Checks whether or not a cell is focused.
     * @param {Object|String|Number} cellSelector Cell selector { id: x, columnId: xx } or row id
     * @returns {Boolean} true if cell or row is focused, otherwise false
     */
    isFocused(cellSelector) {
        return Boolean(this._focusedCell?.equals(this.normalizeCellContext(cellSelector)));
    }

    get focusElement() {
        if (!this.isDestroying) {
            let focusCell;

            // If the store is not empty, focusedCell can return the closest cell
            if (this.store.count && this._focusedCell) {
                focusCell = this._focusedCell.target;
            }
            // If the store is empty, or we have had no focusedCell set, focus a column header.
            else {
                focusCell = this.normalizeCellContext({
                    rowIndex    : -1,
                    columnIndex : this._focusedCell?.columnIndex || 0
                }).target;
            }

            const superFocusEl = super.focusElement;

            // If there's no cell, or the Container's focus element is before the cell
            // use the Container's focus element.
            // For example, we may have a top toolbar.
            if (superFocusEl && (!focusCell || superFocusEl.compareDocumentPosition(focusCell) === Node.DOCUMENT_POSITION_PRECEDING)) {
                return superFocusEl;
            }

            return focusCell;
        }
    }

    onPaint({ firstPaint }) {
        const me = this;

        super.onPaint?.(...arguments);

        // Make the grid initally tabbable into.
        // The first cell has to have the initial roving tabIndex set into it.
        const defaultFocus = this.normalizeCellContext({
            rowIndex : me.hideHeaders ? 0 : -1,
            column   : me.hideHeaders ? 0 : me.columns.find(col => col.isFocusable)
        });

        if (defaultFocus.cell) {
            me._focusedCell = defaultFocus;

            const { target } = defaultFocus;

            // If cell doesn't contain a focusable target, it needs tabIndex 0.
            if (target === defaultFocus.cell) {
                defaultFocus.cell.tabIndex = 0;
            }
        }
    }

    /**
     * This function handles focus moving into, or within the grid.
     * @param {Event} focusEvent
     * @private
     */
    onGridBodyFocusIn(focusEvent) {
        const
            me              = this,
            {
                bodyElement,
                lastMousedownEvent
            }               = me,
            event           = me.navigationEvent,
            lastFocusedCell = me.focusedCell,
            lastTarget      = lastFocusedCell?.target,
            {
                target,
                relatedTarget
            }               = focusEvent,
            targetCell      = target.closest(me.focusableSelector);

        me.navigationEvent = me.lastMousedownEvent = null;

        // If focus moved into a valid cell...
        if (targetCell) {
            const
                cellSelector  = new Location(target),
                { cell }      = cellSelector,
                lastCell      = lastFocusedCell?.cell,
                actionTargets = cellSelector.actionTargets = me.findFocusables(targetCell),
                // Don't select on focus on a contained actionable location
                doSelect      = (Boolean(event) || me.selectOnFocus) && target === cell;

            // https://github.com/bryntum/support/issues/4039
            // Only try focusing cell is current target cell is getting removed
            if (!me.store.getById(targetCell.parentNode.dataset.id) && cell !== targetCell) {
                cell.focus({ preventScroll : true });
                return;
            }

            if (target.matches(me.focusableSelector)) {
                if (me.disableActionable) {
                    cellSelector._target = cell;
                }
                // Focus first focusable target if we are configured to.
                else if (actionTargets.length) {
                    me.navigationEvent = event;
                    actionTargets[0].focus();
                    return;
                }
            }
            else {
                // If we have tabbed in and *NOT* mousedowned in, and hit a tabbable element which was not our
                // last focused cell, go back to last focused cell.
                if (lastFocusedCell?.target && relatedTarget && (!lastMousedownEvent || !bodyElement.contains(lastMousedownEvent.target)) && !bodyElement.contains(relatedTarget) && !cellSelector.equals(lastFocusedCell)) {
                    lastTarget.focus();
                    return;
                }
                cellSelector._target = target;
            }

            if (lastCell) {
                lastCell.classList.remove('b-focused');
                lastCell.tabIndex = -1;
            }
            if (cell) {
                cell.classList.add('b-focused');

                // Column may update DOM on cell focus for A11Y purposes.
                cellSelector.column.onCellFocus(cellSelector);

                // Only switch the cell to be tabbable if focus was not directed to an inner focusable.
                if (cell === target) {
                    cell.tabIndex = 0;
                }
            }

            // Moving back to a cell from a cell-contained Editor
            if (cell.contains(focusEvent.relatedTarget)) {
                if (lastTarget === target) {
                    return;
                }
            }

            //Remember
            me._focusedCell = cellSelector;

            me.onCellNavigate?.(me, lastFocusedCell, cellSelector, event, doSelect);

            me.trigger('navigate', { lastFocusedCell, focusedCell : cellSelector, event });
            //TODO: should be able to cancel selectcell from listeners
        }
        // Focus not moved into a valid cell, refocus last cell's target
        // if there was a previously focused cell.
        else {
            lastTarget?.focus();
        }
    }

    findFocusables(cell) {
        const
            { focusableFinder } = this,
            result              = [];

        focusableFinder.currentNode = this.focusableFinderCell = cell;

        for (let focusable = focusableFinder.nextNode(); focusable; focusable = focusableFinder.nextNode()) {
            result.push(focusable);
        }
        return result;
    }

    get focusableFinder() {
        const me = this;

        if (!me._focusableFinder) {
            me._focusableFinder = me.setupTreeWalker(me.bodyElement, NodeFilter.SHOW_ELEMENT, {
                acceptNode : containedFocusable.bind(me)
            }, false);
        }

        return me._focusableFinder;
    }

    /**
     * Navigates to a cell and/or its row (depending on selectionMode)
     * @param {Object} cellSelector { id: rowId, columnId: 'columnId' }
     * @param {Object} options Modifier options for how to deal with focusing the cell. These
     * are used as the {@link Core.helper.util.Scroller#function-scrollTo} options.
     * @param {Object|Boolean} [options.scroll=true] Pass `false` to not scroll the cell into view, or a
     * scroll options object to affect the scroll.
     * @returns {Grid.util.Location} A Location object representing the focused location.
     * @fires navigate
     */
    focusCell(cellSelector, options = defaultFocusOptions) {
        const
            me               = this,
            { _focusedCell } = me,
            {
                scroll,
                doSelect,
                disableActionable
            }                = options;

        // If we're being asked to go to a nonexistent header row, revert focus outwards
        if (cellSelector?.rowIndex === -1 && this.hideHeaders) {
            this.revertFocus();
            return;
        }

        // Get a Grid Location.
        // If the cellSelector is a number, it is taken to be a "relative" location as defined
        // in the Location class eg Location.UP, and we move the current focus accordingly.
        cellSelector = typeof cellSelector === 'number' && _focusedCell?.isLocation ? _focusedCell.move(cellSelector) : me.normalizeCellContext(cellSelector);

        // Request is a no-op, but it's still a navigate request which selection processing needs to know about
        if (cellSelector.equals(_focusedCell)) {
            me.onCellNavigate?.(me, _focusedCell, cellSelector, me.navigationEvent, ('doSelect' in options) ? doSelect : true);
            return _focusedCell;
        }

        const
            subGrid     = me.getSubGridFromColumn(cellSelector.columnId),
            { cell }    = cellSelector,
            testCell    = cell || me.getCell({
                rowIndex : me.rowManager.topIndex,
                columnId : cellSelector.columnId
            }),
            subGridRect = Rectangle.from(subGrid.element),
            bodyRect    = Rectangle.from(me.bodyElement),
            cellRect    = Rectangle.from(testCell).moveTo(null, subGridRect.y);

        // No scrolling possible if we're movoing to a column headert
        if (scroll === false || cellSelector.rowIndex === -1) {
            options = Object.assign({}, options, disableScrolling);
        }
        else {
            options = Object.assign({}, options, scroll);

            // If the test cell is larger than the subGrid, in any dimension, disable scrolling
            if (cellRect.width > subGridRect.width || cellRect.height > bodyRect.height) {
                options.x = options.y = false;
            }
            // Else ask for the column to be scrolled into view
            else {
                options.column = cellSelector.columnId;
            }

            me.scrollRowIntoView(cellSelector.id, options);
        }

        // Disable auto stepping into the focused cell.
        me.disableActionable = disableActionable;

        // Go through select pathway upon focus
        me.selectOnFocus = doSelect;

        // Focus the location's target, be it a cell, or an interior element.
        // The onFocusIn element in this module responds to this.
        cellSelector[disableActionable ? 'cell' : 'target']?.focus();

        me.disableActionable = me.selectOnFocus = false;

        return cellSelector;
    }

    blurCell(cellSelector) {
        const me   = this,
            cell = me.getCell(cellSelector);

        if (cell) {
            cell.classList.remove('b-focused');
        }
    }

    clearFocus(fullClear) {
        const me = this;

        if (me._focusedCell) {
            // set last to have focus return to previous cell when alt tabbing
            me.lastFocusedCell = fullClear ? null : me._focusedCell;

            me.blurCell(me._focusedCell);
            me._focusedCell = null;
        }
    }

    /**
     * Selects the cell before or after currently focused cell.
     * @private
     * @param next Specify true to select the next cell, false to select the previous
     * @param {Event} [event] Optionally, the UI event which caused navigation.
     * @returns {Object} Used cell selector
     */
    internalNextPrevCell(next = true, event) {
        const
            me           = this,
            cellSelector = me._focusedCell;

        if (cellSelector) {
            me.navigationEvent = event;

            return me.focusCell({
                id       : cellSelector.id,
                columnId : me.columns.getAdjacentVisibleLeafColumn(cellSelector.columnId, next, true).id
            }, {
                doSelect : true,
                event
            });
        }
        return null;
    }

    /**
     * Select the cell after the currently focused one.
     * @param {Event} [event] Optionally, the UI event which caused navigation.
     * @returns {Object} Cell selector
     */
    navigateRight(event) {
        return this.internalNextPrevCell(!this.rtl, event);
    }

    /**
     * Select the cell before the currently focused one.
     * @param {Event} [event] Optionally, the UI event which caused navigation.
     * @returns {Object} Cell selector
     */
    navigateLeft(event) {
        return this.internalNextPrevCell(this.rtl, event);
    }

    //endregion

    //region Row

    /**
     * Selects the next or previous record in relation to the current selection. Scrolls into view if outside.
     * @private
     * @param next Next record (true) or previous (false)
     * @param {Boolean} skipSpecialRows True to not return specialRows like headers
     * @param {Event} [event] Optionally, the UI event which caused navigation.
     * @returns {Object|Boolean} Selection context for the focused row (& cell) or false if no selection was made
     */
    internalNextPrevRow(next, skipSpecialRows = true, event, moveToHeader = true) {
        const
            me   = this,
            cell = me._focusedCell;

        if (!cell) return false;

        const record = me.store[`get${next ? 'Next' : 'Prev'}`](cell.id, false, skipSpecialRows);

        if (record) {
            return me.focusCell({
                id       : record.id,
                columnId : cell.columnId,
                scroll   : {
                    x : false
                }
            }, {
                doSelect : true,
                event
            });
        }
        else if (!next && moveToHeader) {
            this.clearFocus();
            return this.getHeaderElement(cell.columnId).focus();
        }
    }

    /**
     * Navigates to the cell below the currently focused cell
     * @param {Event} [event] Optionally, the UI event which caused navigation.
     * @returns {Object} Selector for focused row (& cell)
     */
    navigateDown(event) {
        event?.preventDefault();
        return this.internalNextPrevRow(true, false, event);
    }

    /**
     * Navigates to the cell above the currently focused cell
     * @param {Event} [event] Optionally, the UI event which caused navigation.
     * @returns {Object} Selector for focused row (& cell)
     */
    navigateUp(event) {
        event?.preventDefault();
        return this.internalNextPrevRow(false, true, event);
    }

    //endregion

    // This does not need a className on Widgets.
    // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
    // to the Widget it's mixed in to should implement thus.
    get widgetClass() {}
};
