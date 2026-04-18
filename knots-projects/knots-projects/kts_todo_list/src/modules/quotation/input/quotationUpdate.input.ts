import { GraphQLDate } from 'graphql-iso-date';
import { InputType, Field, ID, Float } from 'type-graphql';
import { QuotationPrice } from './quotationCreate.input';

@InputType()
export class QuotationUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field({ nullable: true })
  projectId?: string;

  @Field({ nullable: true })
  title?: string;

  @Field(type => Boolean, { nullable: true })
  status?: boolean;

  @Field(type => String, { nullable: true })
  quotationStatusId?: string;

  @Field({ nullable: true })
  clientId?: string;

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
