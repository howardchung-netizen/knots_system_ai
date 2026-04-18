import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ProjectInvoice } from '../projectInvoice.entity';

@ObjectType()
export class ProjectInvoiceConnection extends PaginatedResponse(ProjectInvoice) {}
