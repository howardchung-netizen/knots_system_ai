import { InputType, Field, ID, Int, Float } from 'type-graphql';
import { GanttAssignments, GanttLagUnit } from '../gantt.entity';

@InputType()
export class GanttAssignmentsInput implements Partial<GanttAssignments>{
  @Field(type=>ID,{nullable: true})
  id?: string;

  @Field(type=>String,{nullable: true})
  ganttId: string;
  
  @Field(type=>String,{nullable: true})
  eventId: string;

  @Field(type=>String,{nullable: true})
  staffId?: string;
}
