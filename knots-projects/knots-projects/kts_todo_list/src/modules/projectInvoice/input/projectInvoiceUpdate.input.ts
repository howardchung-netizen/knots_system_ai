import { InputType, Field, ID, Int, Float } from 'type-graphql';
import { GraphQLDate } from 'graphql-iso-date';
import { JSONResolver } from 'graphql-scalars';
import { LocalDateResolver as LocalDate } from 'graphql-scalars';

@InputType()
export class ProjectInvoiceUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field(type => GraphQLDate)
  date: Date;

  @Field(type => ID)
  clientId?: string;

  @Field(type => ID)
  contactId?: string;

  @Field(type => String, { nullable: true })
  projectId?: string;

  @Field({ nullable: true })
  projectCode?: string;

  @Field({ nullable: true })
  worksOrder?: string;

  @Field({ nullable: true })
  quotationCode?: string;

  @Field({ nullable: true })
  remark?: string;

  @Field({ nullable: true })
  remarks?: string;

  @Field(type => GraphQLDate, { nullable: true })
  submitForm?: Date;

  @Field(type => GraphQLDate, { nullable: true })
  signedForm?: Date;

  @Field(type => Int)
  financialYearStart: number;

  @Field(type => Int)
  financialYearEnd: number;
  
  // @Field(type => JSONResolver)
  // invoice: [];

  // @Field(type => JSONResolver)
  // quotationForm: [];
  
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

  @Field(type => LocalDate, { nullable: true })
  paid: string;

  @Field(type => JSONResolver, { nullable: true })
  term?: [];

  // @Field(type => Number)
  // lastUpdateTime: number;
}

