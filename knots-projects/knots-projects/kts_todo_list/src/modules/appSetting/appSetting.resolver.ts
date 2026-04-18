import {
  Resolver,
  Mutation,
  Arg,
  Authorized,
  Query,
  Args,
  Ctx,
  Root,
  Subscription,
} from 'type-graphql';
import { Inject } from 'typedi';
import { revivePayload } from "../../lib/subscription";
import { AppSetting } from './appSetting.entity';
import { AppSettingCreatePayload } from './payload/appSettingCreate.payload';
import { AppSettingInput } from './input/appSetting.input';
import { AppSettingService } from './appSetting.service';
import { ResourceResolver } from '../node/resource.resolver';
import { AppSettingUpdatePayload } from './payload/appSettingUpdate.payload';
import { AppSettingsArgs } from './args/appSettings.args';
import { AppSettingsConnection } from './connection/appSettings.connection';
import { AppSettingDeletePayload } from './payload/appSettingDelete.payload';
import { AppSettingDeleteInput } from './input/appSettingDelete.input';
import { PermissionAction } from '../admin/action/action.type';
import { ResolverContext } from '../../lib/types';
import { AppSettingSubscriptionArgs } from './args/appSettingSubscription.args';
import { AppSettingSubscriptionPayload } from './payload/appSettingSubscription.payload';

export const RESOURCE_APP_SETTING = AppSetting.name;

@Resolver(() => AppSetting)
export class AppSettingResolver extends ResourceResolver(AppSetting) {
  constructor(
    @Inject(type => AppSettingService)
    private readonly appSettingService: AppSettingService,
  ) {
    super();
  }

  @Query(() => AppSettingsConnection, { name: 'appSettings' })
  async getMany(
    @Args() args: AppSettingsArgs,
    @Ctx() { user, enforcer }: ResolverContext,
  ): Promise<AppSettingsConnection> {
    return this.appSettingService.getMany(args, user, enforcer);
  }

  @Authorized(`${RESOURCE_APP_SETTING}:${PermissionAction.CREATE}`)
  @Mutation(() => AppSettingCreatePayload, {
    name: 'appSettingCreate',
    nullable: true,
  })
  async create(
    @Arg('data') data: AppSettingInput,
  ): Promise<AppSettingCreatePayload> {
    return this.appSettingService.create(data);
  }

  @Authorized(`${RESOURCE_APP_SETTING}:${PermissionAction.UPDATE}`)
  @Mutation(() => AppSettingUpdatePayload, {
    name: 'appSettingUpdate',
    nullable: true,
  })
  async update(
    @Arg('data') data: AppSettingInput,
  ): Promise<AppSettingUpdatePayload> {
    return this.appSettingService.update(data);
  }

  @Authorized(`${RESOURCE_APP_SETTING}:${PermissionAction.DELETE}`)
  @Mutation(() => AppSettingDeletePayload, {
    name: 'appSettingDelete',
    nullable: true,
  })
  async delete(
    @Arg('data') data: AppSettingDeleteInput,
  ): Promise<AppSettingDeletePayload> {
    return this.appSettingService.delete(data);
  }

  @Subscription({
    topics: 'onAppSettingChange',
    filter: async ({ payload, args, context }) => {
      revivePayload(AppSetting, payload);

      if (args.key) {
        if ((!payload.node || payload.node.key !== args.key) && (!payload.previousValues || payload.previousValues.key !== args.key)) return false;
      }

      // check permission
      if (context.user && context.enforcer) {
        const hasAllPermission = await context.enforcer.enforce(context.user.id, RESOURCE_APP_SETTING, PermissionAction.ALL);
        if (!hasAllPermission) args.public = true;
      } else {
        args.public = true;
      }

      if ('public' in args) {
        if ((!payload.node || payload.node.public !== args.public) && (!payload.previousValues || payload.previousValues.public !== args.public)) return false;
      }

      return true;
    },
  })
  onAppSettingChange(
    @Root() payload: AppSettingSubscriptionPayload,
    @Args() args: AppSettingSubscriptionArgs,
  ): AppSettingSubscriptionPayload {
    // already converted in filter
    // revivePayload(AppSetting, payload);

    return payload;
  }
}
