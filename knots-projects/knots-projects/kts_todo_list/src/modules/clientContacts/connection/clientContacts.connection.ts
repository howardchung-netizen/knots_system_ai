import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { ClientContacts } from '../clientContacts.entity';

@ObjectType()
export class ClientContactsConnection extends PaginatedResponse(ClientContacts) {}
