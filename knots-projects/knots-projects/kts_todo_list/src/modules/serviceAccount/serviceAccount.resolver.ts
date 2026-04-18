import { Resolver, Authorized, FieldResolver, Query, Mutation, Root, Ctx, Args, Arg } from 'type-graphql';
import { Inject } from 'typedi';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from '../admin/action/action.type';
import { ServiceAccount } from './serviceAccount.entity';
import { ServiceAccountService } from './serviceAccount.service';
import { ServiceAccountsArgs } from './args/serviceAccounts.args';
import { ServiceAccountsConnection } from './connection/serviceAccounts.connection';
import { ServiceAccountCreateInput } from './input/serviceAccountCreate.input';
import { ServiceAccountUpdateInput } from './input/serviceAccountUpdate.input';
import { ServiceAccountRegenerateTokenInput } from './input/serviceAccountRegenerateToken.input';
import { ServiceAccountSavePayload } from './payload/serviceAccountSave.payload';
import { RoleService } from '../admin/role/role.service';
import { ServiceAccountDeleteInput } from './input/serviceAccountDelete.input';
import { ServiceAccountDeletePayload } from './payload/serviceAccountDelete.payload';

export const RESOURCE_SERVICE_ACCOUNT = ServiceAccount.name;

@Resolver(() => ServiceAccount)
export class ServiceAccountResolver extends ResourceResolver(ServiceAccount) {
  constructor(
    @Inject(type => ServiceAccountService)
    private readonly serviceAccountService: ServiceAccountService,
    @Inject(type => RoleService)
    private readonly roleService: RoleService,
  ) {
    super();
  }

  @FieldResolver()
  async roles(
    @Root() root: ServiceAccount,
    @Ctx() { enforcer }: ResolverContext,
  ) {
    return this.roleService.getRoles(`service_account::${root.id}`, enforcer);
  }

  @Authorized(`${RESOURCE_SERVICE_ACCOUNT}:${PermissionAction.GET}`)
  @Query(type => ServiceAccountsConnection, { name: 'serviceAccounts' })
  async getMany(
    @Args() args: ServiceAccountsArgs,
  ): Promise<ServiceAccountsConnection> {
    return this.serviceAccountService.getMany(args);
  }

  @Authorized(`${RESOURCE_SERVICE_ACCOUNT}:${PermissionAction.CREATE}`)
  @Mutation(type => ServiceAccountSavePayload, { name: 'serviceAccountCreate', nullable: true })
  async create(
    @Ctx() { enforcer }: ResolverContext,
    @Arg('data') data: ServiceAccountCreateInput,
  ): Promise<ServiceAccountSavePayload> {
    return this.serviceAccountService.save(enforcer, data);
  }

  @Authorized(`${RESOURCE_SERVICE_ACCOUNT}:${PermissionAction.UPDATE}`)
  @Mutation(type => ServiceAccountSavePayload, { name: 'serviceAccountUpdate', nullable: true })
  async update(
    @Ctx() { enforcer }: ResolverContext,
    @Arg('data') data: ServiceAccountUpdateInput,
  ): Promise<ServiceAccountSavePayload> {
    return this.serviceAccountService.save(enforcer, data);
  }

  @Authorized(`${RESOURCE_SERVICE_ACCOUNT}:${PermissionAction.UPDATE}`)
  @Mutation(type => ServiceAccountSavePayload, { name: 'serviceAccountRegenerateToken', nullable: true })
  async regenerateToken(
    @Arg('data') data: ServiceAccountRegenerateTokenInput,
  ): Promise<ServiceAccountSavePayload> {
    return this.serviceAccountService.regenerateToken(data);
  }

  @Authorized(`${RESOURCE_SERVICE_ACCOUNT}:${PermissionAction.DELETE}`)
  @Mutation(type => ServiceAccountDeletePayload, { name: 'serviceAccountDelete', nullable: true })
  async delete(
    @Ctx() { enforcer }: ResolverContext,
    @Arg('data') data: ServiceAccountDeleteInput,
  ): Promise<ServiceAccountDeletePayload> {
    return this.serviceAccountService.delete(enforcer,data);
  }
}
