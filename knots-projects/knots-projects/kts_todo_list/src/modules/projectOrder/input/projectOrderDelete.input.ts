import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class ProjectOrderDeleteInput {
  @Field(type => ID)
  id: string;
}
