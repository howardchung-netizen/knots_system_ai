import { Enforcer } from 'casbin';
import { Service, Inject } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { validate } from 'class-validator';
import { fromGlobalId, connectionFromArraySlice } from 'graphql-relay';
import { logger } from '../../lib/logger';
import { createToken } from '../../lib/jwt';
import { getUserValidationErrors } from '../../lib/userErrors';
import { ServiceAccount } from './serviceAccount.entity';
import { ServiceAccountRepository } from './serviceAccount.repository';
import { ServiceAccountsArgs } from './args/serviceAccounts.args';
import { ServiceAccountsConnection } from './connection/serviceAccounts.connection';
import { ServiceAccountCreateInput } from './input/serviceAccountCreate.input';
import { ServiceAccountUpdateInput } from './input/serviceAccountUpdate.input';
import { ServiceAccountRegenerateTokenInput } from './input/serviceAccountRegenerateToken.input';
import { ServiceAccountSavePayload } from './payload/serviceAccountSave.payload';
import { RoleService } from '../admin/role/role.service';
import { ServiceAccountDeleteInput } from './input/serviceAccountDelete.input';
import { ServiceAccountDeletePayload } from './payload/serviceAccountDelete.payload';

@Service()
export class ServiceAccountService {
  constructor(
    @InjectRepository()
    private readonly serviceAccountRepository: ServiceAccountRepository,
    @Inject(type => RoleService)
    private readonly roleService: RoleService,
  ) {
  }

  async getMany(args: ServiceAccountsArgs): Promise<ServiceAccountsConnection> {
    const queryBuilder = this.serviceAccountRepository.createQueryBuilder();

    if (args.id) {
      queryBuilder.andWhere('id = :id', {
        id: fromGlobalId(args.id).id,
      });
    }

    if (args.keyword) {
      queryBuilder.andWhere('name LIKE :keyword)', {
        keyword: `%${args.keyword}%`,
      });
    }

    if (args.disabled) {
      queryBuilder.andWhere('disabled = :disabled', {
        disabled: args.disabled,
      });
    }
    
    const { limit, offset } = args.pagingParams();
    const [data, count] = await queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy({
        'name': 'ASC',
      })
      .getManyAndCount();

    return {
      ...connectionFromArraySlice(data, args, {
        arrayLength: count,
        sliceStart: offset || 0,
      }),
      totalCount: count,
    };
  }

  async save(
    enforcer: Enforcer,
    data: ServiceAccountCreateInput | ServiceAccountUpdateInput,
  ): Promise<ServiceAccountSavePayload> {
    try {
      let serviceAccount: ServiceAccount;
      if ('id' in data) {
        serviceAccount = await this.serviceAccountRepository.findOneOrFail(fromGlobalId(data.id).id);
        if (data.disabled !== undefined) {
          serviceAccount.disabled = data.disabled;
        }
      } else {
        serviceAccount = new ServiceAccount();
        serviceAccount.token = '';
      }

      if (data.name) {
        serviceAccount.name = data.name;
      }

      const userErrors = getUserValidationErrors(await validate(serviceAccount));

      await serviceAccount.save();

      if (!('id' in data)) {
        serviceAccount.token = await createToken({ loginUserType: ServiceAccount.name, id: serviceAccount.id });
        await serviceAccount.save();
      }

      if (data.roles) {
        await this.roleService.updateServiceAccountRoles(serviceAccount, data.roles, enforcer);
      }

      return {
        userErrors,
        serviceAccount,
      };
    } catch (error: any) {
      logger.error(`Cannot save service account`);
      logger.error(error);
      return {
        userErrors: [
          {
            message: `Cannot save service account`,
            field: [],
          },
        ],
      };
    }
  }

  async delete(
    enforcer: Enforcer,
    data: ServiceAccountDeleteInput,
  ): Promise<ServiceAccountDeletePayload> {
    try {

      let serviceAccount: ServiceAccount;

      serviceAccount = await this.serviceAccountRepository.findOneOrFail(fromGlobalId(data.id).id);

      await this.roleService.updateServiceAccountRoles(serviceAccount, [], enforcer);

      await serviceAccount.remove();

      return {
        userErrors: [],
        deletedServiceAccountId: data.id,
      };
    } catch (error: any) {
      logger.error(`Cannot save service account`);
      logger.error(error);
      return {
        userErrors: [
          {
            message: `Cannot save service account`,
            field: [],
          },
        ],
      };
    }
  }

  async regenerateToken(data: ServiceAccountRegenerateTokenInput): Promise<ServiceAccountSavePayload> {
    try {
      const serviceAccount = await this.serviceAccountRepository.findOneOrFail(fromGlobalId(data.id).id);

      serviceAccount.token = await createToken({ loginUserType: ServiceAccount.name, id: serviceAccount.id });

      await serviceAccount.save();

      return {
        userErrors: [],
        serviceAccount,
      };
    } catch (error: any) {
      logger.error(`Cannot regenerate token for service account`);
      logger.error(error);
      return {
        userErrors: [
          {
            message: `Cannot regenerate token for service account`,
            field: ['id'],
          },
        ],
      };
    }
  }
}
