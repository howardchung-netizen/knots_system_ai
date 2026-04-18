import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class BookKeepingPeriodExpenseDeleteInput {
  @Field(type => ID)
  id: string;
}
