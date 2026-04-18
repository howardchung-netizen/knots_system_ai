import { ArgsType, Field, ID, Int } from 'type-graphql';

@ArgsType()
export class GanttCheckShareArgs {
  @Field(type => String)
  code: string;
}