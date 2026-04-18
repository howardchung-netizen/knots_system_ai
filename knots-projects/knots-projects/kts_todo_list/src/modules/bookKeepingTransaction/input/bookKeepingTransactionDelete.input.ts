import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class BookKeepingTransactionDeleteInput {
  @Field(type => ID)
  id: string;
}
