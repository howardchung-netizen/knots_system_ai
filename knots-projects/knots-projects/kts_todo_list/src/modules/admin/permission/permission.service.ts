import { Service } from 'typedi';
import { Enforcer } from 'casbin';
import { validate } from 'class-validator';
import { PermissionInput } from './input/permission.input';
import { Permission } from './permission.type';
import { plainToClass } from 'class-transformer';
import { getUserValidationErrors } from '../../../lib/userErrors';
import { PermissionCreatePayload } from './payload/PermissionCreate.payload';
import { PermissionUpdatePayload } from './payload/PermissionUpdate.payload';
import { PermissionDeletePayload } from './payload/PermissionDelete.payload';
import { PermissionAction } from '../action/action.type';
import { PermissionDeleteInput } from './input/permissionDelete.input';

@Service()
export class PermissionService {
  static namespace = `permission`;
  namespace = PermissionService.namespace;

  mapNameToPolicyName(name: String): string {
    return `${this.namespace}::${name}`;
  }

  mapActionsToActionString(actions: PermissionAction[]): string {
    if (actions.includes(PermissionAction.ALL)) {
      return PermissionAction.ALL;
    }
    return `(${actions.join('|')})`;
  }

  mapActionStringToActions(actionString: string): PermissionAction[] {
    if (actionString === PermissionAction.ALL) return [PermissionAction.ALL];

    if (actionString.length < 2) return [];

    const actions: PermissionAction[] = [];
    actionString.slice(1, -1).split('|').forEach(v => {
      switch (v) {
        case 'get':
          actions.push(PermissionAction.GET);
          break;
        case 'create':
          actions.push(PermissionAction.CREATE);
          break;
        case 'update':
          actions.push(PermissionAction.UPDATE);
          break;
        case 'delete':
          actions.push(PermissionAction.DELETE);
          break;
      }
    });

    return actions;
  }

  mapPolicyToPermission(p: string[]): Permission {
    return {
      name: p[0].split('::')[1],
      resource: p[1],
      actions: this.mapActionStringToActions(p[2]),
    };
  }

  mapPermissionToPolicy(permission: Permission): string[] {
    return [
      this.mapNameToPolicyName(permission.name),
      permission.resource,
      this.mapActionsToActionString(permission.actions),
    ];
  }

  async getMany(enforcer: Enforcer): Promise<Permission[]> {
    const policies = await enforcer.getPolicy();
    return policies.map(this.mapPolicyToPermission, this);
  }

  async getOne(name: string, enforcer: Enforcer) {
    const policy = (await enforcer.getFilteredPolicy(0, this.mapNameToPolicyName(name)))[0];
    return this.mapPolicyToPermission(policy);
  }

  async create(data: PermissionInput, enforcer: Enforcer): Promise<PermissionCreatePayload> {
    const permission = plainToClass(Permission, {
      ...data,
      action: data.actions ? this.mapActionsToActionString(data.actions) : undefined,
    });
    const errors = await validate(permission);
    if (!!errors.length) {
      return {
        userErrors: getUserValidationErrors(errors),
      };
    }
    const policy = this.mapPermissionToPolicy(permission);
    if (await enforcer.hasPolicy(...policy)) {
      console.error(`Policy ${policy[0]} already exists`);
      return {
        userErrors: [
          {
            message: `Policy ${policy[0]} already exists`,
            field: [],
          },
        ],
      };
    }
    await enforcer.addPolicy(...policy);
    return { userErrors: [], permission };
  }

  async update(data: PermissionInput, enforcer: Enforcer): Promise<PermissionUpdatePayload> {
    await this.delete(data, enforcer);
    return this.create(data, enforcer);
  }

  async delete(
    data: PermissionDeleteInput,
    enforcer: Enforcer,
  ): Promise<PermissionDeletePayload> {
    await enforcer.removeFilteredPolicy(0, this.mapNameToPolicyName(data.name));

    return { userErrors: [], deletedPermissionName: data.name };
  }
}
