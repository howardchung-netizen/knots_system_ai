import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class PdfCheckShareArgs {
  @Field(type => String, {
    nullable: true,
  })
  code?: string;

  @Field(type => String, {
    nullable: true,
  })
  pdfId?: string;
}
