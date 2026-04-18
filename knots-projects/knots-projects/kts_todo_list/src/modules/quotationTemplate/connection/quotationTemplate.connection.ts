import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { QuotationTemplate } from '../quotationTemplate.entity';

@ObjectType()
export class QuotationTemplateConnection extends PaginatedResponse(QuotationTemplate) {}
