import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { Spotlight } from './spotlight.entity';

// @Service()
@EntityRepository(Spotlight)
export class SpotlightRepository extends PaginatingRepository<Spotlight> {}
