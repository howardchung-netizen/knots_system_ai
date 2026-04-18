import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ProjectItem } from './projectItem.entity';

@Service()
@EntityRepository(ProjectItem)
export class ProjectItemRepository extends PaginatingRepository<ProjectItem> {}
