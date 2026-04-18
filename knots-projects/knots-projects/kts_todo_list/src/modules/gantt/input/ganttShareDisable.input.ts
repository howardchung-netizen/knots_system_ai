import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class GanttShareDisableInput{
  @Field(type=>String,{nullable: true})
  code?: string;
}
