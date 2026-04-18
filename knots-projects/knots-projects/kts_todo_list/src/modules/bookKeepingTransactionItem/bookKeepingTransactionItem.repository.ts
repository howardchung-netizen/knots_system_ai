import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { BookKeepingTransactionItem } from './bookKeepingTransactionItem.entity';

@Service()
@EntityRepository(BookKeepingTransactionItem)
export class BookKeepingTransactionItemRepository extends PaginatingRepository<BookKeepingTransactionItem> {}
