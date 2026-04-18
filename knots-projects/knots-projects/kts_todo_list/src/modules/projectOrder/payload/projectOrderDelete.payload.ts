import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class ProjectOrderDeletePayload extends MutationPayload {
  @Field()
  result: boolean;
}
