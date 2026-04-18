import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { PdfCompare } from './pdfCompare.entity';

@Service()
@EntityRepository(PdfCompare)
export class PdfCompareRepository extends PaginatingRepository<PdfCompare> {}
