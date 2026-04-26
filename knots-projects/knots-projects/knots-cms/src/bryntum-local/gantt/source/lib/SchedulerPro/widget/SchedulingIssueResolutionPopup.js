import Popup from '../../Core/widget/Popup.js';
import '../../Core/widget/Radio.js';
import { EffectResolutionResult } from '../../Engine/chrono/SchedulingIssueEffect.js';
import '../localization/En.js';
import Promissory from '../../Core/helper/util/Promissory.js';

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
export default class SchedulingIssueResolutionPopup extends Popup {

    static get $name() {
        return 'SchedulingIssueResolutionPopup';
    }

    // Factoryable type name
    static get type() {
        return 'schedulingissueresolutionpopup';
    }

    static get configurable() {
        return {
            localizableProperties : [],
            schedulingIssue       : null,
            align                 : 'b-t',
            autoShow              : false,
            autoClose             : false,
            closeAction           : 'onCloseButtonClick',
            modal                 : true,
            centered              : true,
            scrollAction          : 'realign',
            constrainTo           : globalThis,
            draggable             : false,
            closable              : true,
            floating              : true,
            cls                   : 'b-schedulerpro-issueresolutionpopup',
            layout                : 'vbox',
            items                 : {
                description : {
                    type   : 'widget',
                    cls    : 'b-error-description',
                    weight : -100
                }
            },
            bbar : {
                defaults : {
                    localeClass : this
                },
                items : {
                    applyButton : {
                        weight   : 100,
                        color    : 'b-raised b-blue',
                        text     : 'L{Apply}',
                        onClick  : 'up.onApplyButtonClick',
                        disabled : true
                    },
                    cancelButton : {
                        weight  : 200,
                        color   : 'b-gray',
                        text    : 'L{Object.Cancel}',
                        onClick : 'up.onCancelButtonClick'
                    }
                }
            }
        };
    }

    static properties = {
        selectedResolutions : new Set()
    };

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
        const
            me                      = this,
            { selectedResolutions } = me;

        if (selectedResolutions.size) {
            // apply selected resolutions
            selectedResolutions.forEach(resolution => resolution.resolve(...me.getResolutionParameters(resolution)));

            me.continueWithResolutionResult(EffectResolutionResult.Resume);

            me.doResolve(selectedResolutions);
        }
        else {
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
        const
            me            = this,
            { resolving } = me;

        if (resolving) {
            me.resolving.resolve(resolutions);
            me.resolving = null;
            me.schedulingIssue = null;
            me.hide();
        }
    }

    getResolutionWidgetConfig(resolution) {
        return {
            type        : 'radio',
            text        : resolution.getDescription(),
            cls         : 'b-resolution',
            weight      : 100,
            toggleGroup : 'resolutions',
            localeClass : this,
            listeners   : {
                change : 'up.onResolutionChange'
            },
            resolution
        };
    }

    getResolutions() {
        return this.schedulingIssue?.getResolutions();
    }

    updatePopupContent(schedulingIssue, continueWithResolutionResult) {
        const me = this;

        if (continueWithResolutionResult) {
            me.continueWithResolutionResult = continueWithResolutionResult;
        }

        if (schedulingIssue) {
            me.selectedResolutions.clear();
            me.schedulingIssue = schedulingIssue;
        }
        else {
            schedulingIssue = me.schedulingIssue;
        }

        // L{schedulingConflict}
        // L{emptyCalendar}
        // L{cycle}
        me.title = schedulingIssue?.type ? me.optionalL(schedulingIssue.type) : 'Unknown error';

        me.widgetMap.description.content = schedulingIssue?.getDescription();

        const
            resolutions     = me.getResolutions(),
            resolutionItems = resolutions?.map(resolution => me.getResolutionWidgetConfig(resolution)) || [];

        me.remove(me.queryAll(widget => widget.isCheckbox));

        me.add(...resolutionItems, {
            type        : 'radio',
            ref         : 'cancelResolution',
            text        : 'L{Cancel changes}',
            toggleGroup : 'resolutions',
            localeClass : this,
            weight      : 200,
            cls         : 'b-resolution',
            listeners   : {
                change : 'up.onResolutionChange'
            }
        });

        // toggle ok/cancel controls state
        me.toggleControlsState();
    }

    get canApply() {
        return this.selectedResolutions.size || this.widgetMap.cancelResolution.checked;
    }

    get canCancel() {
        // cancel makes no sense for initial transaction
        return !this.project?.isInitialCommit;
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
        }
        // if resolution option is clicked
        else if (source?.resolution) {
            // add - if checked
            if (value) {
                this.selectedResolutions.add(source.resolution);
            }
            // ..remove if unchecked
            else {
                this.selectedResolutions.delete(source.resolution);
            }
        }

        // toggle ok/cancel controls state
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
};

// Register this widget type with its Factory
SchedulingIssueResolutionPopup.initClass();
