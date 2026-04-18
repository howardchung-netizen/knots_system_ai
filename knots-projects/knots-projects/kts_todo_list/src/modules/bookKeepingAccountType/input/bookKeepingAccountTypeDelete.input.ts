import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class BookKeepingAccountTypeDeleteInput {
  @Field(type => ID)
  id: string;
}
