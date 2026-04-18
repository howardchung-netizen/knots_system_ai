import { GraphQLDate } from 'graphql-iso-date';
import { InputType, Field, Int, Float } from 'type-graphql';

@InputType()
export class QuotationPrice {
  @Field()
  itemId: string;

  @Field(type=>String, {
    nullable: true
  })
  itemNameCht: string;

  @Field(type=>String, {
    nullable: true
  })
  itemNameEn: string;

  @Field(type=>String, {
    nullable: true
  })
  itemDescCht: string;

  @Field(type=>String, {
    nullable: true
  })
  itemDescEn: string;

  @Field(type=>String, {
    nullable: true
  })
  unitId: string;
  
  @Field(type => Int, {nullable: true})
  qty?: number;

  @Field(type => Float, {nullable: true})
  price?: string;

  @Field(type => Float, {nullable: true})
  amount?: number;

  @Field(type => [QuotationPrice], {nullable: true})
  child?: QuotationPrice[];  
  descEn: string;
  descCht: string;
  upper: string;
  unit: number;
  unitEn: string;
  unitCht: string;

}

@InputType()
export class QuotationCreateInput {
  @Field({ nullable: true })
  projectId?: string;

  @Field()
  title: string;

  @Field(type => Boolean, { nullable: true })
  status?: boolean;

  @Field(type => String, { nullable: true })
  quotationStatusId?: string;

  @Field()
  clientId: string;

  @Field({ nullable: true })
  contactId?: string;

  @Field({ nullable: true })
  sendTo?: string;

  @Field({ nullable: true })
  attn?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(type => GraphQLDate, { nullable: true })
  date?: Date;

  @Field({ nullable: true })
  remark?: string;

  @Field({ nullable: true })
  cmsRemark?: string;

  @Field(type => Float, { nullable: true })
  totalAmount?: number;

  @Field(type => Float, { nullable: true })
  discountRatio?: number;

  @Field(type => Float, { nullable: true })
  ratioDiscount?: number;

  @Field(type => Float, { nullable: true })
  discount?: number;

  @Field(type => Float, { nullable: true })
  grandTotal?: number;

  @Field(type => [QuotationPrice], { nullable: true })
  templatePrices?: QuotationPrice[];

  @Field(type => [String], { nullable: true })
  termsIds?: string[];

}
