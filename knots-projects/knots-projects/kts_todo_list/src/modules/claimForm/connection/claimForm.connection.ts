import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ClaimForm } from '../claimForm.entity';

@ObjectType()
export class ClaimFormConnection extends PaginatedResponse(ClaimForm) {}
