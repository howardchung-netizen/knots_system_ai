import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Pdf } from '../pdf.entity';

@ObjectType()
export class PdfPayload extends MutationPayload{
  @Field({ nullable: true })
  pdf?: Pdf;
}
