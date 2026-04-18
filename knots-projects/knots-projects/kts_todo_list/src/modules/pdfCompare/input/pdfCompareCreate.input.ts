import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class PdfCompareCreateInput{
  @Field(type=>ID)
  sourcePageVersionId: string;

  @Field(type=>ID)
  targetPageVersionId: string;
}
