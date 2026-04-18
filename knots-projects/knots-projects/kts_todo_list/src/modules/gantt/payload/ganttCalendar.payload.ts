import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { GanttCalendar } from '../gantt.entity';

@ObjectType()
export class GanttCalendarPayload extends MutationPayload {
  @Field({ nullable: true })
  ganttCalendar?: GanttCalendar;
}
