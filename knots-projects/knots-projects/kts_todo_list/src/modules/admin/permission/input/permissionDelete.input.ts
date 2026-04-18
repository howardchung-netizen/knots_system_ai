import { Field, InputType } from 'type-graphql';

@InputType()
export class PermissionDeleteInput {
  @Field()
  name: string;
}
