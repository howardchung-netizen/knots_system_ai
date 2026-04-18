import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { BookKeepingCompany } from './bookKeepingCompany.entity';

@Service()
@EntityRepository(BookKeepingCompany)
export class BookKeepingCompanyRepository extends PaginatingRepository<BookKeepingCompany> {}
