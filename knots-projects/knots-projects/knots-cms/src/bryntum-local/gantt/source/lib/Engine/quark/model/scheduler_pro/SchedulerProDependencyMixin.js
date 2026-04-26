var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { calculate, field, write } from '../../../../ChronoGraph/replica/Entity.js';
import { isAtomicValue } from '../../../../ChronoGraph/util/Helpers.js';
import DateHelper from '../../../../Core/helper/DateHelper.js';
import { model_field } from '../../../chrono/ModelFieldAtom.js';
import { DependenciesCalendar, TimeUnit } from '../../../scheduling/Types.js';
import { BaseDependencyMixin } from '../scheduler_basic/BaseDependencyMixin.js';
//---------------------------------------------------------------------------------------------------------------------
/**
 * A mixin for the dependency entity at the Scheduler Pro level. It adds [[lag]] and [[lagUnit]] fields.
 *
 * The calendar according to which the lag time is calculated is defined with the
 * [[SchedulerProProjectMixin.dependenciesCalendar|dependenciesCalendar]] config of the project.
 */
export class SchedulerProDependencyMixin extends Mixin([BaseDependencyMixin], (base) => {
    const superProto = base.prototype;
    class SchedulerProDependencyMixin extends base {
        *calculateCalendar() {
            const project = this.getProject();
            const dependenciesCalendar = yield project.$.dependenciesCalendar;
            let calendar;
            switch (dependenciesCalendar) {
                case DependenciesCalendar.Project:
                    calendar = yield project.$.effectiveCalendar;
                    break;
                case DependenciesCalendar.FromEvent:
                    const fromEvent = yield this.$.fromEvent;
                    calendar = fromEvent && !isAtomicValue(fromEvent) ? yield fromEvent.$.effectiveCalendar : null;
                    break;
                case DependenciesCalendar.ToEvent:
                    const toEvent = yield this.$.toEvent;
                    calendar = toEvent && !isAtomicValue(toEvent) ? yield toEvent.$.effectiveCalendar : null;
                    break;
            }
            // the only case when there will be no calendar is when there's no either from/to event
            // what to return in such case? use project calendar as "defensive" approach
            if (!calendar)
                calendar = yield project.$.effectiveCalendar;
            return calendar;
        }
        /**
         * Setter for the [[lag]]. Can also set [[lagUnit]] if second argument is provided.
         *
         * @param lag
         * @param unit
         */
        async setLag(lag, unit) {
            if (this.graph) {
                this.graph.write(this.$.lag, lag, unit);
                return this.graph.commitAsync();
            }
            else {
                this.$.lag.DATA = lag;
                if (unit != null)
                    this.$.lagUnit.DATA = unit;
            }
        }
        writeLag(me, transaction, quark, lag, unit = undefined) {
            me.constructor.prototype.write.call(this, me, transaction, quark, lag);
            if (unit != null)
                transaction.write(this.$.lagUnit, unit);
        }
    }
    __decorate([
        model_field({ type: 'number', defaultValue: 0 })
    ], SchedulerProDependencyMixin.prototype, "lag", void 0);
    __decorate([
        model_field({ type: 'string', defaultValue: TimeUnit.Day }, { converter: DateHelper.normalizeUnit })
    ], SchedulerProDependencyMixin.prototype, "lagUnit", void 0);
    __decorate([
        field()
    ], SchedulerProDependencyMixin.prototype, "calendar", void 0);
    __decorate([
        model_field({ type: 'boolean', defaultValue: true, persist: true })
    ], SchedulerProDependencyMixin.prototype, "active", void 0);
    __decorate([
        calculate('calendar')
    ], SchedulerProDependencyMixin.prototype, "calculateCalendar", null);
    __decorate([
        write('lag')
    ], SchedulerProDependencyMixin.prototype, "writeLag", null);
    return SchedulerProDependencyMixin;
}) {
}
// /**
//  * Dependency entity mixin type
//  */
// export type SchedulerProDependencyMixin = Mixin<typeof SchedulerProDependencyMixin>
//
// export interface SchedulerProDependencyMixinI extends Mixin<typeof SchedulerProDependencyMixin> {}
//
// export const BuildSchedulerProDependency = (base) => SchedulerProDependencyMixin(BuildMinimalBaseDependency(base))
//
// export class MinimalSchedulerProDependency extends SchedulerProDependencyMixin(MinimalBaseDependency) {}
