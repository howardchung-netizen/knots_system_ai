import { ArgsType, Field } from 'type-graphql';
import { ConnectionArgs } from '../../common/connectionPaging';
import { CronStatus } from '../cron.entity';

@ArgsType()
export class CronsArgs extends ConnectionArgs {
  @Field({ nullable: true })
  entity?: string;

  @Field(type => CronStatus, { nullable: true })
  status?: CronStatus;
}
