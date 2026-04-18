import { ArgsType, Field } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';

@ArgsType()
export class BookKeepingCompanyArgs extends ConnectionArgs {
  @Field(type => String, { nullable: true })
  id?: string;

  @Field(type => String, { nullable: true })
  companyName?: string;

  @Field(type => String, { nullable: true })
  businessRegistrationNo?: string;

  @Field(type => String, { nullable: true })
  phone?: number;

}
