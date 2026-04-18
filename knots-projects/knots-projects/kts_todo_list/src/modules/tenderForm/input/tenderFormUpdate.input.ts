import { InputType, Field, ID, GraphQLISODateTime } from 'type-graphql';
import { GraphQLDate } from 'graphql-iso-date';

@InputType()
export class TenderFormUpdateInput {
  @Field(type => ID)
  id: string;

  @Field(type => GraphQLDate, {nullable: true})
  receivedDate?: Date;

  @Field()
  client: string;

  @Field(type => String, {nullable: true})
  tenderNo?: string;

  @Field(type => GraphQLISODateTime, {nullable: true})
  siteVisitTime?: Date;

  @Field(type => GraphQLISODateTime, {nullable: true})
  deadlineTime?: Date;

  @Field(type => String, {nullable: true})
  submitMethod?: string;

  @Field(type => String, {nullable: true})
  details?: string;

  @Field(type => ID, {nullable: true})
  personInChargeId?: string;
}
