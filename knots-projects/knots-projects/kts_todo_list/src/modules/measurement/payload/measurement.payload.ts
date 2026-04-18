import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Measurement } from '../measurement.entity';

@ObjectType()
export class MeasurementPayload extends MutationPayload{
  @Field({ nullable: true })
  measurement?: Measurement;
}
