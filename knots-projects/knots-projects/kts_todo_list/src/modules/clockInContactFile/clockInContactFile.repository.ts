import {EntityRepository} from 'typeorm';
import {PaginatingRepository} from '../common/paginating.repository';
import { ClockInContactFile } from './clockInContactFile.entity';

@EntityRepository(ClockInContactFile)
export class ClockInContactFileRepository extends PaginatingRepository<ClockInContactFile> {
}
