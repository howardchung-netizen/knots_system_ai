import { InputType, Field, ID, Int } from 'type-graphql';

@InputType()
export class PdfCompareUploadInput {
  @Field(type=>ID)
  sourceId: string;

  @Field(type=>Int)
  sourcePage: number;

  @Field(type=>ID)
  uploadId: string;

  @Field(type=>Int)
  uploadPage: number;
}
