import GridFeatureManager from '../../Grid/feature/GridFeatureManager.js';
import SchedulerDependencyEdit from '../../Scheduler/feature/DependencyEdit.js';
import '../../Core/widget/Checkbox.js';

/**
 * @module SchedulerPro/feature/DependencyEdit
 */

/**
 * Feature that displays a popup containing fields for editing dependency data.
 *
 * This feature is **off** by default. For info on enabling it, see {@link Grid/view/mixin/GridFeatures}.
 *
 * @extends Scheduler/feature/DependencyEdit
 * @inlineexample SchedulerPro/feature/DependencyEdit.js
 * @typings Scheduler/feature/DependencyEdit -> Scheduler/feature/SchedulerDependencyEdit
 * @demo SchedulerPro/dependencies/
 * @classtype dependencyEdit
 * @feature
 */
export default class DependencyEdit extends SchedulerDependencyEdit {
    //region Config

    static get $name() {
        return 'DependencyEdit';
    }

    static get configurable() {
        return {
            /**
             * True to show the lag field for the dependency
             * @config {Boolean}
             * @default
             * @category Editor widgets
             */
            showLagField : true,

            editorConfig : {
                items : {
                    activeField : {
                        type  : 'checkbox',
                        name  : 'active',
                        label : 'L{Active}'
                    }
                }
            }
        };
    }
    //endregion
}

GridFeatureManager.registerFeature(DependencyEdit, false);
