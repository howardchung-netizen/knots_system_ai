import {InputType, Field, ID} from 'type-graphql';
import {JSONResolver} from 'graphql-scalars';

@InputType()
export class UserNotificationMessageBatchSendInput {
  @Field(type => [ID])
  userIds: string[];

  @Field({ nullable: true })
  templateKey?: string;

  @Field(type => JSONResolver, { nullable: true })
  contentReplacements?: object;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  shortContent?: string;

  @Field({ nullable: true })
  path?: string;
}
