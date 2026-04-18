import { Service } from 'typedi';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';
import { PdfUpload } from './pdfUpload.entity';

@Service()
@EntityRepository(PdfUpload)
export class PdfUploadRepository extends PaginatingRepository<PdfUpload> {}
