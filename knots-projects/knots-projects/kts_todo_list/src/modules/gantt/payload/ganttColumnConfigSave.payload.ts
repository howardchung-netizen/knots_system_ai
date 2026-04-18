import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { GanttColumnConfig } from '../gantt.entity';

@ObjectType()
export class GanttColumnConfigSavePayload extends MutationPayload {
  @Field({ nullable: true })
  ganttColumnConfig?: GanttColumnConfig;
}
