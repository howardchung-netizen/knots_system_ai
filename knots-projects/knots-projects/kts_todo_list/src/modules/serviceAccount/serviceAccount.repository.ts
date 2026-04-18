import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ServiceAccount } from './serviceAccount.entity';

@Service()
@EntityRepository(ServiceAccount)
export class ServiceAccountRepository extends PaginatingRepository<ServiceAccount> {}
