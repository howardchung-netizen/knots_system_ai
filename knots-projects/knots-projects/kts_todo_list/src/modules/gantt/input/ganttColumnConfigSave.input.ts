import { JSONResolver } from 'graphql-scalars';
import { InputType, Field } from 'type-graphql';
import { ganttColumnConfigParams } from '../gantt.service';

@InputType()
export class GanttColumnConfigSaveInput {
  @Field(type => JSONResolver)
  config: ganttColumnConfigParams;
}
