import { ObjectType, Field, ID } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class TaskDeletePayload extends MutationPayload {
  @Field(
    type => ID,
    {
      nullable: true,
    }
  )
  deletedTaskId?: string;
}
