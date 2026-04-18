import { InputType, Field, ID } from 'type-graphql';
import { Task, TaskStatus } from '../task.entity';

@InputType()
export class TaskStatusChangeInput implements Partial<Task>{
  @Field(type=>ID)
  id: string;

  @Field(type=>TaskStatus)
  status: TaskStatus;
}
