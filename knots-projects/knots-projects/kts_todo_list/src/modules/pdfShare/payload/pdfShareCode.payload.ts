import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class PdfShareCodePayload extends MutationPayload{
  @Field({ nullable: true })
  pdfShareCode?: string;
}
