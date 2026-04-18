import { ObjectType, Field, ID } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class PdfDeletePayload extends MutationPayload {
  @Field(
    type => ID,
    {
      nullable: true,
    }
  )
  deletedPdfId?: string;
}
