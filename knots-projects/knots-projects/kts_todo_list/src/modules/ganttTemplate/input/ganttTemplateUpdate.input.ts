import {Field, ID, InputType, Int} from 'type-graphql';

@InputType()
export class GanttTemplateUpdateInput {
  @Field(type => ID)
  id: string;

  @Field(type => String, {nullable: true})
  name?: string;

  @Field(type => String, {nullable: true})
  type?: string;

  @Field(type => String, {nullable: true})
  nodes?: string;

  @Field(type => String, {nullable: true})
  edges?: string;

  @Field(type => Boolean, {nullable: true})
  deleted?: boolean;
}
