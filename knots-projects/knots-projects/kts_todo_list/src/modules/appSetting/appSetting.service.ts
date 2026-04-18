import { Enforcer } from 'casbin';
import { Service } from 'typedi';
import { boolean } from 'boolean';
import searchQuery, { SearchParserResult } from 'search-query-parser';
import { AppSettingInput } from './input/appSetting.input';
import { AppSettingCreatePayload } from './payload/appSettingCreate.payload';
import { validate } from 'class-validator';
import { AppSetting } from './appSetting.entity';
import { AppSettingUpdatePayload } from './payload/appSettingUpdate.payload';
import { fromGlobalId } from 'graphql-relay';
import { AppSettingRepository } from './appSetting.repository';
import { getUserValidationErrors } from '../../lib/userErrors';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { AppSettingsArgs } from './args/appSettings.args';
import { AppSettingsConnection } from './connection/appSettings.connection';
import { AppSettingDeletePayload } from './payload/appSettingDelete.payload';
import { AppSettingDeleteInput } from './input/appSettingDelete.input';
import { FindConditions } from 'typeorm';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { PermissionAction } from '../admin/action/action.type';
import { RESOURCE_APP_SETTING } from './appSetting.resolver';

@Service()
export class AppSettingService {
  constructor(
    @InjectRepository()
    private readonly appSettingRepository: AppSettingRepository,
  ) {}

  async getMany(
    args: AppSettingsArgs,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<AppSettingsConnection> {
    const options = { keywords: ['key', 'public'] };
    const query = searchQuery.parse(args.query, options) as SearchParserResult;

    const conditions: FindConditions<AppSetting> = {};
    if (query.key) {
      conditions.key = query.key;
    }
    if (query.public) {
      conditions.public = boolean(query.public);
    }

    const hasAllPermission = user ? await enforcer.enforce(user.id, RESOURCE_APP_SETTING, PermissionAction.ALL) : false;
    if (!hasAllPermission) conditions.public = true;

    return this.appSettingRepository.findAndPaginate(
      conditions,
      {
        createdAt: 'ASC',
      },
      args,
    );
  }

  async create(data: AppSettingInput): Promise<AppSettingCreatePayload> {
    const appSetting = AppSetting.create(data);

    const errors = await validate(appSetting);
    if (!!errors.length) {
      return {
        userErrors: errors.map(e => ({
          message: e.constraints ? Object.keys(e.constraints)
            .map(k => e.constraints![k])
            .join(', ') : 'Invalid data',
          field: [e.property],
        })),
      };
    }
    return { userErrors: [], appSetting: await appSetting.save() };
  }

  async update({
    id: gid,
    ...data
  }: AppSettingInput): Promise<AppSettingUpdatePayload> {
    try {
      const { id } = fromGlobalId(gid!);
      const appSetting = await this.appSettingRepository.findOneOrFail(id);
      Object.assign(appSetting, data);

      const userErrors = getUserValidationErrors(await validate(appSetting));
      return { userErrors, appSetting: await appSetting.save() };
    } catch (error: any) {
      console.error(error);
      return {
        userErrors: [
          {
            message: `App setting does not exist`,
            field: [],
          },
        ],
      };
    }
  }

  async delete({
    id: gid,
  }: AppSettingDeleteInput): Promise<AppSettingDeletePayload> {
    const { id } = fromGlobalId(gid);
    try {
      const appSetting = await this.appSettingRepository.findOneOrFail(id);
      await appSetting.remove();
      return {
        userErrors: [],
        deletedAppSettingId: gid,
      };
    } catch (error: any) {
      return {
        userErrors: [
          {
            message: 'App setting does not exist',
            field: [],
          },
        ],
      };
    }
  }

  async getValueByKey(key: string, defaultValue?: any) {
    const appSetting = await this.appSettingRepository.findOne({ key });
    return appSetting ? appSetting.value : defaultValue;
  }

  async getObjectByKey(key: string) {
    const appSetting = await this.appSettingRepository.findOne({ key });
    return appSetting;
  }
}
