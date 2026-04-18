import {Resolver, Authorized, Query, Mutation, Args, Arg, Subscription, Root} from 'type-graphql';
import {Inject} from 'typedi';
import {ResourceResolver} from '../node/resource.resolver';
import {PermissionAction} from '../admin/action/action.type';
import {CurrentUser, LoggedInUser} from '../shared/middleware/currentUser';
import {UserNotificationMessage} from './userNotificationMessage.entity';
import {UserNotificationMessageSendPayload} from './payload/userNotificationMessageSend.payload';
import {UserNotificationMessageSendInput} from './input/userNotificationMessageSend.input';
import {UserNotificationMessageService} from './userNotificationMessage.service';
import {UserNotificationMessageArgs} from './args/userNotificationMessage.args';
import {UserNotificationMessageConnection} from './connection/userNotificationMessage.connection';
import {UserNotificationMessageReadInput} from './input/userNotificationMessageRead.input';
import {UserNotificationMessageReadPayload} from './payload/userNotificationMessageRead.payload';
import {revivePayload} from '../../lib/subscription';
import {UserNotificationMessageSubscriptionPayload} from './payload/userNotificationMessageSubscription.payload';
import {UserNotificationMessageSubscriptionArgs} from './args/userNotificationMessageSubscription.args';
import {fromGlobalId} from 'graphql-relay';

export const RESOURCE_USER_NOTIFICATION_MESSAGE = UserNotificationMessage.name;

@Resolver(type => UserNotificationMessage)
export class UserNotificationMessageResolver extends ResourceResolver(UserNotificationMessage) {
  constructor(
    @Inject(type => UserNotificationMessageService)
    private readonly userNotificationMessageService: UserNotificationMessageService,
  ) {
    super();
  }

  @Authorized()
  @Query(() => UserNotificationMessageConnection, { nullable: true })
  async userNotificationMessages(
    @Args() args: UserNotificationMessageArgs,
    @CurrentUser() user: LoggedInUser,
  ): Promise<UserNotificationMessageConnection> {
    return this.userNotificationMessageService.getMany(user, args);
  }

  @Authorized()
  @Mutation(type => UserNotificationMessageReadPayload, { name: 'userNotificationMessageRead', nullable: true })
  async read(
    @Arg('data') data: UserNotificationMessageReadInput,
    @CurrentUser() user: LoggedInUser,
  ): Promise<UserNotificationMessageReadPayload> {
    return this.userNotificationMessageService.read(data, user);
  }

  @Authorized(`${RESOURCE_USER_NOTIFICATION_MESSAGE}:${PermissionAction.CREATE}`)
  @Mutation(type => UserNotificationMessageSendPayload, { name: 'userNotificationMessageSend', nullable: true })
  async send(
    @Arg('data') data: UserNotificationMessageSendInput,
  ): Promise<UserNotificationMessageSendPayload> {
    return this.userNotificationMessageService.send(data);
  }

  @Authorized()
  @Subscription({
    topics: 'onUserNotificationMessageChange',
    filter: async ({ payload, args, context }) => {
      revivePayload(UserNotificationMessage, payload);

      if (args.userId) {
        const userId = fromGlobalId(args.userId).id;
        if ((!payload.node || payload.node.userId !== userId) && (!payload.previousValues || payload.previousValues.userId !== userId)) return false;
      }

      return true;
    },
  })
  onUserNotificationMessageChange(
    @Root() payload: UserNotificationMessageSubscriptionPayload,
    @Args() args: UserNotificationMessageSubscriptionArgs,
  ): UserNotificationMessageSubscriptionPayload {
    // already converted in filter
    // revivePayload(UserNotificationMessage, payload);

    return payload;
  }
}
