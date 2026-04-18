import { InputType, Field, ID } from 'type-graphql';
import { Gantt } from '../gantt.entity';

@InputType()
export class GanttUpdateCalendarInput implements Partial<Gantt>{
  @Field(type=>String)
  projectId: string;

  @Field(type=>ID)
  calendarId: string;
}
