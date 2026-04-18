import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ClockIn, ClockInError } from '../clockIn.entity';

@ObjectType()
export class ClockInConnection extends PaginatedResponse(ClockIn) {}

@ObjectType()
export class ClockInErrorConnection extends PaginatedResponse(ClockInError) {}
