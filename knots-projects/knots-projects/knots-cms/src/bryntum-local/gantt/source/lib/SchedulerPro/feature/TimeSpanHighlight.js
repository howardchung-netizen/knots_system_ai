import InstancePlugin from '../../Core/mixin/InstancePlugin.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import DomHelper from '../../Core/helper/DomHelper.js';
import DomSync from '../../Core/helper/DomSync.js';
import EventHelper from '../../Core/helper/EventHelper.js';

/**
 * @module SchedulerPro/feature/TimeSpanHighlight
 */

/**
 * This feature exposes methods on the owning timeline widget which you can use to highlight one or multiple time spans
 * in the schedule. Please see {@link #function-highlightTimeSpan} and {@link #function-highlightTimeSpans} to learn
 * more or try the demo below:
 *
 * {@inlineexample SchedulerPro/feature/TimeSpanHighlight.js}
 *
 * ## Example usage with Scheduler Pro
 *
 * ```javascript
 * const scheduler = new SchedulerPro({
 *     features : {
 *         timeSpanHighlight : true
 *     }
 * })
 *
 * scheduler.highlightTimeSpan({
 *      startDate : new Date(2022, 4, 1),
 *      endDate   : new Date(2022, 4, 5),
 *      name      : 'Time off'
 * });
 * ```
 * ## Example usage with Gantt
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         timeSpanHighlight : true
 *     }
 * })
 *
 * gantt.highlightTimeSpan({
 *      startDate : new Date(2022, 4, 1),
 *      endDate   : new Date(2022, 4, 5),
 *      padding   : 10, // Some "air" around the rectangle
 *      taskRecord, // You can also highlight an area specific to a Gantt task
 *      name      : 'Time off'
 * });
 * ```
 *
 * This feature is **disabled** by default.
 *
 * @extends Core/mixin/InstancePlugin
 * @classtype timeSpanHighlight
 * @feature
 * @demo SchedulerPro/highlight-time-spans
 */
export default class TimeSpanHighlight extends InstancePlugin {

    //region Config
    domConfigs = [];

    static get $name() {
        return 'TimeSpanHighlight';
    }

    static get configurable() {
        return {
            padding : 0
        };
    }

    static get pluginConfig() {
        return {
            assign : [
                'highlightTimeSpan',
                'highlightTimeSpans',
                'unhighlightTimeSpans'
            ],
            chain : [
                'onTimeAxisViewModelUpdate'
            ]
        };
    }

    //endregion

    /**
     * Highlights the region representing the passed time span and optionally for a single certain resource.
     * @on-owner
     * @param {Object} options A single options object describing the time span to highlight
     * @param {Date} options.startDate A start date constraining the region
     * @param {Date} options.endDate An end date constraining the region
     * @param {String} options.name A name to show in the highlight element
     * @param {Scheduler.model.ResourceModel} [options.resourceRecord] The resource record (applicable for Scheduler only)
     * @param {Core.data.Model} [options.taskRecord] The task record (applicable for Gantt only)
     * @param {String} [options.cls] A CSS class to add to the highlight element
     * @param {Boolean} [options.clearExisting] `false` to keep existing highlight elements
     * @param {String} [options.animationId] An id to enable animation of highlight elements
     * @param {Boolean} [options.surround] True to shade the time axis areas before and after the time span
     * (adds a `b-unavailable` CSS class which you can use for styling)
     * @param {Number} [options.padding] Inflates the non-timeaxis sides of the region by this many pixels
     */
    highlightTimeSpan(config, draw = true) {
        const
            me         = this,
            {
                startDate,
                endDate,
                resourceRecord,
                taskRecord,
                name,
                surround,
                animationId,
                padding       = me.padding,
                clearExisting = true
            }          = config,
            { client } = me;

        if (animationId) {
            DomHelper.addTemporaryClass(client.element, 'b-transition-highlight', 500);
        }

        if (clearExisting) {
            me.domConfigs.length = 0;
        }

        if (surround) {
            me.surroundTimeSpan(config);
            return;
        }

        if (endDate <= client.startDate || startDate >= client.endDate) {
            // nothing to highlight
            return;
        }

        let rect;
        if (client.isGanttBase) {
            rect = client.getScheduleRegion(taskRecord, true, { start : startDate, end : endDate });
        }
        else {
            rect = client.getScheduleRegion(resourceRecord, null, true, { start : startDate, end : endDate }, !resourceRecord);
        }

        if (padding) {
            if (client.isHorizontal) {
                rect.inflate(padding, 0, padding, 0);
            }
            else {
                rect.inflate(0, padding, 0, padding);
            }
        }

        me.domConfigs.push(
            rect.visualize({
                children : [
                    {
                        class : 'b-sch-highlighted-range-name',
                        html  : name
                    }
                ],
                dataset : {
                    syncId : animationId
                },
                class : {
                    'b-sch-highlighted-range'                           : 1,
                    [config.cls]                                        : config.cls,
                    [config.class || 'b-sch-highlighted-range-default'] : 1
                },
                elementData : {
                    highlightConfig : config
                }
            }, true)
        );

        if (draw) {
            me.draw();
        }
    }

    draw() {
        DomSync.sync({
            targetElement : this.containerEl,
            domConfig     : {
                onlyChildren : true,
                children     : this.domConfigs
            }
        });
    }

    surroundTimeSpan(timeSpan) {
        this.highlightTimeSpans([
            Object.assign({}, timeSpan, {
                animationId : (timeSpan.animationId || '') + 'Before',
                class       : 'b-unavailable',
                surround    : false,
                startDate   : this.client.startDate,
                endDate     : timeSpan.startDate
            }),
            Object.assign({}, timeSpan, {
                animationId : (timeSpan.animationId || '') + 'After',
                class       : 'b-unavailable',
                surround    : false,
                startDate   : timeSpan.endDate,
                endDate     : this.client.endDate
            })
        ]);
    }

    /**
     * Highlights the regions representing the passed time spans.
     * @on-owner
     * @param {Object[]} timeSpans An array of objects with start/end dates describing the rectangle to highlight
     * (see {@link #function-highlightTimeSpan} for details
     * @param {Object} options A single options object
     * @param {Boolean} [options.clearExisting] true CSS class to add to the highlight element
     */
    highlightTimeSpans(timeSpans, options = {}) {
        const
            me = this,
            {
                clearExisting = true
            }  = options;

        if (clearExisting) {
            me.domConfigs.length = 0;
        }

        timeSpans.forEach(timeSpan => {
            me.highlightTimeSpan({
                ...timeSpan,
                clearExisting : false
            }, false);
        });

        me.draw();
    }

    /**
     * Removes any highlighting elements.
     * @param {Boolean} [fadeOut] `true` to fade out the highlight elements before removing
     * @on-owner
     */
    async unhighlightTimeSpans(fadeOut = false) {
        const me = this;

        Array.from(me.containerEl.children).forEach(element => {
            if (fadeOut) {
                element.style.opacity = 0;
                me.fadeOutDetacher = EventHelper.onTransitionEnd({
                    element,
                    property : 'opacity',
                    thisObj  : me.client,
                    handler  : () => {
                        me.domConfigs.length = 0;
                        me.draw();
                    }
                });
            }
            else {
                me.domConfigs.length = 0;
                me.draw();
            }
        });
    }

    get containerEl() {
        if (!this._containerEl) {
            this._containerEl = DomHelper.createElement({
                parent        : this.client.foregroundCanvas,
                retainElement : true,
                class         : 'b-sch-highlight-container'
            });
        }

        return this._containerEl;
    }

    onTimeAxisViewModelUpdate() {
        if (this.domConfigs?.length > 0) {
            this.highlightTimeSpans(this.domConfigs.map(({ elementData }) => elementData.highlightConfig));
        }
    }

    updateDisabled(disabled, was) {
        if (disabled) {
            this.unhighlightTimeSpans();
        }

        super.updateDisabled(disabled, was);
    }

    // No classname on Scheduler's/Gantt's element
    get featureClass() {}
}

GridFeatureManager.registerFeature(TimeSpanHighlight, false, ['SchedulerPro', 'Gantt']);
