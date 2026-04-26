var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Mixin } from "../../../../ChronoGraph/class/BetterMixin.js";
import { field } from "../../../../ChronoGraph/replica/Entity.js";
import { model_field } from "../../../chrono/ModelFieldAtom.js";
import { ChronoPartOfProjectModelMixin } from "../mixin/ChronoPartOfProjectModelMixin.js";
import { AbstractCalendarMixin } from "../AbstractCalendarMixin.js";
import { SchedulingIssueEffect, SchedulingIssueEffectResolution } from "../../../chrono/SchedulingIssueEffect.js";
import Localizable from "../../../../Core/localization/Localizable.js";
import Base from "../../../../Core/Base.js";
import { prototypeValue } from "../../../../ChronoGraph/util/Helpers.js";
import { format } from "../../../util/Functions.js";
const hasMixin = Symbol('CalendarMixin');
export const EmptyCalendarSymbol = Symbol('EmptyCalendarSymbol');
/**
 * The calendar for project scheduling, it is used to mark certain time intervals as "non-working" and ignore them during scheduling.
 *
 * The calendar consists from several [[CalendarIntervalMixin|intervals]]. The intervals can be either static or recurrent.
 */
export class BaseCalendarMixin extends Mixin([
    AbstractCalendarMixin,
    ChronoPartOfProjectModelMixin
], (base) => {
    const superProto = base.prototype;
    class BaseCalendarMixin extends base {
        constructor() {
            super(...arguments);
            this.version = 1;
            // // this makes the calendar's self-atom to change (and trigger calculation on outgoing edges) on every `version` change
            // * calculateSelf () : CalculationIterator<this> {
            //     yield this.$.version
            //
            //     return this
            // }
        }
        [hasMixin]() { }
    }
    __decorate([
        field({ persistent: false })
    ], BaseCalendarMixin.prototype, "version", void 0);
    __decorate([
        model_field({ type: 'string' })
    ], BaseCalendarMixin.prototype, "name", void 0);
    __decorate([
        model_field({ type: 'string' })
    ], BaseCalendarMixin.prototype, "cls", void 0);
    __decorate([
        model_field({ type: 'string' })
    ], BaseCalendarMixin.prototype, "iconCls", void 0);
    __decorate([
        model_field({ type: 'boolean', defaultValue: true })
    ], BaseCalendarMixin.prototype, "unspecifiedTimeIsWorking", void 0);
    __decorate([
        model_field()
    ], BaseCalendarMixin.prototype, "intervals", void 0);
    return BaseCalendarMixin;
}) {
}
/**
 * Class providing a human readable localized description of an [[EmptyCalendarEffect]] instance.
 */
export class EmptyCalendarEffectDescription extends Localizable(Base) {
    static get $name() {
        return 'EmptyCalendarEffectDescription';
    }
    static getDescription(effect) {
        const calendar = effect.getCalendar();
        return format(this.L('L{descriptionTpl}'), calendar.name || calendar.id);
    }
}
/**
 * Special effect indicating that some calendar or calendars group is misconfigured
 * and do not provide any working period of time which makes its usage
 * impossible.
 */
export class EmptyCalendarEffect extends SchedulingIssueEffect {
    constructor() {
        super(...arguments);
        this.handler = EmptyCalendarSymbol;
    }
    getResolutions() {
        const calendar = this.getCalendar();
        return this._resolutions || (this._resolutions = [
            Use24hrsEmptyCalendarEffectResolution.new({ calendar }),
            Use8hrsEmptyCalendarEffectResolution.new({ calendar })
        ]);
    }
    // TODO handle cases when all individual calendars have working periods yet their intersection does not
    /**
     * Returns the calendar that does not have any working periods specified.
     */
    getCalendar() {
        const { calendars } = this;
        if (calendars?.length > 1) {
            for (const calendar of calendars) {
                const skippingRes = calendar.skipNonWorkingTime(this.date, this.isForward);
                if (!(skippingRes instanceof Date)) {
                    return calendar;
                }
            }
        }
        return calendars[0];
    }
}
__decorate([
    prototypeValue('emptyCalendar')
], EmptyCalendarEffect.prototype, "type", void 0);
__decorate([
    prototypeValue(EmptyCalendarEffectDescription)
], EmptyCalendarEffect.prototype, "_descriptionBuilderClass", void 0);
/**
 * Base class for [[EmptyCalendarEffect]] resolutions.
 * The class has [[fixCalendarData]] method that pushes preconfigured [[calendarData]]
 * to the given [[calendar]]. The method is called in [[resolve]] method so for a subclass
 * it's enough just providing [[fixCalendarData|proper data]].
 */
export class BaseEmptyCalendarEffectResolution extends Localizable(SchedulingIssueEffectResolution) {
    static get $name() {
        return 'BaseEmptyCalendarEffectResolution';
    }
    static get configurable() {
        return {
            /**
             * Correct calendar data.
             * @property calendarData
             */
            calendarData: {
                intervals: [
                    { isWorking: true }
                ]
            }
        };
    }
    getDescription() {
        const { calendar } = this;
        return format(this.L('L{descriptionTpl}'), calendar.name || calendar.id);
    }
    /**
     * Fixes the provided calendar data by clearing its intervals
     * amd then applying data specified in [[calendarData]] config.
     * @param calendar
     */
    fixCalendarData(calendar) {
        calendar.clearIntervals(true);
        // @ts-ignore
        Object.assign(calendar, this.calendarData);
        if (calendar.intervals?.length) {
            calendar.addIntervals(calendar.intervals);
        }
    }
    /**
     * Resolves the [[calendar]] by removing all its intervals and
     * adding new [[calendarData|correct ones]].
     */
    resolve() {
        const { calendar } = this;
        this.fixCalendarData(calendar);
    }
}
/**
 * Resolution option for [[EmptyCalendarEffect]] that fixes a specified calendar by
 * replacing its data with standard __24 hours/day__ calendar (__Saturday__ and __Sunday__ are non-working days) data.
 */
export class Use24hrsEmptyCalendarEffectResolution extends BaseEmptyCalendarEffectResolution {
    static get $name() {
        return 'Use24hrsEmptyCalendarEffectResolution';
    }
    static get configurable() {
        return {
            calendarData: {
                unspecifiedTimeIsWorking: false,
                intervals: [
                    {
                        recurrentStartDate: 'on Mon at 0:00',
                        recurrentEndDate: 'on Sat at 0:00',
                        isWorking: true
                    }
                ]
            }
        };
    }
}
/**
 * Resolution option for [[EmptyCalendarEffect]] that fixes a specified calendar by
 * replacing its data with standard __8 hours/day__ calendar (__Saturday__ and __Sunday__ are non-working days) data.
 */
export class Use8hrsEmptyCalendarEffectResolution extends BaseEmptyCalendarEffectResolution {
    static get $name() {
        return 'Use8hrsEmptyCalendarEffectResolution';
    }
    static get configurable() {
        return {
            calendarData: {
                unspecifiedTimeIsWorking: false,
                intervals: [
                    {
                        recurrentStartDate: 'every weekday at 08:00',
                        recurrentEndDate: 'every weekday at 12:00',
                        isWorking: true
                    },
                    {
                        recurrentStartDate: 'every weekday at 13:00',
                        recurrentEndDate: 'every weekday at 17:00',
                        isWorking: true
                    }
                ]
            }
        };
    }
}
