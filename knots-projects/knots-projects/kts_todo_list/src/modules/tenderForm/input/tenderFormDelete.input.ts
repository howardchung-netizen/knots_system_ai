import { Field, InputType, ID } from 'type-graphql';

@InputType()
export class TenderFormDeleteInput {
  @Field(
    type => ID,
  )
  id: string;
}
