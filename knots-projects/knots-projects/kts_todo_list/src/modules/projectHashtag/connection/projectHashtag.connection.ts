import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ProjectHashtag } from '../projectHashtag.entity';

@ObjectType()
export class ProjectHashtagConnection extends PaginatedResponse(ProjectHashtag) {}
