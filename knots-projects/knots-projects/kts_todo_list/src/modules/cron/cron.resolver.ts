import { Resolver, Authorized, Query, Mutation, Subscription, Root, Args, Arg } from 'type-graphql';
import { Inject } from 'typedi';
import { Cron } from './cron.entity';
import { CronService } from './cron.service';
import { CronsArgs } from './args/crons.args';
import { CronsConnection } from './connection/crons.connection';
import { CronUpdateInput } from './input/cronUpdate.input';
import { CronUpdatePayload } from './payload/cronUpdate.payload';
import { CronSubscriptionArgs } from './args/cronSubscription.args';
import { CronSubscriptionPayload } from './payload/cronSubscription.payload';

export const RESOURCE_CRON = Cron.name;

@Resolver(() => Cron)
export class CronResolver {
  constructor(
    @Inject(type => CronService)
    private readonly cronService: CronService,
  ) {
  }

  @Authorized()
  @Query(type => CronsConnection, { name: 'crons' })
  async getMany(
    @Args() args: CronsArgs,
  ): Promise<CronsConnection> {
    return this.cronService.getMany(args);
  }

  @Authorized()
  @Mutation(type => CronUpdatePayload, { nullable: true, name: 'cronUpdate' })
  async update(
    @Arg('data') data: CronUpdateInput,
  ): Promise<CronUpdatePayload> {
    return this.cronService.update(data);
  }

}