import { ArgsType, Field, ID } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';

@ArgsType()
export class BookKeepingAccountArgs extends ConnectionArgs {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field(type => ID, { nullable: true })
  companyId?: string;

  @Field(type => ID, { nullable: true })
  accountTypeId?: string;

  @Field(type => ID, { nullable: true })
  parentAccountId?: string;

  @Field(type => String, { nullable: true })
  name?: string;

  @Field(type => ID, { nullable: true })
  currencyId?: string;

  @Field(type => Boolean, { nullable: true })
  isPlaceholder?: boolean;

  @Field(type => Boolean, { nullable: true })
  isClaim?: boolean;

  @Field(type => Boolean, { nullable: true })
  isBank?: boolean;

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;

}
