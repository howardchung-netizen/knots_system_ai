import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Spotlight } from '../spotlight.entity';

@ObjectType()
export class SpotlightsConnection extends PaginatedResponse(Spotlight) {}
