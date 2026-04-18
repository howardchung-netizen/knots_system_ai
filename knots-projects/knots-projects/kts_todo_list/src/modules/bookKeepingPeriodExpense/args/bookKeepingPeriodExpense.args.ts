import { ArgsType, Field, Float, ID, Int } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';
import { LocalDateResolver as LocalDate } from 'graphql-scalars';
import { BookKeepingPeriodExpenseType } from '../bookKeepingPeriodExpense.entity';

@ArgsType()
export class BookKeepingPeriodExpenseArgs extends ConnectionArgs {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field(type => LocalDate, { nullable: true })
  fromDate?: string;

  @Field(type => LocalDate, { nullable: true })
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

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;
}
