import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ProjectItem } from '../projectItem.entity';

@ObjectType()
export class ProjectItemConnection extends PaginatedResponse(ProjectItem) {}
