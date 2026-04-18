import {PaginatedResponse} from '../../common/paginatedResponse.type';
import {Field, Int, ObjectType} from 'type-graphql';
import {UserNotificationMessage} from '../userNotificationMessage.entity';

@ObjectType()
export class UserNotificationMessageConnection extends PaginatedResponse(UserNotificationMessage) {
  @Field(type => Int, { nullable: true })
  unreadCount?: number;
}
