import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BookKeepingAccountRepository } from '../bookKeepingAccount/bookKeepingAccount.repository';
import { BookKeepingAccountArgs } from '../bookKeepingAccount/args/bookKeepingAccount.args';
import { BookKeepingAccountConnection } from '../bookKeepingAccount/connection/bookKeepingAccount.connection';
import { BookKeepingAccountUpdateInput } from '../bookKeepingAccount/input/bookKeepingAccountUpdate.input';
import { Enforcer } from 'casbin';
import { BookKeepingAccountPayload } from '../bookKeepingAccount/payload/bookKeepingAccount.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { BookKeepingAccountCreateInput } from '../bookKeepingAccount/input/bookKeepingAccountCreate.input';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { BookKeepingCompanyRepository } from '../bookKeepingCompany/bookKeepingCompany.repository';
import { BookKeepingAccountTypeRepository } from '../bookKeepingAccountType/bookKeepingAccountType.repository';
import { BookKeepingAccountDeleteInput } from './input/bookKeepingAccountDelete.input';
import { BookKeepingAccountDeletePayload } from './payload/bookKeepingAccountDelete.payload';

@Service()
export class BookKeepingAccountService {
  constructor(
    @InjectRepository()
    private readonly bookKeepingAccountRepository: BookKeepingAccountRepository,
    @InjectRepository()
    private readonly bookKeepingCompanyRepository: BookKeepingCompanyRepository,
    @InjectRepository()
    private readonly bookKeepingAccountTypeRepository: BookKeepingAccountTypeRepository,
  ) {
  }

  async getMany(args: BookKeepingAccountArgs, extraArgs: { [index: string]: any } = {}): Promise<BookKeepingAccountConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.bookKeepingAccountRepository.createQueryBuilder();

    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });

    if (args.companyId) queryBuilder.andWhere('company_id = :companyId', { companyId: fromGlobalId(args.companyId).id });

    if (args.accountTypeId) queryBuilder.andWhere('account_type_id = :accountTypeId', { accountTypeId: fromGlobalId(args.accountTypeId).id });

    if (args.parentAccountId) queryBuilder.andWhere('parent_account_id = :parentAccountId', { parentAccountId: fromGlobalId(args.parentAccountId).id });

    if (args.name) queryBuilder.andWhere('name like `%:name%`', { name: args.name });

    if (args.isPlaceholder) queryBuilder.andWhere('is_placeholder = `:isPlaceholder`', { isPlaceholder: args.isPlaceholder });

    if (args.isClaim) queryBuilder.andWhere('is_claim = :isClaim', { isClaim: args.isClaim });

    if (args.isBank) queryBuilder.andWhere('is_bank = :isBank', { isBank: args.isBank });

    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });

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
    data: BookKeepingAccountCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<BookKeepingAccountPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const bookKeepingAccount = this.bookKeepingAccountRepository.create();
      if (data.companyId) {
        const bookKeepingCompany = await this.bookKeepingCompanyRepository.findOneOrFail(fromGlobalId(data.companyId).id);
        bookKeepingAccount.companyId = bookKeepingCompany.id;
      }
      const bookKeepingAccountType = await this.bookKeepingAccountTypeRepository.findOneOrFail(fromGlobalId(data.accountTypeId).id);
      bookKeepingAccount.accountTypeId = bookKeepingAccountType.id;
      if (data.parentAccountId) {
        const parentAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.parentAccountId).id);
        if (bookKeepingAccount.accountTypeId !== parentAccount.accountTypeId) throw new Error('Account type must be same as parent account type');
        bookKeepingAccount.parentAccountId = parentAccount.id;
      }
      bookKeepingAccount.name = data.name;

      if (data.isPlaceholder !== undefined) bookKeepingAccount.isPlaceholder = data.isPlaceholder;
      if (data.isClaim !== undefined) bookKeepingAccount.isClaim = data.isClaim;
      if (data.order !== undefined) bookKeepingAccount.order = data.order;

      await queryRunner.manager.save(bookKeepingAccount);

      await queryRunner.commitTransaction();

      return {
        bookKeepingAccount: await bookKeepingAccount.save(),
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
    data: BookKeepingAccountUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<BookKeepingAccountPayload> {
    try {
      const bookKeepingAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.companyId) {
        const bookKeepingCompany = await this.bookKeepingCompanyRepository.findOneOrFail(fromGlobalId(data.companyId).id);
        bookKeepingAccount.companyId = bookKeepingCompany.id;
      }
      if (data.accountTypeId) {
        const bookKeepingAccountType = await this.bookKeepingAccountTypeRepository.findOneOrFail(fromGlobalId(data.accountTypeId).id);
        bookKeepingAccount.accountTypeId = bookKeepingAccountType.id;
      }
      if (data.parentAccountId) {
        const parentAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.parentAccountId).id);
        if (bookKeepingAccount.accountTypeId !== parentAccount.accountTypeId) throw new Error('Account type must be same as parent account type');
        bookKeepingAccount.parentAccountId = parentAccount.id;
      }
      if (data.name) bookKeepingAccount.name = data.name;
      if (data.balance !== undefined) bookKeepingAccount.balance = data.balance;
      if (data.isPlaceholder !== undefined) bookKeepingAccount.isPlaceholder = data.isPlaceholder;
      if (data.isClaim !== undefined) bookKeepingAccount.isClaim = data.isClaim;
      if (data.order !== undefined) bookKeepingAccount.order = data.order;

      return {
        bookKeepingAccount: await bookKeepingAccount.save(),
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
    data: BookKeepingAccountDeleteInput,
    user: LoggedInUser,
  ): Promise<BookKeepingAccountDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookKeepingAccount = await this.bookKeepingAccountRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        deleted: false,
      });
      bookKeepingAccount.deleted = true;
      await queryRunner.manager.save(bookKeepingAccount);

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
