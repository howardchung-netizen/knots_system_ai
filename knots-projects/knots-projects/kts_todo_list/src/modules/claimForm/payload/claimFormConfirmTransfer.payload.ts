import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ClaimForm } from '../claimForm.entity';

@ObjectType()
export class ClaimFormConfirmTransferPayload extends MutationPayload{
  @Field()
  result: boolean;

  @Field({ nullable: true })
  claimForm?: ClaimForm;
}
