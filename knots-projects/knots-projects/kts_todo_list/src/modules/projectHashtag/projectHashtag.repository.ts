import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ProjectHashtag } from './projectHashtag.entity';

@Service()
@EntityRepository(ProjectHashtag)
export class ProjectHashtagRepository extends PaginatingRepository<ProjectHashtag> {}
