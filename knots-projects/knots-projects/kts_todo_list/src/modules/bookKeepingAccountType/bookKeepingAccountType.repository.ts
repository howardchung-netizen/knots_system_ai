import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { BookKeepingAccountType } from './bookKeepingAccountType.entity';

@Service()
@EntityRepository(BookKeepingAccountType)
export class BookKeepingAccountTypeRepository extends PaginatingRepository<BookKeepingAccountType> {}
