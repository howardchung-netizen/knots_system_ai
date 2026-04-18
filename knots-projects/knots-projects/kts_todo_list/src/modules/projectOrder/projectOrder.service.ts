import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ProjectOrderRepository } from './projectOrder.repository';
import { ProjectOrderArgs } from './args/projectOrder.args';
import { ProjectOrderConnection } from './connection/projectOrder.connection';
import { ProjectOrderUpdateInput } from './input/projectOrderUpdate.input';
import { Enforcer } from 'casbin';
import { ProjectOrderPayload } from './payload/projectOrder.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { ProjectOrderCreateInput } from './input/projectOrderCreate.input';
import { logger } from '../../lib/logger';
import { Brackets, getConnection } from 'typeorm';
import { ProjectRepository } from '../project/project.repository';
import { ProjectOrderDeleteInput } from './input/projectOrderDelete.input';
import { ProjectOrderDeletePayload } from './payload/projectOrderDelete.payload';
import { updateParentAccountBalance } from '../bookKeepingTransaction/bookKeepingTransaction.service';
import { BookKeepingTransactionItemRepository } from '../bookKeepingTransactionItem/bookKeepingTransactionItem.repository';
import { BookKeepingCompanyRepository } from '../bookKeepingCompany/bookKeepingCompany.repository';
import { ProjectOrderConfirmTransferInput } from './input/projectOrderConfirmTransfer.input';
import { ProjectOrderConfirmTransferPayload } from './payload/projectOrderConfirmTransfer.payload';
import { BookKeepingAccountRepository } from '../bookKeepingAccount/bookKeepingAccount.repository';
import { BookKeepingTransactionRepository } from '../bookKeepingTransaction/bookKeepingTransaction.repository';
import { ProjectOrderFile } from '../projectOrderFile/projectOrderFile.entity';
import { uploadToLocal } from '../../lib/storage';
import { ProjectOrderFileRepository } from '../projectOrderFile/projectOrderFile.repository';
import { ClaimFormRepository } from '../claimForm/claimForm.repository';

@Service()
export class ProjectOrderService {
  constructor(
    @InjectRepository()
    private readonly projectOrderRepository: ProjectOrderRepository,
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
    @InjectRepository()
    private readonly bookKeepingAccountRepository: BookKeepingAccountRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionRepository: BookKeepingTransactionRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionItemRepository: BookKeepingTransactionItemRepository,
    @InjectRepository()
    private readonly bookKeepingCompanyRepository: BookKeepingCompanyRepository,
    @InjectRepository()
    private readonly projectOrderFileRepository: ProjectOrderFileRepository,
    @InjectRepository()
    private readonly claimFormRepository: ClaimFormRepository,
  ) {
  }

  async getMany(args: ProjectOrderArgs, extraArgs: { [index: string]: any } = {}): Promise<ProjectOrderConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.projectOrderRepository
      .createQueryBuilder('project_info');
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.projectId) queryBuilder.andWhere('project_id = :projectId', { projectId: args.projectId });
    if (args.supplier) queryBuilder.andWhere('supplier = :supplier', { supplier: args.supplier });
    if (args.desc) queryBuilder.andWhere(`desc LIKE '%:desc%'`, { desc: args.desc });
    if (args.cheque) queryBuilder.andWhere('cheque = :cheque', { cheque: args.cheque });
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

    if (args.orderDateFrom || args.orderDateTo) {

      const orderDateFrom = args.orderDateFrom;
      const orderDateTo = args.orderDateTo;

      if (orderDateFrom && orderDateTo) {
        queryBuilder
          .andWhere("ordered_date >= :orderDateFrom", {
            orderDateFrom: orderDateFrom,
          })
          .andWhere("ordered_date <= :orderDateTo", {
            orderDateTo: orderDateTo,
          });
      }
      else if (orderDateFrom) {
        queryBuilder
          .andWhere("ordered_date >= :orderDateFrom", {
            orderDateFrom: orderDateFrom,
          })
      }
      else if (orderDateTo) {
        queryBuilder
          .andWhere("ordered_date <= :orderDateTo", {
            orderDateTo: orderDateTo,
          })
      }
    }

    if (args.deliveryDateFrom || args.deliveryDateTo) {

      const deliveryDateFrom = args.deliveryDateFrom;
      const deliveryDateTo = args.deliveryDateTo;

      if (deliveryDateFrom && deliveryDateTo) {
        queryBuilder
          .andWhere("delivery_date >= :deliveryDateFrom", {
            deliveryDateFrom: deliveryDateFrom,
          })
          .andWhere("delivery_date <= :deliveryDateTo", {
            deliveryDateTo: deliveryDateTo,
          });
      }
      else if (deliveryDateFrom) {
        queryBuilder
          .andWhere("delivery_date >= :deliveryDateFrom", {
            deliveryDateFrom: deliveryDateFrom,
          })
      }
      else if (deliveryDateTo) {
        queryBuilder
          .andWhere("delivery_date <= :deliveryDateTo", {
            deliveryDateTo: deliveryDateTo,
          })
      }
    }

    if (args.payment) queryBuilder.andWhere('payment = :payment', { payment: args.payment });

    if (args.delivery) queryBuilder.andWhere('delivery = :delivery', { delivery: args.delivery });

    if (args.keyword) {
      queryBuilder.andWhere(new Brackets(qb => {
          qb.where('project_id LIKE :keyword', { keyword: `%${args.keyword}%` })
            .orWhere('supplier LIKE :keyword', { keyword: `%${args.keyword}%` })
            .orWhere('cheque LIKE :keyword', { keyword: `%${args.keyword}%` })
            .orWhere('`desc` LIKE :keyword', { keyword: `%${args.keyword}%` })
        }))
    }

    let orderBy: { [key: string]: "DESC" | "ASC" } = {
      "id": 'DESC',
    };

    if (args.order && args.sort) {
       orderBy = {
        [args.sort]: args.order as "DESC" | "ASC",
      };
    }

    queryBuilder.skip(offset).take(limit).orderBy({
      ...orderBy
    });

    const [projectOrders, projectOrderCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(projectOrders, args, {
        arrayLength: projectOrderCount,
        sliceStart: offset || 0,
      }),
      totalCount: projectOrderCount,
    };
  }

  async create(
    data: ProjectOrderCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectOrderPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const projectOrder = this.projectOrderRepository.create();

      const project = await this.projectRepository.findOneOrFail({
        projectId: data.projectId,
      });
      projectOrder.projectId = String(project.projectId);
      projectOrder.supplier = data.supplier;
      projectOrder.amount = data.amount;
      if (data.desc) projectOrder.desc = data.desc;
      if (data.orderedDate) projectOrder.orderedDate = data.orderedDate;
      if (data.deliveryDate) projectOrder.deliveryDate = data.deliveryDate;
      projectOrder.delivery = data.delivery;
      projectOrder.payment = data.payment;

      if (data.cheque) projectOrder.cheque = data.cheque;
      if (data.cash !== undefined) projectOrder.cash = data.cash;
      if (data.remark) projectOrder.remark = data.remark;

      projectOrder.createAt = Date.now();

      await queryRunner.manager.save(projectOrder);

      if (data.uploadFiles && data.uploadFiles.length) {
        await Promise.all(
          data.uploadFiles.map(async e => {
            const { path: filePath, mimeType: fileMimeType, type: fileType, filename: filename } = await uploadToLocal(await e, 'ClockInContactFile');
            const file = new ProjectOrderFile();
            file.filePath = filePath;
            file.fileMimeType = fileMimeType;
            file.projectOrderId = projectOrder?.id!;
            await queryRunner.manager.save(file);
          })
        )
      }

      await queryRunner.commitTransaction();

      return {
        projectOrder: await projectOrder.save(),
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
    data: ProjectOrderUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<ProjectOrderPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const projectOrder = await this.projectOrderRepository.findOneOrFail(fromGlobalId(data.id).id);
      if(projectOrder.settlement) throw new Error('This order has been settled, cannot be updated');
      if (data.projectId) {
        const project = await this.projectRepository.findOneOrFail({
          projectId: data.projectId,
        });
        projectOrder.projectId = String(project.projectId);
      }
      if (data.supplier) projectOrder.supplier = data.supplier;
      if (data.amount) projectOrder.amount = data.amount;
      if (data.desc) projectOrder.desc = data.desc;
      if (data.orderedDate) projectOrder.orderedDate = data.orderedDate;
      if (data.deliveryDate) projectOrder.deliveryDate = data.deliveryDate;
      if (data.delivery !== undefined) projectOrder.delivery = data.delivery;
      if (data.payment !== undefined) projectOrder.payment = data.payment;
      if (data.cheque) projectOrder.cheque = data.cheque;
      if (data.cash !== undefined) projectOrder.cash = data.cash;
      if (data.remark) projectOrder.remark = data.remark;

      projectOrder.editAt = Date.now();

      if (data.uploadFiles && data.uploadFiles.length) {
        await Promise.all(
          data.uploadFiles.map(async e => {
            const { path: filePath, mimeType: fileMimeType, type: fileType, filename: filename } = await uploadToLocal(await e, 'ClockInContactFile');
            const file = new ProjectOrderFile();
            file.filePath = filePath;
            file.fileMimeType = fileMimeType;
            file.projectOrderId = projectOrder?.id!;
            await queryRunner.manager.save(file);
          })
        )
      }

      if (data.deleteFiles && data.deleteFiles.length) {
        await Promise.all(
          data.deleteFiles.map(async e => {
            const file = await this.projectOrderFileRepository.findOneOrFail(fromGlobalId(e).id);
            file.deleted = true;
            await queryRunner.manager.save(file);
          })
        )
      }

      await queryRunner.commitTransaction();

      return {
        projectOrder: await projectOrder.save(),
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
    }
    finally {
      await queryRunner.release();
    }
  }

  async delete(
    data: ProjectOrderDeleteInput,
    user: LoggedInUser,
  ): Promise<ProjectOrderDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const projectOrder = await this.projectOrderRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        deleted: false,
      });
      projectOrder.deleted = true;
      await queryRunner.manager.save(projectOrder);

      if (projectOrder.settlement) {
        const categoryAccount = await projectOrder.categoryAccount!;
        const bankAccount = await projectOrder.bankAccount!;
        categoryAccount.balance = Number(categoryAccount.balance) - Number(projectOrder.amount);
        bankAccount.balance = Number(bankAccount.balance) + Number(projectOrder.amount);
        await queryRunner.manager.save(categoryAccount);
        await queryRunner.manager.save(bankAccount);
        //update those staff petty cash account and category account of parent account balance
        if(categoryAccount.parentAccountId) {
          const amount = -Number(projectOrder.amount);
          await updateParentAccountBalance(categoryAccount.parentAccountId, amount, queryRunner);
        }
        if(bankAccount.parentAccountId) {
          const amount = Number(projectOrder.amount);
          await updateParentAccountBalance(bankAccount.parentAccountId, amount, queryRunner);
        }
        const transaction = await projectOrder.transaction!;
        transaction.deleted = true;
        await queryRunner.manager.save(transaction);
        const transactionItems = await this.bookKeepingTransactionItemRepository.find({ transactionId: transaction.id });
        for (const transactionItem of transactionItems) {
          transactionItem.deleted = true;
          await queryRunner.manager.save(transactionItem);
        }

        if(projectOrder.claimFormId) {
          const claimForm = await this.claimFormRepository.findOneOrFail({
            id: projectOrder.claimFormId
          });
          claimForm.deleted = true;
          await queryRunner.manager.save(claimForm);
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
    data: ProjectOrderConfirmTransferInput,
  ): Promise<ProjectOrderConfirmTransferPayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const projectOrder = await this.projectOrderRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        settlement: false,
        deleted: false,
      });

      projectOrder.settlement = true;

      let categoryAccount = await projectOrder.categoryAccount;
      if (!categoryAccount && !data.categoryAccountId) throw new Error('Category account and bank account not found');
      if (data.categoryAccountId) {
        categoryAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.categoryAccountId).id);
        projectOrder.categoryAccountId = categoryAccount.id;
      }
      
      categoryAccount!.balance = Number(categoryAccount!.balance) + Number(projectOrder.amount);
      await queryRunner.manager.save(categoryAccount);
      
      if(categoryAccount!.parentAccountId) {
        const amount = Number(projectOrder.amount);
        await updateParentAccountBalance(categoryAccount!.parentAccountId, amount, queryRunner);
      }

      let bankAccount = await projectOrder.bankAccount;
      if (!bankAccount && !data.bankAccountId) throw new Error('Category account and bank account not found');
      if (data.bankAccountId) {
        bankAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.bankAccountId).id);
        projectOrder.bankAccountId = bankAccount.id;
      }

      bankAccount!.balance = Number(bankAccount!.balance) - Number(projectOrder.amount);
      await queryRunner.manager.save(bankAccount);

      if(bankAccount!.parentAccountId) {
        const amount = -Number(projectOrder.amount);
        await updateParentAccountBalance(bankAccount!.parentAccountId, amount, queryRunner);
      }
      
      const bookKeepingTransaction = this.bookKeepingTransactionRepository.create();
      const company = await this.bookKeepingCompanyRepository.findOneOrFail(fromGlobalId(data.companyId).id);
      bookKeepingTransaction.companyId = company.id;
      bookKeepingTransaction.transactionDate = data.transactionDate;
      bookKeepingTransaction.financialYearStart = data.financialYearStart;
      bookKeepingTransaction.financialYearEnd = data.financialYearEnd;
      bookKeepingTransaction.orderId = projectOrder.id;

      await queryRunner.manager.save(bookKeepingTransaction);

      const bookKeepingTransactionItem1 = this.bookKeepingTransactionItemRepository.create();
      bookKeepingTransactionItem1.accountId = fromGlobalId(data.bankAccountId).id;
      bookKeepingTransactionItem1.amount = -projectOrder.amount;
      bookKeepingTransactionItem1.isDebit = false;
      bookKeepingTransactionItem1.desc = data.transactionDesc || '';
      bookKeepingTransactionItem1.transactionId = bookKeepingTransaction.id;

      const bookKeepingTransactionItem2 = this.bookKeepingTransactionItemRepository.create();
      bookKeepingTransactionItem2.accountId = categoryAccount!.id;
      bookKeepingTransactionItem2.amount = projectOrder.amount;
      bookKeepingTransactionItem2.isDebit = true;
      bookKeepingTransactionItem2.desc = data.transactionDesc || '';
      bookKeepingTransactionItem2.transactionId = bookKeepingTransaction.id;

      await queryRunner.manager.save(bookKeepingTransactionItem1);
      await queryRunner.manager.save(bookKeepingTransactionItem2);

      projectOrder.transactionId = bookKeepingTransaction.id;

      await queryRunner.manager.save(projectOrder);

      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        result: true,
        projectOrder: projectOrder,
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
