import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ProjectOrder } from '../projectOrder.entity';

@ObjectType()
export class ProjectOrderConnection extends PaginatedResponse(ProjectOrder) {}
