import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class AppSettingDeleteInput {
  @Field(type => ID)
  id: string;
}
