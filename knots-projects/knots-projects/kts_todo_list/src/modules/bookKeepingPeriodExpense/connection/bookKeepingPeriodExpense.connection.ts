import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { BookKeepingPeriodExpense } from '../bookKeepingPeriodExpense.entity';

@ObjectType()
export class BookKeepingPeriodExpenseConnection extends PaginatedResponse(BookKeepingPeriodExpense) {}
