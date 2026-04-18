import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { PdfShare } from '../pdfShare.entity';

@ObjectType()
export class PdfSharePayload extends MutationPayload{
  @Field({ nullable: true })
  pdfShare?: PdfShare;
}
