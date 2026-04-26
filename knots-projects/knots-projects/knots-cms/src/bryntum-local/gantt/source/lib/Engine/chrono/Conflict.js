var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { prototypeValue } from "../../ChronoGraph/util/Helpers.js";
import Base from "../../Core/Base.js";
import DateHelper from "../../Core/helper/DateHelper.js";
import Localizable from "../../Core/localization/Localizable.js";
import "../localization/En.js";
import { DateInterval, intersectIntervals } from "../scheduling/DateInterval.js";
import { format } from "../util/Functions.js";
import { SchedulingIssueEffect, SchedulingIssueEffectResolution } from "./SchedulingIssueEffect.js";
//---------------------------------------------------------------------------------------------------------------------
export const ConflictSymbol = Symbol('ConflictSymbol');
/**
 * Description builder for a [[ConflictEffect|scheduling conflict]].
 */
export class ConflictEffectDescription extends Localizable(Base) {
    static get $name() {
        return 'ConflictEffectDescription';
    }
    /**
     * Returns the scheduling conflict localized description.
     * @param conflict Scheduling conflict
     */
    static getDescription(conflict) {
        return format(this.L('L{descriptionTpl}'), conflict.intervals[0].getDescription(), conflict.intervals[1].getDescription());
    }
}
/**
 * Special [[Effect|effect]] indicating a _scheduling conflict_ happened.
 */
export class ConflictEffect extends SchedulingIssueEffect {
    constructor() {
        super(...arguments);
        this.handler = ConflictSymbol;
    }
    initialize(props) {
        super.initialize(props);
        // filter the provided intervals to keep only the conflicting ones
        this.intervals = this.filterConflictingIntervals(this.intervals);
    }
    /**
     * Returns possible resolutions for the _conflict_.
     */
    getResolutions() {
        if (!this._resolutions) {
            // collect all possible resolutions
            this._resolutions = [].concat(...this.intervals.map(interval => interval.getResolutions()));
        }
        return this._resolutions;
    }
    filterConflictingIntervals(intervals) {
        const result = [];
        // filter out infinite intervals ..they don't really restrict anything
        const intervalsArray = [...intervals].filter(interval => !interval.isInfinite());
        const affectedInterval = intervals.find(interval => interval.isAffectedByTransaction());
        // If we've managed to detect the interval being changed in this transaction
        if (affectedInterval) {
            // Sort intervals so the one we've found go first..
            const sorted = intervalsArray.sort((a, b) => a === affectedInterval ? -1 : 0);
            // ..so when intersecting intervals we find another interval resulting an empty intersection
            const intersection = intersectIntervals(sorted, true);
            const conflictingInterval = intersection.intersectedAsEmpty;
            result.push(conflictingInterval, affectedInterval);
        }
        else {
            result.push(intersectIntervals(intervalsArray, true).intersectedAsEmpty, intersectIntervals(intervalsArray.reverse(), true).intersectedAsEmpty);
        }
        return result;
    }
}
__decorate([
    prototypeValue('schedulingConflict')
], ConflictEffect.prototype, "type", void 0);
__decorate([
    prototypeValue(ConflictEffectDescription)
], ConflictEffect.prototype, "_descriptionBuilderClass", void 0);
/**
 * An abstract class for implementing a certain way of resolving a scheduling conflict.
 */
export class ConflictResolution extends SchedulingIssueEffectResolution {
    /**
     * Resolves the scheduling conflict.
     */
    resolve() {
        throw new Error('Abstract method');
    }
}
/**
 * Base class for an interval _description builder_ - s special class that returns
 * a human readable localized description for a provided interval.
 */
export class ConstraintIntervalDescription extends Localizable(Base) {
    static get $name() {
        return 'ConstraintIntervalDescription';
    }
    /**
     * Returns the provided interval description.
     * @param interval Interval to get description of
     */
    static getDescription(interval) {
        return format(this.L('L{descriptionTpl}'), ...this.getDescriptionParameters(interval));
    }
    /**
     * Returns additional parameters to put into the description.
     * @param interval Interval to get description of
     */
    static getDescriptionParameters(interval) {
        return [
            DateHelper.format(interval.startDate, this.L('L{dateFormat}')),
            DateHelper.format(interval.endDate, this.L('L{dateFormat}'))
        ];
    }
}
/**
 * Base class for implementing an interval that applies a certain constraint on event(s).
 */
export class ConstraintInterval extends DateInterval {
    constructor() {
        super(...arguments);
        this.owner = undefined;
        this.reflectionOf = undefined;
        this.side = undefined;
        this.resolutions = undefined;
    }
    /**
     * Returns the interval description.
     */
    getDescription() {
        return this.descriptionBuilderClass.getDescription(this);
    }
    /**
     * Returns possible resolution for the interval when it takes part in a _scheduling conflict_.
     */
    getResolutions() {
        return [];
    }
    isAffectedByTransaction(transaction) {
        return false;
    }
    getCopyProperties(data) {
        const { owner, reflectionOf, side } = this;
        return Object.assign({ owner, reflectionOf, side }, data);
    }
    copyWith(data) {
        const copyData = this.getCopyProperties(data);
        // @ts-ignore
        return this.constructor.new(copyData);
    }
}
__decorate([
    prototypeValue(ConstraintIntervalDescription)
], ConstraintInterval.prototype, "descriptionBuilderClass", void 0);
