import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { PdfCompare } from '../pdfCompare.entity';

@ObjectType()
export class PdfComparePayload extends MutationPayload{
  @Field({ nullable: true })
  pdfCompare?: PdfCompare;
}
