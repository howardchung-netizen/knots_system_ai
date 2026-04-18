import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { TenderForm } from '../tenderForm.entity';

@ObjectType()
export class TenderFormConnection extends PaginatedResponse(TenderForm) {}
