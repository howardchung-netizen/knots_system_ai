import Combo from '../../Core/widget/Combo.js';
import List from '../../Core/widget/List.js';
import Collection from '../../Core/util/Collection.js';
import TextField from '../../Core/widget/TextField.js';
import StringHelper from '../../Core/helper/StringHelper.js';
import DateHelper from '../../Core/helper/DateHelper.js';
import LocaleManager from '../../Core/localization/LocaleManager.js';
import Objects from '../../Core/helper/util/Objects.js';
import Dependencies from '../../Scheduler/feature/Dependencies.js';

/**
 * @module Gantt/widget/DependencyField
 */

// Enables toggling of link type for each side
const
    toggleTypes = {
        from : [2, 3, 0, 1],
        to   : [1, 0, 3, 2]
    },
    fromTo = {
        from : 1,
        to   : 1
    },
    buildDependencySuffixRe = () => new RegExp(`(${dependencyTypes.join('|')})?((?:[+-])\\d+[a-z]*)?`, 'i');

// For parsing dependency strings and converting string to type.
// dependencyTypes may be localized in the Gantt class domain
// in which case the Regex is generated from the four local values.
// TODO Move to static class field?
let dependencyTypes = [
        'SS',
        'SF',
        'FS',
        'FF'
    ],
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
export default class DependencyField extends Combo {
    //region Config

    static get $name() {
        return 'DependencyField';
    }

    // Factoryable type name
    static get type() {
        return 'dependencyfield';
    }

    static get configurable() {
        return {
            listCls : 'b-predecessor-list',

            displayField : 'name',

            valueField : 'name',

            picker : {
                floating            : true,
                scrollAction        : 'realign',
                itemsFocusable      : false,
                activateOnMouseover : true,
                align               : {
                    align    : 't0-b0',
                    axisLock : true
                },
                maxHeight  : 324,
                minHeight  : 161,
                scrollable : {
                    overflowY : true
                },
                autoShow     : false,
                focusOnHover : false
            },

            /**
             * Delimiter between dependency ids in the field
             * @config {String}
             * @default
             */
            delimiter : ';',

            /**
             * The dependency store
             * @config {Gantt.data.DependencyStore}
             * @default
             */
            dependencyStore : null,

            /**
             * The other task's relationship with this field's contextual task.
             * This will be `'from'` if we are editing predecessors, and `'to'` if
             * we are editing successors.
             * @config {String}
             */
            otherSide : null,

            /**
             * This field's contextual task's relationship with the other task.
             * This will be `'to'` if we are editing predecessors, and `'from'` if
             * we are editing successors.
             * @config {String}
             */
            ourSide : null,

            multiSelect : true,

            chipView : null,

            validateOnInput : false,

            /**
             * A task field (id, wbsCode, sequenceNumber etc) that will be used when displaying and editing linked tasks. Defaults to {@link Gantt/view/GanttBase#config-dependencyIdField Gantt#dependencyIdField}
             * @config {String}
             */
            dependencyIdField : null,

            /**
             * The task whose dependencies are being edited (used to filter out invalid options)
             * @config {String}
             * @internal
             */
            eventRecord : null,

            /**
             * The sorters defining how to sort tasks in the drop down list, defaults to sorting by `name` field ascending.
             * See {@link Core.data.mixin.StoreSort} for more information.
             * @config {Object[]|String[]}
             */
            sorters : [
                {
                    field : 'name'
                }
            ]
        };
    }

    //endregion

    construct(config) {
        const
            me                     = this,
            { ourSide, otherSide } = config;



        me.dependencies = new Collection({
            extraKeys : otherSide
        });
        me.startCollection = new Collection({
            extraKeys : otherSide
        });
        super.construct(config);

        me.delimiterRegEx = new RegExp(`\\s*${me.delimiter}\\s*`);

        const localizeDependencies = () => {
            dependencyTypes = me.L('L{DependencyType.short}');
            dependencySuffixRe = buildDependencySuffixRe();
            me.syncInputFieldValue();
        };

        // Update when changing locale
        LocaleManager.on({ locale : localizeDependencies, thisObj : me });

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
        const { key } = keyEvent;

        // Don't pass Enter down, that selects when ComboBox passes it down
        // to its list. We want default action on Enter.
        // Our list has its own, built in filter field which provides key events.
        if (key === 'Enter') {
            this.syncInvalid();
        }
        else {
            super.onInternalKeyDown && super.onInternalKeyDown(keyEvent);
        }
        if (this.pickerVisible && key === 'ArrowDown') {
            this.filterField.focus();
        }
    }

    onTriggerClick() {
        if (this.pickerVisible) {
            super.onTriggerClick();
        }
        else {
            this.doFilter(this.filterInput ? this.filterInput.value : null);
        }
    }

    changeStore(store) {
        // Filter the store to hide the field's Task
        store = store.chain(record => !this.eventRecord || (record.id !== this.eventRecord.id), null, {
            excludeCollapsedRecords : false
        });

        store.sort(this.sorters);

        return super.changeStore(store);
    }

    changePicker(picker, oldPicker) {
        const
            me          = this,
            myInput     = me.input,
            filterField = me.filterField || (me.filterField = new TextField({
                cls         : 'b-dependency-list-filter',
                owner       : me,
                clearable   : true,
                placeholder : 'Filter',
                triggers    : {
                    filter : {
                        cls   : 'b-icon b-icon-filter',
                        align : 'start'
                    }
                },
                listeners : {
                    input({ value }) {
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
                owner      : me,
                store      : me.store,
                cls        : `b-dependency-list ${me.listCls}`,
                itemTpl    : me.listItemTpl,
                forElement : me[me.pickerAlignElement],
                align      : {
                    anchor : me.overlayAnchor,
                    target : me[me.pickerAlignElement]
                },

                navigator : {
                    keyEventTarget : filterFieldInput,
                    processEvent   : e => {
                        if (e.key === 'Escape') {
                            me.hidePicker();
                        }
                        else {
                            return e;
                        }
                    }
                },
                onItem         : me.onPredecessorClick.bind(me),
                getItemClasses : function(task) {
                    const
                        result     = List.prototype.getItemClasses.call(this, task),
                        dependency = me.dependencies.getBy(me.otherSide + 'Event', task),
                        cls        = dependency ? ` b-selected b-${dependency.getConnectorString(1).toLowerCase()}` : '';

                    return result + cls;
                }
            }, picker) : null, me);

        // May have been set to null (destroyed)
        if (result) {
            filterField.render(result.contentElement);
        }
        // If it has been destroyed, destroy orphaned filterField
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

    onPickerShow({ source : picker }) {
        const
            me          = this,
            filterField = me.filterField,
            ourInput    = me.input;

        picker.minWidth = me[me.pickerAlignElement].offsetWidth;
        picker.contentElement.insertBefore(filterField.element, picker.contentElement.firstChild);

        // Combo superclass focuses this.input upon picker show.
        // This must focus the filter field, not the predecessor text.
        me.input = me.filterInput;
        super.onPickerShow();
        me.input = ourInput;
    }

    listItemTpl(task) {
        const
            taskName       = StringHelper.encodeHtml(task.name),
            idField        = (this.owner.dependencyIdField && this.owner.dependencyIdField !== task.constructor.idField) ? this.owner.dependencyIdField : task.constructor.idField,
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
        const
            me                     = this,
            dependenciesCollection = me.dependencies;

        // Convert strings, eg: '1fs-2h;2ss+1d' to Dependency records
        if (typeof dependencies === 'string') {
            me.input.value = dependencies;

            dependencies = me.parseDependencies(dependencies);
            if (!dependencies) {
                me.syncInvalid();
                return;
            }

            dependencies = dependencies.map(dep => new me.dependencyStore.modelClass(dep));
        }
        else {
            me.startCollection.clear();
            me.startCollection.values = dependencies;
        }

        dependenciesCollection.clear();
        dependenciesCollection.values = dependencies;

        // If there has been a change, update the textual value.
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

    onPredecessorClick({ source : list, item, record : task, event }) {
        const
            me           = this,
            dependencies = me.dependencies,
            box          = event.target.closest('.b-sch-box'),
            side         = box && box.dataset.side;

        let dependency = dependencies.getBy(me.otherSide + 'Event', task);

        // Prevent regular selection continuing after this click handler.
        item.dataset.noselect = true;

        // Click text to remove predecessor completely
        if (dependency && !box) {
            dependencies.remove(dependency);
        }
        else {
            // Clicking a connect side box toggles that
            if (dependency) {
                // We must create a clone because the record is "live".
                // Updates to it go back to the UI.
                // Also we cannot really modify record here. When editing will finish editor will compare `toJSON`
                // output of models, which refers to the `model.data` field. And if we modify record instance, change
                // won't go to the data object, it will be kept in the field though. Only way to sync model.data.type and
                // model.type here is to instantiate model with correct data already
                const
                    { id, type } = dependency;

                // Using private argument here to avoid copying record current values, we're only interested in data object
                dependency = dependency.copy({ id, type : toggleTypes[side][type] }, { skipFieldIdentifiers : true });
                // HACK: Above code results having serialized values in `${me.otherSide}Event` field
                // and we expect to find task instance when doing code like:
                //     dependencies.getBy(me.otherSide + 'Event', task)
                // So let's put the task instance there manually.
                dependency[`${me.otherSide}Event`] = task;
                dependency[`${me.ourSide}Event`] = me.task;

                // Replace the old predecessor link with the new, modified one.
                // Collection will *replace* in-place due to ID matching.
                dependencies.add(dependency);
            }
            // Create a new dependency to/from the clicked task
            else {
                dependencies.add(me.dependencyStore.createRecord({
                    [`${me.otherSide}Event`] : task,
                    [`${me.ourSide}Event`]   : me.task
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
            return event?.isModel ? event[eventIdField] : (event || '');
        };

        if (dependencies?.length) {
            const result = dependencies.sort((a, b) => getEventId(a) - getEventId(b)).map(dependency =>
                `${getEventId(dependency)}${Dependencies.getLocalizedDependencyType(dependency.getConnectorString())}${dependency.getLag()}`
            );

            return result.join(delimiter);
        }

        return '';
    }

    // static * dependenciesToStringGenerator(dependencies, otherSide, delimiter = ';') {
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
        return this.owner?.record;
    }

    parseDependencies(value) {
        const
            me              = this,
            task            = me.task,
            taskStore       = me.store,
            dependencyStore = me.dependencyStore,
            dependencies    = value.split(me.delimiterRegEx),
            DependencyModel = dependencyStore.modelClass,
            result          = [];

        for (let i = 0; i < dependencies.length; i++) {
            const
                dependencyText = dependencies[i];

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
                }

                // Chop off connector and lag specification, i.e. the "SS-1h" part
                const
                    remainder = dependencyText.substr(idLen + 1),
                    // Start the structure of the dependency we are describing
                    dependency = {
                    // This will be "from" if we're editing predecessors
                    // and "to" if we're editing successors
                        [`${me.otherSide}Event`] : linkedTask,

                        // This will be "to" if we're editing predecessors
                        // and "from" if we're editing successors
                        [`${me.ourSide}Event`] : task,

                        type : DependencyModel.Type.EndToStart
                    };

                // There's a trailing edge/lag spec
                if (remainder.length) {
                    const
                        edgeAndLag = dependencySuffixRe.exec(remainder);

                    if (edgeAndLag && (edgeAndLag[1] || edgeAndLag[2])) {
                        // The SS/FF bit
                        if (edgeAndLag[1]) {
                            dependency.type = dependencyTypes.indexOf(edgeAndLag[1].toUpperCase());
                        }
                        // The -1h bit
                        if (edgeAndLag[2]) {
                            const
                                parsedLag = DateHelper.parseDuration(edgeAndLag[2], true, task.durationUnit);
                            dependency.lag = parsedLag.magnitude;
                            dependency.lagUnit = parsedLag.unit;
                        }
                    }
                    else {
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
};

// Register this widget type with its Factory
DependencyField.initClass();
