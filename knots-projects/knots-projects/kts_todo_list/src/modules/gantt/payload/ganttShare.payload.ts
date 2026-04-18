import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { GanttShare } from '../gantt.entity';

@ObjectType()
export class GanttSharePayload extends MutationPayload{
  @Field({ nullable: true })
  ganttShare?: GanttShare;
}
