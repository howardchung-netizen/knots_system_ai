import { ObjectType, Field } from 'type-graphql';
import { BookKeepingPeriodExpense } from '../bookKeepingPeriodExpense.entity';

@ObjectType()
export class BookKeepingPeriodExpenseOccurrence {
  @Field()
  date: string;

  @Field(() => BookKeepingPeriodExpense)
  expense: BookKeepingPeriodExpense;
}
