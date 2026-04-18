import { Service } from 'typedi';
import { User } from './user.entity';
import { EntityRepository } from 'typeorm';
import { PaginatingRepository } from '../common/paginating.repository';

// @Service()
@EntityRepository(User)
export class UserRepository extends PaginatingRepository<User> {}
