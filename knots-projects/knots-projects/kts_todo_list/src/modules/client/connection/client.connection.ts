import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Client } from '../client.entity';

@ObjectType()
export class ClientsConnection extends PaginatedResponse(Client) {}
