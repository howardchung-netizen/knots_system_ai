import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { GanttAssignments } from '../gantt.entity';

@ObjectType()
export class GanttAssignmentsPayload extends MutationPayload {
  @Field({ nullable: true })
  ganttAssignments?: GanttAssignments;
}
