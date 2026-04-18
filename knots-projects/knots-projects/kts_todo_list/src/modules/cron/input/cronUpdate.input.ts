import { InputType, Field } from 'type-graphql';
import { Cron, CronStatus } from '../cron.entity';

@InputType()
export class CronUpdateInput implements Partial<Cron> {
  @Field()
  entity: string;

  @Field(type => CronStatus, { nullable: true })
  status?: CronStatus;
}
