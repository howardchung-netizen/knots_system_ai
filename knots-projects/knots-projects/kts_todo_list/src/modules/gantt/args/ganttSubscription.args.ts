import { ArgsType, Field, ID, Int } from 'type-graphql';

@ArgsType()
export class GanttSubscriptionArgs {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field(type => Int, { nullable: true })
  projectId?: number;

}
