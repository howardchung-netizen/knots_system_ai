//TODO: Should listen for store search also, to work the other way around
//TODO: Buggy sometimes, try searching for Barcelona tigers, navigate using buttons
//TODO: Allow regex
//TODO: Optional case sensitive
//TODO: build in UI, popup with keyboard shortcut?

import DomHelper from '../../Core/helper/DomHelper.js';
import InstancePlugin from '../../Core/mixin/InstancePlugin.js';
import DomDataStore from '../../Core/data/DomDataStore.js';
import GridFeatureManager from './GridFeatureManager.js';
import Delayable from '../../Core/mixin/Delayable.js';
import StringHelper from '../../Core/helper/StringHelper.js';

/**
 * @module Grid/feature/Search
 */

/**
 * Feature that allows the user to search the entire grid. Navigate between hits using the
 * keyboard, [f3] or [ctrl]/[cmd] + [g] moves to next, also pressing [shift] moves to previous.
 *
 * Note that this feature does not include a UI, please build your own and call appropriate methods in the feature. For
 * a demo implementation, see
 * <a href="../examples/search" target="_blank">Search example</a>.
 *
 * This feature is <strong>disabled</strong> by default.
 *
 * @extends Core/mixin/InstancePlugin
 *
 * @example
 * // enable Search
 * let grid = new Grid({
 *   features: {
 *     search: true
 *   }
 * });
 *
 * // perform search
 * grid.features.search.search('steve');
 *
 * @demo Grid/search
 * @classtype search
 * @inlineexample Grid/feature/Search.js
 * @feature
 */
export default class Search extends Delayable(InstancePlugin) {
    //region Init

    static get $name() {
        return 'Search';
    }

    static get configurable() {
        return {
            limit : 1000
        };
    }

    static get properties() {
        return {
            hitCls          : 'b-search-hit',
            hitCellCls      : 'b-search-hit-cell',
            hitCellBadgeCls : 'b-search-hit-cell-badge',
            hitTextCls      : 'b-search-hit-text',

            hitColumns : new Set()
        };
    }

    construct(grid, config) {
        const me = this;

        super.construct(grid, config);

        Object.assign(me, {
            grid,
            find       : '',
            hitEls     : [],
            treeWalker : grid.setupTreeWalker(grid.element, NodeFilter.SHOW_TEXT, () => NodeFilter.FILTER_ACCEPT, false)
        });

        // When new nodes appear due to node expand, include them in the search
        grid.on({
            expandNode : 'onTreeNodeExpand',
            thisObj    : me
        });
    }

    onTreeNodeExpand() {
        if (this.find) {
            this.requestAnimationFrame(this.search, [this.find, false, true]);
        }
    }

    doDestroy() {
        this.clear(true);
        super.doDestroy();
    }

    doDisable(disable) {
        if (disable) {
            this.clear();
        }

        super.doDisable(disable);
    }

    get store() {
        return this.grid.store;
    }

    //endregion

    //region Plugin config

    // Plugin configuration. This plugin chains some of the functions in Grid.
    static get pluginConfig() {
        return {
            chain : ['populateCellMenu', 'onElementKeyDown']
        };
    }

    //endregion

    //region Search

    /**
     * Performs a search and highlights hits.
     * @param {String} find Text to search for
     * @param {Boolean} gotoHit Go to first hit after search
     * @param {Boolean} reapply Pass true to force search
     */
    search(find, gotoHit = true, reapply = false) {
        const me = this;

        // empty search considered a clear
        if (!find) {
            return me.clear();
        }

        // searching for same thing again, do nothing
        if (!reapply && find === me.find || me.disabled) {
            return;
        }

        const
            { grid, store } = me,
            // Only search columns in use
            columns         = grid.columns.visibleColumns.filter(col => col.searchable !== false),
            fields          = columns.map(col => col.field),
            found           = store.search(find, fields);

        // Only keep first result for merged cells
        for (const column of columns) {
            if (column.mergeCells && column.isSorted) {
                let prevValue = null;

                for (const hit of found.slice()) {
                    if (hit.field === column.field) {
                        const value = hit.data[hit.field];
                        if (value === prevValue) {
                            found.splice(found.indexOf(hit), 1);
                        }
                        prevValue = value;
                    }
                }
            }
        }

        let i = 1;

        Object.assign(me, {
            foundMap  : {},
            prevFound : me.found,
            found,
            find,
            findRe    : new RegExp(`(\\s+)?(${StringHelper.escapeRegExp(String(find))})(\\s+)?`, 'ig')
        });

        me.clearHits();

        if (!found) {
            return;
        }

        // columns from previous search, reset htmlEncode
        me.hitColumns.forEach(col => {
            col.disableHtmlEncode = false;
        });

        me.hitColumns.clear();

        // highlight hits for visible cells
        for (const hit of found) {
            me.foundMap[hit.field + '-' + hit.id] = i++;

            // disable htmlEncode for columns with hits
            const column = grid.columns.get(hit.field);

            if (column && !me.hitColumns.has(column)) {
                column.disableHtmlEncode = true;
                me.hitColumns.add(column);
            }

            // limit hits
            if (i > me.limit) {
                break;
            }
        }

        if (!me.listenersInitialized) {
            grid.rowManager.on({
                name       : 'renderCell',
                renderCell : 'renderCell',
                thisObj    : me
            });
            store.on({
                name                                : 'storeRefresh',
                [`refresh${grid.asyncEventSuffix}`] : 'onStoreRefresh',
                thisObj                             : me
            });
            me.listenersInitialized = true;
        }

        grid.refreshRows();

        grid.trigger('search', { grid, find, found });

        if (gotoHit && !me.isHitFocused) {
            me.gotoNextHit(true);
        }

        return found;
    }

    clearHits() {
        // clear old hits
        for (const cellElement of DomHelper.children(this.grid.element, '.' + this.hitCls)) {
            cellElement.classList.remove(this.hitCls, this.hitCellCls);

            // rerender cell to remove search-hit-text
            const row = DomDataStore.get(cellElement).row;

            // Need to force replace the markup
            row.forceInnerHTML = true;
            row.renderCell(cellElement);
            row.forceInnerHTML = false;
        }
    }

    /**
     * Clears search results.
     */
    clear(silent = false) {
        const
            me       = this,
            { grid } = me;

        if (me.foundMap) {
            delete me.foundMap;
        }

        delete me.find;

        me.clearHits();

        if (me.listenersInitialized) {
            this.detachListeners('renderCell');
            this.detachListeners('storeRefresh');
            me.listenersInitialized = false;
        }

        if (!silent) {
            grid.trigger('clearSearch', { grid });
        }
    }

    /**
     * Number of results found
     * @readonly
     * @property {Number}
     */
    get foundCount() {
        return this.found?.length ?? 0;
    }

    //endregion

    //region Navigation

    /**
     * Returns true if focused row is a hit
     * @property {Boolean}
     * @readonly
     */
    get isHitFocused() {
        const
            me              = this,
            { grid }        = me,
            { focusedCell } = grid;

        if (focusedCell?.cell.contains(DomHelper.getActiveElement(grid.element))) {
            const
                currentIndex  = focusedCell.rowIndex,
                currentColumn = focusedCell.column;

            return currentIndex !== -1 && me.found.some(hit =>
                hit.index === currentIndex && currentColumn && hit.field === currentColumn.field
            );
        }
    }

    /**
     * Select the next hit, scrolling it into view. Triggered with [f3] or [ctrl]/[cmd] + [g].
     */
    gotoNextHit(fromStart = false) {
        const me = this;

        if (!me.found?.length) return;

        const
            { grid }     = me,
            fromCell     = grid.focusedCell || grid.lastFocusedCell,
            currentIndex = fromCell && !fromStart ? grid.store.indexOf(fromCell.id) : -1,
            nextHit      = me.found.findIndex(hit => hit.index > currentIndex);

        if (nextHit !== -1) {
            me.gotoHit(nextHit);
        }
    }

    /**
     * Select the previous hit, scrolling it into view. Triggered with [shift] + [f3] or [shift] + [ctrl]/[cmd] + [g].
     */
    gotoPrevHit() {
        const me = this;

        if (!me.found?.length) return;

        const
            { grid, found } = me,
            fromCell        = grid.focusedCell || grid.lastFocusedCell,
            currentIndex    = fromCell ? grid.store.indexOf(fromCell.id) : 0;

        for (let i = found.length - 1; i--; i >= 0) {
            const hit = found[i];
            if (hit.index < currentIndex) {
                me.gotoHit(i);
                break;
            }
        }
    }

    /**
     * Go to specified hit.
     * @param {Number} index
     */
    gotoHit(index) {
        const
            { grid } = this,
            nextHit  = this.found[index];

        if (nextHit) {
            grid.focusCell({
                field : nextHit.field,
                id    : nextHit.id
            });
        }

        return Boolean(nextHit);
    }

    /**
     * Go to the first hit.
     */
    gotoFirstHit() {
        this.gotoHit(0);
    }

    /**
     * Go to the last hit.
     */
    gotoLastHit() {
        this.gotoHit(this.found.length - 1);
    }

    //endregion

    //region Render

    /**
     * Called from SubGrid when a cell is rendered. Highlights search hits.
     * @private
     */
    renderCell({ cellElement, column, record, value }) {
        const
            me             = this,
            {
                treeWalker,
                findRe,
                hitTextCls
            } = me,
            hitIndex       = me.foundMap?.[column.field + '-' + record.id];

        if (hitIndex) {
            // highlight cell
            cellElement.classList.add(me.hitCls);

            // highlight in cell if found in innerHTML
            const inner = DomHelper.down(cellElement, '.b-grid-cell-value,.b-tree-cell-value') || cellElement;

            if (String(value).toLowerCase() === String(me.find).toLowerCase()) {
                inner.innerHTML = `<span class="${me.hitTextCls}">${inner.innerHTML}</span><div class="${me.hitCellBadgeCls}">${hitIndex}</div>`;
            }
            // Replace every occurrence of the text in every descendant text node with a span
            // encapsulating the matched string.
            else {
                treeWalker.currentNode = inner;
                for (let textNode = treeWalker.nextNode(); textNode && inner.contains(textNode);) {
                    const
                        nodeToReplace = textNode,
                        textContent   = textNode.nodeValue,
                        newText       = ['<span>'];

                    // Move onto next text node before we replace the node with a highlihght HTML sequence
                    textNode = treeWalker.nextNode();

                    let offset = findRe.lastIndex;

                    // Convert textContent into an innerHTML string which htmlEncodes the text and embeds
                    // a highlighting span which contains the target text.
                    for (let match = findRe.exec(textContent); match; match = findRe.exec(textContent)) {
                        const
                            preamble    = textContent.substring(offset, match.index),
                            spaceBefore = match[1] ? '\xa0' : '',
                            v           = match[2],
                            spaceAfter  = match[3] ? '\xa0' : '';
    
                        newText.push(`${StringHelper.encodeHtml(preamble)}${spaceBefore}<span class="${hitTextCls}">${v}</span>${spaceAfter}`);
                        offset = findRe.lastIndex;
                    }
    
                    newText.push(StringHelper.encodeHtml(textContent.substring(offset)), '<span>');
    
                    // Insert a fragment with each match wrapped with a span.
                    nodeToReplace.parentNode.insertBefore(DomHelper.createElementFromTemplate(newText.join(''), {
                        fragment : true
                    }), nodeToReplace);
                    nodeToReplace.remove();
                }
                DomHelper.createElement({
                    parent    : cellElement,
                    className : me.hitCellBadgeCls,
                    text      : hitIndex
                });
            }

            me.hitEls.push(cellElement);
        }
    }

    //endregion

    //region Context menu

    /**
     * Add search menu item to cell context menu.
     * @param {Object} options Contains menu items and extra data retrieved from the menu target.
     * @param {Grid.column.Column} options.column Column for which the menu will be shown
     * @param {Core.data.Model} options.record Record for which the menu will be shown
     * @param {Object} options.items A named object to describe menu items
     * @internal
     */
    populateCellMenu({ column, record, items }) {
        const me = this;

        if (column.searchable) {
            items.search = {
                text        : 'L{searchForValue}',
                localeClass : me,
                icon        : 'b-fw-icon b-icon-search',
                cls         : 'b-separator',
                weight      : 200,
                disabled    : me.disabled,
                onItem      : () => {
                    // TODO: Only extract selection from current cell instead? Lazy way for now
                    let sel = globalThis.getSelection().toString();

                    if (!sel) {
                        sel = record[column.field];
                    }

                    me.search(sel);
                }
            };
        }
    }

    //endregion

    //region Events

    /**
     * Chained function called on grids keydown event. Handles backspace, escape, f3 and ctrl/cmd + g keys.
     * @private
     * @param event KeyboardEvent
     */
    onElementKeyDown(event) {
        const me = this;

        if (me.find && me.find !== '') {
            if (event.key === 'F3' || (event.key.toLowerCase() === 'g' && (event.ctrlKey || event.metaKey))) {
                event.preventDefault();

                if (event.shiftKey) {
                    me.gotoPrevHit();
                }
                else {
                    me.gotoNextHit();
                }
            }
        }
    }

    onStoreRefresh() {
        this.search(this.find, false, true);
    }

    //endregion
}

Search.featureClass = 'b-search';

GridFeatureManager.registerFeature(Search);
