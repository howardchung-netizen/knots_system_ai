import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { Terms } from './terms.entity';

@Service()
@EntityRepository(Terms)
export class TermsRepository extends PaginatingRepository<Terms> {}
