import { Arg, Authorized, Ctx, Int, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { Inject } from "typedi";
import { AccountingDashboardService } from './accountingDashboard.service';
import { AccountingDashboardPayload } from './payload/accountingDashboard.payload';
import { OverheadSummaryCategoryPayload } from './payload/overheadSummary.payload';

@Resolver()
export class AccountingDashboardResolver {
  constructor(
    @Inject(type => AccountingDashboardService)
    private readonly accountingDashboardService: AccountingDashboardService,
  ) {}

  @Authorized() // Ensure only logged-in users with valid token can see the Dashboard
  @Query(
    type => AccountingDashboardPayload,
    { name: 'accountingDashboardStats' }
  )
  async accountingDashboardStats(
    @Ctx() {user}: ResolverContext,
  ): Promise<AccountingDashboardPayload> {
    return this.accountingDashboardService.getDashboardStats();
  }

  @Authorized()
  @Query(
    type => [OverheadSummaryCategoryPayload],
    { name: 'overheadSummary' }
  )
  async getOverheadSummary(
    @Arg('year', type => Int) year: number,
    @Ctx() {user}: ResolverContext,
  ): Promise<OverheadSummaryCategoryPayload[]> {
    return this.accountingDashboardService.getOverheadSummary(year);
  }
}
