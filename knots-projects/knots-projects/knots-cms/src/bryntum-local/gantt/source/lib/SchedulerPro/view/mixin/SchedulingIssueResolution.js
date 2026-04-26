import CycleResolutionPopup from '../../widget/CycleResolutionPopup.js';
import SchedulingIssueResolutionPopup from '../../widget/SchedulingIssueResolutionPopup.js';
import Base from '../../../Core/Base.js';

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
export default Target => class SchedulingIssueResolution extends (Target || Base) {

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
            schedulingIssueResolutionPopupClass : SchedulingIssueResolutionPopup,

            /**
             * Class implementing the popup resolving _scheduling cycles_.
             *
             * Use this to provide a custom popup for that case.
             * @config {Function}
             * @default
             * @category Conflict resolution
             */
            cycleResolutionPopupClass : CycleResolutionPopup,

            /**
             * Set to `true` to display special popups allowing user
             * to resolve {@link SchedulerPro/widget/SchedulingIssueResolutionPopup scheduling conflicts},
             * {@link SchedulerPro/widget/CycleResolutionPopup cycles} or calendar misconfigurations.
             * The popup will suggest user ways to resolve the corresponding case.
             * @config {Boolean}
             * @default
             * @category Conflict resolution
             */
            displaySchedulingIssueResolutionPopup : true
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
            name               : 'schedulingIssueResolution',
            schedulingConflict : 'onProjectSchedulingIssueEvent',
            emptyCalendar      : 'onProjectSchedulingIssueEvent',
            cycle              : 'onProjectSchedulingIssueEvent',
            thisObj            : this
        });
    }

    get isResolving() {
        return this._lastSchedulingIssueResolutionPopup?.isResolving;
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
                rootElement : this.rootElement
            }));
        }
        else {
            return this._schedulingIssueResolutionPopup || (this._schedulingIssueResolutionPopup = new this.schedulingIssueResolutionPopupClass({
                rootElement : this.rootElement
            }));
        }
    }

    onProjectSchedulingIssueEvent({ schedulingIssue }) {
        const popup = this.getSchedulingIssueResolutionPopup(schedulingIssue);

        this._lastSchedulingIssueResolutionPopup = popup;

        popup.resolve(...arguments);
    }

    get widgetClass() {}
};
