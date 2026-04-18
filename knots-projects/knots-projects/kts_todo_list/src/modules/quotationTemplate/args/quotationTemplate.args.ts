import {ArgsType, Field} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class QuotationTemplateArgs extends ConnectionArgs {
  @Field(type => String, {nullable: true})
  id?: string;

  @Field(type => String, {nullable: true})
  code?: string;

  @Field(type => String, {nullable: true})
  name?: string;

  @Field(type => Boolean, {nullable: true})
  show?: boolean;

  @Field(type => Boolean, {nullable: true})
  delete?: boolean;

  @Field(type => String, {nullable: true})
  keyword?: string;
}
