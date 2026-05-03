import {Field, InputType, Int} from 'type-graphql';

@InputType()
export class GanttTemplateCreateInput {
  @Field(type => String, {nullable: true})
  name?: string;

  @Field(type => String, {nullable: true})
  type?: string;

  @Field(type => String, {nullable: true})
  nodes?: string;

  @Field(type => String, {nullable: true})
  edges?: string;
}
