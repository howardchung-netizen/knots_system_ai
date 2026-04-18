import { InputType, Field, ID } from 'type-graphql';
import {
  AppSetting,
} from '../appSetting.entity';

@InputType()
export class AppSettingInput implements Partial<AppSetting> {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  key?: string;

  @Field({ nullable: true })
  public?: boolean;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  value?: string;
}
