import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ProjectSpotlight } from '../projectSpotlight.entity';

@ObjectType()
export class ProjectSpotlightConnection extends PaginatedResponse(ProjectSpotlight) {}
