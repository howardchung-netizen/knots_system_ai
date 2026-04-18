import { InputType, Field, ID, Int } from 'type-graphql';
import { Task, TaskPriority, TaskStatus } from '../task.entity';

@InputType()
export class TaskInput implements Partial<Task>{
  @Field(type=>ID,
    {nullable: true}
    )
  id?: string;

  @Field({nullable: true})
  name?: string;

  @Field(type=>String,{nullable: true})
  dueDate?: string | null;

  @Field({nullable: true})
  isDailyReminder?: boolean;

  @Field({nullable: true})
  description?: string;

  @Field(type=>String, {nullable: true})
  spotlight?: string | undefined;;

  @Field(type=> String, {nullable: true})
  parentTaskId?: string | undefined;

  @Field(type=> TaskPriority, {nullable: true})
  priority?: TaskPriority;

  @Field(type=> ID, {nullable: true})
  projectId?: string;
}
