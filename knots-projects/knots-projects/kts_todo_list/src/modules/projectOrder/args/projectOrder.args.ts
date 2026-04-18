import {ArgsType, Field, Float, Int} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';
import { GraphQLDate } from 'graphql-iso-date';

@ArgsType()
export class ProjectOrderArgs extends ConnectionArgs {
  @Field(type => String, {nullable: true})
  id?: string;

  @Field(type => Int, {nullable: true})
  projectId?: number;

  @Field(type => String, {nullable: true})
  supplier?: string;

  @Field(type => String, {nullable: true})
  desc?: string;

  @Field(type => String, {nullable: true})
  cheque?: string;

  @Field(type => Float, {nullable: true})
  amountFrom?: number;

  @Field(type => Float, {nullable: true})
  amountTo?: number;

  @Field(type => GraphQLDate, {nullable: true})
  orderDateFrom?: Date;

  @Field(type => GraphQLDate, {nullable: true})
  orderDateTo?: Date;

  @Field(type => GraphQLDate, {nullable: true})
  deliveryDateFrom?: Date;

  @Field(type => GraphQLDate, {nullable: true})
  deliveryDateTo?: Date;

  @Field(type => Boolean, {nullable: true})
  payment?: boolean;

  @Field(type => Boolean, {nullable: true})
  delivery?: boolean;

  @Field(type => Boolean, {nullable: true})
  deleted?: boolean;

  @Field(type => String, {nullable: true})
  keyword?: string;

  @Field(type => String, {nullable: true})
  order?: "DESC" | "ASC";

  @Field(type => String, {nullable: true})
  sort?: string;
}
