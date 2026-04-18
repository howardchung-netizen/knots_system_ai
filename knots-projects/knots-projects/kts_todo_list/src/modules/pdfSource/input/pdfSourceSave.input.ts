import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class PdfSourceSaveInput {
  @Field(type => ID)
  pdfSourceId: string;

  @Field(type => ID, { nullable: true })
  pdfUploadId?: string;

  @Field(type =>[PdfSourcePageSaveInput])
  pdfSourcePages: PdfSourcePageSaveInput[];
}

@InputType()
export class PdfSourcePageSaveInput {
  @Field(type => Boolean)
  merge: boolean;

  @Field(type => Number)
  page: number;

  @Field(type => Number, {
    nullable: true,
  })
  originalPage?: number;

  @Field(type => Boolean)
  insert: boolean;

  @Field(type => Number,
    {nullable:true})
  targetPage?: number;
}
