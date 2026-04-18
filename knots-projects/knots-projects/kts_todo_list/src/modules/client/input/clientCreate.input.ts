import {Field, InputType} from 'type-graphql';

@InputType()
export class ClientCreateInput {
  @Field({ nullable: true })
  prefix?: string;

  @Field({ nullable: true })
  companyEn?: string;

  @Field({ nullable: true })
  companyCht?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  telCode?: string;

  @Field({ nullable: true })
  tel?: string;

  @Field({ nullable: true })
  faxCode?: string;

  @Field({ nullable: true })
  fax?: string;

  @Field({ nullable: true })
  whatsappCode?: string;

  @Field({ nullable: true })
  whatsapp?: string;

  @Field({ nullable: true })
  wechatCode?: string;

  @Field({ nullable: true })
  wechat?: string;

  @Field({ nullable: true })
  remark?: string;

  @Field(type => [ClientContactsData], { nullable: true})
  contacts?: ClientContactsData[];
}

@InputType()
export class ClientContactsData {
  @Field()
  id: string;

  @Field(type => Boolean, { nullable: true })
  isMainContact?: boolean;
}
