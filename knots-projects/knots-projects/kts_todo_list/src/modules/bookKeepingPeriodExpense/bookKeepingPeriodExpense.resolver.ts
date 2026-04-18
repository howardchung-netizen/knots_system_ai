import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { BookKeepingPeriodExpense } from "./bookKeepingPeriodExpense.entity";
import { BookKeepingPeriodExpenseService } from './bookKeepingPeriodExpense.service';
import { BookKeepingPeriodExpenseArgs } from './args/bookKeepingPeriodExpense.args';
import { BookKeepingPeriodExpenseConnection } from './connection/bookKeepingPeriodExpense.connection';
import { BookKeepingPeriodExpensePayload } from './payload/bookKeepingPeriodExpense.payload';
import { BookKeepingPeriodExpenseUpdateInput } from './input/bookKeepingPeriodExpenseUpdate.input';
import { BookKeepingPeriodExpenseCreateInput } from './input/bookKeepingPeriodExpenseCreate.input';
import { BookKeepingPeriodExpenseDeletePayload } from './payload/bookKeepingPeriodExpenseDelete.payload';
import { BookKeepingPeriodExpenseDeleteInput } from './input/bookKeepingPeriodExpenseDelete.input';
import { BookKeepingPeriodExpenseOccurrence } from './payload/bookKeepingPeriodExpenseOccurrence';
import { BookKeepingPeriodExpenseOccurrenceArgs } from './args/bookKeepingPeriodExpenseOccurrence.args';

export const RESOURCE_BOOKKEEPING_TRANSACTION = BookKeepingPeriodExpense.name;

@Resolver(() => BookKeepingPeriodExpense)
export class BookKeepingPeriodExpenseResolver extends ResourceResolver(BookKeepingPeriodExpense) {
  constructor(
    @Inject(type => BookKeepingPeriodExpenseService)
    private readonly bookKeepingPeriodExpenseService: BookKeepingPeriodExpenseService,
  ) {
    super();
  }

  @FieldResolver()
  async company(
    @Root() root: BookKeepingPeriodExpense,
    @Ctx() {
      bookKeepingCompanyLoader,
    }: ResolverContext,
  ) {
    return root.companyId ? bookKeepingCompanyLoader.load(root.companyId) : null;
  }

  @FieldResolver()
  async categoryAccount(
    @Root() root: BookKeepingPeriodExpense,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.categoryAccountId ? bookKeepingAccountLoader.load(root.categoryAccountId) : null;
  }

  @FieldResolver()
  async personInCharge(
    @Root() root: BookKeepingPeriodExpense,
    @Ctx() {
      userLoader,
    }: ResolverContext,
  ) {
    return root.personInChargeId ? userLoader.load(String(root.personInChargeId)) : null;
  }

  @FieldResolver()
  async chargeAccount(
    @Root() root: BookKeepingPeriodExpense,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.chargeAccountId ? bookKeepingAccountLoader.load(root.chargeAccountId) : null;
  }

  @Authorized(`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.GET}`)
  @Query(type => BookKeepingPeriodExpenseConnection, { nullable: true, name: 'bookKeepingPeriodExpenses' })
  async getMany(@Args() args: BookKeepingPeriodExpenseArgs, @Ctx() req: ResolverContext): Promise<BookKeepingPeriodExpenseConnection> {
    return this.bookKeepingPeriodExpenseService.getMany(args);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.CREATE}`])
  @Mutation(
    type => BookKeepingPeriodExpensePayload,
    {
      name: 'bookKeepingPeriodExpenseCreate'
    }
  )
  async create(
    @Arg('data') data: BookKeepingPeriodExpenseCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<BookKeepingPeriodExpensePayload> {
    return this.bookKeepingPeriodExpenseService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => BookKeepingPeriodExpensePayload,
    {
      name: 'bookKeepingPeriodExpenseUpdate'
    }
  )
  async update(
    @Arg('data') data: BookKeepingPeriodExpenseUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<BookKeepingPeriodExpensePayload> {
    return this.bookKeepingPeriodExpenseService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.DELETE}`])
  @Mutation(
    type => BookKeepingPeriodExpenseDeletePayload,
    {
      name: 'bookKeepingPeriodExpenseDelete',
      nullable: true,
    }
  )
  async delete(
    @Ctx() { user }: ResolverContext,
    @Arg('data') data: BookKeepingPeriodExpenseDeleteInput,
  ): Promise<BookKeepingPeriodExpenseDeletePayload> {
    return this.bookKeepingPeriodExpenseService.delete(data, user);
  }

  @Authorized(`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.GET}`)
  @Query(() => [BookKeepingPeriodExpenseOccurrence], { name: 'bookKeepingPeriodExpenseInRange' })
  async getExpensesInRange(
    @Args() args: BookKeepingPeriodExpenseOccurrenceArgs,
    @Ctx() ctx: ResolverContext
  ): Promise<BookKeepingPeriodExpenseOccurrence[]> {
    return this.bookKeepingPeriodExpenseService.getExpensesInRange(args.rangeFromDate, args.rangeToDate);
  }
}
