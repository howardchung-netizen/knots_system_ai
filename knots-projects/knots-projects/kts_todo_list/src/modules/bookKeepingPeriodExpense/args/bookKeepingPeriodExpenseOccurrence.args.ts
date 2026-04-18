import { ArgsType, Field } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';
import { LocalDateResolver as LocalDate } from 'graphql-scalars';

@ArgsType()
export class BookKeepingPeriodExpenseOccurrenceArgs extends ConnectionArgs {

  @Field(type => LocalDate)
  rangeFromDate: string;

  @Field(type => LocalDate)
  rangeToDate: string;
}
