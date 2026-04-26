import { Transaction } from "../../ChronoGraph/chrono/Transaction.js"
import { prototypeValue } from "../../ChronoGraph/util/Helpers.js"
import Base from "../../Core/Base.js"
import DateHelper from "../../Core/helper/DateHelper.js"
import Localizable from "../../Core/localization/Localizable.js"
import "../localization/En.js"
import { DateInterval, intersectIntervals } from "../scheduling/DateInterval.js"
import { ConstraintIntervalSide } from "../scheduling/Types.js"
import { format } from "../util/Functions.js"
import { ChronoModelMixin } from "./ChronoModelMixin.js"
import { SchedulingIssueEffect, SchedulingIssueEffectResolution } from "./SchedulingIssueEffect.js"


//---------------------------------------------------------------------------------------------------------------------
export const ConflictSymbol    = Symbol('ConflictSymbol')

/**
 * Description builder for a [[ConflictEffect|scheduling conflict]].
 */
export class ConflictEffectDescription extends Localizable(Base) {

    static get $name () {
        return 'ConflictEffectDescription'
    }

    /**
     * Returns the scheduling conflict localized description.
     * @param conflict Scheduling conflict
     */
    static getDescription (conflict : ConflictEffect) : string {
        return format(this.L('L{descriptionTpl}'), conflict.intervals[0].getDescription(), conflict.intervals[1].getDescription())
    }

}

/**
 * Special [[Effect|effect]] indicating a _scheduling conflict_ happened.
 */
export class ConflictEffect extends SchedulingIssueEffect<ConflictResolution> {
    @prototypeValue('schedulingConflict')
    type                        : string

    handler                     : symbol    = ConflictSymbol

    @prototypeValue(ConflictEffectDescription)
    _descriptionBuilderClass    : typeof ConflictEffectDescription

    /**
     * List of conflicting intervals. It contains two elements and sorted so
     * that the interval modified or changed in the current transaction goes last.
     * Due to that order the first element always represents
     * the entity "preventing" the current transaction.
     */
    intervals                   : ConstraintInterval[]

    initialize (props) {
        super.initialize(props)

        // filter the provided intervals to keep only the conflicting ones
        this.intervals = this.filterConflictingIntervals(this.intervals)
    }

    /**
     * Returns possible resolutions for the _conflict_.
     */
    getResolutions () {
        if (!this._resolutions) {
            // collect all possible resolutions
            this._resolutions = [].concat(...this.intervals.map(interval => interval.getResolutions()))
        }

        return this._resolutions
    }

    filterConflictingIntervals (intervals : ConstraintInterval[]) : ConstraintInterval[] {

        const result                = []
        // filter out infinite intervals ..they don't really restrict anything
        const intervalsArray        = [ ...intervals ].filter(interval => !interval.isInfinite())
        const affectedInterval      = intervals.find(interval => interval.isAffectedByTransaction())

        // If we've managed to detect the interval being changed in this transaction

        if (affectedInterval) {

            // Sort intervals so the one we've found go first..
            const sorted                = intervalsArray.sort((a, b) => a === affectedInterval ? -1 : 0)

            // ..so when intersecting intervals we find another interval resulting an empty intersection
            const intersection          = intersectIntervals(sorted, true)

            const conflictingInterval   = intersection.intersectedAsEmpty as ConstraintInterval

            result.push(conflictingInterval, affectedInterval)
        }
        else {
            result.push(
                intersectIntervals(intervalsArray, true).intersectedAsEmpty as ConstraintInterval,
                intersectIntervals(intervalsArray.reverse(), true).intersectedAsEmpty as ConstraintInterval
            )
        }

        return result
    }
}


/**
 * An abstract class for implementing a certain way of resolving a scheduling conflict.
 */
export class ConflictResolution extends SchedulingIssueEffectResolution {

    /**
     * Constraining interval the resolution belongs to.
     */
    interval : ConstraintInterval

    /**
     * Resolves the scheduling conflict.
     */
    resolve () {
        throw new Error('Abstract method')
    }
}

/**
 * Base class for an interval _description builder_ - s special class that returns
 * a human readable localized description for a provided interval.
 */
export class ConstraintIntervalDescription extends Localizable(Base) {

    static get $name () {
        return 'ConstraintIntervalDescription'
    }

    /**
     * Returns the provided interval description.
     * @param interval Interval to get description of
     */
    static getDescription (interval : ConstraintInterval) : string {
        return format(this.L('L{descriptionTpl}'), ...this.getDescriptionParameters(interval))
    }

    /**
     * Returns additional parameters to put into the description.
     * @param interval Interval to get description of
     */
    static getDescriptionParameters (interval : ConstraintInterval) : any[] {
        return [
            DateHelper.format(interval.startDate, this.L('L{dateFormat}')),
            DateHelper.format(interval.endDate, this.L('L{dateFormat}'))
        ]
    }

}

/**
 * Base class for implementing an interval that applies a certain constraint on event(s).
 */
export class ConstraintInterval extends DateInterval {

    owner                   : ChronoModelMixin          = undefined

    reflectionOf            : ConstraintInterval        = undefined

    side                    : ConstraintIntervalSide    = undefined

    @prototypeValue(ConstraintIntervalDescription)
    descriptionBuilderClass : typeof ConstraintIntervalDescription

    resolutions             : ConflictResolution[]      = undefined

    /**
     * Returns the interval description.
     */
    getDescription () : string {
        return this.descriptionBuilderClass.getDescription(this)
    }

    /**
     * Returns possible resolution for the interval when it takes part in a _scheduling conflict_.
     */
    getResolutions () : ConflictResolution[] {
        return []
    }

    isAffectedByTransaction (transaction? : Transaction) : boolean {
        return false
    }

    getCopyProperties (data : Partial<this>) : Partial<this> {
        const { owner, reflectionOf, side } = this

        return Object.assign({ owner, reflectionOf, side }, data)
    }

    copyWith (data : Partial<this>) : this {
        const copyData : Partial<this>     = this.getCopyProperties(data)

        // @ts-ignore
        return this.constructor.new(copyData)
    }

}
