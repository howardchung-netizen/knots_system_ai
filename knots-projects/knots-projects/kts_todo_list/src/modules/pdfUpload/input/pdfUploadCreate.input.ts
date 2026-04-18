import {GraphQLUpload} from 'graphql-upload';
import { Upload } from 'graphql-upload';
import { InputType, Field } from 'type-graphql';

@InputType()
export class PdfUploadCreateInput{
  @Field(type => String,
    { nullable: true }
  )
  code?: string;

  @Field(type => String,
    { nullable: true }
  )
  pdfId?: string;

  @Field(type => Boolean)
  share: boolean;

  @Field(type=>GraphQLUpload)
  file: Upload;
}
