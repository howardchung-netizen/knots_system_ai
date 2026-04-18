import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BookKeepingPeriodExpenseRepository } from './bookKeepingPeriodExpense.repository';
import { BookKeepingPeriodExpenseArgs } from './args/bookKeepingPeriodExpense.args';
import { BookKeepingPeriodExpenseConnection } from './connection/bookKeepingPeriodExpense.connection';
import { BookKeepingPeriodExpenseUpdateInput } from './input/bookKeepingPeriodExpenseUpdate.input';
import { Enforcer } from 'casbin';
import { BookKeepingPeriodExpensePayload } from './payload/bookKeepingPeriodExpense.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { BookKeepingPeriodExpenseCreateInput } from './input/bookKeepingPeriodExpenseCreate.input';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { BookKeepingAccountRepository } from '../bookKeepingAccount/bookKeepingAccount.repository';
import { BookKeepingPeriodExpenseDeleteInput } from './input/bookKeepingPeriodExpenseDelete.input';
import { BookKeepingPeriodExpenseDeletePayload } from './payload/bookKeepingPeriodExpenseDelete.payload';
import moment from 'moment-timezone';
import { UserRepository } from '../user/user.repository';
import { BookKeepingPeriodExpense, BookKeepingPeriodExpenseType } from './bookKeepingPeriodExpense.entity';
import { BookKeepingCompanyRepository } from '../bookKeepingCompany/bookKeepingCompany.repository';
import { BookKeepingTransactionRepository } from '../bookKeepingTransaction/bookKeepingTransaction.repository';
import { BookKeepingTransactionItemRepository } from '../bookKeepingTransactionItem/bookKeepingTransactionItem.repository';
import { BookKeepingPeriodExpenseOccurrence } from './payload/bookKeepingPeriodExpenseOccurrence';

@Service()
export class BookKeepingPeriodExpenseService {
  constructor(
    @InjectRepository()
    private readonly bookKeepingPeriodExpenseRepository: BookKeepingPeriodExpenseRepository,
    @InjectRepository()
    private readonly bookKeepingAccountRepository: BookKeepingAccountRepository,
    @InjectRepository()
    private readonly bookKeepingCompanyRepository: BookKeepingCompanyRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionRepository: BookKeepingTransactionRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionItemRepository: BookKeepingTransactionItemRepository,
    @InjectRepository()
    private readonly userRepository: UserRepository,
  ) {
  }

  async getMany(args: BookKeepingPeriodExpenseArgs, extraArgs: { [index: string]: any } = {}): Promise<BookKeepingPeriodExpenseConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.bookKeepingPeriodExpenseRepository.createQueryBuilder();

    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });

    if (args.fromDate || args.toDate) {

      const startDate = args.fromDate;
      const endDate = moment(args.toDate, 'YYYY-MM-DD', true).add(1, 'days').format('YYYY-MM-DD');

      if (startDate && endDate) {
        queryBuilder
        .andWhere("from_date >= :startDate", {
          startDate: startDate,
        })
        .andWhere("to_date < :endDate", {
          endDate: endDate,
        });
      }
      else if (startDate) {
        queryBuilder
        .andWhere("from_date >= :startDate", {
          startDate: startDate,
        })
      }
      else if (endDate) {
        queryBuilder
        .andWhere("to_date < :endDate", {
          endDate: endDate,
        })
      }
    }

    if (args.period) {
      queryBuilder.andWhere('period = :period', { period: args.period });
    }

    if (args.periodDay) {
      queryBuilder.andWhere('period_Day = :periodDay', { periodDay: args.periodDay });
    }

    if (args.categoryAccountId) {
      queryBuilder.andWhere('category_account_id = :categoryAccountId', { categoryAccountId: fromGlobalId(args.categoryAccountId).id });
    }

    if (args.personInChargeId) {
      queryBuilder.andWhere('person_in_charge_id = :personInChargeId', { personInChargeId: fromGlobalId(args.personInChargeId).id });
    }

    if (args.chargeAccountId) {
      queryBuilder.andWhere('charge_account_id = :chargeAccountId', { chargeAccountId: fromGlobalId(args.chargeAccountId).id });
    }

    if (args.remark) {
      queryBuilder.andWhere('remark = :remark', { remark: args.remark });
    }

    if (args.deleted !== undefined) {
      queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    }

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
    data: BookKeepingPeriodExpenseCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<BookKeepingPeriodExpensePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const bookKeepingPeriodExpense = this.bookKeepingPeriodExpenseRepository.create();
      const company = await this.bookKeepingCompanyRepository.findOneOrFail(fromGlobalId(data.companyId).id);
      bookKeepingPeriodExpense.companyId = company.id;
      bookKeepingPeriodExpense.fromDate = data.fromDate;
      bookKeepingPeriodExpense.toDate = data.toDate;
      bookKeepingPeriodExpense.period = data.period;
      bookKeepingPeriodExpense.periodDay = data.periodDay;
      bookKeepingPeriodExpense.amount = data.amount;
      const categoryAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.categoryAccountId).id);
      bookKeepingPeriodExpense.categoryAccountId = categoryAccount.id;
      if (data.personInChargeId) {
        const personInCharge = await this.userRepository.findOneOrFail(fromGlobalId(data.personInChargeId).id);
        bookKeepingPeriodExpense.personInChargeId = Number(personInCharge.id);
      }
      const chargeAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.chargeAccountId).id);
      bookKeepingPeriodExpense.chargeAccountId = chargeAccount.id;
      bookKeepingPeriodExpense.desc = data.desc;
      bookKeepingPeriodExpense.remark = data.remark || undefined;

      await queryRunner.manager.save(bookKeepingPeriodExpense);

      await queryRunner.commitTransaction();

      return {
        bookKeepingPeriodExpense: bookKeepingPeriodExpense,
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
    data: BookKeepingPeriodExpenseUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<BookKeepingPeriodExpensePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookKeepingPeriodExpense = await this.bookKeepingPeriodExpenseRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (data.companyId) {
        const company = await this.bookKeepingCompanyRepository.findOneOrFail(fromGlobalId(data.companyId).id);
        bookKeepingPeriodExpense.companyId = company.id;
      }
      if (data.fromDate) bookKeepingPeriodExpense.fromDate = data.fromDate;
      if (data.toDate) bookKeepingPeriodExpense.toDate = data.toDate;
      if (data.period) bookKeepingPeriodExpense.period = data.period;
      if (data.periodDay) bookKeepingPeriodExpense.periodDay = data.periodDay;
      if (data.amount) bookKeepingPeriodExpense.amount = data.amount;
      if (data.categoryAccountId) {
        const categoryAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.categoryAccountId).id);
        bookKeepingPeriodExpense.categoryAccountId = categoryAccount.id;
      }
      if (data.personInChargeId) {
        const personInCharge = await this.userRepository.findOneOrFail(fromGlobalId(data.personInChargeId).id);
        bookKeepingPeriodExpense.personInChargeId = Number(personInCharge.id);
      }
      if (data.chargeAccountId) {
        const chargeAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.chargeAccountId).id);
        bookKeepingPeriodExpense.chargeAccountId = chargeAccount.id;
      }
      if (data.desc) bookKeepingPeriodExpense.desc = data.desc;
      if (data.remark) bookKeepingPeriodExpense.remark = data.remark;

      await queryRunner.manager.save(bookKeepingPeriodExpense);

      await queryRunner.commitTransaction();

      return {
        bookKeepingPeriodExpense: bookKeepingPeriodExpense,
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
    data: BookKeepingPeriodExpenseDeleteInput,
    user: LoggedInUser,
  ): Promise<BookKeepingPeriodExpenseDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bookKeepingPeriodExpense = await this.bookKeepingPeriodExpenseRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        deleted: false,
      });
      bookKeepingPeriodExpense.deleted = true;
      await queryRunner.manager.save(bookKeepingPeriodExpense);

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

  async findExpensesForToday(): Promise<BookKeepingPeriodExpense[]> {
    const currentDate = new Date();

    const expensesForToday = await this.bookKeepingPeriodExpenseRepository
      .createQueryBuilder('expense')
      .where('expense.fromDate <= :currentDate', { currentDate })
      .andWhere('expense.toDate >= :currentDate', { currentDate })
      .getMany();

    const expensesToProcess = expensesForToday.filter(expense =>
      this.isExpenseDueOnDate(expense, currentDate)
    );

    return expensesToProcess;
  }

  private isExpenseDueOnDate(expense: BookKeepingPeriodExpense, currentDate: Date): boolean {
    const { period, periodDay, fromDate } = expense;
    const startDate = new Date(fromDate);

    switch (period) {
      case 'weekly':
        const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceStart % 7 === periodDay - 1;
      case 'monthly':
        return currentDate.getDate() === periodDay;
      case 'quarterly':
        const monthsSinceStart = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + currentDate.getMonth() - startDate.getMonth();
        return monthsSinceStart % 3 === 0 && currentDate.getDate() === periodDay;
      case 'yearly':
        return currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() === periodDay;
      default:
        throw new Error(`Invalid period type: ${expense.period}`);
    }
  }

  async periodExpenseDailyChecking(): Promise<Boolean> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const expensesToProcess = await this.findExpensesForToday();

      for (const expense of expensesToProcess) {
        const transaction = this.bookKeepingTransactionRepository.create();
        transaction.companyId = expense.companyId;
        transaction.transactionDate = moment().format('YYYY-MM-DD');
        await queryRunner.manager.save(transaction);

        const categoryItem = this.bookKeepingTransactionItemRepository.create();
        categoryItem.transactionId = transaction.id;
        categoryItem.accountId = expense.categoryAccountId;
        categoryItem.isDebit = true;
        categoryItem.amount = expense.amount;
        categoryItem.desc = expense.desc;

        await queryRunner.manager.save(categoryItem);

        const chargeItem = this.bookKeepingTransactionItemRepository.create();
        chargeItem.transactionId = transaction.id;
        chargeItem.accountId = expense.chargeAccountId;
        chargeItem.isDebit = false;
        chargeItem.amount = expense.amount;
        chargeItem.desc = expense.desc;

        await queryRunner.manager.save(chargeItem);

        const expenseAmount = expense.amount;

        const expenseCategoryAccount = await expense.categoryAccount;
        const expenseChargeAccount = await expense.chargeAccount;

        const expenseCategoryAccountBalance = expenseCategoryAccount.balance;
        const expenseChargeAccountBalance = expenseChargeAccount.balance;

        expenseCategoryAccount.balance = Number(expenseCategoryAccountBalance) + Number(expenseAmount);
        expenseChargeAccount.balance = Number(expenseChargeAccountBalance) - Number(expenseAmount);

        await queryRunner.manager.save(expenseCategoryAccount);
        await queryRunner.manager.save(expenseChargeAccount);

      }

      await queryRunner.commitTransaction();

      return true;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error);
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async getExpensesInRange(fromDate: string, toDate: string): Promise<BookKeepingPeriodExpenseOccurrence[]> {
    const startDate = moment(fromDate);
    const endDate = moment(toDate);

    const expenses = await this.bookKeepingPeriodExpenseRepository.createQueryBuilder('expense')
      .where('expense.fromDate <= :endDate', { endDate: endDate.format('YYYY-MM-DD') })
      .andWhere('expense.toDate >= :startDate', { startDate: startDate.format('YYYY-MM-DD') })
      .andWhere('expense.deleted = false')
      .getMany();

    const occurrences: BookKeepingPeriodExpenseOccurrence[] = [];

    for (const expense of expenses) {
      const dates = this.getOccurrenceDates(expense, startDate, endDate);
      for (const date of dates) {
        occurrences.push({
          date: date.format('YYYY-MM-DD'),
          expense: expense
        });
      }
    }

    return occurrences.sort((a, b) => a.date.localeCompare(b.date));
  }

  private getOccurrenceDates(expense: BookKeepingPeriodExpense, startDate: moment.Moment, endDate: moment.Moment): moment.Moment[] {
    const dates: moment.Moment[] = [];
    let currentDate = moment.max(moment(expense.fromDate), startDate);

    while (currentDate.isSameOrBefore(endDate) && currentDate.isSameOrBefore(moment(expense.toDate))) {
      if (this.isExpenseDueOnDate2(expense, currentDate)) {
        dates.push(currentDate.clone());
      }
      currentDate.add(1, 'day');
    }

    return dates;
  }

  private isExpenseDueOnDate2(expense: BookKeepingPeriodExpense, date: moment.Moment): boolean {
    const { period, periodDay, fromDate } = expense;
    const startDate = moment(fromDate);

    switch (period) {
      case BookKeepingPeriodExpenseType.Weekly:
        return date.day() === (periodDay % 7);
      case BookKeepingPeriodExpenseType.Monthly:
        return date.date() === periodDay;
      case BookKeepingPeriodExpenseType.Quarterly:
        const monthsSinceStart = date.diff(startDate, 'months');
        return monthsSinceStart % 3 === 0 && date.date() === periodDay;
      case BookKeepingPeriodExpenseType.Yearly:
        return date.month() === startDate.month() && date.date() === periodDay;
      default:
        return false;
    }
  }

}
