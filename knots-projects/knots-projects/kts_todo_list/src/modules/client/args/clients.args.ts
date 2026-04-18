import {ArgsType, Field, ID} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class ClientsArgs extends ConnectionArgs {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  prefix?: string;

  @Field({ nullable: true })
  companyEn?: string;

  @Field({ nullable: true })
  companyCht?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  tel?: string;

  @Field({ nullable: true })
  whatsapp?: string;

  @Field({ nullable: true })
  wechat?: string;

  @Field({ nullable: true })
  deleted?: Boolean;

}
