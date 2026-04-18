import { InputType, Field, ID, Int, GraphQLISODateTime } from 'type-graphql';

@InputType()
export class ProjectUpdateInput {
  @Field(type=>ID)
  id: string;

  @Field({nullable: true})
  code?: string;

  @Field({nullable: true})
  statusId?: string;

  @Field({nullable: true})
  spotlight?: string;

  @Field(type => String, {nullable: true})
  typeId?: string;

  @Field(type => GraphQLISODateTime, {nullable: true})
  start?: Date;

  @Field(type => GraphQLISODateTime, {nullable: true})
  end?: Date;

  @Field({nullable: true})
  remark?: string;

  @Field(type => String, {nullable: true})
  clientId?: string;

  @Field(type => String, {nullable: true})
  contactId?: string;

  @Field(type=>String,
    {nullable: true}
    )
  albumShareToken?: string | undefined;

  @Field(type => [String], {nullable: true})
  hashtags?: string[];

  @Field(type => String, {nullable: true})
  managerId?: string;

  @Field(type => [String], {nullable: true})
  assginess?: string[];
}
