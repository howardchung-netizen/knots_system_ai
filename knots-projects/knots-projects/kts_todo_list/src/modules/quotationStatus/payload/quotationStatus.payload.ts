import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { QuotationStatus } from '../quotationStatus.entity';

@ObjectType()
export class QuotationStatusPayload extends MutationPayload{
  @Field({ nullable: true })
  quotationStatus?: QuotationStatus;
}
