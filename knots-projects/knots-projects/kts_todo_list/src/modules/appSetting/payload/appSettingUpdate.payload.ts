import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { AppSetting } from '../appSetting.entity';

@ObjectType()
export class AppSettingUpdatePayload extends MutationPayload {
  @Field(type => AppSetting, { nullable: true })
  appSetting?: AppSetting;
}
