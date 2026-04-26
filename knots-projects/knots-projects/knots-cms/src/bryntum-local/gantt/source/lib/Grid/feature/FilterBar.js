/* eslint-disable no-unused-expressions */
import ArrayHelper from '../../Core/helper/ArrayHelper.js';
import ObjectHelper from '../../Core/helper/ObjectHelper.js';
import WidgetHelper from '../../Core/helper/WidgetHelper.js';
import InstancePlugin from '../../Core/mixin/InstancePlugin.js';
import '../../Core/widget/NumberField.js';
import '../../Core/widget/Combo.js';
import '../../Core/widget/DateField.js';
import '../../Core/widget/TimeField.js';
import GridFeatureManager from './GridFeatureManager.js';
import CollectionFilter from '../../Core/util/CollectionFilter.js';

/**
 * @module Grid/feature/FilterBar
 */

/**
 * Feature that allows filtering of the grid by entering filters on column headers.
 * The actual filtering is done by the store.
 * For info on programmatically handling filters, see {@link Core.data.mixin.StoreFilter StoreFilter}.
 *
 * {@inlineexample Grid/feature/FilterBar.js}
 *
 * ```javascript
 * // filtering turned on but no initial filter
 * const grid = new Grid({
 *   features: {
 *     filterBar : true
 *   }
 * });
 *
 * // using initial filter
 * const grid = new Grid({
 *   features : {
 *     filterBar : { filter: { property : 'city', value : 'Gavle' } }
 *   }
 * });
 * ```
 *
 * ## Enabling filtering for a column
 * The individual filterability of columns is defined by a `filterable` property on the column which defaults to `true`.
 * If `false`, that column is not filterable. Note: If you have multiple columns configured with the same `field` value,
 * assign an {@link Core.data.Model#field-id} to the columns to ensure filters work correctly.
 *
 * The property value may also be a custom filter function.
 *
 * The property value may also be an object which may contain the following two properties:
 *  - **filterFn** : `Function` A custom filtering function
 *  - **filterField** : `Object` A config object for the filter value input field. See {@link Core.widget.TextField} or
 *  the other field widgets for reference.
 *
 * ```javascript
 * // Custom filtering function for a column
 * const grid = new Grid({
 *   features : {
 *     filterBar : true
 *   },
 *
 *   columns: [
 *      {
 *        field      : 'age',
 *        text       : 'Age',
 *        type       : 'number',
 *        // Custom filtering function that checks "greater than"
 *        filterable : ({ record, value }) => record.age > value
 *      },
 *      {
 *        field : 'name',
 *        // Filterable may specify a filterFn and a config for the filtering input field
 *        filterable : {
 *          filterFn : ({ record, value }) => record.name.toLowerCase().indexOf(value.toLowerCase()) !== -1,
 *          filterField : {
 *            emptyText : 'Filter name'
 *          }
 *        }
 *      },
 *      {
 *        field : 'city',
 *        text : 'Visited',
 *        flex : 1,
 *        // Filterable with multiselect combo to pick several items to filter
 *        filterable : {
 *          filterField : {
 *            type        : 'combo',
 *            multiSelect : true,
 *            items       : ['Barcelona', 'Moscow', 'Stockholm']
 *          }
 *        }
 *      }
 *   ]
 * });
 * ```
 *
 * If this feature is configured with `prioritizeColumns : true`, those functions will also be used when filtering
 * programmatically:
 *
 * ```javascript
 * const grid = new Grid({
 *    features : {
 *        filterBar : {
 *            prioritizeColumns : true
 *        }
 *    },
 *
 *    columns: [
 *        {
 *          field      : 'age',
 *          text       : 'Age',
 *          type       : 'number',
 *          // Custom filtering function that checks "greater than" no matter
 *          // which field user filled in :)
 *          filterable : ({ record, value, operator }) => record.age > value
 *        }
 *    ]
 * });
 *
 * // Will be used when filtering programmatically or using the UI
 * grid.store.filter({
 *     property : 'age',
 *     value    : 41
 * });
 * ```
 *
 * ## Filtering using a multiselect combo
 *
 * To filter the grid by choosing values which should match with the store data, use a {@link Core.widget.Combo}, and configure
 * your grid like so:
 *
 * ```javascript
 * const grid = new Grid({
 *    features : {
 *        filterBar : true
 *    },
 *
 *    columns : [
 *        {
 *            id         : 'name',
 *            field      : 'name',
 *            text       : 'Name',
 *            filterable : {
 *                filterField : {
 *                    type         : 'combo',
 *                    multiSelect  : true,
 *                    valueField   : 'name',
 *                    displayField : 'name'
 *                }
 *            }
 *        }
 *    ]
 * });
 * ```
 *
 * You can also filter the {@link Core.widget.Combo} values, for example to filter out empty values. Example:
 *
 * ```javascript
 * const grid = new Grid({
 *    features : {
 *        filterBar : true
 *    },
 *
 *    columns : [
 *        {
 *            text       : 'Airline',
 *            field      : 'airline',
 *            flex       : 1,
 *            filterable : {
 *                filterField : {
 *                    type         : 'combo',
 *                    multiSelect  : true,
 *                    valueField   : 'airline',
 *                    displayField : 'airline',
 *                    store        : {
 *                        filters : {
 *                            // Filter out empty values
 *                            filterBy : record => !!record.airline
 *                        }
 *                    }
 *                }
 *            }
 *        }
 *    ]
 * });
 * ```
 *
 * This feature is <strong>disabled</strong> by default.
 *
 * **Note:** This feature cannot be used together with {@link Grid.feature.Filter filter} feature, they are mutually
 * exclusive.
 *
 * @extends Core/mixin/InstancePlugin
 * @demo Grid/filterbar
 * @classtype filterBar
 * @feature
 */
export default class FilterBar extends InstancePlugin {
    //region Config

    static get $name() {
        return 'FilterBar';
    }

    static get configurable() {
        return {
            /**
             * Use custom filtering functions defined on columns also when programmatically filtering by the columns
             * field.
             *
             * ```javascript
             * const grid = new Grid({
             *     columns : [
             *         {
             *             field : 'age',
             *             text : 'Age',
             *             filterable({ record, value }) {
             *               // Custom filtering, return true/false
             *             }
             *         }
             *     ],
             *
             *     features : {
             *         filterBar : {
             *             prioritizeColumns : true // <--
             *         }
             *     }
             * });
             *
             * // Because of the prioritizeColumns config above, any custom
             * // filterable function on a column will be used when
             * // programmatically filtering by that columns field
             * grid.store.filter({
             *     property : 'age',
             *     value    : 30
             * });
             * ```
             *
             * @config {Boolean}
             * @default
             * @category Common
             */
            prioritizeColumns : false,

            /**
             * The delay in milliseconds to wait after the last keystroke before applying filters.
             * Set to 0 to not trigger filtering from keystrokes, requires pressing ENTER instead
             * @config {Number}
             * @default
             * @category Common
             */
            keyStrokeFilterDelay : 300,

            /**
             * Toggle compact mode. In this mode the filtering fields are styled to transparently overlay the headers,
             * occupying no additional space.
             * @member {Boolean} compactMode
             * @category Common
             */
            /**
             * Specify `true` to enable compact mode for the filter bar. In this mode the filtering fields are styled
             * to transparently overlay the headers, occupying no additional space.
             * @config {Boolean}
             * @default
             * @category Common
             */
            compactMode : false,

            // Destroying data level filters when we hiding UI is supposed to be optional someday. So far this flag is private
            clearStoreFiltersOnHide : true
        };
    }

    static get pluginConfig() {
        return {
            before : ['onElementKeyDown', 'renderContents'],
            chain  : ['afterColumnsChange', 'renderHeader', 'populateHeaderMenu', 'bindStore']
        };
    }

    static get properties() {
        return {
            filterFieldCls           : 'b-filter-bar-field',
            filterFieldInputCls      : 'b-filter-bar-field-input',
            filterableColumnCls      : 'b-filter-bar-enabled',
            filterFieldInputSelector : '.b-filter-bar-field-input',
            filterableColumnSelector : '.b-filter-bar-enabled',
            filterParseRegExp        : /^\s*([<>=*])?(.*)$/,
            storeTrackingSuspended   : 0
        };
    }

    //endregion

    //region Init

    construct(grid, config) {
        if (grid.features.filter) {
            throw new Error('Grid.feature.FilterBar feature may not be used together with Grid.feature.Filter, These features are mutually exclusive.');
        }

        const me = this;

        me.grid = grid;

        me.onColumnFilterFieldChange = me.onColumnFilterFieldChange.bind(me);

        super.construct(grid, Array.isArray(config) ? {
            filter : config
        } : config);

        me.bindStore(grid.store);

        if (me.filter) {
            const initialFilters = ArrayHelper.asArray(me.filter);

            initialFilters.forEach(config => {
                if (!config.id && config.property) {
                    const column = grid.columns.findByField('field', config.property);
                    if (column) {
                        config.id = column.field;
                    }
                }
            });
            // assign ids to filter to be able to update them correctly
            grid.store.filter(me.filter);
        }

        me.gridDetacher = grid.on('beforeelementclick', me.onBeforeElementClick, me);
    }

    bindStore(store) {
        this.detachListeners('store');

        store.on({
            name         : 'store',
            beforeFilter : 'onStoreBeforeFilter',
            filter       : 'onStoreFilter',
            thisObj      : this
        });
    }

    doDestroy() {
        this.destroyFilterBar();
        this.gridDetacher?.();

        super.doDestroy();
    }

    doDisable(disable) {
        const { columns } = this.grid;

        // Disable the fields
        columns?.forEach(column => {
            const widget = this.getColumnFilterField(column);
            if (widget) {
                widget.disabled = disable;
            }
        });

        super.doDisable(disable);
    }

    updateCompactMode(value) {
        this.client.headerContainer.classList[value ? 'add' : 'remove']('b-filter-bar-compact');

        for (const prop in this._columnFilters) {
            const field       = this._columnFilters[prop];
            field.placeholder = value ? field.column.headerText : null;
        }
    }

    //endregion

    //region FilterBar

    destroyFilterBar() {
        this.grid.columns?.forEach(this.destroyColumnFilterField, this);
    }

    /**
     * Hides the filtering fields.
     */
    hideFilterBar() {
        const me = this;

        // We don't want to hear back store "filter" event while we're resetting store filters
        me.clearStoreFiltersOnHide && me.suspendStoreTracking();

        // Hide the fields, each silently - no updating of the store's filtered state until the end
        me.grid.columns?.forEach(col => me.hideColumnFilterField(col, true));

        // Now update the filtered state
        me.grid.store.filter();

        me.clearStoreFiltersOnHide && me.resumeStoreTracking();

        me.hidden = true;
    }

    /**
     * Shows the filtering fields.
     */
    showFilterBar() {
        this.renderFilterBar();

        this.hidden = false;
    }

    /**
     * Toggles the filtering fields visibility.
     */
    toggleFilterBar() {
        if (this.hidden) {
            this.showFilterBar();
        }
        else {
            this.hideFilterBar();
        }
    }

    /**
     * Renders the filtering fields for filterable columns.
     * @private
     */
    renderFilterBar() {
        this.grid.columns.visibleColumns.forEach(column => this.renderColumnFilterField(column));
        this.rendered = true;
    }

    //endregion

    //region FilterBar fields

    /**
     * Renders text field filter in the provided column header.
     * @param {Grid.column.Column} column Column to render text field filter for.
     * @private
     */
    renderColumnFilterField(column) {
        const
            me         = this,
            { grid  }  = me,
            filterable = me.getColumnFilterable(column);

        // we render fields for filterable columns only
        if (filterable && column.isVisible) {
            const
                headerEl = column.element,
                filter   = grid.store.filters.get(column.id) || grid.store.filters.getBy('property', column.field);

            let widget = me.getColumnFilterField(column);

            // if we don't haven't created a field yet
            // we build it from scratch
            if (!widget) {
                const
                    type        = `${column.filterType || 'text'}field`,
                    externalCls = filterable.filterField?.cls;

                if (externalCls) {
                    delete filterable.filterField.cls;
                }

                widget = WidgetHelper.append(ObjectHelper.assign({
                    type,
                    cls : {
                        [me.filterFieldCls] : 1,
                        [externalCls]       : externalCls
                    },
                    // Simplifies debugging / testing
                    dataset : {
                        column : column.field
                    },
                    column,
                    owner                : grid,
                    clearable            : true,
                    name                 : column.field,
                    value                : filter && !filter._filterBy && me.buildFilterValue(filter),
                    inputCls             : me.filterFieldInputCls,
                    keyStrokeChangeDelay : me.keyStrokeFilterDelay,
                    onChange             : me.onColumnFilterFieldChange,
                    onClear              : me.onColumnFilterFieldChange,
                    disabled             : me.disabled,
                    placeholder          : me.compactMode ? column.headerText : null,
                    // Also copy formats, DateColumn, TimeColumn etc
                    format               : column.format
                }, filterable.filterField), headerEl)[0];

                // Avoid DomSync cleaning up this widget as it syncs column headers
                widget.element.retainElement = true;

                me.setColumnFilterField(column, widget);

                // If no data is provided, load values lazily from the grid store upon showing the picker list
                if (widget.isCombo && !widget.store.count) {
                    const
                        configuredValue = widget.value,
                        refreshData     = () => widget.store.data = grid.store.getDistinctValues(column.field, true).map(value => grid.store.modelClass.new({ [column.field] : value }));

                    widget.value = null;

                    if (!widget.store.isSorted) {
                        widget.store.sort({
                            field     : column.field,
                            ascending : true
                        });
                    }

                    widget.picker.on('beforeShow', refreshData);

                    refreshData();
                    widget.value = configuredValue;
                }

                // If no initial filter exists but a value was provided to the widget, filter by it
                // unless the store is configured to not autoLoad
                if (!me.filter && widget.value && grid.store.autoLoad !== false) {
                    me.onColumnFilterFieldChange({ source : widget, value : widget.value });
                }
            }
            // if we have one..
            else {
                // re-apply widget filter
                me.onColumnFilterFieldChange({ source : widget, value : widget.value });
                // re-append the widget to its parent node (in case the column header was redrawn (happens when resizing columns))
                widget.render(headerEl);
                // show widget in case it was hidden
                widget.show();
            }

            headerEl.classList.add(me.filterableColumnCls);
        }
    }

    /**
     * Fills in column filter fields with values from the grid store filters.
     * @private
     */
    updateColumnFilterFields() {
        const
            me                 = this,
            { columns, store } = me.grid;

        let field, filter;

        // During this phase we should not respond to field change events.
        // See onColumnFilterFieldChange.
        me._updatingFields = true;

        for (const column of columns.visibleColumns) {
            field = me.getColumnFilterField(column);
            if (field) {
                filter = store.filters.get(column.id) || store.filters.getBy('property', column.field);
                if (filter) {
                    // For filtering functions we keep what user typed into the field, we cannot construct a filter
                    // string from them
                    if (!filter._filterBy) {
                        field.value = me.buildFilterValue(filter);
                    }
                    else {
                        field.value = filter.value;
                    }
                }
                // No filter, clear field
                else {
                    field.value = '';
                }
            }
        }

        me._updatingFields = false;
    }

    getColumnFilterable(column) {
        if (!column.isRoot && column.filterable !== false && column.field && column.isLeaf) {
            if (typeof column.filterable === 'function') {
                column.filterable = {
                    filterFn : column.filterable
                };
            }
            return column.filterable;
        }
    }

    destroyColumnFilterField(column) {
        const widget = this.getColumnFilterField(column);

        if (widget) {
            this.hideColumnFilterField(column, true);
            // destroy filter UI field
            widget.destroy();
            // remember there is no field bound anymore
            this.setColumnFilterField(column, undefined);
        }
    }

    hideColumnFilterField(column, silent) {
        const
            me        = this,
            { store } = me.grid,
            columnEl  = column.element,
            widget    = me.getColumnFilterField(column);

        if (widget) {
            if (!me.isDestroying) {
                // hide field
                widget.hide();
            }

            if (!store.isDestroyed && me.clearStoreFiltersOnHide && column.field) {
                store.removeFilter(column.id, silent);
            }

            columnEl?.classList.remove(me.filterableColumnCls);
        }
    }

    /**
     * Returns column filter field instance.
     * @param {Grid.column.Column} column Column to get filter field for.
     * @returns {Core.widget.Widget}
     */
    getColumnFilterField(column) {
        return this._columnFilters?.[column.id];
    }

    setColumnFilterField(column, widget) {
        this._columnFilters = this._columnFilters || {};

        this._columnFilters[column.data.id] = widget;
    }

    //endregion

    //region Filters

    parseFilterValue(value) {
        if (Array.isArray(value)) {
            return {
                value
            };
        }

        const match = String(value).match(this.filterParseRegExp);

        return {
            operator : match[1] || '*',
            value    : match[2]
        };
    }

    buildFilterValue(filter) {
        return (filter.value instanceof Date || Array.isArray(filter.value)) ? filter.value : ((filter.operator === '*' || filter.operator === 'isIncludedIn') ? '' : filter.operator) + filter.value;
    }

    //endregion

    // region Events

    // Intercept filtering by a column that has a custom filtering fn, and inject that fn
    onStoreBeforeFilter({ filters }) {
        const { columns } = this.client;

        for (let i = 0; i < filters.count; i++) {
            const
                filter = filters.getAt(i),
                column = (filter.columnOwned || this.prioritizeColumns) && (filter.id && columns.getById(filter.id) || columns.get(filter.property));

            if (column.filterable?.filterFn) {
                // Cache CollectionFilter on the column to not have to recreate on each filter operation
                if (!column.$filter) {
                    column.$filter = new CollectionFilter({
                        columnOwned : true,
                        property    : filter.property,
                        id          : column.id,
                        filterBy(record) {
                            return column.filterable.filterFn({
                                value : this.value, record, property : this.property, column
                            });
                        }
                    });
                }

                // Update value used by filters filtering fn
                column.$filter.value = filter.value;
                filters.splice(i, 1, column.$filter);
            }
        }
    }

    /**
     * Fires when store gets filtered. Refreshes field values in column headers.
     * @private
     */
    onStoreFilter() {
        if (!this.storeTrackingSuspended && this.rendered) {
            this.updateColumnFilterFields();
        }
    }

    afterColumnsChange({ changes, column }) {
        // Ignore if columns change while this filter bar is hidden, or if column changeset does not include hidden
        // state
        if (!this.hidden && changes?.hidden) {
            const hidden = changes.hidden.value;

            if (hidden) {
                this.destroyColumnFilterField(column);
            }
            else {
                this.renderColumnFilterField(column);
            }
        }
    }

    suspendStoreTracking() {
        this.storeTrackingSuspended++;
    }

    resumeStoreTracking() {
        this.storeTrackingSuspended--;
    }

    /**
     * Called after headers are rendered, make headers match stores initial sorters
     * @private
     */
    renderHeader() {
        if (!this.hidden) {
            this.renderFilterBar();
        }
    }

    renderContents() {
        // Grid suspends events when restoring state, thus we are not informed about toggled columns and might end up
        // with wrong fields in headers. To prevent that, we remove all field elements here since they are restored in
        // renderColumnFilterField() later anyway
        if (this._columnFilters) {
            for (const field of Object.values(this._columnFilters)) {
                field?.element.remove();
            }
        }
    }

    onElementKeyDown(event) {
        // flagging event with handled = true used to signal that other features should probably not care about it
        if (event.handled) {
            return;
        }

        // if we are pressing left/right arrow keys while being in a filter editor
        // we set event.handled flag (otherwise other features prevent the event)
        if (event.target.matches(this.filterFieldInputSelector)) {
            switch (event.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'ArrowDown':
                case 'Enter':
                    event.handled = true;
            }
        }
    }

    onBeforeElementClick({ event }) {
        // prevent other features reacting when clicking a filter field (or any element inside it)
        if (event.target.closest(`.${this.filterFieldCls}`)) {
            return false;
        }
    }

    /**
     * Called when a column text filter field value is changed by user.
     * @param  {Core.widget.TextField} field Filter text field.
     * @param  {String} value New filtering value.
     * @private
     */
    onColumnFilterFieldChange({ source: field, value }) {
        const
            me        = this,
            { store } = me.grid;

        // Don't respond if we set the value in response to a filter
        if (me._updatingFields) {
            return;
        }

        // we don't want to hear back store "filter" event
        // so we suspend store tracking
        me.suspendStoreTracking();

        const isClearingFilter = value == null || value === '' || Array.isArray(value) && value.length === 0;

        if (!store.removeFilter(field.column.id, !isClearingFilter)) {
            // Fall back to removing it using field name, in case it was added on the store directly
            if (store.filters.get(field.name)?.columnOwned !== true) {
                store.removeFilter(field.name, !isClearingFilter);
            }
        }

        if (!isClearingFilter) {
            store.filter({
                columnOwned : true,
                property    : field.name,
                id          : field.column.id,
                ...me.parseFilterValue(value)
            });
        }

        me.resumeStoreTracking();
    }

    //endregion

    //region Menu items

    /**
     * Adds a menu item to toggle filter bar visibility.
     * @param {Object} options Contains menu items and extra data retrieved from the menu target.
     * @param {Grid.column.Column} options.column Column for which the menu will be shown
     * @param {Object} options.items A named object to describe menu items
     * @internal
     */
    populateHeaderMenu({ items }) {
        items.toggleFilterBar = {
            text        : this.hidden ? 'L{enableFilterBar}' : 'L{disableFilterBar}',
            localeClass : this,
            weight      : 120,
            icon        : 'b-fw-icon b-icon-filter',
            cls         : 'b-separator',
            onItem      : () => this.toggleFilterBar()
        };
    }

    //endregion
}

FilterBar.featureClass = 'b-filter-bar';

GridFeatureManager.registerFeature(FilterBar);
