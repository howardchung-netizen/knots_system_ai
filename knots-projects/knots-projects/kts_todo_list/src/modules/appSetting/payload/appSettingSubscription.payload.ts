import { ObjectType, Field } from 'type-graphql';
import { SubscriptionPayload } from '../../common/subscriptionPayload.type';
import { AppSetting } from '../appSetting.entity';

@ObjectType()
export class AppSettingSubscriptionPayload extends SubscriptionPayload {
  @Field(type => AppSetting, { nullable: true })
  node?: AppSetting;

  @Field(type => AppSetting, { nullable: true })
  previousValues?: AppSetting;
}
