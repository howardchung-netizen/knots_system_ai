import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Measurement } from '../measurement.entity';

@ObjectType()
export class MeasurementSortPayload extends MutationPayload{
  @Field({ nullable: true })
  result?: boolean;
}
