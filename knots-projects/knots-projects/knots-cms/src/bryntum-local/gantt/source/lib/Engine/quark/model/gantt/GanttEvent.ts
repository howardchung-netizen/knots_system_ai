import { AnyConstructor, MixinAny } from "../../../../ChronoGraph/class/BetterMixin.js"
import { SchedulerProEvent } from "../scheduler_pro/SchedulerProEvent.js"
import { ConstrainedByParentMixin } from "./ConstrainedByParentMixin.js"
import { ConstrainedLateEventMixin } from "./ConstrainedLateEventMixin.js"
import { GanttHasAssignmentsMixin } from "./GanttHasAssignmentsMixin.js"
import { GanttProjectMixin } from "./GanttProjectMixin.js"
import { HasEffortMixin } from "./HasEffortMixin.js"
import { HasSchedulingModeMixin } from "./HasSchedulingModeMixin.js"
import { ScheduledByDependenciesLateEventMixin } from "./ScheduledByDependenciesLateEventMixin.js"
import { FixedDurationMixin } from "./scheduling_modes/FixedDurationMixin.js"
import { FixedEffortMixin } from "./scheduling_modes/FixedEffortMixin.js"
import { FixedUnitsMixin } from "./scheduling_modes/FixedUnitsMixin.js"
import { InactiveEventMixin } from "./InactiveEventMixin.js"


/**
 * This is an event class, [[GanttProjectMixin]] is working with.
 * It is constructed as [[SchedulerProEvent]], enhanced with extra functionality.
 */
export class GanttEvent extends MixinAny(
    [
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
    ],
    (base : AnyConstructor<
        SchedulerProEvent
        & ConstrainedByParentMixin
        & ConstrainedLateEventMixin
        & ScheduledByDependenciesLateEventMixin
        & GanttHasAssignmentsMixin
        & HasEffortMixin
        & HasSchedulingModeMixin
        & FixedDurationMixin
        & FixedEffortMixin
        & FixedUnitsMixin
        & InactiveEventMixin,
        typeof SchedulerProEvent
        & typeof ConstrainedByParentMixin
        & typeof ConstrainedLateEventMixin
        & typeof ScheduledByDependenciesLateEventMixin
        & typeof GanttHasAssignmentsMixin
        & typeof HasEffortMixin
        & typeof HasSchedulingModeMixin
        & typeof FixedDurationMixin
        & typeof FixedEffortMixin
        & typeof FixedUnitsMixin
        & typeof InactiveEventMixin
    >) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class GanttEvent extends base {
        // surprisingly this seems to be fine (see the comment in the SchedulerProEvent)
        project         : GanttProjectMixin
    }

    return GanttEvent
}){}

