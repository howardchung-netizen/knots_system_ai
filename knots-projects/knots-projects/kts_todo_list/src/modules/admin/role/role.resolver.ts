import {
  Resolver,
  Query,
  Ctx,
  FieldResolver,
  Root,
  Mutation,
  Arg,
  Authorized,
  Args,
} from 'type-graphql';
import { Role } from './role.type';
import { ResolverContext } from '../../../lib/types';
import { Permission } from '../permission/permission.type';
import { RoleService } from './role.service';
import { PermissionService } from '../permission/permission.service';
import { RoleCreatePayload } from './payload/roleCreate.payload';
import { RoleInput } from './input/role.input';
import { RoleDeletePayload } from './payload/roleDelete.payload';
import { RoleDeleteInput } from './input/roleDelete.input';
import { RoleUpdatePayload } from './payload/roleUpdate.payload';
import { PermissionAction } from '../action/action.type';
import { RolesArgs } from '../args/roles.args';

export const RESOURCE_ROLE = 'Role';

@Resolver(of => Role)
export class RoleResolver {
  constructor(
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
  ) {}

  @Authorized(`${RESOURCE_ROLE}:${PermissionAction.GET}`)
  @Query(type => [Role], { nullable: true, name: 'roles' })
  async getMany(@Args() args: RolesArgs): Promise<Role[]> {
    return this.roleService.getMany(args);
  }

  @Authorized(`${RESOURCE_ROLE}:${PermissionAction.GET}`)
  @Query(type => Role, { nullable: true, name: 'role' })
  async getOne(
    @Arg('name', { nullable: true }) name: string,
  ): Promise<Role | null> {
    return this.roleService.getOne(name);
  }

  @Authorized(`${RESOURCE_ROLE}:${PermissionAction.CREATE}`)
  @Mutation(type => RoleCreatePayload, { nullable: true, name: 'roleCreate' })
  async create(
    @Arg('data') data: RoleInput,
    @Ctx() { enforcer }: ResolverContext,
  ): Promise<RoleCreatePayload> {
    return this.roleService.create(data, enforcer);
  }

  @Authorized(`${RESOURCE_ROLE}:${PermissionAction.UPDATE}`)
  @Mutation(type => RoleUpdatePayload, { nullable: true, name: 'roleUpdate' })
  async update(
    @Arg('data') data: RoleInput,
    @Ctx() { enforcer }: ResolverContext,
  ): Promise<RoleUpdatePayload> {
    return this.roleService.update(data, enforcer);
  }

  @Authorized(`${RESOURCE_ROLE}:${PermissionAction.DELETE}`)
  @Mutation(type => RoleDeletePayload, { nullable: true, name: 'roleDelete' })
  async delete(
    @Arg('data') data: RoleDeleteInput,
    @Ctx() { enforcer }: ResolverContext,
  ): Promise<RoleDeletePayload> {
    return this.roleService.delete(data, enforcer);
  }

  @FieldResolver()
  async explicitPermissions(
    @Root() root: Role,
    @Ctx() { enforcer }: ResolverContext,
  ): Promise<Permission[]> {
    const explicitPermissions = await enforcer.getRolesForUser(
      `${this.roleService.namespace}::${root.name}`,
    );

    let permissions: string[][] = [];
    for (const explicitPermission of explicitPermissions) {
      if (!explicitPermission.startsWith(`${this.permissionService.namespace}::`)) continue;

      permissions = permissions.concat(await enforcer.getImplicitPermissionsForUser(explicitPermission));
    }

    return permissions.map(this.permissionService.mapPolicyToPermission, this.permissionService);
  }

  @FieldResolver()
  async permissions(
    @Root() root: Role,
    @Ctx() { enforcer }: ResolverContext,
  ): Promise<Permission[]> {
    const permissions = await enforcer.getImplicitPermissionsForUser(
      `${this.roleService.namespace}::${root.name}`,
    );
    return permissions.map(this.permissionService.mapPolicyToPermission, this.permissionService);
  }

  @FieldResolver()
  async roles(
    @Root() root: Role,
    @Ctx() { enforcer }: ResolverContext,
  ): Promise<Role[]> {
    return this.roleService.getRoles(
      `${this.roleService.namespace}::${root.name}`,
      enforcer,
    );
  }
}
