import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ClaimFormRepository } from './claimForm.repository';
import { ClaimFormArgs } from './args/claimForm.args';
import { ClaimFormConnection } from './connection/claimForm.connection';
import { ClaimFormUpdateInput } from './input/claimFormUpdate.input';
import { Enforcer } from 'casbin';
import { ClaimFormPayload } from './payload/claimForm.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { ClaimFormCreateInput } from './input/claimFormCreate.input';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import moment from 'moment-timezone';
import { UserRepository } from '../user/user.repository';
import { uploadToLocal } from '../../lib/storage';
import { ClaimFormDeleteInput } from './input/claimFormDelete.input';
import { ClaimFormDeletePayload } from './payload/claimFormDelete.payload';
import { ClaimFormUploadInput } from './input/claimFormUpload.input';
import { BookKeepingAccountRepository } from '../bookKeepingAccount/bookKeepingAccount.repository';
import { BookKeepingTransactionRepository } from '../bookKeepingTransaction/bookKeepingTransaction.repository';
import { BookKeepingTransactionItemRepository } from '../bookKeepingTransactionItem/bookKeepingTransactionItem.repository';
import { BookKeepingCompanyRepository } from '../bookKeepingCompany/bookKeepingCompany.repository';
import { ClaimFormConfirmTransferInput } from './input/claimFormConfirmTransfer.input';
import { ClaimFormConfirmTransferPayload } from './payload/claimFormConfirmTransfer.payload';
import { updateParentAccountBalance } from '../bookKeepingTransaction/bookKeepingTransaction.service';
import { ClaimFormFile } from '../claimFormFile/claimFormFile.entity';
import { ClaimFormFileRepository } from '../claimFormFile/claimFormFile.repository';
import { ProjectRepository } from '../project/project.repository';
import { ProjectOrderRepository } from '../projectOrder/projectOrder.repository';

@Service()
export class ClaimFormService {
  constructor(
    @InjectRepository()
    private readonly claimFormRepository: ClaimFormRepository,
    @InjectRepository()
    private readonly userRepository: UserRepository,
    @InjectRepository()
    private readonly bookKeepingAccountRepository: BookKeepingAccountRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionRepository: BookKeepingTransactionRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionItemRepository: BookKeepingTransactionItemRepository,
    @InjectRepository()
    private readonly bookKeepingCompanyRepository: BookKeepingCompanyRepository,
    @InjectRepository()
    private readonly claimFormFileRepository: ClaimFormFileRepository,
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
    @InjectRepository()
    private readonly projectOrderRepository: ProjectOrderRepository,
  ) {
  }

  async getMany(args: ClaimFormArgs, extraArgs: { [index: string]: any } = {}): Promise<ClaimFormConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.claimFormRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.staffId) queryBuilder.andWhere('staff_id = :staffId', { staffId: fromGlobalId(args.staffId).id });
    if (args.vendor) queryBuilder.andWhere(`vendor LIKE '%:vendor%'`, { chequeNo: args.vendor });
    if (args.chequeNo) queryBuilder.andWhere('cheque_no = :chequeNo', { chequeNo: args.chequeNo });
    if (args.categoryAccountId) queryBuilder.andWhere('category_account_id = :categoryAccountId', { categoryAccountId: fromGlobalId(args.categoryAccountId).id });
    if (args.bankAccountId) queryBuilder.andWhere('bank_account_id = :bankAccountId', { bankAccountId: fromGlobalId(args.bankAccountId).id });
    if (args.settlement) queryBuilder.andWhere('settlement = :settlement', { settlement: args.settlement });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });

    let orderBy: { [key: string]: "DESC" | "ASC" } = {
      "created_at": 'DESC',
    };

    if (args.order && args.sort) {
       orderBy = {
        [args.sort]: args.order as "DESC" | "ASC",
      };
    }

    queryBuilder.skip(offset).take(limit).orderBy({
      ...orderBy
    });

    const [claimForms, claimFormCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(claimForms, args, {
        arrayLength: claimFormCount,
        sliceStart: offset || 0,
      }),
      totalCount: claimFormCount,
    };
  }

  async upload(
    data: ClaimFormUploadInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ClaimFormPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const claimForm = this.claimFormRepository.create();

      claimForm.staffId = Number(user.id);

      if (data.vendor) claimForm.vendor = data.vendor;

      claimForm.purchasedDate = moment(data.purchasedDate, 'YYYY-MM-DD').format('YYYY-MM-DD');

      claimForm.amount = data.amount;

      if (data.categoryAccountId) {
        const categoryAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.categoryAccountId).id);
        claimForm.categoryAccountId = categoryAccount.id;
      }

      if (data.projectId) {
        const project = await this.projectRepository.findOneOrFail(fromGlobalId(data.projectId).id);
        claimForm.projectId = project.id;
      }
      
      if (data.files && data.files.length) {
        await Promise.all(
          data.files.map(async e => {
            const { path: filePath, mimeType: fileMimeType, type: fileType, filename: filename } = await uploadToLocal(await e, 'ClaimFormFile');
            const file = new ClaimFormFile();
            file.filePath = filePath;
            file.fileMimeType = fileMimeType;
            file.claimFormId = claimForm?.id!;
            await queryRunner.manager.save(file);
          })
        )
      }

      await queryRunner.manager.save(claimForm);

      await queryRunner.commitTransaction();

      return {
        claimForm: await claimForm.save(),
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

  async create(
    data: ClaimFormCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ClaimFormPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const claimForm = this.claimFormRepository.create();

      const staff = await this.userRepository.findOneOrFail(fromGlobalId(data.staffId).id);
      claimForm.staffId = Number(staff.id);

      if (data.vendor) claimForm.vendor = data.vendor;

      claimForm.purchasedDate = moment(data.purchasedDate, 'YYYY-MM-DD').format('YYYY-MM-DD');

      claimForm.amount = data.amount;

      if (data.chequeNo) claimForm.chequeNo = data.chequeNo;

      if (data.categoryAccountId) {
        const categoryAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.categoryAccountId).id);
        claimForm.categoryAccountId = categoryAccount.id;
      }

      if (data.projectId) {
        const project = await this.projectRepository.findOneOrFail(fromGlobalId(data.projectId).id);
        claimForm.projectId = project.id;
      }

      if (data.uploadFiles && data.uploadFiles.length) {
        await Promise.all(
          data.uploadFiles.map(async e => {
            const { path: filePath, mimeType: fileMimeType, type: fileType, filename: filename } = await uploadToLocal(await e, 'claimFormFile');
            const file = new ClaimFormFile();
            file.filePath = filePath;
            file.fileMimeType = fileMimeType;
            file.claimFormId = claimForm?.id!;
            await queryRunner.manager.save(file);
          })
        )
      }

      await queryRunner.manager.save(claimForm);

      await queryRunner.commitTransaction();

      return {
        claimForm: await claimForm.save(),
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
    data: ClaimFormUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<ClaimFormPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const claimForm = await this.claimFormRepository.findOneOrFail(fromGlobalId(data.id).id);

      if(claimForm.settlement) throw new Error('Claim form already settled');

      if (data.staffId) {
        const staff = await this.userRepository.findOneOrFail(fromGlobalId(data.staffId).id);
        claimForm.staffId = Number(staff.id);
      }

      if (data.vendor) claimForm.vendor = data.vendor;

      if (data.purchasedDate) claimForm.purchasedDate = moment(data.purchasedDate, 'YYYY-MM-DD').format('YYYY-MM-DD');

      if (data.amount) claimForm.amount = data.amount;

      if (data.chequeNo) claimForm.chequeNo = data.chequeNo;

      if (data.categoryAccountId) {
        const categoryAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.categoryAccountId).id);
        claimForm.categoryAccountId = categoryAccount.id;
      }

      if (data.projectId) {
        const project = await this.projectRepository.findOneOrFail(fromGlobalId(data.projectId).id);
        claimForm.projectId = project.id;
      }
      else if (data.projectId === null) {
        claimForm.projectId = '';
      }

      if (data.uploadFiles && data.uploadFiles.length) {
        await Promise.all(
          data.uploadFiles.map(async e => {
            const { path: filePath, mimeType: fileMimeType, type: fileType, filename: filename } = await uploadToLocal(await e, 'claimFormFile');
            const file = new ClaimFormFile();
            file.filePath = filePath;
            file.fileMimeType = fileMimeType;
            file.claimFormId = claimForm?.id!;
            await queryRunner.manager.save(file);
          })
        )
      }

      if (data.deleteFiles && data.deleteFiles.length) {
        await Promise.all(
          data.deleteFiles.map(async e => {
            const file = await this.claimFormFileRepository.findOneOrFail(fromGlobalId(e).id);
            file.deleted = true;
            await queryRunner.manager.save(file);
          })
        )
      }

      await queryRunner.manager.save(claimForm);

      await queryRunner.commitTransaction();

      return {
        claimForm: claimForm,
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
    data: ClaimFormDeleteInput,
    user: LoggedInUser,
  ): Promise<ClaimFormDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const claimForm = await this.claimFormRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        deleted: false,
      });
      claimForm.deleted = true;
      await queryRunner.manager.save(claimForm);

      if (claimForm.settlement) {
        const staff = await claimForm.staff!;
        staff.pettyCash = Number(staff.pettyCash) + Number(claimForm.amount);
        await queryRunner.manager.save(staff);

        const categoryAccount = await claimForm.categoryAccount!;
        const bankAccount = await claimForm.bankAccount!;
        categoryAccount.balance = Number(categoryAccount.balance) - Number(claimForm.amount);
        bankAccount.balance = Number(bankAccount.balance) + Number(claimForm.amount);
        await queryRunner.manager.save(categoryAccount);
        await queryRunner.manager.save(bankAccount);
        //update those staff petty cash account and category account of parent account balance
        if(categoryAccount.parentAccountId) {
          const amount = -Number(claimForm.amount);
          await updateParentAccountBalance(categoryAccount.parentAccountId, amount, queryRunner);
        }
        if(bankAccount.parentAccountId) {
          const amount = Number(claimForm.amount);
          await updateParentAccountBalance(bankAccount.parentAccountId, amount, queryRunner);
        }
        const transaction = await claimForm.transaction!;
        transaction.deleted = true;
        await queryRunner.manager.save(transaction);
        const transactionItems = await this.bookKeepingTransactionItemRepository.find({ transactionId: transaction.id });
        for (const transactionItem of transactionItems) {
          transactionItem.deleted = true;
          await queryRunner.manager.save(transactionItem);
        }

        if(claimForm.projectOrderId) {
          const projectOrder = await this.projectOrderRepository.findOneOrFail(claimForm.projectOrderId);
          projectOrder.deleted = true;
          await queryRunner.manager.save(projectOrder);
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

  async confirmTransfer(
    data: ClaimFormConfirmTransferInput,
  ): Promise<ClaimFormConfirmTransferPayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const claimForm = await this.claimFormRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        settlement: false,
        deleted: false,
      });
      claimForm.settlement = true;

      const staff = await claimForm.staff!;
      staff.pettyCash = Number(staff.pettyCash) - Number(claimForm.amount);
      if (staff.pettyCash < 0) throw new Error('Staff petty cash not enough');
      await queryRunner.manager.save(staff);

      let staffPettyCashAccount = await staff.pettyCashAccount;
      if (!staffPettyCashAccount) throw new Error('Staff do not have petty cash account');
      claimForm.bankAccountId = staffPettyCashAccount.id;

      let categoryAccount = await claimForm.categoryAccount;
      if (!categoryAccount && !data.categoryAccountId) throw new Error('Category account and bank account not found');
      if (data.categoryAccountId) {
        categoryAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.categoryAccountId).id);
        claimForm.categoryAccountId = categoryAccount.id;
      }

      staffPettyCashAccount.balance = Number(staffPettyCashAccount.balance) - Number(claimForm.amount);
      categoryAccount!.balance = Number(categoryAccount!.balance) + Number(claimForm.amount);
      await queryRunner.manager.save(staffPettyCashAccount);
      await queryRunner.manager.save(categoryAccount);
      //update those staff petty cash account and category account of parent account balance
      if(staffPettyCashAccount.parentAccountId) {
        const amount = -Number(claimForm.amount);
        await updateParentAccountBalance(staffPettyCashAccount.parentAccountId, amount, queryRunner);
      }
      if(categoryAccount!.parentAccountId) {
        const amount = Number(claimForm.amount);
        await updateParentAccountBalance(categoryAccount!.parentAccountId, amount, queryRunner);
      }

      const bookKeepingTransaction = this.bookKeepingTransactionRepository.create();
      const company = await this.bookKeepingCompanyRepository.findOneOrFail(fromGlobalId(data.companyId).id);
      bookKeepingTransaction.companyId = company.id;
      bookKeepingTransaction.transactionDate = data.transactionDate;
      bookKeepingTransaction.financialYearStart = data.financialYearStart;
      bookKeepingTransaction.financialYearEnd = data.financialYearEnd;
      bookKeepingTransaction.claimFormId = claimForm.id;

      await queryRunner.manager.save(bookKeepingTransaction);

      const bookKeepingTransactionItem1 = this.bookKeepingTransactionItemRepository.create();
      bookKeepingTransactionItem1.accountId = staffPettyCashAccount.id;
      bookKeepingTransactionItem1.amount = -claimForm.amount;
      bookKeepingTransactionItem1.isDebit = false;
      bookKeepingTransactionItem1.desc = data.transactionDesc || '';
      bookKeepingTransactionItem1.transactionId = bookKeepingTransaction.id;

      const bookKeepingTransactionItem2 = this.bookKeepingTransactionItemRepository.create();
      bookKeepingTransactionItem2.accountId = categoryAccount!.id;
      bookKeepingTransactionItem2.amount = claimForm.amount;
      bookKeepingTransactionItem2.isDebit = true;
      bookKeepingTransactionItem2.desc = data.transactionDesc || '';
      bookKeepingTransactionItem2.transactionId = bookKeepingTransaction.id;

      await queryRunner.manager.save(bookKeepingTransactionItem1);
      await queryRunner.manager.save(bookKeepingTransactionItem2);

      claimForm.transactionId = bookKeepingTransaction.id;

      if (data.isOrder) {

        const projectOrder = this.projectOrderRepository.create();

        if (claimForm.projectId) {
          const project = await this.projectRepository.findOneOrFail(claimForm.projectId);
          projectOrder.projectId = String(project.projectId);
        }

        projectOrder.categoryAccountId = categoryAccount!.id;
        projectOrder.bankAccountId = staffPettyCashAccount.id;
        projectOrder.transactionId = bookKeepingTransaction.id;
        projectOrder.amount = claimForm.amount;
        projectOrder.orderedDate = new Date(claimForm.purchasedDate);
        projectOrder.payment = true;
        projectOrder.settlement = true;
        projectOrder.claimFormId = claimForm.id;
        if(data.transactionDesc) projectOrder.desc = data.transactionDesc;
        else projectOrder.desc = 'Claim Form by ' + (staff.nameCht ?? staff.nameEn)  + ' on ' + claimForm.purchasedDate;
        projectOrder.settlement = true;
        
        await queryRunner.manager.save(projectOrder);
        claimForm.projectOrderId = projectOrder.id;

      }

      await queryRunner.manager.save(claimForm);

      await queryRunner.commitTransaction();
      
      return {
        userErrors: [],
        result: true,
        claimForm: claimForm,
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
