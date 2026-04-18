import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Task } from '../task.entity';

@ObjectType()
export class TasksConnection extends PaginatedResponse(Task) {}
