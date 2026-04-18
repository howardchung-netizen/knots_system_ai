import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { QuotationStatus } from '../quotationStatus.entity';

@ObjectType()
export class QuotationStatusConnection extends PaginatedResponse(QuotationStatus) {}
