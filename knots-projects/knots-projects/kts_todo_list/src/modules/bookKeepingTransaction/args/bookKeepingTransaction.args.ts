import { ArgsType, Field, ID } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';
import { LocalDateResolver as LocalDate } from 'graphql-scalars';
import { SortOrder } from '../../pdf/args/pdf.args';

@ArgsType()
export class BookKeepingTransactionArgs extends ConnectionArgs {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field(type => ID, { nullable: true })
  companyId?: string;

  @Field(type => LocalDate, { nullable: true })
  transactionDateStart?: string;

  @Field(type => LocalDate, { nullable: true })
  transactionDateEnd: string;

  @Field(type => ID, { nullable: true })
  accountId?: string;

  @Field(type => Boolean, { nullable: true })
  isDebit?: boolean;

  @Field(type => Boolean, { nullable: true })
  isOpeningBalance?: boolean;

  @Field(type => SortOrder, { nullable: true })
  sortOrder?: SortOrder;

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;

}
