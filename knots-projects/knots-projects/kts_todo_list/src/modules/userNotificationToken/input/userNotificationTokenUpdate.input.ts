import {InputType, Field, ID} from 'type-graphql';

@InputType()
export class UserNotificationTokenUpdateInput {
  @Field(type=>ID)
  userId: string;

  @Field()
  token: string;
}
