import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { BookKeepingCompany } from '../bookKeepingCompany.entity';

@ObjectType()
export class BookKeepingCompanyConnection extends PaginatedResponse(BookKeepingCompany) {}
