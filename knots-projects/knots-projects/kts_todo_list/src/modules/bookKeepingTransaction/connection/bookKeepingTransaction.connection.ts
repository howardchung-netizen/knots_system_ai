import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { BookKeepingTransaction } from '../bookKeepingTransaction.entity';

@ObjectType()
export class BookKeepingTransactionConnection extends PaginatedResponse(BookKeepingTransaction) {}
