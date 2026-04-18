import { JSONResolver } from 'graphql-scalars';
import { InputType, Field, Float } from 'type-graphql';

@InputType()
export class Price {
  @Field(type => String)
  id: string;

  @Field(type => String, {nullable: true})
  desc_en?: string;

  @Field(type => String, {nullable: true})
  desc_cht?: string;

  @Field(type => Float, {nullable: true})
  price?: number;

  // @Field(type => Number, {nullable: true})
  // unit?: number;

  // @Field(type => String, {nullable: true})
  // unit_en?: string;

  // @Field(type => String, {nullable: true})
  // unit_cht?: string;
}

@InputType()
export class QuotationTemplatePrice {
  @Field()
  itemId: string;

  @Field(type => Price, {nullable: true})
  price?: Price;
}

@InputType()
export class QuotationTemplateCreateInput {
  @Field({ nullable: true })
  remark?: string;

  @Field()
  code: string;

  @Field()
  name: string;

  @Field(type => [QuotationTemplatePrice], { nullable: true })
  prices?: QuotationTemplatePrice[];
}
