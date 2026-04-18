import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { PdfSource } from './pdfSource.entity';

@Service()
@EntityRepository(PdfSource)
export class PdfSourceRepository extends PaginatingRepository<PdfSource> {}
