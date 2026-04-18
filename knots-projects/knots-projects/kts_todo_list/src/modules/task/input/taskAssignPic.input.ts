import { InputType, Field, ID } from 'type-graphql';
import { Task, TaskStatus } from '../task.entity';

@InputType()
export class TaskAssignInput implements Partial<Task>{
  @Field(type=>ID,
    {nullable: true}
    )
  id: string;

  @Field(type=>ID,
    {nullable: true}
    )
  assignee: string;
}
