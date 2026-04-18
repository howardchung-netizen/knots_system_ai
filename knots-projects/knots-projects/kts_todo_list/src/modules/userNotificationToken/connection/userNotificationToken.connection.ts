import {PaginatedResponse} from '../../common/paginatedResponse.type';
import {ObjectType} from 'type-graphql';
import {UserNotificationToken} from '../userNotificationToken.entity';

@ObjectType()
export class UserNotificationTokenConnection extends PaginatedResponse(UserNotificationToken) {}
