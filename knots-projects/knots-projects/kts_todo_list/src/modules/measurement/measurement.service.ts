import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Enforcer } from 'casbin';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { MeasurementRepository } from './measurement.repository';
import { MeasurementArgs } from './args/measurement.args';
import { MeasurementConnection } from './connection/measurement.connection';
import { MeasurementCreateInput } from './input/measurementCreate.input';
import { MeasurementPayload } from './payload/measurement.payload';
import { MeasurementUpdateInput } from './input/measurementUpdate.input';
import { MeasureTypeRepository } from '../measureType/measureType.repository';
import { MeasurementSortInput } from './input/measurementSort.input';
import { MeasurementSortPayload } from './payload/measurementSort.payload';

@Service()
export class MeasurementService {
  constructor(
    @InjectRepository()
    private readonly measurementRepository: MeasurementRepository,
    @InjectRepository()
    private readonly measureTypeRepository: MeasureTypeRepository,
  ) {
  }

  async getMany(args: MeasurementArgs, extraArgs: { [index: string]: any } = {}): Promise<MeasurementConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.measurementRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.typeId) queryBuilder.andWhere('type_id = :typeId', { typeId: fromGlobalId(args.typeId).id });
    if (args.nameCht) queryBuilder.andWhere(`name_cht LIKE '%:nameCht%'`, { nameCht: args.nameCht });
    if (args.nameEn) queryBuilder.andWhere(`name_en LIKE '%:nameEn%'`, { nameEn: args.nameEn });
    if (args.descCht) queryBuilder.andWhere(`desc_cht LIKE '%:descCht%'`, { descCht: args.descCht });
    if (args.descEn) queryBuilder.andWhere(`desc_en LIKE '%:descEn%'`, { descEn: args.descEn });
    if (args.show !== undefined) queryBuilder.andWhere('`show` = :show', { show: args.show });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    queryBuilder.skip(offset).take(limit).orderBy({
      'sort': 'ASC',
    });
    const [measurements, measurementCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(measurements, args, {
        arrayLength: measurementCount,
        sliceStart: offset || 0,
      }),
      totalCount: measurementCount,
    };
  }

  async create(
    data: MeasurementCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<MeasurementPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!data.nameEn && !data.nameCht) throw new Error('Name required');
      const measurement = this.measurementRepository.create();

      if (data.typeId) {
        const measureType = await this.measureTypeRepository.findOneOrFail({
          id: fromGlobalId(data.typeId).id,
        });
        measurement.typeId = Number(measureType.id);
      }

      if (data.nameEn) measurement.nameEn = data.nameEn;
      if (data.nameCht) measurement.nameCht = data.nameCht;

      if (data.descEn) measurement.descEn = data.descEn;
      if (data.descCht) measurement.descCht = data.descCht;

      const lastSort = await this.measurementRepository.findOne({
        where: { deleted: false },
        order: { sort: 'DESC' },
      });

      measurement.sort = lastSort ? lastSort.sort + 1 : 0;

      measurement.createAt = Date.now();

      await queryRunner.manager.save(measurement);

      await queryRunner.commitTransaction();

      return {
        measurement: await measurement.save(),
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
    data: MeasurementUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<MeasurementPayload> {
    try {
      const measurement = await this.measurementRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (data.typeId) {
        const measureType = await this.measureTypeRepository.findOneOrFail({
          id: fromGlobalId(data.typeId).id,
        });
        measurement.typeId = Number(measureType.id);
      }
      if (data.nameEn) measurement.nameEn = data.nameEn;
      if (data.nameCht) measurement.nameCht = data.nameCht;
      if (data.descEn) measurement.descEn = data.descEn;
      if (data.descCht) measurement.descCht = data.descCht;
      if (data.sort !== undefined) measurement.sort = data.sort;
      if (data.show !== undefined) measurement.show = data.show;
      if (data.deleted !== undefined) measurement.deleted = data.deleted;
      measurement.editAt = Date.now();

      return {
        measurement: await measurement.save(),
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

  async sort(
    data: MeasurementSortInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<MeasurementSortPayload> {
    try {
      const list = data.sorting.map((item) => {
        return {
          realId: fromGlobalId(item.id).id,
          ...item
        }
      });
      const items = await this.measurementRepository.findByIds(list.map(e => e.realId));

      for (const e of items) {
        e.editAt = Date.now();
        let sort = list.find(x => x.realId == e.id)?.sort
        if (sort) e.sort = sort;
      }

      await this.measurementRepository.save(items);

      return {
        result: true,
        userErrors: []
      };
    } catch (error: any) {
      logger.error(error.message);
      return {
        result: false,
        userErrors: [{
          message: error.message,
          field: [],
        }]
      };
    }
  }
}
