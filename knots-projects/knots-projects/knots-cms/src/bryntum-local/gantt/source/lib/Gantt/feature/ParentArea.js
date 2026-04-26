import InstancePlugin from '../../Core/mixin/InstancePlugin.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';

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
export default class ParentArea extends InstancePlugin {
    static $name = 'ParentArea';

    static pluginConfig = {
        chain : ['onBeforeTaskSync']
    }

    // Map to keep track of highlighted parents, holds DomConfigs keyed by parentRecord
    highlighted = new Map();

    // Recursively highlight self and all unhighlighted ancestors
    highlightParent(parentRecord) {
        const { highlighted } = this;

        if (parentRecord && !parentRecord.isProjectModel && !highlighted.has(parentRecord)) {
            const
                { client }          = this,
                { rowOffsetHeight } = client.rowManager,
                descendants         = parentRecord.visibleDescendantCount,
                box                 = client.getTaskBox(parentRecord);

            if (!box) {
                return;
            }

            const domConfig = {
                className : {
                    'b-parent-area' : 1
                },
                style : {
                    top    : box.top,
                    height : (descendants + 1) * rowOffsetHeight - box.top % rowOffsetHeight, // +1 for self
                    left   : box.left,
                    width  : box.width
                },
                dataset : {
                    taskId : `parent-area-${parentRecord.id}`
                }
            };

            highlighted.set(parentRecord, domConfig);

            this.highlightParent(parentRecord.parent);
        }
    }

    // Called after collecting all task configs, before DomSyncing them
    onBeforeTaskSync(configs) {
        if (!this.disabled) {
            const { highlighted, client } = this;

            // Start from scratch to not have to keep track of modifications, collecting task area configs is cheap
            highlighted.clear();

            // Highlight all parents whose area intersects the view, which we know if a child is among rendered rows
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

GridFeatureManager.registerFeature(ParentArea, false, 'Gantt');
