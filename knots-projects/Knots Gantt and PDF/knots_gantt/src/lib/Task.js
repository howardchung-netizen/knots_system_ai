/**
 * Taken from the original example
 */
import { TaskModel } from '@bryntum/gantt';

// here you can extend our default Task class with your additional fields, methods and logic
export default class Task extends TaskModel {

    
    static get fields() {
        return [
            { name: 'deadline', type: 'date' },
            { name: 'logs' }
        ];
    }

    get minStartDate() {
        return this.project.startDate;
    }

    get isLate() {
        return this.deadline && Date.now() > this.deadline;
    }

    get logData() {
        return this.taskStore.logs.length? this.taskStore.logs[0].id:'';
    }

    get status() {
        let status = 'Not started';

        if (this.isCompleted) {
            status = 'Completed';
        } else if (this.endDate < Date.now()) {
            status = 'Late';
        } else if (this.isStarted) {
            status = 'Started';
        }

        return status;
    }
}
