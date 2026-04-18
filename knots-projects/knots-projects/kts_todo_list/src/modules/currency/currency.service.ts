import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CurrencyRepository } from './currency.repository';
import { CurrencyArgs } from './args/currency.args';
import { CurrencyConnection } from './connection/currency.connection';
import { CurrencyUpdateInput } from './input/currencyUpdate.input';
import { Enforcer } from 'casbin';
import { CurrencyPayload } from './payload/currency.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { CurrencyCreateInput } from './input/currencyCreate.input';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';

@Service()
export class CurrencyService {
  constructor(
    @InjectRepository()
    private readonly currencyRepository: CurrencyRepository,
  ) {
  }

  async getMany(args: CurrencyArgs, extraArgs: { [index: string]: any } = {}): Promise<CurrencyConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.currencyRepository.createQueryBuilder();

    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });

    if (args.code) queryBuilder.andWhere('code like `%:code%`', { code: args.code });

    if (args.nameEn) queryBuilder.andWhere('nameEn like `%:nameEn%`', { nameEn: args.nameEn });

    if (args.nameCht) queryBuilder.andWhere('nameCht like `%:nameCht%`', { nameCht: args.nameCht });

    if (args.show) queryBuilder.andWhere('show = `:show`', { show: args.show });

    if (args.deleted) queryBuilder.andWhere('deleted = `:deleted`', { deleted: args.deleted });

    queryBuilder.skip(offset).take(limit).orderBy({
      'order': 'ASC',
    });

    const [data, dataCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(data, args, {
        arrayLength: dataCount,
        sliceStart: offset || 0,
      }),
      totalCount: dataCount,
    };
  }

  async create(
    data: CurrencyCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<CurrencyPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currency = this.currencyRepository.create();
      currency.code = data.code;
      currency.symbol = data.symbol;
      currency.commonSymbol = data.commonSymbol;
      currency.nameEn = data.nameEn;
      currency.nameCht = data.nameCht;
      if (data.sort) currency.sort = data.sort;
      if (data.show !== undefined) currency.show = data.show;
      currency.createAt = Date.now();

      await queryRunner.manager.save(currency);

      await queryRunner.commitTransaction();

      return {
        currency: await currency.save(),
        userErrors: []
      };
    }
    catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    } finally {
      await queryRunner.release();
    }
  }

  async save(
    data: CurrencyUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<CurrencyPayload> {
    try {
      const currency = await this.currencyRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.code) currency.code = data.code;
      if (data.symbol) currency.symbol = data.symbol;
      if (data.commonSymbol) currency.commonSymbol = data.commonSymbol;
      if (data.nameEn) currency.nameEn = data.nameEn;
      if (data.nameCht) currency.nameCht = data.nameCht;
      if (data.sort !== undefined) currency.sort = data.sort;
      if (data.show !== undefined) currency.show = data.show;
      if (data.deleted !== undefined) currency.deleted = data.deleted;
      currency.editAt = Date.now();

      return {
        currency: await currency.save(),
        userErrors: []
      };
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      };
    }
  }
}
