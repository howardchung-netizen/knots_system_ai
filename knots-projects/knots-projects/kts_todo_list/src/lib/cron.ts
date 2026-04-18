import 'reflect-metadata';
import 'dotenv/config';
import { Service } from 'typedi';
import { Enforcer } from 'casbin';
import { getManager } from 'typeorm';
import { CronJob } from 'cron';
import { logger } from './logger';
import moment from 'moment-timezone';
import { TZ, WEM_SYNC_LAST_SYNC_AT_OFFSET } from './config';
import { Cron, CronStatus } from '../modules/cron/cron.entity';
import { TaskService } from '../modules/task/task.service';
import { BookKeepingPeriodExpenseService } from '../modules/bookKeepingPeriodExpense/bookKeepingPeriodExpense.service';
import { TenderFormService } from '../modules/tenderForm/tenderForm.service';


const jobs: { [index: string]: { job: CronJob | undefined, isRunning: boolean } } = {};

@Service()
export class Crons {
  constructor(
    private readonly taskService: TaskService,
    private readonly tenderFormService: TenderFormService,
    private readonly bookKeepingPeriodExpenseService: BookKeepingPeriodExpenseService,
  ) { }

  async start(enforcer: Enforcer) {
    logger.info('Creating crons');

    // force sync
    jobs.forceSyncWem = { job: undefined, isRunning: false };
    jobs.forceSyncWem.job = new CronJob('20 * * * * *', async () => {
      if (jobs.dailyMidnightSyncWem?.isRunning || jobs.dailyMorningSyncWem?.isRunning) return;
      jobs.forceSyncWem.isRunning = true;

      logger.info('start forceSyncWem cron');

      const manager = getManager();

      try {
        const cron = await manager.findOne(Cron, 'todo_list_whatsapp');
        if (cron?.status === CronStatus.PENDING) {
          logger.info('start force todo_list_whatsapp');
          cron.status = CronStatus.PROCESSING;
          await cron.save();
          const result = await this.taskService.whatsAppRemind();
          if (result) cron.lastSyncAt = moment().add(Number(WEM_SYNC_LAST_SYNC_AT_OFFSET), 'milliseconds').toDate();
          cron.status = CronStatus.NA;
          await cron.save();
          logger.info('finish force todo_list_whatsapp');
        }
      } catch (error: any) {
        logger.error(error);
      }

      try {
        const cron = await manager.findOne(Cron, 'tender_form_whatsapp');
        if (cron?.status === CronStatus.PENDING) {
          logger.info('start force tender_form_whatsapp');
          cron.status = CronStatus.PROCESSING;
          await cron.save();
          const result = await this.tenderFormService.whatsAppRemind();
          if (result) cron.lastSyncAt = moment().add(Number(WEM_SYNC_LAST_SYNC_AT_OFFSET), 'milliseconds').toDate();
          cron.status = CronStatus.NA;
          await cron.save();
          logger.info('finish force tender_form_whatsapp');
        }
      } catch (error: any) {
        logger.error(error);
      }

      try {
        const cron = await manager.findOne(Cron, 'book_keeping_period_expense');
        if (cron?.status === CronStatus.PENDING) {
          logger.info('start force book_keeping_period_expense');
          cron.status = CronStatus.PROCESSING;
          await cron.save();
          const result = await this.bookKeepingPeriodExpenseService.periodExpenseDailyChecking();
          if (result) cron.lastSyncAt = moment().add(Number(WEM_SYNC_LAST_SYNC_AT_OFFSET), 'milliseconds').toDate();
          cron.status = CronStatus.NA;
          await cron.save();
          logger.info('finish force book_keeping_period_expense');
        }
      } catch (error: any) {
        logger.error(error);
      }

      jobs.forceSyncWem.isRunning = false;

      logger.info('finish forceSyncWem cron');
    }, undefined, true, TZ);

    // half-hourly sync (during office hour)
    jobs.halfHourSyncWem = { job: undefined, isRunning: false };
    jobs.halfHourSyncWem.job = new CronJob('0 */5 7-22 * * *', async () => {
      if (jobs.halfHourSyncWem.isRunning) return;
      jobs.halfHourSyncWem.isRunning = true;

      logger.info('start half-hourly syncWem cron');

      const manager = getManager();

      try {
        let wemSync = await manager.findOne(Cron, 'todo_list_whatsapp_changes');
        if (wemSync?.status !== CronStatus.PROCESSING) {
          logger.info('start 5min todo_list_whatsapp_changes');
          if (!wemSync) {
            wemSync = new Cron();
            wemSync.entity = 'todo_list_whatsapp_changes';
          }
          wemSync.status = CronStatus.PROCESSING;
          await wemSync.save();
          const result = await this.taskService.whatsAppRemindChanges();
          if (result) wemSync.lastSyncAt = moment().add(Number(WEM_SYNC_LAST_SYNC_AT_OFFSET), 'milliseconds').toDate();
          wemSync.status = CronStatus.NA;
          await wemSync.save();
          logger.info('finish 5min todo_list_whatsapp_changes');
        }
      } catch (error: any) {
        logger.error(error);
      }

      jobs.halfHourSyncWem.isRunning = false;

      logger.info('finish half-hourly syncWem cron');
    }, undefined, true, TZ);

    // daily mid-night sync
    jobs.dailyMidnightSyncWem = { job: undefined, isRunning: false };
    jobs.dailyMidnightSyncWem.job = new CronJob('0 0 4 * * *', async () => {
      if (jobs.dailyMidnightSyncWem.isRunning) return;
      jobs.dailyMidnightSyncWem.isRunning = true;

      logger.info('start daily mid-night syncWem cron');

      const manager = getManager();

      try {
        let cron = await manager.findOne(Cron, 'book_keeping_period_expense');
        if (![CronStatus.PROCESSING, CronStatus.IGNORED].some(v => v === cron?.status)) {
          logger.info('start daily mid-night book_keeping_period_expense');
          if (!cron) {
            cron = new Cron();
            cron.entity = 'book_keeping_period_expense';
          }
          cron.status = CronStatus.PROCESSING;
          await cron.save();
          const result = await this.bookKeepingPeriodExpenseService.periodExpenseDailyChecking();
          if (result) cron.lastSyncAt = moment().add(Number(WEM_SYNC_LAST_SYNC_AT_OFFSET), 'milliseconds').toDate();
          cron.status = CronStatus.NA;
          await cron.save();
          logger.info('finish daily mid-night book_keeping_period_expense');
        }
      } catch (error: any) {
        logger.error(error);
      }

      jobs.dailyMidnightSyncWem.isRunning = false;

      logger.info('finish daily mid-night syncWem cron');
    }, undefined, true, TZ);

    // daily daily morning sync
    jobs.dailyMorningSyncWem = { job: undefined, isRunning: false };
    jobs.dailyMorningSyncWem.job = new CronJob('0 0 9 * * *', async () => {
      if (jobs.dailyMorningSyncWem.isRunning) return;
      jobs.dailyMorningSyncWem.isRunning = true;

      logger.info('start daily morning syncWem cron');

      const manager = getManager();

      try {
        let cron = await manager.findOne(Cron, 'todo_list_whatsapp');
        if (![CronStatus.PROCESSING, CronStatus.IGNORED].some(v => v === cron?.status)) {
          logger.info('start daily mid-night whatsAppRemind');
          if (!cron) {
            cron = new Cron();
            cron.entity = 'todo_list_whatsapp';
          }
          cron.status = CronStatus.PROCESSING;
          await cron.save();
          const result = await this.taskService.whatsAppRemind();
          if (result) cron.lastSyncAt = moment().add(Number(WEM_SYNC_LAST_SYNC_AT_OFFSET), 'milliseconds').toDate();
          cron.status = CronStatus.NA;
          await cron.save();
          logger.info('finish daily mid-night whatsAppRemind');
        }
      } catch (error: any) {
        logger.error(error);
      }

      try {
        let cron = await manager.findOne(Cron, 'tender_form_whatsapp');
        if (![CronStatus.PROCESSING, CronStatus.IGNORED].some(v => v === cron?.status)) {
          logger.info('start daily morning tender form whatsAppRemind');
          if (!cron) {
            cron = new Cron();
            cron.entity = 'tender_form_whatsapp';
          }
          cron.status = CronStatus.PROCESSING;
          await cron.save();
          const result = await this.tenderFormService.whatsAppRemind();
          if (result) cron.lastSyncAt = moment().add(Number(WEM_SYNC_LAST_SYNC_AT_OFFSET), 'milliseconds').toDate();
          cron.status = CronStatus.NA;
          await cron.save();
          logger.info('finish daily morning tender form whatsAppRemind');
        }
      } catch (error: any) {
        logger.error(error);
      }


      jobs.dailyMorningSyncWem.isRunning = false;
    }, undefined, true, TZ);

  }
}