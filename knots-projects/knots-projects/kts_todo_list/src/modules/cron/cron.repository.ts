import { Service } from 'typedi';
import { Cron } from './cron.entity';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';

@Service()
@EntityRepository(Cron)
export class CronRepository extends PaginatingRepository<Cron> {}
