import {Enforcer} from 'casbin';
import {Service} from 'typedi';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {FindConditions} from 'typeorm';
import {validate} from 'class-validator';
import {fromGlobalId} from 'graphql-relay';
import {logger} from '../../lib/logger';
import {getUserValidationErrors} from '../../lib/userErrors';
import {LoggedInUser} from '../shared/middleware/currentUser';
import {PermissionAction} from '../admin/action/action.type';
import {UserNotificationMessageTemplateRepository} from './userNotificationMessageTemplate.repository';
import {UserNotificationMessageTemplatesArgs} from './args/userNotificationMessageTemplates.args';
import {UserNotificationMessageTemplatesConnection} from './connection/userNotificationMessageTemplates.connection';
import {UserNotificationMessageTemplate, UserNotificationMessageTemplateStatus} from './userNotificationMessageTemplate.entity';
import {RESOURCE_USER_NOTIFICATION_MESSAGE_TEMPLATE} from './userNotificationMessageTemplate.resolver';
import {UserNotificationMessageTemplateCreateInput} from './input/userNotificationMessageTemplateCreate.input';
import {UserNotificationMessageTemplateCreatePayload} from './payload/userNotificationMessageTemplateCreate.payload';
import {UserNotificationMessageTemplateUpdateInput} from './input/userNotificationMessageTemplateUpdate.input';
import {UserNotificationMessageTemplateUpdatePayload} from './payload/userNotificationMessageTemplateUpdate.payload';

@Service()
export class UserNotificationMessageTemplateService {
  constructor(
    @InjectRepository()
    private readonly userNotificationMessageTemplateRepository: UserNotificationMessageTemplateRepository,
  ) {
  }

  async getMany(
    user: LoggedInUser,
    enforcer: Enforcer,
    args: UserNotificationMessageTemplatesArgs,
  ): Promise<UserNotificationMessageTemplatesConnection> {
    const conditions: FindConditions<UserNotificationMessageTemplate> = {};

    if (args.key) {
      conditions.key = args.key;
    }

    if (args.locale) {
      conditions.locale = args.locale;
    }

    if (args.category) {
      conditions.category = args.category;
    }

    if (args.status) {
      conditions.status = args.status;
    }

    const hasAllPermission = user ? await enforcer.enforce(user.id, RESOURCE_USER_NOTIFICATION_MESSAGE_TEMPLATE, PermissionAction.ALL) : false;
    if (!hasAllPermission) conditions.status = UserNotificationMessageTemplateStatus.ACTIVE;

    return this.userNotificationMessageTemplateRepository.findAndPaginate(
      conditions,
      {
        createdAt: 'DESC',
      },
      args,
    );
  }

  async create(data: UserNotificationMessageTemplateCreateInput): Promise<UserNotificationMessageTemplateCreatePayload> {
    try {
      const userNotificationMessageTemplate = UserNotificationMessageTemplate.create(data);

      const userErrors = getUserValidationErrors(await validate(userNotificationMessageTemplate));

      await userNotificationMessageTemplate.save();

      return {
        userErrors,
        userNotificationMessageTemplate,
      };
    } catch (error: any) {
      logger.error(`Cannot create user notification message template`);
      logger.error(error);
      return {
        userErrors: [
          {
            message: `Cannot create user notification message template`,
            field: [],
          },
        ],
      };
    }
  }

  async update(data: UserNotificationMessageTemplateUpdateInput): Promise<UserNotificationMessageTemplateUpdatePayload> {
    try {
      data.id = fromGlobalId(data.id).id;

      const userNotificationMessageTemplate = await this.userNotificationMessageTemplateRepository.findOneOrFail(data.id);

      Object.assign(userNotificationMessageTemplate, data);

      const userErrors = getUserValidationErrors(await validate(userNotificationMessageTemplate));

      await userNotificationMessageTemplate.save();

      return {
        userErrors,
        userNotificationMessageTemplate,
      };
    } catch (error: any) {
      logger.error(`Cannot update user notification message template`);
      logger.error(error);
      return {
        userErrors: [
          {
            message: `Cannot update user notification message template`,
            field: [],
          },
        ],
      };
    }
  }
}
