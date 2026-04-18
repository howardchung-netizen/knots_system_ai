import {ArgsType, Field} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class ClientContactsArgs extends ConnectionArgs {
  @Field({ nullable: true })
  uuid?: string;

  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  nameCht?: string;

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
