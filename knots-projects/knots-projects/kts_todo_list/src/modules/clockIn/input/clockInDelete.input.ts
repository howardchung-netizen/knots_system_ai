import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class ClockInDeleteInput {
  @Field(type=>ID)
  id: string;
}
