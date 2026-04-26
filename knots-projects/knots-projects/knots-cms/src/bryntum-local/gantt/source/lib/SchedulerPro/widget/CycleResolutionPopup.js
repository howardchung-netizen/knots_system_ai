import SchedulingIssueResolutionPopup from './SchedulingIssueResolutionPopup.js';
import '../../Core/widget/Combo.js';

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
export default class CycleResolutionPopup extends SchedulingIssueResolutionPopup {

    static get $name() {
        return 'CycleResolutionPopup';
    }

    // Factoryable type name
    static get type() {
        return 'cycleresolutionpopup';
    }

    getDependencyTitle(dependency) {
        return `"${dependency.fromEvent.name}" -> "${dependency.toEvent.name}"`;
    }

    getResolutionWidgetConfig(resolution) {
        const
            { dependency }      = resolution,
            invalidDependencies = this.schedulingIssue.getInvalidDependencies(),
            result              = super.getResolutionWidgetConfig(...arguments),
            isAlreadyChecked    = this._dependencyResolutionIsChecked;

        // if that's an invalid dependency resolution
        if (dependency && invalidDependencies.indexOf(dependency) >= 0) {
            let checked;

            // if it's the first resolution for that dependency - check it
            if (!isAlreadyChecked[dependency.id]) {
                isAlreadyChecked[dependency.id] = true;
                checked = true;
            }
            else {
                checked = false;
            }

            Object.assign(result, {
                weight      : 0,
                toggleGroup : `dependency-${dependency.id}`,
                checked
            });
        }

        return result;
    }

    getResolutions() {
        const
            { schedulingIssue } = this,
            invalidDependencies = schedulingIssue?.getInvalidDependencies();

        let resolutions = schedulingIssue?.getResolutions();

        // If there are invalid dependencies involved (like parent-child or self-to-self)
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
            const
                dependencies        = schedulingIssue.getDependencies(),
                invalidDependencies = schedulingIssue.getInvalidDependencies(),
                validDependencies   = dependencies.filter(dependency => !invalidDependencies.includes(dependency));

            if (invalidDependencies.length) {
                !me.widgetMap.invalidDependenciesDescription && me.add({
                    type   : 'widget',
                    ref    : 'invalidDependenciesDescription',
                    weight : -50,
                    cls    : 'b-invalid-dependencies-description',
                    html   : me.L('L{invalidDependencyLabel}')
                });
            }
            else {
                !me.widgetMap.dependencyField && me.add({
                    type      : 'combo',
                    ref       : 'dependencyField',
                    weight    : 50,
                    name      : 'dependency',
                    label     : me.L('L{dependencyLabel}'),
                    cls       : 'b-dependency-field',
                    items     : validDependencies?.map(dep => ({ value : dep.id, text : me.getDependencyTitle(dep) })),
                    listeners : {
                        change : 'up.onDependencyChange'
                    }
                });
            }
        }
    }

    get canApply() {
        const { widgetMap } = this;

        // can apply if any resolution and dependency is chosen or if cancel is selected
        return super.canApply &&
            (widgetMap.cancelResolution.checked || (!widgetMap.dependencyField || widgetMap.dependencyField.value));
    }

    onDependencyChange({ source, value }) {
        // toggle ok/cancel controls state
        this.toggleControlsState();
    }

    getResolutionParameters(resolution) {
        // These resolution types need a dependency to be passed to resolve() method as an argument
        if (resolution.isRemoveDependencyCycleEffectResolution || resolution.isDeactivateDependencyCycleEffectResolution) {
            const
                dependencyId = this.widgetMap.dependencyField.value,
                dependency = this.project.dependencyStore.getById(dependencyId);



            return [dependency];
        }

        return super.getResolutionParameters(resolution);
    }

    onResolutionChange({ source, value }) {
        super.onResolutionChange(...arguments);

        // if some option is checked
        if (value) {
            const { cancelResolution } = this.widgetMap;

            // if resolution option is chosen
            if (source?.resolution?.dependency) {
                cancelResolution.checked = false;
            }
            // if cancel is chosen
            else if (source === cancelResolution) {
                this.eachWidget(widget => {
                    if (widget.resolution && widget.checked && widget !== cancelResolution) {
                        widget.checked = false;
                    }
                });
            }

            // toggle ok/cancel controls state
            this.toggleControlsState();
        }
    }
};

// Register this widget type with its Factory
CycleResolutionPopup.initClass();
