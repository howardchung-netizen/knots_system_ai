import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { Terms } from "./terms.entity";
import { TermsService } from './terms.service';
import { TermsConnection } from './connection/terms.connection';
import { TermsArgs } from './args/terms.args';
import { TermsPayload } from './payload/terms.payload';
import { TermsCreateInput } from './input/termsCreate.input';
import { TermsUpdateInput } from './input/termsUpdate.input';
import { RESOURCE_QUOTATION } from '../quotation/quotation.resolver';
import { TermsDeleteInput } from './input/termsDelete.input';

@Resolver(() => Terms)
export class TermsResolver extends ResourceResolver(Terms) {
  constructor(
    @Inject(type => TermsService)
    private readonly termsService: TermsService,
  ) {
    super();
  }

  @FieldResolver()
  async realId(
    @Root() root: Terms,
  ) {
    return root.id;
  }

  @Authorized(`${RESOURCE_QUOTATION}:${PermissionAction.GET}`)
  @Query(type => TermsConnection, { nullable: true, name: 'termses' })
  async getMany(@Args() args: TermsArgs, @Ctx() req: ResolverContext): Promise<TermsConnection> {
    return this.termsService.getMany(args);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.CREATE}`])
  @Mutation(
    type => TermsPayload,
    {
      name: 'termsCreate'
    }
  )
  async create(
    @Arg('data') data: TermsCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<TermsPayload> {
    return this.termsService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => TermsPayload,
    {
      name: 'termsUpdate'
    }
  )
  async update(
    @Arg('data') data: TermsUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<TermsPayload> {
    return this.termsService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.DELETE}`])
  @Mutation(
    type => TermsPayload,
    {
      name: 'termsDelete'
    }
  )
  async delete(
    @Arg('data') data: TermsDeleteInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<TermsPayload> {
    return this.termsService.save(data, user, enforcer);
  }
}
