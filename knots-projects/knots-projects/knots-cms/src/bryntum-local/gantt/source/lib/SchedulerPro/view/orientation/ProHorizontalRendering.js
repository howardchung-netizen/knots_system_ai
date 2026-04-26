import HorizontalRendering from '../../../Scheduler/view/orientation/HorizontalRendering.js';

/**
 * @module SchedulerPro/view/orientation/ProHorizontalRendering
 */

/**
 * Handles event rendering in Scheduler Pro horizontal mode. Populates render data with buffer duration.
 *
 * @internal
 */
export default class ProHorizontalRendering extends HorizontalRendering {
    /**
     * Populates render data with buffer data rendering.
     * @param {HorizontalRenderData} renderData
     * @return {Boolean}
     * @private
     */
    fillInnerSpanHorizontalPosition(renderData) {
        const
            me              = this,
            { eventRecord } = renderData,
            {
                startMS    : innerStartMS,
                endMS      : innerEndMS,
                durationMS : innerDurationMS
            }               = me.calculateMS(eventRecord, 'startDate', 'endDate'),
            position        = me.calculateHorizontalPosition(renderData, innerStartMS, innerEndMS, innerDurationMS);

        if (position) {
            const { left, width } = position;

            Object.assign(renderData, {
                innerStartMS,
                innerEndMS,
                innerDurationMS,
                bufferBeforeWidth : Math.max(left - renderData.left, 0),
                // This could yield a really small number due to floating point accuracy, we can round the result
                bufferAfterWidth  : Math.max(Math.floor(renderData.left + renderData.width - left - width), 0)
            });

            return true;
        }
        else {
            return false;
        }
    }

    getTimeSpanRenderData(timeSpan, rowRecord, includeOutside = false) {
        const data = super.getTimeSpanRenderData(timeSpan, rowRecord, includeOutside);

        if (data?.useEventBuffer) {
            if (!this.fillInnerSpanHorizontalPosition(data)) {
                return null;
            }
        }

        return data;
    }
}
