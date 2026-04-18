import {Inject, Service} from 'typedi';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {validate} from 'class-validator';
import {connectionFromArraySlice, fromGlobalId} from 'graphql-relay';
import {logger} from '../../lib/logger';
import {getUserValidationErrors} from '../../lib/userErrors';
import {LoggedInUser} from '../shared/middleware/currentUser';
import {UserNotificationMessageSendInput} from './input/userNotificationMessageSend.input';
import {UserNotificationMessageSendPayload} from './payload/userNotificationMessageSend.payload';
import {UserNotificationMessage, UserNotificationMessageStatus} from './userNotificationMessage.entity';
import {UserNotificationTokenRepository} from '../userNotificationToken/userNotificationToken.repository';
import {UserNotificationToken} from '../userNotificationToken/userNotificationToken.entity';
import {firebaseMessageSend} from '../../lib/firebase';
import {UserNotificationMessageArgs} from './args/userNotificationMessage.args';
import {UserNotificationMessageConnection} from './connection/userNotificationMessage.connection';
import {UserNotificationMessageRepository} from './userNotificationMessage.repository';
import {UserNotificationMessageReadInput} from './input/userNotificationMessageRead.input';
import {UserNotificationMessageReadPayload} from './payload/userNotificationMessageRead.payload';
import {PubSubEngine} from 'graphql-subscriptions';
import {MutationType} from '../common/subscriptionPayload.type';
import {UserNotificationMessageBatchSendInput} from './input/userNotificationMessageBatchSend.input';
import {In} from 'typeorm';
import { UserNotificationMessageTemplateRepository } from '../userNotificationMessageTemplate/userNotificationMessageTemplate.repository';
import { UserNotificationMessageTemplate, UserNotificationMessageTemplateCategory, UserNotificationMessageTemplateStatus } from '../userNotificationMessageTemplate/userNotificationMessageTemplate.entity';
import { UserRepository } from '../user/user.repository';
import { User } from '../user/user.entity';

@Service()
export class UserNotificationMessageService {
  constructor(
    @InjectRepository()
    private readonly userRepository: UserRepository,
    @InjectRepository()
    private readonly userNotificationTokenRepository: UserNotificationTokenRepository,
    @InjectRepository()
    private readonly userNotificationMessageTemplateRepository: UserNotificationMessageTemplateRepository,
    @InjectRepository()
    private readonly userNotificationMessageRepository: UserNotificationMessageRepository,
    @Inject('pubSub')
    private readonly pubSub: PubSubEngine,
  ) {
  }

  async getMany(
    user: LoggedInUser,
    args: UserNotificationMessageArgs,
  ): Promise<UserNotificationMessageConnection> {
    const qb1 = this.userNotificationMessageTemplateRepository.createQueryBuilder();

    if (args.key) {
      qb1.andWhere('`key` = :key', {
        key: args.key,
      });
    }

    if (args.locale) {
      qb1.andWhere('locale = :locale', {
        locale: args.locale,
      });
    }

    if (args.category) {
      qb1.andWhere('category = :category', {
        category: args.category,
      });
    }

    const messageTemplatesIDS = (await qb1.getMany()).map(messageTemplate => `'${messageTemplate.id}'`);

    if (!messageTemplatesIDS.length) {
      return {
        ...connectionFromArraySlice([], args, {
          arrayLength: 0,
          sliceStart: 0 || 0,
        }),
        totalCount: 0,
        unreadCount: 0,
      };
    }

    const qb2 = this.userNotificationMessageRepository.createQueryBuilder();
    qb2.where('member_id = :memberId', {memberId: user.id});
    qb2.andWhere(`user_notification_message_template_id IN(${messageTemplatesIDS.join(', ')})`);
    qb2.andWhere(`status IN (${[`'${UserNotificationMessageStatus.SENT}'`, `'${UserNotificationMessageStatus.READ}'`].join(', ')})`);

    const unreadCountQb = qb2.clone();
    unreadCountQb.andWhere('status = :status', { status: UserNotificationMessageStatus.SENT });
    const unreadCount = await unreadCountQb.getCount();

    if (args.countOnly) {
      return {
        edges: [],
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: null,
          hasNextPage: null,
        },
        totalCount: await qb2.getCount(),
        unreadCount: unreadCount,
      };
    }
    const { limit, offset } = args.pagingParams();
    qb2.skip(offset).take(limit);
    qb2.orderBy({ "created_at": "DESC" });
    let [userNotificationMessages, userNotificationMessagesCount] = await qb2.getManyAndCount();

    return {
      ...connectionFromArraySlice(userNotificationMessages, args, {
        arrayLength: userNotificationMessagesCount,
        sliceStart: offset || 0,
      }),
      totalCount: userNotificationMessagesCount,
      unreadCount: unreadCount,
    };
  }

  async read(
    data: UserNotificationMessageReadInput,
    user: LoggedInUser,
  ): Promise<UserNotificationMessageReadPayload> {
    const { id } = fromGlobalId(data.id);
    try {
      const message = await this.userNotificationMessageRepository.findOneOrFail({id: id, userId: user.id});
      if (message.status !== UserNotificationMessageStatus.READ) {
        const oldMessage = this.userNotificationMessageRepository.create({ ...message });

        message.status = UserNotificationMessageStatus.READ;
        await message.save();

        const updatedFields = Object.keys(message).reduce((a, c) => {
          if (!c.startsWith('__') && (message as any)[c] !== (oldMessage as any)[c]) a.push(c);
          return a;
        }, [] as any);
        this.pubSub.publish('onUserNotificationMessageChange', {
          mutation: MutationType.UPDATED,
          node: message,
          updatedFields: updatedFields,
          previousValues: oldMessage,
        });
      }
      return { userErrors: [], userNotificationMessage: message };
    } catch (error) {
      return {
        userErrors: [
          {
            message: `User Notification Message does not exist`,
            field: ['id'],
          },
        ],
      };
    }
  }

  async send(data: UserNotificationMessageSendInput): Promise<UserNotificationMessageSendPayload> {
    const userErrors = [];

    if (!data.userId) {
      userErrors.push({
        message: `userId required`,
        field: ['userId'],
      });
    }
    if (!data.userNotificationMessageTemplateId && !data.content) {
      userErrors.push({
        message: `userNotificationMessageTemplateId / content is required`,
        field: ['userNotificationMessageTemplateId', 'content'],
      });
    }

    if (userErrors.length) return { userErrors };

    try {
      const userNotificationMessage = UserNotificationMessage.create();
      const user = await this.userRepository.findOneOrFail({id:fromGlobalId(data.userId).id, deleted: false});
      userNotificationMessage.userId = user.id;
      let userNotificationMessageTemplate: UserNotificationMessageTemplate;
      if (data.userNotificationMessageTemplateId) {
        userNotificationMessageTemplate = await this.userNotificationMessageTemplateRepository.findOneOrFail({
          id: fromGlobalId(data.userNotificationMessageTemplateId).id,
          status: UserNotificationMessageTemplateStatus.ACTIVE,
        });
        userNotificationMessage.userNotificationMessageTemplateId = userNotificationMessageTemplate.id;
        if (data.userNotificationMessageTemplateReplacements) {
          userNotificationMessage.userNotificationMessageTemplateReplacements = (typeof data.userNotificationMessageTemplateReplacements === 'string') ? JSON.parse(data.userNotificationMessageTemplateReplacements) : data.userNotificationMessageTemplateReplacements;
        }
        if (userNotificationMessageTemplate.title) userNotificationMessage.title = userNotificationMessage.userNotificationMessageTemplateReplacements ? userNotificationMessageTemplate.title.replace(/{{[^{}]+}}/g, match => (userNotificationMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : userNotificationMessageTemplate.title;
        userNotificationMessage.content = userNotificationMessage.userNotificationMessageTemplateReplacements ? userNotificationMessageTemplate.content.replace(/{{[^{}]+}}/g, match => (userNotificationMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : userNotificationMessageTemplate.content;
        userNotificationMessage.shortContent = userNotificationMessage.userNotificationMessageTemplateReplacements ? userNotificationMessageTemplate.shortContent.replace(/{{[^{}]+}}/g, match => (userNotificationMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : userNotificationMessageTemplate.shortContent;
        userNotificationMessage.path = userNotificationMessageTemplate.extra?.path || undefined;
      } else {
        if (!data.content) throw new Error('content is required');
        if (!data.shortContent) throw new Error('short content is required');
        userNotificationMessageTemplate = await this.userNotificationMessageTemplateRepository.findOneOrFail({
          category: UserNotificationMessageTemplateCategory.GENERIC,
          key: 'FREE_TEXT',
          status: UserNotificationMessageTemplateStatus.ACTIVE,
        });
        userNotificationMessage.userNotificationMessageTemplateId = userNotificationMessageTemplate.id;
        if (data.userNotificationMessageTemplateReplacements) {
          userNotificationMessage.userNotificationMessageTemplateReplacements = (typeof data.userNotificationMessageTemplateReplacements === 'string') ? JSON.parse(data.userNotificationMessageTemplateReplacements) : data.userNotificationMessageTemplateReplacements;
        }
        userNotificationMessage.content = userNotificationMessage.userNotificationMessageTemplateReplacements ? data.content.replace(/{{[^{}]+}}/g, match => (userNotificationMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : data.content;
        userNotificationMessage.shortContent = userNotificationMessage.userNotificationMessageTemplateReplacements ? data.shortContent.replace(/{{[^{}]+}}/g, match => (userNotificationMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : data.shortContent;
        if (data.title) userNotificationMessage.title = userNotificationMessage.userNotificationMessageTemplateReplacements ? data.title.replace(/{{[^{}]+}}/g, match => (userNotificationMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : data.title; 
        if (data.path) userNotificationMessage.path = data.path;
      }
      userNotificationMessage.status = UserNotificationMessageStatus.SENT;

      const validationErrors = getUserValidationErrors(await validate(userNotificationMessage));
      if (validationErrors.length > 0) {
        userErrors.push(...validationErrors);
        throw new Error(`validation errors`);
      }

      await userNotificationMessage.save();

      this.pubSub.publish('onUserNotificationMessageChange', {
        mutation: MutationType.CREATED,
        node: userNotificationMessage,
      });

      const userNotificationTokens = await this.userNotificationTokenRepository.find({
        userId: user.id,
      });

      while (userNotificationTokens.length) {
        try {
          const payload = {
            path: userNotificationMessage.path || '',
          };
          const param = {
            title: userNotificationMessage.title || undefined,
            body: userNotificationMessage.shortContent,
            tokens: userNotificationTokens.splice(0,500).map(token => token.token),
            data: payload,
          };
          await firebaseMessageSend(param);
        } catch (error: any){
          logger.error(`Cannot send firebase notification message`);
        }
      }

      return {
        userErrors: userErrors,
        userNotificationMessage: userNotificationMessage,
      };
    } catch (error: any) {
      logger.error(`Cannot send user notification message`);
      logger.error(error);
      return {
        userErrors: userErrors.length ? userErrors : [
          {
            message: `Cannot send user notification message`,
            field: [],
          },
        ],
      };
    }
  }

  async batchSend(data: UserNotificationMessageBatchSendInput): Promise<UserNotificationMessageBatchSendResult> {
    try {
      if (!data.userIds.length) return { Result: false };

      if (!data.templateKey && !data.content) throw new Error('templateKey / content is required');

      let draftMessage: UserNotificationMessage = UserNotificationMessage.create();
      let userNotificationMessageTemplate: UserNotificationMessageTemplate;
      if (data.templateKey) {
        userNotificationMessageTemplate = await this.userNotificationMessageTemplateRepository.findOneOrFail({
          key: data.templateKey,
          status: UserNotificationMessageTemplateStatus.ACTIVE,
        });
        draftMessage.userNotificationMessageTemplateId = userNotificationMessageTemplate.id;
        if (data.contentReplacements) {
          draftMessage.userNotificationMessageTemplateReplacements = (typeof data.contentReplacements === 'string') ? JSON.parse(data.contentReplacements) : data.contentReplacements;
        }
        if (userNotificationMessageTemplate.title) draftMessage.title = draftMessage.userNotificationMessageTemplateReplacements ? userNotificationMessageTemplate.title.replace(/{{[^{}]+}}/g, match => (draftMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : userNotificationMessageTemplate.title;
        draftMessage.content = draftMessage.userNotificationMessageTemplateReplacements ? userNotificationMessageTemplate.content.replace(/{{[^{}]+}}/g, match => (draftMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : userNotificationMessageTemplate.content;
        draftMessage.shortContent = draftMessage.userNotificationMessageTemplateReplacements ? userNotificationMessageTemplate.shortContent.replace(/{{[^{}]+}}/g, match => (draftMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : userNotificationMessageTemplate.shortContent;
        draftMessage.path = userNotificationMessageTemplate.extra?.path || undefined;
      } else {
        if (!data.content) throw new Error('content is required');
        if (!data.shortContent) throw new Error('short content is required');
        userNotificationMessageTemplate = await this.userNotificationMessageTemplateRepository.findOneOrFail({
          category: UserNotificationMessageTemplateCategory.GENERIC,
          key: 'FREE_TEXT',
          status: UserNotificationMessageTemplateStatus.ACTIVE,
        });
        draftMessage.userNotificationMessageTemplateId = userNotificationMessageTemplate.id;
        if (data.contentReplacements) {
          draftMessage.userNotificationMessageTemplateReplacements = (typeof data.contentReplacements === 'string') ? JSON.parse(data.contentReplacements) : data.contentReplacements;
        }
        draftMessage.content = draftMessage.userNotificationMessageTemplateReplacements ? data.content.replace(/{{[^{}]+}}/g, match => (draftMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : data.content;
        draftMessage.shortContent = draftMessage.userNotificationMessageTemplateReplacements ? data.shortContent.replace(/{{[^{}]+}}/g, match => (draftMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : data.shortContent;
        if (data.title) draftMessage.title = draftMessage.userNotificationMessageTemplateReplacements ? data.title.replace(/{{[^{}]+}}/g, match => (draftMessage.userNotificationMessageTemplateReplacements as any)[match] || match) : data.title;
        if (data.path) draftMessage.path = data.path;
      }
      draftMessage.status = UserNotificationMessageStatus.SENT;

      const validationErrors = getUserValidationErrors(await validate(draftMessage));
      if (validationErrors.length > 0) throw new Error(`validation errors`);

      let userIds = [...data.userIds];
      let usersObj: { [index: string]: User } = {};
      let usersObjById: { [index: string]: User } = {};
      let users: User[] = [];
      let failUserIds: string[] = [];

      while (userIds.length) {
        usersObj = Object.assign(usersObj, (await this.userRepository.find({
          id: In(userIds.splice(0,1000).map(id => id)),
        })).reduce((a: { [index: string]: User }, c: User) => {
          if (c.id) a[c.id] = c;
          return a;
        }, {}));
      }
      for (const key of Object.keys(usersObj)) {
        usersObjById[usersObj[key].id] = usersObj[key];
      }

      data.userIds.map(v => {
        if (usersObj[v]) users.push(usersObj[v]);
        else failUserIds.push(v);
      });

      let usersTotal = [...users];
      let userNotificationTokens: UserNotificationToken[] = [];

      while (usersTotal.length) {
        userNotificationTokens = [...userNotificationTokens, ...await this.userNotificationTokenRepository.find({
          userId: In(usersTotal.splice(0,1000).map(user => user.id)),
        })];
      }

      let sendTokens = [...userNotificationTokens];

      const newMessages = await this.userNotificationMessageRepository
        .createQueryBuilder()
        .insert()
        .into(UserNotificationMessage)
        .values(users.map((v: any) => ({
          ...draftMessage,
          userId: v.id,
        })))
        .execute();

      let newMessagesObj: { [index: string]: UserNotificationMessage } = {};
      let newMessagesData: UserNotificationMessage[] = [];
      let newMessageIds = [...newMessages.identifiers];

      while (newMessageIds.length) {
        newMessagesData = [...newMessagesData, ...await this.userNotificationMessageRepository.findByIds(newMessageIds.splice(0,1000))];
        newMessagesObj = Object.assign(newMessagesObj, newMessagesData.reduce((a: { [index: string]: UserNotificationMessage }, c: UserNotificationMessage) => {
          a[c.userId] = c;
          return a;
        }, {}));
      }

      newMessagesData.map(newMessage => {
        this.pubSub.publish('onUserNotificationMessageChange', {
          mutation: MutationType.CREATED,
          node: newMessage,
        });
      })

      let tokenSuccess: string[] = [];
      while (sendTokens.length) {
        try {
          const payload = {
            path: draftMessage.path || '',
          };
          const param = {
            title: draftMessage.title || undefined,
            body: draftMessage.shortContent,
            tokens: sendTokens.splice(0,500).map(token => token.token),
            data: payload,
          };
          const result = await firebaseMessageSend(param);
          if (result && result.success) {
            tokenSuccess = [...tokenSuccess, ...result.success];
          }
        } catch (error: any){
          logger.error(`Cannot send firebase notification message`);
        }
      }

      //if usersObjById still have record meaning the user no any success token send and add into fail list
      userNotificationTokens.filter(e => { return tokenSuccess.includes(e.token); }).map(e => {
        if (usersObjById[e.userId]) delete usersObjById[e.userId];
      });
      for (const key of Object.keys(usersObjById)) {
        if (usersObjById[key].id !== undefined) failUserIds.push(usersObjById[key].id);
      }

      return {
        Result: true,
        FailUserIds: failUserIds,
      };
    }
    catch (error: any) {
      logger.error('User Notification Message Batch Send fail:', error.message);
      logger.error(error);
      return { Result: false };
    }
  }
}

export interface UserNotificationMessageBatchSendResult {
  Result: Boolean,
  FailUserIds?: string[],
}
