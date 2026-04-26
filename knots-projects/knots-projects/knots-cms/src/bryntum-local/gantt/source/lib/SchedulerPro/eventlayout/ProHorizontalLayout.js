import Base from '../../Core/Base.js';

const sortFn = (a, b) => {
    if (a < b) {
        return -1;
    }
    else if (a > b) {
        return 1;
    }
    else {
        return 0;
    }
};

/**
 * @module SchedulerPro/eventlayout/ProHorizontalLayout
 */

/**
 * Mixin for SchedulerPro horizontal layouts ({@link SchedulerPro.eventlayout.ProHorizontalLayoutPack} and
 * {@link SchedulerPro.eventlayout.ProHorizontalLayoutStack}). Should not be used directly, instead specify
 * {@link Scheduler.view.mixin.SchedulerEventRendering#config-eventLayout} in the SchedulerPro config (`stack`, `pack`
 * or `none`):
 *
 * ```javascript
 * new SchedulerPro({
 *   eventLayout: 'stack'
 * });
 * ```
 *
 * ## Grouping events
 *
 * By default events are not grouped and are laid out inside the row using start and end dates. Using
 * {@link #config-groupBy} config you can group events inside the resource row. Every group will be laid out on its own
 * band, as if layout was applied to each group of events separately.
 *
 * {@inlineexample SchedulerPro/eventlayout/ProHorizontalLayout.js}
 *
 * ### By field value
 *
 * You can specify field name to group events by. The following snippet would put *high* prio events at the top:
 *
 * ```javascript
 * new SchedulerPro({
 *     eventLayout : {
 *         type    : 'stack',
 *         groupBy : 'prio'
 *     },
 *     project : {
 *         eventsData : [
 *             { id : 1, startDate : '2017-02-08', duration : 1, prio : 'low' },
 *             { id : 2, startDate : '2017-02-09', duration : 1, prio : 'high' },
 *             { id : 3, startDate : '2017-02-10', duration : 1, prio : 'high' },
 *         ],
 *         resourcesData : [
 *             { id : 1, name : 'Resource 1' }
 *         ],
 *         assignmentsData : [
 *             { id : 1, resource : 1, event : 1 },
 *             { id : 2, resource : 1, event : 2 },
 *             { id : 3, resource : 1, event : 3 }
 *         ]
 *     }
 * })
 * ```
 *
 * ### Order of groups
 *
 * Groups are **always** sorted ascending. In the example above *high* prio events are above *low* prio events because:
 *
 * ```javascript
 * 'high' < 'low' // true
 * ```
 *
 * If you want to group events in a specific order, you can define it in a
 * special {@link #config-weights} config:
 *
 * ```javascript
 * new SchedulerPro({
 *     eventLayout : {
 *         type    : 'stack',
 *         weights : {
 *             low  : 100,
 *             high : 200
 *         },
 *         groupBy : 'prio'
 *     }
 * });
 * ```
 *
 * This will put *low* prio events at the top.
 *
 * The weight value defaults to `Infinity` unless specified in the weights config explicitly.
 *
 * ### Using a function
 *
 * You can use a custom function to group events. The group function receives an event record as a single argument and
 * is expected to return a non-null value for the group. This allows you to arrange events in any order you like,
 * including grouping by multiple properties at once.
 *
 * The snippet below groups events by duration and priority by creating 4 weights:
 *
 * |       | high prio | low prio |
 * |-------|-----------|----------|
 * | long  |     2     |    10    |
 * | short |     3     |    15    |
 *
 * ```javascript
 * new SchedulerPro({
 *     eventLayout : {
 *         type    : 'stack',
 *         groupBy : event => {
 *             return (event.duration > 2 ? 2 : 3) * (event.prio === 'high' ? 1 : 5);
 *         }
 *     }
 * })
 * ```
 *
 * This will divide events into 4 groups as seen in this demo:
 *
 * {@inlineexample SchedulerPro/eventlayout/ProHorizontalLayout2.js}
 *
 * ## Manual event layout
 *
 * You can provide a custom function to layout events inside the row and set the row size as required using
 * {@link #config-layoutFn}. The function is called with an array of {@link EventRenderData render data} objects. The
 * custom function can iterate over those objects and position them inside the row using `top` and `height` attributes.
 * The function should return the total row height in pixels.
 *
 * Please note that using a custom layout function makes {@link SchedulerPro.view.SchedulerPro#config-rowHeight}
 * obsolete.
 *
 * {@inlineexample SchedulerPro/eventlayout/ProHorizontalLayoutFn.js}
 *
 * ```javascript
 * new SchedulerPro({
 *     eventLayout : {
 *         layoutFn : items => {
 *             // Put event element at random top position
 *             item.top = 100 * Math.random();
 *         }
 *     }
 * });
 * ```
 *
 * @mixin
 */
export default Target => class ProHorizontalLayout extends (Target || Base) {
    static get configurable() {
        return {
            /**
             * Type of horizontal layout. Supported values are `stack`, `pack` and `none`.
             * @config {String}
             */
            type : null,

            /**
             * The weights config allows you to specify order of the event groups inside the row. Higher weights are
             * placed further down in the row. If field value is not specified in the weights object, it will be
             * assigned `Infinity` value and pushed to the bottom.
             *
             * Only applicable when {@link #config-groupBy} config is not a function:
             *
             * ```javascript
             * new SchedulerPro({
             *     eventLayout : {
             *         type    : 'stack',
             *         weights : {
             *             // Events with high prio will be placed at the top, then medium,
             *             // then low prio events.
             *             high   : 100,
             *             medium : 150,
             *             low    : 200
             *         },
             *         groupBy : 'prio'
             *     }
             * });
             * ```
             *
             * Only explicitly defined groups are put in separate bands inside the row:
             *
             * ```javascript
             * new SchedulerPro({
             *     eventLayout : {
             *         // Pack layout is supported too
             *         type : 'pack',
             *         weights : {
             *             // Events with high prio will be placed at the top. All other
             *             // events will be put to the same group at the bottom
             *             high : 100
             *         },
             *         groupBy : 'prio'
             *     }
             * });
             * ```
             * @config {Object}
             */
            weights : null,

            /**
             * Specifies a way to group events inside the row. Can accept either a model field name or a function which
             * is provided with event record as a single argument and is expected to return group for the event.
             *
             * @config {String|Function}
             */
            groupBy        : null,
            groupByThisObj : null,

            /**
             * Supply a function to manually layout events. It accepts event layout data and should set `top`
             * and `height` for every provided data item (left and width are calculated according to the event start
             * date and duration). The function should return the total row height in pixels.
             *
             * For example, we can arrange events randomly in the row:
             * ```javascript
             * new SchedulerPro({
             *     eventLayout : {
             *         layoutFn : items => {
             *             item.top = Math.round(Math.random() * 100);
             *             item.height = Math.round(Math.random() * 100);
             *
             *             return 50;
             *         }
             *     }
             * })
             * ```
             *
             * @config {Function}
             * @param {EventRenderData[]} events Array of event render data.
             * @returns {Number} Returns total row height
             */
            layoutFn : null
        };
    }

    /**
     * This method performs layout on an array of event render data and returns amount of _bands_. Band is a multiplier of a
     * configured {@link Scheduler.view.Scheduler#config-rowHeight} to calculate total row height required to fit all
     * events.
     * This method should not be used directly, it is called by the Scheduler during the row rendering process.
     * @method applyLayout
     * @param {EventRenderData[]} events
     * @param {Scheduler.model.ResourceModel} resource
     * @return {Number}
     */

    /**
     * This method iterates over events and calculates top position for each of them. Default layouts calculate
     * positions to avoid events overlapping horizontally (except for the 'none' layout). Pack layout will squeeze events to a single
     * row by reducing their height, Stack layout will increase the row height and keep event height intact.
     * This method should not be used directly, it is called by the Scheduler during the row rendering process.
     * @method layoutEventsInBands
     * @param {EventRenderData[]} events
     */

    /**
     * Returns `true` if event {@link #config-groupBy grouper} is defined.
     * @type {Boolean}
     * @readonly
     */
    get grouped() {
        return Boolean(this.groupBy);
    }

    /**
     * Returns group for the passed event render data.
     * @param {EventRenderData} layoutData
     * @return {*}
     */
    getGroupValue(layoutData) {
        let result;

        if (layoutData.group != null) {
            result = layoutData.group;
        }
        else {
            const
                { groupBy, weights, groupByThisObj = this } = this,
                { eventRecord }                             = layoutData;

            if (typeof groupBy === 'function') {
                result = groupBy.call(groupByThisObj, eventRecord);
            }
            else {
                result = eventRecord[groupBy];

                if (weights) {
                    // If record value is null or undefined, use infinite weight to move record to the bottom
                    result = weights[result] ?? Infinity;
                }
            }

            layoutData.group = result;
        }

        return result;
    }

    /**
     * Sorts events by group and returns ordered array of groups, or empty array if events are not grouped.
     * @param {EventRenderData[]} events
     * @return {String[]}
     */
    getEventGroups(events) {
        // If group fn is defined, we need to sort events array according to groups
        if (this.grouped) {
            const groups = new Set();

            events.sort((a, b) => {
                const
                    aValue = this.getGroupValue(a),
                    bValue = this.getGroupValue(b);

                groups.add(aValue);
                groups.add(bValue);

                return sortFn(aValue, bValue);
            });

            return Array.from(groups).sort(sortFn);
        }
        else {
            return [];
        }
    }
};
