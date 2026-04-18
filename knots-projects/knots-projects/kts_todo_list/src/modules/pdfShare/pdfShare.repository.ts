import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { PdfShare } from './pdfShare.entity';

@Service()
@EntityRepository(PdfShare)
export class PdfShareRepository extends PaginatingRepository<PdfShare> {}
