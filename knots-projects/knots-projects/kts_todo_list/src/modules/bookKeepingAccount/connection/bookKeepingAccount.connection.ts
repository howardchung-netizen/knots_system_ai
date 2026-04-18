import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { BookKeepingAccount } from '../bookKeepingAccount.entity';

@ObjectType()
export class BookKeepingAccountConnection extends PaginatedResponse(BookKeepingAccount) {}
