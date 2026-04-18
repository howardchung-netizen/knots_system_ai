import { Service } from 'typedi';
import { Contact } from './contact.entity';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';

// @Service()
@EntityRepository(Contact)
export class ContactRepository extends PaginatingRepository<Contact> {}
