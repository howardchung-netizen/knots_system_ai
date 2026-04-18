import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Quotation } from '../quotation.entity';

@ObjectType()
export class QuotationConnection extends PaginatedResponse(Quotation) {}
