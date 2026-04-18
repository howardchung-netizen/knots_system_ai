import { ObjectType, Field } from 'type-graphql';
import { SubscriptionPayload } from '../../common/subscriptionPayload.type';
import { Cron } from '../cron.entity';

@ObjectType()
export class CronSubscriptionPayload extends SubscriptionPayload {
  @Field(type => Cron, { nullable: true })
  node?: Cron;

  @Field(type => Cron, { nullable: true })
  previousValues?: Cron;
}
