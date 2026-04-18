import { ArgsType, Field, ID } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';
import { GraphQLDate } from 'graphql-iso-date';

@ArgsType()
export class TenderFormsArgs extends ConnectionArgs {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field(type => GraphQLDate, { nullable: true })
  receivedDateStart?: Date;

  @Field(type => GraphQLDate, { nullable: true })
  receivedDateEnd?: Date;

  @Field(type => String, { nullable: true })
  client?: string;

  @Field(type => String, { nullable: true })
  tenderNo?: string;

  @Field(type => GraphQLDate, { nullable: true })
  siteVisitDateStart?: Date;

  @Field(type => GraphQLDate, { nullable: true })
  siteVisitDateEnd?: Date;

  @Field(type => GraphQLDate, { nullable: true })
  deadlineDateStart?: Date;

  @Field(type => GraphQLDate, { nullable: true })
  deadlineDateEnd?: Date;

  @Field(type => String, { nullable: true })
  submitMethod?: string;

  @Field(type => ID, { nullable: true })
  personInChargeId?: string;

}
