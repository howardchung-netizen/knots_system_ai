import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ClockInLocation } from '../clockInLocation.entity';

@ObjectType()
export class ClockInLocationConnection extends PaginatedResponse(ClockInLocation) {}

