import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class GanttShareGenerateInput{
  @Field(type=>String)
  projectId?: string;

  @Field(type=>Int)
  expiredDay: number;

  @Field(type=>String,{nullable: true})
  remark?: string;
}
