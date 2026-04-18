import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { ProjectItemSchedule } from './projectItemSchedule.entity';

@Service()
@EntityRepository(ProjectItemSchedule)
export class ProjectItemScheduleRepository extends PaginatingRepository<ProjectItemSchedule> {}
