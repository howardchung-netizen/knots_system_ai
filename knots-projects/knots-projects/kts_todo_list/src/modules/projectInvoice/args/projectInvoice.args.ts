import {ArgsType, Field, Int} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';
import { GraphQLDate } from 'graphql-iso-date';

@ArgsType()
export class ProjectInvoiceArgs extends ConnectionArgs {
  @Field(type => String, {nullable: true})
  id?: string;

  @Field(type => String, {nullable: true})
  invId?: string;

  @Field(type => String, {nullable: true})
  projectId?: string;

  @Field(type => String, {nullable: true})
  project?: string;

  @Field(type => String, {nullable: true})
  worksOrder?: string;

  @Field(type => GraphQLDate, {nullable: true})
  dateFrom?: Date;

  @Field(type => GraphQLDate, {nullable: true})
  dateTo?: Date;

  @Field(type => Int, {nullable: true})
  yearFrom?: number;

  @Field(type => Int, {nullable: true})
  yearTo?: number;

  @Field(type => Int, {nullable: true})
  accYearFrom?: number;

  @Field(type => Int, {nullable: true})
  accYearTo?: number;

  @Field(type => Boolean, {nullable: true})
  status?: boolean;

  @Field(type => Boolean, {nullable: true})
  deleted?: boolean;

  @Field(type => String, {nullable: true})
  paidStart?: string;

  @Field(type => String, {nullable: true})
  paidEnd?: string;

  @Field(type => Boolean, {nullable: true})
  settlement?: boolean;
}
