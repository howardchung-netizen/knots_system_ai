import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class PdfCompareUploadPayload extends MutationPayload{
  @Field({ nullable: true })
  sourceBase64?: string;

  @Field({ nullable: true })
  targetBase64?: string;

  @Field({ nullable: true })
  compareBase64?: string;
}
