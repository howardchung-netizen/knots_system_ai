import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ProjectType } from './projectType.entity';

@Service()
@EntityRepository(ProjectType)
export class ProjectTypeRepository extends PaginatingRepository<ProjectType> {}
