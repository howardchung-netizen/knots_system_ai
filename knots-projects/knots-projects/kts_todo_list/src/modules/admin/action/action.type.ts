import { registerEnumType } from 'type-graphql';

export enum PermissionAction {
  GET = 'get',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ALL = '.*',
}

registerEnumType(PermissionAction, {
  name: 'PermissionAction',
});
