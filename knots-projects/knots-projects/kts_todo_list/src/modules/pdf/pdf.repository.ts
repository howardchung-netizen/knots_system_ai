import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { Pdf } from './pdf.entity';

@Service()
@EntityRepository(Pdf)
export class PdfRepository extends PaginatingRepository<Pdf> {}
