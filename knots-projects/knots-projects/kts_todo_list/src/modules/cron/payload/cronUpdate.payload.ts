import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Cron } from '../cron.entity';

@ObjectType()
export class CronUpdatePayload extends MutationPayload {
  @Field({ nullable: true })
  cron?: Cron;
}
