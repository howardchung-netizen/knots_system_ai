import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { QuotationStatus } from './quotationStatus.entity';

@Service()
@EntityRepository(QuotationStatus)
export class QuotationStatusRepository extends PaginatingRepository<QuotationStatus> {}
