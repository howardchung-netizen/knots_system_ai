import { InputType, Field, ID, Float, Int } from 'type-graphql';
import { BookKeepingPeriodExpenseType } from '../bookKeepingPeriodExpense.entity';
import { GraphQLDate } from 'graphql-iso-date';

@InputType()
export class BookKeepingPeriodExpenseUpdateInput {
  @Field(type => ID)
  id: string;

  @Field(type => ID, { nullable: true })
  companyId?: string;

  @Field(type => GraphQLDate, { nullable: true })
  fromDate?: string;

  @Field(type => GraphQLDate, { nullable: true })
  toDate?: string;

  @Field(type => BookKeepingPeriodExpenseType, { nullable: true })
  period?: BookKeepingPeriodExpenseType;

  @Field(type => Int, { nullable: true })
  periodDay?: number;

  @Field(type => Float, { nullable: true })
  amount?: number;

  @Field(type => ID, { nullable: true })
  categoryAccountId?: string;

  @Field(type => ID, { nullable: true })
  personInChargeId?: string;

  @Field(type => ID, { nullable: true })
  chargeAccountId?: string;

  @Field({ nullable: true })
  desc?: string;

  @Field({ nullable: true })
  remark?: string;
}
