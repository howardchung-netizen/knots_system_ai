import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class RoleDeleteInput {
  @Field()
  name: string;
}
