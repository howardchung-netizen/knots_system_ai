import { InputType, Field, ID } from 'type-graphql';
import { QuotationTemplatePrice } from './quotationTemplateCreate.input';

@InputType()
export class QuotationTemplateUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field({ nullable: true })
  remark?: string;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  name?: string;

  @Field(type => [QuotationTemplatePrice], { nullable: true })
  prices?: QuotationTemplatePrice[];

  @Field(type => Boolean ,{ nullable: true })
  show?: boolean;

  @Field(type => Boolean ,{ nullable: true })
  delete?: boolean;

}
