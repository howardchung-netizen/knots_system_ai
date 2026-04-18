import {PaginatedResponse} from '../../common/paginatedResponse.type';
import {ObjectType} from 'type-graphql';
import {UserNotificationMessageTemplate} from '../userNotificationMessageTemplate.entity';

@ObjectType()
export class UserNotificationMessageTemplatesConnection extends PaginatedResponse(UserNotificationMessageTemplate) {}
