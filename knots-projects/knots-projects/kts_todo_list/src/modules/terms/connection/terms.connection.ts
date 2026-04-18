import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Terms } from '../terms.entity';

@ObjectType()
export class TermsConnection extends PaginatedResponse(Terms) {}
