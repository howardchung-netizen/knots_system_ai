import {EntityRepository} from 'typeorm';
import {PaginatingRepository} from '../common/paginating.repository';
import { ClaimFormFile } from './claimFormFile.entity';

@EntityRepository(ClaimFormFile)
export class ClaimFormFileRepository extends PaginatingRepository<ClaimFormFile> {
}
