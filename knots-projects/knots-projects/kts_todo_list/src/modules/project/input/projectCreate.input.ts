import { InputType, Field, Int, GraphQLISODateTime, registerEnumType, ID } from 'type-graphql';

export enum ProjectAppellation {
  NA = 0,
  MR = 1,
  MISS = 2,
  MS = 3,
}

registerEnumType(ProjectAppellation, {
  name: 'ProjectAppellation',
});

@InputType()
export class ProjectCreateInput {
  @Field(type => Int)
  year: number;

  @Field()
  code: string;

  @Field()
  statusId: string;

  @Field({ nullable: true })
  spotlight?: string;

  @Field(type => String)
  typeId: string;

  @Field(type => GraphQLISODateTime)
  start: Date;

  @Field(type => GraphQLISODateTime)
  end: Date;

  @Field({
    nullable: true,
  })
  remark: string;

  @Field(type => String, {nullable: true})
  address: string;

  @Field(type => String, {nullable: true})
  clientId?: string;

  @Field(type => String, {nullable: true})
  contactId?: string;

  @Field(type => [String], {nullable: true})
  hashtags?: string[];

  @Field(type => ID, {nullable: true})
  quotationId?: string;

}
