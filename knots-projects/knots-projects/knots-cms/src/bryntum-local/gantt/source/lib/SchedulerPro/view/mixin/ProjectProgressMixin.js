import Base from '../../../Core/Base.js';
import DomHelper from '../../../Core/helper/DomHelper.js';

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
export default Target => class ProjectProgressMixin extends (Target || Base) {

    static get $name() {
        return 'ProjectProgressMixin';
    }

    static configurable = {
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
        projectProgressReporting : 'auto',

        projectProgressThreshold : 5000
    };

    updateProject(project, old) {
        super.updateProject(project, old);

        this.setupProgressListener();

        this.detachListeners('delayedCalculation');

        if (project?.delayCalculation) {
            project.on({
                name                  : 'delayedCalculation',
                delayCalculationStart : 'internalOnProjectDelayCalculationStart',
                delayCalculationEnd   : 'internalOnProjectDelayCalculationEnd',
                thisObj               : this
            });
        }
    }

    //region Progress

    setupProgressListener() {
        const me = this;

        me.detachListeners('projectProgress');

        if (me.projectProgressReporting) {
            me.project?.on({
                name     : 'projectProgress',
                progress : 'onProjectProgress',
                thisObj  : me
            });
        }
    }

    updateProjectProgressReporting() {
        if (!this.isConfiguring) {
            this.setupProgressListener();
        }
    }

    // Do not remove. Assertion strings for Localization sanity check
    // 'L{SchedulerProBase.storePopulation}' => Loading data
    // 'L{SchedulerProBase.propagating}' => Calculating project
    // 'L{SchedulerProBase.finalizing}' => Finalizing results

    onProjectProgress({ total, remaining, phase = 'propagating' }) {
        const me = this;

        if (!me.isPainted) {
            return;
        }

        // Dont display progress for very small changesets
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
                    parent        : me.timeAxisSubGrid.header.element,
                    retainElement : true,
                    className     : 'b-calculation-progress-wrap',
                    children      : [{
                        className : 'b-calculation-progress'
                    }]
                });
            }

            progressElement.firstElementChild.style.width = `${((total - remaining) / total) * 100}%`;

            if (total > 0 && remaining === 0) {
                // Want to show full progress, remove in a bit
                me.calculationProgressTimeout = me.setTimeout(() => {
                    progressElement?.remove();
                    me.calculationProgressElement = null;
                }, 50);
            }
            else {
                me.clearTimeout(me.calculationProgressTimeout);
            }
        }
        else {
            const
                str  = me.L(`L{SchedulerProBase.${phase}}`),
                text = total ? `${str} ${Math.round(100 * (total - remaining) / total)}%` : str;

            if (!me.masked) {
                me.mask({
                    maxProgress   : total,
                    useTransition : false,
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
    }

    //endregion

    //region Read-only

    // Delayed calculation mode started, set read-only (unless already configured as such) to block user from changing
    // data while it is in an invalid, un-calculated, state.
    internalOnProjectDelayCalculationStart() {
        if (!this.readOnly) {
            this.$delayCalculationReadOnly = this.readOnly = true;
        }
    }

    // Delayed calculation has finished, reset if made readonly by it
    internalOnProjectDelayCalculationEnd() {
        if (this.$delayCalculationReadOnly) {
            this.$delayCalculationReadOnly = this.readOnly = false;
        }
    }

    //endregion

    get widgetClass() {}
};
