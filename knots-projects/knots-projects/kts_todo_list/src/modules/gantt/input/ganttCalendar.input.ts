import { InputType, Field, ID, Int } from 'type-graphql';
import { GanttCalendar } from '../gantt.entity';

@InputType()
export class GanttCalendarInput implements Partial<GanttCalendar>{
  @Field(type=>ID,{nullable: true})
  id?: string;

  @Field(type=>String,{nullable: true})
  name?: string;

  @Field(type=>String,{nullable: true})
  parentId?: string;
}
