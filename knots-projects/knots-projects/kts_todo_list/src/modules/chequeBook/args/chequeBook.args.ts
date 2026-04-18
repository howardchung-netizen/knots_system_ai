import {ArgsType, Field, Float, Int} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';
import { GraphQLDate } from 'graphql-iso-date';

@ArgsType()
export class ChequeBookArgs extends ConnectionArgs {
  @Field(type => String, {nullable: true})
  id?: string;

  @Field(type => String, {nullable: true})
  chequeNo?: string;

  @Field(type => String, {nullable: true})
  receiver?: string;

  @Field(type => String, {nullable: true})
  projectId?: string;

  @Field(type => Boolean, {nullable: true})
  isCredit?: boolean;

  @Field(type => Boolean, {nullable: true})
  confirmTransfer?: boolean;

  @Field(type => Float, {nullable: true})
  amountFrom?: number;

  @Field(type => Float, {nullable: true})
  amountTo?: number;

  @Field(type => GraphQLDate, {nullable: true})
  dateFrom?: Date;

  @Field(type => GraphQLDate, {nullable: true})
  dateTo?: Date;

  @Field(type => Float, {nullable: true})
  yearFrom?: number;

  @Field(type => Float, {nullable: true})
  yearTo?: number;

  @Field(type => Int, {nullable: true})
  accYearFrom?: number;

  @Field(type => Int, {nullable: true})
  accYearTo?: number;

  @Field(type => Boolean, {nullable: true})
  cancel?: boolean;

  @Field(type => Boolean, {nullable: true})
  deleted?: boolean;

  @Field(type => String, {nullable: true})
  staffId?: string;

}
