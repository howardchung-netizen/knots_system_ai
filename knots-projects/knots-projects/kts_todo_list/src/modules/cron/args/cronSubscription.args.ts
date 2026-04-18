import { ArgsType, Field } from 'type-graphql';
import { CronStatus } from '../cron.entity';

@ArgsType()
export class CronSubscriptionArgs {
  @Field({ nullable: true })
  entity?: string;

  @Field(type => CronStatus, { nullable: true })
  status?: CronStatus;
}
