import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ChequeBookAllocate } from './chequeBookAllocate.entity';

@Service()
@EntityRepository(ChequeBookAllocate)
export class ChequeBookAllocateRepository extends PaginatingRepository<ChequeBookAllocate> {}
