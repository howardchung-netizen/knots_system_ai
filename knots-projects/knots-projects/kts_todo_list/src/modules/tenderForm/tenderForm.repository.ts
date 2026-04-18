import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { TenderForm } from './tenderForm.entity';

@Service()
@EntityRepository(TenderForm)
export class TenderFormRepository extends PaginatingRepository<TenderForm> {}
