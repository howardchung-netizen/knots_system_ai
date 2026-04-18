import { ArgsType, Field } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';

@ArgsType()
export class BookKeepingAccountTypeArgs extends ConnectionArgs {
  @Field(type => String, { nullable: true })
  id?: string;

  @Field(type => String, { nullable: true })
  name?: string;

  @Field(type => Boolean, { nullable: true })
  increaseDebit?: boolean;

  @Field(type => Boolean, { nullable: true })
  deleted?: boolean;

}
