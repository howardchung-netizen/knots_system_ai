import { InputType, Field, Int, ID, GraphQLISODateTime } from 'type-graphql';

@InputType()
export class PdfShareGenerateInput{
  @Field(type=>ID)
  pdfId: string;

  @Field(type => GraphQLISODateTime)
  expiredDate: Date;

  @Field(type=>String,{nullable: true})
  remark?: string;
}
