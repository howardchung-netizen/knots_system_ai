import { Query } from 'type-graphql';
import { PermissionAction } from './action.type';

export class ActionResolver {
  @Query(() => [String], { nullable: true })
  actions() {
    return Object.keys(PermissionAction);
  }
}
