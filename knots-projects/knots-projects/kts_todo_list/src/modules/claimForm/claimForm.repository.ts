import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ClaimForm } from './claimForm.entity';

@Service()
@EntityRepository(ClaimForm)
export class ClaimFormRepository extends PaginatingRepository<ClaimForm> {}
