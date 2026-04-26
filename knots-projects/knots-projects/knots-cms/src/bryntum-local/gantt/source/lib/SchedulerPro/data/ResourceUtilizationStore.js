import AjaxStore from '../../Core/data/AjaxStore.js';
import ResourceUtilizationModel from '../model/ResourceUtilizationModel.js';
import { AbstractPartOfProjectStoreMixin } from '../../Engine/quark/store/mixin/AbstractPartOfProjectStoreMixin.js';

/**
 * @module SchedulerPro/data/ResourceUtilizationStore
 */

/**
 * A store representing {@link SchedulerPro/view/ResourceUtilization} view records.
 * This store accepts a model class inheriting from {@link SchedulerPro/model/ResourceUtilizationModel}.
 *
 * The store is a tree of nodes representing resources on the root level with
 * sub-nodes representing corresponding resource assignments.
 * The store tracks changes made in the {@link #config-project} stores and rebuilds its content automatically.
 * Thus the project config is mandatory and has to be provided.
 *
 * @extends Core/data/AjaxStore
 */
export default class ResourceUtilizationStore extends AbstractPartOfProjectStoreMixin.derive(AjaxStore) {

    static configurable = {
        modelClass : ResourceUtilizationModel,

        /**
         * Project instance to retrieve resources and assignments data from.
         * @config {SchedulerPro.model.ProjectModel} project
         */
        project : null,

        tree : true
    }

    static properties = {
        _modelByOrigin : new Map()
    }

    updateProject(project) {
        this.setResourceStore(project?.resourceStore);
        this.setAssignmentStore(project?.assignmentStore);
        this.setEventStore(project?.eventStore);

        this.fillStoreFromProject();
    }

    setResourceStore(store) {
        this.detachListeners('resourceStore');

        // TODO track assignmens & events changes
        store?.on({
            name    : 'resourceStore',
            change  : this.onResourceStoreDataChanged,
            thisObj : this
        });
    }

    setEventStore(store) {
        this.detachListeners('eventStore');

        // TODO track assignmens & events changes
        store?.on({
            name    : 'eventStore',
            update  : this.onEventUpdate,
            thisObj : this
        });
    }

    setAssignmentStore(store) {
        this.detachListeners('assignmentStore');

        // TODO track assignmens & events changes
        store?.on({
            name    : 'assignmentStore',
            change  : this.onAssignmentsChange,
            refresh : this.onAssignmentsRefresh,
            add     : this.onAssignmentsAdd,
            update  : this.onAssignmentUpdate,
            remove  : this.onAssignmentsRemove,
            thisObj : this
        });
    }

    onResourceStoreDataChanged(event) {
        // 'move' action triggers a remove event first, we wait for the 'add' - no need to fill twice
        if (event.isMove && event.action === 'remove') {
            return;
        }

        this.fillStoreFromProject();
    }

    onAssignmentsChange() {
        this.forEach(resourceWrapper => resourceWrapper.fillChildren());
    }

    onAssignmentsRefresh(event) {
        if (event.action === 'batch') {
            this.forEach(resourceWrapper => resourceWrapper.fillChildren());
        }
    }

    onAssignmentsAdd({ records }) {
        records.forEach(record => {
            const resourceWrapper = this.getModelByOrigin(record?.resource);

            resourceWrapper?.fillChildren();
        });
    }

    onAssignmentUpdate({ record, changes }) {
        // if assignment moved to another resource
        if ('resource' in changes) {
            const
                // get assignment wrapper record
                assignmentWrapper = this.getModelByOrigin(record),
                // get new resource wrapper record
                newResourceWrapper = this.getModelByOrigin(record?.resource);

            // move assignment wrapper to new resource wrapper
            if (assignmentWrapper && newResourceWrapper) {
                newResourceWrapper.appendChild(assignmentWrapper);
            }
        }
    }

    onAssignmentsRemove({ records }) {
        this.remove(records.map(record => this.getModelByOrigin(record)));
    }

    onEventUpdate({ record, changes }) {
        if ('name' in changes) {
            for (const assignment of record.assigned) {
                const assignmentWrapper = this.getModelByOrigin(assignment);

                assignmentWrapper.set('name', record.name);
            }
        }
    }

    fillStoreFromProject() {
        const toAdd = [];

        this._project?.resourceStore.forEach(resource => {
            if (!resource.isSpecialRow) {
                toAdd.push(this.modelClass.new({ origin : resource }));
            }
        });

        this.removeAll();
        this.add(toAdd);

        /**
         * Fires when store completes synchronization with original (Event/Resource/Assignment) stores
         * @event fillFromProject
         * @internal
         */
        this.trigger('fillFromProject');
    }

    remove() {
        const removed = super.remove(...arguments);

        // sanitize internal origin->wrapper Map
        removed?.forEach(record => {
            this._modelByOrigin.delete(record.origin);
        });

        return removed;
    }

    removeAll() {
        super.removeAll(...arguments);

        this._modelByOrigin.clear();
    }

    getModelByOrigin(origin) {
        return this._modelByOrigin.get(origin);
    }

    setModelByOrigin(origin, model) {
        return this._modelByOrigin.set(origin, model);
    }
}
