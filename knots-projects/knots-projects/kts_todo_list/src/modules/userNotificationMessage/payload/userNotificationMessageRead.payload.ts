import {ObjectType, Field} from 'type-graphql';
import {MutationPayload} from '../../common/mutationPayload.type';
import {UserNotificationMessage} from '../userNotificationMessage.entity';

@ObjectType()
export class UserNotificationMessageReadPayload extends MutationPayload {
  @Field(type => UserNotificationMessage, { nullable: true })
  userNotificationMessage?: UserNotificationMessage;
}
