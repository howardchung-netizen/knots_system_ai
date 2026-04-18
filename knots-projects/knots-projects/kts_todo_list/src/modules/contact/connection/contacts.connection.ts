import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Contact } from '../contact.entity';

@ObjectType()
export class ContactsConnection extends PaginatedResponse(Contact) {}
