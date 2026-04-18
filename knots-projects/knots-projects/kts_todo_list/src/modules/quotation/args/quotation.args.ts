import { GraphQLDate } from 'graphql-iso-date';
import {ArgsType, Field, Float, ID} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

@ArgsType()
export class QuotationArgs extends ConnectionArgs {
  @Field(type => String, {nullable: true})
  id?: string;

  @Field(type => String, {nullable: true})
  code?: string;

  @Field(type => Number, {nullable: true})
  year?: number;

  @Field(type => Number, {nullable: true})
  month?: number;

  @Field(type => String, {nullable: true})
  projectId?: string;

  @Field(type => ID, {nullable: true})
  clientId?: string;

  @Field(type => String, {nullable: true})
  clientPrefix?: string;

  @Field(type => Boolean, {nullable: true})
  status?: boolean;

  @Field(type => String, {nullable: true})
  currency?: string;

  @Field(type => Float, {nullable: true})
  totalAmountFrom?: number;

  @Field(type => Float, {nullable: true})
  totalAmountTo?: number;

  @Field(type => GraphQLDate, {nullable: true})
  dateFrom?: Date;

  @Field(type => GraphQLDate, {nullable: true})
  dateTo?: Date;

  @Field(type => GraphQLDate, {nullable: true})
  createDateFrom?: Date;

  @Field(type => GraphQLDate, {nullable: true})
  createDateTo?: Date;

  @Field(type => GraphQLDate, {nullable: true})
  editDateFrom?: Date;

  @Field(type => GraphQLDate, {nullable: true})
  editDateTo?: Date;

  @Field(type => Boolean, {nullable: true})
  deleted?: boolean;

  @Field(type => [ID], {nullable: true})
  progressArray?: number[];

  @Field(type => [ID], {nullable: true})
  clientIds?: string[];

  @Field(type => String, {nullable: true})
  keyword?: string;

}
