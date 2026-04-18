import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class BookKeepingTransactionItemDeleteInput {
  @Field(type => ID)
  id: string;
}
