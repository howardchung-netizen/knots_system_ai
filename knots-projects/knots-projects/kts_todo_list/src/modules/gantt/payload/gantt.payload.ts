import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Gantt } from '../gantt.entity';

@ObjectType()
export class GanttPayload extends MutationPayload{
  @Field({ nullable: true })
  gantt?: Gantt;
}
