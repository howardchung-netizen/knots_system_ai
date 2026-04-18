import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ProjectOrder } from '../projectOrder.entity';

@ObjectType()
export class ProjectOrderPayload extends MutationPayload{
  @Field({ nullable: true })
  projectOrder?: ProjectOrder;
}
