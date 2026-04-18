import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ChequeBookRepository } from './chequeBook.repository';
import { ChequeBookArgs } from './args/chequeBook.args';
import { ChequeBookConnection } from './connection/chequeBook.connection';
import { ChequeBookUpdateInput } from './input/chequeBookUpdate.input';
import { Enforcer } from 'casbin';
import { ChequeBookPayload } from './payload/chequeBook.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { ChequeBookCreateInput } from './input/chequeBookCreate.input';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import moment from 'moment-timezone';
import { ChequeBookAllocate } from '../chequeBookAllocate/chequeBookAllocate.entity';
import { ChequeBookAllocateRepository } from '../chequeBookAllocate/chequeBookAllocate.repository';
import { UserRepository } from '../user/user.repository';
import { BookKeepingAccountRepository } from '../bookKeepingAccount/bookKeepingAccount.repository';
import { BookKeepingTransactionRepository } from '../bookKeepingTransaction/bookKeepingTransaction.repository';
import { BookKeepingTransactionItemRepository } from '../bookKeepingTransactionItem/bookKeepingTransactionItem.repository';
import { BookKeepingCompanyRepository } from '../bookKeepingCompany/bookKeepingCompany.repository';
import { ChequeBookConfirmTransferInput } from './input/chequeBookConfirmTransfer.input';
import { ChequeBookConfirmTransferPayload } from './payload/chequeBookConfirmTransfer.payload';
import { ChequeBookDeleteInput } from './input/chequeBookDelete.input';
import { ChequeBookDeletePayload } from './payload/chequeBookDelete.payload';
import { BOOK_KEEPING_ACC_ASSET_TYPE_ID, BOOK_KEEPING_ACC_COMPANY_ID, BOOK_KEEPING_ACC_PETTY_CASH_PARENT_ID } from '../../lib/config';
import { BookKeepingAccountTypeRepository } from '../bookKeepingAccountType/bookKeepingAccountType.repository';
import { updateParentAccountBalance } from '../bookKeepingTransaction/bookKeepingTransaction.service';

@Service()
export class ChequeBookService {
  constructor(
    @InjectRepository()
    private readonly chequeBookRepository: ChequeBookRepository,
    @InjectRepository()
    private readonly chequeBookAllocateRepository: ChequeBookAllocateRepository,
    @InjectRepository()
    private readonly userRepository: UserRepository,
    @InjectRepository()
    private readonly bookKeepingAccountRepository: BookKeepingAccountRepository,
    @InjectRepository()
    private readonly bookKeepingAccountTypeRepository: BookKeepingAccountTypeRepository,
    @InjectRepository()
    private readonly bookKeepingCompanyRepository: BookKeepingCompanyRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionRepository: BookKeepingTransactionRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionItemRepository: BookKeepingTransactionItemRepository,
  ) {
  }

  async getMany(args: ChequeBookArgs, extraArgs: { [index: string]: any } = {}): Promise<ChequeBookConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.chequeBookRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.chequeNo) queryBuilder.andWhere('cheque_no = :chequeNo', { chequeNo: args.chequeNo });
    if (args.receiver) queryBuilder.andWhere(`receiver LIKE '%:receiver%'`, { receiver: args.receiver });
    if (args.projectId) queryBuilder.andWhere('project_id = :projectId', { projectId: args.projectId });
    if (args.isCredit) queryBuilder.andWhere('credit = :isCredit', { isCredit: args.isCredit });
    if (args.confirmTransfer) queryBuilder.andWhere('confirm = :confirmTransfer', { confirmTransfer: args.confirmTransfer });
    if (args.staffId) queryBuilder.andWhere('for_petty_cash_staff_id = :staffId', { staffId: fromGlobalId(args.staffId).id });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    if (args.amountFrom || args.amountTo) {

      const amountFrom = args.amountFrom;
      const amountTo = args.amountTo;

      if (amountFrom && amountTo) {
        queryBuilder
          .andWhere("amount >= :amountFrom", {
            amountFrom: amountFrom,
          })
          .andWhere("amount <= :amountTo", {
            amountTo: amountTo,
          });
      }
      else if (amountFrom) {
        queryBuilder
          .andWhere("amount >= :amountFrom", {
            amountFrom: amountFrom,
          })
      }
      else if (amountTo) {
        queryBuilder
          .andWhere("amount <= :amountTo", {
            amountTo: amountTo,
          })
      }
    }

    if (args.dateFrom || args.dateTo) {

      const dateFrom = args.dateFrom;
      const dateTo = args.dateTo;

      if (dateFrom && dateTo) {
        queryBuilder
          .andWhere("date >= :dateFrom", {
            dateFrom: dateFrom,
          })
          .andWhere("date <= :dateTo", {
            dateTo: dateTo,
          });
      }
      else if (dateFrom) {
        queryBuilder
          .andWhere("date >= :dateFrom", {
            dateFrom: dateFrom,
          })
      }
      else if (dateTo) {
        queryBuilder
          .andWhere("date <= :dateTo", {
            dateTo: dateTo,
          })
      }
    }

    if (args.yearFrom || args.yearTo) {

      const yearFrom = args.yearFrom;
      const yearTo = args.yearTo;

      if (yearFrom && yearTo) {
        queryBuilder
          .andWhere("SUBSTRING(date, 1, 4) >= :yearFrom", {
            yearFrom: yearFrom,
          })
          .andWhere("SUBSTRING(date, 1, 4) <= :yearTo", {
            yearTo: yearTo,
          });
      }
      else if (yearFrom) {
        queryBuilder
          .andWhere("SUBSTRING(date, 1, 4) >= :yearFrom", {
            yearFrom: yearFrom,
          })
      }
      else if (yearTo) {
        queryBuilder
          .andWhere("SUBSTRING(date, 1, 4) <= :yearTo", {
            yearTo: yearTo,
          })
      }
    }

    if (args.accYearFrom || args.accYearTo) {
      const accYearFrom = args.accYearFrom;
      const accYearTo = args.accYearTo;

      if (accYearFrom && accYearTo) {
        queryBuilder
          .andWhere("DATE_FORMAT(date, '%m-%d') >= '04-01' AND DATE_FORMAT(date, '%m-%d') <= '03-31'")
          .andWhere("SUBSTRING(date, 6) >= :accYearFrom", {
            accYearFrom: accYearFrom,
          })
          .andWhere("SUBSTRING(date, 6) <= :accYearTo", {
            accYearTo: accYearTo,
          });
      } else if (accYearFrom) {
        queryBuilder
          .andWhere("DATE_FORMAT(date, '%m-%d') >= '04-01'")
          .andWhere("SUBSTRING(date, 6) >= :accYearFrom", {
            accYearFrom: accYearFrom,
          });
      } else if (accYearTo) {
        queryBuilder
          .andWhere("DATE_FORMAT(date, '%m-%d') <= '03-31'")
          .andWhere("SUBSTRING(date, 6) <= :accYearTo", {
            accYearTo: accYearTo,
          });
      }
    }

    queryBuilder.skip(offset).take(limit).orderBy('createAt', 'DESC');
    const [chequeBooks, chequeBookCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(chequeBooks, args, {
        arrayLength: chequeBookCount,
        sliceStart: offset || 0,
      }),
      totalCount: chequeBookCount,
    };
  }

  async create(
    data: ChequeBookCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ChequeBookPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const chequeBook = this.chequeBookRepository.create();

      chequeBook.chequeNo = data.chequeNo;

      chequeBook.date = moment(data.date, 'YYYY-MM-DD').format('YYYY-MM-DD');

      chequeBook.receiver = data.receiver;

      if (data.desc) chequeBook.desc = data.desc;

      if (data.remark) chequeBook.remark = data.remark;

      chequeBook.isCredit = data.isCredit;

      await queryRunner.manager.save(chequeBook);

      if (data.allocate.length === 0) throw new Error('Allocate required');

      let chequeBookAllocates: ChequeBookAllocate[] = [];
      let allocate: any = [];
      let amount = 0;
      let projectIds: string[] = [];
      data.allocate.map((e, i) => {
        amount += e.amount;
        allocate.push({
          id: i + 1,
          project: e.project || '',
          project_id: e.projectId || '',
          amount: e.amount,
          desc: e.desc || '',
          deleted: false,
        });
        if (e.projectId) projectIds.push(e.projectId);

        const chequeBookAllocate = this.chequeBookAllocateRepository.create();
        chequeBookAllocate.chequeBookId = chequeBook.id;
        chequeBookAllocate.project = e.project || '';
        chequeBookAllocate.projectId = e.projectId || '';
        chequeBookAllocate.amount = e.amount;
        chequeBookAllocate.desc = e.desc || '';
        chequeBookAllocate.deleted = false;
        chequeBookAllocates.push(chequeBookAllocate);
      });

      await queryRunner.manager.insert(ChequeBookAllocate, chequeBookAllocates);

      if (projectIds.length) chequeBook.projectId = projectIds.join(',');

      chequeBook.allocate = JSON.stringify(allocate);

      chequeBook.amount = amount;

      chequeBook.createAt = Date.now();

      if (data.forPettyCash) {
        if (!data.forPettyCashStaffId) throw new Error('Staff id required');

        const staff = await this.userRepository.findOneOrFail(fromGlobalId(data.forPettyCashStaffId).id);
        chequeBook.forPettyCashStaffId = Number(staff.id);
        chequeBook.forPettyCash = data.forPettyCash;
        if (!data.isCredit) {
          if (staff.pettyCash < amount) throw new Error('Staff petty cash not enough');
        }
      }

      await queryRunner.manager.save(chequeBook);

      await queryRunner.commitTransaction();

      return {
        chequeBook: await chequeBook.save(),
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
    data: ChequeBookUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<ChequeBookPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const chequeBook = await this.chequeBookRepository.findOneOrFail(fromGlobalId(data.id).id);

      const currentAmount = chequeBook.amount;

      if (data.chequeNo) chequeBook.chequeNo = data.chequeNo;

      if (data.date) chequeBook.date = moment(data.date, 'YYYY-MM-DD').format('YYYY-MM-DD');

      if (data.receiver) chequeBook.receiver = data.receiver;

      if (data.confirmTransfer !== undefined) chequeBook.confirmTransfer = data.confirmTransfer;

      if (data.desc) chequeBook.desc = data.desc;

      if (data.remark) chequeBook.remark = data.remark;

      if (data.isCredit !== undefined) chequeBook.isCredit = data.isCredit;

      let amount = 0;
      if (data.allocate) {
        if (data.allocate.length === 0) throw new Error('Allocate required');

        let chequeBookAllocates: ChequeBookAllocate[] = [];
        let allocate: any = [];
        let projectIds: string[] = [];
        data.allocate.map((e, i) => {
          amount += e.amount;
          allocate.push({
            id: i + 1,
            project: e.project || '',
            project_id: e.projectId || '',
            amount: e.amount,
            desc: e.desc || '',
            deleted: false,
          });
          if (e.projectId) projectIds.push(e.projectId);

          const chequeBookAllocate = this.chequeBookAllocateRepository.create();
          chequeBookAllocate.chequeBookId = chequeBook.id;
          chequeBookAllocate.project = e.project || '';
          chequeBookAllocate.projectId = e.projectId || '';
          chequeBookAllocate.amount = e.amount;
          chequeBookAllocate.desc = e.desc || '';
          chequeBookAllocate.deleted = e.deleted || false;
          chequeBookAllocates.push(chequeBookAllocate);
        });

        await queryRunner.manager.delete(ChequeBookAllocate, { chequeBookId: chequeBook.id });
        await queryRunner.manager.insert(ChequeBookAllocate, chequeBookAllocates);

        if (projectIds.length) chequeBook.projectId = projectIds.join(',');

        chequeBook.allocate = JSON.stringify(allocate);

        chequeBook.amount = amount;
      }

      chequeBook.editAt = Date.now();

      if (data.forPettyCash !== undefined) {
        if (data.forPettyCash && !data.isCredit && !chequeBook.isCredit) throw new Error('Cheque book for petty cash must be credit');
        if (data.forPettyCash && !data.forPettyCashStaffId) throw new Error('Staff id required');
        chequeBook.forPettyCash = data.forPettyCash;
        if (data.forPettyCashStaffId) {
          const staff = await this.userRepository.findOneOrFail(fromGlobalId(data.forPettyCashStaffId).id);
          chequeBook.forPettyCashStaffId = Number(staff.id);
          if (!data.isCredit) {
            if (staff.pettyCash < amount) throw new Error('Staff petty cash not enough');
          }
        }
      }

      await queryRunner.manager.save(chequeBook);

      await queryRunner.commitTransaction();

      return {
        chequeBook: chequeBook,
        userErrors: []
      };
    } catch (error: any) {
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

  async delete(
    data: ChequeBookDeleteInput,
    user: LoggedInUser,
  ): Promise<ChequeBookDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const chequeBook = await this.chequeBookRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        deleted: false,
      });
      chequeBook.deleted = true;
      await queryRunner.manager.save(chequeBook);

      if (chequeBook.confirmTransfer && chequeBook.forPettyCash) {
        const categoryAccount = await chequeBook.categoryAccount!;
        const chargeAccount = await chequeBook.chargeAccount!;
        categoryAccount.balance = chequeBook.isCredit ? Number(categoryAccount.balance) - Number(chequeBook.amount) : Number(categoryAccount.balance) + Number(chequeBook.amount);
        chargeAccount.balance = chequeBook.isCredit ? Number(chargeAccount.balance) + Number(chequeBook.amount) : Number(chargeAccount.balance) - Number(chequeBook.amount);
        await queryRunner.manager.save(categoryAccount);
        await queryRunner.manager.save(chargeAccount);
        //update those categoryAccount and chargeAccount balance of parent account balance
        if(categoryAccount.parentAccountId) {
          const amount = chequeBook.isCredit ? -Number(chequeBook.amount) : Number(chequeBook.amount);
          await updateParentAccountBalance(categoryAccount.parentAccountId, amount, queryRunner);
        }
        if(chargeAccount.parentAccountId) {
          const amount = chequeBook.isCredit ? Number(chequeBook.amount) : -Number(chequeBook.amount);
          await updateParentAccountBalance(chargeAccount.parentAccountId, amount, queryRunner);
        }
        const transaction = await chequeBook.transaction!;
        transaction.deleted = true;
        await queryRunner.manager.save(transaction);
        const transactionItems = await this.bookKeepingTransactionItemRepository.find({ transactionId: transaction.id });
        for (const transactionItem of transactionItems) {
          transactionItem.deleted = true;
          await queryRunner.manager.save(transactionItem);
        }

        const staff = await chequeBook.forPettyCashStaff!;
        staff.pettyCash = chequeBook.isCredit ? Number(staff.pettyCash) - Number(chequeBook.amount) : Number(staff.pettyCash) + Number(chequeBook.amount);
        await queryRunner.manager.save(staff);
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

  async confirmTransfer(
    data: ChequeBookConfirmTransferInput,
  ): Promise<ChequeBookConfirmTransferPayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const chequeBook = await this.chequeBookRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        confirmTransfer: false,
        deleted: false,
      });
      chequeBook.confirmTransfer = true;

      const staff = await chequeBook.forPettyCashStaff!;
      staff.pettyCash = chequeBook.isCredit ? Number(staff.pettyCash) + Number(chequeBook.amount) : Number(staff.pettyCash) - Number(chequeBook.amount);
      if (staff.pettyCash < 0) throw new Error('Staff petty cash not enough');
      if (chequeBook.chequeNo) staff.lastChequeNoForPettyCash = chequeBook.chequeNo;
      await queryRunner.manager.save(staff);

      let staffPettyCashAccount = await staff.pettyCashAccount;
      if (!staffPettyCashAccount) {
        staffPettyCashAccount = this.bookKeepingAccountRepository.create();
        const bookKeepingCompany = await this.bookKeepingCompanyRepository.findOneOrFail(BOOK_KEEPING_ACC_COMPANY_ID);
        staffPettyCashAccount.companyId = bookKeepingCompany.id;
        const bookKeepingAccountType = await this.bookKeepingAccountTypeRepository.findOneOrFail(BOOK_KEEPING_ACC_ASSET_TYPE_ID);
        staffPettyCashAccount.accountTypeId = bookKeepingAccountType.id;
        const parentAccount = await this.bookKeepingAccountRepository.findOneOrFail(BOOK_KEEPING_ACC_PETTY_CASH_PARENT_ID);
        staffPettyCashAccount.parentAccountId = parentAccount.id;
        staffPettyCashAccount.name = `${staff.nameCht || staff.nameEn} 備用金`;
        await queryRunner.manager.save(staffPettyCashAccount);
        staff.pettyCashAccountId = staffPettyCashAccount.id;
        await queryRunner.manager.save(staff);
      }
      chequeBook.categoryAccountId = staffPettyCashAccount.id;

      const chargeAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.chargeAccountId).id);
      chequeBook.chargeAccountId = chargeAccount.id;

      staffPettyCashAccount.balance = chequeBook.isCredit ? Number(staffPettyCashAccount.balance) + Number(chequeBook.amount) : Number(staffPettyCashAccount.balance) - Number(chequeBook.amount);
      chargeAccount.balance = chequeBook.isCredit ? Number(chargeAccount.balance) - Number(chequeBook.amount) : Number(chargeAccount.balance) + Number(chequeBook.amount);
      await queryRunner.manager.save(staffPettyCashAccount);
      await queryRunner.manager.save(chargeAccount);
      //update those staffPettyCashAccount and chargeAccount balance of parent account balance
      if(staffPettyCashAccount.parentAccountId) {
        const amount = Number(chequeBook.amount)
        await updateParentAccountBalance(staffPettyCashAccount.parentAccountId, amount, queryRunner);
      }
      if(chargeAccount.parentAccountId) {
        const amount = -Number(chequeBook.amount)
        await updateParentAccountBalance(chargeAccount.parentAccountId, amount, queryRunner);
      }

      const bookKeepingTransaction = this.bookKeepingTransactionRepository.create();
      const company = await this.bookKeepingCompanyRepository.findOneOrFail(fromGlobalId(data.companyId).id);
      bookKeepingTransaction.companyId = company.id;
      bookKeepingTransaction.transactionDate = data.transactionDate;
      bookKeepingTransaction.financialYearStart = data.financialYearStart;
      bookKeepingTransaction.financialYearEnd = data.financialYearEnd;
      bookKeepingTransaction.chequeBookId = chequeBook.id;

      await queryRunner.manager.save(bookKeepingTransaction);

      const bookKeepingTransactionItem1 = this.bookKeepingTransactionItemRepository.create();
      bookKeepingTransactionItem1.accountId = staffPettyCashAccount.id;
      bookKeepingTransactionItem1.amount = chequeBook.amount;
      bookKeepingTransactionItem1.isDebit = true;
      bookKeepingTransactionItem1.desc = data.transactionDesc || '';
      bookKeepingTransactionItem1.transactionId = bookKeepingTransaction.id;

      const bookKeepingTransactionItem2 = this.bookKeepingTransactionItemRepository.create();
      bookKeepingTransactionItem2.accountId = chargeAccount.id;
      bookKeepingTransactionItem2.amount = -chequeBook.amount;
      bookKeepingTransactionItem2.isDebit = false;
      bookKeepingTransactionItem2.desc = data.transactionDesc || '';
      bookKeepingTransactionItem2.transactionId = bookKeepingTransaction.id;

      await queryRunner.manager.save(bookKeepingTransactionItem1);
      await queryRunner.manager.save(bookKeepingTransactionItem2);

      chequeBook.transactionId = bookKeepingTransaction.id;
      chequeBook.companyId = company.id;
      await queryRunner.manager.save(chequeBook);

      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        result: true,
        chequeBook: chequeBook,
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
