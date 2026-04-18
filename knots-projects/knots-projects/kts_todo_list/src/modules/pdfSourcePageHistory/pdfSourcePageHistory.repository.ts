import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { PdfSourcePageHistory } from './pdfSourcePageHistory.entity';

@Service()
@EntityRepository(PdfSourcePageHistory)
export class PdfSourcePageHistoryRepository extends PaginatingRepository<PdfSourcePageHistory> {}
