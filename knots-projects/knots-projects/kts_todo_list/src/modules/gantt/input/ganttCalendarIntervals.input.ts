import { InputType, Field, ID, Int } from 'type-graphql';
import { GanttCalendarIntervals } from '../gantt.entity';

@InputType()
export class GanttCalendarIntervalsInput implements Partial<GanttCalendarIntervals>{
  @Field(type=>ID,{nullable: true})
  id?: string;

  @Field(type=>String,{nullable: true})
  calendarId: string;

  @Field(type=>String,{nullable: true})
  recurrentStartDate?: string | null;

  @Field(type=>String,{nullable: true})
  recurrentEndDate?: string | null;

  @Field(type=>Int,{nullable: true})
  isWorking?: number;
}
