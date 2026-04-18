import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { PdfSourceHistory } from './pdfSourceHistory.entity';

@Service()
@EntityRepository(PdfSourceHistory)
export class PdfSourceHistoryRepository extends PaginatingRepository<PdfSourceHistory> {}
