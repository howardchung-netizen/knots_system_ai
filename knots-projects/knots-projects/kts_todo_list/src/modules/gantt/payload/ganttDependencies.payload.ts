import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { GanttDependencies } from '../gantt.entity';

@ObjectType()
export class GanttDependenciesPayload extends MutationPayload {
  @Field({ nullable: true })
  ganttDependencies?: GanttDependencies;
}
