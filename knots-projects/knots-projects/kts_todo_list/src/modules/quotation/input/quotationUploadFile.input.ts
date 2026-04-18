import { InputType, Field, ID } from 'type-graphql';
import { GraphQLUpload, Upload } from 'graphql-upload';

@InputType()
export class QuotationUploadFileInput {
  @Field(type=>ID)
  id: string;
  @Field(type=>[GraphQLUpload])
  files: [Upload];
}
