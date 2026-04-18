import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ChequeBook } from './chequeBook.entity';

@Service()
@EntityRepository(ChequeBook)
export class ChequeBookRepository extends PaginatingRepository<ChequeBook> {}
