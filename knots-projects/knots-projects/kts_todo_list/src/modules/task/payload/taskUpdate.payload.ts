import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Task } from '../task.entity';

@ObjectType()
export class TaskUpdatePayload extends MutationPayload {
  @Field({ nullable: true })
  task?: Task;
}
