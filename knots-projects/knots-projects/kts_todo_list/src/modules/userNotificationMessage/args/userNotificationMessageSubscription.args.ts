import {ArgsType, Field, ID} from 'type-graphql';

@ArgsType()
export class UserNotificationMessageSubscriptionArgs {
  @Field(type => ID, { nullable: true })
  memberId?: string;
}
