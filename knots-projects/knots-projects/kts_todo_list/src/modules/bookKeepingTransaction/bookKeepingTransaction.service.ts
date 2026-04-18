import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BookKeepingTransactionRepository } from './bookKeepingTransaction.repository';
import { BookKeepingTransactionArgs } from './args/bookKeepingTransaction.args';
import { BookKeepingTransactionConnection } from './connection/bookKeepingTransaction.connection';
import { BookKeepingTransactionUpdateInput } from './input/bookKeepingTransactionUpdate.input';
import { Enforcer } from 'casbin';
import { BookKeepingTransactionPayload } from './payload/bookKeepingTransaction.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { BookKeepingTransactionCreateInput } from './input/bookKeepingTransactionCreate.input';
import { logger } from '../../lib/logger';
import { QueryRunner, getConnection } from 'typeorm';
import { BookKeepingAccountRepository } from '../bookKeepingAccount/bookKeepingAccount.repository';
import { BookKeepingTransactionItemRepository } from '../bookKeepingTransactionItem/bookKeepingTransactionItem.repository';
import { BookKeepingCompanyRepository } from '../bookKeepingCompany/bookKeepingCompany.repository';
import { BookKeepingTransactionItem } from '../bookKeepingTransactionItem/bookKeepingTransactionItem.entity';
import { BookKeepingTransactionDeleteInput } from './input/bookKeepingTransactionDelete.input';
import { BookKeepingTransactionDeletePayload } from './payload/bookKeepingTransactionDelete.payload';
import { BookKeepingTransactionItemDeleteInput } from './input/bookKeepingTransactionItemDelete.input';
import { BookKeepingTransactionItemDeletePayload } from './payload/bookKeepingTransactionItemDelete.payload';
import { BookKeepingFinancialYear } from './bookKeepingTransaction.resolver';
import { BookKeepingAccount } from '../bookKeepingAccount/bookKeepingAccount.entity';

export const updateParentAccountBalance = async (accountId: string, amount: number, queryRunner: QueryRunner) => {
  if (amount === 0) return;
  const account = await queryRunner.manager.findOneOrFail(BookKeepingAccount, { id: accountId, deleted: false });
  account.balance = Number(account.balance) + amount;
  await queryRunner.manager.save(account);
  if (account.parentAccountId) {
    await updateParentAccountBalance(account.parentAccountId, amount, queryRunner);
  }
}

@Service()
export class BookKeepingTransactionService {
  constructor(
    @InjectRepository()
    private readonly bookKeepingTransactionRepository: BookKeepingTransactionRepository,
    @InjectRepository()
    private readonly bookKeepingAccountRepository: BookKeepingAccountRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionItemRepository: BookKeepingTransactionItemRepository,
    @InjectRepository()
    private readonly bookKeepingCompanyRepository: BookKeepingCompanyRepository,
  ) {
  }

  async getMany(args: BookKeepingTransactionArgs, extraArgs: { [index: string]: any } = {}): Promise<BookKeepingTransactionConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.bookKeepingTransactionRepository.createQueryBuilder('transaction');

    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });

    if (args.deleted !== undefined) queryBuilder.andWhere('transaction.deleted = :deleted', { deleted: args.deleted });
    
    if (args.companyId) queryBuilder.andWhere('company_id = `%:companyId%`', { companyId: fromGlobalId(args.companyId).id });

    if (args.transactionDateStart || args.transactionDateEnd) {

      const startDate = args.transactionDateStart;
      const endDate = args.transactionDateEnd;

      if (startDate && endDate) {
        queryBuilder
        .andWhere("transaction_date >= :startDate", {
          startDate: startDate,
        })
        .andWhere("transaction_date <= :endDate", {
          endDate: endDate,
        });
      }
      else if (startDate) {
        queryBuilder
        .andWhere("transaction_date >= :startDate", {
          startDate: startDate,
        })
      }
      else if (endDate) {
        queryBuilder
        .andWhere("transaction_date <= :endDate", {
          endDate: endDate,
        })
      }
    }

    if (args.accountId || args.isDebit !== undefined || args.isOpeningBalance !== undefined) {
      queryBuilder.leftJoin('transaction.transactionItems', 'transactionItem');
    }

    if (args.accountId) {
      queryBuilder.andWhere('transactionItem.account_id = :accountId', { accountId: fromGlobalId(args.accountId).id });
    }

    if (args.isDebit !== undefined) {
      queryBuilder.andWhere('transactionItem.is_debit = :isDebit', { isDebit: args.isDebit });
    }

    if (args.isOpeningBalance !== undefined) {
      queryBuilder.andWhere('transactionItem.is_opening_balance = :isOpeningBalance', { isOpeningBalance: args.isOpeningBalance });
    }

    queryBuilder.skip(offset).take(limit);
    // .orderBy({
    //   'transactionItem.created_at': args.sortOrder === 'ASC' ? 'ASC' : 'DESC',
    // });

    const [data, dataCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(data, args, {
        arrayLength: dataCount,
        sliceStart: offset || 0,
      }),
      totalCount: dataCount,
    };
  }

  async getFinancialYear(): Promise<BookKeepingFinancialYear[]> {
    const years: BookKeepingFinancialYear[] = (await this.bookKeepingTransactionRepository
    .createQueryBuilder()
    .select('DISTINCT financial_year_start, financial_year_end')
    .getRawMany()).map(e => ({
      financialYearStart: e.financial_year_start,
      financialYearEnd: e.financial_year_end,
    }));

    return years;
  }

  async create(
    data: BookKeepingTransactionCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<BookKeepingTransactionPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const bookKeepingTransaction = this.bookKeepingTransactionRepository.create();
      const company = await this.bookKeepingCompanyRepository.findOneOrFail(fromGlobalId(data.companyId).id);
      bookKeepingTransaction.companyId = company.id;
      bookKeepingTransaction.transactionDate = data.transactionDate;
      bookKeepingTransaction.financialYearStart = data.financialYearStart;
      bookKeepingTransaction.financialYearEnd = data.financialYearEnd;

      await queryRunner.manager.save(bookKeepingTransaction);

      let transactionItems: BookKeepingTransactionItem[] = [];

      let totalDebit: number = 0;
      let totalCredit: number = 0;

      for (const itemData of data.items) {
        const account = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(itemData.accountId).id);

        // Determine if the account should be debited or credited based on its account type
        const increaseDebit = (await account.accountType)?.increaseDebit || false;
        const isDebit = (increaseDebit && itemData.amount >= 0) || (!increaseDebit && itemData.amount < 0);
        if (isDebit && totalDebit) throw new Error('debit account already exists.');
        if (!isDebit && totalCredit) throw new Error('credit account already exists.');

        const amount = itemData.amount;
        account.balance = Number(account.balance) + amount;
        totalDebit += isDebit ? Math.abs(amount) : 0;
        totalCredit += !isDebit ? Math.abs(amount) : 0;

        await queryRunner.manager.save(account);

        //update parent account balance
        if (account.parentAccountId) {
          await updateParentAccountBalance(account.parentAccountId, amount, queryRunner);
        }

        const transactionItem = this.bookKeepingTransactionItemRepository.create();
        transactionItem.transactionId = bookKeepingTransaction.id;
        transactionItem.accountId = account.id;
        transactionItem.isDebit = isDebit;
        transactionItem.amount = amount;
        if (itemData.desc !== undefined) transactionItem.desc = itemData.desc;
        if (itemData.isOpeningBalance !== undefined) transactionItem.isOpeningBalance = itemData.isOpeningBalance;

        transactionItems.push(transactionItem);
      }
      await queryRunner.manager.insert(BookKeepingTransactionItem, transactionItems);

      if ((totalDebit && totalCredit) && totalDebit !== totalCredit) throw new Error('debit and credit amount not equal.');

      await queryRunner.commitTransaction();

      return {
        bookKeepingTransaction: bookKeepingTransaction,
        userErrors: [],
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error);
      return {
        userErrors: [
          {
            message: error.message,
            field: [],
          },
        ],
      };
    } finally {
      await queryRunner.release();
    }
  }

  async save(
    data: BookKeepingTransactionUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<BookKeepingTransactionPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookKeepingTransaction = await this.bookKeepingTransactionRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.transactionDate !== undefined) bookKeepingTransaction.transactionDate = data.transactionDate;
      if (data.financialYearStart !== undefined) bookKeepingTransaction.financialYearStart = data.financialYearStart;
      if (data.financialYearEnd !== undefined) bookKeepingTransaction.financialYearEnd = data.financialYearEnd;

      await queryRunner.manager.save(bookKeepingTransaction);

      const currentTransactionItems = await this.bookKeepingTransactionItemRepository.find({
        where: {
          transactionId: bookKeepingTransaction.id,
          deleted: false,
        },
      });

      const newTransactionItems: BookKeepingTransactionItem[] = [];

      // Variables to track the total debit and credit amounts
      let totalDebit: number = 0;
      let totalCredit: number = 0;

      let debitEdited: boolean = false;
      let creditEdited: boolean = false;

      // Loop all current items and add load amount into totalDebit or totalCredit
      for (const item of currentTransactionItems) {
        if (item.isDebit) {
          totalDebit += Math.abs(item.amount);
        } else {
          totalCredit += Math.abs(item.amount);
        }
      }

      if (data.items && data.items.length > 0) {
        for (const itemData of data.items) {
          if (itemData.id) {
            // If item has an ID, it's an existing item being updated

            const existingItem = await this.bookKeepingTransactionItemRepository.findOneOrFail(fromGlobalId(itemData.id).id);
            if (existingItem.deleted) throw new Error('item already deleted.');
            existingItem.deleted = true;
            await queryRunner.manager.save(existingItem);

            if (itemData.accountId && existingItem.accountId !== fromGlobalId(itemData.accountId).id) {
              // If the account is changed, update the related balances

              // Decrease the balance of the previous account
              const previousAccount = await existingItem.account;
              previousAccount.balance -= existingItem.amount;
              await queryRunner.manager.save(previousAccount);
              //update parent account balance
              if (previousAccount.parentAccountId) {
                await updateParentAccountBalance(previousAccount.parentAccountId, -existingItem.amount, queryRunner);
              }

              const newAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(itemData.accountId).id);

              const increaseDebit = (await newAccount.accountType)?.increaseDebit || false;
              const isDebit = (increaseDebit && itemData.amount >= 0) || (!increaseDebit && itemData.amount < 0);
              if (isDebit !== existingItem.isDebit) throw new Error('debit and credit account type not match.');

              const amount = itemData.amount;

              // Increase the balance of the new account
              newAccount.balance += amount;
              await queryRunner.manager.save(newAccount);
              //update parent account balance
              if (newAccount.parentAccountId) {
                await updateParentAccountBalance(newAccount.parentAccountId, amount, queryRunner);
              }

              // Create a new transaction item to replace the existing one for audit purposes
              const newItem = this.bookKeepingTransactionItemRepository.create();
              newItem.transactionId = bookKeepingTransaction.id;
              newItem.accountId = newAccount.id;
              newItem.isDebit = isDebit;
              newItem.amount = amount;
              newItem.desc = itemData.desc || existingItem.desc;
              newItem.isOpeningBalance = itemData.isOpeningBalance || existingItem.isOpeningBalance;
              newTransactionItems.push(newItem);

              if (isDebit) {
                totalDebit = Math.abs(amount);
                debitEdited = true;
              } else {
                totalCredit = Math.abs(amount);
                creditEdited = true;
              }
            } else {
              // If the account is not changed, simply update the existing item
              const account = await existingItem.account;

              // Decrease the previous balance
              account.balance = Number(account.balance) - existingItem.amount;

              const isDebit = existingItem.isDebit;
              const amount = itemData.amount;

              // Increase the balance with the new amount
              account.balance = Number(account.balance) + amount;

              // Save the updated account
              await queryRunner.manager.save(account);
              //update parent account balance with the difference
              if (account.parentAccountId) {
                await updateParentAccountBalance(account.parentAccountId, amount - existingItem.amount, queryRunner);
              }

              const newItem = this.bookKeepingTransactionItemRepository.create();
              newItem.transactionId = bookKeepingTransaction.id;
              newItem.accountId = existingItem.accountId;
              newItem.isDebit = isDebit;
              newItem.amount = amount;
              newItem.desc = itemData.desc || existingItem.desc;
              newItem.isOpeningBalance = itemData.isOpeningBalance || existingItem.isOpeningBalance;

              newTransactionItems.push(newItem);

              if (isDebit) {
                totalDebit = Math.abs(amount);
                debitEdited = true;
              } else {
                totalCredit = Math.abs(amount);
                creditEdited = true;
              }
            }
          } else {
            // If there's no item ID, it's a new item being added

            const account = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(itemData.accountId).id);

            // Determine if the account should be debited or credited based on its account type
            const increaseDebit = (await account.accountType)?.increaseDebit || false;
            const isDebit = (increaseDebit && itemData.amount >= 0) || (!increaseDebit && itemData.amount < 0);
            if (isDebit && totalDebit) throw new Error('debit account already exists.');
            if (!isDebit && totalCredit) throw new Error('credit account already exists.');
            const amount = itemData.amount;
            account.balance = Number(account.balance) + amount;

            await queryRunner.manager.save(account);
            //update parent account balance
            if (account.parentAccountId) {
              await updateParentAccountBalance(account.parentAccountId, amount, queryRunner);
            }

            // Create a new transaction item
            const newItem = this.bookKeepingTransactionItemRepository.create();
            newItem.transactionId = bookKeepingTransaction.id;
            newItem.accountId = account.id;
            newItem.isDebit = isDebit;
            newItem.amount = amount;
            newItem.desc = itemData.desc || '';
            newItem.isOpeningBalance = itemData.isOpeningBalance || false;
            newTransactionItems.push(newItem);

            if (isDebit) {
              totalDebit = Math.abs(amount);
              debitEdited = true;
            } else {
              totalCredit = Math.abs(amount);
              creditEdited = true;
            }
          }
        }
      }

      if (data.items?.length === 1 && (debitEdited || creditEdited) && (totalDebit && totalCredit) && totalDebit !== totalCredit) {
        //update the other item from currentTransactionItems to balance the debit and credit
        const itemData = data.items[0];
        const otherItem = currentTransactionItems.find(item => item.id !== fromGlobalId(itemData.id).id);
        if (otherItem) {
          const account = await otherItem.account;
          account.balance = Number(account.balance) - otherItem.amount;
          //check account is increase debit or not to determine the amount
          const increaseDebit = (await account.accountType)?.increaseDebit || false;
          const amount = increaseDebit ? otherItem.isDebit ? Math.abs(itemData.amount) : -Math.abs(itemData.amount) : otherItem.isDebit ? -Math.abs(itemData.amount) : Math.abs(itemData.amount);
          account.balance = Number(account.balance) + amount;
          await queryRunner.manager.save(account);
          //update parent account balance with the difference
          if (account.parentAccountId) {
            await updateParentAccountBalance(account.parentAccountId, amount - otherItem.amount, queryRunner);
          }

          otherItem.deleted = true;
          await queryRunner.manager.save(otherItem);

          const newItem = this.bookKeepingTransactionItemRepository.create();
          newItem.transactionId = bookKeepingTransaction.id;
          newItem.accountId = otherItem.accountId;
          newItem.isDebit = otherItem.isDebit;
          newItem.amount = amount;
          newItem.desc = otherItem.desc;
          newItem.isOpeningBalance = otherItem.isOpeningBalance;
          newTransactionItems.push(newItem);
        }
      }

      await queryRunner.manager.insert(BookKeepingTransactionItem, newTransactionItems);

      await queryRunner.commitTransaction();

      return {
        bookKeepingTransaction: bookKeepingTransaction,
        userErrors: [],
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error);
      return {
        userErrors: [
          {
            message: error.message,
            field: [],
          },
        ],
      };
    } finally {
      await queryRunner.release();
    }
  }

  async delete(
    data: BookKeepingTransactionDeleteInput,
    user: LoggedInUser,
  ): Promise<BookKeepingTransactionDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookKeepingTransaction = await this.bookKeepingTransactionRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        deleted: false,
      });
      bookKeepingTransaction.deleted = true;
      await queryRunner.manager.save(bookKeepingTransaction);

      const transactionItems = await this.bookKeepingTransactionItemRepository.find({
        where: {
          transactionId: bookKeepingTransaction.id,
          deleted: false,
        },
      });
      for (const item of transactionItems) {
        const account = await item.account;
        account.balance = Number(account.balance) - item.amount;
        await queryRunner.manager.save(account);
        item.deleted = true;
        await queryRunner.manager.save(item);
        if (account.parentAccountId) {
          await updateParentAccountBalance(account.parentAccountId, -item.amount, queryRunner);
        }
      }

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

  async deleteItem(
    data: BookKeepingTransactionItemDeleteInput,
    user: LoggedInUser,
  ): Promise<BookKeepingTransactionItemDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookKeepingTransactionItem = await this.bookKeepingTransactionItemRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        deleted: false,
      });
      bookKeepingTransactionItem.deleted = true;
      await queryRunner.manager.save(bookKeepingTransactionItem);

      const account = await bookKeepingTransactionItem.account;
      account.balance = Number(account.balance) - bookKeepingTransactionItem.amount;
      await queryRunner.manager.save(account);
      if (account.parentAccountId) {
        await updateParentAccountBalance(account.parentAccountId, -bookKeepingTransactionItem.amount, queryRunner);
      }

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
