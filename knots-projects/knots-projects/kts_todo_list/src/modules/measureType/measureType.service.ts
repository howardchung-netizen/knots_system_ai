import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Enforcer } from 'casbin';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { MeasureTypeRepository } from './measureType.repository';
import { MeasureTypeArgs } from './args/measureType.args';
import { MeasureTypeConnection } from './connection/measureType.connection';
import { MeasureTypeCreateInput } from './input/measureTypeCreate.input';
import { MeasureTypePayload } from './payload/measureType.payload';
import { MeasureTypeUpdateInput } from './input/measureTypeUpdate.input';
import { MeasureTypeSortInput } from './input/measureTypeSort.input';
import { MeasureTypeSortPayload } from './payload/measureTypeSort.payload';
@Service()
export class MeasureTypeService {
  constructor(
    @InjectRepository()
    private readonly measureTypeRepository: MeasureTypeRepository,
  ) {
  }

  async getMany(args: MeasureTypeArgs, extraArgs: { [index: string]: any } = {}): Promise<MeasureTypeConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.measureTypeRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.nameCht) queryBuilder.andWhere(`name_cht LIKE '%:nameCht%'`, { nameCht: args.nameCht });
    if (args.nameEn) queryBuilder.andWhere(`name_en LIKE '%:nameEn%'`, { nameEn: args.nameEn });
    if (args.show !== undefined) queryBuilder.andWhere('`show` = :show', { show: args.show });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    queryBuilder.skip(offset).take(limit).orderBy({
      'sort': 'ASC',
    });;
    const [measureTypes, measureTypeCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(measureTypes, args, {
        arrayLength: measureTypeCount,
        sliceStart: offset || 0,
      }),
      totalCount: measureTypeCount,
    };
  }

  async create(
    data: MeasureTypeCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<MeasureTypePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!data.nameEn && !data.nameCht) throw new Error('Name required');
      const measureType = this.measureTypeRepository.create();

      if (data.nameEn) measureType.nameEn = data.nameEn;
      if (data.nameCht) measureType.nameCht = data.nameCht;
      if (data.sort !== undefined) measureType.sort = data.sort;
      if (data.show !== undefined) measureType.show = data.show;

      measureType.createAt = Date.now();

      await queryRunner.manager.save(measureType);

      await queryRunner.commitTransaction();

      return {
        measureType: await measureType.save(),
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
    data: MeasureTypeUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<MeasureTypePayload> {
    try {
      const measureType = await this.measureTypeRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (data.nameEn) measureType.nameEn = data.nameEn;
      if (data.nameCht) measureType.nameCht = data.nameCht;
      if (data.sort !== undefined) measureType.sort = data.sort;
      if (data.show !== undefined) measureType.show = data.show;
      if (data.deleted !== undefined) measureType.deleted = data.deleted;
      measureType.editAt = Date.now();

      return {
        measureType: await measureType.save(),
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
    data: MeasureTypeSortInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<MeasureTypeSortPayload> {
    try {
      const list = data.sorting.map((item) => {
        return {
          realId: fromGlobalId(item.id).id,
          ...item
        }
      });
      const items = await this.measureTypeRepository.findByIds(list.map(e => e.realId));

      for (const e of items) {
        e.editAt = Date.now();
        let sort = list.find(x => x.realId == e.id)?.sort
        if (sort) e.sort = sort;
      }

      await this.measureTypeRepository.save(items);

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
