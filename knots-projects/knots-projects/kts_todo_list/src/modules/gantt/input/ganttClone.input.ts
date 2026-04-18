import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class GanttCloneInput {
  @Field(type=>ID)
  fromId: string;

  @Field(type=>ID)
  toId: string;
}
