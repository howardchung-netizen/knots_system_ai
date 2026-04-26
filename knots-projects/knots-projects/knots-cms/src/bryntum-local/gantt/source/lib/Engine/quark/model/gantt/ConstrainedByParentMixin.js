var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from '../../../../ChronoGraph/class/Mixin.js';
import { calculate } from '../../../../ChronoGraph/replica/Entity.js';
import { DateInterval } from '../../../scheduling/DateInterval.js';
import { Direction } from "../../../scheduling/Types.js";
import { BaseEventMixin } from "../scheduler_basic/BaseEventMixin.js";
import { HasChildrenMixin } from '../scheduler_basic/HasChildrenMixin.js';
import { ConstrainedEarlyEventMixin } from "../scheduler_pro/ConstrainedEarlyEventMixin.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin makes the event to "inherit" the constraints from its parent event.
 */
export class ConstrainedByParentMixin extends Mixin([BaseEventMixin, HasChildrenMixin, ConstrainedEarlyEventMixin], (base) => {
    const superProto = base.prototype;
    class ConstrainedByParentMixin extends base {
        *maybeSkipNonWorkingTime(date, isForward = true) {
            const childEvents = yield this.$.childEvents;
            // summary tasks are simply aligned by their children so they should not skip non-working time at all
            if (childEvents.size > 0)
                return date;
            return yield* superProto.maybeSkipNonWorkingTime.call(this, date, isForward);
        }
        *calculateStartDateConstraintIntervals() {
            const intervals = yield* superProto.calculateStartDateConstraintIntervals.call(this);
            const parentEvent = yield this.$.parentEvent;
            if (parentEvent) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.startDateConstraintIntervals;
                intervals.push.apply(intervals, parentIntervals);
            }
            return intervals;
        }
        *calculateEndDateConstraintIntervals() {
            const intervals = yield* superProto.calculateEndDateConstraintIntervals.call(this);
            const parentEvent = yield this.$.parentEvent;
            if (parentEvent) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.endDateConstraintIntervals;
                intervals.push.apply(intervals, parentIntervals);
            }
            return intervals;
        }
        *calculateEarlyStartDateConstraintIntervals() {
            const intervals = yield* superProto.calculateEarlyStartDateConstraintIntervals.call(this);
            const parentEvent = yield this.$.parentEvent;
            if (parentEvent) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.earlyStartDateConstraintIntervals;
                intervals.push.apply(intervals, parentIntervals);
                // If the parent is scheduled manually it should still restrict its children (even though it has no a constraint set)
                // so we append an artificial constraining interval
                if ((yield parentEvent.$.manuallyScheduled) && (yield this.$.direction) === Direction.Forward) {
                    intervals.push(DateInterval.new({
                        startDate: yield parentEvent.$.startDate
                    }));
                }
            }
            return intervals;
        }
        *calculateEarlyEndDateConstraintIntervals() {
            const intervals = yield* superProto.calculateEarlyEndDateConstraintIntervals.call(this);
            const parentEvent = yield this.$.parentEvent;
            if (parentEvent) {
                // Child inherits its parent task constraints
                const parentIntervals = yield parentEvent.$.earlyEndDateConstraintIntervals;
                intervals.push.apply(intervals, parentIntervals);
            }
            return intervals;
        }
    }
    __decorate([
        calculate('startDateConstraintIntervals')
    ], ConstrainedByParentMixin.prototype, "calculateStartDateConstraintIntervals", null);
    __decorate([
        calculate('endDateConstraintIntervals')
    ], ConstrainedByParentMixin.prototype, "calculateEndDateConstraintIntervals", null);
    __decorate([
        calculate('earlyStartDateConstraintIntervals')
    ], ConstrainedByParentMixin.prototype, "calculateEarlyStartDateConstraintIntervals", null);
    __decorate([
        calculate('earlyEndDateConstraintIntervals')
    ], ConstrainedByParentMixin.prototype, "calculateEarlyEndDateConstraintIntervals", null);
    return ConstrainedByParentMixin;
}) {
}
