import { MixinAny } from "../../../../ChronoGraph/class/BetterMixin.js";
import { SchedulerProEvent } from "../scheduler_pro/SchedulerProEvent.js";
import { ConstrainedByParentMixin } from "./ConstrainedByParentMixin.js";
import { ConstrainedLateEventMixin } from "./ConstrainedLateEventMixin.js";
import { GanttHasAssignmentsMixin } from "./GanttHasAssignmentsMixin.js";
import { HasEffortMixin } from "./HasEffortMixin.js";
import { HasSchedulingModeMixin } from "./HasSchedulingModeMixin.js";
import { ScheduledByDependenciesLateEventMixin } from "./ScheduledByDependenciesLateEventMixin.js";
import { FixedDurationMixin } from "./scheduling_modes/FixedDurationMixin.js";
import { FixedEffortMixin } from "./scheduling_modes/FixedEffortMixin.js";
import { FixedUnitsMixin } from "./scheduling_modes/FixedUnitsMixin.js";
import { InactiveEventMixin } from "./InactiveEventMixin.js";
/**
 * This is an event class, [[GanttProjectMixin]] is working with.
 * It is constructed as [[SchedulerProEvent]], enhanced with extra functionality.
 */
export class GanttEvent extends MixinAny([
    SchedulerProEvent,
    ConstrainedByParentMixin,
    ConstrainedLateEventMixin,
    ScheduledByDependenciesLateEventMixin,
    GanttHasAssignmentsMixin,
    HasEffortMixin,
    HasSchedulingModeMixin,
    FixedDurationMixin,
    FixedEffortMixin,
    FixedUnitsMixin,
    InactiveEventMixin
], (base) => {
    const superProto = base.prototype;
    class GanttEvent extends base {
    }
    return GanttEvent;
}) {
}
