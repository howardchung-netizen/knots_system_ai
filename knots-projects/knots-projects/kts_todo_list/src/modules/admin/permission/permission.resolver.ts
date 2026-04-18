import { Resolver, Query, Ctx, Mutation, Arg, Authorized } from 'type-graphql';
import { Permission } from './permission.type';
import { ResolverContext } from '../../../lib/types';
import { PermissionInput } from './input/permission.input';
import { PermissionService } from './permission.service';
import { PermissionCreatePayload } from './payload/PermissionCreate.payload';
import { PermissionUpdatePayload } from './payload/PermissionUpdate.payload';
import { PermissionDeletePayload } from './payload/PermissionDelete.payload';
import { PermissionAction } from '../action/action.type';
import { PermissionDeleteInput } from './input/permissionDelete.input';

export const RESOURCE_PERMISSION = 'Permission';

@Resolver()
export class PermissionResolver {
  constructor(private readonly permissionService: PermissionService) {}

  @Authorized(`${RESOURCE_PERMISSION}:${PermissionAction.GET}`)
  @Query(type => [Permission], { nullable: true, name: 'permissions' })
  async getMany(@Ctx() { enforcer }: ResolverContext): Promise<Permission[]> {
    return this.permissionService.getMany(enforcer);
  }

  @Authorized(`${RESOURCE_PERMISSION}:${PermissionAction.GET}`)
  @Query(type => Permission, { nullable: true, name: 'permission' })
  async getOne(
    @Arg('name', { nullable: true }) name: string,
    @Ctx() { enforcer }: ResolverContext,
  ): Promise<Permission | null> {
    return this.permissionService.getOne(name, enforcer);
  }

  @Authorized(`${RESOURCE_PERMISSION}:${PermissionAction.CREATE}`)
  @Mutation(type => PermissionCreatePayload, {
    nullable: true,
    name: 'permissionCreate',
  })
  async create(
    @Arg('data') data: PermissionInput,
    @Ctx() { enforcer }: ResolverContext,
  ) {
    return this.permissionService.create(data, enforcer);
  }

  @Authorized(`${RESOURCE_PERMISSION}:${PermissionAction.UPDATE}`)
  @Mutation(type => PermissionUpdatePayload, { nullable: true, name: 'permissionUpdate' })
  async update(
    @Arg('data') data: PermissionInput,
    @Ctx() { enforcer }: ResolverContext,
  ): Promise<PermissionUpdatePayload> {
    return this.permissionService.update(data, enforcer);
  }

  @Authorized(`${RESOURCE_PERMISSION}:${PermissionAction.DELETE}`)
  @Mutation(type => PermissionDeletePayload, {
    nullable: true,
    name: 'permissionDelete',
  })
  async delete(
    @Arg('data') data: PermissionDeleteInput,
    @Ctx() { enforcer }: ResolverContext,
  ) {
    return this.permissionService.delete(data, enforcer);
  }
}
