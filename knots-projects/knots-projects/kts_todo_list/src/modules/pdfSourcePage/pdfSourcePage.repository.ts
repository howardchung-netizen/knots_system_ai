import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { PdfSourcePage } from './pdfSourcePage.entity';

@Service()
@EntityRepository(PdfSourcePage)
export class PdfSourcePageRepository extends PaginatingRepository<PdfSourcePage> {}
