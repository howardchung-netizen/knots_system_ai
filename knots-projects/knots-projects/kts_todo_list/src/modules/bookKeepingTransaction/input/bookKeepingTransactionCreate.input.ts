import { InputType, Field, ID, Float, Int } from 'type-graphql';
import { LocalDateResolver as LocalDate } from 'graphql-scalars';

@InputType()
export class BookKeepingTransactionItemCreateInput {
  @Field(type => ID)
  accountId: string;

  @Field(type => String, { nullable: true })
  desc?: string;

  @Field(type => Float)
  amount: number;

  @Field(type => Boolean, { nullable: true })
  isOpeningBalance?: boolean;
}

@InputType()
export class BookKeepingTransactionCreateInput {
  @Field(type => ID)
  companyId: string;

  @Field(type => LocalDate)
  transactionDate: string;

  @Field(type => Int)
  financialYearStart: number;

  @Field(type => Int)
  financialYearEnd: number;

  @Field(type => [BookKeepingTransactionItemCreateInput])
  items: BookKeepingTransactionItemCreateInput[];
}
