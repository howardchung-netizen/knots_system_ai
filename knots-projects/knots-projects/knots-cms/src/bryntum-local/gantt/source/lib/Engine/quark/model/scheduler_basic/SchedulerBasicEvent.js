import { Mixin } from '../../../../ChronoGraph/class/BetterMixin.js';
import { BaseEventMixin } from './BaseEventMixin.js';
import { BaseHasAssignmentsMixin } from "./BaseHasAssignmentsMixin.js";
import { HasDependenciesMixin } from './HasDependenciesMixin.js';
/**
 * This is an event class, [[SchedulerBasicProjectMixin]] is working with.
 * It is constructed as [[BaseEventMixin]], enhanced with [[BaseHasAssignmentsMixin]] and [[HasDependenciesMixin]]
 */
export class SchedulerBasicEvent extends Mixin([
    BaseEventMixin,
    BaseHasAssignmentsMixin,
    HasDependenciesMixin
], (base) => {
    const superProto = base.prototype;
    class SchedulerBasicEvent extends base {
    }
    return SchedulerBasicEvent;
}) {
}
