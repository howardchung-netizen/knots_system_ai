import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { Quotation } from './quotation.entity';

@Service()
@EntityRepository(Quotation)
export class QuotationRepository extends PaginatingRepository<Quotation> {}
