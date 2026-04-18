import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { Task } from './task.entity';

// @Service()
@EntityRepository(Task)
export class TaskRepository extends PaginatingRepository<Task> {}
