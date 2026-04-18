import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ClockInLocation } from './clockInLocation.entity';

@Service()
@EntityRepository(ClockInLocation)
export class ClockInLocationRepository extends PaginatingRepository<ClockInLocation> {}


