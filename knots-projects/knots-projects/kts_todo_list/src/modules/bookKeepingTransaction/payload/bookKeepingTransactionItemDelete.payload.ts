import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class BookKeepingTransactionItemDeletePayload extends MutationPayload {
  @Field()
  result: boolean;
}
