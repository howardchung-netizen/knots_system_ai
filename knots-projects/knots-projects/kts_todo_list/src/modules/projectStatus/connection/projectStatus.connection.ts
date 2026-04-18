import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ProjectStatus } from '../projectStatus.entity';

@ObjectType()
export class ProjectStatusConnection extends PaginatedResponse(ProjectStatus) {}
