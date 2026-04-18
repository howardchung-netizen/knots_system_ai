import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class BookKeepingAccountTypeDeletePayload extends MutationPayload {
  @Field()
  result: boolean;
}
