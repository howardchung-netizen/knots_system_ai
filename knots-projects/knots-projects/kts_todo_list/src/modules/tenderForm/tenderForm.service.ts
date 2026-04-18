import { Enforcer } from 'casbin';
import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import moment from 'moment-timezone';
import { Service, Inject } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { logger } from '../../lib/logger';
import { TenderFormsArgs } from './args/tenderForms.args';
import { TenderForm } from './tenderForm.entity';
import { TenderFormRepository } from './tenderForm.repository';
import { TenderFormPayload } from './payload/tenderForm.payload';
import { UserRepository } from '../user/user.repository';
import { User } from '../user/user.entity';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { TenderFormDeletePayload } from './payload/tenderFormDelete.payload';
import { TenderFormDeleteInput } from './input/tenderFormDelete.input';
import { TenderFormConnection } from './connection/tenderForm.connection';
import { TenderFormCreateInput } from './input/tenderFormCreate.input';
import { ClientRepository } from '../client/client.repository';
import { TenderFormUpdateInput } from './input/tenderFormUpdate.input';
import { MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { TenderFormImportInput } from './input/tenderFormImport.input';
import { TenderFormImportPayload } from './payload/tenderFormImport.payload';
import { getWhatsAppService } from '../../lib/whatsapp';

@Service()
export class TenderFormService {
  constructor(
    @InjectRepository()
    private readonly tenderFormRepository: TenderFormRepository,
    @InjectRepository()
    private readonly clientRepository: ClientRepository,
    @InjectRepository()
    private readonly userRepository: UserRepository,
  ) {
  }

  async getManyInConnection(args: TenderFormsArgs,  user: LoggedInUser, extraArgs: { [index: string]: any } = {}, enforcer: Enforcer,): Promise<TenderFormConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.tenderFormRepository
      .createQueryBuilder('tenderForm')
      .where('`is_deleted` = 0');

    if (args.id) {
      queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    };

    if (args.receivedDateStart) {
      queryBuilder.andWhere(`received_date >= :receivedDateStart`, {
        receivedDateStart: args.receivedDateStart,
      });
    }

    if (args.receivedDateEnd) {
      queryBuilder.andWhere(`received_date <= :receivedDateEnd`, {
        receivedDateEnd: args.receivedDateEnd,
      });
    }

    if (args.client) {
      queryBuilder.andWhere('client = :client', { clientId: args.client });
    };

    if (args.tenderNo) {
      queryBuilder.andWhere('tender_no = :tenderNo', { tenderNo: args.tenderNo });
    };

    if (args.siteVisitDateStart) {
      queryBuilder.andWhere(`site_visit_date >= :siteVisitDateStart`, {
        siteVisitDateStart: args.siteVisitDateStart,
      });
    }

    if (args.siteVisitDateEnd) {
      queryBuilder.andWhere(`site_visit_date <= :siteVisitDateEnd`, {
        siteVisitDateEnd: args.siteVisitDateEnd,
      });
    }

    if (args.deadlineDateStart) {
      queryBuilder.andWhere(`site_visit_date >= :deadlineDateStart`, {
        deadlineDateStart: args.deadlineDateStart,
      });
    }

    if (args.deadlineDateEnd) {
      queryBuilder.andWhere(`site_visit_date <= :deadlineDateEnd`, {
        deadlineDateEnd: args.deadlineDateEnd,
      });
    }

    if (args.submitMethod) {
      queryBuilder.andWhere('tender_no = :tenderNo', { tenderNo: args.tenderNo });
    };

    if (args.personInChargeId) {
      queryBuilder.andWhere('person_in_charge_id = :personInChargeId', { personInChargeId: fromGlobalId(args.personInChargeId).id });
    };

    const [tenderForms, tenderFormCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(tenderForms, args, {
        arrayLength: tenderFormCount,
        sliceStart: offset || 0,
      }),
      totalCount: tenderFormCount,
    };
  }

  async create(
    data: TenderFormCreateInput,
    user: LoggedInUser,
  ): Promise<TenderFormPayload> {
    try {
      const tenderForm = TenderForm.create();

      tenderForm.receivedDate = data.receivedDate;
      tenderForm.client = data.client;
      tenderForm.tenderNo = data.tenderNo;
      if (data.siteVisitTime) tenderForm.siteVisitTime = data.siteVisitTime;
      tenderForm.deadlineTime = data.deadlineTime;
      tenderForm.submitMethod = data.submitMethod;
      tenderForm.details = data.details;
      if (data.personInChargeId) {
        tenderForm.personInChargeId = fromGlobalId(data.personInChargeId).id;
      }

      await tenderForm.save();

      return {
        userErrors: [],
        tenderForm: tenderForm
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async update(
    data: TenderFormUpdateInput,
    user: LoggedInUser,
  ): Promise<TenderFormPayload> {
    try {

      const tenderForm = await this.tenderFormRepository.findOneOrFail({ id: fromGlobalId(data.id).id });
      if (data.receivedDate) tenderForm.receivedDate = data.receivedDate;
      tenderForm.client = data.client;
      if (data.tenderNo) tenderForm.tenderNo = data.tenderNo;
      if (data.siteVisitTime) tenderForm.siteVisitTime = data.siteVisitTime;
      if (data.deadlineTime) tenderForm.deadlineTime = data.deadlineTime;
      if (data.submitMethod) tenderForm.submitMethod = data.submitMethod;
      if (data.details) tenderForm.details = data.details;
      if (data.personInChargeId) {
        const personInCharge = await this.userRepository.findOneOrFail(fromGlobalId(data.personInChargeId).id);
        tenderForm.personInChargeId = personInCharge.id;
      }
      await tenderForm.save();
      return {
        userErrors: [],
        tenderForm: tenderForm
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async import(
    data: TenderFormImportInput,
    user: LoggedInUser,
  ): Promise<TenderFormImportPayload> {
    try {

      for (const tender of data.tenders) {
        let tenderForm = await this.tenderFormRepository.findOne({ tenderNo: tender.tenderNo });
        if (!tenderForm) tenderForm = TenderForm.create();
        tenderForm.tenderNo = tender.tenderNo;
        if (tender.receivedDate) tenderForm.receivedDate = tender.receivedDate;
        if (tender.client) tenderForm.client = tender.client;
        if (tender.siteVisitTime) tenderForm.siteVisitTime = tender.siteVisitTime;
        if (tender.deadlineTime) tenderForm.deadlineTime = tender.deadlineTime;
        if (tender.submitMethod) tenderForm.submitMethod = tender.submitMethod;
        if (tender.details) tenderForm.details = tender.details;
        await tenderForm.save();
      }

      return {
        userErrors: [],
        result: true,
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }],
        result: false,
      }
    }
  }

  async delete(
    data: TenderFormDeleteInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<TenderFormDeletePayload> {
    try {
      const tenderForm = await this.tenderFormRepository.findOneOrFail({ id: fromGlobalId(data.id).id, isDeleted: false });

      tenderForm.isDeleted = true;

      return {
        userErrors: [],
        deletedTenderFormId: data.id,
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async whatsAppRemind(): Promise<Boolean> {
    const sendLists: { [key: string]: TenderForm[] } = {};
    const staffs = await User.find();

    const tenderForms = await TenderForm.find({
      where: {
        deadlineTime: Between(
          moment().tz('Asia/Hong_Kong').add(2, 'days').startOf('day').toDate(),
          moment().tz('Asia/Hong_Kong').add(2, 'days').endOf('day').toDate()
        ),
        isDeleted: false,
      },
    });

    for (let tenderForm of tenderForms) {
      let tenderFormStaff = await tenderForm.personInCharge;
      if (tenderFormStaff) {
        const staff = staffs.find(staff => staff.id == tenderFormStaff?.id);
        if (staff && (!staff.whatsApp || !staff.whatsapp2)) continue;

        const whatsappNumber = `${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`;
        if (!sendLists[whatsappNumber]) {
          sendLists[whatsappNumber] = [];
        }
        sendLists[whatsappNumber].push(tenderForm);
      }
    }

    const whatsappService = await getWhatsAppService();

    for (let [whatsappNumber, tenderForms] of Object.entries(sendLists)) {
      let currentBatch: TenderForm[] = [];
      let messageCount = 0;

      for (let tenderForm of tenderForms) {
        currentBatch.push(tenderForm);

        if (currentBatch.length === 4 || tenderForm === tenderForms[tenderForms.length - 1]) {
          messageCount++;
          const templateName = currentBatch.length === 4 ? 'tender_form_reminder_4' : `tender_form_reminder_${currentBatch.length}`;

          try {
            await whatsappService.sendTemplateMessage({
              to: whatsappNumber,
              templateName: templateName,
              languageCode: 'zh_HK',
              components: [{
                type: 'body',
                parameters: currentBatch.map((form, index) => ({
                  type: 'text',
                  text: `${index + 1}) Client: ${form.client}, Tender No.: ${form.tenderNo || ''}`
                }))
              }]
            });

            logger.info(`Sent ${templateName} to ${whatsappNumber} with ${currentBatch.length} records`);
          } catch (error: any) {
            logger.error(`Failed to send WhatsApp message: ${error.message}`);
          }

          currentBatch = [];
        }
      }
    }

    return true;
  }
}
