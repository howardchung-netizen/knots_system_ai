import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class TermsDeleteInput {
  @Field(type=>ID)
  id: string;
}
