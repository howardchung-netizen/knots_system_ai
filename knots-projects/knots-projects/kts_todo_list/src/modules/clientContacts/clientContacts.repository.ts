import { Service } from 'typedi';
import { ClientContacts } from './clientContacts.entity';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';

@Service()
@EntityRepository(ClientContacts)
export class ClientContactsRepository extends PaginatingRepository<ClientContacts> {}
