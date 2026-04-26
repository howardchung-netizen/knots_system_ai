import { AnyConstructor, Mixin } from "../../../../ChronoGraph/class/BetterMixin.js"
import { field } from "../../../../ChronoGraph/replica/Entity.js"
import { CalendarIntervalMixin } from "../../../calendar/CalendarIntervalMixin.js"
import { model_field } from "../../../chrono/ModelFieldAtom.js"
import { ChronoPartOfProjectModelMixin } from "../mixin/ChronoPartOfProjectModelMixin.js"
import { SchedulerBasicProjectMixin } from "./SchedulerBasicProjectMixin.js"
import { AbstractCalendarMixin } from "../AbstractCalendarMixin.js"
import { SchedulingIssueEffect, SchedulingIssueEffectResolution } from "../../../chrono/SchedulingIssueEffect.js"
import Localizable from "../../../../Core/localization/Localizable.js"
import Base from "../../../../Core/Base.js"
import { prototypeValue } from "../../../../ChronoGraph/util/Helpers.js"
import { format } from "../../../util/Functions.js"
import { HasCalendarMixin } from "./HasCalendarMixin.js"

const hasMixin                      = Symbol('CalendarMixin')

export const EmptyCalendarSymbol    = Symbol('EmptyCalendarSymbol')

/**
 * The calendar for project scheduling, it is used to mark certain time intervals as "non-working" and ignore them during scheduling.
 *
 * The calendar consists from several [[CalendarIntervalMixin|intervals]]. The intervals can be either static or recurrent.
 */
export class BaseCalendarMixin extends Mixin(
    [
        AbstractCalendarMixin,
        ChronoPartOfProjectModelMixin
    ],
    (base : AnyConstructor<
        AbstractCalendarMixin &
        ChronoPartOfProjectModelMixin
        ,
        typeof AbstractCalendarMixin &
        typeof ChronoPartOfProjectModelMixin
>) => {

    const superProto : InstanceType<typeof base> = base.prototype


    class BaseCalendarMixin extends base {

        [hasMixin] () {}

        project                 : SchedulerBasicProjectMixin

        @field({ persistent : false })
        version                 : number    = 1

        /**
         * The calendar name
         */
        @model_field({ type : 'string' })
        name                    : string

        /**
         * A CSS class to add to non-working time elements rendered in the UI
         */
        @model_field({ type : 'string' })
        cls                    : string

        /**
         * A CSS class defining an icon to display inside non-working time elements rendered in the UI
         */
        @model_field({ type : 'string' })
        iconCls                : string

        /**
         * The flag, indicating, whether the "unspecified" time (time that does not belong to any [[CalendarIntervalMixin|interval]])
         * is working (`true`) or not (`false`). Default value is `true`
         */
        @model_field({ type : 'boolean', defaultValue : true })
        unspecifiedTimeIsWorking : boolean

        @model_field()
        intervals                : Partial<CalendarIntervalMixin>[]


        // // this makes the calendar's self-atom to change (and trigger calculation on outgoing edges) on every `version` change
        // * calculateSelf () : CalculationIterator<this> {
        //     yield this.$.version
        //
        //     return this
        // }


    }

    return BaseCalendarMixin
}){}

/**
 * Class providing a human readable localized description of an [[EmptyCalendarEffect]] instance.
 */
export class EmptyCalendarEffectDescription extends Localizable(Base) {

    static get $name () {
        return 'EmptyCalendarEffectDescription'
    }

    static getDescription (effect : EmptyCalendarEffect) : string {
        const calendar      = effect.getCalendar()

        return format(this.L('L{descriptionTpl}'), calendar.name || calendar.id)
    }

}

/**
 * Special effect indicating that some calendar or calendars group is misconfigured
 * and do not provide any working period of time which makes its usage
 * impossible.
 */
export class EmptyCalendarEffect extends SchedulingIssueEffect<BaseEmptyCalendarEffectResolution> {

    @prototypeValue('emptyCalendar')
    type                        : string

    handler                     : symbol    = EmptyCalendarSymbol

    @prototypeValue(EmptyCalendarEffectDescription)
    _descriptionBuilderClass

    calendars                   : Array<BaseCalendarMixin>

    event                       : HasCalendarMixin

    date                        : Date

    isForward                   : boolean

    getResolutions () : BaseEmptyCalendarEffectResolution[] {
        const calendar      = this.getCalendar()

        return this._resolutions || (this._resolutions = [
            Use24hrsEmptyCalendarEffectResolution.new({ calendar }),
            Use8hrsEmptyCalendarEffectResolution.new({ calendar })
        ])
    }

    // TODO handle cases when all individual calendars have working periods yet their intersection does not
    /**
     * Returns the calendar that does not have any working periods specified.
     */
    getCalendar () : BaseCalendarMixin {
        const { calendars }   = this

        if (calendars?.length > 1) {
            for (const calendar of calendars) {
                const skippingRes       = calendar.skipNonWorkingTime(this.date, this.isForward)

                if (!(skippingRes instanceof Date)) {
                    return calendar
                }
            }
        }

        return calendars[0]
    }

}

/**
 * Base class for [[EmptyCalendarEffect]] resolutions.
 * The class has [[fixCalendarData]] method that pushes preconfigured [[calendarData]]
 * to the given [[calendar]]. The method is called in [[resolve]] method so for a subclass
 * it's enough just providing [[fixCalendarData|proper data]].
 */
export class BaseEmptyCalendarEffectResolution extends Localizable(SchedulingIssueEffectResolution) {

    static get $name () {
        return 'BaseEmptyCalendarEffectResolution'
    }

    /**
     * Calendar to fix.
     */
    calendar        : BaseCalendarMixin

    static get configurable() {
        return {
            /**
             * Correct calendar data.
             * @property calendarData
             */
            calendarData : {
                intervals : [
                    { isWorking : true }
                ]
            }
        }
    }

    getDescription () : string {
        const { calendar } = this

        return format(this.L('L{descriptionTpl}'), calendar.name || calendar.id)
    }

    /**
     * Fixes the provided calendar data by clearing its intervals
     * amd then applying data specified in [[calendarData]] config.
     * @param calendar
     */
    fixCalendarData (calendar : BaseCalendarMixin) {
        calendar.clearIntervals(true)

        // @ts-ignore
        Object.assign(calendar, this.calendarData)

        if (calendar.intervals?.length) {
            calendar.addIntervals(calendar.intervals)
        }
    }

    /**
     * Resolves the [[calendar]] by removing all its intervals and
     * adding new [[calendarData|correct ones]].
     */
    resolve () {
        const { calendar } = this

        this.fixCalendarData(calendar)
    }
}

/**
 * Resolution option for [[EmptyCalendarEffect]] that fixes a specified calendar by
 * replacing its data with standard __24 hours/day__ calendar (__Saturday__ and __Sunday__ are non-working days) data.
 */
export class Use24hrsEmptyCalendarEffectResolution extends BaseEmptyCalendarEffectResolution {

    static get $name () {
        return 'Use24hrsEmptyCalendarEffectResolution'
    }

    static get configurable() {
        return {
            calendarData : {
                unspecifiedTimeIsWorking : false,
                intervals                : [
                    {
                        recurrentStartDate : 'on Mon at 0:00',
                        recurrentEndDate   : 'on Sat at 0:00',
                        isWorking          : true
                    }
                ]
            }
        }
    }

}

/**
 * Resolution option for [[EmptyCalendarEffect]] that fixes a specified calendar by
 * replacing its data with standard __8 hours/day__ calendar (__Saturday__ and __Sunday__ are non-working days) data.
 */
 export class Use8hrsEmptyCalendarEffectResolution extends BaseEmptyCalendarEffectResolution {

    static get $name () {
        return 'Use8hrsEmptyCalendarEffectResolution'
    }

    static get configurable() {
        return {
            calendarData : {
                unspecifiedTimeIsWorking : false,
                intervals                : [
                    {
                        recurrentStartDate : 'every weekday at 08:00',
                        recurrentEndDate   : 'every weekday at 12:00',
                        isWorking          : true
                    },
                    {
                        recurrentStartDate : 'every weekday at 13:00',
                        recurrentEndDate   : 'every weekday at 17:00',
                        isWorking          : true
                    }
                ]
            }
        }
    }

}
