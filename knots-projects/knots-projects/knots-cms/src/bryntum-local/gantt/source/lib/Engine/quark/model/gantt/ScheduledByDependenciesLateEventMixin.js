var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from '../../../../ChronoGraph/class/BetterMixin.js';
import { calculate } from '../../../../ChronoGraph/replica/Entity.js';
import { isAtomicValue } from '../../../../ChronoGraph/util/Helpers.js';
import { DependencyType, TimeUnit } from '../../../scheduling/Types.js';
import { ScheduledByDependenciesEarlyEventMixin } from "../scheduler_pro/ScheduledByDependenciesEarlyEventMixin.js";
import { ConstrainedLateEventMixin } from "./ConstrainedLateEventMixin.js";
//---------------------------------------------------------------------------------------------------------------------
/**
 * This mixin adds support for scheduling event ALAP, by dependencies. All it does is
 * create the "late" constraint interval for every outgoing dependency.
 *
 * See [[ConstrainedEarlyEventMixin]] for more details about constraint-based scheduling.
 * See also [[ScheduledByDependenciesEarlyEventMixin]].
 */
export class ScheduledByDependenciesLateEventMixin extends Mixin([ScheduledByDependenciesEarlyEventMixin, ConstrainedLateEventMixin], (base) => {
    const superProto = base.prototype;
    class ScheduledByDependenciesLateEventMixin extends base {
        *shouldSuccessorAffectScheduling(dependency) {
            const toEvent = yield dependency.$.toEvent;
            // ignore missing target events and inactive dependencies
            return toEvent && !isAtomicValue(toEvent) && (yield dependency.$.active)
                // and inactive target events (unless this event is also inactive)
                && (!(yield toEvent.$.inactive) || (yield this.$.inactive));
        }
        *calculateLateStartDateConstraintIntervals() {
            const intervals = yield* superProto.calculateLateStartDateConstraintIntervals.call(this);
            const project = this.getProject();
            const dependencyConstraintIntervalClass = project.dependencyConstraintIntervalClass;
            let dependency;
            for (dependency of (yield this.$.outgoingDeps)) {
                // ignore missing target events and inactive dependencies
                if (!(yield* this.shouldSuccessorAffectScheduling(dependency)))
                    continue;
                const successor = yield dependency.$.toEvent;
                let interval;
                switch (yield dependency.$.type) {
                    case DependencyType.StartToStart:
                        const successorStartDate = yield successor.$.lateStartDateRaw;
                        if (successorStartDate) {
                            const lag = yield dependency.$.lag;
                            const lagUnit = yield dependency.$.lagUnit;
                            const calendar = yield dependency.$.calendar;
                            interval = dependencyConstraintIntervalClass.new({
                                owner: dependency,
                                startDate: null,
                                endDate: calendar.calculateStartDate(successorStartDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)),
                            });
                        }
                        break;
                    case DependencyType.StartToEnd:
                        const successorEndDate = yield successor.$.lateEndDateRaw;
                        if (successorEndDate) {
                            const lag = yield dependency.$.lag;
                            const lagUnit = yield dependency.$.lagUnit;
                            const calendar = yield dependency.$.calendar;
                            interval = dependencyConstraintIntervalClass.new({
                                owner: dependency,
                                startDate: null,
                                endDate: calendar.calculateStartDate(successorEndDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)),
                            });
                        }
                        break;
                }
                interval && intervals.unshift(interval);
            }
            return intervals;
        }
        *calculateLateEndDateConstraintIntervals() {
            const intervals = yield* superProto.calculateLateEndDateConstraintIntervals.call(this);
            const project = this.getProject();
            const dependencyConstraintIntervalClass = project.dependencyConstraintIntervalClass;
            let dependency;
            for (dependency of (yield this.$.outgoingDeps)) {
                // ignore missing target events and inactive dependencies
                if (!(yield* this.shouldSuccessorAffectScheduling(dependency)))
                    continue;
                const successor = yield dependency.$.toEvent;
                let interval;
                switch (yield dependency.$.type) {
                    case DependencyType.EndToEnd:
                        const successorEndDate = yield successor.$.lateEndDateRaw;
                        if (successorEndDate) {
                            const lag = yield dependency.$.lag;
                            const lagUnit = yield dependency.$.lagUnit;
                            const calendar = yield dependency.$.calendar;
                            interval = dependencyConstraintIntervalClass.new({
                                owner: dependency,
                                startDate: null,
                                endDate: calendar.calculateStartDate(successorEndDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)),
                            });
                        }
                        break;
                    case DependencyType.EndToStart:
                        const successorStartDate = yield successor.$.lateStartDateRaw;
                        if (successorStartDate) {
                            const lag = yield dependency.$.lag;
                            const lagUnit = yield dependency.$.lagUnit;
                            const calendar = yield dependency.$.calendar;
                            interval = dependencyConstraintIntervalClass.new({
                                owner: dependency,
                                startDate: null,
                                endDate: calendar.calculateStartDate(successorStartDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)),
                            });
                        }
                        break;
                }
                interval && intervals.unshift(interval);
            }
            return intervals;
        }
    }
    __decorate([
        calculate('lateStartDateIntervals')
    ], ScheduledByDependenciesLateEventMixin.prototype, "calculateLateStartDateConstraintIntervals", null);
    return ScheduledByDependenciesLateEventMixin;
}) {
}
