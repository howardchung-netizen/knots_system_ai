import { ArgsType, Field, ID } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';
import { LocalDateResolver as LocalDate } from 'graphql-scalars';

@ArgsType()
export class ClaimFormArgs extends ConnectionArgs {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field(type => ID, { nullable: true })
  staffId?: string;

  @Field(type => String, { nullable: true })
  vendor?: string;

  @Field(type => LocalDate, { nullable: true })
  purchasedDate?: string;

  @Field(type => String, { nullable: true })
  chequeNo?: string;

  @Field(type => ID, { nullable: true })
  categoryAccountId?: string;

  @Field(type => ID, { nullable: true })
  bankAccountId?: string;

  @Field(type => Boolean, { nullable: true })
  settlement?: boolean;

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;

  @Field(type => String, { nullable: true })
  sort?: string;

  @Field(type => String, { nullable: true })
  order?: string;
}
