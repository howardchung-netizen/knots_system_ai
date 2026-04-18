import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { BookKeepingPeriodExpense } from './bookKeepingPeriodExpense.entity';

@Service()
@EntityRepository(BookKeepingPeriodExpense)
export class BookKeepingPeriodExpenseRepository extends PaginatingRepository<BookKeepingPeriodExpense> {}
