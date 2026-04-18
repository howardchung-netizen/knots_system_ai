import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ClockIn, ClockInError } from './clockIn.entity';

// @Service()
@EntityRepository(ClockIn)
export class ClockInRepository extends PaginatingRepository<ClockIn> {}

@EntityRepository(ClockInError)
export class ClockInErrorRepository extends PaginatingRepository<ClockInError> {}

