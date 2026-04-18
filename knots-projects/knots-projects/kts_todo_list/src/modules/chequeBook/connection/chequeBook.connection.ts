import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ChequeBook } from '../chequeBook.entity';

@ObjectType()
export class ChequeBookConnection extends PaginatedResponse(ChequeBook) {}
