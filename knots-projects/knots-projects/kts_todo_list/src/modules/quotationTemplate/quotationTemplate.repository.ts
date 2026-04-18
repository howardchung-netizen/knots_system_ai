import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { QuotationTemplate } from './quotationTemplate.entity';

@Service()
@EntityRepository(QuotationTemplate)
export class QuotationTemplateRepository extends PaginatingRepository<QuotationTemplate> {}
