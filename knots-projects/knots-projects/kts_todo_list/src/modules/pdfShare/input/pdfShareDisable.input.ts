import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class PdfShareDisableInput{
  @Field(type=>ID)
  id: string;
}
