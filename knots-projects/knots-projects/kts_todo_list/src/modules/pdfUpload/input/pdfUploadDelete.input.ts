import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class PdfUploadDeleteInput{
  @Field(type => ID)
  id: string;
}
