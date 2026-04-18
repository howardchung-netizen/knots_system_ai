import { List } from '@bryntum/gantt';

/**
 * @module TasksLogList
 */

/**
 * @internal
 */
export default class TasksLogList extends List {

    // Factoryable type name
    static get type() {
        return 'tasksLogList';
    }

    static get configurable() {
        return {
            title   : 'Tasks Log',
            cls     : 'b-inline-list',
            items   : [],
            itemTpl : log => {
                return `
                    <div class="b-taskslog-detail">
                        <div class="b-taskslog-header">
                            <div class="b-taskslog-text">${log.user} ${log.action} the task </div>
                            <div class="b-taskslog-text">${log.date}</div>
                        </div>
                        <div class="b-taskslog-content">
                            <div class="b-taskslog-content-title">Changes</div>
                            ${log.changes.map((e, index) => {
                                return `<div class="b-taskslog-content-text">${Object.keys(e)[0]}: ${Object.values(e)[0]?.newValue}</div>`
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        };
    }

    // Called by the owning TaskEditor whenever a task is loaded
    loadEvent(taskRecord) {
        this.taskRecord = taskRecord;
        this.store.data = taskRecord.logs;
    }

    // Called on item click
    onItem({ event, record }) {
        
    }
}

// Register this widget type with its Factory
TasksLogList.initClass();
