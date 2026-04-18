import {EntityRepository} from 'typeorm';
import {PaginatingRepository} from '../common/paginating.repository';
import { QuotationFile } from './quotationFile.entity';

@EntityRepository(QuotationFile)
export class QuotationFileRepository extends PaginatingRepository<QuotationFile> {
}
