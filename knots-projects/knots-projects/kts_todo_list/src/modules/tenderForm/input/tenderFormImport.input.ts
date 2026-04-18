import { InputType, Field, GraphQLISODateTime } from 'type-graphql';
import { GraphQLDate } from 'graphql-iso-date';

@InputType()
export class TenderFormImportData {
  @Field(type => GraphQLDate, {nullable: true})
  receivedDate?: Date;

  @Field(type => String, {nullable: true})
  client?: string;

  @Field(type => String)
  tenderNo: string;

  @Field(type => GraphQLISODateTime, {nullable: true})
  siteVisitTime?: Date;

  @Field(type => GraphQLISODateTime, {nullable: true})
  deadlineTime?: Date;

  @Field(type => String, {nullable: true})
  submitMethod?: string;

  @Field(type => String, {nullable: true})
  details?: string;
}

@InputType()
export class TenderFormImportInput {
  @Field(type => [TenderFormImportData])
  tenders: TenderFormImportData[];
}
