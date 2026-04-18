import { ObjectType, Field } from 'type-graphql';
import { GanttColumnConfig } from '../gantt.entity';

@ObjectType()
export class GanttColumnConfigPayload {
  @Field({ nullable: true })
  ganttColumnConfig?: GanttColumnConfig;
}
