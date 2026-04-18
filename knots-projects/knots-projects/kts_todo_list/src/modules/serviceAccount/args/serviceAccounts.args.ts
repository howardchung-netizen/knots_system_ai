import { ArgsType, Field, ID } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';

@ArgsType()
export class ServiceAccountsArgs extends ConnectionArgs {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  keyword?: string;

  @Field({ nullable: true })
  disabled?: Boolean;
}
