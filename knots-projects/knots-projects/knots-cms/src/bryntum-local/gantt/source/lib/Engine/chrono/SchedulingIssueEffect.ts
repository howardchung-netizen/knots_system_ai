import { Effect } from "../../ChronoGraph/chrono/Effect.js"
import { prototypeValue } from "../../ChronoGraph/util/Helpers.js"
import Base from "../../Core/Base.js"

/**
 * Type for an effect resolution process.
 */
export enum EffectResolutionResult {
    /**
     * A chosen resolution is "do nothing" so changes should be cancelled.
     */
    Cancel      = 'Cancel',
    /**
     * A resolution is applied and current transaction should be continued.
     */
    Resume      = 'Resume'
}


// TODO docs
export interface ISchedulingIssueEffectDescriptionBuilder<T extends SchedulingIssueEffectResolution> {

    getDescription (effect : SchedulingIssueEffect<T>) : string

}

/**
 * Class implementing a [[SchedulingIssueEffect|scheduling issue]] resolution.
 */
export class SchedulingIssueEffectResolution extends Base {

    /**
     * Returns the resolution description.
     */
    getDescription () : string {
        throw new Error('Abstract method')
    }

    /**
     * Resolves the [[SchedulingIssueEffect|scheduling issue]].
     */
    resolve (...args : unknown[]) {
        throw new Error('Abstract method')
    }

}


/**
 * Base class for an [[Effect|effect]] signalizing of a scheduling issue
 * that should be resolved by some application logic or the user.
 * The class provides an array of the case possible [[getResolutions|resolutions]]
 * and the case [[getDescription|description]].
 */
export class SchedulingIssueEffect<T extends SchedulingIssueEffectResolution> extends Effect {

    @prototypeValue('schedulingIssueEffect')
    type                        : string

    @prototypeValue(false)
    sync                        : boolean

    _descriptionBuilderClass    : ISchedulingIssueEffectDescriptionBuilder<T>

    _resolutions                : T[]

    /**
     * Returns the list of possible effect resolutions.
     */
    getResolutions () : T[] {
        return this._resolutions
    }

    getDescriptionBuilderClass () : this['_descriptionBuilderClass'] {
        return this._descriptionBuilderClass
    }

    setDescriptionBuilderClass (cls : this['_descriptionBuilderClass']) {
        this._descriptionBuilderClass = cls
    }

    /**
     * Returns the effect human readable description.
     */
    getDescription () : string {
        return this.getDescriptionBuilderClass().getDescription(this)
    }
}
