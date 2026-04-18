import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class PdfShareDisablePayload extends MutationPayload{
  @Field(type=>String,{nullable:true})
  deletedPdfShareId?: string;
}
