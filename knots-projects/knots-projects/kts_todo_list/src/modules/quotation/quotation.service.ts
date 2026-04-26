import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Enforcer } from 'casbin';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { Brackets, In, getConnection } from 'typeorm';
import { QuotationRepository } from './quotation.repository';
import { QuotationArgs } from './args/quotation.args';
import { QuotationConnection } from './connection/quotation.connection';
import { QuotationCreateInput, QuotationPrice } from './input/quotationCreate.input';
import { QuotationPayload } from './payload/quotation.payload';
import { QuotationUpdateInput } from './input/quotationUpdate.input';
import { ProjectRepository } from '../project/project.repository';
import { QuotationStatusRepository } from '../quotationStatus/quotationStatus.repository';
import { ClientRepository } from '../client/client.repository';
import moment from 'moment-timezone';
import { ProjectItemRepository } from '../projectItem/projectItem.repository';
import { ProjectItem } from '../projectItem/projectItem.entity';
import { QuotationBudgetUpdateInput } from './input/quotationBudgetUpdate.input';
import { QuotationImportItemInput } from './input/quotationItemImport.input';
import { QuotationUpdateItemInput } from './input/quotationItemUpdate.input';
import { QuotationImportTermInput } from './input/quotationTermImport.input';
import { Terms } from '../terms/terms.entity';
import { TermsRepository } from '../terms/terms.repository';
import { ClientContactsRepository } from '../clientContacts/clientContacts.repository';
import { QuotationUpdateTermInput } from './input/quotationTermUpdate.input';
import { QuotationMarkupUpdateInput } from './input/quotationMarkupUpdate.input';
import { MeasurementRepository } from '../measurement/measurement.repository';
import { uuid } from 'uuidv4';
import { QuotationUploadFileInput } from './input/quotationUploadFile.input';
import { uploadToLocal } from '../../lib/storage';
import { QuotationFile } from '../quotationFile_/quotationFile.entity';
import { QuotationDuplicateInput } from './input/quotationDuplicate.input';

@Service()
export class QuotationService {
  constructor(
    @InjectRepository()
    private readonly quotationRepository: QuotationRepository,
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
    @InjectRepository()
    private readonly projectItemRepository: ProjectItemRepository,
    @InjectRepository()
    private readonly termsRepository: TermsRepository,
    @InjectRepository()
    private readonly quotationStatusRepository: QuotationStatusRepository,
    @InjectRepository()
    private readonly clientRepository: ClientRepository,
    @InjectRepository()
    private readonly clientContactRepository: ClientContactsRepository,
    @InjectRepository()
    private readonly measurementRepository: MeasurementRepository,
  ) {
  }

  async getMany(args: QuotationArgs, extraArgs: { [index: string]: any } = {}): Promise<QuotationConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.quotationRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.code) queryBuilder.andWhere(`code LIKE '%:code%'`, { code: args.code });
    if (args.year) queryBuilder.andWhere('year = :year', { year: args.year });
    if (args.month) queryBuilder.andWhere('month = :month', { month: args.month });
    if (args.projectId) queryBuilder.andWhere(`project_id LIKE :projectId`, { projectId: args.projectId });
    if (args.clientId) queryBuilder.andWhere(`client_id = :clientId`, { clientId: fromGlobalId(args.clientId).id });
    if (args.clientPrefix) queryBuilder.andWhere(`client_prefix LIKE '%:clientPrefix%'`, { clientPrefix: args.clientPrefix });
    if (args.status !== undefined) queryBuilder.andWhere('status = :status', { status: args.status });
    if (args.currency !== undefined) queryBuilder.andWhere('currency = :currency', { currency: args.currency });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });

    if (args.progressArray && args.progressArray.length > 0) {
      let progressArray = args.progressArray.map(e=> parseFloat(fromGlobalId(e.toString()).id));
      queryBuilder.andWhere('progress IN (:...progressArray)', { progressArray: progressArray });
    }

    if(args.clientIds && args.clientIds.length > 0){
      queryBuilder.andWhere('client_id IN (:...clientIds)', { clientIds: args.clientIds.map(e=> fromGlobalId(e).id) });
    }

    if (args.keyword) {
      queryBuilder.andWhere(new Brackets(qb => {
          qb.where('code LIKE :keyword', { keyword: `%${args.keyword}%` })
            .orWhere('project_id LIKE :keyword', { keyword: `%${args.keyword}%` })
        }))
    }

    queryBuilder.skip(offset).take(limit).orderBy({
      'createAt': 'DESC'
    });
    const [quotations, quotationCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(quotations, args, {
        arrayLength: quotationCount,
        sliceStart: offset || 0,
      }),
      totalCount: quotationCount,
    };
  }

  async create(
    data: QuotationCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<QuotationPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const quotation = this.quotationRepository.create();

      if (data.projectId) {
        const project = await this.projectRepository.findOne({
          projectId: parseInt(data.projectId),
        });
        if (!project) throw new Error('Project id invlid');
        quotation.projectId = data.projectId;
      }
      // if (data.projectId) {
      //   const project = await this.projectRepository.findOne({
      //     projectId: parseInt(data.projectId),
      //   });
      //   if (!project) throw new Error('Project id invlid');
      //   quotation.projectId = data.projectId;
      //   const lastProjectQuotation = await this.quotationRepository.findOne({
      //     where: {
      //       projectId: parseInt(data.projectId),
      //     },
      //     order: {
      //       quoteId: 'DESC',
      //     },
      //   });
      //   if (lastProjectQuotation) {
      //     quotation.quoteId = String(lastProjectQuotation.quoteId! + 1);
      //   } else {
      //     quotation.quoteId = String(1);
      //   }
      //   quotation.code = `Q${project.code}-${(quotation.quoteId!).padStart(3, '0')}`;
      // }
      // else {


      //   const today = new Date();
      //   const year = today.getFullYear();
      //   // 找到今年最大的订单号
      //   const maxRecord = await this.quotationRepository
      //     .createQueryBuilder('entity')
      //     .select('code', 'maxValue')
      //     .where(`code LIKE :orderCode`, { orderCode: `Q${year}%` })
      //     .orderBy('code', 'DESC')
      //     .getRawOne();

      //   const currentYearOrderCount = maxRecord
      //     ? parseInt(maxRecord.maxValue.substring(5, 9))
      //     : 0;

      //   // 计算下一个订单数量
      //   const nextOrderCount = currentYearOrderCount + 1;

      //   // 格式化订单数量部分，确保总长度为4位
      //   const formattedOrderCount = nextOrderCount.toString().padStart(4, '0');

      //   // 构建下一个订单号
      //   const nextValue = `Q${year}${formattedOrderCount}-001`;
      //   quotation.code = nextValue;
      // }

      //new code generate
      const client = await this.clientRepository.findOne({
        where: { id: fromGlobalId(data.clientId).id },
      });
      if (!client) throw new Error('Client not found');

      if (!client.prefix) {
        throw new Error('Client prefix is missing or invalid');
      }

      const today = new Date();
      const year: number = today.getFullYear();
      const month: number = today.getMonth() + 1;
      const paddedMonth = month.toString().padStart(2, '0');
      const yymm = `${year.toString().slice(-2)}${paddedMonth}`;

      // Find the max sequence number for this client prefix and year
      const maxRecord = await this.quotationRepository
        .createQueryBuilder('quotation')
        .select('MAX(quotation.sequence_number)', 'maxSequenceNumber')
        .where('quotation.client_prefix = :prefix', { prefix: client.prefix })
        .andWhere('quotation.year = :year', { year: year })
        .andWhere('quotation.month = :month', { month: month })
        .getRawOne();

      const sequenceNumber = maxRecord && maxRecord.maxSequenceNumber ? parseInt(maxRecord.maxSequenceNumber) + 1 : 1;

      const paddedSequenceNumber = sequenceNumber.toString().padStart(2, '0');

      // Generate the new code
      quotation.code = `Q-${client.prefix}-1${yymm}-${paddedSequenceNumber}^${data.title}`;

      // Update quotation fields
      quotation.clientId = Number(client.id);
      quotation.clientPrefix = client.prefix!;
      quotation.year = year;
      quotation.month = month;
      quotation.sequenceNumber = sequenceNumber;

      quotation.title = data.title;
      if (data.status) quotation.status = data.status;
      if (data.quotationStatusId) {
        const quotationStatus = await this.quotationStatusRepository.findOne({
          id: fromGlobalId(data.quotationStatusId).id,
        });
        if (!quotationStatus) throw new Error('Progress id invalid');
        quotation.progressId = Number(quotationStatus.id);
      }

      if (data.contactId) {
        const contact = await this.clientContactRepository.findOne({
          id: fromGlobalId(data.contactId).id,
        });
        if (!contact) throw new Error('Client id invalid');
        quotation.mainContacts_id = Number(contact.id);
      }

      quotation.sendFrom = user.username;

      if (data.sendTo) quotation.sendTo = data.sendTo;
      if (data.attn) quotation.attn = data.attn;
      if (data.email) quotation.email = data.email;
      if (data.address) quotation.address = data.address;
      if (data.date) quotation.date = moment(data.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
      if (data.remark) quotation.remark = data.remark;
      if (data.cmsRemark) quotation.cmsRemark = data.cmsRemark;

      if (data.totalAmount) quotation.totalAmount = data.totalAmount;
      if (data.discountRatio) quotation.discountRatio = data.discountRatio;
      if (data.ratioDiscount) quotation.ratioDiscount = data.ratioDiscount;
      if (data.discount) quotation.discount = data.discount;
      if (data.grandTotal) quotation.grandTotal = data.grandTotal;

      if (data.templatePrices?.length) {
        const items = (await this.projectItemRepository.find({
          id: In(data.templatePrices.map(e => fromGlobalId(e.itemId).id)),
        }))?.reduce((a: { [index: string]: ProjectItem }, c: ProjectItem) => {
          if (c.id) a[c.id] = c;
          return a;
        }, {});
        if (data.templatePrices.length !== Object.keys(items)?.length) throw new Error('templatePrices invalid');
        let prices: quotationPriceData[] = [];
        let upper: number | null = null;
        data.templatePrices?.map((e, i) => {
          const id = fromGlobalId(e.itemId).id;
          const item = items[`${id}`];
          if ((!upper && (item.upper !== 0 || item.upper !== null)) || (upper && item.upper !== 0 && upper !== item.upper)) throw new Error('Need upper data');
          if (item.upper === 0) {
            prices.push({
              id: id,
              name_en: item.nameEn || '',
              name_cht: item.nameCht || '',
              desc_en: item.descEn || '',
              desc_cht: item.descCht || '',
              upper: item.upper || 0,
              sort: i + 1,
              ref: id,
              delete: 0,
              child: [],
              variant: String(Date.now()),
            });
          }
          else {
            if (!e.price)
            prices[prices.length - 1]?.child?.push({
              id: id,
              name_en: item.nameEn || '',
              name_cht: item.nameCht || '',
              desc_en: item.descEn || '',
              desc_cht: item.descCht || '',
              upper: item.upper || 0,
              sort: i + 1,
              ref: id,
              delete: 0,
              price: {
                id: '1',
                name_en: 'N/A',
                name_cht: 'N/A',
                value: String(e.price || 0),
                unit: item.unit || 0,
                unit_en: String(item.unitEn??''),
                unit_cht: String(item.unitCht??''),
                quantity: e.qty || 0,
                amount: String(e.amount || 0),
              },
              budget_max: "",
              budget: 0,
              budget_remark: "",
              variant: String(Date.now()),
            })
          }
        });
        quotation.form = prices.length ? JSON.stringify(prices) : undefined;
      }

      quotation.createAt = Date.now();

      await queryRunner.manager.save(quotation);

      await queryRunner.commitTransaction();

      return {
        quotation: await quotation.save(),
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
    data: QuotationUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<QuotationPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const quotation = await this.quotationRepository.findOneOrFail(fromGlobalId(data.id).id);

      // if (data.projectId) {
      //   const project = await this.projectRepository.findOne({
      //     id: fromGlobalId(data.projectId).id,
      //   });
      //   if (!project) throw new Error('Project id invlid');
      //   if (project.id !== quotation.projectId || quotation.projectId === null) {
      //     const lastProjectQuotation = await this.quotationRepository.findOne({
      //       where: {
      //         projectId: fromGlobalId(project.id).id,
      //       },
      //       order: {
      //         quoteId: 'DESC',
      //       },
      //     });
      //     if (lastProjectQuotation) {
      //       quotation.quoteId = String(lastProjectQuotation.quoteId! + 1);
      //     } else {
      //       quotation.quoteId = String(1);
      //     }
      //     quotation.code = `Q${project.code}-${(quotation.quoteId!).padStart(3, '0')}`;
      //     quotation.projectId = project.id;
      //   }
      // }
      if (data.title !==  undefined) quotation.title = data.title;
      if (data.status !== undefined) quotation.status = data.status;
      if (data.quotationStatusId) {
        const quotationStatus = await this.quotationStatusRepository.findOne({
          id: fromGlobalId(data.quotationStatusId).id,
        });
        if (!quotationStatus) throw new Error('Progress id invalid');
        quotation.progressId = Number(quotationStatus.id);
      }

      if (data.clientId) {
        const client = await this.clientRepository.findOne({
          where: { id: fromGlobalId(data.clientId).id },
        });
        if (!client) throw new Error('Client id invalid');
        if (!client.prefix) throw new Error('Client prefix is missing');

        // Check if the client has changed
        if (quotation.clientId !== Number(client.id)) {
          // Client has changed, generate new code
          const today = new Date();
          const year: number = today.getFullYear();
          const month: number = today.getMonth() + 1; // 1-12
          const paddedMonth = month.toString().padStart(2, '0');
          const yymm = `${year.toString().slice(-2)}${paddedMonth}`;

          // Find the max sequence number for this client prefix, year, and month
          const maxRecord = await this.quotationRepository
            .createQueryBuilder('quotation')
            .select('MAX(quotation.sequenceNumber)', 'maxSequenceNumber')
            .where('quotation.client_prefix = :prefix', { prefix: client.prefix })
            .andWhere('quotation.year = :year', { year })
            .andWhere('quotation.month = :month', { month })
            .getRawOne();

          const sequenceNumber: number = maxRecord && maxRecord.maxSequenceNumber ? parseInt(maxRecord.maxSequenceNumber) + 1 : 1;

          const paddedSequenceNumber = sequenceNumber.toString().padStart(2, '0');

          // Generate the new code
          quotation.code = `Q-${client.prefix}-1${yymm}-${paddedSequenceNumber}^${data.title || quotation.title || ''}`;

          // Update quotation fields
          quotation.clientPrefix = client.prefix;
          quotation.year = year;
          quotation.month = month;
          quotation.sequenceNumber = sequenceNumber;
        }

        // Update client-related fields
        quotation.clientId = Number(client.id);
        quotation.clientPrefix = client.prefix;
      }

      if (data.contactId) {
        const contact = await this.clientContactRepository.findOne({
          id: fromGlobalId(data.contactId).id,
        });
        if (!contact) throw new Error('Contac id invalid');
        quotation.mainContacts_id = Number(contact.id);
      }

      if (data.sendTo !== undefined) quotation.sendTo = data.sendTo;
      if (data.attn !== undefined) quotation.attn = data.attn;
      if (data.email !== undefined) quotation.email = data.email;
      if (data.address) quotation.address = data.address;
      if (data.date !== undefined) quotation.date = moment(data.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
      if (data.remark !== undefined) quotation.remark = data.remark;
      if (data.cmsRemark !== undefined) quotation.cmsRemark = data.cmsRemark;

      if (data.totalAmount !== undefined) quotation.totalAmount = data.totalAmount;
      if (data.discountRatio !== undefined) quotation.discountRatio = data.discountRatio;
      if (data.ratioDiscount !== undefined) quotation.ratioDiscount = data.ratioDiscount;
      if (data.discount !== undefined) quotation.discount = data.discount;
      if (data.grandTotal !== undefined) quotation.grandTotal = data.grandTotal;

      if (data.templatePrices?.length) {
        const items = (await this.projectItemRepository.find({
          id: In(data.templatePrices.map(e => fromGlobalId(e.itemId).id)),
        }))?.reduce((a: { [index: string]: ProjectItem }, c: ProjectItem) => {
          if (c.id) a[c.id] = c;
          return a;
        }, {});
        if (data.templatePrices.length !== Object.keys(items)?.length) throw new Error('templatePrices invalid');
        let prices: quotationPriceData[] = [];
        let upper: number | null = null;
        data.templatePrices?.map((e, i) => {
          const id = fromGlobalId(e.itemId).id;
          const item = items[`${id}`];
          if ((!upper && (item.upper !== 0 || item.upper !== null)) || (upper && item.upper !== 0 && upper !== item.upper)) throw new Error('Need upper data');
          if (item.upper === 0) {
            prices.push({
              id: id,
              name_en: item.nameEn || '',
              name_cht: item.nameCht || '',
              desc_en: item.descEn || '',
              desc_cht: item.descCht || '',
              upper: item.upper || 0,
              sort: i + 1,
              ref: id,
              delete: 0,
              child: [],
              variant: String(Date.now()),
            });
          }
          else {
            if (!e.price)
            prices[prices.length - 1]?.child?.push({
              id: id,
              name_en: item.nameEn || '',
              name_cht: item.nameCht || '',
              desc_en: item.descEn || '',
              desc_cht: item.descCht || '',
              upper: item.upper || 0,
              sort: i + 1,
              ref: id,
              delete: 0,
              price: {
                id: String((prices[prices.length - 1]?.child?.length || 0) + 1),
                name_en: 'N/A',
                name_cht: 'N/A',
                value: String(e.price || 0),
                unit: item.unit || 0,
                unit_en: String(item.unitEn),
                unit_cht: String(item.unitCht),
                quantity: e.qty || 0,
                amount: String(e.amount || 0),
              },
              budget_max: "",
              budget: 0,
              budget_remark: "",
              variant: String(Date.now()),
            })
          }
        });
        quotation.form = prices.length ? JSON.stringify(prices) : undefined;
      }

      quotation.editAt = Date.now();

      await queryRunner.manager.save(quotation);
      await queryRunner.commitTransaction();
      return {
        quotation: quotation,
        userErrors: []
      };
    } catch (error: any) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
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

  async clientUpdate(
    data: QuotationUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<QuotationPayload> {
    try {
      const quotation = await this.quotationRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.clientId) {
        const client = await this.clientRepository.findOne({
          where: { id: fromGlobalId(data.clientId).id },
        });
        if (!client) throw new Error('Client id invalid');
        if (!client.prefix) throw new Error('Client prefix is missing');

        // Check if the client has changed
        if (quotation.clientId !== Number(client.id)) {
          // Client has changed, generate new code
          const today = new Date();
          const year: number = today.getFullYear();
          const month: number = today.getMonth() + 1; // 1-12
          const paddedMonth = month.toString().padStart(2, '0');
          const yymm = `${year.toString().slice(-2)}${paddedMonth}`;

          // Find the max sequence number for this client prefix, year, and month
          const maxRecord = await this.quotationRepository
            .createQueryBuilder('quotation')
            .select('MAX(quotation.sequenceNumber)', 'maxSequenceNumber')
            .where('quotation.client_prefix = :prefix', { prefix: client.prefix })
            .andWhere('quotation.year = :year', { year })
            .andWhere('quotation.month = :month', { month })
            .getRawOne();

          const sequenceNumber: number = maxRecord && maxRecord.maxSequenceNumber ? parseInt(maxRecord.maxSequenceNumber) + 1 : 1;

          const paddedSequenceNumber = sequenceNumber.toString().padStart(2, '0');

          // Generate the new code
          quotation.code = `Q-${client.prefix}-1${yymm}-${paddedSequenceNumber}^${quotation.title}`;

          // Update quotation fields
          quotation.clientPrefix = client.prefix;
          quotation.year = year;
          quotation.month = month;
          quotation.sequenceNumber = sequenceNumber;
        }

        // Update client-related fields
        quotation.clientId = Number(client.id);
        quotation.clientPrefix = client.prefix;
      }

      if (data.contactId) {
        const contact = await this.clientContactRepository.findOne({
          id: fromGlobalId(data.contactId).id,
        });
        if (!contact) throw new Error('Contac id invalid');
        quotation.mainContacts_id = Number(contact.id);
      }
      else quotation.mainContacts_id = undefined;

      quotation.editAt = Date.now();

      return {
        quotation: await quotation.save(),
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

  async budgetUpdate(
    data: QuotationBudgetUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<QuotationPayload> {
    try {
      const quotation = await this.quotationRepository.findOne({
        id: fromGlobalId(data.id).id,
      });
      if (!quotation) throw new Error('Quotation id invalid');

      const quotationBudget = JSON.parse(quotation.form!);
      const dataBudget = data.budget;

      dataBudget.forEach((dataItem) => {
        const quotationChildItem = quotationBudget.flatMap((item: { child: any; }) => item.child).find((childItem: { id: string; }) => childItem.id === dataItem.itemId);

        if (quotationChildItem) {
          quotationChildItem.budget = dataItem.budget;
          quotationChildItem.budget_remark = dataItem.budgetRemark;
        }
      });

      quotation.form = JSON.stringify(quotationBudget);

      return {
        quotation: await quotation.save(),
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

  async importItem(
    data: QuotationImportItemInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<QuotationPayload> {
    try {
      const quotation = await this.quotationRepository.findOneOrFail(fromGlobalId(data.id).id);
      let form = quotation.form ? JSON.parse(quotation.form) : [];
      let inUsed = [String];
      if (data.form?.length) {
        let prices: any[] = [];
        let itemIds: string[] = [];

        const getFormData = async (importItems: QuotationPrice[], upperId: string): Promise<QuotationPrice[]> => {
          let _rowData: any = [];
          for (let impotItem of importItems) {
            let {
              itemId,
              itemNameCht,
              itemNameEn,
              itemDescCht,
              itemDescEn,
              unitId,
              price,
              qty,
              amount
            } = impotItem;
            itemIds.push(itemId);

            let unitItem = unitId ? await this.measurementRepository.findOne({
              id: fromGlobalId(unitId).id,
            }) : undefined;
            
            let _data = {
              id: uuid(),
              name_en: itemNameEn || '',
              name_cht: itemNameCht || '',
              desc_en: itemDescEn || '',
              desc_cht: itemDescCht || '',
              upper: upperId || '0',
              sort: 0,
              ref: itemId,
              delete: 0,
              price: {
                id: undefined,
                name_en: 'N/A',
                name_cht: 'N/A',
                value: price ? String(price || 0) : undefined,
                unit: unitItem ? unitItem.id : 0,
                unit_en: !unitItem || unitItem.nameEn?.includes("N/A") ? '' : (unitItem.nameEn ?? ''),
                unit_cht: !unitItem || unitItem.nameEn?.includes("N/A") ? '' : (unitItem.nameCht ?? ''),
                quantity: qty || undefined,
                amount: amount ?String(amount) : undefined,
              },
              budget_max: "",
              budget: 0,
              budget_remark: "",
              variant: String(Date.now()),
              child: []
            };

            if (impotItem.child?.length) {
              let _child: any = await getFormData(impotItem.child, _data.id);
              _data.child = _child;
            }
            _rowData.push(_data);
          }
          return _rowData;
        };

        const importFormData = async (importItems: QuotationPrice[], importId: String): Promise<QuotationPrice[]> => {
          let _rowData: any = [];
          for (let impotItem of importItems) {
            let {
              itemId,
              itemNameCht,
              itemNameEn,
              itemDescCht,
              itemDescEn,
              unitId,
              price,
              qty,
              amount
            } = impotItem;

            let unitItem = unitId ? await this.measurementRepository.findOne({
              id: fromGlobalId(unitId).id,
            }) : undefined;

            impotItem.upper = importId as string;
            itemIds.push(itemId);
            let _data = {
              id: uuid(),
              name_en: itemNameEn || '',
              name_cht: itemNameCht || '',
              desc_en: itemDescEn || '',
              desc_cht: itemDescCht || '',
              upper: impotItem.upper || '0',
              sort: 0,
              ref: itemId,
              delete: 0,
              price: {
                id: undefined,
                name_en: 'N/A',
                name_cht: 'N/A',
                value: price ? String(price || 0) : undefined,
                unit: unitItem ? unitItem.id : 0,
                unit_en: !unitItem || unitItem.nameEn?.includes("N/A") ? '' : String(unitItem.nameEn ?? ''),
                unit_cht: !unitItem || unitItem.nameEn?.includes("N/A") ? '' : String(unitItem.nameCht ?? ''),
                quantity: qty || undefined,
                amount: amount ?String(amount) : undefined,
              },
              budget_max: "",
              budget: 0,
              budget_remark: "",
              variant: String(Date.now()),
              child: []
            };

            if (impotItem.child?.length) {
              let _child: any = await importFormData(impotItem.child, importId);
              _data.child = _child;
            }
            _rowData.push(_data);
          }
          return _rowData;
        };

        const importSubItemToForm = (form: any[], importItems: QuotationPrice[]) => {
          for (let formItem of form) {
            if(data.importId !== formItem.id) continue;
            else {
              if((formItem as any).child)
              (formItem as any).child = (formItem as any).child.concat(importItems);
              else (formItem as any).child = importItems;
            }
          }
        };

        function mergeFormAndPrices(form: any[], prices: any[]): any[] {
          const newForm = [...form];
          for (const priceItem of prices) {
            const exists = form.some(formItem => formItem.ref === priceItem.ref);
            if (!exists) {
              newForm.push(priceItem);
            } else {
              const formItem = form.find(formItem => formItem.ref === priceItem.ref);
              if (formItem) {
                // Ensure child is always an array
                const newChild = mergeFormAndPrices(formItem.child || [], priceItem.child || []);
                formItem.child = newChild; // Update the formItem's child
              }
            }
          }
          return newForm;
        };

        let newForm = [];

        if(!data.importId) {
          if(data.importMode === 'add' || form.length === 0) {
            prices = await getFormData(data.form, '0');
            newForm = form.concat(prices)
          }
          else {
            prices = await getFormData(data.form, '0');
            newForm = mergeFormAndPrices(form, prices);
          }
        }
        else if(data.importId) {
          prices = await importFormData(data.form, data.importId);
          importSubItemToForm(form, prices)
          newForm = form;
        }

        let totalAmount = calculateTotalAmount(newForm);
        let ratioDiscount = calculateRatioDiscount(totalAmount, quotation.discountRatio||0);
        let grandTotal = calculateGrandTotal(totalAmount, ratioDiscount||0);

        let oldInUsed = quotation.inUsed ? quotation.inUsed?.split(',') : [];
        if(oldInUsed?.length) {
          quotation.inUsed = (oldInUsed.concat(itemIds.filter(e=> oldInUsed.indexOf(e) < 0)))?.join(',');
        }
        else quotation.inUsed = itemIds.join(',');

        quotation.totalAmount = totalAmount;
        quotation.ratioDiscount = ratioDiscount;
        quotation.grandTotal = grandTotal;
        quotation.form = JSON.stringify(newForm);
      }
      
      quotation.editAt = Date.now();

      return {
        quotation: await quotation.save(),
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

  async updateItem(
    data: QuotationUpdateItemInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<QuotationPayload> {
    try {
      const quotation = await this.quotationRepository.findOneOrFail(fromGlobalId(data.id).id);

      let form = data.form;
      let totalAmount = calculateTotalAmount(form);
      let ratioDiscount = calculateRatioDiscount(totalAmount, quotation.discountRatio || 0);
      let grandTotal = calculateGrandTotal(totalAmount, ratioDiscount || 0);
      quotation.totalAmount = totalAmount;
      quotation.ratioDiscount = ratioDiscount;
      quotation.grandTotal = grandTotal;
      quotation.form = JSON.stringify(form);

      quotation.editAt = Date.now();

      return {
        quotation: await quotation.save(),
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

  async importTemplate(
    data: QuotationImportItemInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<QuotationPayload> {
    try {
      const quotation = await this.quotationRepository.findOneOrFail(fromGlobalId(data.id).id);
      let form = quotation.form ? JSON.parse(quotation.form) : [];
      let inUsed = [String];
      if (data.form?.length) {
        let prices: any[] = [];
        let itemIds: string[] = [];

        const getFormData = async (importItems: QuotationPrice[], upperId: string): Promise<QuotationPrice[]> => {
          let _rowData: any = [];
          for (let impotItem of importItems) {
            let {
              itemId,
              itemNameCht,
              itemNameEn,
              itemDescCht,
              itemDescEn,
              unitId,
              price,
              qty,
              amount
            } = impotItem;
            itemIds.push(itemId);

            let unitItem = unitId ? await this.measurementRepository.findOne({
              id: fromGlobalId(unitId).id,
            }) : undefined;
            
            let _data = {
              id: uuid(),
              name_en: itemNameEn || '',
              name_cht: itemNameCht || '',
              desc_en: itemDescEn || '',
              desc_cht: itemDescCht || '',
              upper: upperId || '0',
              sort: 0,
              ref: itemId,
              delete: 0,
              price: {
                id: undefined,
                name_en: 'N/A',
                name_cht: 'N/A',
                value: price ? String(price || 0) : undefined,
                unit: unitItem ? unitItem.id : 0,
                unit_en: !unitItem || unitItem.nameEn?.includes("N/A") ? '' : (unitItem.nameEn ?? ''),
                unit_cht: !unitItem || unitItem.nameEn?.includes("N/A") ? '' : (unitItem.nameCht ?? ''),
                quantity: qty || undefined,
                amount: amount ?String(amount) : undefined,
              },
              budget_max: "",
              budget: 0,
              budget_remark: "",
              variant: String(Date.now()),
              child: []
            };

            if (impotItem.child?.length) {
              let _child: any = await getFormData(impotItem.child, _data.id);
              _data.child = _child;
            }
            _rowData.push(_data);
          }
          return _rowData;
        };

        const importFormData = async (importItems: QuotationPrice[], importId: string): Promise<QuotationPrice[]> => {
          let _rowData: any = [];
          for (let impotItem of importItems) {
            let {
              itemId,
              itemNameCht,
              itemNameEn,
              itemDescCht,
              itemDescEn,
              unitId,
              price,
              qty,
              amount
            } = impotItem;

            let unitItem = unitId ? await this.measurementRepository.findOne({
              id: fromGlobalId(unitId).id,
            }) : undefined;

            impotItem.upper = importId;
            itemIds.push(itemId);
            let _data = {
              id: uuid(),
              name_en: itemNameEn || '',
              name_cht: itemNameCht || '',
              desc_en: itemDescEn || '',
              desc_cht: itemDescCht || '',
              upper: impotItem.upper || 0,
              sort: 0,
              ref: itemId,
              delete: 0,
              price: {
                id: undefined,
                name_en: 'N/A',
                name_cht: 'N/A',
                value: price ? String(price || 0) : undefined,
                unit: unitItem ? unitItem.id : 0,
                unit_en: !unitItem || unitItem.nameEn?.includes("N/A") ? '' : String(unitItem.nameEn ?? ''),
                unit_cht: !unitItem || unitItem.nameEn?.includes("N/A") ? '' : String(unitItem.nameCht ?? ''),
                quantity: qty || undefined,
                amount: amount ?String(amount) : undefined,
              },
              budget_max: "",
              budget: 0,
              budget_remark: "",
              variant: String(Date.now()),
              child: []
            };

            if (impotItem.child?.length) {
              let _child: any = await importFormData(impotItem.child, importId);
              _data.child = _child;
            }
            _rowData.push(_data);
          }
          return _rowData;
        };

        const importSubItemToForm = (form: any[], importItems: QuotationPrice[]) => {
          for (let formItem of form) {
            if(data.importId !== formItem.id) continue;
            else {
              if((formItem as any).child)
              (formItem as any).child = (formItem as any).child.concat(importItems);
              else (formItem as any).child = importItems;
            }
          }
        };

        let newForm = [];

        if(!data.importId) {
          prices = await getFormData(data.form, '0');
          newForm = form.concat(prices)
        }
        else if(data.importId) {
          prices = await importFormData(data.form, data.importId);
          importSubItemToForm(form, prices)
          newForm = form;
        }

        let totalAmount = calculateTotalAmount(newForm);
        let ratioDiscount = calculateRatioDiscount(totalAmount, quotation.discountRatio||0);
        let grandTotal = calculateGrandTotal(totalAmount, ratioDiscount||0);

        let oldInUsed = quotation.inUsed ? quotation.inUsed?.split(',') : [];
        if(oldInUsed?.length) {
          quotation.inUsed = (oldInUsed.concat(itemIds.filter(e=> oldInUsed.indexOf(e) < 0)))?.join(',');
        }
        else quotation.inUsed = itemIds.join(',');

        quotation.totalAmount = totalAmount;
        quotation.ratioDiscount = ratioDiscount;
        quotation.grandTotal = grandTotal;
        quotation.form = JSON.stringify(newForm);
      }
      
      quotation.editAt = Date.now();

      return {
        quotation: await quotation.save(),
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

  async importTerm(
    data: QuotationImportTermInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<QuotationPayload> {
    try {
      const quotation = await this.quotationRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (data.termsIds?.length) {
        let terms: quotationTermData[] = [];
        const itemIds = data.termsIds?.map(e => fromGlobalId(e).id);
        const items = (await this.termsRepository.find({
          id: In(itemIds),
        }))?.reduce((a: { [index: string]: Terms }, c: Terms) => {
          if (c.id) a[c.id] = c;
          return a;
        }, {});
        if (Object.keys(itemIds).length !== data.termsIds.length) throw new Error('Prices invalid');
        data.termsIds?.map((e, i) => {
          const id = fromGlobalId(e).id;
          const item = items[`${id}`];
          terms.push({
            id: id,
            name_en: item.nameEn || '',
            name_cht: item.nameCht || '',
            desc_en: item.descEn || '',
            desc_cht: item.descCht || '',
            sort: item.sort || 0
          })
        });
        quotation.term = JSON.stringify(JSON.parse(quotation.term || '[]').concat(terms));
      }
      else quotation.term = JSON.stringify([]);

      quotation.editAt = Date.now();

      return {
        quotation: await quotation.save(),
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

  async updateTerm(
    data: QuotationUpdateTermInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<QuotationPayload> {
    try {
      const quotation = await this.quotationRepository.findOneOrFail(fromGlobalId(data.id).id);

      quotation.term = JSON.stringify(data.term);
      quotation.editAt = Date.now();

      return {
        quotation: await quotation.save(),
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

  async updateMark(
    data: QuotationMarkupUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<QuotationPayload> {
    try {
      const quotation = await this.quotationRepository.findOneOrFail(fromGlobalId(data.id).id);

      if(quotation.editAt != data.editAt) throw new Error('Data has been modified. please refresh and try again.');

      let form = data.form;
      let totalAmount = calculateTotalAmount(form);
      let ratioDiscount = calculateRatioDiscount(totalAmount, quotation.discountRatio || 0);
      let grandTotal = calculateGrandTotal(totalAmount, ratioDiscount || 0);
      quotation.totalAmount = totalAmount;
      quotation.ratioDiscount = ratioDiscount;
      quotation.grandTotal = grandTotal;
      quotation.form = JSON.stringify(form);
      // quotation.markup = data.markup;
      
      quotation.editAt = Date.now();

      return {
        quotation: await quotation.save(),
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

  async uploadFile(
    data: QuotationUploadFileInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<QuotationPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const quotation = await this.quotationRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (data.files && data.files.length) {
        await Promise.all(
          data.files.map(async e => {
            const { path: filePath, mimeType: fileMimeType, type: fileType, filename: filename } = await uploadToLocal(await e, 'quotationFile');
            const quotationFile = new QuotationFile();
            quotationFile.filePath = filePath;
            quotationFile.fileMimeType = fileMimeType;
            quotationFile.quotationId = quotation?.id!;
            await queryRunner.manager.save(quotationFile);
          })
        )
      }
      await queryRunner.commitTransaction(); 
      return {
        quotation: quotation,
        userErrors: []
      };
    } catch (error: any) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
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
  
  async duplicateQuotation(
    data: QuotationDuplicateInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<QuotationPayload> {
    try {
      // 查找原始報價單
      const originalQuotation = await this.quotationRepository.findOneOrFail(fromGlobalId(data.id).id);

      // 創建新報價單
      const newQuotation = this.quotationRepository.create();
      
      // 設置日期相關資訊
      const today = new Date();
      const year: number = originalQuotation.year || today.getFullYear();
      const month: number = originalQuotation.month || today.getMonth() + 1;
      const paddedMonth = month.toString().padStart(2, '0');
      const yymm = `${year.toString().slice(-2)}${paddedMonth}`;

      // 查找最大序列號
      const maxRecord = await this.quotationRepository
        .createQueryBuilder('quotation')
        .select('MAX(quotation.sequence_number)', 'maxSequenceNumber')
        .where('quotation.client_prefix = :prefix', { prefix: originalQuotation.clientPrefix })
        .andWhere('quotation.year = :year', { year: year })
        .andWhere('quotation.month = :month', { month: month })
        .getRawOne();

      const sequenceNumber = maxRecord && maxRecord.maxSequenceNumber ? parseInt(maxRecord.maxSequenceNumber) + 1 : 1;
      const paddedSequenceNumber = sequenceNumber.toString().padStart(2, '0');

      // 解析原始代碼以保留格式
      const codePrefix = originalQuotation.code?.split('-').slice(0, 3).join('-') || `Q-${originalQuotation.clientPrefix}-1${yymm}`;
      const codeSuffix = originalQuotation.code?.split('^')[1] || originalQuotation.title || '';
      
      // 生成新的代碼，只更改序列號部分
      const newCode = `${codePrefix}-${paddedSequenceNumber}^${codeSuffix}`;
      
      // 複製基本資訊
      newQuotation.code = newCode;
      newQuotation.year = year;
      newQuotation.month = month;
      newQuotation.sequenceNumber = sequenceNumber;
      newQuotation.clientPrefix = originalQuotation.clientPrefix;
      newQuotation.clientId = originalQuotation.clientId;
      newQuotation.title = `${originalQuotation.title?.replace(`(${(parseInt(paddedSequenceNumber)-1).toString().padStart(2, '0')})`, '')} (${paddedSequenceNumber})`;
      newQuotation.projectId = originalQuotation.projectId;
      newQuotation.status = originalQuotation.status;
      newQuotation.progressId = originalQuotation.progressId;
      newQuotation.mainContacts_id = originalQuotation.mainContacts_id;
      
      // 複製聯絡資訊
      newQuotation.sendFrom = user.username;
      newQuotation.sendTo = originalQuotation.sendTo;
      newQuotation.attn = originalQuotation.attn;
      newQuotation.email = originalQuotation.email;
      newQuotation.address = originalQuotation.address;
      newQuotation.date = moment(today).format('YYYY-MM-DD');
      
      // 複製報價單內容
      newQuotation.form = originalQuotation.form;
      newQuotation.term = originalQuotation.term;
      newQuotation.remark = originalQuotation.remark;
      newQuotation.cmsRemark = originalQuotation.cmsRemark;
      
      // 複製價格相關資訊
      newQuotation.markup = originalQuotation.markup;
      newQuotation.totalAmount = originalQuotation.totalAmount;
      newQuotation.discountRatio = originalQuotation.discountRatio;
      newQuotation.ratioDiscount = originalQuotation.ratioDiscount;
      newQuotation.discount = originalQuotation.discount;
      newQuotation.grandTotal = originalQuotation.grandTotal;
      newQuotation.currency = originalQuotation.currency;
      newQuotation.currencyId = originalQuotation.currencyId;
      
      // 複製其他資訊
      newQuotation.inUsed = originalQuotation.inUsed;
      newQuotation.companyInfo = originalQuotation.companyInfo;
      
      // 設置時間戳
      newQuotation.createAt = Date.now();
      newQuotation.editAt = Date.now();
      
      // 保存新報價單
      await this.quotationRepository.save(newQuotation);
      
      return {
        quotation: newQuotation,
        userErrors: []
      };
    } catch (error: any) {
      logger.error(`duplicate quotation failed: ${error.message}`);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      };
    }
  }
}
interface quotationPriceData {
  id: string,
  name_en: string,
  name_cht: string,
  desc_en: string,
  desc_cht: string,
  upper: number,
  sort: number,
  ref: string,
  delete: number,
  variant: string,
  isInInvoice?: boolean | undefined,
  child?: quotationPriceDataChild[],
}

interface quotationPriceDataChild {
  id: string,
  name_en: string,
  name_cht: string,
  desc_en: string,
  desc_cht: string,
  upper: number,
  sort: number,
  ref: string,
  delete: number,
  budget_max: string,
  budget: number,
  budget_remark: string,
  price?: quotationPriceDataChildPrice,
  variant: string,
  isInInvoice?: boolean | undefined,
}

interface quotationPriceDataChildPrice {
  id: string,
  name_en: string,
  name_cht: string,
  value: string,
  unit: number,
  unit_en: string,
  unit_cht: string,
  amount: string,
  quantity: number,
}

interface quotationTermData {
  id: string,
  name_en: string,
  name_cht: string,
  desc_en: string,
  desc_cht: string,
  sort: number,
}

function calculateTotalAmount(items: [any]) {
  let totalAmount = 0;
  for (const item of items) {
    if (item.child !==undefined && item.child?.length > 0) {
      totalAmount += calculateTotalAmount(item.child);
    }

    if (item.price) {
      totalAmount += parseFloat(item.price.value??0) * parseFloat( item.price.quantity??0);
    }
  }

  return totalAmount
}

function calculateRatioDiscount (totalAmount: number, discountRatio: number) { 
  return totalAmount - (totalAmount * (1 - (discountRatio / 100)));
}

function calculateGrandTotal(totalAmount: number, ratioDiscount: number) { 
  return totalAmount - ratioDiscount;
}

const getMarkupForm = (form: [any], markUp: number) => {
  let f: any[] = [];
  form.forEach((item: any) => {
    let child = [];
    let newItem = {...item};
    if(newItem?.price?.value) {
      let newUnitPrice, newTotalAmount;
      newUnitPrice = item.price.value * (markUp / 100 + 1);
      newTotalAmount = newUnitPrice * item.price.quantity;
      if(newUnitPrice && newUnitPrice != newItem.price.value) {
        newItem.price.newUnitPrice = newUnitPrice;
      }
      if(newTotalAmount && newTotalAmount != newItem.price.ammount) {
        newItem.price.newTotalAmount = newTotalAmount;
      }
    }
    if(item?.child?.length) child = getMarkupForm(item.child, markUp);
    newItem.child = child;
    f.push(newItem);
  })
  return f
}