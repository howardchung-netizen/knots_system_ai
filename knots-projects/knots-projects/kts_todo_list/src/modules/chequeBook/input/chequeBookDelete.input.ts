import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class ChequeBookDeleteInput {
  @Field(type => ID)
  id: string;
}
