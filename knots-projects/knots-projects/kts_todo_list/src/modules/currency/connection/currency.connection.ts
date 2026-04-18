import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Currency } from '../currency.entity';

@ObjectType()
export class CurrencyConnection extends PaginatedResponse(Currency) {}
