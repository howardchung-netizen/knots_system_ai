import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ClockInLocation } from '../clockInLocation.entity';

@ObjectType()
export class ClockInLocationCreatePayload extends MutationPayload{
  @Field({ nullable: true })
  clockInLocation?: ClockInLocation;
}

@ObjectType()
export class ClockInLocationRefreshPayload extends MutationPayload{
  @Field({ nullable: true })
  clockInLocation?: ClockInLocation;
}

@ObjectType()
export class ClockInLocationUpdatePayload extends MutationPayload{
  @Field({ nullable: true })
  clockInLocation?: ClockInLocation;
}

