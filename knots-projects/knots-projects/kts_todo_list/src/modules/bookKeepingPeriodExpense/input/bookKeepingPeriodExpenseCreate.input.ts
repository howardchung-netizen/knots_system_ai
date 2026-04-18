import { InputType, Field, ID, Float, Int } from 'type-graphql';
import { BookKeepingPeriodExpenseType } from '../bookKeepingPeriodExpense.entity';
import { GraphQLDate } from 'graphql-iso-date';

@InputType()
export class BookKeepingPeriodExpenseCreateInput {
  @Field(type => ID)
  companyId: string;

  @Field(type => GraphQLDate)
  fromDate: string;

  @Field(type => GraphQLDate)
  toDate: string;

  @Field(type => BookKeepingPeriodExpenseType)
  period: BookKeepingPeriodExpenseType;

  @Field(type => Int)
  periodDay: number;

  @Field(type => Float)
  amount: number;

  @Field(type => ID)
  categoryAccountId: string;

  @Field(type => ID, { nullable: true })
  personInChargeId?: string;

  @Field(type => ID)
  chargeAccountId: string;

  @Field()
  desc: string;

  @Field({ nullable: true })
  remark?: string;
}
