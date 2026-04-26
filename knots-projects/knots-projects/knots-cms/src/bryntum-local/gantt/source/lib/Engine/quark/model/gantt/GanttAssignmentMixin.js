var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ProposedOrPrevious } from '../../../../ChronoGraph/chrono/Effect.js';
import { Mixin } from '../../../../ChronoGraph/class/BetterMixin.js';
import { calculate } from '../../../../ChronoGraph/replica/Entity.js';
import { SchedulerProAssignmentMixin } from '../scheduler_pro/SchedulerProAssignmentMixin.js';
/**
 * A mixin for the assignment entity at the Gantt level. It adds [[units]] field.
 */
export class GanttAssignmentMixin extends Mixin([SchedulerProAssignmentMixin], (base) => {
    const superProto = base.prototype;
    class GanttAssignmentMixin extends base {
        *calculateUnits() {
            const event = yield this.$.event;
            // if event of assignment presents - we always delegate to it
            // (so that various assignment logic can be overridden by single event mixin)
            if (event)
                return yield* event.calculateAssignmentUnits(this);
            // otherwise use proposed or current consistent value
            return yield ProposedOrPrevious;
        }
    }
    __decorate([
        calculate('units')
    ], GanttAssignmentMixin.prototype, "calculateUnits", null);
    return GanttAssignmentMixin;
}) {
}
