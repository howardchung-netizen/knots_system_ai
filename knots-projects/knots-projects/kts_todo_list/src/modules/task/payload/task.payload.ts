import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Task } from '../task.entity';

@ObjectType()
export class TaskPayload extends MutationPayload{
  @Field({ nullable: true })
  task?: Task;
}
