import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { Project } from './project.entity';

@Service()
@EntityRepository(Project)
export class ProjectRepository extends PaginatingRepository<Project> {}
