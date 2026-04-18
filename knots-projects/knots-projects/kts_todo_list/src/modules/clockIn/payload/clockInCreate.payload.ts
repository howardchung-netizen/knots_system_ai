import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class ClockInCreatePayload extends MutationPayload{
  @Field({ nullable: true })
  result: boolean;

  @Field({ nullable: true })
  dateitme?: Date;
}
