import { Service } from 'typedi';
import { Client } from './client.entity';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';

@Service()
@EntityRepository(Client)
export class ClientRepository extends PaginatingRepository<Client> {}
