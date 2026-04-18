import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { BookKeepingAccount } from "./bookKeepingAccount.entity";
import { BookKeepingAccountService } from './bookKeepingAccount.service';
import { BookKeepingAccountArgs } from './args/bookKeepingAccount.args';
import { BookKeepingAccountConnection } from './connection/bookKeepingAccount.connection';
import { BookKeepingAccountPayload } from './payload/bookKeepingAccount.payload';
import { BookKeepingAccountUpdateInput } from './input/bookKeepingAccountUpdate.input';
import { BookKeepingAccountCreateInput } from './input/bookKeepingAccountCreate.input';
import { BookKeepingAccountDeletePayload } from './payload/bookKeepingAccountDelete.payload';
import { BookKeepingAccountDeleteInput } from './input/bookKeepingAccountDelete.input';

export const RESOURCE_BOOKKEEPING_ACCOUNT = BookKeepingAccount.name;

@Resolver(() => BookKeepingAccount)
export class BookKeepingAccountResolver extends ResourceResolver(BookKeepingAccount) {
  constructor(
    @Inject(type => BookKeepingAccountService)
    private readonly bookKeepingAccountService: BookKeepingAccountService,
  ) {
    super();
  }

  @FieldResolver()
  async company(
    @Root() root: BookKeepingAccount,
    @Ctx() {
      bookKeepingCompanyLoader,
    }: ResolverContext,
  ) {
    if(root.companyId) return bookKeepingCompanyLoader.load(root.companyId);
  }

  @FieldResolver()
  async accountType(
    @Root() root: BookKeepingAccount,
    @Ctx() {
      bookKeepingAccountTypeLoader,
    }: ResolverContext,
  ) {
    return bookKeepingAccountTypeLoader.load(root.accountTypeId);
  }

  @FieldResolver()
  async parentAccount(
    @Root() root: BookKeepingAccount,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.parentAccountId ? bookKeepingAccountLoader.load(root.parentAccountId) : null;
  }

  // @FieldResolver()
  // async child(
  //   @Root() root: BookKeepingAccount,
  //   @Ctx() {
  //     bookKeepingAccountLoader,
  //   }: ResolverContext,
  // ) {
  //   if(root.lower  === '0') return null
  //   const childIds = root.lower?.split(',')?.map((e: string) => e) ?? [];
  //   const child = await bookKeepingAccountLoader.loadMany(childIds);
  //   return child;
  // }

  @Authorized(`${RESOURCE_BOOKKEEPING_ACCOUNT}:${PermissionAction.GET}`)
  @Query(type => BookKeepingAccountConnection, { nullable: true, name: 'bookKeepingAccounts' })
  async getMany(@Args() args: BookKeepingAccountArgs, @Ctx() req: ResolverContext): Promise<BookKeepingAccountConnection> {
    return this.bookKeepingAccountService.getMany(args);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_ACCOUNT}:${PermissionAction.CREATE}`])
  @Mutation(
    type => BookKeepingAccountPayload,
    {
      name: 'bookKeepingAccountCreate'
    }
  )
  async create(
    @Arg('data') data: BookKeepingAccountCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<BookKeepingAccountPayload> {
    return this.bookKeepingAccountService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_ACCOUNT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => BookKeepingAccountPayload,
    {
      name: 'bookKeepingAccountUpdate'
    }
  )
  async update(
    @Arg('data') data: BookKeepingAccountUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<BookKeepingAccountPayload> {
    return this.bookKeepingAccountService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_ACCOUNT}:${PermissionAction.DELETE}`])
  @Mutation(
    type => BookKeepingAccountDeletePayload,
    {
      name: 'bookKeepingAccountDelete',
      nullable: true,
    }
  )
  async delete(
    @Ctx() { user }: ResolverContext,
    @Arg('data') data: BookKeepingAccountDeleteInput,
  ): Promise<BookKeepingAccountDeletePayload> {
    return this.bookKeepingAccountService.delete(data, user);
  }
}
