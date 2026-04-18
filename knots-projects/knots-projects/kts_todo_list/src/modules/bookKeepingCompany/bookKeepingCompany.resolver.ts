import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { BookKeepingCompany } from "./bookKeepingCompany.entity";
import { BookKeepingCompanyService } from './bookKeepingCompany.service';
import { BookKeepingCompanyArgs } from './args/bookKeepingCompany.args';
import { BookKeepingCompanyConnection } from './connection/bookKeepingCompany.connection';
import { BookKeepingCompanyPayload } from './payload/bookKeepingCompany.payload';
import { BookKeepingCompanyUpdateInput } from './input/bookKeepingCompanyUpdate.input';
import { BookKeepingCompanyCreateInput } from './input/bookKeepingCompanyCreate.input';
import { BookKeepingCompanyDeletePayload } from './payload/bookKeepingCompanyDelete.payload';
import { BookKeepingCompanyDeleteInput } from './input/bookKeepingCompanyDelete.input';

export const RESOURCE_BOOKKEEPING_COMPANY = BookKeepingCompany.name;

@Resolver(() => BookKeepingCompany)
export class BookKeepingCompanyResolver extends ResourceResolver(BookKeepingCompany) {
  constructor(
    @Inject(type => BookKeepingCompanyService)
    private readonly bookKeepingCompanyService: BookKeepingCompanyService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_BOOKKEEPING_COMPANY}:${PermissionAction.GET}`)
  @Query(type => BookKeepingCompanyConnection, { nullable: true, name: 'bookKeepingCompanies' })
  async getMany(@Args() args: BookKeepingCompanyArgs, @Ctx() req: ResolverContext): Promise<BookKeepingCompanyConnection> {
    return this.bookKeepingCompanyService.getMany(args);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_COMPANY}:${PermissionAction.CREATE}`])
  @Mutation(
    type => BookKeepingCompanyPayload,
    {
      name: 'bookKeepingCompanyCreate'
    }
  )
  async create(
    @Arg('data') data: BookKeepingCompanyCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<BookKeepingCompanyPayload> {
    return this.bookKeepingCompanyService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_COMPANY}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => BookKeepingCompanyPayload,
    {
      name: 'bookKeepingCompanyUpdate'
    }
  )
  async update(
    @Arg('data') data: BookKeepingCompanyUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<BookKeepingCompanyPayload> {
    return this.bookKeepingCompanyService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_COMPANY}:${PermissionAction.DELETE}`])
  @Mutation(
    type => BookKeepingCompanyDeletePayload,
    {
      name: 'bookKeepingCompanyDelete',
      nullable: true,
    }
  )
  async delete(
    @Ctx() { user }: ResolverContext,
    @Arg('data') data: BookKeepingCompanyDeleteInput,
  ): Promise<BookKeepingCompanyDeletePayload> {
    return this.bookKeepingCompanyService.delete(data, user);
  }
}
