import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { PdfUpload } from '../pdfUpload.entity';

@ObjectType()
export class PdfUploadPayload extends MutationPayload{
  @Field({ nullable: true })
  pdfUpload?: PdfUpload;
}
