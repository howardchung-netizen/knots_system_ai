import EditorTab from './EditorTab.js';
import { TimeUnit, DependencyType } from '../../../Engine/scheduling/Types.js';
import '../../../Scheduler/column/DurationColumn.js';
import '../DependencyTypePicker.js';
import '../ModelCombo.js';
import '../../../Grid/view/Grid.js';

/**
 * @module SchedulerPro/widget/taskeditor/DependencyTab
 */

const
    markDependencyValid     = (dep, grid) => {
        dep.instanceMeta(grid).valid = true;
    },
    markDependencyInvalid   = (dep, grid) => {
        dep.instanceMeta(grid).valid = false;
    },
    isDependencyMarkedValid = (dep, grid) => dep.instanceMeta(grid).valid !== false;

/**
 * Abstract base class for SuccessorsTab and PredecessorsTab.
 *
 * @extends SchedulerPro/widget/taskeditor/EditorTab
 * @abstract
 */
export default class DependencyTab extends EditorTab {

    //region Config

    static get $name() {
        return 'DependencyTab';
    }

    static get type() {
        return 'dependencytab';
    }

    static get configurable() {
        return {
            /**
             * A task field (`id`, `wbsCode`, `sequenceNumber` etc) that will be used when displaying and editing linked
             * tasks. Defaults to Gantt `dependencyIdField`.
             * @config {String} dependencyIdField
             */
            dependencyIdField : null,

            layoutStyle : {
                flexFlow : 'column nowrap'
            },

            // Documented in subclasses
            sortField : null,

            /**
             * A task field (`id`, `wbsCode`, `sequenceNumber` etc) to sort tasks in the task combo by
             * @config {String}
             * @default
             */
            taskComboSortField : 'name',

            items : {
                grid : {
                    type                       : 'grid',
                    weight                     : 100,
                    flex                       : '1 1 auto',
                    emptyText                  : '',
                    asyncEventSuffix           : 'PreCommit',
                    disableGridRowModelWarning : true,

                    features : {
                        group : false
                    },

                    columns : {
                        data : {
                            id : {
                                localeClass : this,
                                text        : 'L{ID}',
                                flex        : 1,
                                editor      : false,
                                htmlEncode  : false,
                                hidden      : true,
                                sortable(dependency1, dependency2) {
                                    const
                                        { dependencyIdField, direction } = this.grid.parent,
                                        id1                   = dependency1[direction]?.[dependencyIdField],
                                        id2                   = dependency2[direction]?.[dependencyIdField];

                                    if (id1 === id2) {
                                        return 0;
                                    }

                                    return id1 < id2 ? -1 : 1;
                                },
                                renderer : ({ record: dependency, row, grid, column }) => {
                                    let html;
                                    const
                                        { direction } = grid.parent,
                                        linkedEvent   = dependency[direction];

                                    if (linkedEvent && isDependencyMarkedValid(dependency, grid)) {
                                        const
                                            idField = grid.parent.dependencyIdField,
                                            id      = linkedEvent[idField];

                                        if (idField === 'id') {
                                            html = !linkedEvent || linkedEvent.hasGeneratedId ? '*' : linkedEvent.id;
                                        }
                                        else {
                                            html = id;
                                        }
                                    }
                                    else {
                                        row.addCls('b-invalid');
                                        html = '<div class="b-icon b-icon-warning"></div>';
                                    }

                                    return html;
                                }
                            },
                            name : {
                                localeClass : this,
                                text        : 'L{Name}',
                                flex        : 5,
                                renderer    : ({ value : event, grid, cellElement }) => {
                                    if (event) {
                                        // indicate inactive tasks
                                        cellElement.classList.toggle('b-inactive', event.inactive);

                                        const id = event[grid.parent.dependencyIdField];
                                        return event.name + (((id != null) && !event.hasGeneratedId) ? ` (${id})` : '');
                                    }

                                    return '';
                                },
                                finalizeCellEdit : 'up.finalizeLinkedTaskCellEdit',
                                editor           : {
                                    type           : 'modelcombo',
                                    displayField   : 'name',
                                    valueField     : 'id',
                                    filterOperator : '*',
                                    allowInvalid   : true,
                                    listItemTpl(event) {
                                        if (!this._dependencyTab) {
                                            this._dependencyTab = this.up('dependencytab', true);
                                        }

                                        let id = event[this._dependencyTab.dependencyIdField];

                                        id = (id != null && !event.hasGeneratedId) ? `(${id})` : '';

                                        return `${event.name} ${id}`;
                                    }
                                }
                            },
                            type : {
                                localeClass : this,
                                text        : 'L{Type}',
                                field       : 'type',
                                flex        : 3,
                                sortable    : false,
                                editor      : 'dependencytypepicker',
                                renderer({ value }) {
                                    return this.L('L{DependencyType.long}')[value];
                                }
                            },
                            lag : {
                                localeClass : this,
                                text        : 'L{Lag}',
                                type        : 'duration',
                                field       : 'fullLag',
                                flex        : 2,
                                editor      : {
                                    allowNegative : true
                                }
                            }
                        }
                    }
                },
                toolbar : {
                    type  : 'toolbar',
                    dock  : 'bottom',
                    cls   : 'b-compact-bbar',
                    items : {
                        add : {
                            type     : 'button',
                            weight   : 210,
                            cls      : 'b-add-button b-green',
                            icon     : 'b-icon b-icon-add',
                            onAction : 'up.onAddClick'
                        },
                        remove : {
                            type     : 'button',
                            weight   : 220,
                            cls      : 'b-remove-button b-red',
                            icon     : 'b-icon b-icon-trash',
                            disabled : true,
                            onAction : 'up.onRemoveClick'
                        }
                    }
                }
            }
        };
    }

    //endregion

    // Triggered before applying cell editing result to the dependency
    async finalizeLinkedTaskCellEdit({ grid, value : linkedTask, record : dependency }) {
        const
            { project }      = grid.store.masterStore,
            isSuccessor      = this.direction === 'toEvent',
            source           = isSuccessor ? dependency.fromEvent : linkedTask,
            target           = isSuccessor ? linkedTask : dependency.toEvent,
            validationResult = await project.validateDependency(source, target, dependency.type, dependency);

        switch (validationResult) {
            // no error
            case 0:
                return true;
            // cycle
            case 1:
                return 'L{DependencyTab.cyclicDependency}';
        }

        return 'L{DependencyTab.invalidDependency}';
    }

    afterConstruct() {
        super.afterConstruct();

        const
            me           = this,
            grid         = me.grid = me.widgetMap.grid;

        grid.on({
            selectionChange : 'onGridSelectionChange',
            startCellEdit   : 'onGridStartCellEdit',
            finishCellEdit  : 'onGridFinishCellEdit',
            cancelCellEdit  : 'onGridCancelCellEdit',
            thisObj         : me
        });
    }

    updateReadOnly(readOnly) {
        const { add, remove } = this.widgetMap;

        super.updateReadOnly(...arguments);

        // Buttons hide when we are readOnly
        add.hidden = remove.hidden = readOnly;
    }

    get taskCombo() {
        const
            { grid } = this,
            from     = grid?.columns.get(this.direction);

        return from?.editor;
    }

    loadEvent(eventRecord) {

        const
            me                          = this,
            { grid, taskCombo, record } = me;

        super.loadEvent(eventRecord);

        const
            {
                dependencyStore,
                eventStore
            }                   = me.project,
            storeChange         = grid.store.masterStore !== dependencyStore,
            recordChange        = !storeChange && (eventRecord !== record);

        // On first load or if project has changed, populate the chained stores.
        // Our grid store will contain only the direction of dependencies this tab is interested in.
        // Our taskCombo only contains all events other than our event.
        // An event can't depend upon itself.
        if (storeChange) {
            // Cache the mutation generation of the underlying data collection
            // so that we know when we need to refill the chained stores.
            me.depStoreGeneration = dependencyStore.storage.generation;
            me.eventStoreGeneration = eventStore.storage.generation;

            me.detachListeners('taskCombo');

            grid.store = dependencyStore.chain(
                d => d[me.negDirection] === me.record,
                null
            );

            const comboStore = taskCombo.store = eventStore.chain(
                // Remove original record from chained store, but keep those records that are already selected in the dependency grid
                e => e !== me.record,
                null,
                {
                    doRelayToMaster         : [],
                    // Need to show all records in the combo
                    excludeCollapsedRecords : false
                }
            );

            comboStore.sort(me.taskComboSortField);

            // Post process chained store and exclude records that are already selected in the dependency grid.
            // It's needed to be a separate filtering because otherwise when cell editor opens combo and sets initial value,
            // it cannot find it in the storage and adds new record.
            comboStore.filterBy(e => !grid.store.find(d => {
                const
                    dep          = d[me.direction],
                    activeEdit   = me._activeCellEdit,
                    isDepEditing = activeEdit && dep === activeEdit.record[me.direction];

                // checking !isDepEditing will keep as combo option the current record
                return dep === e && !isDepEditing;
            }));

            taskCombo.on({
                name    : 'taskCombo',
                change  : 'onGridCellEditChange',
                thisObj : me
            });
        }
        else {


            // Only repopulate the chained stores if the master stores have changed
            // or if this is being loaded with a different record.
            if (recordChange || dependencyStore.storage.generation !== me.depStoreGeneration) {
                grid.store.fillFromMaster();
                me.depStoreGeneration = dependencyStore.storage.generation;
            }
            // If not changed, the details within the store may have changed
            // (for example undo on edit cancel), so refresh the grid.
            else {
                grid.refreshRows();
            }

            if (recordChange || eventStore.storage.generation !== me.eventStoreGeneration) {
                taskCombo.store.fillFromMaster();
                me.eventStoreGeneration = eventStore.storage.generation;
            }
        }

        if (recordChange) {
            grid.store.sort(me.sortField);
        }

        me.requestReadyStateChange();
    }

    async insertNewDependency() {
        const
            me              = this,
            { grid }        = me,
            depStore        = grid.store,
            projectDepStore = me.project.dependencyStore;

        // This call will be relayed to project dependency store.
        const [newDep] = depStore.insert(0, {
            type              : DependencyType.EndToStart,
            lag               : 0,
            lagUnit           : TimeUnit.Day,
            [me.negDirection] : me.record
        });

        // Reset the dependency store mutation monitor when we add a dependency
        me.depStoreGeneration = projectDepStore.storage.generation;

        grid.features.cellEdit.startEditing({ field : me.direction, id : newDep.id });

        markDependencyInvalid(newDep, grid);

        return newDep;
    }

    onAddClick() {
        this.insertNewDependency();
    }

    onRemoveClick() {
        const
            me           = this,
            grid         = me.grid,
            toRemove     = grid.selectedRecords;

        me.project.dependencyStore.remove(toRemove);
        grid.selectedRecord = grid.store.getNext(toRemove[0]);
        me.taskCombo.store.fillFromMaster();
    }

    onGridSelectionChange({ selection }) {
        const
            removeButton = this.widgetMap.remove,
            disable      = !selection?.length || this.up(w => w.readOnly);

        // Rather than allow auto focus reversion which attempts to focus the same element
        // that focus arrived from, explicitly focus the grid so that the navigation's leniency
        // will focus the closest remaining cell to the focusedCell.
        if (removeButton.containsFocus && disable) {
            // Focus grid header
            this.grid.focusCell({ rowIndex : -1, columnIndex : 0 });
        }
        removeButton.disabled = disable;
    }

    clearActiveEditorErrors() {
        const
            me             = this,
            activeCellEdit = me._activeCellEdit;

        if (activeCellEdit && activeCellEdit.column.field === me.direction) {
            activeCellEdit.editor.inputField.clearError();  // clears all errors
        }
    }

    onGridCellEditChange() {
        // Since we deposit some errors on the editor during startEdit (see onGridStartCellEdit), we must also clear
        // them eventually or the editor will refuse to accept any value. Since validation will still take place, we
        // don't need to worry about preventing the editor from dismissing nor could we realistically since validation
        // is async (see onGridFinishCellEdit).
        this.clearActiveEditorErrors();
    }

    onGridStartCellEdit({ editorContext }) {
        const
            me       = this,
            dep      = me._editingDependency = editorContext.record,
            { grid } = me,
            dir      = me.direction;

        me._activeCellEdit = editorContext;

        if (editorContext.column.field === dir) {
            if (!isDependencyMarkedValid(dep, grid)) {
                if (!dep[dir]) {
                    editorContext.editor.inputField.setError('L{DependencyTab.invalidDependency}');
                }
                else {
                    editorContext.editor.inputField.setError('L{DependencyTab.cyclicDependency}');
                }
            }
            else {
                me.clearActiveEditorErrors();
            }

            //dep.shadow();
        }
    }

    async onGridFinishCellEdit({ editorContext }) {
        const
            me                              = this,
            { record : dependency, column } = editorContext,
            { grid, direction }             = me;

        // Other dependency end
        if (column.field === direction) {
            markDependencyValid(dependency, grid);
            me.taskCombo.store.fillFromMaster();
        }
        // Type and Lag
        else {
            me.redrawDependencyRow(dependency);
        }

        me._activeCellEdit = me._editingDependency = null;

        me.requestReadyStateChange();
    }

    afterCancel() {
        // After task editor is closed by clicking "Cancel"
        // let's cancel cell editing if it's in progress (could happen if cell editor has a validation error)
        if (this._activeCellEdit) {
            this.grid.features.cellEdit.cancelEditing(true);
        }
    }

    onGridCancelCellEdit(data) {
        const
            me         = this,
            dependency = me._editingDependency;

        if (dependency) {
            if (!dependency[me.direction]) {
                markDependencyInvalid(dependency, me.grid);
                me.redrawDependencyRow(dependency);
            }

            me._activeCellEdit = me._editingDependency = null;
        }

        me.requestReadyStateChange();
    }

    redrawDependencyRow(dependency) {
        // TODO: Redraw dependency directly instead of row
        const
            { grid } = this,
            row      = grid.rowManager.getRowById(dependency);

        // Might be out of view
        if (row) {
            const recordIndex = grid.store.indexOf(dependency);

            // the record could no longer be in the store if we click remove button while cell editing is in progress
            if (recordIndex >= 0) {
                row.render(grid.store.indexOf(dependency), dependency);
            }
        }
    }

    get canSave() {
        const { grid } = this;

        return grid.store.reduce((r, d) => r && isDependencyMarkedValid(d, grid), true);
    }
}
