import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class ProjectTypeSortPayload extends MutationPayload{
  @Field({ nullable: true })
  result?: boolean;
}
