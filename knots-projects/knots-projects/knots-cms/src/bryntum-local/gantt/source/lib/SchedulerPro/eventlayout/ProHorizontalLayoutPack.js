import ProHorizontalLayout from './ProHorizontalLayout.js';
import HorizontalLayoutPack from '../../Scheduler/eventlayout/HorizontalLayoutPack.js';

/**
 * @module SchedulerPro/eventlayout/ProHorizontalLayoutPack
 */

/**
 * Handles layout of events within a row (resource) in horizontal mode. Packs events (adjusts their height) to fit
 * available row height.
 *
 * This layout supports grouping events inside the resource row. See
 * {@link SchedulerPro.eventlayout.ProHorizontalLayout} for more info.
 *
 * @mixes SchedulerPro/eventlayout/ProHorizontalLayout
 */
export default class ProHorizontalLayoutPack extends HorizontalLayoutPack.mixin(ProHorizontalLayout) {
    static get $name() {
        return 'ProHorizontalLayoutPack';
    }

    /**
     * @hideconfigs type, weights, groupBy, layoutFn
     */

    layoutEventsInBands(events) {
        const
            groups = this.getEventGroups(events),
            // If we don't have any groups, treat it like we have a single group including all events
            groupCount = groups.length || 1;

        const result = this.packEventsInBands(events, (event, j, slot, slotSize) => {
            const
                size              = slotSize / groupCount,
                groupIndex        = groupCount === 1 ? 0 : groups.indexOf(event.group),
                adjustedSlotStart = groupIndex / groupCount;

            // This height and top are used to position event in the grouped row
            event.height = size;
            event.top    = adjustedSlotStart + slot.start / groupCount + j * size;

            // This height and top are used to layout events in the same band. They emulate a single row which is what
            // pack logic expects
            event.inBandHeight = slotSize;
            event.inBandTop = slot.start + j * slotSize;
        });

        events.forEach(event => {
            Object.assign(
                event,
                this.bandIndexToPxConvertFn.call(
                    this.bandIndexToPxConvertThisObj || this,
                    event.top,
                    event.height,
                    event.eventRecord,
                    event.resourceRecord
                )
            );
        });

        return result;
    }
}
