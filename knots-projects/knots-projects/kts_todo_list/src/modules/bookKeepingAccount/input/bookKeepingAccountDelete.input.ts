import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class BookKeepingAccountDeleteInput {
  @Field(type => ID)
  id: string;
}
