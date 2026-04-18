import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ProjectSpotlight } from './projectSpotlight.entity';

@Service()
@EntityRepository(ProjectSpotlight)
export class ProjectSpotlightRepository extends PaginatingRepository<ProjectSpotlight> {}
