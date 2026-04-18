import {ObjectType, Field} from 'type-graphql';
import {SubscriptionPayload} from '../../common/subscriptionPayload.type';
import {UserNotificationMessage} from '../userNotificationMessage.entity';

@ObjectType()
export class UserNotificationMessageSubscriptionPayload extends SubscriptionPayload {
  @Field(type => UserNotificationMessage, { nullable: true })
  node?: UserNotificationMessage;

  @Field(type => UserNotificationMessage, { nullable: true })
  previousValues?: UserNotificationMessage;
}
