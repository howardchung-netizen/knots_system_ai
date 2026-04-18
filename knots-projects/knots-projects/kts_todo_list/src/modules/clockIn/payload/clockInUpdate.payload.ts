import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ClockIn } from '../clockIn.entity';

@ObjectType()
export class ClockInUpdatePayload extends MutationPayload{
 @Field({ nullable: true })
 clockIn?: ClockIn;
}
