import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { TaskLog } from './task.entity';

// @Service()
@EntityRepository(TaskLog)
export class TaskLogRepository extends PaginatingRepository<TaskLog> {}
