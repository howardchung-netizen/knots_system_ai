import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { GanttTemplate } from './ganttTemplate.entity';

@Service()
@EntityRepository(GanttTemplate)
export class GanttTemplateRepository extends PaginatingRepository<GanttTemplate> {}
