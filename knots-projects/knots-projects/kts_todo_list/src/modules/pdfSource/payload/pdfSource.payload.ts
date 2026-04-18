import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { PdfSource } from '../pdfSource.entity';

@ObjectType()
export class PdfSourcePayload extends MutationPayload{
  @Field({ nullable: true })
  pdfSource?: PdfSource;
}
