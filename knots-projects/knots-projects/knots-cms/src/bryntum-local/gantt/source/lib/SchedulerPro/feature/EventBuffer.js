import InstancePlugin from '../../Core/mixin/InstancePlugin.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import Tooltip from '../../Core/widget/Tooltip.js';

/**
 * @module SchedulerPro/feature/EventBuffer
 */

/**
 * Feature that allows showing additional time before & after an event, to visualize things like travel time - or the time you
 * need to prepare a room for a meeting + clean it up after.
 *
 * The feature relies on two model fields: {@link SchedulerPro.model.EventModel#field-preamble} and
 * {@link SchedulerPro.model.EventModel#field-postamble} which are used to calculate overall start and end dates used to
 * position the event. Buffer time overlaps the same way events overlap (as you can see in the inline demo below). It
 * should also be noted that buffer time is ignored for milestones.
 *
 * {@inlineexample SchedulerPro/feature/EventBuffer.js}
 *
 * This feature is **disabled** by default
 *
 * @extends Core/mixin/InstancePlugin
 * @classtype eventBuffer
 * @feature
 * @demo SchedulerPro/travel-time
 */
export default class EventBuffer extends InstancePlugin {
    static get $name() {
        return 'EventBuffer';
    }

    static get configurable() {
        return {
            /**
             * Show buffer duration labels
             * @config {Boolean}
             * @default
             */
            showDuration : true,

            /**
             * A function which receives data about the buffer time and returns a html string to show in a tooltip when
             * hovering a buffer time element
             * @param {Object} data data
             * @param {Core.data.Duration} data.duration Buffer time duration
             * @param {Boolean} data.before `true` if this is a buffer time before the event start, `false` if after
             * @param {SchedulerPro.model.EventModel} data.eventRecord The event record
             * @config {Function}
             */
            tooltipTemplate : {
                value   : null,
                $config : 'nullify'
            }
        };
    }

    static get pluginConfig() {
        return {
            chain : ['onEventDataGenerated']
        };
    }

    //region Chained methods

    updateTooltipTemplate(tooltipTemplate) {
        const me = this;

        if (tooltipTemplate) {
            me.tooltip = Tooltip.new({
                forElement  : me.client.timeAxisSubGridElement,
                forSelector : '.b-sch-event-buffer-before,.b-sch-event-buffer-after',
                align       : {
                    align  : 'b-t',
                    offset : [0, 10]
                },
                getHtml({ activeTarget }) {
                    const
                        eventRecord = me.client.resolveEventRecord(activeTarget),
                        before      = activeTarget.matches('.b-sch-event-buffer-before'),
                        duration    = before ? eventRecord.preamble : eventRecord.postamble;

                    return me.tooltipTemplate({ eventRecord, duration, before });
                }
            });
        }
        else {
            me.tooltip?.destroy();
        }
    }

    onEventDataGenerated({ useEventBuffer, bufferBeforeWidth, bufferAfterWidth, eventRecord, wrapperChildren }) {
        if (this.enabled && useEventBuffer) {
            const
                { isHorizontal }        = this.client,
                { showDuration }        = this,
                { preamble, postamble } = eventRecord,
                sizeProp                = isHorizontal ? 'width' : 'height';

            // Buffer elements should always be there, otherwise animation might get wrong
            wrapperChildren.push(
                {
                    className : {
                        'b-sch-event-buffer'        : 1,
                        'b-sch-event-buffer-before' : 1,
                        'b-buffer-thin'             : !bufferBeforeWidth
                    },
                    style    : `${sizeProp}: ${bufferBeforeWidth}px`,
                    children : (showDuration && preamble) ? [
                        {
                            tag       : 'span',
                            className : 'b-buffer-label',
                            html      : preamble.toString(true)
                        }
                    ] : undefined
                },
                {
                    className : {
                        'b-sch-event-buffer'       : 1,
                        'b-sch-event-buffer-after' : 1,
                        'b-buffer-thin'            : !bufferAfterWidth
                    },
                    style    : `${sizeProp}: ${bufferAfterWidth}px`,
                    children : (showDuration && postamble) ? [
                        {
                            tag       : 'span',
                            className : 'b-buffer-label',
                            html      : postamble.toString(true)
                        }
                    ] : undefined
                }
            );
        }
    }

    //endregion

    updateShowDuration() {
        if (!this.isConfiguring) {
            this.client.refreshWithTransition();
        }
    }

    doDisable(disable) {
        super.doDisable(disable);

        const { client } = this;

        if (!client.isConfiguring && client.isPainted) {
            // Add a special CSS class to disable certain transitions
            client.element.classList.add('b-eventbuffer-transition');

            client.refreshWithTransition();

            client.waitForAnimations().then(() => {
                client.element.classList.remove('b-eventbuffer-transition');
            });
        }
    }
}

GridFeatureManager.registerFeature(EventBuffer, false, 'SchedulerPro');
