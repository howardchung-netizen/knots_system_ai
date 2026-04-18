import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class PdfSourceCreateInput {
  @Field(type => ID)
  pdfId: string;

  @Field(type => ID)
  pdfUploadId: string;

  @Field(type => [Number])
  pages: number[];
}
