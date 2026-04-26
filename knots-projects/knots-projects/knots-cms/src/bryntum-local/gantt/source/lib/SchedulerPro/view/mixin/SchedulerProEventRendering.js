import Base from '../../../Core/Base.js';
import ProHorizontalLayoutStack from '../../eventlayout/ProHorizontalLayoutStack.js';
import ProHorizontalLayoutPack from '../../eventlayout/ProHorizontalLayoutPack.js';

/**
 * @module SchedulerPro/view/mixin/SchedulerProEventRendering
 */

/**
 * Config for event layout
 * @typedef {Object} EventLayoutConfig
 * @property {String} type Event layout type. Possible values for horizontal mode are `stack`, `pack` and `none`.
 * For vertical mode: `pack`, `mixed` and `none`.
 * @property {Function} layoutFn Horizontal mode only. This function allows to manually position events inside the row.
 * @property {Object} weights Horizontal mode only. Specifies groups order.
 * @property {String|Function} groupBy Horizontal mode only. Specifies a way to group events inside a row.
 */

/**
 * Functions to handle event rendering in Scheduler Pro (EventModel -> dom elements).
 *
 * @mixin
 */
export default Target => class SchedulerProEventRendering extends (Target || Base) {
    static get $name() {
        return 'SchedulerProEventRendering';
    }

    static get configurable() {
        return {
            /**
             * Get/set overlap mode. See {@link #config-eventLayout} config, valid values are `stack` (horizontal), `pack`, `mixed`
             * (vertical) and `none`
             * @member {String} eventLayout
             * @accepts {String|Object}
             * @category Scheduled events
             */
            /**
             * This config defines how to handle overlapping events. Valid values are:
             * - `stack`, adjusts row height (only horizontal)
             * - `pack`, adjusts event height
             * - `mixed`, allows two events to overlap, more packs (only vertical)
             * - `none`, allows events to overlap
             *
             * You can also provide a configuration object accepted by
             * {@link SchedulerPro.eventlayout.ProHorizontalLayout} to group events or even take control over the
             * layout (i.e. vertical position and height):
             *
             * To group events:
             *
             * ```javascript
             * new SchedulerPro({
             *     eventLayout : {
             *         type    : 'stack',
             *         weights : {
             *             high   : 100,
             *             normal : 150,
             *             low    : 200
             *         },
             *         groupBy : 'prio'
             *     }
             * });
             * ```
             *
             * To take control over the layout:
             *
             * ```javascript
             * new SchedulerPro({
             *     eventLayout : {
             *         layoutFn : items => {
             *             items.forEach(item => {
             *                 item.top = 100 * Math.random();
             *                 item.height = 100 * Math.random();
             *             });
             *
             *             return 100;
             *         }
             *     }
             * });
             * ```
             *
             * For more info on grouping and layout please refer to {@link SchedulerPro.eventlayout.ProHorizontalLayout}
             * doc article.
             *
             * @config {String|EventLayoutConfig}
             * @default
             * @category Scheduled events
             */
            eventLayout : 'stack',

            /**
             * The class responsible for the packing horizontal event layout process.
             * Override this to take control over the layout process.
             * @config {Scheduler.eventlayout.HorizontalLayout}
             * @typings {typeof HorizontalLayout}
             * @default
             * @private
             * @category Misc
             */
            horizontalLayoutPackClass : ProHorizontalLayoutPack,

            /**
             * The class name responsible for the stacking horizontal event layout process.
             * Override this to take control over the layout process.
             * @config {Scheduler.eventlayout.HorizontalLayout}
             * @typings {typeof HorizontalLayout}
             * @default
             * @private
             * @category Misc
             */
            horizontalLayoutStackClass : ProHorizontalLayoutStack
        };
    }

    //region Config

    updateInternalEventLayout(eventLayout, oldEventLayout) {
        const me = this;

        if (!me.isConfiguring) {
            me.clearLayouts();
        }

        super.updateInternalEventLayout(eventLayout, oldEventLayout);
    }

    //endregion

    getEventLayout(config) {
        config = super.getEventLayout(config);

        if ('layoutFn' in config) {
            config.type = 'layoutFn';
        }

        return config;
    }

    clearLayouts() {
        const me = this;

        if (me.layouts) {
            for (const key in me.layouts) {
                me.layouts[key].destroy();
                delete me.layouts[key];
            }
        }
    }

    /**
     * Get event layout handler. The handler decides the vertical placement of events within a resource.
     * Returns null if no eventLayout is used (if {@link #config-eventLayout} is set to "none")
     * @internal
     * @returns {Scheduler.eventlayout.HorizontalLayout}
     * @readonly
     * @category Scheduled events
     */
    getEventLayoutHandler(eventLayout) {
        const me = this;

        if (!me.isHorizontal) {
            return null;
        }

        const { timeAxisViewModel, horizontal } = me;

        if (!me.layouts) {
            me.layouts = {};
        }

        const { layouts } = me;

        switch (eventLayout.type) {
            // stack, adjust row height to fit all events
            case 'stack': {
                if (!layouts.horizontalStack) {
                    layouts.horizontalStack = me.horizontalLayoutStackClass.new({
                        scheduler                   : me,
                        timeAxisViewModel,
                        bandIndexToPxConvertFn      : horizontal.layoutEventVerticallyStack,
                        bandIndexToPxConvertThisObj : horizontal,
                        groupByThisObj              : me
                    }, eventLayout);
                }

                return layouts.horizontalStack;
            }
            // pack, fit all events in available height by adjusting their height
            case 'pack': {
                if (!layouts.horizontalPack) {
                    layouts.horizontalPack = me.horizontalLayoutPackClass.new({
                        scheduler                   : me,
                        timeAxisViewModel,
                        bandIndexToPxConvertFn      : horizontal.layoutEventVerticallyPack,
                        bandIndexToPxConvertThisObj : horizontal,
                        groupByThisObj              : me
                    }, eventLayout);
                }

                return layouts.horizontalPack;
            }
            case 'layoutFn': {
                // Both methods are called on a layout
                return {
                    type                : 'layoutFn',
                    applyLayout         : eventLayout.layoutFn,
                    layoutEventsInBands : eventLayout.layoutFn
                };
            }
            default:
                return null;
        }
    }

    get widgetClass() {}
};
