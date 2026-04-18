import {InputType, Field, ID} from 'type-graphql';
import {UserNotificationMessage} from '../userNotificationMessage.entity';

@InputType()
export class UserNotificationMessageReadInput implements Partial<UserNotificationMessage> {
  @Field(type => ID)
  id: string;
}
