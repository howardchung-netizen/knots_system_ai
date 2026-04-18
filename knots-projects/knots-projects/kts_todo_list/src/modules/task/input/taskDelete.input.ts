import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class TaskDeleteInput {
  @Field(
    type => ID,
  )
  id: string;
}
