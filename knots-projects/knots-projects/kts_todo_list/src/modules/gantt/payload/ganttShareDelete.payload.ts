import { ObjectType, Field, ID } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class GanttShareDeletePayload extends MutationPayload{
  @Field(type=>String,{nullable:true})
  deletedGanttShareCode?: string;
}
