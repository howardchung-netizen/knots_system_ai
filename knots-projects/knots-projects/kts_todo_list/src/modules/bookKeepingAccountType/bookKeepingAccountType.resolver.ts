import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { BookKeepingAccountType } from "./bookKeepingAccountType.entity";
import { BookKeepingAccountTypeService } from './bookKeepingAccountType.service';
import { BookKeepingAccountTypeArgs } from './args/bookKeepingAccountType.args';
import { BookKeepingAccountTypeConnection } from './connection/bookKeepingAccountType.connection';
import { BookKeepingAccountTypePayload } from './payload/bookKeepingAccountType.payload';
import { BookKeepingAccountTypeUpdateInput } from './input/bookKeepingAccountTypeUpdate.input';
import { BookKeepingAccountTypeCreateInput } from './input/bookKeepingAccountTypeCreate.input';
import { BookKeepingAccountTypeDeletePayload } from './payload/bookKeepingAccountTypeDelete.payload';
import { BookKeepingAccountTypeDeleteInput } from './input/bookKeepingAccountTypeDelete.input';

export const RESOURCE_BOOKKEEPING_ACCOUNT_TYPE = BookKeepingAccountType.name;

@Resolver(() => BookKeepingAccountType)
export class BookKeepingAccountTypeResolver extends ResourceResolver(BookKeepingAccountType) {
  constructor(
    @Inject(type => BookKeepingAccountTypeService)
    private readonly bookKeepingAccountTypeService: BookKeepingAccountTypeService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_BOOKKEEPING_ACCOUNT_TYPE}:${PermissionAction.GET}`)
  @Query(type => BookKeepingAccountTypeConnection, { nullable: true, name: 'bookKeepingAccountTypes' })
  async getMany(@Args() args: BookKeepingAccountTypeArgs, @Ctx() req: ResolverContext): Promise<BookKeepingAccountTypeConnection> {
    return this.bookKeepingAccountTypeService.getMany(args);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_ACCOUNT_TYPE}:${PermissionAction.CREATE}`])
  @Mutation(
    type => BookKeepingAccountTypePayload,
    {
      name: 'bookKeepingAccountTypeCreate'
    }
  )
  async create(
    @Arg('data') data: BookKeepingAccountTypeCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<BookKeepingAccountTypePayload> {
    return this.bookKeepingAccountTypeService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_ACCOUNT_TYPE}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => BookKeepingAccountTypePayload,
    {
      name: 'bookKeepingAccountTypeUpdate'
    }
  )
  async update(
    @Arg('data') data: BookKeepingAccountTypeUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<BookKeepingAccountTypePayload> {
    return this.bookKeepingAccountTypeService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_ACCOUNT_TYPE}:${PermissionAction.DELETE}`])
  @Mutation(
    type => BookKeepingAccountTypeDeletePayload,
    {
      name: 'bookKeepingAccountTypeDelete',
      nullable: true,
    }
  )
  async delete(
    @Ctx() { user }: ResolverContext,
    @Arg('data') data: BookKeepingAccountTypeDeleteInput,
  ): Promise<BookKeepingAccountTypeDeletePayload> {
    return this.bookKeepingAccountTypeService.delete(data, user);
  }
}
