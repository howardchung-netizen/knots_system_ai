import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { GanttTasks } from '../gantt.entity';

@ObjectType()
export class GanttTasksPayload extends MutationPayload {
  @Field({ nullable: true })
  ganttTasks?: GanttTasks;
}
