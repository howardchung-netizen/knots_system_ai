import { InputType, Field, ID, Int } from 'type-graphql';
import { LocalDateResolver as LocalDate } from 'graphql-scalars';

@InputType()
export class ProjectInvoiceConfirmTransferInput {
  @Field(type=>ID)
  id: string;

  @Field(type => ID)
  categoryAccountId: string;

  @Field(type => ID)
  bankAccountId: string;

  @Field(type => ID)
  companyId: string;

  @Field(type => LocalDate)
  transactionDate: string;

  @Field(type => Int)
  financialYearStart: number;

  @Field(type => Int)
  financialYearEnd: number;

  @Field(type => String, { nullable: true })
  transactionDesc?: string;

  @Field(type => String)
  paid: string;
}
