import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { Measurement } from './measurement.entity';

@Service()
@EntityRepository(Measurement)
export class MeasurementRepository extends PaginatingRepository<Measurement> {}
