import { InputType, Field, ID, Int } from 'type-graphql';
import { Gantt } from '../gantt.entity';

@InputType()
export class GanttInput implements Partial<Gantt>{
  @Field(type=>ID,{nullable: true})
  id?: string;

  @Field(type=>String,{nullable: true})
  projectId?: string;

  @Field(type=>String,{nullable: true})
  calendarId: string;

  @Field(type=>String,{nullable: true})
  startDate: string;

  @Field(type=>Int,{nullable: true})
  hoursPerDay: number;

  @Field(type=>Int,{nullable: true})
  daysPerWeek: number;

  @Field(type=>Int,{nullable: true})
  daysPerMonth: number;

}
