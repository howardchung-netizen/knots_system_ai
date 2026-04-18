import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class PdfDeleteInput {
  @Field(type => ID)
  id: string;
}
