import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ProjectOrder } from './projectOrder.entity';

@Service()
@EntityRepository(ProjectOrder)
export class ProjectOrderRepository extends PaginatingRepository<ProjectOrder> {}
