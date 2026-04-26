/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { Mixin, uniqueOnly, concatIterable, map, CI, MixinAny, concat, isInstanceOf, MAX_DATE, MIN_DATE, EdgeInclusion, format, AbstractPartOfProjectGenericMixin, AbstractPartOfProjectStoreMixin, AbstractPartOfProjectModelMixin, AbstractCalendarMixin, AbstractAssignmentStoreMixin, AbstractCalendarManagerStoreMixin, AbstractDependencyStoreMixin, stripDuplicates, TimeUnit, Direction, isNotNumber, AbstractHasAssignmentsMixin, AbstractEventStoreMixin, AbstractResourceStoreMixin, DependencyType, AbstractProjectMixin, ProjectType, ConstraintIntervalSide, isDateFinite, DependenciesCalendar, ConstraintType, CalendarIteratorResult, CalendarIntervalMixin, CalendarIntervalStore, DependencyValidationResult, AssignmentModelMixin, AssignmentStoreMixin, DependencyBaseModel, DependencyStoreMixin, ResourceModelMixin, ResourceStoreMixin, ProjectCrudManager as ProjectCrudManager$1, SchedulingMode } from './ProjectModel.js';
import { Base, CalendarCacheMultiple } from './TimeAxisHeaderMenu.js';
import { StateTrackingManager } from './AvatarRendering.js';
import { Model, ObjectHelper, LocaleManagerSingleton, Base as Base$1, Localizable, DateHelper, _objectSpread2, Store, Combo, AjaxStore, InstancePlugin, DomSync, DomHelper, Events, LocaleHelper, Popup, Toast, Widget, Container, Delayable, _defineProperty, Promissory } from './Editor.js';
import { GridRowModel } from './GridRowModel.js';
import { GridFeatureManager } from './GridBase.js';
import { DragHelper, DateField, MessageDialog } from './LocalizableComboItems.js';
import { DurationField } from './DurationField.js';
import './Grid.js';
import './LocalizableCombo.js';
import './TextAreaField.js';
import './TabPanel.js';
import './Card.js';
import { locale as locale$2 } from './EventNavigation.js';

//---------------------------------------------------------------------------------------------------------------------
const MIN_SMI = -Math.pow(2, 30);
const MAX_SMI = Math.pow(2, 30) - 1; //---------------------------------------------------------------------------------------------------------------------

const uppercaseFirst = str => str.slice(0, 1).toUpperCase() + str.slice(1); //---------------------------------------------------------------------------------------------------------------------

const isAtomicValue = value => Object(value) !== value; //---------------------------------------------------------------------------------------------------------------------

const defineProperty = (target, property, value) => {
  Object.defineProperty(target, property, {
    value,
    enumerable: true,
    configurable: true
  });
  return value;
}; //---------------------------------------------------------------------------------------------------------------------

const prototypeValue = value => {
  return function (target, propertyKey) {
    target[propertyKey] = value;
  };
}; //---------------------------------------------------------------------------------------------------------------------

const copySetInto = (sourceSet, targetSet) => {
  for (const value of sourceSet) targetSet.add(value);

  return targetSet;
}; //---------------------------------------------------------------------------------------------------------------------

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout)); //---------------------------------------------------------------------------------------------------------------------
let isRegeneratorRuntime = null;
const isGeneratorFunction = function (func) {
  if (isRegeneratorRuntime === null) isRegeneratorRuntime = typeof regeneratorRuntime !== 'undefined';

  if (isRegeneratorRuntime === true) {
    return regeneratorRuntime.isGeneratorFunction(func);
  } else {
    return func.constructor.name === 'GeneratorFunction';
  }
};

const emptyFn = (...args) => undefined;

const DEBUG_ONLY = func => emptyFn;

const required = DEBUG_ONLY();
const validateRequiredProperties = DEBUG_ONLY();

var OnCycleAction;

(function (OnCycleAction) {
  OnCycleAction["Cancel"] = "Cancel";
  OnCycleAction["Resume"] = "Resume";
})(OnCycleAction || (OnCycleAction = {})); //---------------------------------------------------------------------------------------------------------------------

const WalkSource = Symbol('WalkSource');
const NOT_VISITED = -1;
const VISITED_TOPOLOGICALLY = -2; //---------------------------------------------------------------------------------------------------------------------

class WalkContext extends Base {
  constructor() {
    super(...arguments);
    this.visited = new Map();
    this.toVisit = [];
    this.currentEpoch = 0;
  }

  startFrom(sourceNodes) {
    this.continueFrom(sourceNodes);
  }

  continueFrom(sourceNodes) {
    this.toVisit.push.apply(this.toVisit, sourceNodes.map(node => {
      return {
        node: node,
        from: WalkSource,
        label: undefined
      };
    }));
    this.walkDepth();
  }

  onNode(node, walkStep) {}

  onTopologicalNode(node) {}

  onCycle(node, stack) {
    return OnCycleAction.Cancel;
  }

  forEachNext(node, func) {
    throw new Error("Abstract method called");
  }

  collectNext(node, toVisit, visitInfo) {
    throw new Error("Abstract method called");
  }

  getVisitedInfo(node) {
    return this.visited.get(node);
  }

  setVisitedInfo(node, visitedAt, info) {
    if (!info) {
      info = {
        visitedAt,
        visitEpoch: this.currentEpoch
      };
      this.visited.set(node, info);
    } else {
      info.visitedAt = visitedAt;
      info.visitEpoch = this.currentEpoch;
    }

    return info;
  }

  walkDepth() {
    this.visited;
    const toVisit = this.toVisit;
    let depth;

    while (depth = toVisit.length) {
      const node = toVisit[depth - 1].node;
      const visitedInfo = this.getVisitedInfo(node); // this supports the "ahead-of-time" creation of the "visited" entries, which actually lead to improved benchmarks,
      // so it might be a default

      if (visitedInfo && visitedInfo.visitedAt === VISITED_TOPOLOGICALLY && visitedInfo.visitEpoch === this.currentEpoch) {
        toVisit.pop();
        continue;
      }

      if (visitedInfo && visitedInfo.visitEpoch === this.currentEpoch && visitedInfo.visitedAt !== NOT_VISITED) {
        // it is valid to find itself "visited", but only if visited at the current depth
        // (which indicates stack unwinding)
        // if the node has been visited at earlier depth - its a cycle
        if (visitedInfo.visitedAt < depth) {
          // ONLY resume if explicitly returned `Resume`, cancel in all other cases (undefined, etc)
          if (this.onCycle(node, toVisit) !== OnCycleAction.Resume) break;
        } else {
          visitedInfo.visitedAt = VISITED_TOPOLOGICALLY;
          this.onTopologicalNode(node);
        }

        toVisit.pop();
      } else {
        // if we break here, we can re-enter the loop later
        if (this.onNode(node, toVisit[depth - 1]) === false) break; // first entry to the node

        const visitedInfo2 = this.setVisitedInfo(node, depth, visitedInfo);
        const lengthBefore = toVisit.length;
        this.collectNext(node, toVisit, visitedInfo2); // if there's no outgoing edges, node is at topological position
        // it would be enough to just continue the `while` loop and the `onTopologicalNode`
        // would happen on next iteration, but with this "inlining" we save one call to `visited.get()`
        // at the cost of length comparison

        if (toVisit.length === lengthBefore) {
          visitedInfo2.visitedAt = VISITED_TOPOLOGICALLY;
          this.onTopologicalNode(node);
          toVisit.pop();
        }
      }
    }
  }

} //---------------------------------------------------------------------------------------------------------------------

function cycleInfo(stack) {
  const length = stack.length;
  if (length === 0) return [];
  const cycleSource = stack[length - 1].node;
  const cycle = [cycleSource];
  let current = length - 1;
  let cursor = current;

  while (current >= 0 && stack[current].from !== cycleSource) {
    // going backward in steps, skipping the nodes with identical `from`
    while (current >= 0 && stack[current].from === stack[cursor].from) current--;

    if (current >= 0) {
      // the first node with different `from` will be part of the cycle path
      cycle.push(stack[current].node);
      cursor = current;
    }
  } // no cycle

  if (current < 0) return [];
  cycle.push(cycleSource);
  return cycle.reverse();
}

var __decorate$s = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let FORMULA_ID = 0; //---------------------------------------------------------------------------------------------------------------------

/**
 * Pre-defined constant formula id. If assigned to some variable, specifies, that this variable should keep the value proposed by user
 * (user input), or, if there's none, its previous value.
 */

const CalculateProposed = FORMULA_ID++; // export const CalculatePure : FormulaId          = FORMULA_ID++
//---------------------------------------------------------------------------------------------------------------------

/**
 * Class, describing a formula, which is part of the cyclic set. Formula just specifies its input variables and output variable,
 * it does not contain actual calculation.
 *
 * It is assumed that formula can only be "activated" if all of its inputs has value. It can be either a value from the previous iteration,
 * a value provided by user, or an output value of some other formula. See [[VariableInputState]] and [[CycleResolutionInput]].
 */

class Formula extends Base {
  constructor() {
    super(...arguments);
    /**
     * The id of the formula. It is assigned automatically, should not be changed.
     */

    this.formulaId = FORMULA_ID++;
    /**
     * A set of the input variables for this formula.
     */

    this.inputs = new Set();
  }

} //---------------------------------------------------------------------------------------------------------------------

class VariableWalkContext extends WalkContext {
  collectNext(sourceNode, toVisit) {
    if (sourceNode instanceof Formula) {
      toVisit.push({
        node: sourceNode.output,
        from: sourceNode,
        label: undefined
      });
    } else {
      const formulas = this.cache.formulasByInput.get(sourceNode);
      formulas && formulas.forEach(formula => toVisit.push({
        node: formula,
        from: sourceNode,
        label: undefined
      }));
    }
  }

} //---------------------------------------------------------------------------------------------------------------------

class FormulasCache extends Mixin([Base], base => class FormulasCache extends base {
  constructor() {
    super(...arguments);
    /**
     * A set of variables, which forms cyclic computation
     */

    this.variables = new Set();
    /**
     * A set of formulas, which forms cyclic computation
     */

    this.formulas = new Set();
    this.$formulasByInput = undefined;
    this.$formulasByOutput = undefined;
  }

  get formulasByInput() {
    if (this.$formulasByInput !== undefined) return this.$formulasByInput;
    this.fillCache();
    return this.$formulasByInput;
  }

  get formulasByOutput() {
    if (this.$formulasByOutput !== undefined) return this.$formulasByOutput;
    this.fillCache();
    return this.$formulasByOutput;
  }

  add(formula) {
    this.$formulasByInput = undefined;
    this.$formulasByOutput = undefined;
    this.formulas.add(formula);
  }

  has(formula) {
    return this.formulas.has(formula);
  }

  fillCache() {
    this.$formulasByInput = new Map();
    this.$formulasByOutput = new Map();
    this.formulas.forEach(formula => {
      let formulasByOutput = this.$formulasByOutput.get(formula.output);

      if (!formulasByOutput) {
        formulasByOutput = new Set();
        this.$formulasByOutput.set(formula.output, formulasByOutput);
      }

      formulasByOutput.add(formula);
      formula.inputs.forEach(input => {
        let formulasByInput = this.$formulasByInput.get(input);

        if (!formulasByInput) {
          formulasByInput = new Set();
          this.$formulasByInput.set(input, formulasByInput);
        }

        formulasByInput.add(formula);
      });
    });
  }

  allInputVariables() {
    return uniqueOnly(concatIterable(map(this.formulas, formula => formula.inputs.values())));
  }

  isCyclic() {
    let isCyclic = false;
    const walkContext = VariableWalkContext.new({
      cache: this,
      onCycle: () => {
        isCyclic = true;
        return OnCycleAction.Cancel;
      }
    });
    walkContext.startFrom(Array.from(this.allInputVariables()));
    return isCyclic;
  }

}) {} //---------------------------------------------------------------------------------------------------------------------

/**
 * Abstract description of the cycle. Does not include the default formula resolution, only variables and formulas. See also [[CycleResolution]].
 */

class CycleDescription extends FormulasCache {} //---------------------------------------------------------------------------------------------------------------------

/**
 * Class describing the cycle resolution process. Requires the abstract cycle [[description]] and a set of default formulas.
 *
 * The resolution is performed with [[CycleResolution.resolve]] method.
 *
 * Resolution are memoized, based on the input. You should generally have a single instance of this class for a single set of default formulas,
 * to accumulate the results and make resolution fast.
 */

class CycleResolution extends Base {
  constructor() {
    super(...arguments);
    /**
     * Abstract cycle description for this resolution.
     */

    this.description = undefined;
    /**
     * A set of default formulas for this resolution. Default formulas specifies how the calculation should be performed, if there's no user input
     * for any variable (or there's input for all of them). Also, default formulas are preferred, if several formulas can be chosen to continue the resolution.
     */

    this.defaultResolutionFormulas = new Set();
    this.resolutionsByInputHash = new Map();
  } // the caching space is 3^var_num might need to clear the memory at some time

  clear() {
    this.resolutionsByInputHash.clear();
  }
  /**
   * This method accepts an input object and returns a cycle resolution.
   * Resolution are memoized, based on the input.
   *
   * @param input
   */

  resolve(input) {
    const cached = this.resolutionsByInputHash.get(input.hash);
    if (cached !== undefined) return cached;
    const resolution = this.buildResolution(input);
    this.resolutionsByInputHash.set(input.hash, resolution);
    return resolution;
  }

  buildResolution(input) {
    const walkContext = WalkState.new({
      context: this,
      input
    });
    const allResolutions = Array.from(walkContext.next()).map(state => {
      return {
        resolution: state.asResolution(),
        nbrOfDefaultFormulas: Array.from(state.activatedFormulas.formulas).reduce((count, formula) => state.formulaIsDefault(formula) ? count + 1 : count, 0),
        unCoveredInputWeight: state.unCoveredInputWeight()
      };
    });
    allResolutions.sort((res1, res2) => {
      if (res1.unCoveredInputWeight < res2.unCoveredInputWeight) return -1;
      if (res1.unCoveredInputWeight > res2.unCoveredInputWeight) return 1;
      return res2.nbrOfDefaultFormulas - res1.nbrOfDefaultFormulas;
    });
    if (allResolutions.length > 0) return allResolutions[0].resolution;else debugger; // return default? or all-proposed?
  }

}
/**
 * Enumeration for various states of the input data for variables in the cycle. Individual members corresponds to binary bits and can be set simultaneously, like:
 *
 * ```ts
 * const input : VariableInputState = VariableInputState.HasPreviousValue | VariableInputState.HasProposedValue
 * ```
 */

var VariableInputState;

(function (VariableInputState) {
  VariableInputState[VariableInputState["NoInput"] = 0] = "NoInput";
  /**
   * This bit indicates that variable has some previous value, when resolution starts. It can be any non-`undefined` value, including `null`.
   */

  VariableInputState[VariableInputState["HasPreviousValue"] = 1] = "HasPreviousValue";
  /**
   * This bit indicates that variable has user input, when resolution starts. It can be any non-`undefined` value, including `null`.
   */

  VariableInputState[VariableInputState["HasProposedValue"] = 2] = "HasProposedValue";
  /**
   * This bit indicates, that user intention is to keep this variable unchanged, if that is possible (does not contradict to other user input).
   */

  VariableInputState[VariableInputState["KeepIfPossible"] = 4] = "KeepIfPossible";
})(VariableInputState || (VariableInputState = {})); //---------------------------------------------------------------------------------------------------------------------

/**
 * Class, describing the input data for a set of variables during cycle resolution.
 */

class CycleResolutionInput extends Base {
  constructor() {
    super(...arguments);
    /**
     * A cycle resolution instance this input corresponds to.
     */

    this.context = undefined;
    this.input = undefined;
    this.$hash = '';
  }

  get hash() {
    if (this.$hash !== '') return this.$hash;
    return this.$hash = this.buildHash();
  }

  get description() {
    return this.context.description;
  }
  /**
   * Returns the same result as calling [[CycleResolution.resolve]] on this input instance
   */

  get resolution() {
    return this.context.resolve(this);
  }

  initialize(...args) {
    super.initialize(...args);
    this.input = new Map(CI(this.description.variables).map(variable => [variable, VariableInputState.NoInput]));
  }

  buildHash() {
    return String.fromCharCode(...CI(this.description.variables).inBatchesBySize(5).map(batch => this.batchToCharCode(batch)));
  }

  batchToCharCode(batch) {
    return batch.reduceRight((charCode, variable, index) => charCode | this.input.get(variable) << index * 3, 0);
  } //---------------------

  /**
   * This method sets the [[HasProposedValue]] flag for the specified variable.
   *
   * @param variable
   */

  addProposedValueFlag(variable) {

    const input = this.input.get(variable);
    this.input.set(variable, input | VariableInputState.HasProposedValue);
  }

  hasProposedValue(variable) {
    return Boolean(this.input.get(variable) & VariableInputState.HasProposedValue);
  }

  hasProposedValueVars() {
    return CI(this.description.variables).filter(variable => this.hasProposedValue(variable));
  } //---------------------

  /**
   * This method sets the [[HasPreviousValue]] flag for the specified variable.
   *
   * @param variable
   */

  addPreviousValueFlag(variable) {

    const input = this.input.get(variable);
    this.input.set(variable, input | VariableInputState.HasPreviousValue);
  }

  hasPreviousValue(variable) {
    return Boolean(this.input.get(variable) & VariableInputState.HasPreviousValue);
  }

  hasPreviousValueVars() {
    return CI(this.description.variables).filter(variable => this.hasPreviousValue(variable));
  } //---------------------

  /**
   * This method sets the [[KeepIfPossible]] flag for the specified variable.
   *
   * @param variable
   */

  addKeepIfPossibleFlag(variable) {

    const input = this.input.get(variable);
    this.input.set(variable, input | VariableInputState.KeepIfPossible);
  }

  keepIfPossible(variable) {
    return Boolean(this.input.get(variable) & VariableInputState.KeepIfPossible);
  }

  keepIfPossibleVars() {
    return CI(this.description.variables).filter(variable => this.keepIfPossible(variable));
  }

}

__decorate$s([required], CycleResolutionInput.prototype, "context", void 0); //---------------------------------------------------------------------------------------------------------------------

class WalkState extends Base {
  constructor() {
    super(...arguments);
    this.context = undefined;
    this.input = undefined;
    this.previous = undefined;
    this.activatedFormula = undefined;
    this.$activatedFormulas = undefined;
  }

  get activatedFormulas() {
    if (this.$activatedFormulas !== undefined) return this.$activatedFormulas;
    const cache = FormulasCache.new({
      variables: this.description.variables,
      formulas: CI(this.thisAndPreviousStates()).map(state => state.activatedFormula).toSet()
    });
    return this.$activatedFormulas = cache;
  }

  get description() {
    return this.context.description;
  }

  *thisAndPreviousStates() {
    let current = this;

    while (current && current.activatedFormula) {
      yield current;
      current = current.previous;
    }
  }

  formulaHasProposedValueInInput(formula) {
    return Array.from(formula.inputs).some(variable => this.input.hasProposedValue(variable));
  } // this method counts

  unCoveredInputWeight() {
    const proposedVars = map(this.input.hasProposedValueVars(), variable => {
      return {
        variable,
        isProposed: true
      };
    });
    const keepIfPossibleVars = map(this.input.keepIfPossibleVars(), variable => {
      return {
        variable,
        isProposed: false
      };
    });
    const allInputVars = CI([proposedVars, keepIfPossibleVars]).concat().uniqueOnlyBy(el => el.variable);
    return allInputVars.reduce((totalWeight, {
      variable,
      isProposed
    }) => {
      let weight = 0; //-----------------

      const isOverwrittenByFormulas = this.activatedFormulas.formulasByOutput.get(variable);

      if (isOverwrittenByFormulas) {
        const formula = isOverwrittenByFormulas.size === 1 ? Array.from(isOverwrittenByFormulas)[0] : null; // the case, when some user input is overwritten with the default formula should be weighted less than
        // its overwritten with regular formula

        if (formula && this.formulaIsDefault(formula) && this.formulaHasProposedValueInInput(formula)) {
          if (isProposed) weight += 1e6;else weight += 1e4;
        } else {
          if (isProposed) weight += 1e7;else weight += 1e5;
        }
      } //-----------------

      const usedInFormulas = this.activatedFormulas.formulasByInput.get(variable);

      if (!(usedInFormulas && usedInFormulas.size > 0)) {
        if (isProposed) weight += 1e3;else weight += 1e2;
      }

      return totalWeight + weight;
    }, 0);
  }

  preferFormula(formula1, formula2) {
    const allInputsHasProposed1 = this.formulaAllInputsHasProposed(formula1);
    const allInputsHasProposed2 = this.formulaAllInputsHasProposed(formula2);
    if (allInputsHasProposed1 && !allInputsHasProposed2) return -1;
    if (allInputsHasProposed2 && !allInputsHasProposed1) return 1;
    const countInputsWithProposedOrKeep1 = this.formulaCountInputsWithProposedOrKeep(formula1);
    const countInputsWithProposedOrKeep2 = this.formulaCountInputsWithProposedOrKeep(formula2);
    if (countInputsWithProposedOrKeep1 > countInputsWithProposedOrKeep2) return -1;
    if (countInputsWithProposedOrKeep1 < countInputsWithProposedOrKeep2) return 1;
    if (this.formulaIsDefault(formula1) && !this.formulaIsDefault(formula2)) return -1;
    if (this.formulaIsDefault(formula2) && !this.formulaIsDefault(formula1)) return 1;
    return 0;
  }

  formulaIsDefault(formula) {
    return this.context.defaultResolutionFormulas.has(formula);
  }

  formulaCountInputsWithProposedOrKeep(formula) {
    let count = 0;
    Array.from(formula.inputs).forEach(variable => {
      if (this.input.hasProposedValue(variable) || this.input.keepIfPossible(variable)) count++;
    });
    return count;
  }

  formulaAllInputsHasProposedOrKeep(formula) {
    return Array.from(formula.inputs).every(variable => this.input.hasProposedValue(variable) || this.input.keepIfPossible(variable));
  }

  formulaAllInputsHasProposed(formula) {
    return Array.from(formula.inputs).every(variable => this.input.hasProposedValue(variable));
  }

  formulaIsApplicable(formula) {
    const everyFormulaInputHasValue = Array.from(formula.inputs).every(variable => this.input.hasProposedValue(variable) || this.input.hasPreviousValue(variable) || this.activatedFormulas.formulasByOutput.has(variable));
    const cache = FormulasCache.new({
      formulas: new Set(this.activatedFormulas.formulas)
    });
    cache.add(formula);
    return everyFormulaInputHasValue && !cache.isCyclic();
  }

  formulaIsInsignificant(formula) {
    const outputVariableAlreadyCalculated = this.activatedFormulas.formulasByOutput.has(formula.output);
    const outputVariableHasPreviousValue = this.input.hasPreviousValue(formula.output);
    return outputVariableAlreadyCalculated || outputVariableHasPreviousValue && Array.from(formula.inputs).some(variable => !this.input.hasPreviousValue(variable) && !this.input.hasProposedValue(variable));
  }

  unvisitedFormulas() {
    return Array.from(this.description.formulas).filter(formula => !this.activatedFormulas.has(formula));
  }

  *next() {
    const unvisitedFormulas = this.unvisitedFormulas();
    unvisitedFormulas.sort(this.preferFormula.bind(this));
    let isFinal = true;

    for (const formula of unvisitedFormulas) {
      if (!this.formulaIsApplicable(formula) || this.formulaIsInsignificant(formula)) continue;
      const nextState = WalkState.new({
        previous: this,
        context: this.context,
        input: this.input,
        activatedFormula: formula
      });
      yield* nextState.next();
      isFinal = false;
    }

    if (isFinal) yield this;
  }

  asResolution() {
    return new Map(CI(this.description.variables).map(variable => {
      const formulas = this.activatedFormulas.formulasByOutput.get(variable);

      if (formulas) {
        for (const firstFormula of formulas) {
          return [variable, firstFormula.formulaId];
        }
      }

      return [variable, CalculateProposed];
    }));
  }

}

var __decorate$r = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

const BreakCurrentStackExecution = Symbol('BreakCurrentStackExecution'); //---------------------------------------------------------------------------------------------------------------------

/**
 * The base class for effect. Effect is some value, that can be send to the "outer" calculation context, using the
 * effect handler function. Effect handler then will process an effect and return some resulting value.
 *
 * ```ts
 * const identifier  = graph.identifier((Y : SyncEffectHandler) : number => {
 *     const proposedValue : number    = Y(ProposedOrPrevious)
 *
 *     const maxValue : number         = Y(max)
 *
 *     return proposedValue <= maxValue ? proposedValue : maxValue
 * })
 * ```
 */

class Effect extends Base {}

__decorate$r([prototypeValue(true)], Effect.prototype, "sync", void 0);

__decorate$r([prototypeValue(true)], Effect.prototype, "pure", void 0); //---------------------------------------------------------------------------------------------------------------------

const ProposedOrPreviousSymbol = Symbol('ProposedOrPreviousSymbol');
/**
 * The constant that represents a request for either user input (proposed value) or previous value of the
 * identifier, currently being calculated.
 *
 * Important note, is that if an identifier yields a `ProposedOrPrevious` effect and its computed value does not match the value of this effect,
 * it will be re-calculated (computation function called) again on the next read. This is because the value of its `ProposedOrPrevious` input changes.
 *
 * ```ts
 * const graph4 = ChronoGraph.new()
 *
 * const max           = graph4.variable(100)
 *
 * const identifier15  = graph4.identifier((Y) : number => {
 *     const proposedValue : number    = Y(ProposedOrPrevious)
 *
 *     const maxValue : number         = Y(max)
 *
 *     return proposedValue <= maxValue ? proposedValue : maxValue
 * })
 *
 * graph4.write(identifier15, 18)
 *
 * const value15_1 = graph4.read(identifier15) // 18
 *
 * graph4.write(identifier15, 180)
 *
 * const value15_2 = graph4.read(identifier15) // 100
 *
 * graph4.write(max, 50)
 *
 * const value15_3 = graph4.read(identifier15) // 50
 * ```
 */

const ProposedOrPrevious = Effect.new({
  handler: ProposedOrPreviousSymbol
}); //---------------------------------------------------------------------------------------------------------------------

const RejectSymbol = Symbol('RejectSymbol');
/**
 * Class for [[Reject]] effect.
 */

class RejectEffect extends Effect {
  constructor() {
    super(...arguments);
    this.handler = RejectSymbol;
  }

}

__decorate$r([prototypeValue(false)], RejectEffect.prototype, "pure", void 0);
/**
 * This is constructor for `RejectEffect` class. If this effect will be yielded during computation the current transaction
 * will be [[ChronoGraph.reject|rejected]].
 *
 * @param reason
 * @constructor
 */

const Reject = reason => RejectEffect.new({
  reason
}); //---------------------------------------------------------------------------------------------------------------------

const TransactionSymbol = Symbol('TransactionSymbol');
const GetTransaction = Effect.new({
  handler: TransactionSymbol
}); //---------------------------------------------------------------------------------------------------------------------

const OwnQuarkSymbol = Symbol('OwnQuarkSymbol');
const OwnQuark = Effect.new({
  handler: OwnQuarkSymbol
}); //---------------------------------------------------------------------------------------------------------------------

const OwnIdentifierSymbol = Symbol('OwnIdentifierSymbol');
const OwnIdentifier = Effect.new({
  handler: OwnIdentifierSymbol
}); //---------------------------------------------------------------------------------------------------------------------

const WriteSymbol = Symbol('WriteSymbol');
class WriteEffect extends Effect {
  constructor() {
    super(...arguments);
    this.handler = WriteSymbol;
  }

}

__decorate$r([prototypeValue(false)], WriteEffect.prototype, "pure", void 0);

const Write = (identifier, proposedValue, ...proposedArgs) => WriteEffect.new({
  identifier,
  proposedArgs: [proposedValue, ...proposedArgs]
});
const WriteSeveralSymbol = Symbol('WriteSeveralSymbol');
class WriteSeveralEffect extends Effect {
  constructor() {
    super(...arguments);
    this.handler = WriteSeveralSymbol;
  }

}

__decorate$r([prototypeValue(false)], WriteSeveralEffect.prototype, "pure", void 0);

const WriteSeveral = writes => WriteSeveralEffect.new({
  writes
}); //---------------------------------------------------------------------------------------------------------------------

const PreviousValueOfSymbol = Symbol('PreviousValueOfSymbol');
class PreviousValueOfEffect extends Effect {
  constructor() {
    super(...arguments);
    this.handler = PreviousValueOfSymbol;
  }

}
const PreviousValueOf = identifier => PreviousValueOfEffect.new({
  identifier
}); //---------------------------------------------------------------------------------------------------------------------

const ProposedValueOfSymbol = Symbol('ProposedValueOfSymbol');
class ProposedValueOfEffect extends Effect {
  constructor() {
    super(...arguments);
    this.handler = ProposedValueOfSymbol;
  }

}
const ProposedValueOf = identifier => ProposedValueOfEffect.new({
  identifier
}); //---------------------------------------------------------------------------------------------------------------------

const HasProposedValueSymbol = Symbol('HasProposedValueSymbol');
class HasProposedValueEffect extends Effect {
  constructor() {
    super(...arguments);
    this.handler = HasProposedValueSymbol;
  }

}
const HasProposedValue = identifier => HasProposedValueEffect.new({
  identifier
}); //---------------------------------------------------------------------------------------------------------------------

const ProposedOrPreviousValueOfSymbol = Symbol('ProposedOrPreviousValueOfSymbol');
class ProposedOrPreviousValueOfEffect extends Effect {
  constructor() {
    super(...arguments);
    this.handler = ProposedOrPreviousValueOfSymbol;
  }

}
const ProposedOrPreviousValueOf = identifier => ProposedOrPreviousValueOfEffect.new({
  identifier
}); //---------------------------------------------------------------------------------------------------------------------

const ProposedArgumentsOfSymbol = Symbol('ProposedArgumentsOfSymbol');
class ProposedArgumentsOfEffect extends Effect {
  constructor() {
    super(...arguments);
    this.handler = ProposedArgumentsOfSymbol;
  }

}
const ProposedArgumentsOf = identifier => ProposedArgumentsOfEffect.new({
  identifier
}); //---------------------------------------------------------------------------------------------------------------------

const UnsafeProposedOrPreviousValueOfSymbol = Symbol('UnsafeProposedOrPreviousValueOfSymbol');
class UnsafeProposedOrPreviousValueOfEffect extends Effect {
  constructor() {
    super(...arguments);
    this.handler = UnsafeProposedOrPreviousValueOfSymbol;
  }

}
const UnsafeProposedOrPreviousValueOf = identifier => UnsafeProposedOrPreviousValueOfEffect.new({
  identifier
}); //---------------------------------------------------------------------------------------------------------------------

const UnsafePreviousValueOfSymbol = Symbol('UnsafePreviousValueOfSymbol');
class UnsafePreviousValueOfEffect extends Effect {
  constructor() {
    super(...arguments);
    this.handler = UnsafePreviousValueOfSymbol;
  }

}
const UnsafePreviousValueOf = identifier => UnsafePreviousValueOfEffect.new({
  identifier
});

/**
 * A subclass of [[CycleResolutionInput]] with additional convenience method [[collectInfo]].
 */

class CycleResolutionInputChrono extends CycleResolutionInput {
  /**
   * This method, given an effect handler, identifier and a variable, will add [[CycleResolutionInput.addPreviousValueFlag|previous value]]
   * and [[CycleResolutionInput.addProposedValueFlag|proposed value]] flags for that variable.
   *
   * @param Y An effect handler function, which is given as a 1st argument of every calculation function
   * @param identifier
   * @param symbol
   */
  collectInfo(Y, identifier, symbol) {
    if (Y(PreviousValueOf(identifier)) != null) this.addPreviousValueFlag(symbol);
    if (Y(HasProposedValue(identifier))) this.addProposedValueFlag(symbol);
  }

}

/**
 * Symbol to denote the synchronous calculation context
 */

const ContextSync = Symbol('ContextSync');
/**
 * Symbol to denote the generator calculation context
 */

const ContextGen = Symbol('ContextGen'); //---------------------------------------------------------------------------------------------------------------------

class CalculationGen extends Mixin([], base => class CalculationGen extends base {
  constructor() {
    super(...arguments);
    this.iterator = undefined;
    this.iterationResult = undefined;
  }

  isCalculationStarted() {
    return Boolean(this.iterator || this.iterationResult);
  }

  isCalculationCompleted() {
    return Boolean(this.iterationResult && this.iterationResult.done);
  }

  get result() {
    return this.iterationResult && this.iterationResult.done ? this.iterationResult.value : undefined;
  }

  startCalculation(onEffect, ...args) {
    const iterator = this.iterator = this.calculation.call(this.context || this, onEffect, ...args);
    return this.iterationResult = iterator.next();
  }

  continueCalculation(value) {
    return this.iterationResult = this.iterator.next(value);
  }

  cleanupCalculation() {
    this.iterationResult = undefined;
    this.iterator = undefined;
  }

  *calculation(onEffect, ...args) {
    throw new Error("Abstract method `calculation` called");
  }

  runSyncWithEffect(onEffect, ...args) {
    this.startCalculation(onEffect, ...args);

    while (!this.isCalculationCompleted()) {
      this.continueCalculation(onEffect(this.iterationResult.value));
    } // help to garbage collector

    this.iterator = undefined;
    return this.result;
  }

  async runAsyncWithEffect(onEffect, ...args) {
    this.startCalculation(onEffect, ...args);

    while (!this.isCalculationCompleted()) {
      this.continueCalculation(await onEffect(this.iterationResult.value));
    } // help to garbage collector

    this.iterator = undefined;
    return this.result;
  }

}) {} //---------------------------------------------------------------------------------------------------------------------

const SynchronousCalculationStarted = Symbol('SynchronousCalculationStarted');
const calculationStartedConstant = {
  value: SynchronousCalculationStarted
};
class CalculationSync extends Mixin([], base => class CalculationSync extends base {
  constructor() {
    super(...arguments);
    this.iterationResult = undefined;
  }

  isCalculationStarted() {
    return Boolean(this.iterationResult);
  }

  isCalculationCompleted() {
    return Boolean(this.iterationResult && this.iterationResult.done);
  }

  get result() {
    return this.iterationResult && this.iterationResult.done ? this.iterationResult.value : undefined;
  }

  startCalculation(onEffect, ...args) {
    // this assignment allows other code to observe, that calculation has started
    this.iterationResult = calculationStartedConstant;
    return this.iterationResult = {
      done: true,
      value: this.calculation.call(this.context || this, onEffect, ...args)
    };
  }

  continueCalculation(value) {
    throw new Error("Can not continue synchronous calculation");
  }

  cleanupCalculation() {
    this.iterationResult = undefined;
  }

  calculation(onEffect, ...args) {
    throw new Error("Abstract method `calculation` called");
  }

  runSyncWithEffect(onEffect, ...args) {
    this.startCalculation(onEffect, ...args);
    return this.result;
  }

  async runAsyncWithEffect(onEffect, ...args) {
    throw new Error('Can not run synchronous calculation asynchronously');
  }

}) {} //---------------------------------------------------------------------------------------------------------------------

function runGeneratorSyncWithEffect(effect, func, args, scope) {
  const gen = func.apply(scope || null, args);
  let iteration = gen.next();

  while (!iteration.done) {
    iteration = gen.next(effect(iteration.value));
  }

  return iteration.value;
} //---------------------------------------------------------------------------------------------------------------------

async function runGeneratorAsyncWithEffect(effect, func, args, scope) {
  const gen = func.apply(scope || null, args);
  let iteration = gen.next();

  while (!iteration.done) {
    const effectResolution = effect(iteration.value);
    if (effectResolution instanceof Promise) iteration = gen.next(await effectResolution);else iteration = gen.next(effectResolution);
  }

  return iteration.value;
}

var EdgeType;

(function (EdgeType) {
  EdgeType[EdgeType["Normal"] = 1] = "Normal";
  EdgeType[EdgeType["Past"] = 2] = "Past";
})(EdgeType || (EdgeType = {}));

let ORIGIN_ID = 0; //---------------------------------------------------------------------------------------------------------------------

class Quark extends MixinAny([Map], base => class Quark extends base {
  constructor() {
    super(...arguments); // required

    this.createdAt = undefined;
    this.identifier = undefined; // quark state

    this.value = undefined;
    this.proposedValue = undefined;
    this.proposedArguments = undefined;
    this.usedProposedOrPrevious = false; // eof quark state

    this.previous = undefined;
    this.origin = undefined;
    this.originId = MIN_SMI;
    this.needToBuildProposedValue = false;
    this.edgesFlow = 0;
    this.visitedAt = NOT_VISITED;
    this.visitEpoch = 0;
    this.promise = undefined;
    this.$outgoingPast = undefined;
  }

  static new(props) {
    const instance = new this();
    props && Object.assign(instance, props);
    return instance;
  }

  get level() {
    return this.identifier.level;
  }

  get calculation() {
    return this.identifier.calculation;
  }

  get context() {
    return this.identifier.context || this.identifier;
  }

  forceCalculation() {
    this.edgesFlow = MAX_SMI;
  }

  cleanup() {
    this.cleanupCalculation();
  }

  isShadow() {
    return Boolean(this.origin && this.origin !== this);
  }

  resetToEpoch(epoch) {
    this.visitEpoch = epoch;
    this.visitedAt = NOT_VISITED; // we were clearing the edgeFlow on epoch change, however see `030_propagation_2.t.ts` for a counter-example
    // TODO needs some proper solution for edgesFlow + walk epoch combination

    if (this.edgesFlow < 0) this.edgesFlow = 0;
    this.usedProposedOrPrevious = false;
    this.cleanupCalculation(); // if there's no value, then generally should be no outgoing edges
    // (which indicates that the value has been used somewhere else)
    // but there might be outgoing "past" edges, created if `HasProposedValue`
    // or similar effect has been used on the identifier
    // if (this.value !== undefined) this.clearOutgoing()
    // the `this.value !== undefined` condition above smells very "monkey-patching"
    // it was probably solving some specific problem in Gantt/SchedulerPro
    // (engine tests seems to pass w/o it)
    // in general, should always clear the outgoing edges on new epoch

    this.clearOutgoing();
    this.promise = undefined;

    if (this.origin && this.origin === this) {
      this.proposedArguments = undefined; // only overwrite the proposed value if the actual value has been already calculated
      // otherwise, keep the proposed value as is

      if (this.value !== undefined) {
        this.proposedValue = this.value;
      }

      this.value = undefined;
    } else {
      this.origin = undefined;
      this.value = undefined;
    }

    if (this.identifier.proposedValueIsBuilt && this.proposedValue !== TombStone) {
      this.needToBuildProposedValue = true;
      this.proposedValue = undefined;
    }
  }

  copyFrom(origin) {
    this.value = origin.value;
    this.proposedValue = origin.proposedValue;
    this.proposedArguments = origin.proposedArguments;
    this.usedProposedOrPrevious = origin.usedProposedOrPrevious;
  }

  clearProperties() {
    this.value = undefined;
    this.proposedValue = undefined;
    this.proposedArguments = undefined;
  }

  mergePreviousOrigin(latestScope) {
    const origin = this.origin;
    if (origin !== this.previous) throw new Error("Invalid state");
    this.copyFrom(origin);
    const outgoing = this.getOutgoing();

    for (const [identifier, quark] of origin.getOutgoing()) {
      const ownOutgoing = outgoing.get(identifier);

      if (!ownOutgoing) {
        const latest = latestScope.get(identifier);
        if (!latest || latest.originId === quark.originId) outgoing.set(identifier, latest || quark);
      }
    }

    if (origin.$outgoingPast !== undefined) {
      const outgoingPast = this.getOutgoingPast();

      for (const [identifier, quark] of origin.getOutgoingPast()) {
        const ownOutgoing = outgoingPast.get(identifier);

        if (!ownOutgoing) {
          const latest = latestScope.get(identifier);
          if (!latest || latest.originId === quark.originId) outgoingPast.set(identifier, latest || quark);
        }
      }
    } // changing `origin`, but keeping `originId`

    this.origin = this; // some help for garbage collector

    origin.clearProperties();
    origin.clear();
  } // mergePreviousIntoItself () {
  //     const origin                = this.origin
  //
  //     if (origin === this.previous) {
  //         this.mergePreviousOrigin(this)
  //     } else {
  //
  //     }
  //
  //     // this.copyFrom(origin)
  //     //
  //     // const outgoing              = this.getOutgoing()
  //     //
  //     // for (const [ identifier, quark ] of origin.getOutgoing()) {
  //     //     const ownOutgoing       = outgoing.get(identifier)
  //     //
  //     //     if (!ownOutgoing) {
  //     //         const latest        = latestScope.get(identifier)
  //     //
  //     //         if (!latest || latest.originId === quark.originId) outgoing.set(identifier, latest || quark)
  //     //     }
  //     // }
  //     //
  //     // // changing `origin`, but keeping `originId`
  //     // this.origin                 = this
  //     //
  //     // // some help for garbage collector
  //     // origin.clearProperties()
  //     // origin.clear()
  // }

  setOrigin(origin) {
    this.origin = origin;
    this.originId = origin.originId;
  }

  getOrigin() {
    if (this.origin) return this.origin;
    return this.startOrigin();
  }

  startOrigin() {
    this.originId = ORIGIN_ID++;
    return this.origin = this;
  }

  getOutgoing() {
    return this;
  }

  getOutgoingPast() {
    if (this.$outgoingPast !== undefined) return this.$outgoingPast;
    return this.$outgoingPast = new Map();
  }

  addOutgoingTo(toQuark, type) {
    const outgoing = type === EdgeType.Normal ? this : this.getOutgoingPast();
    outgoing.set(toQuark.identifier, toQuark);
  }

  clearOutgoing() {
    this.clear();
    if (this.$outgoingPast !== undefined) this.$outgoingPast.clear();
  }

  getValue() {
    return this.origin ? this.origin.value : undefined;
  }

  setValue(value) {
    if (this.origin && this.origin !== this) throw new Error('Can not set value to the shadow entry');
    this.getOrigin().value = value; // // @ts-ignore
    // if (value !== TombStone) this.identifier.DATA = value
  }

  hasValue() {
    return this.getValue() !== undefined;
  }

  hasProposedValue() {
    if (this.isShadow()) return false;
    return this.hasProposedValueInner();
  }

  hasProposedValueInner() {
    return this.proposedValue !== undefined;
  } // setProposedValue (value : any) {
  //     if (this.origin && this.origin !== this) throw new Error('Can not set proposed value to the shadow entry')
  //
  //     this.proposedValue = value
  // }

  getProposedValue(transaction) {
    if (this.needToBuildProposedValue) {
      this.needToBuildProposedValue = false;
      this.proposedValue = this.identifier.buildProposedValue.call(this.identifier.context || this.identifier, this.identifier, this, transaction);
    }

    return this.proposedValue;
  } // * outgoingInTheFutureGen (revision : RevisionI) : Generator<Quark, void> {
  //     let current : Quark    = this
  //
  //     while (true) {
  //         for (const outgoing of current.outgoing.keys()) {
  //             if (outgoing === revision.getLatestEntryFor(outgoing.identifier)) yield outgoing
  //         }
  //
  //         if (current.isShadow())
  //             current   = current.previous
  //         else
  //             break
  //     }
  //
  // }

  outgoingInTheFutureCb(revision, forEach) {
    let current = this;

    while (current) {
      for (const outgoing of current.getOutgoing().values()) {
        if (outgoing.originId === revision.getLatestEntryFor(outgoing.identifier).originId) forEach(outgoing);
      }

      if (current.isShadow()) current = current.previous;else current = null;
    }
  }

  outgoingInTheFutureAndPastCb(revision, forEach) {
    let current = this;

    while (current) {
      for (const outgoing of current.getOutgoing().values()) {
        const latestEntry = revision.getLatestEntryFor(outgoing.identifier);
        if (latestEntry && outgoing.originId === latestEntry.originId) forEach(outgoing);
      }

      if (current.$outgoingPast !== undefined) {
        for (const outgoing of current.$outgoingPast.values()) {
          const latestEntry = revision.getLatestEntryFor(outgoing.identifier);
          if (latestEntry && outgoing.originId === latestEntry.originId) forEach(outgoing);
        }
      }

      if (current.isShadow()) current = current.previous;else current = null;
    }
  }

  outgoingInTheFutureAndPastTransactionCb(transaction, forEach) {
    let current = this;

    while (current) {
      for (const outgoing of current.getOutgoing().values()) {
        const latestEntry = transaction.getLatestStableEntryFor(outgoing.identifier);
        if (latestEntry && outgoing.originId === latestEntry.originId) forEach(outgoing);
      }

      if (current.$outgoingPast !== undefined) {
        for (const outgoing of current.$outgoingPast.values()) {
          const latestEntry = transaction.getLatestStableEntryFor(outgoing.identifier);
          if (latestEntry && outgoing.originId === latestEntry.originId) forEach(outgoing);
        }
      }

      if (current.isShadow()) current = current.previous;else current = null;
    }
  } // ignores the "past" edges by design, as they do not form cycles

  outgoingInTheFutureTransactionCb(transaction, forEach) {
    let current = this;

    while (current) {
      for (const outgoing of current.getOutgoing().values()) {
        const latestEntry = transaction.getLatestEntryFor(outgoing.identifier);
        if (latestEntry && outgoing.originId === latestEntry.originId) forEach(outgoing);
      }

      if (current.isShadow()) current = current.previous;else current = null;
    }
  }

}) {} //---------------------------------------------------------------------------------------------------------------------

const TombStone = Symbol('Tombstone');

var __decorate$q = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
Levels of the [[Identifier|identifiers]] as simple integers. Defines the order of calculation, enforced by the following rule -
all lower level identifiers should be already calculated before the calculation of the identifier with the higher level starts.
Because of this, the lower level identifiers can not depend on higher level identifiers.
This rule means that effects from all identifiers of the lower levels will be already processed, when calculating
an identifier of the higher level.
Normally you don't need to specify a level for your identifiers.
*/

var Levels;

(function (Levels) {
  // must be sync
  Levels[Levels["UserInput"] = 0] = "UserInput";
  Levels[Levels["DependsOnlyOnUserInput"] = 1] = "DependsOnlyOnUserInput";
  Levels[Levels["DependsOnlyOnDependsOnlyOnUserInput"] = 2] = "DependsOnlyOnDependsOnlyOnUserInput"; // asynchronicity starts from here

  Levels[Levels["DependsOnSelfKind"] = 3] = "DependsOnSelfKind";
})(Levels || (Levels = {})); //---------------------------------------------------------------------------------------------------------------------

/**
 * The base class for [[Identifier|identifiers]]. It contains only "meta" properties that describes "abstract" identifier.
 * The [[Field]] class inherit from this class.
 *
 * To understand the difference between the "abstract" identifier and the "specific" identifier,
 * imagine a set of instances of the same entity class. Lets say that class has a field "name".
 * All of those instances each will have different "specific" identifiers for the field "name".
 *
 * In the same time, some properties are common for all "specific" identifiers, like [[Meta.equality|equality]], [[Meta.lazy|lazy]] etc.
 * Such properties, that does not change between every "specific" identifier we will call "meta" properties.
 *
 * This class has 2 generic arguments - `ValueT` and `ContextT`. The 1st one defines the type of the identifier's value.
 * The 2nd - the identifier's computation context (synchronous of generator).
 */

class Meta extends Base {
  constructor() {
    super(...arguments);
    /**
     * The name of the identifiers. Not an id, does not imply uniqueness.
     */

    this.name = undefined;
    /**
     * Whether this identifier is lazy (`true`) or strict (`false`).
     *
     * Lazy identifiers are calculated on-demand (when read from graph or used by another identifiers).
     *
     * Strict identifiers will be calculated on read or during the [[ChronoGraph.commit|commit]] call.
     */

    this.lazy = false; // no cancels

    this.total = true; // no "nested" writes

    this.pure = true;
    this.proposedValueIsBuilt = false;
  }
  /**
   * The calculation function of the identifier. Its returning value has a generic type, that is converted to a specific type,
   * based on the generic attribute `ContextT`.
   *
   * This function will receive a single argument - current calculation context (effects handler).
   *
   * When using generators, there's no need to use this handler - one can "yield" the value directly, using the `yield` construct.
   *
   * Compare:
   *
   *     class Author extends Entity.mix(Base) {
   *         @field()
   *         firstName       : string
   *         @field()
   *         lastName        : string
   *         @field()
   *         fullName        : string
   *
   *         @calculate('fullName')
   *         * calculateFullName () : ChronoIterator<string> {
   *             return (yield this.$.firstName) + ' ' + (yield this.$.lastName)
   *         }
   *
   *         @calculate('fullName')
   *         calculateFullName (Y) : string {
   *             return Y(this.$.firstName) + ' ' + Y(this.$.lastName)
   *         }
   *     }
   *
   * @param Y
   */

  calculation(Y) {
    throw new Error("Abstract method `calculation` called");
  }
  /**
   * The equality check of the identifier. By default is performed with `===`.
   *
   * @param v1 First value
   * @param v2 Second value
   */

  equality(v1, v2) {
    return v1 === v2;
  }

}

__decorate$q([prototypeValue(Levels.DependsOnSelfKind)], Meta.prototype, "level", void 0);

__decorate$q([prototypeValue(true)], Meta.prototype, "sync", void 0); //---------------------------------------------------------------------------------------------------------------------

/**
 * The generic "specific" identifier class (see [[Meta]] for "abstract" properties). This class is generic in the sense that it does not
 * specify the type of the calculation function - it can be either synchronous or generator-based.
 *
 * It is also low-level and generally not supposed to be used directly in the application. Instead, one should
 * declare identifiers as fields (decorated class properties) in the [[Replica|replica]].
 */

class Identifier extends Meta {
  constructor() {
    super(...arguments);
    /**
     * The scope (`this` value) for the calculation function.
     */

    this.context = undefined;
  }

  newQuark(createdAt) {
    // micro-optimization - we don't pass a config object to the `new` constructor
    // but instead assign directly to instance
    const newQuark = this.quarkClass.new();
    newQuark.createdAt = createdAt;
    newQuark.identifier = this;
    newQuark.needToBuildProposedValue = this.proposedValueIsBuilt;
    return newQuark;
  }

  write(me, transaction, quark, proposedValue, ...args) {
    quark = quark || transaction.getWriteTarget(me);
    quark.proposedValue = proposedValue;
    quark.proposedArguments = args.length > 0 ? args : undefined;
  }

  writeToTransaction(transaction, proposedValue, ...args) {
    transaction.write(this, proposedValue, ...args);
  }
  /**
   * Write a value to this identifier, in the context of `graph`.
   *
   * @param graph
   * @param proposedValue
   * @param args
   */

  writeToGraph(graph, proposedValue, ...args) {
    graph.write(this, proposedValue, ...args);
  }
  /**
   * Read the value of this identifier, in the context of `graph`, asynchronously
   * @param graph
   */

  readFromGraphAsync(graph) {
    return graph.readAsync(this);
  }
  /**
   * Read the value of this identifier, in the context of `graph`, synchronously
   * @param graph
   */

  readFromGraph(graph) {
    return graph.read(this);
  }

  readFromTransaction(transaction) {
    return transaction.read(this);
  }

  readFromTransactionAsync(transaction) {
    return transaction.readAsync(this);
  } // readFromGraphDirtySync (graph : CheckoutI) : ValueT {
  //     return graph.readDirty(this)
  // }

  buildProposedValue(me, quark, transaction) {
    return undefined;
  }
  /**
   * Template method, which is called, when this identifier "enters" the graph.
   *
   * @param graph
   */

  enterGraph(graph) {}
  /**
   * Template method, which is called, when this identifier "leaves" the graph.
   *
   * @param graph
   */

  leaveGraph(graph) {}

}
/**
 * Constructor for the [[Identifier]] class. Used only for typization purposes, to be able to specify the generics arguments.
 */

const IdentifierC = config => Identifier.new(config); //@ts-ignore

const QuarkSync = Quark.mix(CalculationSync.mix(Map)); //@ts-ignore

const QuarkGen = Quark.mix(CalculationGen.mix(Map)); //---------------------------------------------------------------------------------------------------------------------

/**
 * Variable is a subclass of [[Identifier]], that does not perform any calculation and instead is always equal to a user-provided value.
 * It is a bit more light-weight
 */

class Variable extends Identifier {
  calculation(YIELD) {
    throw new Error("The 'calculation' method of the variables will never be called. Instead the value will be set directly to quark");
  }

  write(me, transaction, quark, proposedValue, ...args) {
    quark = quark || transaction.getWriteTarget(me);
    quark.value = proposedValue;
    quark.proposedArguments = args.length > 0 ? args : undefined;
  }

}

__decorate$q([prototypeValue(Levels.UserInput)], Variable.prototype, "level", void 0);

__decorate$q([prototypeValue(QuarkSync)], Variable.prototype, "quarkClass", void 0);
/**
 * Constructor for the [[Variable]] class. Used only for typization purposes.
 */

function VariableC(...args) {
  return Variable.new(...args);
} //---------------------------------------------------------------------------------------------------------------------

/**
 * Subclass of the [[Identifier]], representing synchronous computation.
 */

class CalculatedValueSync extends Identifier {
  calculation(YIELD) {
    return YIELD(ProposedOrPrevious);
  }

}

__decorate$q([prototypeValue(QuarkSync)], CalculatedValueSync.prototype, "quarkClass", void 0);
/**
 * Constructor for the [[CalculatedValueSync]] class. Used only for typization purposes.
 */

function CalculatedValueSyncC(...args) {
  return CalculatedValueSync.new(...args);
} //---------------------------------------------------------------------------------------------------------------------

/**
 * Subclass of the [[Identifier]], representing generator-based computation.
 */

class CalculatedValueGen extends Identifier {
  *calculation(YIELD) {
    return yield ProposedOrPrevious;
  }

}

__decorate$q([prototypeValue(QuarkGen)], CalculatedValueGen.prototype, "quarkClass", void 0);
/**
 * Constructor for the [[CalculatedValueGen]] class. Used only for typization purposes.
 */

function CalculatedValueGenC(...args) {
  return CalculatedValueGen.new(...args);
} //---------------------------------------------------------------------------------------------------------------------

const throwUnknownIdentifier = identifier => {
  throw new Error(`Unknown identifier ${identifier}`);
};

let CLOCK = 0;
class Revision extends Base {
  constructor() {
    super(...arguments);
    this.createdAt = CLOCK++;
    this.name = 'revision-' + this.createdAt;
    this.previous = undefined;
    this.scope = new Map();
    this.reachableCount = 0;
    this.referenceCount = 0;
    this.selfDependent = new Set();
  }

  getLatestEntryFor(identifier) {
    let revision = this;

    while (revision) {
      const entry = revision.scope.get(identifier);
      if (entry) return entry;
      revision = revision.previous;
    }

    return null;
  }

  hasIdentifier(identifier) {
    const latestEntry = this.getLatestEntryFor(identifier);
    return Boolean(latestEntry && latestEntry.getValue() !== TombStone);
  }

  *previousAxis() {
    let revision = this;

    while (revision) {
      yield revision;
      revision = revision.previous;
    }
  }

}

class LeveledQueue {
  constructor() {
    this.length = 0;
    this.levels = [];
    this.lowestLevel = MAX_SMI;
  }

  getLowestLevel() {
    for (let i = this.lowestLevel !== MAX_SMI ? this.lowestLevel : 0; i < this.levels.length; i++) {
      if (this.levels[i]) return this.lowestLevel = i;
    }

    return this.lowestLevel = MAX_SMI;
  }

  takeLowestLevel() {
    for (let i = this.lowestLevel !== MAX_SMI ? this.lowestLevel : 0; i < this.levels.length; i++) {
      const level = this.levels[i];

      if (level) {
        this.length -= level.length;
        this.levels[i] = null;
        this.lowestLevel = i + 1;
        return level;
      }
    }
  } // resetCachedPosition () {
  //     this.lowestLevel               = MAX_SMI
  // }
  // last () {
  //     for (let i = this.lowestLevel !== MAX_SMI ? this.lowestLevel : 0; i < this.levels.length; i++) {
  //         const level     = this.levels[ i ]
  //
  //         if (level && level.length > 0) {
  //             this.lowestLevel   = i
  //
  //             return level[ level.length - 1 ]
  //         }
  //     }
  // }

  pop() {
    for (let i = this.lowestLevel !== MAX_SMI ? this.lowestLevel : 0; i < this.levels.length; i++) {
      const level = this.levels[i];
      this.lowestLevel = i;

      if (level && level.length > 0) {
        this.length--;
        return level.pop();
      }
    }

    this.lowestLevel = MAX_SMI;
  }

  push(el) {
    const elLevel = el.level;
    let level = this.levels[elLevel];

    if (!level) {
      // avoid holes in the array
      for (let i = this.levels.length; i < elLevel; i++) this.levels[i] = null;

      level = this.levels[elLevel] = [];
    }

    level.push(el);
    this.length++;
    if (elLevel < this.lowestLevel) this.lowestLevel = elLevel;
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.levels.length; i++) {
      const level = this.levels[i];
      if (level) yield* level;
    }
  }

}

class ComputationCycle extends Base {
  toString() {
    const cycleIdentifiers = [];
    const cycleEvents = [];
    this.cycle.forEach(({
      name,
      context
    }) => {
      cycleIdentifiers.push(name);
      if (cycleEvents[cycleEvents.length - 1] !== context) cycleEvents.push(context);
    });
    return 'events: \n' + cycleEvents.map(event => '#' + event.id).join(' => ') + '\n\nidentifiers: \n' + cycleIdentifiers.join('\n'); // return this.cycle.map(identifier => {
    //     return identifier.name
    //     // //@ts-ignore
    //     // const sourcePoint : SourceLinePoint      = identifier.SOURCE_POINT
    //     //
    //     // if (!sourcePoint) return identifier.name
    //     //
    //     // const firstEntry       = sourcePoint.stackEntries[ 0 ]
    //     //
    //     // if (firstEntry) {
    //     //     return `${identifier}\n    yielded at ${firstEntry.sourceFile}:${firstEntry.sourceLine}:${firstEntry.sourceCharPos || ''}`
    //     // } else
    //     //     return identifier.name
    // }).join(' => \n')
  }

} //---------------------------------------------------------------------------------------------------------------------

class TransactionCycleDetectionWalkContext extends WalkContext {
  constructor() {
    // baseRevision    : Revision                  = undefined
    super(...arguments);
    this.transaction = undefined;
  }

  onCycle(node, stack) {
    return OnCycleAction.Cancel;
  }

  doCollectNext(from, to, toVisit) {
    let visit = this.visited.get(to);

    if (!visit) {
      visit = {
        visitedAt: NOT_VISITED,
        visitEpoch: this.currentEpoch
      };
      this.visited.set(to, visit);
    }

    toVisit.push({
      node: to,
      from,
      label: undefined
    });
  }

  collectNext(from, toVisit) {
    const latestEntry = this.transaction.getLatestEntryFor(from);

    if (latestEntry) {
      latestEntry.outgoingInTheFutureTransactionCb(this.transaction, outgoingEntry => {
        this.doCollectNext(from, outgoingEntry.identifier, toVisit);
      });
    } // for (const outgoingIdentifier of visitInfo.getOutgoing().keys()) {
    //     this.doCollectNext(from, outgoingIdentifier, toVisit)
    // }

  }

}

class TransactionWalkDepth extends Base {
  constructor() {
    super(...arguments);
    this.visited = new Map();
    this.transaction = undefined;
    this.baseRevision = undefined;
    this.pushTo = undefined;
    this.toVisit = [];
    this.currentEpoch = 0;
  }

  startFrom(sourceNodes) {
    this.continueFrom(sourceNodes);
  }

  continueFrom(sourceNodes) {
    this.toVisit.push.apply(this.toVisit, sourceNodes);
    this.walkDepth();
  }

  startNewEpoch() {
    if (this.toVisit.length) throw new Error("Can not start new walk epoch in the middle of the walk");
    this.currentEpoch++;
  }

  onTopologicalNode(identifier, visitInfo) {
    if (!identifier.lazy && identifier.level !== Levels.UserInput) this.pushTo.push(visitInfo);
  }

  onCycle(node, stack) {
    return OnCycleAction.Resume;
  } // it is more efficient (=faster) to create new quarks for yet unvisited identifiers
  // in batches, using this method, instead of in normal flow in the `walkDepth` method
  // this is probably because of the CPU context switch between the `this.visited` and `this.baseRevision.getLatestEntryFor`

  doCollectNext(from, to, toVisit) {
    let quark = this.visited.get(to);

    if (!quark) {
      quark = to.newQuark(this.baseRevision);
      quark.visitEpoch = this.currentEpoch;
      this.visited.set(to, quark);
    }

    toVisit.push(to);
  }

  collectNext(from, toVisit, visitInfo) {
    const latestEntry = this.baseRevision.getLatestEntryFor(from);

    if (latestEntry) {
      // since `collectNext` is called exactly once for every node, all quarks
      // will have the `previous` property populated
      visitInfo.previous = latestEntry;
      latestEntry.outgoingInTheFutureAndPastTransactionCb(this.transaction, outgoingEntry => {
        this.doCollectNext(from, outgoingEntry.identifier, toVisit);
      });
    }

    for (const outgoingIdentifier of visitInfo.getOutgoing().keys()) {
      this.doCollectNext(from, outgoingIdentifier, toVisit);
    }

    if (visitInfo.$outgoingPast !== undefined) for (const outgoingIdentifier of visitInfo.getOutgoingPast().keys()) {
      this.doCollectNext(from, outgoingIdentifier, toVisit);
    }
  }

  walkDepth() {
    const visited = this.visited;
    const toVisit = this.toVisit;
    let depth;

    while (depth = toVisit.length) {
      const node = toVisit[depth - 1];
      let visitInfo = visited.get(node);

      if (visitInfo && visitInfo.visitedAt === VISITED_TOPOLOGICALLY && visitInfo.visitEpoch === this.currentEpoch) {
        visitInfo.edgesFlow++;
        toVisit.pop();
        continue;
      }

      if (visitInfo && visitInfo.visitEpoch === this.currentEpoch && visitInfo.visitedAt !== NOT_VISITED) {
        // it is valid to find itself "visited", but only if visited at the current depth
        // (which indicates stack unwinding)
        // if the node has been visited at earlier depth - its a cycle
        if (visitInfo.visitedAt < depth) {
          // ONLY resume if explicitly returned `Resume`, cancel in all other cases (undefined, etc)
          if (this.onCycle(node, toVisit) !== OnCycleAction.Resume) break;
          visitInfo.edgesFlow++;
        } else {
          visitInfo.visitedAt = VISITED_TOPOLOGICALLY;
          this.onTopologicalNode(node, visitInfo);
        }

        toVisit.pop();
      } else {
        const lengthBefore = toVisit.length;

        if (!visitInfo) {
          visitInfo = node.newQuark(this.baseRevision);
          visitInfo.visitEpoch = this.currentEpoch;
          visited.set(node, visitInfo);
        }

        this.collectNext(node, toVisit, visitInfo);

        if (visitInfo.visitEpoch < this.currentEpoch) {
          visitInfo.resetToEpoch(this.currentEpoch);
        }

        visitInfo.visitedAt = depth;
        visitInfo.edgesFlow++; // if there's no outgoing edges, node is at topological position
        // it would be enough to just continue the `while` loop and the `onTopologicalNode`
        // would happen on next iteration, but with this "inlining" we save one call to `visited.get()`
        // at the cost of length comparison

        if (toVisit.length === lengthBefore) {
          visitInfo.visitedAt = VISITED_TOPOLOGICALLY;
          this.onTopologicalNode(node, visitInfo);
          toVisit.pop();
        }
      }
    }
  }

}

// weird stack overflow on 1300 deep benchmark, when using `EdgeType.Normal` w/o aliasing it to constant first

const EdgeTypeNormal = EdgeType.Normal;
const EdgeTypePast = EdgeType.Past; //---------------------------------------------------------------------------------------------------------------------

class Transaction extends Base {
  constructor() {
    super(...arguments);
    this.baseRevision = undefined;
    this.candidateClass = Revision;
    this.candidate = undefined;
    this.graph = undefined;
    this.isClosed = false;
    this.walkContext = undefined;
    this.entries = new Map(); // // we use 2 different stacks, because they support various effects
    // stackSync               : LeveledQueue<Quark>  = new LeveledQueue()
    // the `stackGen` supports async effects notably

    this.stackGen = new LeveledQueue(); // is used for tracking the active quark entry (quark entry being computed)

    this.activeStack = [];
    this.onEffectSync = undefined;
    this.onEffectAsync = undefined; //---------------------

    this.propagationStartDate = 0;
    this.lastProgressNotificationDate = 0;
    this.startProgressNotificationsAfterMs = 500;
    this.emitProgressNotificationsEveryMs = 200; // TODO auto-adjust this parameter to match the emitProgressNotificationsEveryMs (to avoid calls to time functions)

    this.emitProgressNotificationsEveryCalculations = 100;
    this.plannedTotalIdentifiersToCalculate = 0; // writes                  : WriteInfo[]           = []

    this.ongoing = Promise.resolve();
    this.selfDependedMarked = false;
    this.rejectedWith = undefined;
    this.hasEntryWithProposedValue = false;
    this.hasVariableEntry = false;
  }

  initialize(...args) {
    super.initialize(...args);
    this.walkContext = TransactionWalkDepth.new({
      visited: this.entries,
      transaction: this,
      baseRevision: this.baseRevision,
      pushTo: this.stackGen
    });
    if (!this.candidate) this.candidate = this.candidateClass.new({
      previous: this.baseRevision
    }); // the `onEffectSync` should be bound to the `yieldSync` of course, and `yieldSync` should look like:
    //     yieldSync (effect : YieldableValue) : any {
    //         if (effect instanceof Identifier) return this.read(effect)
    //     }
    // however, the latter consumes more stack frames - every read goes through `yieldSync`
    // since `read` is the most used effect anyway, we bind `onEffectSync` to `read` and
    // instead inside of `read` delegate to `yieldSync` for non-identifiers

    this.onEffectSync =
    /*this.onEffectAsync =*/
    this.read.bind(this);
    this.onEffectAsync = this.readAsync.bind(this);
  }

  get dirty() {
    return this.entries.size > 0;
  }

  markSelfDependent() {
    if (this.selfDependedMarked) return;
    this.selfDependedMarked = true;

    for (const selfDependentIden of this.baseRevision.selfDependent) {
      const existing = this.entries.get(selfDependentIden);
      if (existing && existing.getValue() === TombStone) continue;
      this.touch(selfDependentIden);
    }
  } // onNewWrite () {
  //     this.writes.forEach(writeInfo => {
  //         const identifier    = writeInfo.identifier
  //
  //         identifier.write.call(identifier.context || identifier, identifier, this, null, ...writeInfo.proposedArgs)
  //     })
  //
  //     this.writes.length = 0
  // }

  getActiveEntry() {
    return this.activeStack[this.activeStack.length - 1]; // // `stackSync` is always empty, except when the synchronous "batch" is being processed
    // const activeStack   = this.stackSync.length > 0 ? this.stackSync : this.stackGen
    //
    // return activeStack.last()
  }

  yieldAsync(effect) {
    if (effect instanceof Promise) return effect;
    return this.graph[effect.handler](effect, this);
  } // see the comment for the `onEffectSync`

  yieldSync(effect) {
    if (effect instanceof Promise) {
      throw new Error("Can not yield a promise in the synchronous context");
    }

    return this.graph[effect.handler](effect, this);
  } // this seems to be an optimistic version

  readAsync(identifier) {
    // see the comment for the `onEffectSync`
    if (!(identifier instanceof Identifier)) return this.yieldAsync(identifier);
    let entry;
    const activeEntry = this.getActiveEntry();

    if (activeEntry) {
      entry = this.addEdge(identifier, activeEntry, EdgeTypeNormal);
    } else {
      entry = this.entries.get(identifier);

      if (!entry) {
        const previousEntry = this.baseRevision.getLatestEntryFor(identifier);
        if (!previousEntry) throwUnknownIdentifier(identifier);
        entry = previousEntry.hasValue() ? previousEntry : this.touch(identifier);
      }
    }

    if (entry.hasValue()) return entry.getValue();
    if (entry.promise) return entry.promise; //----------------------
    // TODO should use `onReadIdentifier` somehow? to have the same control flow for reading sync/gen identifiers?
    // now need to repeat the logic

    if (!entry.previous || !entry.previous.hasValue()) entry.forceCalculation();
    return this.ongoing = entry.promise = this.ongoing.then(() => {
      return (async () => {
        //----------------------
        while (this.stackGen.lowestLevel < identifier.level) {
          await runGeneratorAsyncWithEffect(this.onEffectAsync, this.calculateTransitionsStackGen, [this.onEffectAsync, this.stackGen.takeLowestLevel()], this);
        }

        this.markSelfDependent(); // entry might be already calculated (in the `ongoing` promise), so no need to calculate it

        if (entry.getValue() === undefined) return runGeneratorAsyncWithEffect(this.onEffectAsync, this.calculateTransitionsStackGen, [this.onEffectAsync, [entry]], this);
      })();
    }).then(() => {
      if (this.rejectedWith) throw new Error(`Transaction rejected: ${String(this.rejectedWith.reason)}`); // we clear the promise in the `resetToEpoch` should be enough?
      // entry.promise = undefined
      // TODO review this exception

      if (!entry.hasValue()) throw new Error('Computation cycle. Sync');
      return entry.getValue();
    });
  }

  get(identifier) {
    // see the comment for the `onEffectSync`
    if (!(identifier instanceof Identifier)) return this.yieldSync(identifier);
    let entry;
    const activeEntry = this.getActiveEntry();

    if (activeEntry) {
      entry = this.addEdge(identifier, activeEntry, EdgeTypeNormal);
    } else {
      entry = this.entries.get(identifier);

      if (!entry) {
        const previousEntry = this.baseRevision.getLatestEntryFor(identifier);
        if (!previousEntry) throwUnknownIdentifier(identifier);
        entry = previousEntry.hasValue() ? previousEntry : this.touch(identifier);
      }
    }

    const value1 = entry.getValue();
    if (value1 === TombStone) throwUnknownIdentifier(identifier); // the `&& entry.hasValue()` part was added to allow KEEP_TRYING_TO_RESOLVE feature for references

    if (value1 !== undefined && entry.hasValue()) return value1;
    if (entry.promise) return entry.promise; //----------------------
    // TODO should use `onReadIdentifier` somehow? to have the same control flow for reading sync/gen identifiers?
    // now need to repeat the logic

    if (!entry.previous || !entry.previous.hasValue()) entry.forceCalculation(); //----------------------

    while (this.stackGen.getLowestLevel() < identifier.level) {
      // here we force the computations for lower level identifiers should be sync
      this.calculateTransitionsStackSync(this.onEffectSync, this.stackGen.takeLowestLevel());
    }

    this.markSelfDependent();

    if (identifier.sync) {
      this.calculateTransitionsStackSync(this.onEffectSync, [entry]);
      const value = entry.getValue(); // TODO review this exception

      if (value === undefined) throw new Error('Cycle during synchronous computation');
      if (value === TombStone) throwUnknownIdentifier(identifier);
      return value;
    } else {
      const promise = this.ongoing = entry.promise = this.ongoing.then(() => {
        // entry might be already calculated (in the `ongoing` promise), so no need to calculate it
        if (entry.getValue() === undefined) return runGeneratorAsyncWithEffect(this.onEffectAsync, this.calculateTransitionsStackGen, [this.onEffectAsync, [entry]], this);
      }).then(() => {
        if (this.rejectedWith) throw new Error(`Transaction rejected: ${String(this.rejectedWith.reason)}`); // we clear the promise in the `resetToEpoch` should be enough?
        // entry.promise   = undefined

        const value = entry.getValue(); // TODO review this exception

        if (value === undefined) throw new Error('Computation cycle. Async get');
        if (value === TombStone) throwUnknownIdentifier(identifier);
        return value; // // TODO review this exception
        // if (!entry.hasValue()) throw new Error('Computation cycle. Async get')
        //
        // return entry.getValue()
      });

      return promise; // return runGeneratorAsyncWithEffect(this.onEffectAsync, this.calculateTransitionsStackGen, [ this.onEffectAsync, [ entry ] ], this).then(() => {
      //     const value     = entry.getValue()
      //
      //     // TODO review this exception
      //     if (value === undefined) throw new Error('Cycle during synchronous computation')
      //     if (value === TombStone) throwUnknownIdentifier(identifier)
      //
      //     return value
      // })
    }
  } // this seems to be an optimistic version

  read(identifier) {
    // see the comment for the `onEffectSync`
    if (!(identifier instanceof Identifier)) return this.yieldSync(identifier);
    let entry;
    const activeEntry = this.getActiveEntry();

    if (activeEntry) {
      entry = this.addEdge(identifier, activeEntry, EdgeTypeNormal);
    } else {
      entry = this.entries.get(identifier);

      if (!entry) {
        const previousEntry = this.baseRevision.getLatestEntryFor(identifier);
        if (!previousEntry) throwUnknownIdentifier(identifier);
        entry = previousEntry.hasValue() ? previousEntry : this.touch(identifier);
      }
    }

    const value1 = entry.getValue();
    if (value1 === TombStone) throwUnknownIdentifier(identifier);
    if (value1 !== undefined) return value1; // if (!identifier.sync) throw new Error("Can not calculate asynchronous identifier synchronously")
    // TODO should use `onReadIdentifier` somehow? to have the same control flow for reading sync/gen identifiers?
    // now need to repeat the logic

    if (!entry.previous || !entry.previous.hasValue()) entry.forceCalculation(); //----------------------

    while (this.stackGen.getLowestLevel() < identifier.level) {
      this.calculateTransitionsStackSync(this.onEffectSync, this.stackGen.takeLowestLevel());
    } //----------------------

    this.markSelfDependent();
    this.calculateTransitionsStackSync(this.onEffectSync, [entry]);
    const value = entry.getValue(); // TODO review this exception

    if (value === undefined) throw new Error('Cycle during synchronous computation');
    if (value === TombStone) throwUnknownIdentifier(identifier);
    return value;
  } // semantic is actually - read the most-fresh value

  readCurrentOrProposedOrPrevious(identifier) {
    const dirtyQuark = this.entries.get(identifier);

    if (dirtyQuark) {
      const value = dirtyQuark.getValue();
      if (value !== undefined) return value;
      if (dirtyQuark.proposedValue !== undefined) return dirtyQuark.proposedValue;
    }

    return this.readPrevious(identifier);
  }

  readCurrentOrProposedOrPreviousAsync(identifier) {
    const dirtyQuark = this.entries.get(identifier);

    if (dirtyQuark) {
      const value = dirtyQuark.getValue();
      if (value !== undefined) return value;
      if (dirtyQuark.proposedValue !== undefined) return dirtyQuark.proposedValue;
    }

    return this.readPreviousAsync(identifier);
  }

  readPrevious(identifier) {
    const previousEntry = this.baseRevision.getLatestEntryFor(identifier);
    if (!previousEntry) return undefined;
    const value = previousEntry.getValue();
    return value !== TombStone ? value === undefined && identifier.lazy ? this.read(identifier) : value : undefined;
  }

  readPreviousAsync(identifier) {
    const previousEntry = this.baseRevision.getLatestEntryFor(identifier);
    if (!previousEntry) return undefined;
    const value = previousEntry.getValue();
    return value !== TombStone ? value !== undefined ? value : this.readAsync(identifier) : undefined;
  }

  readProposedOrPrevious(identifier) {
    const dirtyQuark = this.entries.get(identifier);

    if (dirtyQuark && dirtyQuark.proposedValue !== undefined) {
      return dirtyQuark.proposedValue;
    } else {
      return this.readPrevious(identifier);
    }
  }

  readProposedOrPreviousAsync(identifier) {
    const dirtyQuark = this.entries.get(identifier);

    if (dirtyQuark && dirtyQuark.proposedValue !== undefined) {
      return dirtyQuark.proposedValue;
    } else {
      return this.readPreviousAsync(identifier);
    }
  }

  write(identifier, proposedValue, ...args) {
    if (proposedValue === undefined) proposedValue = null; // this.writes.push(WriteEffect.new({
    //     identifier      : identifier,
    //     proposedArgs    : [ proposedValue, ...args ]
    // }))
    //
    // this.onNewWrite()

    identifier.write.call(identifier.context || identifier, identifier, this, null,
    /*this.getWriteTarget(identifier),*/
    proposedValue, ...args);
    const entry = this.entries.get(identifier);
    this.hasVariableEntry = this.hasVariableEntry || !entry.isShadow() && identifier.level === Levels.UserInput;
    this.hasEntryWithProposedValue = this.hasEntryWithProposedValue || entry.hasProposedValue();
  } // acquireQuark<T extends Identifier> (identifier : T) : InstanceType<T[ 'quarkClass' ]> {
  //     return this.touch(identifier).startOrigin() as InstanceType<T[ 'quarkClass' ]>
  // }

  getWriteTarget(identifier) {
    return this.touch(identifier).startOrigin();
  } // return quark if it exists and is non-shadowing, otherwise undefined

  acquireQuarkIfExists(identifier) {
    const entry = this.entries.get(identifier);
    return entry && entry.origin === entry ? entry.origin : undefined;
  }

  touch(identifier) {
    const existingEntry = this.entries.get(identifier);
    if (!existingEntry || existingEntry.visitEpoch < this.walkContext.currentEpoch) this.walkContext.continueFrom([identifier]);
    const entry = existingEntry || this.entries.get(identifier);
    entry.forceCalculation();
    return entry;
  } // touchInvalidate (identifier : Identifier) : Quark {
  //     const existingEntry         = this.entries.get(identifier)
  //
  //     if (existingEntry && existingEntry.hasValue()) {
  //         this.walkContext.startNewEpoch()
  //     }
  //
  //     if (!existingEntry || existingEntry.visitEpoch < this.walkContext.currentEpoch) this.walkContext.continueFrom([ identifier ])
  //
  //     const entry                 = existingEntry || this.entries.get(identifier)
  //
  //     entry.forceCalculation()
  //
  //     return entry
  // }

  hasIdentifier(identifier) {
    const activeEntry = this.entries.get(identifier);
    if (activeEntry && activeEntry.getValue() === TombStone) return false;
    return Boolean(activeEntry || this.baseRevision.getLatestEntryFor(identifier));
  } // this is actually an optimized version of `write`, which skips the graph walk phase
  // (since the identifier is assumed to be new, there should be no dependent quarks)

  addIdentifier(identifier, proposedValue, ...args) {
    // however, the identifier may be already in the transaction, for example if the `write` method
    // of some other identifier writes to this identifier
    let entry = this.entries.get(identifier);
    const isVariable = identifier.level === Levels.UserInput;

    if (!entry) {
      entry = identifier.newQuark(this.baseRevision);
      entry.previous = this.baseRevision.getLatestEntryFor(identifier);
      entry.forceCalculation();
      this.entries.set(identifier, entry);
      if (!identifier.lazy && !isVariable) this.stackGen.push(entry);
      this.hasVariableEntry = this.hasVariableEntry || !entry.isShadow() && isVariable;
      this.hasEntryWithProposedValue = this.hasEntryWithProposedValue || entry.hasProposedValue();
    }

    if (proposedValue !== undefined || isVariable) {
      // TODO change to `this.write()`
      entry.startOrigin();
      identifier.write.call(identifier.context || identifier, identifier, this, entry, proposedValue === undefined && isVariable ? null : proposedValue, ...args);
    } // if we are re-adding the same identifier in the same transaction, clear the TombStone flag

    if (entry.getValue() === TombStone) entry.value = undefined;
    identifier.enterGraph(this.graph);
    return entry;
  }

  removeIdentifier(identifier) {
    identifier.leaveGraph(this.graph);
    const entry = this.touch(identifier).startOrigin();
    entry.setValue(TombStone);
  }

  populateCandidateScopeFromTransitions(candidate, scope) {
    if (candidate.scope.size === 0) {
      // in this branch we can overwrite the whole map
      candidate.scope = scope;
    } else {
      // in this branch candidate's scope already has some content - this is the case for calculating lazy values
      // // TODO benchmark what is faster (for small maps) - `map.forEach(entry => {})` or `for (const entry of map) {}`
      // entries.forEach((entry : QuarkEntry, identifier : Identifier) => {
      //     candidate.scope.set(identifier, entry)
      // })
      for (const [identifier, quark] of scope) {
        if (quark.isShadow()) {
          const latestEntry = candidate.getLatestEntryFor(identifier); // TODO remove the origin/shadowing concepts? this line won't be needed then
          // and we iterate over the edges from "origin" anyway

          quark.getOutgoing().forEach((toQuark, toIdentifier) => latestEntry.getOutgoing().set(toIdentifier, toQuark));
        } else {
          candidate.scope.set(identifier, quark);
        }
      }
    }
  }

  preCommit(args) {
    if (this.isClosed) throw new Error('Can not propagate closed revision');
    this.markSelfDependent();
    this.isClosed = true;
    this.propagationStartDate = Date.now();
    this.plannedTotalIdentifiersToCalculate = this.stackGen.length;
  }

  postCommit() {
    this.populateCandidateScopeFromTransitions(this.candidate, this.entries); // won't be available after next line

    const entries = this.entries; // for some reason need to cleanup the `walkContext` manually, otherwise the extra revisions hangs in memory

    this.walkContext = undefined;
    return {
      revision: this.candidate,
      entries,
      transaction: this
    };
  }

  commit(args) {
    this.preCommit(args);
    this.calculateTransitionsSync(this.onEffectSync); // runGeneratorSyncWithEffect(this.onEffectSync, this.calculateTransitionsStackGen, [ this.onEffectSync, stack ], this)

    return this.postCommit();
  }

  reject(rejection = RejectEffect.new()) {
    this.rejectedWith = rejection;
    this.walkContext = undefined;
  }

  clearRejected() {
    for (const quark of this.entries.values()) {
      quark.cleanup(); // quark.clearOutgoing()
    }

    this.entries.clear();
  } // // propagation that does not use generators at all
  // propagateSync (args? : PropagateArguments) : TransactionPropagateResult {
  //     const stack = this.prePropagate(args)
  //
  //     this.calculateTransitionsStackSync(this.onEffectSync, stack)
  //     // runGeneratorSyncWithEffect(this.onEffectSync, this.calculateTransitionsStackGen, [ this.onEffectSync, stack ], this)
  //
  //     return this.postPropagate()
  // }

  async commitAsync(args) {
    this.preCommit(args);
    return this.ongoing = this.ongoing.then(() => {
      return runGeneratorAsyncWithEffect(this.onEffectAsync, this.calculateTransitions, [this.onEffectAsync], this);
    }).then(() => {
      return this.postCommit();
    }); // await runGeneratorAsyncWithEffect(this.onEffectAsync, this.calculateTransitions, [ this.onEffectAsync ], this)
    //
    // return this.postCommit()
  }

  getLatestEntryFor(identifier) {
    let entry = this.entries.get(identifier) || this.baseRevision.getLatestEntryFor(identifier);
    if (entry.getValue() === TombStone) return undefined;
    return entry;
  } // check the transaction "entries" first, but only return an entry
  // from that, if it is already calculated, otherwise - take it
  // from the base revision

  getLatestStableEntryFor(identifier) {
    let entry = this.entries.get(identifier);

    if (entry) {
      const value = entry.getValue();
      if (value === TombStone) return undefined;
      return value === undefined ? this.baseRevision.getLatestEntryFor(identifier) : entry;
    } else {
      return this.baseRevision.getLatestEntryFor(identifier);
    }
  }

  addEdge(identifierRead, activeEntry, type) {
    const identifier = activeEntry.identifier;
    if (identifier.level < identifierRead.level) throw new Error('Identifier can not read from higher level identifier');
    let entry = this.entries.get(identifierRead); // creating "shadowing" entry, to store the new edges

    if (!entry) {
      const previousEntry = this.baseRevision.getLatestEntryFor(identifierRead);
      if (!previousEntry) throwUnknownIdentifier(identifierRead);
      entry = identifierRead.newQuark(this.baseRevision);
      previousEntry.origin && entry.setOrigin(previousEntry.origin);
      entry.previous = previousEntry;
      this.entries.set(identifierRead, entry);
    }

    entry.addOutgoingTo(activeEntry, type);
    return entry;
  }

  onQuarkCalculationCompleted(entry, value) {
    // cleanup the iterator
    entry.cleanup();
    const identifier = entry.identifier;
    const previousEntry = entry.previous; //--------------------

    const sameAsPrevious = Boolean(previousEntry && previousEntry.hasValue() && identifier.equality(value, previousEntry.getValue()));

    if (sameAsPrevious) {
      previousEntry.outgoingInTheFutureAndPastTransactionCb(this, previousOutgoingEntry => {
        const outgoingEntry = this.entries.get(previousOutgoingEntry.identifier);
        if (outgoingEntry) outgoingEntry.edgesFlow--;
      }); // this is a "workaround" for the following problem:
      // there might be several copies of the same quark in the calculation stack, this is normal
      // because if quark is requested by some other quark it is just pushed to the stack,
      // which may already contain this quark
      // then when the quark is calculated (this code) it propagates the `edgesFlow` decrease
      // but next time it will be encountered in the stack, its `edgesFlow` might be decreased by other
      // identifiers, which will trigger another round of `edgesFlow` decrease propagation
      // so we set the `edgesFlow` to MAX_SMI after decrease been propagated to prevent repeated such propagation

      entry.edgesFlow = MAX_SMI;
      entry.setOrigin(previousEntry.origin); // seems not needed anymore?
      // this is to indicate that this entry should be recalculated (origin removed)
      // see `resetToEpoch`

      entry.value = value;
    } else {
      entry.startOrigin();
      entry.setValue(value);
    } //--------------------

    let ignoreSelfDependency = false;

    if (entry.usedProposedOrPrevious) {
      if (entry.proposedValue !== undefined) {
        if (identifier.equality(value, entry.proposedValue)) ignoreSelfDependency = true;
      } else {
        // ignore the uninitialized atoms (`proposedValue` === undefined && !previousEntry)
        // which has been calculated to `null` - we don't consider this as a change
        if (sameAsPrevious || !previousEntry && value === null) ignoreSelfDependency = true;
      }

      if (!ignoreSelfDependency) this.candidate.selfDependent.add(identifier);
    }
  }

  onReadIdentifier(identifierRead, activeEntry, stack) {
    const requestedEntry = this.addEdge(identifierRead, activeEntry, EdgeTypeNormal); // this is a workaround for references with failed resolution problem in gantt
    // those references return `hasValue() === false` even that they actually have value
    // (which is `null` and needed to be recalculated)

    if (requestedEntry.hasValue() || requestedEntry.value !== undefined) {
      const value = requestedEntry.getValue();
      if (value === TombStone) throwUnknownIdentifier(identifierRead);
      return activeEntry.continueCalculation(value);
    } else if (requestedEntry.isShadow()) {
      // shadow entry is shadowing a quark w/o value - it is still transitioning or lazy
      // in both cases start new calculation
      requestedEntry.startOrigin();
      requestedEntry.forceCalculation();
      stack.push(requestedEntry);
      return undefined;
    } else {
      if (!requestedEntry.isCalculationStarted()) {
        stack.push(requestedEntry);
        if (!requestedEntry.previous || !requestedEntry.previous.hasValue()) requestedEntry.forceCalculation();
        return undefined;
      } else {
        // cycle - the requested quark has started calculation (means it was encountered in the calculation loop before)
        // but the calculation did not complete yet (even that requested quark is calculated before the current)
        let cycle;
        const walkContext = TransactionCycleDetectionWalkContext.new({
          transaction: this,

          onCycle(node, stack) {
            cycle = ComputationCycle.new({
              cycle: cycleInfo(stack),
              requestedEntry,
              activeEntry
            });
            return OnCycleAction.Cancel;
          }

        });
        walkContext.startFrom([requestedEntry.identifier]);
        return cycle;
      }
    }
  }

  *calculateTransitions(context) {
    const queue = this.stackGen;

    while (queue.length) {
      // TODO if stack calculation is interrupted with BreakCurrentStackExecution we might be loosing
      // some identifiers from the queue??
      yield* this.calculateTransitionsStackGen(context, queue.takeLowestLevel());
    }
  }

  calculateTransitionsSync(context) {
    const queue = this.stackGen;

    while (queue.length) {
      this.calculateTransitionsStackSync(context, queue.takeLowestLevel());
    }
  } // this method is not decomposed into smaller ones intentionally, as that makes benchmarks worse
  // it seems that overhead of calling few more functions in such tight loop as this outweighs the optimization

  *calculateTransitionsStackGen(context, stack) {
    if (this.rejectedWith) return;
    this.walkContext.startNewEpoch();
    const entries = this.entries;
    const propagationStartDate = this.propagationStartDate;
    const enableProgressNotifications = this.graph ? this.graph.enableProgressNotifications : false;
    let counter = 0;
    const prevActiveStack = this.activeStack;
    this.activeStack = stack;

    while (stack.length && !this.rejectedWith) {
      if (enableProgressNotifications && !(counter++ % this.emitProgressNotificationsEveryCalculations)) {
        const now = Date.now();
        const elapsed = now - propagationStartDate;

        if (elapsed > this.startProgressNotificationsAfterMs) {
          const lastProgressNotificationDate = this.lastProgressNotificationDate;

          if (!lastProgressNotificationDate || now - lastProgressNotificationDate > this.emitProgressNotificationsEveryMs) {
            this.lastProgressNotificationDate = now;
            this.graph.onPropagationProgressNotification({
              total: this.plannedTotalIdentifiersToCalculate,
              remaining: this.stackGen.length + stack.length,
              phase: 'propagating'
            });
            yield delay(0);
          }
        }
      }

      const entry = stack[stack.length - 1];
      const identifier = entry.identifier; // TODO can avoid `.get()` call by comparing some another "epoch" counter on the entry

      const ownEntry = entries.get(identifier);

      if (ownEntry !== entry) {
        entry.cleanup();
        stack.pop();
        continue;
      }

      if (entry.edgesFlow == 0) {
        // even if we delete the entry there might be other copies in stack, so reduce the `edgesFlow` to -1
        // to indicate that those are already processed
        entry.edgesFlow--;
        const previousEntry = entry.previous;
        previousEntry && previousEntry.outgoingInTheFutureAndPastTransactionCb(this, outgoing => {
          const outgoingEntry = entries.get(outgoing.identifier);
          if (outgoingEntry) outgoingEntry.edgesFlow--;
        });
      } // the "edgesFlow < 0" indicates that none of the incoming deps of this quark has changed
      // thus we don't need to calculate it, moreover, we can remove the quark from the `entries`
      // to expose the value from the previous revision
      // however, we only do it, when there is a quark from previous revision and it has "origin" (some value)

      if (entry.edgesFlow < 0 && entry.previous && entry.previous.origin) {
        // even if the entry will be deleted from the transaction, we set the correct origin for it
        // this is because there might be other references to this entry in the stack
        // and also the entry may be referenced as dependency of some other quark
        // in such case the correct `originId` will preserve dependency during revisions compactification
        entry.setOrigin(entry.previous.origin); // if there's no outgoing edges we remove the quark

        if (entry.size === 0) {
          entries.delete(identifier);
        } // reduce garbage collection workload

        entry.cleanup();
        stack.pop();
        continue;
      }

      if (
      /*entry.isShadow() ||*/
      entry.hasValue() || entry.proposedValue === TombStone) {
        entry.cleanup();
        stack.pop();
        continue;
      }

      const startedAtEpoch = entry.visitEpoch;
      let iterationResult = entry.isCalculationStarted() ? entry.iterationResult : entry.startCalculation(this.onEffectSync);

      while (iterationResult) {
        const value = iterationResult.value === undefined ? null : iterationResult.value;

        if (entry.isCalculationCompleted()) {
          if (entry.visitEpoch == startedAtEpoch) {
            this.onQuarkCalculationCompleted(entry, value);
          }

          stack.pop();
          break;
        } else if (value instanceof Identifier) {
          const onReadIdentifierResult = this.onReadIdentifier(value, entry, stack); // handle the cycle

          if (onReadIdentifierResult instanceof ComputationCycle) {
            this.walkContext.startNewEpoch();
            yield* this.graph.onComputationCycleHandler(onReadIdentifierResult);
            entry.cleanupCalculation();
            iterationResult = undefined;
          } else {
            iterationResult = onReadIdentifierResult;
          }
        } else if (value === SynchronousCalculationStarted) {
          // the fact, that we've encountered `SynchronousCalculationStarted` constant can mean 2 things:
          // 1) there's a cycle during synchronous computation (we throw exception in `read` method)
          // 2) some other computation is reading synchronous computation, that has already started
          //    in such case its safe to just unwind the stack
          stack.pop();
          break;
        } else {
          // bypass the unrecognized effect to the outer context
          const effectResult = yield value; // the calculation can be interrupted (`cleanupCalculation`) as a result of the effect (WriteEffect)
          // in such case we can not continue calculation and jare ust exit the inner loop

          if (effectResult === BreakCurrentStackExecution) break; // // the calculation can be interrupted (`cleanupCalculation`) as a result of the effect (WriteEffect)
          // // in such case we can not continue calculation and just exit the inner loop
          // if (entry.iterationResult)

          if (entry.visitEpoch === startedAtEpoch) {
            iterationResult = entry.continueCalculation(effectResult);
          } else {
            stack.pop();
            break;
          } // else
          //     iterationResult         = null

        }
      }
    }

    this.activeStack = prevActiveStack;
  } // THIS METHOD HAS TO BE KEPT SYNCED WITH THE `calculateTransitionsStackGen` !!!

  calculateTransitionsStackSync(context, stack) {
    if (this.rejectedWith) return;
    this.walkContext.startNewEpoch();
    const entries = this.entries;
    const prevActiveStack = this.activeStack;
    this.activeStack = stack;

    while (stack.length && !this.rejectedWith) {
      const entry = stack[stack.length - 1];
      const identifier = entry.identifier; // TODO can avoid `.get()` call by comparing some another "epoch" counter on the entry

      const ownEntry = entries.get(identifier);

      if (ownEntry !== entry) {
        entry.cleanup();
        stack.pop();
        continue;
      }

      if (entry.edgesFlow == 0) {
        // even if we delete the entry there might be other copies in stack, so reduce the `edgesFlow` to -1
        // to indicate that those are already processed
        entry.edgesFlow--;
        const previousEntry = entry.previous;
        previousEntry && previousEntry.outgoingInTheFutureAndPastTransactionCb(this, outgoing => {
          const outgoingEntry = entries.get(outgoing.identifier);
          if (outgoingEntry) outgoingEntry.edgesFlow--;
        });
      } // the "edgesFlow < 0" indicates that none of the incoming deps of this quark has changed
      // thus we don't need to calculate it, moreover, we can remove the quark from the `entries`
      // to expose the value from the previous revision
      // however, we only do it, when there is a quark from previous revision and it has "origin" (some value)

      if (entry.edgesFlow < 0 && entry.previous && entry.previous.origin) {
        // even if the entry will be deleted from the transaction, we set the correct origin for it
        // this is because there might be other references to this entry in the stack
        // and also the entry may be referenced as dependency of some other quark
        // in such case the correct `originId` will preserve dependency during revisions compactification
        entry.setOrigin(entry.previous.origin); // if there's no outgoing edges we remove the quark

        if (entry.size === 0) {
          entries.delete(identifier);
        } // reduce garbage collection workload

        entry.cleanup();
        stack.pop();
        continue;
      }

      if (
      /*entry.isShadow() ||*/
      entry.hasValue() || entry.proposedValue === TombStone) {
        entry.cleanup();
        stack.pop();
        continue;
      }

      const startedAtEpoch = entry.visitEpoch;
      let iterationResult = entry.isCalculationStarted() ? entry.iterationResult : entry.startCalculation(this.onEffectSync);

      while (iterationResult) {
        const value = iterationResult.value === undefined ? null : iterationResult.value;

        if (entry.isCalculationCompleted()) {
          if (entry.visitEpoch == startedAtEpoch) {
            this.onQuarkCalculationCompleted(entry, value);
          }

          stack.pop();
          break;
        } else if (value instanceof Identifier) {
          const onReadIdentifierResult = this.onReadIdentifier(value, entry, stack); // handle the cycle

          if (onReadIdentifierResult instanceof ComputationCycle) {
            this.walkContext.startNewEpoch();
            this.graph.onComputationCycleHandlerSync(onReadIdentifierResult);
            entry.cleanupCalculation();
            iterationResult = undefined;
          } else {
            iterationResult = onReadIdentifierResult;
          }
        } else if (value === SynchronousCalculationStarted) {
          // the fact, that we've encountered `SynchronousCalculationStarted` constant can mean 2 things:
          // 1) there's a cycle during synchronous computation (we throw exception in `read` method)
          // 2) some other computation is reading synchronous computation, that has already started
          //    in such case its safe to just unwind the stack
          stack.pop();
          break;
        } else {
          // bypass the unrecognized effect to the outer context
          const effectResult = context(value);
          if (effectResult instanceof Promise) throw new Error("Effect resolved to promise in the synchronous context, check that you marked the asynchronous calculations accordingly"); // the calculation can be interrupted (`cleanupCalculation`) as a result of the effect (WriteEffect)
          // in such case we can not continue calculation and just exit the inner loop

          if (effectResult === BreakCurrentStackExecution) break; // // the calculation can be interrupted (`cleanupCalculation`) as a result of the effect (WriteEffect)
          // // in such case we can not continue calculation and just exit the inner loop
          // if (entry.iterationResult)

          if (entry.visitEpoch === startedAtEpoch) {
            iterationResult = entry.continueCalculation(effectResult);
          } else {
            stack.pop();
            break;
          } // else
          //     iterationResult         = null

        }
      }
    }

    this.activeStack = prevActiveStack;
  }

}

/**
 * A constant which will be used a commit result, when graph is not available.
 */

const CommitZero = {
  rejectedWith: null
}; //---------------------------------------------------------------------------------------------------------------------

class Listener extends Base {
  constructor() {
    super(...arguments);
    this.handlers = [];
  }

  trigger(value) {
    for (let i = 0; i < this.handlers.length; i++) this.handlers[i](value);
  }

} //---------------------------------------------------------------------------------------------------------------------

/**
 * Generic reactive graph. Consists from [[Identifier]]s, depending on each other. This is a low-level representation
 * of the ChronoGraph dataset, it is not "aware" of the entity/relation framework and operates as "just graph".
 *
 * For higher-level (and more convenient) representation, please refer to [[Replica]].
 *
 * An example of usage:
 *
 *     const graph      = ChronoGraph.new({ historyLimit : 10 })
 *
 *     const var1       = graph.variable(1)
 *     const var2       = graph.variable(2)
 *     const iden1      = graph.identifier((Y) => Y(var1) + Y(var2))
 *
 *     graph.read(iden1) // 3
 *
 *     graph.commit()
 *
 *     graph.write(var1, 2)
 *
 *     graph.read(iden1) // 4
 *
 *     graph.reject()
 *
 *     graph.read(var1) // 1
 *     graph.read(iden1) // 3
 *
 */

class ChronoGraph extends Base {
  constructor() {
    super(...arguments);
    this.baseRevisionStable = undefined;
    this.baseRevisionTentative = undefined;
    this.baseRevision = Revision.new(); // the revision to follow to, when performing `redo` operation

    this.topRevision = undefined;
    /**
     * Integer value, indicating how many transactions to keep in memory, to be available for [[undo]] call.
     * Default value is 0 - previous transaction is cleared immediately.
     *
     * Increase this config to opt-in for the [[undo]]/[[redo]] functionality.
     */

    this.historyLimit = 0;
    this.listeners = new Map();
    this.$activeTransaction = undefined;
    this.isCommitting = false;
    this.enableProgressNotifications = false;
    this.ongoing = Promise.resolve();
    this._isInitialCommit = true; //-------------------------------------
    // a "cross-platform" trick to avoid specifying the type of the `autoCommitTimeoutId` explicitly

    this.autoCommitTimeoutId = null;
    /**
     * If this option is enabled with `true` value, all data modification calls ([[write]], [[addIdentifier]], [[removeIdentifier]]) will trigger
     * a delayed [[commit]] call (or [[commitAsync]], depending from the [[autoCommitMode]] option).
     */

    this.autoCommit = false;
    /**
     * Indicates the default commit mode, which is used in [[autoCommit]].
     */

    this.autoCommitMode = 'sync';
    this.autoCommitHandler = null;
    this.onWriteDuringCommit = 'throw';
    this.onComputationCycle = 'throw';
    this.transactionClass = Transaction;
    this.$followingRevision = undefined;
  }

  initialize(...args) {
    super.initialize(...args);
    if (!this.topRevision) this.topRevision = this.baseRevision;

    if (this.autoCommit) {
      this.autoCommitHandler = this.autoCommitMode === 'sync' ? arg => this.commit(arg) : async arg => this.commitAsync(arg);
    }

    this.markAndSweep();
  }
  /**
   * Returns boolean, indicating whether the auto-commit is pending.
   */

  hasPendingAutoCommit() {
    return this.autoCommitTimeoutId !== null;
  }

  get dirty() {
    return this.activeTransaction.dirty;
  }

  clear() {
    this.reject();
    this.unScheduleAutoCommit(); // some stale state - `clear` called at sensitive time

    this.baseRevision.scope && this.baseRevision.scope.clear();
    this.baseRevision.previous = null;
    this.listeners.clear();
    this.topRevision = this.baseRevision;
    this.$followingRevision = undefined;
    this.$activeTransaction = undefined;
    this.markAndSweep();
  }

  *eachReachableRevision() {
    let isBetweenTopBottom = true;
    let counter = 0;

    for (const revision of this.topRevision.previousAxis()) {
      yield [revision, isBetweenTopBottom || counter < this.historyLimit];

      if (revision === this.baseRevision) {
        isBetweenTopBottom = false;
      } else {
        if (!isBetweenTopBottom) counter++;
      }
    }
  }

  get isInitialCommit() {
    return this._isInitialCommit;
  }

  set isInitialCommit(value) {
    this._isInitialCommit = value;
  }

  markAndSweep() {
    let lastReferencedRevision;
    const unreachableRevisions = [];

    for (const [revision, isReachable] of this.eachReachableRevision()) {
      if (isReachable) {
        revision.reachableCount++;
        lastReferencedRevision = revision;
      } else unreachableRevisions.push(revision);

      revision.referenceCount++;
    }

    unreachableRevisions.unshift(lastReferencedRevision);

    for (let i = unreachableRevisions.length - 1; i >= 1 && unreachableRevisions[i].reachableCount === 0; i--) {
      this.compactRevisions(unreachableRevisions[i - 1], unreachableRevisions[i]);
    }
  }

  compactRevisions(newRev, prevRev) {
    if (prevRev.reachableCount > 0 || newRev.previous !== prevRev) throw new Error("Invalid compact operation"); // we can only shred revision if its being referenced maximum 1 time (from the current Checkout instance)

    if (prevRev.referenceCount <= 1) {
      for (const [identifier, entry] of newRev.scope) {
        if (entry.getValue() === TombStone) {
          prevRev.scope.delete(identifier);
        } else {
          const prevQuark = prevRev.scope.get(identifier);

          if (entry.origin === entry) {
            if (prevQuark) {
              prevQuark.clear();
              prevQuark.clearProperties();
            }
          } else if (prevQuark && entry.origin === prevQuark) {
            entry.mergePreviousOrigin(newRev.scope);
          } else if (identifier.lazy && !entry.origin && prevQuark && prevQuark.origin) {
            // for lazy quarks, that depends on the `ProposedOrPrevious` effect, we need to save the value or proposed value
            // from the previous revision
            entry.startOrigin().proposedValue = prevQuark.origin.value !== undefined ? prevQuark.origin.value : prevQuark.origin.proposedValue;
          }

          entry.previous = undefined;
          prevRev.scope.set(identifier, entry);
        }
      }

      copySetInto(newRev.selfDependent, prevRev.selfDependent); // some help for garbage collector
      // this clears the "entries" in the transaction commit result in the "finalizeCommitAsync"
      // newRev.scope.clear()

      newRev.scope = prevRev.scope; // make sure the previous revision won't be used inconsistently

      prevRev.scope = null;
    } // otherwise, we have to copy from it, and keep it intact
    else {
      newRev.scope = new Map(concat(prevRev.scope, newRev.scope));
      newRev.selfDependent = new Set(concat(prevRev.selfDependent, newRev.selfDependent));
      prevRev.referenceCount--;
    } // in both cases break the `previous` chain

    newRev.previous = null;
  }

  get followingRevision() {
    if (this.$followingRevision !== undefined) return this.$followingRevision;
    const revisions = Array.from(this.topRevision.previousAxis());
    const entries = [];

    for (let i = revisions.length - 1; i > 0; i--) entries.push([revisions[i], revisions[i - 1]]);

    return this.$followingRevision = new Map(entries);
  }

  get activeTransaction() {
    if (this.$activeTransaction) return this.$activeTransaction;
    return this.$activeTransaction = this.transactionClass.new({
      baseRevision: this.baseRevisionTentative || this.baseRevision,
      graph: this
    });
  }
  /**
   * Creates a new branch of this graph. Only committed data will be "visible" in the new branch.
   *
   * ```ts
   * const graph2 = ChronoGraph.new()
   *
   * const variable13 : Variable<number> = graph2.variable(5)
   *
   * const branch2 = graph2.branch()
   *
   * branch2.write(variable13, 10)
   *
   * const value13_1 = graph2.read(variable13)  // 5
   * const value13_2 = branch2.read(variable13) // 10
   * ```
   *
   * When using the branching feature in [[Replica]], you need to reference the field values by yielding their
   * corresponding identifiers. This is because ChronoGraph need to know in context of which branch
   * the calculation happens and this information is encoded in the outer context. This may improve in the future.
   *
   * ```ts
   * class Author extends Entity.mix(Base) {
   *     @calculate('fullName')
   *     calculateFullName (Y) : string {
   *         return Y(this.$.firstName) + ' ' + Y(this.$.lastName)
   *     }
   *
   *     @calculate('fullName')
   *     * calculateFullName (Y) : CalculationIterator<string> {
   *         return (yield this.$.firstName) + ' ' + (yield this.$.lastName)
   *     }
   * }
   * ```
   *
   * @param config Configuration object for the new graph instance.
   */

  branch(config) {
    const Constructor = this.constructor;
    return Constructor.new(Object.assign({}, config, {
      baseRevision: this.baseRevision
    }));
  }

  propagate(args) {
    return this.commit(args);
  }
  /**
   * Rejects the current changes in the graph and revert it to the state of the previous [[commit]].
   *
   * See also [[RejectEffect]].
   *
   * @param reason Any value, describing why reject has happened
   */

  reject(reason) {
    this.activeTransaction.reject(RejectEffect.new({
      reason
    })); // reject resets the `ongoing` promise (which is possibly rejected because of cycle exception)

    this.ongoing = Promise.resolve();
    this.$activeTransaction = undefined;
    this.baseRevisionTentative = undefined;

    if (this.baseRevisionStable) {
      this.baseRevision = this.baseRevisionStable;
      this.baseRevisionStable = undefined;
    }
  }
  /**
   * Synchronously commit the state of the graph. All potentially changed [[Identifier.lazy|strict]] identifiers
   * will be calculated during this call. If any of such identifiers will be [[Identifier.sync|async]], an exception
   * will be thrown.
   *
   * This call marks a "stable" state of the graph and a transaction border. Using the [[undo]] call one can revert to the previous
   * state.
   *
   * See also [[reject]].
   *
   * @param args
   */

  commit(args) {
    // TODO should have a "while" loop adding extra transactions, similar to `commitAsync`
    this.unScheduleAutoCommit();
    this.baseRevisionStable = this.baseRevision;
    const activeTransaction = this.activeTransaction;
    const transactionCommitResult = activeTransaction.commit(args);
    this.$activeTransaction = undefined;
    const result = this.finalizeCommit(transactionCommitResult);
    this.baseRevisionStable = undefined;
    this.isInitialCommit = false;
    return result;
  }

  async propagateAsync(args) {
    return this.commitAsync(args);
  }
  /**
   * Asynchronously commit the state of the replica. All potentially changed strict identifiers (see [[Identifier.lazy]])
   * will be calculated during this call.
   *
   * This call marks a "stable" state of the graph and a transaction border. Using the [[undo]] call one can revert to the previous
   * state.
   *
   * See also [[reject]].
   *
   * @param args
   */

  async commitAsync(args) {
    if (this.isCommitting) return this.ongoing;
    this.isCommitting = true;
    this.baseRevisionStable = this.baseRevision;
    return this.ongoing = this.ongoing.then(() => {
      return this.doCommitAsync(args);
    }).then(res => {
      return res;
    }).finally(() => {
      this.baseRevisionStable = undefined;
      this.baseRevisionTentative = undefined;
      this.isInitialCommit = false;
      this.isCommitting = false;
    });
  }

  async doCommitAsync(args) {
    this.unScheduleAutoCommit();
    const activeTransaction = this.activeTransaction;
    const transactionResult = await activeTransaction.commitAsync(args);
    this.baseRevisionTentative = activeTransaction.candidate;
    this.$activeTransaction = undefined;
    const result = this.finalizeCommit(transactionResult);
    await this.finalizeCommitAsync(transactionResult);
    if (activeTransaction.rejectedWith) activeTransaction.clearRejected();

    if (this.dirty) {
      await this.doCommitAsync(args);
    }

    return result;
  }

  finalizeCommit(transactionResult) {
    const {
      revision,
      entries,
      transaction
    } = transactionResult;

    if (!transaction.rejectedWith) {
      if (revision.previous !== this.baseRevision) throw new Error('Invalid revisions chain'); // dereference all revisions

      for (const [revision, isReachable] of this.eachReachableRevision()) {
        if (isReachable) revision.reachableCount--;
        revision.referenceCount--;
      }

      this.baseRevision = this.topRevision = revision; // activating listeners BEFORE the `markAndSweep`, because in that call, `baseRevision`
      // might be already merged with previous

      for (const [identifier, quarkEntry] of entries) {
        quarkEntry.cleanup(); // ignore "shadowing" and lazy entries

        if (quarkEntry.isShadow() || !quarkEntry.hasValue()) continue;
        const listener = this.listeners.get(identifier);
        if (listener) listener.trigger(quarkEntry.getValue());
      }

      this.$followingRevision = undefined;
      this.markAndSweep();
    } else {
      // `baseRevisionStable` might be already cleared in the `reject` method of the graph
      if (this.baseRevisionStable) this.baseRevision = this.baseRevisionStable;
      this.baseRevisionStable = undefined;
      this.baseRevisionTentative = undefined;
    }

    return {
      rejectedWith: transaction.rejectedWith
    };
  }

  async finalizeCommitAsync(transactionResult) {}

  *onComputationCycleHandler(cycle) {
    const exception = new Error("Computation cycle:\n" + cycle); //@ts-ignore

    exception.cycle = cycle;

    switch (this.onComputationCycle) {
      case 'ignore':
        console.log(exception.message);
        const {
          requestedEntry,
          activeEntry
        } = cycle; // if we ignore the cycle we just continue the calculation with the best possible value

        return activeEntry.continueCalculation(requestedEntry.proposedValue !== undefined ? requestedEntry.proposedValue : requestedEntry.value);

      case 'throw':
        throw exception;

      case 'reject':
        this.reject(exception);
        break;
    }
  }

  onComputationCycleHandlerSync(cycle) {
    const exception = new Error("Computation cycle:\n" + cycle); //@ts-ignore

    exception.cycle = cycle;

    switch (this.onComputationCycle) {
      case 'ignore':
        console.log(exception.message);
        const {
          requestedEntry,
          activeEntry
        } = cycle; // if we ignore the cycle we just continue the calculation with the best possible value

        return activeEntry.continueCalculation(requestedEntry.proposedValue !== undefined ? requestedEntry.proposedValue : requestedEntry.value);

      case 'throw':
        throw exception;

      case 'reject':
        this.reject(exception);
        break;
    }
  }

  scheduleAutoCommit() {
    // the `&& !this.isCommitting` part was added for the conflicts branch
    // however, it seems to fail several tests
    // commenting for now, to be reviewed later
    if (this.autoCommitTimeoutId === null && !this.isCommitting) {
      this.autoCommitTimeoutId = setTimeout(this.autoCommitHandler, 10);
    }
  }

  unScheduleAutoCommit() {
    if (this.autoCommitTimeoutId !== null) {
      clearTimeout(this.autoCommitTimeoutId);
      this.autoCommitTimeoutId = null;
    }
  }
  /**
   * Creates a variable identifier with the given initial value and adds it to graph.
   *
   * @param value The initial value. The `undefined` value will be converted to `null`
   */

  variable(value) {
    const variable = VariableC(); // always initialize variables with `null`

    return this.addIdentifier(variable, value === undefined ? null : value);
  }
  /**
   * Creates a named variable identifier with the given initial value and adds it to graph.
   *
   * @param name The [[Variable.name]] property of the newly created variable
   * @param value The initial value. The `undefined` value will be converted to `null`
   */

  variableNamed(name, value) {
    const variable = VariableC({
      name
    }); // always initialize variables with `null`

    return this.addIdentifier(variable, value === undefined ? null : value);
  }
  /**
   * Creates an identifier based on the given calculation function and adds it to this graph. Depending form the type of the function
   * (sync/generator) either [[CalculatedValueGen]] or [[CalculatedValueSync]] will be created.
   *
   * To have full control on the identifier creation, instantiate it yourself and add to graph using the [[ChronoGraph.addIdentifier]] call.
   *
   * @param calculation The calculation function of the identifier.
   * @param context The [[Identifier.context|context]] property of the newly created identifier
   */

  identifier(calculation, context) {
    const identifier = isGeneratorFunction(calculation) ? CalculatedValueGenC({
      calculation,
      context
    }) : CalculatedValueSyncC({
      calculation,
      context
    });
    return this.addIdentifier(identifier);
  }
  /**
   * Creates a named identifier based on the given calculation function and adds it to this graph. Depending form the type of the function
   * (sync/generator) either [[CalculatedValueGen]] or [[CalculatedValueSync]] will be created.
   *
   * To have full control on the identifier creation, instantiate it yourself and add to graph using the [[ChronoGraph.addIdentifier]] call.
   *
   * @param name The [[Identifier.name]] property of the newly created identifier
   * @param calculation The calculation function of the identifier.
   * @param context The [[Identifier.context]] property of the newly created identifier
   */

  identifierNamed(name, calculation, context) {
    const identifier = calculation.constructor.name === 'GeneratorFunction' ? CalculatedValueGenC({
      name,
      calculation,
      context
    }) : CalculatedValueSyncC({
      name,
      calculation,
      context
    });
    return this.addIdentifier(identifier);
  }
  /**
   * Adds an identifier to this graph. Optionally [[write|writes]] the `proposedValue` to it afterwards.
   *
   * @param identifier
   * @param proposedValue
   * @param args
   */

  addIdentifier(identifier, proposedValue, ...args) {
    if (this.isCommitting) {
      if (this.onWriteDuringCommit === 'throw') throw new Error('Adding identifier during commit');else if (this.onWriteDuringCommit === 'warn') ;
    }

    this.activeTransaction.addIdentifier(identifier, proposedValue, ...args);
    if (this.autoCommit) this.scheduleAutoCommit();
    return identifier;
  }
  /**
   * Removes an identifier from this graph.
   *
   * @param identifier
   */

  removeIdentifier(identifier) {
    if (this.isCommitting) {
      if (this.onWriteDuringCommit === 'throw') throw new Error('Removing identifier during commit');else if (this.onWriteDuringCommit === 'warn') ;
    }

    this.activeTransaction.removeIdentifier(identifier);
    this.listeners.delete(identifier);
    if (this.autoCommit) this.scheduleAutoCommit();
  }
  /**
   * Tests, whether this graph has given identifier.
   *
   * @param identifier
   */

  hasIdentifier(identifier) {
    return this.activeTransaction.hasIdentifier(identifier);
  }
  /**
   * Writes a value to the given `identifier`.
   *
   * @param identifier
   * @param proposedValue
   * @param args
   */

  write(identifier, proposedValue, ...args) {
    if (this.isCommitting) {
      if (this.onWriteDuringCommit === 'throw') throw new Error('Write during commit');else if (this.onWriteDuringCommit === 'warn') ;
    }

    this.activeTransaction.write(identifier, proposedValue, ...args);
    if (this.autoCommit) this.scheduleAutoCommit();
  } // keep if possible?
  // pin (identifier : Identifier) : Quark {
  //     return this.activeTransaction.pin(identifier)
  // }
  // Synchronously read the "previous", "stable" value from the graph. If its a lazy entry, it will be calculated
  // Synchronous read can not calculate lazy asynchronous identifiers and will throw exception
  // Lazy identifiers supposed to be "total" (or accept repeating observes?)

  readPrevious(identifier) {
    return this.activeTransaction.readPrevious(identifier);
  } // Asynchronously read the "previous", "stable" value from the graph. If its a lazy entry, it will be calculated
  // Asynchronous read can calculate both synchornous and asynchronous lazy identifiers.
  // Lazy identifiers supposed to be "total" (or accept repeating observes?)

  readPreviousAsync(identifier) {
    return this.activeTransaction.readPreviousAsync(identifier);
  }
  /**
   * Synchronously read the value of the given identifier from the graph.
   *
   * Synchronous read can not calculate asynchronous identifiers and will throw exception
   *
   * @param identifier
   */

  read(identifier) {
    return this.activeTransaction.read(identifier);
  }
  /**
   * Asynchronously read the value of the given identifier from the graph.
   *
   * Asynchronous read can calculate both synchronous and asynchronous identifiers
   *
   * @param identifier
   */

  readAsync(identifier) {
    return this.activeTransaction.readAsync(identifier);
  }
  /**
   * Read the value of the identifier either synchronously or asynchronously, depending on its type (see [[Identifier.sync]])
   *
   * @param identifier
   */

  get(identifier) {
    return this.activeTransaction.get(identifier);
  } // // read the identifier value, return the proposed value if no "current" value is calculated yet
  // readDirty<T> (identifier : Identifier<T>) : T {
  //     return this.activeTransaction.readDirty(identifier)
  // }
  //
  //
  // // read the identifier value, return the proposed value if no "current" value is calculated yet
  // readDirtyAsync<T> (identifier : Identifier<T>) : Promise<T> {
  //     return this.activeTransaction.readDirtyAsync(identifier)
  // }

  observe(observerFunc, onUpdated) {
    const identifier = this.addIdentifier(CalculatedValueGen.new({
      // observers are explicitly eager
      lazy: false,
      calculation: observerFunc
    }));
    this.addListener(identifier, onUpdated);
    return identifier;
  }

  observeContext(observerFunc, context, onUpdated) {
    const identifier = this.addIdentifier(CalculatedValueGen.new({
      // observers are explicitly eager
      lazy: false,
      calculation: observerFunc,
      context: context
    }));
    this.addListener(identifier, onUpdated);
    return identifier;
  }

  addListener(identifier, onUpdated) {
    let listener = this.listeners.get(identifier);

    if (!listener) {
      listener = Listener.new();
      this.listeners.set(identifier, listener);
    }

    listener.handlers.push(onUpdated);
  }
  /**
   * Revert the replica to the state of previous transaction (marked with the [[commit]] call).
   *
   * To enable this feature, you need to opt-in using the [[ChronoGraph.historyLimit|historyLimit]] configuration property.
   *
   * Returns boolean, indicating whether the state transition actually happened.
   */

  undo() {
    const baseRevision = this.baseRevision;
    const previous = baseRevision.previous;
    if (!previous) return false;
    this.baseRevision = previous; // note: all unpropagated "writes" are lost

    this.$activeTransaction = undefined;
    return true;
  }
  /**
   * Advance the replica to the state of next transaction (marked with the [[commit]] call). Only meaningful
   * if a [[ChronoGraph.undo|undo]] call has been made earlier.
   *
   * To enable this feature, you need to opt-in using the [[historyLimit]] configuration property.
   *
   * Returns boolean, indicating whether the state transition actually happened.
   */

  redo() {
    const baseRevision = this.baseRevision;
    if (baseRevision === this.topRevision) return false;
    const nextRevision = this.followingRevision.get(baseRevision);
    this.baseRevision = nextRevision; // note: all unpropagated "writes" are lost

    this.$activeTransaction = undefined;
    return true;
  }

  onPropagationProgressNotification(notification) {}

  [ProposedOrPreviousSymbol](effect, transaction) {
    const activeEntry = transaction.getActiveEntry();
    activeEntry.usedProposedOrPrevious = true;
    const proposedValue = activeEntry.getProposedValue(transaction);
    if (proposedValue !== undefined) return proposedValue; // newly added identifier

    if (!activeEntry.previous) return undefined;
    const identifier = activeEntry.identifier;

    if (identifier.lazy) {
      if (activeEntry.previous.hasValue()) return activeEntry.previous.getValue();
      if (activeEntry.previous.hasProposedValue()) return activeEntry.previous.getProposedValue(transaction);
      return null;
    }

    return transaction.readPrevious(activeEntry.identifier);
  }

  [RejectSymbol](effect, transaction) {
    this.reject(effect.reason);
    return BreakCurrentStackExecution;
  }

  [TransactionSymbol](effect, transaction) {
    return transaction;
  }

  [OwnQuarkSymbol](effect, transaction) {
    return transaction.getActiveEntry();
  }

  [OwnIdentifierSymbol](effect, transaction) {
    const activeEntry = transaction.getActiveEntry();
    return activeEntry.identifier;
  }

  [WriteSymbol](effect, transaction) {
    const activeEntry = transaction.getActiveEntry();
    if (activeEntry.identifier.lazy) throw new Error('Lazy identifiers can not use `Write` effect');
    const writeToHigherLevel = effect.identifier.level > activeEntry.identifier.level;
    if (!writeToHigherLevel) transaction.walkContext.startNewEpoch();
    transaction.write(effect.identifier, ...effect.proposedArgs); // // transaction.writes.push(effect)
    //
    // // const writeTo   = effect.identifier
    // //
    // // writeTo.write.call(writeTo.context || writeTo, writeTo, transaction, null, ...effect.proposedArgs)
    //
    // transaction.onNewWrite()

    return writeToHigherLevel ? undefined : BreakCurrentStackExecution;
  }

  [WriteSeveralSymbol](effect, transaction) {
    const activeEntry = transaction.getActiveEntry();
    if (activeEntry.identifier.lazy) throw new Error('Lazy identifiers can not use `Write` effect');
    let writeToHigherLevel = true; // effect.writes.forEach(writeInfo => {

    effect.writes.forEach(writeInfo => {
      if (writeInfo.identifier.level <= activeEntry.identifier.level && writeToHigherLevel) {
        transaction.walkContext.startNewEpoch();
        writeToHigherLevel = false;
      }

      transaction.write(writeInfo.identifier, ...writeInfo.proposedArgs);
    }); // const identifier    = writeInfo.identifier
    //
    // identifier.write.call(identifier.context || identifier, identifier, transaction, null, ...writeInfo.proposedArgs)
    // })
    // transaction.onNewWrite()

    return writeToHigherLevel ? undefined : BreakCurrentStackExecution;
  }

  [PreviousValueOfSymbol](effect, transaction) {
    const activeEntry = transaction.getActiveEntry();
    const source = effect.identifier;
    transaction.addEdge(source, activeEntry, EdgeTypePast);
    return transaction.readPrevious(source);
  }

  [ProposedValueOfSymbol](effect, transaction) {
    const activeEntry = transaction.getActiveEntry();
    const source = effect.identifier;
    transaction.addEdge(source, activeEntry, EdgeTypePast);
    const quark = transaction.entries.get(source);
    const proposedValue = quark && !quark.isShadow() ? quark.getProposedValue(transaction) : undefined;
    return proposedValue;
  }

  [HasProposedValueSymbol](effect, transaction) {
    const activeEntry = transaction.getActiveEntry();
    const source = effect.identifier;
    transaction.addEdge(source, activeEntry, EdgeTypePast);
    const quark = transaction.entries.get(source);
    return quark ? quark.hasProposedValue() : false;
  }

  [ProposedOrPreviousValueOfSymbol](effect, transaction) {
    const activeEntry = transaction.getActiveEntry();
    const source = effect.identifier;
    transaction.addEdge(source, activeEntry, EdgeTypePast);
    return transaction.readProposedOrPrevious(source);
  }

  [UnsafeProposedOrPreviousValueOfSymbol](effect, transaction) {
    return transaction.readProposedOrPrevious(effect.identifier);
  }

  [UnsafePreviousValueOfSymbol](effect, transaction) {
    return transaction.readPrevious(effect.identifier);
  }

  [ProposedArgumentsOfSymbol](effect, transaction) {
    const activeEntry = transaction.getActiveEntry();
    const source = effect.identifier;
    transaction.addEdge(source, activeEntry, EdgeTypePast);
    const quark = transaction.entries.get(source);
    return quark && !quark.isShadow() ? quark.proposedArguments : undefined;
  }

}

/**
 * This class describes an entity. Entity is simply a collection of [[Field]]s. Entity also may have a parent entity,
 * from which it inherit the fields.
 */

class EntityMeta extends Base {
  constructor() {
    super(...arguments);
    /**
     * The name of the entity
     */

    this.name = undefined;
    this.ownFields = new Map();
    this.schema = undefined;
    this.$skeleton = {};
    this.$allFields = undefined;
  }
  /**
   * Checks whether the entity has a field with given name (possibly inherited from parent entity).
   *
   * @param name
   */

  hasField(name) {
    return this.getField(name) !== undefined;
  }
  /**
   * Returns a field with given name (possibly inherited) or `undefined` if there's none.
   *
   * @param name
   */

  getField(name) {
    return this.allFields.get(name);
  }
  /**
   * Adds a field to this entity.
   *
   * @param field
   */

  addField(field) {
    const name = field.name;
    if (!name) throw new Error(`Field must have a name`);
    if (this.ownFields.has(name)) throw new Error(`Field with name [${name}] already exists`);
    field.entity = this;
    this.ownFields.set(name, field);
    return field;
  }

  forEachParent(func) {
    let entity = this;

    while (entity) {
      func(entity);
      entity = entity.parentEntity;
    }
  }

  get allFields() {
    if (this.$allFields !== undefined) return this.$allFields;
    const allFields = new Map();
    const visited = new Set();
    this.forEachParent(entity => {
      entity.ownFields.forEach((field, name) => {
        if (!visited.has(name)) {
          visited.add(name);
          allFields.set(name, field);
        }
      });
    });
    return this.$allFields = allFields;
  }
  /**
   * Iterator for all fields of this entity (including inherited).
   *
   * @param func
   */

  forEachField(func) {
    this.allFields.forEach(func);
  }

}

var ReadMode;

(function (ReadMode) {
  ReadMode[ReadMode["Current"] = 0] = "Current";
  ReadMode[ReadMode["Previous"] = 1] = "Previous";
  ReadMode[ReadMode["ProposedOrPrevious"] = 2] = "ProposedOrPrevious";
  ReadMode[ReadMode["CurrentOrProposedOrPrevious"] = 3] = "CurrentOrProposedOrPrevious";
})(ReadMode || (ReadMode = {})); //---------------------------------------------------------------------------------------------------------------------

/**
 * Reactive graph, operating on the set of entities (see [[Entity]] and [[EntityMeta]]), each having a set of fields (see [[Field]]).
 *
 * Entities are mapped to JS classes and fields - to their properties, decorated with [[field]].
 *
 * The calculation function for some field can be mapped to the class method, using the [[calculate]] decorator.
 *
 * An example of usage:
 *
 * ```ts
 * class Author extends Entity.mix(Base) {
 *     @field()
 *     firstName       : string
 *     @field()
 *     lastName        : string
 *     @field()
 *     fullName        : string
 *
 *     @calculate('fullName')
 *     calculateFullName () : string {
 *         return this.firstName + ' ' + this.lastName
 *     }
 * }
 * ```
 */

class Replica extends Mixin([ChronoGraph], base => class Replica extends base {
  constructor() {
    super(...arguments);
    /**
     * Replica re-defines the default value of the `autoCommit` property to `true`.
     */

    this.autoCommit = true;
    this.readMode = ReadMode.Current;
  }
  /**
   * Add entity instance to the replica
   *
   * @param entity
   */

  addEntity(entity) {
    entity.enterGraph(this);
  }
  /**
   * Add several entity instances to the replica
   *
   * @param entity
   */

  addEntities(entities) {
    entities.forEach(entity => this.addEntity(entity));
  }
  /**
   * Remove entity instance from the replica
   *
   * @param entity
   */

  removeEntity(entity) {
    entity.leaveGraph(this);
  }
  /**
   * Remove several entity instances from the replica
   *
   * @param entity
   */

  removeEntities(entities) {
    entities.forEach(entity => this.removeEntity(entity));
  }

}) {}

/**
 * Mixin, for the identifier that represent a field of the entity. Requires the [[Identifier]] (or its subclass)
 * as a base class. See more about mixins: [[Mixin]]
 */

class FieldIdentifier extends Mixin([Identifier], base => class FieldIdentifier extends base {
  constructor() {
    super(...arguments);
    /**
     * Reference to the [[Field]] this identifier represents
     */

    this.field = undefined;
    /**
     * Reference to the [[Entity]] this identifier represents
     */

    this.self = undefined; // temp storage for value for the phase, when identifier is created, but has not joined any graph
    // is cleared during the 1st join to the graph

    this.DATA = undefined;
  } // standaloneQuark     : InstanceType<this[ 'quarkClass' ]>
  // readFromGraphDirtySync (graph : Checkout) {
  //     if (graph)
  //         return graph.readDirty(this)
  //     else
  //         return this.DATA
  // }
  // returns the value itself if there were no affecting writes for it
  // otherwise - promise

  getFromGraph(graph) {
    if (graph) {
      if (graph.readMode === ReadMode.Current) return graph.get(this);
      if (graph.readMode === ReadMode.Previous) return graph.activeTransaction.readPrevious(this);
      if (graph.readMode === ReadMode.ProposedOrPrevious) graph.activeTransaction.readProposedOrPrevious(this);
      return graph.activeTransaction.readCurrentOrProposedOrPrevious(this);
    } else return this.DATA;
  }

  readFromGraph(graph) {
    if (graph) return graph.read(this);else return this.DATA;
  }

  writeToGraph(graph, proposedValue, ...args) {
    if (graph) graph.write(this, proposedValue, ...args);else this.DATA = proposedValue;
  }

  leaveGraph(graph) {
    const entry = graph.activeTransaction.getLatestStableEntryFor(this);
    if (entry) this.DATA = entry.getValue();
    super.leaveGraph(graph);
  }

  toString() {
    return this.name;
  }

}) {}
class MinimalFieldIdentifierSync extends FieldIdentifier.mix(CalculatedValueSync) {}
class MinimalFieldIdentifierGen extends FieldIdentifier.mix(CalculatedValueGen) {}
class MinimalFieldVariable extends FieldIdentifier.mix(Variable) {} //---------------------------------------------------------------------------------------------------------------------

/**
 * Mixin, for the identifier that represent an entity as a whole. Requires the [[Identifier]] (or its subclass)
 * as a base class. See more about mixins: [[Mixin]]
 */

class EntityIdentifier extends Mixin([Identifier], base => class EntityIdentifier extends base {
  constructor() {
    super(...arguments);
    /**
     * [[EntityMeta]] instance of the entity this identifier represents
     */

    this.entity = undefined;
    /**
     * Reference to the [[Entity]] this identifier represents
     */

    this.self = undefined;
  } // entity atom is considered changed if any of its incoming atoms has changed
  // this just means if it's calculation method has been called, it should always
  // assign a new value

  equality() {
    return false;
  }

  toString() {
    return `Entity identifier [${this.self}]`;
  }

}) {}
class MinimalEntityIdentifier extends EntityIdentifier.mix(CalculatedValueGen) {}

/**
 * This class describes a field of some [[EntityMeta]].
 */

class Field extends Meta {
  constructor() {
    super(...arguments);
    /**
     * Boolean flag, indicating whether this field should be persisted
     */

    this.persistent = true;
  }

  getIdentifierClass(calculationFunction) {
    if (this.identifierCls) return this.identifierCls;
    if (!calculationFunction) return MinimalFieldVariable;
    return isGeneratorFunction(calculationFunction) ? MinimalFieldIdentifierGen : MinimalFieldIdentifierSync;
  }

}

const isEntityMarker = Symbol('isEntity'); //---------------------------------------------------------------------------------------------------------------------

/**
 * Entity [[Mixin|mixin]]. When applied to some base class (recommended one is [[Base]]), turns it into entity.
 * Entity may have several fields, which are properties decorated with [[field]] decorator.
 *
 * To apply this mixin use the `Entity.mix` property, which represents the mixin lambda.
 *
 * Another decorator, [[calculate]], marks the method, that will be used to calculate the value of field.
 *
 * Example:
 *
 * ```ts
 * class Author extends Entity.mix(Base) {
 *     @field()
 *     firstName       : string
 *     @field()
 *     lastName        : string
 *     @field()
 *     fullName        : string
 *
 *     @calculate('fullName')
 *     calculateFullName () : string {
 *         return this.firstName + ' ' + this.lastName
 *     }
 * }
 * ```
 *
 */

class Entity extends Mixin([], base => {
  class Entity extends base {
    // marker in the prototype to identify whether the parent class is Entity mixin itself
    // it is not used for `instanceof` purposes and not be confused with the [MixinInstanceOfProperty]
    // (though it is possible to use MixinInstanceOfProperty for this purpose, that would require to
    // make it public
    [isEntityMarker]() {}
    /**
     * An [[EntityMeta]] instance, representing the "meta" information about the entity class. It is shared among all instances
     * of the class.
     */

    get $entity() {
      // this will lazily create an EntityData instance in the prototype
      return createEntityOnPrototype(this.constructor.prototype);
    }
    /**
     * An object, which properties corresponds to the ChronoGraph [[Identifier]]s, created for every field.
     *
     * For example:
     *
     * ```ts
     * class Author extends Entity.mix(Base) {
     *     @field()
     *     firstName       : string
     *     @field()
     *     lastName        : string
     * }
     *
     * const author = Author.new()
     *
     * // identifier for the field `firstName`
     * author.$.firstName
     *
     * const firstName = replica.read(author.$.firstName)
     * ```
     */

    get $() {
      const $ = {};
      this.$entity.forEachField((field, name) => {
        $[name] = this.createFieldIdentifier(field);
      });

      {
        return defineProperty(this, '$', $);
      }
    }
    /**
     * A graph identifier, that represents the whole entity.
     */

    get $$() {
      return defineProperty(this, '$$', MinimalEntityIdentifier.new({
        name: this.$entityName,
        entity: this.$entity,
        calculation: this.calculateSelf,
        context: this,
        self: this
      }));
    }

    get $entityName() {
      return this.constructor.name || this.$entity.name;
    }

    *calculateSelf() {
      return this;
    }

    createFieldIdentifier(field) {
      const name = field.name;
      const entity = this.$entity;
      const constructor = this.constructor;
      const skeleton = entity.$skeleton;
      if (!skeleton[name]) skeleton[name] = constructor.getIdentifierTemplateClass(this, field);
      const identifier = new skeleton[name]();
      identifier.context = this;
      identifier.self = this;
      identifier.name = `${this.$$.name}.$.${field.name}`;
      return identifier;
    }

    forEachFieldIdentifier(func) {
      this.$entity.forEachField((field, name) => func(this.$[name], name));
    }
    /**
     * This method is called when entity is added to some replica.
     *
     * @param replica
     */

    enterGraph(replica) {
      if (this.graph) throw new Error('Already entered replica');
      this.graph = replica;
      replica.addIdentifier(this.$$);
      this.$entity.forEachField((field, name) => {
        const identifier = this.$[name];
        replica.addIdentifier(identifier, identifier.DATA);
        identifier.DATA = undefined;
      });
    }
    /**
     * This method is called when entity is removed from the replica it's been added to.
     */

    leaveGraph(graph) {
      const ownGraph = this.graph;
      const removeFrom = graph || ownGraph;
      if (!removeFrom) return;
      this.$entity.forEachField((field, name) => removeFrom.removeIdentifier(this.$[name]));
      removeFrom.removeIdentifier(this.$$);
      if (removeFrom === ownGraph) this.graph = undefined;
    } // isPropagating () {
    //     return this.getGraph().isPropagating
    // }

    propagate(arg) {
      return this.commit(arg);
    }
    /**
     * This is a convenience method, that just delegates to the [[ChronoGraph.commit]] method of this entity's graph.
     *
     * If there's no graph (entity has not been added to any replica) a [[CommitZero]] constant will be returned.
     */

    commit(arg) {
      const graph = this.graph;
      if (!graph) return CommitZero;
      return graph.commit(arg);
    }

    async propagateAsync() {
      return this.commitAsync();
    }
    /**
     * This is a convenience method, that just delegates to the [[ChronoGraph.commitAsync]] method of this entity's graph.
     *
     * If there's no graph (entity has not been added to any replica) a resolved promise with [[CommitZero]] constant will be returned.
     */

    async commitAsync(arg) {
      const graph = this.graph;
      if (!graph) return Promise.resolve(CommitZero);
      return graph.commitAsync(arg);
    }
    /**
     * An [[EntityMeta]] instance, representing the "meta" information about the entity class. It is shared among all instances
     * of the class.
     */

    static get $entity() {
      return ensureEntityOnPrototype(this.prototype);
    }

    static getIdentifierTemplateClass(me, field) {
      const name = field.name;
      const config = {
        name: `${me.$$.name}.$.${name}`,
        field: field
      }; //------------------

      if (field.hasOwnProperty('sync')) config.sync = field.sync;
      if (field.hasOwnProperty('lazy')) config.lazy = field.lazy;
      if (field.hasOwnProperty('equality')) config.equality = field.equality; //------------------

      const calculationFunction = me.$calculations && me[me.$calculations[name]];
      if (calculationFunction) config.calculation = calculationFunction; //------------------

      const writeFunction = me.$writes && me[me.$writes[name]];
      if (writeFunction) config.write = writeFunction; //------------------

      const buildProposedFunction = me.$buildProposed && me[me.$buildProposed[name]];

      if (buildProposedFunction) {
        config.buildProposedValue = buildProposedFunction;
        config.proposedValueIsBuilt = true;
      } //------------------

      const template = field.getIdentifierClass(calculationFunction).new(config);

      const TemplateClass = function () {};

      TemplateClass.prototype = template;
      return TemplateClass;
    } // unfortunately, the better typing:
    // run <Name extends AllowedNames<this, AnyFunction>> (methodName : Name, ...args : Parameters<this[ Name ]>)
    //     : ReturnType<this[ Name ]> extends CalculationIterator<infer Res> ? Res : ReturnType<this[ Name ]>
    // yields "types are exceedingly long and possibly infinite on the application side
    // TODO file a TS bug report

    run(methodName, ...args) {
      const onEffect = effect => {
        if (effect instanceof Identifier) return this.graph.read(effect);
        throw new Error("Helper methods can not yield effects during computation");
      };

      return runGeneratorSyncWithEffect(onEffect, this[methodName], args, this);
    }

    static createPropertyAccessorsFor(fieldName) {
      // idea is to indicate to the v8, that `propertyKey` is a constant and thus
      // it can optimize access by it
      const propertyKey = fieldName;
      const target = this.prototype;
      Object.defineProperty(target, propertyKey, {
        get: function () {
          return this.$[propertyKey].getFromGraph(this.graph);
        },
        set: function (value) {
          this.$[propertyKey].writeToGraph(this.graph, value);
        }
      });
    }

    static createMethodAccessorsFor(fieldName) {
      // idea is to indicate to the v8, that `propertyKey` is a constant and thus
      // it can optimize access by it
      const propertyKey = fieldName;
      const target = this.prototype;
      const getterFnName = `get${uppercaseFirst(propertyKey)}`;
      const setterFnName = `set${uppercaseFirst(propertyKey)}`;
      const putterFnName = `put${uppercaseFirst(propertyKey)}`;

      if (!(getterFnName in target)) {
        target[getterFnName] = function () {
          return this.$[propertyKey].getFromGraph(this.graph);
        };
      }

      if (!(setterFnName in target)) {
        target[setterFnName] = function (value, ...args) {
          this.$[propertyKey].writeToGraph(this.graph, value, ...args);
          return this.graph ? this.graph.autoCommitMode === 'sync' ? this.graph.commit() : this.graph.commitAsync() : Promise.resolve(CommitZero);
        };
      }

      if (!(putterFnName in target)) {
        target[putterFnName] = function (value, ...args) {
          this.$[propertyKey].writeToGraph(this.graph, value, ...args);
        };
      }
    }

  }

  return Entity;
}) {} //---------------------------------------------------------------------------------------------------------------------

const createEntityOnPrototype = proto => {
  let parent = Object.getPrototypeOf(proto); // the `hasOwnProperty` condition will be `true` for the `Entity` mixin itself
  // if the parent is `Entity` mixin, then this is a top-level entity

  return defineProperty(proto, '$entity', EntityMeta.new({
    parentEntity: parent.hasOwnProperty(isEntityMarker) ? null : parent.$entity,
    name: proto.constructor.name
  }));
}; //---------------------------------------------------------------------------------------------------------------------

const ensureEntityOnPrototype = proto => {
  if (!proto.hasOwnProperty('$entity')) createEntityOnPrototype(proto);
  return proto.$entity;
};
/*
 * The "generic" field decorator, in the sense, that it allows specifying both field config and field class.
 * This means it can create any field instance.
 */

const generic_field = (fieldConfig, fieldCls = Field) => {
  return function (target, fieldName) {
    const entity = ensureEntityOnPrototype(target);
    entity.addField(fieldCls.new(Object.assign(fieldConfig || {}, {
      name: fieldName
    })));
    const cons = target.constructor;
    cons.createPropertyAccessorsFor(fieldName);
    cons.createMethodAccessorsFor(fieldName);
  };
}; //---------------------------------------------------------------------------------------------------------------------

/**
 * Field decorator. The type signature is:
 *
 * ```ts
 * field : <T extends typeof Field = typeof Field> (fieldConfig? : Partial<InstanceType<T>>, fieldCls : T | typeof Field = Field) => PropertyDecorator
 * ```
 * Its a function, that accepts field config object and optionally a field class (default is [[Field]]) and returns a property decorator.
 *
 * Example:
 *
 * ```ts
 * const ignoreCaseCompare = (a : string, b : string) : boolean => a.toUpperCase() === b.toUpperCase()
 *
 * class MyField extends Field {}
 *
 * class Author extends Entity.mix(Base) {
 *     @field({ equality : ignoreCaseCompare })
 *     firstName       : string
 *
 *     @field({ lazy : true }, MyField)
 *     lastName       : string
 * }
 * ```
 *
 * For every field, there are generated get and set accessors, with which you can read/write the data:
 *
 * ```ts
 * const author     = Author.new({ firstName : 'Mark' })
 *
 * author.firstName // Mark
 * author.lastName  = 'Twain'
 * ```
 *
 * The getters are basically using [[Replica.get]] and setters [[Replica.write]].
 *
 * Note, that if the identifier is asynchronous, reading from it will return a promise. But, immediately after the [[Replica.commit]] call, getter will return
 * plain value. This is a compromise between the convenience and correctness and this behavior may change (or made configurable) in the future.
 *
 * Additionally to the accessors, the getter and setter methods are generated. The getter method's name is formed as `get` followed by the field name
 * with upper-cased first letter. The setter's name is formed in the same way, with `set` prefix.
 *
 * The getter method is an exact equivalent of the get accessor. The setter method, in addition to data write, immediately after that
 * performs a call to [[Replica.commit]] (or [[Replica.commitAsync]], depending from the [[Replica.autoCommitMode]] option)
 * and return its result.
 *
 * ```ts
 * const author     = Author.new({ firstName : 'Mark' })
 *
 * author.getFirstName() // Mark
 * await author.setLastName('Twain') // issues asynchronous commit
 * ```
 */

const field = generic_field; //---------------------------------------------------------------------------------------------------------------------

/**
 * Decorator for the method, that calculates a value of some field
 *
 * ```ts
 *
 * @entity()
 * class Author extends Entity.mix(Base) {
 *     @field()
 *     firstName       : string
 *     @field()
 *     lastName        : string
 *     @field()
 *     fullName        : string
 *
 *     @calculate('fullName')
 *     calculateFullName () : string {
 *         return this.firstName + ' ' + this.lastName
 *     }
 * }
 * ```
 *
 * @param fieldName The name of the field the decorated method should be "tied" to.
 */

const calculate = function (fieldName) {
  // `target` will be a prototype of the class with Entity mixin
  return function (target, propertyKey, _descriptor) {
    ensureEntityOnPrototype(target);
    let calculations;

    if (!target.$calculations) {
      calculations = target.$calculations = {};
    } else {
      if (!target.hasOwnProperty('$calculations')) {
        calculations = target.$calculations = Object.create(target.$calculations);
      } else calculations = target.$calculations;
    }

    calculations[fieldName] = propertyKey;
  };
}; //---------------------------------------------------------------------------------------------------------------------

const write = function (fieldName) {
  // `target` will be a prototype of the class with Entity mixin
  return function (target, propertyKey, _descriptor) {
    ensureEntityOnPrototype(target);
    let writes;

    if (!target.$writes) {
      writes = target.$writes = {};
    } else {
      if (!target.hasOwnProperty('$writes')) {
        writes = target.$writes = Object.create(target.$writes);
      } else writes = target.$writes;
    }

    writes[fieldName] = propertyKey;
  };
}; //---------------------------------------------------------------------------------------------------------------------

const build_proposed = function (fieldName) {
  // `target` will be a prototype of the class with Entity mixin
  return function (target, propertyKey, _descriptor) {
    ensureEntityOnPrototype(target);
    let buildProposed;

    if (!target.$buildProposed) {
      buildProposed = target.$buildProposed = {};
    } else {
      if (!target.hasOwnProperty('$buildProposed')) {
        buildProposed = target.$buildProposed = Object.create(target.$buildProposed);
      } else buildProposed = target.$buildProposed;
    }

    buildProposed[fieldName] = propertyKey;
  };
};

var __decorate$p = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * Mixin, for the identifier that represent a reference field of the entity. Requires the [[Field]] (or its subclass)
 * as a base class. See more about mixins: [[Mixin]]
 */

class ReferenceField extends Mixin([Field], base => class ReferenceField extends base {
  constructor() {
    super(...arguments);
    this.identifierCls = MinimalReferenceIdentifier;
  }

}) {} //---------------------------------------------------------------------------------------------------------------------

/**
 * Specialized version of the [field](_replica_entity_.html#field) decorator, which should be used to mark the references.
 * All it does is replace the default value of the second argument to the [[ReferenceField]].
 *
 * ```ts
 * class Author extends Person {
 *     @bucket()
 *     books           : Set<Book>
 * }
 *
 * class Book extends Entity.mix(Base) {
 *     @reference({ bucket : 'books' })
 *     writtenBy       : Author
 * }
 * ```
 *
 * @param fieldConfig Object with the configuration properties
 * @param fieldCls Optional. Default value has been changed to [[ReferenceField]]
 */

const reference = (fieldConfig, fieldCls = ReferenceField) => generic_field(fieldConfig, fieldCls); //---------------------------------------------------------------------------------------------------------------------

class ReferenceIdentifier extends Mixin([FieldIdentifier], base => {
  class ReferenceIdentifier extends base {
    constructor() {
      super(...arguments);
      this.field = undefined;
      this.proposedValueIsBuilt = true;
    }

    hasBucket() {
      return Boolean(this.field.bucket);
    }

    getBucket(entity) {
      return entity.$[this.field.bucket];
    }

    buildProposedValue(me, quark, transaction) {
      const proposedValue = quark.proposedValue;
      if (proposedValue === null) return null;
      const value = isInstanceOf(proposedValue, Entity) ? proposedValue : me.resolve(proposedValue);

      if (value && me.hasBucket()) {
        me.getBucket(value).addToBucket(transaction, me.self);
      }

      return value;
    }

    resolve(locator) {
      const resolver = this.field.resolver;
      return resolver ? resolver.call(this.self, locator) : null;
    }

    enterGraph(graph) {
      if (this.hasBucket()) {
        const value = graph.activeTransaction.readProposedOrPrevious(this);

        if (value instanceof Entity) {
          // should probably involve `touchInvalidate` here
          this.getBucket(value).addToBucket(graph.activeTransaction, this.self);
        }
      }

      super.enterGraph(graph);
    }

    leaveGraph(graph) {
      if (this.hasBucket()) {
        // here we only need to remove from the "previous", "stable" bucket, because
        // the calculation for the removed reference won't be called - the possible `proposedValue` of reference will be ignored
        const value = graph.activeTransaction.readProposedOrPrevious(this);

        if (value instanceof Entity) {
          this.getBucket(value).removeFromBucket(graph.activeTransaction, this.self);
        }
      }

      super.leaveGraph(graph);
    }

    write(me, transaction, q, proposedValue, ...args) {
      const quark = q || transaction.acquireQuarkIfExists(me);

      if (me.hasBucket()) {
        if (quark) {
          const prevValue = quark.getValue();

          if (prevValue instanceof Entity) {
            me.getBucket(prevValue).removeFromBucket(transaction, me.self);
          }
        } else if (transaction.baseRevision.hasIdentifier(me)) {
          const value = transaction.readPrevious(me);

          if (value instanceof Entity) {
            me.getBucket(value).removeFromBucket(transaction, me.self);
          }
        }
      } // we pass the `q` to super and not `quark`, because we don't do `getWriteTarget` (which increment the epoch)
      // but only `acquireQuarkIfExists` (which does not)

      super.write(me, transaction, q, proposedValue);
    }

  }

  __decorate$p([prototypeValue(Levels.DependsOnlyOnUserInput)], ReferenceIdentifier.prototype, "level", void 0);

  __decorate$p([prototypeValue(QuarkSync)], ReferenceIdentifier.prototype, "quarkClass", void 0);

  return ReferenceIdentifier;
}) {}
class MinimalReferenceIdentifier extends ReferenceIdentifier.mix(FieldIdentifier.mix(CalculatedValueSync)) {}

var __decorate$o = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * Mixin, for the identifier that represent a reference bucket field of the entity. Requires the [[Field]] (or its subclass)
 * as a base class. See more about mixins: [[Mixin]]
 */

class ReferenceBucketField extends Mixin([Field], base => class ReferenceBucketField extends base {
  constructor() {
    super(...arguments);
    this.persistent = false;
    this.identifierCls = MinimalReferenceBucketIdentifier; // see comment for `ReferenceBucketIdentifier` declaration
    // identifierCls       : FieldIdentifierConstructor    = ReferenceBucketIdentifier
  }

}) {} //---------------------------------------------------------------------------------------------------------------------

/**
 * Specialized version of the [field](_replica_entity_.html#field) decorator, which should be used to mark the reference buckets.
 * All it does is replace the default value of the second argument to the [[ReferenceBucketField]].
 *
 * ```ts
 * class Author extends Person {
 *     @bucket()
 *     books           : Set<Book>
 * }
 *
 * class Book extends Entity.mix(Base) {
 *     @reference({ bucket : 'books' })
 *     writtenBy       : Author
 * }
 * ```
 *
 * @param fieldConfig Object with the field configuration properties
 * @param fieldCls Optional. Default value has been changed to [[ReferenceBucketField]]
 */

const bucket = (fieldConfig, fieldCls = ReferenceBucketField) => generic_field(fieldConfig, fieldCls);
var BucketMutationType;

(function (BucketMutationType) {
  BucketMutationType["Add"] = "Add";
  BucketMutationType["Remove"] = "Remove";
})(BucketMutationType || (BucketMutationType = {})); //---------------------------------------------------------------------------------------------------------------------

class ReferenceBucketQuark extends Mixin([Quark], base => class ReferenceBucketQuark extends base {
  constructor() {
    super(...arguments);
    this.mutations = [];
    this.previousValue = undefined;
  }

  hasProposedValueInner() {
    return this.mutations.length > 0;
  }

}) {}
const MinimalReferenceBucketQuark = ReferenceBucketQuark.mix(QuarkSync); //---------------------------------------------------------------------------------------------------------------------

class ReferenceBucketIdentifier extends Mixin([FieldIdentifier], base => {
  // Base class mismatch - should allow subclasses for base class requirements
  // [ FieldIdentifier, CalculatedValueSync ],
  // (base : AnyConstructor<FieldIdentifier & CalculatedValueSync, typeof FieldIdentifier & typeof CalculatedValueSync>) => {
  class ReferenceBucketIdentifier extends base {
    constructor() {
      super(...arguments);
      this.proposedValueIsBuilt = true;
    }

    addToBucket(transaction, entity) {
      const quark = transaction.getWriteTarget(this);
      quark.mutations.push({
        type: BucketMutationType.Add,
        entity
      });
      const baseRevision = transaction.baseRevision;
      if (!quark.previousValue && baseRevision.hasIdentifier(this)) quark.previousValue = transaction.readPrevious(this);
    }

    removeFromBucket(transaction, entity) {
      const preQuark = transaction.entries.get(this); // if bucket is already removed - no need to remove from it

      if (preQuark && preQuark.getValue() === TombStone) return;
      const quark = transaction.getWriteTarget(this);
      quark.mutations.push({
        type: BucketMutationType.Remove,
        entity
      });
      const baseRevision = transaction.baseRevision;
      if (!quark.previousValue && baseRevision.hasIdentifier(this)) quark.previousValue = transaction.readPrevious(this);
    }

    buildProposedValue(me, quarkArg, transaction) {
      const quark = quarkArg;
      const newValue = new Set(quark.previousValue);

      for (let i = 0; i < quark.mutations.length; i++) {
        const {
          type,
          entity
        } = quark.mutations[i];

        if (type === BucketMutationType.Remove) {
          newValue.delete(entity);
        } else if (type === BucketMutationType.Add) {
          newValue.add(entity);
        }
      }

      return newValue;
    }

    leaveGraph(graph) {
      super.leaveGraph(graph);
      this.DATA = undefined;
    }

  }

  __decorate$o([prototypeValue(Levels.DependsOnlyOnDependsOnlyOnUserInput)], ReferenceBucketIdentifier.prototype, "level", void 0);

  __decorate$o([prototypeValue(MinimalReferenceBucketQuark)], ReferenceBucketIdentifier.prototype, "quarkClass", void 0);

  return ReferenceBucketIdentifier;
}) {} //---------------------------------------------------------------------------------------------------------------------

class MinimalReferenceBucketIdentifier extends ReferenceBucketIdentifier.mix(FieldIdentifier.mix(CalculatedValueSync)) {} // export class MinimalReferenceBucketIdentifier extends ReferenceBucketIdentifier.derive(CalculatedValueSync) {}

/**
 * This class describes a schema. Schemas are not used yet in ChronoGraph.
 *
 * Schema is just a collection of entities ([[EntityMeta]])
 */

class Schema extends Base {
  constructor() {
    super(...arguments);
    this.entities = new Map();
  }
  /**
   * Checks whether the schema has an entity with the given name.
   *
   * @param name
   */

  hasEntity(name) {
    return this.entities.has(name);
  }
  /**
   * Returns an entity with the given name or `undefined` if there's no such in this schema
   *
   * @param name
   */

  getEntity(name) {
    return this.entities.get(name);
  }
  /**
   * Adds an entity to the schema.
   * @param entity
   */

  addEntity(entity) {
    const name = entity.name;
    if (!name) throw new Error(`Entity must have a name`);
    if (this.hasEntity(name)) throw new Error(`Entity with name [${String(name)}] already exists`);
    entity.schema = this;
    this.entities.set(name, entity);
    return entity;
  }
  /**
   * Returns a class decorator which can be used to decorate classes as entities.
   */

  getEntityDecorator() {
    // @ts-ignore : https://github.com/Microsoft/TypeScript/issues/29828
    return target => {
      const entity = entityDecoratorBody(target);
      this.addEntity(entity);
      return target;
    };
  }

}
const entityDecoratorBody = target => {
  const name = target.name;
  if (!name) throw new Error(`Can't add entity - the target class has no name`);
  return ensureEntityOnPrototype(target.prototype);
};
/**
 * Entity decorator. It is required to be applied only if entity declares no field.
 * If record declares any field, there no strict need to apply this decorator.
 * Its better to do this anyway, for consistency.
 *
 * ```ts
 * @entity()
 * class Author extends Entity.mix(Base) {
 * }
 *
 * @entity()
 * class SpecialAuthor extends Author {
 * }
 * ```
 */

const entity = () => {
  // @ts-ignore : https://github.com/Microsoft/TypeScript/issues/29828
  return target => {
    entityDecoratorBody(target);
    return target;
  };
};

/**
 * This is a base mixin, which mixes together the ChronoGraph's [Entity](https://bryntum.github.io/chronograph/docs/modules/_src_replica_entity_.html)
 * and the Bryntum Core [Model](https://bryntum.com/docs/grid/api/Core/data/Model)
 *
 * It is used as a very base mixin for all other entities in the project.
 */

class ChronoModelMixin extends Mixin([Entity, Model], base => {
  const superProto = base.prototype;

  class ChronoModelMixin extends base {
    // This is a marker for Models which have the Engine API available.
    get isEntity() {
      return true;
    }

    construct(config, ...args) {
      // this is to force the fields creation, because we need all fields to be created
      // for the `this.getFieldDefinition()` to return correct result
      // @ts-ignore
      this.constructor.exposeProperties(); // Cache original data before we recreate the incoming data here.
      // @ts-ignore

      this.originalData = config = config || {}; // Populate record with all data, it will sort the configs out.
      // By doing this first, we can feed engine the converted values right away. Needed to satisfy tests that
      // use standalone stores, otherwise they will be getting the unconverted values since there is no graph.

      superProto.construct.call(this, config, ...args);
    }
    /**
     * Calculation function that simply returns current ([[ProposedOrPrevious|proposed or previous]]) value of
     * an identifier.
     */

    *userProvidedValue() {
      return yield ProposedOrPrevious;
    }

    copy(newId = null, deep = null) {
      const copy = superProto.copy.call(this, newId, deep); // If deep is everything but object - use default behavior, which is to invoke accessors
      // If deep is an object, check if it has certain field disabled

      if (ObjectHelper.isObject(deep) && !deep.skipFieldIdentifiers || !ObjectHelper.isObject(deep)) {
        this.forEachFieldIdentifier((identifier, fieldName) => {
          copy[fieldName] = this[fieldName];
        });
      }

      return copy;
    }

    applyValue(useProp, key, value, skipAccessors, field) {
      const chronoField = this.$entity.getField(key);
      if (chronoField) useProp = true;

      if (skipAccessors) {
        useProp = false;
      }

      superProto.applyValue.call(this, useProp, key, value, skipAccessors, field);
    }

    afterChange(toSet, wasSet, silent, fromRelationUpdate, skipAccessors) {
      const store = this.firstStore; // When model.set({...}) is called and chrono field is modified, afterChange will be invoked twice:
      // 1. call will forward value to the chrono, leaving model.data intact
      // 2. value was changed, so model.afterChange is called too, triggering `update` event on store
      // 3. autoCommit is scheduled
      // 4. autoCommit finalizes, calling endBatch
      // 5. endBatch calls `set` again, passing argument `skipAccessors = true`, which means data will be set to
      // the `model.data` now
      // 6. since value differs in chrono and in model.data, `afterChange` will be called once again
      // Naturally this leads to two identical events being fired for this call:
      // `dependency.set('type', 0)
      //
      // Idea of the fix is to mute events for the first call IF chrono field is in the `wasSet` object
      // Covered by DependencyEdit.t.js

      if (!skipAccessors && !(store.syncDataOnLoad && store.isLoadingData) && Object.keys(wasSet).some(key => this.$entity.getField(key))) {
        // @ts-ignore
        superProto.afterChange.call(this, toSet, wasSet, true, fromRelationUpdate, skipAccessors);
      } else {
        // @ts-ignore
        superProto.afterChange.apply(this, arguments);
      }
    }

    get isInActiveTransaction() {
      var _this$graph;

      // Might not have joined graph when using delayed calculation
      const activeTransaction = (_this$graph = this.graph) === null || _this$graph === void 0 ? void 0 : _this$graph.activeTransaction;
      return Boolean(activeTransaction === null || activeTransaction === void 0 ? void 0 : activeTransaction.getLatestStableEntryFor(this.$$));
    }

    get data() {
      return this._data;
    }

    set data(data) {
      this._data = data; // Have to iterate over defined fields and not keys in supplied data, in case nested mappings are used

      const {
        fields
      } = this;

      for (let i = 0; i < fields.length; i++) {
        const {
          name,
          dataSource,
          complexMapping
        } = fields[i];
        const chronoField = this.$entity.getField(name);

        if (chronoField) {
          const value = complexMapping ? ObjectHelper.getPath(data, dataSource) : data[dataSource]; // Avoid hitting setter for fields that have no value in supplied data, or are undefined on initial set

          if ((complexMapping || dataSource in data) && (this.generation != null || value !== undefined)) {
            // Use the predefined name for engine (name, startDate)
            this[name] = value;
          }
        }
      }
    }

    get $entityName() {
      const className = this.constructor.name || this.$entity.name;
      const id = this.id;
      return `${className}${id != null ? '-' + String(id) : ''}`;
    }

  }

  return ChronoModelMixin;
}) {}

const locale$1 = {
  RemoveDependencyCycleEffectResolution: {
    descriptionTpl: 'Remove dependency'
  },
  DeactivateDependencyCycleEffectResolution: {
    descriptionTpl: 'Deactivate dependency'
  },
  CycleEffectDescription: {
    descriptionTpl: 'A cycle has been found, formed by: {0}'
  },
  EmptyCalendarEffectDescription: {
    descriptionTpl: '"{0}" calendar does not provide any working time intervals.'
  },
  Use24hrsEmptyCalendarEffectResolution: {
    descriptionTpl: 'Use 24 hours calendar with non-working Saturdays and Sundays.'
  },
  Use8hrsEmptyCalendarEffectResolution: {
    descriptionTpl: 'Use 8 hours calendar (08:00-12:00, 13:00-17:00) with non-working Saturdays and Sundays.'
  },
  ConflictEffectDescription: {
    descriptionTpl: 'A scheduling conflict has been found: {0} is conflicting with {1}'
  },
  ConstraintIntervalDescription: {
    dateFormat: 'LLL'
  },
  ProjectConstraintIntervalDescription: {
    startDateDescriptionTpl: 'Project start date {0}',
    endDateDescriptionTpl: 'Project end date {0}'
  },
  DependencyType: {
    long: ['Start-to-Start', 'Start-to-Finish', 'Finish-to-Start', 'Finish-to-Finish']
  },
  DependencyConstraintIntervalDescription: {
    descriptionTpl: 'Dependency ({2}) from <strong>{3}</strong> to <strong>{4}</strong>'
  },
  RemoveDependencyResolution: {
    descriptionTpl: 'Remove dependency from "{1}" to "{2}"'
  },
  DeactivateDependencyResolution: {
    descriptionTpl: 'Deactivate dependency from "{1}" to "{2}"'
  },
  DateConstraintIntervalDescription: {
    startDateDescriptionTpl: 'Task <strong>{2}</strong> {3} {0} constraint',
    endDateDescriptionTpl: 'Task <strong>{2}</strong> {3} {1} constraint',
    constraintTypeTpl: {
      startnoearlierthan: 'Start-No-Earlier-Than',
      finishnoearlierthan: 'Finish-No-Earlier-Than',
      muststarton: 'Must-Start-On',
      mustfinishon: 'Must-Finish-On',
      startnolaterthan: 'Start-No-Later-Than',
      finishnolaterthan: 'Finish-No-Later-Than'
    }
  },
  RemoveDateConstraintConflictResolution: {
    descriptionTpl: 'Remove "{1}" constraint of task "{0}"'
  }
};

LocaleManagerSingleton.registerLocale('En', {
  desc: 'English',
  locale: locale$1
});

/**
 * General purpose date interval. Contains just 2 properties - [[startDate]] and [[endDate]].
 */

class DateInterval extends Base {
  initialize(...args) {
    super.initialize(...args);
    if (!this.startDate) this.startDate = MIN_DATE;
    if (!this.endDate) this.endDate = MAX_DATE;
  }

  equalTo(another) {
    return this.startDate.getTime() === another.startDate.getTime() && this.endDate.getTime() === another.endDate.getTime();
  }

  isInfinite() {
    return this.startDate.getTime() === MIN_DATE.getTime() && this.endDate.getTime() === MAX_DATE.getTime();
  }

  startDateIsFinite() {
    return !this.isIntervalEmpty() && this.startDate.getTime() !== MIN_DATE.getTime();
  }

  endDateIsFinite() {
    return !this.isIntervalEmpty() && this.endDate.getTime() !== MAX_DATE.getTime();
  }
  /**
   * Test whether the given time point is within this interval. By default interval is considered to be
   * inclusive on the left side and opened on the right (controlled with `edgeInclusion`).
   *
   * @param date
   * @param edgeInclusion
   */

  containsDate(date, edgeInclusion = EdgeInclusion.Left) {
    return edgeInclusion === EdgeInclusion.Left && date >= this.startDate && date < this.endDate || edgeInclusion === EdgeInclusion.Right && date > this.startDate && date <= this.endDate;
  }

  isIntervalEmpty() {
    return this.startDate > this.endDate;
  }
  /**
   * Intersect this interval with another in the immutable way - returns a new interval.
   * @param another
   */

  intersect(another) {
    const anotherStart = another.startDate;
    const anotherEnd = another.endDate;
    const start = this.startDate;
    const end = this.endDate; // No intersection found

    if (end < anotherStart || start > anotherEnd) {
      // return an empty interval
      return EMPTY_INTERVAL;
    }

    const newStart = new Date(Math.max(start.getTime(), anotherStart.getTime()));
    const newEnd = new Date(Math.min(end.getTime(), anotherEnd.getTime()));
    return this.constructor.new({
      startDate: newStart,
      endDate: newEnd
    });
  }
  /**
   * Intersect this interval with another in the mutable way - updates current interval.
   * @param another
   */

  intersectMut(another, collectIntersectionMeta = false) {
    const anotherStart = another.startDate;
    const anotherEnd = another.endDate;
    const start = this.startDate;
    const end = this.endDate; // If another interval is an intersection result we keep track of the
    // initial intersected intervals

    if (collectIntersectionMeta) {
      var _another$intersection;

      if (!this.intersectionOf) this.intersectionOf = new Set();

      if (((_another$intersection = another.intersectionOf) === null || _another$intersection === void 0 ? void 0 : _another$intersection.size) > 0) {
        // this.intersectionOf = new Set([ ...this.intersectionOf, ...another.intersectionOf ])
        another.intersectionOf.forEach(this.intersectionOf.add, this.intersectionOf);
        this.intersectedAsEmpty = another.intersectedAsEmpty;
      } // keep track if the intervals we intersect with
      else {
        this.intersectionOf.add(another);
      }
    } // Bail out if we are an empty interval

    if (!this.isIntervalEmpty()) {
      // No intersection found
      if (end < anotherStart || start > anotherEnd) {
        // return an empty interval
        this.startDate = MAX_DATE;
        this.endDate = MIN_DATE; // remember the interval resulted an empty intersection

        if (collectIntersectionMeta) {
          this.intersectedAsEmpty = another;
        }

        return this;
      }

      this.startDate = new Date(Math.max(start.getTime(), anotherStart.getTime()));
      this.endDate = new Date(Math.min(end.getTime(), anotherEnd.getTime()));
    }

    return this;
  }

}
const EMPTY_INTERVAL = DateInterval.new({
  startDate: MAX_DATE,
  endDate: MIN_DATE
});
/**
 * Intersects the array of intervals. Returns a new interval with result.
 *
 * @param dateIntervals
 */

const intersectIntervals = (dateIntervals, collectIntersectionMeta = false) => {
  return dateIntervals.reduce((acc, currentInterval) => acc.intersectMut(currentInterval, collectIntersectionMeta), DateInterval.new());
};

var __decorate$n = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Type for an effect resolution process.
 */

var EffectResolutionResult;

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

class SchedulingIssueEffectResolution extends Base$1 {
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

class SchedulingIssueEffect extends Effect {
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

__decorate$n([prototypeValue('schedulingIssueEffect')], SchedulingIssueEffect.prototype, "type", void 0);

__decorate$n([prototypeValue(false)], SchedulingIssueEffect.prototype, "sync", void 0);

var __decorate$m = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

const ConflictSymbol = Symbol('ConflictSymbol');
/**
 * Description builder for a [[ConflictEffect|scheduling conflict]].
 */

class ConflictEffectDescription extends Localizable(Base$1) {
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

class ConflictEffect extends SchedulingIssueEffect {
  constructor() {
    super(...arguments);
    this.handler = ConflictSymbol;
  }

  initialize(props) {
    super.initialize(props); // filter the provided intervals to keep only the conflicting ones

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
    const result = []; // filter out infinite intervals ..they don't really restrict anything

    const intervalsArray = [...intervals].filter(interval => !interval.isInfinite());
    const affectedInterval = intervals.find(interval => interval.isAffectedByTransaction()); // If we've managed to detect the interval being changed in this transaction

    if (affectedInterval) {
      // Sort intervals so the one we've found go first..
      const sorted = intervalsArray.sort((a, b) => a === affectedInterval ? -1 : 0); // ..so when intersecting intervals we find another interval resulting an empty intersection

      const intersection = intersectIntervals(sorted, true);
      const conflictingInterval = intersection.intersectedAsEmpty;
      result.push(conflictingInterval, affectedInterval);
    } else {
      result.push(intersectIntervals(intervalsArray, true).intersectedAsEmpty, intersectIntervals(intervalsArray.reverse(), true).intersectedAsEmpty);
    }

    return result;
  }

}

__decorate$m([prototypeValue('schedulingConflict')], ConflictEffect.prototype, "type", void 0);

__decorate$m([prototypeValue(ConflictEffectDescription)], ConflictEffect.prototype, "_descriptionBuilderClass", void 0);
/**
 * An abstract class for implementing a certain way of resolving a scheduling conflict.
 */

class ConflictResolution extends SchedulingIssueEffectResolution {
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

class ConstraintIntervalDescription extends Localizable(Base$1) {
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
    return [DateHelper.format(interval.startDate, this.L('L{dateFormat}')), DateHelper.format(interval.endDate, this.L('L{dateFormat}'))];
  }

}
/**
 * Base class for implementing an interval that applies a certain constraint on event(s).
 */

class ConstraintInterval extends DateInterval {
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
    const {
      owner,
      reflectionOf,
      side
    } = this;
    return Object.assign({
      owner,
      reflectionOf,
      side
    }, data);
  }

  copyWith(data) {
    const copyData = this.getCopyProperties(data); // @ts-ignore

    return this.constructor.new(copyData);
  }

}

__decorate$m([prototypeValue(ConstraintIntervalDescription)], ConstraintInterval.prototype, "descriptionBuilderClass", void 0);

var __decorate$l = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const isSerializableEqual = function (oldValue, newValue) {
  return oldValue === newValue || (newValue !== null && newValue !== void 0 && newValue.isBase ? this.serialize(newValue) : newValue) === (oldValue !== null && oldValue !== void 0 && oldValue.isBase ? this.serialize(oldValue) : oldValue);
}; //---------------------------------------------------------------------------------------------------------------------

class ModelField extends Field {
  constructor() {
    super(...arguments);
    this.modelFieldConfig = {};
  }

  getIdentifierClass(calculationFunction) {
    if (this.identifierCls) return this.identifierCls;
    if (!calculationFunction) return MinimalChronoModelFieldVariable;
    return isGeneratorFunction(calculationFunction) ? MinimalChronoModelFieldIdentifierGen : MinimalChronoModelFieldIdentifierSync;
  }

} //---------------------------------------------------------------------------------------------------------------------

class ModelReferenceField extends ReferenceField.mix(ModelField) {
  constructor() {
    super(...arguments);
    this.identifierCls = ChronoModelReferenceFieldIdentifier;
  }

} //---------------------------------------------------------------------------------------------------------------------
// it seems we don't need the buckets as Core fields, the `ModelBucketField` can be removed completely

class ModelBucketField extends ReferenceBucketField.mix(Field) {
  constructor() {
    super(...arguments);
    this.identifierCls = ChronoModelReferenceBucketFieldIdentifier; // initialize (...args) {
    //     super.initialize(...args)
    //
    //     // the default value is actually shared among all instances (which is ok, since its assumed to be immutable)
    //     this.modelFieldConfig   = Object.assign({ isEqual : () => false, defaultValue : new Set(), persist : false }, this.modelFieldConfig)
    // }
  }

} // eof Fields
// Atoms

const IsChronoModelSymbol = Symbol('IsChronoModelSymbol'); //---------------------------------------------------------------------------------------------------------------------

class ChronoModelFieldIdentifier extends Mixin([FieldIdentifier], base => {
  const superProto = base.prototype;

  class ChronoModelFieldIdentifier extends base {
    [IsChronoModelSymbol]() {}

    getFromGraph(graph) {
      if (graph) {
        if (graph.readMode === ReadMode.CurrentOrProposedOrPrevious) {
          if (this.sync && !this.context.project.isDelayingCalculation) return graph.get(this);else return graph.activeTransaction.readCurrentOrProposedOrPrevious(this);
        }

        return superProto.getFromGraph.call(this, graph);
      } else return this.DATA;
    }

    writeToGraph(graph, proposedValue, ...args) {
      if (graph) {
        superProto.writeToGraph.call(this, graph, proposedValue, ...args);
      } else {
        this.DATA = proposedValue; //@ts-ignore

        this.self.set(this.field.name, proposedValue, false, false, true);
      }
    }

    write(me, transaction, quark, proposedValue, ...args) {
      // convert proposed value if needed
      proposedValue = me.convert(proposedValue);
      superProto.write.call(this, me, transaction, quark, proposedValue, ...args);
    }

    convert(value) {
      const field = this.field;
      const fieldDefinition = this.self.getFieldDefinition(field.name); // use field definition provided "convert" function

      if (fieldDefinition !== null && fieldDefinition !== void 0 && fieldDefinition.convert) {
        value = fieldDefinition.convert(value); // fallback to atom defined "converter"
      } else if (field.converter) {
        value = field.converter(value, field);
      }

      return value;
    }

    equality(v1, v2) {
      if (v1 instanceof Date && v2 instanceof Date) return v1.getTime() === v2.getTime();
      return v1 === v2;
    }

  }

  __decorate$l([prototypeValue(false)], ChronoModelFieldIdentifier.prototype, "sync", void 0);

  return ChronoModelFieldIdentifier;
}) {} //---------------------------------------------------------------------------------------------------------------------

class ChronoModelReferenceFieldQuark extends Mixin([QuarkSync], base => {
  const superProto = base.prototype;

  class ChronoModelReferenceFieldQuark extends base {
    setValue(value) {
      superProto.setValue.call(this, value); // keep the copy of value on the identifier itself, to make it available
      // after the identifier is removed from the graph
      //@ts-ignore

      if (value !== TombStone) this.identifier.DATA = value;
    }

  }

  return ChronoModelReferenceFieldQuark;
}) {}
class ChronoModelReferenceFieldIdentifier extends ReferenceIdentifier.mix(ChronoModelFieldIdentifier.mix(MinimalFieldIdentifierSync)) {
  buildProposedValue(me, q, transaction) {
    const quark = q;
    const proposedValue = quark.proposedValue;

    if (proposedValue === null || proposedValue === undefined) {
      transaction.candidate.failedResolutionReferences.delete(quark.identifier);
      return null;
    }

    if (isInstanceOf(proposedValue, Entity)) {
      if (me.hasBucket()) me.getBucket(proposedValue).addToBucket(transaction, me.self);
      transaction.candidate.failedResolutionReferences.delete(quark.identifier);
      return proposedValue;
    }

    const resolved = me.resolve(proposedValue);

    if (isInstanceOf(resolved, Entity)) {
      if (me.hasBucket()) me.getBucket(resolved).addToBucket(transaction, me.self);
      transaction.candidate.failedResolutionReferences.delete(quark.identifier);
      return resolved;
    } else {
      transaction.candidate.failedResolutionReferences.set(quark.identifier, proposedValue);
      return null;
    }
  }

}

__decorate$l([prototypeValue(true)], ChronoModelReferenceFieldIdentifier.prototype, "sync", void 0);

__decorate$l([prototypeValue(ChronoModelReferenceFieldQuark)], ChronoModelReferenceFieldIdentifier.prototype, "quarkClass", void 0); //---------------------------------------------------------------------------------------------------------------------

class ChronoModelReferenceBucketFieldIdentifier extends ReferenceBucketIdentifier.mix(ChronoModelFieldIdentifier.mix(MinimalFieldIdentifierSync)) {}

__decorate$l([prototypeValue(true)], ChronoModelReferenceBucketFieldIdentifier.prototype, "sync", void 0);

class MinimalChronoModelFieldIdentifierSync extends ChronoModelFieldIdentifier.mix(MinimalFieldIdentifierSync) {}
class MinimalChronoModelFieldIdentifierGen extends ChronoModelFieldIdentifier.mix(MinimalFieldIdentifierGen) {}
class MinimalChronoModelFieldVariable extends ChronoModelFieldIdentifier.mix(MinimalFieldVariable) {} // eof Atoms

const model_field = function (modelFieldConfig = {}, chronoFieldConfig = {}, chronoFieldClass = ModelField) {
  return function (target, propertyKey) {
    const decoratorFn = generic_field(_objectSpread2({
      modelFieldConfig
    }, chronoFieldConfig), chronoFieldClass);
    decoratorFn(target, propertyKey);
    injectStaticFieldsProperty(target.constructor);
  };
};
const injectStaticFieldsProperty = prototype => {
  if (!prototype.hasOwnProperty('fields')) {
    Object.defineProperty(prototype, 'fields', {
      get: function () {
        return getDecoratedModelFields(this);
      }
    });
  }
};
const getDecoratedModelFields = constr => {
  const proto = constr.prototype;
  const result = [];

  if (proto.hasOwnProperty('$entity')) {
    proto.$entity.ownFields.forEach(field => {
      if (field instanceof ModelField) {
        const config = field.modelFieldConfig || {};

        if (!config.convert && field.converter && field.converter !== dateConverter) {
          config.convert = field.converter;
        }

        result.push(Object.assign(config, {
          $chrono: field,
          name: field.name
        }));
      }
    });
  }

  return result;
};
const dateConverter = (date, field) => {
  if (date === null) {
    return null;
  }

  if (!(date instanceof Date)) {
    var _field$modelFieldConf, _field$modelFieldConf2;

    date = DateHelper.parse(date, ((_field$modelFieldConf = field.modelFieldConfig) === null || _field$modelFieldConf === void 0 ? void 0 : _field$modelFieldConf.format) || ((_field$modelFieldConf2 = field.modelFieldConfig) === null || _field$modelFieldConf2 === void 0 ? void 0 : _field$modelFieldConf2.dateFormat) || DateHelper.defaultParseFormat);
  } // if parsing has failed, we would like to return `undefined` to indicate the "absence" of data
  // instead of `null` (presence of "empty" data)

  return date || undefined;
};

/**
 * This a base generic mixin for every class, that belongs to a chronograph powered project.
 *
 * It just provides getter/setter for the `project` property, along with some convenience methods
 * to access the project's stores.
 */

class ChronoPartOfProjectGenericMixin extends Mixin([AbstractPartOfProjectGenericMixin], base => {
  base.prototype;

  class ChronoPartOfProjectGenericMixin extends base {
    /**
     * The method to get the `ChronoGraph` instance, this entity belongs to.
     */
    getGraph() {
      const project = this.getProject();
      return project === null || project === void 0 ? void 0 : project.getGraph();
    } //region Entity getters

    /**
     * Convenience method to get the instance of event by its id.
     */

    getEventById(id) {
      var _this$getEventStore;

      return (_this$getEventStore = this.getEventStore()) === null || _this$getEventStore === void 0 ? void 0 : _this$getEventStore.getById(id);
    }
    /**
     * Convenience method to get the instance of dependency by its id.
     */

    getDependencyById(id) {
      var _this$getDependencySt;

      return (_this$getDependencySt = this.getDependencyStore()) === null || _this$getDependencySt === void 0 ? void 0 : _this$getDependencySt.getById(id);
    }
    /**
     * Convenience method to get the instance of resource by its id.
     */

    getResourceById(id) {
      var _this$getResourceStor;

      return (_this$getResourceStor = this.getResourceStore()) === null || _this$getResourceStor === void 0 ? void 0 : _this$getResourceStor.getById(id);
    }
    /**
     * Convenience method to get the instance of assignment by its id.
     */

    getAssignmentById(id) {
      var _this$getAssignmentSt;

      return (_this$getAssignmentSt = this.getAssignmentStore()) === null || _this$getAssignmentSt === void 0 ? void 0 : _this$getAssignmentSt.getById(id);
    }
    /**
     * Convenience method to get the instance of calendar by its id.
     */

    getCalendarById(id) {
      var _this$getCalendarMana;

      return (_this$getCalendarMana = this.getCalendarManagerStore()) === null || _this$getCalendarMana === void 0 ? void 0 : _this$getCalendarMana.getById(id);
    }

  }

  return ChronoPartOfProjectGenericMixin;
}) {}

class ChronoStoreMixin extends Mixin([Store], base => class ChronoStoreMixin extends base {}) {}

/**
 * This a base mixin for every Store, that belongs to a ChronoGraph powered project.
 */

class ChronoPartOfProjectStoreMixin extends Mixin([AbstractPartOfProjectStoreMixin, ChronoPartOfProjectGenericMixin, ChronoStoreMixin], base => {
  const superProto = base.prototype;

  class ChronoPartOfProjectStoreMixin extends base {
    setStoreData(data) {
      var _this$project;

      // Inform project that a store is being repopulated, to avoid expensive unjoins
      (_this$project = this.project) === null || _this$project === void 0 ? void 0 : _this$project.repopulateStore(this);
      superProto.setStoreData.call(this, data);
    }

    register(record) {
      var _this$project2, _this$project3;

      superProto.register.call(this, record); // NOTE: Remove check for `this.project.graph` if we want records added after the initial calculations to also have
      //       delayed entry into the replica
      // @ts-ignore

      !record.isRoot && !((_this$project2 = this.project) !== null && _this$project2 !== void 0 && _this$project2.graph) && ((_this$project3 = this.project) === null || _this$project3 === void 0 ? void 0 : _this$project3.scheduleDelayedCalculation());
    }

  }

  return ChronoPartOfProjectStoreMixin;
}) {}

/**
 * This a base mixin for every Model that belongs to a ChronoGraph powered project.
 *
 * The model with this mixin, supposes that it will be "joining" a store that is already part of a project,
 * so that such model can take a reference to the project from it.
 *
 * It provides 2 template methods [[joinProject]] and [[leaveProject]], which can be overridden in other mixins
 * (they should always call `super` implementation, because it adds/remove the model to/from the ChronoGraph instance)
 */

class ChronoPartOfProjectModelMixin extends Mixin([AbstractPartOfProjectModelMixin, ChronoPartOfProjectGenericMixin, ChronoModelMixin], base => {
  const superProto = base.prototype;

  class ChronoPartOfProjectModelMixin extends base {
    /**
     * Template method, which is called when model is joining the project (through joining some store that
     * has already joined the project)
     */
    joinProject() {
      var _this$project;

      if (!((_this$project = this.project) !== null && _this$project !== void 0 && _this$project.delayEnteringReplica)) {
        if (this.graph && this.graph != this.getGraph()) {
          this.graph = null;
        }

        this.getGraph().addEntity(this);
      }
    }
    /**
     * Template method, which is called when model is leaving the project (through leaving some store usually)
     */

    leaveProject(isReplacing = false) {
      superProto.leaveProject.call(this, isReplacing);
      const replica = this.getGraph(); // Because of delayCalculation it might not have joined the graph at all

      replica === null || replica === void 0 ? void 0 : replica.removeEntity(this); // @ts-ignore

      this.graph = null;
    }
    /**
     * Returns a [[SchedulerBasicProjectMixin|project]] instance
     */

    getProject() {
      return superProto.getProject.call(this);
    }

    calculateProject() {
      const store = this.stores.find(s => isInstanceOf(s, ChronoPartOfProjectStoreMixin) && !!s.getProject());
      return store === null || store === void 0 ? void 0 : store.getProject();
    } // Report that there is no graph when delaying calculations, to not let anything enter it on reloads

    get graph() {
      var _this$project2;

      return (_this$project2 = this.project) !== null && _this$project2 !== void 0 && _this$project2.delayEnteringReplica ? null : this._graph;
    }

    set graph(graph) {
      this._graph = graph;
    }

  }

  return ChronoPartOfProjectModelMixin;
}) {}

var __decorate$k = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const hasMixin = Symbol('CalendarMixin');
const EmptyCalendarSymbol = Symbol('EmptyCalendarSymbol');
/**
 * The calendar for project scheduling, it is used to mark certain time intervals as "non-working" and ignore them during scheduling.
 *
 * The calendar consists from several [[CalendarIntervalMixin|intervals]]. The intervals can be either static or recurrent.
 */

class BaseCalendarMixin extends Mixin([AbstractCalendarMixin, ChronoPartOfProjectModelMixin], base => {
  base.prototype;

  class BaseCalendarMixin extends base {
    constructor() {
      super(...arguments);
      this.version = 1; // // this makes the calendar's self-atom to change (and trigger calculation on outgoing edges) on every `version` change
      // * calculateSelf () : CalculationIterator<this> {
      //     yield this.$.version
      //
      //     return this
      // }
    }

    [hasMixin]() {}

  }

  __decorate$k([field({
    persistent: false
  })], BaseCalendarMixin.prototype, "version", void 0);

  __decorate$k([model_field({
    type: 'string'
  })], BaseCalendarMixin.prototype, "name", void 0);

  __decorate$k([model_field({
    type: 'string'
  })], BaseCalendarMixin.prototype, "cls", void 0);

  __decorate$k([model_field({
    type: 'string'
  })], BaseCalendarMixin.prototype, "iconCls", void 0);

  __decorate$k([model_field({
    type: 'boolean',
    defaultValue: true
  })], BaseCalendarMixin.prototype, "unspecifiedTimeIsWorking", void 0);

  __decorate$k([model_field()], BaseCalendarMixin.prototype, "intervals", void 0);

  return BaseCalendarMixin;
}) {}
/**
 * Class providing a human readable localized description of an [[EmptyCalendarEffect]] instance.
 */

class EmptyCalendarEffectDescription extends Localizable(Base$1) {
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

class EmptyCalendarEffect extends SchedulingIssueEffect {
  constructor() {
    super(...arguments);
    this.handler = EmptyCalendarSymbol;
  }

  getResolutions() {
    const calendar = this.getCalendar();
    return this._resolutions || (this._resolutions = [Use24hrsEmptyCalendarEffectResolution.new({
      calendar
    }), Use8hrsEmptyCalendarEffectResolution.new({
      calendar
    })]);
  } // TODO handle cases when all individual calendars have working periods yet their intersection does not

  /**
   * Returns the calendar that does not have any working periods specified.
   */

  getCalendar() {
    const {
      calendars
    } = this;

    if ((calendars === null || calendars === void 0 ? void 0 : calendars.length) > 1) {
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

__decorate$k([prototypeValue('emptyCalendar')], EmptyCalendarEffect.prototype, "type", void 0);

__decorate$k([prototypeValue(EmptyCalendarEffectDescription)], EmptyCalendarEffect.prototype, "_descriptionBuilderClass", void 0);
/**
 * Base class for [[EmptyCalendarEffect]] resolutions.
 * The class has [[fixCalendarData]] method that pushes preconfigured [[calendarData]]
 * to the given [[calendar]]. The method is called in [[resolve]] method so for a subclass
 * it's enough just providing [[fixCalendarData|proper data]].
 */

class BaseEmptyCalendarEffectResolution extends Localizable(SchedulingIssueEffectResolution) {
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
        intervals: [{
          isWorking: true
        }]
      }
    };
  }

  getDescription() {
    const {
      calendar
    } = this;
    return format(this.L('L{descriptionTpl}'), calendar.name || calendar.id);
  }
  /**
   * Fixes the provided calendar data by clearing its intervals
   * amd then applying data specified in [[calendarData]] config.
   * @param calendar
   */

  fixCalendarData(calendar) {
    var _calendar$intervals;

    calendar.clearIntervals(true); // @ts-ignore

    Object.assign(calendar, this.calendarData);

    if ((_calendar$intervals = calendar.intervals) !== null && _calendar$intervals !== void 0 && _calendar$intervals.length) {
      calendar.addIntervals(calendar.intervals);
    }
  }
  /**
   * Resolves the [[calendar]] by removing all its intervals and
   * adding new [[calendarData|correct ones]].
   */

  resolve() {
    const {
      calendar
    } = this;
    this.fixCalendarData(calendar);
  }

}
/**
 * Resolution option for [[EmptyCalendarEffect]] that fixes a specified calendar by
 * replacing its data with standard __24 hours/day__ calendar (__Saturday__ and __Sunday__ are non-working days) data.
 */

class Use24hrsEmptyCalendarEffectResolution extends BaseEmptyCalendarEffectResolution {
  static get $name() {
    return 'Use24hrsEmptyCalendarEffectResolution';
  }

  static get configurable() {
    return {
      calendarData: {
        unspecifiedTimeIsWorking: false,
        intervals: [{
          recurrentStartDate: 'on Mon at 0:00',
          recurrentEndDate: 'on Sat at 0:00',
          isWorking: true
        }]
      }
    };
  }

}
/**
 * Resolution option for [[EmptyCalendarEffect]] that fixes a specified calendar by
 * replacing its data with standard __8 hours/day__ calendar (__Saturday__ and __Sunday__ are non-working days) data.
 */

class Use8hrsEmptyCalendarEffectResolution extends BaseEmptyCalendarEffectResolution {
  static get $name() {
    return 'Use8hrsEmptyCalendarEffectResolution';
  }

  static get configurable() {
    return {
      calendarData: {
        unspecifiedTimeIsWorking: false,
        intervals: [{
          recurrentStartDate: 'every weekday at 08:00',
          recurrentEndDate: 'every weekday at 12:00',
          isWorking: true
        }, {
          recurrentStartDate: 'every weekday at 13:00',
          recurrentEndDate: 'every weekday at 17:00',
          isWorking: true
        }]
      }
    };
  }

}

var __decorate$j = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const CycleSymbol = Symbol('CycleSymbol'); //---------------------------------------------------------------------------------------------------------------------

class EngineRevision extends Revision {
  constructor() {
    super(...arguments);
    this.failedResolutionReferences = new Map();
  }

} //---------------------------------------------------------------------------------------------------------------------

class EngineTransaction extends Transaction {
  constructor() {
    super(...arguments);
    this.candidateClass = EngineRevision;
  }

  initialize(props) {
    var _props$graph$project;

    // Emit progress earlier and more frequently when using delayCalculation mode, to not lock up UI as much and to
    // have smoother progress bar updates.
    // Transactions created to validate deps does not reference project
    if ((_props$graph$project = props.graph.project) !== null && _props$graph$project !== void 0 && _props$graph$project.delayCalculation) {
      props.startProgressNotificationsAfterMs = 0;
      props.emitProgressNotificationsEveryMs = 100;
    }

    super.initialize(props);
    this.candidate.failedResolutionReferences = new Map(this.baseRevision.failedResolutionReferences);
  }

  addIdentifier(identifier, proposedValue, ...args) {
    this.markFailedResolutionReferences();
    return super.addIdentifier(identifier, proposedValue, ...args);
  }

  markFailedResolutionReferences() {
    this.candidate.failedResolutionReferences.forEach((failedResolutionValue, identifier) => {
      this.write(identifier, failedResolutionValue);
    });
    this.candidate.failedResolutionReferences.clear();
  }

} //---------------------------------------------------------------------------------------------------------------------

/**
 * An extension of [[Replica]], specialized for interaction with [[AbstractProjectMixin|project]].
 */

class EngineReplica extends Mixin([Replica], base => {
  const superProto = base.prototype;

  class EngineReplica extends base {
    constructor() {
      super(...arguments);
      this.baseRevision = EngineRevision.new();
      this.transactionClass = EngineTransaction;
      this.autoCommitMode = 'async';
      this.onComputationCycle = 'effect';
      this.cycleEffectClass = CycleEffect;
      this.silenceInitialCommit = true;
      this.ignoreInitialCommitComputationCycles = false;
    } // clear () {
    //     this.removeEntity(this.project)
    //
    //     super.clear()
    //
    //     this.addEntity(this.project)
    // }

    get dirty() {
      const activeTransaction = this.activeTransaction;
      return activeTransaction.entries.size > 0 && (activeTransaction.hasVariableEntry || activeTransaction.hasEntryWithProposedValue);
    }

    onPropagationProgressNotification(notification) {
      if (this.enableProgressNotifications && this.project) this.project.trigger('progress', notification);
    }

    async commitAsync(args) {
      this.project.trigger('beforeCommit');

      if (this.isInitialCommit && this.ignoreInitialCommitComputationCycles) {
        // backup onComputationCycle value to restore it after the commit
        this._onComputationCycle = this._onComputationCycle || this.onComputationCycle; // toggle onComputationCycle to ignore cycles to let the data get into the graph

        this.onComputationCycle = 'ignore';
      }

      const replacedReplicaResult = this.project.beforeCommitAsync();
      if (replacedReplicaResult) return replacedReplicaResult;
      return superProto.commitAsync.call(this, args);
    }

    get isInitialCommit() {
      // let the project defined which commit is "initial"
      return this.project.isInitialCommit || super.isInitialCommit;
    }

    set isInitialCommit(value) {
      super.isInitialCommit = value;
    }

    write(identifier, proposedValue, ...args) {
      var _identifier$field;

      const fieldName = (_identifier$field = identifier.field) === null || _identifier$field === void 0 ? void 0 : _identifier$field.name;
      const record = identifier.self;

      if (fieldName && record) {
        var _record$beforeChronoF, _record$afterChronoFi;

        // @ts-ignore
        const beforeHookResult = (_record$beforeChronoF = record.beforeChronoFieldSet) === null || _record$beforeChronoF === void 0 ? void 0 : _record$beforeChronoF.call(record, fieldName, proposedValue);
        superProto.write.call(this, identifier, proposedValue, ...args); // @ts-ignore

        (_record$afterChronoFi = record.afterChronoFieldSet) === null || _record$afterChronoFi === void 0 ? void 0 : _record$afterChronoFi.call(record, fieldName, proposedValue, beforeHookResult);
      } else {
        superProto.write.call(this, identifier, proposedValue, ...args);
      }
    }

    async finalizeCommitAsync(transactionResult) {
      // the `this.project` may be empty for the branch, where we validate the dependency
      // because if asyncness project might be destroyed when we get here
      const {
        project
      } = this;
      if (!project || project.isDestroyed) return;
      const {
        entries
      } = transactionResult;
      const autoCommitStores = new Set();
      if (globalThis.DEBUG) console.timeEnd('Time to visible');
      const {
        isInitialCommit,
        silenceInitialCommit
      } = this; // apply changes silently if this is initial commit and "silenceInitialCommit" option is enabled

      const silenceCommit = isInitialCommit && silenceInitialCommit;

      if (isInitialCommit) {
        project.isInitialCommitPerformed = true; // restore onComputationCycle back if we toggled it before committing

        if (this.ignoreInitialCommitComputationCycles) this.onComputationCycle = this._onComputationCycle;
      }

      project.isWritingData = true;
      project.hasLoadedDataToCommit = false; // Let progress listeners know we are finalizing

      if (this.enableProgressNotifications) {
        project.trigger('progress', {
          total: transactionResult.entries.size,
          remaining: 0,
          phase: 'finalizing'
        });
      } // It is triggered earlier because on that stage engine is ready and UI can be drawn.
      // dataReady happens up to like a second later in big datasets. We do not want to wait that long

      project.trigger('refresh', {
        isInitialCommit,
        isCalculated: true
      }); // console.timeEnd('rendered')

      await new Promise(resolve => {
        setTimeout(() => {
          // TODO: Should use Delayable
          if (!project.isDestroyed) {
            if (!transactionResult.transaction.rejectedWith) {
              var _project$suspendChang, _project$resumeChange;

              // @ts-ignore
              (_project$suspendChang = project.suspendChangesTracking) === null || _project$suspendChang === void 0 ? void 0 : _project$suspendChang.call(project);
              if (globalThis.DEBUG) console.time('Finalize propagation');
              const records = new Set();

              for (const quark of entries.values()) {
                const identifier = quark.identifier;
                const quarkValue = quark.getValue();
                const {
                  field
                } = identifier;
                if (quark.isShadow() || !identifier[IsChronoModelSymbol] || quarkValue === TombStone || field instanceof ModelBucketField) continue;
                const record = identifier.self;
                const store = record.firstStore; // Begin batch once

                if (!records.has(record)) {
                  record.beginBatch(true);
                  records.add(record);
                } // Avoid committing changes during refresh, commit below instead. Suspend once

                if (store !== null && store !== void 0 && store.autoCommit && !autoCommitStores.has(store)) {
                  store.suspendAutoCommit();
                  autoCommitStores.add(store);
                }

                record.set(field.name, quarkValue);
              }

              for (const record of records) {
                //@ts-ignore
                record.ignoreBag = silenceCommit;
                record.endBatch(silenceCommit, true); //@ts-ignore

                record.ignoreBag = false;
              }

              if (globalThis.DEBUG) console.timeEnd('Finalize propagation'); // Calendar expects flag to be cleared before dataReady, was mismatch with engine stub

              project.isWritingData = false;
              project.trigger('dataReady', {
                records,
                isInitialCommit
              }); // @ts-ignore

              (_project$resumeChange = project.resumeChangesTracking) === null || _project$resumeChange === void 0 ? void 0 : _project$resumeChange.call(project, silenceCommit);
              autoCommitStores.forEach(store => store.resumeAutoCommit()); // clear all changes of the first graph commit

              if (silenceCommit) {
                project.eventStore.acceptChanges();
                project.dependencyStore.acceptChanges();
                project.resourceStore.acceptChanges();
                project.assignmentStore.acceptChanges();
                project.calendarManagerStore.acceptChanges();
              }
            } // transaction rejected
            else {
              project.trigger('commitRejected', {
                isInitialCommit,
                transactionResult,
                silenceCommit
              });
              project.isWritingData = false;
            }

            project.trigger('commitFinalized', {
              isInitialCommit,
              transactionResult
            });
          }

          resolve();
        }, 0);
      });
    }

    *onComputationCycleHandler(cycle) {
      if (this.onComputationCycle === 'effect') {
        const effect = this.project.cycleEffectClass.new({
          cycle
        });

        if ((yield effect) === EffectResolutionResult.Cancel) {
          yield Reject(effect);
        }
      } else {
        return yield* super.onComputationCycleHandler(cycle);
      }
    }

    async [CycleSymbol](effect, transaction) {
      // delegate to project
      return this.project.onCycleSchedulingIssue(effect, transaction);
    }

    async [EmptyCalendarSymbol](effect, transaction) {
      transaction.walkContext.startNewEpoch(); // delegate to project

      return this.project.onEmptyCalendarSchedulingIssue(effect, transaction);
    }

    async [ConflictSymbol](effect, transaction) {
      transaction.walkContext.startNewEpoch(); // delegate to project

      return this.project.onConflictSchedulingIssue(effect, transaction);
    }

    [RejectSymbol](effect, transaction) {
      // on transaction rejected
      return super[RejectSymbol](effect, transaction);
    }

  }

  return EngineReplica;
}) {}
/**
 * A cycle resolution removing one of the [[getDependencies|related dependencies]].
 * The dependency instance should be passed to [[resolve]] method:
 *
 * ```ts
 * // this call will remove dependencyRecord
 * removalResolution.resolve(dependencyRecord)
 * ```
 */

class RemoveDependencyCycleEffectResolution extends Localizable(SchedulingIssueEffectResolution) {
  static get $name() {
    return 'RemoveDependencyCycleEffectResolution';
  }

  getDescription() {
    return this.L('L{descriptionTpl}');
  }

  resolve(dependency) {
    dependency.remove();
  }

}
/**
 * Class providing a human readable localized description ofr a [[CycleEffect]] instance.
 */

class CycleEffectDescription extends Localizable(Base$1) {
  static get $name() {
    return 'CycleEffectDescription';
  }

  static getDescription(effect) {
    return format(this.L('L{descriptionTpl}'), this.getShortDescription(effect));
  }

  static getShortDescription(effect) {
    const events = effect.getEvents().slice();
    events.push(events[0]);
    return '"' + events.map(event => event.name || '#' + event.id).join('" -> "') + '"';
  }

}
/**
 * Class implementing a special effect signalizing of a computation cycle.
 * The class suggests the only [[getResolutions|resolution]] option - removing one of the
 * [[getDependencies|related dependencies]].
 */

class CycleEffect extends SchedulingIssueEffect {
  constructor() {
    super(...arguments);
    this.handler = CycleSymbol;
  }
  /**
   * Returns list of events building the cycle.
   */

  getEvents() {
    if (!this._events) {
      const result = new Set();
      this.cycle.cycle.forEach(({
        context
      }) => result.add(context));
      this._events = [...result];
    }

    return this._events;
  }

  matchDependencyBySourceAndTargetEvent(dependency, from, to) {
    return dependency.fromEvent === from && dependency.toEvent === to;
  }

  getDependencyForSourceAndTargetEvents(from, to) {
    const events = this.getEvents();
    const project = events[0].project;
    const dependencyStore = project.getDependencyStore();
    return dependencyStore.find(dependency => this.matchDependencyBySourceAndTargetEvent(dependency, from, to));
  }
  /**
   * Returns list of dependencies building the cycle.
   */

  getDependencies() {
    if (!this._dependencies) {
      const result = new Set();
      const events = this.getEvents();
      const numberOfEvents = events.length;
      let prevEvent = events[0],
          dependency;

      if (numberOfEvents === 1) {
        if (dependency = this.getDependencyForSourceAndTargetEvents(prevEvent, prevEvent)) {
          result.add(dependency);
        }
      } else {
        for (const event1 of events) {
          for (const event2 of events) {
            if (dependency = this.getDependencyForSourceAndTargetEvents(event1, event2)) {
              result.add(dependency);
            }

            if (dependency = this.getDependencyForSourceAndTargetEvents(event2, event1)) {
              result.add(dependency);
            }
          }
        }
      }

      this._dependencies = [...result];
    }

    return this._dependencies;
  }
  /**
   * Returns list of the cycle possible resolutions.
   *
   * The class provides a single parameterized [[RemoveDependencyCycleEffectResolution]] resolution
   * which implement removal of one of the [[getDependencies|dependencies]].
   */

  getResolutions() {
    if (!this._resolutions) {
      this._resolutions = [this.removeDependencyCycleEffectResolutionClass.new()];
    }

    return this._resolutions;
  }

}

__decorate$j([prototypeValue('cycle')], CycleEffect.prototype, "type", void 0);

__decorate$j([prototypeValue(CycleEffectDescription)], CycleEffect.prototype, "_descriptionBuilderClass", void 0);

__decorate$j([prototypeValue(RemoveDependencyCycleEffectResolution)], CycleEffect.prototype, "removeDependencyCycleEffectResolutionClass", void 0);

var __decorate$i = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Base assignment model class. It just contains references to the [[BaseEventMixin|event]] and [[BaseResourceMixin|resource]] being assigned.
 */

class BaseAssignmentMixin extends Mixin([ChronoPartOfProjectModelMixin], base => {
  base.prototype;

  class BaseAssignmentMixin extends base {}

  __decorate$i([generic_field({
    bucket: 'assigned',
    resolver: function (id) {
      return this.getEventById(id);
    },
    modelFieldConfig: {
      serialize: event => event === null || event === void 0 ? void 0 : event.id,
      isEqual: isSerializableEqual,
      persist: false
    }
  }, ModelReferenceField)], BaseAssignmentMixin.prototype, "event", void 0);

  __decorate$i([generic_field({
    bucket: 'assigned',
    resolver: function (id) {
      return this.getResourceById(id);
    },
    modelFieldConfig: {
      serialize: resource => resource === null || resource === void 0 ? void 0 : resource.id,
      isEqual: isSerializableEqual,
      persist: false
    }
  }, ModelReferenceField)], BaseAssignmentMixin.prototype, "resource", void 0); // inject "fields" getter override to apply "modelFieldConfig" to "event" & "resource" fields

  injectStaticFieldsProperty(BaseAssignmentMixin);
  return BaseAssignmentMixin;
}) {}

/**
 * A store mixin class, that represent collection of all assignments in the [[SchedulerBasicProjectMixin|project]].
 */

class ChronoAssignmentStoreMixin extends Mixin([AbstractAssignmentStoreMixin, ChronoPartOfProjectStoreMixin], base => {
  base.prototype;

  class ChronoAssignmentStoreMixin extends base {
    static get defaultConfig() {
      return {
        modelClass: BaseAssignmentMixin
      };
    }

    set data(value) {
      this.allAssignmentsForRemoval = true;
      super.data = value;
      this.allAssignmentsForRemoval = false;
    }

  }

  return ChronoAssignmentStoreMixin;
}) {}

/**
 * A store mixin class, that represent collection of all calendars in the [[SchedulerBasicProjectMixin|project]].
 */

class ChronoCalendarManagerStoreMixin extends Mixin([AbstractCalendarManagerStoreMixin, ChronoPartOfProjectStoreMixin], base => {
  base.prototype;

  class ChronoCalendarManagerStoreMixin extends base {
    static get defaultConfig() {
      return {
        tree: true,
        modelClass: BaseCalendarMixin
      };
    }

  }

  return ChronoCalendarManagerStoreMixin;
}) {}

/**
 * A store mixin class, that represent collection of all dependencies in the [[SchedulerBasicProjectMixin|project]].
 */

class ChronoDependencyStoreMixin extends Mixin([AbstractDependencyStoreMixin, ChronoPartOfProjectStoreMixin], base => {
  base.prototype;

  class ChronoDependencyStoreMixin extends base {
    set data(value) {
      this.allDependenciesForRemoval = true;
      super.data = value;
      this.allDependenciesForRemoval = false;
    }

  }

  return ChronoDependencyStoreMixin;
}) {}

var Instruction;

(function (Instruction) {
  Instruction["KeepDuration"] = "KeepDuration";
  Instruction["KeepStartDate"] = "KeepStartDate";
  Instruction["KeepEndDate"] = "KeepEndDate";
})(Instruction || (Instruction = {})); //---------------------------------------------------------------------------------------------------------------------

const StartDateVar = Symbol('StartDate');
const EndDateVar = Symbol('EndDate');
const DurationVar = Symbol('Duration'); //---------------------------------------------------------------------------------------------------------------------

const startDateFormula = Formula.new({
  output: StartDateVar,
  inputs: new Set([DurationVar, EndDateVar])
});
const endDateFormula = Formula.new({
  output: EndDateVar,
  inputs: new Set([DurationVar, StartDateVar])
});
const durationFormula = Formula.new({
  output: DurationVar,
  inputs: new Set([StartDateVar, EndDateVar])
}); //---------------------------------------------------------------------------------------------------------------------

const SEDGraphDescription = CycleDescription.new({
  variables: new Set([StartDateVar, EndDateVar, DurationVar]),
  formulas: new Set([startDateFormula, endDateFormula, durationFormula])
});
const SEDForwardCycleResolutionContext = CycleResolution.new({
  description: SEDGraphDescription,
  defaultResolutionFormulas: new Set([endDateFormula])
});
const SEDBackwardCycleResolutionContext = CycleResolution.new({
  description: SEDGraphDescription,
  defaultResolutionFormulas: new Set([startDateFormula])
}); //---------------------------------------------------------------------------------------------------------------------

class SEDDispatcher extends CycleResolutionInputChrono {
  addInstruction(instruction) {
    if (instruction === Instruction.KeepStartDate) this.addKeepIfPossibleFlag(StartDateVar);
    if (instruction === Instruction.KeepEndDate) this.addKeepIfPossibleFlag(EndDateVar);
    if (instruction === Instruction.KeepDuration) this.addKeepIfPossibleFlag(DurationVar);
  }

} //---------------------------------------------------------------------------------------------------------------------

class SEDDispatcherIdentifier extends FieldIdentifier.mix(CalculatedValueGen) {
  equality(v1, v2) {
    const resolution1 = v1.resolution;
    const resolution2 = v2.resolution;
    return resolution1.get(StartDateVar) === resolution2.get(StartDateVar) && resolution1.get(EndDateVar) === resolution2.get(EndDateVar) && resolution1.get(DurationVar) === resolution2.get(DurationVar);
  }

}

var __decorate$h = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * This mixin provides the calendar to any [[ChronoPartOfProjectModelMixin]] it is mixed in.
 *
 * If user provides no calendar, the calendar is taken from the project.
 */

class HasCalendarMixin extends Mixin([ChronoPartOfProjectModelMixin], base => {
  base.prototype;

  class HasCalendarMixin extends base {
    writeCalendar(me, transaction, quark, calendar) {
      const calendarManagerStore = this.getCalendarManagerStore();
      const cal = calendar; // add calendar to the calendar manager - if the calendar is not there yet

      if (calendar && calendarManagerStore && calendar instanceof BaseCalendarMixin && !calendarManagerStore.includes(cal)) {
        calendarManagerStore.add(calendar);
      }

      me.constructor.prototype.write.call(this, me, transaction, quark, calendar);
    }

    resolveCalendar(locator) {
      var _this$getCalendarMana;

      return (_this$getCalendarMana = this.getCalendarManagerStore()) === null || _this$getCalendarMana === void 0 ? void 0 : _this$getCalendarMana.getById(locator);
    }
    /**
     * Calculation method of the [[effectiveCalendar]]. Takes the calendar from the project, if not provided to the entity explicitly.
     */

    *calculateEffectiveCalendar() {
      let calendar = yield this.$.calendar;

      if (!calendar) {
        const project = this.getProject();
        calendar = yield project.$.effectiveCalendar;
      } // this will create an incoming edge from the calendar's version atom, which changes on calendar's data update

      yield calendar.$.version;
      return calendar;
    }

  }

  __decorate$h([field({
    equality: () => false
  })], HasCalendarMixin.prototype, "effectiveCalendar", void 0);

  __decorate$h([generic_field({
    modelFieldConfig: {
      persist: true,
      serialize: calendar => calendar === null || calendar === void 0 ? void 0 : calendar.id,
      isEqual: isSerializableEqual
    },
    resolver: function (locator) {
      return this.resolveCalendar(locator);
    },
    sync: true
  }, ModelReferenceField)], HasCalendarMixin.prototype, "calendar", void 0);

  __decorate$h([write('calendar')], HasCalendarMixin.prototype, "writeCalendar", null);

  __decorate$h([calculate('effectiveCalendar')], HasCalendarMixin.prototype, "calculateEffectiveCalendar", null); // inject "fields" getter override to apply "modelFieldConfig" to "event" & "resource" fields

  injectStaticFieldsProperty(HasCalendarMixin);
  return HasCalendarMixin;
}) {} // TODO handle the calendars deletion

/**
 * This mixin provides the consuming class with the [[combineCalendars]] method, which can combine several calendars.
 */

class CanCombineCalendarsMixin extends Mixin([], base => {
  base.prototype;

  class CanCombineCalendars extends base {
    constructor() {
      super(...arguments);
      this.combinedcalendarscache = new Map();
    }
    /**
     * Combines an array of calendars into a single [[CalendarCacheMultiple]], which provides an API similar (but not exactly the same) to [[BaseCalendarMixin]]
     *
     * @param calendars
     */

    combineCalendars(calendars) {
      const uniqueOnly = stripDuplicates(calendars);
      if (uniqueOnly.length === 0) throw new Error("No calendars to combine");
      uniqueOnly.sort((calendar1, calendar2) => {
        if (calendar1.internalId < calendar2.internalId) return -1;else return 1;
      });
      const hash = uniqueOnly.map(calendar => calendar.internalId + '/').join('');
      const versionsHash = uniqueOnly.map(calendar => calendar.version + '/').join('');
      const cached = this.combinedcalendarscache.get(hash);
      let res;
      if (cached && cached.versionsHash === versionsHash) res = cached.cache;else {
        res = new CalendarCacheMultiple({
          calendarCaches: uniqueOnly.map(calendar => calendar.calendarCache)
        });
        this.combinedcalendarscache.set(hash, {
          versionsHash: versionsHash,
          cache: res
        });
      }
      return res;
    }

  }

  return CanCombineCalendars;
}) {}

var __decorate$g = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * Base event entity mixin type.
 *
 * At this level event is only aware about its calendar (which is inherited from project, if not provided).
 * The functionality, related to the dependencies, constraints etc is provided in other mixins.
 *
 * A time interval will be "counted" into the event duration, only if the event's calendar has that interval
 * as working. Otherwise the time is skipped and not counted into event's duration.
 *
 */

class BaseEventMixin extends Mixin([HasCalendarMixin], base => {
  base.prototype;

  class BaseEventMixin extends base {
    *calculateDispatcher(YIELD) {
      // this value is not used directly, but it contains a default cycle resolution
      // if we calculate different resolution, dispatcher will be marked dirty
      // on next revision
      yield ProposedOrPrevious;
      const cycleDispatcher = yield* this.prepareDispatcher(YIELD); //--------------

      const startDateProposedArgs = yield ProposedArgumentsOf(this.$.startDate);
      const startInstruction = startDateProposedArgs ? startDateProposedArgs[0] ? Instruction.KeepDuration : Instruction.KeepEndDate : undefined;
      if (startInstruction) cycleDispatcher.addInstruction(startInstruction); //--------------

      const endDateProposedArgs = yield ProposedArgumentsOf(this.$.endDate);
      const endInstruction = endDateProposedArgs ? endDateProposedArgs[0] ? Instruction.KeepDuration : Instruction.KeepStartDate : undefined;
      if (endInstruction) cycleDispatcher.addInstruction(endInstruction); //--------------

      const directionValue = yield this.$.direction;
      const durationProposedArgs = yield ProposedArgumentsOf(this.$.duration);
      let durationInstruction;

      if (durationProposedArgs) {
        switch (durationProposedArgs[0]) {
          case true:
            durationInstruction = Instruction.KeepStartDate;
            break;

          case false:
            durationInstruction = Instruction.KeepEndDate;
            break;
        }
      }

      if (!durationInstruction && cycleDispatcher.hasProposedValue(DurationVar)) {
        durationInstruction = directionValue === Direction.Forward || directionValue === Direction.None ? Instruction.KeepStartDate : Instruction.KeepEndDate;
      }

      if (durationInstruction) cycleDispatcher.addInstruction(durationInstruction);
      return cycleDispatcher;
    }

    *prepareDispatcher(Y) {
      const dispatcherClass = this.dispatcherClass(Y);
      const cycleDispatcher = dispatcherClass.new({
        context: this.cycleResolutionContext(Y)
      });
      cycleDispatcher.collectInfo(Y, this.$.startDate, StartDateVar);
      cycleDispatcher.collectInfo(Y, this.$.endDate, EndDateVar);
      cycleDispatcher.collectInfo(Y, this.$.duration, DurationVar);
      return cycleDispatcher;
    }

    cycleResolutionContext(Y) {
      const direction = Y(this.$.direction);
      return direction === Direction.Forward || direction === Direction.None ? SEDForwardCycleResolutionContext : SEDBackwardCycleResolutionContext;
    }

    dispatcherClass(Y) {
      return SEDDispatcher;
    }

    buildProposedDispatcher(me, quark, transaction) {
      const dispatcher = this.dispatcherClass(transaction.onEffectSync).new({
        context: this.cycleResolutionContext(transaction.onEffectSync)
      });
      dispatcher.addPreviousValueFlag(StartDateVar);
      dispatcher.addPreviousValueFlag(EndDateVar);
      dispatcher.addPreviousValueFlag(DurationVar);
      return dispatcher;
    }
    /**
     * The method skips the event non working time starting from the provided `date` and
     * going either _forward_ or _backward_ in time.
     * It uses the event [[effectiveCalendar|effective calendar]] to detect which time is not working.
     * @param date Date to start skipping from
     * @param isForward Skip direction (`true` to go forward in time, `false` - backwards)
     */

    *skipNonWorkingTime(date, isForward) {
      const calendar = yield this.$.effectiveCalendar;
      if (!date) return null;
      const skippingRes = calendar.skipNonWorkingTime(date, isForward);

      if (skippingRes instanceof Date) {
        return skippingRes;
      } else {
        const effect = EmptyCalendarEffect.new({
          calendars: [calendar],
          event: this,
          date,
          isForward
        });

        if ((yield effect) === EffectResolutionResult.Cancel) {
          yield Reject(effect);
        } else {
          return null;
        }
      }
    }
    /**
     * The method skips the provided amount of the event _working time_
     * starting from the `date` and going either _forward_ or _backward_ in time.
     * It uses the event [[effectiveCalendar|effective calendar]] to detect which time is not working.
     * @param date Date to start skipping from
     * @param isForward Skip direction (`true` to go forward in time, `false` - backwards)
     * @param duration Amount of working time to skip
     * @param unit Units the `duration` value in (if not provided then duration is considered provided in [[durationUnit]])
     */

    *skipWorkingTime(date, isForward, duration, unit) {
      const durationUnit = yield this.$.durationUnit; // Convert duration to duration unit if needed

      if (unit && unit !== durationUnit) {
        duration = yield* this.getProject().$convertDuration(duration, unit, durationUnit);
      }

      return yield* this.calculateProjectedXDateWithDuration(date, isForward, duration);
    } // copied generated method, to avoid compilation error when it is overridden in HasDateConstraintMixin

    /**
     * Sets the event [[startDate|start date]]
     *
     * @param date The new start date to set
     * @param keepDuration Whether the intention is to keep the `duration` field (`keepDuration = true`) or `endDate` (`keepDuration = false`)
     */

    setStartDate(date, keepDuration = true) {
      const {
        graph,
        project
      } = this;

      if (graph) {
        graph.write(this.$.startDate, date, keepDuration);
        return graph.commitAsync();
      } else {
        this.$.startDate.DATA = date; // Possibly about to enter replica, wait for that

        return project === null || project === void 0 ? void 0 : project.delayedCalculationPromise;
      }
    }

    writeStartDate(me, transaction, quark, date, keepDuration = true) {
      // we use the approach, that when user sets some atom to `null`
      // that `null` is propagated as a normal valid value through all calculation formulas
      // turning the result of all calculations to `null`
      // this works well, except the initial data load case, when don't want to do such propagation
      // but instead wants to "normalize" the data
      // because of that we ignore the `null` writes, for the initial data load case
      if (!transaction.baseRevision.hasIdentifier(me) && date == null) return;
      keepDuration ? Instruction.KeepDuration : Instruction.KeepEndDate;
      me.constructor.prototype.write.call(this, me, transaction, quark, date, keepDuration);
    }
    /**
     * The main calculation method for the [[startDate]] field. Delegates to either [[calculateStartDateProposed]]
     * or [[calculateStartDatePure]], depending on the information from [[dispatcher]]
     */

    *calculateStartDate() {
      const dispatch = yield this.$.dispatcher;
      const formulaId = dispatch.resolution.get(StartDateVar);

      if (formulaId === CalculateProposed) {
        return yield* this.calculateStartDateProposed();
      } else if (formulaId === startDateFormula.formulaId) {
        return yield* this.calculateStartDatePure();
      } else {
        throw new Error("Unknown formula for `startDate`");
      }
    }
    /**
     * The "pure" calculation function of the [[startDate]] field. It should calculate the [[startDate]] as if
     * there's no user input for it and no previous value - "purely" based on the values of other fields.
     *
     * At this level it delegates to [[calculateProjectedXDateWithDuration]]
     *
     * See also [[calculateStartDateProposed]].
     */

    *calculateStartDatePure() {
      return yield* this.calculateProjectedXDateWithDuration(yield this.$.endDate, false, yield this.$.duration);
    }
    /**
     * The "proposed" calculation function of the [[startDate]] field. It should calculate the [[startDate]] as if
     * there's a user input for it or a previous value. It can also use the values of other fields to "validate"
     * the "proposed" value.
     *
     * See also [[calculateStartDatePure]]
     */

    *calculateStartDateProposed() {
      const project = this.getProject();
      const startDate = yield ProposedOrPrevious;
      const manuallyScheduled = yield this.$.manuallyScheduled;
      return !manuallyScheduled || project.skipNonWorkingTimeWhenSchedulingManually ? yield* this.skipNonWorkingTime(startDate, true) : startDate;
    }
    /**
     * This method calculates the opposite date of the event.
     *
     * @param baseDate The base date of the event (start or end date)
     * @param isForward Boolean flag, indicating whether the given `baseDate` is start date (`true`) or end date (`false`)
     * @param duration Duration of the event, in its [[durationUnit|durationUnits]]
     */

    *calculateProjectedXDateWithDuration(baseDate, isForward, duration) {
      const durationUnit = yield this.$.durationUnit;
      const calendar = yield this.$.effectiveCalendar;
      const project = this.getProject();
      if (!baseDate || isNotNumber(duration)) return null; // calculate forward by default

      isForward = isForward === undefined ? true : isForward;

      if (isForward) {
        return calendar.calculateEndDate(baseDate, yield* project.$convertDuration(duration, durationUnit, TimeUnit.Millisecond));
      } else {
        return calendar.calculateStartDate(baseDate, yield* project.$convertDuration(duration, durationUnit, TimeUnit.Millisecond));
      }
    } // copied generated method, to specify the default value for `keepDuration`
    // and to avoid compilation error when it is overridden in HasDateConstraintMixin

    /**
     * Sets the event [[endDate|end date]].
     *
     * @param date The new end date to set
     * @param keepDuration Whether the intention is to keep the `duration` field (`keepDuration = true`) or `startDate` (`keepDuration = false`)
     */

    setEndDate(date, keepDuration = false) {
      const {
        graph,
        project
      } = this;

      if (graph) {
        graph.write(this.$.endDate, date, keepDuration);
        return graph.commitAsync();
      } else {
        this.$.endDate.DATA = date; // Possibly about to enter replica, wait for that

        return project === null || project === void 0 ? void 0 : project.delayedCalculationPromise;
      }
    }

    writeEndDate(me, transaction, quark, date, keepDuration = false) {
      if (!transaction.baseRevision.hasIdentifier(me) && date == null) return;
      me.constructor.prototype.write.call(this, me, transaction, quark, date, keepDuration); // TODO: review
      // const instruction : Instruction   = keepDuration ? Instruction.KeepDuration : Instruction.KeepStartDate
      // const dispatcher    = this.$.dispatcher as DispatcherIdentifier
    }
    /**
     * The main calculation method for the [[endDate]] field. Delegates to either [[calculateEndDateProposed]]
     * or [[calculateEndDatePure]], depending on the information from [[dispatcher]]
     */

    *calculateEndDate() {
      const dispatch = yield this.$.dispatcher;
      const formulaId = dispatch.resolution.get(EndDateVar);

      if (formulaId === CalculateProposed) {
        return yield* this.calculateEndDateProposed();
      } else if (formulaId === endDateFormula.formulaId) {
        return yield* this.calculateEndDatePure(); // the "new way" would be
        // return yield* this.calculateProjectedEndDateWithDuration(yield this.$.startDate, yield this.$.duration)
      } else {
        throw new Error("Unknown formula for `endDate`");
      }
    }
    /**
     * The "pure" calculation function of the [[endDate]] field. It should calculate the [[endDate]] as if
     * there's no user input for it and no previous value - "purely" based on the values of other fields.
     *
     * At this level it delegates to [[calculateProjectedXDateWithDuration]]
     *
     * See also [[calculateEndDateProposed]].
     */

    *calculateEndDatePure() {
      return yield* this.calculateProjectedXDateWithDuration(yield this.$.startDate, true, yield this.$.duration);
    }
    /**
     * The "proposed" calculation function of the [[endDate]] field. It should calculate the [[endDate]] as if
     * there's a user input for it or a previous value. It can also use the values of other fields to "validate"
     * the "proposed" value.
     *
     * See also [[calculateEndDatePure]]
     */

    *calculateEndDateProposed() {
      const project = this.getProject();
      const endDate = yield ProposedOrPrevious;
      const manuallyScheduled = yield this.$.manuallyScheduled;
      return !manuallyScheduled || project.skipNonWorkingTimeWhenSchedulingManually ? yield* this.skipNonWorkingTime(endDate, false) : endDate;
    } //endregion
    //region duration

    /**
     * Duration getter. Returns the duration of the event, in the given unit. If unit is not given, returns duration in [[durationUnit]].
     *
     * @param unit
     */

    getDuration(unit) {
      const duration = this.duration;
      return unit !== undefined ? this.getProject().convertDuration(duration, this.durationUnit, unit) : duration;
    }
    /**
     * Duration setter.
     *
     * @param duration The new duration to set.
     * @param unit The unit for new duration. Optional, if missing the [[durationUnit]] value will be used.
     * @param keepStart A boolean flag, indicating, whether the intention is to keep the start date (`true`) or end date (`false`)
     */

    setDuration(duration, unit, keepStart) {
      const {
        graph,
        project
      } = this;

      if (graph) {
        // Chronograph started to treat undefined as null, but we need to filter that case
        // https://github.com/bryntum/chronograph/issues/11
        if (duration !== undefined) {
          graph.write(this.$.duration, duration, unit, keepStart);
          return graph.commitAsync();
        }
      } else {
        const toSet = {
          duration
        };
        this.$.duration.DATA = duration;
        if (unit != null) toSet.durationUnit = this.$.durationUnit.DATA = unit; // Also has to make sure record data is updated in case this detached record is displayed elsewhere

        this.set(toSet); // Possibly about to enter replica, wait for that

        return project === null || project === void 0 ? void 0 : project.delayedCalculationPromise;
      }
    }

    setDurationUnit(_value) {
      throw new Error("Use `setDuration` instead");
    }

    writeDuration(me, transaction, quark, duration, unit, keepStart = undefined) {
      if (duration < 0) duration = 0;
      if (!transaction.baseRevision.hasIdentifier(me) && duration == null) return;
      me.constructor.prototype.write.call(this, me, transaction, quark, duration, keepStart);
      if (unit != null) transaction.write(this.$.durationUnit, unit);
    }
    /**
     * The main calculation method for the [[duration]] field. Delegates to either [[calculateDurationProposed]]
     * or [[calculateDurationPure]], depending on the information from [[dispatcher]]
     */

    *calculateDuration() {
      const dispatch = yield this.$.dispatcher;
      const formulaId = dispatch.resolution.get(DurationVar);

      if (formulaId === CalculateProposed) {
        return yield* this.calculateDurationProposed();
      } else if (formulaId === durationFormula.formulaId) {
        return yield* this.calculateDurationPure(); // the "new way" would be
        // return yield* this.calculateProjectedDuration(yield this.$.startDate, yield this.$.endDate)
      } else {
        throw new Error("Unknown formula for `duration`");
      }
    }
    /**
     * The "pure" calculation function of the [[duration]] field. It should calculate the [[duration]] as if
     * there's no user input for it and no previous value - "purely" based on the values of other fields.
     *
     * If start date of event is less or equal then end date (normal case) it delegates to [[calculateProjectedDuration]].
     * Otherwise duration is set to 0.
     *
     * See also [[calculateDurationProposed]].
     */

    *calculateDurationPure() {
      const startDate = yield this.$.startDate;
      const endDate = yield this.$.endDate;
      if (!startDate || !endDate) return yield ProposedOrPrevious;

      if (startDate > endDate) {
        yield Write(this.$.duration, 0, null);
      } else {
        return yield* this.calculateProjectedDuration(startDate, endDate);
      }
    }
    /**
     * The "proposed" calculation function of the [[duration]] field. It should calculate the [[duration]] as if
     * there's a user input for it or a previous value. It can also use the values of other fields to "validate"
     * the "proposed" value.
     *
     * See also [[calculateDurationPure]]
     */

    *calculateDurationProposed() {
      return yield ProposedOrPrevious;
    }
    /**
     * This method calculates the duration of the given time span, in the provided `durationUnit` or in the [[durationUnit]].
     *
     * @param startDate
     * @param endDate
     * @param durationUnit
     */

    *calculateProjectedDuration(startDate, endDate, durationUnit) {
      if (!startDate || !endDate) return null;
      if (!durationUnit) durationUnit = yield this.$.durationUnit;
      const calendar = yield this.$.effectiveCalendar;
      const project = this.getProject();
      return yield* project.$convertDuration(calendar.calculateDurationMs(startDate, endDate), TimeUnit.Millisecond, durationUnit);
    } // effective duration is either a "normal" duration, or, if the duration itself is being calculated
    // (so that yielding it will cause a cycle)
    // an "estimated" duration, calculated based on proposed/previous start/end date values

    *calculateEffectiveDuration() {
      const dispatch = yield this.$.dispatcher;
      let effectiveDurationToUse;
      const durationResolution = dispatch.resolution.get(DurationVar);

      if (durationResolution === CalculateProposed) {
        effectiveDurationToUse = yield this.$.duration;
      } else if (durationResolution === durationFormula.formulaId) {
        effectiveDurationToUse = yield* this.calculateProjectedDuration(yield ProposedOrPreviousValueOf(this.$.startDate), yield ProposedOrPreviousValueOf(this.$.endDate));
      }

      return effectiveDurationToUse;
    }

  }

  __decorate$g([model_field({
    type: 'date'
  }, {
    converter: dateConverter
  })], BaseEventMixin.prototype, "startDate", void 0);

  __decorate$g([model_field({
    type: 'date'
  }, {
    converter: dateConverter
  })], BaseEventMixin.prototype, "endDate", void 0);

  __decorate$g([model_field({
    type: 'number',
    allowNull: true
  })], BaseEventMixin.prototype, "duration", void 0);

  __decorate$g([model_field({
    type: 'string',
    defaultValue: TimeUnit.Day
  }, {
    converter: DateHelper.normalizeUnit
  })], BaseEventMixin.prototype, "durationUnit", void 0);

  __decorate$g([model_field({
    type: 'string',
    defaultValue: Direction.Forward
  }, {
    sync: true
  })], BaseEventMixin.prototype, "direction", void 0);

  __decorate$g([field({
    identifierCls: SEDDispatcherIdentifier
  })], BaseEventMixin.prototype, "dispatcher", void 0);

  __decorate$g([model_field({
    type: 'boolean',
    defaultValue: false
  })], BaseEventMixin.prototype, "manuallyScheduled", void 0);

  __decorate$g([calculate('dispatcher')], BaseEventMixin.prototype, "calculateDispatcher", null);

  __decorate$g([build_proposed('dispatcher')], BaseEventMixin.prototype, "buildProposedDispatcher", null);

  __decorate$g([write('startDate')], BaseEventMixin.prototype, "writeStartDate", null);

  __decorate$g([calculate('startDate')], BaseEventMixin.prototype, "calculateStartDate", null);

  __decorate$g([write('endDate')], BaseEventMixin.prototype, "writeEndDate", null);

  __decorate$g([calculate('endDate')], BaseEventMixin.prototype, "calculateEndDate", null);

  __decorate$g([write('duration')], BaseEventMixin.prototype, "writeDuration", null);

  __decorate$g([calculate('duration')], BaseEventMixin.prototype, "calculateDuration", null);

  return BaseEventMixin;
}) {}

var __decorate$f = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * This is a mixin, which can be applied to the [[BaseEventMixin]]. It provides the collection of all assignments,
 * which reference this event.
 *
 * Doesn't affect scheduling.
 */

class BaseHasAssignmentsMixin extends Mixin([BaseEventMixin, AbstractHasAssignmentsMixin], base => {
  base.prototype;

  class BaseHasAssignmentsMixin extends base {
    get assignments() {
      return this.assigned ? [...this.assigned] : [];
    }

  }

  __decorate$f([generic_field({}, ModelBucketField)], BaseHasAssignmentsMixin.prototype, "assigned", void 0);

  return BaseHasAssignmentsMixin;
}) {}

var __decorate$e = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * This is a mixin, providing dependencies "awareness" for the event.
 *
 * Doesn't affect scheduling.
 */

class HasDependenciesMixin extends Mixin([BaseEventMixin], base => {
  const superProto = base.prototype;

  class HasDependenciesMixin extends base {
    leaveProject() {
      const eventStore = this.getEventStore(); // if the model is in the graph so we are able to read its identifiers

      if (this.isInActiveTransaction) {
        // the buckets may be empty if a model is removed from the project immediately after adding
        // (without propagation)
        if (this.outgoingDeps) {
          this.outgoingDeps.forEach(dependency => eventStore.dependenciesForRemoval.add(dependency));
        }

        if (this.incomingDeps) {
          this.incomingDeps.forEach(dependency => eventStore.dependenciesForRemoval.add(dependency));
        }
      }

      superProto.leaveProject.call(this);
    }

  }

  __decorate$e([generic_field({}, ModelBucketField)], HasDependenciesMixin.prototype, "outgoingDeps", void 0);

  __decorate$e([generic_field({}, ModelBucketField)], HasDependenciesMixin.prototype, "incomingDeps", void 0);

  return HasDependenciesMixin;
}) {}

/**
 * This is an event class, [[SchedulerBasicProjectMixin]] is working with.
 * It is constructed as [[BaseEventMixin]], enhanced with [[BaseHasAssignmentsMixin]] and [[HasDependenciesMixin]]
 */

class SchedulerBasicEvent extends Mixin([BaseEventMixin, BaseHasAssignmentsMixin, HasDependenciesMixin], base => {
  base.prototype;

  class SchedulerBasicEvent extends base {}

  return SchedulerBasicEvent;
}) {}

/**
 * A store mixin class, that represent collection of all events in the [[SchedulerBasicProjectMixin|project]].
 */

class ChronoEventStoreMixin extends Mixin([AbstractEventStoreMixin, ChronoPartOfProjectStoreMixin], base => {
  base.prototype;

  class ChronoEventStoreMixin extends base {
    static get defaultConfig() {
      return {
        modelClass: SchedulerBasicEvent
      };
    }

    set data(value) {
      super.data = value;
      this.afterEventRemoval();
    }

  }

  return ChronoEventStoreMixin;
}) {}
/**
 * The tree store version of [[ChronoEventStoreMixin]].
 */

class ChronoEventTreeStoreMixin extends Mixin([ChronoEventStoreMixin], base => {
  base.prototype;

  class ChronoEventTreeStoreMixin extends base {
    buildRootNode() {
      return this.getProject() || {};
    }

    static get defaultConfig() {
      return {
        tree: true
      };
    }

  }

  return ChronoEventTreeStoreMixin;
}) {}

var __decorate$d = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * This is a base resource entity.
 */

class BaseResourceMixin extends Mixin([HasCalendarMixin, ChronoPartOfProjectModelMixin], base => {
  const superProto = base.prototype;

  class BaseResourceMixin extends base {
    get assignments() {
      return [...this.assigned];
    }

    leaveProject(isReplacing = false) {
      // `this.assigned` will be empty if model is added to project and then removed immediately
      // w/o any propagations
      // when replacing a resource, the assignments should be left intact
      if (this.assigned && !isReplacing) {
        const resourceStore = this.getResourceStore(); // to batch the assignments removal, we don't remove the assignments right away, but instead
        // add them for the batched removal to the `assignmentsForRemoval` property of the event store

        this.assigned.forEach(assignment => resourceStore.assignmentsForRemoval.add(assignment));
      }

      superProto.leaveProject.call(this);
    }

  }

  __decorate$d([generic_field({}, ModelBucketField)], BaseResourceMixin.prototype, "assigned", void 0);

  return BaseResourceMixin;
}) {}

/**
 * A store mixin class, that represent collection of all resources in the [[SchedulerBasicProjectMixin|project]].
 */

class ChronoResourceStoreMixin extends Mixin([AbstractResourceStoreMixin, ChronoPartOfProjectStoreMixin], base => {
  base.prototype;

  class ChronoResourceStoreMixin extends base {
    static get defaultConfig() {
      return {
        modelClass: BaseResourceMixin
      };
    }

  }

  return ChronoResourceStoreMixin;
}) {}

var __decorate$c = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * This mixin provides the duration converting functionality - the [[convertDuration]] method. It requires (inherit from) [[ChronoModelMixin]].
 */

class DurationConverterMixin extends Mixin([ChronoModelMixin], base => {
  base.prototype;

  class DurationConverterMixin extends base {
    *calculateUnitsInMs() {
      const hoursPerDay = yield this.$.hoursPerDay;
      const daysPerWeek = yield this.$.daysPerWeek;
      const daysPerMonth = yield this.$.daysPerMonth;
      return {
        millisecond: 1,
        second: 1000,
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
        day: hoursPerDay * 60 * 60 * 1000,
        week: daysPerWeek * hoursPerDay * 60 * 60 * 1000,
        month: daysPerMonth * hoursPerDay * 60 * 60 * 1000,
        quarter: 3 * daysPerMonth * hoursPerDay * 60 * 60 * 1000,
        year: 4 * 3 * daysPerMonth * hoursPerDay * 60 * 60 * 1000
      };
    }
    /**
     * Converts duration value from one time unit to another
     * @param duration Duration value
     * @param fromUnit Duration value time unit
     * @param toUnit   Target time unit to convert the value to
     */

    convertDuration(duration, fromUnit, toUnit) {
      let result = duration;

      if (fromUnit !== toUnit) {
        result = duration * this.unitsInMs[fromUnit] / this.unitsInMs[toUnit];
      }

      return result; // TODO should be just something like:
      // return this.run('$convertDuration', duration, fromUnit, toUnit)
    }

    *$convertDuration(duration, fromUnit, toUnit) {
      if (!fromUnit || !toUnit) throw new Error("Conversion unit not provided");
      const unitsInMs = yield this.$.unitsInMs;
      let result = duration;

      if (fromUnit !== toUnit) {
        result = duration * unitsInMs[fromUnit] / unitsInMs[toUnit];
      }

      return result;
    }

  }

  __decorate$c([field()], DurationConverterMixin.prototype, "unitsInMs", void 0);

  __decorate$c([model_field({
    type: 'number',
    defaultValue: 24
  })], DurationConverterMixin.prototype, "hoursPerDay", void 0);

  __decorate$c([model_field({
    type: 'number',
    defaultValue: 7
  })], DurationConverterMixin.prototype, "daysPerWeek", void 0);

  __decorate$c([model_field({
    type: 'number',
    defaultValue: 30
  })], DurationConverterMixin.prototype, "daysPerMonth", void 0);

  __decorate$c([calculate('unitsInMs')], DurationConverterMixin.prototype, "calculateUnitsInMs", null);

  return DurationConverterMixin;
}) {}

var __decorate$b = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Base dependency entity mixin type
 */

class BaseDependencyMixin extends Mixin([ChronoPartOfProjectModelMixin], base => {
  base.prototype;

  class BaseDependencyMixin extends base {}

  __decorate$b([generic_field({
    bucket: 'outgoingDeps',
    resolver: function (id) {
      return this.getEventById(id);
    },
    modelFieldConfig: {
      persist: true,
      serialize: event => event === null || event === void 0 ? void 0 : event.id,
      isEqual: isSerializableEqual
    }
  }, ModelReferenceField)], BaseDependencyMixin.prototype, "fromEvent", void 0);

  __decorate$b([generic_field({
    bucket: 'incomingDeps',
    resolver: function (id) {
      return this.getEventById(id);
    },
    modelFieldConfig: {
      persist: true,
      serialize: event => event === null || event === void 0 ? void 0 : event.id,
      isEqual: isSerializableEqual
    }
  }, ModelReferenceField)], BaseDependencyMixin.prototype, "toEvent", void 0);

  __decorate$b([model_field({
    type: 'int',
    defaultValue: DependencyType.EndToStart
  })], BaseDependencyMixin.prototype, "type", void 0);

  return BaseDependencyMixin;
}) {}

/**
 * This is an abstract project, which just lists the available stores.
 *
 * The actual project classes are [[SchedulerBasicProjectMixin]], [[SchedulerProProjectMixin]], [[GanttProjectMixin]].
 */

class ChronoAbstractProjectMixin extends Mixin([ChronoModelMixin, AbstractProjectMixin], base => {
  base.prototype;

  class ChronoAbstractProjectMixin extends base {
    // External flag, toggled late in finalization when already entered replica
    get isDelayingCalculation() {
      return Boolean(this.delayEnteringReplica || this.delayedCalculationPromise);
    }

    getGraph() {
      return this.replica;
    }

    beforeCommitAsync() {
      return null;
    }

    enterReplica(enterRecords) {} // If we are delaying calculations, return its promise which will be resolved when calculations are finished.
    // As part of that process it will commit replica

    async commitAsync() {
      var _this$replica;

      return this.delayedCalculationPromise || ((_this$replica = this.replica) === null || _this$replica === void 0 ? void 0 : _this$replica.commitAsync());
    }

    getSchedulingIssueEventArguments(schedulingIssue, transaction, resolve, reject) {
      const result = [schedulingIssue.type, {
        continueWithResolutionResult: resolve,
        schedulingIssue
      }]; // For scheduling conflict public API expects to have "conflict" property w/ the ConflictEffect instance

      if (schedulingIssue instanceof ConflictEffect) result[1].conflict = schedulingIssue;
      return result;
    }

    async onSchedulingIssueCall(schedulingIssue, transaction) {
      // is there is a "schedulingConflict" event listener we expect resolution option will be picked there
      if (schedulingIssue.type && this.hasListener(schedulingIssue.type)) {
        return new Promise((resolve, reject) => {
          this.trigger(...this.getSchedulingIssueEventArguments(schedulingIssue, transaction, resolve, reject));
        });
      } // by default we cancel the committed changes

      return EffectResolutionResult.Cancel;
    }

    async onCycleSchedulingIssue(schedulingIssue, transaction) {
      return this.onSchedulingIssueCall(schedulingIssue, transaction);
    }

    async onEmptyCalendarSchedulingIssue(schedulingIssue, transaction) {
      return this.onSchedulingIssueCall(schedulingIssue, transaction);
    }

    async onConflictSchedulingIssue(schedulingIssue, transaction) {
      return this.onSchedulingIssueCall(schedulingIssue, transaction);
    }

    setModelCalculations(model, calculations) {
      if (!calculations) return;
      const oldValues = {}; // backup current calculations

      for (const field in calculations) {
        oldValues[field] = model.prototype.$calculations[field];
      } // Patch model prototype settings

      Object.assign(model.prototype.$calculations, calculations);
      return oldValues;
    }

    setRecordCalculations(record, calculations) {
      const oldValues = this.setModelCalculations(record.constructor, calculations);
      const skeleton = record.$entity.$skeleton;
      Object.keys(calculations).forEach(field => {
        skeleton[field].prototype.calculation = record[calculations[field]];
      });
      return oldValues;
    }

    setStoreCalculations(store, calculations) {
      if (!calculations) return; // Rebuild corresponding identifiers

      const record = store.first;

      if (record) {
        return this.setRecordCalculations(record, calculations);
      } else {
        return this.setModelCalculations(store.modelClass, calculations);
      }
    }
    /**
     * Overrides the project owned store identifiers calculation.
     * @param calculations Object providing new identifier calculation function names.
     * The object is grouped by store identifiers. For example below code
     * overrides event `startDate`, `endDate` and `duration` calculation so
     * the fields will always simply return their current values:
     *
     * ```ts
     * // event startDate, endDate and duration will use their userProvidedValue method
     * // which simply returns their current values as-is
     * const oldCalculations = await project.setCalculations({
     *     events : {
     *         startDate : "userProvidedValue",
     *         endDate   : "userProvidedValue",
     *         duration  : "userProvidedValue"
     *     }
     * })
     * ```
     * @returns Promise that resolves with an object having the overridden calculations.
     * The object can be used to toggle the calculations back in the future:
     * ```ts
     * // override event duration calculation
     * const oldCalculations = await project.setCalculations({
     *     events : {
     *         duration  : "userProvidedValue"
     *     }
     * })
     * // revert the duration calculation back
     * project.setCalculations(oldCalculations)
     * ```
     */

    async setCalculations(calculations) {
      // Graph might not be created if using delayed calculations
      this.replica && (await this.commitAsync());
      const oldCalculations = {};
      const stores = {
        tasks: this.eventStore,
        events: this.eventStore,
        dependencies: this.dependencyStore,
        resources: this.resourceStore,
        assignments: this.assignmentStore,
        calendars: this.calendarManagerStore
      };
      Object.keys(stores).forEach(id => {
        // Apply calculation change to every owned store
        if (calculations[id]) {
          oldCalculations[id] = this.setStoreCalculations(stores[id], calculations[id]);
        }
      }); // Apply calculation changes to the project af provided

      let projectCalculations = calculations.project;

      if (projectCalculations) {
        oldCalculations.project = this.setRecordCalculations(this, projectCalculations);
      } // Repopulate replica w/ updated identifiers
      //@ts-ignore

      this.replica && this.repopulateReplica.now();
      this.replica && (await this.commitAsync()); // return previous calculation settings

      return oldCalculations;
    }

  }

  return ChronoAbstractProjectMixin;
}) {}

// it can also be defined as "HasChildrenOnly" - ie has child events, but does not have parent (not part of the tree structure)
// then the `HasChildrenMixin` would be `HasParent`

/**
 * This mixin provides the notion of "sub events" for the [[BaseEventMixin]], which is a bit more general concept
 * of the "child" events. This special notion is required, because the event store can be a flat store, not providing
 * any tree structuring. In the same time, we treat the project instance as a "parent" event for all events in the flat
 * event store - so it accumulates the same aggregation information as other "regular" parent events.
 *
 * The event with this mixin is scheduled according to the "sub events" information - it starts at the earliest date
 * among all sub events and ends at the latest. If there's no "sub events" - it delegates to previous behaviour.
 *
 * Scheduling by children can be disabled by setting [[manuallyScheduled]] flag to `true` which will
 * result [[startDate]] and [[endDate]] fields will keep their provided values.
 */

class HasSubEventsMixin extends Mixin([BaseEventMixin], base => {
  const superProto = base.prototype;

  class HasSubEventsMixin extends base {
    /**
     * The abstract method which should indicate whether this event has sub events
     */
    *hasSubEvents() {
      throw new Error("Abstract method `hasSubEvents` has been called");
    }
    /**
     * The abstract method which should return an Iterable of [[BaseEventMixin]]
     */

    *subEventsIterable() {
      throw new Error("Abstract method `subEventsIterable` has been called");
    }

    *calculateStartDatePure() {
      const manuallyScheduled = yield this.$.manuallyScheduled;
      const hasSubEvents = yield* this.hasSubEvents();

      if (!manuallyScheduled && hasSubEvents) {
        return yield* this.calculateMinChildrenStartDate();
      } else {
        return yield* superProto.calculateStartDatePure.call(this);
      }
    }

    *calculateEndDatePure() {
      const manuallyScheduled = yield this.$.manuallyScheduled;
      const hasSubEvents = yield* this.hasSubEvents();

      if (!manuallyScheduled && hasSubEvents) {
        return yield* this.calculateMaxChildrenEndDate();
      } else {
        return yield* superProto.calculateEndDatePure.call(this);
      }
    }

    *calculateStartDateProposed() {
      const manuallyScheduled = yield this.$.manuallyScheduled;
      const hasSubEvents = yield* this.hasSubEvents();

      if (!manuallyScheduled && hasSubEvents) {
        return yield* this.calculateStartDatePure();
      } else {
        return yield* superProto.calculateStartDateProposed.call(this);
      }
    }

    *calculateEndDateProposed() {
      const manuallyScheduled = yield this.$.manuallyScheduled;
      const hasSubEvents = yield* this.hasSubEvents();

      if (!manuallyScheduled && hasSubEvents) {
        return yield* this.calculateEndDatePure();
      } else {
        return yield* superProto.calculateEndDateProposed.call(this);
      }
    }

    *calculateDurationProposed() {
      const manuallyScheduled = yield this.$.manuallyScheduled;
      const hasSubEvents = yield* this.hasSubEvents();

      if (!manuallyScheduled && hasSubEvents) {
        return yield* this.calculateDurationPure();
      } else {
        return yield* superProto.calculateDurationProposed.call(this);
      }
    }
    /**
     * The method defines wether the provided child event should be
     * taken into account when calculating this summary event [[startDate]].
     * Child events roll up their [[startDate]] values to their summary tasks.
     * So a summary task [[startDate|start]] date gets equal to
     * its minimal child [[startDate|start]].
     *
     * If the method returns `true` the child event is taken into account
     * and if the method returns `false` it's not.
     * By default the method returns `true` to include all child events data.
     * @param childEvent Child event to consider.
     * @returns `true` if the provided event should be taken into account, `false` if not.
     */

    *shouldRollupChildStartDate(child) {
      return true;
    }
    /**
     * Calculates the minimal sub-events [[startDate]].
     * The method is used for calculating the event [[startDate]].
     */

    *calculateMinChildrenStartDate() {
      const children = yield* this.subEventsIterable();
      let timestamp = MAX_DATE.getTime();

      for (const child of children) {
        if (yield* this.shouldRollupChildStartDate(child)) {
          let date = yield child.$.startDate; // if the child has endDate only - use that value

          if (!date) {
            date = yield child.$.endDate;
          }

          if (date && date.getTime() < timestamp) {
            timestamp = date.getTime();
          }
        }
      }

      if (timestamp === MIN_DATE.getTime() || timestamp === MAX_DATE.getTime()) return null;
      return new Date(timestamp);
    }
    /**
     * The method defines wether the provided child event should be
     * taken into account when calculating this summary event [[endDate]].
     * Child events roll up their [[endDate]] values to their summary tasks.
     * So a summary task [[endDate|end]] gets equal to its maximal child [[endDate|end]].
     *
     * If the method returns `true` the child event is taken into account
     * and if the method returns `false` it's not.
     * By default the method returns `true` to include all child events data.
     * @param childEvent Child event to consider.
     * @returns `true` if the provided event should be taken into account, `false` if not.
     */

    *shouldRollupChildEndDate(child) {
      return true;
    }
    /**
     * Calculates the maximum sub-events [[endDate]].
     * The method is used for calculating the event [[endDate]].
     */

    *calculateMaxChildrenEndDate() {
      const children = yield* this.subEventsIterable();
      let timestamp = MIN_DATE.getTime();

      for (const child of children) {
        if (yield* this.shouldRollupChildEndDate(child)) {
          let date = yield child.$.endDate;

          if (!date) {
            date = yield child.$.startDate;
          }

          if (date && date.getTime() > timestamp) {
            timestamp = date.getTime();
          }
        }
      }

      if (timestamp === MIN_DATE.getTime() || timestamp === MAX_DATE.getTime()) return null;
      return new Date(timestamp);
    }

  }

  return HasSubEventsMixin;
}) {}

var __decorate$a = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Specialized version of the [[HasSubEventsMixin]]. The event becomes part of the tree structure.
 * It now has reference to the [[parentEvent]] and a collection of [[childEvents]].
 *
 * The abstract methods from the [[HasSubEventsMixin]] are defined to operate on the [[childEvents]] collection.
 */

class HasChildrenMixin extends Mixin([HasSubEventsMixin], base => {
  base.prototype;

  class HasChildrenMixin extends base {
    /**
     * Returns `true` if the event has nested sub-events.
     */
    *hasSubEvents() {
      const childEvents = yield this.$.childEvents;
      return childEvents.size > 0;
    }
    /**
     * Returns iterable object listing the event nested sub-events.
     * ```ts
     * const subEventsIterator : Iterable<HasChildrenMixin> = yield* event.subEventsIterable()
     *
     * for (let childEvent of subEventsIterator) {
     *     // ..do something..
     * }
     * ```
     */

    *subEventsIterable() {
      return yield this.$.childEvents;
    }

    get parent() {
      return this._parent;
    }

    set parent(value) {
      this._parent = value;
      this.parentEvent = value;
    }

  }

  __decorate$a([reference({
    bucket: 'childEvents'
  })], HasChildrenMixin.prototype, "parentEvent", void 0);

  __decorate$a([bucket()], HasChildrenMixin.prototype, "childEvents", void 0);

  return HasChildrenMixin;
}) {}

var __decorate$9 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Basic Scheduler project mixin type. At this level, events have assignments and dependencies, which both are, however,
 * only visual and do not affect the scheduling.
 */

class SchedulerBasicProjectMixin extends MixinAny([ChronoAbstractProjectMixin, BaseEventMixin, HasSubEventsMixin, HasCalendarMixin, DurationConverterMixin, CanCombineCalendarsMixin], base => {
  const superProto = base.prototype;

  class SchedulerBasicProjectMixin extends base {
    construct(config = {}) {
      this.delayCalculation = config.delayCalculation !== false;
      this.enableProgressNotifications = config.enableProgressNotifications || config.delayCalculation !== false; // Expand project by default to make getRange to work

      if (!('expanded' in config)) {
        // @ts-ignore
        config.expanded = true;
      }

      if (this.delayCalculation) {
        this.delayEnteringReplica = true;
      }

      if (!('skipNonWorkingTimeWhenSchedulingManually' in config)) {
        config.skipNonWorkingTimeWhenSchedulingManually = false;
      }

      superProto.construct.call(this, config);
      this.repopulateStores = new Set();
      this.ignoreInitialCommitComputationCycles = 'ignoreInitialCommitComputationCycles' in config ? config.ignoreInitialCommitComputationCycles : false;

      if (this.ignoreInitialCommitComputationCycles) {
        console.warn('Project "ignoreInitialCommitComputationCycles" option is deprecated and will be dropped in the next major release');
      }

      if (!this.eventModelClass) this.eventModelClass = this.getDefaultEventModelClass();
      if (!this.eventStoreClass) this.eventStoreClass = this.getDefaultEventStoreClass();
      if (!this.dependencyModelClass) this.dependencyModelClass = this.getDefaultDependencyModelClass();
      if (!this.dependencyStoreClass) this.dependencyStoreClass = this.getDefaultDependencyStoreClass();
      if (!this.resourceModelClass) this.resourceModelClass = this.getDefaultResourceModelClass();
      if (!this.resourceStoreClass) this.resourceStoreClass = this.getDefaultResourceStoreClass();
      if (!this.assignmentModelClass) this.assignmentModelClass = this.getDefaultAssignmentModelClass();
      if (!this.assignmentStoreClass) this.assignmentStoreClass = this.getDefaultAssignmentStoreClass();
      if (!this.calendarModelClass) this.calendarModelClass = this.getDefaultCalendarModelClass();
      if (!this.calendarManagerStoreClass) this.calendarManagerStoreClass = this.getDefaultCalendarManagerStoreClass();
      if (!this.cycleEffectClass) this.cycleEffectClass = this.getDefaultCycleEffectClass();
      this.initializeStm();
      if (!this.delayEnteringReplica) this.enterReplica(false);
      this.setCalendarManagerStore(this.calendarManagerStore);
      this.setEventStore(this.eventStore);
      this.setDependencyStore(this.dependencyStore);
      this.setResourceStore(this.resourceStore);
      this.setAssignmentStore(this.assignmentStore);
      const hasInlineData = Boolean(this.calendarsData || this.eventsData || this.dependenciesData || this.resourcesData || this.assignmentsData);

      if (hasInlineData) {
        this.loadInlineData({
          calendarsData: this.calendarsData,
          eventsData: this.eventsData,
          dependenciesData: this.dependenciesData,
          resourcesData: this.resourcesData,
          assignmentsData: this.assignmentsData
        });
        delete this.calendarsData;
        delete this.eventsData;
        delete this.dependenciesData;
        delete this.resourcesData;
        delete this.assignmentsData;
      }
    }

    enterReplica(enterRecords) {
      const me = this;

      if (!me.replica) {
        me.replica = me.createReplica();
        me.replica.addEntity(me); // not part of the CalendarManagerStore intentionally, not persisted

        me.defaultCalendar = new me.calendarModelClass({
          unspecifiedTimeIsWorking: me.unspecifiedTimeIsWorking
        });
        me.defaultCalendar.project = me;
        me.replica.addEntity(me.defaultCalendar);
        me.trigger('graphReady');
      } // In delayCalculation mode no records entered the graph on construction,
      // instead we enter them now after first draw

      if (enterRecords && !me.isRepopulatingStores) {
        // Only enter "new" records, we are called when records are added later on
        me.calendarManagerStore.forEach(r => {
          !r.graph && r.joinProject();
        }, undefined, {
          includeFilteredOutRecords: true
        });
        me.eventStore.forEach(r => {
          !r.graph && r.joinProject();
        }, undefined, {
          includeFilteredOutRecords: true
        });
        me.resourceStore.forEach(r => {
          !r.graph && r.joinProject();
        }, undefined, {
          includeFilteredOutRecords: true
        });
        me.dependencyStore.forEach(r => {
          !r.graph && r.joinProject();
        }, undefined, {
          includeFilteredOutRecords: true
        });
        me.assignmentStore.forEach(r => {
          !r.graph && r.joinProject();
        }, undefined, {
          includeFilteredOutRecords: true
        });
      }
    }

    resetStmQueue() {
      const wasDisabled = this.stm.disabled;
      this.stm.disable();
      this.stm.resetQueue();

      if (!wasDisabled) {
        this.stm.enable();
      }
    }

    doDestroy() {
      var _me$eventStore, _me$dependencyStore, _me$assignmentStore, _me$resourceStore, _me$calendarManagerSt, _me$defaultCalendar, _me$replica, _me$stm;

      const me = this;
      (_me$eventStore = me.eventStore) === null || _me$eventStore === void 0 ? void 0 : _me$eventStore.destroy();
      (_me$dependencyStore = me.dependencyStore) === null || _me$dependencyStore === void 0 ? void 0 : _me$dependencyStore.destroy();
      (_me$assignmentStore = me.assignmentStore) === null || _me$assignmentStore === void 0 ? void 0 : _me$assignmentStore.destroy();
      (_me$resourceStore = me.resourceStore) === null || _me$resourceStore === void 0 ? void 0 : _me$resourceStore.destroy();
      (_me$calendarManagerSt = me.calendarManagerStore) === null || _me$calendarManagerSt === void 0 ? void 0 : _me$calendarManagerSt.destroy();
      (_me$defaultCalendar = me.defaultCalendar) === null || _me$defaultCalendar === void 0 ? void 0 : _me$defaultCalendar.destroy();
      (_me$replica = me.replica) === null || _me$replica === void 0 ? void 0 : _me$replica.clear();
      (_me$stm = me.stm) === null || _me$stm === void 0 ? void 0 : _me$stm.destroy();
      superProto.doDestroy.call(this);
    }

    getReplicaConfig() {
      return {
        project: this,
        schema: Schema.new(),
        enableProgressNotifications: this.enableProgressNotifications,
        silenceInitialCommit: this.silenceInitialCommit,
        ignoreInitialCommitComputationCycles: this.ignoreInitialCommitComputationCycles,
        cycleEffectClass: this.cycleEffectClass,
        onWriteDuringCommit: 'ignore',
        readMode: ReadMode.CurrentOrProposedOrPrevious
      };
    } // Creates a new Replica, used during construction and when repopulating

    createReplica() {
      return EngineReplica.mix(Replica).new(this.getReplicaConfig());
    }

    *hasSubEvents() {
      return this.getEventStore().count > 0;
    }

    *subEventsIterable() {
      return this.getEventStore().getRange();
    }

    getType() {
      return ProjectType.SchedulerBasic;
    }

    get enableProgressNotifications() {
      return this._enableProgressNotifications;
    }
    /**
     * Enables/disables the calculation progress notifications.
     */

    set enableProgressNotifications(value) {
      this._enableProgressNotifications = value;
      if (this.replica) this.replica.enableProgressNotifications = value;
    }

    getDefaultCycleEffectClass() {
      return CycleEffect;
    }
    /**
     * Returns the default event model class to use
     */

    getDefaultEventModelClass() {
      return SchedulerBasicEvent;
    }
    /**
     * Returns the default event store class to use
     */

    getDefaultEventStoreClass() {
      return ChronoEventStoreMixin;
    }
    /**
     * Returns the default dependency model class to use
     */

    getDefaultDependencyModelClass() {
      return BaseDependencyMixin;
    }
    /**
     * Returns the default dependency store class to use
     */

    getDefaultDependencyStoreClass() {
      return ChronoDependencyStoreMixin;
    }
    /**
     * Returns the default resource model class to use
     */

    getDefaultResourceModelClass() {
      return BaseResourceMixin;
    }
    /**
     * Returns the default resource store class to use
     */

    getDefaultResourceStoreClass() {
      return ChronoResourceStoreMixin;
    }
    /**
     * Returns the default assignment model class to use
     */

    getDefaultAssignmentModelClass() {
      return BaseAssignmentMixin;
    }
    /**
     * Returns the default assignment store class to use
     */

    getDefaultAssignmentStoreClass() {
      return ChronoAssignmentStoreMixin;
    }
    /**
     * Returns the default calendar model class to use
     */

    getDefaultCalendarModelClass() {
      return BaseCalendarMixin;
    }
    /**
     * Returns the default calendar manager store class to use
     */

    getDefaultCalendarManagerStoreClass() {
      return ChronoCalendarManagerStoreMixin;
    }
    /**
     * This method loads the "raw" data into the project. The loading is basically happening by
     * assigning the individual data entries to the `data` property of the corresponding store.
     *
     * @param data
     */

    async loadInlineData(data) {
      const {
        calendarManagerStore,
        eventStore,
        dependencyStore,
        assignmentStore,
        resourceStore,
        replica
      } = this; // Prevent initial commit from happening before inline data is loaded

      replica === null || replica === void 0 ? void 0 : replica.unScheduleAutoCommit();

      if (replica !== null && replica !== void 0 && replica.enableProgressNotifications && !this.delayCalculation) {
        // First delay needed to allow assignment of Project -> Gantt to happen before carrying on,
        // to make sure progress listener is in place
        await delay(0); // wait till the current propagation completes (if any)
        // otherwise the mask shown due to the next line call will be
        // destroyed as the propagation gets done

        await this.commitAsync();
        replica.onPropagationProgressNotification({
          total: 0,
          remaining: 0,
          phase: 'storePopulation'
        }); // Second delay needed to allow mask to appear, not clear why delay(0) is not enough, it works in other
        // places

        await delay(50);
      }

      this.isInitialCommitPerformed = false;
      this.isLoadingInlineData = true;

      if (globalThis.DEBUG) {
        console.log(`%cInitializing project`, 'font-weight:bold;color:darkgreen;text-transform:uppercase;margin-top: 2em');
        console.time('Time to visible');
        console.time('Populating project');
      } // Prevent records from entering replica on reload, schedule delayed entering / calculation

      if (this.delayCalculation && !this.delayedCalculationPromise) {
        this.scheduleDelayedCalculation();
      }

      if (data.calendarsData) {
        this.repopulateStore(calendarManagerStore);
        calendarManagerStore.data = data.calendarsData;
      }

      if (data.eventsData || data.tasksData) {
        this.repopulateStore(eventStore);
        eventStore.data = data.eventsData || data.tasksData;
      }

      if (data.dependenciesData) {
        this.repopulateStore(dependencyStore);
        dependencyStore.data = data.dependenciesData;
      }

      if (data.resourcesData) {
        this.repopulateStore(resourceStore);
        resourceStore.data = data.resourcesData;
      }

      if (data.assignmentsData) {
        this.repopulateStore(assignmentStore);
        assignmentStore.data = data.assignmentsData;
      }

      if (globalThis.DEBUG) console.timeEnd('Populating project');
      const result = await this.commitLoad();
      this.isLoadingInlineData = false;
      return result;
    } // Called from scheduleDelayedCalculation() & setAssignmentStore to set up indices used to look events and
    // resources up before calculations has finished

    setupTemporaryIndices() {
      const {
        storage
      } = this.assignmentStore || {}; // First delayed calculation starts before assignmentStore is created => no storage

      if (storage) {
        // Set up indices to mimic buckets (removed again in below)
        storage.addIndex({
          property: 'event',
          unique: false
        });
        storage.addIndex({
          property: 'resource',
          unique: false
        });
      }
    }

    removeTemporaryIndices() {
      const {
        storage
      } = this.assignmentStore; // Indices mimicking buckets are no longer needed now, get rid of them

      storage.removeIndex('event');
      storage.removeIndex('resource');
    }

    scheduleDelayedCalculation() {
      const me = this;

      if (me.delayedCalculationPromise) {
        return me.delayedCalculationPromise;
      }

      if (me.delayCalculation !== false) {
        return me.delayedCalculationPromise = new Promise(async resolve => {
          me.delayEnteringReplica = true;
          me.setupTemporaryIndices(); // If listeners are defined on project, we have to wait until after construction before they can
          // catch any events

          await delay(0);
          if (me.isDestroyed) return;
          me.trigger('delayCalculationStart'); // In delayCalculation mode, we trigger refresh before calculating to let UI draw early

          me.trigger('refresh', {
            isCalculated: false
          });
          await delay(0);
          if (me.isDestroyed) return;
          me.delayEnteringReplica = false; // After triggering (and thus drawing) we let everything enter the graph, either by repopulating
          // a new replica or by entering the existing (or a new from scratch the first time)

          if (me.isRepopulatingStores && me.replica) {
            // @ts-ignore
            me.repopulateReplica.now();
          } else {
            me.enterReplica(true);
          }

          const result = await me.replica.commitAsync();
          resolve(result);
          if (me.isDestroyed) return;
          me.delayedCalculationPromise = null;
          me.trigger('delayCalculationEnd');
          me.removeTemporaryIndices();
        });
      }
    }

    async commitLoad() {
      // if (globalThis.DEBUG) console.time('Initial propagation')
      const result = await this.commitAsync(); // Might have been destroyed during the async operation above

      if (!this.isDestroyed) this.trigger('load');
      return result;
    }

    initializeStm() {
      this.setStm(new StateTrackingManager(ObjectHelper.assign({
        disabled: true
      }, this.stm)));

      if (this.resetUndoRedoQueuesAfterLoad) {
        this.on({
          load: this.resetStmQueue,
          thisObj: this
        });
      }

      this.on({
        beforeCommit: this.onCommitInitialization,
        commitFinalized: this.onCommitFinalization,
        commitRejected: this.onCommitRejection,
        thisObj: this
      });
    }

    removeRejectedRecordsAdd({
      transactionResult,
      silenceCommit
    }) {
      var _this$suspendChangesT, _this$resumeChangesTr;

      const recordsToDrop = new Map();

      for (const quark of transactionResult.entries.values()) {
        var _transactionResult$tr;

        const identifier = quark.identifier;
        const {
          field
        } = identifier;
        if (quark.isShadow() || !identifier[IsChronoModelSymbol] || field instanceof ModelBucketField) continue;
        const record = identifier.self;
        const store = record.firstStore; // collect records w/ atoms not having a previous value

        if (store && !quark.previous && !((_transactionResult$tr = transactionResult.transaction.getLatestStableEntryFor(record.$$)) !== null && _transactionResult$tr !== void 0 && _transactionResult$tr.previous)) {
          if (!recordsToDrop.has(store)) {
            recordsToDrop.set(store, new Set([record]));
          } else if (!recordsToDrop.get(store).has(record)) {
            recordsToDrop.get(store).add(record);
          }
        }
      } // @ts-ignore

      (_this$suspendChangesT = this.suspendChangesTracking) === null || _this$suspendChangesT === void 0 ? void 0 : _this$suspendChangesT.call(this); // remove the collected records

      recordsToDrop.forEach((records, store) => store.remove(records)); // @ts-ignore

      (_this$resumeChangesTr = this.resumeChangesTracking) === null || _this$resumeChangesTr === void 0 ? void 0 : _this$resumeChangesTr.call(this, silenceCommit);

      if (silenceCommit) {
        this.eventStore.acceptChanges();
        this.dependencyStore.acceptChanges();
        this.resourceStore.acceptChanges();
        this.assignmentStore.acceptChanges();
        this.calendarManagerStore.acceptChanges();
      }
    }

    onCommitRejection(event) {
      // if STM is disabled we trying to revert changes w/o it
      if (this._stmDisabled) {
        // TODO reject removals as well
        this.removeRejectedRecordsAdd(event);
      } // reject last transaction STM has
      else {
        this.rejectStmTransaction();
      }
    } // https://github.com/bryntum/support/issues/1270

    onCommitInitialization() {
      const {
        stm
      } = this;
      this._stmDisabled = stm.disabled;

      if (stm.isRecording && stm.autoRecord) {
        this._stmAutoRecord = true; // If auto recording is enabled when we are entering a commit, we need to move autoRecording
        // state to Recording in order to make sure all changes from the project will become a single
        // transaction

        stm.autoRecord = false;
      }
    }

    onCommitFinalization() {
      if (this._stmAutoRecord) {
        // This will restore autoRecording state and trigger timer to stop transaction after a delay
        this.stm.autoRecord = true;
        this._stmAutoRecord = false;
      }
    } // Propagate on undo/redo

    async onSTMRestoringStop({
      source
    }) {
      const stm = source; // Disable STM meanwhile to not pick it up as a new STM transaction

      stm.disable();
      await this.commitAsync();

      if (!this.isDestroyed) {
        stm.enable();
        this.trigger('stateRestoringDone');
      }
    } //region Repopulate

    get isRepopulatingStores() {
      var _this$repopulateStore;

      return Boolean((_this$repopulateStore = this.repopulateStores) === null || _this$repopulateStore === void 0 ? void 0 : _this$repopulateStore.size);
    } // Remember which stores are being repopulated, they dont have to care about unjoining graph later

    repopulateStore(store) {
      const me = this;

      if (me.repopulateOnDataset && store.count) {
        if (!me.repopulateStores) me.repopulateStores = new Set();
        me.repopulateStores.add(store); // Trigger buffered repopulate of replica

        me.repopulateReplica();
      }
    } // Creates a new replica, populating it with data from the stores

    repopulateReplica() {
      const me = this; // Will repopulate as part of scheduled delayed calculations

      if (me.delayEnteringReplica) {
        return;
      }

      const {
        calendarManagerStore,
        eventStore,
        dependencyStore,
        assignmentStore,
        resourceStore,
        replica: oldReplica
      } = me; // Unlink all old records that are going to be re-entered into new replica

      me.unlinkStoreRecords(calendarManagerStore, eventStore, dependencyStore, resourceStore, assignmentStore);
      me.unlinkRecord(me);
      me.unlinkRecord(me.defaultCalendar);
      me.trigger('recordsUnlinked');
      oldReplica.clear();
      const replica = me.replica = me.createReplica(); // Now enter all new and old reused records into the new replica

      replica.addEntity(me);
      replica.addEntity(me.defaultCalendar);
      me.joinStoreRecords(calendarManagerStore, true);
      me.joinStoreRecords(eventStore, true);
      me.joinStoreRecords(dependencyStore, true);
      me.joinStoreRecords(resourceStore, true);
      me.joinStoreRecords(assignmentStore, true);
      me.repopulateStores.clear();
      me.trigger('repopulateReplica');
    } // If there is a commit when we are supposed to replace the replica, we hijack that and commit the new replica

    beforeCommitAsync() {
      //@ts-ignore
      if (this.repopulateReplica.isPending && !this.isDelayingCalculation) {
        //@ts-ignore
        this.repopulateReplica.now();
        return this.replica.commitAsync();
      }

      return null;
    } // Unlinks a single record from the graph, writing back identifiers values from the graph to DATA to allow them
    // to enter another replica

    unlinkRecord(record) {
      // Might not have entered replica yet when using delayed calculation
      if (record !== null && record !== void 0 && record.graph) {
        const {
          activeTransaction
        } = this.replica;
        const {
          $
        } = record;
        const keys = Object.keys($); // Write current values to identifier.DATA, to have correct value entering new replica later

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const identifier = $[key]; // Relations: assignment.event, replace event instance with event id

          if (identifier.field instanceof ModelReferenceField) {
            var _value$id;

            const value = record[key]; // id for records, value for atomics, undefined otherwise

            identifier.DATA = (_value$id = value === null || value === void 0 ? void 0 : value.id) !== null && _value$id !== void 0 ? _value$id : value;
          } // Everything else, use latest value
          else {
            const entry = activeTransaction.getLatestStableEntryFor(identifier);
            if (entry) identifier.DATA = entry.getValue();
          }
        } // Cut the link, to enable joining another replica

        record.graph = null;
      }
    } // Unlinks all records from a store, unless the store has been repopulated

    unlinkStoreRecords(...stores) {
      // Must pass includeFilteredOutRecords and includeCollapsedGroupRecords as true
      // so that we work on full, unfiltered dataset
      stores.forEach(store => {
        // Unlink records only in stores that are not repopulated
        // or if store has syncDataOnLoad (in this case records stay in the store so need to unlink them)
        if (!this.repopulateStores.has(store) || store.syncDataOnLoad) {
          store.traverse(record => {
            this.unlinkRecord(record);
          }, false, false, {
            includeFilteredOutRecords: true,
            includeCollapsedGroupRecords: true
          });
        }
      });
    } //endregion

    getGraph() {
      return this.replica;
    } // keep this private

    async addEvents(events) {
      this.eventStore.add(events);
      return this.commitAsync();
    } // keep this private

    async addEvent(event) {
      this.eventStore.add(event);
      return this.commitAsync();
    } // keep this private

    includeEvent(event) {
      this.eventStore.add(event);
    } // keep this private

    async removeEvents(events) {
      this.eventStore.remove(events);
      return this.commitAsync();
    } // keep this private

    excludeEvent(event) {
      this.eventStore.remove(event);
    } // keep this private

    async removeEvent(event) {
      this.eventStore.remove(event);
      return this.commitAsync();
    }

    getStm() {
      return this.stm;
    }

    setStm(stm) {
      this.stm = stm;
      this.stm.on('restoringStop', this.onSTMRestoringStop, this);
    }

    calculateProject() {
      return this;
    }

    *calculateEffectiveCalendar() {
      let calendar = yield this.$.calendar;

      if (calendar) {
        // this will create an incoming edge from the calendar's version atom, which changes on calendar's data update
        yield calendar.$.version;
      } else {
        calendar = this.defaultCalendar;
      }

      return calendar;
    }

    joinStoreRecords(store, skipRoot = false) {
      const fn = record => {
        record.setProject(this);
        record.joinProject();
      }; // Both iteration methods must pass includeFilteredOutRecords as true
      // so that we work on full, unfiltered dataset

      if (store.rootNode) {
        store.rootNode.traverse(fn, skipRoot, true);
      } else {
        store.forEach(fn, null, {
          includeFilteredOutRecords: true,
          includeCollapsedGroupRecords: true
        });
      }
    }

    unjoinStoreRecords(store) {
      const fn = record => {
        record.leaveProject();
        record.setProject(this);
      }; // Both iteration methods must pass includeFilteredOutRecords as true
      // so that we work on full, unfiltered dataset

      if (store.rootNode) {
        store.rootNode.traverse(node => {
          // do not unjoin/leave project for the root node, which is the project itself
          if (node !== store.rootNode) fn(node);
        }, false, true);
      } else {
        store.forEach(fn, null, {
          includeFilteredOutRecords: true,
          includeCollapsedGroupRecords: true
        });
      }
    }
    /**
     * This method sets the event store instance for the project.
     * @param store
     */

    setEventStore(store) {
      const oldEventStore = this.eventStore;

      if (oldEventStore && this.stm.hasStore(oldEventStore)) {
        this.stm.removeStore(oldEventStore);
        this.unjoinStoreRecords(oldEventStore);
        this.detachStore(oldEventStore);
        const assignmentsForRemoval = oldEventStore.assignmentsForRemoval; // remap the assignment

        assignmentsForRemoval.forEach(assignment => {
          const oldEvent = assignment.event;

          if (oldEvent) {
            const newEvent = store.getById(oldEvent.id);

            if (newEvent) {
              assignment.event = newEvent; // keep the assignment

              assignmentsForRemoval.delete(assignment);
            }
          }
        });
        oldEventStore.afterEventRemoval();
      }

      if (!store || !(store instanceof Store)) {
        const storeClass = (store === null || store === void 0 ? void 0 : store.storeClass) || this.eventStoreClass;
        this.eventStore = new storeClass(ObjectHelper.assign({
          modelClass: this.eventModelClass,
          project: this,
          stm: this.stm
        }, store || {}));
      } else {
        this.eventStore = store;
        store.setProject(this);
        this.stm.addStore(store); // we've been given an event store from the outside
        // need to change its root node to be the project

        if (store.tree && store.rootNode !== this) {
          this.appendChild(store.rootNode.children || []); // Assigning a new root will make all children join store

          store.rootNode = this;
        } // TODO: Not sure about this, was always performed previously
        else {
          this.joinStoreRecords(store);
        }
      }

      this.attachStore(this.eventStore);
      this.trigger('eventStoreChange', {
        store: this.eventStore
      });
    }
    /**
     * This method sets the dependency store instance for the project.
     * @param store
     */

    setDependencyStore(store) {
      const oldDependencyStore = this.dependencyStore;

      if (oldDependencyStore && this.stm.hasStore(oldDependencyStore)) {
        this.stm.removeStore(oldDependencyStore);
        this.detachStore(oldDependencyStore);
      }

      if (!store || !(store instanceof Store)) {
        const storeClass = (store === null || store === void 0 ? void 0 : store.storeClass) || this.dependencyStoreClass;
        this.dependencyStore = new storeClass(ObjectHelper.assign({
          modelClass: this.dependencyModelClass,
          project: this,
          stm: this.stm
        }, store || {}));
      } else {
        this.dependencyStore = store;
        store.setProject(this);
        this.stm.addStore(store);
        this.joinStoreRecords(store);
      }

      this.attachStore(this.dependencyStore);
      this.trigger('dependencyStoreChange', {
        store: this.dependencyStore
      });
    }
    /**
     * This method sets the resource store instance for the project.
     * @param store
     */

    setResourceStore(store) {
      const oldResourceStore = this.resourceStore;

      if (oldResourceStore && this.stm.hasStore(oldResourceStore)) {
        this.stm.removeStore(oldResourceStore);
        this.unjoinStoreRecords(oldResourceStore);
        this.detachStore(oldResourceStore);
        const assignmentsForRemoval = oldResourceStore.assignmentsForRemoval; // remap the assignment

        assignmentsForRemoval.forEach(assignment => {
          const oldResource = assignment.resource;

          if (oldResource) {
            const newResource = store.getById(oldResource.id);

            if (newResource) {
              assignment.resource = newResource; // keep the assignment

              assignmentsForRemoval.delete(assignment);
            }
          }
        });
        oldResourceStore.afterResourceRemoval();
      }

      if (!store || !(store instanceof Store)) {
        const storeClass = (store === null || store === void 0 ? void 0 : store.storeClass) || this.resourceStoreClass;
        this.resourceStore = new storeClass(ObjectHelper.assign({
          modelClass: this.resourceModelClass,
          project: this,
          stm: this.stm
        }, store || {}));
      } else {
        this.resourceStore = store;
        store.setProject(this);
        this.stm.addStore(store);
        this.joinStoreRecords(store);
      }

      this.attachStore(this.resourceStore);
      this.trigger('resourceStoreChange', {
        store: this.resourceStore
      });
    }
    /**
     * This method sets the assignment store instance for the project.
     * @param store
     */

    setAssignmentStore(store) {
      const oldAssignmentStore = this.assignmentStore;

      if (oldAssignmentStore && this.stm.hasStore(oldAssignmentStore)) {
        this.stm.removeStore(oldAssignmentStore);
        this.unjoinStoreRecords(oldAssignmentStore);
        this.detachStore(oldAssignmentStore);
      }

      if (!store || !(store instanceof Store)) {
        const storeClass = (store === null || store === void 0 ? void 0 : store.storeClass) || this.assignmentStoreClass;
        this.assignmentStore = new storeClass(ObjectHelper.assign({
          modelClass: this.assignmentModelClass,
          project: this,
          stm: this.stm
        }, store || {}));
      } else {
        this.assignmentStore = store;
        store.setProject(this);
        this.stm.addStore(store);
        this.joinStoreRecords(store);
      }

      this.isDelayingCalculation && this.setupTemporaryIndices();
      this.attachStore(this.assignmentStore);
      this.trigger('assignmentStoreChange', {
        store: this.assignmentStore
      });
    }
    /**
     * This method sets the calendar manager store instance for the project.
     * @param store
     */

    setCalendarManagerStore(store) {
      const oldCalendarManagerStore = this.calendarManagerStore;

      if (oldCalendarManagerStore && this.stm.hasStore(oldCalendarManagerStore)) {
        this.stm.removeStore(oldCalendarManagerStore);
        this.detachStore(oldCalendarManagerStore);
      }

      if (!store || !(store instanceof Store)) {
        const storeClass = (store === null || store === void 0 ? void 0 : store.storeClass) || this.calendarManagerStoreClass;
        this.calendarManagerStore = new storeClass(ObjectHelper.assign({
          modelClass: this.calendarModelClass,
          project: this,
          stm: this.stm
        }, store || {}));
      } else {
        this.calendarManagerStore = store;

        if (store) {
          store.setProject(this);
          this.stm.addStore(store);
          this.joinStoreRecords(store);
        }
      }

      this.attachStore(this.calendarManagerStore);
      this.trigger('calendarManagerStoreChange', {
        store: this.calendarManagerStore
      });
    } // this does not account for possible scheduling conflicts

    async isValidDependency(...args) {
      return true;
    }

    rejectStmTransaction(stm) {
      stm = stm || this.stm;

      if (stm.transaction) {
        if (stm.transaction.length) {
          stm.forEachStore(s => s.beginBatch());
          stm.rejectTransaction();
          stm.forEachStore(s => s.endBatch());
        } else {
          stm.stopTransaction();
        }
      }
    }

    async tryPropagateWithChanges(changerFn) {
      const stm = this.stm,
            // remember STM initial settings
      stmInitiallyDisabled = stm.disabled,
            stmInitiallyAutoRecord = stm.autoRecord; // if STM is disabled we turn it on so we could revert changes later

      if (stmInitiallyDisabled) {
        stm.enable();
      } // if it's enabled
      else {
        // if auto-recording is enabled - disable it
        if (stmInitiallyAutoRecord) {
          stm.autoRecord = false;
        } // stop the current transaction to not mess it

        if (stm.isRecording) {
          stm.stopTransaction();
        }
      } // start a new transaction

      stm.startTransaction(); // In case anything in, or called by the changerFn attempts to propagate.
      // We must only propagate after the changes have been made.
      // this.suspendPropagate()

      changerFn(); // Resume propagation, but do *not* propagate if any propagate calls were attempted during suspension.
      // this.resumePropagate(false)

      let result = true;

      try {
        const commitResult = await this.commitAsync(); // setting "result" to false if the propagation was rejected

        result = !commitResult.rejectedWith;
      } catch (e) {
        // rethrow non-cycle exception
        if (!/cycle/i.test(e)) throw e;
        result = false;
      } // if the transaction succeed

      if (result) {
        stm.stopTransaction(); // if STM is not used - reset its queue

        if (stmInitiallyDisabled) {
          stm.resetQueue();
        }
      } // reject the failed transaction changes
      else {
        this.replica.reject();
        this.rejectStmTransaction(stm);
      } // restore STM settings

      stm.disabled = stmInitiallyDisabled;
      stm.autoRecord = stmInitiallyAutoRecord;
      return result;
    }

    isEngineReady() {
      const {
        replica
      } = this;
      return this.delayEnteringReplica || !this.isRepopulatingStores && !(replica.dirty && (replica.hasPendingAutoCommit() || replica.isCommitting));
    } // Needed to separate configs from data, for tests to pass. Normally handled in ProjectModel outside of engine

    static get defaultConfig() {
      return {
        assignmentsData: null,
        calendarsData: null,
        dependenciesData: null,
        eventsData: null,
        resourcesData: null,
        // need to distinguish the stores from fields
        // https://bryntum.com/examples/gantt/advanced/index.umd.html
        // bryntum.gantt.ObjectHelper.isEqual({}, new bryntum.gantt.Store()) // true
        eventStore: null,
        resourceStore: null,
        assignmentStore: null,
        dependencyStore: null,
        calendarManagerStore: null,
        eventModelClass: null,
        resourceModelClass: null,
        assignmentModelClass: null,
        dependencyModelClass: null,
        calendarModelClass: null,
        repopulateOnDataset: true
      };
    }

    static get delayable() {
      return {
        repopulateReplica: 10
      };
    }

  }

  SchedulerBasicProjectMixin.applyConfigs = true;

  __decorate$9([model_field({
    type: 'boolean',
    defaultValue: true
  })], SchedulerBasicProjectMixin.prototype, "unspecifiedTimeIsWorking", void 0);

  __decorate$9([model_field({
    type: 'boolean',
    defaultValue: false
  })], SchedulerBasicProjectMixin.prototype, "skipNonWorkingTimeWhenSchedulingManually", void 0);

  return SchedulerBasicProjectMixin;
}) {}

var __decorate$8 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

const calculateEffectiveStartDateConstraintInterval = function* (event, startDateIntervalIntersection, endDateIntervalIntersection, duration, collectIntersectionMeta) {
  if (endDateIntervalIntersection.isIntervalEmpty()) return endDateIntervalIntersection; //EMPTY_INTERVAL
  // If intersection details collecting is enabled (need this when preparing a scheduling conflict info)

  if (collectIntersectionMeta && endDateIntervalIntersection.intersectionOf) {
    const reflectedIntervals = new Set(); // Iterate over the intervals that took part in "endDateIntervalIntersection" building
    // and reflect each of them to task "End" side.
    // So we could compare each interval one by one.

    for (const interval of endDateIntervalIntersection.intersectionOf) {
      if (interval.isInfinite()) {
        reflectedIntervals.add(interval);
      } else {
        const startDate = interval.startDateIsFinite() ? yield* event.calculateProjectedXDateWithDuration(interval.startDate, false, duration) : interval.startDate;
        const endDate = interval.endDateIsFinite() ? yield* event.calculateProjectedXDateWithDuration(interval.endDate, false, duration) : interval.endDate; // @ts-ignore

        reflectedIntervals.add(interval.copyWith({
          reflectionOf: interval,
          side: interval.side === ConstraintIntervalSide.Start ? ConstraintIntervalSide.End : ConstraintIntervalSide.Start,
          startDate,
          endDate
        }));
      }
    } // override intersectionOf with reflected intervals

    endDateIntervalIntersection.intersectionOf = reflectedIntervals;
  }

  const startDate = endDateIntervalIntersection.startDateIsFinite() ? yield* event.calculateProjectedXDateWithDuration(endDateIntervalIntersection.startDate, false, duration) : null;
  const endDate = endDateIntervalIntersection.endDateIsFinite() ? yield* event.calculateProjectedXDateWithDuration(endDateIntervalIntersection.endDate, false, duration) : null;
  return intersectIntervals([startDateIntervalIntersection, ConstraintInterval.new({
    intersectionOf: endDateIntervalIntersection.intersectionOf,
    startDate,
    endDate
  })], collectIntersectionMeta);
};
const calculateEffectiveEndDateConstraintInterval = function* (event, startDateIntervalIntersection, endDateIntervalIntersection, duration, collectIntersectionMeta) {
  if (startDateIntervalIntersection.isIntervalEmpty()) return startDateIntervalIntersection; //EMPTY_INTERVAL
  // If intersection details collecting is enabled (need this when preparing a scheduling conflict info)

  if (collectIntersectionMeta) {
    const reflectedIntervals = new Set(); // Iterate over the intervals that took part in "startDateIntervalIntersection" building
    // and reflect each of them to task "End" side.
    // So we could compare each interval one by one.

    for (const interval of startDateIntervalIntersection.intersectionOf) {
      // no need to reflect infinite intervals
      if (interval.isInfinite()) {
        reflectedIntervals.add(interval);
      } // reflect finite interval
      else {
        const startDate = interval.startDateIsFinite() ? yield* event.calculateProjectedXDateWithDuration(interval.startDate, true, duration) : interval.startDate;
        const endDate = interval.endDateIsFinite() ? yield* event.calculateProjectedXDateWithDuration(interval.endDate, true, duration) : interval.endDate; // Make a reflection of the interval
        // @ts-ignore

        reflectedIntervals.add(interval.copyWith({
          reflectionOf: interval,
          side: interval.side === ConstraintIntervalSide.Start ? ConstraintIntervalSide.End : ConstraintIntervalSide.Start,
          startDate,
          endDate
        }));
      }
    } // override intersectionOf with reflected intervals

    startDateIntervalIntersection.intersectionOf = reflectedIntervals;
  }

  const startDate = startDateIntervalIntersection.startDateIsFinite() ? yield* event.calculateProjectedXDateWithDuration(startDateIntervalIntersection.startDate, true, duration) : null;
  const endDate = startDateIntervalIntersection.endDateIsFinite() ? yield* event.calculateProjectedXDateWithDuration(startDateIntervalIntersection.endDate, true, duration) : null;
  return intersectIntervals([endDateIntervalIntersection, ConstraintInterval.new({
    reflectionOf: startDate || endDate ? startDateIntervalIntersection : undefined,
    intersectionOf: startDate || endDate ? startDateIntervalIntersection.intersectionOf : undefined,
    startDate,
    endDate
  })], collectIntersectionMeta);
};
const EarlyLateLazyness = true; //---------------------------------------------------------------------------------------------------------------------

/**
 * This mixin provides the constraint-based scheduling. Event is scheduled according to the set of _constraints_
 * which can be applied to start date or end date.
 *
 * Scheduling by constraints for an event can be disabled by setting its [[manuallyScheduled]] flag to `true`, which will delegate to previous behavior.
 *
 * The constraint is represented with the [[DateInterval]] class, which indicates the "allowed" interval for the
 * point being constrained.
 *
 * Scheduling by constraints algorithm
 * ---------------------------------
 *
 * Constraints for start date are accumulated in the [[earlyStartDateConstraintIntervals]] and [[startDateConstraintIntervals]] fields.
 * Constraints for end date are accumulated in the [[earlyEndDateConstraintIntervals]] and [[endDateConstraintIntervals]] fields.
 *
 * This mixin does not define where the constraints for the event comes from. The constraints are calculated in the field
 * calculation methods, (like [[calculateEarlyStartDateConstraintIntervals]]) which just return empty arrays. Some other mixins
 * may override those methods and can generate actual constraints (the [[ScheduledByDependenciesEarlyEventMixin]] is an example).
 * The "early" fields contains the constraints which are related to scheduling event in the as-soon-as-possible manner.
 * The fields w/o "early" prefix contains the constraints which do not related to the ASAP scheduling.
 *
 * "Early" and "normal" constraints for every date are combined, then intersected, which gives "combined" constraining interval.
 *
 * So at this point we have a "combined" constraining interval for start date and for end date.
 *
 * Then, the interval for start date is shifted on the event duration to the right and this gives an additional constraint for the
 * end date. The similar operation is done with the interval for the end date.
 *
 * After intersection with those additional intervals we receive the final constraining interval for both dates. Since we
 * are using the ASAP scheduling, we just pick the earliest possible date.
 *
 * If any of intervals is empty then we consider it as scheduling conflict, and [[EngineReplica.reject|reject]] the transaction.
 *
 */

class ConstrainedEarlyEventMixin extends Mixin([HasSubEventsMixin], base => {
  const superProto = base.prototype;

  class ConstrainedEarlyEventMixin extends base {
    // Skips non-working time if it's needed to the event
    *maybeSkipNonWorkingTime(date, isForward = true) {
      let duration = yield* this.calculateEffectiveDuration();
      return date && duration > 0 ? yield* this.skipNonWorkingTime(date, isForward) : date;
    }

    *calculateEffectiveConstraintInterval(isStartDate, startDateConstraintIntervals, endDateConstraintIntervals, collectIntersectionMeta = false) {
      const effectiveDurationToUse = yield* this.calculateEffectiveDuration();

      if (effectiveDurationToUse == null) {
        return null;
      }

      const calculateIntervalFn = isStartDate ? calculateEffectiveStartDateConstraintInterval : calculateEffectiveEndDateConstraintInterval;
      const effectiveInterval = yield* calculateIntervalFn(this, intersectIntervals(startDateConstraintIntervals, collectIntersectionMeta), intersectIntervals(endDateConstraintIntervals, collectIntersectionMeta), effectiveDurationToUse, collectIntersectionMeta);
      return effectiveInterval;
    }
    /**
     * Calculation method for the [[startDateConstraintIntervals]]. Returns empty array by default.
     * Override this method to return some extra constraints for the start date.
     */

    *calculateStartDateConstraintIntervals() {
      return [];
    }
    /**
     * Calculation method for the [[endDateConstraintIntervals]]. Returns empty array by default.
     * Override this method to return some extra constraints for the end date.
     */

    *calculateEndDateConstraintIntervals() {
      return [];
    }
    /**
     * Calculation method for the [[earlyStartDateConstraintIntervals]]. Returns empty array by default.
     * Override this method to return some extra constraints for the start date during the ASAP scheduling.
     */

    *calculateEarlyStartDateConstraintIntervals() {
      return [];
    }
    /**
     * Calculation method for the [[earlyEndDateConstraintIntervals]]. Returns empty array by default.
     * Override this method to return some extra constraints for the end date during the ASAP scheduling.
     */

    *calculateEarlyEndDateConstraintIntervals() {
      return [];
    }

    *doCalculateEarlyEffectiveStartDateInterval(collectIntersectionMeta = false) {
      const startDateConstraintIntervals = yield this.$.earlyStartDateConstraintIntervals;
      const endDateConstraintIntervals = yield this.$.earlyEndDateConstraintIntervals;
      return yield* this.calculateEffectiveConstraintInterval(true, // need to use concat instead of directly mutating the `startDateConstraintIntervals` since that is
      // used as storage for `this.$.earlyStartDateConstraintIntervals`
      startDateConstraintIntervals.concat(yield this.$.startDateConstraintIntervals), endDateConstraintIntervals.concat(yield this.$.endDateConstraintIntervals), collectIntersectionMeta);
    }

    *calculateEarlyEffectiveStartDateInterval() {
      return yield* this.doCalculateEarlyEffectiveStartDateInterval();
    }

    *doCalculateEarlyEffectiveEndDateInterval(collectIntersectionMeta = false) {
      const startDateConstraintIntervals = yield this.$.earlyStartDateConstraintIntervals;
      const endDateConstraintIntervals = yield this.$.earlyEndDateConstraintIntervals;
      return yield* this.calculateEffectiveConstraintInterval(false, // need to use concat instead of directly mutating the `startDateConstraintIntervals` since that is
      // used as storage for `this.$.earlyStartDateConstraintIntervals`
      startDateConstraintIntervals.concat(yield this.$.startDateConstraintIntervals), endDateConstraintIntervals.concat(yield this.$.endDateConstraintIntervals), collectIntersectionMeta);
    }

    *calculateEarlyEffectiveEndDateInterval() {
      return yield* this.doCalculateEarlyEffectiveEndDateInterval();
    }
    /**
     * The method defines wether the provided child event should be
     * taken into account when calculating this summary event [[earlyStartDate]].
     * Child events roll up their [[earlyStartDate]] values to their summary tasks.
     * So a summary task [[earlyStartDate]] date gets equal to its minimal child [[earlyStartDate]].
     *
     * If the method returns `true` the child event is taken into account
     * and if the method returns `false` it's not.
     * By default the method returns `true` to include all child events data.
     * @param childEvent Child event to consider.
     * @returns `true` if the provided event should be taken into account, `false` if not.
     */

    *shouldRollupChildEarlyStartDate(child) {
      return true;
    }

    *calculateMinChildrenEarlyStartDate() {
      let result = MAX_DATE;
      const subEventsIterator = yield* this.subEventsIterable();

      for (let childEvent of subEventsIterator) {
        let childDate;
        if (!(yield* this.shouldRollupChildEarlyStartDate(childEvent))) continue;

        if ((yield childEvent.$.manuallyScheduled) && (yield* childEvent.hasSubEvents())) {
          childDate = yield childEvent.$.minChildrenEarlyStartDate;
        }

        childDate = childDate || (yield childEvent.$.earlyStartDate);
        if (childDate && childDate < result) result = childDate;
      }

      return result.getTime() - MAX_DATE.getTime() ? result : null;
    }
    /**
     * The method defines wether the provided child event should be
     * taken into account when calculating this summary event [[earlyEndDate]].
     * Child events roll up their [[earlyEndDate]] values to their summary tasks.
     * So a summary task [[earlyEndDate]] gets equal to its maximal child [[earlyEndDate]].
     *
     * If the method returns `true` the child event is taken into account
     * and if the method returns `false` it's not.
     * By default the method returns `true` to include all child events data.
     * @param childEvent Child event to consider.
     * @returns `true` if the provided event should be taken into account, `false` if not.
     */

    *shouldRollupChildEarlyEndDate(child) {
      return true;
    }

    *calculateMaxChildrenEarlyEndDate() {
      let result = MIN_DATE;
      const subEventsIterator = yield* this.subEventsIterable();

      for (let childEvent of subEventsIterator) {
        let childDate;
        if (!(yield* this.shouldRollupChildEarlyEndDate(childEvent))) continue;

        if ((yield childEvent.$.manuallyScheduled) && (yield* childEvent.hasSubEvents())) {
          childDate = yield childEvent.$.maxChildrenEarlyEndDate;
        }

        childDate = childDate || (yield childEvent.$.earlyEndDate);
        if (childDate && childDate > result) result = childDate;
      }

      return result.getTime() - MIN_DATE.getTime() ? result : null;
    }

    *calculateEarlyStartDateRaw() {
      // Manually scheduled task treat its current start date as its early start date
      // in case of forward scheduling.
      // Late dates in that case are calculated the same way it happens for automatic tasks
      if ((yield this.$.manuallyScheduled) && (yield this.$.direction) === Direction.Forward) {
        return yield this.$.startDate;
      } // Parent task calculate its early start date as minimal early start date of its children

      if (yield* this.hasSubEvents()) {
        return yield this.$.minChildrenEarlyStartDate;
      }

      if (!(yield* this.isConstrainedEarly())) {
        return yield this.$.startDate;
      }

      let effectiveInterval = yield this.$.earlyEffectiveStartDateInterval;

      if (effectiveInterval === null) {
        return null;
      } else if (effectiveInterval.isIntervalEmpty()) {
        // re-calculate effective resulting interval gathering intersection history
        effectiveInterval = yield* this.doCalculateEarlyEffectiveStartDateInterval(true);
        const conflict = ConflictEffect.new({
          intervals: [...effectiveInterval.intersectionOf]
        });

        if ((yield conflict) === EffectResolutionResult.Cancel) {
          yield Reject(conflict);
        } else {
          return null;
        }
      }

      return isDateFinite(effectiveInterval.startDate) ? effectiveInterval.startDate : null;
    }

    *calculateEarlyStartDate() {
      const date = yield this.$.earlyStartDateRaw;
      return yield* this.maybeSkipNonWorkingTime(date, true);
    }

    *calculateEarlyEndDateRaw() {
      // Manually scheduled task treat its current end date as its early end date
      // in case of forward scheduling.
      // Late dates in that case are calculated the same way it happens for automatic tasks
      if ((yield this.$.manuallyScheduled) && (yield this.$.direction) === Direction.Forward) {
        return yield this.$.endDate;
      } // Parent task calculate its early end date as maximum early end date of its children

      if (yield* this.hasSubEvents()) {
        return yield this.$.maxChildrenEarlyEndDate;
      }

      if (!(yield* this.isConstrainedEarly())) {
        return yield this.$.endDate;
      }

      let effectiveInterval = yield this.$.earlyEffectiveEndDateInterval;

      if (effectiveInterval === null) {
        return null;
      } else if (effectiveInterval.isIntervalEmpty()) {
        // re-calculate effective resulting interval gathering intersection history
        effectiveInterval = yield* this.doCalculateEarlyEffectiveEndDateInterval(true);
        const conflict = ConflictEffect.new({
          intervals: [...effectiveInterval.intersectionOf]
        });

        if ((yield conflict) === EffectResolutionResult.Cancel) {
          yield Reject(conflict);
        } else {
          return null;
        }
      }

      return isDateFinite(effectiveInterval.startDate) ? effectiveInterval.startDate : null;
    }

    *calculateEarlyEndDate() {
      return yield this.$.earlyEndDateRaw;
    }

    *isConstrainedEarly() {
      const startDateIntervals = yield this.$.startDateConstraintIntervals;
      const endDateIntervals = yield this.$.endDateConstraintIntervals;
      const earlyStartDateConstraintIntervals = yield this.$.earlyStartDateConstraintIntervals;
      const earlyEndDateConstraintIntervals = yield this.$.earlyEndDateConstraintIntervals;
      return Boolean((startDateIntervals === null || startDateIntervals === void 0 ? void 0 : startDateIntervals.length) || (endDateIntervals === null || endDateIntervals === void 0 ? void 0 : endDateIntervals.length) || (earlyStartDateConstraintIntervals === null || earlyStartDateConstraintIntervals === void 0 ? void 0 : earlyStartDateConstraintIntervals.length) || (earlyEndDateConstraintIntervals === null || earlyEndDateConstraintIntervals === void 0 ? void 0 : earlyEndDateConstraintIntervals.length));
    }

    *calculateStartDatePure() {
      const direction = yield this.$.direction;

      if (direction === Direction.Forward) {
        // early exit if this mixin is not applicable, but only after(!) the direction check
        // this is because the `isConstrainedEarly` yield early constraint intervals, which are generally lazy,
        // depending from the direction
        if (!(yield* this.isConstrainedEarly()) || (yield this.$.manuallyScheduled)) {
          return yield* superProto.calculateStartDatePure.call(this);
        }

        return (yield this.$.earlyStartDate) || (yield* superProto.calculateStartDatePure.call(this));
      } else {
        return yield* superProto.calculateStartDatePure.call(this);
      }
    }

    *calculateStartDateProposed() {
      const direction = yield this.$.direction;

      switch (direction) {
        case Direction.Forward:
          // early exit if this mixin is not applicable, but only after(!) the direction check
          // this is because the `isConstrainedEarly` yield early constraint intervals, which are generally lazy,
          // depending from the direction
          if (!(yield* this.isConstrainedEarly()) || (yield this.$.manuallyScheduled)) {
            return yield* superProto.calculateStartDateProposed.call(this);
          }

          const autoStartDate = yield this.$.earlyStartDate;

          if (autoStartDate) {
            if (isDateFinite(autoStartDate)) return autoStartDate;
            const baseSchedulingStartDate = yield* superProto.calculateStartDateProposed.call(this);
            const earlyEffectiveStartDateInterval = yield this.$.earlyEffectiveStartDateInterval;
            if (earlyEffectiveStartDateInterval.containsDate(baseSchedulingStartDate)) return baseSchedulingStartDate;
            return isDateFinite(earlyEffectiveStartDateInterval.endDate) ? earlyEffectiveStartDateInterval.endDate : baseSchedulingStartDate;
          } else {
            return yield* superProto.calculateStartDateProposed.call(this);
          }

        default:
          return yield* superProto.calculateStartDateProposed.call(this);
      }
    }

    *calculateEndDatePure() {
      const direction = yield this.$.direction;

      if (direction === Direction.Forward) {
        // early exit if this mixin is not applicable, but only after(!) the direction check
        // this is because the `isConstrainedEarly` yield early constraint intervals, which are generally lazy,
        // depending from the direction
        if (!(yield* this.isConstrainedEarly()) || (yield this.$.manuallyScheduled)) {
          return yield* superProto.calculateEndDatePure.call(this);
        }

        return (yield this.$.earlyEndDate) || (yield* superProto.calculateEndDatePure.call(this));
      } else {
        return yield* superProto.calculateEndDatePure.call(this);
      }
    }

    *calculateEndDateProposed() {
      const direction = yield this.$.direction;

      switch (direction) {
        case Direction.Forward:
          // early exit if this mixin is not applicable, but only after(!) the direction check
          // this is because the `isConstrainedEarly` yield early constraint intervals, which are generally lazy,
          // depending from the direction
          if (!(yield* this.isConstrainedEarly()) || (yield this.$.manuallyScheduled)) {
            return yield* superProto.calculateEndDateProposed.call(this);
          }

          const autoEndDate = yield this.$.earlyEndDate;

          if (autoEndDate) {
            if (isDateFinite(autoEndDate)) return autoEndDate;
            const baseSchedulingEndDate = yield* superProto.calculateEndDateProposed.call(this);
            const earlyEffectiveEndDateInterval = yield this.$.earlyEffectiveEndDateInterval;
            if (earlyEffectiveEndDateInterval.containsDate(baseSchedulingEndDate)) return baseSchedulingEndDate;
            return isDateFinite(earlyEffectiveEndDateInterval.endDate) ? earlyEffectiveEndDateInterval.endDate : baseSchedulingEndDate;
          } else {
            return yield* superProto.calculateEndDateProposed.call(this);
          }

        default:
          return yield* superProto.calculateEndDateProposed.call(this);
      }
    }

    *calculateDirection() {
      const project = this.getProject();
      return yield project.$.direction;
    }

  }

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedEarlyEventMixin.prototype, "minChildrenEarlyStartDate", void 0);

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedEarlyEventMixin.prototype, "earlyStartDateRaw", void 0);

  __decorate$8([model_field({
    type: 'date',
    persist: false
  }, {
    lazy: EarlyLateLazyness,
    converter: dateConverter,
    persistent: false
  })], ConstrainedEarlyEventMixin.prototype, "earlyStartDate", void 0);

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedEarlyEventMixin.prototype, "maxChildrenEarlyEndDate", void 0);

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedEarlyEventMixin.prototype, "earlyEndDateRaw", void 0);

  __decorate$8([model_field({
    type: 'date',
    persist: false
  }, {
    lazy: EarlyLateLazyness,
    converter: dateConverter,
    persistent: false
  })], ConstrainedEarlyEventMixin.prototype, "earlyEndDate", void 0);

  __decorate$8([field()], ConstrainedEarlyEventMixin.prototype, "startDateConstraintIntervals", void 0);

  __decorate$8([field()], ConstrainedEarlyEventMixin.prototype, "endDateConstraintIntervals", void 0);

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedEarlyEventMixin.prototype, "earlyStartDateConstraintIntervals", void 0);

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedEarlyEventMixin.prototype, "earlyEndDateConstraintIntervals", void 0);

  __decorate$8([field()], ConstrainedEarlyEventMixin.prototype, "earlyEffectiveStartDateInterval", void 0);

  __decorate$8([field()], ConstrainedEarlyEventMixin.prototype, "earlyEffectiveEndDateInterval", void 0);

  __decorate$8([calculate('startDateConstraintIntervals')], ConstrainedEarlyEventMixin.prototype, "calculateStartDateConstraintIntervals", null);

  __decorate$8([calculate('endDateConstraintIntervals')], ConstrainedEarlyEventMixin.prototype, "calculateEndDateConstraintIntervals", null);

  __decorate$8([calculate('earlyStartDateConstraintIntervals')], ConstrainedEarlyEventMixin.prototype, "calculateEarlyStartDateConstraintIntervals", null);

  __decorate$8([calculate('earlyEndDateConstraintIntervals')], ConstrainedEarlyEventMixin.prototype, "calculateEarlyEndDateConstraintIntervals", null);

  __decorate$8([calculate('earlyEffectiveStartDateInterval')], ConstrainedEarlyEventMixin.prototype, "calculateEarlyEffectiveStartDateInterval", null);

  __decorate$8([calculate('earlyEffectiveEndDateInterval')], ConstrainedEarlyEventMixin.prototype, "calculateEarlyEffectiveEndDateInterval", null);

  __decorate$8([calculate('minChildrenEarlyStartDate')], ConstrainedEarlyEventMixin.prototype, "calculateMinChildrenEarlyStartDate", null);

  __decorate$8([calculate('maxChildrenEarlyEndDate')], ConstrainedEarlyEventMixin.prototype, "calculateMaxChildrenEarlyEndDate", null);

  __decorate$8([calculate('earlyStartDateRaw')], ConstrainedEarlyEventMixin.prototype, "calculateEarlyStartDateRaw", null);

  __decorate$8([calculate('earlyStartDate')], ConstrainedEarlyEventMixin.prototype, "calculateEarlyStartDate", null);

  __decorate$8([calculate('earlyEndDateRaw')], ConstrainedEarlyEventMixin.prototype, "calculateEarlyEndDateRaw", null);

  __decorate$8([calculate('earlyEndDate')], ConstrainedEarlyEventMixin.prototype, "calculateEarlyEndDate", null);

  __decorate$8([calculate('direction')], ConstrainedEarlyEventMixin.prototype, "calculateDirection", null);

  return ConstrainedEarlyEventMixin;
}) {}

var __decorate$7 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * A mixin for the dependency entity at the Scheduler Pro level. It adds [[lag]] and [[lagUnit]] fields.
 *
 * The calendar according to which the lag time is calculated is defined with the
 * [[SchedulerProProjectMixin.dependenciesCalendar|dependenciesCalendar]] config of the project.
 */

class SchedulerProDependencyMixin extends Mixin([BaseDependencyMixin], base => {
  base.prototype;

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
      } // the only case when there will be no calendar is when there's no either from/to event
      // what to return in such case? use project calendar as "defensive" approach

      if (!calendar) calendar = yield project.$.effectiveCalendar;
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
      } else {
        this.$.lag.DATA = lag;
        if (unit != null) this.$.lagUnit.DATA = unit;
      }
    }

    writeLag(me, transaction, quark, lag, unit = undefined) {
      me.constructor.prototype.write.call(this, me, transaction, quark, lag);
      if (unit != null) transaction.write(this.$.lagUnit, unit);
    }

  }

  __decorate$7([model_field({
    type: 'number',
    defaultValue: 0
  })], SchedulerProDependencyMixin.prototype, "lag", void 0);

  __decorate$7([model_field({
    type: 'string',
    defaultValue: TimeUnit.Day
  }, {
    converter: DateHelper.normalizeUnit
  })], SchedulerProDependencyMixin.prototype, "lagUnit", void 0);

  __decorate$7([field()], SchedulerProDependencyMixin.prototype, "calendar", void 0);

  __decorate$7([model_field({
    type: 'boolean',
    defaultValue: true,
    persist: true
  })], SchedulerProDependencyMixin.prototype, "active", void 0);

  __decorate$7([calculate('calendar')], SchedulerProDependencyMixin.prototype, "calculateCalendar", null);

  __decorate$7([write('lag')], SchedulerProDependencyMixin.prototype, "writeLag", null);

  return SchedulerProDependencyMixin;
}) {} // /**
//  * Dependency entity mixin type
//  */
// export type SchedulerProDependencyMixin = Mixin<typeof SchedulerProDependencyMixin>
//
// export interface SchedulerProDependencyMixinI extends Mixin<typeof SchedulerProDependencyMixin> {}
//
// export const BuildSchedulerProDependency = (base) => SchedulerProDependencyMixin(BuildMinimalBaseDependency(base))
//
// export class MinimalSchedulerProDependency extends SchedulerProDependencyMixin(MinimalBaseDependency) {}

var __decorate$6 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * This mixin implements a date-based based constraint for the event.
 * It provides the following constraint types:
 *
 * - _Start no earlier than (SNET)_ - restricts the event to start on or after the specified date.
 * - _Finish no earlier than (FNET)_ - restricts the event to finish on or after the specified date.
 * - _Start no later than (SNLT)_ - restricts the event to start before (or on) the specified date.
 * - _Finish no later than (FNLT)_ - restricts the event to finish before (or on) the specified date.
 * - _Must start on (MSO)_ - restricts the event to start on the specified date.
 * - _Must finish on (MFO)_ - restricts the event to finish on the specified date.
 *
 * The type of constraint is defined by the [[constraintType]] property. Types has self-descriptive names.
 * There's also [[constraintDate]] with a constraint date.
 *
 * **Please note** that [[manuallyScheduled|manually scheduled]] events ignore their constraints.
 */

class HasDateConstraintMixin extends Mixin([ConstrainedEarlyEventMixin, HasChildrenMixin], base => {
  const superProto = base.prototype;

  class HasDateConstraint extends base {
    writeStartDate(me, transaction, quark, date, keepDuration = true) {
      // get constraint type that should be used to enforce start date or
      // null if the change cannot be enforced (happens when the task is manually scheduled so no need for enforcement or
      // some constraint is already set)
      const project = this.getProject(); // `writeStartDate` will be called for initial write to the `startDate` at the point of adding it to graph
      // at that time there possibly be no `direction` identifier yet
      // it seems this line relies on the fact, that `direction` field is declared after the `startDate`

      if (transaction.graph.hasIdentifier(this.$.direction) && !(project && project.getStm().isRestoring)) {
        const constrainType = this.getStartDatePinConstraintType();

        if (constrainType) {
          this.constraintType = constrainType;
          this.constraintDate = date;
        }
      }

      return superProto.writeStartDate.call(this, me, transaction, quark, date, keepDuration);
    }

    writeEndDate(me, transaction, quark, date, keepDuration = false) {
      // get constraint type that should be used to enforce End date or
      // null if the change cannot be enforced (happens when the task is manually scheduled so no need for enforcement or
      // some constraint is already set)
      const project = this.getProject();

      if (transaction.graph.hasIdentifier(this.$.direction) && keepDuration && !(project && project.getStm().isRestoring)) {
        const constrainType = this.getEndDatePinConstraintType();

        if (constrainType) {
          this.constraintType = constrainType;
          this.constraintDate = date;
        }
      }

      return superProto.writeEndDate.call(this, me, transaction, quark, date, keepDuration);
    }

    *calculateConstraintType() {
      let constraintType = yield ProposedOrPrevious; // use proposed constraint type if provided and is applicable to the event

      if (!(yield* this.isConstraintTypeApplicable(constraintType))) {
        constraintType = null;
      }

      return constraintType;
    }

    *calculateConstraintDate(Y) {
      let constraintDate = yield ProposedOrPrevious;
      const constraintType = yield this.$.constraintType;

      if (!constraintType) {
        constraintDate = null;
      } // use proposed constraint date if provided
      else if (!constraintDate) {
        // fill constraint date based on constraint type provided
        constraintDate = this.getConstraintTypeDefaultDate(Y, constraintType);
      }

      return constraintDate;
    }

    getStartDatePinConstraintType() {
      const {
        direction
      } = this;
      if (!this.isTaskPinnableWithConstraint()) return null;

      switch (direction) {
        case Direction.Forward:
          return ConstraintType.StartNoEarlierThan;

        case Direction.Backward:
          return ConstraintType.StartNoLaterThan;
      }
    }

    getEndDatePinConstraintType() {
      const {
        direction
      } = this;
      if (!this.isTaskPinnableWithConstraint()) return null;

      switch (direction) {
        case Direction.Forward:
          return ConstraintType.FinishNoEarlierThan;

        case Direction.Backward:
          return ConstraintType.FinishNoLaterThan;
      }
    }
    /**
     * Indicates if the task can be pinned with a constraint
     * to enforce its start/end date changes.
     * @private
     */

    isTaskPinnableWithConstraint() {
      const {
        manuallyScheduled,
        constraintType
      } = this;
      let result = false; // we should not pin manually scheduled tasks

      if (!manuallyScheduled) {
        if (constraintType) {
          switch (constraintType) {
            case ConstraintType.StartNoEarlierThan:
            case ConstraintType.StartNoLaterThan:
            case ConstraintType.FinishNoEarlierThan:
            case ConstraintType.FinishNoLaterThan:
              result = true;
          }
        } // no constraints -> we can pin
        else {
          result = true;
        }
      }

      return result;
    }
    /**
     * Returns default constraint date value for the constraint type provided
     * (either start or end date of the event).
     */

    getConstraintTypeDefaultDate(Y, constraintType) {
      switch (constraintType) {
        case ConstraintType.StartNoEarlierThan:
        case ConstraintType.StartNoLaterThan:
        case ConstraintType.MustStartOn:
          return Y(ProposedOrPreviousValueOf(this.$.startDate));

        case ConstraintType.FinishNoEarlierThan:
        case ConstraintType.FinishNoLaterThan:
        case ConstraintType.MustFinishOn:
          return Y(ProposedOrPreviousValueOf(this.$.endDate));
      }

      return null;
    }
    /**
     * Returns true if the provided constraint type is applicable to the event.
     *
     * @param {ConstraintType} constraintType Constraint type.
     * @returns `True` if the provided constraint type is applicable (`false` otherwise).
     */

    *isConstraintTypeApplicable(constraintType) {
      const childEvents = yield this.$.childEvents; // Take into account if the event is leaf

      const isSummary = childEvents.size > 0;

      switch (constraintType) {
        // these constraints are applicable to leaves only
        case ConstraintType.FinishNoEarlierThan:
        case ConstraintType.StartNoLaterThan:
        case ConstraintType.MustFinishOn:
        case ConstraintType.MustStartOn:
          return !isSummary;
      }

      return true;
    }
    /**
     * Sets the constraint type (if applicable) and constraining date to the task.
     * @param {ConstraintType}  constraintType   Constraint type.
     * @param {Date}            [constraintDate] Constraint date.
     * @returns Promise<PropagateResult>
     */

    async setConstraint(constraintType, constraintDate) {
      this.constraintType = constraintType;

      if (constraintDate !== undefined) {
        this.constraintDate = constraintDate;
      }

      return this.commitAsync();
    }

    *calculateEndDateConstraintIntervals() {
      const intervals = yield* superProto.calculateEndDateConstraintIntervals.call(this);
      const manuallyScheduled = yield this.$.manuallyScheduled;
      const constraintType = yield this.$.constraintType;
      const constraintDate = yield this.$.constraintDate;
      const dateConstraintIntervalClass = this.project.dateConstraintIntervalClass; // manually scheduled task ignores its constraints

      if (!manuallyScheduled && constraintType && constraintDate) {
        // if constraint type is
        switch (constraintType) {
          case ConstraintType.MustFinishOn:
            intervals.unshift(dateConstraintIntervalClass.new({
              owner: this,
              side: ConstraintIntervalSide.End,
              startDate: constraintDate,
              endDate: constraintDate
            }));
            break;

          case ConstraintType.FinishNoEarlierThan:
            intervals.unshift(dateConstraintIntervalClass.new({
              owner: this,
              side: ConstraintIntervalSide.End,
              startDate: constraintDate
            }));
            break;

          case ConstraintType.FinishNoLaterThan:
            intervals.unshift(dateConstraintIntervalClass.new({
              owner: this,
              side: ConstraintIntervalSide.End,
              endDate: constraintDate
            }));
            break;
        }
      }

      return intervals;
    }

    *calculateStartDateConstraintIntervals() {
      const intervals = yield* superProto.calculateStartDateConstraintIntervals.call(this);
      const manuallyScheduled = yield this.$.manuallyScheduled;
      const constraintType = yield this.$.constraintType;
      const constraintDate = yield this.$.constraintDate;
      const dateConstraintIntervalClass = this.project.dateConstraintIntervalClass; // manually scheduled task ignores its constraints

      if (!manuallyScheduled && constraintType && constraintDate) {
        // if constraint type is
        switch (constraintType) {
          case ConstraintType.MustStartOn:
            intervals.unshift(dateConstraintIntervalClass.new({
              owner: this,
              side: ConstraintIntervalSide.Start,
              startDate: constraintDate,
              endDate: constraintDate
            }));
            break;

          case ConstraintType.StartNoEarlierThan:
            intervals.unshift(dateConstraintIntervalClass.new({
              owner: this,
              side: ConstraintIntervalSide.Start,
              startDate: constraintDate
            }));
            break;

          case ConstraintType.StartNoLaterThan:
            intervals.unshift(dateConstraintIntervalClass.new({
              owner: this,
              side: ConstraintIntervalSide.Start,
              endDate: constraintDate
            }));
            break;
        }
      }

      return intervals;
    }

  }

  __decorate$6([model_field({
    type: 'string'
  }, {
    sync: true
  })], HasDateConstraint.prototype, "constraintType", void 0);

  __decorate$6([model_field({
    type: 'date'
  }, {
    converter: dateConverter,
    sync: true
  })], HasDateConstraint.prototype, "constraintDate", void 0);

  __decorate$6([calculate('constraintType')], HasDateConstraint.prototype, "calculateConstraintType", null);

  __decorate$6([calculate('constraintDate')], HasDateConstraint.prototype, "calculateConstraintDate", null);

  return HasDateConstraint;
}) {}
/**
 * Class implements resolving a scheduling conflict happened due to a task constraint.
 * It resolves the conflict by removing the constraint.
 */

class RemoveDateConstraintConflictResolution extends Localizable(ConflictResolution) {
  static get $name() {
    return 'RemoveDateConstraintConflictResolution';
  }

  construct() {
    super.construct(...arguments);
    this.event = this.interval.owner;
  }

  getDescription() {
    const {
      event
    } = this;
    return format(this.L('L{descriptionTpl}'), event.name || event.id, this.interval.getConstraintName(event.constraintType));
  }
  /**
   * Resolves the conflict by removing the event constraint.
   */

  resolve() {
    this.event.constraintType = null;
  }

}
/**
 * Description builder for an [[DateConstraintInterval|event constraint interval]].
 */

class DateConstraintIntervalDescription extends ConstraintIntervalDescription {
  static get $name() {
    return 'DateConstraintIntervalDescription';
  }
  /**
   * Returns description for the provided event constraint interval.
   * @param interval Constraint interval
   */

  static getDescription(interval) {
    let tpl;

    switch (interval.owner.constraintType) {
      case ConstraintType.StartNoEarlierThan:
      case ConstraintType.FinishNoEarlierThan:
      case ConstraintType.MustStartOn:
      case ConstraintType.MustFinishOn:
        tpl = this.L('L{startDateDescriptionTpl}');
        break;

      case ConstraintType.StartNoLaterThan:
      case ConstraintType.FinishNoLaterThan:
        tpl = this.L('L{endDateDescriptionTpl}');
        break;
    }

    return format(tpl, ...this.getDescriptionParameters(interval));
  }
  /**
   * Returns localized constraint name.
   * @param constraintType Type of constraint
   */

  static getConstraintName(constraintType) {
    return this.L('L{constraintTypeTpl}')[constraintType];
  }

  static getDescriptionParameters(interval) {
    const event = interval.owner;
    return [DateHelper.format(interval.startDate, this.L('L{dateFormat}')), DateHelper.format(interval.endDate, this.L('L{dateFormat}')), event.name || event.id, this.getConstraintName(event.constraintType)];
  }

}
/**
 * Class implements an interval applied by an event [[constraintType|constraint]].
 * The interval suggests the only resolution option - removing the constraint.
 */

class DateConstraintInterval extends ConstraintInterval {
  getConstraintName(constraintType) {
    return this.descriptionBuilderClass.getConstraintName(constraintType || this.owner.constraintType);
  }

  getDescription() {
    return this.descriptionBuilderClass.getDescription(this);
  }

  isAffectedByTransaction(transaction) {
    const event = this.owner;
    transaction = transaction || event.graph.activeTransaction;
    const constraintDateQuark = transaction.entries.get(event.$.constraintDate),
          constraintTypeQuark = transaction.entries.get(event.$.constraintType); // new constrained event or modified constraint

    return !transaction.baseRevision.hasIdentifier(event.$$) || constraintDateQuark && !constraintDateQuark.isShadow() || constraintTypeQuark && !constraintTypeQuark.isShadow();
  }
  /**
   * Returns possible resolution options for cases when
   * the interval takes part in a conflict.
   *
   * The interval suggests the only resolution option - removing the constraint.
   */

  getResolutions() {
    return this.resolutions || (this.resolutions = [this.removeDateConstraintConflictResolutionClass.new({
      interval: this
    })]);
  }

}

__decorate$6([prototypeValue(RemoveDateConstraintConflictResolution)], DateConstraintInterval.prototype, "removeDateConstraintConflictResolutionClass", void 0);

__decorate$6([prototypeValue(DateConstraintIntervalDescription)], DateConstraintInterval.prototype, "descriptionBuilderClass", void 0);

var __decorate$5 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/* TODO
The percentdone logic calculation is a bit different from the Ext version, in regard of milestones
In Ext, the parent task with milestones only has 100% if all its child milestones have 100%, and 0% otherwise
In engine, the % for milestones is calculated just as average. There are other small nuances too.
Personally I think engine's behavior is more logical and we can change it to Ext version behavior
because we have all data.
*/

/**
 * This mixin provides [[percentDone]] field for the event and methods for its calculation.
 *
 * For the parent events percent done is calculated based on the child events (ignores user input).
 * This behavior is controlled with the [[SchedulerProProjectMixin.autoCalculatePercentDoneForParentTasks]] config option.
 * The calculation is implemented in [[calculatePercentDone]] method.
 */

class HasPercentDoneMixin extends Mixin([HasChildrenMixin], base => {
  base.prototype;

  class HasPercentDoneMixin extends base {
    /**
     * Method calculates the task [[percentDone]] field value.
     * For a summary task it calculates the value based on the task children if the project
     * [[SchedulerProProjectMixin.autoCalculatePercentDoneForParentTasks|autoCalculatePercentDoneForParentTasks]] is true (default).
     * And for a regular (leaf) task it just returns the field provded value as-is.
     */
    *calculatePercentDone() {
      const childEvents = yield this.$.childEvents;
      const project = this.getProject();
      const autoCalculatePercentDoneForParentTasks = yield project.$.autoCalculatePercentDoneForParentTasks;

      if (childEvents.size && autoCalculatePercentDoneForParentTasks) {
        const summaryData = yield this.$.percentDoneSummaryData;

        if (summaryData.totalDuration > 0) {
          return summaryData.completedDuration / summaryData.totalDuration;
        } else if (summaryData.milestonesNum > 0) {
          return summaryData.milestonesTotalPercentDone / summaryData.milestonesNum;
        } else {
          return null;
        }
      } else {
        return yield ProposedOrPrevious;
      }
    }
    /**
     * The method defines wether the provided child event should be
     * taken into account when calculating this summary event [[percentDone]].
     *
     * If the method returns `true` the child event is taken into account
     * and if the method returns `false` it's not.
     * By default the method returns `true` to include all child events data.
     * @param childEvent Child event to consider.
     * @returns `true` if the provided event should be taken into account, `false` if not.
     */

    *shouldRollupChildPercentDoneSummaryData(childEvent) {
      return true;
    }

    *calculatePercentDoneSummaryData() {
      const childEvents = yield this.$.childEvents;

      if (childEvents.size) {
        let summary = {
          totalDuration: 0,
          completedDuration: 0,
          milestonesNum: 0,
          milestonesTotalPercentDone: 0
        };

        for (const childEvent of childEvents) {
          if (!(yield* this.shouldRollupChildPercentDoneSummaryData(childEvent))) continue;
          const childSummaryData = yield childEvent.$.percentDoneSummaryData;

          if (childSummaryData) {
            summary.totalDuration += childSummaryData.totalDuration;
            summary.completedDuration += childSummaryData.completedDuration;
            summary.milestonesNum += childSummaryData.milestonesNum;
            summary.milestonesTotalPercentDone += childSummaryData.milestonesTotalPercentDone;
          }
        }

        return summary;
      } else {
        const duration = yield this.$.duration;

        if (typeof duration == 'number') {
          const durationInMs = yield* this.getProject().$convertDuration(duration, yield this.$.durationUnit, TimeUnit.Millisecond);
          const percentDone = yield this.$.percentDone;
          return {
            totalDuration: durationInMs,
            completedDuration: durationInMs * percentDone,
            milestonesNum: durationInMs === 0 ? 1 : 0,
            milestonesTotalPercentDone: durationInMs === 0 ? percentDone : 0
          }; // we can't calculate w/o duration
        } else {
          return null;
        }
      }
    }

  }

  __decorate$5([model_field({
    type: 'number',
    defaultValue: 0
  })], HasPercentDoneMixin.prototype, "percentDone", void 0);

  __decorate$5([field()], HasPercentDoneMixin.prototype, "percentDoneSummaryData", void 0);

  __decorate$5([calculate('percentDone')], HasPercentDoneMixin.prototype, "calculatePercentDone", null);

  __decorate$5([calculate('percentDoneSummaryData')], HasPercentDoneMixin.prototype, "calculatePercentDoneSummaryData", null);

  return HasPercentDoneMixin;
}) {}

var __decorate$4 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * This mixin adds support for scheduling event ASAP, by dependencies. All it does is
 * create the constraint interval for every incoming dependency. See [[ConstrainedEarlyEventMixin]] for
 * more details about constraint-based scheduling.
 *
 * The supported dependency types are listed in this enum: [[DependencyType]]
 */

class ScheduledByDependenciesEarlyEventMixin extends Mixin([ConstrainedEarlyEventMixin, HasDependenciesMixin], base => {
  const superProto = base.prototype;

  class ScheduledByDependenciesEarlyEventMixin extends base {
    /**
     * The method defines wether the provided dependency should constrain the successor or not.
     * If the method returns `true` the dependency constrains the successor and does not do that when `false` returned.
     * By default the method returns `true` if the dependency is [[SchedulerProDependencyMixin.active|active]]
     * and if this event is [[inactive|active]] (or both this event and the successor are [[inactive]]).
     *
     * This is used when calculating [[earlyStartDateConstraintIntervals]].
     * @param dependency Dependency to consider.
     * @returns `true` if the dependency should constrain successor, `false` if not.
     */
    *shouldPredecessorAffectScheduling(dependency) {
      const fromEvent = yield dependency.$.fromEvent; // ignore missing from events and inactive dependencies

      return fromEvent && !isAtomicValue(fromEvent) && (yield dependency.$.active) // ignore inactive predecessor (unless we both are inactive)
      && (!(yield fromEvent.$.inactive) || (yield this.$.inactive));
    }

    *calculateEarlyStartDateConstraintIntervals() {
      const intervals = yield* superProto.calculateEarlyStartDateConstraintIntervals.call(this);
      const project = this.getProject();
      const dependencyConstraintIntervalClass = project.dependencyConstraintIntervalClass;

      for (const dependency of yield this.$.incomingDeps) {
        // ignore missing from events and inactive predecessors/dependencies
        if (!(yield* this.shouldPredecessorAffectScheduling(dependency))) continue;
        const fromEvent = yield dependency.$.fromEvent;
        let interval;

        switch (yield dependency.$.type) {
          case DependencyType.EndToStart:
            const fromEventEndDate = yield fromEvent.$.earlyEndDateRaw;

            if (fromEventEndDate) {
              const lag = yield dependency.$.lag;
              const lagUnit = yield dependency.$.lagUnit;
              const calendar = yield dependency.$.calendar;
              interval = dependencyConstraintIntervalClass.new({
                owner: dependency,
                startDate: calendar.calculateEndDate(fromEventEndDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)),
                endDate: null
              });
            }

            break;

          case DependencyType.StartToStart:
            const fromEventStartDate = yield fromEvent.$.earlyStartDateRaw;

            if (fromEventStartDate) {
              const lag = yield dependency.$.lag;
              const lagUnit = yield dependency.$.lagUnit;
              const calendar = yield dependency.$.calendar;
              interval = dependencyConstraintIntervalClass.new({
                owner: dependency,
                startDate: calendar.calculateEndDate(fromEventStartDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)),
                endDate: null
              });
            }

            break;
        }

        interval && intervals.unshift(interval);
      }

      return intervals;
    }

    *calculateEarlyEndDateConstraintIntervals() {
      const intervals = yield* superProto.calculateEarlyEndDateConstraintIntervals.call(this);
      const project = this.getProject();
      const dependencyConstraintIntervalClass = project.dependencyConstraintIntervalClass;

      for (const dependency of yield this.$.incomingDeps) {
        // ignore missing from events and inactive dependencies
        if (!(yield* this.shouldPredecessorAffectScheduling(dependency))) continue;
        const fromEvent = yield dependency.$.fromEvent;
        let interval;

        switch (yield dependency.$.type) {
          case DependencyType.EndToEnd:
            const fromEventEndDate = yield fromEvent.$.earlyEndDateRaw;

            if (fromEventEndDate) {
              const lag = yield dependency.$.lag;
              const lagUnit = yield dependency.$.lagUnit;
              const calendar = yield dependency.$.calendar;
              interval = dependencyConstraintIntervalClass.new({
                owner: dependency,
                startDate: calendar.calculateEndDate(fromEventEndDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)),
                endDate: null
              });
            }

            break;

          case DependencyType.StartToEnd:
            const fromEventStartDate = yield fromEvent.$.earlyStartDateRaw;

            if (fromEventStartDate) {
              const lag = yield dependency.$.lag;
              const lagUnit = yield dependency.$.lagUnit;
              const calendar = yield dependency.$.calendar;
              interval = dependencyConstraintIntervalClass.new({
                owner: dependency,
                startDate: calendar.calculateEndDate(fromEventStartDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond)),
                endDate: null
              });
            }

            break;
        }

        interval && intervals.unshift(interval);
      }

      return intervals;
    }

  }

  __decorate$4([model_field({
    type: 'boolean'
  })], ScheduledByDependenciesEarlyEventMixin.prototype, "inactive", void 0);

  return ScheduledByDependenciesEarlyEventMixin;
}) {}
/**
 * Base class for dependency interval resolutions.
 */

class BaseDependencyResolution extends Localizable(ConflictResolution) {
  static get $name() {
    return 'BaseDependencyResolution';
  }

  getDescription() {
    const {
      dependency
    } = this,
          {
      type,
      fromEvent,
      toEvent
    } = dependency;
    return format(this.L('L{descriptionTpl}'), this.L('L{DependencyType.long}')[type], fromEvent.name || fromEvent.id, toEvent.name || toEvent.id);
  }

}
/**
 * Dependency resolution removing the dependency.
 */

class RemoveDependencyResolution extends BaseDependencyResolution {
  static get $name() {
    return 'RemoveDependencyResolution';
  }
  /**
   * Resolves the conflict by removing the dependency.
   */

  resolve() {
    this.dependency.remove();
  }

}
/**
 * Dependency resolution deactivating the dependency.
 */

class DeactivateDependencyResolution extends BaseDependencyResolution {
  static get $name() {
    return 'DeactivateDependencyResolution';
  }
  /**
   * Resolves the conflict by deactivating the dependency.
   */

  resolve() {
    this.dependency.active = false;
  }

}
/**
 * Description builder for a [[DependencyConstraintInterval|dependency constraint interval]].
 */

class DependencyConstraintIntervalDescription extends ConstraintIntervalDescription {
  static get $name() {
    return 'DependencyConstraintIntervalDescription';
  }

  static getDescriptionParameters(interval) {
    const dependency = interval.owner;
    return [DateHelper.format(interval.startDate, this.L('L{dateFormat}')), DateHelper.format(interval.endDate, this.L('L{dateFormat}')), this.L('L{DependencyType.long}')[dependency.type], dependency.fromEvent.name, dependency.toEvent.name];
  }

}
/**
 * Constraint interval applied by a dependency.
 *
 * In case for a conflict the class [[getResolutions|suggests]] two resolution options:
 * either [[RemoveDependencyResolution|removing]] or [[DeactivateDependencyResolution|deactivating]] the dependency.
 */

class DependencyConstraintInterval extends ConstraintInterval {
  isAffectedByTransaction(transaction) {
    const dependency = this.owner;
    transaction = transaction || dependency.graph.activeTransaction;
    const {
      entries
    } = transaction,
          // dependency identifiers to check
    {
      fromEvent,
      toEvent,
      lag,
      lagUnit,
      type
    } = dependency.$,
          fromEventQuark = entries.get(fromEvent),
          toEventQuark = entries.get(toEvent),
          lagQuark = entries.get(lag),
          lagUnitQuark = entries.get(lagUnit),
          typeQuark = entries.get(type); // new or modified dependency

    return !transaction.baseRevision.hasIdentifier(dependency.$$) || fromEventQuark && !fromEventQuark.isShadow() || toEventQuark && !toEventQuark.isShadow() || lagQuark && !lagQuark.isShadow() || lagUnitQuark && !lagUnitQuark.isShadow() || typeQuark && !typeQuark.isShadow();
  }
  /**
   * Returns the interval resolution options.
   * There are two resolutions:
   * - [[RemoveDependencyResolution|removing the dependency]]
   * - [[DeactivateDependencyResolution|deactivating the dependency]].
   */

  getResolutions() {
    return this.resolutions || (this.resolutions = [this.deactivateDependencyConflictResolutionClass.new({
      dependency: this.owner
    }), this.removeDependencyConflictResolutionClass.new({
      dependency: this.owner
    })]);
  }

}

__decorate$4([prototypeValue(RemoveDependencyResolution)], DependencyConstraintInterval.prototype, "removeDependencyConflictResolutionClass", void 0);

__decorate$4([prototypeValue(DeactivateDependencyResolution)], DependencyConstraintInterval.prototype, "deactivateDependencyConflictResolutionClass", void 0);

__decorate$4([prototypeValue(DependencyConstraintIntervalDescription)], DependencyConstraintInterval.prototype, "descriptionBuilderClass", void 0);

var __decorate$3 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * This mixins enhances the purely visual [[BaseHasAssignmentsMixin]] with scheduling according
 * to the calendars of the assigned resources.
 *
 * A time interval will be "counted" into the event duration, only if at least one assigned
 * resource has that interval as working time, and the event's own calendar also has that interval
 * as working. Otherwise the time is skipped and not counted into event's duration.
 */

class SchedulerProHasAssignmentsMixin extends Mixin([BaseHasAssignmentsMixin], base => {
  const superProto = base.prototype;

  class SchedulerProHasAssignmentsMixin extends base {
    /**
     * A method which assigns a resource to the current event
     */
    async assign(resource, units = 100) {
      const assignmentCls = this.getProject().assignmentStore.modelClass;
      this.addAssignment(new assignmentCls({
        event: this,
        resource: resource,
        units: units
      }));
      return this.commitAsync();
    }

    *forEachAvailabilityInterval(options, func) {
      const calendar = yield this.$.effectiveCalendar;
      const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
      const effectiveCalendarsCombination = yield this.$.effectiveCalendarsCombination;
      return effectiveCalendarsCombination.forEachAvailabilityInterval(options, (startDate, endDate, calendarCacheIntervalMultiple) => {
        const calendarsStatus = calendarCacheIntervalMultiple.getCalendarsWorkStatus();
        const workCalendars = calendarCacheIntervalMultiple.getCalendarsWorking();

        if (calendarsStatus.get(calendar) && (options.ignoreResourceCalendars || workCalendars.some(calendar => assignmentsByCalendar.has(calendar)))) {
          return func(startDate, endDate, calendarCacheIntervalMultiple);
        }
      });
    } // TODO seems this atom is used in single place only - can be merged there

    *calculateEffectiveCalendarsCombination() {
      const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
      const calendars = [...assignmentsByCalendar.keys(), yield this.$.effectiveCalendar];
      return this.getProject().combineCalendars(calendars);
    }

    *calculateAssignmentsByCalendar() {
      const assignments = yield this.$.assigned;
      const result = new Map();

      for (const assignment of assignments) {
        const resource = yield assignment.$.resource;

        if (resource) {
          const resourceCalendar = yield resource.$.effectiveCalendar;
          let assignments = result.get(resourceCalendar);

          if (!assignments) {
            assignments = [];
            result.set(resourceCalendar, assignments);
          }

          assignments.push(assignment);
        }
      }

      return result;
    }

    *getBaseOptionsForDurationCalculations() {
      return {
        ignoreResourceCalendars: false
      };
    }

    *skipNonWorkingTime(date, isForward = true) {
      if (!date) return null;
      const assignmentsByCalendar = yield this.$.assignmentsByCalendar;

      if (assignmentsByCalendar.size > 0) {
        const options = Object.assign(yield* this.getBaseOptionsForDurationCalculations(), isForward ? {
          startDate: date,
          isForward
        } : {
          endDate: date,
          isForward
        });
        let workingDate;
        const skipRes = yield* this.forEachAvailabilityInterval(options, (startDate, endDate, calendarCacheIntervalMultiple) => {
          workingDate = isForward ? startDate : endDate;
          return false;
        });

        if (skipRes === CalendarIteratorResult.MaxRangeReached || skipRes === CalendarIteratorResult.FullRangeIterated) {
          const effect = EmptyCalendarEffect.new({
            calendars: [yield this.$.effectiveCalendar, ...assignmentsByCalendar.keys()],
            event: this,
            date,
            isForward
          });

          if ((yield effect) === EffectResolutionResult.Cancel) {
            yield Reject(effect);
          } else {
            return null;
          }
        }

        return new Date(workingDate);
      } else {
        return yield* superProto.skipNonWorkingTime.call(this, date, isForward);
      }
    }

    *calculateProjectedDuration(startDate, endDate, durationUnit) {
      if (!startDate || !endDate) {
        return null;
      }

      const assignmentsByCalendar = yield this.$.assignmentsByCalendar;

      if (assignmentsByCalendar.size > 0) {
        const options = Object.assign(yield* this.getBaseOptionsForDurationCalculations(), {
          startDate,
          endDate,
          isForward: true
        });
        let result = 0;
        yield* this.forEachAvailabilityInterval(options, (startDate, endDate) => {
          result += endDate.getTime() - startDate.getTime();
        });
        if (!durationUnit) durationUnit = yield this.$.durationUnit;
        return yield* this.getProject().$convertDuration(result, TimeUnit.Millisecond, durationUnit);
      } else {
        return yield* superProto.calculateProjectedDuration.call(this, startDate, endDate, durationUnit);
      }
    }

    *calculateProjectedXDateWithDuration(baseDate, isForward = true, duration) {
      if (duration == null || isNaN(duration) || baseDate == null) return null;
      if (duration == 0) return baseDate;
      const durationUnit = yield this.$.durationUnit;
      const durationMS = yield* this.getProject().$convertDuration(duration, durationUnit, TimeUnit.Millisecond);
      let resultN = baseDate.getTime();
      let leftDuration = durationMS;
      const calendar = yield this.$.effectiveCalendar;
      const assignmentsByCalendar = yield this.$.assignmentsByCalendar;

      if (assignmentsByCalendar.size > 0) {
        const options = Object.assign(yield* this.getBaseOptionsForDurationCalculations(), isForward ? {
          startDate: baseDate,
          isForward
        } : {
          endDate: baseDate,
          isForward
        });
        yield* this.forEachAvailabilityInterval(options, (intervalStart, intervalEnd, calendarCacheIntervalMultiple) => {
          const intervalStartN = intervalStart.getTime(),
                intervalEndN = intervalEnd.getTime(),
                intervalDuration = intervalEndN - intervalStartN;

          if (intervalDuration >= leftDuration) {
            resultN = isForward ? intervalStartN + leftDuration : intervalEndN - leftDuration;
            return false;
          } else {
            leftDuration -= intervalDuration;

            if (this.getProject().adjustDurationToDST) {
              const dstDiff = intervalStart.getTimezoneOffset() - intervalEnd.getTimezoneOffset();
              leftDuration -= dstDiff * 60 * 1000;
            }
          }
        });
        return new Date(resultN);
      } else {
        return calendar.accumulateWorkingTime(baseDate, durationMS, isForward).finalDate;
      }
    }

  }

  __decorate$3([field()], SchedulerProHasAssignmentsMixin.prototype, "effectiveCalendarsCombination", void 0);

  __decorate$3([field()], SchedulerProHasAssignmentsMixin.prototype, "assignmentsByCalendar", void 0);

  __decorate$3([calculate('effectiveCalendarsCombination')], SchedulerProHasAssignmentsMixin.prototype, "calculateEffectiveCalendarsCombination", null);

  __decorate$3([calculate('assignmentsByCalendar')], SchedulerProHasAssignmentsMixin.prototype, "calculateAssignmentsByCalendar", null);

  return SchedulerProHasAssignmentsMixin;
}) {}

/**
 * This is an event class, [[SchedulerProProjectMixin]] is working with.
 * It is constructed as [[SchedulerBasicEvent]], enhanced with extra functionality.
 */

class SchedulerProEvent extends Mixin([SchedulerBasicEvent, HasDateConstraintMixin, HasPercentDoneMixin, SchedulerProHasAssignmentsMixin, ConstrainedEarlyEventMixin, ScheduledByDependenciesEarlyEventMixin], base => {
  base.prototype;

  class SchedulerProEvent extends base {}

  return SchedulerProEvent;
}) {}

var __decorate$2 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class SchedulerProAssignmentMixin extends Mixin([BaseAssignmentMixin], base => {
  base.prototype;

  class SchedulerProAssignmentMixin extends base {}

  __decorate$2([model_field({
    type: 'number',
    defaultValue: 100
  })], SchedulerProAssignmentMixin.prototype, "units", void 0);

  return SchedulerProAssignmentMixin;
}) {}

var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ResourceAllocationEventRangeCalendarIntervalMixin extends CalendarIntervalMixin {
  // @model_field({ type : 'boolean', defaultValue : true })
  // isWorking : boolean
  // Calendar classes not entering graph, thus not using @model_field
  static get fields() {
    return [{
      name: 'isWorking',
      type: 'boolean',
      defaultValue: true
    }];
  }

}
class ResourceAllocationEventRangeCalendarIntervalStore extends CalendarIntervalStore {
  static get defaultConfig() {
    return {
      modelClass: ResourceAllocationEventRangeCalendarIntervalMixin
    };
  }

}
class ResourceAllocationEventRangeCalendar extends BaseCalendarMixin {
  get intervalStoreClass() {
    return ResourceAllocationEventRangeCalendarIntervalStore;
  }

}

__decorate$1([model_field({
  type: 'boolean',
  defaultValue: false
})], ResourceAllocationEventRangeCalendar.prototype, "unspecifiedTimeIsWorking", void 0);

class BaseAllocationInterval extends Base {
  constructor() {
    super(...arguments);
    /**
     * Effort in the [[tick|interval]] in milliseconds.
     */

    this.effort = 0;
    /**
     * Utilization level of the resource (or the assignment if the interval represents the one) in percent.
     */

    this.units = 0;
  }

}
class AssignmentAllocationInterval extends BaseAllocationInterval {}
/**
 * Resource allocation information for a certain tick.
 */

class ResourceAllocationInterval extends BaseAllocationInterval {
  constructor() {
    super(...arguments);
    /**
     * Maximum possible effort in the [[tick|interval]] in milliseconds.
     */

    this.maxEffort = 0;
    /**
     * Indicates that the resource (or the assignment if the interval represents the one) is over-allocated in the [[tick|interval]].
     * So `true` when [[effort]] is more than [[maxEffort|possible maximum]].
     */

    this.isOverallocated = false;
    /**
     * Indicates that the resource (or assignment if the interval represents the one) is under-allocated in the [[tick|interval]].
     * So `true` when [[effort]] is less than [[maxEffort|possible maximum]].
     */

    this.isUnderallocated = false;
    /**
     * Resource assignments ingoing in the [[tick|interval]].
     */

    this.assignments = null;
    this.assignmentIntervals = null;
  }

}
class BaseAllocationInfo extends Entity.mix(Base) {
  getDefaultAllocationIntervalClass() {
    return BaseAllocationInterval;
  }

  initialize(props) {
    props = Object.assign({
      includeInactiveEvents: false,
      allocationIntervalClass: this.getDefaultAllocationIntervalClass()
    }, props);
    super.initialize(props);
  }

}

__decorate$1([field()], BaseAllocationInfo.prototype, "includeInactiveEvents", void 0);

__decorate$1([field()], BaseAllocationInfo.prototype, "allocation", void 0);
/**
 * Class implementing _resource allocation report_ - a data representing the provided [[resource]]
 * utilization in the provided period of time.
 * The data is grouped by the provided [[ticks|time intervals]]
 */

class ResourceAllocationInfo extends BaseAllocationInfo {
  enterGraph(graph) {
    super.enterGraph(graph);
  }

  leaveGraph(graph) {
    super.leaveGraph(graph);

    if (this.resource) {
      this.resource.entities.delete(this);
    }
  }

  getDefaultAllocationIntervalClass() {
    return ResourceAllocationInterval;
  }

  *shouldIncludeAssignmentInAllocation(assignment) {
    const event = yield assignment.$.event,
          units = yield assignment.$.units,
          includeInactiveEvents = yield this.$.includeInactiveEvents,
          inactive = event && (yield event.$.inactive),
          // includeInactiveEvents
    startDate = event && (yield event.$.startDate),
          endDate = event && (yield event.$.endDate);
    return Boolean(event && units && startDate && endDate && (includeInactiveEvents || !inactive));
  }

  *calculateAllocation() {
    const total = [],
          ticksCalendar = yield this.ticks,
          resource = yield this.$.resource;
          yield this.$.includeInactiveEvents;
          const assignments = yield resource.$.assigned,
          assignmentsByCalendar = new Map(),
          eventRanges = [];
    const assignmentTicksData = new Map();
    const byAssignments = new Map(); // collect the resource assignments into assignmentsByCalendar map

    for (const assignment of assignments) {
      // skip missing or unscheduled event assignments
      if (!(yield* this.shouldIncludeAssignmentInAllocation(assignment))) continue; // we're going to need up-to-date assignment "units" below in this method ..so we yield it here

      yield assignment.$.units;
      const event = yield assignment.$.event,
            startDate = yield event.$.startDate,
            endDate = yield event.$.endDate;
      eventRanges.push({
        startDate,
        endDate,
        assignment
      });
      const eventCalendar = yield event.$.effectiveCalendar;
      let assignments = assignmentsByCalendar.get(eventCalendar);

      if (!assignments) {
        assignments = [];
        assignmentsByCalendar.set(eventCalendar, assignments);
      }

      assignmentTicksData.set(assignment, new Map());
      byAssignments.set(assignment, []);
      assignments.push(assignment);
    }

    const eventRangesCalendar = new ResourceAllocationEventRangeCalendar({
      intervals: eventRanges
    }); // Provide extra calendars:
    // 1) a calendar containing list of ticks to group the resource allocation by
    // 2) a calendar containing list of assigned event start/end ranges
    // 3) assigned task calendars

    const calendars = [ticksCalendar, eventRangesCalendar, ...assignmentsByCalendar.keys()];
    const ticksData = new Map(); // Initialize the resulting array with empty items

    ticksCalendar.intervalStore.forEach(tick => {
      const tickData = ResourceAllocationInterval.new({
        tick,
        resource
      });
      ticksData.set(tick, tickData);
      total.push(tickData);
      assignmentTicksData.forEach((ticksData, assignment) => {
        const assignmentTickData = AssignmentAllocationInterval.new({
          tick,
          assignment
        });
        ticksData.set(tick, assignmentTickData);
        byAssignments.get(assignment).push(assignmentTickData);
      });
    });
    let weightedUnitsSum, weightsSum;
    const startDate = total[0].tick.startDate,
          endDate = total[total.length - 1].tick.endDate,
          iterationOptions = {
      startDate,
      endDate,
      calendars
    },
          ticksTotalDuration = endDate.getTime() - startDate.getTime(); // provide extended maxRange if total ticks duration is greater than it
    // TODO change this line when maxRange config is made public on the project

    if (ticksTotalDuration > 5 * 12 * 30 * 24 * 60 * 60 * 1000) {
      iterationOptions.maxRange = ticksTotalDuration;
    }

    yield* resource.forEachAvailabilityInterval(iterationOptions, (intervalStartDate, intervalEndDate, intervalData) => {
      const isWorkingCalendar = intervalData.getCalendarsWorkStatus(); // We are inside a tick interval and it's a working time according
      // to a resource calendar

      if (isWorkingCalendar.get(ticksCalendar)) {
        const tick = intervalData.intervalsByCalendar.get(ticksCalendar)[0],
              intervalDuration = intervalEndDate.getTime() - intervalStartDate.getTime(),
              tickData = ticksData.get(tick),
              tickAssignments = tickData.assignments || new Set(),
              tickAssignmentIntervals = tickData.assignmentIntervals || new Map();

        if (!tickData.assignments) {
          weightedUnitsSum = 0;
          weightsSum = 0;
        }

        let units = 0,
            duration,
            intervalHasAssignments = false;
        intervalData.intervalsByCalendar.get(eventRangesCalendar).forEach(interval => {
          const assignment = interval.assignment; // TODO:
          // We don't do yield "assignment.event.*" expressions since we did it previously
          // while looping the assignments because we cannot yield from the iterator callback

          if (assignment && isWorkingCalendar.get(assignment.event.effectiveCalendar)) {
            // constrain the event start/end with the tick borders
            const workingStartDate = Math.max(intervalStartDate.getTime(), assignment.event.startDate.getTime());
            const workingEndDate = Math.min(intervalEndDate.getTime(), assignment.event.endDate.getTime());
            intervalHasAssignments = true;
            duration = workingEndDate - workingStartDate;
            const assignmentInterval = assignmentTicksData.get(assignment).get(tick);
            const assignmentEffort = duration * assignment.units / 100;
            assignmentInterval.effort += assignmentEffort;
            assignmentInterval.units = assignment.units;
            tickData.effort += assignmentEffort; // collect total resource usage percent in the current interval

            units += assignment.units;
            tickAssignments.add(assignment);
            tickAssignmentIntervals.set(assignment, assignmentInterval);
          }
        });
        tickData.maxEffort += intervalDuration; //duration || 0
        // if we have assignments running in the interval - calculate average allocation %

        if (units) {
          if (duration) {
            // keep weightedUnitsSum & weightsSum since there might be another intervals in the tick
            weightedUnitsSum += duration * units;
            weightsSum += duration; // "units" weighted arithmetic mean w/ duration values as weights

            tickData.units = weightedUnitsSum / weightsSum;
          } else if (!weightedUnitsSum) {
            tickData.units = units;
          }
        }

        if (intervalHasAssignments) {
          tickData.assignments = tickAssignments;
          tickData.assignmentIntervals = tickAssignmentIntervals;
          tickData.isOverallocated = tickData.isOverallocated || units > 100;
          tickData.isUnderallocated = tickData.isUnderallocated || units < 100;
        }
      }
    });
    return {
      total,
      byAssignments
    };
  }

}

__decorate$1([field()], ResourceAllocationInfo.prototype, "resource", void 0);

__decorate$1([calculate('allocation')], ResourceAllocationInfo.prototype, "calculateAllocation", null);
/**
 * A mixin for the resource entity at the Scheduler Pro level.
 */

class SchedulerProResourceMixin extends Mixin([BaseResourceMixin], base => {
  const superProto = base.prototype;

  class SchedulerProResourceMixin extends base {
    constructor() {
      super(...arguments);
      this.observers = new Set();
      this.entities = new Set();
    }

    addObserver(observer) {
      this.graph.addIdentifier(observer);
      this.observers.add(observer);
    }

    removeObserver(observer) {
      if (this.graph) {
        this.graph.removeIdentifier(observer);
      }

      this.observers.delete(observer);
    }

    addEntity(entity) {
      this.graph.addEntity(entity);
      this.entities.add(entity);
    }

    removeEntity(entity) {
      if (this.graph) {
        this.graph.removeEntity(entity);
      }

      this.entities.delete(entity);
    }

    leaveGraph(replica) {

      for (const observer of this.observers) {
        this.removeObserver(observer);
      }

      for (const entity of this.entities) {
        this.removeEntity(entity);
      }

      superProto.leaveGraph.call(this, replica);
    }

    *forEachAvailabilityInterval(options, func) {
      const calendar = yield this.$.effectiveCalendar;
      const effectiveCalendarsCombination = this.getProject().combineCalendars([calendar].concat(options.calendars || []));
      return effectiveCalendarsCombination.forEachAvailabilityInterval(options, (startDate, endDate, calendarCacheIntervalMultiple) => {
        const calendarsStatus = calendarCacheIntervalMultiple.getCalendarsWorkStatus();

        if (calendarsStatus.get(calendar)) {
          return func(startDate, endDate, calendarCacheIntervalMultiple);
        }
      });
    }

  }

  return SchedulerProResourceMixin;
}) {}

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * Scheduler Pro project mixin type. At this level, events are scheduled according to the incoming dependencies
 * and calendars of the assigned resources.
 *
 * The base event class for this level is [[SchedulerProEvent]]. The base dependency class is [[SchedulerProDependencyMixin]]
 */

class SchedulerProProjectMixin extends Mixin([SchedulerBasicProjectMixin, ConstrainedEarlyEventMixin], base => {
  const superProto = base.prototype;

  class SchedulerProProjectMixin extends base {
    construct(config = {}) {
      superProto.construct.call(this, config);
      if (!this.resourceAllocationInfoClass) this.resourceAllocationInfoClass = this.getDefaultResourceAllocationInfoClass();
    }

    getDefaultResourceAllocationInfoClass() {
      return ResourceAllocationInfo;
    }

    *calculateDirection() {
      return yield ProposedOrPrevious;
    }

    afterConfigure() {
      superProto.afterConfigure.apply(this, arguments);
      this.dateConstraintIntervalClass = this.dateConstraintIntervalClass || DateConstraintInterval;
      this.dependencyConstraintIntervalClass = this.dependencyConstraintIntervalClass || DependencyConstraintInterval;
    }

    getType() {
      return ProjectType.SchedulerPro;
    }

    getDefaultCycleEffectClass() {
      return SchedulerProCycleEffect;
    }

    getDefaultEventModelClass() {
      return SchedulerProEvent;
    }

    getDefaultDependencyModelClass() {
      return SchedulerProDependencyMixin;
    }

    getDefaultAssignmentModelClass() {
      return SchedulerProAssignmentMixin;
    }

    getDefaultResourceModelClass() {
      return SchedulerProResourceMixin;
    }
    /**
     * Validates a hypothetical dependency with provided parameters.
     *
     * ```ts
     * // let's check if a EndToStart dependency linking event1 with event2 will be valid
     * const validationResult = await project.validateDependency(event1, event2, DependencyType.EndToStart);
     *
     * switch (validationResult) {
     *     const DependencyValidationResult.CyclicDependency :
     *         console.log('Dependency builds a cycle');
     *         break;
     *
     *     const DependencyValidationResult.DuplicatingDependency :
     *         console.log('Such dependency already exists');
     *         break;
     *
     *     const DependencyValidationResult.NoError :
     *         console.log('Dependency is valid');
     * }
     * ```
     *
     * See also [[isValidDependency]] method for more basic usage.
     *
     * @param fromEvent The dependency predecessor
     * @param toEvent The dependency successor
     * @param type The dependency type
     * @param ignoreDependency Dependencies to ignore while validating. This parameter can be used for example if one plans to change
     * an existing dependency properties and wants to know if the change will lead to an error:
     *
     * ```ts
     * // let's check if changing of the dependency predecessor to newPredecessor will make it invalid
     * const validationResult = await project.validateDependency(newPredecessor, dependency.toEvent, dependency.type, dependency);
     *
     * if (validationResult !== DependencyValidationResult.NoError) console.log("The dependency is invalid");
     * ```
     * @return The validation result
     */

    async validateDependency(fromEvent, toEvent, type, ignoreDependency) {
      let ingoredDependencies;

      if (ignoreDependency) {
        ingoredDependencies = Array.isArray(ignoreDependency) ? ignoreDependency : [ignoreDependency];
      }

      const alreadyLinked = CI(fromEvent.outgoingDeps).some(dependency => {
        var _ingoredDependencies;

        return dependency.toEvent === toEvent && !((_ingoredDependencies = ingoredDependencies) !== null && _ingoredDependencies !== void 0 && _ingoredDependencies.includes(dependency));
      });
      if (alreadyLinked) return DependencyValidationResult.DuplicatingDependency;

      if (await this.isDependencyCyclic(fromEvent, toEvent, type, ingoredDependencies)) {
        return DependencyValidationResult.CyclicDependency;
      }

      return DependencyValidationResult.NoError;
    }
    /**
     * Validates a hypothetical dependency with provided parameters.
     *
     * ```ts
     * // let's check if a EndToStart dependency linking event1 with event2 will be valid
     * if (await project.isValidDependency(event1, event2, DependencyType.EndToStart)) {
     *     console.log('Dependency is valid');
     * } else {
     *     console.log('Dependency is invalid');
     * }
     * ```
     *
     * See also [[validateDependency]] method for more detailed validation results.
     *
     * @param fromEvent The dependency predecessor
     * @param toEvent The dependency successor
     * @param type The dependency type
     * @param ignoreDependency Dependencies to ignore while validating. This parameter can be used for example if one plans to change
     * an existing dependency properties and wants to know if the change will lead to an error:
     *
     * ```ts
     * // let's check if changing of the dependency predecessor to newPredecessor will make it invalid
     * if (await project.isValidDependency(newPredecessor, dependency.toEvent, dependency.type, dependency)) console.log("The dependency is valid");
     * ```
     * @return The validation result
     */
    // this does not account for possible scheduling conflicts

    async isValidDependency(fromEvent, toEvent, type, ignoreDependency) {
      const validationResult = await this.validateDependency(fromEvent, toEvent, type, ignoreDependency);
      return validationResult === DependencyValidationResult.NoError;
    }

    getDependencyCycleDetectionIdentifiers(fromEvent, toEvent) {
      return [// @ts-ignore
      toEvent.$.earlyStartDateConstraintIntervals, // @ts-ignore
      toEvent.$.earlyEndDateConstraintIntervals];
    }

    async isDependencyCyclic(fromEvent, toEvent, type, ignoreDependency) {
      const dependencyClass = this.getDependencyStore().modelClass;
      const dependency = new dependencyClass({
        fromEvent,
        toEvent,
        type
      });
      const branch = this.replica.branch({
        autoCommit: false,
        onComputationCycle: 'throw'
      });

      if (ignoreDependency) {
        if (!Array.isArray(ignoreDependency)) {
          ignoreDependency = [ignoreDependency];
        }

        ignoreDependency.forEach(dependency => branch.removeEntity(dependency));
      }

      branch.addEntity(dependency);
      dependency.project = this; // search for identifiers reading of which finds a cycle
      // for (const i of Object.keys(toEvent.$)) {
      //     try {
      //         await branch.readAsync(toEvent.$[i])
      //     } catch (e) {
      //         if (/cycle/i.test(e)) {
      //             // dump found identifier names to console
      //             console.log(i)
      //         }
      //         else
      //             throw e
      //     }
      // }

      try {
        await Promise.all(this.getDependencyCycleDetectionIdentifiers(fromEvent, toEvent).map(i => branch.readAsync(i)));
        return false;
      } catch (e) {
        // return true for the cycle exception and re-throw all others
        if (/cycle/i.test(e)) return true; // We don't throw on conflicts here ..it's supposed to happen when the changes really reach the graph

        if (!/conflict/i.test(e)) {
          throw e;
        }
      }
    } // work in progress
    // This method validates changes (e.g. type) for existing dependencies (which are already in the store)

    async isValidDependencyModel(dependency, ignoreDependencies) {
      return this.isValidDependency(dependency.fromEvent, dependency.toEvent, dependency.type, ignoreDependencies);
    }

  }

  __decorate([model_field({
    type: 'string',
    defaultValue: DependenciesCalendar.ToEvent
  })], SchedulerProProjectMixin.prototype, "dependenciesCalendar", void 0);

  __decorate([model_field({
    type: 'boolean',
    defaultValue: true
  })], SchedulerProProjectMixin.prototype, "autoCalculatePercentDoneForParentTasks", void 0);

  return SchedulerProProjectMixin;
}) {}
/**
 * A cycle resolution deactivating one of the [[getDependencies|related dependencies]].
 * The dependency instance should be passed to [[resolve]] method:
 *
 * ```ts
 * // this call will deactivate dependencyRecord
 * removalResolution.resolve(dependencyRecord)
 * ```
 */

class DeactivateDependencyCycleEffectResolution extends Localizable(SchedulingIssueEffectResolution) {
  static get $name() {
    return 'DeactivateDependencyCycleEffectResolution';
  }

  getDescription() {
    return this.L('L{descriptionTpl}');
  }

  resolve(dependency) {
    dependency.active = false;
  }

}
/**
 * Class implementing a special effect signalizing of a computation cycle.
 * The class suggests two [[getResolutions|resolutions]] - either removing or deactivating one of
 * the [[getDependencies|related dependencies]].
 */

class SchedulerProCycleEffect extends CycleEffect {
  /**
   * Returns dependencies taking part in the cycle that are treated as invalid.
   * For example a "parent-child" dependency or a dependency linking a task to itself.
   */
  getInvalidDependencies() {
    if (!this._invalidDependencies) {
      const dependencies = this.getDependencies();
      this._invalidDependencies = dependencies.filter(dependency => // @ts-ignore
      dependency.fromEvent === dependency.toEvent || dependency.fromEvent.contains(dependency.toEvent) || dependency.toEvent.contains(dependency.fromEvent));
    }

    return this._invalidDependencies;
  }

  buildInvalidDependencyResolutions(config) {
    return [this.removeDependencyConflictResolutionClass.new(config), this.deactivateDependencyConflictResolutionClass.new(config)];
  }

  matchDependencyBySourceAndTargetEvent(dependency, from, to) {
    return dependency.active && super.matchDependencyBySourceAndTargetEvent(dependency, from, to);
  }

  getResolutions() {
    if (!this._resolutions) {
      const invalidDependencies = this.getInvalidDependencies();
      const result = [];

      for (const dependency of invalidDependencies) {
        result.push(...this.buildInvalidDependencyResolutions({
          dependency
        }));
      } // If we have invalid dependencies we do not suggest other dependency resolutions
      // to force resolving the invalid ones first

      if (!invalidDependencies.length) {
        result.push(this.deactivateDependencyCycleEffectResolutionClass.new(), ...super.getResolutions());
      }

      this._resolutions = result;
    }

    return this._resolutions;
  }

}

__decorate([prototypeValue(DeactivateDependencyCycleEffectResolution)], SchedulerProCycleEffect.prototype, "deactivateDependencyCycleEffectResolutionClass", void 0);

__decorate([prototypeValue(RemoveDependencyResolution)], SchedulerProCycleEffect.prototype, "removeDependencyConflictResolutionClass", void 0);

__decorate([prototypeValue(DeactivateDependencyResolution)], SchedulerProCycleEffect.prototype, "deactivateDependencyConflictResolutionClass", void 0);

/**
 * @module SchedulerPro/widget/ModelCombo
 */

/**
 * A special {@link Core.widget.Combo} subclass returning a {@link Core.data.Model} instance from its store as the value
 * @extends Core/widget/Combo
 * @classType modelcombo
 */

class ModelCombo extends Combo {
  //region Config
  static get $name() {
    return 'ModelCombo';
  } // Factoryable type name

  static get type() {
    return 'modelcombo';
  } //endregion
  //region Internal

  get value() {
    const superValue = super.value,
          model = this.store.getById(superValue);
    return model || superValue;
  }

  set value(v) {
    super.value = v;
  } //endregion

} // Register this widget type with its Factory

ModelCombo.initClass();
ModelCombo._$name = 'ModelCombo';

/**
 * @module SchedulerPro/widget/CalendarField
 */

/**
 * A combo used to select the calendar for an event. This field can be seen in the {@link SchedulerPro.widget.taskeditor.AdvancedTab}
 * {@inlineexample SchedulerPro/widget/CalendarField.js}
 * @extends SchedulerPro/widget/ModelCombo
 * @classtype calendarfield
 */

class CalendarField extends ModelCombo {
  //region Config
  static get $name() {
    return 'CalendarField';
  } // Factoryable type name

  static get type() {
    return 'calendarfield';
  }

  static get defaultConfig() {
    return {
      valueField: 'id',
      displayField: 'name',
      editable: false,

      /**
       * The store containing the calendars
       * @config {SchedulerPro.data.CalendarManagerStore}
       */
      store: null,
      listItemTpl: calendar => {
        return calendar.name || this.L('L{Default calendar}');
      },
      displayValueRenderer: (calendar, field) => {
        var _field$store, _field$store$project, _calendar;

        calendar = calendar || ((_field$store = field.store) === null || _field$store === void 0 ? void 0 : (_field$store$project = _field$store.project) === null || _field$store$project === void 0 ? void 0 : _field$store$project.effectiveCalendar);
        return ((_calendar = calendar) === null || _calendar === void 0 ? void 0 : _calendar.name) || this.L('L{Default calendar}');
      }
    };
  } //endregion
  //region Internal

  get value() {
    return super.value;
  }

  set value(v) {
    if (v && v.isDefault && v.isDefault()) {
      v = null;
    }

    super.value = v;
  } //endregion

} // Register this widget type with its Factory

CalendarField.initClass();
CalendarField._$name = 'CalendarField';

/**
 * @module SchedulerPro/data/mixin/PartOfProject
 */

const throwIfNotTheSameStore = (oldStore, newStore) => {
  if (oldStore !== newStore) {
    throw new Error('Store set is prohibited for Scheduler Pro entity!');
  }
};
/**
 * This is a mixin, included in all models and stores of the Scheduler Pro project. It provides a common API for accessing
 * all stores of the project.
 *
 * @typings Scheduler/data/mixin/PartOfProject -> Scheduler/data/mixin/SchedulerPartOfProject
 *
 * @mixin
 */

var PartOfProject = (Target => class PartOfProject extends (Target || Base$1) {
  static get $name() {
    return 'PartOfProject';
  }
  /**
   * Returns the project this entity belongs to.
   *
   * @member {SchedulerPro.model.ProjectModel} project
   * @readonly
   */

  /**
   * An {@link SchedulerPro.data.EventStore} instance or a config object.
   * @config {SchedulerPro.data.EventStore|Object} taskStore
   * @category Project
   */

  /**
   * The {@link SchedulerPro.data.EventStore store} holding the events information.
   *
   * @member {SchedulerPro.data.EventStore}
   * @category Project
   * @readonly
   */

  get taskStore() {
    return this.eventStore;
  } // this setter actually does nothing, intentionally, setting the stores on other stores is deprecated

  set taskStore(store) {
    this.eventStore = store;
  }
  /**
   * Returns the task store of the project this entity belongs to.
   *
   * @property {SchedulerPro.data.EventStore}
   * @category Project
   * @readonly
   * @typings Scheduler/model/mixin/ProjectModelMixin:eventStore -> {Scheduler.data.EventStore|SchedulerPro.data.EventStore}
   */

  get eventStore() {
    var _this$project;

    return (_this$project = this.project) === null || _this$project === void 0 ? void 0 : _this$project.eventStore;
  }

  get leftProjectEventStore() {
    const project = this.leftProject;
    return (project === null || project === void 0 ? void 0 : project.getEventStore()) || null;
  } // this setter actually does nothing, intentionally, setting the stores on other stores is deprecated

  set eventStore(store) {
    throwIfNotTheSameStore(this.eventStore, store);
  }
  /**
   * Returns the dependency store of the project this entity belongs to.
   *
   * @property {SchedulerPro.data.DependencyStore}
   * @category Project
   * @readonly
   * @typings Scheduler/model/mixin/ProjectModelMixin:dependencyStore -> {Scheduler.data.DependencyStore|SchedulerPro.data.DependencyStore}
   */

  get dependencyStore() {
    var _this$project2;

    return (_this$project2 = this.project) === null || _this$project2 === void 0 ? void 0 : _this$project2.dependencyStore;
  } // this setter actually does nothing, intentionally, setting the stores on other stores is deprecated

  set dependencyStore(store) {
    throwIfNotTheSameStore(this.dependencyStore, store);
  }
  /**
   * Returns the assignment store of the project this entity belongs to.
   *
   * @property {SchedulerPro.data.AssignmentStore}
   * @readonly
   * @category Project
   * @typings Scheduler/model/mixin/ProjectModelMixin:assignmentStore -> {Scheduler.data.AssignmentStore|SchedulerPro.data.AssignmentStore}
   */

  get assignmentStore() {
    var _this$project3;

    return (_this$project3 = this.project) === null || _this$project3 === void 0 ? void 0 : _this$project3.assignmentStore;
  } // this setter actually does nothing, intentionally, setting the stores on other stores is deprecated

  set assignmentStore(store) {
    throwIfNotTheSameStore(this.assignmentStore, store);
  }
  /**
   * Returns the resource store of the project this entity belongs to.
   *
   * @property {SchedulerPro.data.ResourceStore}
   * @readonly
   * @category Project
   * @typings Scheduler/model/mixin/ProjectModelMixin:resourceStore -> {Scheduler.data.ResourceStore|SchedulerPro.data.ResourceStore}
   */

  get resourceStore() {
    var _this$project4;

    return (_this$project4 = this.project) === null || _this$project4 === void 0 ? void 0 : _this$project4.resourceStore;
  } // this setter actually does nothing, intentionally, setting the stores on other stores is deprecated

  set resourceStore(store) {
    throwIfNotTheSameStore(this.resourceStore, store);
  }
  /**
   * Returns the calendar manager store of the project this entity belongs to.
   *
   * @property {SchedulerPro.data.CalendarManagerStore}
   * @readonly
   * @category Project
   */

  get calendarManagerStore() {
    var _this$project5;

    return (_this$project5 = this.project) === null || _this$project5 === void 0 ? void 0 : _this$project5.calendarManagerStore;
  } // this setter actually does nothing, intentionally, setting the stores on other stores is deprecated

  set calendarManagerStore(store) {
    throwIfNotTheSameStore(this.calendarManagerStore, store);
  }

});

/**
 * @module SchedulerPro/model/AssignmentModel
 */

/**
 * This class represent a single assignment of a resource to an event in Scheduler Pro. It has a lot in common with
 * Schedulers AssignmentModel, they are separate models but they share much functionality using the
 * {@link Scheduler.model.mixin.AssignmentModelMixin AssignmentModelMixin} mixin.
 *
 * It is a subclass of {@link Core.data.Model} class. Please refer to the documentation for that class to become
 * familiar with the base interface of this class.
 *
 * ## Fields and references
 *
 * An Assignment has the following fields:
 * - `id` - The id of the assignment
 * - `resourceId` - The id of the resource assigned (optionally replaced with `resource` for load)
 * - `eventId` - The id of the event to which the resource is assigned (optionally replaced with `event` for load)
 *
 * The data source for these fields can be customized by subclassing this class:
 *
 * ```javascript
 * class MyAssignment extends AssignmentModel {
 *   static get fields() {
 *       return [
 *          { name : 'resourceId', dataSource : 'linkedResource' }
 *       ];
 *   }
 * }
 * ```
 *
 * After load and project normalization, these references are accessible (assuming their respective stores are loaded):
 * - `event` - The linked event record
 * - `resource` - The linked resource record
 *
 * ## Async resolving of references
 *
 * As described above, an assignment links an event to a resource. It holds references to an event record and a resource
 * record. These references are populated async, using the calculation engine of the project that the assignment via
 * its store is a part of. Because of this asyncness, references cannot be used immediately after modifications:
 *
 * ```javascript
 * assignment.resourceId = 2;
 * // assignment.resource is not yet available
 * ```
 *
 * To make sure references are updated, wait for calculations to finish:
 *
 * ```javascript
 * assignment.resourceId = 2;
 * await assignment.project.commitAsync();
 * // assignment.resource is available
 * ```
 *
 * As an alternative, you can also use `setAsync()` to trigger calculations directly after the change:
 *
 * ```javascript
 * await assignment.setAsync({ resourceId : 2});
 * // assignment.resource is available
 * ```
 *
 * @extends Core/data/Model
 * @mixes Scheduler/model/mixin/AssignmentModelMixin
 * @uninherit Core/data/mixin/TreeNode
 * @typings Scheduler/model/AssignmentModel -> Scheduler/model/SchedulerAssignmentModel
 */

class AssignmentModel extends PartOfProject(AssignmentModelMixin(SchedulerProAssignmentMixin.derive(Model))) {
  // NOTE: Leave field defs at top to be picked up by jsdoc

  /**
   * Id for event to assign. Can be used as an alternative to `eventId`, but please note that after
   * load it will be populated with the actual event and not its id. This field is not persistable.
   * @field {SchedulerPro.model.EventModel} event
   * @accepts {String|Number|SchedulerPro.model.EventModel}
   * @typings {String|Number|SchedulerPro.model.EventModel|Core.model.Model}
   * @category Common
   */

  /**
   * Id for resource to assign to. Can be used as an alternative to `resourceId`, but please note that after
   * load it will be populated with the actual resource and not its id. This field is not persistable.
   * @field {SchedulerPro.model.ResourceModel} resource
   * @accepts {String|Number|SchedulerPro.model.ResourceModel}
   * @category Common
   */
  //region Config
  static get $name() {
    return 'AssignmentModel';
  }

  static get isProAssignmentModel() {
    return true;
  } //endregion
  //region Early render

  get event() {
    const {
      project
    } = this,
          event = super.event; // Figure reference out before buckets are created (if part of project)

    if (project !== null && project !== void 0 && project.isDelayingCalculation) {
      return project.eventStore.getById(event);
    }

    return event;
  }

  set event(event) {
    super.event = event;
  }

  get resource() {
    const {
      project
    } = this,
          resource = super.resource; // Figure reference out before buckets are created (if part of project)

    if (project !== null && project !== void 0 && project.isDelayingCalculation) {
      return project.resourceStore.getById(resource);
    }

    return resource;
  }

  set resource(resource) {
    super.resource = resource;
  } //endregion

}
AssignmentModel._$name = 'AssignmentModel';

/**
 * @module SchedulerPro/data/AssignmentStore
 */

/**
 * A store representing a collection of assignments between events in the {@link SchedulerPro.data.EventStore} and resources
 * in the {@link SchedulerPro.data.ResourceStore}.
 *
 * This store only accepts a model class inheriting from {@link SchedulerPro.model.AssignmentModel}.
 *
 * An AssignmentStore is usually connected to a project, which binds it to other related stores (EventStore,
 * ResourceStore and DependencyStore). The project also handles references (event, resource) to related records for the
 * records in the store.
 *
 * Resolving the references happens async, records are not guaranteed to have up to date references until calculations
 * are finished. To be certain that references are resolved, call `await project.commitAsync()` after store actions. Or
 * use one of the `xxAsync` functions, such as `loadDataAsync()`.
 *
 * Using `commitAsync()`:
 *
 * ```javascript
 * assignmentStore.data = [{ eventId, resourceId }, ...];
 *
 * // references (event, resource) not resolved yet
 *
 * await assignmentStore.project.commitAsync();
 *
 * // now they are
 * ```
 *
 * Using `loadDataAsync()`:
 *
 * ```javascript
 * await assignmentStore.loadDataAsync([{ eventId, resourceId }, ...]);
 *
 * // references (event, resource) are resolved
 * ```
 *
 * @mixes SchedulerPro/data/mixin/PartOfProject
 * @mixes Scheduler/data/mixin/AssignmentStoreMixin
 * @extends Core/data/AjaxStore
 *
 * @typings Scheduler/data/AssignmentStore -> Scheduler/data/SchedulerAssignmentStore
 */

class AssignmentStore extends PartOfProject(AssignmentStoreMixin(ChronoAssignmentStoreMixin.derive(AjaxStore))) {
  static get defaultConfig() {
    return {
      modelClass: AssignmentModel
    };
  }

}
AssignmentStore._$name = 'AssignmentStore';

/**
 * @module SchedulerPro/model/CalendarIntervalModel
 */

/**
 * This is a documentation-only class, representing an interval in the {@link SchedulerPro/model/CalendarModel calendar}
 *
 * Please refer to the [calendars guide](#SchedulerPro/guides/basics/calendars.md) for details
 */

class CalendarIntervalModel extends PartOfProject(CalendarIntervalMixin.derive(Model)) {
  // NOTE: Leave field defs at top to be picked up by jsdoc
  //region Fields

  /**
   * The start date of the fixed (not recurrent) time interval.
   *
   * @field {Date} startDate
   */

  /**
   * The end date of the fixed (not recurrent) time interval.
   *
   * @field {Date} endDate
   */

  /**
   * The start date of the recurrent time interval. Should be specified as any expression, recognized
   * by the excellent [later](http://bunkat.github.io/later/) library.
   *
   * @field {String} recurrentStartDate
   */

  /**
   * The end date of the recurrent time interval. Should be specified as any expression, recognized
   * by the excellent [later](http://bunkat.github.io/later/) library.
   *
   * @field {String} recurrentEndDate
   */

  /**
   * The "is working" flag, which defines what kind of interval this is - either working or non-working. Default value is `false`,
   * denoting non-working intervals.
   *
   * @field {Boolean} isWorking
   * @default false
   */

  /**
   * A CSS class to add to the element visualizing this interval.
   *
   * @field {String} cls
   */

  /**
   * A CSS class used to add an icon to the element visualizing this interval.
   *
   * @field {String} iconCls
   */
  //endregion
  //region Methods

  /**
   * Whether this interval is recurrent (both `recurrentStartDate` and `recurrentEndDate` are present and parsed correctly
   * by the `later` library).
   *
   * @method isRecurrent
   * @returns {Boolean}
   */

  /**
   * Whether this interval is static - both `startDate` and `endDate` are present.
   *
   * @method isStatic
   * @returns {Boolean}
   */

  /**
   * Returns an internal representation of the recurrent start date from the `later` library.
   *
   * @method getStartDateSchedule
   * @returns {Object}
   */

  /**
   * Returns an internal representation of the recurrent end date from the `later` library.
   *
   * @method getEndDateSchedule
   * @returns {Object}
   */
  //endregion
  //region Config
  static get $name() {
    return 'CalendarIntervalModel';
  } //endregion

}
CalendarIntervalModel._$name = 'CalendarIntervalModel';

/**
 * @module SchedulerPro/model/CalendarModel
 */

/**
 * This class represents a calendar in the Scheduler Pro project. It contains a collection of the {@link SchedulerPro.model.CalendarIntervalModel}.
 * Every interval can be either recurrent (regularly repeating in time) or static. These intervals can be visualized
 * by the {@link SchedulerPro.feature.ResourceNonWorkingTime} or {@link Scheduler.feature.NonWorkingTime} features.
 *
 * Please refer to the [calendars guide](#SchedulerPro/guides/basics/calendars.md) for details
 *
 * @mixes SchedulerPro/data/mixin/PartOfProject
 *
 * @extends Core/data/Model
 */

class CalendarModel extends PartOfProject(BaseCalendarMixin.derive(Model)) {
  //region Config
  static get $name() {
    return 'CalendarModel';
  }
  /**
   * Returns the earliest point at which a working period of time starts, following the given date.
   * Can be the date itself, if it occurs during working time.
   * @method skipNonWorkingTime
   * @param {Date} date The date after which to skip the non-working time
   * @param {Boolean} [isForward=true] Whether the "following" means forward in time or backward
   * @returns {Date} The earliest available date
   */

  /**
   * This method adds a single {@link SchedulerPro.model.CalendarIntervalModel} to the internal collection of the calendar
   * @method addInterval
   * @param {SchedulerPro.model.CalendarIntervalModel|Object} interval {@link SchedulerPro.model.CalendarIntervalModel} record or an object with data used to create a new record
   * @returns {SchedulerPro.model.CalendarIntervalModel[]} Added intervals
   */

  /**
   * This method adds an array of {@link SchedulerPro.model.CalendarIntervalModel} to the internal collection of the calendar
   * @method addIntervals
   * @param {SchedulerPro.model.CalendarIntervalModel[]|Object[]} intervals An array of {@link SchedulerPro.model.CalendarIntervalModel} records or an array of objects with data used to create new records
   * @returns {SchedulerPro.model.CalendarIntervalModel[]} Added intervals
   */

  /**
   * This method removes all intervals from the internal collection of the calendar
   * @method clearIntervals
   * @param {Boolean} [silent] Do not trigger events
   */

  /**
   * Calculate the working time duration for specific interval, in milliseconds.
   * @method calculateDurationMs
   * @param {Date} startDate Start of the interval
   * @param {Date} endDate End of the interval
   * @returns {Number} Returns working time in milliseconds
   */

  /**
   * Checks if there is a working time interval in the provided time range
   * @method isWorkingTime
   * @param {Date} startDate Start of the interval
   * @param {Date} endDate End of the interval
   * @returns {Boolean} Returns `true` if the interval contains working time
   */

  static get fields() {
    return [
      /**
       * The calendar name.
       * @field {String} name
       */

      /**
       * A CSS class to add to calendar interval elements rendered in the UI.
       * @field {String} cls
       */

      /**
       * A CSS class defining an icon to show in non-working time elements rendered in the UI.
       * @field {String} iconCls
       */

      /**
       * The flag, indicating, whether the "unspecified" time (time that does not belong to any interval
       * is working (`true`) or not (`false`).
       *
       * @field {Boolean} unspecifiedTimeIsWorking
       * @default true
       */

      /**
       * {@link SchedulerPro.model.CalendarIntervalModel Intervals} collection of the calendar
       * @field {SchedulerPro.model.CalendarIntervalModel[]} intervals
       */
    ];
  } //endregion

  toString() {
    return this.name || '';
  }

  static get defaultConfig() {
    return {
      calendarIntervalModelClass: CalendarIntervalModel
    };
  }

}
CalendarModel._$name = 'CalendarModel';

/**
 * @module SchedulerPro/data/CalendarManagerStore
 */

/**
 * A class representing the tree of calendars in the SchedulerPro chart. An individual calendar is represented as an instance of the
 * {@link SchedulerPro.model.CalendarModel} class. The store expects the data loaded to be hierarchical. Each parent node should
 * contain its children in a property called 'children'.
 *
 * Please refer to the [calendars guide](#SchedulerPro/guides/basics/calendars.md) for details
 *
 * @mixes SchedulerPro/data/mixin/PartOfProject
 *
 * @extends Core/data/AjaxStore
 */

class CalendarManagerStore extends PartOfProject(ChronoCalendarManagerStoreMixin.derive(AjaxStore)) {
  //region Config
  static get defaultConfig() {
    return {
      tree: true,
      modelClass: CalendarModel,

      /**
       * CrudManager must load stores in the correct order. Lowest first.
       * @private
       */
      loadPriority: 100,

      /**
       * CrudManager must sync stores in the correct order. Lowest first.
       * @private
       */
      syncPriority: 100,
      storeId: 'calendars'
    };
  } //endregion

}
CalendarManagerStore._$name = 'CalendarManagerStore';

/**
 * @module SchedulerPro/model/DependencyModel
 */

/**
 * This model represents a dependency between two events, usually added to a {@link SchedulerPro.data.DependencyStore}.
 *
 * It is a subclass of the {@link Scheduler.model.DependencyBaseModel} class, which in its turn subclasses
 * {@link Core.data.Model}. Please refer to documentation of those classes to become familiar with the base interface of
 * this class.
 *
 * ## Fields and references
 *
 * A Dependency has a few predefined fields, see Fields below.  The name of any fields data source can be customized in
 * the subclass, see the example below. Please also refer to {@link Core.data.Model} for details.
 *
 * ```javascript
 * class MyDependency extends DependencyModel {
 *   static get fields() {
 *     return [
 *       { name: 'to', dataSource: 'targetId' },
 *       { name: 'from', dataSource: 'sourceId' }
 *     ]);
 *   }
 * }
 * ```
 *
 * After load and project normalization, these references are accessible (assuming their respective stores are loaded):
 * - `fromEvent` - The event on the start side of the dependency
 * - `toEvent` - The event on the end side of the dependency
 *
 * ## Async resolving of references
 *
 * As described above, a dependency has links to events. These references are populated async, using the calculation
 * engine of the project that the resource via its store is a part of. Because of this asyncness, references cannot be
 * used immediately after modifications:
 *
 * ```javascript
 * dependency.from = 2;
 * // dependency.fromEvent is not yet up to date
 * ```
 *
 * To make sure references are updated, wait for calculations to finish:
 *
 * ```javascript
 * dependency.from = 2;
 * await dependency.project.commitAsync();
 * // dependency.fromEvent is up to date
 * ```
 *
 * As an alternative, you can also use `setAsync()` to trigger calculations directly after the change:
 *
 * ```javascript
 * await dependency.setAsync({ from : 2});
 * // dependency.fromEvent is up to date
 * ```
 *
 * @mixes SchedulerPro/data/mixin/PartOfProject
 * @extends Scheduler/model/DependencyBaseModel
 *
 * @typings Scheduler/model/DependencyModel -> Scheduler/model/SchedulerDependencyModel
 */

class DependencyModel extends PartOfProject(SchedulerProDependencyMixin.derive(DependencyBaseModel)) {
  // NOTE: Leave field defs at top to be picked up by jsdoc

  /**
   * The calendar of the dependency used to take `lag` duration into account.
   * @field {SchedulerPro.model.CalendarModel} calendar
   */

  /**
   * Set to `false` to ignore this dependency in scheduling
   * @field {Boolean} active
   * @category Dependency
   */
  //region Config
  static get $name() {
    return 'DependencyModel';
  }

  static get isProDependencyModel() {
    return true;
  } //endregion
  //region Render early
  // Buckets and references are not set up yet during early render, need to look up on stores

  get fromEvent() {
    var _this$project;

    if ((_this$project = this.project) !== null && _this$project !== void 0 && _this$project.isDelayingCalculation) {
      return this.project.eventStore.getById(super.fromEvent);
    }

    return super.fromEvent;
  }

  set fromEvent(from) {
    super.fromEvent = from;
  }

  get toEvent() {
    var _this$project2;

    if ((_this$project2 = this.project) !== null && _this$project2 !== void 0 && _this$project2.isDelayingCalculation) {
      return this.project.eventStore.getById(super.toEvent);
    }

    return super.toEvent;
  }

  set toEvent(to) {
    super.toEvent = to;
  } //endregion

}
DependencyModel._$name = 'DependencyModel';

/**
 * @module SchedulerPro/data/DependencyStore
 */

/**
 * A store representing a collection of dependencies between events in the {@link SchedulerPro.data.EventStore}.
 *
 * This store only accepts a model class inheriting from {@link SchedulerPro.model.DependencyModel}.
 *
 * A DependencyStore is usually connected to a project, which binds it to other related stores (EventStore,
 * AssignmentStore and ResourceStore). The project also handles references (fromEvent, toEvent) to related records
 * for the records in the store.
 *
 * Resolving the references happens async, records are not guaranteed to have up to date references until calculations
 * are finished. To be certain that references are resolved, call `await project.commitAsync()` after store actions. Or
 * use one of the `xxAsync` functions, such as `loadDataAsync()`.
 *
 * Using `commitAsync()`:
 *
 * ```javascript
 * dependencyStore.data = [{ from, to }, ...];
 *
 * // references (fromEvent, toEvent) not resolved yet
 *
 * await dependencyStore.project.commitAsync();
 *
 * // now they are
 * ```
 *
 * Using `loadDataAsync()`:
 *
 * ```javascript
 * await dependencyStore.loadDataAsync([{ from, to }, ...]);
 *
 * // references (fromEvent, toEvent) are resolved
 * ```
 *
 * @mixes SchedulerPro/data/mixin/PartOfProject
 * @mixes Scheduler/data/mixin/DependencyStoreMixin
 * @extends Core/data/AjaxStore
 *
 * @typings Scheduler/data/DependencyStore -> Scheduler/data/SchedulerDependencyStore
 */

class DependencyStore extends PartOfProject(DependencyStoreMixin(ChronoDependencyStoreMixin.derive(AjaxStore))) {
  static get defaultConfig() {
    return {
      modelClass: DependencyModel
    };
  }

}
DependencyStore._$name = 'DependencyStore';

/**
 * @module SchedulerPro/model/mixin/PercentDoneMixin
 */

/**
 * PercentDone mixin to get the current status of a task.
 * @mixin
 */
var PercentDoneMixin = (Target => class PercentDoneMixin extends Target {
  static get $name() {
    return 'PercentDoneMixin';
  }
  /**
   * The current status of a task, expressed as the percentage completed (integer from 0 to 100)
   * @field {Number} percentDone
   * @category Scheduling
   */
  // Field defined in Engine

  /**
   * Indicates if the task is started (its {@link #field-percentDone percent completion} is greater than zero).
   * @property {Boolean}
   * @category Progress
   */

  get isStarted() {
    return this.percentDone > 0;
  }
  /**
   * Indicates if the task is complete (its {@link #field-percentDone percent completion} is 100% (or greater)).
   * @property {Boolean}
   * @category Progress
   */

  get isCompleted() {
    return this.percentDone >= 100;
  }
  /**
   * Indicates if the task is in progress (its {@link #field-percentDone percent completion} is greater than zero and less than 100%).
   * @property {Boolean}
   * @category Progress
   */

  get isInProgress() {
    return this.isStarted && !this.isCompleted;
  } // Reset % done value when copying a task

  copy() {
    const copy = super.copy(...arguments);
    copy.percentDone = 0;
    copy.clearChanges();
    return copy;
  }
  /**
   * Human-friendly rounding. When task is completed < 99%, it rounds the value. It floors value between 99 and 100, to not
   * show task as completed when it is for example 99.51% done.
   * @property {Number}
   * @category Progress
   */

  get renderedPercentDone() {
    const value = typeof this.percentDone === 'number' && !isNaN(this.percentDone) ? this.percentDone : 0;
    return this.getFormattedPercentDone(value);
  }

  getFormattedPercentDone(value = 0) {
    if (value <= 99) {
      return Math.round(value);
    }

    return Math.floor(value);
  }

  set renderedPercentDone(value) {
    this.percentDone = value;
  }

});

/**
 * @module SchedulerPro/model/ResourceModel
 */

/**
 * This class represent a single Resource in Scheduler Pro, usually added to a {@link SchedulerPro.data.ResourceStore}.
 *
 * It is a subclass of  {@link Core.data.Model}. Please refer to the documentation for that class to become familiar
 * with the base interface of the resource.
 *
 * ## Fields and references
 *
 * A resource has a few predefined fields, see Fields below. If you want to add more fields with meta data describing
 * your resources then you should subclass this class:
 *
 * ```javascript
 * class MyResource extends ResourceModel {
 *   static get fields() {
 *     return [
 *       // "id" and "name" fields are already provided by the superclass
 *       { name: 'company', type : 'string' }
 *     ];
 *   }
 * });
 * ```
 *
 * If you want to use other names in your data for the id and name fields you can configure them as seen below:
 *
 * ```javascript
 * class MyResource extends ResourceModel {
 *   static get fields() {
 *     return [
 *        { name: 'name', dataSource: 'userName' }
 *     ];
 *   },
 * });
 * ```
 *
 * After load and project normalization, these references are accessible (assuming their respective stores are loaded):
 * - `assignments` - The linked assignment records
 * - `events` - The linked (through assignments) event records
 *
 * ## Async resolving of references
 *
 * As described above, a resource has links to assignments and events. These references are populated async, using the
 * calculation engine of the project that the resource via its store is a part of. Because of this asyncness, references
 * cannot be used immediately after assignment modifications:
 *
 * ```javascript
 * assignment.resourceId = 2;
 * // resource.assignments is not yet up to date
 * ```
 *
 * To make sure references are updated, wait for calculations to finish:
 *
 * ```javascript
 * assignment.resourceId = 2;
 * await assignment.project.commitAsync();
 * // resource.assignments is up to date
 * ```
 *
 * As an alternative, you can also use `setAsync()` to trigger calculations directly after the change:
 *
 * ```javascript
 * await assignment.setAsync({ resourceId : 2});
 * // resource.assignments is up to date
 * ```
 *
 * @extends Grid/data/GridRowModel
 * @mixes Scheduler/model/mixin/ResourceModelMixin
 *
 * @typings Scheduler/model/ResourceModel -> Scheduler/model/SchedulerResourceModel
 */

class ResourceModel extends PartOfProject(ResourceModelMixin(SchedulerProResourceMixin.derive(GridRowModel))) {
  //region Calendar

  /**
   * Sets the calendar of the task. Will cause the schedule to be updated - returns a `Promise`
   *
   * @method setCalendar
   * @param {SchedulerPro.model.CalendarModel} calendar The new calendar. Provide `null` to use the project calendar.
   * @returns {Promise}
   * @propagating
   */

  /**
   * Returns the resource calendar.
   *
   * @method getCalendar
   * @returns {SchedulerPro.model.CalendarModel} The resource calendar.
   */

  /**
   * The calendar, assigned to the entity. Allows you to set the time when entity can perform the work.
   *
   * @field {SchedulerPro.model.CalendarModel} calendar
   * @category Scheduling
   */
  //endregion
  //region Config
  static get $name() {
    return 'ResourceModel';
  } //endregion
  //region Early render

  get assigned() {
    var _project$assignmentSt;

    const {
      project
    } = this; // Figure assigned events out before buckets are created (if part of project)

    if (project !== null && project !== void 0 && (_project$assignmentSt = project.assignmentStore.storage._indices) !== null && _project$assignmentSt !== void 0 && _project$assignmentSt.resource) {
      var _project$assignmentSt2;

      return (_project$assignmentSt2 = project.assignmentStore.storage.findItem('resource', this)) !== null && _project$assignmentSt2 !== void 0 ? _project$assignmentSt2 : new Set();
    }

    return super.assigned;
  }

  set assigned(assigned) {
    super.assigned = assigned;
  } //endregion

}
ResourceModel._$name = 'ResourceModel';

/**
 * @module SchedulerPro/data/ResourceStore
 */

/**
 * A store holding all the {@link SchedulerPro.model.ResourceModel resources} to be rendered into a
 * {@link SchedulerPro.view.SchedulerPro Scheduler Pro}.
 *
 * This store only accepts a model class inheriting from {@link SchedulerPro.model.ResourceModel}.
 *
 * A ResourceStore is usually connected to a project, which binds it to other related stores (EventStore,
 * AssignmentStore and DependencyStore). The project also handles references (assignments, events) to related records
 * for the records in the store.
 *
 * Resolving the references happens async, records are not guaranteed to have up to date references until calculations
 * are finished. To be certain that references are resolved, call `await project.commitAsync()` after store actions. Or
 * use one of the `xxAsync` functions, such as `loadDataAsync()`.
 *
 * Using `commitAsync()`:
 *
 * ```javascript
 * resourceStore.data = [{ id }, ...];
 *
 * // references (assignments, events) not resolved yet
 *
 * await resourceStore.project.commitAsync();
 *
 * // now they are
 * ```
 *
 * Using `loadDataAsync()`:
 *
 * ```javascript
 * await resourceStore.loadDataAsync([{ id }, ...]);
 *
 * // references (assignments, events) are resolved
 * ```
 *
 * @mixes SchedulerPro/data/mixin/PartOfProject
 * @mixes Scheduler/data/mixin/ResourceStoreMixin
 * @extends Core/data/AjaxStore
 *
 * @typings Scheduler/data/ResourceStore -> Scheduler/data/SchedulerResourceStore
 */

class ResourceStore extends PartOfProject(ResourceStoreMixin(ChronoResourceStoreMixin.derive(AjaxStore))) {
  static get defaultConfig() {
    return {
      modelClass: ResourceModel
    };
  }

}
ResourceStore._$name = 'ResourceStore';

/**
 * @module SchedulerPro/data/mixin/ProjectCrudManager
 */
// the order of the @mixes tags is important below, as the "AbstractCrudManagerMixin"
// contains the abstract methods, which are then overwritten by the concrete
// implementation in the AjaxTransport and JsonEncoder

/**
 * This mixin provides Crud manager functionality to a Scheduler Pro project.
 * The mixin turns the provided project model into a Crud manager instance.
 *
 * @mixin
 * @mixes Scheduler/data/mixin/ProjectCrudManager
 * @typings Scheduler/data/mixin/ProjectCrudManager -> Scheduler/data/mixin/SchedulerProjectCrudManager
 */

var ProjectCrudManager = (Target => class ProjectCrudManager extends (Target || Base$1).mixin(ProjectCrudManager$1) {
  static get configurable() {
    return {
      crudLoadValidationWarningPrefix: 'Project load response error(s):',
      crudSyncValidationWarningPrefix: 'Project sync response error(s):'
    };
  }

  construct(...args) {
    const me = this;
    super.construct(...args); // add the Engine specific stores to the crud manager

    me.addPrioritizedStore(me.calendarManagerStore);
    me.addPrioritizedStore(me.assignmentStore);
    me.addPrioritizedStore(me.dependencyStore);
    me.addPrioritizedStore(me.resourceStore);
    me.addPrioritizedStore(me.eventStore);

    if (me.timeRangeStore) {
      me.addPrioritizedStore(me.timeRangeStore);
    }

    if (me.resourceTimeRangeStore) {
      me.addPrioritizedStore(me.resourceTimeRangeStore);
    }
  }

  get project() {
    return this;
  }

  set project(value) {
    super.project = value;
  }

  get crudLoadValidationMandatoryStores() {
    return [this.getStoreDescriptor(this.eventStore).storeId];
  }

  loadCrudManagerData(...args) {
    if (this.delayCalculation && !this.isDelayingCalculation) {
      this.scheduleDelayedCalculation();
    }

    super.loadCrudManagerData(...args);
  }

});

/**
 * @module SchedulerPro/feature/PercentBar
 */
//region Static

function cls(classes) {
  return `b-task-percent-bar${classes[0] ? `-${classes[0]}` : ''}`;
} //endregion

/**
 * This feature visualizes the {@link SchedulerPro.model.mixin.PercentDoneMixin#field-percentDone percentDone} field as a
 * progress bar on the event elements. Each progress bar also optionally has a drag handle which users can drag can
 * change the value.
 * You can customize data source for the feature with {@link #config-valueField} and {@link #config-displayField} configs.
 *
 * {@inlineexample SchedulerPro/feature/PercentBar.js}
 *
 * This feature is **enabled** by default in Gantt, but **off** by default in Scheduler Pro.
 *
 * @extends Core/mixin/InstancePlugin
 * @classtype percentBar
 * @feature
 * @demo SchedulerPro/percent-done
 */

class PercentBar extends InstancePlugin {
  //region Config
  static get $name() {
    return 'PercentBar';
  }

  static get configurable() {
    return {
      /**
       * `true` to allow drag drop resizing to set the % done
       * @config {Boolean}
       * @default
       */
      allowResize: true,

      /**
       * `true` to show a small % done label within the event while drag changing its value
       * @config {Boolean}
       * @default
       */
      showPercentage: true,

      /**
       * Field name to use as the data source
       * @config {String}
       * @default
       */
      valueField: 'percentDone',

      /**
       * Field name to use to display the value
       * @config {String}
       * @default
       */
      displayField: 'renderedPercentDone'
    };
  }

  static get pluginConfig() {
    return {
      chain: ['onPaint', 'onTaskDataGenerated', 'onEventDataGenerated']
    };
  } //endregion
  //region Init

  /**
   * Called when scheduler is painted. Sets up drag and drop and hover tooltip.
   * @private
   */

  onPaint({
    firstPaint
  }) {
    if (firstPaint) {
      const me = this,
            {
        client
      } = me;
      me.drag = new DragHelper({
        name: 'percentBarHandle',
        lockY: true,
        // Handle is not draggable for parents
        targetSelector: `${client.eventSelector}:not(.${client.eventCls}-parent) .b-task-percent-bar-handle`,
        dragThreshold: 1,
        outerElement: client.timeAxisSubGridElement,
        listeners: {
          beforeDragStart: 'onBeforeDragStart',
          dragStart: 'onDragStart',
          drag: 'onDrag',
          drop: 'onDrop',
          abort: 'onDragAbort',
          thisObj: me
        }
      });
      me.detachListeners('view');
      me.client.on({
        name: 'view',
        [`${client.scheduledEventName}mouseenter`]: 'onTimeSpanMouseEnter',
        [`${client.scheduledEventName}mouseleave`]: 'onTimeSpanMouseLeave',
        thisObj: me
      });
    }
  }

  updateAllowResize(value) {
    this.client.element.classList.toggle(cls`drag-disabled`, !value);
  }

  updateShowPercentage(value) {
    this.client.element.classList.toggle(cls`show-percentage`, Boolean(value));
  }

  doDestroy() {
    var _this$drag;

    (_this$drag = this.drag) === null || _this$drag === void 0 ? void 0 : _this$drag.destroy();
    super.doDestroy();
  }

  doDisable(disable) {
    // Redraw to toggle percent bars
    if (this.client.isPainted) {
      this.client.refresh();
    }

    super.doDisable(disable);
  } //endregion
  //region Contents

  cleanup(context) {
    const me = this,
          taskEl = context.element.closest(me.client.eventSelector);
    taskEl.classList.remove(cls`resizing`);
    me.client.element.classList.remove(cls`resizing-task`); // Remove handle if operation ended outside of the event

    if (!me.isMouseInsideEvent) {
      me.handle.remove();
      me.handle = null;
    }
  }

  appendDOMConfig(taskRecord, children) {
    if ((taskRecord.isEvent || taskRecord.isTask) && !taskRecord.isMilestone && !this.disabled) {
      children.unshift({
        className: cls`outer`,
        dataset: {
          taskBarFeature: 'percentBar'
        },
        children: [{
          className: cls``,
          dataset: {
            percent: taskRecord[this.displayField]
          },
          style: {
            width: taskRecord[this.valueField] + '%'
          }
        }]
      });
    }
  } // For Scheduler Pro

  onEventDataGenerated(eventData) {
    this.appendDOMConfig(eventData.eventRecord, eventData.children);
  } // For Gantt

  onTaskDataGenerated(taskData) {
    this.appendDOMConfig(taskData.task, taskData.children);
  } //endregion
  //region Events
  // Inject handle on mouse over

  onTimeSpanMouseEnter(event) {
    const me = this,
          record = event[`${me.client.scheduledEventName}Record`];

    if (record.isMilestone || me.disabled) {
      return;
    } // No ongoing drag

    if (!me.drag.context) {
      const element = event[`${me.client.scheduledEventName}Element`],
            parent = DomSync.getChild(element, me.client.scheduledEventName); // Add handle if not already there

      if (!me.handle) {
        me.handle = DomHelper.createElement({
          parent,
          className: cls`handle`,
          style: {
            left: record[me.valueField] + '%'
          },
          dataset: {
            percent: record[me.valueField]
          }
        });
      } // Mouse is inside event, used later to not remove handle

      me.isMouseInsideEvent = true;
    } // Ongoing drag, mouse coming back into active event
    else if (record === me.drag.context.taskRecord) {
      // Mouse is inside event, used later to not remove handle
      me.isMouseInsideEvent = true;
    }
  } // Remove handle on mouse leave, if not dragging

  onTimeSpanMouseLeave() {
    const me = this;

    if (!me.drag.context && me.handle) {
      me.handle.remove();
      me.handle = null;
    }

    me.isMouseInsideEvent = false;
  }

  onBeforeDragStart({
    source,
    context
  }) {
    const percentBarOuter = DomSync.getChild(context.element.parentElement, 'percentBar'),
          percentBar = percentBarOuter.firstElementChild,
          initialX = percentBar.offsetWidth,
          outerWidth = percentBarOuter.offsetWidth,
          taskRecord = this.client.resolveEventRecord(context.element);
    source.minX = -initialX;
    source.maxX = outerWidth - initialX;
    Object.assign(context, {
      percentBar,
      initialX,
      outerWidth,
      taskRecord
    });
    return !taskRecord.readOnly;
  }

  onDragStart({
    context
  }) {
    const {
      client
    } = this,
          taskEl = context.element.closest(client.eventSelector);
    taskEl.classList.add(cls`resizing`);
    client.element.classList.add(cls`resizing-task`);
    context.element.retainElement = true;
  }

  onDrag({
    context
  }) {
    const percent = Math.round((context.initialX + context.newX) / context.outerWidth * 100); // TODO : Live updating, requires some more effort to make it good
    //context.taskRecord.percentDone = percent;

    context.percent = context.percentBar.dataset.percent = context.element.dataset.percent = percent;
    context.percentBar.style.width = percent + '%';
  }

  onDragAbort({
    context
  }) {
    // Reset percentBar width on abort
    context.percentBar.style.width = context.taskRecord[this.valueField] + '%';
    this.cleanup(context);
  }

  onDrop({
    context
  }) {
    context.taskRecord[this.valueField] = context.percent; // Fully overwrite handle style to get rid of translate also

    context.element.style.cssText = `left: ${context.percent}%`;
    this.cleanup(context);
  } //endregion
  // No classname on Scheduler's/Gantt's element

  get featureClass() {}

}
PercentBar._$name = 'PercentBar';
GridFeatureManager.registerFeature(PercentBar, false, 'SchedulerPro');
GridFeatureManager.registerFeature(PercentBar, true, 'Gantt');

/**
 * @module SchedulerPro/feature/mixin/ProTaskEditStm
 */

/**
 * Mixin adding STM transactable behavior to TaskEdit feature.
 *
 * @mixin
 */

var ProTaskEditStm = (Target => class TaskEditStm extends (Target || Base$1) {
  static get $name() {
    return 'TaskEditStm';
  }

  captureStm() {
    const me = this,
          project = me.project,
          stm = project.getStm();
    me.stmInitiallyDisabled = stm.disabled;
    me.stmInitiallyAutoRecord = stm.autoRecord;

    if (me.stmInitiallyDisabled) {
      stm.enable(); // it seems this branch has never been exercised by tests
      // but the intention is to stop the auto-recording while
      // task editor is active (all editing is one manual transaction)

      stm.autoRecord = false;
    } else {
      if (me.stmInitiallyAutoRecord) {
        stm.autoRecord = false;
      }

      if (stm.isRecording) {
        stm.stopTransaction();
      }
    }
  }

  startStmTransaction() {
    // TODO: Create title: "Editing event/task 'name'"
    this.project.getStm().startTransaction();
  }

  commitStmTransaction() {
    const me = this,
          stm = me.project.getStm();
    stm.stopTransaction();

    if (me.stmInitiallyDisabled) {
      stm.resetQueue();
    }
  }

  async rejectStmTransaction() {
    var _stm$transaction;

    const stm = this.project.getStm(),
          {
      client
    } = this;

    if ((_stm$transaction = stm.transaction) !== null && _stm$transaction !== void 0 && _stm$transaction.length) {
      client.suspendRefresh();
      stm.forEachStore(s => s.beginBatch());
      stm.rejectTransaction();
      stm.forEachStore(s => s.endBatch());
      await client.resumeRefresh(true);
    } else {
      stm.stopTransaction();
    }
  }

  enableStm() {
    this.project.getStm().enable();
  }

  disableStm() {
    this.project.getStm().disable();
  }

  freeStm() {
    const me = this,
          stm = me.project.getStm();
    stm.disabled = me.stmInitiallyDisabled;
    stm.autoRecord = me.stmInitiallyAutoRecord;
  }

});

var ReadyStatePropagator = (Target => class extends (Target || Events(Base$1)) {
  get isReadyStatePropagator() {
    return true;
  }

  get canSave() {
    return true;
  }

  requestReadyStateChange() {
    this.trigger('readystatechange', {
      canSave: this.canSave
    });
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

const locale = LocaleHelper.mergeLocales(locale$2, locale$1, {
  ConstraintTypePicker: {
    none: 'None',
    muststarton: 'Must start on',
    mustfinishon: 'Must finish on',
    startnoearlierthan: 'Start no earlier than',
    startnolaterthan: 'Start no later than',
    finishnoearlierthan: 'Finish no earlier than',
    finishnolaterthan: 'Finish no later than'
  },
  CalendarField: {
    'Default calendar': 'Default calendar'
  },
  TaskEditorBase: {
    Information: 'Information',
    Save: 'Save',
    Cancel: 'Cancel',
    Delete: 'Delete',
    calculateMask: 'Calculating...',
    saveError: 'Can\'t save, please correct errors first'
  },
  TaskEdit: {
    'Edit task': 'Edit task',
    ConfirmDeletionTitle: 'Confirm deletion',
    ConfirmDeletionMessage: 'Are you sure you want to delete the event?'
  },
  GanttTaskEditor: {
    editorWidth: '44em'
  },
  SchedulerTaskEditor: {
    editorWidth: '32em'
  },
  SchedulerGeneralTab: {
    labelWidth: '6em',
    General: 'General',
    Name: 'Name',
    Resources: 'Resources',
    '% complete': '% complete',
    Duration: 'Duration',
    Start: 'Start',
    Finish: 'Finish',
    Preamble: 'Preamble',
    Postamble: 'Postamble'
  },
  GeneralTab: {
    labelWidth: '6.5em',
    General: 'General',
    Name: 'Name',
    '% complete': '% complete',
    Duration: 'Duration',
    Start: 'Start',
    Finish: 'Finish',
    Effort: 'Effort',
    Dates: 'Dates'
  },
  SchedulerAdvancedTab: {
    labelWidth: '13em',
    Calendar: 'Calendar',
    Advanced: 'Advanced',
    'Manually scheduled': 'Manually scheduled',
    'Constraint type': 'Constraint type',
    'Constraint date': 'Constraint date',
    Inactive: 'Inactive'
  },
  AdvancedTab: {
    labelWidth: '11.5em',
    Advanced: 'Advanced',
    Calendar: 'Calendar',
    'Scheduling mode': 'Scheduling mode',
    'Effort driven': 'Effort driven',
    'Manually scheduled': 'Manually scheduled',
    'Constraint type': 'Constraint type',
    'Constraint date': 'Constraint date',
    Constraint: 'Constraint',
    Rollup: 'Rollup',
    Inactive: 'Inactive'
  },
  DependencyTab: {
    Predecessors: 'Predecessors',
    Successors: 'Successors',
    ID: 'ID',
    Name: 'Name',
    Type: 'Type',
    Lag: 'Lag',
    cyclicDependency: 'Cyclic dependency',
    invalidDependency: 'Invalid dependency'
  },
  NotesTab: {
    Notes: 'Notes'
  },
  ResourcesTab: {
    unitsTpl: ({
      value
    }) => `${value}%`,
    Resources: 'Resources',
    Resource: 'Resource',
    Units: 'Units'
  },
  SchedulingModePicker: {
    Normal: 'Normal',
    'Fixed Duration': 'Fixed Duration',
    'Fixed Units': 'Fixed Units',
    'Fixed Effort': 'Fixed Effort'
  },
  ResourceHistogram: {
    barTipInRange: '<b>{resource}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated} of {available}</span> allocated',
    barTipOnDate: '<b>{resource}</b> on {startDate}<br><span class="{cls}">{allocated} of {available}</span> allocated',
    groupBarTipAssignment: '<b>{resource}</b> - <span class="{cls}">{allocated} of {available}</span>',
    groupBarTipInRange: '{startDate} - {endDate}<br><span class="{cls}">{allocated} of {available}</span> allocated:<br>{assignments}',
    groupBarTipOnDate: 'On {startDate}<br><span class="{cls}">{allocated} of {available}</span> allocated:<br>{assignments}',
    plusMore: '+{value} more'
  },
  ResourceUtilization: {
    barTipInRange: '<b>{event}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated}</span> allocated',
    barTipOnDate: '<b>{event}</b> on {startDate}<br><span class="{cls}">{allocated}</span> allocated',
    groupBarTipAssignment: '<b>{event}</b> - <span class="{cls}">{allocated}</span>',
    groupBarTipInRange: '{startDate} - {endDate}<br><span class="{cls}">{allocated} of {available}</span> allocated:<br>{assignments}',
    groupBarTipOnDate: 'On {startDate}<br><span class="{cls}">{allocated} of {available}</span> allocated:<br>{assignments}',
    plusMore: '+{value} more',
    nameColumnText: 'Resource / Event'
  },
  SchedulingIssueResolutionPopup: {
    'Cancel changes': 'Cancel the change and do nothing',
    schedulingConflict: 'Scheduling conflict',
    emptyCalendar: 'Calendar configuration error',
    cycle: 'Scheduling cycle',
    Apply: 'Apply'
  },
  CycleResolutionPopup: {
    dependencyLabel: 'Please select a dependency to apply a below change to:',
    invalidDependencyLabel: 'There are invalid dependencies involved that must be fixed:'
  },
  DependencyEdit: {
    Active: 'Active'
  },
  SchedulerProBase: {
    propagating: 'Calculating project',
    storePopulation: 'Loading data',
    finalizing: 'Finalizing results'
  }
});

LocaleManagerSingleton.registerLocale('En', {
  desc: 'English',
  locale
});

/**
 * @module SchedulerPro/widget/TaskEditorBase
 */

/**
 * Abstract base class for Scheduler and Gantt task editors
 *
 * @extends Core/widget/Popup
 * @abstract
 */

class TaskEditorBase extends Popup.mixin(ReadyStatePropagator) {
  //region Config
  static get $name() {
    return 'TaskEditorBase';
  }

  static get type() {
    return 'taskeditorbase';
  }

  static get configurable() {
    return {
      localizableProperties: ['width'],
      title: 'L{Information}',
      cls: 'b-schedulerpro-taskeditor',
      closable: true,
      layout: 'fit',
      draggable: {
        handleSelector: ':not(button,.b-field-inner)' // blacklist buttons and field inners

      },
      items: null,
      // overridden in subclasses
      bbar: {
        // When readOnly, child buttons are hidden
        hideWhenEmpty: true,
        defaults: {
          localeClass: this
        },
        items: {
          saveButton: {
            text: 'L{Save}',
            color: 'b-blue',
            cls: 'b-raised',
            weight: 100
          },
          deleteButton: {
            text: 'L{Delete}',
            weight: 200
          },
          cancelButton: {
            text: 'L{Object.Cancel}',
            weight: 300
          }
        }
      },
      width: {
        $config: {
          localeKey: 'L{editorWidth}'
        }
      }
    };
  }

  static get defaultConfig() {
    return {
      axisLock: 'flexible',
      autoClose: true,
      onChange: null,
      onCancel: null,
      onSave: null,
      autoShow: false,
      scrollAction: 'realign',

      /**
       * The decimal precision to use for Duration field / columns, normally provided by the owning Scheduler´s {@link SchedulerPro.view.SchedulerPro#config-durationDisplayPrecision}
       * @config {Number}
       */
      durationDisplayPrecision: 1,
      tabPanelItems: null,
      defaultTabs: null,

      /**
       * A message to be shown when Engine is performing task scheduling. Localizable text is 'L{calculateMask}'. Disabled by default.
       * @config {String|null}
       * @default
       */
      calculateMask: null,

      /**
       * A delay before the {@link #config-calculateMask mask} becomes visible. This config is needed to avoid UI blinking when calculating is relatively fast.
       * Note, the mask is applied immediately and blocks the content anyway. However if the delay is set, it will be transparent. If `null`, the mask is visible immediately.
       * @config {Number|null}
       * @default
       */
      calculateMaskDelay: 100,
      localizableProperties: ['calculateMask'],
      project: null,

      /**
       * A task field (id, wbsCode, sequenceNumber etc) that will be used when displaying and editing linked tasks. Defaults to Gantt `dependencyIdField`
       * @config {String} dependencyIdField
       */
      dependencyIdField: null
    };
  } //endregion
  //region Internal
  // This method is called for every child widget in the task editor

  processWidgetConfig(widgetConfig) {
    var _widgetConfig$type;

    if ((_widgetConfig$type = widgetConfig.type) !== null && _widgetConfig$type !== void 0 && _widgetConfig$type.includes('date') && widgetConfig.weekStartDay == null) {
      widgetConfig.weekStartDay = this.weekStartDay;
    } // Backward compatibility

    if (widgetConfig.ref === 'tabs' && this.extraItems) {
      const preparedItems = {};

      for (const key in this.extraItems) {
        // Lower-cased "tab" is not supported anymore
        const preparedKey = key.replace('tab', 'Tab');
        preparedItems[preparedKey] = {
          items: Array.isArray(this.extraItems[key]) ? ObjectHelper.transformArrayToNamedObject(this.extraItems[key]) : this.extraItems[key]
        };
      }

      ObjectHelper.merge(widgetConfig.items, preparedItems);
    }

    return widgetConfig;
  }

  changeItems(items) {
    const {
      tabPanelItems = {}
    } = this,
          // Clone to not pollute config
    clonedItems = ObjectHelper.clone(items),
          tabPanel = clonedItems.find(w => w.ref === 'tabs');
    this.cleanItemsConfig(tabPanelItems);
    ObjectHelper.merge(tabPanel.items, tabPanelItems);
    return super.changeItems(clonedItems);
  } // Remove any items configured as === true which just means default config options

  cleanItemsConfig(items) {
    for (const ref in items) {
      const itemCfg = items[ref];

      if (itemCfg === true) {
        delete items[ref];
      } else if (itemCfg !== null && itemCfg !== void 0 && itemCfg.items) {
        this.cleanItemsConfig(itemCfg.items);
      }
    }
  }

  afterConfigure() {
    var _me$bbar;

    const me = this,
          {
      widgetMap
    } = me,
          {
      tabs
    } = widgetMap,
          {
      cancelButton,
      deleteButton,
      saveButton
    } = ((_me$bbar = me.bbar) === null || _me$bbar === void 0 ? void 0 : _me$bbar.widgetMap) || {};
    saveButton === null || saveButton === void 0 ? void 0 : saveButton.on('click', me.onSaveClick, me);
    cancelButton === null || cancelButton === void 0 ? void 0 : cancelButton.on('click', me.onCancelClick, me);
    deleteButton === null || deleteButton === void 0 ? void 0 : deleteButton.on('click', me.onDeleteClick, me);
    Object.values(widgetMap).forEach(widget => {
      if (widget.isDurationField) {
        widget.decimalPrecision = this.durationDisplayPrecision;
      } else if (widget.ref === 'startDate' || widget.ref === 'endDate') {
        widget.project = this.project;
      } else if (widget.ref === 'predecessorsTab' || widget.ref === 'successorsTab') {
        widget.grid.durationDisplayPrecision = this.durationDisplayPrecision;
        widget.dependencyIdField = widget.dependencyIdField || me.dependencyIdField;
      }

      if (widget.isReadyStatePropagator) {
        widget.on('readystatechange', me.onReadyStateChange, me);
      }
    }); // override standard Container's method to pick the right record and make possible
    // to reflect record update on programmatically field value change
    // TODO: may be removed after merged https://github.com/bryntum/support/issues/2920

    tabs.onFieldChange = ({
      source
    }) => {
      const {
        name,
        isValid,
        value
      } = source; // skip record field setting if we are loading values from the record

      if (me.loadedRecord && name && isValid && !me.isLoadingEvent) {
        me.loadedRecord[name] = value;
      }
    };
  }

  get canSave() {
    let canSave = true; // If widget report it can't both save and cancel then there's no reason to walk through others

    Object.values(this.widgetMap).forEach(w => {
      if (w.isReadyStatePropagator) {
        canSave = canSave && w.canSave;
      }
    });
    return canSave;
  } // Close, Cancel and clicking outside all lead here

  async hide() {
    this.detachListeners('project');
    this.detachListeners('eventStore');
    this._delayedAction = null; // Let editing feature know to cancel

    this.trigger('cancel');
    return super.hide();
  } // Iterates over contained fields and disables them based on the loaded record isEditable(fielName) result

  toggleFieldsDisabled(record) {
    this.eachWidget(widget => {
      if (widget.isField && widget.name) {
        const isFieldEditable = record.isEditable(widget.name); // skip unknown fields

        if (isFieldEditable !== undefined) {
          widget.disabled = !record.isEditable(widget.name);
        }
      }
    });
  }
  /**
   * Loads a task model into the editor
   *
   * @param {SchedulerPro.model.EventModel} record
   */

  loadEvent(record, highlightChanges = false) {
    const me = this;
    me.isLoadingEvent = true; // iterate over fields and disable them by name

    me.toggleFieldsDisabled(record);
    me.callWidgetHook('loadEvent', record, highlightChanges);
    me.detachListeners('project'); // Not using .record to not trigger containers record behaviour
    // TODO: Why not rely on that?

    me.loadedRecord = record;
    record.project.on({
      name: 'project',
      beforeCommit: 'onProjectBeforeCommit',
      dataReady: 'onProjectDataReady',
      thisObj: me
    });
    me.detachListeners('eventStore');
    record.project.eventStore.on({
      name: 'eventStore',
      remove: 'onTaskRemove',
      thisObj: me
    });
    me.isLoadingEvent = false;
  }

  callWidgetHook(name, ...args) {
    this.eachWidget(w => {
      if (typeof w[name] === 'function') {
        w[name](...args);
      }
    });
  } //endregion
  //region Events

  onDocumentMouseDown(params) {
    const me = this,
          activeCellEditing = Object.values(me.widgetMap).some(w => w._activeCellEdit);
    let action = null;

    if (activeCellEditing) {
      const {
        event
      } = params,
            {
        saveButton,
        cancelButton,
        deleteButton
      } = me.widgetMap,
            clickedButtonEl = event.target.closest('button'); // When there is a grid in a TaskEditor tab, and cell editing of the grid is in progress,
      // and you click on one of the action buttons below (save/cancel/delete), the cell editing feature catches
      // 'globaltap' event which is fired on global 'mousedown' and finishes the editing.
      // When new data is applied to the record, a new propagation begins. The task editor adds calculating mask
      // to protect the UI. Then 'click' event is fired. At this time the buttons are hovered with
      // the calculating mask and button's handlers are never called.
      // So, if tap out happens, and cell editing is in progress, and the target is one of the action buttons,
      // need to foresee the situation when the mask can block the buttons. Though closing the cell editing
      // does not guarantee that the propagation will start and the mask will appear. Therefore we clean up
      // the flags inside the handlers.

      if (clickedButtonEl) {
        switch (clickedButtonEl) {
          case saveButton === null || saveButton === void 0 ? void 0 : saveButton.element:
            action = me.onSaveClick;
            break;

          case cancelButton === null || cancelButton === void 0 ? void 0 : cancelButton.element:
            action = me.onCancelClick;
            break;

          case deleteButton === null || deleteButton === void 0 ? void 0 : deleteButton.element:
            action = me.onDeleteClick;
            break;
        }
      }
    }

    me._delayedAction = action;
    super.onDocumentMouseDown(params);
  }

  onSaveClick() {
    const me = this;
    me._delayedAction = null;

    if (me.canSave) {
      me.trigger('save');
    } else {
      Toast.show({
        rootElement: me.rootElement,
        html: me.L('L{saveError}')
      });
    }
  }

  onCancelClick() {
    this.close();
  }

  onDeleteClick() {
    this._delayedAction = null;
    this.trigger('delete');
  }

  onPropagationRequested() {
    this.trigger('requestPropagation');
  }

  onReadyStateChange({
    source,
    canSave
  }) {
    this.requestReadyStateChange();

    if (!source.couldSaveTitle) {
      source.couldSaveTitle = source.title;
    }

    if (source.parent === this.widgetMap.tabs) {
      if (canSave) {
        source.tab.element.classList.remove('b-invalid');
        source.tab.icon = null;
        source.title = source.couldSaveTitle;
        source.couldSaveTitle = null;
      } else {
        source.tab.element.classList.add('b-invalid');
        source.tab.icon = 'b-icon-warning';
        source.title = source.couldSaveTitle;
      }
    }
  }

  onTaskRemove() {
    this.afterDelete();
  }

  onProjectBeforeCommit() {
    if (this.calculateMask) {
      this.mask({
        text: this.calculateMask,
        showDelay: this.calculateMaskDelay
      });
    }
  }

  onProjectDataReady({
    records
  }) {
    var _me$_delayedAction;

    const me = this;

    if (me.calculateMask) {
      me.unmask();
    }

    if (records.has(me.loadedRecord)) {
      me.callWidgetHook('afterProjectChange');
    }

    (_me$_delayedAction = me._delayedAction) === null || _me$_delayedAction === void 0 ? void 0 : _me$_delayedAction.call(me);
  }

  beforeSave() {
    this.callWidgetHook('beforeSave');
  }

  afterSave() {
    this.loadedRecord = undefined;
    this.callWidgetHook('afterSave');
  }

  beforeCancel() {
    this.callWidgetHook('beforeCancel');
  }

  afterCancel() {
    this.loadedRecord = undefined;
    this.callWidgetHook('afterCancel');
  }

  beforeDelete() {
    this.callWidgetHook('beforeDelete');
  }

  afterDelete() {
    this.loadedRecord = undefined;
    this.callWidgetHook('afterDelete');
  }

  onInternalKeyDown(event) {
    if (event.key === 'Enter' && this.saveAndCloseOnEnter && event.target.tagName.toLowerCase() === 'input') {
      if (event.target.matches('input')) {
        // Enter might have been pressed right after field editing so we need to process the changes (Fix for #166)
        const field = Widget.fromElement(event.target);

        if (field !== null && field !== void 0 && field.internalOnChange) {
          field.internalOnChange();
        }
      } // this prevents field events so the new value would not be processed without above call to internalOnChange
      // Need to prevent this key events from being fired on whatever receives focus after the editor is hidden

      event.preventDefault();
      this.onSaveClick();
    }

    super.onInternalKeyDown(event);
  } //endregion

  updateReadOnly(readOnly) {
    const {
      deleteButton,
      saveButton,
      cancelButton,
      tabs
    } = this.widgetMap,
          {
      items: childTabs
    } = tabs;
    super.updateReadOnly(readOnly);

    if (deleteButton) {
      deleteButton.hidden = readOnly;
    }

    if (saveButton) {
      saveButton.hidden = readOnly;
    }

    if (cancelButton) {
      cancelButton.hidden = readOnly;
    } // All tabs are readOnly if we are readOnly

    for (let i = 0, {
      length
    } = childTabs; i < length; i++) {
      childTabs[i].readOnly = readOnly;
    }
  }

} // Register this widget type with its Factory

TaskEditorBase.initClass();
TaskEditorBase._$name = 'TaskEditorBase';

/**
 * @module SchedulerPro/widget/taskeditor/mixin/EventLoader
 */

/**
 * Mixin class for task editor widgets which require record loading functionality
 *
 * @mixin
 * @mixinbase Container
 */

var EventLoader = (Target => class extends (Target || Container) {
  get project() {
    var _this$record;

    return (_this$record = this.record) === null || _this$record === void 0 ? void 0 : _this$record.project;
  }

  loadEvent(record, highlightChanges) {
    this.setRecord(record, highlightChanges);
  }

  resetData() {
    this.record = null;
  }

  beforeSave() {}

  afterSave() {
    this.resetData();
  }

  beforeCancel() {}

  afterCancel() {
    this.resetData();
  }

  beforeDelete() {}

  afterDelete() {
    this.resetData();
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module SchedulerPro/widget/taskeditor/EditorTab
 */

/**
 * Base class for tabs that **do not contain fields** (non-form tabs) in {@link SchedulerPro.widget.SchedulerTaskEditor scheduler task editor} or
 * {@link SchedulerPro.widget.GanttTaskEditor gantt task editor}, such as Successors, Predecessors or Resources.
 *
 * @extends Core/widget/Container
 * @mixes SchedulerPro/widget/taskeditor/mixin/EventLoader
 */

class EditorTab extends Container.mixin(EventLoader, ReadyStatePropagator) {
  static get $name() {
    return 'EditorTab';
  }

  static get type() {
    return 'editortab';
  }

  static get configurable() {
    return {
      title: null
    };
  }

}
EditorTab._$name = 'EditorTab';

/**
 * @module SchedulerPro/widget/taskeditor/FormTab
 */

/**
 * Base class for tabs that **contain fields** (form-like tabs) in {@link SchedulerPro.widget.SchedulerTaskEditor scheduler task editor} or
 * {@link SchedulerPro.widget.GanttTaskEditor gantt task editor}, such as General or Notes.
 *
 * @extends SchedulerPro/widget/taskeditor/EditorTab
 */

class FormTab extends EditorTab {
  static get $name() {
    return 'FormTab';
  }

  static get type() {
    return 'formtab';
  }

  static get defaultConfig() {
    return {
      layoutStyle: {
        flexFlow: 'row wrap',
        alignItems: 'flex-start',
        alignContent: 'flex-start'
      },
      autoUpdateRecord: true
    };
  }

  onFieldChange({
    source,
    valid,
    userAction
  }) {
    if (userAction) {
      valid = valid !== undefined ? valid : typeof source.isValid === 'function' ? source.isValid() : source.isValid;

      if (valid) {
        super.onFieldChange(...arguments);
      }
    }
  }

}
FormTab.initClass();
FormTab._$name = 'FormTab';

/**
 * @module SchedulerPro/widget/StartDateField
 */

/**
 * Date field widget (text field + date picker) to be used together with Scheduling Engine.
 * This field adjusts time to the earliest possible time of the day based on either:
 *
 * - the event calendars (which is a combination of its own calendar and assigned resources ones) - if
 *   {@link #config-eventRecord} is provided.
 * - the project {@link SchedulerPro.model.ProjectModel#field-calendar calendar} - if {@link #config-project} is
 *   provided.
 *
 * **Please note, that either {@link #config-eventRecord} or {@link #config-project} value must be provided.**
 *
 * This field can be used as an editor for the {@link Grid.column.Column Column}.
 * It is used as the default editor for the `StartDateColumn`.
 *
 * {@inlineexample SchedulerPro/widget/StartDateField.js}
 * @extends Core/widget/DateField
 * @classType startdatefield
 */

class StartDateField extends DateField {
  //region Config
  static get $name() {
    return 'StartDateField';
  } // Factoryable type name

  static get type() {
    return 'startdatefield';
  } // Factoryable type alias

  static get alias() {
    return 'startdate';
  }

  static get defaultConfig() {
    return {
      /**
       * Project model calendar of which should be used by the field.
       * @config {SchedulerPro.model.ProjectModel}
       */
      project: null,

      /**
       * Event model calendars of which should be used by the field.
       * @config {SchedulerPro.model.EventModel}
       */
      eventRecord: null
    };
  } //endregion
  //region Internal

  get calendarProvider() {
    return this.eventRecord || this.project;
  }

  get backShiftDate() {
    const me = this;
    return me.calendarProvider.run('skipWorkingTime', me.value, false, me._step.magnitude, me._step.unit);
  }

  get forwardShiftDate() {
    const me = this;
    let result = me.calendarProvider.run('skipWorkingTime', me.value, true, me._step.magnitude, me._step.unit); // Need to skip non working time
    // since after the above step "result" can be set at 17:00 for example (for business calendar)

    result = result && me.calendarProvider.run('skipNonWorkingTime', result, true);
    return result;
  }

  transformTimeValue(value) {
    const {
      calendarProvider,
      keepTime
    } = this;

    if (calendarProvider && keepTime !== 'entered') {
      const startOfTheDay = DateHelper.clearTime(value),
            // search for the earliest available time for this day
      earliestTime = calendarProvider.run('skipNonWorkingTime', startOfTheDay); // if it's the same day, the earliest time is found, use it

      if (DateHelper.isValidDate(earliestTime) && DateHelper.isEqual(earliestTime, startOfTheDay, 'day')) {
        return DateHelper.copyTimeValues(startOfTheDay, earliestTime);
      }
    }

    return super.transformTimeValue(value);
  } //endregion

} // Register this widget type with its Factory

StartDateField.initClass();
StartDateField._$name = 'StartDateField';

/**
 * @module SchedulerPro/widget/EndDateField
 */

/**
 * Date field widget (text field + date picker) to be used together with Scheduling Engine.
 * This field adjusts time to the latest possible time of the day based on either:
 *
 * - the event calendars (which is a combination of its own calendar and assigned resources ones) - if
 *   {@link #config-eventRecord} is provided.
 * - the project {@link SchedulerPro.model.ProjectModel#field-calendar calendar} - if {@link #config-project} is
 *   provided.
 *
 * **Please note, that either {@link #config-eventRecord} or {@link #config-project} value must be provided.**
 *
 * This field can be used as an editor for a {@link Grid.column.Column Column}.
 * It is used as the default editor for the `EndDateColumn`.
 *
 * {@inlineexample SchedulerPro/widget/EndDateField.js}
 * @extends Core/widget/DateField
 * @classType enddatefield
 */

class EndDateField extends DateField {
  //region Config
  static get $name() {
    return 'EndDateField';
  } // Factoryable type name

  static get type() {
    return 'enddatefield';
  } // Factoryable alias name

  static get alias() {
    return 'enddate';
  }

  static get defaultConfig() {
    return {
      /**
       * Project model calendar of which should be used by the field.
       * @config {SchedulerPro.model.ProjectModel}
       */
      project: null,

      /**
       * The Event model defining the calendar to be used by the field.
       * @config {SchedulerPro.model.EventModel}
       */
      eventRecord: null
    };
  } //endregion
  //region Internal

  get min() {
    var _this$eventRecord;

    let min = this._min;
    const eventStartDate = (_this$eventRecord = this.eventRecord) === null || _this$eventRecord === void 0 ? void 0 : _this$eventRecord.startDate;

    if (eventStartDate) {
      min = DateHelper.max(min || eventStartDate, eventStartDate);
    }

    return min;
  }

  set min(value) {
    super.min = value;
  }

  get calendarProvider() {
    return this.eventRecord || this.project;
  }

  get backShiftDate() {
    const me = this;
    let result = me.calendarProvider.run('skipWorkingTime', me.value, false, me._step.magnitude, me._step.unit); // Need to skip non working time
    // since after the above step "result" can be set at 08:00 for example (for business calendar)

    result = result && me.calendarProvider.run('skipNonWorkingTime', result, false);
    return result;
  }

  get forwardShiftDate() {
    const me = this;
    return me.calendarProvider.run('skipWorkingTime', me.value, true, me._step.magnitude, me._step.unit);
  }

  transformTimeValue(value) {
    const {
      calendarProvider,
      keepTime
    } = this;

    if (calendarProvider && keepTime !== 'entered') {
      const startOfTheDay = DateHelper.clearTime(value),
            startOfNextDay = DateHelper.add(startOfTheDay, 1, 'day'),
            // search for the latest available time for this day
      latestTime = calendarProvider.run('skipNonWorkingTime', startOfNextDay, false); // if it's the same day, the latest time is found, use it

      if (DateHelper.isValidDate(latestTime) && DateHelper.isEqual(latestTime, startOfTheDay, 'day')) {
        return DateHelper.copyTimeValues(startOfTheDay, latestTime);
      }
    } // if keepTime==false means we reset time info ..make sure we do not violate "min" value in that case

    if (!keepTime && value && this.min && DateHelper.clearTime(value, false) < this.min) {
      return this.min;
    }

    return super.transformTimeValue(value);
  } //endregion

} // Register this widget type with its Factory

EndDateField.initClass();
EndDateField._$name = 'EndDateField';

/**
 * @module SchedulerPro/widget/EffortField
 */
// NOTE: class is created mostly for localization reasons
//       effort field invalidText might differ from duration field one.

/**
 * A specialized field allowing a user to also specify duration unit when editing the effort value.
 *
 * {@inlineexample SchedulerPro/widget/EffortField.js}
 * @extends Core/widget/DurationField
 * @classType effort
 */

class EffortField extends DurationField {
  static get $name() {
    return 'EffortField';
  } // Factoryable type name

  static get type() {
    return 'effort';
  } // Factoryable type name

  static get alias() {
    return 'effortfield';
  }

} // Register this widget type with its Factory

EffortField.initClass();
EffortField._$name = 'EffortField';

/**
 * @module SchedulerPro/widget/taskeditor/GeneralTab
 */

/**
 * A tab inside the {@link SchedulerPro/widget/SchedulerTaskEditor scheduler task editor} or
 * {@link SchedulerPro/widget/GanttTaskEditor gantt task editor} showing the general information for a task.
 *
 * | Field ref     | Type                                       | Text       | Weight | Description                                                        |
 * |---------------|--------------------------------------------|------------|--------|--------------------------------------------------------------------|
 * | `name`        | {@link Core/widget/TextField}              | Name       | 100    | Task name                                                          |
 * | `percentDone` | {@link Core/widget/NumberField}            | % Complete | 200    | Shows what part of task is done already in percentage              |
 * | `effort`      | {@link SchedulerPro/widget/EffortField}    | Effort     | 300    | Shows how much working time is required to complete the whole task |
 * | `divider`     | {@link Core/widget/Widget}                 |            | 400    | Visual splitter between 2 groups of fields                         |
 * | `startDate`   | {@link SchedulerPro/widget/StartDateField} | Start      | 500    | Shows when the task begins                                         |
 * | `endDate`     | {@link SchedulerPro/widget/EndDateField}   | Finish     | 600    | Shows when the task ends                                           |
 * | `duration`    | {@link Core/widget/DurationField}          | Duration   | 700    | Shows how long the task is                                         |
 *
 * @extends SchedulerPro/widget/taskeditor/FormTab
 * @classtype generaltab
 */

class GeneralTab extends FormTab {
  static get $name() {
    return 'GeneralTab';
  } // Factoryable type name

  static get type() {
    return 'generaltab';
  }

  static get defaultConfig() {
    return {
      title: 'L{General}',
      cls: 'b-general-tab',
      defaults: {
        localeClass: this
      },
      items: {
        name: {
          type: 'text',
          weight: 100,
          required: true,
          label: 'L{Name}',
          clearable: true,
          name: 'name',
          cls: 'b-name'
        },
        percentDone: {
          type: 'number',
          weight: 200,
          label: 'L{% complete}',
          name: 'renderedPercentDone',
          cls: 'b-percent-done b-inline',
          flex: '1 0 50%',
          min: 0,
          max: 100
        },
        effort: {
          type: 'effort',
          weight: 300,
          label: 'L{Effort}',
          name: 'fullEffort',
          flex: '1 0 50%'
        },
        divider: {
          html: '',
          weight: 400,
          dataset: {
            text: this.L('L{Dates}')
          },
          cls: 'b-divider',
          flex: '1 0 100%'
        },
        startDate: {
          type: 'startdate',
          weight: 500,
          label: 'L{Start}',
          name: 'startDate',
          cls: 'b-start-date b-inline',
          flex: '1 0 50%'
        },
        endDate: {
          type: 'enddate',
          weight: 600,
          label: 'L{Finish}',
          name: 'endDate',
          cls: 'b-end-date',
          flex: '1 0 50%'
        },
        duration: {
          type: 'durationfield',
          weight: 700,
          label: 'L{Duration}',
          name: 'fullDuration',
          flex: '.5 0',
          cls: 'b-inline'
        }
      }
    };
  }

  loadEvent(record) {
    const step = {
      unit: record.durationUnit,
      magnitude: 1
    },
          {
      startDate,
      endDate,
      effort
    } = this.widgetMap;

    if (startDate) {
      startDate.step = step;
      startDate.eventRecord = record;
    }

    if (endDate) {
      endDate.step = step;
      endDate.eventRecord = record;
    }

    if (effort) {
      effort.unit = record.effortUnit;
    }

    super.loadEvent(record);
  }

} // Register this widget type with its Factory

GeneralTab.initClass();
GeneralTab._$name = 'GeneralTab';

/**
 * @module SchedulerPro/widget/DependencyTypePicker
 */

const buildItems = items => items.map((item, index) => [index, item]);
/**
 * A combo box field used to select the link type for a {@link SchedulerPro.model.DependencyModel Dependency} between two tasks.
 *
 * {@inlineexample SchedulerPro/widget/DependencyTypePicker.js}
 * @extends Core/widget/Combo
 * @classType dependencytypepicker
 */

class DependencyTypePicker extends Combo {
  //region Config
  static get $name() {
    return 'DependencyTypePicker';
  } // Factoryable type name

  static get type() {
    return 'dependencytypepicker';
  } //endregion
  //region Constructor

  construct(config) {
    super.construct(config); // Update when changing locale

    LocaleManagerSingleton.on({
      locale: () => {
        this.items = buildItems(this.L('L{DependencyType.long}'));
      },
      thisObj: this
    });
  } //endregion
  //region Internal

  get store() {
    if (!this._items) {
      this.items = this._items = buildItems(this.L('L{DependencyType.long}'));
    }

    return super.store;
  }

  set store(store) {
    super.store = store;
  } //endregion

} // Register this widget type with its Factory

DependencyTypePicker.initClass();
DependencyTypePicker._$name = 'DependencyTypePicker';

/**
 * @module SchedulerPro/widget/taskeditor/DependencyTab
 */

const markDependencyValid = (dep, grid) => {
  dep.instanceMeta(grid).valid = true;
},
      markDependencyInvalid = (dep, grid) => {
  dep.instanceMeta(grid).valid = false;
},
      isDependencyMarkedValid = (dep, grid) => dep.instanceMeta(grid).valid !== false;
/**
 * Abstract base class for SuccessorsTab and PredecessorsTab.
 *
 * @extends SchedulerPro/widget/taskeditor/EditorTab
 * @abstract
 */

class DependencyTab extends EditorTab {
  //region Config
  static get $name() {
    return 'DependencyTab';
  }

  static get type() {
    return 'dependencytab';
  }

  static get configurable() {
    return {
      /**
       * A task field (`id`, `wbsCode`, `sequenceNumber` etc) that will be used when displaying and editing linked
       * tasks. Defaults to Gantt `dependencyIdField`.
       * @config {String} dependencyIdField
       */
      dependencyIdField: null,
      layoutStyle: {
        flexFlow: 'column nowrap'
      },
      // Documented in subclasses
      sortField: null,

      /**
       * A task field (`id`, `wbsCode`, `sequenceNumber` etc) to sort tasks in the task combo by
       * @config {String}
       * @default
       */
      taskComboSortField: 'name',
      items: {
        grid: {
          type: 'grid',
          weight: 100,
          flex: '1 1 auto',
          emptyText: '',
          asyncEventSuffix: 'PreCommit',
          disableGridRowModelWarning: true,
          features: {
            group: false
          },
          columns: {
            data: {
              id: {
                localeClass: this,
                text: 'L{ID}',
                flex: 1,
                editor: false,
                htmlEncode: false,
                hidden: true,

                sortable(dependency1, dependency2) {
                  var _dependency1$directio, _dependency2$directio;

                  const {
                    dependencyIdField,
                    direction
                  } = this.grid.parent,
                        id1 = (_dependency1$directio = dependency1[direction]) === null || _dependency1$directio === void 0 ? void 0 : _dependency1$directio[dependencyIdField],
                        id2 = (_dependency2$directio = dependency2[direction]) === null || _dependency2$directio === void 0 ? void 0 : _dependency2$directio[dependencyIdField];

                  if (id1 === id2) {
                    return 0;
                  }

                  return id1 < id2 ? -1 : 1;
                },

                renderer: ({
                  record: dependency,
                  row,
                  grid,
                  column
                }) => {
                  let html;
                  const {
                    direction
                  } = grid.parent,
                        linkedEvent = dependency[direction];

                  if (linkedEvent && isDependencyMarkedValid(dependency, grid)) {
                    const idField = grid.parent.dependencyIdField,
                          id = linkedEvent[idField];

                    if (idField === 'id') {
                      html = !linkedEvent || linkedEvent.hasGeneratedId ? '*' : linkedEvent.id;
                    } else {
                      html = id;
                    }
                  } else {
                    row.addCls('b-invalid');
                    html = '<div class="b-icon b-icon-warning"></div>';
                  }

                  return html;
                }
              },
              name: {
                localeClass: this,
                text: 'L{Name}',
                flex: 5,
                renderer: ({
                  value: event,
                  grid,
                  cellElement
                }) => {
                  if (event) {
                    // indicate inactive tasks
                    cellElement.classList.toggle('b-inactive', event.inactive);
                    const id = event[grid.parent.dependencyIdField];
                    return event.name + (id != null && !event.hasGeneratedId ? ` (${id})` : '');
                  }

                  return '';
                },
                finalizeCellEdit: 'up.finalizeLinkedTaskCellEdit',
                editor: {
                  type: 'modelcombo',
                  displayField: 'name',
                  valueField: 'id',
                  filterOperator: '*',
                  allowInvalid: true,

                  listItemTpl(event) {
                    if (!this._dependencyTab) {
                      this._dependencyTab = this.up('dependencytab', true);
                    }

                    let id = event[this._dependencyTab.dependencyIdField];
                    id = id != null && !event.hasGeneratedId ? `(${id})` : '';
                    return `${event.name} ${id}`;
                  }

                }
              },
              type: {
                localeClass: this,
                text: 'L{Type}',
                field: 'type',
                flex: 3,
                sortable: false,
                editor: 'dependencytypepicker',

                renderer({
                  value
                }) {
                  return this.L('L{DependencyType.long}')[value];
                }

              },
              lag: {
                localeClass: this,
                text: 'L{Lag}',
                type: 'duration',
                field: 'fullLag',
                flex: 2,
                editor: {
                  allowNegative: true
                }
              }
            }
          }
        },
        toolbar: {
          type: 'toolbar',
          dock: 'bottom',
          cls: 'b-compact-bbar',
          items: {
            add: {
              type: 'button',
              weight: 210,
              cls: 'b-add-button b-green',
              icon: 'b-icon b-icon-add',
              onAction: 'up.onAddClick'
            },
            remove: {
              type: 'button',
              weight: 220,
              cls: 'b-remove-button b-red',
              icon: 'b-icon b-icon-trash',
              disabled: true,
              onAction: 'up.onRemoveClick'
            }
          }
        }
      }
    };
  } //endregion
  // Triggered before applying cell editing result to the dependency

  async finalizeLinkedTaskCellEdit({
    grid,
    value: linkedTask,
    record: dependency
  }) {
    const {
      project
    } = grid.store.masterStore,
          isSuccessor = this.direction === 'toEvent',
          source = isSuccessor ? dependency.fromEvent : linkedTask,
          target = isSuccessor ? linkedTask : dependency.toEvent,
          validationResult = await project.validateDependency(source, target, dependency.type, dependency);

    switch (validationResult) {
      // no error
      case 0:
        return true;
      // cycle

      case 1:
        return 'L{DependencyTab.cyclicDependency}';
    }

    return 'L{DependencyTab.invalidDependency}';
  }

  afterConstruct() {
    super.afterConstruct();
    const me = this,
          grid = me.grid = me.widgetMap.grid;
    grid.on({
      selectionChange: 'onGridSelectionChange',
      startCellEdit: 'onGridStartCellEdit',
      finishCellEdit: 'onGridFinishCellEdit',
      cancelCellEdit: 'onGridCancelCellEdit',
      thisObj: me
    });
  }

  updateReadOnly(readOnly) {
    const {
      add,
      remove
    } = this.widgetMap;
    super.updateReadOnly(...arguments); // Buttons hide when we are readOnly

    add.hidden = remove.hidden = readOnly;
  }

  get taskCombo() {
    const {
      grid
    } = this,
          from = grid === null || grid === void 0 ? void 0 : grid.columns.get(this.direction);
    return from === null || from === void 0 ? void 0 : from.editor;
  }

  loadEvent(eventRecord) {
    const me = this,
          {
      grid,
      taskCombo,
      record
    } = me;
    super.loadEvent(eventRecord);
    const {
      dependencyStore,
      eventStore
    } = me.project,
          storeChange = grid.store.masterStore !== dependencyStore,
          recordChange = !storeChange && eventRecord !== record; // On first load or if project has changed, populate the chained stores.
    // Our grid store will contain only the direction of dependencies this tab is interested in.
    // Our taskCombo only contains all events other than our event.
    // An event can't depend upon itself.

    if (storeChange) {
      // Cache the mutation generation of the underlying data collection
      // so that we know when we need to refill the chained stores.
      me.depStoreGeneration = dependencyStore.storage.generation;
      me.eventStoreGeneration = eventStore.storage.generation;
      me.detachListeners('taskCombo');
      grid.store = dependencyStore.chain(d => d[me.negDirection] === me.record, null);
      const comboStore = taskCombo.store = eventStore.chain( // Remove original record from chained store, but keep those records that are already selected in the dependency grid
      e => e !== me.record, null, {
        doRelayToMaster: [],
        // Need to show all records in the combo
        excludeCollapsedRecords: false
      });
      comboStore.sort(me.taskComboSortField); // Post process chained store and exclude records that are already selected in the dependency grid.
      // It's needed to be a separate filtering because otherwise when cell editor opens combo and sets initial value,
      // it cannot find it in the storage and adds new record.

      comboStore.filterBy(e => !grid.store.find(d => {
        const dep = d[me.direction],
              activeEdit = me._activeCellEdit,
              isDepEditing = activeEdit && dep === activeEdit.record[me.direction]; // checking !isDepEditing will keep as combo option the current record

        return dep === e && !isDepEditing;
      }));
      taskCombo.on({
        name: 'taskCombo',
        change: 'onGridCellEditChange',
        thisObj: me
      });
    } else {
      // Only repopulate the chained stores if the master stores have changed
      // or if this is being loaded with a different record.
      if (recordChange || dependencyStore.storage.generation !== me.depStoreGeneration) {
        grid.store.fillFromMaster();
        me.depStoreGeneration = dependencyStore.storage.generation;
      } // If not changed, the details within the store may have changed
      // (for example undo on edit cancel), so refresh the grid.
      else {
        grid.refreshRows();
      }

      if (recordChange || eventStore.storage.generation !== me.eventStoreGeneration) {
        taskCombo.store.fillFromMaster();
        me.eventStoreGeneration = eventStore.storage.generation;
      }
    }

    if (recordChange) {
      grid.store.sort(me.sortField);
    }

    me.requestReadyStateChange();
  }

  async insertNewDependency() {
    const me = this,
          {
      grid
    } = me,
          depStore = grid.store,
          projectDepStore = me.project.dependencyStore; // This call will be relayed to project dependency store.

    const [newDep] = depStore.insert(0, {
      type: DependencyType.EndToStart,
      lag: 0,
      lagUnit: TimeUnit.Day,
      [me.negDirection]: me.record
    }); // Reset the dependency store mutation monitor when we add a dependency

    me.depStoreGeneration = projectDepStore.storage.generation;
    grid.features.cellEdit.startEditing({
      field: me.direction,
      id: newDep.id
    });
    markDependencyInvalid(newDep, grid);
    return newDep;
  }

  onAddClick() {
    this.insertNewDependency();
  }

  onRemoveClick() {
    const me = this,
          grid = me.grid,
          toRemove = grid.selectedRecords;
    me.project.dependencyStore.remove(toRemove);
    grid.selectedRecord = grid.store.getNext(toRemove[0]);
    me.taskCombo.store.fillFromMaster();
  }

  onGridSelectionChange({
    selection
  }) {
    const removeButton = this.widgetMap.remove,
          disable = !(selection !== null && selection !== void 0 && selection.length) || this.up(w => w.readOnly); // Rather than allow auto focus reversion which attempts to focus the same element
    // that focus arrived from, explicitly focus the grid so that the navigation's leniency
    // will focus the closest remaining cell to the focusedCell.

    if (removeButton.containsFocus && disable) {
      // Focus grid header
      this.grid.focusCell({
        rowIndex: -1,
        columnIndex: 0
      });
    }

    removeButton.disabled = disable;
  }

  clearActiveEditorErrors() {
    const me = this,
          activeCellEdit = me._activeCellEdit;

    if (activeCellEdit && activeCellEdit.column.field === me.direction) {
      activeCellEdit.editor.inputField.clearError(); // clears all errors
    }
  }

  onGridCellEditChange() {
    // Since we deposit some errors on the editor during startEdit (see onGridStartCellEdit), we must also clear
    // them eventually or the editor will refuse to accept any value. Since validation will still take place, we
    // don't need to worry about preventing the editor from dismissing nor could we realistically since validation
    // is async (see onGridFinishCellEdit).
    this.clearActiveEditorErrors();
  }

  onGridStartCellEdit({
    editorContext
  }) {
    const me = this,
          dep = me._editingDependency = editorContext.record,
          {
      grid
    } = me,
          dir = me.direction;
    me._activeCellEdit = editorContext;

    if (editorContext.column.field === dir) {
      if (!isDependencyMarkedValid(dep, grid)) {
        if (!dep[dir]) {
          editorContext.editor.inputField.setError('L{DependencyTab.invalidDependency}');
        } else {
          editorContext.editor.inputField.setError('L{DependencyTab.cyclicDependency}');
        }
      } else {
        me.clearActiveEditorErrors();
      } //dep.shadow();

    }
  }

  async onGridFinishCellEdit({
    editorContext
  }) {
    const me = this,
          {
      record: dependency,
      column
    } = editorContext,
          {
      grid,
      direction
    } = me; // Other dependency end

    if (column.field === direction) {
      markDependencyValid(dependency, grid);
      me.taskCombo.store.fillFromMaster();
    } // Type and Lag
    else {
      me.redrawDependencyRow(dependency);
    }

    me._activeCellEdit = me._editingDependency = null;
    me.requestReadyStateChange();
  }

  afterCancel() {
    // After task editor is closed by clicking "Cancel"
    // let's cancel cell editing if it's in progress (could happen if cell editor has a validation error)
    if (this._activeCellEdit) {
      this.grid.features.cellEdit.cancelEditing(true);
    }
  }

  onGridCancelCellEdit(data) {
    const me = this,
          dependency = me._editingDependency;

    if (dependency) {
      if (!dependency[me.direction]) {
        markDependencyInvalid(dependency, me.grid);
        me.redrawDependencyRow(dependency);
      }

      me._activeCellEdit = me._editingDependency = null;
    }

    me.requestReadyStateChange();
  }

  redrawDependencyRow(dependency) {
    // TODO: Redraw dependency directly instead of row
    const {
      grid
    } = this,
          row = grid.rowManager.getRowById(dependency); // Might be out of view

    if (row) {
      const recordIndex = grid.store.indexOf(dependency); // the record could no longer be in the store if we click remove button while cell editing is in progress

      if (recordIndex >= 0) {
        row.render(grid.store.indexOf(dependency), dependency);
      }
    }
  }

  get canSave() {
    const {
      grid
    } = this;
    return grid.store.reduce((r, d) => r && isDependencyMarkedValid(d, grid), true);
  }

}
DependencyTab._$name = 'DependencyTab';

/**
 * @module SchedulerPro/widget/taskeditor/SuccessorsTab
 */

/**
 * A tab inside the {@link SchedulerPro.widget.SchedulerTaskEditor scheduler task editor} or
 * {@link SchedulerPro.widget.GanttTaskEditor gantt task editor} showing the successors of an event or task.
 *
 * The tab has the following contents by default:
 *
 * | Widget ref  | Type                                | Weight | Description                                         |
 * |-------------|-------------------------------------|--------|-----------------------------------------------------|
 * | `grid`      | {@link Grid.view.Grid Grid}         | 100    | Shows successors task name, dependency type and lag |
 * | \> `id`*    | {@link Grid.column.Column Column}   | -      | Id column                                           |
 * | \> `name`*  | {@link Grid.column.Column Column}   | -      | Name column, linked task                            |
 * | \> `type`*  | {@link Grid.column.Column Column}   | -      | Dependency type column                              |
 * | \> `lag` *  | {@link Scheduler.column.DurationColumn DurationColumn} | - | Duration column                    |
 * | `toolbar`   | {@link Core.widget.Toolbar Toolbar} | -      | Control buttons in a toolbar docked to bottom       |
 * | \> `add`    | {@link Core.widget.Button Button}   | 210    | Adds a new successor                                |
 * | \> `remove` | {@link Core.widget.Button Button}   | 220    | Removes selected outgoing dependency                |
 *
 * <sup>*</sup>Columns are kept in the grids column store, they can be customized in a similar manner as other widgets in the
 * editor:
 *
 * ```javascript
 * const scheduler = new SchedulerPro({
 *   features : {
 *     taskEdit : {
 *       items : {
 *         successorsTab : {
 *           items : {
 *             grid : {
 *               columns : {
 *                 // Columns are held in a store, thus it uses `data`
 *                 // instead of `items`
 *                 data : {
 *                   name : {
 *                     // Change header text for the name column
 *                     text : 'Linked to'
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @extends SchedulerPro/widget/taskeditor/DependencyTab
 * @classtype successorstab
 */

class SuccessorsTab extends DependencyTab {
  static get $name() {
    return 'SuccessorsTab';
  } // Factoryable type name

  static get type() {
    return 'successorstab';
  }

  static get configurable() {
    return {
      cls: 'b-successors-tab',
      direction: 'toEvent',
      negDirection: 'fromEvent',
      title: 'L{DependencyTab.Successors}',

      /**
       * Dependency field to sort successors by
       * @private
       * @config {String}
       * @default
       */
      sortField: 'toEventName',
      items: {
        grid: {
          columns: {
            data: {
              name: {
                field: 'toEvent'
              }
            }
          }
        }
      }
    };
  }

} // Register this widget type with its Factory

SuccessorsTab.initClass();
SuccessorsTab._$name = 'SuccessorsTab';

/**
 * @module SchedulerPro/widget/taskeditor/PredecessorsTab
 */

/**
 * A tab inside the {@link SchedulerPro.widget.SchedulerTaskEditor scheduler task editor} or
 * {@link SchedulerPro.widget.GanttTaskEditor gantt task editor} showing the predecessors of an event or task.
 *
 * The tab has the following contents by default:
 *
 * | Widget ref  | Type                                | Weight | Description                                       |
 * |-------------|-------------------------------------|--------|---------------------------------------------------|
 * | `grid`      | {@link Grid.view.Grid Grid}         | 100    | Shows predecessors  name, dependency type and lag |
 * | \> `id`*    | {@link Grid.column.Column Column}   | -      | Id column                                         |
 * | \> `name`*  | {@link Grid.column.Column Column}   | -      | Name column, linked task                          |
 * | \> `type`*  | {@link Grid.column.Column Column}   | -      | Dependency type column                            |
 * | \> `lag`*   | {@link Scheduler.column.DurationColumn DurationColumn} | - | Duration column                  |
 * | `toolbar`   | {@link Core.widget.Toolbar Toolbar} | -      | Control buttons in a toolbar docked to bottom     |
 * | \> `add`    | {@link Core.widget.Button Button}   | 210    | Adds a new predecessor                            |
 * | \> `remove` | {@link Core.widget.Button Button}   | 220    | Removes selected incoming dependency              |
 *
 * <sup>*</sup>Columns are kept in the grids column store, they can be customized in a similar manner as other widgets in the
 * editor:
 *
 * ```javascript
 * const scheduler = new SchedulerPro({
 *   features : {
 *     taskEdit : {
 *       items : {
 *          predecessorsTab : {
 *            items : {
 *              grid : {
 *                columns : {
 *                  // Columns are held in a store, thus it uses `data`
 *                  // instead of `items`
 *                  data : {
 *                    name : {
 *                      // Change header text for the name column
 *                      text : 'Linked to'
 *                    }
 *                  }
 *                }
 *              }
 *            }
 *          }
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @extends SchedulerPro/widget/taskeditor/DependencyTab
 * @classtype predecessorstab
 */

class PredecessorsTab extends DependencyTab {
  static get $name() {
    return 'PredecessorsTab';
  } // Factoryable type name

  static get type() {
    return 'predecessorstab';
  }

  static get configurable() {
    return {
      cls: 'b-predecessors-tab',
      direction: 'fromEvent',
      negDirection: 'toEvent',
      title: 'L{DependencyTab.Predecessors}',

      /**
       * Dependency field to sort predecessors by
       * @private
       * @config {String}
       * @default
       */
      sortField: 'fromEventName',
      items: {
        grid: {
          columns: {
            data: {
              name: {
                field: 'fromEvent'
              }
            }
          }
        }
      }
    };
  }

} // Register this widget type with its Factory

PredecessorsTab.initClass();
PredecessorsTab._$name = 'PredecessorsTab';

/**
 * @module SchedulerPro/widget/taskeditor/ResourcesTab
 */

/**
 * A tab inside the {@link SchedulerPro.widget.SchedulerTaskEditor scheduler task editor} or
 * {@link SchedulerPro.widget.GanttTaskEditor gantt task editor} showing the assigned resources for an event or task.
 *
 * The tab has the following contents by default:
 *
 * | Widget ref     | Type                                          | Weight | Description                            |
 * |----------------|-----------------------------------------------|--------|----------------------------------------|
 * | `grid`         | {@link Grid.view.Grid Grid}                   | 100    | Shows resource name and assigned units |
 * | \> `resource`* | {@link Grid.column.Column Column}             | -      | Name column, linked task               |
 * | \> `units`*    | {@link Grid.column.NumberColumn NumberColumn} | -      | Dependency type column                 |
 * | `toolbar`      | {@link Core.widget.Toolbar Toolbar}           | -      | Toolbar docked to bottom               |
 * | \> `add`       | {@link Core.widget.Button Button}             | 210    | Adds a new assignment                  |
 * | \> `remove`    | {@link Core.widget.Button Button}             | 220    | Removes selected assignment            |
 *
 * <sup>*</sup>Columns are kept in the grids column store, they can be customized in a similar manner as other widgets
 * in the editor:
 *
 * ```javascript
 * const scheduler = new SchedulerPro({
 *   features : {
 *     taskEdit : {
 *       items : {
 *         resourcesTab : {
 *           items : {
 *             grid : {
 *               columns : {
 *                 // Columns are held in a store, thus it uses `data`
 *                 // instead of `items`
 *                 data : {
 *                   resource : {
 *                     // Change header text for the resource column
 *                     text : 'Machine'
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @extends SchedulerPro/widget/taskeditor/EditorTab
 */

class ResourcesTab extends EditorTab {
  static get $name() {
    return 'ResourcesTab';
  } // Factoryable type name

  static get type() {
    return 'resourcestab';
  }

  static get configurable() {
    return {
      title: 'L{Resources}',
      cls: 'b-resources-tab',
      layoutStyle: {
        flexFlow: 'column nowrap'
      },
      items: {
        grid: {
          type: 'grid',
          weight: 100,
          flex: '1 1 auto',
          columns: {
            data: {
              resource: {
                localeClass: this,
                text: 'L{Resource}',
                field: 'resource',
                flex: 7,
                renderer: ({
                  value
                }) => (value === null || value === void 0 ? void 0 : value.name) || '',
                editor: {
                  type: 'modelcombo',
                  displayField: 'name',
                  valueField: 'id'
                }
              },
              units: {
                type: 'number',
                localeClass: this,
                text: 'L{Units}',
                field: 'units',
                flex: 3,
                renderer: data => this.L('L{unitsTpl}', data),
                min: 0,
                max: 100,
                step: 10
              }
            }
          },
          disableGridRowModelWarning: true,
          asyncEventSuffix: 'PreCommit'
        },
        toolbar: {
          type: 'toolbar',
          dock: 'bottom',
          cls: 'b-compact-bbar',
          items: {
            add: {
              type: 'button',
              weight: 210,
              cls: 'b-add-button b-green',
              icon: 'b-icon b-icon-add'
            },
            remove: {
              type: 'button',
              weight: 220,
              cls: 'b-remove-button b-red',
              icon: 'b-icon b-icon-trash',
              disabled: true
            }
          }
        }
      }
    };
  }

  afterConstruct() {
    super.afterConstruct();
    const me = this,
          addButton = me.addButton = me.widgetMap.add,
          removeButton = me.removeButton = me.widgetMap.remove,
          grid = me.grid = me.widgetMap.grid;
    addButton === null || addButton === void 0 ? void 0 : addButton.on('click', me.onAddClick, me);
    removeButton === null || removeButton === void 0 ? void 0 : removeButton.on('click', me.onRemoveClick, me);
    grid.on({
      selectionChange: 'onGridSelectionChange',
      startCellEdit: 'onGridStartCellEdit',
      finishCellEdit: 'onGridFinishCellEdit',
      cancelCellEdit: 'onGridCancelCellEdit',
      thisObj: me
    });
  }

  updateReadOnly(readOnly) {
    const {
      add,
      remove
    } = this.widgetMap;
    super.updateReadOnly(...arguments); // Buttons hide when we are readOnly

    add.hidden = remove.hidden = readOnly;
  }

  get resourceCombo() {
    var _this$grid;

    const from = (_this$grid = this.grid) === null || _this$grid === void 0 ? void 0 : _this$grid.columns.get('resource');
    return from === null || from === void 0 ? void 0 : from.editor;
  }

  loadEvent(eventRecord) {
    const me = this,
          {
      resourceCombo,
      grid,
      record
    } = me;
    super.loadEvent(eventRecord);
    const {
      assignmentStore,
      resourceStore
    } = me.project,
          storeChange = grid.store.masterStore !== assignmentStore,
          recordChange = !storeChange && eventRecord !== record; // Pro does not use units on assignments

    if (!eventRecord.isTask) {
      grid.columns.get('units').hide();
    }

    if (storeChange) {
      // Cache the mutation generation of the underlying data collection
      // so that we know when we need to refill the chained stores.
      me.assignmentStoreGeneration = assignmentStore.storage.generation;
      me.resourceStoreGeneration = resourceStore.storage.generation;
      grid.store = assignmentStore.chain(a => me.record && a.event === me.record, null);
      resourceCombo.store = resourceStore.chain(resource => {
        return !resource.isSpecialRow && me.record && !me.record.isAssignedTo(resource) || !me.activeAssignment || me.activeAssignment.resource === resource;
      }, null, {
        groupers: resourceStore.groupers
      });
    } else {
      // Only repopulate the chained stores if the master stores have changed
      // or if this is being loaded with a different record.
      if (recordChange || assignmentStore.storage.generation !== me.assignmentStoreGeneration) {
        grid.store.fillFromMaster();
      }

      if (recordChange || resourceStore.storage.generation !== me.resourceStoreGeneration) {
        resourceCombo.store.fillFromMaster();
      }
    }
  } // Returns the assignment row currently being edited

  get activeAssignment() {
    return this.grid.features.cellEdit.activeRecord;
  }

  async insertNewAssignment() {
    const me = this,
          {
      project,
      grid
    } = me,
          assignmentStore = project.assignmentStore;
    const [newAssignment] = assignmentStore.insert(0, {
      event: me.record,
      resource: null,
      units: 100
    }); // Reset the assignment store mutation monitor when we add an assignment

    me.assignmentStoreGeneration = assignmentStore.storage.generation;
    grid.features.cellEdit.startEditing({
      field: 'resource',
      id: newAssignment.id
    });
    return newAssignment;
  }

  beforeSave() {
    this.pruneInvalidAssignments();
  }

  onAddClick() {
    this.insertNewAssignment();
  }

  onRemoveClick() {
    const me = this,
          {
      grid
    } = me;
    grid.store.remove(grid.selectedRecords);
    grid.selectedRecords = null;
    me.removeButton.disable();
  }

  onGridSelectionChange({
    selection
  }) {
    const {
      removeButton
    } = this,
          disable = !(selection !== null && selection !== void 0 && selection.length) || this.up(w => w.readOnly); // Rather than allow auto focus reversion which attempts to focus the same element
    // that focus arrived from, explicitly focus the grid so that the navigation's leniency
    // will focus the closest remaining cell to the focusedCell.

    if (removeButton.containsFocus && disable) {
      this.grid.focus();
    }

    removeButton.disabled = disable;
  }

  onGridStartCellEdit({
    editorContext
  }) {
    if (editorContext.column.field === 'resource') {
      this.resourceCombo.store.fillFromMaster();
      this._editingAssignment = editorContext.record;
      this._activeCellEdit = editorContext;
    }
  }

  onGridFinishCellEdit() {
    this._activeCellEdit = this._editingAssignment = null;
  }

  onGridCancelCellEdit() {
    this._activeCellEdit = this._editingAssignment = null;
  }

  pruneInvalidAssignments() {
    const {
      store
    } = this.grid;
    store.remove(store.query(a => !a.isValid));
  }

} // Register this widget type with its Factory

ResourcesTab.initClass();
ResourcesTab._$name = 'ResourcesTab';

/**
 * @module SchedulerPro/widget/ConstraintTypePicker
 */

/**
 * Combo box preconfigured with possible constraint type values.
 * This picker doesn't support {@link Core/widget/Combo#config-multiSelect multiSelect}.
 *
 * This field can be used as an editor for a {@link Grid/column/Column}.
 * It is used as the default editor for the `ConstraintTypeColumn` in the Gantt chart.
 *
 * {@inlineexample SchedulerPro/widget/ConstraintTypePicker.js}
 * @extends Core/widget/Combo
 * @classType constrainttypepicker
 */

class ConstraintTypePicker extends Combo {
  //region Config
  static get $name() {
    return 'ConstraintTypePicker';
  } // Factoryable type name

  static get type() {
    return 'constrainttypepicker';
  }

  static get configurable() {
    return {
      valueField: 'id'
    };
  } //endregion
  //region Localization

  updateLocalization() {
    super.updateLocalization(); // rebuild newly translated options

    this.store.data = this.buildStoreData();
  } //endregion
  //region Internal

  buildStoreData() {
    const me = this;
    /* eslint-disable quote-props */

    return [{
      'id': 'none',
      text: me.L('L{none}')
    }, {
      'id': 'muststarton',
      text: me.L('L{muststarton}')
    }, {
      'id': 'mustfinishon',
      text: me.L('L{mustfinishon}')
    }, {
      'id': 'startnoearlierthan',
      text: me.L('L{startnoearlierthan}')
    }, {
      'id': 'startnolaterthan',
      text: me.L('L{startnolaterthan}')
    }, {
      'id': 'finishnoearlierthan',
      text: me.L('L{finishnoearlierthan}')
    }, {
      'id': 'finishnolaterthan',
      text: me.L('L{finishnolaterthan}')
    }];
    /* eslint-enable quote-props */
  }

  set value(value) {
    super.value = value;
  }

  get value() {
    const value = super.value;
    return value === 'none' ? null : value;
  }

  get store() {
    if (!this._store) {
      this.store = new Store({
        data: this.buildStoreData(),
        allowNullId: true
      });
    }

    return this._store;
  }

  set store(store) {
    super.store = store;
  } //endregion

} // Register this widget type with its Factory

ConstraintTypePicker.initClass();
ConstraintTypePicker._$name = 'ConstraintTypePicker';

/**
 * @module SchedulerPro/widget/SchedulingModePicker
 */

/**
 * Combo box preconfigured with possible scheduling mode values.
 *
 * This field can be used as an editor for the {@link Grid.column.Column Column}.
 * It is used as the default editor for the `SchedulingModeColumn`.
 *
 * {@inlineexample SchedulerPro/widget/SchedulingModePicker.js}
 * @extends Core/widget/Combo
 * @classType schedulingmodecombo
 */

class SchedulingModePicker extends Combo {
  static get $name() {
    //region Config
    return 'SchedulingModePicker';
  } // Factoryable type name

  static get type() {
    return 'schedulingmodecombo';
  } //endregion
  //region Internal

  buildStoreData() {
    return [{
      id: SchedulingMode.Normal,
      text: this.L('L{Normal}')
    }, {
      id: SchedulingMode.FixedDuration,
      text: this.L('L{Fixed Duration}')
    }, {
      id: SchedulingMode.FixedUnits,
      text: this.L('L{Fixed Units}')
    }, {
      id: SchedulingMode.FixedEffort,
      text: this.L('L{Fixed Effort}')
    }];
  }

  get store() {
    if (!this._store) {
      this.store = new Store({
        data: this.buildStoreData()
      });
    }

    return this._store;
  }

  set store(store) {
    super.store = store;
  }

  updateLocalization() {
    super.updateLocalization(); // rebuild newly translated options

    this.store.data = this.buildStoreData();
  } //endregion

} // Register this widget type with its Factory

SchedulingModePicker.initClass();
SchedulingModePicker._$name = 'SchedulingModePicker';

/**
 * @module SchedulerPro/widget/taskeditor/AdvancedTab
 */

/**
 * Advanced task options {@link SchedulerPro/widget/SchedulerTaskEditor scheduler task editor} or
 * {@link SchedulerPro/widget/GanttTaskEditor gantt task editor} tab.
 *
 * | Field ref                | Type                                             | Weight | Description                                                                                                                  |
 * |--------------------------|--------------------------------------------------|--------|------------------------------------------------------------------------------------------------------------------------------|
 * | `calendarField`          | {@link Core/widget/Combo}                        | 100    | Shows a list of available calendars for this task                                                                            |
 * | `manuallyScheduledField` | {@link Core/widget/Checkbox}                     | 200    | If checked, the task is not considered in scheduling                                                                         |
 * | `schedulingModeField`    | {@link SchedulerPro/widget/SchedulingModePicker} | 300    | Shows a list of available scheduling modes for this task                                                                     |
 * | `effortDrivenField`      | {@link Core/widget/Checkbox}                     | 400    | If checked, the effort of the task is kept intact, and the duration is updated. Works when scheduling mode is "Fixed Units". |
 * | `divider`                | {@link Core/widget/Widget}                       | 500    | Visual splitter between 2 groups of fields                                                                                   |
 * | `constraintTypeField`    | {@link SchedulerPro/widget/ConstraintTypePicker} | 600    | Shows a list of available constraints for this task                                                                          |
 * | `constraintDateField`    | {@link Core/widget/DateField}                    | 700    | Shows a date for the selected constraint type                                                                                |
 * | `rollupField`            | {@link Core/widget/Checkbox}                     | 800    | If checked, shows a bar below the parent task. Works when the "Rollup" feature is enabled.                                   |
 * | `inactiveField`          | {@link Core/widget/Checkbox}                     | 900    | Allows to inactivate the task so it won;t take part in the scheduling process.                                               |
 *
 * @extends SchedulerPro/widget/taskeditor/FormTab
 * @classtype advancedtab
 */

class AdvancedTab extends FormTab {
  static get $name() {
    return 'AdvancedTab';
  } // Factoryable type name

  static get type() {
    return 'advancedtab';
  }

  static get defaultConfig() {
    return {
      localeClass: this,
      title: 'L{Advanced}',
      cls: 'b-advanced-tab',
      defaults: {
        localeClass: this
      },
      items: {
        calendarField: {
          type: 'calendarfield',
          weight: 100,
          ref: '',
          name: 'calendar',
          label: 'L{Calendar}',
          flex: '1 0 50%',
          cls: 'b-inline'
        },
        manuallyScheduledField: {
          type: 'checkbox',
          weight: 200,
          name: 'manuallyScheduled',
          label: 'L{Manually scheduled}',
          flex: '1 0 50%'
        },
        schedulingModeField: {
          type: 'schedulingmodecombo',
          weight: 300,
          name: 'schedulingMode',
          label: 'L{Scheduling mode}',
          flex: '1 0 50%',
          cls: 'b-inline'
        },
        effortDrivenField: {
          type: 'checkbox',
          weight: 400,
          name: 'effortDriven',
          label: 'L{Effort driven}',
          flex: '1 0 50%'
        },
        divider: {
          weight: 500,
          html: '',
          dataset: {
            text: this.L('L{Constraint}')
          },
          cls: 'b-divider',
          flex: '1 0 100%'
        },
        constraintTypeField: {
          type: 'constrainttypepicker',
          weight: 600,
          name: 'constraintType',
          label: 'L{Constraint type}',
          pickerWidth: '14em',
          clearable: true,
          flex: '1 0 50%',
          cls: 'b-inline'
        },
        constraintDateField: {
          type: 'date',
          weight: 700,
          name: 'constraintDate',
          label: 'L{Constraint date}',
          keepTime: 'entered',
          flex: '1 0 50%',
          cls: 'b-inline'
        },
        rollupField: {
          type: 'checkbox',
          weight: 800,
          name: 'rollup',
          label: 'L{Rollup}',
          flex: '1 0 50%',
          cls: 'b-inline'
        },
        inactiveField: {
          type: 'checkbox',
          weight: 900,
          name: 'inactive',
          label: 'L{Inactive}',
          flex: '1 0 50%',
          cls: 'b-inline'
        }
      }
    };
  }

  get calendarField() {
    return this.widgetMap.calendarField;
  }

  get constraintTypeField() {
    return this.widgetMap.constraintTypeField;
  }

  get constraintDateField() {
    return this.widgetMap.constraintDateField;
  }

  get effortDrivenField() {
    return this.widgetMap.effortDrivenField;
  }

  get manuallyScheduledField() {
    return this.widgetMap.manuallyScheduledField;
  }

  get rollupField() {
    return this.widgetMap.rollupField;
  }

  get schedulingModeField() {
    return this.widgetMap.schedulingModeField;
  }

  loadEvent(eventRecord) {
    const me = this,
          {
      calendarField,
      constraintTypeField
    } = me,
          storeChange = (calendarField === null || calendarField === void 0 ? void 0 : calendarField.store) !== eventRecord.project.calendarManagerStore;

    if (calendarField && storeChange) {
      calendarField.store = eventRecord.project.calendarManagerStore;
    }

    if (constraintTypeField !== null && constraintTypeField !== void 0 && constraintTypeField.isConstraintTypePicker) {
      const {
        store: typesStore
      } = constraintTypeField;
      typesStore.removeFilter('constraintTypeApplicable');
      typesStore.filter({
        // Dodge pre-commit hook by quoting property
        'id': 'constraintTypeApplicable',
        // eslint-disable-line quote-props
        filterBy: r => eventRecord.run('isConstraintTypeApplicable', r.id)
      });
    }

    super.loadEvent(eventRecord);
  }

  afterDelete() {
    const {
      constraintTypeField
    } = this; // remove the constraint type combo store filter
    // otherwise eventRecord.run(...) will cause an exception since the record is no longer in the graph

    if (constraintTypeField !== null && constraintTypeField !== void 0 && constraintTypeField.isConstraintTypePicker) {
      constraintTypeField.store.removeFilter('constraintTypeApplicable');
    }

    super.afterDelete(...arguments);
  }

} // Register this widget type with its Factory

AdvancedTab.initClass();
AdvancedTab._$name = 'AdvancedTab';

/**
 * @module SchedulerPro/widget/taskeditor/NotesTab
 */

/**
 * A tab inside the {@link SchedulerPro/widget/SchedulerTaskEditor scheduler task editor} or
 * {@link SchedulerPro/widget/GanttTaskEditor gantt task editor} showing the notes for an event or task.
 *
 * | Field ref   | Type                              | Weight | Description                                                                               |
 * |-------------|-----------------------------------|--------|-------------------------------------------------------------------------------------------|
 * | `noteField` | {@link Core/widget/TextField}     | 100    | Shows a text field widget with a textarea as input element, to add text notes to the task |
 *
 * @extends SchedulerPro/widget/taskeditor/FormTab
 * @classtype notestab
 */

class NotesTab extends FormTab {
  static get $name() {
    return 'NotesTab';
  } // Factoryable type name

  static get type() {
    return 'notestab';
  }

  static get configurable() {
    return {
      cls: 'b-notes-tab',
      title: this.L('L{Notes}'),
      tab: {
        icon: 'b-icon-note',
        titleProperty: 'tooltip'
      },
      layoutConfig: {
        alignItems: 'flex-start',
        alignContent: 'stretch'
      },
      items: {
        noteField: {
          weight: 100,
          type: 'textfield',
          inputAttributes: {
            tag: 'textarea'
          },
          cls: 'b-taskeditor-notes-field',
          name: 'note'
        }
      }
    };
  }

} // Register this widget type with its Factory

NotesTab.initClass();
NotesTab._$name = 'NotesTab';

/**
 * @module SchedulerPro/widget/GanttTaskEditor
 */
/**
 * A subclass of {@link SchedulerPro.widget.TaskEditorBase} for Gantt projects which SchedulerPro can handle as well.
 *
 * @extends SchedulerPro/widget/TaskEditorBase
 */

class GanttTaskEditor extends TaskEditorBase {
  // Factoryable type name
  static get type() {
    return 'gantttaskeditor';
  } //region Config

  static get $name() {
    return 'GanttTaskEditor';
  }

  static get defaultConfig() {
    return {
      items: [{
        type: 'tabpanel',
        defaultType: 'formtab',
        ref: 'tabs',
        flex: '1 0 100%',
        autoHeight: true,
        layoutConfig: {
          alignItems: 'stretch',
          alignContent: 'stretch'
        },
        items: {
          generalTab: {
            type: 'generaltab',
            weight: 100
          },
          predecessorsTab: {
            type: 'predecessorstab',
            weight: 200
          },
          successorsTab: {
            type: 'successorstab',
            weight: 300
          },
          resourcesTab: {
            type: 'resourcestab',
            weight: 400
          },
          advancedTab: {
            type: 'advancedtab',
            weight: 500
          },
          notesTab: {
            type: 'notestab',
            weight: 600
          }
        }
      }]
    };
  } //endregion

} // Register this widget type with its Factory

GanttTaskEditor.initClass();
GanttTaskEditor._$name = 'GanttTaskEditor';

/**
 * @module SchedulerPro/widget/taskeditor/SchedulerGeneralTab
 */

/**
 * A tab inside the {@link SchedulerPro.widget.SchedulerTaskEditor scheduler task editor} showing the general
 * information for an event from a simplified scheduler project.
 *
 * Contains the following fields by default:
 *
 * | Field ref          | Type                              | Text       | Weight | Description                                                        |
 * |--------------------|-----------------------------------|------------|--------|--------------------------------------------------------------------|
 * | `nameField`        | {@link Core.widget.TextField}     | Name       | 100    | Task name                                                          |
 * | `resourcesField`   | {@link Core.widget.Combo}         | Resources  | 200    | Shows a list of available resources for this task                  |
 * | `startDateField`   | {@link Core.widget.DateTimeField} | Start      | 300    | Shows when the task begins                                         |
 * | `endDateField`     | {@link Core.widget.DateTimeField} | Finish     | 400    | Shows when the task ends                                           |
 * | `durationField`    | {@link Core.widget.DurationField} | Duration   | 500    | Shows how long the task is                                         |
 * | `percentDoneField` | {@link Core.widget.NumberField}   | % Complete | 600    | Shows what part of task is done already in percentage              |
 * | `preambleField`    | {@link Core.widget.DurationField} | Preamble   | 650    | Shows preamble time (task preparation time)                        |
 * | `postambleField`   | {@link Core.widget.DurationField} | Postamble  | 660    | Shows postamble time (clean up after the task)                     |
 *
 * To customize the tab or its fields:
 *
 * ```javascript
 * features : {
 *     taskEdit : {
 *         items : {
 *             generalTab : {
 *                 // Custom title
 *                 title: 'Common',
 *                 // Customized items
 *                 items : {
 *                     // Hide the duration field
 *                     durationField : null,
 *                     // Customize the name field
 *                     nameField : {
 *                         label : 'Title'
 *                     },
 *                     // Add a custom field
 *                     colorField : {
 *                         type   : 'text',
 *                         label  : 'Color',
 *                         // name maps to a field on the event record
 *                         name   : 'eventColor',
 *                         // place at top
 *                         weight : 0
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * @extends SchedulerPro/widget/taskeditor/FormTab
 * @classtype schedulergeneraltab
 */

class SchedulerGeneralTab extends FormTab {
  static get $name() {
    return 'SchedulerGeneralTab';
  } // Factoryable type name

  static get type() {
    return 'schedulergeneraltab';
  }

  static get defaultConfig() {
    return {
      title: 'L{General}',
      cls: 'b-general-tab',
      defaults: {
        localeClass: this,
        // New fields at the end
        weight: 10
      },
      items: {
        nameField: {
          type: 'text',
          required: true,
          label: 'L{Name}',
          clearable: true,
          name: 'name',
          cls: 'b-name',
          weight: 100
        },
        // TODO: Prevent removing last, or prevent event from being removed while editing
        resourcesField: {
          type: 'combo',
          label: 'L{Resources}',
          name: 'resources',
          editable: true,
          valueField: 'id',
          displayField: 'name',
          highlightExternalChange: false,
          cls: 'b-resources',
          weight: 200
        },
        startDateField: {
          type: 'datetime',
          label: 'L{Start}',
          name: 'startDate',
          cls: 'b-start-date',
          flex: '1 0 100%',
          weight: 300,
          dateField: {
            type: 'startdatefield'
          }
        },
        endDateField: {
          type: 'datetime',
          label: 'L{Finish}',
          name: 'endDate',
          cls: 'b-end-date',
          flex: '1 0 100%',
          weight: 400,
          dateField: {
            type: 'enddatefield'
          }
        },
        durationField: {
          type: 'durationfield',
          label: 'L{Duration}',
          name: 'fullDuration',
          flex: '1 0 50%',
          cls: 'b-inline',
          weight: 500
        },
        percentDoneField: {
          type: 'number',
          label: 'L{% complete}',
          name: 'renderedPercentDone',
          flex: '1 0 50%',
          min: 0,
          max: 100,
          weight: 600
        },
        preambleField: {
          type: 'durationfield',
          hidden: true,
          useAbbreviation: true,
          weight: 650,
          label: 'L{SchedulerGeneralTab.Preamble}',
          name: 'preamble',
          flex: '1 0 50%',
          cls: 'b-inline'
        },
        postambleField: {
          type: 'durationfield',
          hidden: true,
          useAbbreviation: true,
          weight: 660,
          label: 'L{SchedulerGeneralTab.Postamble}',
          name: 'postamble',
          flex: '1 0 50%'
        }
      }
    };
  }

  loadEvent(record) {
    const me = this,
          step = {
      unit: record.durationUnit,
      magnitude: 1
    },
          {
      isParent,
      project
    } = record,
          {
      durationField,
      percentDoneField,
      startDateField,
      endDateField,
      resourcesField
    } = me.widgetMap,
          storeChange = resourcesField && resourcesField.store.masterStore !== project.resourceStore; // Editing duration, percentDone & endDate disallowed for parent tasks

    if (durationField) {
      durationField.disabled = isParent;

      if (!percentDoneField) {
        durationField.element.classList.remove('b-inline');
      }
    }

    if (percentDoneField) {
      percentDoneField.disabled = isParent;
    }

    if (startDateField) {
      startDateField.dateField.eventRecord = record;

      if (DateHelper.compareUnits(step.unit, 'hour') > 0) {
        startDateField.dateField.step = step;
      } else {
        startDateField.timeField.step = step;
      }
    }

    if (endDateField) {
      endDateField.dateField.eventRecord = record;

      if (DateHelper.compareUnits(step.unit, 'hour') > 0) {
        endDateField.dateField.step = step;
      } else {
        endDateField.timeField.step = step;
      }

      endDateField.disabled = isParent;
    }

    if (resourcesField) {
      var _resourcesField$confi;

      resourcesField.multiSelect = (_resourcesField$confi = resourcesField.config.multiSelect) !== null && _resourcesField$confi !== void 0 ? _resourcesField$confi : !project.eventStore.usesSingleAssignment; // TODO here we should set label based on multiSelect value
      // https://github.com/bryntum/support/issues/1528

      if (storeChange) {
        // Can't use store directly since it may be grouped and then contains irrelevant group records
        resourcesField.store = project.resourceStore.chain(record => !record.isSpecialRow);
      }
    }

    super.loadEvent(...arguments);
  }

  onFieldChange({
    source,
    valid,
    userAction,
    value
  }) {
    if (userAction && valid) {
      const {
        eventStore
      } = this.record,
            resourceUnassigned = source.name === 'resources' && value.length === 0 && this.autoUpdateRecord && eventStore.removeUnassignedEvent;

      if (resourceUnassigned) {
        // Do not remove unassigned event if all resources are removed, we will do it after
        eventStore.removeUnassignedEvent = false;
      }

      super.onFieldChange(...arguments);

      if (resourceUnassigned) {
        eventStore.removeUnassignedEvent = true;
      }
    }
  }

  beforeSave() {
    // We skipped removing event on field change, if resource is still empty before save - remove record
    if (this.record.resources.length === 0 && this.record.eventStore.removeUnassignedEvent) {
      this.record.remove();
    }

    super.beforeSave();
  }

} // Register this widget type with its Factory

SchedulerGeneralTab.initClass();
SchedulerGeneralTab._$name = 'SchedulerGeneralTab';

/**
 * @module SchedulerPro/widget/taskeditor/SchedulerAdvancedTab
 */

/**
 * Advanced task options for {@link SchedulerPro/widget/SchedulerTaskEditor scheduler task editor} or
 * {@link SchedulerPro/widget/GanttTaskEditor gantt task editor} tab.
 *
 * Contains the following fields by default (with their default weight):
 *
 * | Field ref                | Type                                             | Weight | Description                                         |
 * |--------------------------|--------------------------------------------------|--------|-----------------------------------------------------|
 * | `calendarField`          | {@link SchedulerPro/widget/CalendarField}        | 100    | List of available calendars , if calendars are used |
 * | `constraintTypeField`    | {@link SchedulerPro/widget/ConstraintTypePicker} | 200    | Shows a list of available constraints for this task |
 * | `constraintDateField`    | {@link Core/widget/DateField}                    | 300    | Shows a date for the selected constraint type       |
 * | `manuallyScheduledField` | {@link Core/widget/Checkbox}                     | 400    | When checked, task is not considered in scheduling  |
 * | `inactiveField`          | {@link Core/widget/Checkbox}                     | 500    | Allows inactivating the task so it won't take part in the scheduling process. |
 *
 * @extends SchedulerPro/widget/taskeditor/FormTab
 * @classtype scheduleradvancedtab
 */

class SchedulerAdvancedTab extends FormTab {
  static get $name() {
    return 'SchedulerAdvancedTab';
  }

  static get type() {
    return 'scheduleradvancedtab';
  }

  static get configurable() {
    return {
      cls: 'b-advanced-tab',
      tab: {
        icon: 'b-icon-advanced',
        tooltip: 'L{SchedulerAdvancedTab.Advanced}'
      },
      defaults: {
        localeClass: this
      },
      items: {
        calendarField: {
          type: 'calendarfield',
          name: 'calendar',
          label: 'L{Calendar}',
          weight: 100
        },
        constraintTypeField: {
          type: 'constrainttypepicker',
          name: 'constraintType',
          label: 'L{Constraint type}',
          clearable: true,
          weight: 200
        },
        constraintDateField: {
          type: 'date',
          name: 'constraintDate',
          label: 'L{Constraint date}',
          keepTime: 'entered',
          weight: 300
        },
        manuallyScheduledField: {
          type: 'checkbox',
          name: 'manuallyScheduled',
          label: 'L{Manually scheduled}',
          weight: 400
        },
        inactiveField: {
          type: 'checkbox',
          weight: 500,
          name: 'inactive',
          label: 'L{Inactive}'
        }
      }
    };
  }

  get calendarField() {
    return this.widgetMap.calendarField;
  }

  get constraintTypeField() {
    return this.widgetMap.constraintTypeField;
  }

  get constraintDateField() {
    return this.widgetMap.constraintDateField;
  }

  get manuallyScheduledField() {
    return this.widgetMap.manuallyScheduledField;
  }

  loadEvent(eventRecord) {
    const me = this;
          !me.record;
          const {
      calendarField
    } = me;

    if (calendarField) {
      calendarField.store = eventRecord.project.calendarManagerStore;
      calendarField.hidden = !eventRecord.project.calendarManagerStore.count;
    }

    super.loadEvent(...arguments);
  }

}
SchedulerAdvancedTab.initClass();
SchedulerAdvancedTab._$name = 'SchedulerAdvancedTab';

/**
 * @module SchedulerPro/widget/SchedulerTaskEditor
 */
const bufferRe = /(pre|post)amble/;
/**
 * {@link SchedulerPro/widget/TaskEditorBase} subclass for SchedulerPro projects. Provides a UI to edit tasks in a
 * dialog.
 *
 * This demo shows how to use TaskEditor as a standalone widget:
 *
 * {@inlineexample SchedulerPro/widget/SchedulerTaskEditor.js}
 *
 * ## Task editor customization
 *
 * To append Widgets to any of the built-in tabs, use the `items` config. The Task editor contains tabs by default.
 * Each tab contains built in widgets: text fields, grids, etc.
 *
 * | Tab ref           | Text                                                        | Weight | Description                                                                          |
 * |-------------------|-------------------------------------------------------------|--------|--------------------------------------------------------------------------------------|
 * | `generalTab`      | {@link SchedulerPro/widget/taskeditor/SchedulerGeneralTab}  | 100    | Shows basic configuration: name, resources, start/end dates, duration, percent done. |
 * | `predecessorsTab` | {@link SchedulerPro/widget/taskeditor/PredecessorsTab}      | 200    | Shows a grid with incoming dependencies                                              |
 * | `successorsTab`   | {@link SchedulerPro/widget/taskeditor/SuccessorsTab}        | 300    | Shows a grid with outgoing dependencies                                              |
 * | `advancedTab`     | {@link SchedulerPro/widget/taskeditor/SchedulerAdvancedTab} | 500    | Shows advanced configuration: constraints and manual scheduling mode                 |
 * | `notesTab`        | {@link SchedulerPro/widget/taskeditor/NotesTab}             | 600    | Shows a text area to add notes to the selected task                                  |
 *
 * This demo shows adding of custom widgets to the task editor, double-click child task bar to start editing:
 *
 * {@inlineexample SchedulerPro/feature/TaskEditExtraItems.js}
 *
 * @extends SchedulerPro/widget/TaskEditorBase
 */

class SchedulerTaskEditor extends TaskEditorBase {
  // Factoryable type name
  static get type() {
    return 'schedulertaskeditor';
  } //region Config

  static get $name() {
    return 'SchedulerTaskEditor';
  }

  static get defaultConfig() {
    return {
      enableEventSpanBuffer: false,
      items: [{
        type: 'tabpanel',
        defaultType: 'formtab',
        ref: 'tabs',
        flex: '1 0 100%',
        autoHeight: true,
        layoutConfig: {
          alignItems: 'stretch',
          alignContent: 'stretch'
        },
        items: {
          generalTab: {
            type: 'schedulergeneraltab',
            weight: 100
          },
          predecessorsTab: {
            type: 'predecessorstab',
            weight: 200
          },
          successorsTab: {
            type: 'successorstab',
            weight: 300
          },
          // Replaced with combo on general tab
          //{ type : 'resourcestab', weight : 400 },
          advancedTab: {
            type: 'scheduleradvancedtab',
            weight: 500
          },
          notesTab: {
            type: 'notestab',
            weight: 600
          }
        }
      }]
    };
  }

  processWidgetConfig(widgetConfig) {
    var _widgetConfig$ref;

    if ((_widgetConfig$ref = widgetConfig.ref) !== null && _widgetConfig$ref !== void 0 && _widgetConfig$ref.match(bufferRe)) {
      widgetConfig.hidden = !this.enableEventSpanBuffer;
    }

    return super.processWidgetConfig(widgetConfig);
  } //endregion

} // Register this widget type with its Factory

SchedulerTaskEditor.initClass();
SchedulerTaskEditor._$name = 'SchedulerTaskEditor';

/**
 * @module SchedulerPro/feature/TaskEdit
 */

/**
 * Feature that displays a {@link SchedulerPro.widget.SchedulerTaskEditor Task editor}, allowing users to edit task data.
 * The Task editor is a popup containing tabs with fields for editing task data.
 *
 * This demo shows the task edit feature, double-click child task bar to start editing:
 *
 * {@inlineexample SchedulerPro/feature/TaskEdit.js}
 *
 * ## Customizing tabs and their widgets
 *
 * To customize tabs you can:
 *
 * * Reconfigure built in tabs by providing override configs in the {@link #config-items items} config.
 * * Remove existing tabs or add your own in the {@link #config-items items} config.
 * * Advanced: Reconfigure the whole editor widget using {@link #config-editorConfig} or replace the whole editor using {@link #config-editorClass}.
 *
 * To add extra items to a tab you need to specify {@link Core.widget.Container#config-items items} for the tab container.
 *
 * This demo shows adding of custom widgets to the task editor, double-click child task bar to start editing:
 *
 * {@inlineexample SchedulerPro/feature/TaskEditExtraItems.js}
 *
 * {@region Expand to see Default tabs and fields}
 *
 * The {@link SchedulerPro.widget.SchedulerTaskEditor Task editor} contains tabs by default. Each tab contains built in widgets: text fields, grids, etc.
 *
 * | Tab ref           | Type                                                                             | Text         | Weight | Description                                                                          |
 * |-------------------|----------------------------------------------------------------------------------|--------------|--------|--------------------------------------------------------------------------------------|
 * | `generalTab`      | {@link SchedulerPro.widget.taskeditor.SchedulerGeneralTab SchedulerGeneralTab}   | General      | 100    | Shows basic configuration: name, resources, start/end dates, duration, percent done. |
 * | `predecessorsTab` | {@link SchedulerPro.widget.taskeditor.PredecessorsTab PredecessorsTab}           | Predecessors | 200    | Shows a grid with incoming dependencies                                              |
 * | `successorsTab`   | {@link SchedulerPro.widget.taskeditor.SuccessorsTab SuccessorsTab}               | Successors   | 300    | Shows a grid with outgoing dependencies                                              |
 * | `advancedTab`     | {@link SchedulerPro.widget.taskeditor.SchedulerAdvancedTab SchedulerAdvancedTab} | Advanced     | 500    | Shows advanced configuration: constraints and manual scheduling mode                 |
 * | `notesTab`        | {@link SchedulerPro.widget.taskeditor.NotesTab NotesTab}                         | Notes        | 600    | Shows a text area to add notes to the selected task                                  |
 *
 * ### General tab
 *
 * General tab contains fields for basic configurations
 *
 * | Field ref          | Type                                            | Text       | Weight | Description                                           |
 * |--------------------|-------------------------------------------------|------------|--------|-------------------------------------------------------|
 * | `nameField`        | {@link Core.widget.TextField TextField}         | Name       | 100    | Task name                                             |
 * | `resourcesField`   | {@link Core.widget.Combo Combo}                 | Resources  | 200    | Shows a list of available resources for this task     |
 * | `startDateField`   | {@link Core.widget.DateTimeField DateTimeField} | Start      | 300    | Shows when the task begins                            |
 * | `endDateField`     | {@link Core.widget.DateTimeField DateTimeField} | Finish     | 400    | Shows when the task ends                              |
 * | `durationField`    | {@link Core.widget.DurationField DurationField} | Duration   | 500    | Shows how long the task is                            |
 * | `percentDoneField` | {@link Core.widget.NumberField NumberField}     | % Complete | 600    | Shows what part of task is done already in percentage |
 *
 * ### Predecessors tab
 *
 * Predecessors tab contains a grid with incoming dependencies and controls to remove/add dependencies
 *
 * | Widget ref | Type                                | Weight | Description                                                                                      |
 * |------------|-------------------------------------|--------|--------------------------------------------------------------------------------------------------|
 * | `grid`     | {@link Grid.view.Grid Grid}         | 100    | Shows predecessors task name, dependency type and lag                                            |
 * | `toolbar`  | {@link Core.widget.Toolbar Toolbar} | 200    | Shows control buttons                                                                            |
 * | \>`add`    | {@link Core.widget.Button Button}   | 210    | Adds a new dummy predecessor. Then need to select a task from the list in the name column editor |
 * | \>`remove` | {@link Core.widget.Button Button}   | 220    | Removes selected incoming dependency                                                             |
 *
 * \> - nested items
 *
 * ### Successors tab
 *
 * Successors tab contains a grid with outgoing dependencies and controls to remove/add dependencies
 *
 * | Widget ref | Type                                | Weight | Description                                                                                    |
 * |------------|-------------------------------------|--------|------------------------------------------------------------------------------------------------|
 * | `grid`     | {@link Grid.view.Grid Grid}         | 100    | Shows successors task name, dependency type and lag                                            |
 * | `toolbar`  | {@link Core.widget.Toolbar Toolbar} | 200    | Shows control buttons                                                                          |
 * | \>`add`    | {@link Core.widget.Button Button}   | 210    | Adds a new dummy successor. Then need to select a task from the list in the name column editor |
 * | \>`remove` | {@link Core.widget.Button Button}   | 220    | Removes selected outgoing dependency                                                           |
 *
 * \> - nested items
 *
 * ### Advanced tab
 *
 * Advanced tab contains additional task scheduling options
 *
 * | Field ref                | Type                                                                  | Weight | Description                                                                             |
 * |--------------------------|-----------------------------------------------------------------------|--------|-----------------------------------------------------------------------------------------|
 * | `calendarField`          | {@link SchedulerPro.widget.CalendarField CalendarField}               | 100    | Shows a list of available calendars for this task. Shown when calendars are downloaded. |
 * | `constraintTypeField`    | {@link SchedulerPro.widget.ConstraintTypePicker ConstraintTypePicker} | 200    | Shows a list of available constraints for this task                                     |
 * | `constraintDateField`    | {@link Core.widget.DateField DateField}                               | 300    | Shows a date for the selected constraint type                                           |
 * | `manuallyScheduledField` | {@link Core.widget.Checkbox Checkbox}                                 | 400    | If checked, the task is not considered in scheduling                                    |
 *
 * ### Notes tab
 *
 * Notes tab contains a text area to show notes
 *
 * | Field ref   | Type                                            | Weight | Description                                     |
 * |-------------|-------------------------------------------------|--------|-------------------------------------------------|
 * | `noteField` | {@link Core.widget.TextAreaField TextAreaField} | 100    | Shows a text area to add text notes to the task |
 *
 * {@endregion}
 *
 * ## Removing a built in item
 *
 * To remove a built in tab or field, specify its `ref` as `false` in the `items` config:
 *
 * ```javascript
 * const scheduler = new SchedulerPro({
 *     features : {
 *         taskEdit : {
 *             items : {
 *                 generalTab      : {
 *                     items : {
 *                         // Remove "Duration" and "% Complete" fields in the "General" tab
 *                         durationField    : false,
 *                         percentDoneField : false
 *                     }
 *                 },
 *                 // Remove all tabs except the "General" tab
 *                 notesTab        : false,
 *                 predecessorsTab : false,
 *                 successorsTab   : false,
 *                 advancedTab     : false
 *             }
 *         }
 *     }
 * })
 * ```
 *
 * ## Customizing a built in item
 *
 * To customize a built in tab or field, use its `ref` as the key in the `items` config and specify the configs you want
 * to change (they will be merged with the tabs or fields default configs correspondingly):
 *
 * ```javascript
 * const scheduler = new SchedulerPro({
 *     features : {
 *         taskEdit : {
 *             items : {
 *                 generalTab      : {
 *                     // Rename "General" tab
 *                     title : 'Main',
 *                     items : {
 *                         // Rename "% Complete" field
 *                         percentDoneField : {
 *                             label : 'Status'
 *                         }
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * })
 * ```
 *
 * ## Adding a custom item
 *
 * To add a custom tab or field, add an entry to the `items` config. When you add a field,
 * the `name` property links the input field to a field in the loaded task record:
 *
 * ```javascript
 * const scheduler = new SchedulerPro({
 *     features : {
 *         taskEdit : {
 *             items : {
 *                 generalTab : {
 *                     items : {
 *                         // Add new field to the last position
 *                         newGeneralField : {
 *                             type   : 'textfield',
 *                             weight : 610,
 *                             label  : 'New field in General Tab',
 *                             // Name of the field matches data field name, so value is loaded/saved automatically
 *                             name   : 'custom'
 *                         }
 *                     }
 *                 },
 *                 // Add a custom tab to the first position
 *                 newTab     : {
 *                     // Tab is a FormTab by default
 *                     title  : 'New tab',
 *                     weight : 90,
 *                     items  : {
 *                         newTabField : {
 *                             type   : 'textfield',
 *                             weight : 10,
 *                             label  : 'New field in New Tab',
 *                             // Name of the field matches data field name, so value is loaded/saved automatically.
 *                             // In this case it is equal to the Task "name" field.
 *                             name   : 'name'
 *                         }
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * })
 * ```
 *
 * To turn off the Task Editor just simple disable the feature.
 *
 * ```javascript
 * const scheduler = new SchedulerPro({
 *     features : {
 *         taskEdit : false
 *     }
 * })
 * ```
 *
 * By default predecessors and successors in successorsTab and predecessorsTab are displayed using task id and a name.
 *  The id part is configurable, any task field may be used instead (for example wbsCode or sequence number)
 * by Gantt `dependencyIdField` property, to set it globally, or using
 *  taskEdit config {@link SchedulerPro/widget/TaskEditorBase#config-dependencyIdField} to set format only for taskEditor.
 * ```javascript
 * const gantt = new Gantt({
 *    dependencyIdField: 'wbsCode', // for global format
 *
 *    project,
 *    columns : [
 *        { type : 'name', width : 250 }
 *    ],
 *    features : {
 *         taskEdit : {
 *             editorConfig : {
 *                 dependencyIdField : 'wbsCode' // set only for taskEditor
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * For more info on customizing the Task Editor, please see Guides/Customization/Customize task editor
 *
 * @extends Core/mixin/InstancePlugin
 * @mixes SchedulerPro/feature/mixin/ProTaskEditStm
 * @mixes Core/mixin/Delayable
 * @demo SchedulerPro/taskeditor
 * @classtype taskEdit
 * @feature
 */

class TaskEdit extends InstancePlugin.mixin(Delayable, ProTaskEditStm) {
  //region Events

  /**
   * Fires on the owning Scheduler instance before a task is displayed in the editor.
   * This may be listened to in order to take over the task editing flow. Returning `false`
   * stops the default editing UI from being shown.
   * @event beforeTaskEdit
   * @on-owner
   * @param {SchedulerPro.view.SchedulerPro} source The Scheduler Pro instance
   * @param {SchedulerPro.feature.TaskEdit} taskEdit The taskEdit feature
   * @param {SchedulerPro.model.EventModel} taskRecord The task about to be shown in the editor.
   * @param {HTMLElement} taskElement The element which represents the task
   * @preventable
   */

  /**
   * Fires on the owning Scheduler when the editor for an event is available but before it is shown. Allows
   * manipulating fields etc.
   * @event beforeTaskEditShow
   * @on-owner
   * @param {SchedulerPro.view.SchedulerPro} source The SchedulerPro instance
   * @param {SchedulerPro.feature.TaskEdit} taskEdit The taskEdit feature
   * @param {SchedulerPro.model.EventModel} taskRecord The task about to be shown in the editor.
   * @param {HTMLElement} eventElement The element which represents the task
   * @param {SchedulerPro.widget.TaskEditorBase} editor The editor
   */

  /**
   * Fires on the owning Scheduler Pro instance before a task is saved
   * @event beforeTaskSave
   * @on-owner
   * @param {SchedulerPro.view.SchedulerPro} source The Scheduler Pro instance
   * @param {SchedulerPro.model.EventModel} taskRecord The task about to be saved
   * @param {SchedulerPro.widget.TaskEditorBase} editor The editor widget
   * @preventable
   */

  /**
   * Fires on the owning Scheduler Pro instance after a task is saved
   * @event afterTaskSave
   * @on-owner
   * @param {SchedulerPro.view.SchedulerPro} source The Scheduler Pro instance
   * @param {SchedulerPro.model.EventModel} taskRecord The task about to be saved
   * @param {SchedulerPro.widget.TaskEditorBase} editor The editor widget
   */

  /**
   * Fires on the owning Scheduler Pro before a task is deleted, return `false` to prevent it.
   * @event beforeTaskDelete
   * @on-owner
   * @param {SchedulerPro.view.SchedulerPro} source The Scheduler Pro instance.
   * @param {SchedulerPro.model.EventModel} taskRecord The record about to be deleted
   * @param {SchedulerPro.widget.TaskEditorBase} editor The editor widget
   * @preventable
   */

  /**
   * Fires on the owning Scheduler Pro instance before an event record is saved
   * @event beforeEventSave
   * @on-owner
   * @param {SchedulerPro.view.SchedulerPro} source The Scheduler Pro instance
   * @param {SchedulerPro.model.EventModel} eventRecord The event record about to be saved
   * @param {SchedulerPro.widget.TaskEditorBase} editor The editor widget
   * @preventable
   */

  /**
   * Fires on the owning Scheduler Pro instance after an event record is saved
   * @event afterEventSave
   * @on-owner
   * @param {SchedulerPro.view.SchedulerPro} source The Scheduler Pro instance
   * @param {SchedulerPro.model.EventModel} eventRecord The event record about to be saved
   * @param {SchedulerPro.widget.TaskEditorBase} editor The editor widget
   */

  /**
   * Fires on the owning Scheduler Pro before an event record is deleted, return `false` to prevent it.
   * @event beforeEventDelete
   * @on-owner
   * @param {SchedulerPro.view.SchedulerPro} source The Scheduler Pro instance.
   * @param {SchedulerPro.model.EventModel} eventRecord The event record about to be deleted
   * @param {SchedulerPro.widget.TaskEditorBase} editor The editor widget
   * @preventable
   */
  //endregion
  //region Config
  static get $name() {
    return 'TaskEdit';
  }

  static get pluginConfig() {
    return {
      chain: ['getEventMenuItems', 'onEventEnterKey'],
      assign: ['editEvent']
    };
  }

  static get defaultConfig() {
    return {
      /**
       * The event that shall trigger showing the editor. Defaults to `eventdblclick`, set to `` or null to disable editing of existing events.
       * @config {String}
       * @default
       * @category Editor
       */
      triggerEvent: 'eventdblclick',

      /**
       * Project type to editor class map. Editor will be used depending on project, not on product.
       *
       * @config {Object}
       * @internal
       * @category Editor
       */
      editorClassMap: {
        [ProjectType.SchedulerBasic]: 'schedulertaskeditor',
        [ProjectType.SchedulerPro]: 'schedulertaskeditor',
        [ProjectType.Gantt]: 'gantttaskeditor'
      },
      // TODO: deprecate it in favor of `editorConfig : { type : 'xxx' }`

      /**
       * Class to use as the editor. By default it picks editor class depending on the project type.
       * It can be either {@link SchedulerPro.widget.SchedulerTaskEditor SchedulerTaskEditor} or
       * {@link SchedulerPro.widget.GanttTaskEditor GanttTaskEditor}.
       * By specifying your own `editorClass` you override this.
       * @config {Core.widget.Widget}
       * @typings {typeof Widget}
       * @category Editor
       */
      editorClass: null,

      /**
       * A configuration object applied to the internal {@link SchedulerPro.widget.TaskEditorBase TaskEditor}.
       * Useful to for example change the title of the editor or to set its dimensions in code:
       *
       * ```javascript
       * features : {
       *     taskEdit : {
       *         editorConfig : {
       *             title : 'My title',
       *             height : 300
       *         }
       *     }
       * }
       * ```
       *
       * NOTE: The easiest approach to affect editor contents is to use the {@link #config-items items config}.
       *
       *  @config {Object}
       */
      editorConfig: null,

      /**
       * True to show a confirmation dialog before deleting the event
       * @config {Boolean}
       * @default
       * @category Editor widgets
       */
      confirmDelete: true,

      /**
       * True to save and close this panel if ENTER is pressed in one of the input fields inside the panel.
       * @config {Boolean}
       * @default
       * @category Editor
       */
      saveAndCloseOnEnter: true,

      /**
       * The week start day used in all date fields of the feature editor form by default.
       * 0 means Sunday, 6 means Saturday.
       * Defaults to the locale's week start day.
       * @config {Number}
       */
      weekStartDay: null,

      /**
       * Set to false to not scroll event into view when invoking edit action (e.g. if event is only partially visible)
       * @config {Boolean}
       * @default
       */
      scrollIntoView: true
    };
  }

  static get configurable() {
    return {
      /**
       * A configuration object used to customize the contents of the task editor. Supply a config object or
       * boolean per tab (listed below) to either affects its contents or toggle it on/off.
       *
       * Supplied config objects will be merged with the tabs predefined configs.
       *
       * Built-in tab names are:
       *  * generalTab
       *  * predecessorsTab
       *  * successorsTab
       *  * advancedTab
       *  * notesTab
       *
       *  ```
       *  features : {
       *      taskEdit : {
       *          items : {
       *              // Custom settings and additional items for the general tab
       *              generalTab : {
       *                  title : 'Common',
       *                  items : {
       *                      durationField : false,
       *                      myCustomField : {
       *                          type : 'text',
       *                          name : 'color'
       *                      }
       *                  }
       *              },
       *              // Hide the advanced tab
       *              advancedTab : false
       *          }
       *      }
       *  }
       *  ```
       *
       *  Please see the `taskeditor` demo for a customized editor in action.
       *  @config {Object}
       */
      items: null
    };
  } //endregion
  //region Constructor/Destructor

  construct(scheduler, config) {
    var _scheduler$features$e;

    scheduler.taskEdit = this;
    super.construct(scheduler, ObjectHelper.assign({
      weekStartDay: scheduler.weekStartDay,
      enableEventSpanBuffer: (_scheduler$features$e = scheduler.features.eventBuffer) === null || _scheduler$features$e === void 0 ? void 0 : _scheduler$features$e.enabled
    }, config));
    scheduler.on({
      [this.triggerEvent]: 'onActivateEditor',
      readOnly: 'onClientReadOnlyToggle',
      dragCreateEnd: 'onDragCreateEnd',
      thisObj: this
    });
  }

  doDestroy() {
    var _this$editor;

    this.detachFromProject();
    (_this$editor = this.editor) === null || _this$editor === void 0 ? void 0 : _this$editor.destroy();

    if (this.deleteConfirmationPromise) {
      MessageDialog.hide();
    }

    super.doDestroy();
  } //endregion
  //region Internal

  onClientReadOnlyToggle({
    readOnly
  }) {
    if (this.editor) {
      this.editor.readOnly = readOnly;
    }
  }

  get scheduler() {
    return this.client;
  }

  getElementFromTaskRecord(taskRecord, resourceRecord) {
    return this.client.getElementFromEventRecord(taskRecord, resourceRecord);
  }

  scrollEventIntoView(eventRecord, resourceRecord) {
    this.client.scrollResourceEventIntoView(resourceRecord, eventRecord);
  }

  get isValid() {
    return this.editor.eachWidget(widget => {
      if (widget.isValid === true || widget.hidden || widget.disabled || widget.isField && !widget.name) {
        return true;
      }

      return widget.isValid !== false;
    }, true);
  } //endregion
  //region Project

  get project() {
    return this.scheduler.project;
  }

  attachToProject() {
    this.detachFromProject();
    this.project.on({
      name: 'project',
      loadstart: () => this.save(),
      dataReady: 'onDataReady',
      thisObj: this
    });
  }

  detachFromProject() {
    this.detachListeners('project');
  } //endregion

  onDataReady() {
    const {
      record
    } = this; // Record could've been removed from project

    if (record !== null && record !== void 0 && record.project && this.scheduler.taskStore.includes(record)) {
      this.load(record, true);
    } else {
      this.editor.close();
    }
  } //region Editor

  /**
   * Returns true if the editor is currently active
   * @readonly
   * @property {Boolean}
   */

  get isEditing() {
    return !!this._editing;
  }

  onActivateEditor({
    eventRecord,
    resourceRecord,
    eventElement
  }) {
    this.editEvent(eventRecord, resourceRecord, eventElement);
  }
  /**
   * Shows a {@link SchedulerPro.widget.SchedulerTaskEditor scheduler task editor} or {@link SchedulerPro.widget.GanttTaskEditor gantt task editor}
   * to edit the passed task. This function is exposed on the Scheduler Pro instance and can be called as `scheduler.editTask()`.
   * @param {SchedulerPro.model.EventModel|Function} taskRecord Task to edit or a function returning a task to edit,
   * the function will be executed within an STM transaction which will be canceled in case user presses Cancel button
   * or closes editor w/o hitting Save.
   * @param {SchedulerPro.model.ResourceModel} [resourceRecord] The Resource record for the event. This parameter is
   * required if the event is newly created for a resource and has not been assigned, or when using multi assignment.
   * @param {HTMLElement} [element] Element to anchor editor to (defaults to events element)
   * @return {Promise} Promise which resolves after the editor is shown
   * @async
   */

  async editEvent(taskRecord, resourceRecord = null, element = null) {
    const me = this,
          {
      scheduler
    } = me; // If we are editing, cancel the edit.

    if (me.isEditing) {
      me.cancel();
    } // We may have just canceled the edit above, or some other user gesture may
    // have begun canceling prior to that.
    // Either way, we must wait for it to cancel before the new edit can begin.

    if (me._canceling) {
      await me._canceling;
    }

    if (!scheduler.isGanttBase && !resourceRecord) {
      var _taskRecord$resources;

      // In case of assignments, take the first resource
      resourceRecord = taskRecord.resource || ((_taskRecord$resources = taskRecord.resources) === null || _taskRecord$resources === void 0 ? void 0 : _taskRecord$resources[0]);
    }

    if (!me.disabled && !taskRecord.readOnly && !scheduler.project.isDelayingCalculation) {
      const {
        taskStore
      } = scheduler;
      me._editing = true;
      me.captureStm();
      me.startStmTransaction();
      scheduler.project.suspendAutoSync();

      if (typeof taskRecord === 'function') {
        taskRecord = taskRecord();
      } // If this is a new record, add it to the store and assign to a resource only after we have started a transaction
      // which can be rolled back in case of Cancel button press

      if (!taskRecord.isOccurrence && !taskStore.includes(taskRecord) && !taskRecord.isCreating) {
        taskRecord.isCreating = true;
        taskStore.add(taskRecord);

        if (resourceRecord) {
          scheduler.assignmentStore.assignEventToResource(taskRecord, resourceRecord);
        }

        await scheduler.project.commitAsync();
      } // For programmatic edit calls for an event not currently in view, scroll it into view first

      if (me.scrollIntoView && !scheduler.timeAxisSubGrid.collapsed && !element && taskStore.includes(taskRecord) && (resourceRecord || scheduler.isGantt)) {
        await me.scrollEventIntoView(taskRecord, resourceRecord);
      }

      const taskElement = element || DomHelper.down(me.getElementFromTaskRecord(taskRecord, resourceRecord), scheduler.eventInnerSelector),
            editor = me.getEditor(taskRecord);

      if (scheduler.trigger('beforeTaskEdit', {
        taskEdit: me,
        taskRecord,
        taskElement
      }) !== false) {
        // The Promise being async allows a mouseover to trigger the event tip
        // unless we add the editing class immediately.
        scheduler.element.classList.add('b-taskeditor-editing');
        me.load(taskRecord);
        scheduler.trigger('beforeTaskEditShow', {
          taskEdit: me,
          taskRecord,
          taskElement,
          editor
        });

        if (editor.widgetMap.deleteButton) {
          editor.widgetMap.deleteButton.hidden = scheduler.readOnly || taskRecord.isCreating;
        }

        me.attachToProject();

        if (editor.centered) {
          await editor.show();
        } else {
          if (!scheduler.timeAxisSubGrid.collapsed && taskElement) {
            await editor.showBy({
              target: taskElement,
              anchor: true,
              offset: -5
            });
          } else {
            // Display the editor centered in the Scheduler
            await editor.showBy({
              target: scheduler.element,
              anchor: false,
              // For records not part of the store (new ones, or filtered out ones) - center the editor
              align: 'c-c',
              clippedBy: null
            });
          }
        }
      } else {
        await me.rejectStmTransaction();
        me.disableStm();
        me.freeStm();
        me._editing = false;
      }
    }
  }

  getEditor(taskRecord = this.record) {
    const me = this,
          {
      client
    } = me;

    if (!me.editor) {
      var _me$editorConfig, _me$editor;

      const config = ObjectHelper.merge({
        clippedBy: [client.timeAxisSubGridElement, client.bodyContainer],
        eventEditFeature: me,
        weekStartDay: me.weekStartDay,
        enableEventSpanBuffer: me.enableEventSpanBuffer,
        saveAndCloseOnEnter: me.saveAndCloseOnEnter,
        owner: client,
        dependencyIdField: ((_me$editorConfig = me.editorConfig) === null || _me$editorConfig === void 0 ? void 0 : _me$editorConfig.dependencyIdField) || client.dependencyIdField,
        project: me.project,
        durationDisplayPrecision: client.durationDisplayPrecision,
        tabPanelItems: me.items,
        listeners: {
          cancel: 'onCancel',
          delete: 'onDelete',
          save: 'onSave',
          thisObj: me
        },
        // For backward compatibility
        tabsConfig: me.tabsConfig
      }, me.editorConfig);
      (_me$editor = me.editor) === null || _me$editor === void 0 ? void 0 : _me$editor.destroy(); // Configured type should always win

      if (me.editorClass && !config.type) {
        me.editor = me.editorClass.new(config);
      } else {
        const // Editor will be used depending on project, not on product
        project = (taskRecord === null || taskRecord === void 0 ? void 0 : taskRecord.project) || me.project,
              projectType = project.getType();
        me.editor = Widget.create(Object.assign({
          type: me.editorClassMap[projectType] || 'schedulertaskeditor'
        }, config));
      }
    } // Must set *after* construction, otherwise it becomes the default state
    // to reset readOnly back to

    me.editor.readOnly = client.readOnly;
    me.editor.project = me.project;
    return me.editor;
  } //endregion
  //region Actions

  load(taskRecord, highlightChanges) {
    const me = this,
          editor = me.getEditor(taskRecord);
    me._loading = true;
    me.record = taskRecord;
    editor.loadEvent(taskRecord, highlightChanges);
    me._loading = false;
  }

  async save() {
    const me = this,
          {
      scheduler,
      record: taskRecord
    } = me;

    if (me.isEditing) {
      const editor = me.getEditor();

      if (!me.isValid || me.trigger('beforeTaskSave', {
        taskRecord,
        editor: editor
      }) === false) {
        return;
      }

      me.detachFromProject();
      editor.beforeSave(); // Turn a newly created record into a permanent one (no-op for others)

      taskRecord.isCreating = false;
      me.commitStmTransaction();
      me.freeStm();
      me._editing = false; // afterSave to happen only after the editor is fully invisible.

      await editor.close();
      scheduler.project.resumeAutoSync(true);
      scheduler.element.classList.remove('b-taskeditor-editing');
      me.trigger('afterTaskSave', {
        taskRecord,
        editor
      });
      editor.afterSave();
      scheduler.trigger('afterTaskEdit', {
        taskRecord,
        editor
      });
    }
  } // This is called by the TaskEditor's hide method prior to the super call,
  // so however it gets hidden, it will signal a cancel.

  async doCancel() {
    const me = this,
          {
      scheduler
    } = me;

    if (me.isEditing) {
      me._editing = false;
      me.detachFromProject();
      const taskRecord = me.record,
            {
        project
      } = me,
            editor = me.getEditor();
      editor.beforeCancel(); // the feature could get destroyed asynchronously

      if (me.isDestroyed) {
        return;
      }

      await me.rejectStmTransaction(); // the feature could get destroyed asynchronously

      if (me.isDestroyed) {
        return;
      }

      me.disableStm();
      await project.commitAsync(); // the feature could get destroyed asynchronously

      if (me.isDestroyed) {
        return;
      }

      me.freeStm();
      editor.afterCancel();
      project.resumeAutoSync(false);
      scheduler.element.classList.remove('b-taskeditor-editing');
      scheduler.trigger('taskEditCanceled', {
        taskRecord,
        editor
      });
      scheduler.trigger('afterTaskEdit', {
        taskRecord,
        editor
      });
    }
  }

  async cancel() {
    const me = this; // Newly created records are already in TaskStore, must be removed on cancel

    if (me.record.isCreating) {
      return me.delete();
    }

    return me._canceling || (me._canceling = me.doCancel().finally(() => me._canceling = undefined));
  }

  async delete() {
    const me = this,
          {
      editor,
      scheduler,
      record: taskRecord
    } = me;

    if (me.trigger('beforeTaskDelete', {
      taskRecord,
      editor
    }) === false) {
      return;
    }

    me.detachFromProject();
    editor.beforeDelete();
    taskRecord.remove();
    me.freeStm();
    await me.project.commitAsync(); // the feature could get destroyed asynchronously

    if (me.isDestroyed) {
      return;
    } // Resume and sync, unless we are removing a newly created record (via cancel)

    me.project.resumeAutoSync(!taskRecord.isCreating);
    me._editing = false;
    editor.close();
    editor.afterDelete();
    scheduler.element.classList.remove('b-taskeditor-editing');
    scheduler.trigger('afterTaskEdit', {
      editor
    });
  } //endregion
  //region Events

  onSave() {
    // There's might be propagation requested, so we giving the chance to start propagating
    // before we're doing save commit procedure.
    this.requestAnimationFrame(() => this.save());
  }

  onCancel() {
    this.cancel();
  }

  async onDelete() {
    const me = this;

    if (me.confirmDelete) {
      // TODO: Ask nige about a better solution to prevent popup from closing when showing dialog
      const {
        editor
      } = me,
            autoClose = editor.autoClose;
      editor.autoClose = false;
      me.deleteConfirmationPromise = MessageDialog.confirm({
        title: 'L{TaskEdit.ConfirmDeletionTitle}',
        message: 'L{TaskEdit.ConfirmDeletionMessage}',
        okButton: 'L{TaskEditorBase.Delete}',
        rootElement: me.rootElement
      });
      const result = await me.deleteConfirmationPromise;
      editor.autoClose = autoClose;
      me.deleteConfirmationPromise = null;

      if (result === MessageDialog.yesButton) {
        me.delete();
      }
    } else {
      // There's might be propagation requested, so we giving the chance to start propagating
      // before we're doing cancel rejection procedure.
      me.requestAnimationFrame(() => me.delete());
    }
  }

  onDragCreateEnd({
    eventRecord,
    resourceRecord,
    proxyElement
  }) {
    // Only edit if it a real create. If it is a drag to schedule an already existing
    // event in gantt, then we do not offer the edit UI.
    if (!this.disabled && eventRecord.isCreating) {
      this.editEvent(eventRecord, resourceRecord);
    }
  } //endregion
  //region Context menu

  getEventMenuItems({
    eventRecord,
    resourceRecord,
    items
  }) {
    if (!this.scheduler.readOnly) {
      items.editEvent = {
        text: 'L{Edit task}',
        localeClass: this,
        icon: 'b-icon b-icon-edit',
        weight: -200,
        disabled: this.disabled || !eventRecord.readOnly,
        onItem: () => this.editEvent(eventRecord, resourceRecord)
      };
    }
  } // chained from EventNavigation

  onEventEnterKey({
    assignmentRecord,
    eventRecord
  }) {
    if (assignmentRecord) {
      this.editEvent(eventRecord, assignmentRecord.resource);
    } else if (eventRecord) {
      this.editEvent(eventRecord, eventRecord.resource);
    }
  } //endregion
  // Fire 2 events with param / event name using 'task' + 'event'

  trigger(name, params) {
    if (/task/i.test(name)) {
      const returnValTaskRecord = this.scheduler.trigger(...arguments),
            eventEvent = name.replace(/task/, 'event').replace(/Task/, 'Event');
      params.eventRecord = params.taskRecord; // RecurringEvents mixin expects there to be 'eventRecords' in the beforeEventDelete event

      params.eventRecords = [params.taskRecord];
      const returnValEventRecord = this.scheduler.trigger(eventEvent, params);
      return returnValTaskRecord && returnValEventRecord;
    }

    return super.trigger(...arguments);
  }

}
TaskEdit._$name = 'TaskEdit';
GridFeatureManager.registerFeature(TaskEdit, true, 'SchedulerPro'); //, 'EventEdit');

GridFeatureManager.registerFeature(TaskEdit, false, 'ResourceHistogram');

/**
 * @module SchedulerPro/view/mixin/ProjectProgressMixin
 */

/**
 * This is a mixin that tracks the progress of project calculations, either as a progress bar in the time axis header
 * or in a mask.
 *
 * Defaults to displaying a progress bar for projects that use delayed calculations to enable early rendering and to a
 * mask for those that do not (which requires configuring the project with `enableProgressNotifications : true`).
 * Configurable using the {@link #config-projectProgressReporting} config.
 *
 * @mixin
 */

var ProjectProgressMixin = (Target => {
  var _class;

  return _class = class ProjectProgressMixin extends (Target || Base$1) {
    static get $name() {
      return 'ProjectProgressMixin';
    }

    updateProject(project, old) {
      super.updateProject(project, old);
      this.setupProgressListener();
      this.detachListeners('delayedCalculation');

      if (project !== null && project !== void 0 && project.delayCalculation) {
        project.on({
          name: 'delayedCalculation',
          delayCalculationStart: 'internalOnProjectDelayCalculationStart',
          delayCalculationEnd: 'internalOnProjectDelayCalculationEnd',
          thisObj: this
        });
      }
    } //region Progress

    setupProgressListener() {
      const me = this;
      me.detachListeners('projectProgress');

      if (me.projectProgressReporting) {
        var _me$project;

        (_me$project = me.project) === null || _me$project === void 0 ? void 0 : _me$project.on({
          name: 'projectProgress',
          progress: 'onProjectProgress',
          thisObj: me
        });
      }
    }

    updateProjectProgressReporting() {
      if (!this.isConfiguring) {
        this.setupProgressListener();
      }
    } // Do not remove. Assertion strings for Localization sanity check
    // 'L{SchedulerProBase.storePopulation}' => Loading data
    // 'L{SchedulerProBase.propagating}' => Calculating project
    // 'L{SchedulerProBase.finalizing}' => Finalizing results

    onProjectProgress({
      total,
      remaining,
      phase = 'propagating'
    }) {
      const me = this;

      if (!me.isPainted) {
        return;
      } // Dont display progress for very small changesets

      if (total < me.projectProgressThreshold) {
        return;
      }

      let mode = me.projectProgressReporting;

      if (mode === 'auto') {
        mode = me.project.delayCalculation ? 'progressbar' : 'mask';
      }

      if (mode === 'progressbar') {
        let progressElement = me.calculationProgressElement;

        if (!progressElement) {
          // Show calculation progress at the bottom of the timeaxis header,
          // to not be affected by scroll in any direction
          progressElement = me.calculationProgressElement = DomHelper.createElement({
            parent: me.timeAxisSubGrid.header.element,
            retainElement: true,
            className: 'b-calculation-progress-wrap',
            children: [{
              className: 'b-calculation-progress'
            }]
          });
        }

        progressElement.firstElementChild.style.width = `${(total - remaining) / total * 100}%`;

        if (total > 0 && remaining === 0) {
          // Want to show full progress, remove in a bit
          me.calculationProgressTimeout = me.setTimeout(() => {
            var _progressElement;

            (_progressElement = progressElement) === null || _progressElement === void 0 ? void 0 : _progressElement.remove();
            me.calculationProgressElement = null;
          }, 50);
        } else {
          me.clearTimeout(me.calculationProgressTimeout);
        }
      } else {
        const str = me.L(`L{SchedulerProBase.${phase}}`),
              text = total ? `${str} ${Math.round(100 * (total - remaining) / total)}%` : str;

        if (!me.masked) {
          me.mask({
            maxProgress: total,
            useTransition: false,
            text
          });
        }

        me.masked.text = text;

        if (total) {
          // In case total changes...
          me.masked.maxProgress = total;
          me.masked.progress = total - remaining;
        }

        if (total > 0 && remaining === 0) {
          me.unmask();
        }
      }
    } //endregion
    //region Read-only
    // Delayed calculation mode started, set read-only (unless already configured as such) to block user from changing
    // data while it is in an invalid, un-calculated, state.

    internalOnProjectDelayCalculationStart() {
      if (!this.readOnly) {
        this.$delayCalculationReadOnly = this.readOnly = true;
      }
    } // Delayed calculation has finished, reset if made readonly by it

    internalOnProjectDelayCalculationEnd() {
      if (this.$delayCalculationReadOnly) {
        this.$delayCalculationReadOnly = this.readOnly = false;
      }
    } //endregion

    get widgetClass() {}

  }, _defineProperty(_class, "configurable", {
    /**
     * Accepts the following values:
     *
     * * 'auto' - Auto selects 'progressbar' or 'mask' depending on projects configuration
     * * 'progressbar' - Renders a thin progress bar to the time axis header
     * * 'mask' - Uses a mask to display progress
     * * null - Do not display progress
     *
     * @config {String|null}
     * @default
     * @category Data
     */
    projectProgressReporting: 'auto',
    projectProgressThreshold: 5000
  }), _class;
});

/**
 * @module SchedulerPro/widget/SchedulingIssueResolutionPopup
 */

/**
 * Popup informing user of a scheduling issue that needs manual resolution.
 * Examples of such cases could be an infinite cycle, a scheduling conflict or a calendar misconfiguration.
 * The dialog displays the case description and allows
 * picking one of the possible resolutions.
 *
 * @demo SchedulerPro/conflicts
 * @extends Core/widget/Popup
 * @classType schedulingissueresolutionpopup
 */

class SchedulingIssueResolutionPopup extends Popup {
  static get $name() {
    return 'SchedulingIssueResolutionPopup';
  } // Factoryable type name

  static get type() {
    return 'schedulingissueresolutionpopup';
  }

  static get configurable() {
    return {
      localizableProperties: [],
      schedulingIssue: null,
      align: 'b-t',
      autoShow: false,
      autoClose: false,
      closeAction: 'onCloseButtonClick',
      modal: true,
      centered: true,
      scrollAction: 'realign',
      constrainTo: globalThis,
      draggable: false,
      closable: true,
      floating: true,
      cls: 'b-schedulerpro-issueresolutionpopup',
      layout: 'vbox',
      items: {
        description: {
          type: 'widget',
          cls: 'b-error-description',
          weight: -100
        }
      },
      bbar: {
        defaults: {
          localeClass: this
        },
        items: {
          applyButton: {
            weight: 100,
            color: 'b-raised b-blue',
            text: 'L{Apply}',
            onClick: 'up.onApplyButtonClick',
            disabled: true
          },
          cancelButton: {
            weight: 200,
            color: 'b-gray',
            text: 'L{Object.Cancel}',
            onClick: 'up.onCancelButtonClick'
          }
        }
      }
    };
  }

  /**
   * Returns parameters for the provided resolution that should be
   * passed to its `resolve` method.
   * @param {Object} resolution Scheduling exception resolution
   * @return The resolution arguments
   */
  getResolutionParameters(resolution) {
    return [];
  }

  onApplyButtonClick() {
    const me = this,
          {
      selectedResolutions
    } = me;

    if (selectedResolutions.size) {
      // apply selected resolutions
      selectedResolutions.forEach(resolution => resolution.resolve(...me.getResolutionParameters(resolution)));
      me.continueWithResolutionResult(EffectResolutionResult.Resume);
      me.doResolve(selectedResolutions);
    } else {
      me.onCancelButtonClick();
    }
  }

  onCancelButtonClick() {
    this.continueWithResolutionResult(EffectResolutionResult.Cancel);
    this.doResolve();
  }

  onCloseButtonClick() {
    if (this.canCancel) {
      this.onCancelButtonClick();
    }
  }

  get isResolving() {
    return Boolean(this.resolving);
  }
  /**
   * Resolves an scheduling conflict happened on the project (a scheduling conflict or a calendar misconfiguration).
   * @param {Object} event The scheduling exception event data:
   * @param {SchedulerPro.model.ProjectModel} event.source The project
   * @param {*} event.schedulingIssue The scheduling exception
   * @param {Function} event.continueWithResolutionResult The function to be called once the resolution is chosen and applied
   * (or it was decide to cancel the changes).
   * @returns {Promise} Promise that gets resolved when user picks a resolution and clicks "Apply" (or "Cancel") button.
   */

  async resolve({
    source,
    schedulingIssue,
    continueWithResolutionResult
  }) {
    const me = this;
    me.project = source;
    me.schedulingIssue = schedulingIssue;
    me.continueWithResolutionResult = continueWithResolutionResult;
    me.selectedResolutions.clear();
    me.updatePopupContent(schedulingIssue, continueWithResolutionResult);
    me.onResolutionChange({});
    me.show();
    me.resolving = new Promissory();
    return me.resolving.promise;
  }

  doResolve(resolutions) {
    const me = this,
          {
      resolving
    } = me;

    if (resolving) {
      me.resolving.resolve(resolutions);
      me.resolving = null;
      me.schedulingIssue = null;
      me.hide();
    }
  }

  getResolutionWidgetConfig(resolution) {
    return {
      type: 'radio',
      text: resolution.getDescription(),
      cls: 'b-resolution',
      weight: 100,
      toggleGroup: 'resolutions',
      localeClass: this,
      listeners: {
        change: 'up.onResolutionChange'
      },
      resolution
    };
  }

  getResolutions() {
    var _this$schedulingIssue;

    return (_this$schedulingIssue = this.schedulingIssue) === null || _this$schedulingIssue === void 0 ? void 0 : _this$schedulingIssue.getResolutions();
  }

  updatePopupContent(schedulingIssue, continueWithResolutionResult) {
    var _schedulingIssue, _schedulingIssue2;

    const me = this;

    if (continueWithResolutionResult) {
      me.continueWithResolutionResult = continueWithResolutionResult;
    }

    if (schedulingIssue) {
      me.selectedResolutions.clear();
      me.schedulingIssue = schedulingIssue;
    } else {
      schedulingIssue = me.schedulingIssue;
    } // L{schedulingConflict}
    // L{emptyCalendar}
    // L{cycle}

    me.title = (_schedulingIssue = schedulingIssue) !== null && _schedulingIssue !== void 0 && _schedulingIssue.type ? me.optionalL(schedulingIssue.type) : 'Unknown error';
    me.widgetMap.description.content = (_schedulingIssue2 = schedulingIssue) === null || _schedulingIssue2 === void 0 ? void 0 : _schedulingIssue2.getDescription();
    const resolutions = me.getResolutions(),
          resolutionItems = (resolutions === null || resolutions === void 0 ? void 0 : resolutions.map(resolution => me.getResolutionWidgetConfig(resolution))) || [];
    me.remove(me.queryAll(widget => widget.isCheckbox));
    me.add(...resolutionItems, {
      type: 'radio',
      ref: 'cancelResolution',
      text: 'L{Cancel changes}',
      toggleGroup: 'resolutions',
      localeClass: this,
      weight: 200,
      cls: 'b-resolution',
      listeners: {
        change: 'up.onResolutionChange'
      }
    }); // toggle ok/cancel controls state

    me.toggleControlsState();
  }

  get canApply() {
    return this.selectedResolutions.size || this.widgetMap.cancelResolution.checked;
  }

  get canCancel() {
    var _this$project;

    // cancel makes no sense for initial transaction
    return !((_this$project = this.project) !== null && _this$project !== void 0 && _this$project.isInitialCommit);
  }

  onResolutionChange({
    source,
    value
  }) {
    if (!source) {
      this.eachWidget(widget => {
        if (widget.checked && widget.resolution) {
          this.selectedResolutions.add(widget.resolution);
        }
      });
    } // if resolution option is clicked
    else if (source !== null && source !== void 0 && source.resolution) {
      // add - if checked
      if (value) {
        this.selectedResolutions.add(source.resolution);
      } // ..remove if unchecked
      else {
        this.selectedResolutions.delete(source.resolution);
      }
    } // toggle ok/cancel controls state

    this.toggleControlsState();
  }

  toggleControlsState() {
    const {
      applyButton,
      cancelResolution,
      cancelButton
    } = this.widgetMap;
    applyButton.disabled = !this.canApply;
    cancelResolution.hidden = cancelButton.hidden = !this.canCancel;
  }

  updateLocalization() {
    this.updatePopupContent();
    super.updateLocalization();
  }

}

_defineProperty(SchedulingIssueResolutionPopup, "properties", {
  selectedResolutions: new Set()
});

SchedulingIssueResolutionPopup.initClass();
SchedulingIssueResolutionPopup._$name = 'SchedulingIssueResolutionPopup';

/**
 * @module SchedulerPro/widget/CycleResolutionPopup
 */

/**
 * Class implementing a dialog informing user of an infinite cycle in the data.
 * The dialog displays tasks and dependencies causing the cycle and allows
 * to pick one of the dependencies and either deactivate or remove it.
 *
 * @demo SchedulerPro/conflicts
 * @extends SchedulerPro/widget/SchedulingIssueResolutionPopup
 * @classType cycleresolutionpopup
 */

class CycleResolutionPopup extends SchedulingIssueResolutionPopup {
  static get $name() {
    return 'CycleResolutionPopup';
  } // Factoryable type name

  static get type() {
    return 'cycleresolutionpopup';
  }

  getDependencyTitle(dependency) {
    return `"${dependency.fromEvent.name}" -> "${dependency.toEvent.name}"`;
  }

  getResolutionWidgetConfig(resolution) {
    const {
      dependency
    } = resolution,
          invalidDependencies = this.schedulingIssue.getInvalidDependencies(),
          result = super.getResolutionWidgetConfig(...arguments),
          isAlreadyChecked = this._dependencyResolutionIsChecked; // if that's an invalid dependency resolution

    if (dependency && invalidDependencies.indexOf(dependency) >= 0) {
      let checked; // if it's the first resolution for that dependency - check it

      if (!isAlreadyChecked[dependency.id]) {
        isAlreadyChecked[dependency.id] = true;
        checked = true;
      } else {
        checked = false;
      }

      Object.assign(result, {
        weight: 0,
        toggleGroup: `dependency-${dependency.id}`,
        checked
      });
    }

    return result;
  }

  getResolutions() {
    const {
      schedulingIssue
    } = this,
          invalidDependencies = schedulingIssue === null || schedulingIssue === void 0 ? void 0 : schedulingIssue.getInvalidDependencies();
    let resolutions = schedulingIssue === null || schedulingIssue === void 0 ? void 0 : schedulingIssue.getResolutions(); // If there are invalid dependencies involved (like parent-child or self-to-self)
    // let's not suggests other resolutions to simplify the UI

    if (resolutions && invalidDependencies.length) {
      resolutions = resolutions.filter(r => r.dependency && invalidDependencies.includes(r.dependency));
    }

    return resolutions;
  }

  updatePopupContent(schedulingIssue, continueWithResolutionResult) {
    const me = this;
    me._dependencyResolutionIsChecked = {};
    super.updatePopupContent(...arguments);
    schedulingIssue = me.schedulingIssue;

    if (schedulingIssue) {
      const dependencies = schedulingIssue.getDependencies(),
            invalidDependencies = schedulingIssue.getInvalidDependencies(),
            validDependencies = dependencies.filter(dependency => !invalidDependencies.includes(dependency));

      if (invalidDependencies.length) {
        !me.widgetMap.invalidDependenciesDescription && me.add({
          type: 'widget',
          ref: 'invalidDependenciesDescription',
          weight: -50,
          cls: 'b-invalid-dependencies-description',
          html: me.L('L{invalidDependencyLabel}')
        });
      } else {
        !me.widgetMap.dependencyField && me.add({
          type: 'combo',
          ref: 'dependencyField',
          weight: 50,
          name: 'dependency',
          label: me.L('L{dependencyLabel}'),
          cls: 'b-dependency-field',
          items: validDependencies === null || validDependencies === void 0 ? void 0 : validDependencies.map(dep => ({
            value: dep.id,
            text: me.getDependencyTitle(dep)
          })),
          listeners: {
            change: 'up.onDependencyChange'
          }
        });
      }
    }
  }

  get canApply() {
    const {
      widgetMap
    } = this; // can apply if any resolution and dependency is chosen or if cancel is selected

    return super.canApply && (widgetMap.cancelResolution.checked || !widgetMap.dependencyField || widgetMap.dependencyField.value);
  }

  onDependencyChange({
    source,
    value
  }) {
    // toggle ok/cancel controls state
    this.toggleControlsState();
  }

  getResolutionParameters(resolution) {
    // These resolution types need a dependency to be passed to resolve() method as an argument
    if (resolution.isRemoveDependencyCycleEffectResolution || resolution.isDeactivateDependencyCycleEffectResolution) {
      const dependencyId = this.widgetMap.dependencyField.value,
            dependency = this.project.dependencyStore.getById(dependencyId);
      return [dependency];
    }

    return super.getResolutionParameters(resolution);
  }

  onResolutionChange({
    source,
    value
  }) {
    super.onResolutionChange(...arguments); // if some option is checked

    if (value) {
      var _source$resolution;

      const {
        cancelResolution
      } = this.widgetMap; // if resolution option is chosen

      if (source !== null && source !== void 0 && (_source$resolution = source.resolution) !== null && _source$resolution !== void 0 && _source$resolution.dependency) {
        cancelResolution.checked = false;
      } // if cancel is chosen
      else if (source === cancelResolution) {
        this.eachWidget(widget => {
          if (widget.resolution && widget.checked && widget !== cancelResolution) {
            widget.checked = false;
          }
        });
      } // toggle ok/cancel controls state

      this.toggleControlsState();
    }
  }

}

CycleResolutionPopup.initClass();
CycleResolutionPopup._$name = 'CycleResolutionPopup';

/**
 * @module SchedulerPro/view/mixin/SchedulingIssueResolution
 */

/**
 * This is a mixin, adding ability to track project scheduling issues (scheduling conflicts, cycles and calendar misconfigurations)
 * and displaying a special popup allowing user to handle them.
 *
 * The mixin basically add listeners to the project {@link SchedulerPro/model/ProjectModel#event-schedulingConflict},
 * {@link SchedulerPro/model/ProjectModel#event-cycle} and  {@link SchedulerPro/model/ProjectModel#event-emptyCalendar}
 * events and shows a popup depending on the case:
 *
 * - {@link SchedulerPro/widget/SchedulingIssueResolutionPopup} for _scheduling conflicts_ and _calendar misconfigurations_.
 * - {@link SchedulerPro/widget/CycleResolutionPopup} for _scheduling cycles_.
 *
 * @demo SchedulerPro/conflicts
 * @mixin
 */

var SchedulingIssueResolution = (Target => class SchedulingIssueResolution extends (Target || Base$1) {
  static get $name() {
    return 'SchedulingIssueResolution';
  }

  static get configurable() {
    return {
      /**
       * Class implementing the popup resolving _scheduling conflicts_ and _calendar misconfigurations_.
       *
       * Use this to provide a custom popup for the above cases.
       * @config {Function}
       * @default
       * @category Conflict resolution
       */
      schedulingIssueResolutionPopupClass: SchedulingIssueResolutionPopup,

      /**
       * Class implementing the popup resolving _scheduling cycles_.
       *
       * Use this to provide a custom popup for that case.
       * @config {Function}
       * @default
       * @category Conflict resolution
       */
      cycleResolutionPopupClass: CycleResolutionPopup,

      /**
       * Set to `true` to display special popups allowing user
       * to resolve {@link SchedulerPro/widget/SchedulingIssueResolutionPopup scheduling conflicts},
       * {@link SchedulerPro/widget/CycleResolutionPopup cycles} or calendar misconfigurations.
       * The popup will suggest user ways to resolve the corresponding case.
       * @config {Boolean}
       * @default
       * @category Conflict resolution
       */
      displaySchedulingIssueResolutionPopup: true
    };
  }

  updateProject(project, oldProject) {
    super.updateProject(project, oldProject);
    this.unbindSchedulingIssueResolutionFromProject(oldProject);

    if (this.displaySchedulingIssueResolutionPopup && project) {
      this.bindSchedulingIssueResolutionToProject(project);
    }
  }

  bindSchedulingIssueResolutionToProject(project) {
    project.on({
      name: 'schedulingIssueResolution',
      schedulingConflict: 'onProjectSchedulingIssueEvent',
      emptyCalendar: 'onProjectSchedulingIssueEvent',
      cycle: 'onProjectSchedulingIssueEvent',
      thisObj: this
    });
  }

  get isResolving() {
    var _this$_lastScheduling;

    return (_this$_lastScheduling = this._lastSchedulingIssueResolutionPopup) === null || _this$_lastScheduling === void 0 ? void 0 : _this$_lastScheduling.isResolving;
  }

  get activeSchedulingIssueResolutionPopup() {
    return this.isResolving && this._lastSchedulingIssueResolutionPopup;
  }

  unbindSchedulingIssueResolutionFromProject(project) {
    this.detachListeners('schedulingIssueResolution');
  }

  getSchedulingIssueResolutionPopup(schedulingIssue) {
    if (schedulingIssue.type === 'cycle') {
      return this._cycleResolutionPopup || (this._cycleResolutionPopup = new this.cycleResolutionPopupClass({
        rootElement: this.rootElement
      }));
    } else {
      return this._schedulingIssueResolutionPopup || (this._schedulingIssueResolutionPopup = new this.schedulingIssueResolutionPopupClass({
        rootElement: this.rootElement
      }));
    }
  }

  onProjectSchedulingIssueEvent({
    schedulingIssue
  }) {
    const popup = this.getSchedulingIssueResolutionPopup(schedulingIssue);
    this._lastSchedulingIssueResolutionPopup = popup;
    popup.resolve(...arguments);
  }

  get widgetClass() {}

});

export { AdvancedTab, AssignmentAllocationInterval, AssignmentModel, AssignmentStore, BaseAllocationInfo, BaseAllocationInterval, BaseAssignmentMixin, BaseCalendarMixin, BaseDependencyMixin, BaseDependencyResolution, BaseEmptyCalendarEffectResolution, BaseEventMixin, BaseHasAssignmentsMixin, BaseResourceMixin, BreakCurrentStackExecution, CalculateProposed, CalculatedValueGen, CalculatedValueGenC, CalculatedValueSync, CalculatedValueSyncC, CalculationGen, CalculationSync, CalendarField, CalendarIntervalModel, CalendarManagerStore, CalendarModel, CanCombineCalendarsMixin, ChronoAbstractProjectMixin, ChronoAssignmentStoreMixin, ChronoCalendarManagerStoreMixin, ChronoDependencyStoreMixin, ChronoEventStoreMixin, ChronoEventTreeStoreMixin, ChronoGraph, ChronoModelFieldIdentifier, ChronoModelMixin, ChronoModelReferenceBucketFieldIdentifier, ChronoModelReferenceFieldIdentifier, ChronoModelReferenceFieldQuark, ChronoPartOfProjectGenericMixin, ChronoPartOfProjectModelMixin, ChronoPartOfProjectStoreMixin, ChronoResourceStoreMixin, ChronoStoreMixin, CommitZero, ComputationCycle, ConflictEffect, ConflictEffectDescription, ConflictResolution, ConflictSymbol, ConstrainedEarlyEventMixin, ConstraintInterval, ConstraintIntervalDescription, ConstraintTypePicker, ContextGen, ContextSync, CycleDescription, CycleEffect, CycleEffectDescription, CycleResolution, CycleResolutionInput, CycleResolutionInputChrono, CycleResolutionPopup, CycleSymbol, DateConstraintInterval, DateConstraintIntervalDescription, DateInterval, DeactivateDependencyCycleEffectResolution, DeactivateDependencyResolution, DependencyConstraintInterval, DependencyConstraintIntervalDescription, DependencyModel, DependencyStore, DependencyTab, DependencyTypePicker, DurationConverterMixin, DurationVar, EMPTY_INTERVAL, EarlyLateLazyness, EdgeType, EdgeTypeNormal, EdgeTypePast, EditorTab, Effect, EffectResolutionResult, EffortField, EmptyCalendarEffect, EmptyCalendarEffectDescription, EmptyCalendarSymbol, EndDateField, EndDateVar, EngineReplica, EngineRevision, EngineTransaction, Entity, EntityIdentifier, EntityMeta, EventLoader, Field, FieldIdentifier, FormTab, Formula, FormulasCache, GanttTaskEditor, GeneralTab, GetTransaction, HasCalendarMixin, HasChildrenMixin, HasDateConstraintMixin, HasDependenciesMixin, HasPercentDoneMixin, HasProposedValue, HasProposedValueEffect, HasProposedValueSymbol, HasSubEventsMixin, Identifier, IdentifierC, Instruction, IsChronoModelSymbol, Levels, Listener, Meta, MinimalChronoModelFieldIdentifierGen, MinimalChronoModelFieldIdentifierSync, MinimalChronoModelFieldVariable, MinimalEntityIdentifier, MinimalFieldIdentifierGen, MinimalFieldIdentifierSync, MinimalFieldVariable, MinimalReferenceBucketIdentifier, MinimalReferenceBucketQuark, MinimalReferenceIdentifier, ModelBucketField, ModelCombo, ModelField, ModelReferenceField, NOT_VISITED, NotesTab, OnCycleAction, OwnIdentifier, OwnIdentifierSymbol, OwnQuark, OwnQuarkSymbol, PartOfProject, PercentBar, PercentDoneMixin, PredecessorsTab, PreviousValueOf, PreviousValueOfEffect, PreviousValueOfSymbol, ProTaskEditStm, ProjectCrudManager, ProjectProgressMixin, ProposedArgumentsOf, ProposedArgumentsOfEffect, ProposedArgumentsOfSymbol, ProposedOrPrevious, ProposedOrPreviousSymbol, ProposedOrPreviousValueOf, ProposedOrPreviousValueOfEffect, ProposedOrPreviousValueOfSymbol, ProposedValueOf, ProposedValueOfEffect, ProposedValueOfSymbol, Quark, QuarkGen, QuarkSync, ReadMode, ReadyStatePropagator, ReferenceBucketField, ReferenceBucketIdentifier, ReferenceBucketQuark, ReferenceField, ReferenceIdentifier, Reject, RejectEffect, RejectSymbol, RemoveDateConstraintConflictResolution, RemoveDependencyCycleEffectResolution, RemoveDependencyResolution, Replica, ResourceAllocationEventRangeCalendar, ResourceAllocationEventRangeCalendarIntervalMixin, ResourceAllocationEventRangeCalendarIntervalStore, ResourceAllocationInfo, ResourceAllocationInterval, ResourceModel, ResourceStore, ResourcesTab, Revision, SEDBackwardCycleResolutionContext, SEDDispatcher, SEDDispatcherIdentifier, SEDForwardCycleResolutionContext, SEDGraphDescription, ScheduledByDependenciesEarlyEventMixin, SchedulerAdvancedTab, SchedulerBasicEvent, SchedulerBasicProjectMixin, SchedulerGeneralTab, SchedulerProAssignmentMixin, SchedulerProCycleEffect, SchedulerProDependencyMixin, SchedulerProEvent, SchedulerProHasAssignmentsMixin, SchedulerProProjectMixin, SchedulerProResourceMixin, SchedulerTaskEditor, SchedulingIssueEffectResolution, SchedulingIssueResolution, SchedulingIssueResolutionPopup, SchedulingModePicker, Schema, StartDateField, StartDateVar, SuccessorsTab, SynchronousCalculationStarted, TaskEdit, TaskEditorBase, TombStone, Transaction, TransactionCycleDetectionWalkContext, TransactionSymbol, TransactionWalkDepth, UnsafePreviousValueOf, UnsafePreviousValueOfEffect, UnsafePreviousValueOfSymbol, UnsafeProposedOrPreviousValueOf, UnsafeProposedOrPreviousValueOfEffect, UnsafeProposedOrPreviousValueOfSymbol, Use24hrsEmptyCalendarEffectResolution, Use8hrsEmptyCalendarEffectResolution, VISITED_TOPOLOGICALLY, Variable, VariableC, VariableInputState, VariableWalkContext, WalkContext, WalkSource, WalkState, Write, WriteEffect, WriteSeveral, WriteSeveralEffect, WriteSeveralSymbol, WriteSymbol, bucket, build_proposed, calculate, calculateEffectiveEndDateConstraintInterval, calculateEffectiveStartDateConstraintInterval, createEntityOnPrototype, cycleInfo, dateConverter, durationFormula, endDateFormula, ensureEntityOnPrototype, entity, entityDecoratorBody, field, generic_field, getDecoratedModelFields, injectStaticFieldsProperty, intersectIntervals, isAtomicValue, isSerializableEqual, locale, model_field, prototypeValue, reference, required, runGeneratorAsyncWithEffect, runGeneratorSyncWithEffect, startDateFormula, throwUnknownIdentifier, validateRequiredProperties, write };
//# sourceMappingURL=SchedulingIssueResolution.js.map
