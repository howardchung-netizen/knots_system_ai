import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BookKeepingAccountTypeRepository } from './bookKeepingAccountType.repository';
import { BookKeepingAccountTypeArgs } from './args/bookKeepingAccountType.args';
import { BookKeepingAccountTypeConnection } from './connection/bookKeepingAccountType.connection';
import { BookKeepingAccountTypeUpdateInput } from './input/bookKeepingAccountTypeUpdate.input';
import { Enforcer } from 'casbin';
import { BookKeepingAccountTypePayload } from './payload/bookKeepingAccountType.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { BookKeepingAccountTypeCreateInput } from './input/bookKeepingAccountTypeCreate.input';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { BookKeepingAccountTypeDeleteInput } from './input/bookKeepingAccountTypeDelete.input';
import { BookKeepingAccountTypeDeletePayload } from './payload/bookKeepingAccountTypeDelete.payload';

@Service()
export class BookKeepingAccountTypeService {
  constructor(
    @InjectRepository()
    private readonly bookKeepingAccountTypeRepository: BookKeepingAccountTypeRepository,
  ) {
  }

  async getMany(args: BookKeepingAccountTypeArgs, extraArgs: { [index: string]: any } = {}): Promise<BookKeepingAccountTypeConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.bookKeepingAccountTypeRepository.createQueryBuilder();

    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });

    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    
    if (args.name) queryBuilder.andWhere('name like `%:name%`', { name: args.name });

    if (args.increaseDebit) queryBuilder.andWhere('increase_debit = `:increaseDebit`', { increaseDebit: args.increaseDebit });

    queryBuilder.skip(offset).take(limit).orderBy({
      '`order`': 'ASC',
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
    data: BookKeepingAccountTypeCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<BookKeepingAccountTypePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const bookKeepingAccountType = this.bookKeepingAccountTypeRepository.create();
      bookKeepingAccountType.name = data.name;
      if (data.order) bookKeepingAccountType.order = data.order;
      if (data.increaseDebit !== undefined) bookKeepingAccountType.increaseDebit = data.increaseDebit;

      await queryRunner.manager.save(bookKeepingAccountType);

      await queryRunner.commitTransaction();

      return {
        bookKeepingAccountType: await bookKeepingAccountType.save(),
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
    data: BookKeepingAccountTypeUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<BookKeepingAccountTypePayload> {
    try {
      const bookKeepingAccountType = await this.bookKeepingAccountTypeRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.name) bookKeepingAccountType.name = data.name;
      if (data.order !== undefined) bookKeepingAccountType.order = data.order;
      if (data.increaseDebit !== undefined) bookKeepingAccountType.increaseDebit = data.increaseDebit;

      return {
        bookKeepingAccountType: await bookKeepingAccountType.save(),
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

  async delete(
    data: BookKeepingAccountTypeDeleteInput,
    user: LoggedInUser,
  ): Promise<BookKeepingAccountTypeDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookKeepingAccountType = await this.bookKeepingAccountTypeRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        deleted: false,
      });
      bookKeepingAccountType.deleted = true;
      await queryRunner.manager.save(bookKeepingAccountType);

      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        result: true,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error);
      return {
        userErrors: [
          {
            message: error.message,
            field: ['id'],
          },
        ],
        result: false,
      };
    } finally {
      await queryRunner.release();
    }
  }
}
