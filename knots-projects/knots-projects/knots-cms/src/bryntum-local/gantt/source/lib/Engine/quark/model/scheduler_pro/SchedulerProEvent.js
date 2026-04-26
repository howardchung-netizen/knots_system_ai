import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { SchedulerBasicEvent } from "../scheduler_basic/SchedulerBasicEvent.js";
import { ConstrainedEarlyEventMixin } from "./ConstrainedEarlyEventMixin.js";
import { HasDateConstraintMixin } from "./HasDateConstraintMixin.js";
import { HasPercentDoneMixin } from "./HasPercentDoneMixin.js";
import { ScheduledByDependenciesEarlyEventMixin } from "./ScheduledByDependenciesEarlyEventMixin.js";
import { SchedulerProHasAssignmentsMixin } from "./SchedulerProHasAssignmentsMixin.js";
/**
 * This is an event class, [[SchedulerProProjectMixin]] is working with.
 * It is constructed as [[SchedulerBasicEvent]], enhanced with extra functionality.
 */
export class SchedulerProEvent extends Mixin([
    SchedulerBasicEvent,
    HasDateConstraintMixin,
    HasPercentDoneMixin,
    SchedulerProHasAssignmentsMixin,
    ConstrainedEarlyEventMixin,
    ScheduledByDependenciesEarlyEventMixin
], (base) => {
    const superProto = base.prototype;
    class SchedulerProEvent extends base {
    }
    return SchedulerProEvent;
}) {
}
