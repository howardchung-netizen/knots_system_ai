import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { User } from '../user.entity';

@ObjectType()
export class UsersConnection extends PaginatedResponse(User) {}
