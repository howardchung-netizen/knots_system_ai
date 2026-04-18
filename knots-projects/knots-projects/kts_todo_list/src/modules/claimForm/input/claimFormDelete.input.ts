import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class ClaimFormDeleteInput {
  @Field(type => ID)
  id: string;
}
