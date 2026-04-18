import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { QuotationTemplateRepository } from './quotationTemplate.repository';
import { QuotationTemplateArgs } from './args/quotationTemplate.args';
import { QuotationTemplateConnection } from './connection/quotationTemplate.connection';
import { QuotationTemplateUpdateInput } from './input/quotationTemplateUpdate.input';
import { Enforcer } from 'casbin';
import { QuotationTemplatePayload } from './payload/quotationTemplate.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { QuotationTemplateCreateInput } from './input/quotationTemplateCreate.input';
import { logger } from '../../lib/logger';
import { Brackets, getConnection } from 'typeorm';
import { uuid } from 'uuidv4';
import { QuotationTemplateImportItemInput } from './input/quotationTemplateImportItem.input';
import { QuotationTemplateUpdateItemInput } from './input/quotationTemplateUpdateItem.input';
import moment from 'moment-timezone';
import { QuotationPrice } from '../quotation/input/quotationCreate.input';
import { MeasurementRepository } from '../measurement/measurement.repository';

@Service()
export class QuotationTemplateService {
  constructor(
    @InjectRepository()
    private readonly quotationTemplateRepository: QuotationTemplateRepository,
    @InjectRepository()
    private readonly measurementRepository: MeasurementRepository,
  ) {
  }

  async getMany(args: QuotationTemplateArgs, extraArgs: { [index: string]: any } = {}): Promise<QuotationTemplateConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.quotationTemplateRepository
      .createQueryBuilder('project_info');
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.code) queryBuilder.andWhere(`code LIKE '%:code%'`, { code: args.code });
    if (args.name) queryBuilder.andWhere(`name LIKE '%:name%'`, { name: args.name });
    if (args.show !== undefined) queryBuilder.andWhere('`show` = :show', { show: args.show });
    if (args.delete !== undefined) queryBuilder.andWhere('`delete` = :delete', { delete: args.delete });

    if (args.keyword) { 
      queryBuilder.andWhere(new Brackets(qb => {
        qb.where('code LIKE :keyword', { keyword: `%${args.keyword}%` })
          .orWhere('name LIKE :keyword', { keyword: `%${args.keyword}%` });
      }));
    }
    
    queryBuilder.skip(offset).take(limit).orderBy({
      'createAt': 'DESC'
    });
    const [quotationTemplates, quotationTemplateCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(quotationTemplates, args, {
        arrayLength: quotationTemplateCount,
        sliceStart: offset || 0,
      }),
      totalCount: quotationTemplateCount,
    };
  }

  async create(
    data: QuotationTemplateCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<QuotationTemplatePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const quotationTemplate = this.quotationTemplateRepository.create();

      quotationTemplate.uuid = uuid();

      if (data.remark) quotationTemplate.remark = data.remark;

      quotationTemplate.code = data.code;
      quotationTemplate.name = data.name;

      quotationTemplate.createAt = Date.now();

      await queryRunner.manager.save(quotationTemplate);

      await queryRunner.commitTransaction();

      return {
        quotationTemplate: await quotationTemplate.save(),
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
    data: QuotationTemplateUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<QuotationTemplatePayload> {
    try {
      const quotationTemplate = await this.quotationTemplateRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.remark) quotationTemplate.remark = data.remark;

      if (data.code) quotationTemplate.code = data.code;
      if (data.name) quotationTemplate.name = data.name;

      if(data.show !== undefined) quotationTemplate.show = data.show;

      if(data.delete === true) {
        // if(quotationTemplate.inUsed) throw new Error('Delete failed. This template is in used.');
        quotationTemplate.delete = data.delete;
      }

      quotationTemplate.editAt = Date.now();

      return {
        quotationTemplate: await quotationTemplate.save(),
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
    data: QuotationTemplateImportItemInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<QuotationTemplatePayload> {
    try {
      const quotationTemplate = await this.quotationTemplateRepository.findOneOrFail(fromGlobalId(data.id).id);
      let form = quotationTemplate.form ? JSON.parse(quotationTemplate.form) : [];
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
              upper: upperId || 0,
              sort: 0,
              ref: itemId,
              delete: 0,
              price: {
                id: undefined,
                name_en: 'N/A',
                name_cht: 'N/A',
                value: price ? String(price || 0) : undefined,
                unit: unitItem ? unitItem.id : 0,
                unitId: unitId ? unitId : '0',
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
                unitId: unitId ? unitId : '0',
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

        let oldInUsed = quotationTemplate.inUsed ? quotationTemplate.inUsed?.split(',') : [];
        if(oldInUsed?.length) {
          quotationTemplate.inUsed = (oldInUsed.concat(itemIds.filter(e=> oldInUsed.indexOf(e) < 0)))?.join(',');
        }
        else quotationTemplate.inUsed = itemIds.join(',');

        quotationTemplate.form = JSON.stringify(newForm);
      }

      quotationTemplate.editAt = Date.now();

      return {
        quotationTemplate: await quotationTemplate.save(),
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
    data: QuotationTemplateUpdateItemInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<QuotationTemplatePayload> {
    try {
      const quotationTemplate = await this.quotationTemplateRepository.findOneOrFail(fromGlobalId(data.id).id);
     
      let form = data.form;

      quotationTemplate.form = JSON.stringify(form);

      quotationTemplate.editAt = Date.now();

      return {
        quotationTemplate: await quotationTemplate.save(),
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