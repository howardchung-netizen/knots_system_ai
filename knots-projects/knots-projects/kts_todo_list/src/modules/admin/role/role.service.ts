import { Service, Inject } from 'typedi';
import { Enforcer, Watcher } from 'casbin';
import { Container } from 'typedi';
import { RoleInput } from './input/role.input';
import { RoleCreatePayload } from './payload/roleCreate.payload';
import { InjectManager } from 'typeorm-typedi-extensions';
import { EntityManager } from 'typeorm';
import { RoleDeleteInput } from './input/roleDelete.input';
import { RoleDeletePayload } from './payload/roleDelete.payload';
import { User } from '../../user/user.entity';
import { RolesArgs } from '../args/roles.args';
import { PermissionService } from '../permission/permission.service';
import { ServiceAccount } from '../../serviceAccount/serviceAccount.entity';

@Service()
export class RoleService {
  constructor(
    @InjectManager()
    private readonly manager: EntityManager,
    @Inject(type => PermissionService)
    private readonly permissionService: PermissionService,
  ) {
  }

  static namespace = `role`;
  namespace = RoleService.namespace;

  async getMany({ names }: RolesArgs) {
    if (names) {
      return this.manager
        .createQueryBuilder()
        .select(
          `DISTINCT RIGHT(rule.v0, LENGTH(v0) - ${
            `${this.namespace}::`.length
          })`,
          'name',
        )
        .from('casbin_rule', 'rule')
        .where('ptype = :ptype', { ptype: 'g' })
        .andWhere('v0 IN (:...names)', {
          names: names.map(name => `${this.namespace}::${name}`),
        })
        .getRawMany();
    }
    return this.manager.query(
      `SELECT DISTINCT RIGHT(v0, LENGTH(v0) - ?) AS name FROM casbin_rule WHERE ptype = 'g' AND v0 LIKE '%role::%'`,
      [`${this.namespace}::`.length],
    );
  }

  async getOne(name: string) {
    const query = await this.manager.query(
      `SELECT DISTINCT RIGHT(v0, LENGTH(v0) - ?) AS name FROM casbin_rule WHERE ptype = 'g' AND v0 = ? LIMIT 1`,
      [`${this.namespace}::`.length, `${this.namespace}::${name}`],
    );

    return query.length ? query[0] : null;
  }

  async create(
    { name, permissions, roles }: RoleInput,
    enforcer: Enforcer,
    addNamespace: boolean = true,
  ): Promise<RoleCreatePayload> {
    const casbinName = addNamespace ? `${this.namespace}::${name}` : name;

    if (permissions) {
      await Promise.all(
        permissions.map(p =>
          enforcer.addRoleForUser(casbinName, `${this.permissionService.namespace}::${p}`),
        ),
      );
    }

    if (roles) {
      await Promise.all(
        roles.map(
          r =>
            r !== name &&
            enforcer.addRoleForUser(casbinName, `${this.namespace}::${r}`),
        ),
      );
    }

    return {
      userErrors: [],
      role: {
        name,
      },
    };
  }

  async update(
    data: RoleInput,
    enforcer: Enforcer,
    addNamespace: boolean = true,
  ) {
    enforcer.enableAutoNotifyWatcher(false);

    await this.delete(data, enforcer, addNamespace, false);
    const payload = await this.create(data, enforcer, addNamespace);

    // const enforcerWatcher: Watcher | undefined  = Container.get('enforcerWatcher');
    // if (!!enforcerWatcher) await enforcerWatcher.update();

    // enforcer.enableAutoNotifyWatcher(true);

    return payload;
  }

  async delete(
    { name }: RoleDeleteInput,
    enforcer: Enforcer,
    addNamespace: boolean = true,
    removeUserRole: boolean = true,
  ): Promise<RoleDeletePayload> {
    const casbinName = addNamespace ? `${this.namespace}::${name}` : name;

    await enforcer.removeFilteredGroupingPolicy(0, casbinName);
    if (removeUserRole) await enforcer.removeFilteredGroupingPolicy(1, casbinName);
    return {
      deletedRoleName: name,
      userErrors: [],
    };
  }

  async updateUserRoles(user: User, roles: string[], enforcer: Enforcer) {
    return this.update({ name: user.id.toString(), roles }, enforcer, false);
  }

  async updateServiceAccountRoles(serviceAccount: ServiceAccount, roles: string[], enforcer: Enforcer) {
    return this.update({ name: `service_account::${serviceAccount.id}`, roles }, enforcer, false);
  }

  static async getRoles(name: string, enforcer: Enforcer, imlicit: boolean = true) {
    const roles = imlicit ? (await enforcer.getImplicitRolesForUser(name.toString())) : (await enforcer.getRolesForUser(name.toString()));

    return roles
      .filter(r => r.includes(`${this.namespace}::`))
      .map(r => ({
        name: r.split('::')[1],
      }));
  }

  async getRoles(name: string, enforcer: Enforcer, imlicit: boolean = true) {
    return RoleService.getRoles(name, enforcer, imlicit);
  }
}
