import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ProjectInvoiceRepository } from './projectInvoice.repository';
import { ProjectInvoiceArgs } from './args/projectInvoice.args';
import { ProjectInvoiceConnection } from './connection/projectInvoice.connection';
import { ProjectInvoiceUpdateInput } from './input/projectInvoiceUpdate.input';
import { Enforcer } from 'casbin';
import { ProjectInvoicePayload } from './payload/projectInvoice.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { ProjectInvoiceCreateInput } from './input/projectInvoiceCreate.input';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { ProjectRepository } from '../project/project.repository';
import moment from 'moment-timezone';
import { ClientRepository } from '../client/client.repository';
import { ClientContactsRepository } from '../clientContacts/clientContacts.repository';
import { QuotationRepository } from '../quotation/quotation.repository';
import { ProjectInvoiceDeleteInput } from './input/projectInvoiceDelete.input';
import { ProjectInvoiceConfirmTransferInput } from './input/projectInvoiceConfirmTransfer.input';
import { ProjectInvoiceConfirmTransferPayload } from './payload/projectInvoiceConfirmTransfer.payload';
import { BookKeepingAccountRepository } from '../bookKeepingAccount/bookKeepingAccount.repository';
import { BookKeepingTransactionRepository } from '../bookKeepingTransaction/bookKeepingTransaction.repository';
import { BookKeepingTransactionItemRepository } from '../bookKeepingTransactionItem/bookKeepingTransactionItem.repository';
import { BookKeepingCompanyRepository } from '../bookKeepingCompany/bookKeepingCompany.repository';
import { updateParentAccountBalance } from '../bookKeepingTransaction/bookKeepingTransaction.service';

@Service()
export class ProjectInvoiceService {
  constructor(
    @InjectRepository()
    private readonly projectInvoiceRepository: ProjectInvoiceRepository,
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
    @InjectRepository()
    private readonly clientRepository: ClientRepository,
    @InjectRepository()
    private readonly clientContactRepository: ClientContactsRepository,
    @InjectRepository()
    private readonly quotationRepository: QuotationRepository,
    @InjectRepository()
    private readonly bookKeepingAccountRepository: BookKeepingAccountRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionRepository: BookKeepingTransactionRepository,
    @InjectRepository()
    private readonly bookKeepingTransactionItemRepository: BookKeepingTransactionItemRepository,
    @InjectRepository()
    private readonly bookKeepingCompanyRepository: BookKeepingCompanyRepository,
  ) {
  }

  async getMany(args: ProjectInvoiceArgs, extraArgs: { [index: string]: any } = {}): Promise<ProjectInvoiceConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.projectInvoiceRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.invId) queryBuilder.andWhere('inv_id = :invId', { invId: args.invId });
    if (args.projectId) queryBuilder.andWhere('project_id = :projectId', { projectId: args.projectId });
    if (args.project) queryBuilder.andWhere('project = :project', { project: args.project });
    if (args.worksOrder) queryBuilder.andWhere(`worksOrder LIKE '%:worksOrder%'`, { worksOrder: args.worksOrder });
    if (args.status !== undefined) queryBuilder.andWhere('status = :status', { status: args.status });
    if (args.settlement !== undefined) queryBuilder.andWhere('settlement = :settlement', { settlement: args.settlement });
    if (args.paidStart && args.paidEnd) {
      queryBuilder
        .andWhere('paid >= :paidStart', { paidStart: args.paidStart })
        .andWhere('paid <= :paidEnd', { paidEnd: args.paidEnd });
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
    
    if(args.deleted === false) { 
      queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    }
    
    queryBuilder.skip(offset).take(limit);
    const [projectInvoices, projectInvoiceCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(projectInvoices, args, {
        arrayLength: projectInvoiceCount,
        sliceStart: offset || 0,
      }),
      totalCount: projectInvoiceCount,
    };
  }

  async create(
    data: ProjectInvoiceCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectInvoicePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const projectInvoice = this.projectInvoiceRepository.create();

      projectInvoice.date = moment(data.date, 'YYYY-MM-DD').format('YYYY-MM-DD');

      const yearCase = (await this.projectInvoiceRepository.count({ financialYear: data.financialYearStart })) || 0 + 1;
      projectInvoice.yearCase = yearCase;
      projectInvoice.financialYear = data.financialYearStart;
      projectInvoice.invId = `INV${data.financialYearStart}${String(projectInvoice.yearCase).padStart(4, '0')}`;

      projectInvoice.financialYearStart = data.financialYearStart;
      projectInvoice.financialYearEnd = data.financialYearEnd;
      if (data.projectId) {
        const project = await this.projectRepository.findOneOrFail({
          projectId: Number(data.projectId),
        });
        projectInvoice.projectId = String(project.projectId);
      }
      if (data.projectCode) projectInvoice.project = data.projectCode;
      if (data.worksOrder) projectInvoice.worksOrder = data.worksOrder;
      if (data.quotationCode && data.quotationForm) {
        let quotation = await this.quotationRepository.findOneOrFail({code: data.quotationCode, editAt: data.lastUpdateTime});
        quotation.form = JSON.stringify(data.quotationForm);
        quotation.editAt = Date.now();
        await queryRunner.manager.save(quotation);
        projectInvoice.quotationNo = data.quotationCode
      };
      if (data.remark) projectInvoice.remark = data.remark;

      if (data.remarks) projectInvoice.remarks = data.remarks;

      if (data.submitForm) projectInvoice.submitForm = moment(data.submitForm, 'YYYY-MM-DD').format('YYYY-MM-DD');
      if (data.signedForm) projectInvoice.signedForm = moment(data.signedForm, 'YYYY-MM-DD').format('YYYY-MM-DD');
      if (data.paid) projectInvoice.paid = moment(data.paid, 'YYYY-MM-DD').format('YYYY-MM-DD');
      if(data.clientId) {
        let client = await this.clientRepository.findOneOrFail({
          id: fromGlobalId(data.clientId).id,
        })
        projectInvoice.clientId = Number(client.id);
      }

      if(data.contactId) {
        let contact = await this.clientContactRepository.findOneOrFail({
          id: fromGlobalId(data.contactId).id,
        })
        projectInvoice.mainContacts_id = Number(contact.id);
      }

      projectInvoice.totalAmount = data.totalAmount;
      projectInvoice.discountRatio = data.discountRatio;
      projectInvoice.ratioDiscount = data.ratioDiscount;
      projectInvoice.discount = data.discount;
      projectInvoice.grandTotal = data.grandTotal;

      projectInvoice.invoice = JSON.stringify(updateInvoice(data.invoice));
      if(data.term) projectInvoice.term = data.term;

      projectInvoice.createAt = Date.now();

      await queryRunner.manager.save(projectInvoice);

      await queryRunner.commitTransaction();

      return {
        projectInvoice: await projectInvoice.save(),
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
    data: ProjectInvoiceUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<ProjectInvoicePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const projectInvoice = await this.projectInvoiceRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.date) projectInvoice.date = moment(data.date, 'YYYY-MM-DD').format('YYYY-MM-DD');

      projectInvoice.financialYearStart = data.financialYearStart;
      projectInvoice.financialYearEnd = data.financialYearEnd;
      if (data.projectId) {
        const project = await this.projectRepository.findOneOrFail({
          projectId: Number(data.projectId),
        });
        projectInvoice.projectId = String(project.projectId);
      }
      if (data.projectCode) projectInvoice.project = data.projectCode;
      if (data.worksOrder) projectInvoice.worksOrder = data.worksOrder;

      if (data.remark) projectInvoice.remark = data.remark;

      if (data.remarks) projectInvoice.remarks = data.remarks;

      if (data.submitForm) projectInvoice.submitForm = moment(data.submitForm, 'YYYY-MM-DD').format('YYYY-MM-DD');
      if (data.signedForm) projectInvoice.signedForm = moment(data.signedForm, 'YYYY-MM-DD').format('YYYY-MM-DD');
      if (data.paid) projectInvoice.paid = moment(data.paid, 'YYYY-MM-DD').format('YYYY-MM-DD');
      if(data.clientId) {
        let client = await this.clientRepository.findOneOrFail({
          id: fromGlobalId(data.clientId).id,
        })
        projectInvoice.clientId = Number(client.id);
      }

      if(data.contactId) {
        let contact = await this.clientContactRepository.findOneOrFail({
          id: fromGlobalId(data.contactId).id,
        })
        projectInvoice.mainContacts_id = Number(contact.id);
      }

      projectInvoice.totalAmount = data.totalAmount;
      projectInvoice.discountRatio = data.discountRatio;
      projectInvoice.ratioDiscount = data.ratioDiscount;
      projectInvoice.discount = data.discount;
      projectInvoice.grandTotal = data.grandTotal;

      if(data.term) projectInvoice.term = data.term;
      projectInvoice.editAt = Date.now();

      await queryRunner.manager.save(projectInvoice);

      await queryRunner.commitTransaction();

      return {
        projectInvoice: await projectInvoice.save(),
        userErrors: []
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      };
    } finally { 
      await queryRunner.release();
    }
  }

  async delete(
    data: ProjectInvoiceDeleteInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<ProjectInvoicePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const projectInvoice = await this.projectInvoiceRepository.findOneOrFail(fromGlobalId(data.id).id);
      const invoice = JSON.parse(projectInvoice.invoice??'[]');
      const invoiceObj = getInvoiceObj(invoice, {});

      if (projectInvoice.quotationNo) {
        let quotation = await this.quotationRepository.findOne({ code: projectInvoice.quotationNo });
        if (quotation && quotation.form) {

          let newForm = JSON.parse(quotation.form);
          let invoicese = await this.projectInvoiceRepository.find({ quotationNo: projectInvoice.quotationNo, deleted: false });
          invoicese = invoicese.filter(e=> e.id != projectInvoice.id ).map((e: any) => JSON.parse(e.invoice));
          removeItemFromInvoice(newForm, invoiceObj, invoicese);
         
          quotation.form = JSON.stringify(newForm);
          quotation.editAt = Date.now();
          await queryRunner.manager.save(quotation);
        }
      }

      projectInvoice.deleted = true;
      projectInvoice.editAt = Date.now();

      await queryRunner.manager.save(projectInvoice);

      const categoryAccount = await projectInvoice.categoryAccount!;
      if (categoryAccount) {
        const bankAccount = await projectInvoice.bankAccount!;
        categoryAccount.balance = Number(categoryAccount.balance) - Number(projectInvoice.grandTotal);
        bankAccount.balance = Number(bankAccount.balance) - Number(projectInvoice.grandTotal);
        await queryRunner.manager.save(categoryAccount);
        await queryRunner.manager.save(bankAccount);
        //update those categoryAccount and bankAccount of parent account balance
        if(categoryAccount.parentAccountId) {
          const amount = -Number(projectInvoice.grandTotal);
          await updateParentAccountBalance(categoryAccount.parentAccountId, amount, queryRunner);
        }
        if(bankAccount.parentAccountId) {
          const amount = -Number(projectInvoice.grandTotal);
          await updateParentAccountBalance(bankAccount.parentAccountId, amount, queryRunner);
        }
        const transaction = await projectInvoice.transaction!;
        transaction.deleted = true;
        await queryRunner.manager.save(transaction);
        const transactionItems = await this.bookKeepingTransactionItemRepository.find({ transactionId: transaction.id });
        for (const transactionItem of transactionItems) {
          transactionItem.deleted = true;
          await queryRunner.manager.save(transactionItem);
        }
      }

      await queryRunner.commitTransaction();

      return {
        projectInvoice: await projectInvoice.save(),
        userErrors: []
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      };
    } finally {
      await queryRunner.release();
    }
  }

  async confirmTransfer(
    data: ProjectInvoiceConfirmTransferInput,
  ): Promise<ProjectInvoiceConfirmTransferPayload>{

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const projectInvoice = await this.projectInvoiceRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
        settlement: false,
        deleted: false,
      });
      projectInvoice.settlement = true;
      projectInvoice.editAt = Date.now();
      projectInvoice.financialYearStart = data.financialYearStart;
      projectInvoice.financialYearEnd = data.financialYearEnd;
      projectInvoice.paid = data.paid;

      const categoryAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.categoryAccountId).id);
      projectInvoice.categoryAccountId = categoryAccount.id;
      categoryAccount.balance = Number(categoryAccount.balance) + Number(projectInvoice.grandTotal);
      await queryRunner.manager.save(categoryAccount);

      const bankAccount = await this.bookKeepingAccountRepository.findOneOrFail(fromGlobalId(data.bankAccountId).id);
      projectInvoice.bankAccountId = bankAccount.id;

      bankAccount.balance = Number(bankAccount.balance) + Number(projectInvoice.grandTotal);
      await queryRunner.manager.save(bankAccount);
      //update those categoryAccount and bankAccount of parent account balance
      if(categoryAccount.parentAccountId) {
        const amount = Number(projectInvoice.grandTotal);
        await updateParentAccountBalance(categoryAccount.parentAccountId, amount, queryRunner);
      }
      if(bankAccount.parentAccountId) {
        const amount = Number(projectInvoice.grandTotal);
        await updateParentAccountBalance(bankAccount.parentAccountId, amount, queryRunner);
      }

      const bookKeepingTransaction = this.bookKeepingTransactionRepository.create();
      const company = await this.bookKeepingCompanyRepository.findOneOrFail(fromGlobalId(data.companyId).id);
      bookKeepingTransaction.companyId = company.id;
      bookKeepingTransaction.transactionDate = data.transactionDate;
      bookKeepingTransaction.financialYearStart = data.financialYearStart;
      bookKeepingTransaction.financialYearEnd = data.financialYearEnd;
      bookKeepingTransaction.invoiceId = projectInvoice.id;

      await queryRunner.manager.save(bookKeepingTransaction);

      const bookKeepingTransactionItem1 = this.bookKeepingTransactionItemRepository.create();
      bookKeepingTransactionItem1.accountId = categoryAccount.id;
      bookKeepingTransactionItem1.amount = projectInvoice.grandTotal!;
      bookKeepingTransactionItem1.isDebit = false;
      bookKeepingTransactionItem1.desc = data.transactionDesc || '';
      bookKeepingTransactionItem1.transactionId = bookKeepingTransaction.id;

      const bookKeepingTransactionItem2 = this.bookKeepingTransactionItemRepository.create();
      bookKeepingTransactionItem2.accountId = bankAccount.id;
      bookKeepingTransactionItem2.amount = projectInvoice.grandTotal!;
      bookKeepingTransactionItem2.isDebit = true;
      bookKeepingTransactionItem2.desc = data.transactionDesc || '';
      bookKeepingTransactionItem2.transactionId = bookKeepingTransaction.id;

      await queryRunner.manager.save(bookKeepingTransactionItem1);
      await queryRunner.manager.save(bookKeepingTransactionItem2);

      projectInvoice.transactionId = bookKeepingTransaction.id;
      await queryRunner.manager.save(projectInvoice);

      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        result: true,
        projectInvoice: projectInvoice,
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

const updateFormItem = (quotationItem: any, invoice: any) => {
  invoice.forEach((invoiceItem: any) => {
     if(invoiceItem.id === quotationItem.id) {
      quotationItem.isInInvoice = invoiceItem.isInInvoice;
     }
     if(invoiceItem.child?.length) {
        invoiceItem.child.forEach((child: any) => {
          if(child.id === quotationItem.id) {
            quotationItem.isInInvoice = child.isInInvoice;
          }
        })
     }
  })
}

const updateInvoice = (invoice: any) => {
  invoice.forEach((item: any) => {
    if (item.child?.length) {
      item.child = item.child.filter((e: any) => e.isInInvoice === true);
    }
  })
  invoice = invoice.filter((e: any) => e.isInInvoice === true);
  return invoice;
}

const removeItemFromInvoice = (quotation: any, invoiceItem: any, invoicese: any) => {
  quotation.forEach((item: any) => {
    if(invoiceItem[item.id]) {
        item.isInInvoice = findIsInInvoicese(invoicese, item.id);
        item.isAllChildInInvoice = findIsAllChildInInvoice(invoicese, item.id);
        if(item.progress) {
          item.progressRecord = item.progressRecord.filter((e: any) => e != invoiceItem[item.id].progress);
          if(item.progressRecord.length) {
            item.progress = Math.max(...item.progressRecord);
          }
          else item.progress = 0;
        }
        else item.progress = 0;
        if(item.child?.length) {
          removeItemFromInvoice(item.child, invoiceItem, invoicese);
        }
    }
  })
  return
}

const getInvoiceObj = (invoice: any, temp: any) => {
  invoice.forEach((item: any) => {
    temp[item.id] = item;
    if(item.child?.length) {
      getInvoiceObj(item.child, temp);
    }
   
  })
  return temp;
}

const findIsInInvoicese = (invoicese: any, id: any): boolean => {
  for (const invoice of invoicese) {
    for (const item of invoice) {
      if (item.id === id) {
        return item.isInInvoice;
      } else if (item.child?.length) {
        const result = findChildIsInInvoice(item.child, id);
        if (result) {
          return result;
        }
      }
    }
  }
  return false;
}

const findChildIsInInvoice = (invoice: any, id: any): boolean => {
  for (const item of invoice) {
    if (item.id === id) {
      return item.isInInvoice;
    } else if (item.child?.length) {
      const result = findChildIsInInvoice(item.child, id);
      if (result) {
        return result;
      }
    }
  }
  return false;
}

const findIsAllChildInInvoice = (invoicese: any, id: any): boolean => {
  for (const invoice of invoicese) {
    for (const item of invoice) {
      if (item.id === id) {
        return item.isAllChildInInvoice;
      } else if (item.child?.length) {
        const result = findChildIsAllChildInInvoice(item.child, id);
        if (result) {
          return result;
        }
      }
    }
  }
  return false;
}

const findChildIsAllChildInInvoice = (invoice: any, id: any): boolean => {
  for (const item of invoice) {
    if (item.id === id) {
      return item.isAllChildInInvoice;
    } else if (item.child?.length) {
      const result = findChildIsInInvoice(item.child, id);
      if (result) {
        return result;
      }
    }
  }
  return false;
}
