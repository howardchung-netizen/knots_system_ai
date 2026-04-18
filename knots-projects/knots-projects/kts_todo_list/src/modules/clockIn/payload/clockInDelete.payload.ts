import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class ClockInDeletePayload extends MutationPayload{
  @Field({ nullable: true })
  result: boolean;
}
