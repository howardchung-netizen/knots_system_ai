import {EntityRepository} from 'typeorm';
import {PaginatingRepository} from '../common/paginating.repository';
import { ContactFile } from './contactFile.entity';

@EntityRepository(ContactFile)
export class ContactFileRepository extends PaginatingRepository<ContactFile> {
}
