import { InputType, Field, ID, Int, Float } from 'type-graphql';
import { GanttScheduleMethod, GanttTasks, GanttUnit } from '../gantt.entity';

@InputType()
export class GanttTasksInput implements Partial<GanttTasks>{
  @Field(type=>ID,{nullable: true})
  id?: string;

  @Field(type=>String,{nullable: true})
  ganttId: string;

  @Field(type=>String,{nullable: true})
  parentId?: string | null;

  @Field(type=>String,{nullable: true})
  calendarId?: string | null;

  @Field(type=>String,{nullable: true})
  name?: string;

  @Field(type=>String,{nullable: true})
  nameEng?: string;

  @Field(type=>Date,{nullable: true})
  startDate?: Date;

  @Field(type=>Date,{nullable: true})
  endDate?: Date;

  @Field(type=>Float,{nullable: true})
  effort?: number;

  @Field(type=>GanttUnit,{nullable: true})
  effortUnit?: GanttUnit;

  @Field(type=>Float,{nullable: true})
  duration?: number;

  @Field(type=>GanttUnit,{nullable: true})
  durationUnit?: GanttUnit;

  @Field(type=>Float,{nullable: true})
  percentDone?: number

  @Field(type=>String,{nullable: true})
  note?: string;

  @Field(type=>String,{nullable: true})
  constraintType?: string;

  @Field(type=>Date,{nullable: true})
  constraintDate?: Date;

  @Field(type=>Boolean,{nullable: true})
  manuallyScheduled?: Boolean;

  @Field(type=>GanttScheduleMethod,{nullable: true})
  schedulingMode?: GanttScheduleMethod;

  @Field(type=>Boolean,{nullable: true})
  effortDriven?: Boolean;

  @Field(type=>Boolean,{nullable: true})
  inactive?: Boolean;

  @Field(type=>String,{nullable: true})
  cls?: string

  @Field(type=>String,{nullable: true})
  iconCls?: string

  @Field(type=>String,{nullable: true})
  color?: string

  @Field(type=>Int,{nullable: true})
  parentIndex?: number

  @Field(type=>Boolean,{nullable: true})
  expanded?: Boolean;

  @Field(type=>Date,{nullable: true})
  deadline?: Date;
}
