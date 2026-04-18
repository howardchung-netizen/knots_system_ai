import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { BookKeepingAccountType } from '../bookKeepingAccountType.entity';

@ObjectType()
export class BookKeepingAccountTypeConnection extends PaginatedResponse(BookKeepingAccountType) {}
