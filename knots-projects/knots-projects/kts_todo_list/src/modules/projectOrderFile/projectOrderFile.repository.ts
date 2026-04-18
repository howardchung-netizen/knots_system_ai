import {EntityRepository} from 'typeorm';
import {PaginatingRepository} from '../common/paginating.repository';
import { ProjectOrderFile } from './projectOrderFile.entity';

@EntityRepository(ProjectOrderFile)
export class ProjectOrderFileRepository extends PaginatingRepository<ProjectOrderFile> {
}
