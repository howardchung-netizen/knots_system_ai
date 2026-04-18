import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { MeasureType } from '../measureType.entity';

@ObjectType()
export class MeasureTypeSortPayload extends MutationPayload{
  @Field({ nullable: true })
  result?: boolean;
}
