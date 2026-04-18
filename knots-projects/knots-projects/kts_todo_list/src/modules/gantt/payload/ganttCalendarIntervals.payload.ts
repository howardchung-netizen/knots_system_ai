import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { GanttCalendarIntervals } from '../gantt.entity';

@ObjectType()
export class GanttCalendarIntervalsPayload extends MutationPayload {
  @Field({ nullable: true })
  ganttCalendarIntervals?: GanttCalendarIntervals;
}
