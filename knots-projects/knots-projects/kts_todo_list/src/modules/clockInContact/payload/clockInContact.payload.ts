import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ClockInContact } from '../clockInContact.entity';

@ObjectType()
export class ClockInContactPayload extends MutationPayload{
  @Field({ nullable: true })
  clockInContact?: ClockInContact;
}


