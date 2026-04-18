import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ClockInContact } from './clockInContact.entity';

@Service()
@EntityRepository(ClockInContact)
export class ClockInContactRepository extends PaginatingRepository<ClockInContact> {}


