import ProHorizontalLayout from './ProHorizontalLayout.js';
import HorizontalLayoutStack from '../../Scheduler/eventlayout/HorizontalLayoutStack.js';

/**
 * @module SchedulerPro/eventlayout/ProHorizontalLayoutStack
 */

/**
 * Handles layout of events within a row (resource) in horizontal mode. Stacks events, increasing row height to fit
 * all overlapping events.
 *
 * This layout is used by default in horizontal mode.
 *
 * This layout supports grouping events inside the resource row. See
 * {@link SchedulerPro.eventlayout.ProHorizontalLayout} for more info.
 *
 * @mixes SchedulerPro/eventlayout/ProHorizontalLayout
 */
export default class ProHorizontalLayoutStack extends HorizontalLayoutStack.mixin(ProHorizontalLayout) {
    static get $name() {
        return 'ProHorizontalLayoutStack';
    }

    /**
     * @hideconfigs type, weights, groupBy, layoutFn
     */

    // heightRun is used when pre-calculating row heights, taking a cheaper path
    layoutEventsInBands(events, heightRun = false) {
        this.getEventGroups(events);

        return super.layoutEventsInBands(events, heightRun);
    }
}
