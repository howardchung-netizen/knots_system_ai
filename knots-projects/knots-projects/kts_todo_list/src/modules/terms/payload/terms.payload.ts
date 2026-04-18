import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Terms } from '../terms.entity';

@ObjectType()
export class TermsPayload extends MutationPayload {
  @Field({ nullable: true })
  terms?: Terms;
}
