import GridTreeGroup from '../../Grid/feature/TreeGroup.js';
import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import WalkHelper from '../../Core/helper/WalkHelper.js';

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
export default class TreeGroup extends GridTreeGroup {

    static $name = 'TreeGroup';

    // Override in subclasses to wait for initial data readiness before transforming, for example to wait for engine
    // calculations in Gantt
    async waitForReadiness() {
        await super.waitForReadiness();

        const { project } = this.client;

        if (project.isLoadingOrSyncing) {
            await project.await('requestDone');
        }

        await project.commitAsync();
    }

    processParentData(parentData) {
        super.processParentData(parentData);

        this.$groupParentIds.push(parentData.id);

        // Make all tasks manually scheduled, to stay put when the tree is transformed
        if (parentData.children[0]?.isModel) {
            for (const task of parentData.children) {
                // Store current setting to be able to restore it on clear
                task.$manuallyScheduled = task.manuallyScheduled;
                task.manuallyScheduled = true;
            }
        }
    }

    restoreChildRecord(task) {
        super.restoreChildRecord(task);

        // Restore original manually scheduled state
        if (task.$manuallyScheduled != null) {
            task.manuallyScheduled = task.$manuallyScheduled;
            task.$manuallyScheduled = null;
        }
    }

    async applyLevels(levels, applyToStore, refresh = true) {
        const
            me         = this,
            { client } = me;

        me.isApplying++;

        client.suspendRefresh();

        if (levels) {
            // For Gantt we always have to go back to the original dataset before applying new levels, otherwise we
            // loose dependencies etc
            if (me.$groupParentIds?.length) {
                await me.clearGroups(false);
                await client.project.commitAsync();
            }

            me.$groupParentIds = [];
        }

        const
            // Let Grid's feature create the tree structure, without loading it into store.
            // We need to do it in a engine friendly way here
            transformedData = await super.applyLevels(levels, false),
            { store }       = client;

        if (me.isDestroyed) {
            return;
        }

        if (levels) {
            transformedData.root = true;

            // First preprocess tasks and generated parents, adapting to engine requirements
            WalkHelper.preWalk(transformedData, task => task.children, task => {
                // Modify the deepest level of generated parents, the ones that contain all tasks (isModel), to not have
                // any children when they are added to the TaskStore. If they do, engine goes mad
                if (!task.isModel && task.children[0].isModel) {
                    task.$children = task.children;
                    task.children = null;
                }
            });

            // Then add the first level of generated parents to the TaskStore, it will in the process add all sub levels
            // but not the already existing tasks since we excluded those above
            for (const parent of transformedData.children) {
                // Add the parent (+ descendant parents)
                const [newParent] = store.add(parent, true);
                // Then add all existing tasks to it, keeping engine happy (making it a move rather then an add)
                newParent.traverse(generatedParent => {
                    if (generatedParent.data.$children) {
                        generatedParent.appendChild(generatedParent.data.$children);
                        generatedParent.data.$children = null;
                    }
                });
            }

            // Hide the original parents, if we remove them we loose engine state
            store.filter({
                id       : 'tree-group', // no-sanity
                // Prevent users from removing it by accident
                internal : true,
                filterBy : r => !r.$originalChildren
            });
        }
        else {
            // Remove generated parents
            store.remove(me.$groupParentIds, true);
            me.$groupParentIds = null;

            // Remove filter to restore original parents
            store.removeFilter('tree-group');
        }

        await client.project.commitAsync();

        if (me.isDestroyed) {
            return;
        }

        // Grouping is to be considered a dataset (sort of), clear changes on the store level (keeping record level
        // changes intact)
        store.added.clear();
        store.removed.clear();
        store.modified.clear();

        client.resumeRefresh(false);

        // Explicit refresh without transition (resuming with true would transition)
        refresh && client.refresh();

        me.isApplying--;
    }

    async clearGroups(refresh) {
        await this.applyLevels(null, false, refresh);
    }
}

GridFeatureManager.registerFeature(TreeGroup, false, 'Gantt');
