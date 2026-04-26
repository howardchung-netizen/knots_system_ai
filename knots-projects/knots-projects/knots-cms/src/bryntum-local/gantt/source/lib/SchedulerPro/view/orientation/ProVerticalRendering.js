import VerticalRendering from '../../../../lib/Scheduler/view/orientation/VerticalRendering.js';

/**
 * @module SchedulerPro/view/orientation/ProVerticalRendering
 */

/**
 * Handles event rendering in Scheduler Pro horizontal mode. Populates render data with buffer duration.
 *
 * @internal
 */
export default class ProVerticalRendering extends VerticalRendering {
    /**
     * Populates render data with buffer data rendering.
     * @param {HorizontalRenderData} renderData
     * @return {Boolean}
     * @private
     */
    fillInnerSpanVerticalPosition(renderData) {
        const
            me                  = this,
            { scheduler }       = me,
            { eventRecord }     = renderData,
            { isBatchUpdating } = eventRecord,
            startDate           = isBatchUpdating ? eventRecord.get('startDate') : eventRecord.startDate,
            endDate             = isBatchUpdating ? eventRecord.get('endDate') : eventRecord.endDate,
            top                 = scheduler.getCoordinateFromDate(startDate),
            innerStartMS        = startDate.getTime(),
            innerEndMS          = endDate.getTime(),
            innerDurationMS     = innerEndMS - innerStartMS;

        let bottom = scheduler.getCoordinateFromDate(endDate),
            height = bottom - top;

        // Below, estimate height
        if (bottom === -1) {
            height = Math.round(innerDurationMS * scheduler.timeAxisViewModel.getSingleUnitInPixels('millisecond'));
            bottom = top + height;
        }

        Object.assign(renderData, {
            innerStartMS,
            innerEndMS,
            innerDurationMS,
            bufferBeforeWidth : top - renderData.top,
            bufferAfterWidth  : renderData.top + renderData.height - top - height
        });

        return true;
    }

    getTimeSpanRenderData(timeSpan, rowRecord, includeOutside = false) {
        const data = super.getTimeSpanRenderData(timeSpan, rowRecord, includeOutside);

        if (data?.useEventBuffer) {
            if (!this.fillInnerSpanVerticalPosition(data)) {
                return null;
            }
        }

        return data;
    }
}
