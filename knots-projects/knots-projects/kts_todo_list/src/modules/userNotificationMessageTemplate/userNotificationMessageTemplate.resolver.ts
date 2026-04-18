import {Resolver, Authorized, Query, Mutation, Ctx, Args, Arg} from 'type-graphql';
import {Inject} from 'typedi';
import {ResolverContext} from '../../lib/types';
import {ResourceResolver} from '../node/resource.resolver';
import {PermissionAction} from '../admin/action/action.type';
import {UserNotificationMessageTemplate} from './userNotificationMessageTemplate.entity';
import {UserNotificationMessageTemplateService} from './userNotificationMessageTemplate.service';
import {UserNotificationMessageTemplatesConnection} from './connection/userNotificationMessageTemplates.connection';
import {UserNotificationMessageTemplatesArgs} from './args/userNotificationMessageTemplates.args';
import {UserNotificationMessageTemplateCreatePayload} from './payload/userNotificationMessageTemplateCreate.payload';
import {UserNotificationMessageTemplateUpdatePayload} from './payload/userNotificationMessageTemplateUpdate.payload';
import {UserNotificationMessageTemplateCreateInput} from './input/userNotificationMessageTemplateCreate.input';
import {UserNotificationMessageTemplateUpdateInput} from './input/userNotificationMessageTemplateUpdate.input';

export const RESOURCE_USER_NOTIFICATION_MESSAGE_TEMPLATE = UserNotificationMessageTemplate.name;

@Resolver(type => UserNotificationMessageTemplate)
export class UserNotificationMessageTemplateResolver extends ResourceResolver(UserNotificationMessageTemplate) {
  constructor(
    @Inject(type => UserNotificationMessageTemplateService)
    private readonly userNotificationMessageTemplateService: UserNotificationMessageTemplateService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_USER_NOTIFICATION_MESSAGE_TEMPLATE}:${PermissionAction.GET}`)
  @Query(type => UserNotificationMessageTemplatesConnection, { name: 'userNotificationMessageTemplates' })
  async getMany(
    @Ctx() { user, enforcer }: ResolverContext,
    @Args() args: UserNotificationMessageTemplatesArgs,
  ): Promise<UserNotificationMessageTemplatesConnection> {
    return this.userNotificationMessageTemplateService.getMany(user, enforcer, args);
  }

  @Authorized(`${RESOURCE_USER_NOTIFICATION_MESSAGE_TEMPLATE}:${PermissionAction.CREATE}`)
  @Mutation(type => UserNotificationMessageTemplateCreatePayload, { name: 'userNotificationMessageTemplateCreate', nullable: true })
  async create(
    @Arg('data') data: UserNotificationMessageTemplateCreateInput,
  ): Promise<UserNotificationMessageTemplateCreatePayload> {
    return this.userNotificationMessageTemplateService.create(data);
  }

  @Authorized(`${RESOURCE_USER_NOTIFICATION_MESSAGE_TEMPLATE}:${PermissionAction.UPDATE}`)
  @Mutation(type => UserNotificationMessageTemplateUpdatePayload, { name: 'userNotificationMessageTemplateUpdate', nullable: true })
  async update(
    @Arg('data') data: UserNotificationMessageTemplateUpdateInput,
  ): Promise<UserNotificationMessageTemplateUpdatePayload> {
    return this.userNotificationMessageTemplateService.update(data);
  }
}
