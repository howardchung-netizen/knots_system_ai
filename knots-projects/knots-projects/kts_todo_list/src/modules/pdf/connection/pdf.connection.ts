import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Pdf } from '../pdf.entity';

@ObjectType()
export class PdfConnection extends PaginatedResponse(Pdf) {}
