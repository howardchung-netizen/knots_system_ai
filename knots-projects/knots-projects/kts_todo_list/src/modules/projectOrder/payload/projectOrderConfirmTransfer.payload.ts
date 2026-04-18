import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ProjectOrder } from '../projectOrder.entity';

@ObjectType()
export class ProjectOrderConfirmTransferPayload extends MutationPayload{
  @Field()
  result: boolean;

  @Field({ nullable: true })
  projectOrder?: ProjectOrder;
}
