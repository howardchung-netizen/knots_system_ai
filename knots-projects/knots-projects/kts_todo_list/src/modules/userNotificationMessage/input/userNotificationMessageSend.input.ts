import {InputType, Field, ID} from 'type-graphql';
import {JSONResolver} from 'graphql-scalars';
import {UserNotificationMessage} from '../userNotificationMessage.entity';

@InputType()
export class UserNotificationMessageSendInput implements Partial<UserNotificationMessage> {
  @Field(type => ID)
  userId: string;

  @Field(type => ID, { nullable: true })
  userNotificationMessageTemplateId?: string;

  @Field(type => JSONResolver, { nullable: true })
  userNotificationMessageTemplateReplacements?: object;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  shortContent?: string;

  @Field({ nullable: true })
  path?: string;
}
