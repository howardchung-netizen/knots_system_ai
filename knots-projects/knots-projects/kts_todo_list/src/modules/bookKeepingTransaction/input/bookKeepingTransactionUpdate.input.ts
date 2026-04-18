import { InputType, Field, ID, Float, Int } from 'type-graphql';
import { LocalDateResolver as LocalDate } from 'graphql-scalars';

@InputType()
export class BookKeepingTransactionItemUpdateInput {
  @Field(type => ID, { nullable: true })
  id: string;

  @Field(type => ID, { nullable: true })
  accountId: string;

  @Field(type => String, { nullable: true })
  desc?: string;

  @Field(type => Float, { nullable: true })
  amount: number;

  @Field(type => Boolean, { nullable: true })
  isOpeningBalance?: boolean;
}

@InputType()
export class BookKeepingTransactionUpdateInput {
  @Field(type => ID)
  id: string;

  @Field(type => LocalDate, { nullable: true})
  transactionDate?: string;

  @Field(type => Int, { nullable: true})
  financialYearStart?: number;

  @Field(type => Int, { nullable: true})
  financialYearEnd?: number;

  @Field(type => [BookKeepingTransactionItemUpdateInput], { nullable: true })
  items?: BookKeepingTransactionItemUpdateInput[];
}
