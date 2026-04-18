import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { QuotationTemplate } from '../quotationTemplate.entity';

@ObjectType()
export class QuotationTemplatePayload extends MutationPayload{
  @Field({ nullable: true })
  quotationTemplate?: QuotationTemplate;
}
