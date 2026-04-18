import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { BookKeepingAccount } from './bookKeepingAccount.entity';

@Service()
@EntityRepository(BookKeepingAccount)
export class BookKeepingAccountRepository extends PaginatingRepository<BookKeepingAccount> {}
