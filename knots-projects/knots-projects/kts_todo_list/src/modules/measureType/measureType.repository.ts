import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { MeasureType } from './measureType.entity';

@Service()
@EntityRepository(MeasureType)
export class MeasureTypeRepository extends PaginatingRepository<MeasureType> {}
