import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ProjectStatus } from './projectStatus.entity';

@Service()
@EntityRepository(ProjectStatus)
export class ProjectStatusRepository extends PaginatingRepository<ProjectStatus> {}
