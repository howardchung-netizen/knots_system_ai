import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { PdfShare } from '../pdfShare.entity';

@ObjectType()
export class PdfShareConnection extends PaginatedResponse(PdfShare) {}
