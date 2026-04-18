import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { BookKeepingTransaction } from './bookKeepingTransaction.entity';

@Service()
@EntityRepository(BookKeepingTransaction)
export class BookKeepingTransactionRepository extends PaginatingRepository<BookKeepingTransaction> {}
