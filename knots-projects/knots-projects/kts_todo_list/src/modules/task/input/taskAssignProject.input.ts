import { InputType, Field, ID } from 'type-graphql';
import { Task, TaskStatus } from '../task.entity';

@InputType()
export class TaskAssignProjectInput implements Partial<Task>{
  @Field(type=>ID,
    {nullable: true}
    )
  id: string;

  @Field(type=>ID,
    {nullable: true}
    )
  projectId?: string;

  @Field(type=>String,
    {nullable: true}
    )
  sectionName?: string;
}
