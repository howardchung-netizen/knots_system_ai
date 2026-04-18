import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ClockInContact } from '../clockInContact.entity';

@ObjectType()
export class ClockInContactConnection extends PaginatedResponse(ClockInContact) {}

