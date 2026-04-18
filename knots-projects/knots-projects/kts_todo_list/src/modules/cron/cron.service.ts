import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { FindConditions } from 'typeorm';
import { validate } from 'class-validator';
import { logger } from '../../lib/logger';
import { getUserValidationErrors } from '../../lib/userErrors';
import { Cron, CronStatus } from './cron.entity';
import { CronRepository } from './cron.repository';
import { CronsArgs } from './args/crons.args';
import { CronsConnection } from './connection/crons.connection';
import { CronUpdateInput } from './input/cronUpdate.input';
import { CronUpdatePayload } from './payload/cronUpdate.payload';

@Service()
export class CronService {
  constructor(
    @InjectRepository()
    private readonly cronRepository: CronRepository,
  ) {
  }

  async getMany(args: CronsArgs): Promise<CronsConnection> {
    const conditions: FindConditions<Cron> = {};

    if (args.entity) {
      conditions.entity = args.entity;
    }

    if (args.status) {
      conditions.status = args.status;
    }

    return this.cronRepository.findAndPaginate(
      conditions,
      {
        entity: 'ASC',
      },
      args,
    );
  }

  async update(data: CronUpdateInput): Promise<CronUpdatePayload> {
    try {
      if (data.status === CronStatus.PROCESSING) {
        logger.error(`Cannot update wemSync status, status is not allowed to set to processing`);
        return {
          userErrors: [
            {
              message: `Cannot update wemSync status, status is not allowed to set to processing`,
              field: ['status'],
            },
          ],
        };
      }

      const cron = await this.cronRepository.findOneOrFail(data.entity);

      if (cron.status === CronStatus.PROCESSING) {
        logger.error(`Cannot update wemSync status, ${cron.entity} is processing`);
        return {
          userErrors: [
            {
              message: `Cannot update wemSync status, ${cron.entity} is processing`,
              field: ['status'],
            },
          ],
        };
      }

      Object.assign(cron, data);

      const userErrors = getUserValidationErrors(await validate(cron));

      await cron.save();

      return {
        userErrors,
        cron,
      };
    } catch (error: any) {
      logger.error(`Cannot update wemSync`);
      logger.error(error);
      return {
        userErrors: [
          {
            message: `Cannot update wemSync`,
            field: [],
          },
        ],
      };
    }
  }
}
