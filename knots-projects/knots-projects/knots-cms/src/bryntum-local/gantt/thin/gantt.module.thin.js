/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { field, EarlyLateLazyness, model_field, dateConverter, calculate, ConstrainedEarlyEventMixin, HasChildrenMixin, DateInterval, ConflictEffect, EffectResolutionResult, Reject, SchedulerProAssignmentMixin, ProposedOrPrevious, BaseEventMixin, SchedulerProHasAssignmentsMixin, HasProposedValue, write, Formula, StartDateVar, EndDateVar, SEDDispatcher, SEDDispatcherIdentifier, CalculateProposed, DurationVar, durationFormula, ProposedOrPreviousValueOf, ScheduledByDependenciesEarlyEventMixin, isAtomicValue, CycleDescription, startDateFormula, endDateFormula, CycleResolution, SchedulerProEvent, prototypeValue, SchedulerProProjectMixin, ConstraintIntervalDescription, ConstraintInterval, SchedulerProResourceMixin, ChronoEventTreeStoreMixin, UnsafeProposedOrPreviousValueOf, ConstraintTypePicker, EffortField, AssignmentStore as AssignmentStore$1, AssignmentModel as AssignmentModel$1, isSerializableEqual, locale as locale$1, SchedulingModePicker, CalendarModel as CalendarModel$1, CalendarManagerStore as CalendarManagerStore$1, DependencyModel as DependencyModel$1, DependencyStore as DependencyStore$1, ResourceModel as ResourceModel$1, ResourceStore as ResourceStore$1, PartOfProject, PercentDoneMixin, GanttTaskEditor, TaskEdit as TaskEdit$1, CalendarIntervalModel as CalendarIntervalModel$1, ProjectCrudManager, DateConstraintInterval, DependencyConstraintInterval, ProjectProgressMixin, SchedulingIssueResolution } from './chunks/SchedulingIssueResolution.js';
import { Mixin, TimeUnit, Direction, MAX_DATE, isDateFinite, MIN_DATE as MIN_DATE$1, SchedulingMode, DependencyType, MixinAny, format, ConstraintIntervalSide, ProjectType, TimeSpan, CalendarCompatMixin, DependencyBaseModel, DayIndexMixin, GetEventsMixin, ProjectCurrentConfig, CrudManagerView } from './chunks/ProjectModel.js';
import { DateHelper, Combo, Store, FunctionHelper, _defineProperty, Collection, LocaleManagerSingleton, TextField, Objects, List, StringHelper, Delayable, LocaleHelper, PickerField, _objectWithoutProperties, _toPropertyKey, ObjectHelper, ChipView, DataField, _objectSpread2, Duration, AjaxStore, InstancePlugin, TemplateHelper, DomClassList, ArrayHelper, DomHelper, EventHelper, Rectangle, WalkHelper, Model, AsyncHelper, BrowserHelper, Base, DomDataStore, DomSync, Toast, VersionHelper } from './chunks/Editor.js';
import { ColumnStore, Column, CheckColumn, GridFeatureManager, CellEdit as CellEdit$1 } from './chunks/GridBase.js';
import { DateColumn } from './chunks/DateColumn.js';
import { DurationColumn, Dependencies as Dependencies$1, TimeAxisColumn as TimeAxisColumn$1, TooltipBase, AbstractTimeRanges, AttachToProjectMixin, DragBase, DragCreateBase, EventResize, TimelineBase } from './chunks/TimeAxisHeaderMenu.js';
import { TreeColumn } from './chunks/Tree.js';
import { RandomGenerator, Parser, XMLHelper } from './chunks/TextAreaPickerField.js';
import { NumberColumn } from './chunks/LocalizableCombo.js';
import './chunks/LocalizableComboItems.js';
import { Grid, RowCopyPaste } from './chunks/Grid.js';
import { ResourceInfoColumn, Labels as Labels$1, TimelineSummary, MultiPageExporter as MultiPageExporter$1, MultiPageVerticalExporter as MultiPageVerticalExporter$1, SinglePageExporter as SinglePageExporter$1, PdfExport as PdfExport$1 } from './chunks/PdfExport2.js';
import { AvatarRendering, Draggable } from './chunks/AvatarRendering.js';
import { EventMenu, ProjectConsumer, SchedulerEventNavigation, CurrentConfig } from './chunks/EventNavigation.js';
import { TreeGroup as TreeGroup$1 } from './chunks/TreeGroup.js';
import './chunks/GridRowModel.js';
import './chunks/DurationField.js';
import './chunks/TextAreaField.js';
import './chunks/TabPanel.js';
import './chunks/Card.js';
import './chunks/Slider.js';
import './chunks/PdfExport.js';
import './chunks/Exporter.js';

var __decorate$8 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * This mixin provides the constraint-based as-late-as-possible scheduling. See the [[ConstrainedEarlyEventMixin]]
 * for the description of the ASAP constraints-based scheduling. See [[GanttProjectMixin]] for more details about
 * forward/backward, ASAP/ALAP scheduling.
 *
 * It also provides the facilities for calculating the event's [[totalSlack]] and the [[critical]] flag.
 *
 * The ALAP-specific constraints are accumulated in [[lateStartDateConstraintIntervals]], [[lateEndDateConstraintIntervals]] fields.
 */

class ConstrainedLateEventMixin extends Mixin([ConstrainedEarlyEventMixin, HasChildrenMixin], base => {
  const superProto = base.prototype;

  class ConstrainedLateEventMixin extends base {
    /**
     * Calculation method for the [[lateStartDateConstraintIntervals]]. Returns empty array by default.
     * Override this method to return some extra constraints for the start date during the ALAP scheduling.
     */
    *calculateLateStartDateConstraintIntervals() {
      const intervals = [];
      const parentEvent = yield this.$.parentEvent;

      if (parentEvent) {
        // Child inherits its parent task constraints
        const parentIntervals = yield parentEvent.$.lateStartDateConstraintIntervals;
        intervals.push.apply(intervals, parentIntervals);
      }

      return intervals;
    }
    /**
     * Calculation method for the [[lateEndDateConstraintIntervals]]. Returns empty array by default.
     * Override this method to return some extra constraints for the end date during the ALAP scheduling.
     */

    *calculateLateEndDateConstraintIntervals() {
      const intervals = [];
      const parentEvent = yield this.$.parentEvent;

      if (parentEvent) {
        // Child inherits its parent task constraints
        const parentIntervals = yield parentEvent.$.lateEndDateConstraintIntervals;
        intervals.push.apply(intervals, parentIntervals); // If the parent is scheduled manually it should still restrict its children (even though it has no a constraint set)
        // so we append an artificial constraining interval

        if ((yield parentEvent.$.manuallyScheduled) && (yield this.$.direction) === Direction.Backward) {
          intervals.push(DateInterval.new({
            endDate: yield parentEvent.$.endDate
          }));
        }
      }

      return intervals;
    }
    /**
     * The method defines wether the provided child event should be
     * taken into account when calculating this summary event [[lateStartDate]].
     * Child events roll up their [[lateStartDate]] values to their summary tasks.
     * So a summary task [[lateStartDate]] date gets equal to its minimal child [[lateStartDate]].
     *
     * If the method returns `true` the child event is taken into account
     * and if the method returns `false` it's not.
     * By default the method returns `true` to include all child events data.
     * @param childEvent Child event to consider.
     * @returns `true` if the provided event should be taken into account, `false` if not.
     */

    *shouldRollupChildLateStartDate(childEvent) {
      return true;
    }

    *calculateMinChildrenLateStartDate() {
      let result = MAX_DATE;
      const subEventsIterator = yield* this.subEventsIterable();

      for (let childEvent of subEventsIterator) {
        if (!(yield* this.shouldRollupChildLateStartDate(childEvent))) continue;
        let childDate;

        if ((yield childEvent.$.manuallyScheduled) && (yield* childEvent.hasSubEvents())) {
          childDate = yield childEvent.$.minChildrenLateStartDate;
        }

        childDate = childDate || (yield childEvent.$.lateStartDate);
        if (childDate && childDate < result) result = childDate;
      }

      return result.getTime() - MAX_DATE.getTime() ? result : null;
    }

    *calculateLateStartDateRaw() {
      // Manually scheduled task treat its current start date as late start date
      // in case of backward scheduling.
      // Early dates in that case are calculated the same way it happens for automatic tasks
      if ((yield this.$.manuallyScheduled) && (yield this.$.direction) === Direction.Backward) {
        return yield this.$.startDate;
      } // Parent task calculate its late start date as minimal late start date of its children

      if (yield* this.hasSubEvents()) {
        return yield this.$.minChildrenLateStartDate;
      }

      if (!(yield* this.isConstrainedLate())) {
        return yield this.$.startDate;
      } // need to use concat instead of directly mutating the `startDateConstraintIntervals` since that is
      // used as storage for `this.$.lateStartDateConstraintIntervals`

      const startDateConstraintIntervals = (yield this.$.lateStartDateConstraintIntervals).concat(yield this.$.startDateConstraintIntervals);
      const endDateConstraintIntervals = (yield this.$.lateEndDateConstraintIntervals).concat(yield this.$.endDateConstraintIntervals);
      let effectiveInterval = yield* this.calculateEffectiveConstraintInterval(true, startDateConstraintIntervals, endDateConstraintIntervals);

      if (effectiveInterval === null) {
        return null;
      } else if (effectiveInterval.isIntervalEmpty()) {
        // re-calculate effective resulting interval gathering intersection history
        effectiveInterval = yield* this.calculateEffectiveConstraintInterval(true, startDateConstraintIntervals, endDateConstraintIntervals, true);
        const conflict = ConflictEffect.new({
          intervals: [...effectiveInterval.intersectionOf]
        });

        if ((yield conflict) === EffectResolutionResult.Cancel) {
          yield Reject(conflict);
        } else {
          return null;
        }
      }

      return isDateFinite(effectiveInterval.endDate) ? effectiveInterval.endDate : null;
    }
    /**
     * The method defines wether the provided child event should be
     * taken into account when calculating this summary event [[lateEndDate]].
     * Child events roll up their [[lateEndDate]] values to their summary tasks.
     * So a summary task [[lateEndDate]] gets equal to its maximal child [[lateEndDate]].
     *
     * If the method returns `true` the child event is taken into account
     * and if the method returns `false` it's not.
     * By default the method returns `true` to include all child events data.
     * @param childEvent Child event to consider.
     * @returns `true` if the provided event should be taken into account, `false` if not.
     */

    *shouldRollupChildLateEndDate(childEvent) {
      return true;
    }

    *calculateMaxChildrenLateEndDate() {
      let result = MIN_DATE$1;
      const subEventsIterator = yield* this.subEventsIterable();

      for (let childEvent of subEventsIterator) {
        if (!(yield* this.shouldRollupChildLateEndDate(childEvent))) continue;
        let childDate;

        if ((yield childEvent.$.manuallyScheduled) && (yield* childEvent.hasSubEvents())) {
          childDate = yield childEvent.$.maxChildrenLateEndDate;
        }

        childDate = childDate || (yield childEvent.$.lateEndDate);
        if (childDate && childDate > result) result = childDate;
      }

      return result.getTime() - MIN_DATE$1.getTime() ? result : null;
    }

    *calculateLateStartDate() {
      return yield this.$.lateStartDateRaw;
    }

    *calculateLateEndDateRaw() {
      // Manually scheduled task treat its current end date as late end date
      // in case of backward scheduling.
      // Early dates in that case are calculated the same way it happens for automatic tasks
      if ((yield this.$.manuallyScheduled) && (yield this.$.direction) === Direction.Backward) {
        return yield this.$.endDate;
      } // Parent task calculate its late end date as minimal early end date of its children

      if (yield* this.hasSubEvents()) {
        return yield this.$.maxChildrenLateEndDate;
      }

      if (!(yield* this.isConstrainedLate())) {
        return yield this.$.endDate;
      }

      const startDateConstraintIntervals = yield this.$.lateStartDateConstraintIntervals;
      const endDateConstraintIntervals = yield this.$.lateEndDateConstraintIntervals;
      let effectiveInterval = yield* this.calculateEffectiveConstraintInterval(false, // need to use concat instead of directly mutating the `startDateConstraintIntervals` since that is
      // used as storage for `this.$.lateStartDateConstraintIntervals`
      startDateConstraintIntervals.concat(yield this.$.startDateConstraintIntervals), endDateConstraintIntervals.concat(yield this.$.endDateConstraintIntervals));

      if (effectiveInterval === null) {
        return null;
      } else if (effectiveInterval.isIntervalEmpty()) {
        // re-calculate effective resulting interval gathering intersection history
        effectiveInterval = yield* this.calculateEffectiveConstraintInterval(false, // need to use concat instead of directly mutating the `startDateConstraintIntervals` since that is
        // used as storage for `this.$.lateStartDateConstraintIntervals`
        (yield this.$.lateStartDateConstraintIntervals).concat(yield this.$.startDateConstraintIntervals), (yield this.$.lateEndDateConstraintIntervals).concat(yield this.$.endDateConstraintIntervals), true);
        const conflict = ConflictEffect.new({
          intervals: [...effectiveInterval.intersectionOf]
        });

        if ((yield conflict) === EffectResolutionResult.Cancel) {
          yield Reject(conflict);
        } else {
          return null;
        }
      }

      return isDateFinite(effectiveInterval.endDate) ? effectiveInterval.endDate : null;
    }

    *calculateLateEndDate() {
      const date = yield this.$.lateEndDateRaw;
      return yield* this.maybeSkipNonWorkingTime(date, false);
    }

    *calculateTotalSlack() {
      const earlyStartDate = yield this.$.earlyStartDateRaw;
      const lateStartDate = yield this.$.lateStartDateRaw;
      const earlyEndDate = yield this.$.earlyEndDateRaw;
      const lateEndDate = yield this.$.lateEndDateRaw;
      const slackUnit = yield this.$.slackUnit;
      let endSlack, result;

      if (earlyStartDate && lateStartDate || earlyEndDate && lateEndDate) {
        if (earlyStartDate && lateStartDate) {
          result = yield* this.calculateProjectedDuration(earlyStartDate, lateStartDate, slackUnit);

          if (earlyEndDate && lateEndDate) {
            endSlack = yield* this.calculateProjectedDuration(earlyEndDate, lateEndDate, slackUnit);
            if (endSlack < result) result = endSlack;
          }
        } else if (earlyEndDate && lateEndDate) {
          result = yield* this.calculateProjectedDuration(earlyEndDate, lateEndDate, slackUnit);
        }
      }

      return result;
    }

    *calculateCritical() {
      const totalSlack = yield this.$.totalSlack;
      return totalSlack <= 0;
    }

    *isConstrainedLate() {
      const startDateIntervals = yield this.$.startDateConstraintIntervals;
      const endDateIntervals = yield this.$.endDateConstraintIntervals;
      const lateStartDateConstraintIntervals = yield this.$.lateStartDateConstraintIntervals;
      const lateEndDateConstraintIntervals = yield this.$.lateEndDateConstraintIntervals;
      return Boolean((startDateIntervals === null || startDateIntervals === void 0 ? void 0 : startDateIntervals.length) || (endDateIntervals === null || endDateIntervals === void 0 ? void 0 : endDateIntervals.length) || (lateStartDateConstraintIntervals === null || lateStartDateConstraintIntervals === void 0 ? void 0 : lateStartDateConstraintIntervals.length) || (lateEndDateConstraintIntervals === null || lateEndDateConstraintIntervals === void 0 ? void 0 : lateEndDateConstraintIntervals.length));
    }

    *calculateStartDatePure() {
      const direction = yield this.$.direction;

      if (direction === Direction.Backward) {
        // early exit if this mixin is not applicable, but only after(!) the direction check
        // this is because the `isConstrainedLate` yield early constraint intervals, which are generally lazy,
        // depending from the direction
        if (!(yield* this.isConstrainedLate()) || (yield this.$.manuallyScheduled)) {
          return yield* superProto.calculateStartDatePure.call(this);
        }

        return yield this.$.lateStartDate;
      } else {
        return yield* superProto.calculateStartDatePure.call(this);
      }
    }

    *calculateStartDateProposed() {
      const direction = yield this.$.direction;

      switch (direction) {
        case Direction.Backward:
          // early exit if this mixin is not applicable, but only after(!) the direction check
          // this is because the `isConstrainedLate` yield early constraint intervals, which are generally lazy,
          // depending from the direction
          if (!(yield* this.isConstrainedLate()) || (yield this.$.manuallyScheduled)) {
            return yield* superProto.calculateStartDateProposed.call(this);
          }

          return (yield this.$.lateStartDate) || (yield* superProto.calculateStartDateProposed.call(this));

        default:
          return yield* superProto.calculateStartDateProposed.call(this);
      }
    }

    *calculateEndDatePure() {
      const direction = yield this.$.direction;

      if (direction === Direction.Backward) {
        // early exit if this mixin is not applicable, but only after(!) the direction check
        // this is because the `isConstrainedLate` yield early constraint intervals, which are generally lazy,
        // depending from the direction
        if (!(yield* this.isConstrainedLate()) || (yield this.$.manuallyScheduled)) {
          return yield* superProto.calculateEndDatePure.call(this);
        }

        return yield this.$.lateEndDate;
      } else {
        return yield* superProto.calculateEndDatePure.call(this);
      }
    }

    *calculateEndDateProposed() {
      const direction = yield this.$.direction;

      switch (direction) {
        case Direction.Backward:
          // early exit if this mixin is not applicable, but only after(!) the direction check
          // this is because the `isConstrainedLate` yield early constraint intervals, which are generally lazy,
          // depending from the direction
          if (!(yield* this.isConstrainedLate()) || (yield this.$.manuallyScheduled)) {
            return yield* superProto.calculateEndDateProposed.call(this);
          }

          return (yield this.$.lateEndDate) || (yield* superProto.calculateEndDateProposed.call(this));

        default:
          return yield* superProto.calculateEndDateProposed.call(this);
      }
    }

  }

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedLateEventMixin.prototype, "minChildrenLateStartDate", void 0);

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedLateEventMixin.prototype, "lateStartDateRaw", void 0);

  __decorate$8([model_field({
    type: 'date',
    persist: false
  }, {
    lazy: EarlyLateLazyness,
    converter: dateConverter,
    persistent: false
  })], ConstrainedLateEventMixin.prototype, "lateStartDate", void 0);

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedLateEventMixin.prototype, "maxChildrenLateEndDate", void 0);

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedLateEventMixin.prototype, "lateEndDateRaw", void 0);

  __decorate$8([model_field({
    type: 'date',
    persist: false
  }, {
    lazy: EarlyLateLazyness,
    converter: dateConverter,
    persistent: false
  })], ConstrainedLateEventMixin.prototype, "lateEndDate", void 0);

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedLateEventMixin.prototype, "lateStartDateConstraintIntervals", void 0);

  __decorate$8([field({
    lazy: EarlyLateLazyness
  })], ConstrainedLateEventMixin.prototype, "lateEndDateConstraintIntervals", void 0);

  __decorate$8([model_field({
    type: 'number',
    persist: false
  }, {
    lazy: EarlyLateLazyness,
    persistent: false
  })], ConstrainedLateEventMixin.prototype, "totalSlack", void 0);

  __decorate$8([model_field({
    type: 'string',
    defaultValue: TimeUnit.Day,
    persist: false
  }, {
    lazy: EarlyLateLazyness,
    converter: DateHelper.normalizeUnit,
    persistent: false
  })], ConstrainedLateEventMixin.prototype, "slackUnit", void 0);

  __decorate$8([model_field({
    type: 'boolean',
    defaultValue: false,
    persist: false
  }, {
    persistent: false,
    lazy: EarlyLateLazyness
  })], ConstrainedLateEventMixin.prototype, "critical", void 0);

  __decorate$8([calculate('lateStartDateConstraintIntervals')], ConstrainedLateEventMixin.prototype, "calculateLateStartDateConstraintIntervals", null);

  __decorate$8([calculate('lateEndDateConstraintIntervals')], ConstrainedLateEventMixin.prototype, "calculateLateEndDateConstraintIntervals", null);

  __decorate$8([calculate('minChildrenLateStartDate')], ConstrainedLateEventMixin.prototype, "calculateMinChildrenLateStartDate", null);

  __decorate$8([calculate('lateStartDateRaw')], ConstrainedLateEventMixin.prototype, "calculateLateStartDateRaw", null);

  __decorate$8([calculate('maxChildrenLateEndDate')], ConstrainedLateEventMixin.prototype, "calculateMaxChildrenLateEndDate", null);

  __decorate$8([calculate('lateStartDate')], ConstrainedLateEventMixin.prototype, "calculateLateStartDate", null);

  __decorate$8([calculate('lateEndDateRaw')], ConstrainedLateEventMixin.prototype, "calculateLateEndDateRaw", null);

  __decorate$8([calculate('lateEndDate')], ConstrainedLateEventMixin.prototype, "calculateLateEndDate", null);

  __decorate$8([calculate('totalSlack')], ConstrainedLateEventMixin.prototype, "calculateTotalSlack", null);

  __decorate$8([calculate('critical')], ConstrainedLateEventMixin.prototype, "calculateCritical", null);

  return ConstrainedLateEventMixin;
}) {}

var __decorate$7 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * A mixin for the assignment entity at the Gantt level. It adds [[units]] field.
 */

class GanttAssignmentMixin extends Mixin([SchedulerProAssignmentMixin], base => {
  base.prototype;

  class GanttAssignmentMixin extends base {
    *calculateUnits() {
      const event = yield this.$.event; // if event of assignment presents - we always delegate to it
      // (so that various assignment logic can be overridden by single event mixin)

      if (event) return yield* event.calculateAssignmentUnits(this); // otherwise use proposed or current consistent value

      return yield ProposedOrPrevious;
    }

  }

  __decorate$7([calculate('units')], GanttAssignmentMixin.prototype, "calculateUnits", null);

  return GanttAssignmentMixin;
}) {}

var __decorate$6 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * This mixin makes the event to "inherit" the constraints from its parent event.
 */

class ConstrainedByParentMixin extends Mixin([BaseEventMixin, HasChildrenMixin, ConstrainedEarlyEventMixin], base => {
  const superProto = base.prototype;

  class ConstrainedByParentMixin extends base {
    *maybeSkipNonWorkingTime(date, isForward = true) {
      const childEvents = yield this.$.childEvents; // summary tasks are simply aligned by their children so they should not skip non-working time at all

      if (childEvents.size > 0) return date;
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
        intervals.push.apply(intervals, parentIntervals); // If the parent is scheduled manually it should still restrict its children (even though it has no a constraint set)
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

  __decorate$6([calculate('startDateConstraintIntervals')], ConstrainedByParentMixin.prototype, "calculateStartDateConstraintIntervals", null);

  __decorate$6([calculate('endDateConstraintIntervals')], ConstrainedByParentMixin.prototype, "calculateEndDateConstraintIntervals", null);

  __decorate$6([calculate('earlyStartDateConstraintIntervals')], ConstrainedByParentMixin.prototype, "calculateEarlyStartDateConstraintIntervals", null);

  __decorate$6([calculate('earlyEndDateConstraintIntervals')], ConstrainedByParentMixin.prototype, "calculateEarlyEndDateConstraintIntervals", null);

  return ConstrainedByParentMixin;
}) {}

/**
 * This mixins enhances the [[SchedulerProHasAssignmentsMixin]] with few helper methods.
 */

class GanttHasAssignmentsMixin extends Mixin([SchedulerProHasAssignmentsMixin], base => {
  base.prototype;

  class GanttHasAssignmentsMixin extends base {
    *hasProposedValueForUnits() {
      const assignments = yield this.$.assigned;

      for (const assignment of assignments) {
        const resource = yield assignment.$.resource;
        if (resource && (yield HasProposedValue(assignment.$.units))) return true;
      }

      return false;
    }

  }

  return GanttHasAssignmentsMixin;
}) {}

var __decorate$5 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * This mixin provides an `effort` field which does not affect scheduling.
 * It also provides various generic methods to schedule task based on effort information. Those are
 * used in other mixins.
 */

class HasEffortMixin extends Mixin([GanttHasAssignmentsMixin, HasChildrenMixin], base => {
  base.prototype;

  class HasEffortMixin extends base {
    /**
     * Getter for the effort. Can return return effort in given unit, or will use [[effortUnit]].
     *
     * @param unit
     */
    getEffort(unit) {
      const effort = this.effort;
      return unit !== undefined ? this.getProject().convertDuration(effort, this.effortUnit, unit) : effort;
    }

    writeEffort(me, transaction, quark, effort, unit) {
      if (effort < 0) effort = 0;
      if (!transaction.baseRevision.hasIdentifier(me) && effort == null) return;

      if (unit != null && unit !== this.effortUnit) {
        this.$.effortUnit.write.call(this, this.$.effortUnit, transaction, null, unit);
      }

      me.constructor.prototype.write(me, transaction, quark, effort);
    }

    setEffortUnit(_value) {
      throw new Error("Use `setEffort` instead");
    }
    /**
     * The method defines wether the provided child event should roll up its [[effort]] to this summary event or not.
     * If the method returns `true` the child event [[effort]] is summed up
     * when calculating this summary event [[effort]].
     * And if the method returns `false` the child effort is not taken into account.
     * By default the method returns `true` to include all child event [[effort]] values.
     * @param childEvent Child event to consider.
     * @returns `true` if the provided event [[effort]] should be included, `false` if not.
     */

    *shouldRollupChildEffort(childEvent) {
      return true;
    }
    /**
     * Helper method to calculate the total effort of all child events.
     */

    *calculateTotalChildrenEffort() {
      const childEvents = yield this.$.childEvents;
      const project = this.getProject();
      let totalEffortMs = 0;

      for (const childEvent of childEvents) {
        if (!(yield* this.shouldRollupChildEffort(childEvent))) continue;
        const childEventEffortUnit = yield childEvent.$.effortUnit;
        totalEffortMs += yield* project.$convertDuration(yield childEvent.$.effort, childEventEffortUnit, TimeUnit.Millisecond);
      }

      return yield* project.$convertDuration(totalEffortMs, TimeUnit.Millisecond, yield this.$.effortUnit);
    }

    *calculateEffort() {
      const childEvents = yield this.$.childEvents;
      if (childEvents.size > 0) return yield* this.calculateTotalChildrenEffort();else {
        const proposed = yield ProposedOrPrevious;
        return proposed !== undefined ? proposed : yield* this.calculateEffortPure();
      }
    }

    *calculateEffortPure() {
      const childEvents = yield this.$.childEvents;
      if (childEvents.size > 0) return yield* this.calculateTotalChildrenEffort();else {
        return yield* this.calculateProjectedEffort(yield this.$.startDate, yield this.$.endDate);
      }
    }

    *calculateEffortProposed() {
      return yield ProposedOrPrevious;
    }

    *calculateAssignmentUnits(assignment) {
      return yield* this.calculateAssignmentUnitsProposed(assignment);
    }

    *calculateAssignmentUnitsPure(assignment) {
      return yield* this.calculateUnitsByStartEndAndEffort(assignment);
    }

    *calculateAssignmentUnitsProposed(assignment) {
      return yield ProposedOrPrevious;
    }

    *getBaseOptionsForEffortCalculations() {
      return {
        ignoreResourceCalendars: false
      };
    }

    *calculateProjectedEffort(startDate, endDate) {
      if (startDate == null || endDate == null || startDate > endDate) return null;
      const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
      const totalUnitsByCalendar = new Map();

      for (const [calendar, assignments] of assignmentsByCalendar) {
        let intervalUnits = 0;

        for (const assignment of assignments) {
          intervalUnits += yield assignment.$.units;
        }

        totalUnitsByCalendar.set(calendar, intervalUnits);
      } //----------------------

      let resultN = 0;
      const options = Object.assign(yield* this.getBaseOptionsForEffortCalculations(), {
        startDate,
        endDate
      }); // if event has no assignments we treat that as it has a special, "virtual" assignment with 100 units and
      // the calendar matching the calendar of the task
      // we need to ignore resource calendars in this case, since there's no assigned resources

      if (totalUnitsByCalendar.size === 0) {
        totalUnitsByCalendar.set(yield this.$.effectiveCalendar, 100);
        options.ignoreResourceCalendars = true;
      }

      yield* this.forEachAvailabilityInterval(options, (intervalStart, intervalEnd, calendarCacheIntervalMultiple) => {
        const workCalendars = calendarCacheIntervalMultiple.getCalendarsWorking();
        const intervalStartN = intervalStart.getTime(),
              intervalEndN = intervalEnd.getTime(),
              intervalDuration = intervalEndN - intervalStartN;
        let intervalUnits = 0;

        for (const workingCalendar of workCalendars) {
          // the calendar of the event itself will be in the `workCalendars`, but it
          // will be missing in the `totalUnitsByCalendar` map, which is fine
          intervalUnits += totalUnitsByCalendar.get(workingCalendar) || 0;
        } // Effort = Units * Duration

        resultN += intervalUnits * intervalDuration * 0.01;
      });
      return yield* this.getProject().$convertDuration(resultN, TimeUnit.Millisecond, yield this.$.effortUnit);
    }

    *calculateUnitsByStartEndAndEffort(_assignment) {
      const effort = yield this.$.effort,
            effortUnit = yield this.$.effortUnit,
            effortMS = yield* this.getProject().$convertDuration(effort, effortUnit, TimeUnit.Millisecond);
      let collectedEffort = 0;
      const options = Object.assign(yield* this.getBaseOptionsForEffortCalculations(), {
        startDate: yield this.$.startDate,
        endDate: yield this.$.endDate
      });
      const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
      yield* this.forEachAvailabilityInterval(options, (intervalStart, intervalEnd, calendarCacheIntervalMultiple) => {
        const workCalendars = calendarCacheIntervalMultiple.getCalendarsWorking();
        const intervalStartN = intervalStart.getTime(),
              intervalEndN = intervalEnd.getTime(),
              intervalDuration = intervalEndN - intervalStartN;

        for (const workingCalendar of workCalendars) {
          collectedEffort += (assignmentsByCalendar.has(workingCalendar) ? assignmentsByCalendar.get(workingCalendar).length : 0) * intervalDuration;
        }
      });
      return collectedEffort ? 100 * effortMS / collectedEffort : 100;
    }

    *calculateProjectedXDateByEffort(baseDate, isForward = true) {
      const effort = yield this.$.effort,
            effortUnit = yield this.$.effortUnit,
            effortMS = yield* this.getProject().$convertDuration(effort, effortUnit, TimeUnit.Millisecond);
      if (baseDate == null || effort == null) return null;
      let resultN = baseDate.getTime();
      let leftEffort = effortMS;
      const calendar = yield this.$.effectiveCalendar;
      const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
      const totalUnitsByCalendar = new Map();

      for (const [calendar, assignments] of assignmentsByCalendar) {
        let intervalUnits = 0;

        for (const assignment of assignments) {
          intervalUnits += yield assignment.$.units;
        }

        totalUnitsByCalendar.set(calendar, intervalUnits);
      }

      if (assignmentsByCalendar.size > 0) {
        const options = Object.assign(yield* this.getBaseOptionsForDurationCalculations(), isForward ? {
          startDate: baseDate,
          isForward
        } : {
          endDate: baseDate,
          isForward
        });
        yield* this.forEachAvailabilityInterval(options, (intervalStart, intervalEnd, calendarCacheIntervalMultiple) => {
          const workCalendars = calendarCacheIntervalMultiple.getCalendarsWorking();
          const intervalStartN = intervalStart.getTime(),
                intervalEndN = intervalEnd.getTime(),
                intervalDuration = intervalEndN - intervalStartN;
          let intervalUnits = 0;

          for (const workingCalendar of workCalendars) {
            // the calendar of the event itself will be in the `workCalendars`, but it
            // will be missing in the `totalUnitsByCalendar` map, which is fine
            intervalUnits += totalUnitsByCalendar.get(workingCalendar) || 0;
          } // Effort = Units * Duration

          const intervalEffort = intervalUnits * intervalDuration * 0.01;

          if (intervalEffort >= leftEffort) {
            // resulting date is interval start plus left duration (Duration = Effort / Units)
            resultN = isForward ? intervalStartN + leftEffort / (0.01 * intervalUnits) : intervalEndN - leftEffort / (0.01 * intervalUnits);
            return false;
          } else {
            leftEffort -= intervalEffort;
          }
        });
        return new Date(resultN);
      } else {
        return calendar.accumulateWorkingTime(baseDate, effortMS, isForward).finalDate;
      }
    }

  }

  __decorate$5([model_field({
    'type': 'number'
    /*, defaultValue : 0*/

  })], HasEffortMixin.prototype, "effort", void 0);

  __decorate$5([model_field({
    'type': 'string',
    defaultValue: TimeUnit.Hour
  }, {
    converter: DateHelper.normalizeUnit
  })], HasEffortMixin.prototype, "effortUnit", void 0);

  __decorate$5([write('effort')], HasEffortMixin.prototype, "writeEffort", null);

  __decorate$5([calculate('effort')], HasEffortMixin.prototype, "calculateEffort", null);

  return HasEffortMixin;
}) {}

const EffortVar = Symbol('EffortVar');
const UnitsVar = Symbol('UnitsVar'); //---------------------------------------------------------------------------------------------------------------------

const effortFormula = Formula.new({
  output: EffortVar,
  inputs: new Set([StartDateVar, EndDateVar, UnitsVar])
});
const unitsFormula = Formula.new({
  output: UnitsVar,
  inputs: new Set([StartDateVar, EndDateVar, EffortVar])
});
const endDateByEffortFormula = Formula.new({
  output: EndDateVar,
  inputs: new Set([StartDateVar, EffortVar, UnitsVar])
});
const startDateByEffortFormula = Formula.new({
  output: StartDateVar,
  inputs: new Set([EndDateVar, EffortVar, UnitsVar])
}); //---------------------------------------------------------------------------------------------------------------------

class SEDWUDispatcher extends SEDDispatcher {} //---------------------------------------------------------------------------------------------------------------------

class SEDWUDispatcherIdentifier extends SEDDispatcherIdentifier {
  equality(v1, v2) {
    const resolution1 = v1.resolution;
    const resolution2 = v2.resolution;
    return resolution1.get(EffortVar) === resolution2.get(EffortVar) && resolution1.get(UnitsVar) === resolution2.get(UnitsVar) && super.equality(v1, v2);
  }

}

var __decorate$4 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * This mixin serves as a "base class" for the individual scheduling modes mixins: [[FixedDurationMixin]], [[FixedEffortMixin]]
 * and [[FixedUnitsMixin]].
 *
 * Scheduling mode indicates, in which order the duration, effort and assignment units are changed. All these variables
 * are tied together with this invariant (in pseudo-code):
 *
 * ```
 * Effort = Duration * Units
 * ```
 *
 * For example, if we've doubled the effort of the task, we have the choice - we can either double its duration,
 * or double the assignment units, to keep the invariant.
 *
 * We have the same choices for every variable. The scheduling mode
 * basically defines the order in which the "duration", "effort" and "units" variables are updated when one of them changes.
 */

class HasSchedulingModeMixin extends Mixin([HasEffortMixin], base => {
  const superProto = base.prototype;

  class HasSchedulingModeMixin extends base {
    *calculateSchedulingMode() {
      return (yield ProposedOrPrevious) || SchedulingMode.Normal;
    }

    *effectiveSchedulingMode() {
      const assignmentsByCalendar = yield this.$.assignmentsByCalendar;
      return assignmentsByCalendar.size > 0 ? yield this.$.schedulingMode : SchedulingMode.Normal;
    }

    effectiveSchedulingModeSync(Y) {
      const assignmentsByCalendar = Y(this.$.assignmentsByCalendar);
      return assignmentsByCalendar.size > 0 ? Y(this.$.schedulingMode) : SchedulingMode.Normal;
    }

    *prepareDispatcher(YIELD) {
      const schedulingMode = yield* this.effectiveSchedulingMode();

      if (schedulingMode !== SchedulingMode.Normal) {
        const cycleDispatcher = yield* superProto.prepareDispatcher.call(this, YIELD);
        cycleDispatcher.collectInfo(YIELD, this.$.effort, EffortVar);
        if (yield* this.hasProposedValueForUnits()) cycleDispatcher.addProposedValueFlag(UnitsVar); // units are always available

        cycleDispatcher.addPreviousValueFlag(UnitsVar);
        return cycleDispatcher;
      } else {
        return yield* superProto.prepareDispatcher.call(this, YIELD);
      }
    }

    dispatcherClass(Y) {
      const schedulingMode = this.effectiveSchedulingModeSync(Y);

      if (schedulingMode !== SchedulingMode.Normal) {
        return SEDWUDispatcher;
      } else {
        return superProto.dispatcherClass.call(this, Y);
      }
    }

    buildProposedDispatcher(me, quark, transaction) {
      const dispatcher = superProto.buildProposedDispatcher.call(this, me, quark, transaction); // TODO should check for dispatcher class probably

      dispatcher.addPreviousValueFlag(EffortVar);
      dispatcher.addPreviousValueFlag(UnitsVar);
      return dispatcher;
    }

    *calculateAssignmentUnits(assignment) {
      const schedulingMode = yield* this.effectiveSchedulingMode();

      if (schedulingMode !== SchedulingMode.Normal) {
        const dispatch = yield this.$.dispatcher;
        const formulaId = dispatch.resolution.get(UnitsVar);

        if (formulaId === CalculateProposed) {
          return yield* this.calculateAssignmentUnitsProposed(assignment);
        } else if (formulaId === unitsFormula.formulaId) {
          return yield* this.calculateAssignmentUnitsPure(assignment);
        } else {
          throw new Error("Unknown formula for `units`");
        }
      } else {
        return yield* superProto.calculateAssignmentUnits.call(this, assignment);
      }
    }

    *calculateEffort() {
      const schedulingMode = yield* this.effectiveSchedulingMode();

      if (schedulingMode !== SchedulingMode.Normal) {
        const dispatch = yield this.$.dispatcher;
        const formulaId = dispatch.resolution.get(EffortVar);

        if (formulaId === CalculateProposed) {
          return yield* this.calculateEffortProposed();
        } else if (formulaId === effortFormula.formulaId) {
          return yield* this.calculateEffortPure();
        } else {
          throw new Error("Unknown formula for `effort`");
        }
      } else {
        return yield* superProto.calculateEffort.call(this);
      }
    }

    *calculateStartDate() {
      const schedulingMode = yield* this.effectiveSchedulingMode();

      if (schedulingMode !== SchedulingMode.Normal) {
        const dispatch = yield this.$.dispatcher;
        const formulaId = dispatch.resolution.get(StartDateVar);

        if (formulaId === startDateByEffortFormula.formulaId) {
          return yield* this.calculateProjectedXDateByEffort(yield this.$.endDate, false);
        } else {
          return yield* superProto.calculateStartDate.call(this);
        }
      } else {
        return yield* superProto.calculateStartDate.call(this);
      }
    }

    *calculateEndDate() {
      const schedulingMode = yield* this.effectiveSchedulingMode();

      if (schedulingMode !== SchedulingMode.Normal) {
        const dispatch = yield this.$.dispatcher;
        const formulaId = dispatch.resolution.get(EndDateVar);

        if (formulaId === endDateByEffortFormula.formulaId) {
          return yield* this.calculateProjectedXDateByEffort(yield this.$.startDate, true);
        } else {
          return yield* superProto.calculateEndDate.call(this);
        }
      } else {
        return yield* superProto.calculateEndDate.call(this);
      }
    }

    *calculateEffectiveDuration() {
      const dispatch = yield this.$.dispatcher;
      const schedulingMode = yield* this.effectiveSchedulingMode();
      const durationResolution = dispatch.resolution.get(DurationVar);
      dispatch.resolution.get(EffortVar);
      let effectiveDurationToUse;

      if (durationResolution === durationFormula.formulaId && schedulingMode != SchedulingMode.Normal) {
        const proposedOrPreviousStartDate = yield ProposedOrPreviousValueOf(this.$.startDate);
        const proposedOrPreviousEndDate = yield ProposedOrPreviousValueOf(this.$.endDate);
        const startDateResolution = dispatch.resolution.get(StartDateVar);
        const endDateResolution = dispatch.resolution.get(EndDateVar);
        yield this.$.effortDriven;

        if (proposedOrPreviousEndDate && startDateResolution === startDateByEffortFormula.formulaId) {
          effectiveDurationToUse = yield* this.calculateProjectedDuration(yield* this.calculateProjectedXDateByEffort(proposedOrPreviousEndDate, false), proposedOrPreviousEndDate);
        } else if (proposedOrPreviousStartDate && endDateResolution === endDateByEffortFormula.formulaId) {
          effectiveDurationToUse = yield* this.calculateProjectedDuration(proposedOrPreviousStartDate, yield* this.calculateProjectedXDateByEffort(proposedOrPreviousStartDate, true));
        } else if (proposedOrPreviousStartDate && proposedOrPreviousEndDate || !proposedOrPreviousStartDate && !proposedOrPreviousEndDate) {
          effectiveDurationToUse = yield* superProto.calculateEffectiveDuration.call(this);
        }
      } else effectiveDurationToUse = yield* superProto.calculateEffectiveDuration.call(this);

      return effectiveDurationToUse;
    }

  }

  __decorate$4([model_field({
    'type': 'boolean',
    defaultValue: false
  })], HasSchedulingModeMixin.prototype, "effortDriven", void 0);

  __decorate$4([model_field({
    type: 'string',
    defaultValue: SchedulingMode.Normal
  }, {
    sync: true
  })], HasSchedulingModeMixin.prototype, "schedulingMode", void 0);

  __decorate$4([field({
    identifierCls: SEDWUDispatcherIdentifier
  })], HasSchedulingModeMixin.prototype, "dispatcher", void 0);

  __decorate$4([calculate('schedulingMode')], HasSchedulingModeMixin.prototype, "calculateSchedulingMode", null);

  __decorate$4([calculate('effort')], HasSchedulingModeMixin.prototype, "calculateEffort", null);

  __decorate$4([calculate('startDate')], HasSchedulingModeMixin.prototype, "calculateStartDate", null);

  __decorate$4([calculate('endDate')], HasSchedulingModeMixin.prototype, "calculateEndDate", null);

  return HasSchedulingModeMixin;
}) {}

var __decorate$3 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * This mixin adds support for scheduling event ALAP, by dependencies. All it does is
 * create the "late" constraint interval for every outgoing dependency.
 *
 * See [[ConstrainedEarlyEventMixin]] for more details about constraint-based scheduling.
 * See also [[ScheduledByDependenciesEarlyEventMixin]].
 */

class ScheduledByDependenciesLateEventMixin extends Mixin([ScheduledByDependenciesEarlyEventMixin, ConstrainedLateEventMixin], base => {
  const superProto = base.prototype;

  class ScheduledByDependenciesLateEventMixin extends base {
    *shouldSuccessorAffectScheduling(dependency) {
      const toEvent = yield dependency.$.toEvent; // ignore missing target events and inactive dependencies

      return toEvent && !isAtomicValue(toEvent) && (yield dependency.$.active) // and inactive target events (unless this event is also inactive)
      && (!(yield toEvent.$.inactive) || (yield this.$.inactive));
    }

    *calculateLateStartDateConstraintIntervals() {
      const intervals = yield* superProto.calculateLateStartDateConstraintIntervals.call(this);
      const project = this.getProject();
      const dependencyConstraintIntervalClass = project.dependencyConstraintIntervalClass;
      let dependency;

      for (dependency of yield this.$.outgoingDeps) {
        // ignore missing target events and inactive dependencies
        if (!(yield* this.shouldSuccessorAffectScheduling(dependency))) continue;
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
                endDate: calendar.calculateStartDate(successorStartDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond))
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
                endDate: calendar.calculateStartDate(successorEndDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond))
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

      for (dependency of yield this.$.outgoingDeps) {
        // ignore missing target events and inactive dependencies
        if (!(yield* this.shouldSuccessorAffectScheduling(dependency))) continue;
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
                endDate: calendar.calculateStartDate(successorEndDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond))
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
                endDate: calendar.calculateStartDate(successorStartDate, yield* project.$convertDuration(lag, lagUnit, TimeUnit.Millisecond))
              });
            }

            break;
        }

        interval && intervals.unshift(interval);
      }

      return intervals;
    }

  }

  __decorate$3([calculate('lateStartDateIntervals')], ScheduledByDependenciesLateEventMixin.prototype, "calculateLateStartDateConstraintIntervals", null);

  return ScheduledByDependenciesLateEventMixin;
}) {}

const fixedDurationSEDWUGraphDescription = CycleDescription.new({
  variables: new Set([StartDateVar, EndDateVar, DurationVar, EffortVar, UnitsVar]),
  formulas: new Set([startDateFormula, endDateFormula, durationFormula, unitsFormula, effortFormula])
}); //---------------------------------------------------------------------------------------------------------------------

const fixedDurationSEDWUForwardNonEffortDriven = CycleResolution.new({
  description: fixedDurationSEDWUGraphDescription,
  defaultResolutionFormulas: new Set([endDateFormula, effortFormula])
});
const fixedDurationSEDWUForwardEffortDriven = CycleResolution.new({
  description: fixedDurationSEDWUGraphDescription,
  defaultResolutionFormulas: new Set([endDateFormula, unitsFormula])
});
const fixedDurationSEDWUBackwardNonEffortDriven = CycleResolution.new({
  description: fixedDurationSEDWUGraphDescription,
  defaultResolutionFormulas: new Set([startDateFormula, effortFormula])
});
const fixedDurationSEDWUBackwardEffortDriven = CycleResolution.new({
  description: fixedDurationSEDWUGraphDescription,
  defaultResolutionFormulas: new Set([startDateFormula, unitsFormula])
});

/**
 * This mixin provides the fixed duration scheduling mode facility. The scheduling mode is controlled with the
 * [[HasSchedulingModeMixin.schedulingMode]] field.
 *
 * See [[HasSchedulingModeMixin]] for more details.
 *
 * In this mode, the duration of the task remains "fixed" as the name suggest. It is changed only if there's no other options,
 * for example if both "effort" and "units" has changed. In other cases, some other variable is updated.
 *
 * If the [[HasSchedulingModeMixin.effortDriven]] flag is enabled, effort variable becomes "fixed" as well, so normally the "units"
 * variable will change. If that flag is disabled, then "effort" will be changed.
 */

class FixedDurationMixin extends Mixin([HasSchedulingModeMixin], base => {
  const superProto = base.prototype;

  class FixedDurationMixin extends base {
    *prepareDispatcher(YIELD) {
      const schedulingMode = yield* this.effectiveSchedulingMode();

      if (schedulingMode === SchedulingMode.FixedDuration) {
        const cycleDispatcher = yield* superProto.prepareDispatcher.call(this, YIELD);
        const effortDriven = yield this.$.effortDriven;
        if (effortDriven) cycleDispatcher.addKeepIfPossibleFlag(EffortVar);

        if (yield HasProposedValue(this.$.assigned)) {
          // for effort driven case, we treat adding/removing of assignments as changing effort
          // instead of units (this will trigger both, but units formula will win in presence of effort change)
          if (effortDriven) {
            cycleDispatcher.addProposedValueFlag(EffortVar);
          } else {
            cycleDispatcher.addProposedValueFlag(UnitsVar);
          }
        }

        return cycleDispatcher;
      } else {
        return yield* superProto.prepareDispatcher.call(this, YIELD);
      }
    }

    cycleResolutionContext(Y) {
      const schedulingMode = this.effectiveSchedulingModeSync(Y);

      if (schedulingMode === SchedulingMode.FixedDuration) {
        const direction = Y(this.$.direction);
        const effortDriven = Y(this.$.effortDriven);

        if (direction === Direction.Forward || direction === Direction.None) {
          return effortDriven ? fixedDurationSEDWUForwardEffortDriven : fixedDurationSEDWUForwardNonEffortDriven;
        } else {
          return effortDriven ? fixedDurationSEDWUBackwardEffortDriven : fixedDurationSEDWUBackwardNonEffortDriven;
        }
      } else {
        return superProto.cycleResolutionContext.call(this, Y);
      }
    }

    *getBaseOptionsForDurationCalculations() {
      const schedulingMode = yield* this.effectiveSchedulingMode();

      if (schedulingMode === SchedulingMode.FixedDuration) {
        return {
          ignoreResourceCalendars: true
        };
      } else {
        return yield* superProto.getBaseOptionsForDurationCalculations.call(this);
      }
    }

  }

  return FixedDurationMixin;
}) {}

const fixedEffortSEDWUGraphDescription = CycleDescription.new({
  variables: new Set([StartDateVar, EndDateVar, DurationVar, EffortVar, UnitsVar]),
  formulas: new Set([// the order of formulas is important here - the earlier ones are preferred
  endDateByEffortFormula, durationFormula, unitsFormula, effortFormula, startDateByEffortFormula, startDateFormula, endDateFormula])
}); //---------------------------------------------------------------------------------------------------------------------

const fixedEffortSEDWUForward = CycleResolution.new({
  description: fixedEffortSEDWUGraphDescription,
  defaultResolutionFormulas: new Set([endDateByEffortFormula, durationFormula])
});
const fixedEffortSEDWUBackward = CycleResolution.new({
  description: fixedEffortSEDWUGraphDescription,
  defaultResolutionFormulas: new Set([startDateByEffortFormula, durationFormula])
});

/**
 * This mixin provides the fixed effort scheduling mode facility. The scheduling mode is controlled with the
 * [[HasSchedulingModeMixin.schedulingMode]] field.
 *
 * See [[HasSchedulingModeMixin]] for more details.
 *
 * In this mode, the effort of the task remains "fixed" as the name suggest. It is changed only if there's no other options,
 * for example if both "duration" and "units" has changed. In other cases, some other variable is updated.
 */

class FixedEffortMixin extends Mixin([HasSchedulingModeMixin], base => {
  const superProto = base.prototype;

  class FixedEffortMixin extends base {
    *prepareDispatcher(YIELD) {
      const schedulingMode = yield* this.effectiveSchedulingMode();

      if (schedulingMode === SchedulingMode.FixedEffort) {
        const cycleDispatcher = yield* superProto.prepareDispatcher.call(this, YIELD);
        if (yield HasProposedValue(this.$.assigned)) cycleDispatcher.addProposedValueFlag(UnitsVar);
        cycleDispatcher.addKeepIfPossibleFlag(EffortVar);
        return cycleDispatcher;
      } else {
        return yield* superProto.prepareDispatcher.call(this, YIELD);
      }
    }

    cycleResolutionContext(Y) {
      const schedulingMode = this.effectiveSchedulingModeSync(Y);

      if (schedulingMode === SchedulingMode.FixedEffort) {
        const direction = Y(this.$.direction);
        return direction === Direction.Forward || direction === Direction.None ? fixedEffortSEDWUForward : fixedEffortSEDWUBackward;
      } else {
        return superProto.cycleResolutionContext.call(this, Y);
      }
    }

  }

  return FixedEffortMixin;
}) {}

const fixedUnitsSEDWUGraphDescription = CycleDescription.new({
  variables: new Set([StartDateVar, EndDateVar, DurationVar, EffortVar, UnitsVar]),
  formulas: new Set([// the order of formulas is important here - the earlier ones are preferred
  endDateByEffortFormula, durationFormula, effortFormula, unitsFormula, startDateByEffortFormula, startDateFormula, endDateFormula])
}); //---------------------------------------------------------------------------------------------------------------------

const fixedUnitsSEDWUForwardNonEffortDriven = CycleResolution.new({
  description: fixedUnitsSEDWUGraphDescription,
  defaultResolutionFormulas: new Set([endDateByEffortFormula, endDateFormula, effortFormula])
});
const fixedUnitsSEDWUForwardEffortDriven = CycleResolution.new({
  description: fixedUnitsSEDWUGraphDescription,
  defaultResolutionFormulas: new Set([endDateByEffortFormula, endDateFormula, durationFormula])
});
const fixedUnitsSEDWUBackwardNonEffortDriven = CycleResolution.new({
  description: fixedUnitsSEDWUGraphDescription,
  defaultResolutionFormulas: new Set([startDateByEffortFormula, startDateFormula, effortFormula])
});
const fixedUnitsSEDWUBackwardEffortDriven = CycleResolution.new({
  description: fixedUnitsSEDWUGraphDescription,
  defaultResolutionFormulas: new Set([startDateByEffortFormula, startDateFormula, durationFormula])
});

/**
 * This mixin provides the fixed units scheduling mode facility. The scheduling mode is controlled with the
 * [[HasSchedulingModeMixin.schedulingMode]] field.
 *
 * See [[HasSchedulingModeMixin]] for more details.
 *
 * In this mode, the assignment units of the task's assignments remains "fixed" as the name suggest.
 * Those are changed only if there's no other options, for example if both "duration" and "effort" has changed.
 *
 * If the [[HasSchedulingModeMixin.effortDriven]] flag is enabled, effort variable becomes "fixed" as well, so normally the "duration"
 * variable will change. If that flag is disabled, then "effort" will be changed.
 */

class FixedUnitsMixin extends Mixin([HasSchedulingModeMixin], base => {
  const superProto = base.prototype;

  class FixedUnitsMixin extends base {
    *prepareDispatcher(YIELD) {
      const schedulingMode = yield* this.effectiveSchedulingMode();

      if (schedulingMode === SchedulingMode.FixedUnits) {
        const cycleDispatcher = yield* superProto.prepareDispatcher.call(this, YIELD);
        if (yield HasProposedValue(this.$.assigned)) cycleDispatcher.addProposedValueFlag(UnitsVar);
        if (yield this.$.effortDriven) cycleDispatcher.addKeepIfPossibleFlag(EffortVar);
        cycleDispatcher.addKeepIfPossibleFlag(UnitsVar);
        return cycleDispatcher;
      } else {
        return yield* superProto.prepareDispatcher.call(this, YIELD);
      }
    }

    cycleResolutionContext(Y) {
      const schedulingMode = this.effectiveSchedulingModeSync(Y);

      if (schedulingMode === SchedulingMode.FixedUnits) {
        const direction = Y(this.$.direction);
        const effortDriven = Y(this.$.effortDriven);

        if (direction === Direction.Forward || direction === Direction.None) {
          return effortDriven ? fixedUnitsSEDWUForwardEffortDriven : fixedUnitsSEDWUForwardNonEffortDriven;
        } else {
          return effortDriven ? fixedUnitsSEDWUBackwardEffortDriven : fixedUnitsSEDWUBackwardNonEffortDriven;
        }
      } else {
        return superProto.cycleResolutionContext.call(this, Y);
      }
    }

  }

  return FixedUnitsMixin;
}) {}

var __decorate$2 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class InactiveEventMixin extends Mixin([ScheduledByDependenciesLateEventMixin], base => {
  base.prototype;

  class InactiveEventMixin extends base {
    writeInactive(me, transaction, quark, inactive) {
      var _this$stm;

      const isLoading = !transaction.baseRevision.hasIdentifier(me);
      me.constructor.prototype.write.call(this, me, transaction, quark, inactive); // @ts-ignore
      // Apply parent inactive state to children unless we are loading data or undoing/redoing some changes
      // in such cases both parent and children data are supposed to be provided

      if (!isLoading && this.children && !((_this$stm = this.stm) !== null && _this$stm !== void 0 && _this$stm.state.isRestoringStateClass)) {
        for (const child of this.children) {
          child.inactive = inactive;
        }
      }
    }

    *calculateInactive() {
      const inactive = yield ProposedOrPrevious; // A summary task is active if it has at least one active sub-event

      if (yield* this.hasSubEvents()) {
        const subEvents = yield* this.subEventsIterable();
        let activeCnt = 0;

        for (const subEvent of subEvents) {
          // calculate active sub-events count
          if (!(yield subEvent.$.inactive)) activeCnt++;
        } // inactive if it has no active sub-events

        return !activeCnt;
      }

      return inactive;
    }

    *shouldRollupChildEffort(child) {
      return !(yield child.$.inactive) || (yield this.$.inactive);
    }

    *shouldRollupChildPercentDoneSummaryData(child) {
      return !(yield child.$.inactive) || (yield this.$.inactive);
    }

    *shouldRollupChildStartDate(child) {
      // Do not take into account inactive children dates when calculating
      // their parent start/end dates (unless the parent is also inactive)
      return !(yield child.$.inactive) || (yield this.$.inactive);
    }

    *shouldRollupChildEndDate(child) {
      // Do not take into account inactive children dates when calculating
      // their parent start/end dates (unless the parent is also inactive)
      return !(yield child.$.inactive) || (yield this.$.inactive);
    }

    *shouldRollupChildEarlyStartDate(childEvent) {
      // Do not take into account inactive children dates when calculating
      // their parent start end dates (unless the parent is also inactive)
      return !(yield childEvent.$.inactive) || (yield this.$.inactive);
    }

    *shouldRollupChildEarlyEndDate(childEvent) {
      // Do not take into account inactive children dates when calculating
      // their parent start end dates (unless the parent is also inactive)
      return !(yield childEvent.$.inactive) || (yield this.$.inactive);
    }

    *shouldRollupChildLateStartDate(childEvent) {
      // Do not take into account inactive children dates when calculating
      // their parent start end dates (unless the parent is also inactive)
      return !(yield childEvent.$.inactive) || (yield this.$.inactive);
    }

    *shouldRollupChildLateEndDate(childEvent) {
      // Do not take into account inactive children dates when calculating
      // their parent start end dates (unless the parent is also inactive)
      return !(yield childEvent.$.inactive) || (yield this.$.inactive);
    }

  }

  __decorate$2([write('inactive')], InactiveEventMixin.prototype, "writeInactive", null);

  __decorate$2([calculate('inactive')], InactiveEventMixin.prototype, "calculateInactive", null);

  return InactiveEventMixin;
}) {}

/**
 * This is an event class, [[GanttProjectMixin]] is working with.
 * It is constructed as [[SchedulerProEvent]], enhanced with extra functionality.
 */

class GanttEvent extends MixinAny([SchedulerProEvent, ConstrainedByParentMixin, ConstrainedLateEventMixin, ScheduledByDependenciesLateEventMixin, GanttHasAssignmentsMixin, HasEffortMixin, HasSchedulingModeMixin, FixedDurationMixin, FixedEffortMixin, FixedUnitsMixin, InactiveEventMixin], base => {
  base.prototype;

  class GanttEvent extends base {}

  return GanttEvent;
}) {}

var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * This is a mixin, adding critical path calculation to the event node.
 *
 * Scheduling-wise it adds *criticalPaths* field to an entity mixing it.
 *
 * For more details on the _critical path method_ please check this article: https://en.wikipedia.org/wiki/Critical_path_method
 */

class HasCriticalPathsMixin extends Mixin([HasChildrenMixin], base => {
  base.prototype;

  class HasCriticalPathsMixin extends base {
    *calculateCriticalPaths() {
      const paths = [],
            pathsToProcess = [],
            events = yield this.$.childEvents,
            eventsToProcess = [...events],
            projectEndDate = yield this.$.endDate; // First collect events we'll start collecting paths from.
      // We need to start from critical events w/o incoming dependencies

      let event;

      while (event = eventsToProcess.shift()) {
        const childEvents = yield event.$.childEvents,
              eventIsCritical = yield event.$.critical,
              eventIsActive = !(yield event.$.inactive),
              eventEndDate = yield event.$.endDate; // register a new path finishing at the event

        if (eventIsActive && eventEndDate && eventEndDate.getTime() - projectEndDate.getTime() === 0 && eventIsCritical) {
          pathsToProcess.push([{
            event
          }]);
        }

        eventsToProcess.push(...childEvents);
      }

      let path; // fetch paths one by one and process

      while (path = pathsToProcess.shift()) {
        let taskIndex = path.length - 1,
            node; // get the path last event

        while (node = path[taskIndex]) {
          const criticalPredecessorNodes = []; // collect critical successors

          for (const dependency of yield node.event.$.incomingDeps) {
            const event = yield dependency.$.fromEvent; // if we found a critical predecessor

            if (event && (yield dependency.$.active) && !(yield event.$.inactive) && (yield event.$.critical)) {
              criticalPredecessorNodes.push({
                event,
                dependency
              });
            }
          } // if critical predecessor(s) found

          if (criticalPredecessorNodes.length) {
            // make a copy of the path leading part
            const pathCopy = path.slice(); // append the found predecessor to the path

            path.push(criticalPredecessorNodes[0]); // if we found more than one predecessor we start new path as: leading path + predecessor

            for (let i = 1; i < criticalPredecessorNodes.length; i++) {
              pathsToProcess.push(pathCopy.concat(criticalPredecessorNodes[i]));
            } // increment counter to process the predecessor we've appended to the path

            taskIndex++;
          } else {
            // no predecessors -> stop the loop
            taskIndex = -1;
          }
        } // we collected the path backwards so let's reverse it

        paths.push(path.reverse());
      }

      return paths;
    }

  }

  __decorate$1([field({
    lazy: true
  })], HasCriticalPathsMixin.prototype, "criticalPaths", void 0);

  __decorate$1([calculate('criticalPaths')], HasCriticalPathsMixin.prototype, "calculateCriticalPaths", null);

  return HasCriticalPathsMixin;
}) {}

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

/**
 * Gantt project mixin type. At this level, events are called "tasks". All scheduling features from the [[SchedulerProProjectMixin]]
 * are preserved. Additionally, tasks inherit constraints from parent tasks. Tasks also receives the [[HasEffortMixin.effort|effort]] field
 * and [[HasSchedulingModeMixin.schedulingMode|schedulingMode]] field.
 *
 * The base event class for this level is [[GanttEvent]]. The base assignment class is [[GanttAssignmentMixin]].
 *
 * At this level, project can be scheduled in backward direction. This is controlled with the [[direction]] field.
 *
 * * Forward ASAP scheduling
 *
 * This is a default, most-used mode. In this mode, the "base" date is project start date. If it is not provided,
 * it is calculated as the earliest date of all project tasks. Events are scheduled ASAP, based on the "early" constraints
 * (plus "generic" constraints).
 *
 * * Forward ALAP scheduling
 *
 * In this mode, the "base" date is still project start date. If it is not provided,
 * it is calculated as the earliest date of all project tasks.
 *
 * Events are first scheduled ASAP, based on the "early" constraints. This gives the project end date.
 * Now events are scheduled ALAP, using the project end date as the base.
 *
 * The difference between the task position in Forward ASAP and Forward ALAP scheduling is called [[ConstrainedLateEventMixin.totalSlack|"slack"]]
 *
 * * Backward ALAP scheduling
 *
 * This is a "default" backward scheduling. In this mode, the "base" date is project end date. If it is not provided,
 * it is calculated as the latest date of all project tasks. Events are scheduled ALAP, based on the "late" constraints
 * (plus "generic" constraints).
 *
 * * Backward ASAP scheduling
 *
 * In this mode, the "base" date is still project end date. If it is not provided,
 * it is calculated as the latest date of all project tasks.
 *
 * Events are first scheduled ALAP, based on the "late" constraints. This gives the project start date.
 * Now events are scheduled ASAP, using the project start date as the base.
 *
 */

class GanttProjectMixin extends Mixin([SchedulerProProjectMixin, HasEffortMixin, ConstrainedLateEventMixin, HasCriticalPathsMixin], base => {
  const superProto = base.prototype;

  class GanttProjectMixin extends base {
    constructor() {
      super(...arguments); // this atom is recalculated in every transaction (it is "self dependent")
      // this happens because it is always calculated to the value which is different from
      // proposed value
      // this is a "source of changes" which we use for `project.startDate/endDate` in case
      // scanning the children returned `null`
      // so it will cause the `project.startDate` to always recalculate until it obtain some value

      this.nonEqual = false;
    }

    *calculateNonEqual() {
      return !(yield ProposedOrPrevious);
    }

    get isGanttProjectMixin() {
      return true;
    }

    afterConfigure() {
      superProto.afterConfigure.apply(this, arguments);
      this.projectConstraintIntervalClass = this.projectConstraintIntervalClass || ProjectConstraintInterval;
    } // TODO
    // SchedulerBasicProjectMixin overrides HasChildrenMixin hasSubEvents and subEventsIterable methods
    // so we define the methods here to fix that
    // https://github.com/canonic-epicure/typescript-mixin-class/issues/1

    *hasSubEvents() {
      const childEvents = yield this.$.childEvents;
      return childEvents.size > 0;
    }

    *subEventsIterable() {
      return yield this.$.childEvents;
    }

    *calculateDirection() {
      return yield ProposedOrPrevious;
    }

    *calculateStartDate() {
      const direction = yield this.$.direction;

      if (direction === Direction.Forward) {
        let result = yield ProposedOrPrevious;

        if (!result) {
          result = yield* this.unsafeCalculateInitialMinChildrenStartDateDeep();
          if (!result) yield this.$.nonEqual;
        }

        return result;
      } else if (direction === Direction.Backward) {
        const startDate = yield* this.calculateMinChildrenStartDate();
        const endDate = yield this.$.endDate; // Calculated startDate can get after the project endDate
        // (in case its built based on a manually scheduled task that start after the project finishes).
        // We set the project startDate to its endDate value then.

        return startDate && endDate > startDate ? startDate : endDate;
      }
    }

    *calculateEndDate() {
      const direction = yield this.$.direction;

      if (direction === Direction.Forward) {
        const startDate = yield this.$.startDate;
        const endDate = yield* this.calculateMaxChildrenEndDate(); // Calculated endDate can be before the project startDate
        // (in case its built based on a manually scheduled task that finishes before the project starts).
        // Then it leads to an infinite cycle because of these BaseEventMixin.calculateDurationPure lines:
        //      if (startDate > endDate) {
        //          yield Write(this.$.duration, 0, null)
        //      }
        // So we simply check if the project endDate got earlier than its start date
        // and set endDate to startDate value then.
        // This case is reported in: https://github.com/bryntum/support/issues/3127
        // and asserted by: 031_manually_scheduled.t.ts

        return endDate && endDate > startDate ? endDate : startDate;
      } else if (direction === Direction.Backward) {
        let result = yield ProposedOrPrevious;

        if (!result) {
          result = yield* this.unsafeCalculateInitialMaxChildrenEndDateDeep();
          if (!result) yield this.$.nonEqual;
        }

        return result;
      }
    }

    *shouldRollupChildStartDate(child) {
      // Do not take into account inactive children dates when calculating start date
      return !(yield child.$.inactive);
    }

    *shouldRollupChildEndDate(child) {
      // Do not take into account inactive children dates when calculating start date
      return !(yield child.$.inactive);
    }

    *calculateEarlyStartDateConstraintIntervals() {
      const intervals = yield* superProto.calculateEarlyStartDateConstraintIntervals.call(this);
      const direction = yield this.$.direction;

      if (direction === Direction.Forward) {
        const startDate = yield this.$.startDate;
        startDate && intervals.push(this.projectConstraintIntervalClass.new({
          owner: this,
          side: ConstraintIntervalSide.Start,
          startDate
        }));
      } else if (direction === Direction.Backward) {
        const startDate = yield this.$.lateStartDate;
        startDate && intervals.push(this.projectConstraintIntervalClass.new({
          owner: this,
          side: ConstraintIntervalSide.Start,
          startDate
        }));
      }

      return intervals;
    }

    *calculateLateEndDateConstraintIntervals() {
      const intervals = yield* superProto.calculateLateEndDateConstraintIntervals.call(this);
      const direction = yield this.$.direction;

      if (direction === Direction.Forward) {
        const endDate = yield this.$.earlyEndDate;
        endDate && intervals.push(this.projectConstraintIntervalClass.new({
          owner: this,
          side: ConstraintIntervalSide.End,
          endDate
        }));
      } else if (direction === Direction.Backward) {
        const endDate = yield this.$.endDate;
        endDate && intervals.push(this.projectConstraintIntervalClass.new({
          owner: this,
          side: ConstraintIntervalSide.End,
          endDate
        }));
      }

      return intervals;
    }

    getDefaultEventModelClass() {
      return GanttEvent;
    }

    getDefaultAssignmentModelClass() {
      return GanttAssignmentMixin;
    }

    getDefaultResourceModelClass() {
      return SchedulerProResourceMixin;
    }

    getDefaultEventStoreClass() {
      return ChronoEventTreeStoreMixin;
    }

    getType() {
      return ProjectType.Gantt;
    } // this method is only used to calculated "initial" project start date only

    *unsafeCalculateInitialMinChildrenStartDateDeep() {
      const childEvents = yield this.$.childEvents; // note, that we does not yield here, as we want to calculate "initial" project start date
      // which will be used only if there's no user input or explicit setting for it
      // such project date should be calculated as earliest date of all tasks, based on the
      // "initial" data (which includes proposed)

      if (!childEvents.size) return yield UnsafeProposedOrPreviousValueOf(this.$.startDate);
      let result = MAX_DATE,
          child;
      const toProcess = [...childEvents];

      while (child = toProcess.shift()) {
        let childDate = yield UnsafeProposedOrPreviousValueOf(child.$.startDate); // in case a task has no start date but has end date provided - use that value

        if (!childDate) {
          childDate = yield UnsafeProposedOrPreviousValueOf(child.$.endDate);
        }

        if (childDate && childDate < result) result = childDate;
        toProcess.push(...(yield child.$.childEvents));
      }

      return result.getTime() !== MIN_DATE$1.getTime() && result.getTime() !== MAX_DATE.getTime() ? result : null;
    }

    *unsafeCalculateInitialMaxChildrenEndDateDeep() {
      const childEvents = yield this.$.childEvents; // note, that we use "unsafe" ProposedOrPrevious effect here, because we only get into this method
      // if there's no user input for the project end date

      if (!childEvents.size) return yield UnsafeProposedOrPreviousValueOf(this.$.endDate);
      let result = MIN_DATE$1,
          child;
      const toProcess = [...childEvents];

      while (child = toProcess.shift()) {
        let childDate = yield UnsafeProposedOrPreviousValueOf(child.$.endDate); // in case a task has no end date but has start date provided - use that value

        if (!childDate) {
          childDate = yield UnsafeProposedOrPreviousValueOf(child.$.startDate);
        }

        if (childDate && childDate > result) result = childDate;
        toProcess.push(...(yield child.$.childEvents));
      }

      return result.getTime() !== MIN_DATE$1.getTime() && result.getTime() !== MAX_DATE.getTime() ? result : null;
    }

    getDependencyCycleDetectionIdentifiers(fromEvent, toEvent) {
      return [// @ts-ignore
      toEvent.$.earlyStartDateConstraintIntervals, // @ts-ignore
      toEvent.$.earlyEndDateConstraintIntervals, // @ts-ignore
      toEvent.$.lateEndDateConstraintIntervals, // @ts-ignore
      toEvent.$.lateStartDateConstraintIntervals];
    }

  }

  __decorate([field({
    equality: () => false
  })], GanttProjectMixin.prototype, "nonEqual", void 0);

  __decorate([calculate('nonEqual')], GanttProjectMixin.prototype, "calculateNonEqual", null);

  return GanttProjectMixin;
}) {}
/**
 * Class providing a [[ProjectConstraintInterval]] instance description.
 */

class ProjectConstraintIntervalDescription extends ConstraintIntervalDescription {
  static get $name() {
    return 'ProjectConstraintIntervalDescription';
  }

  static getDescription(interval) {
    return format(interval.startDate ? this.L('L{startDateDescriptionTpl}') : this.L('L{endDateDescriptionTpl}'), ...this.getDescriptionParameters(interval));
  }

}
/**
 * Class implementing constraining interval applied by a project.
 * A forward scheduled project implicitly restricts tasks to start not early than the project start date
 * and a backward scheduled project restricts tasks to finish not later than the project end date.
 */

class ProjectConstraintInterval extends ConstraintInterval {
  isAffectedByTransaction(transaction) {
    const project = this.owner;
    transaction = transaction || project.graph.activeTransaction;
    const dateQuark = transaction.entries.get(this.startDate ? project.$.startDate : project.$.endDate); // modified project start (end for BW projects) date

    return dateQuark && !dateQuark.isShadow();
  }

}

__decorate([prototypeValue(ProjectConstraintIntervalDescription)], ProjectConstraintInterval.prototype, "descriptionBuilderClass", void 0);

/**
 * @module Gantt/column/AddNewColumn
 */

/**
 * This column allows user to dynamically add columns to the Gantt chart by clicking the column header
 * and picking columns from a combobox.
 *
 * ## Adding a custom column to the combobox
 *
 * In order to appear in the column combobox list a column class have to fulfill these conditions:
 *
 * 1. the class should have a static property `type` with unique string value that will identify the column.
 * 2. the class should be registered with the call to {@link Grid/data/ColumnStore#function-registerColumnType-static ColumnStore.registerColumnType}.
 * 3. the class should have a static property `isGanttColumn` with truthy value.
 * 4. the class should have a static `text` property with column name.
 *
 * For example:
 *
 * ```javascript
 * import ColumnStore from 'gantt-distr/lib/Grid/data/ColumnStore.js';
 * import Column from 'gantt-distr/lib/Grid/column/Column.js';
 *
 * // New column class to display task priority
 * export default class TaskPriorityColumn extends Column {
 *     // unique alias of the column
 *     static get type() {
 *         return 'priority';
 *     }
 *
 *     // indicates that the column should be present in "Add New..." column
 *     static get isGanttColumn() {
 *         return true;
 *     }
 *
 *     static get defaults() {
 *         return {
 *             // the column is mapped to "priority" field of the Task model
 *             field : 'priority',
 *             // the column title
 *             text  : 'Priority'
 *         };
 *     }
 * }
 *
 * // register new column
 * ColumnStore.registerColumnType(TaskPriorityColumn);
 * ```
 *
 * @extends Grid/column/Column
 * @classType addnew
 */

class AddNewColumn extends Column {
  static get $name() {
    return 'AddNewColumn';
  }

  static get type() {
    return 'addnew';
  }

  static get defaults() {
    return {
      text: 'L{New Column}',
      cls: 'b-new-column-column',
      draggable: false,
      sortable: false,
      exportable: false,
      field: null,
      editor: null
    };
  }

  doDestroy() {
    var _this$_combo;

    (_this$_combo = this._combo) === null || _this$_combo === void 0 ? void 0 : _this$_combo.destroy();
    super.doDestroy();
  }
  /**
   * Returns the combo box field rendered into the header of this column
   * @property {Core.widget.Combo}
   * @readonly
   */

  get combo() {
    const me = this,
          columns = me.grid.columns;
    return me._combo || (me._combo = new Combo({
      owner: me.grid,
      cls: 'b-new-column-combo',
      placeholder: me.L('L{New Column}'),
      triggers: false,
      autoExpand: true,
      store: me.ganttColumnStore,
      displayField: 'text',
      monitorResize: false,
      picker: {
        align: {
          align: 't0-b0',
          axisLock: true
        },
        minWidth: 200,

        onItem({
          record: columnRecord
        }) {
          const newColumn = new columnRecord.value({
            region: me.region
          }, columns); // Insert the new column before the "New Column" column
          // then focus it to ensure it is in view.

          columns.insert(columns.indexOf(me), newColumn);
          newColumn.element.focus();
        },

        // Column elements are rerendered, so the forElement must be kept up to date
        onBeforeShow() {
          this.forElement = me.element;
        }

      },

      syncInputFieldValue() {
        this.input.value = '';
      },

      listeners: {
        // Keystrokes must not leak up to the Grid where its Navigator will react
        keydown({
          event
        }) {
          event.stopImmediatePropagation();
        }

      }
    }));
  }

  get ganttColumnStore() {
    // Create a store containing the Gantt column classes.
    // A filter ensures that column types which are already
    // present in the grid are not shown.
    return new Store({
      data: Object.values(ColumnStore.columnTypes).reduce((result, col) => {
        // We must ensure that the defaultValues property is calculated
        // so that we can detect a text property.
        if (!col.$meta.fields.exposedData) {
          col.exposeProperties({});
        } // To be included, a column must have a static isGanttColumn
        // property which yields a truthy value, and a text value.

        if (col.isGanttColumn && col.text) {
          result.push({
            id: col.type,
            text: col.optionalL(col.text),
            value: col
          });
        }

        return result;
      }, []),
      filters: [// A colRecord is only filtered in if the grid columns do not contain an instance.
      colRecord => !this.grid.columns.some(gridCol => gridCol.constructor === colRecord.value)],
      sorters: [{
        field: 'text'
      }]
    });
  }

  headerRenderer({
    column,
    headerElement
  }) {
    column.combo.render(headerElement);
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.combo.focus();
    }
  }

  updateLocalization() {
    // reset cached combo to rebuild options store w/ new translated column names
    if (this._combo) {
      this._combo.destroy();

      this._combo = null;
    }

    super.updateLocalization();
  }

}
ColumnStore.registerColumnType(AddNewColumn);
AddNewColumn._$name = 'AddNewColumn';

/**
 * @module Gantt/widget/CalendarPicker
 */

/**
 * Combo box preconfigured with possible calendar values.
 *
 * This field can be used as an editor for the {@link Grid.column.Column Column}.
 * It is used as the default editor for the {@link Gantt.column.CalendarColumn CalendarColumn}.
 * Note: This picker doesn't support {@link Core/widget/Combo#config-multiSelect multiSelect}
 *
 * {@inlineexample Gantt/widget/CalendarPicker.js}
 * @extends Core/widget/Combo
 * @classType calendarpicker
 */

class CalendarPicker extends Combo {
  static get $name() {
    return 'CalendarPicker';
  } // Factoryable type name

  static get type() {
    return 'calendarpicker';
  }
  /**
   * Replaces the field store records with the provided ones.
   * @param {Gantt.model.CalendarModel[]} calendars New contents for the widget store.
   */

  refreshCalendars(calendars) {
    this.store.data = calendars.map(c => {
      return {
        id: c.id,
        text: c.name
      };
    });
  }

  get store() {
    if (!this._store) {
      this.store = new Store();
    }

    return this._store;
  }

  set store(store) {
    super.store = store;
  }

  get value() {
    return super.value;
  }

  set value(value) {
    if (value) {
      if (value.isDefault && value.isDefault()) {
        value = null;
      } else if (value.id) {
        value = value.id;
      }
    }

    super.value = value;
  }

} // Register this widget type with its Factory

CalendarPicker.initClass();
CalendarPicker._$name = 'CalendarPicker';

/**
 * @module Gantt/column/CalendarColumn
 */

/**
 * A column that displays (and allows user to update) the current {@link Gantt.model.CalendarModel calendar} of the task.
 *
 * Default editor is a {@link Gantt.widget.CalendarPicker CalendarPicker}.
 *
 * @extends Grid/column/Column
 * @classType calendar
 */

class CalendarColumn extends Column {
  static get $name() {
    return 'CalendarColumn';
  }

  static get type() {
    return 'calendar';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'calendar',
      text: 'L{Calendar}',
      editor: {
        type: CalendarPicker.type,
        clearable: true,
        allowInvalid: false
      }
    };
  }

  afterConstruct() {
    const me = this;
    super.afterConstruct();
    const project = me.grid.project; // Store default calendar to filter out this value

    me.defaultCalendar = project.defaultCalendar;
    me.refreshCalendars();
    project.calendarManagerStore.on({
      changePreCommit: me.refreshCalendars,
      refresh: me.refreshCalendars,
      thisObj: me
    });
  } // region Events

  refreshCalendars() {
    if (this.editor) {
      const project = this.grid.project;
      this.editor.refreshCalendars(project.calendarManagerStore.getRange());
    }
  } // endregion

  renderer({
    value
  }) {
    if (value !== this.defaultCalendar && (value === null || value === void 0 ? void 0 : value.id) != null) {
      var _model$name;

      const model = this.grid.project.calendarManagerStore.getById(value.id);
      return (_model$name = model === null || model === void 0 ? void 0 : model.name) !== null && _model$name !== void 0 ? _model$name : '';
    }

    return '';
  }

}
ColumnStore.registerColumnType(CalendarColumn);
CalendarColumn._$name = 'CalendarColumn';

/**
 * @module Gantt/column/GanttDateColumn
 */

/**
 * Base column class that displays dates, in the `ll` format by default. If set to `null` uses Gantt's {@link Scheduler.view.mixin.TimelineViewPresets#config-displayDateFormat date format} as a default.
 * The format will be dynamically updated while zooming according to the {@link Scheduler.preset.ViewPreset#field-displayDateFormat} value specified for the ViewPreset being selected.
 *
 * By default, this class hides the left/right arrows to modify the date incrementally, you can enable this with the {@link Grid.column.DateColumn#config-step} config
 * of the {@link #config-editor} config.
 *
 * Default editor is a {@link Core.widget.DateField DateField}.
 *
 * @extends Grid/column/DateColumn
 * @abstract
 */

class GanttDateColumn extends DateColumn {
  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      instantUpdate: true,
      width: 130,
      step: null,

      /**
       * The date format used to display dates in this column. If `format` is set to `null`,
       * the current value of the Gantt's {@link Scheduler.view.mixin.TimelineViewPresets#config-displayDateFormat} will be used to format the date value.
       * @config {String|null}
       * @category Common
       */
      format: 'll'
    };
  }

  construct(data, store) {
    const me = this;
    me.gantt = store.grid;
    super.construct(data, store); // If a format is specified, always stick to it

    if (me.format) {
      me.explicitFormat = true;
    } // Otherwise adapt to gantt's format when it changes
    else {
      me.gantt.on({
        displayDateFormatChange({
          format
        }) {
          if (!me.explicitFormat) {
            me.set('format', format);
          }
        }

      });
    }
  }

  set format(format) {
    this.explicitFormat = true;
    this.set('format', format);
  }

  get format() {
    return this.explicitFormat && this.data.format || this.gantt.displayDateFormat;
  } // * reactiveRenderer() {
  //     const { column : me, record } = this;
  //
  //     return me.formatValue(yield record.$[me.field]);
  // }

}
GanttDateColumn._$name = 'GanttDateColumn';

/**
 * @module Gantt/column/ConstraintDateColumn
 */

/**
 * A column showing the {@link Gantt/model/TaskModel#field-constraintDate date} of the constraint, applied to the task.
 * The type of the constraint can be displayed with the {@link Gantt/column/ConstraintTypeColumn}.
 *
 * Default editor is a {@link Core/widget/DateField}.
 *
 * If {@link #config-format} is omitted, Gantt's {@link Scheduler/view/mixin/TimelineViewPresets#config-displayDateFormat} will be used as a default value and
 * the format will be dynamically updated while zooming according to the {@link Scheduler/preset/ViewPreset#field-displayDateFormat} value specified for the ViewPreset being selected.
 *
 * @extends Gantt/column/GanttDateColumn
 * @classType constraintdate
 */

class ConstraintDateColumn extends GanttDateColumn {
  static get $name() {
    return 'ConstraintDateColumn';
  }

  static get type() {
    return 'constraintdate';
  }

  static get defaults() {
    return {
      field: 'constraintDate',
      text: 'L{Constraint Date}',
      width: 146
    };
  }

}
ColumnStore.registerColumnType(ConstraintDateColumn);
ConstraintDateColumn._$name = 'ConstraintDateColumn';

/**
 * @module Gantt/column/ConstraintTypeColumn
 */

/**
 * {@link Gantt/model/TaskModel#field-constraintType Constraint type} column.
 *
 * Default editor is a {@link SchedulerPro/widget/ConstraintTypePicker}.
 *
 * The constraint can be one of:
 *
 * - Must start on [date]
 * - Must finish on [date]
 * - Start no earlier than [date]
 * - Start no later than [date]
 * - Finish no earlier than [date]
 * - Finish no later than [date]
 *
 * The date of the constraint can be specified with the {@link Gantt/column/ConstraintDateColumn}
 *
 * @extends Grid/column/Column
 * @classType constrainttype
 */

class ConstraintTypeColumn extends Column {
  static get $name() {
    return 'ConstraintTypeColumn';
  }

  static get type() {
    return 'constrainttype';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'constraintType',
      text: 'L{Constraint Type}',
      width: 146,
      editor: {
        type: ConstraintTypePicker.type,
        clearable: true,
        allowInvalid: false
      },
      filterable: {
        filterField: {
          type: 'constrainttypepicker'
        }
      }
    };
  }

  afterConstruct() {
    const me = this;
    super.afterConstruct();
    me.grid.on({
      startCellEdit: me.onStartCellEdit,
      finishCellEdit: me.onDoneCellEdit,
      cancelCellEdit: me.onDoneCellEdit,
      thisObj: me
    }); // we need to trigger the column refresh **after** the editor locale change
    // to display properly translated constraint types

    FunctionHelper.createSequence(me.editor.updateLocalization, me.onEditorLocaleChange, me);
  }

  onStartCellEdit({
    editorContext: {
      editor,
      record
    }
  }) {
    if (editor.inputField instanceof ConstraintTypePicker) {
      /* eslint-disable quote-props */
      editor.inputField.store.addFilter({
        'id': 'isConstraintTypeApplicable',
        filterBy: r => record.run('isConstraintTypeApplicable', r.id)
      });
      /* eslint-enable quote-props */

      this._filterDetacher = () => editor.inputField.store.removeFilter('isConstraintTypeApplicable');
    }
  }

  onDoneCellEdit() {
    this._filterDetacher && this._filterDetacher();
  } // * reactiveRenderer() {
  //     const
  //         value = yield this.record.$.constraintType,
  //         model = this.column.editor.store.getById(value);
  //
  //     return model && model.text || '';
  //
  // }

  renderer({
    value
  }) {
    // id 'none' is the special "None" record, so render empty cell.
    const model = value != null && value !== 'none' && this.editor.store.getById(value);
    return model && model.text || '';
  } // Refreshes the column **after** the editor locale change
  // to display properly translated constraint types

  onEditorLocaleChange() {
    this.grid.refreshColumn(this);
  }

}
ColumnStore.registerColumnType(ConstraintTypeColumn);
ConstraintTypeColumn._$name = 'ConstraintTypeColumn';

/**
 * @module Gantt/column/DeadlineDateColumn
 */

/**
 * A column showing the {@link Gantt/model/TaskModel#field-deadlineDate} field.
 *
 * Default editor is a {@link Core/widget/DateField}.
 *
 * If {@link #config-format} is omitted, Gantt's {@link Scheduler/view/mixin/TimelineViewPresets#config-displayDateFormat}
 * will be used as a default value and the format will be dynamically updated while zooming according to the
 * {@link Scheduler/preset/ViewPreset#field-displayDateFormat} value specified for the ViewPreset being selected.
 *
 * @extends Gantt/column/GanttDateColumn
 * @classType deadlinedate
 */

class DeadlineDateColumn extends GanttDateColumn {
  static get $name() {
    return 'DeadlineDateColumn';
  }

  static get type() {
    return 'deadlinedate';
  }

  static get defaults() {
    return {
      field: 'deadlineDate',
      text: 'L{Deadline}',
      width: 146
    };
  }

}
ColumnStore.registerColumnType(DeadlineDateColumn);
DeadlineDateColumn._$name = 'DeadlineDateColumn';

/**
 * @module Gantt/column/EarlyEndDateColumn
 */

/**
 * A column that displays the task's {@link Gantt.model.TaskModel#field-earlyEndDate early end date}.
 *
 * Default editor is a {@link Core.widget.DateField DateField}.
 *
 * If {@link #config-format} is omitted, Gantt's {@link Scheduler.view.mixin.TimelineViewPresets#config-displayDateFormat} will be used as a default value and
 * the format will be dynamically updated while zooming according to the {@link Scheduler.preset.ViewPreset#field-displayDateFormat} value specified for the ViewPreset being selected.
 *
 * @extends Gantt/column/GanttDateColumn
 * @classType earlyenddate
 */

class EarlyEndDateColumn extends GanttDateColumn {
  static get $name() {
    return 'EarlyEndDateColumn';
  }

  static get type() {
    return 'earlyenddate';
  }

  static get defaults() {
    return {
      field: 'earlyEndDate',
      text: 'L{Early End}'
    };
  }

}
ColumnStore.registerColumnType(EarlyEndDateColumn);
EarlyEndDateColumn._$name = 'EarlyEndDateColumn';

/**
 * @module Gantt/column/EarlyStartDateColumn
 */

/**
 * A column that displays the task's {@link Gantt.model.TaskModel#field-earlyStartDate early start date}.
 *
 * Default editor is a {@link Core.widget.DateField DateField}.
 *
 * If {@link #config-format} is omitted, Gantt's {@link Scheduler.view.mixin.TimelineViewPresets#config-displayDateFormat} will be used as a default value and
 * the format will be dynamically updated while zooming according to the {@link Scheduler.preset.ViewPreset#field-displayDateFormat} value specified for the ViewPreset being selected.
 *
 * @extends Gantt/column/GanttDateColumn
 * @classType earlystartdate
 */

class EarlyStartDateColumn extends GanttDateColumn {
  static get $name() {
    return 'EarlyStartDateColumn';
  }

  static get type() {
    return 'earlystartdate';
  }

  static get defaults() {
    return {
      field: 'earlyStartDate',
      text: 'L{Early Start}'
    };
  }

}
ColumnStore.registerColumnType(EarlyStartDateColumn);
EarlyStartDateColumn._$name = 'EarlyStartDateColumn';

/**
 * @module Gantt/column/EffortColumn
 */

/**
 * A column showing the task {@link Gantt.model.TaskModel#field-effort effort} and {@link Gantt.model.TaskModel#field-effortUnit units}.
 * The editor of this column understands the time units, so user can enter "4d" indicating 4 days effort, or "4h" indicating 4 hours, etc.
 * The numeric magnitude can be either an integer or a float value. Both "," and "." are valid decimal separators.
 * For example, you can enter "4.5d" indicating 4.5 days duration, or "4,5h" indicating 4.5 hours.
 *
 * Default editor is a {@link Core.widget.DurationField DurationField}.
 *
 * @extends Scheduler/column/DurationColumn
 * @classType effort
 */

class EffortColumn extends DurationColumn {
  static get $name() {
    return 'EffortColumn';
  }

  static get type() {
    return 'effort';
  } //region Config

  static get defaults() {
    return {
      field: 'fullEffort',
      text: 'L{Effort}'
    };
  } //endregion

  get defaultEditor() {
    return {
      type: EffortField.type,
      name: this.field
    };
  }

}
ColumnStore.registerColumnType(EffortColumn);
EffortColumn._$name = 'EffortColumn';

/**
 * @module Gantt/column/EndDateColumn
 */

/**
 * A column that displays (and allows user to update) the task's {@link Gantt.model.TaskModel#field-endDate end date}.
 *
 * Default editor is a {@link SchedulerPro.widget.EndDateField EndDateField}.
 *
 * If {@link #config-format} is omitted, Gantt's {@link Scheduler.view.mixin.TimelineViewPresets#config-displayDateFormat} will be used as a default value and
 * the format will be dynamically updated while zooming according to the {@link Scheduler.preset.ViewPreset#field-displayDateFormat} value specified for the ViewPreset being selected.
 *
 * @extends Gantt/column/GanttDateColumn
 * @classType enddate
 */

class EndDateColumn extends GanttDateColumn {
  static get $name() {
    return 'EndDateColumn';
  }

  static get type() {
    return 'enddate';
  }

  static get defaults() {
    return {
      field: 'endDate',
      text: 'L{Finish}'
    };
  }

  get defaultEditor() {
    const editorCfg = super.defaultEditor;
    editorCfg.type = 'enddate';
    return editorCfg;
  }

}
ColumnStore.registerColumnType(EndDateColumn);
EndDateColumn._$name = 'EndDateColumn';

/**
 * @module Gantt/column/InactiveColumn
 */

/**
 * A column that displays (and allows user to update) the task's
 * {@link Gantt/model/TaskModel#field-inactive} field.
 *
 * This column uses a {@link Core/widget/Checkbox} as its editor, and it is not intended to be changed.
 *
 * @extends Grid/column/CheckColumn
 * @classType inactive
 */

class InactiveColumn extends CheckColumn {
  static get $name() {
    return 'InactiveColumn';
  }

  static get type() {
    return 'inactive';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'inactive',
      text: 'L{Inactive}'
    };
  }

}
ColumnStore.registerColumnType(InactiveColumn);
InactiveColumn._$name = 'InactiveColumn';

/**
 * @module Gantt/column/LateEndDateColumn
 */

/**
 * A column that displays the task's {@link Gantt.model.TaskModel#field-lateEndDate late end date}.
 *
 * Default editor is a {@link Core.widget.DateField DateField}.
 *
 * If {@link #config-format} is omitted, Gantt's {@link Scheduler.view.mixin.TimelineViewPresets#config-displayDateFormat} will be used as a default value and
 * the format will be dynamically updated while zooming according to the {@link Scheduler.preset.ViewPreset#field-displayDateFormat} value specified for the ViewPreset being selected.
 *
 * @extends Gantt/column/GanttDateColumn
 * @classType lateenddate
 */

class LateEndDateColumn extends GanttDateColumn {
  static get $name() {
    return 'LateEndDateColumn';
  }

  static get type() {
    return 'lateenddate';
  }

  static get defaults() {
    return {
      field: 'lateEndDate',
      text: 'L{Late End}'
    };
  }

}
ColumnStore.registerColumnType(LateEndDateColumn);
LateEndDateColumn._$name = 'LateEndDateColumn';

/**
 * @module Gantt/column/LateStartDateColumn
 */

/**
 * A column that displays the task's {@link Gantt.model.TaskModel#field-lateStartDate late start date}.
 *
 * Default editor is a {@link Core.widget.DateField DateField}.
 *
 * If {@link #config-format} is omitted, Gantt's {@link Scheduler.view.mixin.TimelineViewPresets#config-displayDateFormat} will be used as a default value and
 * the format will be dynamically updated while zooming according to the {@link Scheduler.preset.ViewPreset#field-displayDateFormat} value specified for the ViewPreset being selected.
 *
 * @extends Gantt/column/GanttDateColumn
 * @classType latestartdate
 */

class LateStartDateColumn extends GanttDateColumn {
  static get $name() {
    return 'LateStartDateColumn';
  }

  static get type() {
    return 'latestartdate';
  }

  static get defaults() {
    return {
      field: 'lateStartDate',
      text: 'L{Late Start}'
    };
  }

}
ColumnStore.registerColumnType(LateStartDateColumn);
LateStartDateColumn._$name = 'LateStartDateColumn';

/**
 * A column that displays (and allows user to update) the task's
 * {@link Gantt.model.TaskModel#field-manuallyScheduled manuallyScheduled} field.
 *
 * This column uses a {@link Core.widget.Checkbox checkbox} as its editor, and it is not intended to be changed.
 *
 * @extends Grid/column/CheckColumn
 * @classType manuallyscheduled
 */

class ManuallyScheduledColumn extends CheckColumn {
  static get $name() {
    return 'ManuallyScheduledColumn';
  }

  static get type() {
    return 'manuallyscheduled';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'manuallyScheduled',
      text: 'L{Manually scheduled}'
    };
  }

}
ColumnStore.registerColumnType(ManuallyScheduledColumn);
ManuallyScheduledColumn._$name = 'ManuallyScheduledColumn';

/**
 * @module Gantt/column/MilestoneColumn
 */

/**
 * A Column that indicates whether a task is a milestone. This column uses a {@link Core.widget.Checkbox checkbox} as
 * its editor.
 *
 * @extends Grid/column/CheckColumn
 * @classType milestone
 */

class MilestoneColumn extends CheckColumn {
  static get $name() {
    return 'MilestoneColumn';
  }

  static get type() {
    return 'milestone';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'milestone',
      text: 'L{Milestone}'
    };
  }

}
ColumnStore.registerColumnType(MilestoneColumn);
MilestoneColumn._$name = 'MilestoneColumn';

/**
 * @module Gantt/column/NameColumn
 */

/**
 * A tree column showing (and allowing user to edit) the task's {@link Gantt.model.TaskModel#field-name name} field.
 *
 * Default editor is a {@link Core.widget.TextField TextField}.
 *
 * @extends Grid/column/TreeColumn
 * @classType name
 */

class NameColumn extends TreeColumn {
  static get $name() {
    return 'NameColumn';
  }

  static get type() {
    return 'name';
  }

  static get isGanttColumn() {
    return true;
  } //region Config

  static get defaults() {
    return {
      width: 200,
      field: 'name',
      text: 'L{Name}'
    };
  } //endregion

}
ColumnStore.registerColumnType(NameColumn);
NameColumn._$name = 'NameColumn';

/**
 * @module Gantt/column/NoteColumn
 */

/**
 * A column which displays a task's {@link Gantt.model.TaskModel#field-note note} field.
 *
 * Default editor is a {@link Core.widget.TextAreaPickerField}.
 *
 * @extends Grid/column/Column
 * @classType note
 */

class NoteColumn extends Column {
  static get $name() {
    return 'NoteColumn';
  }

  static get type() {
    return 'note';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'note',
      text: 'L{Note}',
      width: 150,
      editor: {
        type: 'textareapickerfield'
      }
    };
  }

  renderer({
    value
  }) {
    return (value || '').trim();
  }

  get disableHtmlEncode() {
    return true;
  }

}
ColumnStore.registerColumnType(NoteColumn);
NoteColumn._$name = 'NoteColumn';

/**
 * @module Gantt/column/PercentDoneColumn
 */

/**
 * A column representing the {@link SchedulerPro.model.mixin.PercentDoneMixin#field-percentDone percentDone} field of the task.
 *
 * Default editor is a {@link Core.widget.NumberField NumberField}.
 *
 * @extends Grid/column/NumberColumn
 * @classType percentdone
 */

class PercentDoneColumn extends NumberColumn {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "circleHeightPercentage", 0.75);
  }

  static get $name() {
    return 'PercentDoneColumn';
  }

  static get type() {
    return 'percentdone';
  }

  static get isGanttColumn() {
    return true;
  } //region Config

  static get fields() {
    return [
    /**
     * Set to `true` to render a circular progress bar to visualize the task progress
     * @config {Boolean} showCircle
     */
    'showCircle'];
  }

  static get defaults() {
    return {
      field: 'percentDone',
      text: 'L{% Done}',
      unit: '%',
      step: 1,
      min: 0,
      max: 100,
      width: 90
    };
  } //endregion

  construct(config) {
    super.construct(...arguments);

    if (this.showCircle) {
      this.htmlEncode = false;
    }
  }

  defaultRenderer({
    record,
    isExport,
    value
  }) {
    value = record.getFormattedPercentDone(value);

    if (isExport) {
      return value;
    }

    if (this.showCircle) {
      return {
        className: {
          'b-percentdone-circle': 1,
          'b-full': value === 100,
          'b-empty': value === 0
        },
        style: {
          height: this.circleHeightPercentage * this.grid.rowHeight + 'px',
          width: this.circleHeightPercentage * this.grid.rowHeight + 'px',
          '--gantt-percentdone-angle': `${value / 100}turn`
        },
        dataset: {
          value
        }
      };
    }

    return value + this.unit;
  } // formatValue(value) {
  //     if (value <= 99) {
  //         return Math.round(value);
  //     }
  //     else {
  //         return Math.floor(value);
  //     }
  // }
  // * reactiveRenderer() {
  //     const
  //         { column : me, record, client } = this,
  //         value = me.formatValue(yield record.$.percentDone);
  //
  //     if (me.showCircle) {
  //         const size  = client.rowHeight * 0.8;
  //
  //         return {
  //             className : 'b-percentdone-circle',
  //             style     : {
  //                 animationDelay : `-${value - 0.1}s`,
  //                 width          : size,
  //                 height         : size
  //             },
  //             dataset : {
  //                 value
  //             }
  //         };
  //     }
  //
  //     return value + me.unit;
  // }

}
ColumnStore.registerColumnType(PercentDoneColumn);
PercentDoneColumn._$name = 'PercentDoneColumn';

/**
 * @module Gantt/widget/DependencyField
 */
// Enables toggling of link type for each side

const toggleTypes = {
  from: [2, 3, 0, 1],
  to: [1, 0, 3, 2]
},
      buildDependencySuffixRe = () => new RegExp(`(${dependencyTypes.join('|')})?((?:[+-])\\d+[a-z]*)?`, 'i'); // For parsing dependency strings and converting string to type.
// dependencyTypes may be localized in the Gantt class domain
// in which case the Regex is generated from the four local values.
// TODO Move to static class field?

let dependencyTypes = ['SS', 'SF', 'FS', 'FF'],
    dependencySuffixRe = buildDependencySuffixRe();
/**
 * Chooses dependencies, connector sides and lag time for dependencies of a Task.
 *
 * This field can be used as an editor for the {@link Grid/column/Column}.
 * It is used as the default editor for the {@link Gantt/column/DependencyColumn}.
 *
 * The contextual task is the `record` property of this field's {@link Core/widget/Widget#property-owner}.
 *
 * {@inlineexample Gantt/widget/DependencyField.js}
 * @extends Core/widget/Combo
 * @classType predecessor
 */

class DependencyField extends Combo {
  //region Config
  static get $name() {
    return 'DependencyField';
  } // Factoryable type name

  static get type() {
    return 'dependencyfield';
  }

  static get configurable() {
    return {
      listCls: 'b-predecessor-list',
      displayField: 'name',
      valueField: 'name',
      picker: {
        floating: true,
        scrollAction: 'realign',
        itemsFocusable: false,
        activateOnMouseover: true,
        align: {
          align: 't0-b0',
          axisLock: true
        },
        maxHeight: 324,
        minHeight: 161,
        scrollable: {
          overflowY: true
        },
        autoShow: false,
        focusOnHover: false
      },

      /**
       * Delimiter between dependency ids in the field
       * @config {String}
       * @default
       */
      delimiter: ';',

      /**
       * The dependency store
       * @config {Gantt.data.DependencyStore}
       * @default
       */
      dependencyStore: null,

      /**
       * The other task's relationship with this field's contextual task.
       * This will be `'from'` if we are editing predecessors, and `'to'` if
       * we are editing successors.
       * @config {String}
       */
      otherSide: null,

      /**
       * This field's contextual task's relationship with the other task.
       * This will be `'to'` if we are editing predecessors, and `'from'` if
       * we are editing successors.
       * @config {String}
       */
      ourSide: null,
      multiSelect: true,
      chipView: null,
      validateOnInput: false,

      /**
       * A task field (id, wbsCode, sequenceNumber etc) that will be used when displaying and editing linked tasks. Defaults to {@link Gantt/view/GanttBase#config-dependencyIdField Gantt#dependencyIdField}
       * @config {String}
       */
      dependencyIdField: null,

      /**
       * The task whose dependencies are being edited (used to filter out invalid options)
       * @config {String}
       * @internal
       */
      eventRecord: null,

      /**
       * The sorters defining how to sort tasks in the drop down list, defaults to sorting by `name` field ascending.
       * See {@link Core.data.mixin.StoreSort} for more information.
       * @config {Object[]|String[]}
       */
      sorters: [{
        field: 'name'
      }]
    };
  } //endregion

  construct(config) {
    const me = this,
          {
      ourSide,
      otherSide
    } = config;
    me.dependencies = new Collection({
      extraKeys: otherSide
    });
    me.startCollection = new Collection({
      extraKeys: otherSide
    });
    super.construct(config);
    me.delimiterRegEx = new RegExp(`\\s*${me.delimiter}\\s*`);

    const localizeDependencies = () => {
      dependencyTypes = me.L('L{DependencyType.short}');
      dependencySuffixRe = buildDependencySuffixRe();
      me.syncInputFieldValue();
    }; // Update when changing locale

    LocaleManagerSingleton.on({
      locale: localizeDependencies,
      thisObj: me
    });
    localizeDependencies();
  }

  internalOnInput() {
    this.clearError(undefined, true);

    if (this.isValid) {
      // Avoid combo filtering. That's done from our FilterField
      TextField.prototype.internalOnInput.call(this);
    }
  }

  get invalidValueError() {
    return 'L{invalidDependencyFormat}';
  }

  onInternalKeyDown(keyEvent) {
    const {
      key
    } = keyEvent; // Don't pass Enter down, that selects when ComboBox passes it down
    // to its list. We want default action on Enter.
    // Our list has its own, built in filter field which provides key events.

    if (key === 'Enter') {
      this.syncInvalid();
    } else {
      super.onInternalKeyDown && super.onInternalKeyDown(keyEvent);
    }

    if (this.pickerVisible && key === 'ArrowDown') {
      this.filterField.focus();
    }
  }

  onTriggerClick() {
    if (this.pickerVisible) {
      super.onTriggerClick();
    } else {
      this.doFilter(this.filterInput ? this.filterInput.value : null);
    }
  }

  changeStore(store) {
    // Filter the store to hide the field's Task
    store = store.chain(record => !this.eventRecord || record.id !== this.eventRecord.id, null, {
      excludeCollapsedRecords: false
    });
    store.sort(this.sorters);
    return super.changeStore(store);
  }

  changePicker(picker, oldPicker) {
    const me = this,
          myInput = me.input,
          filterField = me.filterField || (me.filterField = new TextField({
      cls: 'b-dependency-list-filter',
      owner: me,
      clearable: true,
      placeholder: 'Filter',
      triggers: {
        filter: {
          cls: 'b-icon b-icon-filter',
          align: 'start'
        }
      },
      listeners: {
        input({
          value
        }) {
          me.input = filterFieldInput;
          me.filterList(value);
          me.input = myInput;
        },

        clear() {
          me.input = filterFieldInput;
          me.filterList();
          me.input = myInput;
        }

      }
    })),
          filterFieldInput = me.filterInput = filterField.input,
          result = DependencyField.reconfigure(oldPicker, picker ? Objects.merge({
      owner: me,
      store: me.store,
      cls: `b-dependency-list ${me.listCls}`,
      itemTpl: me.listItemTpl,
      forElement: me[me.pickerAlignElement],
      align: {
        anchor: me.overlayAnchor,
        target: me[me.pickerAlignElement]
      },
      navigator: {
        keyEventTarget: filterFieldInput,
        processEvent: e => {
          if (e.key === 'Escape') {
            me.hidePicker();
          } else {
            return e;
          }
        }
      },
      onItem: me.onPredecessorClick.bind(me),
      getItemClasses: function (task) {
        const result = List.prototype.getItemClasses.call(this, task),
              dependency = me.dependencies.getBy(me.otherSide + 'Event', task),
              cls = dependency ? ` b-selected b-${dependency.getConnectorString(1).toLowerCase()}` : '';
        return result + cls;
      }
    }, picker) : null, me); // May have been set to null (destroyed)

    if (result) {
      filterField.render(result.contentElement);
    } // If it has been destroyed, destroy orphaned filterField
    else {
      me.destroyProperties('filterField');
    }

    return result;
  }

  showPicker(focusPicker) {
    // Ensure this field's Task is filtered out.
    // See our set store which owns the chainedFilterFn.
    this.store.fillFromMaster();
    super.showPicker(focusPicker);
  }

  onPickerShow({
    source: picker
  }) {
    const me = this,
          filterField = me.filterField,
          ourInput = me.input;
    picker.minWidth = me[me.pickerAlignElement].offsetWidth;
    picker.contentElement.insertBefore(filterField.element, picker.contentElement.firstChild); // Combo superclass focuses this.input upon picker show.
    // This must focus the filter field, not the predecessor text.

    me.input = me.filterInput;
    super.onPickerShow();
    me.input = ourInput;
  }

  listItemTpl(task) {
    const taskName = StringHelper.encodeHtml(task.name),
          idField = this.owner.dependencyIdField && this.owner.dependencyIdField !== task.constructor.idField ? this.owner.dependencyIdField : task.constructor.idField,
          // Don't output generated ids in the list
    taskIdentifier = !task.isPhantom ? String(task[idField]) : '';
    return `<div class="b-predecessor-item-text">${taskName} ${taskIdentifier.length ? `(${taskIdentifier})` : ''}</div>
            <div class="b-sch-box b-from" data-side="from"></div>
            <div class="b-sch-box b-to" data-side="to"></div>`;
  }

  get isValid() {
    return Boolean(!this.task || this.parseDependencies(this.input.value)) && super.isValid;
  }

  set value(dependencies) {
    const me = this,
          dependenciesCollection = me.dependencies; // Convert strings, eg: '1fs-2h;2ss+1d' to Dependency records

    if (typeof dependencies === 'string') {
      me.input.value = dependencies;
      dependencies = me.parseDependencies(dependencies);

      if (!dependencies) {
        me.syncInvalid();
        return;
      }

      dependencies = dependencies.map(dep => new me.dependencyStore.modelClass(dep));
    } else {
      me.startCollection.clear();
      me.startCollection.values = dependencies;
    }

    dependenciesCollection.clear();
    dependenciesCollection.values = dependencies; // If there has been a change, update the textual value.

    if (!me.inputting) {
      me.syncInputFieldValue();
    }
  }

  get value() {
    return this.dependencies.values;
  }

  get inputValue() {
    return this.constructor.dependenciesToString(this.dependencies.values, this.otherSide, this.delimiter, this.dependencyIdField);
  }

  onPredecessorClick({
    source: list,
    item,
    record: task,
    event
  }) {
    const me = this,
          dependencies = me.dependencies,
          box = event.target.closest('.b-sch-box'),
          side = box && box.dataset.side;
    let dependency = dependencies.getBy(me.otherSide + 'Event', task); // Prevent regular selection continuing after this click handler.

    item.dataset.noselect = true; // Click text to remove predecessor completely

    if (dependency && !box) {
      dependencies.remove(dependency);
    } else {
      // Clicking a connect side box toggles that
      if (dependency) {
        // We must create a clone because the record is "live".
        // Updates to it go back to the UI.
        // Also we cannot really modify record here. When editing will finish editor will compare `toJSON`
        // output of models, which refers to the `model.data` field. And if we modify record instance, change
        // won't go to the data object, it will be kept in the field though. Only way to sync model.data.type and
        // model.type here is to instantiate model with correct data already
        const {
          id,
          type
        } = dependency; // Using private argument here to avoid copying record current values, we're only interested in data object

        dependency = dependency.copy({
          id,
          type: toggleTypes[side][type]
        }, {
          skipFieldIdentifiers: true
        }); // HACK: Above code results having serialized values in `${me.otherSide}Event` field
        // and we expect to find task instance when doing code like:
        //     dependencies.getBy(me.otherSide + 'Event', task)
        // So let's put the task instance there manually.

        dependency[`${me.otherSide}Event`] = task;
        dependency[`${me.ourSide}Event`] = me.task; // Replace the old predecessor link with the new, modified one.
        // Collection will *replace* in-place due to ID matching.

        dependencies.add(dependency);
      } // Create a new dependency to/from the clicked task
      else {
        dependencies.add(me.dependencyStore.createRecord({
          [`${me.otherSide}Event`]: task,
          [`${me.ourSide}Event`]: me.task
        }, true));
      }
    }

    me.syncInputFieldValue();
    list.refresh();
  }

  static dependenciesToString(dependencies, side, delimiter = ';', eventIdField = 'id') {
    const eventField = `${side}Event`;

    const getEventId = dependency => {
      const event = dependency[eventField];
      return event !== null && event !== void 0 && event.isModel ? event[eventIdField] : event || '';
    };

    if (dependencies !== null && dependencies !== void 0 && dependencies.length) {
      const result = dependencies.sort((a, b) => getEventId(a) - getEventId(b)).map(dependency => `${getEventId(dependency)}${Dependencies$1.getLocalizedDependencyType(dependency.getConnectorString())}${dependency.getLag()}`);
      return result.join(delimiter);
    }

    return '';
  } // static * dependenciesToStringGenerator(dependencies, otherSide, delimiter = ';') {
  //     const result = [];
  //
  //     if (dependencies && dependencies.length) {
  //         for (const dependency of dependencies) {
  //             const
  //                 otherSideEvent = yield dependency.$[otherSide + 'Event'],
  //                 otherSideEventId = otherSideEvent ? otherSideEvent.id : (otherSideEvent || '');
  //
  //             result.push(`${otherSideEventId}${yield dependency.getConnectorString()}${dependency.getLag()}`);
  //         }
  //     }
  //
  //     return result.join(delimiter);
  // }

  get task() {
    var _this$owner;

    return (_this$owner = this.owner) === null || _this$owner === void 0 ? void 0 : _this$owner.record;
  }

  parseDependencies(value) {
    const me = this,
          task = me.task,
          taskStore = me.store,
          dependencyStore = me.dependencyStore,
          dependencies = value.split(me.delimiterRegEx),
          DependencyModel = dependencyStore.modelClass,
          result = [];

    for (let i = 0; i < dependencies.length; i++) {
      const dependencyText = dependencies[i];

      if (dependencyText) {
        let idLen = dependencyText.length + 1,
            linkedTaskId,
            linkedTask = null;

        for (; idLen && !linkedTask; idLen--) {
          linkedTaskId = dependencyText.substr(0, idLen);
          linkedTask = taskStore.find(task => String(task[me.dependencyIdField]) === linkedTaskId, true);
        }

        if (!linkedTask) {
          return null;
        } // Chop off connector and lag specification, i.e. the "SS-1h" part

        const remainder = dependencyText.substr(idLen + 1),
              // Start the structure of the dependency we are describing
        dependency = {
          // This will be "from" if we're editing predecessors
          // and "to" if we're editing successors
          [`${me.otherSide}Event`]: linkedTask,
          // This will be "to" if we're editing predecessors
          // and "from" if we're editing successors
          [`${me.ourSide}Event`]: task,
          type: DependencyModel.Type.EndToStart
        }; // There's a trailing edge/lag spec

        if (remainder.length) {
          const edgeAndLag = dependencySuffixRe.exec(remainder);

          if (edgeAndLag && (edgeAndLag[1] || edgeAndLag[2])) {
            // The SS/FF bit
            if (edgeAndLag[1]) {
              dependency.type = dependencyTypes.indexOf(edgeAndLag[1].toUpperCase());
            } // The -1h bit

            if (edgeAndLag[2]) {
              const parsedLag = DateHelper.parseDuration(edgeAndLag[2], true, task.durationUnit);
              dependency.lag = parsedLag.magnitude;
              dependency.lagUnit = parsedLag.unit;
            }
          } else {
            return null;
          }
        }

        result.push(dependency);
      }
    }

    return result;
  }

  doDestroy() {
    this.dependencies.destroy();
    this.startCollection.destroy();
    super.doDestroy();
  }

}

DependencyField.initClass();
DependencyField._$name = 'DependencyField';

/**
 * @module Gantt/column/DependencyColumn
 */

const hasNoProject = v => !v.project,
      depIsValid = v => v;
/**
 * A column which displays, in textual form, the dependencies which either link to the
 * contextual task from other, preceding tasks, or dependencies which link the
 * contextual task to successor tasks.
 *
 * Default editor is a {@link Gantt/widget/DependencyField}.
 *
 * The {@link Grid/column/Column#config-field} MUST be either `predecessors` or `successors` in order
 * for this column to know what kind of dependency it is showing.
 *
 * By default predecessors and successors have a task ID as a value. But it's configurable and any field may be used to display there (as example: wbsCode or sequenceNumber)
 * using {@link #config-dependencyIdField}
 *
 * @classType dependency
 * @extends Grid/column/Column
 */

class DependencyColumn extends Delayable(Column) {
  static get $name() {
    return 'DependencyColumn';
  }

  static get type() {
    return 'dependency';
  }

  static get fields() {
    return [
    /**
     * Delimiter used for displayed value and editor
     * @config {String} delimiter
     */
    {
      name: 'delimiter',
      defaultValue: ';'
    },
    /**
     * A task field (id, wbsCode, sequenceNumber etc) that will be used when displaying and editing linked tasks. Defaults to {@link Gantt/view/GanttBase#config-dependencyIdField}
     * @config {String} dependencyIdField
     */
    {
      name: 'dependencyIdField',
      defaultValue: null
    }];
  }

  static get defaults() {
    return {
      htmlEncode: false,
      width: 120,

      renderer({
        record,
        grid
      }) {
        const dependencyIdField = this.dependencyIdField || grid.dependencyIdField;
        return DependencyField.dependenciesToString(record[this.field], this.field === 'predecessors' ? 'from' : 'to', this.delimiter, dependencyIdField);
      },

      filterable({
        value,
        record: taskRecord,
        column
      }) {
        const dependencyIdField = column.dependencyIdField || column.grid.dependencyIdField;
        value = value.toLowerCase();
        return taskRecord[`${column.field === 'predecessors' ? 'predecessorTasks' : 'successorTasks'}`].some(linkedTask => {
          var _linkedTask$dependenc;

          return linkedTask && value.includes((_linkedTask$dependenc = linkedTask[dependencyIdField]) === null || _linkedTask$dependenc === void 0 ? void 0 : _linkedTask$dependenc.toString().toLowerCase());
        });
      }

    };
  }

  afterConstruct() {
    super.afterConstruct();
  }

  getFilterableValue(record) {
    return this.renderer({
      record,
      grid: this.grid
    });
  }

  async finalizeCellEdit({
    grid,
    record,
    inputField,
    value,
    oldValue,
    editorContext
  }) {
    inputField.clearError();

    if (record && value) {
      const toValidate = value.filter(hasNoProject),
            project = grid.dependencyStore.getProject(),
            oldDependencies = record[this.field];
      await project.commitAsync();
      if (project.isDestroyed) return;
      const results = await Promise.all(toValidate.map(dependency => project.isValidDependencyModel(dependency, oldDependencies))),
            valid = results.every(depIsValid);

      if (!valid) {
        return editorContext.column.L('L{Invalid dependency}');
      }

      return true;
    }
  }

  get defaultEditor() {
    const me = this,
          {
      grid
    } = me,
          isPredecessor = me.field === 'predecessors';
    return {
      type: 'dependencyfield',
      grid: grid,
      name: me.field,
      delimiter: me.delimiter,
      dependencyIdField: me.dependencyIdField || grid.dependencyIdField,
      ourSide: isPredecessor ? 'to' : 'from',
      otherSide: isPredecessor ? 'from' : 'to',
      store: grid.eventStore || grid.taskStore,
      dependencyStore: grid.dependencyStore
    };
  }

}
ColumnStore.registerColumnType(DependencyColumn);
DependencyColumn._$name = 'DependencyColumn';

/**
 * @module Gantt/column/PredecessorColumn
 */

/**
 * A column which displays, in textual form, the dependencies which link from tasks
 * upon which the contextual task depends.
 *
 * This type of column is editable by default. Default editor is a {@link Gantt/widget/DependencyField}.
 *
 * @classType predecessor
 * @extends Gantt/column/DependencyColumn
 */

class PredecessorColumn extends DependencyColumn {
  static get $name() {
    return 'PredecessorColumn';
  }

  static get type() {
    return 'predecessor';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      text: 'L{Predecessors}',
      field: 'predecessors'
    };
  }

}
ColumnStore.registerColumnType(PredecessorColumn);
PredecessorColumn._$name = 'PredecessorColumn';

/**
 * @module Gantt/data/AssignmentsManipulationStore
 */

/**
 * Special store class for _single_ task/event assignments manipulation, used by {@link Gantt/widget/AssignmentGrid}
 *
 * Contains a collection of {@link Gantt/model/AssignmentModel} records.
 *
 * @extends Scheduler/data/AssignmentStore
 * @internal
 */

class AssignmentsManipulationStore extends AssignmentStore$1 {
  //region Config
  static get defaultConfig() {
    return {
      storage: {
        extraKeys: ['resource']
      },
      callOnFunctions: true,

      /**
       * Event model to manipulate assignments of, the event should be part of a project.
       *
       * @config {Gantt.model.TaskModel}
       */
      projectEvent: null,

      /**
       * Flag indicating whether assigned resources should be placed (floated) before unassigned ones.
       *
       * @config {Boolean}
       * @private
       */
      floatAssignedResources: true,

      /**
       * Flag indicating whether assigned resources should be floated live
       *
       * @config {Boolean}
       * @private
       */
      liveFloatAssignedResources: false
    };
  }

  afterConfigure() {
    const me = this;
    super.afterConfigure();
    me.addSorter({
      fn: me.defaultSort.bind(me)
    });
  } //endregion

  get projectEvent() {
    return this._projectEvent;
  }

  set projectEvent(projectEvent) {
    const me = this; // If the event is the same, but some underlying data has changed, we must still update

    if (projectEvent != me._projectEvent || projectEvent && projectEvent.generation !== me._projectEventGeneration) {
      me._projectEvent = projectEvent;
      me._projectEventGeneration = projectEvent.generation;

      if (projectEvent) {
        me.fillFromMaster();
        me.sort();
      } else {
        me.removeAll();
      }
    }
  }

  get floatAssignedResources() {
    return this._floatAssignedResources;
  }

  set floatAssignedResources(value) {
    const me = this;

    if (value !== me.floatAssignedResources) {
      me._floatAssignedResources = value;
      me.sort();
    }
  }
  /**
   * Fills this store from master {@link Gantt/data/ResourceStore resource} store and {@link Gantt/data/AssignmentStore assignment} store.
   * @internal
   */

  fillFromMaster() {
    const me = this,
          {
      projectEvent
    } = me;

    if (projectEvent) {
      const {
        assignmentStore,
        resourceStore
      } = projectEvent,
            resourceDataSource = assignmentStore.modelClass.getFieldDefinition('resource').dataSource,
            eventDataSource = assignmentStore.modelClass.getFieldDefinition('event').dataSource,
            storeData = []; // For each excludes group header records - ResourceStore might be grouped externally

      resourceStore.forEach(resource => {
        const existingAssignment = assignmentStore.getAssignmentForEventAndResource(projectEvent, resource),
              data = Object.assign({
          units: 0
        }, existingAssignment === null || existingAssignment === void 0 ? void 0 : existingAssignment.data);
        delete data.id;
        delete data.eventId;
        delete data.resourceId; // handle data mapping cases

        delete data[resourceDataSource];
        delete data[eventDataSource]; // apply resource and event after cleaning data mapping

        Object.assign(data, {
          resource,
          event: projectEvent
        });
        storeData.push(data);
      }, this, {
        includeFilteredOutRecords: true,
        includeCollapsedGroupRecords: true
      });
      me.data = storeData;
    }
  }

  toValueString() {
    const activeAssignments = this.query(a => a.units > 0);
    return activeAssignments.join(', ');
  }

  defaultSort(lhs, rhs) {
    let result = 0;

    if (this.floatAssignedResources) {
      if (!rhs.units && lhs.units) {
        result = -1;
      } else if (!lhs.units && rhs.units) {
        result = 1;
      } else {
        result = lhs.resourceName.localeCompare(rhs.resourceName);
      }
    } else {
      result = lhs.resourceName.localeCompare(rhs.resourceName);
    }

    return result;
  }

  onUpdate({
    changes
  }) {
    const me = this;

    if (!me.isConfiguring) {
      if (Object.hasOwnProperty.call(changes, 'event')) {
        if (me.floatAssignedResources && me.liveFloatAssignedResources) {
          me.sort();
        }
      }
    }
  }

}
AssignmentsManipulationStore._$name = 'AssignmentsManipulationStore';

/**
 * @module Gantt/model/AssignmentModel
 */

/**
 * This class represent a single assignment of a {@link Gantt.model.ResourceModel resource} to a
 * {@link Gantt.model.TaskModel task} in your gantt chart.
 *
 * @extends SchedulerPro/model/AssignmentModel
 *
 * @typings SchedulerPro/model/AssignmentModel -> SchedulerPro/model/SchedulerProAssignmentModel
 * @uninherit Core/data/mixin/TreeNode
 */

class AssignmentModel extends GanttAssignmentMixin.mix(AssignmentModel$1) {
  //region Fields
  static get fields() {
    /**
     * The numeric, percent-like value, indicating what is the "contribution level"
     * of the resource availability to the task.
     * Number 100, means that the assigned resource spends 100% of its working time to the task.
     * Number 50 means that the resource spends only half of its available time for the assigned task.
     * @field {Number} units
     */
    return [
    /**
     * Id for event to assign. Note that after load it will be populated with the actual event.
     * @field {Gantt.model.TaskModel} event
     * @accepts {String|Number|Gantt.model.TaskModel}
     */
    {
      name: 'event',
      persist: true,
      serialize: record => record === null || record === void 0 ? void 0 : record.id,
      isEqual: isSerializableEqual
    },
    /**
     * Id for resource to assign to. Note that after load it will be populated with the actual resource.
     * @field {Gantt.model.ResourceModel} resource
     * @accepts {String|Number|Gantt.model.ResourceModel}
     */
    {
      name: 'resource',
      persist: true,
      serialize: record => record === null || record === void 0 ? void 0 : record.id,
      isEqual: isSerializableEqual
    },
    /**
     * Hidden
     * @field {String|Number} eventId
     * @hide
     */
    'eventId',
    /**
     * Hidden
     * @field {String|Number} resourceId
     * @hide
     */
    'resourceId'];
  } //endregion

}
AssignmentModel._$name = 'AssignmentModel';

const locale = LocaleHelper.mergeLocales(locale$1, {
  //region Common
  Object: {
    Save: 'Save'
  },
  //endregion
  //region Columns
  InactiveColumn: {
    Inactive: 'Inactive'
  },
  AddNewColumn: {
    'New Column': 'New Column'
  },
  CalendarColumn: {
    Calendar: 'Calendar'
  },
  EarlyStartDateColumn: {
    'Early Start': 'Early Start'
  },
  EarlyEndDateColumn: {
    'Early End': 'Early End'
  },
  LateStartDateColumn: {
    'Late Start': 'Late Start'
  },
  LateEndDateColumn: {
    'Late End': 'Late End'
  },
  TotalSlackColumn: {
    'Total Slack': 'Total Slack'
  },
  ConstraintDateColumn: {
    'Constraint Date': 'Constraint Date'
  },
  ConstraintTypeColumn: {
    'Constraint Type': 'Constraint Type'
  },
  DeadlineDateColumn: {
    Deadline: 'Deadline'
  },
  DependencyColumn: {
    'Invalid dependency': 'Invalid dependency'
  },
  DurationColumn: {
    Duration: 'Duration'
  },
  EffortColumn: {
    Effort: 'Effort'
  },
  EndDateColumn: {
    Finish: 'Finish'
  },
  EventModeColumn: {
    'Event mode': 'Event mode',
    Manual: 'Manual',
    Auto: 'Auto'
  },
  ManuallyScheduledColumn: {
    'Manually scheduled': 'Manually scheduled'
  },
  MilestoneColumn: {
    Milestone: 'Milestone'
  },
  NameColumn: {
    Name: 'Name'
  },
  NoteColumn: {
    Note: 'Note'
  },
  PercentDoneColumn: {
    '% Done': '% Done'
  },
  PredecessorColumn: {
    Predecessors: 'Predecessors'
  },
  ResourceAssignmentColumn: {
    'Assigned Resources': 'Assigned Resources',
    'more resources': 'more resources'
  },
  RollupColumn: {
    Rollup: 'Rollup'
  },
  SchedulingModeColumn: {
    'Scheduling Mode': 'Scheduling Mode'
  },
  SequenceColumn: {
    Sequence: 'Sequence'
  },
  ShowInTimelineColumn: {
    'Show in timeline': 'Show in timeline'
  },
  StartDateColumn: {
    Start: 'Start'
  },
  SuccessorColumn: {
    Successors: 'Successors'
  },
  TaskCopyPaste: {
    copyTask: 'Copy',
    cutTask: 'Cut',
    pasteTask: 'Paste'
  },
  WBSColumn: {
    WBS: 'WBS',
    renumber: 'Renumber'
  },
  //endregion
  DependencyField: {
    'invalidDependencyFormat': 'Invalid dependency format'
  },
  ProjectLines: {
    'Project Start': 'Project start',
    'Project End': 'Project end'
  },
  TaskTooltip: {
    Start: 'Start',
    End: 'End',
    Duration: 'Duration',
    Complete: 'Complete'
  },
  AssignmentGrid: {
    Name: 'Resource name',
    Units: 'Units',
    unitsTpl: ({
      value
    }) => value ? value + '%' : ''
  },
  Gantt: {
    Edit: 'Edit',
    Indent: 'Indent',
    Outdent: 'Outdent',
    'Convert to milestone': 'Convert to milestone',
    Add: 'Add...',
    'New task': 'New task',
    'New milestone': 'New milestone',
    'Task above': 'Task above',
    'Task below': 'Task below',
    'Delete task': 'Delete',
    Milestone: 'Milestone',
    'Sub-task': 'Subtask',
    Successor: 'Successor',
    Predecessor: 'Predecessor',
    changeRejected: 'Scheduling engine rejected the changes'
  },
  Indicators: {
    earlyDates: 'Early start/end',
    lateDates: 'Late start/end',
    Start: 'Start',
    End: 'End',
    deadlineDate: 'Deadline'
  }
});

LocaleManagerSingleton.registerLocale('En', {
  desc: 'English',
  locale
});

/**
 * @module Gantt/column/ResourceAssignmentGridResourceColumn.js
 */

/**
 * Column showing the resource name / avatar inside the AssignmentGrid
 *
 * @internal
 * @extends Scheduler/column/ResourceInfoColumn
 * @classType resourceassignment
 */

class ResourceAssignmentGridResourceColumn extends ResourceInfoColumn {
  static get $name() {
    return 'ResourceAssignmentGridResourceColumn';
  }

  static get type() {
    return 'assignmentResource';
  }

  static get defaults() {
    return {
      showEventCount: false,
      cls: 'b-assignmentgrid-resource-column',
      field: 'resourceName',
      flex: 1,
      editor: null,
      useNameAsImageName: false,
      filterable: {
        filterField: {
          placeholder: 'L{AssignmentGrid.Name}',
          triggers: {
            filter: {
              align: 'start',
              cls: 'b-icon b-icon-filter'
            }
          }
        }
      }
    };
  }

  defaultRenderer({
    grid,
    record,
    cellElement,
    value,
    isExport
  }) {
    if (!record.isSpecialRow) {
      record = record.resource;
    }

    return super.defaultRenderer({
      grid,
      record,
      cellElement,
      value,
      isExport
    });
  }

}
ColumnStore.registerColumnType(ResourceAssignmentGridResourceColumn);
ResourceAssignmentGridResourceColumn._$name = 'ResourceAssignmentGridResourceColumn';

/**
 * @module Gantt/widget/AssignmentGrid
 */

/**
 * This grid visualizes and lets users edit assignments of an {@link #config-projectEvent event}. Used by the
 * {@link Gantt.widget.AssignmentField}. This grid shows one column showing the resource name, and one showing
 * the units assigned. You can add additional columns by providing a {@link Grid.view.Grid#config-columns} array in your grid config.
 *
 * {@inlineexample Gantt/widget/AssignmentGrid.js}
 * @extends Grid/view/Grid
 * @classType assignmentgrid
 */

class AssignmentGrid extends Grid {
  static get $name() {
    return 'AssignmentGrid';
  } // Factoryable type name

  static get type() {
    return 'assignmentgrid';
  } //region Config

  static get configurable() {
    return {
      // Required by ResourceInfo column
      resourceImageExtension: '.jpg',
      minHeight: 200,

      /**
       * A {@link Grid.column.Column} config object for the resource column. You can pass a `renderer` which
       * gives you access to the `resource` record.
       *
       * @config {Object}
       */
      resourceColumn: {
        type: 'assignmentResource'
      },

      /**
       * A config object for the units column
       *
       * @config {Object}
       */
      unitsColumn: {
        field: 'units',
        type: NumberColumn.type,
        text: 'L{Units}',
        localeClass: this,
        width: 70,
        min: 0,
        max: 100,
        step: 10,
        unit: '%',
        renderer: ({
          value
        }) => this.L('L{unitsTpl}', {
          value: Math.round(value)
        }),
        filterable: false
      }
    };
  }

  static get defaultConfig() {
    return {
      selectionMode: {
        rowCheckboxSelection: true,
        multiSelect: true,
        showCheckAll: true
      },
      // If enabled blocks header checkbox click event
      features: {
        group: false,
        filterBar: true,
        contextMenu: false
      },
      disableGridRowModelWarning: true,

      /**
       * Event model to manipulate assignments of, the task should be part of a task store.
       * Either task or {@link Grid/view/Grid#config-store store} should be given.
       *
       * @config {Gantt.model.TaskModel}
       */
      projectEvent: null
    };
  } //endregion

  construct() {
    super.construct(...arguments);
    this.on('selectionchange', ({
      selected,
      deselected
    }) => {
      selected.forEach(assignment => assignment.units = assignment.units || assignment.getFieldDefinition('units').defaultValue);
      deselected.forEach(assignment => {
        if (this.store.includes(assignment)) {
          assignment.units = 0;
        }
      });
    });
  }

  get projectEvent() {
    const me = this,
          store = me.store;
    let projectEvent = me._projectEvent;

    if (store && projectEvent !== store.projectEvent) {
      projectEvent = me._projectEvent = store.projectEvent;
    }

    return projectEvent;
  }

  set projectEvent(projectEvent) {
    const me = this;
    me._projectEvent = projectEvent;
    me.store.projectEvent = projectEvent;

    if (projectEvent) {
      me.selectedRecords = me.store.query(as => projectEvent.assignments.find(existingAs => existingAs.resource === as.resource));
    }
  }

  get store() {
    return super.store;
  }

  set store(store) {
    const me = this,
          oldStore = me.store;

    if (store && oldStore !== store) {
      var _me$storeDetacher;

      if (!(store instanceof AssignmentsManipulationStore)) {
        var _me$_projectEvent;

        store = AssignmentsManipulationStore.new({
          modelClass: ((_me$_projectEvent = me._projectEvent) === null || _me$_projectEvent === void 0 ? void 0 : _me$_projectEvent.assignmentStore.modelClass) || AssignmentModel,
          projectEvent: me._projectEvent
        }, store);
      }

      super.store = store;
      (_me$storeDetacher = me.storeDetacher) === null || _me$storeDetacher === void 0 ? void 0 : _me$storeDetacher.call(me);
      me.storeDetacher = store.on('update', me.onAssignmentUpdate, me);
    }
  }

  set columns(columns) {
    if (columns) {
      // Clone is needed to flatten the properties from the prototype chain, the Model class wants data
      // in a flat simple object
      columns.unshift(Objects.clone(this.resourceColumn), Objects.clone(this.unitsColumn));
    }

    super.columns = columns;
  }

  get columns() {
    return super.columns;
  }

  onAssignmentUpdate({
    record,
    changes
  }) {
    const {
      units
    } = changes; // Sync selection while cell editing

    if (units) {
      if (!units.value) {
        this.deselectRow(record);
      } else if (units.oldValue === 0) {
        this.selectRow({
          record,
          scrollIntoView: false,
          addToSelection: true
        });
      }
    }
  }

} // Register this widget type with its Factory

AssignmentGrid.initClass();
AssignmentGrid._$name = 'AssignmentGrid';

/**
 * @module Gantt/widget/AssignmentPicker
 */

/**
 * Class for assignment field dropdown, wraps {@link Gantt/widget/AssignmentGrid} within a frame and adds two buttons: Save and Cancel
 * @private
 */

class AssignmentPicker extends AssignmentGrid {
  static get $name() {
    return 'AssignmentPicker';
  } // Factoryable type name

  static get type() {
    return 'assignmentpicker';
  }

  static get defaultConfig() {
    return {
      focusable: true,
      trapFocus: true,
      height: '20em',
      minWidth: '25em',
      bbar: [{
        type: 'button',
        text: this.L('L{Object.Save}'),
        localeClass: this,
        ref: 'saveBtn',
        color: 'b-green'
      }, {
        type: 'button',
        text: this.L('L{Object.Cancel}'),
        localeClass: this,
        ref: 'cancelBtn',
        color: 'b-gray'
      }],

      /**
       * The Event to load resource assignments for.
       * Either an Event or {@link #config-store store} should be given.
       *
       * @config {Gantt.model.TaskModel}
       */
      projectEvent: null,

      /**
       * Store for the picker.
       * Either store or {@link #config-projectEvent projectEvent} should be given
       *
       * @config {Gantt.data.AssignmentsManipulationStore}
       */
      store: null
    };
  }

  configure(config) {
    config.selectedRecordCollection = config.assignments;
    super.configure(config);
  }

  show() {
    this.originalSelected = this.selectedRecords.map(a => a.copy());
    return super.show();
  }

  afterConfigure() {
    var _me$bbar$widgetMap$sa, _me$bbar$widgetMap$ca;

    const me = this;
    super.afterConfigure();
    (_me$bbar$widgetMap$sa = me.bbar.widgetMap.saveBtn) === null || _me$bbar$widgetMap$sa === void 0 ? void 0 : _me$bbar$widgetMap$sa.on('click', me.onSaveClick, me);
    (_me$bbar$widgetMap$ca = me.bbar.widgetMap.cancelBtn) === null || _me$bbar$widgetMap$ca === void 0 ? void 0 : _me$bbar$widgetMap$ca.on('click', me.onCancelClick, me);
  } //region Event handlers

  onSaveClick() {
    this.hide();
  }

  onCancelClick() {
    this.hide();
  } //endregion

} // Register this widget type with its Factory

AssignmentPicker.initClass();
AssignmentPicker._$name = 'AssignmentPicker';

/**
 * @module Gantt/widget/AssignmentField
 */

/**
 * Special field class to edit single event assignments.
 *
 * This field is used as the default editor for the {@link Gantt.column.ResourceAssignmentColumn ResourceAssignmentColumn}
 *
 * {@inlineexample Gantt/widget/AssignmentField.js}
 *
 * ## Customizing the drop down grid
 *
 * The field is a {@link Core/widget/Combo} which has a {@link Gantt/widget/AssignmentGrid} as its picker. Here's a
 * snippet showing how simple it is to configure the grid:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     appendTo                : 'container',
 *     resourceImageFolderPath : '../_shared/images/users/',
 *     columns                 : [
 *         { type : 'name', field : 'name', text : 'Name', width : 250 },
 *         {
 *             type        : 'resourceassignment',
 *             width       : 250,
 *             showAvatars : true,
 *             editor      : {
 *                 type   : 'assignmentfield',
 *                 // The picker config is applied to the Grid
 *                 picker : {
 *                     height   : 350,
 *                     width    : 450,
 *                     features : {
 *                         filterBar  : true,
 *                         group      : 'resource.city',
 *                         headerMenu : false,
 *                         cellMenu   : false
 *                     },
 *                     // The extra columns are concatenated onto the base column set.
 *                     columns : [{
 *                         text       : 'Calendar',
 *                         // Read a nested property (name) from the resource calendar
 *                         field      : 'resource.calendar.name',
 *                         filterable : false,
 *                         editor     : false,
 *                         width      : 85
 *                     }]
 *                 }
 *             }
 *         }
 *     ],
 *
 *     project
 *  });
 * ```
 *
 * @extends Core/widget/Combo
 * @classType 'assignmentfield'
 * @demo Gantt/resourceassignment
 */

class AssignmentField extends Combo {
  static get $name() {
    return 'AssignmentField';
  } // Factoryable type name

  static get type() {
    return 'assignmentfield';
  } //region Config

  static get configurable() {
    return {
      // Let the editor know that the selectable records are also editable
      editingRecords: true,
      chipView: {
        cls: 'b-assignment-chipview',

        itemTpl(assignment, i) {
          return StringHelper.xss`${assignment.resourceName} ${Math.round(assignment.units)}%`;
        },

        scrollable: {
          overflowX: 'hidden-scroll'
        }
      },
      triggers: {
        expand: {
          cls: 'b-icon-down',
          handler: 'onTriggerClick'
        }
      },
      multiSelect: true,
      clearable: false,
      // TODO: change when it's back to editable
      editable: false,
      value: null,

      /**
       * A config object used to configure the {@link Gantt.widget.AssignmentGrid assignment grid}
       * used to select resources to assign.
       *
       * Any `columns` provided are concatenated onto the default column set.
       * @config {Object|Gantt.widget.AssignmentGrid} picker
       */
      picker: {
        type: AssignmentPicker.type,
        floating: true,
        scrollAction: 'realign'
      },

      /**
       * Width of picker, defaults to this field's {@link Core/widget/PickerField#config-pickerAlignElement} width
       *
       * @config {Number}
       */
      pickerWidth: null,

      /**
       * Event to load resource assignments for.
       * Either event or {@link #config-store store} should be given.
       *
       * @config {Gantt.model.TaskModel}
       */
      projectEvent: null,

      /**
       * Assignment manipulation store to use or it's configuration object.
       * Either store or {@link #config-projectEvent projectEvent} should be given
       *
       * @config {Core.data.Store|Object}
       */
      store: {}
    };
  } //endregion
  // Any change must offer the save/cancel UI since THAT is what actually makes the edit

  onChipClose(records) {
    this.showPicker();
    this.picker.deselectRows(records);
  }

  syncInputFieldValue() {
    super.syncInputFieldValue();

    if (this.store) {
      this.tooltip = StringHelper.encodeHtml(this.store.toValueString());
    }
  } //region Picker
  // Override. This field does not have a primary filter, so
  // down arrow/trigger click should just show the picker.

  onTriggerClick(event) {
    if (this.pickerVisible) {
      this.hidePicker();
    } else {
      PickerField.prototype.showPicker.call(this, event && 'key' in event);
    }
  }

  focusPicker() {
    this.picker.focus();
  }

  changePicker(picker, oldPicker) {
    const me = this;
    return AssignmentPicker.reconfigure(oldPicker, picker, {
      owner: me,
      defaults: {
        projectEvent: me.projectEvent,
        store: me.store,
        readOnly: me.readOnly,
        owner: me,
        resourceImagePath: me.resourceImageFolderPath,
        forElement: me[me.pickerAlignElement],
        assignments: me.valueCollection,

        onCancelClick() {
          me.value = this.originalSelected;
          this.hide();
        },

        align: {
          anchor: me.overlayAnchor,
          target: me[me.pickerAlignElement]
        },
        listeners: {
          hide: () => {
            if (!me.isDestroying) {
              // Only apply the filters and refresh the UI if we are focused.
              // If the hide is due to focusout, the refresh will be applied next time.
              me.store.clearFilters(me.containsFocus);
            }
          }
        }
      }
    });
  } //endregion
  //region Value

  changeProjectEvent(projectEvent) {
    // NOTE: This kind of thing would normally be handled in updateProjectEvent, however, the setter of the
    //  AssignmentManipulationStore pulls double duty and resyncs some fields, even if presented with the same
    //  projectEvent.
    const {
      picker,
      store
    } = this;
    this._projectEvent = projectEvent;

    if (store) {
      store.projectEvent = projectEvent;
    }

    if (picker) {
      picker.projectEvent = projectEvent;
    }

    return projectEvent;
  }

  changeStore(store) {
    if (store && !(store instanceof AssignmentsManipulationStore)) {
      store = new AssignmentsManipulationStore(store);
    }

    return store;
  }

  updateStore(store) {
    const me = this;
    me.detachListeners('storeMutation');

    if (store instanceof AssignmentsManipulationStore) {
      const {
        projectEvent
      } = store;

      if (projectEvent) {
        me.projectEvent = projectEvent;
      } else {
        // This is to not do the store::fillFromMaster() call, otherwise editor will be unhappy
        store.projectEvent = me.projectEvent;
      }
    }

    store.on({
      name: 'storeMutation',
      change: 'syncInputFieldValue',
      thisObj: me
    });
  } // This return an array of special Assignment records created
  // by the picker / grid

  get value() {
    return super.value;
  }

  set value(assignments) {
    var _assignments;

    // either real (=== currently assigned resources)
    // Or to-be assigned resources coming from the assignment grid
    // Map over to the special assignment records created by the AssignmentGrid store
    assignments = (_assignments = assignments) === null || _assignments === void 0 ? void 0 : _assignments.map(as => {
      const _as$data = as.data,
            _as$constructor$idFie = as.constructor.idField,
            data = _objectWithoutProperties(_as$data, [_as$constructor$idFie, "event", "resource", "eventId", "resourceId"].map(_toPropertyKey)),
            ourStoreVersion = this.store.find(a => a.resource === as.resource, true);

      ourStoreVersion === null || ourStoreVersion === void 0 ? void 0 : ourStoreVersion.set(data);
      return ourStoreVersion;
    });
    super.value = assignments;
  }

  hasChanged(initialValue, value) {
    return !ObjectHelper.isEqual(initialValue, value);
  } //endregion
  // Override. Picker is completely self-contained. Prevent any
  // field action on its key events.

  onPickerKeyDown(event) {
    const grid = this.picker; // Move "down" into the grid body

    if (event.key === 'ArrowDown' && event.target.compareDocumentPosition(grid.bodyContainer) === document.DOCUMENT_POSITION_FOLLOWING) {
      grid.element.focus();
    }
  } // Caching a copy of each record since the grid picker of this class will allow editing
  // A change to the records will constitute a change of this field

  cacheCurrentValue(records) {
    if (Array.isArray(records)) {
      return this._value = records.map(rec => rec.copy(rec.id));
    }

    return super.cacheCurrentValue(records);
  }

} // Register this widget type with its Factory

AssignmentField.initClass();
AssignmentField._$name = 'AssignmentField';

/**
 * @module Gantt/column/ResourceAssignmentColumn
 */

const resourceNameRegExp = a => a.resourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/**
 * Column allowing resource manipulation (assignment/unassignment/units changing) on a task. In the column cells,
 * assignments are either shown as badges or avatars. To show avatars, set {@link #config-showAvatars} to `true`. When
 * showing avatars there are two options for how to specify image paths:
 *
 * * You may provide a {@link Gantt.view.Gantt#config-resourceImageFolderPath} on your Gantt panel pointing to where
 *   resource images are located. Set the resource image filename in the `image` field of the resource data.
 * * And/or you may provide an `imageUrl` on your record, which then will take precedence when showing images.
 *
 * If a resource has no name, or its image cannot be loaded, the resource initials are rendered. If the resource has
 * an {@link Scheduler/model/mixin/ResourceModelMixin#field-eventColor} specified, it will be used as the background
 * color of the initials.
 *
 * Default editor is a {@link Gantt.widget.AssignmentField AssignmentField}.
 *
 * ## Customizing displayed elements
 *
 * If {@link #config-showAvatars} is false, column will render resource name and utilization wrapped in a
 * small element called _a chip_. Content of the chip can be customized. For example, if you don't want to see percent
 * value, or want to display different resource name, you can specify an {@link #config-itemTpl} config. Please keep in
 * mind that when you start editing the cell, chip will be rendered by the default editor. If you want chips to be
 * consistent, you need to customize the editor too.
 *
 * ```javascript
 * new Gantt({
 *     columns: [
 *         {
 *             type     : 'resourceassignment',
 *             itemTpl  : (assignment) => assignment.resourceName,
 *             editor   : {
 *                 chipView : {
 *                     itemTpl : (assignment) => assignment.resourceName
 *                 }
 *             }
 *         }
 *     ]
 * });
 * ```
 *
 * {@inlineexample Gantt/column/ResourceAssignment.js}
 *
 * @extends Grid/column/Column
 * @classType resourceassignment
 */

class ResourceAssignmentColumn extends Column {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "internalCellCls", 'b-resourceassignment-cell');
  }

  static get $name() {
    return 'ResourceAssignmentColumn';
  }

  static get type() {
    return 'resourceassignment';
  }

  static get isGanttColumn() {
    return true;
  }

  static get fields() {
    return [
    /**
     * True to show a resource avatar for every assignment. Note that you also have to provide a {@link Gantt.view.Gantt#config-resourceImageFolderPath} for where to load images from.
     * And/or you may provide an `imageUrl` on your record, which then will take precedence when showing images.
     * @config {Boolean} showAvatars
     * @category Common
     */
    'showAvatars', 'sideMargin',
    /**
     * A function which produces the content to put in the resource assignment cell.
     * May be overridden in subclasses, or injected into the column
     * to customize the Chip content.
     *
     * Defaults to returning `${assignment.resourceName} ${assignment.units}%`
     *
     * @param {Gantt.model.AssignmentModel} assignment The assignment
     * @param {Number} index The index - zero based.
     * @config {Function} itemTpl
     * @category Rendering
     */
    {
      name: 'itemTpl',
      defaultValue: assignment => StringHelper.encodeHtml(assignment.toString())
    },
    /**
     * A function which receives data about the resource and returns a html string to be displayed in the tooltip.
     *
     * ```javascript
     * const gantt = new Gantt({
     *     columns : [
     *          {
     *              type          : 'resourceassignment',
     *              showAvatars : true,
     *              avatarTooltipTemplate({ resourceRecord }) {
     *                  return `<b>${resourceRecord.name}</b>`;
     *              }
     *          }
     *     ]
     * });
     * ```
     *
     * This function will be called with an object containing the fields below:
     *
     * @param {Object} data
     * @param {Gantt.model.TaskModel} data.taskRecord Hovered task
     * @param {Gantt.model.ResourceModel} data.resourceRecord Hovered resource
     * @param {Gantt.model.AssignmentModel} data.assignmentRecord Hovered assignment
     * @param {Number} data.overflowCount Number of overflowing resources, only valid for last shown resource
     * @config {Function} avatarTooltipTemplate
     */
    'avatarTooltipTemplate', {
      name: 'avatarMaxSize',
      defaultValue: 50
    }];
  }

  static get defaults() {
    return {
      field: 'assignments',
      instantUpdate: false,
      text: 'L{Assigned Resources}',
      width: 250,
      cellCls: 'b-resourceassignment-cell',
      showAvatars: false,
      sideMargin: 20,

      sortable(task1, task2) {
        const a1 = task1.assignments.join(''),
              a2 = task2.assignments.join('');

        if (a1 === a2) {
          return 0;
        }

        return a1 < a2 ? -1 : 1;
      },

      filterable({
        value,
        record
      }) {
        // We're being passed an array of Assignments
        if (Array.isArray(value)) {
          // Shortcut if we're matching no assignments.
          if (!value.length) {
            return Boolean(!record.assignments.length);
          } // Create a multi resource name Regexp, eg /Macy|Lee|George/.

          value = value.map(resourceNameRegExp).join('|');
        }

        const regexp = new RegExp(value, 'gi');
        return record.assignments.some(assignment => regexp.test(assignment.resourceName));
      }

    };
  }

  construct() {
    super.construct(...arguments);
    const me = this,
          {
      grid
    } = me;

    if (me.showAvatars) {
      Object.assign(me, {
        repaintOnResize: true,
        htmlEncode: false,
        renderer: me.rendererWithAvatars,
        avatarRendering: new AvatarRendering({
          element: grid.element,
          tooltip: {
            forSelector: '.b-resourceassignment-cell .b-resource-avatar',
            listeners: {
              beforeShow({
                source: tip
              }) {
                var _me$avatarTooltipTemp, _me$avatarTooltipTemp2;

                const {
                  taskRecord,
                  resourceRecord,
                  assignmentRecord,
                  overflowCount
                } = tip.activeTarget.elementData,
                      tooltip = StringHelper.xss`${assignmentRecord.toString()}${overflowCount ? ` (+${overflowCount} ${me.L('L{more resources}')})` : ''}`;
                tip.html = (_me$avatarTooltipTemp = (_me$avatarTooltipTemp2 = me.avatarTooltipTemplate) === null || _me$avatarTooltipTemp2 === void 0 ? void 0 : _me$avatarTooltipTemp2.call(me, {
                  taskRecord,
                  resourceRecord,
                  assignmentRecord,
                  overflowCount
                })) !== null && _me$avatarTooltipTemp !== void 0 ? _me$avatarTooltipTemp : tooltip;
              }

            }
          }
        })
      });
    }

    grid.on({
      beforeCellEditStart: me.onBeforeCellEditStart,
      finishCellEdit: me.onDoneCellEdit,
      cancelCellEdit: me.onDoneCellEdit,
      thisObj: me
    });

    if (me.showAvatars) {
      grid.on({
        beforeRenderRows: me.calculateAvatarSize,
        once: true,
        thisObj: me
      });
      grid.rowManager.on({
        beforeRowHeight: me.calculateAvatarSize,
        thisObj: me
      });
    }

    grid.resourceStore.on({
      name: 'resourceStore',
      update: me.onResourceUpdate,
      thisObj: me
    });
  }

  calculateAvatarSize() {
    const {
      grid
    } = this,
          {
      cellElement
    } = grid.beginGridMeasuring();
    cellElement.classList.add(this.internalCellCls);
    const cellStyles = window.getComputedStyle(cellElement),
          padding = parseInt(cellStyles.paddingTop, 10);
    this.avatarRendering.size = Math.min(this.avatarMaxSize, grid.rowHeight - 2 * padding);
    cellElement.classList.remove(this.internalCellCls);
    grid.endGridMeasuring();
  }

  doDestroy() {
    var _this$avatarRendering;

    super.doDestroy();
    (_this$avatarRendering = this.avatarRendering) === null || _this$avatarRendering === void 0 ? void 0 : _this$avatarRendering.destroy();
  }

  get defaultEditor() {
    return {
      type: AssignmentField.type,
      store: {
        modelClass: this.grid.project.assignmentStore.modelClass
      }
    };
  }

  onBeforeCellEditStart({
    editorContext: {
      record,
      column
    }
  }) {
    const me = this;

    if (column === me) {
      const {
        editor
      } = me;
      editor.resourceImageFolderPath = me.grid.resourceImageFolderPath;
      editor.projectEvent = record;
      me.detachListeners('editorStore');
      editor.store.on({
        name: 'editorStore',
        changesApplied: me.onEditorChangesApplied,
        thisObj: me
      });
    }
  }

  onDoneCellEdit() {
    this.detachListeners('editorStore');
  }

  onEditorChangesApplied() {
    const me = this,
          cellElement = me.grid.getCell({
      id: me.editor.projectEvent.id,
      columnId: me.id
    });

    if (cellElement) {
      me.renderer({
        value: me.editor.projectEvent.assignments,
        cellElement
      });
    }
  }

  onResourceUpdate({
    source
  }) {
    var _source$project;

    // no need for this listener when the gantt is loading data
    if (!((_source$project = source.project) !== null && _source$project !== void 0 && _source$project.propagatingLoadChanges)) {
      this.grid.refreshColumn(this);
    }
  }

  get chipView() {
    const me = this;

    if (!me._chipView) {
      me._chipView = new ChipView({
        cls: 'b-assignment-chipview',
        itemsFocusable: false,
        closable: false,
        itemTpl: me.itemTpl,
        store: {},
        scrollable: {
          overflowX: 'hidden-scroll'
        }
      }); // The List class only refreshes itself when visible, so
      // since this is an offscreen, rendering element
      // we have to fake visibility.

      Object.defineProperty(me.chipView, 'isVisible', {
        get() {
          return true;
        }

      });
    }

    return me._chipView;
  }

  renderer({
    cellElement,
    value,
    isExport
  }) {
    value = value.filter(a => a.resource).sort((lhs, rhs) => lhs.resourceName.localeCompare(rhs.resourceName));

    if (isExport) {
      return value.map(this.itemTpl).join(',');
    } else {
      const {
        chipView
      } = this;
      chipView.store.storage.replaceValues({
        values: value,
        silent: true
      });
      chipView.refresh();
      const chipCloneElement = chipView.element.cloneNode(true);
      chipCloneElement.removeAttribute('id');
      cellElement.innerHTML = '<div class="b-assignment-chipview-wrap"></div>';
      cellElement.firstElementChild.appendChild(chipCloneElement);
    }
  }

  rendererWithAvatars({
    record: taskRecord,
    value,
    isExport
  }) {
    const me = this,
          {
      size
    } = me.avatarRendering,
          nbrVisible = Math.floor((me.width - me.sideMargin) / (size + 2)),
          overflowCount = value.length > nbrVisible ? value.length - nbrVisible : 0;
    value = value.filter(a => a.resource).sort((lhs, rhs) => lhs.resourceName.localeCompare(rhs.resourceName));

    if (isExport) {
      return value.map(this.itemTpl).join(',');
    }

    return {
      className: 'b-resource-avatar-container',
      children: value.map((assignmentRecord, i) => {
        const {
          resource: resourceRecord
        } = assignmentRecord;

        if (i < nbrVisible) {
          const isLastOverflowing = overflowCount > 0 && i === nbrVisible - 1,
                imgConfig = me.renderAvatar({
            taskRecord,
            resourceRecord,
            assignmentRecord,
            overflowCount: isLastOverflowing ? overflowCount : 0
          });

          if (isLastOverflowing) {
            return {
              className: 'b-overflow-img',
              style: {
                height: size + 'px',
                width: size + 'px'
              },
              children: [imgConfig, {
                tag: 'span',
                className: 'b-overflow-count',
                html: `+${overflowCount}`
              }]
            };
          }

          return imgConfig;
        }
      })
    };
  }

  renderAvatar({
    taskRecord,
    resourceRecord,
    assignmentRecord,
    overflowCount
  }) {
    const {
      resourceImageFolderPath
    } = this.grid,
          imageUrl = resourceRecord.imageUrl || resourceRecord.image && resourceImageFolderPath && resourceImageFolderPath + resourceRecord.image,
          avatar = this.avatarRendering.getResourceAvatar({
      initials: resourceRecord.initials,
      color: resourceRecord.eventColor,
      iconCls: resourceRecord.iconCls,
      defaultImageUrl: this.defaultAvatar,
      imageUrl
    }); // Some paths in avatarRendering does not yield elementData

    if (!avatar.elementData) {
      avatar.elementData = {};
    }

    Object.assign(avatar.elementData, {
      taskRecord,
      resourceRecord,
      assignmentRecord,
      overflowCount
    });
    return avatar;
  }

  get defaultAvatar() {
    const {
      grid
    } = this;
    return grid.defaultResourceImageName ? grid.resourceImageFolderPath + grid.defaultResourceImageName : '';
  }

}
ColumnStore.registerColumnType(ResourceAssignmentColumn);
ResourceAssignmentColumn._$name = 'ResourceAssignmentColumn';

/**
 * @module Gantt/column/RollupColumn
 */

/**
 * A column that displays a checkbox to edit the {@link Gantt.model.TaskModel#field-rollup rollup} data field.
 * This field indicates if a task should rollup to its closest parent or not.
 * Requires the {@link Gantt.feature.Rollups Rollups} feature to be enabled.
 *
 * This column uses a {@link Core.widget.Checkbox checkbox} as its editor, and it is not intended to be changed.
 *
 * @extends Grid/column/CheckColumn
 * @classType rollup
 */

class RollupColumn extends CheckColumn {
  static get $name() {
    return 'RollupColumn';
  }

  static get type() {
    return 'rollup';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'rollup',
      text: 'L{Rollup}'
    };
  }

}
ColumnStore.registerColumnType(RollupColumn);
RollupColumn._$name = 'RollupColumn';

/**
 * @module Gantt/column/SchedulingModeColumn
 */

/**
 * A column which displays a task's scheduling {@link Gantt.model.TaskModel#field-schedulingMode mode} field.
 *
 * Default editor is a {@link SchedulerPro.widget.SchedulingModePicker SchedulingModePicker}.
 *
 * @extends Grid/column/Column
 * @classType schedulingmodecolumn
 */

class SchedulingModeColumn extends Column {
  static get $name() {
    return 'SchedulingModeColumn';
  }

  static get type() {
    return 'schedulingmodecolumn';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'schedulingMode',
      text: 'L{Scheduling Mode}',
      editor: {
        type: SchedulingModePicker.type,
        allowInvalid: false,
        picker: {
          minWidth: '8.5em'
        }
      }
    };
  }

  afterConstruct() {
    const me = this;
    super.afterConstruct();
    let store; // we need to trigger the column refresh **after** the editor locale change
    // to display properly translated scheduling modes

    if (me.editor) {
      FunctionHelper.createSequence(me.editor.updateLocalization, me.onEditorLocaleChange, me);
      store = me.editor.store;
    } else {
      store = new SchedulingModePicker().store;
    }

    this.store = store;
  }

  renderer({
    value
  }) {
    const model = this.store.getById(value);
    return model && model.text || '';
  } // * reactiveRenderer() {
  //     const
  //         value = yield this.record.$.schedulingMode,
  //         model = this.column.editor.store.getById(value);
  //
  //     return model && model.text || '';
  // }
  // Refreshes the column **after** the editor locale change
  // to display properly translated scheduling modes

  onEditorLocaleChange() {
    this.grid.refreshColumn(this);
  }

}
ColumnStore.registerColumnType(SchedulingModeColumn);
SchedulingModeColumn._$name = 'SchedulingModeColumn';

/**
 * @module Gantt/column/SequenceColumn
 */

/**
 * A "calculated" column which displays the sequential position of the task in the project.
 *
 * There is no `editor`, since value is read-only.
 *
 * See {@link Gantt.model.TaskModel#property-sequenceNumber} for details.
 *
 * @extends Grid/column/Column
 * @classType sequence
 */

class SequenceColumn extends Column {
  static get $name() {
    return 'SequenceColumn';
  }

  static get type() {
    return 'sequence';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'sequenceNumber',
      text: 'L{Sequence}',
      sortable: false,
      groupable: false,
      filterable: false,
      width: 70,
      editor: null
    };
  }

}
ColumnStore.registerColumnType(SequenceColumn);
SequenceColumn._$name = 'SequenceColumn';

/**
 * @module Gantt/column/ShowInTimelineColumn
 */

/**
 * Column that shows if a task should be shown in the {@link SchedulerPro.widget.Timeline Timeline} widget.
 *
 * This column uses a {@link Core.widget.Checkbox checkbox} as its editor, and it is not intended to be changed.
 *
 * @extends Grid/column/CheckColumn
 * @classType showintimeline
 */

class ShowInTimelineColumn extends CheckColumn {
  static get $name() {
    return 'ShowInTimelineColumn';
  }

  static get type() {
    return 'showintimeline';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'showInTimeline',
      text: 'L{Show in timeline}'
    };
  }

}
ColumnStore.registerColumnType(ShowInTimelineColumn);
ShowInTimelineColumn._$name = 'ShowInTimelineColumn';

/**
 * @module Gantt/column/StartDateColumn
 */

/**
 * A column that displays (and allows user to update) the task's {@link Gantt.model.TaskModel#field-startDate start date}.
 *
 * Default editor is a {@link SchedulerPro.widget.StartDateField StartDateField}.
 *
 * If {@link #config-format} is omitted, Gantt's {@link Scheduler.view.mixin.TimelineViewPresets#config-displayDateFormat} will be used as a default value and
 * the format will be dynamically updated while zooming according to the {@link Scheduler.preset.ViewPreset#field-displayDateFormat} value specified for the ViewPreset being selected.
 *
 * @extends Gantt/column/GanttDateColumn
 * @classType startdate
 */

class StartDateColumn extends GanttDateColumn {
  static get $name() {
    return 'StartDateColumn';
  }

  static get type() {
    return 'startdate';
  }

  static get defaults() {
    return {
      field: 'startDate',
      text: 'L{Start}'
    };
  }

  get defaultEditor() {
    const editorCfg = super.defaultEditor;
    editorCfg.type = 'startdate';
    return editorCfg;
  }

}
ColumnStore.registerColumnType(StartDateColumn);
StartDateColumn._$name = 'StartDateColumn';

/**
 * @module Gantt/column/SuccessorColumn
 */

/**
 * A column which displays, in textual form, the dependencies which link from the
 * contextual to successor tasks.
 *
 * This type of column is editable by default. Default editor is a {@link Gantt/widget/DependencyField}.
 *
 * @classType successor
 * @extends Gantt/column/DependencyColumn
 */

class SuccessorColumn extends DependencyColumn {
  static get $name() {
    return 'SuccessorColumn';
  }

  static get type() {
    return 'successor';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      text: 'L{Successors}',
      field: 'successors'
    };
  }

}
ColumnStore.registerColumnType(SuccessorColumn);
SuccessorColumn._$name = 'SuccessorColumn';

/**
 * @module Gantt/column/TotalSlackColumn
 */

/**
 * A column that displays the task's {@link Gantt.model.TaskModel#field-totalSlack total slack}.
 *
 * Default editor is a {@link Core.widget.DurationField DurationField}.
 *
 * @extends Scheduler/column/DurationColumn
 * @classType totalslack
 */

class TotalSlackColumn extends DurationColumn {
  static get $name() {
    return 'TotalSlackColumn';
  }

  static get type() {
    return 'totalslack';
  }

  static get isGanttColumn() {
    return true;
  }

  get durationUnitField() {
    return 'slackUnit';
  }

  static get defaults() {
    return {
      field: 'totalSlack',
      text: 'L{Total Slack}'
    };
  }

}
ColumnStore.registerColumnType(TotalSlackColumn);
TotalSlackColumn._$name = 'TotalSlackColumn';

/**
 * @module Gantt/column/WBSColumn
 */

/**
 * A calculated column which displays the _WBS_ (_Work Breakdown Structure_) for the tasks - the position of the task
 * in the project tree structure.
 *
 * While there is no `editor`, since the WBS is a calculated value, there is a `renumber` item in the `headerMenuItems`
 * that allows the user to {@link Gantt.model.TaskModel#function-refreshWbs refresh} the WBS values.
 *
 * @extends Grid/column/Column
 * @classType wbs
 */

class WBSColumn extends Column {
  static get $name() {
    return 'WBSColumn';
  }

  static get type() {
    return 'wbs';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'wbsValue',
      text: 'L{WBS}',
      width: 70,
      editor: null,

      filterable({
        value,
        record
      }) {
        // value might be WBS instance
        return record.wbsValue.match(String(value));
      },

      headerMenuItems: {
        renumber: {
          text: 'L{WBSColumn.renumber}',
          icon: 'b-icon-renumber',

          onItem({
            source
          }) {
            source.taskStore.rootNode.refreshWbs();
          }

        }
      },

      // This renderer is required to force string WBS value for TableExporter. zipcelx will call `valueOf` (value + '')
      // which would return padded value.
      renderer({
        value
      }) {
        return String(value);
      }

    };
  }

}
ColumnStore.registerColumnType(WBSColumn);
WBSColumn._$name = 'WBSColumn';

/**
 * @module Gantt/column/AllColumns
 *
 * Imports all currently developed Gantt columns and re-exports them in an object.
 * Should be used to import and register all Gantt columns.
 */

var AllColumns = {
  AddNewColumn,
  CalendarColumn,
  ConstraintDateColumn,
  ConstraintTypeColumn,
  DeadlineDateColumn,
  DurationColumn,
  EarlyEndDateColumn,
  EarlyStartDateColumn,
  EffortColumn,
  EndDateColumn,
  InactiveColumn,
  LateEndDateColumn,
  LateStartDateColumn,
  ManuallyScheduledColumn,
  MilestoneColumn,
  NameColumn,
  NoteColumn,
  PercentDoneColumn,
  PredecessorColumn,
  ResourceAssignmentColumn,
  RollupColumn,
  SchedulingModeColumn,
  SequenceColumn,
  ShowInTimelineColumn,
  StartDateColumn,
  SuccessorColumn,
  TotalSlackColumn,
  WBSColumn
};

/**
 * A column that displays (and allows user to update) the task's
 * {@link Gantt.model.TaskModel#field-manuallyScheduled manuallyScheduled} field.
 *
 * This column uses a {@link Core.widget.Checkbox checkbox} as its editor, and it is not intended to be changed.
 *
 * @extends Grid/column/CheckColumn
 * @classType eventmode
 */

class EventModeColumn extends CheckColumn {
  static get $name() {
    return 'EventModeColumn';
  }

  static get type() {
    return 'eventmode';
  }

  static get isGanttColumn() {
    return true;
  }

  static get defaults() {
    return {
      field: 'manuallyScheduled',
      align: 'left',
      text: 'L{Event mode}'
    };
  }

  constructor(config, store) {
    super(...arguments);
    this.internalCellCls = 'b-eventmode-cell';
  }

  internalRenderer({
    value,
    cellElement,
    column,
    isExport
  }) {
    super.internalRenderer(...arguments);

    if (isExport) {
      return this.renderText(value);
    } else {
      if (cellElement.widget) {
        cellElement.widget.text = this.renderText(value);
      }
    }
  }

  onCheckboxChange({
    source,
    checked
  }) {
    super.onCheckboxChange(...arguments);
    source.text = this.renderText(checked);
  }

  renderText(value) {
    return value ? this.L('L{Manual}') : this.L('L{Auto}');
  }

}
ColumnStore.registerColumnType(EventModeColumn);
EventModeColumn._$name = 'EventModeColumn';

/**
 * @module Gantt/column/TimeAxisColumn
 */

/**
 * A column containing the timeline "viewport", in which tasks, dependencies etc are drawn.
 * Normally you do not need to interact with or create this column, it is handled by Gantt.
 *
 * @extends Scheduler/column/TimeAxisColumn
 * @typings Scheduler/column/TimeAxisColumn -> Scheduler/column/SchedulerTimeAxisColumn
 */

class TimeAxisColumn extends TimeAxisColumn$1 {
  static get defaults() {
    return {
      /**
       * Set to `false` to disable {@link Gantt.feature.TaskMenu TaskMenu} for the cell elements in this column.
       * @config {Boolean} enableCellContextMenu
       * @default true
       * @category Menu
       */
      enableCellContextMenu: true
    };
  }

}
ColumnStore.registerColumnType(TimeAxisColumn);
TimeAxisColumn._$name = 'TimeAxisColumn';

/**
 * @module Gantt/data/AssignmentStore
 */

/**
 * A class representing a collection of assignments between tasks in the {@link Gantt/data/TaskStore} and resources
 * in the {@link Gantt/data/ResourceStore}.
 *
 * ```javascript
 * const assignmentStore = new AssignmentStore({
 *     data : [
 *         { "id" : 1, "event" : 11,  "resource" : 1 },
 *         { "id" : 2, "event" : 12,  "resource" : 1 },
 *     ]
 * })
 * ```
 *
 * Contains a collection of the {@link Gantt/model/AssignmentModel} records.
 *
 * @extends SchedulerPro/data/AssignmentStore
 * @typings SchedulerPro/data/AssignmentStore -> SchedulerPro/data/SchedulerProAssignmentStore
 */

class AssignmentStore extends AssignmentStore$1 {
  static get defaultConfig() {
    return {
      modelClass: AssignmentModel,

      /**
       * CrudManager must load stores in the correct order. Lowest first.
       * @private
       */
      loadPriority: 500,

      /**
       * CrudManager must sync stores in the correct order. Lowest first.
       * @private
       */
      syncPriority: 400
    };
  }

}
AssignmentStore._$name = 'AssignmentStore';

/**
 * @module Gantt/model/CalendarModel
 */

/**
 * This class represents a calendar in the Gantt project. It contains a collection of the {@link SchedulerPro.model.CalendarIntervalModel}.
 * Every interval can be either recurrent (regularly repeating in time) or static.
 *
 * Please refer to the [calendars guide](#Gantt/guides/basics/calendars.md) for details
 *
 * @extends SchedulerPro/model/CalendarModel
 *
 * @typings SchedulerPro/model/CalendarModel -> SchedulerPro/model/SchedulerProCalendarModel
 */

class CalendarModel extends CalendarModel$1 {}
CalendarModel._$name = 'CalendarModel';

/**
 * @module Gantt/data/CalendarManagerStore
 */

/**
 * A class representing the tree of calendars in the Gantt chart. An individual calendar is represented as an instance of the
 * {@link Gantt.model.CalendarModel} class. The store expects the data loaded to be hierarchical. Each parent node should
 * contain its children in a property called 'children'.
 *
 * Please refer to the [calendars guide](#Gantt/guides/basics/calendars.md) for details
 *
 * @extends SchedulerPro/data/CalendarManagerStore
 * @typings SchedulerPro/data/CalendarManagerStore -> SchedulerPro/data/SchedulerProCalendarManagerStore
 */

class CalendarManagerStore extends CalendarManagerStore$1 {
  static get defaultConfig() {
    return {
      modelClass: CalendarModel
    };
  }

}
CalendarManagerStore._$name = 'CalendarManagerStore';

/**
 * @module Gantt/model/DependencyModel
 */

/**
 * This class represents a single dependency between the tasks in your Gantt project.
 *
 * ## Subclassing the Dependency class
 *
 * The name of any field in data can be customized in the subclass, see the example below.
 *
 * ```javascript
 * class MyDependencyModel extends DependencyModel {
 *   static get fields() {
 *     return [
 *       { name: 'to', dataSource : 'targetId' },
 *       { name: 'from', dataSource : 'sourceId' }
 *     ];
 *   }
 * }
 * ```
 * @extends SchedulerPro/model/DependencyModel
 *
 * @typings Scheduler/model/DependencyModel -> Scheduler/model/SchedulerDependencyModel
 * @typings SchedulerPro/model/DependencyModel -> SchedulerPro/model/SchedulerProDependencyModel
 */

class DependencyModel extends DependencyModel$1 {
  constructor(...args) {
    const [config] = args;

    if (config !== null && config !== void 0 && config.fromTask) {
      config.fromEvent = config.fromTask;
    }

    if (config !== null && config !== void 0 && config.toTask) {
      config.toEvent = config.toTask;
    }

    super(...args);
  }

  get from() {
    var _this$fromEvent;

    return (_this$fromEvent = this.fromEvent) === null || _this$fromEvent === void 0 ? void 0 : _this$fromEvent.id;
  }
  /**
   * The origin task of this dependency.
   *
   * Accepts multiple formats but always returns an {@link Gantt.model.TaskModel}.
   *
   * **NOTE:** This is not a proper field but rather an alias, it will be serialized but cannot be remapped. If you
   * need to remap, consider using {@link #field-from} instead.
   *
   * @field {Gantt.model.TaskModel} fromTask
   * @accepts {String|Number|Gantt.model.TaskModel}
   * @category Dependency
   */

  /**
   * The destination task of this dependency.
   *
   * Accepts multiple formats but always returns an {@link Gantt.model.TaskModel}.
   *
   * **NOTE:** This is not a proper field but rather an alias, it will be serialized but cannot be remapped. If you
   * need to remap, consider using {@link #field-to} instead.
   *
   * @field {Gantt.model.TaskModel} toTask
   * @accepts {String|Number|Gantt.model.TaskModel}
   * @category Dependency
   */

  get fromTask() {
    return this.fromEvent;
  }

  set fromTask(task) {
    this.fromEvent = task;
  }

  get to() {
    var _this$toEvent;

    return (_this$toEvent = this.toEvent) === null || _this$toEvent === void 0 ? void 0 : _this$toEvent.id;
  }

  get toTask() {
    return this.toEvent;
  }

  set toTask(task) {
    this.toEvent = task;
  } // Override persistable getter to prevent sending whole task data but sending only the id only
  // TODO: Remove as part of https://github.com/bryntum/support/issues/1955

  get persistableData() {
    const data = super.persistableData,
          {
      fromTask,
      toTask
    } = data;

    if (fromTask) {
      data.fromTask = fromTask.id;
    }

    if (toTask) {
      data.toTask = toTask.id;
    }

    return data;
  }

}
DependencyModel._$name = 'DependencyModel';

/**
 * @module Gantt/data/DependencyStore
 */

/**
 * A class representing a collection of dependencies between tasks in the {@link Gantt.data.TaskStore}.
 * Contains a collection of {@link Gantt.model.DependencyModel} records.
 *
 * ```javascript
 * const dependencyStore = new DependencyStore({
 *      data : [
 *         {
 *              "id"       : 1,
 *              "fromTask" : 11,
 *              "toTask"   : 15,
 *              "lag"      : 2
 *          },
 *          {
 *              "id"       : 2,
 *              "fromTask" : 12,
 *              "toTask"   : 15
 *          }
 *      ]
 * })
 * ```
 * @extends SchedulerPro/data/DependencyStore
 * @typings SchedulerPro/data/DependencyStore -> SchedulerPro/data/SchedulerProDependencyStore
 */

class DependencyStore extends DependencyStore$1 {
  static get defaultConfig() {
    return {
      modelClass: DependencyModel,

      /**
       * CrudManager must load stores in the correct order. Lowest first.
       * @private
       */
      loadPriority: 300,

      /**
       * CrudManager must sync stores in the correct order. Lowest first.
       * @private
       */
      syncPriority: 500
    };
  }

}
DependencyStore._$name = 'DependencyStore';

/**
 * @module Gantt/model/ResourceModel
 */

/**
 * This class represents a single resource in your Gantt project.
 *
 * If you want to add or change some fields, describing resources - subclass this class:
 *
 * ```javascript
 * class MyResourceModel extends ResourceModel {
 *
 *   static get fields() {
 *     return [
 *       { name: 'company', type: 'string' }
 *     ]
 *   }
 * }
 * ```
 *
 * See also: {@link Gantt.model.AssignmentModel}
 * @extends SchedulerPro/model/ResourceModel
 *
 * @typings SchedulerPro/model/ResourceModel -> SchedulerPro/model/SchedulerProResourceModel
 */

class ResourceModel extends ResourceModel$1 {}
ResourceModel._$name = 'ResourceModel';

/**
 * @module Gantt/data/ResourceStore
 */

/**
 * A class representing the collection of the resources - {@link Gantt.model.ResourceModel} records.
 *
 * ```javascript
 * const resourceStore = new ResourceStore({
 *      data : [
 *          { "id" : 1, "name" : "John Doe" },
 *          { "id" : 2, "name" : "Jane Doe" }
 *      ]
 * })
 * ```
 * @extends SchedulerPro/data/ResourceStore
 * @typings SchedulerPro/data/ResourceStore -> SchedulerPro/data/SchedulerProResourceStore
 */

class ResourceStore extends ResourceStore$1 {
  static get defaultConfig() {
    return {
      modelClass: ResourceModel,

      /**
       * CrudManager must load stores in the correct order. Lowest first.
       * @private
       */
      loadPriority: 400,

      /**
       * CrudManager must sync stores in the correct order. Lowest first.
       * @private
       */
      syncPriority: 200
    };
  }

}
ResourceStore._$name = 'ResourceStore';

/**
 * @module Gantt/model/Baseline
 */

/**
 * This class represents a baseline of a Task.
 *
 * @extends Scheduler/model/TimeSpan
 */

class Baseline extends TimeSpan {
  //region Fields
  // TODO: handle persist? defaultValue?
  static get fields() {
    return [
    /**
     * The owning Task of the Baseline
     * @field {Gantt.model.TaskModel} task
     */
    {
      name: 'task',
      persist: false
    }
    /**
     * Start date of the baseline in ISO 8601 format.
     *
     * Note that the field always returns a `Date`.
     *
     * @field {Date} startDate
     * @accepts {String|Date}
     */

    /**
     * End date of the baseline in ISO 8601 format.
     *
     * Note that the field always returns a `Date`.
     *
     * @field {Date} endDate
     * @accepts {String|Date}
     */

    /**
     * An encapsulation of the CSS classes to be added to the rendered baseline element.
     *
     * Always returns a {@link Core.helper.util.DomClassList}, but may still be treated as a string. For
     * granular control of adding and removing individual classes, it is recommended to use the
     * {@link Core.helper.util.DomClassList} API.
     *
     * @field {Core.helper.util.DomClassList} cls
     * @accepts {Core.helper.util.DomClassList|String}
     */
    ];
  } //endregion
  //region Init
  //endregion

  get isBaseline() {
    return true;
  } //region Milestone

  get milestone() {
    // a summary baseline may have zero duration when "recalculateParents" is on
    // and a child baseline has working time on the summary baseline non-working time
    // so we operate start and end date pair here
    if (!this.isLeaf) {
      const {
        startDate,
        endDate
      } = this;

      if (startDate && endDate) {
        return endDate.getTime() === startDate.getTime();
      }
    }

    return this.duration === 0;
  }

  set milestone(value) {
    value ? this.convertToMilestone() : this.convertToRegular();
  }

  async setMilestone(value) {
    return value ? this.convertToMilestone() : this.convertToRegular();
  }
  /**
   * Converts this baseline to a milestone (start date will match the end date).
   *
   * @propagating
   */

  async convertToMilestone() {
    return this.setDuration(0, this.durationUnit, false);
  }
  /**
   * Converts a milestone baseline to a regular baseline with a duration of 1 (keeping current `durationUnit`).
   *
   * @propagating
   */

  async convertToRegular() {
    if (this.milestone) {
      return this.setDuration(1, this.durationUnit, false);
    }
  } //endregion
  // Uses engine to calculate dates and/or duration.

  normalize() {
    const me = this,
          {
      task,
      startDate,
      endDate,
      duration
    } = me,
          hasDuration = duration != null;

    if (!task.graph) {
      super.normalize();
    } else {
      // need to calculate duration (checking first since seemed most likely to happen)
      if (startDate && endDate && !hasDuration) {
        me.setData('duration', task.run('calculateProjectedDuration', startDate, endDate));
      } // need to calculate endDate
      else if (startDate && !endDate && hasDuration) {
        me.setData('endDate', task.run('calculateProjectedXDateWithDuration', startDate, true, duration));
      } // need to calculate startDate
      else if (!startDate && endDate && hasDuration) {
        me.setData('startDate', task.run('calculateProjectedXDateWithDuration', endDate, false, duration));
      }
    }
  }

}
Baseline._$name = 'Baseline';

/**
 * @module Gantt/data/Wbs
 */
const zeroPad = v => String(v).padStart(6, '0');
/**
 * This class holds a WBS (Work Breakdown Structure) value (e.g., '1.2.1'). This class ensures that such values compare
 * correctly, for example, that '1.2' is less than '1.10' (which do not compare that way as simple text).
 */

class Wbs {
  /**
   * Wbs constructor.
   * @param {String|Number} value The value of WBS
   */
  constructor(value) {
    this.value = value;
    this._padded = null;
  }
  /**
   * The WBS value
   * @readonly
   * @member {String} value
   */

  set value(value) {
    this._value = String(value !== null && value !== void 0 ? value : '');
  }

  get value() {
    return this._value;
  }
  /**
   * Returns a `Wbs` instance given a `value`. If the `value` is already a `Wbs` object, it is returned. Otherwise,
   * a new `Wbs` is created. If `value` is `null` or `undefined`, that value is returned.
   * @param {String|Number|Gantt.data.Wbs} value
   * @returns {Gantt.data.Wbs}
   */

  static from(value) {
    // this must preserve null to be useful as a data field, where a null value means no value present.
    return value == null ? value : value instanceof Wbs ? value : new Wbs(value);
  }
  /**
   * Returns a WBS code where each component is 0-padded on the left to 6 digits. That is "1.2" is padded to be
   * "000001.000002". These values can be compared for proper semantic order (e.g., Wbs.pad('1.2') < Wbs.pad('1.10')).
   * @param {String|Number|Gantt.data.Wbs} value
   * @returns {String}
   * @private
   */

  static pad(value) {
    return value instanceof Wbs ? value.valueOf() : Wbs.split(value).map(zeroPad).join('.');
  }
  /**
   * Returns an array of digits from a given WBS code `value`. If the value cannot be converted, an empty array is
   * returned.
   * @param {String|Number|Gantt.data.Wbs} value
   * @returns {Number[]}
   * @private
   */

  static split(value) {
    let i, ret;

    if (value || value === 0) {
      switch (typeof value) {
        case 'object':
          value = String(value);
        // noinspection FallThroughInSwitchStatementJS

        case 'string':
          // eslint-disable-line no-fallthrough
          ret = value.split('.');

          for (i = ret.length; i-- > 0;) {
            ret[i] = parseInt(ret[i], 10);
          }

          break;

        case 'number':
          ret = [value];
          break;
      }
    }

    return ret || [];
  }
  /**
   * Compares two WBS values, returning 0 if equal, -1 if `lhs` is less than `rhs, or 1 if `lhs` is greater than `rhs`.
   * @param {String|Gantt.data.Wbs} lhs
   * @param {String|Gantt.data.Wbs} rhs
   * @returns {Number}
   */

  static compare(lhs, rhs) {
    if (lhs === rhs) {
      return 0;
    }

    if (!lhs || !rhs) {
      return lhs ? 1 : rhs ? -1 : 0;
    }

    lhs = Wbs.pad(lhs);
    rhs = Wbs.pad(rhs);
    return lhs < rhs ? -1 : rhs < lhs ? 1 : 0;
  }
  /**
   * Appends a sub-level WBS value to this WBS code and returns a `Wbs` instance for it.
   * @param {String|Number} value
   * @returns {Gantt.data.Wbs}
   */

  append(value) {
    const s = this.value;
    return Wbs.from(s ? `${s}.${value}` : value);
  }
  /**
   * Returns truthy value if this Wbs equals the passed value.
   * @param {String|Gantt.data.Wbs} value
   * @return {Boolean}
   */

  isEqual(value) {
    return !Wbs.compare(this, value);
  }
  /**
   * Compares this WBS value with a specified pattern, returning `true` if they match. If the `pattern` is simply a
   * sequence of digits and decimal points (e.g., "1.2"), it is a match if it is a substring of this WBS code (e.g.,
   * "3.1.2.4"). If the `pattern` starts with `*` (e.g., "*.1.2"), it is a match if this WBS code ends with the text
   * following the `*` (e.g., "4.3.1.2"). If the `pattern` ends with `*`, it is a match if this WBS code starts with
   * the text up to the `*`.
   *
   * Some examples:
   * ```
   *  console.log(Wbs.from('1.2.3.4').match('2.3'));
   *  > true
   *  console.log(Wbs.from('1.2.3.4').match('*.4'));
   *  > true
   *  console.log(Wbs.from('1.2.3.4').match('1.2.*'));
   *  > true
   *
   *  console.log(Wbs.from('1.2.3.4').match('2.4'));
   *  > false
   *  console.log(Wbs.from('1.2.3.4').match('*.3'));
   *  > false
   *  console.log(Wbs.from('1.2.3.4').match('2.*'));
   *  > false
   * ```
   * @param {String} pattern A partial WBS code (e.g., "1.2"), optionally starting or ending with `*`.
   * @returns {Boolean}
   */

  match(pattern) {
    let ret = false;

    if (pattern) {
      const wbs = this.value,
            globLeft = pattern[0] === '*',
            globRight = pattern.endsWith('*'),
            n = pattern.length;

      if (globLeft === globRight) {
        // no globs behavior is the same as both globs ('1.2' is the same as '*1.2*')
        ret = wbs.indexOf(globLeft ? pattern.substr(1, n - 2) : pattern) > -1;
      } else if (globLeft) {
        ret = wbs.endsWith(pattern.substr(1));
      } else {
        ret = wbs.startsWith(pattern.substr(0, n - 1));
      }
    }

    return ret;
  }

  toString() {
    return this.value;
  }

  toJSON() {
    return this.toString();
  }

  valueOf() {
    var _this$_padded;

    // the value we return is implicitly used by < and > operators when comparing instances of this type, so we
    // need to return a value that makes "1.2 < 1.10" evaluate as true:
    return (_this$_padded = this._padded) !== null && _this$_padded !== void 0 ? _this$_padded : this._padded = Wbs.pad(this.value);
  }

}
Wbs._$name = 'Wbs';

/**
 * @module Gantt/data/field/WbsField
 */

/**
 * This class is used for a WBS (Work Breakdown Structure) field. These fields hold a {@link Gantt.data.Wbs}
 * object for their value.
 *
 * @extends Core/data/field/DataField
 */

class WbsField extends DataField {
  static get type() {
    return 'wbs';
  }

  convert(value) {
    return Wbs.from(value);
  }

  serialize(value) {
    // the wbsValue field is not persistent, so this is likely not going to be called... however, the user could
    // flip that option so we implement this method in case that happens.
    return String(value);
  }

}
WbsField.prototype.compare = Wbs.compare;
WbsField.initClass();
WbsField._$name = 'WbsField';

/**
 * @module Gantt/model/TaskModel
 */

const // A utility function to populate a Task's baseline with the Task's default values
applyBaselineDefaults = (task, baselines) => {
  const {
    startDate,
    durationUnit,
    endDate
  } = task;
  return baselines ? baselines.map(baseline => {
    // Baseline has its own data if at least two of the following are defined.
    // The remaining data, if incomplete, will be calculated in Baseline normalize() method
    const hasData = +Boolean(baseline.startDate) + Boolean(baseline.endDate) + Boolean(baseline.duration) > 1,
          data = _objectSpread2({
      task
    }, baseline);

    if (!hasData) {
      Object.assign(data, {
        startDate,
        endDate,
        durationUnit
      });
    }

    return data;
  }) : [];
},
      descendingWbsSorter = s => s.field === 'wbsValue' && !s.ascending,
      isReversed = children => {
  for (let firstChildWbs, childWbs, i = 0, n = children.length; i < n; ++i) {
    childWbs = children[i].wbsValue;

    if (childWbs) {
      if (firstChildWbs) {
        return childWbs < firstChildWbs;
      }

      firstChildWbs = childWbs;
    }
  }

  return false;
},
      // Refresh siblings in depth when it's not initial WBS calculation
refreshWbsOptions = {
  deep: true
},
      // Record should not be considered modified by initial assignment of wbsValue
refreshWbsOnJoinOptions = {
  deep: true,
  silent: true
};
/**
 * This class represents a task in your Gantt project. Extend it to add your own custom task fields and methods.
 *
 * ## Subclassing the TaskModel class
 * To subclass the TaskModel and add extra {@link Core.data.Model#property-fields-static} and API methods, please see
 * the snippet below.
 *
 *```javascript
 * class MyTaskModel extends TaskModel {
 *   static get fields() {
 *       return [
 *           { name: 'importantDate', type: 'date' }
 *       ]
 *   }
 *```
 *
 * After creating your own Task model class, configure the {@link Gantt.model.ProjectModel#config-taskModelClass} on
 * Project to use it:
 *
 *```javascript
 * new Gantt({
 *     project : {
 *         taskModelClass : MyTaskModel
 *     }
 * });
 *```
 *
 * ## Creating a new Task programmatically
 *
 * To create a new task programmatically, simply call the TaskModel constructor and pass in any field values.
 *
 * ```javascript
 * const newTask = new TaskModel({
 *     name          : 'My awesome task',
 *     importantDate : new Date(2022, 0, 1),
 *     percentDone   : 80 // So awesome it's almost done
 *     // ...
 * });
 * ```
 *
 * ## Async scheduling
 *
 * A record created from an {@link Gantt/model/TaskModel} is normally part of a {@link Gantt/data/TaskStore}, which in
 * turn is part of a {@link Gantt/model/ProjectModel project}.
 * When dates or the duration of a task is changed, the project performs async calculations of the other related fields
 * (including the field of other tasks affected by the change).
 * For example if {@link #field-duration} is changed, it will recalculate {@link #field-endDate}.
 *
 * As a result of this being an async operation, the values of other fields are not guaranteed to be up to date
 * immediately after a change. To ensure data is up to date, `await` the calculations to finish.
 *
 * For example, `endDate` is not up to date after this operation:
 *
 * ```javascript
 * taskRecord.duration = 5;
 * // taskRecord.endDate not yet calculated
 * ```
 *
 * But if calculations are awaited it is up to date:
 *
 * ```javascript
 * taskRecord.duration = 5;
 * await taskRecord.project.commitAsync();
 * // endDate is calculated
 * ```
 *
 * In case of multiple changes no need to trigger recalculation after each of them:
 *
 * ```javascript
 * // change taskRecord1 start and duration
 * taskRecord1.startDate = '2021-11-15';
 * taskRecord1.duration = 5;
 * // change taskRecord2 duration
 * taskRecord2.duration = 1;
 * // change taskRecord3 finish date
 * taskRecord3.endDate = '2021-11-17';
 *
 * // now when all changes are done trigger rescheduling
 * await taskRecord.project.commitAsync();
 * ```
 *
 * ## Manually vs automatically scheduled tasks
 *
 * A task can be either **automatically** (default) or **manually** scheduled. This is defined by the
 * {@link #field-manuallyScheduled} field. Manually scheduled tasks are not affected by the automatic scheduling
 * process, which means their start/end dates are meant to be changed by user manually. Such tasks are not shifted
 * by their predecessors nor such summary tasks rollup their children start/end dates.
 * While automatically scheduled tasks start/end dates are calculated by the Gantt.
 *
 * ## Start and end dates
 *
 * For all tasks, the end date is non-inclusive: {@link #field-startDate} <= date < {@link #field-endDate}.
 * Example: a task which starts at 2020/07/18 and has 2 days duration, should have the end date: 2020/07/20, **not**
 * 2018/07/19 23:59:59.
 * The start and end dates of tasks in are *points* on the time axis and if you specify that a task starts
 * 01/01/2020 and has 1 day duration, that means the start point is 01/01/2020 00:00 and end point is 02/01/2020 00:00.
 *
 * @mixes SchedulerPro/data/mixin/PartOfProject
 * @mixes SchedulerPro/model/mixin/PercentDoneMixin
 *
 * @extends Scheduler/model/TimeSpan
 */

class TaskModel extends GanttEvent.derive(TimeSpan).mixin(PartOfProject, PercentDoneMixin, CalendarCompatMixin) {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "$manuallyScheduled", null);
  }

  //region Fields

  /**
   * This static configuration option allows you to control whether an empty parent task should be converted into a
   * leaf. Enable/disable it for a whole class:
   *
   * ```javascript
   * TaskModel.convertEmptyParentToLeaf = false;
   * ```
   *
   * By specifying `true`, all empty parents will be considered leafs. Can also be assigned a configuration object
   * with with the following Boolean properties to customize the behaviour:
   *
   * * `onLoad` - Apply the transformation on load to any parents without children (`children : []`)
   * * `onRemove` - Apply the transformation when all children have been removed from a parent
   *
   * ```javascript
   * TaskModel.convertEmptyParentToLeaf = {
   *     onLoad   : false,
   *     onRemove : true
   * }
   * ```
   *
   * @member {Boolean|Object} convertEmptyParentToLeaf
   * @default true
   * @static
   * @category Parent & children
   */
  static get fields() {
    return [
    /**
     * Unique identifier of task (mandatory)
     * @field {String|Number} id
     * @category Common
     */

    /**
     * Name of the task
     * @field {String} name
     * @category Common
     */

    /**
     * The initial expanded state for a parent task
     * @field {Boolean} expanded
     * @category Common
     */
    {
      name: 'expanded',
      internal: true
    },
    /**
     * A set of resources assigned to this task
     * @field {Set} assigned
     * @readonly
     * @category Common
     */

    /**
     * Start date of the task in ISO 8601 format
     *
     * UI fields representing this data field are disabled for summary events
     * except the {@link #field-manuallyScheduled manually scheduled} events.
     * See {@link #function-isEditable} for details.
     *
     * Note that the field always returns a `Date`.
     *
     * @field {Date} startDate
     * @accepts {String|Date}
     * @category Scheduling
     */

    /**
     * End date of the task in ISO 8601 format
     *
     * UI fields representing this data field are disabled for summary events
     * except the {@link #field-manuallyScheduled manually scheduled} events.
     * See {@link #function-isEditable} for details.
     *
     * Note that the field always returns a `Date`.
     *
     * @field {Date} endDate
     * @accepts {String|Date}
     * @category Scheduling
     */

    /**
     * The numeric part of the task duration (the number of units).
     *
     * UI fields representing this data field are disabled for summary events
     * except the {@link #field-manuallyScheduled manually scheduled} events.
     * See {@link #function-isEditable} for details.
     *
     * @field {Number} duration
     * @category Scheduling
     */

    /**
     * An encapsulation of the CSS classes to be added to the rendered event element.
     *
     * Always returns a {@link Core.helper.util.DomClassList}, but may still be treated as a string. For
     * granular control of adding and removing individual classes, it is recommended to use the
     * {@link Core.helper.util.DomClassList} API.
     *
     * @field {Core.helper.util.DomClassList} cls
     * @accepts {Core.helper.util.DomClassList|String} cls
     * @category Styling
     */
    {
      name: 'cls',
      serialize: value => {
        return value.isDomClassList ? value.toString() : value;
      },
      persist: true
    },
    /**
     * The current status of a task, expressed as the percentage completed (integer from 0 to 100)
     *
     * UI fields representing this data field are disabled for summary events.
     * See {@link #function-isEditable} for details.
     *
     * @field {Number} percentDone
     * @category Scheduling
     */

    /**
     * The numeric part of the task effort (the number of units). The effort of the "parent" tasks will be automatically set to the sum
     * of efforts of their "child" tasks
     *
     * UI fields representing this data field are disabled for summary events.
     * See {@link #function-isEditable} for details.
     *
     * @field {Number} effort
     * @category Scheduling
     */

    /**
     * The unit part of the task duration, defaults to "day" (days). Valid values are:
     *
     * - "millisecond" - Milliseconds
     * - "second" - Seconds
     * - "minute" - Minutes
     * - "hour" - Hours
     * - "day" - Days
     * - "week" - Weeks
     * - "month" - Months
     * - "quarter" - Quarters
     * - "year"- Years
     *
     * This field is readonly after creation, to change it use the {@link #function-setDuration} call.
     * @field {String} durationUnit
     * @default "day"
     * @category Scheduling
     */

    /**
     * The unit part of the task's effort, defaults to "h" (hours). Valid values are:
     *
     * - "millisecond" - Milliseconds
     * - "second" - Seconds
     * - "minute" - Minutes
     * - "hour" - Hours
     * - "day" - Days
     * - "week" - Weeks
     * - "month" - Months
     * - "quarter" - Quarters
     * - "year"- Years
     *
     * This field is readonly after creation, to change it use the {@link #function-setEffort} call.
     * @field {String} effortUnit
     * @default "hour"
     * @category Scheduling
     */
    {
      name: 'fullEffort',
      persist: false
    },
    /**
     * The effective calendar used by the task.
     * Returns the task own {@link #field-calendar} if provided or the project {@link Gantt.model.ProjectModel#field-calendar calendar}.
     *
     * @field {Gantt.model.CalendarModel} effectiveCalendar
     * @category Scheduling
     * @calculated
     * @readonly
     */

    /**
     * The calendar, assigned to the task. Allows you to set the time when task can be performed.
     *
     * @field {Gantt.model.CalendarModel} calendar
     * @category Scheduling
     */

    /**
     * The getter will yield a {@link Core.data.Store Store} of {@link Gantt.model.Baseline}s.
     *
     * When constructing a task the baselines will be constructed from an array of
     * {@link Gantt.model.Baseline Baseline} data objects.
     * @field {Object[]} baselines
     * @category Features
     */
    {
      name: 'baselines'
    },
    /**
     * A freetext note about the task.
     * @field {String} note
     * @category Common
     */
    {
      name: 'note',
      type: 'string'
    }, {
      name: 'parentId',
      serialize: (value, record) => {
        const eventStore = record.getEventStore(),
              project = record.getProject(); // By default we send root level tasks "parentId" as NULL

        if (eventStore && eventStore.getById(value) === project) {
          value = null;
        }

        return value;
      }
    },
    /**
     * Field storing the task constraint alias or `null` if not constraint set.
     * Valid values are:
     * - "finishnoearlierthan"
     * - "finishnolaterthan"
     * - "mustfinishon"
     * - "muststarton"
     * - "startnoearlierthan"
     * - "startnolaterthan"
     *
     * @field {String|null} constraintType
     * @category Scheduling
     */

    /**
     * Field defining the constraint boundary date or `null` if {@link #field-constraintType} is `null`.
     * @field {String|Date|null} constraintDate
     * @category Scheduling
     */

    /**
     * When set to `true`, the {@link #field-startDate} of the task will not be changed by any of its incoming
     * dependencies or constraints.
     *
     * @field {Boolean} manuallyScheduled
     * @category Scheduling
     */

    /**
     * When set to `true` the task becomes inactive and stops taking part in the project scheduling (doesn't
     * affect linked tasks, rolls up its attributes and affect its assigned resources allocation).
     *
     * @field {Boolean} inactive
     * @category Scheduling
     */

    /**
     * This field defines the scheduling mode for the task. Based on this field some fields of the task
     * will be "fixed" (should be provided by the user) and some - computed.
     *
     * Possible values are:
     *
     * - `Normal` is the default (and backward compatible) mode. It means the task will be scheduled based on
     * information about its start/end dates, task own calendar (project calendar if there's no one) and
     * calendars of the assigned resources.
     *
     * - `FixedDuration` mode means, that task has fixed start and end dates, but its effort will be computed
     * dynamically, based on the assigned resources information. Typical example of such task is - meeting.
     * Meetings typically have pre-defined start and end dates and the more people are participating in the
     * meeting, the more effort is spent on the task. When duration of such task increases, its effort is
     * increased too (and vice-versa). Note: fixed start and end dates here doesn't mean that a user can't
     * update them via GUI, the only field which won't be editable in GUI is the
     * {@link #field-effort effort field}, it will be calculated according to duration and resources assigned to
     * the task.
     *
     * - `FixedEffort` mode means, that task has fixed effort and computed duration. The more resources will be
     * assigned to this task, the less the duration will be. The typical example will be a "paint the walls"
     * task - several painters will complete it faster.
     *
     * - `FixedUnits` mode means, that the assignment level of all assigned resources will be kept as provided
     * by the user, and either {@link #field-effort} or duration of the task is recalculated, based on the
     * {@link #field-effortDriven} flag.
     *
     * @field {String} schedulingMode
     * @category Scheduling
     */

    /**
     * This boolean flag defines what part of task data should be updated in the `FixedUnits` scheduling mode.
     * If it is `true`, then {@link #field-effort} is kept intact, and duration is updated. If it is `false` -
     * vice-versa.
     *
     * @field {Boolean} effortDriven
     * @default false
     * @category Scheduling
     */

    /**
     * A calculated field storing the _early start date_ of the task.
     * The _early start date_ is the earliest possible date the task can start.
     * This value is calculated based on the earliest dates of the task predecessors and the task own
     * constraints. If the task has no predecessors nor other constraints, its early start date matches the
     * project start date.
     *
     * UI fields representing this data field are naturally disabled since the field is readonly.
     * See {@link #function-isEditable} for details.
     *
     * @field {Date} earlyStartDate
     * @calculated
     * @readonly
     * @category Scheduling
     */

    /**
     * A calculated field storing the _early end date_ of the task.
     * The _early end date_ is the earliest possible date the task can finish.
     * This value is calculated based on the earliest dates of the task predecessors and the task own
     * constraints. If the task has no predecessors nor other constraints, its early end date matches the
     * project start date plus the task duration.
     *
     * UI fields representing this data field are naturally disabled since the field is readonly.
     * See {@link #function-isEditable} for details.
     *
     * @field {Date} earlyEndDate
     * @calculated
     * @readonly
     * @category Scheduling
     */

    /**
     * A calculated field storing the _late start date_ of the task.
     * The _late start date_ is the latest possible date the task can start.
     * This value is calculated based on the latest dates of the task successors and the task own constraints.
     * If the task has no successors nor other constraints, its late start date matches the project end date
     * minus the task duration.
     *
     * UI fields representing this data field are naturally disabled since the field is readonly.
     * See {@link #function-isEditable} for details.
     *
     * @field {Date} lateStartDate
     * @calculated
     * @readonly
     * @category Scheduling
     */

    /**
     * A calculated field storing the _late end date_ of the task.
     * The _late end date_ is the latest possible date the task can finish.
     * This value is calculated based on the latest dates of the task successors and the task own constraints.
     * If the task has no successors nor other constraints, its late end date matches the project end date.
     *
     * UI fields representing this data field are naturally disabled since the field is readonly.
     * See {@link #function-isEditable} for details.
     *
     * @field {Date} lateEndDate
     * @calculated
     * @readonly
     * @category Scheduling
     */

    /**
     * A calculated field storing the _total slack_ (or _total float_) of the task.
     * The _total slack_ is the amount of working time the task can be delayed without causing a delay
     * to the project end.
     * The value is expressed in {@link #field-slackUnit} units.
     *
     * ```javascript
     * // let output slack info to the console
     * console.log(`The ${task.name} task can be delayed for ${task.totalSlack} ${slackUnit}s`)
     * ```
     *
     * UI fields representing this data field are naturally disabled since the field is readonly.
     * See {@link #function-isEditable} for details.
     *
     *
     * @field {Number} totalSlack
     * @calculated
     * @readonly
     * @category Scheduling
     */

    /**
     * A calculated field storing unit for the {@link #field-totalSlack} value.
     * @field {String} slackUnit
     * @default "day"
     * @category Scheduling
     */

    /**
     * A calculated field indicating if the task is _critical_.
     * A task considered _critical_ if its delaying causes the project delay.
     * The field value is calculated based on {@link #field-totalSlack} field value.
     *
     * ```javascript
     * if (task.critical) {
     *     Toast.show(`The ${task.name} is critical!`);
     * }
     * ```
     *
     * @field {Boolean} critical
     * @calculated
     * @readonly
     * @category Scheduling
     */
    // NOTE: These are not actually fields, they are never set during task lifespan and only used by crud manager
    // to send changes to the backend
    // Two fields which specify the relations between "phantom" tasks when they are
    // being sent to the server to be created (e.g. when you create a new task containing a new child task).
    // { name : 'phantomId', type : 'string' },
    // { name : 'phantomParentId', type : 'string' },

    /**
     * Child nodes. To allow loading children on demand, specify `children : true` in your data. Omit the field
     * for leaf tasks.
     *
     * Note, if the task store loads data from a remote origin, make sure {@link Core/data/AjaxStore#config-readUrl}
     * is specified, and optionally {@link Core/data/AjaxStore#config-parentIdParamName} is set, otherwise
     * {@link Core/data/Store#function-loadChildren} has to be implemented.
     *
     * @field {Gantt.model.TaskModel[]} children
     * @accepts {Boolean|Object[]|Gantt.model.TaskModel[]}
     * @category Parent & children
     */
    {
      name: 'children',
      persist: false
    },
    /**
     * Set this to true if this task should be shown in the Timeline widget
     * @field {Boolean} showInTimeline
     * @category Features
     */
    {
      name: 'showInTimeline',
      type: 'boolean'
    },
    /**
     * Set this to true to roll up a task to its closest parent
     * @field {Boolean} rollup
     * @category Features
     */
    {
      name: 'rollup',
      type: 'boolean'
    },
    /**
     * The {@link Gantt.data.Wbs WBS} for this task record. This field is automatically calculated and
     * maintained by the store. This calculation can be refreshed by calling {@link #function-refreshWbs}.
     *
     * To get string representation of the WBS value (e.g. '2.1.3'), use {@link Gantt.data.Wbs#property-value}
     * property.
     *
     * @readonly
     * @field {Gantt.data.Wbs} wbsValue
     * @accepts {Gantt.data.Wbs|String}
     * @category Scheduling
     */
    {
      name: 'wbsValue',
      type: 'wbs',
      persist: false
    },
    /**
     * A deadline date for this task. Does not affect scheduling logic.
     *
     * Note that the field always returns a `Date`.
     *
     * @field {Date} deadlineDate
     * @accepts {String|Date}
     * @category Scheduling
     */
    {
      name: 'deadlineDate',
      type: 'date'
    }, // Override TreeNode parentIndex to make it persistable
    {
      name: 'parentIndex',
      type: 'number',
      persist: true
    },
    /**
     * CSS class specifying an icon to apply to the task row
     * @field {String} iconCls
     * @category Styling
     */
    'iconCls',
    /**
     * CSS class specifying an icon to apply to the task bar
     * @field {String} taskIconCls
     * @category Styling
     */
    'taskIconCls',
    /**
     * Specify false to prevent the event from being dragged (if {@link Gantt/feature/TaskDrag} feature is used)
     * @field {Boolean} draggable
     * @default true
     * @category Interaction
     */
    {
      name: 'draggable',
      type: 'boolean',
      persist: false,
      defaultValue: true
    }, // true or false

    /**
     * Specify false to prevent the task from being resized (if {@link Gantt/feature/TaskResize} feature is
     * used). You can also specify 'start' or 'end' to only allow resizing in one direction
     * @field {Boolean|String} resizable
     * @default true
     * @category Interaction
     */
    {
      name: 'resizable',
      persist: false,
      defaultValue: true
    } // true, false, 'start' or 'end'
    ];
  } //endregion
  //region Config
  // Flag for storing the initial manuallyScheduled value during tree transform. To avoid deoptimizing

  static get defaultConfig() {
    return {
      baselineModelClass: Baseline
    };
  } //endregion

  endBatch() {
    const {
      isPersistable: wasPersistable
    } = this;
    super.endBatch(...arguments); // If this event newly persistable, its assignments are eligible for syncing.

    if (this.isPersistable && !wasPersistable) {
      this.assignments.forEach(assignment => {
        assignment.stores.forEach(s => {
          s.updateModifiedBagForRecord(assignment);
        });
      });
    }
  }
  /**
   * Returns all predecessor dependencies of this task
   * @member {Gantt.model.DependencyModel[]} predecessors
   * @readonly
   */

  /**
   * Returns all successor dependencies of this task
   * @member {Gantt.model.DependencyModel[]} successors
   * @readonly
   */

  get isTask() {
    return true;
  }

  get isTaskModel() {
    return true;
  } // To pass as an event when using a Gantt project with Scheduler Pro

  get isEvent() {
    return true;
  }

  get wbsCode() {
    return String(this.wbsValue);
  }

  set wbsCode(value) {
    this.wbsValue = Wbs.from(value);
  }

  copy(...args) {
    const copy = super.copy(...args); // Clean wbs but do not mark as dirty

    copy.setData('wbsValue', null);
    return copy;
  }
  /**
   * Propagates changes to the dependent tasks. For example:
   *
   * ```js
   * // double a task duration
   * task.duration *= 2;
   * // call commitAsync() to do further recalculations caused by the duration change
   * task.commitAsync().then(() => console.log('Schedule updated'));
   * ```
   *
   * @method commitAsync
   * @returns {Promise}
   * @propagating
   */

  /**
   * Either activates or deactivates the task depending on the passed value.
   * Will cause the schedule to be updated - returns a `Promise`
   *
   * @method
   * @name setInactive
   * @param {Boolean} inactive `true` to deactivate the task, `false` to activate it.
   * @returns {Promise}
   * @propagating
   */

  get hasBaselines() {
    var _this$baselinesStore;

    const baselinesField = this.fieldMap.baselines;
    return Boolean(((_this$baselinesStore = this.baselinesStore) === null || _this$baselinesStore === void 0 ? void 0 : _this$baselinesStore.count) || this.originalData[baselinesField.dataSource]);
  }
  /**
   * Applies the start/end dates from the task to the corresponding baseline.
   *
   * ```javascript
   * const task = new TaskModel({
   *      name: 'New task',
   *      startDate: '2019-01-14',
   *      endDate: '2019-01-17',
   *      duration: 3,
   *      baselines: [
   *          // Baseline version 1
   *          {
   *              startDate: '2019-01-13',
   *              endDate: '2019-01-16'
   *          },
   *          // Baseline version 2
   *          {
   *              startDate: '2019-01-14',
   *              endDate: '2019-01-17'
   *          },
   *          // Baseline version 3
   *          {
   *              startDate: '2019-01-15',
   *              endDate: '2019-01-18'
   *          }
   *      ]
   * });
   *
   * // Apply the task's start/end dates to the baseline version 3
   * task.setBaseline(3);
   * ```
   * @param {Number} version The baseline version to update
   */

  setBaseline(version) {
    if (version <= 0) {
      return;
    }

    const me = this,
          {
      baselines
    } = me,
          missingBaselines = version - baselines.count; // Add missing baselines up to the passed version

    if (missingBaselines > 0) {
      baselines.add(applyBaselineDefaults(me, new Array(missingBaselines).fill({})));
    } else {
      baselines.getAt(version - 1).set(applyBaselineDefaults(me, [{}])[0]);
    }
  }

  get baselines() {
    const me = this;

    if (!me.baselinesStore) {
      const baselinesField = this.fieldMap.baselines;
      me.baselinesStore = new Store({
        modelClass: me.constructor.getDefaultConfiguration().baselineModelClass,
        data: applyBaselineDefaults(me, me.originalData[baselinesField.dataSource])
      });
    }

    return me.baselinesStore;
  } // TODO: drop and move to the engine, use outgoingDeps everywhere

  get successors() {
    return Array.from(this.outgoingDeps || []);
  }

  set successors(successors) {
    this.outgoingDeps = successors;
  }

  setSuccessors(successors) {
    this.replaceDependencies(successors, true);
  } // Updates either predecessors or successors with a new array, updating existing dependency records and
  // removing existing dependencies not part of current set

  replaceDependencies(dependencyRecords, isSuccessors) {
    const me = this,
          {
      dependencyStore
    } = me.project,
          updated = new Set(),
          toAdd = new Set(),
          toRemove = [],
          currentSet = isSuccessors ? me.outgoingDeps : me.incomingDeps,
          depsArr = Array.from(currentSet); // TODO: All this collecting is added since chronograph
    // cannot handle removing and adding the same records at the moment.
    // We used to have here simple "removing all current & adding provided" approach
    // Collect already existing instances and new ones

    dependencyRecords.forEach(dependency => {
      const existingDep = depsArr.find(isSuccessors ? dep => dep.toEvent === dependency.toEvent : dep => dep.fromEvent === dependency.fromEvent);

      if (existingDep) {
        updated.add(existingDep);
        const data = Object.assign({}, dependency.data);
        delete data[dependency.constructor.idField];
        existingDep.set(data);
      } else {
        toAdd.add(dependency);
      }
    }); // Collect records that should be removed

    currentSet.forEach(dependency => {
      if (!updated.has(dependency)) {
        toRemove.push(dependency);
      }
    }); // remove records

    toRemove.forEach(dependency => dependencyStore.remove(dependency)); // add new records

    toAdd.forEach(dependency => {
      if (isSuccessors) {
        dependency.fromEvent = me;
      } else {
        dependency.toEvent = me;
      }

      dependencyStore.add(dependency);
    });
    return me.commitAsync();
  } // TODO: drop and move to the engine, use outgoingDeps everywhere

  get predecessors() {
    return Array.from(this.incomingDeps || []);
  }

  set predecessors(predecessors) {
    this.incomingDeps = predecessors;
  }

  setPredecessors(predecessors) {
    this.replaceDependencies(predecessors, false);
  }

  get assignments() {
    return super.assignments;
  }

  set assignments(assignments) {
    const me = this,
          {
      assignmentStore
    } = me.project,
          toAdd = [],
          currentAssignments = me.assignments,
          removedAssignments = currentAssignments.filter(current => !assignments.find(newAss => newAss.resource === current.resource));
    assignments.forEach(assignment => {
      const currentAssignment = assignmentStore.getAssignmentForEventAndResource(this, assignment.resource);

      if (currentAssignment) {
        const clonedData = Object.assign({}, assignment.data);
        delete clonedData.id;
        currentAssignment.set(clonedData);
      } // New one
      else {
        assignment.remove();
        toAdd.push(assignment);
      }
    });
    assignmentStore.remove(removedAssignments);
    assignmentStore.add(toAdd);
  }

  get assigned() {
    const {
      project
    } = this; // Figure assignments out before buckets are created  (if part of project)

    if (project !== null && project !== void 0 && project.isDelayingCalculation) {
      return project.assignmentStore.storage.findItem('event', this);
    }

    return super.assigned;
  }

  set assigned(assigned) {
    super.assigned = assigned;
  } //region Is

  get isDraggable() {
    return this.draggable;
  }

  get isResizable() {
    return this.resizable && !this.milestone && !this.isParent;
  } //endregion
  //region Milestone

  get milestone() {
    // a summary task may have zero duration due to working time periods mismatch w/ its children
    // so we operate start and end date pair here
    if (!this.isLeaf) {
      const {
        startDate,
        endDate
      } = this;

      if (startDate && endDate) {
        return endDate.getTime() === startDate.getTime();
      }
    }

    return this.duration === 0;
  } // override `isMilestone` on TimeSpan model and make it to return the same value what `milestone` returns

  get isMilestone() {
    return this.milestone;
  }

  set milestone(value) {
    value ? this.convertToMilestone() : this.convertToRegular();
  }

  async setMilestone(value) {
    return value ? this.convertToMilestone() : this.convertToRegular();
  }
  /**
   * Converts this task to a milestone (start date will match the end date).
   * @propagating
   */

  async convertToMilestone() {
    return this.setDuration(0, this.durationUnit, false);
  }
  /**
   * Converts the milestone task to a regular task with a duration of 1 (keeping current {@link #field-durationUnit}).
   * @propagating
   */

  async convertToRegular() {
    if (this.milestone) {
      return this.setDuration(1, this.durationUnit, false);
    }
  } //endregion
  //region Dependencies

  /**
   * Returns all dependencies of this task (both incoming and outgoing)
   *
   * @property {Gantt.model.DependencyModel[]}
   */

  get allDependencies() {
    return this.dependencies;
  }

  get dependencies() {
    // Dont crash when calculations are delayed to after refresh
    if (this.project.isDelayingCalculation) {
      return [];
    }

    return [...(this.incomingDeps || []), ...(this.outgoingDeps || [])];
  }

  set dependencies(dependencies) {
    const me = this,
          predecessors = [],
          successors = [];
    dependencies === null || dependencies === void 0 ? void 0 : dependencies.forEach(dependency => {
      if (dependency.fromEvent === me || dependency.fromEvent === me.id) {
        successors.push(dependency);
      } else if (dependency.toEvent === me || dependency.toEvent === me.id) {
        predecessors.push(dependency);
      }
    });
    me.setPredecessors(predecessors);
    me.setSuccessors(successors);
  }
  /**
   * Returns all predecessor tasks of a task
   *
   * @property {Gantt.model.TaskModel[]}
   */

  get predecessorTasks() {
    return [...(this.incomingDeps || [])].map(dependency => dependency.fromEvent);
  }
  /**
   * Returns all successor tasks of a task
   *
   * @readonly
   * @property {Gantt.model.TaskModel[]}
   */

  get successorTasks() {
    return [...(this.outgoingDeps || [])].map(dependency => dependency.toEvent);
  } //endregion
  //region Calculated fields

  /**
   * Returns count of all sibling nodes (including their children).
   * @property {Number}
   */

  get previousSiblingsTotalCount() {
    let task = this.previousSibling,
        count = this.parentIndex;

    while (task) {
      count += task.descendantCount;
      task = task.previousSibling;
    }

    return count;
  }
  /**
   * Returns the sequential number of the task. A sequential number means the ordinal position of the task in the
   * total dataset, regardless of its nesting level and collapse/expand state of any parent tasks. The root node has a
   * sequential number equal to 0.
   *
   * For example, in the following tree data sample sequential numbers are specified in the comments:
   *
   *        root : {
   *            children : [
   *                {   // 1
   *                    leaf : true
   *                },
   *                {       // 2
   *                    children : [
   *                        {   // 3
   *                            children : [
   *                                {   // 4
   *                                    leaf : true
   *                                },
   *                                {   // 5
   *                                    leaf : true
   *                                }
   *                            ]
   *                        }]
   *                },
   *                {   // 6
   *                    leaf : true
   *                }
   *            ]
   *        }
   *
   * If we will collapse some of the parent tasks, sequential number of collapsed tasks won't change.
   *
   * @property {Number}
   */

  get sequenceNumber() {
    let code = 0,
        task = this; // TODO: store keeps allIndex, children are added before parents which makes order wrong. if that is changed
    // TODO: it can be used instead of calculating sequenceNumber

    while (task.parent) {
      code += task.previousSiblingsTotalCount + 1;
      task = task.parent;
    }

    return code;
  } //endregion
  //region Project related methods

  get isSubProject() {
    return false;
  } // TODO: cache project
  // /**
  //  * Returns the {@link Gantt.model.SubProjectModel project} instance, associated with this task if this task belongs to a project
  //  *
  //  * @private
  //  * @internal
  //  * @return {Gantt.model.SubProjectModel} project
  //  */

  get subProject() {
    const me = this;
    let project = null;

    if (me.isProject) {
      // TODO: implement is project
      project = me;
    } else {
      me.bubbleWhile(t => {
        if (t.isProject) {
          project = t;
        }

        return !project;
      });
    }

    return project;
  } //endregion

  /**
   * Property which encapsulates the effort's magnitude and units.
   *
   *
   * UI fields representing this property are disabled for summary events.
   * See {@link #function-isEditable} for details.
   *
   * @property {Core.data.Duration}
   */

  get fullEffort() {
    return new Duration({
      unit: this.effortUnit,
      magnitude: this.effort
    });
  }

  set fullEffort(effort) {
    this.setEffort(effort.magnitude, effort.unit);
  } //region Scheduler Pro compatibility

  /**
   * Returns all resources assigned to an event.
   *
   * @property {Gantt.model.ResourceModel[]}
   * @readonly
   */

  get resources() {
    // Only include valid resources, to not have nulls in the result
    return this.assignments.reduce((resources, assignment) => {
      assignment.resource && resources.push(assignment.resource);
      return resources;
    }, []);
  } //endregion

  /**
   * A `Set<Gantt.model.DependencyModel>` of the outgoing dependencies for this task
   * @member {Set} outgoingDeps
   * @readonly
   */

  /**
   * A `Set<Gantt.model.DependencyModel>` of the incoming dependencies for this task
   * @member {Set} incomingDeps
   * @readonly
   */

  /**
   * An array of the assignments, related to this task
   * @member {Gantt.model.AssignmentModel[]} assignments
   * @readonly
   */

  /**
   * If given resource is assigned to this task, returns a {@link Gantt.model.AssignmentModel} record.
   * Otherwise returns `null`
   *
   * @method getAssignmentFor
   * @param {Gantt.model.ResourceModel} resource The instance of {@link Gantt.model.ResourceModel}
   *
   * @return {Gantt.model.AssignmentModel|null}
   */

  /**
   * This method assigns a resource to this task.
   *
   * Will cause the schedule to be updated - returns a `Promise`
   *
   * @method assign
   * @param {Gantt.model.ResourceModel} resource The instance of {@link Gantt.model.ResourceModel}
   * @param {Number} [units=100] The `units` field of the new assignment
   *
   * @returns {Promise}
   * @propagating
   */

  /**
   * This method unassigns a resource from this task.
   *
   * Will cause the schedule to be updated - returns a `Promise`
   *
   * @method unassign
   * @param {Gantt.model.ResourceModel} resource The instance of {@link Gantt.model.ResourceModel}
   *
   * @returns {Promise}
   * @propagating
   */

  /**
   * Sets the calendar of the task. Will cause the schedule to be updated - returns a `Promise`
   *
   * @method setCalendar
   * @param {Gantt.model.CalendarModel} calendar The new calendar. Provide `null` to return back to the project calendar.
   * @returns {Promise}
   * @propagating
   */

  /**
   * Returns the task calendar.
   *
   * @method getCalendar
   * @returns {Gantt.model.CalendarModel} The task calendar.
   */

  /**
   * Sets the start date of the task. Will cause the schedule to be updated - returns a `Promise`
   *
   * Note, that the actually set start date may be adjusted, according to the calendar, by skipping the non-working time forward.
   *
   * @method setStartDate
   * @param {Date} date The new start date.
   * @param {Boolean} [keepDuration=true] Whether to keep the duration (and update the end date), while changing the start date, or vice-versa.
   * @returns {Promise}
   * @propagating
   */

  /**
   * Sets the end date of the task. Will cause the schedule to be updated - returns a `Promise`
   *
   * Note, that the actually set end date may be adjusted, according to the calendar, by skipping the non-working time backward.
   *
   * @method setEndDate
   * @param {Date} date The new end date.
   * @param {Boolean} [keepDuration=false] Whether to keep the duration (and update the start date), while changing the end date, or vice-versa.
   * @returns {Promise}
   * @propagating
   */

  /**
   * Updates the duration (and optionally unit) of the task. Will cause the schedule to be updated - returns a `Promise`
   *
   * @method setDuration
   * @param {Number} duration New duration value
   * @param {String} [unit] New duration unit
   * @returns {Promise}
   * @propagating
   */

  /**
   * Updates the effort (and optionally unit) of the task. Will cause the schedule to be updated - returns a `Promise`
   *
   * @method setEffort
   * @param {Number} effort New effort value
   * @param {String} [unit] New effort unit
   * @returns {Promise}
   * @propagating
   */

  /**
   * Sets the constraint type and (optionally) constraining date to the task.
   *
   * @method setConstraint
   * @param {String} constraintType Constraint type, please refer to the {@link Gantt.model.TaskModel#field-constraintType} for the valid values.
   * @param {Date}   [constraintDate] Constraint date.
   * @returns {Promise}
   * @propagating
   */
  //region Normalization

  normalize() {// Do nothing, normalization now happens as part of initial propagate and should use calendar anyway
  }

  inSetNormalize(field) {// Do nothing, normalization now happens as part of initial propagate and should use calendar anyway
  }
  /**
   * Not (yet) supported by the underlying scheduling engine
   * @function setStartEndDate
   * @hide
   * @param {Date} start The new start date
   * @param {Date} end The new end date
   */
  //endregion

  joinStore(store) {
    const me = this;

    if (!me.wbsValue) {
      var _me$taskStore, _me$nextSibling, _me$previousSibling;

      if ((_me$taskStore = me.taskStore) !== null && _me$taskStore !== void 0 && _me$taskStore.isLoadingData || !((_me$nextSibling = me.nextSibling) !== null && _me$nextSibling !== void 0 && _me$nextSibling.wbsValue || (_me$previousSibling = me.previousSibling) !== null && _me$previousSibling !== void 0 && _me$previousSibling.wbsValue)) {
        // If we are being loaded or have no siblings, then we can just process this node and its children.
        me.refreshWbs(refreshWbsOnJoinOptions);
      } else {
        // Otherwise, we need to also refresh this node's siblings. Since we only come here if we have a
        // sibling, we can be sure we also have a parent.
        me.parent.refreshWbs(refreshWbsOptions, -1);
      }
    }

    super.joinStore(store);
  }
  /**
   * Refreshes the {@link #field-wbsValue} of this record and its children. This is rarely needed but may be required
   * after a complex series of filtering, inserting, or removing nodes. In particular, removing nodes does create a
   * gap in `wbsValue` values that may be undesirable.
   * @param {Object} [options] A set of options for refreshing.
   * @param {Boolean} [options.deep=true] Pass `false` to not update the `wbsValue` of this node's children.
   * @param {Boolean} [options.silent=false] Pass `true` to update the `wbsValue` silently (no events). This is done
   * at load time since this value represents the clean state. Passing `true` also has the effect of not marking the
   * change as a dirty state on the record, in the case where `wbsValue` has been flagged as `persist: true`.
   * @param {Number} [index] The index of this node in its parent's children array. Pass -1 to ignore this node's
   * `wbsValue` and only operate on children (if `options.deep`).
   */

  refreshWbs(options, index) {
    var _options$deep;

    const me = this,
          {
      parent
    } = me;

    if (parent && index !== -1 && me.fieldMap.wbsValue) {
      var _ref, _index;

      index = ((_ref = (_index = index) !== null && _index !== void 0 ? _index : me.unfilteredIndex) !== null && _ref !== void 0 ? _ref : me.parentIndex) + 1;
      const wbs = parent.isRoot ? new Wbs(index) : parent.wbsValue.append(index);

      if (options !== null && options !== void 0 && options.silent) {
        me.setData('wbsValue', wbs);
      } else {
        me.set('wbsValue', wbs);
      }
    }

    if ((_options$deep = options === null || options === void 0 ? void 0 : options.deep) !== null && _options$deep !== void 0 ? _options$deep : true) {
      var _me$unfilteredChildre;

      const children = (_me$unfilteredChildre = me.unfilteredChildren) !== null && _me$unfilteredChildre !== void 0 ? _me$unfilteredChildre : me.children,
            n = (children === null || children === void 0 ? void 0 : children.length) || 0;

      if (n) {
        var _me$taskStore2, _me$taskStore2$sorter;

        // The array may be reversed, and if it is, then the sorter has been applied and we need to reverse
        // the WBS assignment to match
        const reverse = isReversed(children) && ((_me$taskStore2 = me.taskStore) === null || _me$taskStore2 === void 0 ? void 0 : (_me$taskStore2$sorter = _me$taskStore2.sorters) === null || _me$taskStore2$sorter === void 0 ? void 0 : _me$taskStore2$sorter.findIndex(descendingWbsSorter)) === 0;

        for (let i = 0; i < n; ++i) {
          children[i].refreshWbs(options, reverse ? n - i - 1 : i);
        }
      }
    }
  }

  async tryInsertChild() {
    return this.getProject().tryPropagateWithChanges(() => {
      this.insertChild(...arguments);
    });
  }
  /**
   * Defines if the given task field should be manually editable in UI.
   * You can override this method to provide your own logic.
   *
   * By default the method defines:
   * - {@link #field-earlyStartDate}, {@link #field-earlyEndDate}, {@link #field-lateStartDate},
   * {@link #field-lateEndDate}, {@link #field-totalSlack} as not editable;
   * - {@link #field-effort}, {@link #property-fullEffort}, {@link #field-percentDone} as not editable for summary tasks;
   * - {@link #field-endDate}, {@link #field-duration} and {@link #property-fullDuration} fields
   *   as not editable for summary tasks except the {@link #field-manuallyScheduled manually scheduled} ones.
   *
   * @param {String} fieldName Name of the field
   * @returns {Boolean} Returns `true` if the field is editable, `false` if it is not and `undefined` if the task has no such field.
   */

  isEditable(fieldName) {
    switch (fieldName) {
      // r/o fields
      case 'earlyStartDate':
      case 'earlyEndDate':
      case 'lateStartDate':
      case 'lateEndDate':
      case 'totalSlack':
        return false;
      // disable effort & percentDone editing for summary tasks

      case 'effort':
      case 'fullEffort':
      case 'percentDone':
      case 'renderedPercentDone':
        return this.isLeaf;
      // end/duration is allowed to edit for leafs and manually scheduled summaries

      case 'endDate':
      case 'duration':
      case 'fullDuration':
        return this.isLeaf || this.manuallyScheduled;
    }

    return super.isEditable(fieldName);
  }

  isFieldModified(fieldName) {
    if (fieldName === 'fullEffort') {
      return super.isFieldModified('effort') || super.isFieldModified('effortUnit');
    }

    return super.isFieldModified(fieldName);
  }

  updateDependencies(startDate, endDate) {
    this.outgoingDeps.forEach(dep => {
      // filter out wrong
      if (dep.toEvent.isScheduled) {
        const {
          type,
          lagUnit,
          calendar,
          toEvent
        } = dep; // Calculate lag value for the outgoing dependency to keep successor in place. Lag should be
        // calculated for future start/end dates and should skip non-working time

        if (startDate) {
          if (type === DependencyBaseModel.Type.StartToStart) {
            dep.lag = DateHelper.as(lagUnit, calendar.calculateDurationMs(startDate, toEvent.startDate, true));
          } else if (type === DependencyBaseModel.Type.StartToEnd) {
            dep.lag = DateHelper.as(lagUnit, calendar.calculateDurationMs(startDate, toEvent.endDate, true));
          }
        }

        if (endDate) {
          if (type === DependencyBaseModel.Type.EndToStart) {
            dep.lag = DateHelper.as(lagUnit, calendar.calculateDurationMs(endDate, toEvent.startDate, true));
          } else if (type === DependencyBaseModel.Type.EndToEnd) {
            dep.lag = DateHelper.as(lagUnit, calendar.calculateDurationMs(endDate, toEvent.endDate, true));
          }
        }
      }
    });
  }

  async moveTaskPinningSuccessors(date) {
    const me = this; // set start date, this will put new values to the engine and would allow to recalculate dates before
    // project is committed

    me.startDate = date; // Go up the tree processing outgoing dependencies for this task and all its parents

    me.bubble(node => {
      if (!node.isRoot) {
        const // Peek new start/end dates
        startDate = node.run('calculateStartDate'),
              endDate = node.run('calculateEndDate');
        node.updateDependencies(startDate, endDate);
      }
    });
    return me.project.commitAsync();
  }

  async setStartDatePinningSuccessors(date) {
    const me = this,
          promise = me.setStartDate(date, false); // Go up the tree processing outgoing dependencies for this task and all its parents

    me.bubble(node => {
      if (!node.isRoot) {
        // Peek new end date
        const startDate = node.run('calculateStartDate');
        node.updateDependencies(startDate, null);
      }
    });
    return promise;
  }

  async setEndDatePinningSuccessors(date) {
    const me = this;
    me.endDate = date; // Go up the tree processing outgoing dependencies for this task and all its parents

    me.bubble(node => {
      if (!node.isRoot) {
        // Peek new end date
        const endDate = node.run('calculateEndDate');
        node.updateDependencies(null, endDate);
      }
    });
    return me.project.commitAsync();
  }

}
TaskModel.convertEmptyParentToLeaf = true; // TaskModel.$meta.fields.map.wbsCode.defineAccessor(TaskModel.prototype, /* force = */true);

TaskModel._$name = 'TaskModel';

/**
 * @module Gantt/data/TaskStore
 */

const refreshWbsForChildrenOptions = {
  deep: true
},
      wbsAuto = Object.freeze({
  add: true,
  remove: true,
  sort: true
}),
      wbsManual = Object.freeze({
  add: false,
  remove: false,
  sort: false
});
/**
 * An object that describes the actions that should trigger a {@link Gantt.model.TaskModel#function-refreshWbs} to
 * update WBS values. Objects of this type are passed to {@link Gantt.data.TaskStore#config-wbsMode} when the simpler
 * values of `'auto'` or (the default) `'manual'` are not desired.
 *
 * The value `'auto'` is equivalent to all properties of this object being `true`.
 * The value `'manual'` is equivalent to all properties of this object being `false`.
 *
 * @typedef WbsMode
 * @property {Boolean} [add] Set this property to `true` to refresh WBS values when nodes are added.
 * @property {Boolean} [remove] Set this property to `true` to refresh WBS values when nodes are removed.
 * @property {Boolean} [sort] Set this property to `true` to refresh WBS values when nodes are sorted.
 */

/**
 * A class representing the tree of tasks in the Gantt project. An individual task is represented as an instance of the
 * {@link Gantt.model.TaskModel} class. The store expects the data loaded to be hierarchical. Each parent node should
 * contain its children in a property called 'children'.
 *
 * ```javascript
 * const taskStore = new TaskStore({
 *      data : [
 *          {
 *               "id"           : 1000,
 *               "name"         : "Cool project",
 *               "percentDone"  : 50,
 *               "startDate"    : "2019-01-02",
 *               "expanded"     : true,
 *               "children"     : [
 *                   {
 *                       "id"           : 1,
 *                       "name"         : "A leaf node",
 *                       "startDate"    : "2019-01-02",
 *                       "percentDone"  : 50,
 *                       "duration"     : 10,
 *                   }
 *              ]
 *           }
 *      ]
 * });
 * ```
 * @mixes Scheduler/data/mixin/GetEventsMixin
 * @extends Core/data/AjaxStore
 */

class TaskStore extends ChronoEventTreeStoreMixin.derive(AjaxStore).mixin(PartOfProject, DayIndexMixin, GetEventsMixin) {
  static get defaultConfig() {
    return {
      modelClass: TaskModel,

      /**
       * CrudManager must load stores in the correct order. Lowest first.
       * @config {Number}
       * @private
       */
      loadPriority: 200,

      /**
       * CrudManager must sync stores in the correct order. Lowest first.
       * @config {Number}
       * @private
       */
      syncPriority: 300,
      storeId: 'tasks',
      tree: true
    };
  }

  static get configurable() {
    return {
      /**
       * Set to `'auto'` to automatically update {@link Gantt.model.TaskModel#field-wbsValue} as records in the
       * store are manipulated (e.g., when the user performs drag-and-drop reordering).
       *
       * In manual mode, the WBS value is initialized as the store loads and only altered implicitly by the
       * {@link #function-indent} and {@link #function-outdent} methods. The WBS values are otherwise updated only
       * by an explicit call to {@link Gantt.model.TaskModel#function-refreshWbs}.
       *
       * This can also be a {@link Gantt.data.TaskStore#typedef-WbsMode} object that indicates what operations
       * should automatically {@link Gantt.model.TaskModel#function-refreshWbs refresh} WBS values.
       *
       * The operations that trigger WBS refresh can be enabled explicitly in this object, for example:
       *
       * ```javascript
       *  wbsMode : {
       *      add : true,
       *      remove : true
       *  }
       * ```
       * The above is an opt-in list that enable auto WBS refresh for node add and remove operations (these two
       * operations are associated with dragging to reorder items). No other operation will trigger WBS refresh.
       * At present, this leaves out only the `sort` operation, but if new auto-refreshing operations were added
       * in future releases, those would also not be included.
       *
       * Alternatively, this object can be an opt-out specification if all values are falsy:
       *
       * ```javascript
       *  wbsMode : {
       *      sort : false
       *  }
       * ```
       * The above two examples are (currently) equivalent in outcome. The choice between opt-in or opt-out form
       * is a matter of convenience as well as future-proofing preference.
       *
       * The value `'auto'` is equivalent to all properties being `true`.
       * The value `'manual'` (the default) is equivalent to all properties being `false`.
       * @config {String|WbsMode}
       */
      wbsMode: 'manual'
    };
  }

  changeWbsMode(value) {
    if (value === 'auto') {
      return wbsAuto;
    }

    if (value && typeof value === 'object') {
      if (ObjectHelper.values(value).every(v => !v)) {
        // if (an opt-out list)
        value = ObjectHelper.assign({}, wbsAuto, value);
      }

      return value;
    }

    return wbsManual;
  }
  /**
   * For each task in this TaskStore, sets the data in the passed baseline index to the current state of the task.
   * @param {Number} index The index in the baselines list of the baseline to update.
   */

  setBaseline(index) {
    const data = this.storage.values;
    this.forEach(task => task.setBaseline(index));
    this.trigger('refresh', {
      action: 'batch',
      records: data,
      data
    });
  }
  /**
   * Increase the indentation level of one or more tasks in the tree
   * @param {Gantt.model.TaskModel|Gantt.model.TaskModel[]} nodes The nodes to indent.
   * @return {Promise} A promise which yields the result of the operation
   * @fires indent
   * @fires change
   */

  async indent(nodes) {
    const me = this,
          {
      taskStore,
      project
    } = me;
    let result = false;
    nodes = Array.isArray(nodes) ? nodes.slice() : [nodes]; // 1. Filter out project nodes

    nodes = nodes.filter(node => !node.isProjectModel); // 2. Filtering out all nodes which parents are also to be indented as well as the ones having no previous
    //    sibling since such nodes can't be indented

    nodes = nodes.filter(node => {
      let result;
      result = Boolean(node.previousSibling);

      while (result && !node.isRoot) {
        result = !nodes.includes(node.parent);
        node = node.parent;
      }

      return result;
    });
    /**
     * Fired before tasks in the tree are indented. Return `false` from a listener to prevent the indent.
     * @event beforeIndent
     * @preventable
     * @param {Gantt.data.TaskStore} source The task store
     * @param {Gantt.model.TaskModel[]} records Tasks to be indented
     */

    if (nodes.length && taskStore.trigger('beforeIndent', {
      records: nodes
    }) !== false) {
      // 3. Sorting nodes into tree walk order
      nodes.sort((lhs, rhs) => Wbs.compare(lhs.wbsCode, rhs.wbsCode)); // No events should go to the UI until we have finished the operation successfully

      taskStore.beginBatch(); // Ask the project to try the indent operation

      result = await project.tryPropagateWithChanges(() => {
        for (const node of nodes) {
          const newParent = node.previousSibling;
          newParent.appendChild(node);
          me.toggleCollapse(newParent, false);
        }
      }); // Now show the successful result

      taskStore.endBatch();

      if (result) {
        me.refreshWbsForChildren({
          up: 2,
          // the nodes are now deeper but that move affects their grandparent node's WBS
          nodes
        });
        /**
         * Fired after tasks in the tree are indented
         * @event indent
         * @param {Gantt.data.TaskStore} source The task store
         * @param {Gantt.model.TaskModel[]} records Tasks that got indent
         */

        me.trigger('indent', {
          records: nodes
        });
        me.trigger('change', {
          action: 'indent',
          records: nodes
        });
      }
    }

    return result;
  }
  /**
   * Decrease the indentation level of one or more tasks in the tree
   * @param {Gantt.model.TaskModel|Gantt.model.TaskModel[]} nodes The nodes to outdent.
   * @return {Promise} A promise which yields the result of the operation
   * @fires outdent
   * @fires change
   */

  async outdent(nodes) {
    const me = this,
          {
      taskStore,
      project
    } = me;
    let result = false;
    nodes = Array.isArray(nodes) ? nodes.slice() : [nodes]; // 1. Filter out project nodes

    nodes = nodes.filter(node => !node.isProjectModel); // 2. Filtering out all nodes which parents are also to be outdented as well as the ones having no previous sibling
    //    since such nodes can't be indented

    nodes = nodes.filter(node => {
      let result;
      result = node.parent && !node.parent.isRoot;

      while (result && !node.isRoot) {
        result = !nodes.includes(node.parent);
        node = node.parent;
      }

      return result;
    });
    /**
     * Fired before tasks in the tree are outdented. Return `false` from a listener to prevent the outdent.
     * @event beforeOutdent
     * @preventable
     * @param {Gantt.data.TaskStore} source The task store
     * @param {Gantt.model.TaskModel[]} records Tasks to be outdented
     */

    if (nodes.length && taskStore.trigger('beforeOutdent', {
      records: nodes
    }) !== false) {
      // 3. Sorting nodes into reverse tree walk order
      nodes.sort((lhs, rhs) => Wbs.compare(lhs.wbsCode, rhs.wbsCode)); // No events should go to the UI until we have finished the operation successfully

      taskStore.beginBatch();
      result = await project.tryPropagateWithChanges(() => {
        for (const node of nodes) {
          const newChildren = node.parent.children.slice(node.parent.children.indexOf(node) + 1);
          node.parent.parent.insertChild(node, node.parent.nextSibling);
          node.appendChild(newChildren);
          me.toggleCollapse(node, false);
        }
      });
      taskStore.endBatch();

      if (result) {
        me.refreshWbsForChildren({
          up: 1,
          // only need to update the (new) parent
          nodes
        });
        /**
         * Fired after tasks in the tree are outdented
         * @event outdent
         * @param {Gantt.data.TaskStore} source The task store
         * @param {Gantt.model.TaskModel[]} records Tasks that got outdent
         */

        me.trigger('outdent', {
          records: nodes
        });
        me.trigger('change', {
          action: 'outdent',
          records: nodes
        });
      }
    }

    return result;
  }

  onNodeAddChild(parent, children, index, isMove, silent = false) {
    super.onNodeAddChild(parent, children, index, isMove, silent);

    if (!this.isLoadingData && this.wbsMode.add) {
      parent.refreshWbs(refreshWbsForChildrenOptions);
    }
  }

  onNodeRemoveChild(parent, children, index, flags = {
    isMove: false,
    silent: false,
    unfiltered: false
  }) {
    const result = super.onNodeRemoveChild(parent, children, index, flags);

    if (this.wbsMode.remove) {
      parent.refreshWbs(refreshWbsForChildrenOptions);
    }

    return result;
  }

  afterPerformSort(silent) {
    if (this.wbsMode.sort) {
      this.rootNode.refreshWbs(refreshWbsForChildrenOptions);
    }

    super.afterPerformSort(silent);
  }
  /**
   * This method updates the WBS values due to changes in the indentation of a given set of child nodes.
   * @param {Object} options An object containing options in addition to a `nodes` property with the children.
   * @param {Gantt.model.TaskModel[]} options.nodes The array of child record to refresh. This is required.
   * @param {Boolean} [options.silent=false] Pass `true` to update the `wbsValue` silently (no events).
   * @param {Number} [options.up=1] The number of ancestors to ascend when determining the parent(s) to refresh.
   * By default, this value is 1 which indicates the immediate parent of the supplied nodes. This is suitable for
   * outdenting. For indenting, this value should be 2. This is because the previous parent node (now grandparent
   * node) needs to be refreshed, not merely the new parent.
   * @private
   */

  refreshWbsForChildren(options) {
    const nodes = options.nodes,
          opts = _objectSpread2(_objectSpread2({}, refreshWbsForChildrenOptions), options),
          parents = new Set(),
          up = opts.up || 0;

    let n, parent;
    nodes.forEach(node => {
      for (parent = node, n = up; parent && n; --n) {
        parent = parent.parent;
      }

      parents.add(parent);
    });

    for (parent of parents) {
      parent.refreshWbs(opts);
    }
  }

  getTotalTimeSpan() {
    return {
      startDate: this.getProject().startDate,
      endDate: this.getProject().endDate
    };
  }

  getEventsForResource(resourceId) {
    const resource = this.resourceStore.getById(resourceId),
          assignments = (resource === null || resource === void 0 ? void 0 : resource.assignments.filter(assignment => assignment.isPartOfStore(this.assignmentStore))) || [],
          events = [];
    assignments.forEach(({
      event
    }) => event && events.push(event));
    return events;
  }
  /**
   * Checks if a date range is allocated or not for a given resource.
   * @param {Date} start The start date
   * @param {Date} end The end date
   * @param {Scheduler.model.EventModel|null} excludeEvent An event to exclude from the check (or null)
   * @param {Scheduler.model.ResourceModel} resource The resource
   * @return {Boolean} True if the timespan is available for the resource
   * @category Resource
   */

  isDateRangeAvailable(start, end, excludeEvent, resource) {
    // NOTE: Also exists in EventStoreMixin.js
    // This should be a collection of unique event records
    const allEvents = new Set(this.getEventsForResource(resource)); // In private mode we can pass an AssignmentModel. In this case, we assume that multi-assignment is used.
    // So we need to make sure that other resources are available for this time too.
    // No matter if the event retrieved from the assignment belongs to the target resource or not.
    // We gather all events from from the resources the event is assigned to except of the one from the assignment record.
    // Note, events from the target resource are added above.

    if (excludeEvent !== null && excludeEvent !== void 0 && excludeEvent.isAssignment) {
      const currentEvent = excludeEvent.event,
            resources = currentEvent.resources;
      resources.forEach(resource => {
        // Ignore events for the resource which is passed as an AssignmentModel to excludeEvent
        if (resource.id !== excludeEvent.resourceId) {
          this.getEventsForResource(resource).forEach(event => allEvents.add(event));
        }
      });
    }

    if (excludeEvent) {
      const eventToRemove = excludeEvent.isAssignment ? excludeEvent.event : excludeEvent;
      allEvents.delete(eventToRemove);
    }

    return !Array.from(allEvents).some(event => event.isScheduled && DateHelper.intersectSpans(start, end, event.startDate, event.endDate));
  }

}
TaskStore._$name = 'TaskStore';

/**
 * @module Gantt/feature/Baselines
 */

const baselineSelector = '.b-task-baseline';
/**
 * Displays a {@link Gantt.model.TaskModel task}'s {@link Gantt.model.TaskModel#field-baselines baselines}
 * below the tasks in the timeline.
 *
 * This feature also optionally shows a tooltip when hovering any of the task's baseline elements. The
 * tooltip's content may be customized
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid.view.mixin.GridFeatures}.
 *
 * @extends Scheduler/feature/base/TooltipBase
 * @inlineexample Gantt/feature/Baselines.js
 * @demo Gantt/baselines
 * @classtype baselines
 * @feature
 */

class Baselines extends TooltipBase {
  //region Config
  static get $name() {
    return 'Baselines';
  } // Default configuration.

  static get defaultConfig() {
    return {
      cls: 'b-gantt-task-tooltip',
      align: 't-b',
      forSelector: baselineSelector,
      recordType: 'baseline'
    };
  }

  static get pluginConfig() {
    return {
      chain: [// onTaskDataGenerated for populating task with baselines
      'onTaskDataGenerated', // onPaint for creating tooltip (in TooltipBase)
      'onPaint']
    };
  } //endregion
  //region Init & destroy

  construct(gantt, config) {
    this.tipId = `${gantt.id}-baselines-tip`;
    this.gantt = gantt;
    super.construct(gantt, config);
  }

  doDisable(disable) {
    const {
      client
    } = this,
          {
      dependencies
    } = client.features; // Hide or show the baseline elements

    client.refreshWithTransition(); // Redraw dependencies *after* elements have animated to new position,
    // and we must clear cache because of position changes.

    if (dependencies) {
      client.setTimeout(() => dependencies.scheduleDraw(true), 300);
    }

    super.doDisable(disable);
  } //endregion
  //region Element & template

  resolveTimeSpanRecord(forElement) {
    const baselineElement = forElement.closest(baselineSelector);
    return baselineElement === null || baselineElement === void 0 ? void 0 : baselineElement.elementData.baseline;
  }
  /**
   * Template (a function accepting event data and returning a string) used to display info in the tooltip.
   * The template will be called with an object as with fields as detailed below
   * @config {Function}
   * @param {Object} data A data block containing the information needed to create tooltip content.
   * @param {Gantt.model.Baseline} data.baseline The Baseline record to display
   * @param {Gantt.model.TaskModel} data.baseline.task The owning task of the baseline.
   * @param {String} data.startClockHtml Predefined HTML to show the start time.
   * @param {String} data.endClockHtml Predefined HTML to show the end time.
   */

  template(data) {
    const me = this,
          {
      baseline
    } = data,
          {
      task
    } = baseline,
          displayDuration = me.client.formatDuration(baseline.duration);
    return `
            <div class="b-gantt-task-title">${task.name} (baseline ${baseline.parentIndex + 1})</div>
            <table>
            <tr><td>${me.L('L{TaskTooltip.Start}')}:</td><td>${data.startClockHtml}</td></tr>
            ${baseline.milestone ? '' : `
                <tr><td>${me.L('L{TaskTooltip.End}')}:</td><td>${data.endClockHtml}</td></tr>
                <tr><td>${me.L('L{TaskTooltip.Duration}')}:</td><td class="b-right">${displayDuration + ' ' + DateHelper.getLocalizedNameOfUnit(baseline.durationUnit, baseline.duration !== 1)}</td></tr>
            `}
            </table>
            `;
  }

  getTaskDOMConfig(taskRecord, top) {
    const baselines = taskRecord.baselines.allRecords;
    return {
      className: {
        'b-baseline-wrap': true
      },
      style: {
        transform: `translateY(${top}px)`
      },
      dataset: {
        // Prefix task id to allow element reusage also for baseline wrap
        taskId: `baselinesFor${taskRecord.id}`
      },
      children: baselines.map((baseline, i) => {
        const baselineBox = this.gantt.taskRendering.getTaskBox(baseline);
        return baselineBox ? {
          className: {
            [baseline.cls]: baseline.cls,
            'b-task-baseline': 1,
            'b-task-baseline-milestone': baseline.milestone
          },
          style: {
            width: baselineBox.width,
            left: baselineBox.left
          },
          dataset: {
            index: i
          },
          elementData: {
            baseline
          }
        } : null;
      }),
      syncOptions: {
        syncIdField: 'index'
      }
    };
  }

  onTaskDataGenerated({
    taskRecord,
    top,
    extraConfigs,
    wrapperCls
  }) {
    if (!this.disabled && taskRecord.hasBaselines) {
      wrapperCls['b-has-baselines'] = 1;
      extraConfigs.push(this.getTaskDOMConfig(taskRecord, top));
    }
  } //endregion

}
Baselines._$name = 'Baselines';
GridFeatureManager.registerFeature(Baselines, false, 'Gantt');

/**
 * @module Gantt/feature/CellEdit
 */

/**
 * Extends the {@link Grid.feature.CellEdit} to encapsulate Gantt functionality. This feature is enabled by <b>default</b>
 *
 * {@inlineexample Gantt/feature/CellEdit.js}
 *
 * Editing can be started by a user by double-clicking an editable cell in the gantt's data grid, or it can be started programmatically
 * by calling {@link Grid/feature/CellEdit#function-startEditing} and providing it with correct cell context.
 *
 * See {@link #function-doAddNewAtEnd}.
 *
 * ## Instant update
 * If {@link Grid.column.Column#config-instantUpdate} on the column is set to true, record will be
 * updated instantly as value in the editor is changed. In combination with
 * {@link Gantt.model.ProjectModel#config-autoSync} it could result in excessive requests to the backend.
 *
 * Instant update is enabled for these columns by default:
 * - {@link Scheduler.column.DurationColumn}
 * - {@link Gantt.column.StartDateColumn}
 * - {@link Gantt.column.EndDateColumn}
 * - {@link Gantt.column.ConstraintDateColumn}
 * - {@link Gantt.column.DeadlineDateColumn}
 * - {@link Gantt.column.EarlyStartDateColumn}
 * - {@link Gantt.column.EarlyEndDateColumn}
 * - {@link Gantt.column.LateStartDateColumn}
 * - {@link Gantt.column.LateEndDateColumn}
 *
 * To disable instant update on the column set config to false:
 * ```
 * new Gantt({
 *     columns: [
 *         {
 *             type: 'startdate',
 *             instantUpdate: false
 *         }
 *     ]
 * })
 * ```
 *
 * @extends Grid/feature/CellEdit
 *
 * @classtype cellEdit
 * @feature
 * @typings Grid/feature/CellEdit -> Grid/feature/GridCellEdit
 */

class CellEdit extends CellEdit$1 {
  static get $name() {
    // NOTE: Even though the class name matches the one defined on the base class
    // we need this method in order registerFeature() to work properly
    // (it uses hasOwnProperty when detecting the class name)
    return 'CellEdit';
  } // Default configuration

  static get defaultConfig() {
    return {
      addNewAtEnd: {
        duration: 1
      }
    };
  }

  static get pluginConfig() {
    const cfg = super.pluginConfig;
    cfg.chain = [...cfg.chain, 'onProjectChange'];
    return cfg;
  }

  onProjectChange() {
    // Cancel editing if project is changed
    this.cancelEditing(true);
  } // Provide any editor with access to the current project

  getEditorForCell({
    record
  }) {
    const editor = super.getEditorForCell(...arguments),
          inputField = editor.inputField;
    inputField.project = record.project;
    inputField.eventRecord = record;
    return editor;
  }
  /**
   * Adds a new, empty record at the end of the TaskStore with the initial
   * data specified by the {@link Grid.feature.CellEdit#config-addNewAtEnd} setting.
   *
   * @returns {Promise} Newly added record wrapped in a promise.
   */

  async doAddNewAtEnd() {
    const gantt = this.grid,
          addNewAtEnd = this.addNewAtEnd,
          {
      project
    } = gantt; // First finish any ongoing calculations

    await project.commitAsync();

    if (gantt.isDestroyed) {
      return;
    }

    const newTask = gantt.taskStore.rootNode.appendChild(ObjectHelper.assign({
      name: this.L('L{Gantt.New task}'),
      startDate: project.startDate
    }, addNewAtEnd));
    await project.commitAsync();

    if (gantt.isDestroyed) {
      return;
    } // If the new record was not added due to it being off the end of the rendered block
    // ensure we force it to be there before we attempt to edit it.

    if (!gantt.rowManager.getRowFor(newTask)) {
      gantt.rowManager.displayRecordAtBottom();
    }

    return newTask;
  }

}
CellEdit._$name = 'CellEdit';
GridFeatureManager.registerFeature(CellEdit, true, 'Gantt');

/**
 * @module Gantt/feature/CriticalPaths
 */

/**
 * This feature highlights the project _critical paths_.
 * Every task is important, but only some of them are critical.
 * The critical path is a chain of linked tasks that directly affects the project finish date.
 * If any task on the critical path is late, the whole project is late.
 *
 * For more details on the _critical path method_ please check this article: https://en.wikipedia.org/wiki/Critical_path_method
 *
 * This feature is loaded by default, but the visualization needs to be enabled:
 *
 * ```javascript
 * // let's visualize the project critical paths
 * gantt.features.criticalPaths.disabled = false;
 * ```
 * {@inlineexample Gantt/feature/CriticalPaths.js}
 *
 * If you need to get information about critical paths, you can refer to
 * {@link Gantt/model/ProjectModel#property-criticalPaths} property of the project:
 * ```javascript
 * const paths = gantt.project.criticalPaths;
 * ```
 *
 * @extends Core/mixin/InstancePlugin
 * @demo Gantt/criticalpaths
 * @classtype criticalPaths
 * @feature
 */

class CriticalPaths extends Delayable(InstancePlugin) {
  //region Config
  static get $name() {
    return 'CriticalPaths';
  }

  static get defaultConfig() {
    return {
      cls: 'b-gantt-critical-paths',
      criticalDependencyCls: 'b-critical',
      disabled: true
    };
  }

  static get pluginConfig() {
    return {
      chain: ['onTaskDataGenerated']
    };
  } //endregion
  //region Init

  doDisable(disable) {
    const me = this;

    if (disable) {
      me.unhighlightCriticalPaths();
    } // Highlight now if we have entered graph
    else if (me.client.project.graph) {
      me.highlightCriticalPaths();
    } // In delayed calculation mode (the default) we might not be in graph yet, postpone highlighting until we are
    else {
      me.client.project.on({
        graphReady() {
          me.highlightCriticalPaths();
        },

        thisObj: me,
        once: true
      });
    }

    super.doDisable(disable);
  }

  getDependenciesFeature() {
    // return dependencies feature only when it's ready
    return this.client.foregroundCanvas && this.client.features.dependencies;
  }

  setupObserver() {
    const me = this,
          {
      project
    } = me.client;
    let dependencies; // destroy previous observer if any

    me.destroyObserver();
    me.criticalPathObserver = project.getGraph().observe(function* () {
      return yield project.$.criticalPaths;
    }, criticalPaths => {
      // if the feature is not disabled
      if (!me.disabled) {
        me.removeCriticalCls(); // check if dependencies feature is there

        if (dependencies = dependencies || me.getDependenciesFeature()) {
          for (const path of criticalPaths) {
            for (const node of path) {
              if (node.dependency) {
                dependencies.highlight(node.dependency, me.criticalDependencyCls);
              }
            }
          }
        }
        /**
         * Fired when critical paths get highlighted.
         *
         * See also: {@link #event-criticalPathsUnhighlighted}
         * @event criticalPathsHighlighted
         */

        me.client.trigger('criticalPathsHighlighted');
      }
    });
  }

  destroyObserver() {
    if (this.criticalPathObserver) {
      this.client.project.getGraph().removeIdentifier(this.criticalPathObserver);
      this.criticalPathObserver = null;
    }
  }

  doDestroy() {
    this.destroyObserver();
    super.doDestroy();
  }

  highlightCriticalPaths() {
    const me = this,
          {
      element
    } = me.client; // the component has cls set means we had CPs rendered so need to clean them

    if (element.classList.contains(me.cls)) {
      me.unhighlightCriticalPaths();
    }

    me.setupObserver(); // add the feature base cls to enable stylesheets

    element.classList.add(me.cls);
  }

  removeCriticalCls() {
    const project = this.client.project,
          dependencies = this.getDependenciesFeature(); // if we have dependencies rendered remove classes from them

    if (dependencies) {
      project.dependencyStore.forEach(dependency => dependencies.unhighlight(dependency, this.criticalDependencyCls));
    }
  }

  unhighlightCriticalPaths() {
    const me = this,
          client = me.client; // destroy criticalPath atom observer

    me.destroyObserver();
    me.removeCriticalCls(); // remove the feature base cls

    client.element.classList.remove(me.cls);
    /**
     * Fired when critical paths get hidden.
     *
     * See also: {@link #event-criticalPathsHighlighted}
     * @event criticalPathsUnhighlighted
     */

    client.trigger('criticalPathsUnhighlighted');
  } //endregion
  // Add DOMConfigs for enabled indicators as `extraConfigs` on the task. Will in the end be added to the task row

  onTaskDataGenerated(renderData) {
    if (!this.disabled) {
      renderData.cls['b-critical'] = renderData.taskRecord.critical;
    }
  }

}
CriticalPaths._$name = 'CriticalPaths';
GridFeatureManager.registerFeature(CriticalPaths, true, 'Gantt');

/**
 * @module Gantt/feature/Dependencies
 */

const fromBoxSide = ['left', 'left', 'right', 'right'],
      toBoxSide = ['left', 'right', 'left', 'right']; // noinspection JSClosureCompilerSyntax

/**
 * Feature that draws dependencies between tasks. Uses a dependency {@link Gantt.model.ProjectModel#property-dependencyStore store}
 * to determine which dependencies to draw.
 *
 * To customize the dependency tooltip, you can provide the {@link Scheduler.feature.Dependencies#config-tooltip} config and specify a {@link Core.widget.Tooltip#config-getHtml} function.
 * For example:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         dependencies : {
 *             tooltip : {
 *                 getHtml({ activeTarget }) {
 *                     const dependencyModel = gantt.resolveDependencyRecord(activeTarget);
 *
 *                     if (!dependencyModel) return null;
 *
 *                     const { fromEvent, toEvent } = dependencyModel;
 *
 *                     return `${fromEvent.name} (${fromEvent.id}) -> ${toEvent.name} (${toEvent.id})`;
 *                 }
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * ## Styling dependency lines
 *
 * You can easily customize the arrows drawn between events. To change all arrows, apply
 * the following basic SVG CSS:
 *
 * ```css
 * .b-sch-dependency {
 *    stroke-width: 2;
 *    stroke : red;
 * }
 *
 * .b-sch-dependency-arrow {
 *     fill: red;
 * }
 * ```
 *
 * To style an individual dependency line, you can provide a [cls](#Scheduler/model/DependencyModel#field-cls) in your data:
 *
 * ```json
 * {
 *     "id"   : 9,
 *     "from" : 7,
 *     "to"   : 8,
 *     "cls"  : "special-dependency"
 * }
 * ```
 *
 * ```scss
 * // Make line dashed
 * .b-sch-dependency {
 *    stroke-dasharray: 5, 5;
 * }
 * ```
 *
 * This feature is **enabled** by default
 *
 * By default predecessors and successors in columns and the task editor are displayed using task id and name. The id part is configurable, any task field may be used instead (for example wbsCode or sequence number)
 * by {@link Gantt/view/GanttBase#config-dependencyIdField Gantt#dependencyIdField} property.
 * ```javascript
 * const gantt = new Gantt({
 *    dependencyIdField: 'wbsCode',
 *
 *    project,
 *    columns : [
 *        { type : 'name', width : 250 }
 *    ],
 * });
 * ```
 *
 * Also see {@link Gantt/column/DependencyColumn#config-dependencyIdField DependencyColumn#dependencyIdField} to configure columns only if required.
 *
 * {@inlineexample Gantt/guides/gettingstarted/basic.js}
 * @extends Scheduler/feature/Dependencies
 * @typings Scheduler/feature/Dependencies -> Scheduler/feature/SchedulerDependencies
 * @demo Gantt/basic
 * @classtype dependencies
 * @feature
 */

class Dependencies extends Dependencies$1 {
  //region Config
  static get $name() {
    return 'Dependencies';
  }

  static get defaultConfig() {
    return {
      terminalSides: ['left', 'right'],
      storeClass: DependencyStore,
      highlightDependenciesOnEventHover: true
    };
  } //endregion
  //region Init

  construct(gantt, config = {}) {
    const me = this; // Scheduler might be using gantt's feature, when on same page

    if (gantt.isGantt) {
      me.gantt = gantt;
    }

    if (Object.prototype.hasOwnProperty.call(config, 'pathFinderConfig')) {
      if (!Object.prototype.hasOwnProperty.call(config.pathFinderConfig, 'otherHorizontalMargin')) {
        config.pathFinderConfig.otherHorizontalMargin = 0;
      }

      if (!Object.prototype.hasOwnProperty.call(config.pathFinderConfig, 'otherVerticalMargin')) {
        config.pathFinderConfig.otherVerticalMargin = 0;
      }
    } else {
      config.pathFinderConfig = {
        otherHorizontalMargin: 0,
        otherVerticalMargin: 0
      };
    }

    me.added = new Set();
    super.construct(gantt, config);
  } //endregion
  //region Scheduler overrides

  /**
   * Returns the dependency record for a DOM element
   * @function resolveDependencyRecord
   * @param {HTMLElement} element The dependency line element
   * @return {Gantt.model.DependencyModel} The dependency record
   */
  // TaskStore needs some special handling, being the row store in Gantt

  attachToEventStore(store) {
    super.attachToEventStore(store);
    this.detachListeners('taskStore');

    if (store) {
      store.on({
        name: 'taskStore',
        refreshPreCommit: 'onTaskStoreRefresh',
        thisObj: this
      });
    }
  }

  onDependencyChange({
    action,
    record,
    records
  }) {
    // We don't need this listener in case the gantt is loading data
    // since it does (here in onProjectRefresh() method) full dependencies draw in that case
    if (!this.client.project.propagatingLoadChanges) {
      switch (action) {
        case 'add':
          records.forEach(dependencyRecord => this.added.add(dependencyRecord));
          return;
      }

      super.onDependencyChange(...arguments);
    }
  }

  onTaskStoreRefresh({
    action
  }) {
    const me = this;

    switch (action) {
      case 'sort':
        me.scheduleDraw(true);
        break;

      case 'filter':
        // https://github.com/bryntum/support/issues/1815
        // Refresh dependencies after filter
        me.resetGridCache();
        me.scheduleDraw(true);
        break;
    }
  } //endregion
  //region Determining dependencies to draw

  getIteratableDependencyAssignments(dependency) {
    return [null]; // Gantt doesn't use assignments to designated what raw task occupies
  } // Neither task can be hidden for a dependency to be considered visible

  isDependencyVisible(dependency, assignmentData = null) {
    const {
      client
    } = this,
          from = dependency.fromEvent,
          to = dependency.toEvent; // ignore dependency with bad data, the `Object(from) !== from` handles the case
    // when the from is an id of missing task
    // this might change in the future (from will be always either a Task model or undefined)
    // so only the `if (!from || !to) return;` will be needed

    if (!from || !to || Object(from) !== from || Object(to) !== to) return; // assignmentData only used in Scheduler with multi assignment, let it handle the call

    if (!(from instanceof TaskModel) || assignmentData) {
      return super.isDependencyVisible(dependency, assignmentData);
    } // placeHolder set if either end of the dependency does not exist in store

    return !from.placeHolder && client.store.isAvailable(from) && !to.placeHolder && client.store.isAvailable(to);
  } // Get the bounding box for either the source or the target event

  getBox(dependency, source, assignmentData = null) {
    const taskRecord = this.getTimeSpanRecordFromDependency(dependency, source);

    if (!this.gantt) {
      // Scheduler using gantt's feature (happens when using single bundle)
      if (taskRecord.isEvent || assignmentData) {
        return super.getBox(dependency, source, assignmentData);
      } // Scheduler with taskStore, might not have any resource assigned

      return taskRecord.assignments.length ? this.client.getResourceEventBox(taskRecord, taskRecord.assignments[0].resource, true) : null;
    }

    return this.gantt.getTaskBox(taskRecord, true, true);
  } // Get source or target events resource

  getRowRecordFromDependency(dependency, source) {
    if (!this.gantt) {
      // Scheduler with taskStore, we want the resource
      const taskRecord = this.getTimeSpanRecordFromDependency(dependency, source); // Scheduler using gantt's feature (happens when using single bundle)

      if (taskRecord.isEvent) {
        return super.getRowRecordFromDependency(dependency, source);
      } // Might not have one assigned

      return taskRecord.assignments.length ? taskRecord.assignments[0].resource : null;
    }

    return this.getTimeSpanRecordFromDependency(dependency, source);
  } //endregion
  //region Draw & render

  onProjectRefresh(event) {
    const {
      added
    } = this; // In Scheduler this happens directly on add, in Gantt it needs to happen after propagate since tasks at each
    // end might move

    if (added.size) {
      for (const dependencyRecord of added) {
        this.addToGridCache(dependencyRecord);
      }

      added.clear();
    } // Need to call super method here to include all the complex logic of `toDrawOnProjectRefresh` map

    super.onProjectRefresh(event);
    const {
      isInitialCommit,
      isCalculated
    } = event; // First time we are guaranteed to have normalized data

    if (isInitialCommit && isCalculated) {
      // Reset grid cache to ensure we cache based on correct dates
      this.resetGridCache();
    }

    this.scheduleDraw();
  }

  drawLine(canvas, dependency, points, assignmentData = null, cache = true) {
    super.drawLine(canvas, dependency, points, assignmentData);
    const line = super.drawLine(canvas, dependency, points, assignmentData, cache),
          {
      client
    } = this,
          to = dependency.toEvent; // If target event is outside of the view add special CSS class to hide marker (arrow)

    if (!to.milestone && (to.endDate <= client.startDate || client.endDate <= to.startDate) || to.milestone && (to.endDate < client.startDate || client.endDate < to.startDate)) {
      line.classList.add('b-sch-dependency-ends-outside');
    }
  }

  prepareLineDef(dependency, dependencyDrawData, assignmentData = null) {
    const me = this,
          source = me.getTimeSpanRecordFromDependency(dependency, true),
          target = me.getTimeSpanRecordFromDependency(dependency, false),
          type = dependency.type,
          arrowMargin = this.pathFinder.startArrowMargin;
    let startSide = dependency.fromSide,
        endSide = dependency.toSide; // Fallback to view trait if dependency start side is not given

    if (!startSide) {
      switch (true) {
        case type === DependencyType.StartToEnd:
          startSide = me.getConnectorStartSide(source);
          break;

        case type === DependencyType.StartToStart:
          startSide = me.getConnectorStartSide(source);
          break;

        case type === DependencyType.EndToStart:
          startSide = me.getConnectorEndSide(source);
          break;

        case type === DependencyType.EndToEnd:
          startSide = me.getConnectorEndSide(source);
          break;

        default:
          throw new Error('Invalid dependency type: ' + type);
      }
    } // Fallback to view trait if dependency end side is not given

    if (!endSide) {
      switch (true) {
        case type === DependencyType.StartToEnd:
          endSide = me.getConnectorEndSide(target);
          break;

        case type === DependencyType.StartToStart:
          endSide = me.getConnectorStartSide(target);
          break;

        case type === DependencyType.EndToStart:
          endSide = me.getConnectorStartSide(target);
          break;

        case type === DependencyType.EndToEnd:
          endSide = me.getConnectorEndSide(target);
          break;

        default:
          throw new Error('Invalid dependency type: ' + type);
      }
    }

    const {
      startRectangle,
      endRectangle
    } = dependencyDrawData;

    if (type === DependencyType.EndToStart && // Target box is below source box
    startRectangle.bottom < endRectangle.y && // If source box ends before target box start - draw line to target box top edge
    // Round coordinates to make behavior more consistent on zoomed page
    Math.round(endRectangle.left) >= Math.round(startRectangle.right) && Math.round(endRectangle.right) >= Math.round(startRectangle.right) + arrowMargin) {
      // arrow to left part of top
      endSide = 'top'; // The default entry point for top is the center, but for Gantt Tasks,
      // we join to startArrowMargin inwards from top/left.
      // Milestones always have the top entry point left in the center.

      if (!dependency.toEvent.milestone) {
        endRectangle.right = endRectangle.x + arrowMargin * 2;
      }
    } // append boxes that extend to row boundaries to make sure line is contained there
    // Always consider arrow margin for `otherBoxes`, otherwise, when gap between source and target is less than
    // arrowMargin * 2 (start arrow + end arrow margin), we will have line breaking not on the row boundary

    const sourceRowBox = me.client.getRecordCoords(source, true),
          targetRowBox = me.client.getRecordCoords(target, true),
          // Add vertical box for each task. They are supposed to push line to row boundary
    otherBoxes = [{
      start: startRectangle.x,
      end: startRectangle.right,
      top: sourceRowBox.y,
      bottom: sourceRowBox.y + sourceRowBox.height
    }, {
      start: endRectangle.x,
      end: endRectangle.right,
      top: targetRowBox.y,
      bottom: targetRowBox.y + targetRowBox.height
    }]; // Reversing start/end endpoints generate more Gantt-friendly arrows

    return {
      endBox: {
        start: startRectangle.x,
        end: startRectangle.right,
        top: startRectangle.y,
        bottom: startRectangle.bottom
      },
      startBox: {
        start: endRectangle.x,
        end: endRectangle.right,
        top: endRectangle.y,
        bottom: endRectangle.bottom
      },
      endSide: startSide,
      startSide: endSide,
      boxesReversed: true,
      otherBoxes
    };
  } // onEventChanged({ action, record }) {
  //     switch (action) {
  //         case 'update':
  //             // event updated, redraw its dependencies
  //             return this.drawForTask(record);
  //     }
  // }

  /**
   * Draws all dependencies for the specified task.
   */

  drawForTask(taskRecord) {
    this.drawForTimeSpan(taskRecord);
  }
  /**
   * Sort dependencies with critical dependencies at the end to draw the red path later to avoid gray paths overlap
   * @returns {Map} Dependencies sorted by critical (first non critical)
   * @private
   */

  getSortedDependenciesToRefresh() {
    const criticalFeature = this.client.features.criticalPaths;

    if (criticalFeature && !criticalFeature.disabled) {
      return new Map([...this.dependenciesToRefresh].sort(([{
        fromTask: taskA
      }], [{
        fromTask: taskB
      }]) => (taskA === null || taskA === void 0 ? void 0 : taskA.critical) === (taskB === null || taskB === void 0 ? void 0 : taskB.critical) ? 0 : taskA !== null && taskA !== void 0 && taskA.critical ? 1 : -1));
    } else {
      return this.dependenciesToRefresh;
    }
  } //endregion
  //region Tooltip

  /**
   * Generates html for the tooltip shown when hovering a dependency
   * @param {Object} tooltipConfig
   * @returns {String} Html to display in the tooltip
   * @private
   */

  getHoverTipHtml({
    activeTarget
  }) {
    const me = this,
          dependencyModel = me.resolveDependencyRecord(activeTarget),
          dependencyIdField = me.client.dependencyIdField;

    if (!dependencyModel) {
      return null;
    }

    const {
      fromEvent,
      toEvent
    } = dependencyModel,
          lagStr = dependencyModel.lag ? `<tr>
                    <td>${me.L('L{DependencyEdit.Lag}')}: </td>
                    <td>${StringHelper.encodeHtml(dependencyModel.fullLag)}</td>
                    <td></td>
                </tr>` : '';
    return TemplateHelper.tpl`
             <table class="b-sch-dependency-tooltip">
                <tr>
                    <td>${me.L('L{Dependencies.from}')}: </td>
                    <td>${fromEvent.name} ${fromEvent[dependencyIdField]}</td>
                    <td><div class="b-sch-box b-${fromBoxSide[dependencyModel.type]}"></div></td>
                </tr>
                <tr>
                    <td>${me.L('L{Dependencies.to}')}: </td>
                    <td>${toEvent.name} ${toEvent[dependencyIdField]}</td>
                    <td><div class="b-sch-box b-${toBoxSide[dependencyModel.type]}"></div></td>
                </tr>
                 ${lagStr}
            </table>
        `;
  } //endregion
  //region Dependency creation

  /**
   * Create a new dependency from source terminal to target terminal
   * @internal
   */

  async createDependency(data) {
    const me = this,
          {
      source,
      target,
      fromSide,
      toSide
    } = data,
          type = (fromSide === 'left' ? 0 : 2) + (toSide === 'right' ? 1 : 0),
          dependency = me.dependencyStore.add({
      fromEvent: source,
      toEvent: target,
      type
    })[0];
    await me.dependencyStore.project.propagateAsync();
    return dependency;
  } // endregion
  // Add critical path marker which has different color

  createMarkers() {
    super.createMarkers(); // Since Edge and IE11 cannot reverse marker we use one in a
    // required orientation, which exists only in those two browsers

    const endMarker = (this.startMarker || this.endMarker).cloneNode(true);
    endMarker.setAttribute('id', 'arrowEndCritical');
    this.client.svgCanvas.appendChild(endMarker);
  }

}
Dependencies._$name = 'Dependencies';
GridFeatureManager.registerFeature(Dependencies, true, 'Gantt');

/**
 * @module Gantt/feature/Indicators
 */

/**
 * The Indicators feature displays indicators (icons) for different dates related to a task in its row. Hovering an
 * indicator will show a tooltip with its name and date(s). The owning task `id` is embedded in the indicator element
 * dataset as `taskRecordId` which can be useful if you want to have custom actions when clicking (showing a menu for example).
 *
 * By default it includes and displays the following indicators (config name):
 * * Early start/end dates (earlyDates)
 * * Late start/end dates (lateDates)
 * * Constraint date (constraintDate)
 * * Deadline date (deadlineDate)
 *
 * This demo shows the default indicators:
 *
 * {@inlineexample Gantt/feature/Indicators.js}
 *
 * This config will display them all:
 *
 * ```javascript
 * new Gantt({
 *   features : {
 *     indicators : true
 *   }
 * });
 * ```
 *
 * To selectively disable indicators:
 *
 * ```javascript
 * features : {
 *   indicators : {
 *     items : {
 *       earlyDates     : false,
 *       constraintDate : false
 *     }
 *   }
 * }
 * ```
 *
 * They can also be toggled at runtime:
 *
 * ```javascript
 * gantt.features.indicators.items.deadlineDate = true/false;
 * ```
 *
 * The feature also supports adding custom indicators, by adding properties to the `items` config object:
 *
 * ```javascript
 * items : {
 *   lateDates  : false,
 *
 *   // Custom indicator only shown for tasks more than half done
 *   myCustomIndicator : taskRecord => taskRecord.percentDone > 50 ? {
 *      startDate : DateHelper.add(taskRecord.endDate, 2, 'days'),
 *      name : 'My custom indicator',
 *      iconCls : 'b-fa b-fa-alien'
 *   } : null
 * }
 * ```
 *
 * This demo shows a custom indicator:
 *
 * {@inlineexample Gantt/feature/IndicatorsCustom.js}
 *
 * These custom indicators are defined as functions, that accept a task record and return a TimeSpan (or a raw data
 * object). The function will be called for each visible task during rendering, to not show the indicator for certain
 * tasks return `null` from it.
 *
 * When using this feature we recommend that you configure gantt with a larger `rowHeight` + `barMargin` (>15 px), since
 * the indicators are indented to fit below the task bars.
 *
 * @extends Scheduler/feature/base/TooltipBase
 * @classType indicators
 * @feature
 * @demo Gantt/indicators
 */

class Indicators extends TooltipBase {
  //region Config
  static get $name() {
    return 'Indicators';
  }

  static get defaultConfig() {
    return {
      cls: 'b-gantt-task-tooltip',
      // reused on purpose
      forSelector: '.b-indicator',
      recordType: 'indicator',
      hoverDelay: 500,
      defaultIndicators: {
        earlyDates: taskRecord => taskRecord.earlyStartDate && !taskRecord.isMilestone ? {
          startDate: taskRecord.earlyStartDate,
          endDate: taskRecord.earlyEndDate,
          cls: 'b-bottom b-early-dates',
          name: this.L('L{earlyDates}')
        } : null,
        lateDates: taskRecord => taskRecord.lateStartDate && !taskRecord.isMilestone ? {
          startDate: taskRecord.lateStartDate,
          endDate: taskRecord.lateEndDate,
          cls: 'b-bottom b-late-dates',
          name: this.L('L{lateDates}')
        } : null,
        constraintDate: taskRecord => taskRecord.constraintDate ? {
          // Do not remove. Assertion strings for Localization sanity check.
          // 'L{ConstraintTypePicker.none}'
          // 'L{ConstraintTypePicker.muststarton}'
          // 'L{ConstraintTypePicker.mustfinishon}'
          // 'L{ConstraintTypePicker.startnoearlierthan}'
          // 'L{ConstraintTypePicker.startnolaterthan}'
          // 'L{ConstraintTypePicker.finishnoearlierthan}'
          // 'L{ConstraintTypePicker.finishnolaterthan}'
          startDate: taskRecord.constraintDate,
          cls: `b-bottom b-constraint-date b-constraint-type-${taskRecord.constraintType}`,
          name: this.L(`L{ConstraintTypePicker.${taskRecord.constraintType}}`)
        } : null,
        deadlineDate: taskRecord => taskRecord.deadlineDate ? {
          startDate: taskRecord.deadlineDate,
          cls: `b-bottom b-deadline-date`,
          name: this.L('L{deadlineDate}')
        } : null
      },

      /**
       * Used to enable/disable built in indicators and to define custom indicators.
       *
       * ```
       * new Gantt({
       *   features : {
       *     indicators : {
       *       items : {
       *         // Disable deadlineDate indicators
       *         deadlineDate : false,
       *
       *         // Add a custom indicator (called prepare)
       *         prepare : taskRecord => ({
       *            startDate : taskRecord.startDate,
       *            iconCls   : 'b-fa b-fa-magnify',
       *            name      : 'Start task preparations'
       *         })
       *       }
       *     }
       *   }
       * });
       * ```
       *
       * For more information, please see the class description at top.
       *
       * @config {Object}
       * @category Common
       */
      items: null,

      /**
       * A function which receives data about the indicator and returns a string,
       * or a Promise yielding a string (for async tooltips), to be displayed in the tooltip.
       * This method will be called with an object containing the fields below
       * @param {Object} data Indicator data
       * @param {String} data.name Indicator name
       * @param {Date} data.startDate Indicator startDate
       * @param {Date} data.endDate Indicator endDate
       * @param {Gantt.model.TaskModel} data.taskRecord The task to which the indicator belongs
       * @config {Function}
       */
      tooltipTemplate: data => {
        const {
          indicator
        } = data,
              encodedName = StringHelper.encodeHtml(indicator.name);

        if (data.endDate) {
          return `
                        ${indicator.name ? `<div class="b-gantt-task-title">${encodedName}</div>` : ''}
                        <table border="0" cellspacing="0" cellpadding="0">
                            <tr><td>${this.L('L{Start}')}:</td><td>${data.startClockHtml}</td></tr>
                            <tr><td>${this.L('L{End}')}:</td><td>${data.endClockHtml}</td></tr>
                        </table>
                    `;
        }

        return `
                    ${indicator.name ? `<div class="b-gantt-task-title">${encodedName}</div>` : ''}
                    ${data.startText}
                `;
      }
    };
  }

  static get pluginConfig() {
    return {
      chain: ['onTaskDataGenerated', 'onPaint']
    };
  } //endregion

  construct(gantt, config = {}) {
    this.tipId = `${gantt.id}-indicators-tip`; // Store items to set manually after config, we do not want to pass them along to the baseclass since it will
    // apply them to the tooltip

    config = Object.assign({}, config);
    const {
      items
    } = config;
    super.construct(gantt, config);
    this.items = items;
  }

  template(...args) {
    return this.tooltipTemplate(...args);
  } // Private setter, not supposed to set it during runtime

  set items(indicators) {
    const me = this; // All indicators, custom + default

    me._indicators = ObjectHelper.assign({}, me.defaultIndicators, indicators); // Accessors to toggle the indicators from the outside

    me._indicatorAccessors = {}; // Keep track of enabled/disabled indicators

    me._indicatorStatus = {};

    for (const name in me._indicators) {
      // Store if indicator is enabled/disabled (enabled if true or fn)
      me._indicatorStatus[name] = Boolean(me._indicators[name]); // If it was configured as true, it means we should use a default implementation

      if (typeof me._indicators[name] !== 'function') {
        me._indicators[name] = me.defaultIndicators[name];
      } // Create accessors so that we can enable/disable on the fly using:
      // gantt.features.indicators.items.deadlineDate = false;

      Object.defineProperty(me._indicatorAccessors, name, {
        enumerable: true,

        get() {
          return me._indicatorStatus[name] ? me._indicators[name] : false;
        },

        set(value) {
          me._indicatorStatus[name] = value;
          me.client.refresh();
        }

      });
    }
  }
  /**
   * Accessors for the indicators that can be used to toggle them at runtime.
   *
   * ```
   * gantt.features.indicators.items.deadlineDate = false;
   * ```
   *
   * @property {Object}
   * @readonly
   * @category Common
   */

  get items() {
    // These accessors are generated in `set items`, allowing runtime enabling/disabling of indicators
    return this._indicatorAccessors;
  } //region Render
  // Map fn that generates a DOMConfig for an indicator

  createIndicatorDOMConfig(indicator, index) {
    const {
      gantt,
      renderData
    } = this,
          {
      taskRecord
    } = renderData,
          {
      cls,
      iconCls
    } = indicator,
          x = gantt.getCoordinateFromDate(indicator.startDate),
          width = indicator.endDate ? gantt.getCoordinateFromDate(indicator.endDate) - x : null,
          classList = cls && cls.isDomClassList ? cls : new DomClassList(cls),
          top = renderData.top || gantt.taskStore.indexOf(taskRecord) * gantt.rowManager.rowOffsetHeight + gantt.resourceMargin,
          height = renderData.height || gantt.rowHeight - gantt.resourceMargin * 2;
    indicator.taskRecord = taskRecord;
    return {
      className: Object.assign(classList, {
        'b-indicator': 1,
        'b-has-icon': indicator.iconCls
      }),
      style: {
        transform: `translate(${x}px, ${top}px)`,
        height,
        width,
        style: indicator.style
      },
      dataset: {
        // For sync
        taskId: `${renderData.taskId}-indicator-${index}`,
        // allow users to look up which task this indicator belongs to
        taskRecordId: renderData.taskId
      },
      children: [iconCls ? {
        tag: 'i',
        className: iconCls
      } : null],
      elementData: indicator
    };
  } // Add DOMConfigs for enabled indicators as `extraConfigs` on the task. Will in the end be added to the task row

  onTaskDataGenerated(renderData) {
    if (this.disabled) {
      return;
    }

    const {
      items
    } = this,
          usedIndicators = []; // Iterate all indicators

    for (const name in items) {
      const indicatorFn = items[name]; // If it is enabled and a function, call it and store the resulting timespan

      if (this._indicatorStatus[name] && typeof indicatorFn === 'function') {
        const timeSpan = indicatorFn(renderData.taskRecord);
        timeSpan && this.client.timeAxis.timeSpanInAxis(timeSpan.startDate, timeSpan.endDate) && usedIndicators.push(timeSpan);
      }
    } // Convert indicator timespans to DOMConfigs for rendering

    renderData.extraConfigs.push(...usedIndicators.map(this.createIndicatorDOMConfig, {
      gantt: this.client,
      renderData
    }));
  } //endregion
  //region Tooltip

  resolveTimeSpanRecord(forElement) {
    return forElement.lastDomConfig.elementData;
  } //endregion

}
Indicators._$name = 'Indicators';
GridFeatureManager.registerFeature(Indicators, false);

/**
 * @module Gantt/feature/Labels
 */

/**
 * Specialized version of the Labels feature for Scheduler, that handles labels for tasks in Gantt. See
 * {@link Scheduler/feature/Labels Schedulers Labels feature} for more information.
 * This feature is **off** by default. For info on enabling it, see {@link Grid.view.mixin.GridFeatures}.
 *
 * @extends Scheduler/feature/Labels
 * @demo Gantt/labels
 * @typings Scheduler/feature/Labels -> Scheduler/feature/SchedulerLabels
 * @classtype labels
 * @feature
 */

class Labels extends Labels$1 {
  static get $name() {
    return 'Labels';
  }

  static get pluginConfig() {
    return {
      chain: ['onTaskDataGenerated']
    };
  }

  onTaskDataGenerated(data) {
    this.onEventDataGenerated(data);
  }

}
Labels._$name = 'Labels';
GridFeatureManager.registerFeature(Labels, false, 'Gantt');

/**
 * @module Gantt/feature/ParentArea
 */

/**
 * Highlights the area encapsulating all child tasks of a parent task in a semi-transparent layer. You can style
 * these layer elements using the `b-parent-area` CSS class.
 *
 * {@inlineexample Gantt/feature/ParentArea.js}
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid.view.mixin.GridFeatures}.
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         parentArea : true
 *     }
 * });
 * ```
 *
 * @extends Core/mixin/InstancePlugin
 * @demo Gantt/parent-area
 * @classtype parentArea
 * @feature
 */

class ParentArea extends InstancePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "highlighted", new Map());
  }

  // Recursively highlight self and all unhighlighted ancestors
  highlightParent(parentRecord) {
    const {
      highlighted
    } = this;

    if (parentRecord && !parentRecord.isProjectModel && !highlighted.has(parentRecord)) {
      const {
        client
      } = this,
            {
        rowOffsetHeight
      } = client.rowManager,
            descendants = parentRecord.visibleDescendantCount,
            box = client.getTaskBox(parentRecord);

      if (!box) {
        return;
      }

      const domConfig = {
        className: {
          'b-parent-area': 1
        },
        style: {
          top: box.top,
          height: (descendants + 1) * rowOffsetHeight - box.top % rowOffsetHeight,
          // +1 for self
          left: box.left,
          width: box.width
        },
        dataset: {
          taskId: `parent-area-${parentRecord.id}`
        }
      };
      highlighted.set(parentRecord, domConfig);
      this.highlightParent(parentRecord.parent);
    }
  } // Called after collecting all task configs, before DomSyncing them

  onBeforeTaskSync(configs) {
    if (!this.disabled) {
      const {
        highlighted,
        client
      } = this; // Start from scratch to not have to keep track of modifications, collecting task area configs is cheap

      highlighted.clear(); // Highlight all parents whose area intersects the view, which we know if a child is among rendered rows

      for (const row of client.rowManager) {
        const taskRecord = client.taskStore.getById(row.id);
        taskRecord && this.highlightParent(taskRecord.parent);
      }

      configs.push(...highlighted.values());
    }
  }

  doDisable(disable) {
    super.doDisable(disable);
    this.client.refresh();
  }

}

_defineProperty(ParentArea, "$name", 'ParentArea');

_defineProperty(ParentArea, "pluginConfig", {
  chain: ['onBeforeTaskSync']
});

ParentArea._$name = 'ParentArea';
GridFeatureManager.registerFeature(ParentArea, false, 'Gantt');

/**
 * @module Gantt/feature/ProgressLine
 */

/**
 *
 * This feature draws project progress line with SVG lines. Requires {@link SchedulerPro/feature/PercentBar} to be enabled (which
 * by default, it is)
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid/view/mixin/GridFeatures}.
 *
 * ```javascript
 * let gantt = new Gantt({
 *     features : {
 *         progressLine : {
 *            statusDate : new Date(2017, 2, 8)
 *         }
 *     }
 * });
 * ```
 *
 * Status date can be changed dynamically:
 *
 * ```javascript
 * gantt.features.progressLine.statusDate = new Date();
 * ```
 *
 * If status date is not in the current Gantt time span, progress line will use view start or end coordinates. This
 * behavior can be customized with {@link #config-drawLineOnlyWhenStatusDateVisible} config. Or you can override {@link #function-shouldDrawProgressLine}
 * method and provide more complex condition.
 *
 * Progress line is a set of SVG <line> elements drawn between all the tasks.
 *
 * {@inlineexample Gantt/feature/ProgressLine.js}
 *
 * @demo Gantt/progressline
 * @extends Core/mixin/InstancePlugin
 * @mixes Core/mixin/Delayable
 * @classtype progressLine
 * @feature
 */

class ProgressLine extends Delayable(InstancePlugin) {
  /**
   * Fired when progress line is rendered
   * @event progressLineDrawn
   */
  //region Config
  static get $name() {
    return 'ProgressLine';
  }

  static get defaultConfig() {
    return {
      /**
       * Progress line status date. If not provided, current date is used.
       * @config {Date}
       */
      statusDate: new Date(),

      /**
       * Set to true to hide progress line, when status date is not in the current time axis.
       * @config {Boolean}
       */
      drawLineOnlyWhenStatusDateVisible: false,
      lineCls: 'b-gantt-progress-line',
      containerCls: 'b-progress-line-canvas'
    };
  }

  static get pluginConfig() {
    return {
      chain: ['onPaint']
    };
  } //endregion
  //region Init & destroy

  construct(client, config = {}) {
    const me = this; // Many things may schedule a draw. Ensure it only happens once, on the next frame.
    // And Ensure it really is on the *next* frame after invocation by passing
    // the cancelOutstanding flag.

    me.scheduleDraw = me.createOnFrame('draw', [], me, true);
    super.construct(client, config);
    this.lineSegments = [];
  }

  doDisable(disable) {
    const me = this; // attach/detach listeners

    me.attachToClient(disable ? null : me.client);

    if (me.client.rendered) {
      me.draw();
    }

    super.doDisable(disable);
  } //endregion

  get statusDate() {
    return this._statusDate;
  }
  /**
   * Progress line status date. If not provided, current date is used.
   * @property {Date}
   */

  set statusDate(date) {
    if (date instanceof Date) {
      this._statusDate = date;

      if (!this.disabled) {
        this.scheduleDraw();
      }
    }
  } // cannot use `get svgCanvas` because it will trigger svgCanvas getter on instance too early

  getSVGCanvas() {
    const me = this,
          {
      client
    } = me;

    if (!me._svgCanvas) {
      const svg = me._svgCanvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); // To not be touched when syncing tasks to DOM

      svg.retainElement = true;
      svg.classList.add(me.containerCls);
      client.foregroundCanvas.appendChild(svg);
    }

    return me._svgCanvas;
  } // region Event handlers

  attachToProject(project) {
    this.detachListeners('project');
    project === null || project === void 0 ? void 0 : project.on({
      name: 'project',
      refresh: 'onProjectRefresh',
      thisObj: this
    });
  }

  attachToRowManager(rowManager) {
    this.detachListeners('rowManager');
    rowManager === null || rowManager === void 0 ? void 0 : rowManager.on({
      name: 'rowManager',
      translaterow: 'onTranslateRow',
      refresh: 'scheduleDraw',
      rerender: 'scheduleDraw',
      changetotalheight: 'scheduleDraw',
      thisObj: this
    });
  }

  attachToClient(client) {
    const me = this;
    me.detachListeners('client'); // dependencies are drawn on scroll, both horizontal and vertical

    client === null || client === void 0 ? void 0 : client.on({
      name: 'client',
      horizontalscroll: 'scheduleDraw',
      togglenode: 'scheduleDraw',
      taskdrag: 'onTaskDrag',
      taskdragabortfinalized: 'scheduleDraw',
      aftertaskdrop: 'scheduleDraw',
      timelineviewportresize: 'scheduleDraw',
      thisObj: me
    });
    me.attachToProject(client === null || client === void 0 ? void 0 : client.project);
    me.attachToRowManager(client === null || client === void 0 ? void 0 : client.rowManager);
  }

  onPaint() {
    this.attachToProject(this.disabled ? null : this.client.project);
  }
  /**
   * Redraws the line when the project propagation is done
   * @private
   */

  onProjectRefresh() {
    this.scheduleDraw();
  }

  onTranslateRow({
    row
  }) {
    // a changetotalheight event is fired after translations, if a rowHeight change is detected here it will redraw
    // the line
    if (row.lastTop >= 0 && row.top !== row.lastTop) {
      this.scheduleDraw();
    }
  } // Refreshing only lines for dragged task to avoid slowing down drag operation

  onTaskDrag({
    taskRecords,
    dragData
  }) {
    taskRecords.forEach(record => {
      this.updateLineForTask(record, {
        [record.id]: DateHelper.add(record.startDate, dragData.timeDiff)
      });
    });
  } // endregion

  /**
   * Returns true if progress line should be drawn
   * @returns {Boolean}
   */

  shouldDrawProgressLine() {
    return !this.client.timeAxisSubGrid.collapsed && !this.disabled && (!this.drawLineOnlyWhenStatusDateVisible || this.client.timeAxis.dateInAxis(this.statusDate));
  }
  /**
   * Returns status date horizontal position relative to the foreground canvas
   * @returns {Number}
   * @private
   */

  getStatusDateX() {
    let {
      statusDate
    } = this;
    const {
      client
    } = this;

    if (!client.timeAxis.dateInAxis(statusDate)) {
      statusDate = statusDate < client.timeAxis.startDate ? client.timeAxis.startDate : client.timeAxis.endDate;
    }

    return client.getCoordinateFromDate(statusDate);
  }
  /**
   * Returns object with status date local coordinate and view x,y coordinates. Used to convert page coordinates to
   * view local.
   * @returns {{statusDateX: Number, viewXY: number[]}}
   * @private
   */

  getRenderData() {
    const statusDateX = this.getStatusDateX(),
          // We refer to the DOM to get status date horizontal coordinate (for segmented tasks which are not supported yet)
    // we need to adjust progress bar element box to view/scroll.
    viewBox = this.client.timeAxisSubGridElement.getBoundingClientRect(),
          viewXY = [this.client.scrollLeft - viewBox.left, -viewBox.top];
    return {
      statusDateX,
      viewXY
    };
  } // region Drawing

  /**
   * Renders the progress line.
   */

  draw() {
    const me = this,
          {
      client
    } = me;
    me.lineSegments.forEach(el => el.remove());
    me.lineSegments = [];

    if (!me.shouldDrawProgressLine()) {
      return;
    }

    if (client.isAnimating) {
      client.on({
        transitionend() {
          me.scheduleDraw();
        },

        once: true
      });
      return;
    }

    const data = me.getRenderData(),
          lines = [];
    client.rowManager.forEach(row => {
      lines.push(...me.getLineSegmentRenderData(row, data));
    }); // Batch rendering to avoid constant layout reflows
    // With batch drawing line takes ~8ms comparing to ~30ms prior

    lines.forEach(line => me.drawLineSegment(line));
    client.trigger('progressLineDrawn');
  }

  segmentBelongsToTask(el, taskRecord) {
    // Use getAttribute to not upset Salesforce LockerService
    return el.getAttribute('data-task-id') == taskRecord.id;
  }
  /**
   * Updates progress line segment for one task
   * @param {Gantt.model.TaskModel} taskRecord
   * @param {Object} [renderData] Optional render data, which is an object where keys are task ids and values are
   * new task start date
   * @private
   */

  updateLineForTask(taskRecord, renderData) {
    const me = this;

    if (me.disabled) {
      return;
    }

    const row = me.client.getRowFor(taskRecord);

    if (row) {
      const toRemove = [];
      me.lineSegments.forEach(el => {
        if (me.segmentBelongsToTask(el, taskRecord)) {
          toRemove.push(el);
          el.remove();
        }
      });
      ArrayHelper.remove(me.lineSegments, ...toRemove);
      me.getLineSegmentRenderData(row, me.getRenderData(), renderData).forEach(line => me.drawLineSegment(line));
    }
  }
  /**
   * Draws line for a given row
   * @param {Grid.row.Row} row Row instance
   * @param {Object} data Output from {@link #function-getRenderData} method
   * @param {Object} [renderData] Optional render data, which is an object where keys are task ids and values are
   * new task start date
   * @internal
   */

  getLineSegmentRenderData(row, data, renderData = {}) {
    const me = this,
          {
      statusDateX,
      viewXY
    } = data,
          taskRecord = me.client.getRecordFromElement(row.elements.normal),
          taskId = taskRecord.id,
          lineDefinitions = [];
    let point;

    if (me.isStatusLineTask(taskRecord, renderData[taskRecord.id])) {
      point = me.calculateCoordinateForTask(taskRecord, viewXY); // If multiple rows are affected by event update, it could happen, that point
      // could not be resolved

      point && lineDefinitions.push({
        dataset: {
          taskId
        },
        x1: statusDateX,
        y1: row.top,
        x2: point.x,
        y2: point.y
      }, {
        dataset: {
          taskId
        },
        x1: point.x,
        y1: point.y,
        x2: statusDateX,
        y2: row.bottom
      });
    } // otherwise we render vertical status line

    if (!point) {
      lineDefinitions.push({
        dataset: {
          taskId
        },
        x1: statusDateX,
        y1: row.top,
        x2: statusDateX,
        y2: row.bottom
      });
    }

    return lineDefinitions;
  }
  /**
   * Draws line on svg canvas
   * @param {Object} data Line render data. Output from {@link #function-getLineSegmentRenderData}
   * @return {Element}
   * @internal
   */

  drawLineSegment(data) {
    const me = this;
    me.lineSegments.push(DomHelper.createElement(Object.assign({
      tag: 'line',
      ns: 'http://www.w3.org/2000/svg',
      // cannot use className when namespace is provided
      class: me.lineCls,
      parent: me.getSVGCanvas()
    }, data)));
  }
  /**
   * Returns true if task should be connected to the progress line.
   * @param {Gantt.model.TaskModel} taskRecord
   * @param {Date} [startDate] Provide to check if task record should be connected to the progress line if it'd
   * start then
   * @returns {Boolean}
   * @internal
   */

  isStatusLineTask(taskRecord, startDate) {
    const statusDate = this.statusDate;
    startDate = startDate || taskRecord.startDate; // task should be visible and not inactive

    return taskRecord && !taskRecord.inactive && this.client.timeAxis.isTimeSpanInAxis(taskRecord) && ( // - is in progress
    taskRecord.isInProgress || // .. or is not started and its start date is before statusDate
    !taskRecord.isStarted && startDate < statusDate || // .. or is finished and its start date is after statusDate
    taskRecord.isCompleted && startDate > statusDate);
  }
  /**
   * This method will calculate point inside task element to be connected with line.
   * @param {Gantt.model.TaskModel} record
   * @param {Number[]} translateBy View xy coordinates to calculate relative point position
   * @returns {Object} Object containing coordinates for point in progress line, or undefined if no progress bar el is found
   * @private
   */

  calculateCoordinateForTask(record, translateBy) {
    const {
      client
    } = this,
          node = client.getElementFromTaskRecord(record),
          isZeroDuration = record.milestone,
          progressBarEl = isZeroDuration ? node : node === null || node === void 0 ? void 0 : node.querySelector('.b-task-percent-bar');

    if (progressBarEl) {
      const box = progressBarEl.getBoundingClientRect(),
            totalSize = client.timeAxisViewModel.totalSize;
      return {
        x: Math.min((isZeroDuration ? box.left : box.right) + translateBy[0], totalSize),
        y: box.top + box.height / 2 + translateBy[1]
      };
    }
  } // endregion

}
ProgressLine._$name = 'ProgressLine';
GridFeatureManager.registerFeature(ProgressLine);

/**
 * @module Gantt/feature/ProjectLines
 */

/**
 * This feature draws two vertical lines in the schedule area, indicating project start/end dates.
 *
 * This feature is **enabled** by default
 *
 * {@inlineexample Gantt/guides/gettingstarted/basic.js}
 * @extends Scheduler/feature/TimeRanges
 * @demo Gantt/basic
 * @classtype projectLines
 * @feature
 */

class ProjectLines extends AbstractTimeRanges.mixin(AttachToProjectMixin) {
  //region Config
  static get $name() {
    return 'ProjectLines';
  }

  static get defaultConfig() {
    return {
      showHeaderElements: true,
      cls: 'b-gantt-project-line'
    };
  } //endregion
  //region Project

  attachToProject(project) {
    super.attachToProject(project);
    project.on({
      name: 'project',
      refresh: this.onProjectRefresh,
      thisObj: this
    });
  } //endregion
  //region Init
  // We must override the TimeRanges superclass implementation which ingests the client's project's
  // timeRangeStore. We implement our own store

  startConfigure() {}
  /**
   * Called when gantt is painted.
   * @private
   */

  onPaint({
    firstPaint
  }) {
    const me = this;

    if (firstPaint) {
      [me.startDateLine, me.endDateLine] = me.store.add([{
        name: me.L('L{Project Start}')
      }, {
        name: me.L('L{Project End}')
      }]);
      me.updateDateFromProject();
    }

    super.onPaint(...arguments);
  }

  updateLocalization() {
    const me = this;

    if (me.client.rendered) {
      // Updating the store to use proper locale for labels
      me.startDateLine.name = me.L('L{Project Start}');
      me.endDateLine.name = me.L('L{Project End}');
    }
  }

  updateDateFromProject() {
    const {
      project
    } = this.client;
    this.startDateLine.startDate = project.startDate;
    this.endDateLine.startDate = project.endDate;
  } //endregion

  onProjectRefresh() {
    if (this.startDateLine) {
      this.updateDateFromProject();
    }
  }

}
ProjectLines._$name = 'ProjectLines';
GridFeatureManager.registerFeature(ProjectLines, true, 'Gantt');

/**
 * @module Gantt/feature/Rollups
 */

const rollupCls = 'b-task-rollup',
      rollupSelector = `.${rollupCls}`;
/**
 * If the task's {@link Gantt/model/TaskModel#field-rollup} data field is set to true, it displays a small bar or diamond below its summary task in the timeline.
 * Each of the rollup elements show a tooltip when hovering it with details of the task.
 * The tooltip content is customizable, see {@link #config-template} config for details.
 *
 * To edit the rollup data field, use {@link Gantt/column/RollupColumn} or a checkbox on Advanced tab of {@link Gantt/widget/TaskEditor}.
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid/view/mixin/GridFeatures}.
 *
 * @extends Scheduler/feature/base/TooltipBase
 * @inlineexample Gantt/feature/Rollups.js
 * @demo Gantt/rollups
 * @classtype rollups
 * @feature
 */

class Rollups extends TooltipBase {
  //region Config
  static get $name() {
    return 'Rollups';
  } // Default configuration.

  static get defaultConfig() {
    return {
      cls: 'b-gantt-task-tooltip',
      align: 't-b',
      forSelector: rollupSelector
    };
  }

  static get pluginConfig() {
    return {
      chain: [// onTaskDataGenerated for decorating task with rollups
      'onTaskDataGenerated', // render for creating tooltip (in TooltipBase)
      'onPaint']
    };
  } //endregion
  //region Init & destroy

  construct(gantt, config) {
    const me = this;
    me.tipId = `${gantt.id}-rollups-tip`;
    super.construct(gantt, config);
  }

  attachToTaskStore(store) {
    this.detachListeners('taskStore');

    if (store) {
      store.on({
        name: 'taskStore',
        update: 'onStoreUpdateRecord',
        thisObj: this
      });
    }
  }

  doDestroy() {
    this.attachToTaskStore(null);
    super.doDestroy();
  }

  doDisable(disable) {
    const me = this,
          {
      dependencies
    } = me.client.features;

    if (me.tooltip) {
      me.tooltip.disabled = disable;
    } // attach/detach listeners

    me.attachToTaskStore(disable ? null : me.client.taskStore); // Hide or show the rollup elements

    me.client.refresh(); // Redraw dependencies *after* elements have animated to new position,
    // and we must clear cache because of position changes.

    if (dependencies) {
      me.client.setTimeout(() => dependencies.scheduleDraw(true), 300);
    }

    super.doDisable(disable);
  } //endregion

  getTipHtml({
    activeTarget,
    event
  }) {
    const {
      client
    } = this,
          task = client.resolveTaskRecord(activeTarget),
          rawElements = document.elementsFromPoint(event.pageX + globalThis.pageXOffset, event.pageY + globalThis.pageYOffset),
          // MS browsers return NodeList instead of array
    rollupElements = Array.from(rawElements).filter(e => e.classList.contains(rollupCls)).sort((lhs, rhs) => parseInt(lhs.dataset.index, 10) - parseInt(rhs.dataset.index, 10)),
          children = [];

    for (const rollupElement of rollupElements) {
      children.push(task.children[parseInt(rollupElement.dataset.index, 10)]);
    }

    return this.template({
      task,
      children
    });
  }
  /**
   * Template (a function accepting event data and returning a string) used to display info in the tooltip.
   * The template will be called with an object as with fields as detailed below
   * @config {Function}
   * @param {Object} data A data block containing the information needed to create tooltip content.
   * @param {Gantt.model.TaskModel} data.task The summary task to rollup to.
   * @param {Gantt.model.TaskModel[]} data.children The array of rollup tasks.
   */

  template({
    children
  }) {
    const me = this,
          {
      client
    } = me,
          pieces = [];
    children.map((child, index) => {
      const {
        startDate,
        endDate
      } = child,
            startText = client.getFormattedDate(startDate),
            endDateValue = client.getDisplayEndDate(endDate, startDate),
            endText = client.getFormattedDate(endDateValue);
      pieces.push(`<div class="b-gantt-task-title ${index ? 'b-follow-on' : ''}">${child.name}</div><table>`, `<tr><td>${me.L('L{TaskTooltip.Start}')}:</td><td>${me.clockTemplate.template({
        date: startDate,
        text: startText,
        cls: 'b-sch-tooltip-startdate'
      })}</td></tr>`, `<tr><td>${me.L('L{TaskTooltip.End}')}:</td><td>${child.isMilestone ? '' : me.clockTemplate.template({
        date: endDateValue,
        text: endText,
        cls: 'b-sch-tooltip-enddate'
      })}</td></tr></table>`);
    });
    return pieces.join('');
  } //region Events

  onStoreUpdateRecord({
    record,
    changes
  }) {
    // We don't need this listener in case the gantt is loading data
    if (!this.client.project.propagatingLoadChanges) {
      // If it's a size or position change, then sync that parent's rollups
      if (record.parent && (changes.rollup || changes.startDate || changes.endDate)) {
        this.client.taskRendering.redraw(record.parent);
      }
    }
  }

  onTaskDataGenerated({
    taskRecord,
    left,
    wrapperChildren,
    style
  }) {
    // Not checking taskRecord.isParent as it might be a lazy loaded parent (set to `true`)
    if (!this.disabled && Array.isArray(taskRecord.children)) {
      const // Shortest last in DOM, so they are on top in the stacking order so that you can hover
      // them if they overlap with longer ones. Otherwise, they might be below and won't trigger
      // their own mouseover events.
      children = taskRecord.children.slice().sort((lhs, rhs) => rhs.durationMS - lhs.durationMS);
      wrapperChildren.push({
        className: `${rollupCls}-wrap`,
        dataset: {
          taskFeature: 'rollups'
        },
        children: children.map(child => {
          // skip inactive children if the task itself is active, skip unscheduled tasks
          // (might be unscheduled because of delayed calculations)
          if (child.rollup && child.isScheduled && (!child.inactive || taskRecord.inactive)) {
            const positionData = this.client.getSizeAndPosition(child);

            if (!positionData) {
              return null;
            }

            const {
              position,
              width
            } = positionData;
            return {
              dataset: {
                index: child.parentIndex,
                rollupTaskId: child.id
              },
              className: {
                [rollupCls]: rollupCls,
                [child.cls]: child.cls,
                'b-milestone': child.isMilestone,
                'b-inactive': child.inactive
              },
              style: {
                style,
                width: child.isMilestone ? null : width,
                left: position - left
              }
            };
          }

          return null;
        }),
        syncOptions: {
          syncIdField: 'rollupTaskId'
        }
      });
    }
  } //endregion

}
Rollups._$name = 'Rollups';
GridFeatureManager.registerFeature(Rollups, false, 'Gantt');

/**
 * @module Gantt/feature/Summary
 */

/**
 * A feature displaying a summary bar in the grid footer.
 *
 * ## Summaries in the locked grid
 * For regular columns in the locked section - specify type of summary on columns, available types are:
 * <dl class="wide">
 * <dt>sum <dd>Sum of all values in the column
 * <dt>add <dd>Alias for sum
 * <dt>count <dd>Number of rows
 * <dt>countNotEmpty <dd>Number of rows containing a value
 * <dt>average <dd>Average of all values in the column
 * <dt>function <dd>A custom function, used with store.reduce. Should take arguments (sum, record)
 * </dl>
 * Columns can also specify a {@link Grid.column.Column#config-summaryRenderer} to format the calculated sum.
 *
 * ## Summaries in the time axis grid
 *
 * To output summaries in the ticks of the time axis summary bar, either provide a {@link #config-renderer} or use
 * {@link #config-summaries}. The `renderer` method provides the current tick `startDate` and `endDate` which you
 * can use to output the data you want to present in each summary cell.
 *
 * ```javascript
 * features : {
 *     summary     : {
 *         // Find all intersecting task and render the count in each cell
 *         renderer: ({ taskStore, startDate, endDate }) => {
 *             const intersectingTasks = taskStore.query(task =>
 *                 // Gantt by default renders tasks as early as possible, if loaded with un-normalized data there
 *                 // might not be any start and end dates calculated yet
 *                 task.isScheduled &&
 *                 // Find tasks that intersect the current tick
 *                 DateHelper.intersectSpans(task.startDate, task.endDate, startDate, endDate)
 *             );
 *
 *             return intersectingTasks.length;
 *         }
 *     }
 * }
 * ```
 *
 * {@inlineexample Gantt/feature/Summary.js}
 *
 * This feature is <strong>disabled</strong> by default.
 *
 * @extends Scheduler/feature/TimelineSummary
 * @classtype summary
 * @feature
 * @demo Gantt/summary
 * @typings Grid/feature/Summary -> Grid/feature/GridSummary
 * @typings Scheduler/feature/Summary -> Scheduler/feature/SchedulerSummary
 */

class Summary extends TimelineSummary {
  //region Config
  static get $name() {
    return 'Summary';
  }

  static get configurable() {
    return {
      /**
       * Array of summary configs which consists of a label and a {@link #config-renderer} function
       *
       * ```javascript
       * new Gantt({
       *     features : {
       *         summary : {
       *             summaries : [
       *                 {
       *                     label : 'Label',
       *                     renderer : ({ startDate, endDate, taskStore }) => {
       *                         // return display value
       *                         returns '<div>Renderer output</div>';
       *                     }
       *                 }
       *             ]
       *         }
       *     }
       * });
       * ```
       *
       * @config {Object[]}
       */
      summaries: null,

      /**
       * Renderer function for a single time axis tick. Should calculate a sum and return HTML as a result.
       *
       * ```javascript
       * new Gantt({
       *     features : {
       *         summary : {
       *             renderer : ({ startDate, endDate, taskStore }) => {
       *                 // return display value
       *                 returns '<div>Renderer output</div>';
       *             }
       *         }
       *     }
       * });
       * ```
       *
       * @param {Date} startDate Tick start date
       * @param {Date} endDate Tick end date
       * @param {Gantt.data.TaskStore} taskStore Task store
       * @returns {String} Html content
       * @config {Function}
       */
      renderer: null
    };
  } // Plugin configuration. This plugin chains some of the functions in Grid.

  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push('updateTaskStore');
    return config;
  } //endregion
  //region Init

  construct(gantt, config) {
    super.construct(gantt, config); // Feature might be run from Grid (in docs), should not crash

    if (gantt.isGanttBase) {
      this.updateTaskStore(gantt.taskStore);
    }
  } //endregion
  //region Render

  updateTaskStore(taskStore) {
    this.detachListeners('summaryTaskStore');
    taskStore.on({
      name: 'summaryTaskStore',
      filter: 'updateTimelineSummaries',
      thisObj: this
    });
  }
  /**
   * Updates summaries.
   * @private
   */

  updateTimelineSummaries() {
    const me = this,
          {
      client: timeline,
      summaries
    } = me,
          {
      timeAxis
    } = timeline,
          summaryContainer = me.summaryBarElement;

    if (summaryContainer && timeline.isEngineReady) {
      Array.from(summaryContainer.children).forEach((element, i) => {
        const tick = timeAxis.getAt(i);
        let html = '',
            tipHtml = `<header>${me.L('L{Summary for}', timeline.getFormattedDate(tick.startDate))}</header>`;
        summaries.forEach(config => {
          const value = config.renderer({
            startDate: tick.startDate,
            endDate: tick.endDate,
            taskStore: timeline.taskStore,
            resourceStore: timeline.resourceStore,
            element
          }),
                valueHtml = `<div class="b-timeaxis-summary-value">${value !== null && value !== void 0 ? value : '&nbsp;'}</div>`;

          if (summaries.length > 1 || value !== '') {
            html += valueHtml;
          }

          tipHtml += `<label>${config.label || ''}</label>` + valueHtml;
        });
        element.innerHTML = html;
        element._tipHtml = tipHtml;
      });
    }
  }

} // Override Grids Summary with this improved version

Summary._$name = 'Summary';
GridFeatureManager.registerFeature(Summary, false, 'Gantt');

/**
 * @module Gantt/feature/TaskCopyPaste
 */

/**
 * Allow using [Ctrl/CMD + C/X] and [Ctrl/CMD + V] to copy/cut and paste tasks. You can configure how a newly pasted record
 * is named using {@link #function-generateNewName}
 *
 * This feature is **enabled** by default
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         taskCopyPaste : true
 *     }
 * });
 * ```
 *
 * ## Keyboard shortcuts
 *
 * By default, this feature will react to Ctrl+C, Ctrl+X and Ctrl+V for standard clipboard actions.
 * You can reconfigure the keys used to trigger these actions, see {@link #config-keyMap} for more details.
 *
 * @extends Grid/feature/RowCopyPaste
 * @inlineexample Gantt/feature/TaskCopyPaste.js
 * @classtype taskCopyPaste
 * @feature
 */

class TaskCopyPaste extends RowCopyPaste {
  static get $name() {
    return 'TaskCopyPaste';
  }

  static get type() {
    return 'taskCopyPaste';
  }

  static get configurable() {
    return {
      copyRecordText: 'L{copyTask}',
      cutRecordText: 'L{cutTask}',
      pasteRecordText: 'L{pasteTask}'
    };
  }

  construct(gantt, config) {
    super.construct(gantt, config);
    gantt.on({
      beforeRenderTask: 'onBeforeRenderTask',
      thisObj: this
    });
  }

  onRowCut(record) {
    super.onRowCut(record); // After a row is cut - also refresh the associated task bar

    this.client.taskRendering.redraw(record);
  }

  onRowCutOrCopy(taskRecord) {
    super.onRowCutOrCopy(...arguments); // After a row is cut or copied - also refresh the associated task bar

    this.client.taskRendering.redraw(taskRecord);
  }

  onBeforeRenderTask({
    renderData
  }) {
    renderData.cls['b-cut-row'] = renderData.row.cls['b-cut-row'];
  }

  pasteRows(referenceRecord = this.client.selectedRecord) {
    const me = this,
          records = me.clipboardRecords,
          isCut = me._isCut,
          client = me.client;
    /**
     * Fires on the owning Gantt before a paste action is performed, return `false` to prevent the action
     * @event beforePaste
     * @preventable
     * @on-owner
     * @param {Gantt.view.Gantt} source Owner Gantt
     * @param {Gantt.model.TaskModel} referenceRecord The reference task record, the clipboard task records will
     * be pasted above this row.
     * @param {Gantt.model.TaskModel[]} records The records about to be pasted
     * @param {Boolean} isCut `true` if this is a cut action
     */

    if (client.readOnly || !records.length || client.trigger('beforePaste', {
      records,
      referenceRecord,
      isCut
    }) === false) {
      return [];
    } // important to sort selected before copying to rely on indices when extract/apply dependencies and
    // parents since all ids will be cleared after record.copy operation. Sorting itself is required to
    // make sure records will be added in correct order independent of how they were selected

    me.sortByIndex(records);
    const deps = me.extractDependencies(records, isCut),
          parentsMap = me.extractParents(records, isCut),
          recordsToProcess = isCut ? records : records.map(rec => {
      rec = rec.copy();
      rec[me.nameField] = me.generateNewName(rec);
      return rec;
    });

    if (isCut) {
      client.store.move(recordsToProcess, referenceRecord); // reset clipboard

      me.clearClipboard();
    } else {
      me.insertCopiedRecords(referenceRecord, recordsToProcess);
      client.selectedRecords = recordsToProcess;
    } // re-apply dependencies via copied records only
    // applying dependencies possible only after copied records were added to project

    me.applyDependencies(recordsToProcess, deps); // re-apply hierarchy via copied records only

    me.applyParents(recordsToProcess, parentsMap);
    return recordsToProcess;
  }
  /**
   * Extract dependecies from passed records. The result will include all deps in case of cut operation or
   * only deps via records and not include deps with foreign records.
   * @param {Core.data.Model[]} taskRecords array of records to extract dependencies from
   * @param {Boolean} [isCut] Copy by default, pass 'true' to cut operation.
   * @returns {Object[]} array of dependencies settings via passed records to apply using applyDependencies method
   * @private
   */

  extractDependencies(taskRecords, isCut = false) {
    return taskRecords.map(rec => {
      const deps = [];
      rec.predecessors.forEach(predecessor => {
        if (taskRecords.includes(predecessor.fromEvent)) {
          deps.push({
            fromEvent: taskRecords.indexOf(predecessor.fromEvent)
          });
        } // support foreign dependencies for cut/paste opertion
        else if (isCut) {
          deps.push({
            fromEventId: predecessor.fromEvent.id
          });
        }
      });
      rec.successors.forEach(successor => {
        if (taskRecords.includes(successor.toEvent)) {
          deps.push({
            toEvent: taskRecords.indexOf(successor.toEvent)
          });
        } // support foreign dependencies for cut/paste opertion
        else if (isCut) {
          deps.push({
            toEventId: successor.toEvent.id
          });
        }
      });

      if (isCut) {
        // remove old record dependencies because it will be removed from the store/tree
        rec.dependencies = [];
      }

      return deps;
    });
  }
  /**
   * Apply dependecies to passed records from dependencies array
   * @param {Core.data.Model[]} taskRecords array of records to apply dependencies on
   * @param {Object[]} deps array of dependencies settings, result of extractDependencies method
   * @private
   */

  applyDependencies(taskRecords, deps) {
    taskRecords.forEach((rec, idx) => {
      // update from/to on dependencies with the new record id
      rec.dependencies = deps[idx].map(dep => {
        var _ref, _dep$fromEventId, _taskRecords$dep$from, _ref2, _dep$toEventId, _taskRecords$dep$toEv;

        return {
          fromEvent: (_ref = (_dep$fromEventId = dep.fromEventId) !== null && _dep$fromEventId !== void 0 ? _dep$fromEventId : (_taskRecords$dep$from = taskRecords[dep.fromEvent]) === null || _taskRecords$dep$from === void 0 ? void 0 : _taskRecords$dep$from.id) !== null && _ref !== void 0 ? _ref : rec.id,
          toEvent: (_ref2 = (_dep$toEventId = dep.toEventId) !== null && _dep$toEventId !== void 0 ? _dep$toEventId : (_taskRecords$dep$toEv = taskRecords[dep.toEvent]) === null || _taskRecords$dep$toEv === void 0 ? void 0 : _taskRecords$dep$toEv.id) !== null && _ref2 !== void 0 ? _ref2 : rec.id
        };
      });
    });
  }
  /**
   * Extract parents from passed records. Result will include only hierarchy via copied records.
   * @param {Core.data.Model[]} taskRecords array of records to extract parents from
   * @returns {Object[]} array of parent id settings via passed records to apply using applyParents method
   * @private
   */

  extractParents(taskRecords) {
    return taskRecords.map(rec => {
      if (taskRecords.includes(rec.parent)) {
        return taskRecords.indexOf(rec.parent);
      }
    });
  }
  /**
   * Apply parents to passed records.
   * @param {Core.data.Model[]} taskRecords array of records to apply hierarchy on.
   * @param {Object[]} parentsMap array of parent id settings via passed records, result of extractParents method
   * @private
   */

  applyParents(taskRecords, parentsMap) {
    taskRecords.forEach((rec, idx) => {
      if (!isNaN(parentsMap[idx])) {
        taskRecords[parentsMap[idx]].appendChild(rec);
      }
    });
  }

}
TaskCopyPaste._$name = 'TaskCopyPaste';
GridFeatureManager.registerFeature(TaskCopyPaste, true, 'Gantt');

/**
 * @module Gantt/feature/TaskDrag
 */

/**
 * Allows user to drag and drop tasks within Gantt, to change their start date.
 *
 * ## Constraining the drag drop area
 *
 * You can constrain how the dragged task is allowed to move by using {@link Gantt.view.Gantt#config-getDateConstraints}.
 * This method is configured on the Gantt instance and lets you define the date range for the dragged task programmatically.
 *
 * ## Drag drop tasks from outside
 *
 * Dragging unplanned tasks from an external grid is a very popular use case. Please refer to the [Drag from grid demo](../examples/drag-from-grid)
 * and study the [Drag from grid guide](#Gantt/guides/dragdrop/drag_tasks_from_grid.md) to learn more.
 *
 * ## Validating a drag drop operation
 *
 * It is easy to programmatically decide what is a valid drag drop operation. Use the {@link #config-validatorFn}
 * and return either `true` / `false` (optionally a message to show to the user).
 *
 * ```javascript
 * features : {
 *     taskDrag : {
 *        validatorFn(draggedTaskRecords, newStartDate) {
 *            const valid = Date.now() >= newStartDate;
 *
 *            return {
 *                valid,
 *                message : valid ? '' : 'Not allow to drag a task into the past'
 *            };
 *        }
 *     }
 * }
 * ```
 *
 * If you instead want to do a single validation upon drop, you can listen to {@link #event-beforeTaskDropFinalize}
 * and set the `valid` flag on the context object provided.
 *
 * ```javascript
 *   const gantt = new Gantt({
 *      listeners : {
 *          beforeTaskDropFinalize({ context }) {
 *              const { taskRecords } = context;
 *              // Don't allow dropping a task in the past
 *              context.valid = Date.now() <= eventRecords[0].startDate;
 *          }
 *      }
 *  });
 * ```
 *
 * ## Preventing drag of certain tasks
 *
 * To prevent certain tasks from being dragged, you have two options. You can set {@link Gantt.model.TaskModel#field-draggable}
 * to `false` in your data, or you can listen for the {@link Gantt.view.Gantt#event-beforeTaskDrag} event and
 * return `false` to block the drag.
 *
 * ```javascript
 * new Gantt({
 *    listeners : {
 *        beforeTaskDrag({ taskRecord }) {
 *            // Only allow dragging tasks that has not started
 *            return taskRecord.percentDone === 0;
 *        }
 *    }
 * })
 * ```
 *
 * ## Customizing the drag drop tooltip
 *
 * To show custom HTML in the tooltip, please see the {@link #config-tooltipTemplate} config. Example:
 *
 * ```javascript
 * features: {
 *     taskDrag: {
 *         // A minimal start date tooltip
 *         tooltipTemplate : ({ taskRecord, startDate }) => {
 *             return DateHelper.format(startDate, 'HH:mm');
 *         }
 *     }
 * }
 * ```
 * This feature is **enabled** by default
 *
 * @extends Scheduler/feature/base/DragBase
 * @demo Gantt/basic
 * @classtype taskDrag
 * @feature
 */

class TaskDrag extends DragBase {
  //region Config
  static get $name() {
    return 'TaskDrag';
  }

  static get configurable() {
    return {
      /**
       * An empty function by default, but provided so that you can perform custom validation on
       * the item being dragged. This function is called during the drag and drop process and also after the drop is made.
       * Return true if the new position is valid, false to prevent the drag.
       * @param {Gantt.model.TaskModel[]} taskRecords An array of tasks being dragged
       * @param {Date} startDate The new start date
       * @param {Number} duration The duration of the item being dragged
       * @param {Event} event The event object
       * @return {Boolean|Object} `true` if this validation passes, `false` if it does not.
       *
       * Or an object with 2 properties: `valid` -  Boolean `true`/`false` depending on validity,
       * and `message` - String with a custom error message to display when invalid.
       * @config {Function}
       */
      validatorFn: (taskRecords, startDate, duration, event) => true,

      /**
       * `this` reference for the validatorFn
       * @config {Object}
       */
      validatorFnThisObj: null,

      /**
       * Gets or sets special key to activate successor pinning behavior. Supported values are:
       * * 'ctrl'
       * * 'shift'
       * * 'alt'
       * * 'meta'
       *
       * Assign false to disable it.
       * @member {Boolean|String} pinSuccessors
       */

      /**
       * Set to true to enable dragging task while pinning dependent tasks. By default, this behavior is activated
       * if you hold CTRL key during drag. Alternatively, you may provide key name to use. Supported values are:
       * * 'ctrl'
       * * 'shift'
       * * 'alt'
       * * 'meta'
       *
       * **Note**: Only supported in forward-scheduled project
       *
       * @config {Boolean|String}
       * @default
       */
      pinSuccessors: false,
      tooltipCls: 'b-gantt-taskdrag-tooltip'
    };
  }

  changePinSuccessors(value) {
    return EventHelper.toSpecialKey(value);
  }
  /**
   * Template used to generate drag tooltip contents.
   * ```
   * const gantt = new Gantt({
   *   features : {
   *     taskDrag : {
   *       tooltipTemplate({taskRecord, startText}) {
   *         return `${taskRecord.name}: ${startText}`
   *       }
   *     }
   *   }
   * });
   * ```
   * @config {Function} tooltipTemplate
   * @param {Object} data Tooltip data
   * @param {Gantt.model.TaskModel} data.taskRecord
   * @param {Boolean} data.valid Currently over a valid drop target or not
   * @param {Date} data.startDate New start date
   * @param {Date} data.endDate New end date
   * @returns {String}
   */
  //endregion
  //region Events

  /**
   * Fires on the owning Gantt before task dragging starts. Return false to prevent the action.
   * @event beforeTaskDrag
   * @preventable
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {Gantt.model.TaskModel} taskRecord
   * @param {Event} event The native browser event
   */

  /**
   * Fires on the owning Gantt when task dragging starts
   * @event taskDragStart
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {Gantt.model.TaskModel[]} taskRecords
   */

  /**
   * Fires on the owning Gantt while a task is being dragged
   * @event taskDrag
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {Gantt.model.TaskModel[]} taskRecords
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Object} dragData
   * @param {Boolean} changed `true` if startDate has changed.
   */

  /**
   * Fires on the owning Gantt to allow implementer to prevent immediate finalization by setting `data.context.async = true`
   * in the listener, to show a confirmation popup etc
   * ```
   *  scheduler.on('beforetaskdropfinalize', ({ context }) => {
   *      context.async = true;
   *      setTimeout(() => {
   *          // async code don't forget to call finalize
   *          context.finalize();
   *      }, 1000);
   *  })
   * ```
   * @event beforeTaskDropFinalize
   * @on-owner
   * @param {Gantt.view.Gantt} source Gantt instance
   * @param {Object} context
   * @param {Gantt.model.TaskModel[]} context.taskRecords The dragged task records
   * @param {Boolean} context.valid Set this to `false` to mark the drop as invalid
   * @param {Boolean} context.async Set true to handle dragdrop asynchronously (e.g. to wait for user
   * confirmation)
   * @param {Function} context.finalize Call this method to finalize dragdrop. This method accepts one
   * argument: pass true to update records, or false, to ignore changes
   */

  /**
   * Fires on the owning Gantt after a valid task drop
   * @event taskDrop
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {Gantt.model.TaskModel[]} taskRecords
   * @param {Boolean} isCopy
   */

  /**
   * Fires on the owning Gantt after a task drop, regardless if the drop validity
   * @event afterTaskDrop
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {Gantt.model.TaskModel[]} taskRecords
   * @param {Boolean} valid
   */
  //endregion
  //region Init

  construct(gantt, config) {
    this.gantt = gantt;
    super.construct(gantt, config);
  }

  get store() {
    return this.gantt.taskStore;
  } //endregion
  //region Drag events

  isElementDraggable(el, event) {
    var _taskResize$isOverAny;

    const {
      gantt
    } = this,
          taskElement = DomHelper.up(el, gantt.eventSelector),
          {
      taskResize
    } = gantt.features;

    if (!taskElement) {
      return false;
    } // displaying something resizable within the event?
    // if (DomHelper.up(el, gantt.eventSelector).matches('[class$="-handle"]')) {

    if (el.matches('[class$="-handle"]')) {
      return false;
    }

    const taskRecord = gantt.resolveTaskRecord(taskElement);

    if (!taskRecord || !taskRecord.isDraggable || taskRecord.readOnly) {
      return false;
    } // 1. Check if we are over a virtual resize handle?
    // 2. Milestones cannot be resized
    // 3. Need to ensure we handle case when taskResize is disabled (=== false)

    if (taskRecord.resizable && !taskRecord.isMilestone && taskResize !== null && taskResize !== void 0 && (_taskResize$isOverAny = taskResize.isOverAnyHandle) !== null && _taskResize$isOverAny !== void 0 && _taskResize$isOverAny.call(taskResize, event, taskElement)) {
      return false;
    }

    return true;
  }

  triggerEventDrag(dragData, start) {
    // Trigger the event on every mousemove so that features which need to adjust
    // Such as dependencies and baselines can keep adjusted.
    this.gantt.trigger('taskDrag', {
      taskRecords: dragData.draggedEntities,
      startDate: dragData.startDate,
      endDate: dragData.endDate,
      dragData,
      changed: dragData.startDate - start !== 0
    });
  }

  triggerDragStart(dragData) {
    this.gantt.trigger('taskDragStart', {
      taskRecords: dragData.draggedEntities,
      dragData
    });
  }

  triggerDragAbort(dragData) {
    this.gantt.trigger('taskDragAbort', {
      taskRecords: dragData.draggedEntities,
      context: dragData
    });
  }

  triggerDragAbortFinalized(dragData) {
    this.gantt.trigger('taskDragAbortFinalized', {
      taskRecords: dragData.draggedEntities,
      context: dragData
    });
  }

  triggerAfterDrop(dragData, valid) {
    this.currentOverClient.trigger('afterTaskDrop', {
      taskRecords: dragData.draggedEntities,
      context: dragData,
      valid
    });
  } //endregion
  //region Drag data

  getProductDragContext(dd) {
    return {
      valid: true
    };
  }

  getMinimalDragData(info) {
    const element = this.getElementFromContext(info),
          taskRecord = this.gantt.resolveTaskRecord(element);
    return {
      taskRecord
    };
  }

  setupProductDragData(info) {
    var _gantt$getDateConstra;

    const me = this,
          gantt = me.gantt,
          element = info.element,
          taskRecord = gantt.resolveTaskRecord(element),
          taskRegion = Rectangle.from(element),
          relatedRecords = me.getRelatedRecords(taskRecord) || [],
          dateConstraints = (_gantt$getDateConstra = gantt.getDateConstraints) === null || _gantt$getDateConstra === void 0 ? void 0 : _gantt$getDateConstra.call(gantt, taskRecord),
          eventBarEls = [element];
    me.setupConstraints(gantt.getScheduleRegion(taskRecord), taskRegion, gantt.timeAxisViewModel.snapPixelAmount, Boolean(dateConstraints)); // Collecting additional elements to drag

    relatedRecords.forEach(r => {
      ArrayHelper.include(eventBarEls, gantt.getElementFromTaskRecord(r, false));
    });
    const draggedEntities = [taskRecord, ...relatedRecords];
    return {
      record: taskRecord,
      dateConstraints,
      eventBarEls,
      draggedEntities,
      taskRecords: draggedEntities
    };
  }
  /**
   * Get correct axis coordinate.
   * @private
   * @param {Gantt.model.TaskModel} taskRecord Record being dragged
   * @param {HTMLElement} element Element being dragged
   * @param {Number[]} coord XY coordinates
   * @returns {Number|Number[]} X,Y or XY
   */

  getCoordinate(taskRecord, element, coord) {
    return coord[0];
  } //endregion
  //region Finalize & validation
  // Called from EventDragBase to assert if a drag is valid or not

  checkDragValidity(dragData, event) {
    return this.validatorFn.call(this.validatorFnThisObj || this, dragData.draggedEntities, dragData.startDate, dragData.duration, event);
  }
  /**
   * Checks if a task can be dropped on the specified location
   * @private
   * @returns {Boolean} Valid (true) or invalid (false)
   */

  isValidDrop(dragData) {
    return true;
  }
  /**
   * Update tasks being dragged.
   * @private
   * @param {Object} context Drag data.
   */

  async updateRecords(context) {
    const {
      startDate,
      browserEvent,
      draggedEntities: [taskRecord]
    } = context,
          oldStartDate = taskRecord.startDate;

    if (this.pinSuccessors && browserEvent[this.pinSuccessors]) {
      await taskRecord.moveTaskPinningSuccessors(startDate);
    } else {
      await taskRecord.setStartDate(startDate, true);
    } // If not rejected (the startDate has changed), tell the world there was a successful drop.

    if (taskRecord.startDate - oldStartDate) {
      this.gantt.trigger('taskDrop', {
        taskRecords: context.draggedEntities
      });
    } else {
      this.dragData.valid = false;
    }
  }

  getRecordElement(task) {
    return this.gantt.getElementFromTaskRecord(task, true);
  } //endregion

}
TaskDrag._$name = 'TaskDrag';
GridFeatureManager.registerFeature(TaskDrag, true, 'Gantt');

/**
 * @module Gantt/feature/TaskDragCreate
 */

/**
 * A feature that allows the user to schedule tasks by dragging in the empty parts of the gantt timeline row. Note, this feature is only applicable for unscheduled tasks.
 * {@inlineexample Gantt/feature/TaskDragCreate.js}
 *
 *
 * This feature is **enabled** by default
 *
 * @extends Scheduler/feature/base/DragCreateBase
 * @demo Gantt/advanced
 * @classtype taskDragCreate
 * @feature
 */

class TaskDragCreate extends DragCreateBase {
  //region Config
  static get $name() {
    return 'TaskDragCreate';
  }

  static get configurable() {
    return {
      // used by gantt to only allow one task per row
      preventMultiple: true
    };
  } //endregion
  //region Events

  /**
   * Fires on the owning Gantt after the task has been scheduled.
   * @event dragCreateEnd
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {Gantt.model.TaskModel} taskRecord
   * @param {MouseEvent} event The ending mouseup event.
   * @param {HTMLElement} proxyElement The proxy element showing the drag creation zone.
   */

  /**
   * Fires on the owning Gantt at the beginning of the drag gesture
   * @event beforeDragCreate
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {Gantt.model.TaskModel} taskRecord
   * @param {Date} date The datetime associated with the drag start point.
   */

  /**
   * Fires on the owning Gantt after the drag start has created a proxy element.
   * @event dragCreateStart
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {HTMLElement} proxyElement The proxy representing the new event.
   */

  /**
   * Fires on the owning Gantt to allow implementer to prevent immediate finalization by setting `data.context.async = true`
   * in the listener, to show a confirmation popup etc
   * ```
   *  scheduler.on('beforedragcreatefinalize', ({context}) => {
   *      context.async = true;
   *      setTimeout(() => {
   *          // async code don't forget to call finalize
   *          context.finalize();
   *      }, 1000);
   *  })
   * ```
   * @event beforeDragCreateFinalize
   * @on-owner
   * @param {Gantt.view.Gantt} source Scheduler instance
   * @param {HTMLElement} proxyElement Proxy element, representing future event
   * @param {Object} context
   * @param {Boolean} context.async Set true to handle drag create asynchronously (e.g. to wait for user
   * confirmation)
   * @param {Function} context.finalize Call this method to finalize drag create. This method accepts one
   * argument: pass true to update records, or false, to ignore changes
   */

  /**
   * Fires on the owning Gantt at the end of the drag create gesture whether or not
   * a task was scheduled by the gesture.
   * @event afterDragCreate
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {HTMLElement} proxyElement The proxy element showing the drag creation zone.
   */
  //endregion
  //region Init

  construct(gantt, config) {
    this.gantt = gantt;
    super.construct(gantt, config);
  }

  get store() {
    return this.gantt.taskStore;
  } //endregion
  //region Gantt specific implementation

  setupDragContext(event) {
    var _event$target$closest, _event$target;

    const {
      client
    } = this; // Only mousedown on an empty cell can initiate drag-create

    if ((_event$target$closest = (_event$target = event.target).closest) !== null && _event$target$closest !== void 0 && _event$target$closest.call(_event$target, `.${client.timeAxisColumn.cellCls}`)) {
      const taskRecord = client.getRecordFromElement(event.target); // And there must be a task backing the cell.

      if (taskRecord) {
        // Skip the EventResize's setupDragContext. We want the base one.
        const result = Draggable().prototype.setupDragContext.call(this, event);
        result.scrollManager = client.scrollManager;
        result.taskRecord = result.rowRecord = taskRecord;
        return result;
      }
    }
  }

  startDrag(drag) {
    // This flag must be set in startDrag
    const draggingEnd = this.draggingEnd = drag.event.pageX > drag.startEvent.pageX,
          {
      client
    } = this,
          {
      timeAxis
    } = client,
          {
      mousedownDate,
      taskRecord,
      date
    } = drag;
    client.beginListeningForBatchedUpdates();
    taskRecord.beginBatch();
    taskRecord.set('startDate', DateHelper.floor(draggingEnd ? mousedownDate : date, timeAxis.resolution, undefined, client.weekStartDay));
    taskRecord.set('endDate', DateHelper.ceil(draggingEnd ? date : mousedownDate, timeAxis.resolution, undefined, client.weekStartDay)); // This presents the task to be scheduled for validation at the proposed mouse/date point
    // If rejected, we have to revert the batched changes

    if (this.handleBeforeDragCreate(drag, taskRecord, drag.event) === false) {
      this.onAborted(drag);
      return false;
    } // Now it will have an element, and that's what we are dragging

    drag.itemElement = drag.element = client.getElementFromTaskRecord(drag.taskRecord);
    return super.startDrag.call(this, drag);
  }

  handleBeforeDragCreate(drag, taskRecord, event) {
    var _me$gantt$getDateCons, _me$gantt;

    const me = this,
          result = me.gantt.trigger('beforeDragCreate', {
      taskRecord: taskRecord,
      date: drag.mousedownDate,
      event
    }); // Save date constraints

    me.dateConstraints = (_me$gantt$getDateCons = (_me$gantt = me.gantt).getDateConstraints) === null || _me$gantt$getDateCons === void 0 ? void 0 : _me$gantt$getDateCons.call(_me$gantt, taskRecord);
    return result;
  }

  checkValidity(context, event) {
    const me = this;
    context.taskRecord = me.dragging.taskRecord;
    return me.createValidatorFn.call(me.validatorFnThisObj || me, context, event);
  } // Row is not empty if task is scheduled

  isRowEmpty(taskRecord) {
    return !taskRecord.startDate || !taskRecord.endDate;
  }

  onAborted({
    taskRecord
  }) {
    taskRecord.cancelBatch();
    this.client.endListeningForBatchedUpdates();
  } //endregion

}
TaskDragCreate._$name = 'TaskDragCreate';
GridFeatureManager.registerFeature(TaskDragCreate, true, 'Gantt');

/**
 * @module Gantt/widget/TaskEditor
 */

/**
 * Provides a UI to edit tasks in a popup dialog. It is implemented as a Tab Panel with several preconfigured built-in
 * tabs. Although the default configuration may be adequate in many cases, the Task Editor is easily configurable.
 *
 * This demo shows how to use TaskEditor as a standalone widget:
 *
 * {@inlineexample Gantt/widget/TaskEditor.js}
 *
 * To hide built-in tabs or to add custom tabs, or to append widgets to any of the built-in tabs
 * use the {@link Gantt.feature.TaskEdit#config-items items} config.
 *
 * The Task editor contains tabs by default. Each tab is a container with built in widgets: text fields, grids, etc.
 *
 * | Tab ref           | Text         | Weight | Description                                           |
 * |-------------------|--------------|--------|-------------------------------------------------------|
 * | `generalTab`      | General      | 100    | Name, start/end dates, duration, percent done, effort |
 * | `predecessorsTab` | Predecessors | 200    | Grid with incoming dependencies                       |
 * | `successorsTab`   | Successors   | 300    | Grid with outgoing dependencies                       |
 * | `resourcesTab`    | Resources    | 400    | Grid with assigned resources                          |
 * | `advancedTab`     | Advanced     | 500    | Assigned calendar, scheduling mode, constraints, etc  |
 * | `notesTab`        | Notes        | 600    | Text area to add notes to the selected task           |
 *
 * ## Task editor customization example
 *
 * This example shows a custom Task Editor configuration. The built-in "Notes" tab is hidden, a custom "Files" tab is
 * added, the "General" tab is renamed to "Common" and "Custom" field is appended to it. Double-click on a task bar to
 * start editing:
 *
 * {@inlineexample Gantt/feature/TaskEditCustom.js}
 *
 * @extends SchedulerPro/widget/GanttTaskEditor
 */

class TaskEditor extends GanttTaskEditor {
  // Factoryable type name
  static get type() {
    return 'taskeditor';
  }

  static get $name() {
    return 'TaskEditor';
  }

  static get defaultConfig() {
    return {
      cls: 'b-gantt-taskeditor b-schedulerpro-taskeditor'
    };
  }

} // Register this widget type with its Factory

TaskEditor.initClass();
TaskEditor._$name = 'TaskEditor';

/**
 * @module Gantt/feature/TaskEdit
 */

/**
 * Feature that allows editing tasks using a {@link Gantt/widget/TaskEditor}, a popup with fields for editing task data.
 *
 * This demo shows the task edit feature, double-click child task bar to start editing:
 *
 * {@inlineexample Gantt/feature/TaskEdit.js}
 *
 * ## Customizing tabs and their widgets
 *
 * To customize tabs you can:
 *
 * * Reconfigure built in tabs by providing override configs in the {@link #config-items} config.
 * * Remove existing tabs or add your own in the {@link #config-items} config.
 * * Advanced: Reconfigure the whole editor widget using {@link #config-editorConfig} or replace the whole editor
 *   using {@link #config-editorClass}.
 *
 * This example shows a custom Task Editor configuration. The built-in "Notes" tab is hidden, a custom "Files" tab is
 * added, the "General" tab is renamed to "Common" and "Custom" field is appended to it. Double-click on a task bar to
 * start editing:
 *
 * {@inlineexample Gantt/feature/TaskEditCustom.js}
 *
 * To add extra items to a tab you need to specify {@link Core/widget/Container#config-items} for the tab container.
 * This example shows custom widgets added to "General" tab:
 *
 * {@inlineexample Gantt/feature/TaskEditExtraItems.js}
 *
 * {@region Expand to see Default tabs and fields}
 *
 * The {@link Gantt/widget/TaskEditor Task editor} contains tabs by default. Each tab is a container with built in
 * widgets: text fields, grids, etc.
 *
 * | Tab ref           | Type                                                   | Text         | Weight | Description                                            |
 * |-------------------|--------------------------------------------------------|--------------|--------|--------------------------------------------------------|
 * | `generalTab`      | {@link SchedulerPro/widget/taskeditor/GeneralTab}      | General      | 100    | Name, start/end dates, duration, percent done, effort. |
 * | `predecessorsTab` | {@link SchedulerPro/widget/taskeditor/PredecessorsTab} | Predecessors | 200    | Grid with incoming dependencies                        |
 * | `successorsTab`   | {@link SchedulerPro/widget/taskeditor/SuccessorsTab}   | Successors   | 300    | Grid with outgoing dependencies                        |
 * | `resourcesTab`    | {@link SchedulerPro/widget/taskeditor/ResourcesTab}    | Resources    | 400    | Grid with assigned resources                           |
 * | `advancedTab`     | {@link SchedulerPro/widget/taskeditor/AdvancedTab}     | Advanced     | 500    | Assigned calendar, scheduling mode, constraints, etc.  |
 * | `notesTab`        | {@link SchedulerPro/widget/taskeditor/NotesTab}        | Notes        | 600    | Text area to add notes to the selected task            |
 *
 * ### General tab
 *
 * General tab contains widgets for basic configurations
 *
 * | Widget ref    | Type                                       | Text       | Weight | Description                                                |
 * |---------------|--------------------------------------------|------------|--------|------------------------------------------------------------|
 * | `name`        | {@link Core/widget/TextField}              | Name       | 100    | Task name                                                  |
 * | `percentDone` | {@link Core/widget/NumberField}            | % Complete | 200    | Shows what part of task is done already in percentage      |
 * | `effort`      | {@link SchedulerPro/widget/EffortField}    | Effort     | 300    | Amount of working time required to complete the whole task |
 * | `divider`     | {@link Core/widget/Widget}                 |            | 400    | Visual splitter between 2 groups of fields                 |
 * | `startDate`   | {@link SchedulerPro/widget/StartDateField} | Start      | 500    | Shows when the task begins                                 |
 * | `endDate`     | {@link SchedulerPro/widget/EndDateField}   | Finish     | 600    | Shows when the task ends                                   |
 * | `duration`    | {@link Core/widget/DurationField}          | Duration   | 700    | Shows how long the task is                                 |
 *
 * ### Predecessors tab
 *
 * Predecessors tab contains a grid with incoming dependencies and controls to remove/add dependencies
 *
 * | Widget ref | Type                        | Weight | Description                                                      |
 * |------------|-----------------------------|--------|------------------------------------------------------------------|
 * | `grid`     | {@link Grid/view/Grid}      | 100    | Predecessors task name, dependency type and lag                  |
 * | `toolbar`  | {@link Core/widget/Toolbar} | 200    | Control buttons                                                  |
 * | \>`add`    | {@link Core/widget/Button}  | 210    | Adds a new predecessor, select task using the name column editor |
 * | \>`remove` | {@link Core/widget/Button}  | 220    | Removes selected incoming dependency                             |
 *
 * \> - nested items
 *
 * ### Successors tab
 *
 * Successors tab contains a grid with outgoing dependencies and controls to remove/add dependencies
 *
 * | Widget ref | Type                        | Weight | Description                                                    |
 * |------------|-----------------------------|--------|----------------------------------------------------------------|
 * | `grid`     | {@link Grid/view/Grid}      | 100    | Successors task name, dependency type and lag                  |
 * | `toolbar`  | {@link Core/widget/Toolbar} | 200    | Control buttons                                                |
 * | \>`add`    | {@link Core/widget/Button}  | 210    | Adds a new successor, select task using the name column editor |
 * | \>`remove` | {@link Core/widget/Button}  | 220    | Removes selected outgoing dependency                           |
 *
 * \> - nested items
 *
 * ### Resources tab
 *
 * Resources tab contains a grid with assignments
 *
 * | Widget ref | Type                        | Weight | Description                                                                                                            |
 * |------------|-----------------------------|--------|------------------------------------------------------------------------------------------------------------------------|
 * | `grid`     | {@link Grid/view/Grid}      | 100    | Assignments resource name and units (100 means that the assigned resource spends 100% of its working time to the task) |
 * | `toolbar`  | {@link Core/widget/Toolbar} | 200    | Shows control buttons                                                                                                  |
 * | \>`add`    | {@link Core/widget/Button}  | 210    | Adds a dummy assignment, select resource using the name column editor                                                  |
 * | \>`remove` | {@link Core/widget/Button}  | 220    | Removes selected assignment                                                                                            |
 *
 * \> - nested items
 *
 * ### Advanced tab
 *
 * Advanced tab contains additional task scheduling options
 *
 * | Widget ref               | Type                                             | Weight | Description                                                                                                                  |
 * |--------------------------|--------------------------------------------------|--------|------------------------------------------------------------------------------------------------------------------------------|
 * | `calendarField`          | {@link Core/widget/Combo}                        | 100    | Shows a list of available calendars for this task                                                                            |
 * | `manuallyScheduledField` | {@link Core/widget/Checkbox}                     | 200    | If checked, the task is not considered in scheduling                                                                         |
 * | `schedulingModeField`    | {@link SchedulerPro/widget/SchedulingModePicker} | 300    | Shows a list of available scheduling modes for this task                                                                     |
 * | `effortDrivenField`      | {@link Core/widget/Checkbox}                     | 400    | If checked, the effort of the task is kept intact, and the duration is updated. Works when scheduling mode is "Fixed Units". |
 * | `divider`                | {@link Core/widget/Widget}                       | 500    | Visual splitter between 2 groups of fields                                                                                   |
 * | `constraintTypeField`    | {@link SchedulerPro/widget/ConstraintTypePicker} | 600    | Shows a list of available constraints for this task                                                                          |
 * | `constraintDateField`    | {@link Core/widget/DateField}                    | 700    | Shows a date for the selected constraint type                                                                                |
 * | `rollupField`            | {@link Core/widget/Checkbox}                     | 800    | If checked, shows a bar below the parent task. Works when the "Rollup" feature is enabled.                                   |
 *
 * ### Notes tab
 *
 * Notes tab contains a text area to show notes
 *
 * | Field ref   | Type                              | Weight | Description                                     |
 * |-------------|-----------------------------------|--------|-------------------------------------------------|
 * | `noteField` | {@link Core/widget/TextAreaField} | 100    | Shows a text area to add text notes to the task |
 *
 * {@endregion}
 *
 * ## Removing a built in item
 *
 * To remove a built in tab or widget, specify its `ref` as `false` in the {@link #config-items} config:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         taskEdit : {
 *             items : {
 *                 generalTab      : {
 *                     items : {
 *                         // Remove "% Complete","Effort", and the divider in the "General" tab
 *                         percentDone : false,
 *                         effort      : false,
 *                         divider     : false
 *                     }
 *                 },
 *                 // Remove all tabs except the "General" tab
 *                 notesTab        : false,
 *                 predecessorsTab : false,
 *                 successorsTab   : false,
 *                 resourcesTab    : false,
 *                 advancedTab     : false
 *             }
 *         }
 *     }
 * })
 * ```
 *
 * The built in buttons are:
 *
 * | Widget ref     | Type                       | Weight | Description                             |
 * |----------------|----------------------------|--------|-----------------------------------------|
 * | `saveButton`   | {@link Core/widget/Button} | 100    | Save event button on the bbar           |
 * | `deleteButton` | {@link Core/widget/Button} | 200    | Delete event button on the bbar         |
 * | `cancelButton` | {@link Core/widget/Button} | 300    | Cancel event editing button on the bbar |
 *
 * Bottom buttons may be hidden using `bbar` config passed to `editorConfig`:
 *
* ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         taskEdit : {
 *             editorConfig : {
 *                 bbar : {
 *                     items : {
 *                         deleteButton : false
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * })
 * ```
 *
 * ## Customizing a built in item
 *
 * To customize a built in tab or field, use its `ref` as the key in the {@link #config-items} config and specify the configs you want
 * to change (they will be merged with the tabs or fields default configs correspondingly):
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         taskEdit : {
 *             items : {
 *                 generalTab      : {
 *                     // Rename "General" tab
 *                     title : 'Main',
 *                     items : {
 *                         // Rename "% Complete" field
 *                         percentDone : {
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
 * To add a custom tab or field, add an entry to the {@link #config-items} config. When you add a field,
 * the `name` property links the input field to a field in the loaded task record:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         taskEdit : {
 *             items : {
 *                 generalTab : {
 *                     items : {
 *                         // Add new field to the last position
 *                         newGeneralField : {
 *                             type   : 'textfield',
 *                             weight : 710,
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
 *                             weight : 710,
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
 * const gantt = new Gantt({
 *     features : {
 *         taskEdit : false
 *     }
 * })
 * ```
 *
 * For more info on customizing the Task Editor, please see Guides/Customization/Customize task editor
 *
 * @extends SchedulerPro/feature/TaskEdit
 * @demo Gantt/taskeditor
 * @classtype taskEdit
 * @feature
 *
 * @typings SchedulerPro/feature/TaskEdit -> SchedulerPro/feature/SchedulerProTaskEdit
 */

class TaskEdit extends TaskEdit$1 {
  static get $name() {
    return 'TaskEdit';
  }

  static get defaultConfig() {
    return {
      /**
       * The event that shall trigger showing the editor. Set to `` or null to disable editing of existing events.
       * @config {String|null}
       * @default
       * @category Editor
       */
      triggerEvent: 'taskdblclick',
      saveAndCloseOnEnter: true,

      /**
       * Class to use as the editor. By default it uses {@link Gantt.widget.TaskEditor}
       * @config {Core.widget.Widget}
       * @typings {typeof Widget}
       * @category Editor
       */
      editorClass: TaskEditor
    };
  }

  static get pluginConfig() {
    return {
      chain: ['populateTaskMenu', 'onTaskEnterKey'],
      assign: ['editTask']
    };
  }
  /**
   * Shows a {@link Gantt/widget/TaskEditor} to edit the passed task. This function is exposed on
   * the Gantt instance and can be called as `gantt.editTask()`.
   * @param {Gantt.model.TaskModel} taskRecord Task to edit
   * @param {HTMLElement} [element] The task element
   * @return {Promise} Promise which resolves after the editor is shown
   * @on-owner
   * @async
   */

  editTask(taskRecord, element) {
    return this.editEvent(taskRecord, null, element);
  }

  onActivateEditor({
    taskRecord,
    taskElement
  }) {
    this.editTask(taskRecord, taskElement);
  }

  getElementFromTaskRecord(taskRecord) {
    return this.client.getElementFromTaskRecord(taskRecord);
  }

  onTaskEnterKey({
    taskRecord
  }) {
    this.editTask(taskRecord);
  } //region Context menu

  populateTaskMenu({
    taskRecord,
    selection,
    items
  }) {
    if (!this.client.readOnly && selection.length <= 1) {
      items.editTask = {
        text: 'L{Gantt.Edit}',
        localeClass: this.client,
        cls: 'b-separator',
        icon: 'b-icon b-icon-edit',
        weight: 100,
        disabled: this.disabled || taskRecord.readOnly,
        onItem: () => this.editTask(taskRecord)
      };
    }
  } //endregion

  onEventEnterKey({
    taskRecord,
    target
  }) {
    this.editTask(taskRecord);
  }

  scrollTaskIntoView(taskRecord) {
    return this.scrollEventIntoView(taskRecord);
  }

  scrollEventIntoView(eventRecord) {
    return this.client.scrollTaskIntoView(eventRecord);
  }

}
TaskEdit._$name = 'TaskEdit';
GridFeatureManager.registerFeature(TaskEdit, true, 'Gantt');

/**
 * @module Gantt/feature/TaskMenu
 */

/**
 * Displays a context menu for tasks. Items are populated by other features and/or application code.
 * Configure it with `false` to disable it completely. If enabled, {@link Grid.feature.CellMenu} feature
 * is not available. Cell context menu items are handled by this feature.
 *
 * ## Default task menu items
 *
 * Here is the list of menu items provided by the Task menu feature and populated by the other features:
 *
 * | Reference             | Text                 | Weight | Feature                            | Description                                                                      |
 * |-----------------------|----------------------|--------|------------------------------------|----------------------------------------------------------------------------------|
 * | `editTask`            | Edit task            | 100    | {@link Gantt.feature.TaskEdit}      | Edit the task                                                                    |
 * | `cut`                 | Cut task             | 110    | {@link Gantt.feature.TaskCopyPaste} | Cut the task                                                                     |
 * | `copy`                | Copy task            | 120    | {@link Gantt.feature.TaskCopyPaste} | Copy the task                                                                    |
 * | `paste`               | Paste task           | 130    | {@link Gantt.feature.TaskCopyPaste} | Paste the task                                                                   |
 * | `search`*             | Search for value     | 200    | {@link Grid.feature.Search}         | Search for cell text                                                             |
 * | `filterDateEquals`*   | On                   | 300    | {@link Grid.feature.Filter}         | Filter by columns field, equal to cell value                                     |
 * | `filterDateBefore`*   | Before               | 310    | {@link Grid.feature.Filter}         | Filter by columns field, less than cell value                                    |
 * | `filterDateAfter`*    | After                | 320    | {@link Grid.feature.Filter}         | Filter by columns field, more than cell value                                    |
 * | `filterNumberEquals`* | Equals               | 300    | {@link Grid.feature.Filter}         | Filter by columns field, equal to cell value                                     |
 * | `filterNumberLess`*   | Less than            | 310    | {@link Grid.feature.Filter}         | Filter by columns field, less than cell value                                    |
 * | `filterNumberMore`*   | More than            | 320    | {@link Grid.feature.Filter}         | Filter by columns field, more than cell value                                    |
 * | `filterStringEquals`* | Equals               | 300    | {@link Grid.feature.Filter}         | Filter by columns field, equal to cell value                                     |
 * | `filterRemove`*       | Remove filter        | 400    | {@link Grid.feature.Filter}         | Stop filtering by selected column field                                          |
 * | `add`                 | Add...               | 500    | *This feature*                      | Submenu for adding tasks                                                         |
 * | \>`addTaskAbove`      | Task above           | 510    | *This feature*                      | Add a new task above the selected task                                           |
 * | \>`addTaskBelow`      | Task below           | 520    | *This feature*                      | Add a new task below the selected task                                           |
 * | \>`milestone`         | Milestone            | 530    | *This feature*                      | Add a new milestone below the selected task                                      |
 * | \>`subtask`           | Subtask              | 540    | *This feature*                      | Add a new task as a child of the current, turning it into a parent               |
 * | \>`successor`         | Successor            | 550    | *This feature*                      | Add a new task below current task, linked using an "Finish-to-Start" dependency  |
 * | \>`predecessor`       | Predecessor          | 560    | *This feature*                      | Add a new task above current task, linked using an "Finish-to-Start" dependency  |
 * | `convertToMilestone`  | Convert to milestone | 600    | *This feature*                      | Turns the selected task into a milestone. Shown for leaf tasks only              |
 * | `indent`              | Indent               | 700    | *This feature*                      | Add the task as a child of its previous sibling, turning that task into a parent |
 * | `outdent`             | Outdent              | 800    | *This feature*                      | Turn the task into a sibling of its parent                                       |
 * | `deleteTask`          | Delete task          | 900    | *This feature*                      | Remove the selected task                                                         |
 *
 * \* - items that are shown for the locked grid cells only
 *
 * \> - first level of submenu
 *
 * ## Customizing the menu items
 *
 * The menu items in the Task menu can be customized, existing items can be changed or removed,
 * and new items can be added. This is handled using the `items` config of the feature.
 *
 * To add extra items for all events:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         taskMenu : {
 *             // Extra items for all events
 *             items : {
 *                 flagTask : {
 *                     text : 'Extra',
 *                     icon : 'b-fa b-fa-fw b-fa-flag',
 *                     onItem({taskRecord}) {
 *                         taskRecord.flagged = true;
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * ## Remove menu/submenu items
 *
 * Items can be removed from the menu:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         taskMenu : {
 *             items : {
 *                 // Hide delete task option
 *                 deleteTask: false,
 *
 *                 // Hide item from the `add` submenu
 *                 add: {
 *                     menu: {
*                          subtask: false
 *                     }
 *                 }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * ## Manipulate items for specific tasks
 *
 * Items can behave different depending on the type of the task:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         taskMenu : {
 *             // Process items before menu is shown
 *             processItems({ items, taskRecord }) {
 *                  // Push an extra item for conferences
 *                  if (taskRecord.type === 'conference') {
 *                      items.showSessions = {
 *                          text : 'Show sessions',
 *                          ontItem({taskRecord}) {
 *                              // ...
 *                          }
 *                      };
 *                  }
 *
 *                  // Do not show menu for secret events
 *                  if (taskRecord.type === 'secret') {
 *                      return false;
 *                  }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * Full information of the menu customization can be found in the "Customizing the Task menu" guide.
 *
 * This feature is **enabled** by default
 *
 * @extends Scheduler/feature/EventMenu
 * @demo Gantt/taskmenu
 * @classtype taskMenu
 * @feature
 *
 * @inlineexample Gantt/feature/TaskMenu.js
 */

class TaskMenu extends EventMenu {
  //region Config
  static get $name() {
    return 'TaskMenu';
  }

  static get defaultConfig() {
    return {
      type: 'task',

      /**
       * A function called before displaying the menu that allows manipulations of its items.
       * Returning `false` from this function prevents the menu being shown.
       *
       * ```javascript
       * features         : {
       *    taskMenu : {
       *         processItems({ items, taskRecord }) {
       *             // Add or hide existing items here as needed
       *             items.myAction = {
       *                 text   : 'Cool action',
       *                 icon   : 'b-fa b-fa-fw b-fa-ban',
       *                 onItem : () => console.log(`Clicked ${eventRecord.name}`),
       *                 weight : 1000 // Move to end
       *             };
       *
       *            if (!eventRecord.allowDelete) {
       *                 items.deleteEvent.hidden = true;
       *             }
       *         }
       *     }
       * },
       * ```
       * @param {Object} context An object with information about the menu being shown
       * @param {Gantt.model.TaskModel} context.taskRecord The record representing the current task
       * @param {Grid.column.Column} context.column The current column
       * @param {Object} context.items An object containing the {@link Core.widget.MenuItem menu item} configs keyed by their id
       * @param {Event} context.event The DOM event object that triggered the show
       * @config {Function}
       * @preventable
       */
      processItems: null
      /**
       * This is a preconfigured set of items used to create the default context menu.
       *
       * ```javascript
       * const gantt = new Gantt({
       *     features : {
       *         taskMenu : {
       *             items : {
       *                 add                 : false,
       *                 convertToMilestone  : false
       *             }
       *         }
       *     }
       * });
       * ```
       * The `items` provided by this feature are listed below. These are the property names which you may
       * configure:
       *
       * - `add` A submenu option containing a `menu` config which contains the following named items:
       *     * `addTaskAbove` Inserts a sibling task above the context task.
       *     * `addTaskBelow` Inserts a sibling task below the context task.
       *     * `milestone` Inserts a sibling milestone below the context task.
       *     * `subtask` Appends a child task to the context task.
       *     * `successor` Adds a sibling task linked by a dependence below the context task.
       *     * `predecessor` Adds a sibling task linked by a dependence above the context task.
       *  - `deleteTask` Deletes the context task.
       *  - `indent` Indents the context task by adding it as a child of its previous sibling.
       *  - `outdent` Outdents the context task by adding it as the final sibling of its parent.
       *  - `convertToMilestone` Converts the context task to a zero duration milestone.
       *
       * See the feature config in the above example for details.
       *
       * @config {Object}
       */

    };
  }

  static get pluginConfig() {
    const config = super.pluginConfig;
    config.chain.push('populateTaskMenu');
    return config;
  } //endregion

  construct(gantt, config = {}) {
    super.construct(...arguments);
    this.gantt = gantt;

    if (gantt.features.cellMenu) {
      console.warn('`CellMenu` feature is ignored, when `TaskMenu` feature is enabled. If you need cell specific menu items, please configure `TaskMenu` feature items instead.');
      gantt.features.cellMenu.disabled = true;
    }
  } //region Events

  /**
   * This event fires on the owning Gantt before the context menu is shown for a task. Allows manipulation of the items
   * to show in the same way as in `processItems`. Returning false from a listener prevents the menu from
   * being shown.
   * @event taskMenuBeforeShow
   * @on-owner
   * @preventable
   * @param {Gantt.view.Gantt} source
   * @param {Object[]} items Menu item configs
   * @param {Gantt.model.TaskModel} taskRecord Event record for which the menu was triggered
   * @param {HTMLElement} taskElement
   */

  /**
   * This event fires on the owning Gantt when an item is selected in the context menu.
   * @event taskMenuItem
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {Core.widget.MenuItem} item
   * @param {Gantt.model.TaskModel} taskRecord
   * @param {HTMLElement} taskElement
   */

  /**
   * This event fires on the owning Gantt after showing the context menu for an event
   * @event taskMenuShow
   * @on-owner
   * @param {Gantt.view.Gantt} source
   * @param {Core.widget.Menu} menu The menu
   * @param {Gantt.model.TaskModel} taskRecord Event record for which the menu was triggered
   * @param {HTMLElement} taskElement
   */
  //endregion

  getDataFromEvent(event) {
    const {
      client
    } = this,
          targetElement = this.getTargetElementFromEvent(event),
          // to resolve record from a task element or from a grid cell
    taskRecord = client.resolveTaskRecord(targetElement) || client.getRecordFromElement(targetElement),
          taskElement = taskRecord && client.getElementFromTaskRecord(taskRecord, false); // get wrapper;

    return Objects.assign({
      event,
      targetElement,
      taskElement,
      taskRecord
    }, client.getCellDataFromEvent(event));
  }

  callChainablePopulateMenuMethod(eventParams) {
    // When context menu is called for a task cell, need to collect items from features
    // which usually add items to CellMenu in Grid and Scheduler,
    // since CellMenu feature is disabled when TaskMenu feature is enabled.
    if (eventParams.cellData && this.client.populateCellMenu) {
      this.client.populateCellMenu(eventParams);
    }

    super.callChainablePopulateMenuMethod(...arguments);
  }

  shouldShowMenu(eventParams) {
    const {
      column
    } = eventParams;
    return eventParams.taskRecord && (!column || column.enableCellContextMenu !== false);
  }

  getElementFromRecord(record) {
    return this.client.getElementFromTaskRecord(record);
  }

  populateTaskMenu({
    items,
    column,
    selection,
    taskRecord
  }) {
    const {
      client
    } = this,
          {
      isTreeGrouped
    } = client,
          // Context menu on the selection offers multi actions on the selection.
    // Context menu on a non-selected record offers single actions on the context record.
    multiSelected = selection.includes(taskRecord) && selection.length > 1;
    items.add = {
      disabled: client.readOnly || isTreeGrouped,
      hidden: multiSelected
    };
    items.convertToMilestone = {
      disabled: client.readOnly || taskRecord.readOnly,
      hidden: taskRecord.isParent || taskRecord.milestone
    };
    items.indent = {
      disabled: client.readOnly || !taskRecord.previousSibling || taskRecord.readOnly || isTreeGrouped
    };
    items.outdent = {
      disabled: client.readOnly || taskRecord.parent === client.taskStore.rootNode || taskRecord.readOnly || isTreeGrouped
    };
    items.deleteTask = {
      disabled: client.readOnly || taskRecord.readOnly
    }; // TaskMenu feature is responsible for cell items

    if (column !== null && column !== void 0 && column.cellMenuItems) {
      Objects.merge(items, column.cellMenuItems);
    }
  } // This generates the fixed, unchanging part of the items and is only called once
  // to generate the baseItems of the feature.
  // The dynamic parts which are set by populateEventMenu have this merged into them.

  changeItems(items) {
    const {
      client
    } = this;
    return Objects.merge({
      add: {
        text: 'L{Gantt.Add}',
        cls: 'b-separator',
        icon: 'b-icon-add',
        weight: 500,
        menu: {
          addTaskAbove: {
            text: 'L{Gantt.Task above}',
            weight: 510,
            icon: 'b-icon-up',

            onItem({
              taskRecord
            }) {
              client.addTaskAbove(taskRecord);
            }

          },
          addTaskBelow: {
            text: 'L{Gantt.Task below}',
            weight: 520,
            icon: 'b-icon-down',

            onItem({
              taskRecord
            }) {
              client.addTaskBelow(taskRecord);
            }

          },
          milestone: {
            text: 'L{Gantt.Milestone}',
            weight: 530,
            icon: 'b-icon-milestone',

            onItem({
              taskRecord
            }) {
              client.addMilestoneBelow(taskRecord);
            }

          },
          subtask: {
            text: 'L{Gantt.Sub-task}',
            weight: 540,
            icon: 'b-icon-subtask',

            onItem({
              taskRecord
            }) {
              client.addSubtask(taskRecord);
            }

          },
          successor: {
            text: 'L{Gantt.Successor}',
            weight: 550,
            icon: 'b-icon-successor',

            onItem({
              taskRecord
            }) {
              client.addSuccessor(taskRecord);
            }

          },
          predecessor: {
            text: 'L{Gantt.Predecessor}',
            weight: 560,
            icon: 'b-icon-predecessor',

            onItem({
              taskRecord
            }) {
              client.addPredecessor(taskRecord);
            }

          }
        }
      },
      convertToMilestone: {
        icon: 'b-icon-milestone',
        text: 'L{Gantt.Convert to milestone}',
        weight: 600,

        onItem({
          taskRecord
        }) {
          taskRecord.convertToMilestone();
        }

      },
      indent: {
        text: 'L{Gantt.Indent}',
        icon: 'b-icon-indent',
        weight: 700,

        onItem({
          selection,
          taskRecord
        }) {
          // Context menu on the selection offers multi actions on the selection.
          // Context menu on a non-selected record offers single actions on the context record.
          client.indent(selection.includes(taskRecord) ? selection : taskRecord);
        }

      },
      outdent: {
        text: 'L{Gantt.Outdent}',
        icon: 'b-icon-outdent',
        weight: 800,

        onItem({
          selection,
          taskRecord
        }) {
          // Context menu on the selection offers multi actions on the selection.
          client.outdent(selection.includes(taskRecord) ? selection : taskRecord);
        }

      },
      deleteTask: {
        text: 'L{Gantt.Delete task}',
        icon: 'b-icon-trash',
        cls: 'b-separator',
        weight: 900,

        onItem({
          selection,
          taskRecord
        }) {
          // Context menu on the selection offers multi actions on the selection.
          // Context menu on a non-selected record offers single actions on the context record.
          client.taskStore.remove(selection.includes(taskRecord) ? selection : taskRecord);
        }

      }
    }, items);
  }

}
TaskMenu.featureClass = '';
TaskMenu._$name = 'TaskMenu';
GridFeatureManager.registerFeature(TaskMenu, true, 'Gantt');

/**
 * @module Gantt/feature/TaskResize
 */

/**
 * Feature that allows resizing a task by dragging its end date. Resizing a task by dragging its start date is not allowed.
 *
 * This feature is **enabled** by default
 *
 * This feature updates the event's `endDate` live in order to leverage the
 * rendering pathway to always yield a correct appearance. The changes are done in
 * {@link Core.data.Model#function-beginBatch batched} mode so that changes do not become
 * eligible for data synchronization or propagation until the operation is completed.
 *
 * ## Customizing the resize tooltip
 *
 * To show custom HTML in the tooltip, please see the {@link #config-tooltipTemplate} config. Example:
 *
 * ```javascript
 * taskResize : {
 *     // A minimal end date tooltip
 *     tooltipTemplate : ({ record, endDate }) => {
 *         return DateHelper.format(endDate, 'MMM D');
 *     }
 * }
 * ```
 *
 * @extends Scheduler/feature/EventResize
 * @demo Gantt/basic
 * @classtype taskResize
 * @feature
 */

class TaskResize extends EventResize {
  static get $name() {
    return 'TaskResize';
  }

  static get configurable() {
    return {
      draggingItemCls: 'b-sch-event-resizing',
      resizingItemInnerCls: null,
      // internalUpdateRecord is based on the assumption only right edge can be resized
      leftHandle: false,

      /**
       * Gets or sets special key to activate successor pinning behavior. Supported values are:
       * * 'ctrl'
       * * 'shift'
       * * 'alt'
       * * 'meta'
       *
       * Assign false to disable it.
       * @member {Boolean|String} pinSuccessors
       */

      /**
       * Set to true to enable resizing task while pinning dependent tasks. By default, this behavior is activated
       * if you hold CTRL key during drag. Alternatively, you may provide key name to use. Supported values are:
       * * 'ctrl'
       * * 'shift'
       * * 'alt'
       * * 'meta'
       *
       * **Note**: Only supported in forward-scheduled project
       *
       * @config {Boolean|String}
       * @default
       */
      pinSuccessors: false
    };
  }

  changePinSuccessors(value) {
    return EventHelper.toSpecialKey(value);
  } //region Events

  /**
   * @event beforeEventResize
   * @hide
   */

  /**
   * @event eventResizeStart
   * @hide
   */

  /**
   * @event eventPartialResize
   * @hide
   */

  /**
   * @event beforeEventResizeFinalize
   * @hide
   */

  /**
   * @event eventResizeEnd
   * @hide
   */

  /**
   * Fires on the owning Gantt before resizing starts. Return false to prevent operation
   * @event beforeTaskResize
   * @on-owner
   * @param {Gantt.model.TaskModel} taskRecord
   * @param {Event} event
   */

  /**
   * Fires on the owning Gantt when task resizing starts
   * @event taskResizeStart
   * @on-owner
   * @param {Gantt.model.TaskModel} taskRecord
   * @param {Event} event
   */

  /**
   * Fires on the owning Gantt on each resize move event
   * @event taskPartialResize
   * @on-owner
   * @param {Gantt.model.TaskModel} taskRecord
   * @param {Date} start
   * @param {Date} end
   * @param {HTMLElement} element
   */

  /**
   * Fires on the owning Gantt to allow implementer to prevent immediate finalization by setting `data.context.async = true`
   * in the listener, to show a confirmation popup etc
   * ```
   *  gantt.on('beforetaskresizefinalize', ({context}) => {
   *      context.async = true;
   *      setTimeout(() => {
   *          // async code don't forget to call finalize
   *          context.finalize();
   *      }, 1000);
   *  })
   * ```
   * @event beforeTaskResizeFinalize
   * @on-owner
   * @param {Object} data
   * @param {Gantt.view.Gantt} data.source Gantt instance
   * @param {Object} data.context
   * @param {Boolean} data.context.async Set true to handle resize asynchronously (e.g. to wait for user
   * confirmation)
   * @param {Function} data.context.finalize Call this method to finalize resize. This method accepts one
   * argument: pass true to update records, or false, to ignore changes
   */

  /**
   * Fires on the owning Gantt after the resizing gesture has finished.
   * @event taskResizeEnd
   * @on-owner
   * @param {Boolean} changed
   * @param {Gantt.model.TaskModel} taskRecord
   */
  //endregion
  //region Gantt specifics

  checkValidity() {
    // Task resize just does basic validity checks which runs the validatorFn
    return this.basicValidityCheck(...arguments);
  }

  getBeforeResizeParams(context) {
    return {};
  } // Injects Gantt specific data into the drag context

  setupProductResizeContext(context, event) {
    var _gantt$getDateConstra;

    const gantt = this.client,
          taskRecord = gantt.resolveTaskRecord(context.element);
    Object.assign(context, {
      taskRecord,
      eventRecord: taskRecord,
      dateConstraints: (_gantt$getDateConstra = gantt.getDateConstraints) === null || _gantt$getDateConstra === void 0 ? void 0 : _gantt$getDateConstra.call(gantt, taskRecord)
    });
  }

  async internalUpdateRecord(context, timespanRecord) {
    const {
      client
    } = this,
          {
      generation
    } = timespanRecord,
          {
      startDate,
      endDate
    } = context,
          toSet = {
      endDate
    }; // Fix the duration according to the Entity's rules.

    context.duration = toSet.duration = timespanRecord.run('calculateProjectedDuration', startDate, endDate); // Fix the dragged date point according to the Entity's rules.

    const value = toSet[context.toSet] = timespanRecord.run('calculateProjectedXDateWithDuration', startDate, true, context.duration); // Update the record to its final correct state using *batched changes*
    // These will *not* be propagated, it's just to force the dragged event bar
    // into its corrected shape before the real changes which will propagate are applied below.
    // We MUST do it like this because the final state may not be a net change if the changes
    // got rejected, and in that case, the engine will not end up firing any change events.

    timespanRecord.set(toSet); // Quit listening for batchedUpdate *before* we cancel the batch so that the
    // change events from the revert do not update the UI.

    client.endListeningForBatchedUpdates();
    timespanRecord.cancelBatch();

    if (this.pinSuccessors && context.event[this.pinSuccessors]) {
      await timespanRecord.setEndDatePinningSuccessors(value);
    } else {
      await timespanRecord.setEndDate(value, false);
    }

    timespanRecord.endBatch(); // If the record has been changed

    return timespanRecord.generation !== generation;
  } //endregion

}
TaskResize._$name = 'TaskResize';
GridFeatureManager.registerFeature(TaskResize, true, 'Gantt');

/**
 * @module Gantt/feature/TaskTooltip
 */

/**
 * This feature displays a task tooltip on mouse hover. The template of the tooltip is customizable
 * with the {@link #config-template} function.
 *
 *```javascript
 * new Gantt({
 *   features : {
 *     taskTooltip : {
 *         // Tooltip configs can be used here
 *         align : 'l-r' // Align left to right
 *     }
 *   }
 * });
 * ```
 *
 * ## Showing remotely loaded data
 * Loading remote data into the task tooltip is easy. Simply use the {@link #config-template} and return a Promise which yields the content to show.
 * ```javascript
 * new Gantt({
 *   features : {
 *     taskTooltip : {
 *        template : ({ taskRecord }) => AjaxHelper.get(`./fakeServer?name=${taskRecord.name}`).then(response => response.text())
 *     }
 *   }
 * });
 * ```
 *
 * This feature is **enabled** by default.
 *
 * @extends Scheduler/feature/base/TooltipBase
 * @demo Gantt/tooltips
 * @classtype taskTooltip
 * @feature
 */

class TaskTooltip extends TooltipBase {
  static get $name() {
    return 'TaskTooltip';
  }

  static get defaultConfig() {
    return {
      /**
       * Template (a function accepting task data and returning a string) used to display info in the tooltip.
       * The template will be called with an object as with fields as detailed below
       * @param {Object} data
       * @param {Gantt.model.TaskModel} data.taskRecord
       * @param {String} data.startClockHtml
       * @param {String} data.endClockHtml
       * @config {function} template
       */
      template(data) {
        const me = this,
              {
          taskRecord
        } = data,
              displayDuration = me.client.formatDuration(taskRecord.duration, me.decimalPrecision);
        return `
                    ${taskRecord.name ? `<div class="b-gantt-task-title">${StringHelper.encodeHtml(taskRecord.name)}</div>` : ''}
                    <table border="0" cellspacing="0" cellpadding="0">
                    <tr><td>${me.L('L{Start}')}:</td><td>${data.startClockHtml}</td></tr>
                    ${taskRecord.milestone ? '' : `
                        <tr><td>${me.L('L{End}')}:</td><td>${data.endClockHtml}</td></tr>
                        <tr><td>${me.L('L{Duration}')}:</td><td class="b-right">${displayDuration + ' ' + DateHelper.getLocalizedNameOfUnit(taskRecord.durationUnit, taskRecord.duration !== 1)}</td></tr>
                        <tr><td>${me.L('L{Complete}')}:</td><td class="b-right">${taskRecord.renderedPercentDone}%</td></tr>
                    `}
                    </table>
                `;
      },

      /**
       * Precision of displayed duration, defaults to use {@link Gantt.view.Gantt#config-durationDisplayPrecision}.
       * Specify an integer value to override that setting, or `false` to use raw value
       * @member {Number|Boolean} decimalPrecision
       */

      /**
       * Precision of displayed duration, defaults to use {@link Gantt.view.Gantt#config-durationDisplayPrecision}.
       * Specify an integer value to override that setting, or `false` to use raw value
       * @config {Number|Boolean}
       */
      decimalPrecision: null,
      cls: 'b-gantt-task-tooltip',
      monitorRecordUpdate: true
    };
  }

}
TaskTooltip._$name = 'TaskTooltip';
GridFeatureManager.registerFeature(TaskTooltip, true, 'Gantt');

/**
 * @module Gantt/feature/TreeGroup
 */

/**
 * Extends Grid's {@link Grid.feature.TreeGroup} feature to enable using it with Gantt. Allows generating a new task
 * tree where parents are determined by the values of specified task fields/functions:
 *
 * {@inlineexample Gantt/feature/TreeGroup.js}
 *
 * ## Important information
 *
 * Using the TreeGroup feature comes with some caveats:
 *
 * * Grouping completely replaces the dataset of the task store with a new generated tree structure. All uncommited new
 *   or removed tasks will be lost
 * * Generated parents are read-only, they cannot be edited using the default UI
 * * Leaves in the new tree are still editable as usual, and any changes to them survives the grouping operation
 * * All tasks non-generated tasks are flagged as `manuallyScheduled` on grouping, to make sure they are not rescheduled
 *   under their new generated parents. When grouping is cleared this flag is reset.
 *
 * This feature is <strong>disabled</strong> by default.
 *
 * @extends Grid/feature/TreeGroup
 *
 * @classtype treeGroup
 * @feature
 * @typings Grid/feature/TreeGroup -> Grid/feature/GridTreeGroup
 */

class TreeGroup extends TreeGroup$1 {
  // Override in subclasses to wait for initial data readiness before transforming, for example to wait for engine
  // calculations in Gantt
  async waitForReadiness() {
    await super.waitForReadiness();
    const {
      project
    } = this.client;

    if (project.isLoadingOrSyncing) {
      await project.await('requestDone');
    }

    await project.commitAsync();
  }

  processParentData(parentData) {
    var _parentData$children$;

    super.processParentData(parentData);
    this.$groupParentIds.push(parentData.id); // Make all tasks manually scheduled, to stay put when the tree is transformed

    if ((_parentData$children$ = parentData.children[0]) !== null && _parentData$children$ !== void 0 && _parentData$children$.isModel) {
      for (const task of parentData.children) {
        // Store current setting to be able to restore it on clear
        task.$manuallyScheduled = task.manuallyScheduled;
        task.manuallyScheduled = true;
      }
    }
  }

  restoreChildRecord(task) {
    super.restoreChildRecord(task); // Restore original manually scheduled state

    if (task.$manuallyScheduled != null) {
      task.manuallyScheduled = task.$manuallyScheduled;
      task.$manuallyScheduled = null;
    }
  }

  async applyLevels(levels, applyToStore, refresh = true) {
    const me = this,
          {
      client
    } = me;
    me.isApplying++;
    client.suspendRefresh();

    if (levels) {
      var _me$$groupParentIds;

      // For Gantt we always have to go back to the original dataset before applying new levels, otherwise we
      // loose dependencies etc
      if ((_me$$groupParentIds = me.$groupParentIds) !== null && _me$$groupParentIds !== void 0 && _me$$groupParentIds.length) {
        await me.clearGroups(false);
        await client.project.commitAsync();
      }

      me.$groupParentIds = [];
    }

    const // Let Grid's feature create the tree structure, without loading it into store.
    // We need to do it in a engine friendly way here
    transformedData = await super.applyLevels(levels, false),
          {
      store
    } = client;

    if (me.isDestroyed) {
      return;
    }

    if (levels) {
      transformedData.root = true; // First preprocess tasks and generated parents, adapting to engine requirements

      WalkHelper.preWalk(transformedData, task => task.children, task => {
        // Modify the deepest level of generated parents, the ones that contain all tasks (isModel), to not have
        // any children when they are added to the TaskStore. If they do, engine goes mad
        if (!task.isModel && task.children[0].isModel) {
          task.$children = task.children;
          task.children = null;
        }
      }); // Then add the first level of generated parents to the TaskStore, it will in the process add all sub levels
      // but not the already existing tasks since we excluded those above

      for (const parent of transformedData.children) {
        // Add the parent (+ descendant parents)
        const [newParent] = store.add(parent, true); // Then add all existing tasks to it, keeping engine happy (making it a move rather then an add)

        newParent.traverse(generatedParent => {
          if (generatedParent.data.$children) {
            generatedParent.appendChild(generatedParent.data.$children);
            generatedParent.data.$children = null;
          }
        });
      } // Hide the original parents, if we remove them we loose engine state

      store.filter({
        id: 'tree-group',
        // no-sanity
        // Prevent users from removing it by accident
        internal: true,
        filterBy: r => !r.$originalChildren
      });
    } else {
      // Remove generated parents
      store.remove(me.$groupParentIds, true);
      me.$groupParentIds = null; // Remove filter to restore original parents

      store.removeFilter('tree-group');
    }

    await client.project.commitAsync();

    if (me.isDestroyed) {
      return;
    } // Grouping is to be considered a dataset (sort of), clear changes on the store level (keeping record level
    // changes intact)

    store.added.clear();
    store.removed.clear();
    store.modified.clear();
    client.resumeRefresh(false); // Explicit refresh without transition (resuming with true would transition)

    refresh && client.refresh();
    me.isApplying--;
  }

  async clearGroups(refresh) {
    await this.applyLevels(null, false, refresh);
  }

}

_defineProperty(TreeGroup, "$name", 'TreeGroup');

TreeGroup._$name = 'TreeGroup';
GridFeatureManager.registerFeature(TreeGroup, false, 'Gantt');

/**
 * This mixin overrides event elements handling in similar scheduler mixin. Uses correct element class names and
 * resolves elements in gantt-way.
 * @private
 */

var GanttExporterMixin = (base => class GanttExporterMixin extends base {
  async prepareComponent(config) {
    await super.prepareComponent(config);
    const me = this,
          // Clear cloned gantt element from task elements
    fgCanvasEl = me.element.querySelector('.b-sch-foreground-canvas');
    DomHelper.removeEachSelector(fgCanvasEl, '.b-gantt-task-wrap');
    DomHelper.removeEachSelector(fgCanvasEl, '.b-released');
  }

  collectEvents(rows, config) {
    const me = this,
          addedRows = rows.length,
          {
      client
    } = config,
          normalRows = me.exportMeta.subGrids.normal.rows;
    rows.forEach((row, index) => {
      const rowConfig = normalRows[normalRows.length - addedRows + index],
            event = client.store.getAt(row.dataIndex),
            eventsMap = rowConfig[3];

      if (event.isScheduled) {
        const el = client.getElementFromTaskRecord(event, false);

        if (el && !eventsMap.has(event.id)) {
          eventsMap.set(event.id, [el.outerHTML, Rectangle.from(el.firstChild, el.offsetParent)]);
        }
      }
    });
  }

});

/**
 * @module Gantt/feature/export/exporter/MultiPageExporter
 */

/**
 * A multiple page exporter. Used by the {@link Gantt.feature.export.PdfExport} feature to export to multiple pages. You
 * do not need to use this class directly.
 *
 * ### Extending exporter
 *
 * ```javascript
 * class MyMultiPageExporter extends MultiPageExporter {
 *     // type is required for exporter
 *     static get type() {
 *         return 'mymultipageexporter';
 *     }
 *
 *     get stylesheets() {
 *         const stylesheets = super.stylesheets;
 *
 *         stylesheets.forEach(styleNodeOrLinkTag => doSmth(styleNodeOrLinkTag))
 *
 *         return stylesheets;
 *     }
 * }
 *
 * const gantt = new Gantt({
 *     features : {
 *         pdfExport : {
 *             // this export feature is configured with only one exporter
 *             exporters : [MyMultiPageExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * gantt.features.pdfExport.export({ exporter : 'mymultipageexporter' });
 * ```
 *
 * @classType multipage
 * @feature
 * @extends Scheduler/feature/export/exporter/MultiPageExporter
 * @typings Scheduler/feature/export/exporter/MultiPageExporter -> Scheduler/feature/export/exporter/SchedulerMultiPageExporter
 */

class MultiPageExporter extends GanttExporterMixin(MultiPageExporter$1) {
  static get $name() {
    return 'MultiPageExporter';
  }

  static get type() {
    return 'multipage';
  }

}
MultiPageExporter._$name = 'MultiPageExporter';

/**
 * @module Gantt/feature/export/exporter/MultiPageVerticalExporter
 */

/**
 * A vertical multiple page exporter. Used by the {@link Gantt.feature.export.PdfExport} feature to export to multiple
 * pages. Content will be scaled in a horizontal direction to fit the page.
 *
 * You do not need to use this class directly.
 *
 * ### Extending exporter
 *
 * ```javascript
 * class MyMultiPageVerticalExporter extends MultiPageVerticalExporter {
 *     // type is required for exporter
 *     static get type() {
 *         return 'mymultipageverticalexporter';
 *     }
 *
 *     get stylesheets() {
 *         const stylesheets = super.stylesheets;
 *
 *         stylesheets.forEach(styleNodeOrLinkTag => doSmth(styleNodeOrLinkTag))
 *
 *         return stylesheets;
 *     }
 * }
 *
 * const gantt = new Gantt({
 *     features : {
 *         pdfExport : {
 *             // this export feature is configured with only one exporter
 *             exporters : [MyMultiPageVerticalExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * gantt.features.pdfExport.export({ exporter : 'mymultipageverticalexporter' });
 * ```
 *
 * @classType multipagevertical
 * @feature
 * @extends Scheduler/feature/export/exporter/MultiPageVerticalExporter
 * @typings Scheduler/feature/export/exporter/MultiPageVerticalExporter -> Scheduler/feature/export/exporter/SchedulerMultiPageVerticalExporter
 */

class MultiPageVerticalExporter extends GanttExporterMixin(MultiPageVerticalExporter$1) {
  static get $name() {
    return 'MultiPageVerticalExporter';
  }

  static get type() {
    return 'multipagevertical';
  }

}
MultiPageVerticalExporter._$name = 'MultiPageVerticalExporter';

/**
 * @module Gantt/feature/export/exporter/SinglePageExporter
 */

/**
 * A single page exporter. Used by the {@link Gantt.feature.export.PdfExport} feature to export to single page. Content
 * will be scaled in both directions to fit the page.
 *
 * You do not need to use this class directly.
 *
 * ### Extending exporter
 *
 * ```javascript
 * class MySinglePageExporter extends SinglePageExporter {
 *     // type is required for exporter
 *     static get type() {
 *         return 'mysinglepageexporter';
 *     }
 *
 *     get stylesheets() {
 *         const stylesheets = super.stylesheets;
 *
 *         stylesheets.forEach(styleNodeOrLinkTag => doSmth(styleNodeOrLinkTag))
 *
 *         return stylesheets;
 *     }
 * }
 *
 * const gantt = new Gantt({
 *     features : {
 *         pdfExport : {
 *             // this export feature is configured with only one exporter
 *             exporters : [MySinglePageExporter]
 *         }
 *     }
 * });
 *
 * // run export with the new exporter
 * gantt.features.pdfExport.export({ exporter : 'mysinglepageexporter' });
 * ```
 *
 * @classType singlepage
 * @feature
 * @extends Scheduler/feature/export/exporter/SinglePageExporter
 * @typings Scheduler/feature/export/exporter/SinglePageExporter -> Scheduler/feature/export/exporter/SchedulerSinglePageExporter
 */

class SinglePageExporter extends GanttExporterMixin(SinglePageExporter$1) {
  static get $name() {
    return 'SinglePageExporter';
  }

  static get type() {
    return 'singlepage';
  }

}
SinglePageExporter._$name = 'SinglePageExporter';

/**
 * @module Gantt/feature/export/PdfExport
 */

/**
 * Generates PDF/PNG files from the Gantt component.
 *
 * <img src="Gantt/gantt-export-dialog.png" style="max-width : 300px" alt="Gantt Export dialog">
 *
 * **NOTE:** Server side is required to make export work!
 *
 * The export server is written in nodejs and it is shipped with our examples. You can find setup instructions in
 * `examples/_shared/server/README.md` and `examples/export/README.md` files.
 *
 * When your server is up and running, it listens to requests. The Export feature sends a request to the specified URL
 * with the HTML fragments. The server generates a PDF (or PNG) file and returns a download link (or binary, depending
 * on {@link #config-sendAsBinary} config). Then the Export feature opens the link in a new tab and the file is
 * automatically downloaded by your browser. This is configurable, see {@link #config-openAfterExport} config.
 *
 * The {@link #config-exportServer} URL must be configured. The URL can be localhost if you start the server locally,
 * or your remote server address.
 *
 * ## Usage
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         pdfExport : {
 *             exportServer : 'http://localhost:8080' // Required
 *         }
 *     }
 * })
 *
 * // Opens popup allowing to customize export settings
 * gantt.features.pdfExport.showExportDialog();
 *
 * // Simple export
 * gantt.features.pdfExport.export({
 *     // Required, set list of column ids to export
 *     columns : gantt.columns.map(c => c.id)
 * }).then(result => {
 *     // Response instance and response content in JSON
 *     let { response, responseJSON } = result;
 * });
 * ```
 *
 * ## Configuring the export dialog
 *
 * To learn about how to customize the export dialog and its default widgets, please refer to the
 * {@link Scheduler.view.export.SchedulerExportDialog} which provides a 'ref' identifier for each child widget so that
 * you can customize them all based on your requirements.
 *
 * ## Loading resources
 *
 * If you face a problem with loading resources when exporting, the cause might be that the application and the export server are hosted on different servers.
 * This is due to [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS). There are 2 options how to handle this:
 * - Allow cross origin requests from the server where your export is hosted to the server where your application is hosted;
 * - Copy all resources keeping the folder hierarchy from the server where your application is hosted to the server where your export is hosted
 * and setup paths using {@link Grid.feature.export.PdfExport#config-translateURLsToAbsolute} config and configure the export server to give access to the path:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         pdfExport : {
 *             exportServer : 'http://localhost:8080',
 *             // '/resources' is hardcoded in WebServer implementation
 *             translateURLsToAbsolute : 'http://localhost:8080/resources'
 *         }
 *     }
 * })
 * ```
 *
 * ```javascript
 * // Following path would be served by this address: http://localhost:8080/resources/
 * node ./src/server.js -h 8080 -r web/application/styles
 * ```
 *
 * where `web/application/styles` is a physical root location of the copied resources, for example:
 *
 * <img src="Grid/export-server-resources.png" style="max-width : 500px" alt="Export server structure with copied resources" />
 *
 * @classtype pdfExport
 *
 * @extends Scheduler/feature/export/PdfExport
 * @feature
 * @typings Scheduler/feature/export/PdfExport -> Scheduler/feature/export/SchedulerPdfExport
 */

class PdfExport extends PdfExport$1 {
  static get $name() {
    return 'PdfExport';
  }

  static get defaultConfig() {
    return {
      exporters: [SinglePageExporter, MultiPageExporter, MultiPageVerticalExporter]
    };
  }

}
PdfExport._$name = 'PdfExport';
GridFeatureManager.registerFeature(PdfExport, false, 'Gantt');

/**
 * @module Gantt/model/CalendarIntervalModel
 */

/**
 * This class represents a calendar interval in the Gantt calendar.
 * Every interval can be either recurrent (regularly repeating in time) or static.
 *
 * Please refer to the [calendars guide](#Gantt/guides/basics/calendars.md) for details
 *
 * @extends SchedulerPro/model/CalendarIntervalModel
 *
 * @typings SchedulerPro/model/CalendarIntervalModel -> SchedulerPro/model/SchedulerProCalendarIntervalModel
 */

class CalendarIntervalModel extends CalendarIntervalModel$1 {}
CalendarIntervalModel._$name = 'CalendarIntervalModel';

/**
 * @module Gantt/model/ProjectModel
 */

/**
 * This class represents a global project of your Project plan or Gantt - a central place for all data.
 *
 * It holds and links the stores usually used by Gantt:
 *
 * - {@link Gantt/data/TaskStore}
 * - {@link Gantt/data/ResourceStore}
 * - {@link Gantt/data/AssignmentStore}
 * - {@link Gantt/data/DependencyStore}
 * - {@link Gantt/data/CalendarManagerStore}
 * - {@link #config-timeRangeStore TimeRangeStore}
 *
 * The project uses a scheduling engine to calculate dates, durations and such. It is also responsible for
 * handling references between models, for example to link an task via an assignment to a resource. These operations
 * are asynchronous, a fact that is hidden when working in the Gantt UI but which you must know about when performing
 * operations on the data level.
 *
 * When there is a change to data that requires something else to be recalculated, the project schedules a calculation
 * (a commit) which happens moments later. It is also possible to trigger these calculations directly. This flow
 * illustrates the process:
 *
 * 1. Something changes which requires the project to recalculate, for example adding a new task:
 *
 * ```javascript
 * const [task] = project.taskStore.add({ startDate, endDate });
 * ```
 *
 * 2. A recalculation is scheduled, thus:
 *
 * ```javascript
 * task.duration; // <- Not yet calculated
 * ```
 *
 * 3. Calculate now instead of waiting for the scheduled calculation
 *
 * ```javascript
 * await project.commitAsync();
 *
 * task.duration; // <- Now available
 * ```
 *
 * Please refer to [this guide](#Gantt/guides/data/project_data.md) for more information.
 *
 * ## Built in CrudManager
 *
 * Gantt's project has a {@link Scheduler/crud/AbstractCrudManagerMixin CrudManager} built in. Using it is the recommended way of
 * syncing data between Gantt and a backend. Example usage:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     project : {
 *         // Configure urls used by the built in CrudManager
 *         transport : {
 *             load : {
 *                 url : 'php/load.php'
 *             },
 *             sync : {
 *                 url : 'php/sync.php'
 *             }
 *         }
 *     }
 * });
 *
 * // Load data from the backend
 * gantt.project.load()
 * ```
 *
 * For more information on CrudManager, see Schedulers docs on {@link Scheduler/data/CrudManager}.
 * For a detailed description of the protocol used by CrudManager, please see the
 * [Crud manager guide](#Gantt/guides/data/crud_manager.md)
 *
 * You can access the current Project data changes anytime using the {@link #property-changes} property.
 *
 * ## Working with inline data
 *
 * The project provides an {@link #property-inlineData} getter/setter that can
 * be used to manage data from all Project stores at once. Populating the stores this way can
 * be useful if you do not want to use the CrudManager for server communication but instead load data using Axios
 * or similar.
 *
 * ### Getting data
 * ```javascript
 * const data = gantt.project.inlineData;
 *
 * // use the data in your application
 * ```
 *
 * ### Setting data
 * ```javascript
 * // Get data from server manually
 * const data = await axios.get('/project?id=12345');
 *
 * // Feed it to the project
 * gantt.project.inlineData = data;
 * ```
 *
 * See also {@link #function-loadInlineData}
 *
 * ### Getting changed records
 *
 * You can access the changes in the current Project dataset anytime using the {@link #property-changes} property. It
 * returns an object with all changes:
 * ```
 * const changes = project.changes;
 *
 * console.log(changes);
 *
 * > {
 *   tasks : {
 *       updated : [{
 *           name : 'My task',
 *           id   : 12
 *       }]
 *   },
 *   assignments : {
 *       added : [{
 *           event      : 12,
 *           resource   : 7,
 *           units      : 100,
 *           $PhantomId : 'abc123'
 *       }]
 *     }
 * };
 * ```
 *
 * ## Monitoring data changes
 *
 * While it is possible to listen for data changes on the projects individual stores, it is sometimes more convenient
 * to have a centralized place to handle all data changes. By listening for the {@link #event-change change event} your
 * code gets notified when data in any of the stores changes. Useful for example to keep an external data model up to
 * date:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     project: {
 *         listeners : {
 *             change({ store, action, records }) {
 *                 const { $name } = store.constructor;
 *
 *                 if (action === 'add') {
 *                     externalDataModel.add($name, records);
 *                 }
 *
 *                 if (action === 'remove') {
 *                     externalDataModel.remove($name, records);
 *                 }
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * ## Processing the data loaded from the server
 *
 * If you want to process the data received from the server after loading, you can use
 * the {@link #event-beforeLoadApply} or {@link #event-beforeSyncApply} events:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     project: {
 *         listeners : {
 *             beforeLoadApply({ response }) {
 *                 // do something with load-response object before it is provided to all the project stores
 *             }
 *         }
 *     }
 * });
 * ```
 *
 * ## Built in StateTrackingManager
 *
 * The project also has a built in {@link Core/data/stm/StateTrackingManager} (STM for short), that
 * handles undo/redo for the project stores (additional stores can also be added). By default, it is only used while
 * editing tasks using the task editor, the editor updates tasks live and uses STM to rollback changes if canceled. But
 * you can enable it to track all project store changes:
 *
 * ```javascript
 * // Enable automatic transaction creation and start recording
 * project.stm.autoRecord = true;
 * project.stm.enable();
 *
 * // Undo a transaction
 * project.stm.undo();
 *
 * // Redo
 * project.stm.redo();
 * ```
 *
 * Check out the `undoredo` demo to see it in action.
 *
 * @extends Core/data/Model
 *
 * @mixes SchedulerPro/data/mixin/ProjectCrudManager
 * @mixes Core/mixin/Events
 *
 * @typings SchedulerPro/model/ProjectModel -> SchedulerPro/model/SchedulerProProjectModel
 */

class ProjectModel extends ProjectCurrentConfig(ProjectCrudManager(GanttProjectMixin.derive(Model))) {
  //region Config

  /**
   * @hidefields id, readOnly, children, parentId, parentIndex
   */

  /**
   * Silences propagations caused by the project loading.
   *
   * Applying the loaded data to the project occurs in two basic stages:
   *
   * 1. Data gets into the engine graph which triggers changes propagation
   * 2. The changes caused by the propagation get written to related stores
   *
   * Setting this flag to `true` makes the component perform step 2 silently without triggering events causing reactions on those changes
   * (like sending changes back to the server if `autoSync` is enabled) and keeping stores in unmodified state.
   *
   * This is safe if the loaded data is consistent so propagation doesn't really do any adjustments.
   * By default the system treats the data as consistent so this option is `true`.
   *
   * ```javascript
   * new Gantt({
   *     project : {
   *         // We want scheduling engine to recalculate the data properly
   *         // so then we could save it back to the server
   *         silenceInitialCommit : false,
   *         ...
   *     }
   *     ...
   * })
   * ```
   *
   * @config {Boolean} silenceInitialCommit
   * @default true
   * @category Advanced
   */

  /**
   * When `true` the project manually scheduled tasks will adjust their proposed start/end dates
   * to skip non working time.
   *
   * @field {Boolean} skipNonWorkingTimeWhenSchedulingManually
   * @default false
   */

  /**
   * This config manages DST correction in the scheduling engine. It only has effect when DST transition hour is
   * working time. Usually DST transition occurs on Sunday, so with non working weekends the DST correction logic
   * is not involved.
   *
   * If **true**, it will add/remove one hour when calculating duration from start/end dates. For example:
   * Assume weekends are working and on Sunday, 2020-10-25 at 03:00 clocks are set back 1 hour. Assume there is a task:
   *
   * ```javascript
   * {
   *     startDate    : '2020-10-20',
   *     duration     : 10,
   *     durationUnit : 'day'
   * }
   * ```
   * It will end on 2020-10-29 23:00. Because of the DST transition Sunday is actually 25 hours long and when the
   * Gantt project calculates the end date it converts days to hours multiplying by 24. If you're setting duration
   * and want task to end on the end of the day you should manually correct for DST, like so:
   *
   * ```javascript
   * {
   *     startDate    : '2020-10-20',
   *     duration     : 10 * 24 + 1,
   *     durationUnit : 'hour'
   * },
   * ```
   *
   * If task has start and end dates it will correct for DST twice:
   *
   * ```javascript
   * {
   *     startDate    : '2020-10-20',
   *     endDate      : '2020-10-30'
   * }
   * ```
   * This task will end on 2020-10-29 22:00 which is a known quirk.
   *
   * If **false**, the Gantt project will not add DST correction which fixes the quirk mentioned above and such task
   * will end on 2020-10-30 exactly, having hours duration of 10 days * 24 hours + 1 hour.
   *
   * Also, for this task days duration will be a floating point number due to extra (or missing) hour:
   *
   * ```javascript
   * task.getDuration('day')  // 10.041666666666666
   * task.getDuration('hour') // 241
   * ```
   *
   * @config {Boolean} adjustDurationToDST
   * @default false
   * @category Advanced
   */
  // TODO: This config is introduced only to make behavior transition smooth. If nobody complains about it for
  // a couple of releases, it should be removed

  /**
   * Set to `true` to enable calculation progress notifications.
   * When enabled, the project fires {@link #event-progress} events and the Gantt chart load mask reacts by showing a progress bar for the Engine calculations.
   *
   * **Note**: Enabling progress notifications will impact calculation performance, since it needs to pause calculations to allow the UI to redraw.
   *
   * @config {Boolean} enableProgressNotifications
   * @category Advanced
   */

  /**
   * Enables/disables the calculation progress notifications.
   * @member {Boolean} enableProgressNotifications
   * @category Advanced
   */
  // region Events

  /**
   * Fired during the Engine calculation if {@link #config-enableProgressNotifications} config is `true`
   * @event progress
   * @param {Number} total The total number of operations
   * @param {Number} remaining The number of remaining operations
   * @param {String} phase The phase of the calculation, either 'storePopulation' when data is getting loaded, or 'propagating' when data is getting calculated
   */

  /**
   * Fired when the Engine detects a computation cycle.
   * @event cycle
   * @param {Object} schedulingIssue Scheduling error describing the case:
   * @param {Function} schedulingIssue.getDescription Returns the cycle description
   * @param {Object} schedulingIssue.cycle Object providing the cycle info
   * @param {Function} schedulingIssue.getResolutions Returns possible resolutions
   * @param {Function} continueWithResolutionResult Function to call after a resolution is chosen to
   * proceed with the Engine calculations:
   * ```javascript
   * project.on('cycle', ({ continueWithResolutionResult }) => {
   *     // cancel changes in case of a cycle
   *     continueWithResolutionResult(EffectResolutionResult.Cancel);
   * })
   * ```
   */

  /**
   * Fired when the Engine detects a scheduling conflict.
   * @event schedulingConflict
   * @param {Object} schedulingIssue The conflict details:
   * @param {Function} schedulingIssue.getDescription Returns the conflict description
   * @param {Object[]} schedulingIssue.intervals Array of conflicting intervals
   * @param {Function} schedulingIssue.getResolutions Function to get possible resolutions
   * @param {Function} continueWithResolutionResult Function to call after a resolution is chosen to
   * proceed with the Engine calculations:
   * ```javascript
   * project.on('schedulingConflict', ({ schedulingIssue, continueWithResolutionResult }) => {
   *     // apply the first resolution and continue
   *     schedulingIssue.getResolutions()[0].resolve();
   *     continueWithResolutionResult(EffectResolutionResult.Resume);
   * })
   * ```
   */

  /**
   * Fired when the Engine detects a calendar misconfiguration when the calendar does
   * not provide any working periods of time which makes usage impossible.
   * @event emptyCalendar
   * @param {Object} schedulingIssue Scheduling error describing the case:
   * @param {Function} schedulingIssue.getDescription Returns the error description
   * @param {Function} schedulingIssue.getCalendar Returns the calendar that must be fixed
   * @param {Function} schedulingIssue.getResolutions Returns possible resolutions
   * @param {Function} continueWithResolutionResult Function to call after a resolution is chosen to
   * proceed with the Engine calculations:
   * ```javascript
   * project.on('emptyCalendar', ({ schedulingIssue, continueWithResolutionResult }) => {
   *     // apply the first resolution and continue
   *     schedulingIssue.getResolutions()[0].resolve();
   *     continueWithResolutionResult(EffectResolutionResult.Resume);
   * })
   * ```
   */

  /**
   * Fired when the engine has finished its calculations and the results has been written back to the records.
   *
   * ```javascript
   * gantt.project.on({
   *     dataReady() {
   *        console.log('Calculations finished');
   *     }
   * });
   *
   * gantt.project.taskStore.first.duration = 10;
   *
   * // At some point a bit later it will log 'Calculations finished'
   * ```
   *
   * @event dataReady
   * @param {Gantt.model.ProjectModel} source The project
   */
  //endregion
  static get defaults() {
    return {
      /**
       * The number of hours per day (is used when converting the duration from one unit to another).
       * @field {Number} hoursPerDay
       * @default 24
       */

      /**
       * The number of days per week (is used when converting the duration from one unit to another).
       * @field {Number} daysPerWeek
       * @default 7
       */

      /**
       * The number of days per month (is used when converting the duration from one unit to another).
       * @field {Number} daysPerMonth
       * @default 30
       */

      /**
       * The source of the calendar for dependencies (the calendar used for taking dependencies lag into account).
       * Possible values are:
       *
       * - `ToEvent` - successor calendar will be used (default);
       * - `FromEvent` - predecessor calendar will be used;
       * - `Project` - the project calendar will be used.
       *
       * @field {String} dependenciesCalendar
       * @default 'ToEvent'
       */

      /**
       * The project calendar.
       * @config {String|Object|Gantt.model.CalendarModel} calendar
       */

      /**
       * The project calendar.
       * @field {Gantt.model.CalendarModel} calendar
       */

      /**
       * `true` to enable automatic {@link Gantt/model/TaskModel#field-percentDone % done} calculation for summary
       * tasks, `false` to disable it.
       * @field {Boolean} autoCalculatePercentDoneForParentTasks
       * @default true
       */

      /**
       * State tracking manager instance the project relies on
       * @member {Core.data.stm.StateTrackingManager} stm
       * @category Advanced
       */

      /**
       * The {@link Gantt.data.TaskStore store} holding the task information.
       *
       * See also {@link Gantt.model.TaskModel}
       * @member {Gantt.data.TaskStore} eventStore
       * @category Models & Stores
       */

      /**
       * A {@link Gantt.data.TaskStore} instance or a config object.
       * @config {Gantt.data.TaskStore|Object} eventStore
       * @category Models & Stores
       */

      /**
       * An alias for the {@link #property-eventStore}.
       *
       * See also {@link Gantt.model.TaskModel}
       * @member {Gantt.data.TaskStore} taskStore
       * @category Models & Stores
       */

      /**
       * An alias for the {@link #config-eventStore}.
       * @config {Gantt.data.TaskStore|Object} taskStore
       * @category Models & Stores
       */

      /**
       * The {@link Gantt.data.DependencyStore store} holding the dependency information.
       *
       * See also {@link Gantt.model.DependencyModel}
       * @member {Gantt.data.DependencyStore} dependencyStore
       * @category Models & Stores
       */

      /**
       * A {@link Gantt.data.DependencyStore} instance or a config object.
       * @config {Gantt.data.DependencyStore|Object} dependencyStore
       * @category Models & Stores
       */

      /**
       * The {@link Gantt.data.ResourceStore store} holding the resources that can be assigned to the tasks in the
       * task store.
       *
       * See also {@link Gantt.model.ResourceModel}
       * @member {Gantt.data.ResourceStore} resourceStore
       * @category Models & Stores
       */

      /**
       * A {@link Gantt.data.ResourceStore} instance or a config object.
       * @config {Gantt.data.ResourceStore|Object} resourceStore
       * @category Models & Stores
       */

      /**
       * The {@link Gantt.data.AssignmentStore store} holding the assignment information.
       *
       * See also {@link Gantt.model.AssignmentModel}
       * @member {Gantt.data.AssignmentStore} assignmentStore
       * @category Models & Stores
       */

      /**
       * An {@link Gantt.data.AssignmentStore} instance or a config object.
       * @config {Gantt.data.AssignmentStore|Object} assignmentStore
       * @category Models & Stores
       */

      /**
       * The {@link Gantt.data.CalendarManagerStore store} holding the calendar information.
       *
       * See also {@link Gantt.model.CalendarModel}
       * @member {Gantt.data.CalendarManagerStore} calendarManagerStore
       * @category Models & Stores
       */

      /**
       * A {@link Gantt.data.CalendarManagerStore} instance or a config object.
       * @config {Gantt.data.CalendarManagerStore|Object} calendarManagerStore
       * @category Models & Stores
       */

      /**
       * The {@link Core.data.Store store} containing time ranges to be visualized.
       *
       * See also {@link Scheduler.model.TimeSpan}
       * @member {Core.data.Store} timeRangeStore
       * @category Models & Stores
       */

      /**
       * Returns an array of critical paths.
       * Each _critical path_ is an array of critical path nodes.
       * Each _critical path node_ is an object which contains {@link Gantt/model/TaskModel#field-critical critical task}
       * and {@link Gantt/model/DependencyModel dependency} leading to the next critical path node.
       * Dependency is missing if it is the last critical path node in the critical path.
       * To highlight critical paths, enable {@link Gantt/feature/CriticalPaths} feature.
       *
       * ```javascript
       * // This is an example of critical paths structure
       * [
       *      // First path
       *      [
       *          {
       *              event : Gantt.model.TaskModel
       *              dependency : Gantt.model.DependencyModel
       *          },
       *          {
       *              event : Gantt.model.TaskModel
       *          }
       *      ],
       *      // Second path
       *      [
       *          {
       *              event : Gantt.model.TaskModel
       *          }
       *      ]
       *      // and so on....
       * ]
       * ```
       *
       * For more details on the _critical path method_ theory please check
       * this article: https://en.wikipedia.org/wiki/Critical_path_method
       *
       * @member {Array[]} criticalPaths
       * @category Scheduling
       */
      // root should be always expanded
      expanded: true
    };
  }

  static get defaultConfig() {
    return {
      projectConstraintIntervalClass: ProjectConstraintInterval,
      dateConstraintIntervalClass: DateConstraintInterval,
      dependencyConstraintIntervalClass: DependencyConstraintInterval,

      /**
       * The constructor of the event model class, to be used in the project. Will be set as the {@link Core.data.Store#config-modelClass modelClass}
       * property of the {@link #property-eventStore}
       *
       * @config {Gantt.model.TaskModel} [taskModelClass]
       * @typings {typeof TaskModel}
       * @category Models & Stores
       */
      taskModelClass: TaskModel,

      /**
       * The constructor of the dependency model class, to be used in the project. Will be set as the {@link Core.data.Store#config-modelClass modelClass}
       * property of the {@link #property-dependencyStore}
       *
       * @config {Gantt.model.DependencyModel} [dependencyModelClass]
       * @typings {typeof DependencyModel}
       * @category Models & Stores
       */
      dependencyModelClass: DependencyModel,

      /**
       * The constructor of the resource model class, to be used in the project. Will be set as the {@link Core.data.Store#config-modelClass modelClass}
       * property of the {@link #property-resourceStore}
       *
       * @config {Gantt.model.ResourceModel} [resourceModelClass]
       * @typings {typeof ResourceModel}
       * @category Models & Stores
       */
      resourceModelClass: ResourceModel,

      /**
       * The constructor of the assignment model class, to be used in the project. Will be set as the {@link Core.data.Store#config-modelClass modelClass}
       * property of the {@link #property-assignmentStore}
       *
       * @config {Gantt.model.AssignmentModel} [assignmentModelClass]
       * @typings {typeof AssignmentModel}
       * @category Models & Stores
       */
      assignmentModelClass: AssignmentModel,

      /**
       * The constructor of the calendar model class, to be used in the project. Will be set as the {@link Core.data.Store#config-modelClass modelClass}
       * property of the {@link #property-calendarManagerStore}
       *
       * @config {Gantt.model.CalendarModel} [calendarModelClass]
       * @typings {typeof CalendarModel}
       * @category Models & Stores
       */
      calendarModelClass: CalendarModel,

      /**
       * The constructor to create an task store instance with. Should be a class, subclassing the {@link Gantt.data.TaskStore}
       * @config {Gantt.data.TaskStore}
       * @typings {typeof TaskStore}
       * @category Models & Stores
       */
      taskStoreClass: TaskStore,

      /**
       * The constructor to create a dependency store instance with. Should be a class, subclassing the {@link Gantt.data.DependencyStore}
       * @config {Gantt.data.DependencyStore}
       * @typings {typeof DependencyStore}
       * @category Models & Stores
       */
      dependencyStoreClass: DependencyStore,

      /**
       * The constructor to create a dependency store instance with. Should be a class, subclassing the {@link Gantt.data.ResourceStore}
       * @config {Gantt.data.ResourceStore}
       * @typings {typeof ResourceStore}
       * @category Models & Stores
       */
      resourceStoreClass: ResourceStore,

      /**
       * The constructor to create a dependency store instance with. Should be a class, subclassing the {@link Gantt.data.AssignmentStore}
       * @config {Gantt.data.AssignmentStore}
       * @typings {typeof AssignmentStore}
       * @category Models & Stores
       */
      assignmentStoreClass: AssignmentStore,

      /**
       * The constructor to create a calendar store instance with. Should be a class, subclassing the {@link Gantt.data.CalendarManagerStore}
       * @config {Gantt.data.CalendarManagerStore}
       * @typings {typeof CalendarManagerStore}
       * @category Models & Stores
       */
      calendarManagerStoreClass: CalendarManagerStore,

      /**
       * Start date of the project in the ISO 8601 format. Setting this date will constrain all other tasks in the
       * project to start no earlier than it.
       *
       * If this date is not provided, it will be calculated as the earliest date among all tasks.
       *
       * Note that the field always returns a `Date`.
       *
       * @field {Date} startDate
       * @accepts {String|Date}
       */

      /**
       * End date of the project in the ISO 8601 format.
       * The value is calculated as the latest date among all tasks.
       *
       * Note that the field always returns a `Date`.
       *
       * @field {Date} endDate
       * @accepts {String|Date}
       */

      /**
       * The scheduling direction of the project events.
       * The `Forward` direction corresponds to the As-Soon-As-Possible (ASAP) scheduling,
       * `Backward` - to As-Late-As-Possible (ALAP).
       *
       * @field {String} direction
       * @default 'Forward'
       */

      /**
       * The initial data, to fill the {@link #property-taskStore taskStore} with.
       * Should be an array of {@link Gantt.model.TaskModel TaskModels} or configuration objects.
       *
       * @config {Object[]|Gantt.model.TaskModel[]}
       * @category Legacy inline data
       */
      tasksData: null,
      // What is actually used to hold initial tasks, tasksData is transformed in construct()

      /**
       * Alias to {@link #config-tasksData}.
       *
       * @config {Object[]|Gantt.model.TaskModel[]}
       * @category Legacy inline data
       */
      eventsData: null,

      /**
       * The initial data, to fill the {@link #property-dependencyStore dependencyStore} with.
       * Should be an array of {@link Gantt.model.DependencyModel DependencyModels} or configuration objects.
       *
       * @config {Object[]|Gantt.model.DependencyModel[]}
       * @category Legacy inline data
       */
      dependenciesData: null,

      /**
       * The initial data, to fill the {@link #property-resourceStore resourceStore} with.
       * Should be an array of {@link Gantt.model.ResourceModel ResourceModels} or configuration objects.
       *
       * @config {Object[]|Gantt.model.ResourceModel[]}
       * @category Legacy inline data
       */
      resourcesData: null,

      /**
       * The initial data, to fill the {@link #property-assignmentStore assignmentStore} with.
       * Should be an array of {@link Gantt.model.AssignmentModel AssignmentModels} or configuration objects.
       *
       * @config {Object[]|Gantt.model.AssignmentModel[]}
       * @category Legacy inline data
       */
      assignmentsData: null,

      /**
       * The initial data, to fill the {@link #property-calendarManagerStore calendarManagerStore} with.
       * Should be an array of {@link Gantt.model.CalendarModel CalendarModels} or configuration objects.
       *
       * @config {Object[]|Gantt.model.CalendarModel[]}
       * @category Legacy inline data
       */
      calendarsData: null,

      /**
       * Store that holds time ranges (using the {@link Scheduler.model.TimeSpan} model or subclass thereof) for
       * {@link Scheduler.feature.TimeRanges} feature. A store will be automatically created if none is specified.
       * @config {Object|Core.data.Store}
       * @category Models & Stores
       */
      timeRangeStore: {
        modelClass: TimeSpan,
        storeId: 'timeRanges'
      },

      /**
       * Set to `true` to reset the undo/redo queues of the internal {@link Core.data.stm.StateTrackingManager}
       * after the Project has loaded. Defaults to `false`
       * @config {Boolean} resetUndoRedoQueuesAfterLoad
       * @category Advanced
       */
      convertEmptyParentToLeaf: false,
      supportShortSyncResponseNote: 'Note: Please consider enabling "supportShortSyncResponse" option to allow less detailed sync responses (https://bryntum.com/docs/gantt/api/Gantt/model/ProjectModel#config-supportShortSyncResponse)',

      /**
       * Enables early rendering in Gantt, by postponing calculations to after the first refresh.
       *
       * Requires task data loaded in Gantt to be pre-normalized to function as intended, since it will be used to
       * render tasks before engine has normalized the data. Given un-normalized data tasks will snap into place
       * when calculations are finished.
       *
       * The Gantt chart will be read-only until the initial calculations are finished.
       *
       * @config {Boolean}
       * @default
       * @category Advanced
       */
      delayCalculation: true,
      eventStore: {},
      assignmentStore: {},
      resourceStore: {},
      dependencyStore: {},
      calendarManagerStore: {}
    };
  }

  static get configurable() {
    return {
      /**
       * Get/set {@link #property-taskStore} data.
       *
       * Always returns an array of {@link Gantt.model.TaskModel TaskModels} but also accepts an array of
       * its configuration objects as input.
       *
       * @member {Gantt.model.TaskModel[]} tasks
       * @accepts {Gantt.model.TaskModel[]|Object[]}
       * @category Inline data
       */

      /**
       * Data use to fill the {@link #property-taskStore}. Should be an array of
       * {@link Gantt.model.TaskModel TaskModels} or its configuration objects.
       *
       * @config {Gantt.model.TaskModel[]|Object[]}
       * @category Inline data
       */
      tasks: null,

      /**
       * Get/set {@link #property-resourceStore} data.
       *
       * Always returns an array of {@link Gantt.model.ResourceModel ResourceModels} but also accepts an array
       * of its configuration objects as input.
       *
       * @member {Gantt.model.ResourceModel[]} resources
       * @accepts {Gantt.model.ResourceModel[]|Object[]}
       * @category Inline data
       */

      /**
       * Data use to fill the {@link #property-resourceStore}. Should be an array of
       * {@link Gantt.model.ResourceModel ResourceModels} or its configuration objects.
       *
       * @config {Gantt.model.ResourceModel[]|Object[]}
       * @category Inline data
       */
      resources: null,

      /**
       * Get/set {@link #property-assignmentStore} data.
       *
       * Always returns an array of {@link Gantt.model.AssignmentModel AssignmentModels} but also accepts an
       * array of its configuration objects as input.
       *
       * @member {Gantt.model.AssignmentModel[]} assignments
       * @accepts {Gantt.model.AssignmentModel[]|Object[]}
       * @category Inline data
       */

      /**
       * Data use to fill the {@link #property-assignmentStore}. Should be an array of
       * {@link Gantt.model.AssignmentModel AssignmentModels} or its configuration objects.
       *
       * @config {Gantt.model.AssignmentModel[]|Object[]}
       * @category Inline data
       */
      assignments: null,

      /**
       * Get/set {@link #property-dependencyStore} data.
       *
       * Always returns an array of {@link Gantt.model.DependencyModel DependencyModels} but also accepts an
       * array of its configuration objects as input.
       *
       * @member {Gantt.model.DependencyModel[]} dependencies
       * @accepts {Gantt.model.DependencyModel[]|Object[]}
       * @category Inline data
       */

      /**
       * Data use to fill the {@link #property-dependencyStore}. Should be an array of
       * {@link Gantt.model.DependencyModel DependencyModels} or its configuration objects.
       *
       * @config {Gantt.model.DependencyModel[]|Object[]}
       * @category Inline data
       */
      dependencies: null,

      /**
       * Get/set {@link #property-timeRangeStore} data.
       *
       * Always returns an array of {@link Scheduler.model.TimeSpan TimeSpans} but also accepts an
       * array of its configuration objects as input.
       *
       * @member {Scheduler.model.TimeSpan[]} timeRanges
       * @accepts {Scheduler.model.TimeSpan[]|Object[]}
       * @category Inline data
       */

      /**
       * Data use to fill the {@link #property-timeRangeStore}. Should be an array of
       * {@link Scheduler.model.TimeSpan TimeSpans} or its configuration objects.
       *
       * @config {Scheduler.model.TimeSpan[]|Object[]}
       * @category Inline data
       */
      timeRanges: null,

      /**
       * Get/set {@link #property-calendarManagerStore} data.
       *
       * Always returns a {@link Gantt.model.CalendarModel} array but also accepts an array of its configuration
       * objects as input.
       *
       * @member {Gantt.model.CalendarModel[]} calendars
       * @accepts {Gantt.model.CalendarModel[]|Object[]}
       * @category Inline data
       */

      /**
       * Data use to fill the {@link #property-calendarManagerStore}. Should be a
       * {@link Gantt.model.CalendarModel} array or its configuration objects.
       *
       * @config {Gantt.model.CalendarModel[]|Object[]}
       * @category Inline data
       */
      calendars: null,

      /**
       * The initial data, to fill the {@link #property-timeRangeStore timeRangeStore} with.
       * Should be an array of {@link Scheduler.model.TimeSpan TimeSpans} or configuration objects.
       *
       * @config {Object[]|Scheduler.model.TimeSpan[]}
       * @category Legacy inline data
       */
      timeRangesData: null
    };
  } //endregion

  construct(...args) {
    const config = args[0] || {}; // put config to arguments (passed to the parent class "construct")

    args[0] = config;

    if ('tasksData' in config) {
      config.eventsData = config.tasksData;
      delete config.tasksData;
    }

    if ('taskStore' in config) {
      config.eventStore = config.taskStore;
      delete config.taskStore;
    } // Maintain backwards compatibility
    // default config will be exposed later and won't be applied if a value is exists,
    // but we should sync eventModelClass/eventStoreClass with taskModelClass/taskStoreClass before all further actions
    // to apply the correct value in all mixins that uses eventModelClass/eventStoreClass properties only

    config.eventModelClass = config.taskModelClass || config.eventModelClass || this.getDefaultConfiguration().taskModelClass || this.defaultEventModelClass;
    config.eventStoreClass = config.taskStoreClass || config.eventStoreClass || this.getDefaultConfiguration().taskStoreClass || this.defaultEventStoreClass;
    super.construct(...args);
  } //region Attaching stores
  // Attach to a store, relaying its change events

  attachStore(store) {
    store.on({
      name: store.$$name,
      change: 'relayStoreChange',
      thisObj: this
    });
  } // Detach a store, stop relaying its change events

  detachStore(store) {
    store && this.detachListeners(store.$$name);
  }

  relayStoreChange(event) {
    /**
     * Fired when data in any of the projects stores changes.
     *
     * Basically a relayed version of each stores own change event, decorated with which store it originates from.
     * See the {@link Core.data.Store#event-change store change event} documentation for more information.
     *
     * @event change
     * @param {Gantt.model.ProjectModel} source This project
     * @param {Core.data.Store} store Affected store
     * @param {String} action Name of action which triggered the change. May be one of:
     * * `'remove'`
     * * `'removeAll'`
     * * `'add'`
     * * `'updatemultiple'`
     * * `'clearchanges'`
     * * `'filter'`
     * * `'update'`
     * * `'dataset'`
     * * `'replace'`
     * @param {Core.data.Model} record Changed record, for actions that affects exactly one record (`'update'`)
     * @param {Core.data.Model[]} records Changed records, passed for all actions except `'removeAll'`
     * @param {Object} changes Passed for the `'update'` action, info on which record fields changed
     */
    return this.trigger('change', _objectSpread2(_objectSpread2({
      store: event.source
    }, event), {}, {
      source: this
    }));
  } //endregion

  get defaultEventModelClass() {
    return TaskModel;
  }

  get defaultEventStoreClass() {
    return TaskStore;
  }

  set taskStore(store) {
    this.eventStore = store;
  }

  get taskStore() {
    return this.eventStore;
  }

  get timeRangeStore() {
    return this._timeRangeStore;
  }

  set timeRangeStore(store) {
    const me = this;
    me.detachStore(me._timeRangeStore);
    me._timeRangeStore = Store.getStore(store, Store);

    if (!me._timeRangeStore.storeId) {
      me._timeRangeStore.storeId = 'timeRanges';
    }

    me.attachStore(me._timeRangeStore);
  }

  async tryInsertChild() {
    return this.tryPropagateWithChanges(() => {
      this.insertChild(...arguments);
    });
  }
  /**
   * Overrides the project owned store identifiers calculation and launches rescheduling.
   * @method setCalculations
   * @param {Object} calculations Object providing new _engine_ fields calculation function names.
   * The object is grouped by store identifiers. For example below code
   * overrides task {@link Gantt/model/TaskModel#field-startDate}, {@link Gantt/model/TaskModel#field-endDate}
   * and {@link Gantt/model/TaskModel#field-duration} calculation so
   * the fields will always simply return their current values:
   *
   * ```javascript
   * // task startDate, endDate and duration will use their userProvidedValue method
   * // which simply returns their current values as-is
   * const oldCalculations = await project.setCalculations({
   *     tasks : {
   *         startDate : "userProvidedValue",
   *         endDate   : "userProvidedValue",
   *         duration  : "userProvidedValue"
   *     }
   * })
   * ```
   * @returns {Promise} Promise that resolves with an object having the overridden calculations.
   * The object can be used to toggle the calculations back in the future:
   * ```javascript
   * // override event duration calculation
   * const oldCalculations = await project.setCalculations({
   *     events : {
   *         duration  : "userProvidedValue"
   *     }
   * })
   * // revert the duration calculation back
   * project.setCalculations(oldCalculations)
   * ```
   * @category Advanced
   */

  /**
   * Returns a calendar of the project. If task has never been assigned a calendar a project's calendar will be returned.
   *
   * @method getCalendar
   * @returns {Gantt.model.CalendarModel}
   * @category Scheduling
   */

  /**
   * Sets the calendar of the project. Will cause the schedule to be updated - returns a `Promise`
   *
   * @method setCalendar
   * @param {Gantt.model.CalendarModel} calendar The new calendar.
   * @returns {Promise}
   * @propagating
   * @category Scheduling
   */

  /**
   * Causes the scheduling engine to re-evaluate the task data and all associated data and constraints
   * and apply necessary changes.
   * @returns {Promise}
   * @function propagate
   * @propagating
   * @category Scheduling
   */

  /**
   * Suspend {@link #function-propagate propagation} processing. When propagation is suspended,
   * calls to {@link #function-propagate} do not proceed, instead a propagate call is deferred
   * until a matching {@link #function-resumePropagate} is called.
   * @function suspendPropagate
   * @category Scheduling
   */

  /**
   * Resume {@link #function-propagate propagation}. If propagation is resumed (calls may be nested
   * which increments a suspension counter), then if a call to propagate was made during suspension,
   * {@link #function-propagate} is executed.
   * @param {Boolean} [trigger] Pass `false` to inhibit automatic propagation if propagate was requested during suspension.
   * @returns {Promise}
   * @function resumePropagate
   * @category Scheduling
   */

  /**
   * Accepts a "data package" consisting of data for the projects stores, which is then loaded into the stores.
   *
   * The package can hold data for EventStore, AssignmentStore, ResourceStore and DependencyStore. It uses the same
   * format as when creating a project with inline data:
   *
   * ```javascript
   * await project.loadInlineData({
   *     eventsData       : [...],
   *     resourcesData    : [...],
   *     assignmentsData  : [...],
   *     dependenciesData : [...]
   * });
   * ```
   *
   * After populating the stores it commits the project, starting its calculations. By awaiting `loadInlineData()` you
   * can be sure that project calculations are finished.
   *
   * @function loadInlineData
   * @param {Object} dataPackage A data package as described above
   * @fires load
   * @async
   * @category Inline data
   */

  /**
   * Project changes (CRUD operations to records in its stores) are automatically committed on a buffer to the
   * underlying graph based calculation engine. The engine performs it calculations async.
   *
   * By calling this function, the commit happens right away. And by awaiting it you are sure that project
   * calculations are finished and that references between records are up to date.
   *
   * The returned promise is resolved with an object. If that object has `rejectedWith` set, there has been a conflict and the calculation failed.
   *
   * ```javascript
   * // Move a task in time
   * taskStore.first.shift(1);
   *
   * // Trigger calculations directly and wait for them to finish
   * const result = await project.commitAsync();
   *
   * if (result.rejectedWith) {
   *     // there was a conflict during the scheduling
   * }
   * ```
   *
   * @async
   * @propagating
   * @returns {Promise}
   * @function commitAsync
   * @category Scheduling
   */
  //region JSON

  /**
   * Returns the data from the records of the projects stores, in a format that can be consumed by `loadInlineData()`.
   *
   * Used by JSON.stringify to correctly convert this record to json.
   *
   *
   * ```javascript
   * const project = new ProjectModel({
   *     eventsData       : [...],
   *     resourcesData    : [...],
   *     assignmentsData  : [...],
   *     dependenciesData : [...]
   * });
   *
   * const json = project.toJSON();
   *
   * // json:
   * {
   *     eventsData : [...],
   *     resourcesData : [...],
   *     dependenciesData : [...],
   *     assignmentsData : [...]
   * }
   * ```
   *
   * Output can be consumed by `loadInlineData()`:
   *
   * ```javascript
   * const json = project.toJSON();
   *
   * // Plug it back in later
   * project.loadInlineData(json);
   * ```
   *
   * @returns {Object}
   * @category Inline data
   */

  toJSON() {
    return {
      eventsData: this.eventStore.toJSON(),
      resourcesData: this.resourceStore.toJSON(),
      dependenciesData: this.dependencyStore.toJSON(),
      assignmentsData: this.assignmentStore.toJSON()
    };
  }
  /**
   * Get or set project data (records from its stores) as a JSON string.
   *
   * Get a JSON string:
   *
   * ```javascript
   * const project = new ProjectModel({
   *     eventsData       : [...],
   *     resourcesData    : [...],
   *     assignmentsData  : [...],
   *     dependenciesData : [...]
   * });
   *
   * const jsonString = project.json;
   *
   * // jsonString:
   * '{"eventsData":[...],"resourcesData":[...],...}'
   * ```
   *
   * Set a JSON string (to populate the project stores):
   *
   * ```javascript
   * project.json = '{"eventsData":[...],"resourcesData":[...],...}'
   * ```
   *
   * @property {String}
   * @category Inline data
   */

  get json() {
    return super.json;
  }

  set json(json) {
    if (typeof json === 'string') {
      json = StringHelper.safeJsonParse(json);
    }

    this.loadInlineData(json);
  } //endregion
  //region Inline data

  get tasks() {
    return this.taskStore.records;
  }

  updateTasks(events) {
    this.taskStore.data = events;
  }

  get resources() {
    return this.resourceStore.records;
  }

  updateResources(resources) {
    this.resourceStore.data = resources;
  }

  get assignments() {
    return this.assignmentStore.records;
  }

  updateAssignments(assignments) {
    this.assignmentStore.data = assignments;
  }

  get dependencies() {
    return this.dependencyStore.records;
  }

  updateDependencies(dependencies) {
    this.dependencyStore.data = dependencies;
  }

  get timeRanges() {
    return this.timeRangeStore.records;
  }

  updateTimeRanges(timeRanges) {
    this.timeRangeStore.data = timeRanges;
  }

  get calendars() {
    return this.calendarManagerStore.records;
  }

  updateCalendars(calendars) {
    this.calendarManagerStore.data = calendars;
  }

  updateTimeRangesData(ranges) {
    this.timeRangeStore.data = ranges;
  }
  /**
   * Get or set data of project stores. The returned data is identical to what
   * {@link #function-toJSON} returns:
   *
   * ```javascript
   *
   * const data = scheduler.project.inlineData;
   *
   * // data:
   * {
   *     eventsData : [...],
   *     resourcesData : [...],
   *     dependenciesData : [...],
   *     assignmentsData : [...]
   * }
   *
   *
   * // Plug it back in later
   * scheduler.project.inlineData = data;
   * ```
   *
   * @member {Object} inlineData
   * @category Inline data
   */

  get inlineData() {
    return this.toJSON();
  }

  set inlineData(inlineData) {
    this.json = inlineData;
  }

  afterChange(toSet, wasSet) {
    super.afterChange(...arguments);

    if (wasSet.calendar) {
      this.trigger('calendarChange');
    }
  }

  refreshWbs(options) {
    var _me$unfilteredChildre;

    const me = this,
          children = (_me$unfilteredChildre = me.unfilteredChildren) !== null && _me$unfilteredChildre !== void 0 ? _me$unfilteredChildre : me.children;

    if (children !== null && children !== void 0 && children.length) {
      var _children$0$refreshWb;

      // We leverage the refreshWbs() method of TaskModel (our children) to do the work. This node does not
      // have a wbsValue, so we pass -1 for the index to skip on to just our children.
      (_children$0$refreshWb = children[0].refreshWbs) === null || _children$0$refreshWb === void 0 ? void 0 : _children$0$refreshWb.call(me, options, -1);
    }
  }

}
ProjectModel.applyConfigs = true;
ProjectModel._$name = 'ProjectModel';

/**
 * @module Gantt/util/ProjectGenerator
 */

const year = new Date().getFullYear(),
      earlyMondayThisYear = DateHelper.add(DateHelper.startOf(new Date(year, 0, 5), 'week'), 1 - DateHelper.weekStartDay, 'day'),
      rnd = new RandomGenerator();

function getNum(id, token) {
  return parseInt('' + id + token);
}
/**
 * An internal utility class which generates sample project data for Examples and Tests.
 */

class ProjectGenerator {
  static async generateAsync(requestedTaskCount, maxProjectSize, progressCallback = null, startDate = earlyMondayThisYear, log = true) {
    const config = {
      startDate,
      tasksData: [],
      dependenciesData: []
    },
          blockCount = Math.ceil(requestedTaskCount / 10),
          projectSize = Math.ceil(maxProjectSize / 10),
          generator = this.generateBlocks(blockCount, projectSize, config.startDate);
    let count = 0,
        duration = 0,
        taskCount = 0,
        dependencyCount = 0;
    log && console.time('generate');

    for (const block of generator) {
      config.tasksData.push(...block.tasksData);
      config.dependenciesData.push(...block.dependenciesData);

      if (block.projectDuration) {
        duration = Math.max(block.projectDuration, duration);
      }

      taskCount += block.taskCount;
      dependencyCount += block.dependencyCount;

      if (++count % 1000 === 0) {
        progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback(taskCount, dependencyCount, false);
        await AsyncHelper.animationFrame();
      }
    }

    progressCallback === null || progressCallback === void 0 ? void 0 : progressCallback(taskCount, dependencyCount, true);
    config.endDate = DateHelper.add(config.startDate, Math.max(duration, 30), 'days');
    log && console.timeEnd('generate');
    return config;
  }

  static *generateBlocks(count, projectSize, startDate) {
    let currentId = 1,
        dependencyId = 1,
        projectDuration = 0,
        blockDuration = 0,
        sumDuration = 0,
        currentDuration = 0,
        currentStartDate = startDate,
        finishedDuration = 0;

    function rndDuration(addToTotal = true, resetSum = false) {
      const value = rnd.nextRandom(5) + 2;

      if (addToTotal) {
        blockDuration += value;
      }

      if (resetSum) {
        sumDuration = 0;
      }

      sumDuration += value;
      currentDuration = value;
      return value;
    }

    function nextStartDate(offset = currentDuration) {
      currentStartDate = DateHelper.add(currentStartDate, offset, 'days');
      return currentStartDate;
    }

    function calculateEndDate() {
      return DateHelper.add(currentStartDate, currentDuration, 'days');
    }

    function storePercentDone(children) {
      finishedDuration = 0;

      for (const task of children) {
        finishedDuration += task.duration * task.percentDone;
      }

      return children;
    }

    for (let i = 0; i < count; i++) {
      const blockStartId = currentId,
            block = {
        tasksData: [{
          id: currentId++,
          name: 'Parent ' + blockStartId,
          startDate: nextStartDate(i > 0 ? currentDuration : 0),
          expanded: true,
          inactive: false,
          children: [{
            id: currentId++,
            name: 'Sub-parent ' + getNum(blockStartId, 1),
            startDate: nextStartDate(0),
            expanded: true,
            inactive: false,
            children: storePercentDone([{
              id: currentId++,
              name: 'Task ' + getNum(blockStartId, 11),
              startDate: nextStartDate(0),
              duration: rndDuration(true, true),
              effort: currentDuration,
              effortUnit: 'day',
              endDate: calculateEndDate(),
              percentDone: rnd.nextRandom(100),
              inactive: false
            }, {
              id: currentId++,
              name: 'Task ' + getNum(blockStartId, 12),
              startDate: nextStartDate(),
              duration: rndDuration(),
              effort: currentDuration,
              effortUnit: 'day',
              endDate: calculateEndDate(),
              percentDone: rnd.nextRandom(100),
              inactive: false
            }, {
              id: currentId++,
              name: 'Task ' + getNum(blockStartId, 13),
              startDate: nextStartDate(),
              duration: rndDuration(),
              effort: currentDuration,
              effortUnit: 'day',
              endDate: calculateEndDate(),
              percentDone: rnd.nextRandom(100),
              inactive: false
            }, {
              id: currentId++,
              name: 'Task ' + getNum(blockStartId, 14),
              startDate: nextStartDate(),
              duration: rndDuration(),
              effort: currentDuration,
              effortUnit: 'day',
              endDate: calculateEndDate(),
              percentDone: rnd.nextRandom(100),
              inactive: false
            }]),
            duration: sumDuration,
            effort: sumDuration,
            effortUnit: 'day',
            percentDone: finishedDuration / sumDuration,
            endDate: calculateEndDate()
          }, {
            id: currentId++,
            name: 'Sub-parent ' + getNum(blockStartId, 2),
            startDate: nextStartDate(),
            expanded: true,
            inactive: false,
            children: storePercentDone([{
              id: currentId++,
              name: 'Task ' + getNum(blockStartId, 21),
              startDate: nextStartDate(0),
              duration: rndDuration(true, true),
              effort: currentDuration,
              effortUnit: 'day',
              endDate: calculateEndDate(),
              percentDone: rnd.nextRandom(100),
              inactive: false
            }, {
              id: currentId++,
              name: 'Task ' + getNum(blockStartId, 22),
              startDate: nextStartDate(),
              duration: rndDuration(),
              effort: currentDuration,
              effortUnit: 'day',
              endDate: calculateEndDate(),
              percentDone: rnd.nextRandom(100),
              inactive: false
            }, {
              id: currentId++,
              name: 'Task ' + getNum(blockStartId, 23),
              startDate: nextStartDate(),
              duration: rndDuration(),
              effort: currentDuration,
              effortUnit: 'day',
              endDate: calculateEndDate(),
              percentDone: rnd.nextRandom(100),
              inactive: false
            }]),
            duration: sumDuration,
            effort: sumDuration,
            effortUnit: 'day',
            percentDone: finishedDuration / sumDuration,
            endDate: calculateEndDate()
          }],
          duration: blockDuration,
          effort: blockDuration,
          effortUnit: 'day',
          endDate: calculateEndDate()
        }],
        dependenciesData: [{
          id: dependencyId++,
          fromEvent: blockStartId + 2,
          toEvent: blockStartId + 3
        }, {
          id: dependencyId++,
          fromEvent: blockStartId + 3,
          toEvent: blockStartId + 4
        }, {
          id: dependencyId++,
          fromEvent: blockStartId + 4,
          toEvent: blockStartId + 5
        }, {
          id: dependencyId++,
          fromEvent: blockStartId + 5,
          toEvent: blockStartId + 7
        }, {
          id: dependencyId++,
          fromEvent: blockStartId + 7,
          toEvent: blockStartId + 8
        }, {
          id: dependencyId++,
          fromEvent: blockStartId + 8,
          toEvent: blockStartId + 9
        }],
        taskCount: 10,
        dependencyCount: 5
      };
      const parent = block.tasksData[0],
            subParent1 = parent.children[0],
            subParent2 = parent.children[1];
      parent.percentDone = (subParent1.duration * subParent1.percentDone + subParent2.duration * subParent2.percentDone) / parent.duration;
      projectDuration += blockDuration;
      blockDuration = 0;
      block.projectDuration = projectDuration;

      if (i % projectSize !== 0) {
        block.dependenciesData.push({
          id: dependencyId++,
          fromEvent: blockStartId - 2,
          toEvent: blockStartId + 2,
          type: 2,
          lag: 0,
          lagUnit: 'd'
        });
        block.dependencyCount++;
      } else {
        projectDuration = 0;
      }

      currentId++;
      yield block;
    }
  }

}
ProjectGenerator._$name = 'ProjectGenerator';

const {
  defineParser,
  alt,
  seq,
  string,
  regexp,
  succeed,
  red,
  isSuccess
} = Parser;
/**
 * @module Gantt/util/ResourceAssignmentParser
 */

/**
 * Consumes string while it won't hit [ or , character, value parsed will be trimmed of spaces
 *
 * Example: Maxim Bazhenov [100%] rest -> Maxim Bazhenov
 */

const resourceNamePEG = defineParser(red(regexp('[^\\[\\,]+'), name => ({
  resourceName: name.trim(),
  units: 100,
  match: name
})));
/**
 * Consumes string while it provides numbers or spaces, value parsed them will be filtered of spaces
 * and just compacted number will be used.
 *
 * Example: 12 34 0 rest -> 12340
 */

const integerPEG = defineParser(red(regexp('[0-9\\s]+'), value => ({
  value: value.split(/\s*/).join(''),
  match: value
})));
/**
 * Consumes one character either (decimal separator) '.' or ','
 *
 * Example: , rest -> ,
 */

const decimalSeparatorPEG = defineParser(red(alt(string('.'), string(',')), value => ({
  value,
  match: value
})));
/**
 * Consumes units number which might be given as:
 * - number with integer, decimal separator and fractional parts
 * - decimal separator and fractional part, so integer part will be considered 0
 * - just integer
 * value parsed will be transformed into Number type
 *
 * Example:
 * 10.2 rest -> 10.2
 * .2 rest -> 0.2
 * 100 rest -> 100
 */

const unitsNumberPEG = defineParser(alt(red(seq(() => integerPEG, () => decimalSeparatorPEG, () => integerPEG), (integer, sep, fractional) => ({
  value: Number(`${integer.value}.${fractional.value}`),
  match: [integer.match, sep.match, fractional.match].join('')
})), red(seq(() => decimalSeparatorPEG, () => integerPEG), (sep, fractional) => ({
  value: Number(`0.${fractional.value}`),
  match: [sep.match, fractional.match].join('')
})), red(() => integerPEG, value => ({
  value: Number(`${value.value}`),
  match: value.match
}))));
/**
 * Consumes units with %, strips spaces between units number and % character.
 *
 * Example:
 * 70.5  % rest -> 70.5
 */

const unitsPersentagePEG = defineParser(alt(red(seq(() => unitsNumberPEG, regexp('\\s*\\%')), (units, perc) => ({
  value: units.value,
  match: [units.match, perc].join('')
})), red(() => unitsNumberPEG, units => ({
  value: units.value,
  match: units.match
}))));
/**
 * Consumes units designation string, which should look like [ units with or without % ].
 * Strips spaces before and after [, ] characters.
 *
 * Example:
 * [ 70.2 % ] rest -> 70.2
 */

const unitsDesignationPEG = defineParser(red(seq(regexp('\\s*\\[\\s*'), () => unitsPersentagePEG, regexp('\\s*\\]')), (startSep, units, endSep) => ({
  units: units.value,
  match: [startSep, units.match, endSep].join('')
})));
/**
 * Consumes just single , character stripping spaces before and after
 *
 * Example:
 *     ,     rest -> ,
 */

const commaPEG = defineParser(red(regexp('\\s*,\\s*'), value => ({
  value,
  match: value
})));
/**
 * Consumes resource assignment string which consists of resources assignment entries separated by , character.
 * Each entry contains following parts:
 * - resource name (mandatory)
 * - units designation (optional, default is 100)
 *
 * Example:
 * Maxim Bazhenov, Mats Bryntse [90], Johan Isaksson [50 %] -> Successful parse result
 *
 * See {@link #function-parse} for parse result analysis
 */

const raPEG = defineParser(alt(seq(() => resourceNamePEG, () => unitsDesignationPEG, alt(seq(() => commaPEG, () => raPEG), succeed(''))), seq(() => resourceNamePEG, alt(seq(() => commaPEG, () => raPEG), succeed('')))));
/**
 * Parses resource assignment string into structured set of objects
 *
 * The string format is: `Resource Name [Units%], Other name, ...` where units part is optional as well as % sign
 *
 * @return {Object} Structured information about parsed assignments
 */

const parse = str => {
  let gotSuccess = false,
      result = [],
      rest = '';
  raPEG(str, possibleResult => {
    if (isSuccess(possibleResult)) {
      const [, structuredResult, unstracturedRest] = possibleResult;

      if (structuredResult.length > result.length) {
        result = structuredResult;
        rest = unstracturedRest;
        gotSuccess = true;
      }
    }
  });
  let position = 0;
  return gotSuccess ? {
    rest,
    assignments: result.reduce((result, part) => {
      let currentResource;

      if (typeof part == 'object') {
        if (Object.prototype.hasOwnProperty.call(part, 'resourceName')) {
          currentResource = Object.assign({
            position
          }, part);
          result.push(currentResource);
        } else {
          currentResource = result[result.length - 1];

          if (Object.prototype.hasOwnProperty.call(part, 'units')) {
            currentResource.units = part.units;
          }

          currentResource.match += part.match;
        }

        position += part.match.length;
      }

      return result;
    }, [])
  } : false;
};
/**
 * Composes parsable string from parse result object
 *
 * @param {Object} result Parse result like object
 * @param {Boolean} [exactIfPossible=false] Set to true to compose exactly like it was given to {@link #function-parse} and if parse result reverse composition information is available.
 * @return {String}
 */

const compose = (parseResult, exactIfPossible = false) => {
  let result = '';

  if (parseResult.assignments) {
    result += parseResult.assignments.reduce((str, {
      resourceName,
      units,
      match
    }) => {
      if (match && exactIfPossible) {
        str += match;
      } else {
        str += (str.length ? ', ' : '') + `${resourceName} [${units}%]`;
      }

      return str;
    }, result);
  }

  if (parseResult.rest) {
    result += parseResult.rest;
  }

  if (!exactIfPossible) {
    result = result.trim();
  }

  return result;
};
/**
 * Normalizes the given string by parsing it and recomposing it back thus omitting all optional parts
 *
 * @param {String} str
 * @return {String}
 */

const normalize = str => compose(parse(str));
var ResourceAssignmentParser = {
  parse,
  compose,
  normalize
};

const MIN_DATE = DateHelper.clearTime(new Date(1900, 5, 15)),
      // TODO some early date to safely not intersect w/ some calendar exceptions
taskUnitMap = {
  minute: 3,
  hour: 5,
  day: 7,
  week: 9,
  month: 11
},
      projectUnitMap = {
  minute: 1,
  hour: 2,
  day: 3,
  week: 4,
  month: 5
},
      constraintMap = {
  finishnoearlierthan: 6,
  finishnolaterthan: 7,
  mustfinishon: 3,
  muststarton: 2,
  startnoearlierthan: 4,
  startnolaterthan: 5
},
      typeMap = {
  FixedDuration: 1,
  FixedUnits: 0,
  FixedEffort: 2,
  Normal: 0
},
      dependencyTypeMap = {
  0: 3,
  1: 2,
  2: 1,
  3: 0
};
/**
 * @module Gantt/feature/export/MspExport
 */

/**
 * A feature that allows exporting Gantt to Microsoft Project without involving a server.
 *
 * [Microsoft Project XML specification](https://docs.microsoft.com/en-us/office-project/xml-data-interchange/introduction-to-project-xml-data)
 *
 * This feature supports exporting to an XML format that can be imported by MS Project Professional 2013 / 2019.
 *
 * Here is an example of how to add the feature:
 *
 * ```javascript
 * const gantt = new Gantt({
 *     features : {
 *         mspExport : {
 *             // Choose the filename for the exported file
 *             filename : 'Gantt Export'
 *         }
 *     }
 * });
 * ```
 *
 * And how to trigger an export:
 *
 * ```javascript
 * gantt.features.mspExport.export({
 *     filename : 'Gantt Export'
 * })
 * ```
 *
 * ## Processing of exported data
 *
 * Use the {@link #event-dataCollected} event to process exported data before it is written to the XML-file:
 *
 * ```javascript
 * // set listener on Gantt construction step
 * const gantt = new Gantt({
 *     ---
 *     features : {
 *         mspExport : {
 *             listeners : {
 *                 dataCollected : {{ data }} => {
 *                     // patch <Project><Name> tag content
 *                     data.Name = 'My Cool Project';
 *                 }
 *             }
 *         }
 *     }
 * });
 *
 * // set listener at runtime
 * gantt.features.mspExport.on({
 *     dataCollected : {{ data }} => {
 *         // patch <Project><Name> tag content
 *         data.Name = 'My Cool Project';
 *     }
 * })
 * ```
 *
 * @classtype mspExport
 *
 * @extends Core/mixin/InstancePlugin
 * @feature
 * @demo Gantt/msprojectexport
 */

class MspExport extends InstancePlugin {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "resourceCalendar", new Map());
  }

  static get $name() {
    return 'MspExport';
  }

  /**
   * Generate the export data to generate the XML.
   * @returns {Object} Gantt data on MS Project structure to generate the XML
   * @private
   */
  generateExportData() {
    const me = this;
    return _objectSpread2(_objectSpread2({}, me.getMsProjectConfig()), {}, {
      Calendars: {
        Calendar: me.getCalendarsData()
      },
      Tasks: {
        Task: me.getTasksData()
      },
      Resources: {
        Resource: me.getResourcesData()
      },
      Assignments: {
        Assignment: me.getAssignmentsData()
      }
    });
  }
  /**
   * Generates and downloads the .XML file.
   * @param {Object} [config] Optional configuration object, which overrides the initial settings of the feature/exporter.
   * @param {String} [config.filename] The filename to use
   */

  export(config = {}) {
    const me = this;

    if (me.disabled) {
      return;
    }

    me.resourceCalendar.clear();
    config = ObjectHelper.assign({}, me.config, config);

    if (!config.filename) {
      config.filename = `${me.client.$$name}.xml`;
    }
    /**
     * Fires on the owning Gantt before export starts. Return `false` to cancel the export.
     * @event beforeMspExport
     * @preventable
     * @on-owner
     * @param {Object} config Export config
     */

    if (me.client.trigger('beforeMspExport', {
      config
    }) !== false) {
      const data = me.generateExportData(config);
      /**
       * Fires when project data is collected to an object
       * that is going to be exported as XML text.
       *
       * The event can be used to modify exported data before it is written to the XML-file:
       *
       * ```javascript
       * const gantt = new Gantt({
       *     ---
       *     features : {
       *         mspExport : {
       *             listeners : {
       *                 // listener to process exported data
       *                 dataCollected : {{ data }} => {
       *                     // patch <Project><Name> tag content
       *                     data.Name = 'My Cool Project';
       *                 }
       *             }
       *         }
       *     }
       * });
       * ```
       * @event dataCollected
       * @param {Object} config Export config
       * @param {Object} data Collected data to export
       */

      me.trigger('dataCollected', {
        config,
        data
      });
      const fileContent = me.convertToXml(data),
            eventParams = {
        config,
        data,
        fileContent
      };
      /**
       * Fires on the owning Gantt when project content is exported
       * to XML, before the XML is downloaded by the browser.
       * @event mspExport
       * @on-owner
       * @param {Object} config Export config
       * @param {String} fileContent Exported XML-file content
       */

      me.client.trigger('mspExport', eventParams);
      BrowserHelper.download(config.filename, `data:text/xml;charset=utf-8,${encodeURIComponent(eventParams.fileContent)}`);
    }
  }
  /**
   * Convert Object data to XML.
   * @param {Object} data The Object with data.
   * @returns {String} The XML data.
   * @private
   */

  convertToXml(data) {
    return XMLHelper.convertFromObject(data, {
      rootName: 'Project',
      elementName: '',
      xmlns: 'http://schemas.microsoft.com/project',
      rootElementForArray: false
    });
  }
  /**
   * Get the XML configurations in MS Project format.
   * @returns {Object} MS Project configurations for the XML
   * @private
   */

  getMsProjectConfig() {
    const me = this,
          dateFormat = me.dateFormat,
          {
      project
    } = me.client,
          fileName = me.filename || me.client.$$name;
    return {
      CalendarUID: me.getCalendarUID(project.effectiveCalendar),
      CreationDate: DateHelper.format(new Date(), dateFormat),
      CurrentDate: DateHelper.format(new Date(), dateFormat),
      DaysPerMonth: project.daysPerMonth,
      FinishDate: DateHelper.format(project.endDate, dateFormat),
      MinutesPerDay: project.hoursPerDay * 60,
      MinutesPerWeek: project.daysPerWeek * project.hoursPerDay * 60,
      Name: fileName,
      ScheduleFromStart: project.direction === 'Forward' ? 1 : 0,
      StartDate: DateHelper.format(project.startDate, dateFormat),
      Title: fileName,
      WorkFormat: projectUnitMap[project.effortUnit],
      ProjectExternallyEdited: 1
    };
  }
  /**
   * Format Calendars from Gantt to MS Project format.
   * @returns {Array} Calendars array formatted
   * @private
   */

  getCalendarsData() {
    const me = this,
          {
      calendarManagerStore,
      project
    } = me.client,
          {
      effectiveCalendar
    } = project,
          calendars = calendarManagerStore.allRecords || []; // if project's calendar is not included on calendars array, include it

    if (!calendarManagerStore.getByInternalId(effectiveCalendar.internalId)) {
      calendars.push(effectiveCalendar);
    } // Each resource in MS Project data model has its own calendar
    // so let's make dummy calendars for all resources

    me.client.resources.forEach(resource => {
      const calendar = new resource.effectiveCalendar.constructor({
        name: resource.name
      }); // parent calendar for this dummy will be the real calendar the resource uses

      calendar.parent = resource.effectiveCalendar;
      calendar.isResourceCalendar = true; // remember the resource calendar

      me.resourceCalendar.set(resource, calendar);
      calendars.push(calendar);
    });
    return calendars.map(calendar => ({
      // MS Project does not support calendars hierarchy fully
      // it has two level hierarchy:
      // - first level - so called base calendars
      // - second level - any other calendars (including resource calendars) that extend the base ones
      BaseCalendarUID: calendar.isResourceCalendar ? me.getCalendarUID(calendar.parent, 0) : 0,
      // all non-dummy calendars we import as base calendars (the one that can be extended in MSP)
      IsBaseCalendar: !calendar.isResourceCalendar,
      Name: `${calendar.name || calendar.internalId} - imported`,
      UID: me.getCalendarUID(calendar),
      WeekDays: {
        WeekDay: me.formatWeekDays(calendar)
      } //,
      // TODO
      // WorkWeeks : {
      //     WorkWeek : this.formatWorkWeeks(calendar)
      // }

    }));
  }
  /**
   * Format intervals to MS project format for the WeekDays property.
   * @param {Array} Array of intervals data.
   * @returns {Array} Array with data formatted
   * @private
   */

  formatWeekDays(calendar) {
    const {
      timeFormat
    } = this,
          ticks = [],
          daysData = {};
    let startDate = MIN_DATE,
        endDate;

    for (let i = 0; i < 7; i++) {
      // week day index
      const day = startDate.getDay();
      daysData[day] = {
        DayType: day + 1,
        DayWorking: 0
      };
      endDate = DateHelper.clearTime(DateHelper.add(startDate, 1, 'day'));
      ticks.push({
        startDate,
        endDate
      }); // proceed to next day

      startDate = endDate;
    }

    const // dummy calendar with 7 day borders ..to force forEachAvailabilityInterval to stop on each day start
    dummyCalendar = new calendar.constructor({
      intervals: ticks
    }),
          calendarsCombination = this.client.project.combineCalendars([calendar, dummyCalendar]);
    calendarsCombination.forEachAvailabilityInterval({
      startDate: MIN_DATE,
      endDate
    }, (startDate, endDate, calendarCacheInterval) => {
      const calendarsStatus = calendarCacheInterval.getCalendarsWorkStatus(),
            dayData = daysData[startDate.getDay()]; // if the calendar has working interval for that period

      if (calendarsStatus.get(calendar)) {
        // consider the day as working
        dayData.DayWorking = 1;
        dayData.WorkingTimes = dayData.WorkingTimes || {
          WorkingTime: []
        }; // put that time range

        dayData.WorkingTimes.WorkingTime.push({
          FromTime: DateHelper.format(startDate, timeFormat),
          ToTime: DateHelper.format(endDate, timeFormat)
        });
      }
    });
    return Object.values(daysData);
  }
  /**
   * Format intervals to MS project format for the WorkWeeks property.
   * @param {Array} Array of intervals data.
   * @returns {Array} Array with data formatted
   * @private
   */
  // formatWorkWeeks(calendar) {
  //     // TODO: implement
  // }

  collectProjectTasks(project = this.client.project) {
    const result = [];
    project.taskStore.rootNode.traverse(node => result.push(node), true);
    return result;
  }
  /**
   * Format Tasks from Gantt to MS Project format.
   * @returns {Array} Tasks array formatted
   * @private
   */

  getTasksData() {
    const me = this,
          {
      dateFormat
    } = me,
          {
      project
    } = me.client,
          tasks = me.collectProjectTasks(project);
    return tasks.map(task => {
      const {
        startDate,
        endDate,
        wbsCode
      } = task,
            // filter out broken dependencies
      predecessors = task.predecessors.filter(({
        fromEvent
      }) => fromEvent),
            durationMs = project.convertDuration(task.duration, task.durationUnit, 'millisecond'),
            effortMs = project.convertDuration(task.effort, task.effortUnit, 'millisecond'),
            actualDurationMs = task.percentDone * 0.01 * durationMs,
            startDateStr = DateHelper.format(startDate, dateFormat),
            endDateStr = DateHelper.format(endDate, dateFormat),
            durationStr = me.convertDurationToMspDuration(durationMs, 'ms'),
            result = {
        IsNull: startDate && endDate ? 0 : 1,
        ActualDuration: me.convertDurationToMspDuration(actualDurationMs, 'ms'),
        Duration: durationStr,
        DurationFormat: taskUnitMap[task.durationUnit],
        EarlyFinish: DateHelper.format(task.earlyEndDate, dateFormat),
        EarlyStart: DateHelper.format(task.earlyStartDate, dateFormat),
        EffortDriven: task.effortDriven ? 1 : 0,
        Estimated: 0,
        Finish: endDateStr,
        LateFinish: DateHelper.format(task.lateEndDate, dateFormat),
        LateStart: DateHelper.format(task.lateStartDate, dateFormat),
        Manual: task.manuallyScheduled ? 1 : 0,
        ManualDuration: durationStr,
        ManualFinish: endDateStr,
        ManualStart: startDateStr,
        Milestone: task.isMilestone ? 1 : 0,
        Name: task.name,
        OutlineLevel: wbsCode.split('.').length,
        OutlineNumber: wbsCode,
        PercentComplete: Math.round(task.percentDone),
        PredecessorLink: predecessors.map(predecessor => ({
          LagFormat: taskUnitMap[predecessor.lagUnit],
          LinkLag: project.convertDuration(predecessor.lag, predecessor.lagUnit, 'minute') * 10,
          PredecessorUID: me.getTaskUID(predecessor.fromEvent),
          Type: dependencyTypeMap[predecessor.type]
        })),
        Baseline: task.baselines.map((baseline, index) => ({
          Number: index,
          Finish: DateHelper.format(baseline.endDate, dateFormat),
          Start: DateHelper.format(baseline.startDate, dateFormat),
          Duration: me.convertDurationToMspDuration(baseline.duration, baseline.durationUnit)
        })),
        RemainingDuration: me.convertDurationToMspDuration(durationMs - actualDurationMs, 'ms'),
        Rollup: task.rollup ? 1 : 0,
        Start: startDateStr,
        Summary: task.isLeaf ? 0 : 1,
        TotalSlack: task.totalSlack,
        Type: task.isLeaf ? typeMap[task.schedulingMode] : 1,
        UID: me.getTaskUID(task),
        WBS: wbsCode,
        Work: me.convertDurationToMspDuration(effortMs, 'ms')
      };

      if (task.constraintType) {
        result.ConstraintDate = DateHelper.format(task.constraintDate, dateFormat);
        result.ConstraintType = constraintMap[task.constraintType];
      }

      if (task.deadlineDate) {
        result.Deadline = DateHelper.format(task.deadlineDate, dateFormat);
      }

      if (task.calendar) {
        result.CalendarUID = me.getCalendarUID(task.calendar, 0);
      }

      if (task.note) {
        result.Notes = task.note;
      }

      return result;
    });
  }

  getTaskUID(task) {
    return task.internalId;
  }

  getCalendarUID(calendar, fallbackValue = -1) {
    return calendar && !calendar.isRoot ? calendar.internalId : fallbackValue;
  }
  /**
   * Format Resources from Gantt to MS Project format.
   * @returns {Array} Resources array formatted
   * @private
   */

  getResourcesData() {
    return this.client.resources.map(resource => ({
      // seems for version 2013 setting the calendar id it breaks so only Project level calendar is importable
      CalendarUID: this.msProjectVersion === 2013 ? null : this.getCalendarUID(this.resourceCalendar.get(resource)),
      Name: resource.name,
      UID: resource.internalId,
      Type: 1
    }));
  }
  /**
   * Format Assignments from Gantt to MS Project format.
   * @returns {Array} Assignments array formatted
   * @private
   */

  getAssignmentsData() {
    // for version 2013 the assignments doesn't work
    if (this.msProjectVersion === 2013) {
      return [];
    }

    return this.client.assignments.map(assignment => ({
      Finish: DateHelper.format(assignment.event.endDate, this.dateFormat),
      // TODO it seems we need to provide effort per assignment value ..there is no ready to use field for that yet
      // PercentWorkComplete : Math.round(event.percentDone),
      ResourceUID: assignment.resource.internalId,
      Start: DateHelper.format(assignment.event.startDate, this.dateFormat),
      TaskUID: this.getTaskUID(assignment.event),
      UID: assignment.internalId,
      Units: assignment.units / 100
    }));
  }
  /**
   * Convert to MS Project Span Date Time format.
   * @param {Number} value The value to be converted.
   * @param {String} unit The unit of the value to be converted
   * @returns {String} The value formatted to "PTnHnMnS". E.g: PT10H30M, PT6H20M13S
   * @private
   */

  convertDurationToMspDuration(value, unit) {
    if (value == null) {
      return '';
    }

    const delta = DateHelper.getDelta(DateHelper.as('ms', value, unit), {
      abbrev: true
    }),
          {
      w: weeks,
      min: mins,
      s: secs
    } = delta;
    let {
      yr: years,
      mon: months,
      d: days,
      h: hours
    } = delta;
    hours = hours || 0; // convert years, months, weeks and days to hours because MS Project work only with hours, minutes and seconds

    if (years) {
      hours += DateHelper.as('h', years, 'y');
    }

    if (months) {
      hours += DateHelper.as('h', months, 'month');
    }

    if (weeks) {
      hours += DateHelper.as('h', weeks, 'w');
    }

    if (days) {
      hours += DateHelper.as('h', days, 'd');
    }

    return `PT${hours}H${mins || 0}M${secs || 0}S`;
  }

}

_defineProperty(MspExport, "configurable", {
  /**
   * Name of the exported file (including extension)
   * @config {String}
   * @default
   */
  filename: null,

  /**
   * Defines how dates are formatted for MS Project. Information about formats can be found in {@link Core.helper.DateHelper}
   * @config {String}
   * @default
   */
  dateFormat: 'YYYY-MM-DDTHH:mm:ss',

  /**
   * Defines how time is formatted for MSProject. Information about formats can be found in {@link Core.helper.DateHelper}
   * @config {String}
   * @default
   */
  timeFormat: 'HH:mm:ss',

  /**
   * Defines the version used for MSProject (2013 or 2019)
   * @config {Number}
   * @default
   */
  msProjectVersion: 2019
});

MspExport._$name = 'MspExport';
GridFeatureManager.registerFeature(MspExport, false, 'Gantt');

/**
 * @module Gantt/view/mixin/GanttDom
 */

const hyphenRe = /-/g;
/**
 * Mixin with TaskModel <-> HTMLElement mapping functions
 *
 * @mixin
 */

var GanttDom = (Target => class GanttDom extends (Target || Base) {
  static get $name() {
    return 'GanttDom';
  } // Alias for resolveTaskRecord method to satisfy the scheduler naming requirements.

  resolveEventRecord(element) {
    return this.resolveTaskRecord(element);
  }
  /**
   * Returns the task record for a DOM element
   * @param {HTMLElement} element The DOM node to lookup
   * @return {Gantt.model.TaskModel} The task record
   */

  resolveTaskRecord(element) {
    const eventElement = DomHelper.up(element, this.eventSelector);
    return eventElement ? this.taskStore.getById(eventElement.dataset.taskId) : this.getRecordFromElement(element);
  }
  /**
   * Relays keydown events as taskkeydown if we have a selected task(s).
   * @private
   */

  onElementKeyDown(event) {
    const taskRecord = this.resolveTaskRecord(event.target);
    super.onElementKeyDown(event);

    if (taskRecord) {
      this.trigger('taskKeyDown', {
        taskRecord,
        event
      });
    }
  }
  /**
   * Relays keyup events as taskkeyup if we have a selected task(s).
   * @private
   */

  onElementKeyUp(event) {
    const taskRecord = this.resolveTaskRecord(event.target);
    super.onElementKeyUp(event);

    if (taskRecord) {
      this.trigger('taskKeyUp', {
        taskRecord,
        event
      });
    }
  }
  /**
   * Returns the HTMLElement representing a task record.
   *
   * @param {Gantt.model.TaskModel} taskRecord A task record
   * @param {Boolean} [inner] Specify `false` to return the task wrapper element
   *
   * @return {HTMLElement} The element representing the task record
   */

  getElementFromTaskRecord(taskRecord, inner = true) {
    return this.taskRendering.getElementFromTaskRecord(taskRecord, inner);
  } // alias to make scheduler features applied to Gantt happy
  // TODO: since we have decided to call tasks events then the method
  //       being aliased should be renamed

  getElementFromEventRecord(eventRecord) {
    return this.getElementFromTaskRecord(eventRecord);
  }
  /**
   * Generates the element `id` for an event element. This is used when
   * recycling an event div which has been moved from one resource to
   * another. The event is assigned its new render id *before* being
   * returned to the free pool, so that when the render engine requests
   * a div from the free pool, the same div will be returned and it will
   * smoothly transition to its new position.
   * @param {Scheduler.model.EventModel} eventRecord
   * @param {Scheduler.model.ResourceModel} resourceRecord
   * @private
   */

  getEventRenderId(taskRecord) {
    // TODO: use DomHelper.makeValidId or StringHelper.createId. Cannot currently since they strip out ids that only contains numbers
    return `${this.id.toString().replace(hyphenRe, '_')}-${taskRecord.id}`;
  }
  /**
   * In Gantt, the task is the row, so it's valid to resolve a mouse event on a task to the TimeAxisColumn's cell.
   *
   * This method find the cell location of the passed event. It returns an object describing the cell.
   * @param {Event} event A Mouse, Pointer or Touch event targeted at part of the grid.
   * @returns {Object} An object containing the following properties:
   * - `cellElement` - The cell element clicked on.
   * - `columnId` - The `id` of the column clicked under.
   * - `record` - The {@link Core.data.Model record} clicked on.
   * - `id` - The `id` of the {@link Core.data.Model record} clicked on.
   * @private
   * @category Events
   */

  getEventData(event) {
    const me = this,
          record = me.resolveTimeSpanRecord(event.target); // If the event was on a task, then we're in one of the the TimeAxisColumn's cells.

    if (record) {
      const cellElement = me.getCell({
        record,
        column: me.timeAxisColumn
      }),
            cellData = DomDataStore.get(cellElement),
            id = cellData.id,
            columnId = cellData.columnId;
      return {
        cellElement,
        cellData,
        columnId,
        id,
        record,
        cellSelector: {
          id,
          columnId
        }
      };
    } else {
      return super.getEventData(event);
    }
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module Gantt/view/mixin/GanttRegions
 */

/**
 * Functions to get regions (bounding boxes) for gantt, tasks etc.
 *
 * @mixin
 */

var GanttRegions = (Target => class GanttRegions extends (Target || Base) {
  static get $name() {
    return 'GanttRegions';
  }
  /**
   * Gets the region represented by the timeline and optionally only for a single task
   * @param {Gantt.model.TaskModel} taskRecord (optional) The task record
   * @return {Core.helper.util.Rectangle} The region of the schedule
   */

  getScheduleRegion(taskRecord, local = true, dateConstraints) {
    var _dateConstraints;

    const me = this,
          element = me.timeAxisSubGridElement;
    let region;

    if (taskRecord) {
      const taskElement = me.getElementFromTaskRecord(taskRecord);
      region = Rectangle.from(me.getRowById(taskRecord.id).getElement('normal'));

      if (taskElement) {
        const taskRegion = Rectangle.from(taskElement, element);
        region.y = taskRegion.y;
        region.bottom = taskRegion.bottom;
      } else {
        region.y = region.y + me.barMargin;
        region.bottom = region.bottom - me.barMargin;
      }
    } else {
      // TODO: This is what the function that was removed here did.
      // The coordinate space needs to be sorted out here!
      region = Rectangle.from(element).moveTo(null, 0);
      region.width = element.scrollWidth;
      region.y = region.y + me.barMargin;
      region.bottom = region.bottom - me.barMargin;
    }

    const taStart = me.timeAxis.startDate,
          taEnd = me.timeAxis.endDate;

    if (!((_dateConstraints = dateConstraints) !== null && _dateConstraints !== void 0 && _dateConstraints.start)) {
      var _me$getDateConstraint;

      dateConstraints = ((_me$getDateConstraint = me.getDateConstraints) === null || _me$getDateConstraint === void 0 ? void 0 : _me$getDateConstraint.call(me, taskRecord)) || {
        start: taStart,
        end: taEnd
      };
    }

    let startX = me.getCoordinateFromDate(DateHelper.max(taStart, dateConstraints.start)),
        endX = me.getCoordinateFromDate(DateHelper.min(taEnd, dateConstraints.end));

    if (!local) {
      startX = me.translateToPageCoordinate(startX);
      endX = me.translateToPageCoordinate(endX);
    }

    region.x = Math.min(startX, endX);
    region.width = Math.max(startX, endX) - Math.min(startX, endX);
    return region;
  }

  translateToPageCoordinate(x) {
    const element = this.timeAxisSubGridElement;
    return x + element.getBoundingClientRect().left - element.scrollLeft;
  } // Decide if a record is inside a collapsed tree node, or inside a collapsed group (using grouping feature)

  isRowVisible(taskRecord) {
    // records in collapsed groups/branches etc are removed from processedRecords
    return this.store.indexOf(taskRecord) >= 0;
  }
  /**
   * Get the region for a specified task
   * @param {Gantt.model.TaskModel} taskRecord
   * @param {Boolean} [includeOutside]
   * @param {Boolean} [inner] Specify true to return the box for the task bar within the wrapper.
   * @returns {Core.helper.util.Rectangle}
   */

  getTaskBox(taskRecord, includeOutside = false, inner = false) {
    return this.taskRendering.getTaskBox(...arguments);
  }

  getSizeAndPosition() {
    return this.taskRendering.getSizeAndPosition(...arguments);
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module Gantt/view/mixin/GanttScroll
 */

const defaultScrollOptions = {
  block: 'nearest',
  edgeOffset: 20
};
/**
 * Functions for scrolling to tasks, dates etc.
 *
 * @mixin
 */

var GanttScroll = (Target => class GanttScroll extends (Target || Base) {
  static get $name() {
    return 'GanttScroll';
  }
  /**
   * Scrolls a task record into the viewport.
   *
   * @param {Gantt.model.TaskModel} taskRecord The task record to scroll into view
   * @param {Object} [options] How to scroll.
   * @param {String} [options.block=nearest] How far to scroll the task: `start/end/center/nearest`.
   * @param {Number} [options.edgeOffset=20] edgeOffset A margin *in pixels* around the task to bring into view.
   * @param {Boolean|Number} [options.animate] Set to `true` to animate the scroll, or the number of milliseconds to animate over.
   * @param {Boolean} [options.highlight] Set to `true` to highlight the task element when it is in view.
   * @param {Boolean} [options.focus] Set to `true` to focus the task element when it is in view.
   * @returns {Promise} A Promise which resolves when the scrolling is complete.
   */

  scrollTaskIntoView(taskRecord, options = defaultScrollOptions) {
    let taskStart = taskRecord.startDate,
        taskEnd = taskRecord.endDate;
    const me = this;

    if (options.edgeOffset == null) {
      options.edgeOffset = 20;
    }

    if (!taskRecord.isScheduled) {
      return this.scrollRowIntoView(taskRecord, options);
    }

    if (me.timeAxisSubGrid.collapsed) {
      return;
    }

    taskStart = taskStart || taskEnd;
    taskEnd = taskEnd || taskStart;
    const taskIsOutside = taskStart < me.timeAxis.startDate | (taskEnd > me.timeAxis.endDate) << 1; // Make sure task is within TimeAxis time span unless extendTimeAxis passed as false.
    // The TaskEdit feature passes false because it must not mutate the TimeAxis.
    // Bitwise flag:
    //  1 === start is before TimeAxis start.
    //  2 === end is after TimeAxis end.

    if (taskIsOutside && options.extendTimeAxis !== false) {
      const currentTimeSpanRange = me.timeAxis.endDate - me.timeAxis.startDate;
      let startAnchorPoint, endAnchorPoint; // Event is too wide, expand the range to encompass it.

      if (taskIsOutside === 3) {
        me.timeAxis.setTimeSpan(new Date(taskStart.valueOf() - currentTimeSpanRange / 2), new Date(taskEnd.getTime() + currentTimeSpanRange / 2));
      } // Event is partially or wholly outside but will fit.
      // Move the TimeAxis to include it. Attempt to maintain visual position.
      else {
        startAnchorPoint = me.getCoordinateFromDate(taskIsOutside & 1 ? taskEnd : taskStart); // Event starts before

        if (taskIsOutside & 1) {
          me.timeAxis.setTimeSpan(new Date(taskStart), new Date(taskStart.valueOf() + currentTimeSpanRange));
        } // Event ends after
        else {
          me.timeAxis.setTimeSpan(new Date(taskEnd.valueOf() - currentTimeSpanRange), new Date(taskEnd));
        } // Restore view to same relative scroll position.

        endAnchorPoint = taskIsOutside & 1 ? me.getCoordinateFromDate(taskEnd) : me.getCoordinateFromDate(taskStart);
        me.timeAxisSubGrid.scrollable.scrollBy(endAnchorPoint - startAnchorPoint);
      }
    } // Establishing element to scroll to

    const el = me.getElementFromTaskRecord(taskRecord);

    if (el) {
      const scroller = me.timeAxisSubGrid.scrollable; // Scroll into view with animation and highlighting if needed.
      // Mute scroll events during the scroll so that event rendering doesn't replace
      // the target element.

      return scroller.scrollIntoView(el, ObjectHelper.assign({
        silent: true
      }, options));
    } else {
      // Event not rendered, scroll to calculated location
      return me.scrollUnrenderedTaskIntoView(taskRecord, options);
    }
  }
  /**
   * Scrolls an unrendered task into view. Internal function used from #scrollTaskIntoView.
   * @private
   */

  scrollUnrenderedTaskIntoView(taskRec, options = defaultScrollOptions) {
    if (options.edgeOffset == null) {
      options.edgeOffset = 20;
    }

    const me = this,
          scroller = me.timeAxisSubGrid.scrollable,
          box = me.getTaskBox(taskRec),
          scrollerViewport = scroller.viewport,
          targetRect = box.translate(scrollerViewport.x - scroller.x, scrollerViewport.y - scroller.y);
    let result = scroller.scrollIntoView(targetRect, Object.assign({}, options, {
      highlight: false
    }));

    if (options.highlight || options.focus) {
      const detacher = me.on({
        renderTask({
          taskRecord,
          element
        }) {
          if (taskRecord === taskRec) {
            detacher();
            result = result.then(() => {
              options.highlight && DomHelper.highlight(element);
              options.focus && element.focus();
            });
          }
        }

      });
    } else {
      // Task is painter asynchronously after scroll, need to wait for corresponding event from the view
      result = Promise.all([result, new Promise(resolve => {
        const detacher = me.on({
          renderTask({
            taskRecord
          }) {
            if (taskRecord === taskRec) {
              detacher();
              resolve();
            }
          }

        });
      })]);
    }

    return result;
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module Gantt/view/mixin/GanttState
 */

/**
 * Mixin for Gantt that handles state. It serializes the following gantt properties:
 *
 * * barMargin
 * * tickSize
 * * zoomLevel
 *
 * See {@link Grid.view.mixin.GridState} and {@link Core.mixin.State} for more information on state.
 *
 * @mixin
 */

var GanttState = (Target => class GanttState extends (Target || Base) {
  static get $name() {
    return 'GanttState';
  }

  updateProject(project, old) {
    super.updateProject(project, old);
    this.detachListeners('suspendStateDuringDelayedCalculation'); // Delay calculation code path involves changing readOnly of the Gantt panel. This will also
    // trigger state change, we don't need that. So we pause `triggerUpdate` listener to not trigger `stateChange`

    if (project !== null && project !== void 0 && project.delayCalculation) {
      project.on({
        name: 'suspendStateDuringDelayedCalculation',
        delayCalculationStart: {
          fn: 'suspendStateListener',
          prio: 10
        },
        delayCalculationEnd: {
          fn: 'resumeStateListener',
          prio: -10
        },
        thisObj: this
      });
    }
  }

  suspendStateListener() {
    this.stateListenerSuspended = (this.stateListenerSuspended || 0) + 1;
  }

  resumeStateListener() {
    const me = this;
    me.stateListenerSuspended = (me.stateListenerSuspended || 1) - 1;

    if (!me.stateListenerSuspended && me.isSaveStatePending) {
      me.saveState({
        immediate: true
      });
    }
  }

  saveState(...args) {
    if (!this.stateListenerSuspended) {
      super.saveState(...args);
    }
  }
  /**
   * Gets or sets gantt's state. Check out {@link Gantt.view.mixin.GanttState GanttState} mixin for details.
   * @member {Object} state
   * @category State
   */

  /**
   * Apply previously stored state.
   * @param {Object} state
   * @private
   */

  applyState(state) {
    var _state$store, _state$store2;

    // Applying sorters too early might lead to unexpected results if fields in the incoming dataset will be changed
    // after initial commit
    // state.store might be undefined if responsive level is being applied
    if (!this.project.isInitialCommitPerformed && ((_state$store = state.store) !== null && _state$store !== void 0 && _state$store.sorters || (_state$store2 = state.store) !== null && _state$store2 !== void 0 && _state$store2.filters)) {
      const storeState = state.store;
      this.project.commitAsync().then(() => {
        if (!this.isDestroyed) {
          this.store.state = storeState;
        }
      });
      delete state.store;
    } // Restoring selected cell and records during startup attempts to access task DOM elements which are not yet
    // rendered. So we filter out these props and apply them in onPaint handler

    const specialKeys = ['selectedCell', 'selectedRecords'];

    if (specialKeys.some(key => key in state)) {
      const subState = {}; // Copy special keys to a partial state object to apply later

      specialKeys.forEach(key => {
        if (key in state) {
          subState[key] = state[key];
          delete state[key];
        }
      }); // Create fixer method that will apply state after

      this._applyStateAfterPaint = () => {
        this._applyStateAfterPaint = null;
        this.suspendRefresh();
        Object.keys(subState).forEach(key => this[key] = subState[key]);
        this.resumeRefresh(true);
      };
    }

    super.applyState(state);
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

  onPaint(...args) {
    super.onPaint(...args);
    const me = this;

    if (me._applyStateAfterPaint) {
      if (!me.project.isInitialCommitPerformed) {
        me.project.on({
          commitFinalized() {
            me._applyStateAfterPaint();
          },

          thisObj: me,
          once: true
        });
      } else {
        me._applyStateAfterPaint();
      }
    }
  }

});

/**
 * @module Gantt/view/mixin/GanttStores
 */

/**
 * Functions for store assignment and store event listeners.
 * Properties are aliases to corresponding
 * ones of Gantt's {@link Gantt.model.ProjectModel project} instance.
 *
 * @mixin
 */

var GanttStores = (Target => class GanttStores extends ProjectConsumer(Target || Base) {
  static get $name() {
    return 'GanttStores';
  } // This is the static definition of the Stores we consume from the project, and
  // which we must provide *TO* the project if we or our CrudManager is configured
  // with them.
  // The property name is the store name, and within that there is the dataname which
  // is the property which provides static data definition. And there is a listeners
  // definition which specifies the listeners *on this object* for each store.
  //
  // To process incoming stores, implement an updateXxxxxStore method such
  // as `updateEventStore(eventStore)`.
  //
  // To process an incoming Project implement `updateProject`. __Note that
  // `super.updateProject(...arguments)` must be called first.__

  static get projectStores() {
    return {
      calendarManagerStore: {},
      resourceStore: {
        dataName: 'resources'
      },
      eventStore: {
        dataName: 'events'
      },
      dependencyStore: {
        dataName: 'dependencies'
      },
      assignmentStore: {
        dataName: 'assignments'
      }
    };
  }

  static get configurable() {
    return {
      // Overridden. ProjectConsumer defaults to Scheduler's ProjectModel
      projectModelClass: ProjectModel,

      /**
       * Inline tasks, will be loaded into an internally created TaskStore.
       * @config {Gantt.model.TaskModel[]|Object[]}
       * @category Data
       */
      tasks: null,

      /**
       * The {@link Gantt.data.TaskStore} holding the tasks to be rendered into the Gantt.
       * @config {Gantt.data.TaskStore}
       * @category Data
       */
      taskStore: null
    };
  }

  updateProject(project, oldProject) {
    super.updateProject(project, oldProject);
    this.detachListeners('ganttStores');
    this.bindCrudManager(project);

    if (project) {
      project.on({
        name: 'ganttStores',
        startApplyResponse: 'onProjectStartApplyResponse',
        refresh: 'internalOnProjectRefresh',
        thisObj: this
      });
    }
  }

  get replica() {
    return this.project.replica;
  }

  onProjectStartApplyResponse() {
    if (!this.isPainted) {
      return;
    }

    this.suspendRefresh();
    this.$suspendedByResponse = true;
  }

  internalOnProjectRefresh({
    isInitialCommit,
    isCalculated
  }) {
    const me = this,
          {
      project
    } = me;

    if (!me.isPainted) {
      return;
    }

    if (!me.appliedViewStartDate && !('startDate' in me.initialConfig) && project.startDate) {
      var _me$visibleDate;

      const requestedVisibleDate = ((_me$visibleDate = me.visibleDate) === null || _me$visibleDate === void 0 ? void 0 : _me$visibleDate.date) || me.visibleDate,
            {
        startDate,
        endDate
      } = project,
            min = requestedVisibleDate ? DateHelper.min(startDate, requestedVisibleDate) : startDate,
            max = requestedVisibleDate ? DateHelper.max(endDate, requestedVisibleDate) : endDate; // if managed to calculated start/end dates

      if (min && max) {
        me.setTimeSpan(min, max, {
          visibleDate: me.visibleDate
        });
        me.appliedViewStartDate = true;
      }
    }

    if (!me.suspendRendering) {
      if (me.$suspendedByResponse) {
        me.resumeRefresh(true);
        me.$suspendedByResponse = false;
      } // Transition all refreshes except the initial one or any used for early rendering
      else if (!isInitialCommit && isCalculated) {
        me.refreshWithTransition();
      } // No transition on initial refresh, nothing to transition and don't want to delay dependency drawing more
      // than necessary
      else {
        me.refresh();
      }

      me.trigger('projectRefresh', {
        isInitialCommit,
        isCalculated
      });
    }
  } //endregion
  //region Inline data
  //region Store & model docs
  // Configs

  /**
   * Inline resources, will be loaded into the backing project's ResourceStore.
   * @config {Gantt.model.ResourceModel[]|Object[]} resources
   * @category Data
   */

  /**
   * Inline assignments, will be loaded into the backing project's AssignmentStore.
   * @config {Gantt.model.AssignmentModel[]|Object[]} assignments
   * @category Data
   */

  /**
   * Inline dependencies, will be loaded into the backing project's DependencyStore.
   * @config {Gantt.model.DependencyModel[]|Object[]} dependencies
   * @category Data
   */

  /**
   * Inline time ranges, will be loaded into the backing project's time range store.
   * @config {Scheduler.model.TimeSpan[]|Object[]} timeRanges
   * @category Data
   */

  /**
   * Inline calendars, will be loaded into the backing project's CalendarManagerStore.
   * @config {Gantt.model.CalendarModel[]|Object[]} calendars
   * @category Data
   */
  // Properties

  /**
   * Get/set resources, applies to the backing project's ResourceStore.
   * @member {Gantt.model.ResourceModel[]} resources
   * @accepts {Gantt.model.ResourceModel[]|Object[]}
   * @category Data
   */

  /**
   * Get/set assignments, applies to the backing project's AssignmentStore.
   * @member {Gantt.model.AssignmentModel[]} assignments
   * @accepts {Gantt.model.AssignmentModel[]|Object[]}
   * @category Data
   */

  /**
   * Get/set dependencies, applies to the backing projects DependencyStore.
   * @member {Gantt.model.DependencyModel[]} dependencies
   * @accepts {Gantt.model.DependencyModel[]|Object[]}
   * @category Data
   */

  /**
   * Get/set time ranges, applies to the backing project's TimeRangeStore.
   * @member {Scheduler.model.TimeSpan[]} timeRanges
   * @accepts {Scheduler.model.TimeSpan[]|Object[]}
   * @category Data
   */

  /**
   * Get/set calendars, applies to the backing projects CalendarManagerStore.
   * @member {Gantt.model.CalendarModel[]} calendars
   * @accepts {Gantt.model.CalendarModel[]|Object[]}
   * @category Data
   */
  //endregion

  get timeRanges() {
    return this.project.timeRanges;
  }

  set timeRanges(timeRanges) {
    this.project.timeRanges = timeRanges;
  }

  get calendars() {
    return this.project.calendars;
  }

  set calendars(calendars) {
    this.project.calendars = calendars;
  } //endregion
  //region TaskStore

  /**
   * Get/set tasks, applies to the backing project's EventStore.
   * @property {Gantt.model.TaskModel[]|Object[]}
   * @category Data
   */

  get tasks() {
    return this.project.eventStore.records;
  }

  changeTasks(tasks) {
    const {
      project
    } = this;

    if (this.buildingProjectConfig) {
      // Set the property in the project config object.
      project.eventsData = tasks;
    } else {
      // Live update the project when in use.
      project.eventStore.data = tasks;
    }
  }
  /**
   * Get/set the task store instance of the backing project.
   * @member {Gantt.data.TaskStore} taskStore
   * @category Data
   */

  changeTaskStore(taskStore) {
    const {
      project
    } = this;

    if (this.buildingProjectConfig) {
      // Set the property in the project config object.
      // Must not go through the updater. It's too early to
      // inform host of store change.
      project.eventStore = taskStore;
      return;
    } // Live update the project when in use.

    if (!this.initializingProject) {
      if (project.eventStore !== taskStore) {
        project.setEventStore(taskStore);
        taskStore = project.eventStore;
      }
    }

    return taskStore;
  }

  updateEventStore(eventStore) {
    const me = this;
    eventStore.metaMapId = me.id; // taskStore is used for rows (store) and tasks

    me.taskStore = me.store = me.timeAxisViewModel.store = eventStore;
    me.currentOrientation.bindTaskStore(eventStore); // Occasionally we need to track batched changes.
    // TaskResize requires this as it changes the endDate with task batched.

    eventStore.detachListeners('eventStoreBatchedUpdateListener');
    eventStore.on({
      name: 'eventStoreBatchedUpdateListener',
      batchedUpdate: 'onEventStoreBatchedUpdate',
      thisObj: me
    });
  }
  /**
   * Listener to the batchedUpdate event which fires when a field is changed on a record which
   * is batch updating. Occasionally UIs must keep in sync with batched changes.
   * For example, the TaskResize feature performs batched updating of the startDate/endDate
   * and it tells its client to listen to batchedUpdate.
   * @private
   */

  onEventStoreBatchedUpdate(event) {
    if (this.listenToBatchedUpdates) {
      const wasEnabled = this.enableEventAnimations; // This pathway is used from TaskResize during dragging, so we do not
      // want the size animating. It should follow the pointer in real time.

      this.enableEventAnimations = false;
      this.onStoreUpdateRecord(event);
      this.enableEventAnimations = wasEnabled;
    }
  } //endregion
  //region Internal
  // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {} //endregion

});

/**
 * @module Gantt/view/mixin/GanttTimelineDateMapper
 */

var GanttTimelineDateMapper = (Target => class GanttTimelineDateMapper extends (Target || Base) {
  static get $name() {
    return 'GanttTimelineDateMapper';
  }
  /**
   * Method to get a displayed end date value, see {@link Gantt/view/mixin/GanttTimelineDateMapper#function-getFormattedEndDate} for more info.
   * @private
   * @param {Date} endDate The date to format
   * @param {Date} startDate The start date
   * @return {Date} The date value to display
   */

  getDisplayEndDate(endDate, startDate) {
    return endDate;
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module Gantt/view/mixin/TaskNavigation
 */

const animate100 = {
  animate: 100
};
/**
 * Mixin that tracks event or assignment selection by clicking on one or more events in the scheduler.
 * @mixin
 */

var TaskNavigation = (Target => class TaskNavigation extends (Target || Base) {
  static get $name() {
    return 'TaskNavigation';
  }

  static get defaultConfig() {
    return {
      navigator: {
        inlineFlow: false,
        prevKey: 'ArrowUp',
        nextKey: 'ArrowDown',
        keys: {
          Enter: 'onTaskEnterKey'
        }
      },
      isNavigationKey: {
        ArrowDown: 1,
        ArrowUp: 1,
        ArrowLeft: 0,
        ArrowRight: 0
      }
    };
  }

  processEvent(event) {
    const me = this,
          eventElement = DomHelper.up(event.target, me.eventSelector);

    if (!me.navigator.disabled && eventElement) {
      event.taskRecord = event.eventRecord = me.resolveTaskRecord(eventElement);

      if (event.type === 'click') {
        me.selectEvent(event.taskRecord, event.ctrlKey || event.metaKey);
      }
    }

    return event;
  }

  normalizeTarget(event) {
    return event.taskRecord;
  }

  selectEvent(record, preserveSelection = false) {
    // Select row without scrolling any column into view
    this.selectRow({
      record: record.id,
      column: false,
      addToSelection: preserveSelection
    });
  }

  deselectEvent(record) {
    this.deselectRow(record.id);
  }

  getNext(taskRecord) {
    const me = this,
          {
      taskStore
    } = me;

    for (let rowIdx = taskStore.indexOf(taskRecord) + 1; rowIdx < taskStore.count; rowIdx++) {
      const nextTask = taskStore.getAt(rowIdx); // Skip tasks which are outside the TimeAxis

      if (me.isInTimeAxis(nextTask)) {
        return nextTask;
      }
    }
  }

  getPrevious(taskRecord) {
    const me = this,
          {
      taskStore
    } = me;

    for (let rowIdx = taskStore.indexOf(taskRecord) - 1; rowIdx >= 0; rowIdx--) {
      const prevTask = taskStore.getAt(rowIdx); // Skip tasks which are outside the TimeAxis

      if (me.isInTimeAxis(prevTask)) {
        return prevTask;
      }
    }
  }

  set activeEvent(record) {
    this.navigator.activeItem = this.getElementFromTaskRecord(record, false);
  }

  get activeEvent() {
    const {
      activeItem
    } = this.navigator;

    if (activeItem) {
      return this.resolveTaskRecord(activeItem);
    }
  }

  async navigateTo(targetEvent, {
    scrollIntoView = true,
    uiEvent = {}
  }) {
    const me = this,
          {
      navigator
    } = me,
          {
      skipScrollIntoView
    } = navigator;

    if (targetEvent) {
      if (scrollIntoView) {
        // No key processing during scroll
        navigator.disabled = true;
        await me.scrollTaskIntoView(targetEvent, animate100);
        navigator.disabled = false;
      } else {
        navigator.skipScrollIntoView = true;
      } // Panel can be destroyed before promise is resolved

      if (!me.isDestroyed) {
        me.activeEvent = targetEvent;
        navigator.skipScrollIntoView = skipScrollIntoView;
        navigator.trigger('navigate', {
          event: uiEvent,
          item: me.getElementFromTaskRecord(targetEvent, false)
        });
      }
    }
  }

  clearEventSelection() {
    this.deselectAll();
  }

  onTaskEnterKey() {// Empty, to be chained by features (used by TaskEdit)
  } // OVERRIDE for EventNavigation#onDeleteKey

  onDeleteKey(keyEvent) {
    const record = keyEvent.eventRecord;

    if (!this.readOnly && this.enableDeleteKey && record) {
      this.removeEvents([record]);
    }
  }

  onGridBodyFocusIn(focusEvent) {
    // Task navigation only has a say when navigation is inside the TimeAxisSubGrid
    if (this.timeAxisSubGridElement.contains(focusEvent.target)) {
      const me = this,
            {
        navigationEvent
      } = me,
            {
        target
      } = focusEvent,
            eventFocus = target.closest(me.navigator.itemSelector),
            task = eventFocus ? me.resolveTaskRecord(target) : me.getRecordFromElement(target),
            destinationCell = me.normalizeCellContext({
        rowIndex: me.taskStore.indexOf(task),
        column: me.timeAxisColumn,
        target
      }); // Don't take over what the event navigator does if it's doing task navigation.
      // Just silently cache our actionable location.

      if (eventFocus) {
        var _me$onCellNavigate;

        const {
          _focusedCell
        } = me;
        me._focusedCell = destinationCell;
        (_me$onCellNavigate = me.onCellNavigate) === null || _me$onCellNavigate === void 0 ? void 0 : _me$onCellNavigate.call(me, me, _focusedCell, destinationCell, navigationEvent, true);
        return;
      } // Try to focus the task.

      me.navigateTo(task, {
        scrollIntoView: Boolean((navigationEvent === null || navigationEvent === void 0 ? void 0 : navigationEvent.type) !== 'mousedown'),
        uiEvent: navigationEvent
      });
      return;
    }

    super.onGridBodyFocusIn(focusEvent);
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

});

/**
 * @module Gantt/view/orientation/NewTaskRendering
 * @internal
 */

const releaseEventActions = {
  releaseElement: 1,
  // Not used at all at the moment
  reuseElement: 1 // Used by some other element

},
      renderEventActions = {
  newElement: 1,
  reuseOwnElement: 1,
  reuseElement: 1
},
      // Used to render more ticks than actually visible
horizontalTickBuffer = 100;
/**
 * Handles rendering of tasks, using the following strategy:
 *
 * 1. When a row is rendered, it collects a DOM config for its task bar and stores in a map (row -> config)
 * 2. When a rendering pass is done, it syncs the DOM configs from the map to DOM
 *
 * The need for caching with this approach is minimal, only the map needs to be kept up to date with available rows.
 *
 * @internal
 * @extends Core/Base
 */

class NewTaskRendering extends Base {
  //region Config & Init
  static get properties() {
    return {
      rowMap: new Map()
    };
  }

  construct(gantt) {
    this.gantt = gantt;
    gantt.rowManager.on({
      renderDone: 'onRenderDone',
      removeRows: 'onRemoveRows',
      beforeRowHeight: 'onBeforeRowHeightChange',
      renderRow: 'onRenderRow',
      thisObj: this
    });
    super.construct({});
  }

  init() {} //endregion
  //region View hooks

  bindTaskStore() {}

  refreshRows() {}

  onTimeAxisViewModelUpdate() {
    // Update view bounds
    this.updateFromHorizontalScroll(this.gantt.timeAxisSubGrid.scrollable.x);
  }

  onViewportResize() {}

  onDragAbort() {}

  onBeforeRowHeightChange(event) {
    const {
      gantt
    } = this;

    if (gantt.foregroundCanvas) {
      var _event$height;

      //gantt.element.classList.add('b-notransition');
      gantt.foregroundCanvas.style.fontSize = `${((_event$height = event === null || event === void 0 ? void 0 : event.height) !== null && _event$height !== void 0 ? _event$height : gantt.rowHeight) - gantt.resourceMargin * 2}px`; //gantt.element.classList.remove('b-notransition');
    }
  } //endregion
  //region Region & coordinates

  get visibleDateRange() {
    return this._visibleDateRange;
  } // TODO : Replace calls with generator below

  getTaskBox(taskRecord, includeOutside = false, inner = false) {
    const {
      gantt
    } = this,
          {
      isBatchUpdating
    } = taskRecord,
          {
      taskStore
    } = gantt.project,
          startDate = isBatchUpdating ? taskRecord.get('startDate') : taskRecord.startDate,
          endDate = isBatchUpdating ? taskRecord.get('endDate') : taskRecord.endDate;

    if (inner) {
      const innerElement = this.getElementFromTaskRecord(taskRecord);

      if (innerElement) {
        return Rectangle.from(innerElement, gantt.timeAxisSubGridElement);
      }
    } // A task that gets startDate during initial propagation, which seems not have happened yet.
    // Or a removed task (this fn is also used for baselines). Nothing to render then

    if (!startDate || !endDate || taskRecord.isTask && (taskStore.isDestroyed || !taskStore.isAvailable(taskRecord))) {
      return null;
    }

    const positionData = this.getSizeAndPosition(taskRecord, includeOutside, inner);

    if (!positionData) {
      return null;
    }

    const {
      position,
      width
    } = positionData,
          top = taskStore.indexOf(taskRecord.isBaseline ? taskRecord.task : taskRecord) * gantt.rowManager.rowOffsetHeight + gantt.resourceMargin,
          height = gantt.rowHeight - gantt.resourceMargin * 2,
          bounds = new Rectangle(position, top, width, height); // Position always correct in Gantt, since there is no stacking

    bounds.layout = true;
    return bounds;
  } // returns an object with `position` + `width`. If task is not inside current time axis, position is -1

  getSizeAndPosition(taskRecord, includeOutside, inner) {
    var _gantt$features$depen;

    const me = this,
          {
      gantt
    } = me,
          {
      timeAxis
    } = gantt,
          viewStart = timeAxis.startDate,
          viewEnd = timeAxis.endDate,
          // Must use Model.get in order to get latest values in case we are inside a batch.
    // TaskResize changes the endDate using batching to enable a tentative change
    // via the batchedUpdate event which is triggered when changing a field in a batch.
    // Fall back to accessor if propagation has not populated date fields.
    taskStart = taskRecord.isBatchUpdating ? taskRecord.get('startDate') : taskRecord.startDate,
          // Might get here before engine has normalized
    taskEnd = taskRecord.isBatchUpdating ? taskRecord.get('endDate') : taskRecord.endDate || (taskRecord.duration != null ? DateHelper.add(taskStart, taskRecord.duration, taskRecord.durationUnit) : null),
          isMilestone = taskRecord.milestone,
          // Ensure dependencies feature is present (=== false if not)
    horizontalAdjustment = isMilestone ? (_gantt$features$depen = gantt.features.dependencies.pathFinder) === null || _gantt$features$depen === void 0 ? void 0 : _gantt$features$depen.startArrowMargin : 0;
    let startCoordinate, endCoordinate; // Early bailout for tasks that are fully out of timeaxis

    if (!includeOutside && (taskEnd < viewStart || taskStart > viewEnd)) {
      return null;
    } // The calls using `includeOutside` are not used during task rendering, but when rendering dependencies.
    // In those cases the lines are expected to be drawn even to tasks fully out of view, clipped to view bounds

    if (includeOutside && taskStart < viewStart) {
      startCoordinate = gantt.getCoordinateFromDate(viewStart) - horizontalAdjustment;
    } else if (includeOutside && taskStart > viewEnd) {
      startCoordinate = gantt.getCoordinateFromDate(viewEnd) + horizontalAdjustment;
    } // Starts before view and ends in or after view, approximate startCoordinate
    else if (taskStart < viewStart) {
      const // Using seconds instead of ms in a try to not loose to much precision in year views
      pxPerSecond = gantt.timeAxisViewModel.getSingleUnitInPixels('second'),
            secondsOutOfView = (timeAxis.startMS - taskRecord.startDateMS) / 1000,
            // taskRecord.startDateMS is cached in TimeSpan
      pxOutOfView = secondsOutOfView * pxPerSecond;
      startCoordinate = gantt.getCoordinateFromDate(viewStart) - pxOutOfView;
    } // The "normal" case, somewhere in the timeaxis
    else {
      startCoordinate = gantt.getCoordinateFromDate(taskStart);
    }

    if (!isMilestone) {
      // Same logic applies to `includeOutside` for end date, clip to view
      if (includeOutside && taskEnd < viewStart) {
        endCoordinate = gantt.getCoordinateFromDate(viewStart) - horizontalAdjustment;
      } else if (includeOutside && taskEnd > viewEnd) {
        endCoordinate = gantt.getCoordinateFromDate(viewEnd) + horizontalAdjustment;
      } // Starts in or before view and ends outside, approximate end
      else if (taskEnd > viewEnd) {
        const pxPerSecond = gantt.timeAxisViewModel.getSingleUnitInPixels('second'),
              secondsOutOfView = (taskRecord.endDateMS - timeAxis.endMS) / 1000,
              // taskRecord.endDateMS is cached in TimeSpan
        pxOutOfView = secondsOutOfView * pxPerSecond;
        endCoordinate = gantt.getCoordinateFromDate(viewEnd) + pxOutOfView;
      } else {
        endCoordinate = gantt.getCoordinateFromDate(taskEnd);
      }
    }

    let width = isMilestone ? 0 : endCoordinate - startCoordinate; // Requesting diamond width, in viewport space

    if (inner && isMilestone && taskStart > viewStart && taskStart < viewEnd) {
      // By default as wide as it is high
      width = gantt.rowHeight - gantt.resourceMargin * 2;
      startCoordinate -= width / 2;
    }

    if (!includeOutside && startCoordinate + width < 0) {
      return null;
    }

    return {
      position: startCoordinate,
      width
    };
  }

  getRowRegion(taskRecord, startDate, endDate) {
    const {
      gantt
    } = this,
          row = gantt.getRowFor(taskRecord); // might not be rendered

    if (!row) {
      return null;
    }

    const rowElement = row.getElement(gantt.timeAxisSubGrid.region),
          taStart = gantt.timeAxis.startDate,
          taEnd = gantt.timeAxis.endDate,
          start = startDate ? DateHelper.max(taStart, startDate) : taStart,
          end = endDate ? DateHelper.min(taEnd, endDate) : taEnd,
          startX = gantt.getCoordinateFromDate(start),
          endX = gantt.getCoordinateFromDate(end, true, true),
          y = row.top + gantt.scrollTop,
          x = Math.min(startX, endX),
          bottom = y + rowElement.offsetHeight;
    return new Rectangle(x, y, Math.max(startX, endX) - x, bottom - y);
  }

  getDateFromXY(xy, roundingMethod, local) {
    let coord = xy[0];

    if (!local) {
      coord = this.translateToScheduleCoordinate(coord);
    }

    return this.gantt.timeAxisViewModel.getDateFromPosition(coord, roundingMethod);
  }

  translateToScheduleCoordinate(x) {
    // Get rid of fractional pixels, to not end up with negative fractional values for pos
    const pos = x - Math.floor(this.gantt.timeAxisSubGridElement.getBoundingClientRect().left);
    return pos + this.gantt.scrollLeft;
  }

  translateToPageCoordinate(x) {
    const element = this.gantt.timeAxisSubGridElement;
    return x + element.getBoundingClientRect().left - element.scrollLeft;
  } //endregion
  //region Element <-> Record mapping

  getElementFromTaskRecord(taskRecord, inner = true) {
    const wrapper = this.gantt.foregroundCanvas.syncIdMap[taskRecord.id];
    return inner ? wrapper === null || wrapper === void 0 ? void 0 : wrapper.syncIdMap.task : wrapper;
  } //endregion
  //region Dependency connectors
  // Cannot be moved from this file, called from currentOrientation.xx

  /**
   * Gets displaying item start side
   *
   * @param {Gantt.model.TaskModel} taskRecord
   * @return {String} 'left' / 'right' / 'top' / 'bottom'
   */

  getConnectorStartSide(taskRecord) {
    return 'left';
  }
  /**
   * Gets displaying item end side
   *
   * @param {Gantt.model.TaskModel} taskRecord
   * @return {String} 'left' / 'right' / 'top' / 'bottom'
   */

  getConnectorEndSide(taskRecord) {
    return 'right';
  } //endregion
  //region Rendering

  onRenderRow({
    row,
    record
  }) {
    // indicate inactive task rows
    row.assignCls({
      'b-inactive': record.inactive
    });
  }

  onRemoveRows({
    rows
  }) {
    rows.forEach(row => this.rowMap.delete(row));
    !this.gantt.refreshSuspended && this.onRenderDone();
  } // Update header range on horizontal scroll. No need to draw any tasks, Gantt only cares about vertical scroll

  updateFromHorizontalScroll(scrollLeft) {
    const {
      gantt
    } = this,
          width = gantt.timeAxisSubGrid.width,
          startDate = gantt.getDateFromCoordinate(Math.max(0, scrollLeft - horizontalTickBuffer)),
          endDate = gantt.getDateFromCoordinate(scrollLeft + width + horizontalTickBuffer) || gantt.endDate,
          // Visible date range, determined from scroll with fallback to time axis (needed when zooming leaves
    // scrollLeft "out of range")
    visibleStartDate = gantt.getDateFromCoordinate(scrollLeft) || gantt.startDate,
          visibleEndDate = gantt.getDateFromCoordinate(scrollLeft + width) || gantt.endDate;

    if (visibleStartDate && !gantt._viewPresetChanging) {
      // timeRange start/end dates represent first/last rendered dates which could be outside of the view since
      // buffer is used. We need to additionally resolve actually visible start/end dates.
      this._visibleDateRange = {
        startDate: visibleStartDate,
        endDate: visibleEndDate
      }; // Update timeaxis header making it display the new dates

      const range = gantt.timeView.range = {
        startDate,
        endDate
      };
      gantt.onVisibleDateRangeChange(range);
      gantt.trigger('visibleRangeChange', range);
    }
  }

  populateTaskRenderData(renderData, taskRecord) {
    const {
      gantt
    } = this,
          taskContent = {
      className: 'b-gantt-task-content',
      dataset: {
        taskBarFeature: 'content'
      },
      children: []
    };

    if (renderData) {
      let resizable = taskRecord.isResizable === undefined ? true : taskRecord.isResizable;

      if (renderData.startsOutsideView) {
        if (resizable === true) {
          resizable = 'end';
        } else if (resizable === 'start') {
          resizable = false;
        }
      }

      if (renderData.endsOutsideView) {
        if (resizable === true) {
          resizable = 'start';
        } else if (resizable === 'end') {
          resizable = false;
        }
      }

      Object.assign(renderData, {
        iconCls: new DomClassList(taskRecord.taskIconCls),
        id: gantt.getEventRenderId(taskRecord),
        style: taskRecord.style || '',
        taskId: taskRecord.id,
        // Classes for the wrapping div
        wrapperCls: new DomClassList({
          [gantt.eventCls + '-wrap']: 1,
          [`${gantt.eventCls}-parent`]: taskRecord.isParent,
          'b-milestone-wrap': taskRecord.milestone,
          'b-inactive': taskRecord.inactive,
          'b-expanded': taskRecord.isExpanded(gantt.taskStore),
          'b-readonly': taskRecord.readOnly
        }),
        // Task record cls property is now a DomClassList, so clone it
        // so that it can be manipulated here and by renderers.
        cls: taskRecord.isResourceTimeRange ? new DomClassList() : taskRecord.cls.clone(),
        // Extra DOMConfigs to add to the tasks row, for example for indicators
        extraConfigs: []
      }); // Gather event element classes as keys to add to the renderData.cls DomClassList.
      // Truthy value means the key will be added as a class name.

      Object.assign(renderData.cls, {
        [gantt.eventCls]: 1,
        [gantt.generatedIdCls]: taskRecord.hasGeneratedId,
        [gantt.dirtyCls]: taskRecord.modifications,
        [gantt.committingCls]: taskRecord.isCommitting,
        [gantt.endsOutsideViewCls]: renderData.endsOutsideView,
        [gantt.startsOutsideViewCls]: renderData.startsOutsideView,
        [gantt.fixedEventCls]: taskRecord.isDraggable === false,
        [`b-sch-event-resizable-${resizable}`]: 1,
        'b-milestone': taskRecord.milestone,
        // 'b-critical'                           : taskRecord.critical,
        'b-task-started': taskRecord.isStarted,
        'b-task-finished': taskRecord.isCompleted,
        'b-task-selected': gantt.selectedRecords.includes(taskRecord)
      });
      const eventStyle = taskRecord.eventStyle || gantt.eventStyle,
            eventColor = taskRecord.eventColor || gantt.eventColor;
      renderData.eventColor = eventColor;
      renderData.eventStyle = eventStyle;

      if (gantt.taskRenderer) {
        // User has specified a renderer fn, either to return a simple string, or an object
        const value = gantt.taskRenderer.call(gantt.taskRendererThisObj || gantt, {
          taskRecord,
          renderData
        }); // If the user's renderer coerced it into a string, recreate a DomClassList.

        if (typeof renderData.cls === 'string') {
          renderData.cls = new DomClassList(renderData.cls);
        } // Same goes for iconCls

        if (typeof renderData.iconCls === 'string') {
          renderData.iconCls = new DomClassList(renderData.iconCls);
        }

        if (typeof renderData.wrapperCls === 'string') {
          renderData.wrapperCls = new DomClassList(renderData.wrapperCls);
        }

        let childContent = null; // Likely HTML content

        if (StringHelper.isHtml(value)) {
          childContent = {
            tag: 'span',
            html: value
          };
        } // DOM config or plain string can be used as is
        else if (typeof value === 'string' || typeof value === 'object') {
          childContent = value;
        } // Other, use string
        else if (value != null) {
          childContent = String(value);
        }

        if (childContent) {
          if (Array.isArray(childContent)) {
            taskContent.children.push(...childContent);
          } else {
            taskContent.children.push(childContent);
          }

          renderData.cls.add('b-has-content');
        }
      } // If there are any iconCls entries...

      renderData.cls['b-sch-event-withicon'] = renderData.iconCls.length; // renderers have last say on style & color

      renderData.wrapperCls[`b-sch-style-${renderData.eventStyle}`] = renderData.eventStyle;

      if (DomHelper.isNamedColor(renderData.eventColor)) {
        renderData.wrapperCls[`b-sch-color-${renderData.eventColor}`] = renderData.eventColor;
      } else if (renderData.eventColor) {
        renderData.style = `background-color:${renderData.eventColor};` + renderData.style;
      }

      if (renderData.iconCls && renderData.iconCls.length) {
        taskContent.children.unshift({
          tag: 'i',
          className: renderData.iconCls
        });
      } // if we have some children collected or it's a milestone (milestone styling needs content element presence)

      if (taskContent.children.length || taskRecord.milestone) {
        renderData.children.push(taskContent);
      }
    }

    renderData.taskContent = taskContent;
    renderData.wrapperChildren = []; // Method which features may chain in to

    gantt.onTaskDataGenerated(renderData);
  } // Called per row in "view", collect configs

  renderer({
    row,
    record: taskRecord
  }) {
    const me = this,
          box = me.getTaskBox(taskRecord),
          data = {
      taskRecord,
      task: taskRecord,
      // TODO: Deprecate
      row,
      children: []
    };
    let config;

    if (box) {
      Object.assign(data, {
        isTask: true,
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height
      });
      me.populateTaskRenderData(data, taskRecord);
      config = {
        className: data.wrapperCls,
        tabIndex: '0',
        children: [{
          className: data.cls,
          style: (data.internalStyle || '') + (data.style || ''),
          children: data.children,
          dataset: {
            // Each feature putting contents in the task wrap should have this to simplify syncing and
            // element retrieval after sync
            taskFeature: 'task'
          },
          syncOptions: {
            syncIdField: 'taskBarFeature'
          }
        }, ...data.wrapperChildren],
        style: {
          top: data.top,
          left: data.left,
          // DomHelper appends px to dimensions when using numbers
          width: data.width,
          zIndex: data.zIndex
        },
        dataset: {
          taskId: data.taskId
        },
        // Will not be part of DOM, but attached to the element
        elementData: data,
        // Options for this level of sync, lower levels can have their own
        syncOptions: {
          syncIdField: 'taskFeature',
          // Remove instead of release when a feature is disabled
          releaseThreshold: 0
        }
      };
      me.gantt.trigger('beforeRenderTask', {
        renderData: data,
        domConfig: config
      });
    } else {
      // Calculate top position, used by Baselines feature to position its elements
      data.top = row.top + me.gantt.resourceMargin; // Task is not visible or is not scheduled (outside bounds of TimeAxis).

      me.populateTaskRenderData(data, taskRecord);
    }

    if (!box && data.extraConfigs.length === 0) {
      me.rowMap.delete(row);
      return;
    } // Store DOM configs

    me.rowMap.set(row, [config, ...data.extraConfigs]);
  } // Called when the current row rendering "pass" is complete, sync collected configs to DOM

  onRenderDone() {
    const {
      gantt
    } = this,
          configs = Array.from(this.rowMap.values()).flat(); // TODO: flat converted by babel?
    // Give features a chance to inject or manipulate task configs

    gantt.onBeforeTaskSync(configs);
    DomSync.sync({
      domConfig: {
        onlyChildren: true,
        children: configs
      },
      targetElement: gantt.foregroundCanvas,
      syncIdField: 'taskId',

      // Called by DomHelper when it creates, releases or reuses elements
      callback({
        action,
        domConfig,
        lastDomConfig,
        targetElement: element
      }) {
        // If element is a task wrap, trigger appropriate events
        if (action !== 'none' && domConfig && domConfig.className && domConfig.className[gantt.eventCls + '-wrap']) {
          var _lastDomConfig$elemen, _domConfig$elementDat;

          const // Some actions are considered first a release and then a render (reusing another element).
          // This gives clients code a chance to clean up before reusing an element
          isRelease = releaseEventActions[action],
                isRender = renderEventActions[action]; // If we are reusing an element that was previously released we should not trigger again

          if (isRelease && lastDomConfig !== null && lastDomConfig !== void 0 && (_lastDomConfig$elemen = lastDomConfig.elementData) !== null && _lastDomConfig$elemen !== void 0 && _lastDomConfig$elemen.isTask) {
            const event = {
              renderData: lastDomConfig.elementData,
              taskRecord: lastDomConfig.elementData.taskRecord,
              element
            }; // This event is documented on Gantt

            gantt.trigger('releaseTask', event);
          } // Trigger only for actual tasks, not indicators or baselines

          if (isRender && domConfig !== null && domConfig !== void 0 && (_domConfig$elementDat = domConfig.elementData) !== null && _domConfig$elementDat !== void 0 && _domConfig$elementDat.isTask) {
            const event = {
              renderData: domConfig.elementData,
              taskRecord: domConfig.elementData.taskRecord,
              element
            };
            event.reusingElement = action === 'reuseElement'; // This event is documented on Gantt

            gantt.trigger('renderTask', event);
          }
        }
      }

    });
  } // Redraws a single task by rerendering its cell

  redraw(taskRecord) {
    // Refresh cell, will call `renderer` above and update its DOM config
    if (this.gantt.rowManager.refreshCell(taskRecord, this.gantt.timeAxisColumn.id)) {
      // Update DOM
      this.onRenderDone();
    }
  } //endregion

}
NewTaskRendering._$name = 'NewTaskRendering';

/**
 * @module Gantt/view/GanttBase
 */

const emptyObject = Object.freeze({});
let newTaskCount = 0;
/**
 * A thin base class for {@link Gantt/view/Gantt}. Does not include any features by default, allowing smaller custom
 * built bundles if used in place of {@link Gantt/view/Gantt}.
 *
 * @mixes Gantt/view/mixin/GanttDom
 * @mixes Gantt/view/mixin/GanttRegions
 * @mixes Gantt/view/mixin/GanttScroll
 * @mixes Gantt/view/mixin/GanttState
 * @mixes Gantt/view/mixin/GanttStores
 * @mixes Scheduler/crud/mixin/CrudManagerView
 * @mixes Scheduler/view/mixin/EventNavigation
 * @mixes Gantt/view/mixin/TaskNavigation
 * @mixes SchedulerPro/view/mixin/ProjectProgressMixin
 * @mixes SchedulerPro/view/mixin/SchedulingIssueResolution
 *
 * @features Scheduler/feature/ColumnLines
 * @features Scheduler/feature/EventFilter
 * @features Scheduler/feature/HeaderZoom
 * @features Scheduler/feature/Labels
 * @features Scheduler/feature/NonWorkingTime
 * @features Scheduler/feature/Pan
 * @features Scheduler/feature/ScheduleMenu
 * @features Scheduler/feature/ScheduleTooltip
 * @features Scheduler/feature/Summary
 * @features Scheduler/feature/TimeAxisHeaderMenu
 * @features Scheduler/feature/TimeRanges
 *
 * @features SchedulerPro/feature/PercentBar
 * @features SchedulerPro/feature/DependencyEdit
 *
 * @features Gantt/feature/Baselines
 * @features Gantt/feature/CellEdit
 * @features Gantt/feature/CriticalPaths
 * @features Gantt/feature/Dependencies
 * @features Gantt/feature/Indicators
 * @features Gantt/feature/Labels
 * @features Gantt/feature/ParentArea
 * @features Gantt/feature/ProgressLine
 * @features Gantt/feature/ProjectLines
 * @features Gantt/feature/Rollups
 * @features Gantt/feature/Summary
 * @features Gantt/feature/TaskCopyPaste
 * @features Gantt/feature/TaskDrag
 * @features Gantt/feature/TaskDragCreate
 * @features Gantt/feature/TaskEdit
 * @features Gantt/feature/TaskMenu
 * @features Gantt/feature/TaskResize
 * @features Gantt/feature/TaskTooltip
 * @features Gantt/feature/TreeGroup
 *
 * @features Gantt/feature/export/MspExport
 * @features Gantt/feature/export/PdfExport
 * @features Gantt/feature/export/exporter/MultiPageExporter
 * @features Gantt/feature/export/exporter/MultiPageVerticalExporter
 * @features Gantt/feature/export/exporter/SinglePageExporter
 *
 * @extends Scheduler/view/TimelineBase
 */

class GanttBase extends TimelineBase.mixin(CrudManagerView, GanttDom, GanttRegions, GanttScroll, GanttStores, GanttState, GanttTimelineDateMapper, SchedulerEventNavigation, TaskNavigation, ProjectProgressMixin, SchedulingIssueResolution, CurrentConfig) {
  //region Task interaction events

  /**
   * Triggered after a mousedown on a task bar.
   * @event taskMouseDown
   * @param {Gantt.view.Gantt} source The Gantt instance
   * @param {Gantt.model.TaskModel} taskRecord The Task record
   * @param {MouseEvent} event The native browser event
   */

  /**
   * Triggered after a mouseup on a task bar.
   * @event taskMouseUp
   * @param {Gantt.view.Gantt} source The Gantt instance
   * @param {Gantt.model.TaskModel} taskRecord The Task record
   * @param {MouseEvent} event The native browser event
   */

  /**
   * Triggered after a click on a task bar.
   * @event taskClick
   * @param {Gantt.view.Gantt} source The Gantt instance
   * @param {Gantt.model.TaskModel} taskRecord The Task record
   * @param {MouseEvent} event The native browser event
   */

  /**
   * Triggered after a doubleclick on a task.
   * @event taskDblClick
   * @param {Gantt.view.Gantt} source The Gantt instance
   * @param {Gantt.model.TaskModel} taskRecord The Task record
   * @param {MouseEvent} event The native browser event
   */

  /**
   * Triggered after a rightclick (or long press on a touch device) on a task.
   * @event taskContextMenu
   * @param {Gantt.view.Gantt} source The Gantt instance
   * @param {Gantt.model.TaskModel} taskRecord The Task record
   * @param {MouseEvent} event The native browser event
   */

  /**
   * Triggered after a mouseover on a task.
   * @event taskMouseOver
   * @param {Gantt.view.Gantt} source The Gantt instance
   * @param {Gantt.model.TaskModel} taskRecord The Task record
   * @param {MouseEvent} event The native browser event
   */

  /**
   * Triggered for mouseout from a task.
   * @event taskMouseOut
   * @param {Gantt.view.Gantt} source The Gantt instance
   * @param {Gantt.model.TaskModel} taskRecord The Task record
   * @param {MouseEvent} event The native browser event
   */

  /**
   * Triggered when a keydown event is observed if there are selected tasks.
   * @event taskKeyDown
   * @param {Gantt.view.Gantt} source This Gantt
   * @param {Gantt.model.TaskModel} taskRecord Task record
   * @param {KeyboardEvent} event Browser event
   */

  /**
   * Triggered when a keyup event is observed if there are selected tasks.
   * @event taskKeyUp
   * @param {Gantt.view.Gantt} source This Gantt
   * @param {Gantt.model.TaskModel} eventRecord Task record
   * @param {KeyboardEvent} event Browser event
   */
  //endregion
  //region Other events

  /**
   * Task is rendered, its element is available in DOM.
   * @event renderTask
   * @param {Gantt.view.Gantt} source The Gantt instance
   * @param {Object} renderData Task render data
   * @param {Gantt.model.TaskModel} taskRecord Rendered task
   * @param {HTMLElement} element Task element
   */

  /**
   * Task is released, no longer in view/removed. A good spot for cleaning custom things added in a `renderTask`
   * listener up, if needed.
   * @event releaseTask
   * @param {Gantt.view.Gantt} source The Gantt instance
   * @param {Object} renderData Task render data
   * @param {Gantt.model.TaskModel} taskRecord Rendered task
   * @param {HTMLElement} element Task element
   */
  //endregion
  // For documentation & typings purposes

  /**
   * Returns the dependency record for a DOM element
   *
   * *NOTE: Only available when the {@link Gantt/feature/Dependencies Dependencies} feature is enabled.*
   *
   * @function resolveDependencyRecord
   * @param {HTMLElement} element The dependency line element
   * @return {Gantt.model.DependencyModel} The dependency record
   * @category Feature shortcuts
   */
  //endregion
  //region Config
  static get $name() {
    return 'GanttBase';
  } // Factoryable type name

  static get type() {
    return 'ganttbase';
  }

  static get defaultConfig() {
    return {
      /**
       * Get/set the gantt's read-only state. When set to `true`, any UIs for modifying data are disabled.
       * @member {Boolean} readOnly
       * @category Common
       */

      /**
       * Configure as `true` to make the gantt read-only, by disabling any UIs for modifying data.
       *
       * __Note that checks MUST always also be applied at the server side.__
       * @config {Boolean} readOnly
       * @default false
       * @category Common
       */

      /**
       * The {@link Gantt.model.ProjectModel} instance containing the data visualized by the Gantt chart.
       * @member {Gantt.model.ProjectModel} project
       * @category Data
       */

      /**
       * A {@link Gantt.model.ProjectModel} instance or a config object. The project holds all Gantt data.
       * @config {Gantt.model.ProjectModel|Object}
       * @category Data
       */
      project: null,

      /**
       * The path for resource images, used by various widgets such as the resource assignment column.
       * @config {String}
       * @category Common
       */
      resourceImageFolderPath: null,

      /**
       * The file name of an image file to use when a resource has no image, or its image cannot be loaded.
       * @config {String}
       * @category Common
       */
      defaultResourceImageName: null,

      /**
       * True to toggle the collapsed/expanded state when clicking a parent task bar.
       * @member {Boolean} toggleParentTasksOnClick
       * @category Common
       */

      /**
       * True to toggle the collapsed/expanded state when clicking a parent task bar.
       * @config {Boolean}
       * @default true
       * @category Common
       */
      toggleParentTasksOnClick: true,

      /**
       * True to scroll the task bar into view when clicking a cell, you can also pass a {@link #function-scrollTaskIntoView scroll config}
       * object.
       * @config {Boolean|Object}
       * @category Common
       */
      scrollTaskIntoViewOnCellClick: false,
      // data for the stores, in the topological order
      calendars: null,
      resources: null,
      tasks: null,
      dependencies: null,
      assignments: null,
      eventCls: 'b-gantt-task',
      eventBarTextField: null,
      eventLayout: 'none',
      eventSelectionDisable: true,
      eventColor: null,
      eventStyle: null,
      rowHeight: 45,
      scheduledEventName: 'task',
      eventScrollMode: 'move',
      overScheduledEventClass: 'b-gantt-task-hover',
      mode: 'horizontal',
      //fixedRowHeight          : true, // Not working with exporter, no time to investigate why currently
      timeCellCls: 'b-sch-timeaxis-cell',
      timeCellSelector: '.b-sch-timeaxis-cell',
      // TODO: This will be brought in by the TaskNavigation mixin when it is implemented
      focusCls: 'b-active',

      /**
       * An empty function by default, but provided so that you can override it. This function is called each time
       * a task is rendered into the gantt to render the contents of the task.
       *
       * Returning a string will display it in the task bar, it accepts both plain text or HTML. It is also
       * possible to return a DOM config object which will be synced to the task bars content.
       *
       * ```javascript
       * // using plain string
       * new Gantt({
       *    taskRenderer : ({ taskRecord }) => StringHelper.encodeHtml(taskRecord.name)
       * });
       *
       * // using html string
       * new Gantt({
       *    taskRenderer : ({ taskRecord }) => StringHelper.xss`${taskRecord.id} <b>${taskRecord.name}</b>`
       * });
       *
       * // using DOM config
       * new Gantt({
       *    taskRenderer({ taskRecord }) {
       *       return {
       *           tag  : 'b',
       *           html : StringHelper.encodeHtml(taskRecord.name)
       *       }
       *    }
       * });
       * ```
       *
       * @param {Object} detail An object containing the information needed to render a Task.
       * @param {Gantt.model.TaskModel} detail.taskRecord The task record.
       * @param {Object} detail.renderData An object containing details about the task rendering.
       * @param {Core.helper.util.DomClassList|String} detail.renderData.cls An object whose property names represent the CSS class names
       * to be added to the tasks's element. Set a property's value to truthy or falsy to add or remove the class
       * name based on the property name. Using this technique, you do not have to know whether the class is already
       * there, or deal with concatenation.
       * @param {String|Object} detail.renderData.style Inline styles for the task bar DOM element. Use either
       * 'border: 1px solid black' or { border: '1px solid black' }
       * @param {Core.helper.util.DomClassList|String} detail.renderData.wrapperCls An object whose property names represent the CSS class names
       * to be added to the event wrapper element. Set a property's value to truthy or falsy to add or remove the class
       * name based on the property name. Using this technique, you do not have to know whether the class is already
       * there, or deal with concatenation.
       * @param {Core.helper.util.DomClassList|String} detail.renderData.iconCls An object whose property names represent the CSS class
       * names to be added to a task icon element.
       * @param {Scheduler.model.TimeSpan[]|Object[]} indicators An array that can be populated with TimeSpan
       * records or their config objects to have them rendered in the task row
       * @returns {String} A simple string creating the actual HTML
       * @config {Function}
       * @category Scheduled events
       */
      taskRenderer: null,

      /**
       * A callback function or a set of `name: value` properties to apply on tasks created using the task context menu.
       * Be aware that `name` value will be ignored since it's auto generated and may be configured with localization.
       *
       * Example:
       * ```javascript
       * // Object form:
       * newTaskDefaults : {
       *    duration          : 3,
       *    manuallyScheduled : true,
       *    percentDone       : 15
       * }
       * ```
       *
       * ```javascript
       * // Function form:
       * newTaskDefaults : (targetRecord) => {
       *    return {
       *        duration          : targetRecord.duration,
       *        manuallyScheduled : targetRecord.manuallyScheduled
       *    }
       * }
       * ```
       * @config {Object|Function}
       */
      newTaskDefaults: {},

      /**
       * A task field (id, wbsCode, sequenceNumber etc) that will be used when displaying and editing linked tasks.
       * @config {String} dependencyIdField
       * @default 'id'
       * @category Common
       */
      dependencyIdField: 'id',

      /**
       * Returns dates that will constrain resize and drag operations. The method will be called with the
       * task being dragged.
       * @param {Gantt.model.TaskModel} taskRecord The task record being moved or resized.
       * @return {Object} Constraining object containing `start` and `end` constraints. Omitting either
       * will mean that end is not constrained. So you can prevent a resize or move from moving *before*
       * a certain time while not constraining the end date.
       * @return {Date} [return.start] Start date
       * @return {Date} [return.end] End date
       * @config {Function}
       * @category Scheduled events
       */
      getDateConstraints: null
    };
  }

  get isGantt() {
    return true;
  } //endregion
  //region Init

  construct(config = {}) {
    const me = this,
          hasInlineStores = Boolean(config.calendars || config.taskStore || config.dependencyStore || config.resourceStore || config.assignmentStore),
          hasInlineData = Boolean(config.calendars || config.tasks || config.dependencies || config.resources || config.assignments); // TODO: Config system to be enhanced to merge object properties from the hierarchy's
    // defaultConfig set so that each class level could just declare the features it requires.

    if (!config.features) {
      const defaults = me.getDefaultConfiguration().features;
      config.features = defaults && typeof defaults === 'object' ? defaults : {};
    } // gantt is always a tree

    if (!('tree' in config.features)) {
      config.features.tree = true;
    } // disable group feature by default

    if (!('group' in config.features)) {
      config.features.group = false;
    }

    const {
      project
    } = config;

    if (project && (hasInlineStores || hasInlineData)) {
      throw new Error('Providing both project and inline data is not supported');
    } // gather all data in the ProjectModel instance

    if (!(project !== null && project !== void 0 && project.isModel)) {
      config.project = ObjectHelper.assign({
        calendarsData: config.calendars,
        eventsData: config.tasks,
        dependenciesData: config.dependencies,
        resourcesData: config.resources,
        assignmentsData: config.assignments,
        resourceStore: config.resourceStore,
        eventStore: config.taskStore,
        assignmentStore: config.assignmentStore,
        dependencyStore: config.dependencyStore,
        timeRangeStore: config.timeRangeStore
      }, project);
      delete config.resourceStore;
      delete config.taskStore;
      delete config.assignmentStore;
      delete config.dependencyStore;
      delete config.timeRangeStore;
      delete config.calendars;
      delete config.resources;
      delete config.tasks;
      delete config.assignments;
      delete config.dependencies;
    } // EOF data gathering

    super.construct(config);
    me.on({
      taskclick: 'onTaskBarClick',
      cellClick: 'onNonTimeAxisCellClick',
      toggleNode: 'onToggleParentNode'
    });
  }

  get columns() {
    return super.columns;
  }

  set columns(columns) {
    if (columns) {
      let cols = columns;

      if (!Array.isArray(columns)) {
        cols = columns.data; // Need to pull the taskstore in, to make sure any fields added by columns are added to it

        this._thisIsAUsedExpression(this.taskStore);
      } // Always include the name column

      if (!cols.some(column => {
        const constructor = column instanceof Column ? column.constructor : ColumnStore.getColumnClass(column.type) || Column;
        return constructor === NameColumn || constructor.prototype instanceof NameColumn;
      })) {
        cols.unshift({
          type: 'name'
        });
      }
    }

    super.columns = columns; // this.timeAxisColumn.reactiveRenderer = this.taskRendering.reactiveRenderer;
  } // Overrides TimelineBase to supply taskStore as its store (which is only used in passed events)

  set timeAxisViewModel(timeAxisViewModel) {
    super.timeAxisViewModel = timeAxisViewModel;

    if (this.taskStore) {
      this.timeAxisViewModel.store = this.taskStore;
    }
  }

  get timeAxisViewModel() {
    return super.timeAxisViewModel;
  } //endregion
  //region Overrides

  onPaintOverride() {// Internal procedure used for paint method overrides
    // Not used in onPaint() because it may be chained on instance and Override won't be applied
  } //endregion
  //region Events

  resumeRefresh(trigger) {
    super.resumeRefresh(false);

    if (!this.refreshSuspended && trigger) {
      if (!this.rowManager.topRow) {
        // TODO: investigate why we need this
        this.rowManager.reinitialize();
      } else {
        this.refreshWithTransition();
      }
    }
  } // Overriding grids behaviour to ignore individual updates caused by propagation
  // TODO: scheduler doesn't need that code and it shouldn't be needed in gantt too

  onStoreUpdateRecord(params) {
    if (!this.project.isBatchingChanges) {
      let result;
      this.runWithTransition(() => {
        result = super.onStoreUpdateRecord(params);
      }, !this.refreshSuspended);
      return result;
    }
  } // Transition batch changes

  onStoreDataChange(params) {
    this.runWithTransition(() => {
      super.onStoreDataChange(params);
    }, params.action === 'batch');
  } // Features can hook into this to add to generated task data

  onTaskDataGenerated() {} // Features can hook into this to manipulate visible task configs before they are DomSynced

  onBeforeTaskSync() {}

  onTaskBarClick({
    taskRecord
  }) {
    if (this.toggleParentTasksOnClick && !taskRecord.isLeaf) {
      this.toggleCollapse(taskRecord);
    }
  }

  onNonTimeAxisCellClick({
    record,
    column
  }) {
    if (column.type !== 'timeAxis' && this.scrollTaskIntoViewOnCellClick && record.isScheduled) {
      this.scrollTaskIntoView(record, this.scrollTaskIntoViewOnCellClick === true ? {
        animate: true,
        block: 'center',
        y: false
      } : this.scrollTaskIntoViewOnCellClick);
    }
  }

  onToggleParentNode({
    record
  }) {
    // Repaint parent node on collapse / expand (unless in a collapsed parent, happens on collapse all)
    record.parent.isExpanded(this.taskStore) && this.taskRendering.redraw(record);
  } // Grid row selection change
  // TODO #8301 - EventSelection based on Collection may break it

  triggerChangeEvent(selectionChangeEvent, silent) {
    super.triggerChangeEvent(selectionChangeEvent, silent);
    const me = this;

    function setTaskSelection(record, selected) {
      const taskElement = me.getElementFromTaskRecord(record);

      if (taskElement) {
        DomSync[selected ? 'addCls' : 'removeCls']('b-task-selected', taskElement);
      }
    }

    if (selectionChangeEvent.mode === 'row') {
      selectionChangeEvent.selected.map(record => setTaskSelection(record, true));
      selectionChangeEvent.deselected.map(record => setTaskSelection(record, false));
    }
  } //endregion
  //region TimelineBase implementations
  // Overrides grid to take project loading into account

  toggleEmptyText() {
    const me = this;

    if (me.bodyContainer && me.rowManager) {
      DomHelper.toggleClasses(me.bodyContainer, 'b-grid-empty', !(me.rowManager.rowCount || me.project.isLoadingOrSyncing));
    }
  } // Gantt only has one orientation, but TimelineBase expects this to work to call correct rendering code

  get currentOrientation() {
    const me = this;

    if (!me._currentOrientation) {
      //me.taskRendering = me._currentOrientation = new TaskRendering(me);
      me.taskRendering = me._currentOrientation = new NewTaskRendering(me);
    }

    return me._currentOrientation;
  }

  getTimeSpanMouseEventParams(taskElement, event) {
    const taskRecord = this.resolveTaskRecord(taskElement);
    return !taskRecord ? null : {
      taskRecord,
      taskElement,
      event
    };
  }

  getScheduleMouseEventParams(cellData) {
    return {
      taskRecord: this.store.getById(cellData.id)
    };
  } // Used by shared features to resolve an event or task

  resolveTimeSpanRecord(element) {
    return this.resolveTaskRecord(element);
  }

  repaintEventsForResource(taskRecord) {
    this.taskRendering.redraw(taskRecord);
  } //endregion
  //region Feature hooks

  /**
   * Populates the task context menu. Chained in features to add menu items.
   * @param {Object} options Contains menu items and extra data retrieved from the menu target.
   * @param {Grid.column.Column} options.column Column for which the menu will be shown.
   * @param {Gantt.model.TaskModel} options.taskRecord The reference task record
   * @param {Scheduler.model.ResourceModel} options.resourceRecord The context resource.
   * @param {Scheduler.model.AssignmentModel} options.assignmentRecord The context assignment if any.
   * @param {Object} options.items A named object to describe menu items.
   * @internal
   */

  populateTaskMenu() {}

  onVisibleDateRangeChange() {} //endregion
  // region ContextMenu API

  async addTask(referenceTask, options = emptyObject) {
    const me = this,
          {
      milestone,
      above,
      asChild,
      asPredecessor,
      asSuccessor
    } = options,
          project = me.project,
          parent = referenceTask.parent,
          defaults = typeof me.newTaskDefaults == 'function' ? me.newTaskDefaults(referenceTask) : me.newTaskDefaults,
          newRecord = project.taskModelClass.new({
      // use reference task values only if not provided in newTaskDefaults
      startDate: referenceTask.startDate,
      duration: referenceTask.duration
    }, defaults);

    if (milestone) {
      newRecord.name = `${me.L('L{Gantt.New milestone}')} ${++newTaskCount}`;
    } else {
      newRecord.name = `${me.L('L{Gantt.New task}')} ${++newTaskCount}`;
    }

    if (asChild) {
      referenceTask.insertChild(newRecord, referenceTask.firstChild);
    } else if (above) {
      referenceTask.parent.insertChild(newRecord, referenceTask);
    } else {
      parent.insertChild(newRecord, referenceTask.nextSibling);
    }

    if (milestone) {
      await project.commitAsync();
      await newRecord.convertToMilestone();
    } else {
      await project.commitAsync();
    } // run propagation to handle the new task record
    // and then add a dependency if needed

    if (asSuccessor) {
      me.dependencyStore.add({
        fromEvent: referenceTask,
        toEvent: newRecord,
        type: DependencyType.EndToStart,
        fromSide: 'right',
        toSide: 'left'
      });
    } else if (asPredecessor) {
      me.dependencyStore.add({
        fromEvent: newRecord,
        toEvent: referenceTask,
        type: DependencyType.EndToStart,
        fromSide: 'right',
        toSide: 'left'
      });
    }

    if (asSuccessor || asPredecessor) {
      // run propagation to handle the new dependency
      await project.propagateAsync();
    }

    return newRecord;
  }
  /**
   * Adds a new task above the passed reference task
   * @async
   * @param {Gantt.model.TaskModel} taskRecord The reference task record
   * @return {Gantt.model.TaskModel} A promise which yields the added task
   */

  addTaskAbove(taskRecord) {
    return this.addTask(taskRecord, {
      above: true
    });
  }
  /**
   * Adds a new task below the passed reference task
   * @async
   * @param {Gantt.model.TaskModel} taskRecord The reference task record
   * @return {Gantt.model.TaskModel} A promise which yields the added task
   */

  addTaskBelow(taskRecord) {
    return this.addTask(taskRecord);
  }
  /**
   * Adds a new milestone task below the passed reference task
   * @async
   * @param {Gantt.model.TaskModel} taskRecord The reference task record
   * @return {Gantt.model.TaskModel} A promise which yields the added task
   */

  addMilestoneBelow(taskRecord) {
    return this.addTask(taskRecord, {
      milestone: true
    });
  }
  /**
   * Adds a new sub task to the passed reference task
   * @async
   * @param {Gantt.model.TaskModel} taskRecord The reference task record
   * @return {Gantt.model.TaskModel} A promise which yields the added task
   */

  addSubtask(taskRecord) {
    const result = this.addTask(taskRecord, {
      asChild: true
    });
    this.toggleCollapse(taskRecord, false);
    return result;
  }
  /**
   * Adds a successor task to the passed reference task
   * @async
   * @param {Gantt.model.TaskModel} taskRecord The reference task record
   * @return {Gantt.model.TaskModel} A promise which yields the added task
   */

  addSuccessor(taskRecord) {
    return this.addTask(taskRecord, {
      asSuccessor: true
    });
  }
  /**
   * Adds a predecessor task to the passed reference task
   * @async
   * @param {Gantt.model.TaskModel} taskRecord The reference task record
   * @return {Gantt.model.TaskModel} A promise which yields the added task
   */

  addPredecessor(taskRecord) {
    return this.addTask(taskRecord, {
      above: true,
      asPredecessor: true
    });
  }
  /**
   * Increase the indentation level of one or more tasks in the tree. Has no effect if {@link Gantt.feature.TreeGroup}
   * has regrouped the tree.
   * @param {Gantt.model.TaskModel[]|Gantt.model.TaskModel} tasks The task(s) to indent.
   * @return {Promise} A promise which resolves if operation is successful
   */

  async indent(nodes) {
    const me = this;

    if (me.isTreeGrouped) {
      return;
    }

    const result = await me.taskStore.indent(nodes); // If `false`, the scheduling engine has found a reason that the operation could not happen.

    if (!result) {
      Toast.show({
        rootElement: me.rootElement,
        html: me.L('L{Gantt.changeRejected}')
      });
    }

    return result;
  }
  /**
   * Decrease the indentation level of one or more tasks in the tree. Has no effect if {@link Gantt.feature.TreeGroup}
   * has regrouped the tree.
   *
   * @param {Gantt.model.TaskModel[]|Gantt.model.TaskModel} tasks The task(s) to outdent.
   * @return {Promise} A promise which resolves if operation is successful
   */

  async outdent(nodes) {
    const me = this;

    if (me.isTreeGrouped) {
      return;
    }

    const result = await me.taskStore.outdent(nodes); // If `false`, the scheduling engine has found a reason that the operation could not happen.

    if (!result) {
      Toast.show({
        rootElement: me.rootElement,
        html: me.L('L{Gantt.changeRejected}')
      });
    }

    return result;
  } // endregion
  // the 4 methods below are required since super cannot be called from GanttDom mixin

  onElementKeyDown(event) {
    super.onElementKeyDown(event);
  }

  onElementKeyUp(event) {
    super.onElementKeyUp(event);
  }

  onElementMouseOver(event) {
    super.onElementMouseOver(event);
  }

  onElementMouseOut(event) {
    super.onElementMouseOut(event);
  }

} // Register this widget type with its Factory

GanttBase.initClass();
VersionHelper.setVersion('gantt', '5.0.1');
GanttBase._$name = 'GanttBase';

/**
 * @module Gantt/view/Gantt
 */

/**
 * <h2>Summary</h2>
 * The <b>Gantt</b> widget is the main component that visualizes the project data contained in a
 *  {@link Gantt/model/ProjectModel} instance. The Gantt view is implemented as a TreeGrid consisting
 *  of a left section showing the task hierarchy (or WBS) and a right section showing a graphical representation of the tasks on the time axis.
 *  Task relationships (or "dependencies") are rendered as arrows between the tasks and in the background you can (optionally) render non-working time too.
 *
 * The view is very interactive by default:
 *  * hovering over elements shows informative tooltips
 *  * right-clicking various elements shows context menus
 *  * double-clicking the task name shows an inline editor
 *  * double-clicking a task bar opens a detailed task editor popup
 *  * task bars can be dragged and resized
 *  * task progress can be changed by drag drop
 *  * task dependencies can be created by drag drop
 *
 * The Gantt view is very easy to use and is fully functional with minimal configuration yet
 * it is highly configurable through many configuration options and features.
 *
 * The minimum configuration consists of a {@link #config-project} and {@link Grid/view/Grid#config-columns}.
 * (If you only want to show the "Name" column, you can even omit `columns` as it's the default column set.)
 *
 * {@inlineexample Gantt/view/Gantt.js}
 *
 * <h2>Configuring data for Gantt</h2>
 * The central place for all data visualized in the Gantt chart is the {@link Gantt/model/ProjectModel} instance, passed as the {@link #config-project}
 * configuration option when configuring the Gantt.
 *
 * For details related to the Gantt data structure / updating data / loading and saving data to the server,
 * adding custom fields and other information, please refer to the
 * [Project data guide](#Gantt/guides/data/project_data.md).
 *
 * <h2>Configuring columns</h2>
 * The only mandatory column is the <code>name</code> column which is of type {@link Gantt/column/NameColumn}.
 * It is a tree column that shows the project WBS structure, and allows inline editing of the
 * {@link Gantt/model/TaskModel#field-name} field.
 *
 * The Gantt chart ships with lots of predefined columns (such as {@link Gantt/column/PercentDoneColumn}) but you can of course add your own columns too, showing any additional data in your data model.
 *
 * {@inlineexample Gantt/view/GanttColumns.js}
 *
 * <h2>Advanced configurations</h2>
 * Almost any aspect of Bryntum Gantt can be configured. The included examples cover most of the supported configuration options.
 * To see some of the features in action, please click on the links below:
 *
 *  * [Labels](../examples/labels/)
 *  * [Tooltips](../examples/tooltips)
 *  * [Time Ranges](../examples/timeranges/)
 *  * [Resource Picker](../examples/resourceassignment/)
 *  * [Task Menu](../examples/taskmenu/)
 *  * [Task Editor](../examples/taskeditor/)
 *  * [Undo/Redo](../examples/undoredo/)
 *  * [Advanced](../examples/advanced)
 *
 * @extends Gantt/view/GanttBase
 * @classType gantt
 */

class Gantt extends GanttBase {
  /**
   * **This config is not used in the Gantt**
   * @private
   * @config {Scheduler.crud.AbstractCrudManagerMixin} crudManagerClass
   */

  /**
   * **This config is not used in the Gantt. Please use {@link #config-project} config instead**
   * @private
   * @config {Object|Scheduler.crud.AbstractCrudManagerMixin} crudManager
   */
  static get $name() {
    return 'Gantt';
  } // Factoryable type name

  static get type() {
    return 'gantt';
  }

} // Register this widget type with its Factory

Gantt.initClass();
Gantt._$name = 'Gantt';

export { AddNewColumn, AllColumns, AssignmentField, AssignmentGrid, AssignmentModel, AssignmentPicker, AssignmentStore, AssignmentsManipulationStore, Baseline, Baselines, CalendarColumn, CalendarIntervalModel, CalendarManagerStore, CalendarModel, CalendarPicker, CellEdit, ConstrainedByParentMixin, ConstrainedLateEventMixin, ConstraintDateColumn, ConstraintTypeColumn, CriticalPaths, DeadlineDateColumn, Dependencies, DependencyColumn, DependencyField, DependencyModel, DependencyStore, EarlyEndDateColumn, EarlyStartDateColumn, EffortColumn, EffortVar, EndDateColumn, EventModeColumn, FixedDurationMixin, FixedEffortMixin, FixedUnitsMixin, Gantt, GanttAssignmentMixin, GanttBase, GanttDateColumn, GanttDom, GanttEvent, GanttHasAssignmentsMixin, GanttProjectMixin, GanttRegions, GanttScroll, GanttState, GanttStores, GanttTimelineDateMapper, HasCriticalPathsMixin, HasEffortMixin, HasSchedulingModeMixin, InactiveColumn, Indicators, Labels, LateEndDateColumn, LateStartDateColumn, ManuallyScheduledColumn, MilestoneColumn, MspExport, MultiPageExporter, MultiPageVerticalExporter, NameColumn, NewTaskRendering, NoteColumn, ParentArea, PdfExport, PercentDoneColumn, PredecessorColumn, ProgressLine, ProjectConstraintInterval, ProjectConstraintIntervalDescription, ProjectGenerator, ProjectLines, ProjectModel, ResourceAssignmentColumn, ResourceAssignmentGridResourceColumn, ResourceAssignmentParser, ResourceModel, ResourceStore, RollupColumn, Rollups, SEDWUDispatcher, SEDWUDispatcherIdentifier, ScheduledByDependenciesLateEventMixin, SchedulingModeColumn, SequenceColumn, ShowInTimelineColumn, SinglePageExporter, StartDateColumn, SuccessorColumn, Summary, TaskCopyPaste, TaskDrag, TaskDragCreate, TaskEdit, TaskEditor, TaskMenu, TaskModel, TaskNavigation, TaskResize, TaskStore, TaskTooltip, TimeAxisColumn, TotalSlackColumn, TreeGroup, UnitsVar, WBSColumn, Wbs, WbsField, effortFormula, endDateByEffortFormula, fixedDurationSEDWUBackwardEffortDriven, fixedDurationSEDWUBackwardNonEffortDriven, fixedDurationSEDWUForwardEffortDriven, fixedDurationSEDWUForwardNonEffortDriven, fixedDurationSEDWUGraphDescription, fixedEffortSEDWUBackward, fixedEffortSEDWUForward, fixedEffortSEDWUGraphDescription, fixedUnitsSEDWUBackwardEffortDriven, fixedUnitsSEDWUBackwardNonEffortDriven, fixedUnitsSEDWUForwardEffortDriven, fixedUnitsSEDWUForwardNonEffortDriven, fixedUnitsSEDWUGraphDescription, startDateByEffortFormula, unitsFormula };
//# sourceMappingURL=gantt.module.thin.js.map
