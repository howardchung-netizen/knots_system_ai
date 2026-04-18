import { InputType, Field, ID, Int, Float } from 'type-graphql';
import { GanttDependencies, GanttLagUnit } from '../gantt.entity';

@InputType()
export class GanttDependenciesInput implements Partial<GanttDependencies>{
  @Field(type=>ID,{nullable: true})
  id?: string;

  @Field(type=>String,{nullable: true})
  ganttId: string;
  
  @Field(type=>String,{nullable: true})
  fromEventId: string;

  @Field(type=>String,{nullable: true})
  toEventId?: string;

  @Field(type=>Int,{nullable: true})
  typ?: number;

  @Field(type=>String,{nullable: true})
  cls?: string | null;

  @Field(type=>Float,{nullable: true})
  lag?: number | null;

  @Field(type=>GanttLagUnit,{nullable: true})
  lagUnit?: GanttLagUnit;
}
