import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class AppSettingSubscriptionArgs {
  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  public?: Boolean;
}
