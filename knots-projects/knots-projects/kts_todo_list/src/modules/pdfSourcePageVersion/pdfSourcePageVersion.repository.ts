import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { PdfSourcePageVersion } from './pdfSourcePageVersion.entity';

@Service()
@EntityRepository(PdfSourcePageVersion)
export class PdfSourcePageVersionRepository extends PaginatingRepository<PdfSourcePageVersion> {}
