import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ProjectInvoice } from './projectInvoice.entity';

@Service()
@EntityRepository(ProjectInvoice)
export class ProjectInvoiceRepository extends PaginatingRepository<ProjectInvoice> {}
