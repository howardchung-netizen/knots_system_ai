import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Enforcer } from 'casbin';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { QuotationStatusRepository } from './quotationStatus.repository';
import { QuotationStatusArgs } from './args/quotationStatus.args';
import { QuotationStatusConnection } from './connection/quotationStatus.connection';
import { QuotationStatusCreateInput } from './input/quotationStatusCreate.input';
import { QuotationStatusPayload } from './payload/quotationStatus.payload';
import { QuotationStatusUpdateInput } from './input/quotationStatusUpdate.input';

@Service()
export class QuotationStatusService {
  constructor(
    @InjectRepository()
    private readonly quotationStatusRepository: QuotationStatusRepository,
  ) {
  }

  async getMany(args: QuotationStatusArgs, extraArgs: { [index: string]: any } = {}): Promise<QuotationStatusConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.quotationStatusRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.code) queryBuilder.andWhere('code = :code', { code: fromGlobalId(args.code).id });
    if (args.nameCht) queryBuilder.andWhere(`name_cht LIKE '%:nameCht%'`, { nameCht: args.nameCht });
    if (args.nameEn) queryBuilder.andWhere(`name_en LIKE '%:nameEn%'`, { nameEn: args.nameEn });
    if (args.show !== undefined) queryBuilder.andWhere('`show` = :show', { show: args.show });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    queryBuilder.skip(offset).take(limit);
    const [quotationStatuss, quotationStatusCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(quotationStatuss, args, {
        arrayLength: quotationStatusCount,
        sliceStart: offset || 0,
      }),
      totalCount: quotationStatusCount,
    };
  }

  async create(
    data: QuotationStatusCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<QuotationStatusPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const quotationStatus = this.quotationStatusRepository.create();

      quotationStatus.code = data.code;
      quotationStatus.nameEn = data.nameEn;
      quotationStatus.nameCht = data.nameCht;

      const lastSort = await this.quotationStatusRepository.findOne({
        where: { deleted: false },
        order: { sort: 'DESC' },
      });

      quotationStatus.sort = lastSort ? lastSort.sort + 1 : 0;

      quotationStatus.createAt = Date.now();

      await queryRunner.manager.save(quotationStatus);

      await queryRunner.commitTransaction();

      return {
        quotationStatus: await quotationStatus.save(),
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
    data: QuotationStatusUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<QuotationStatusPayload> {
    try {
      const quotationStatus = await this.quotationStatusRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.code) quotationStatus.code = data.code;
      if (data.nameEn) quotationStatus.nameEn = data.nameEn;
      if (data.nameCht) quotationStatus.nameCht = data.nameCht;
      if (data.sort !== undefined) quotationStatus.sort = data.sort;
      if (data.show !== undefined) quotationStatus.show = data.show;
      if (data.deleted !== undefined) quotationStatus.deleted = data.deleted;
      quotationStatus.editAt = Date.now();

      return {
        quotationStatus: await quotationStatus.save(),
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
