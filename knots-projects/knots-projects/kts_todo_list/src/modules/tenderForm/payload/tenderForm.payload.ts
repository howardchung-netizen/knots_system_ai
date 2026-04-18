import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { TenderForm } from '../tenderForm.entity';

@ObjectType()
export class TenderFormPayload extends MutationPayload{
  @Field({ nullable: true })
  tenderForm?: TenderForm;
}
