import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import Delayable from '../../Core/mixin/Delayable.js';
import InstancePlugin from '../../Core/mixin/InstancePlugin.js';

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
export default class CriticalPaths extends Delayable(InstancePlugin) {
    //region Config

    static get $name() {
        return 'CriticalPaths';
    }

    static get defaultConfig() {
        return {
            cls                   : 'b-gantt-critical-paths',
            criticalDependencyCls : 'b-critical',
            disabled              : true
        };
    }

    static get pluginConfig() {
        return {
            chain : ['onTaskDataGenerated']
        };
    }

    //endregion

    //region Init

    doDisable(disable) {
        const me = this;

        if (disable) {
            me.unhighlightCriticalPaths();
        }
        // Highlight now if we have entered graph
        else if (me.client.project.graph) {
            me.highlightCriticalPaths();
        }
        // In delayed calculation mode (the default) we might not be in graph yet, postpone highlighting until we are
        else {
            me.client.project.on({
                graphReady() {
                    me.highlightCriticalPaths();
                },
                thisObj : me,
                once    : true
            });
        }

        super.doDisable(disable);
    }

    getDependenciesFeature() {
        // return dependencies feature only when it's ready
        return this.client.foregroundCanvas && this.client.features.dependencies;
    }

    setupObserver() {
        const
            me = this,
            { project }  = me.client;

        let dependencies;

        // destroy previous observer if any
        me.destroyObserver();

        me.criticalPathObserver = project.getGraph().observe(function * () {
            return yield project.$.criticalPaths;

        }, criticalPaths => {
            // if the feature is not disabled
            if (!me.disabled) {
                me.removeCriticalCls();

                // check if dependencies feature is there
                if ((dependencies = dependencies || me.getDependenciesFeature())) {
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
        const
            me          = this,
            { element } = me.client;

        // the component has cls set means we had CPs rendered so need to clean them
        if (element.classList.contains(me.cls)) {
            me.unhighlightCriticalPaths();
        }

        me.setupObserver();

        // add the feature base cls to enable stylesheets
        element.classList.add(me.cls);
    }

    removeCriticalCls() {
        const
            project      = this.client.project,
            dependencies = this.getDependenciesFeature();

        // if we have dependencies rendered remove classes from them
        if (dependencies) {
            project.dependencyStore.forEach(dependency => dependencies.unhighlight(dependency, this.criticalDependencyCls));
        }
    }

    unhighlightCriticalPaths() {
        const
            me     = this,
            client = me.client;

        // destroy criticalPath atom observer
        me.destroyObserver();

        me.removeCriticalCls();

        // remove the feature base cls
        client.element.classList.remove(me.cls);

        /**
         * Fired when critical paths get hidden.
         *
         * See also: {@link #event-criticalPathsHighlighted}
         * @event criticalPathsUnhighlighted
         */
        client.trigger('criticalPathsUnhighlighted');
    }

    //endregion

    // Add DOMConfigs for enabled indicators as `extraConfigs` on the task. Will in the end be added to the task row
    onTaskDataGenerated(renderData) {
        if (!this.disabled) {
            renderData.cls['b-critical'] = renderData.taskRecord.critical;
        }
    }
}

GridFeatureManager.registerFeature(CriticalPaths, true, 'Gantt');
