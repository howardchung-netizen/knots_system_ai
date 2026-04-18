import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Quotation } from '../quotation.entity';

@ObjectType()
export class QuotationPayload extends MutationPayload{
  @Field({ nullable: true })
  quotation?: Quotation;
}
