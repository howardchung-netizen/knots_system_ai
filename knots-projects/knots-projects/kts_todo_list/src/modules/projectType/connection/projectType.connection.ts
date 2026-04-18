import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ProjectType } from '../projectType.entity';

@ObjectType()
export class ProjectTypeConnection extends PaginatedResponse(ProjectType) {}
