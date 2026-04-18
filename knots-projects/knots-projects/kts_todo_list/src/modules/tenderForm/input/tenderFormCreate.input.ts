import { InputType, Field, ID, GraphQLISODateTime } from 'type-graphql';
import { GraphQLDate } from 'graphql-iso-date';

@InputType()
export class TenderFormCreateInput {
  @Field(type => GraphQLDate)
  receivedDate: Date;

  @Field(type => ID)
  client: string;

  @Field(type => String, {nullable: true})
  tenderNo: string;

  @Field(type => GraphQLISODateTime, {nullable: true})
  siteVisitTime?: Date;

  @Field(type => GraphQLISODateTime)
  deadlineTime: Date;

  @Field(type => String)
  submitMethod: string;

  @Field(type => String)
  details: string;

  @Field(type => ID, {nullable: true})
  personInChargeId?: string;
}
