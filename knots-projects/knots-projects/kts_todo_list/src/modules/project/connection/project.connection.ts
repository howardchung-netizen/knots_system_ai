import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Project } from '../project.entity';

@ObjectType()
export class ProjectConnection extends PaginatedResponse(Project) {}
