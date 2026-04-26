var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Effect } from "../../ChronoGraph/chrono/Effect.js";
import { prototypeValue } from "../../ChronoGraph/util/Helpers.js";
import Base from "../../Core/Base.js";
/**
 * Type for an effect resolution process.
 */
export var EffectResolutionResult;
(function (EffectResolutionResult) {
    /**
     * A chosen resolution is "do nothing" so changes should be cancelled.
     */
    EffectResolutionResult["Cancel"] = "Cancel";
    /**
     * A resolution is applied and current transaction should be continued.
     */
    EffectResolutionResult["Resume"] = "Resume";
})(EffectResolutionResult || (EffectResolutionResult = {}));
/**
 * Class implementing a [[SchedulingIssueEffect|scheduling issue]] resolution.
 */
export class SchedulingIssueEffectResolution extends Base {
    /**
     * Returns the resolution description.
     */
    getDescription() {
        throw new Error('Abstract method');
    }
    /**
     * Resolves the [[SchedulingIssueEffect|scheduling issue]].
     */
    resolve(...args) {
        throw new Error('Abstract method');
    }
}
/**
 * Base class for an [[Effect|effect]] signalizing of a scheduling issue
 * that should be resolved by some application logic or the user.
 * The class provides an array of the case possible [[getResolutions|resolutions]]
 * and the case [[getDescription|description]].
 */
export class SchedulingIssueEffect extends Effect {
    /**
     * Returns the list of possible effect resolutions.
     */
    getResolutions() {
        return this._resolutions;
    }
    getDescriptionBuilderClass() {
        return this._descriptionBuilderClass;
    }
    setDescriptionBuilderClass(cls) {
        this._descriptionBuilderClass = cls;
    }
    /**
     * Returns the effect human readable description.
     */
    getDescription() {
        return this.getDescriptionBuilderClass().getDescription(this);
    }
}
__decorate([
    prototypeValue('schedulingIssueEffect')
], SchedulingIssueEffect.prototype, "type", void 0);
__decorate([
    prototypeValue(false)
], SchedulingIssueEffect.prototype, "sync", void 0);
