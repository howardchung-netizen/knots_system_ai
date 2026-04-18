import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Enforcer } from 'casbin';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { ProjectHashtagRepository } from './projectHashtag.repository';
import { ProjectHashtagArgs } from './args/projectHashtag.args';
import { ProjectHashtagConnection } from './connection/projectHashtag.connection';
import { ProjectHashtagCreateInput } from './input/projectHashtagCreate.input';
import { ProjectHashtagPayload } from './payload/projectHashtag.payload';
import { ProjectHashtagUpdateInput } from './input/projectHashtagUpdate.input';
import { ProjectHashtagSortInput } from './input/projectHashtagSort.input';
import { ProjectHashtagSortPayload } from './payload/projectHashtagSort.payload';
@Service()
export class ProjectHashtagService {
  constructor(
    @InjectRepository()
    private readonly projectHashtagRepository: ProjectHashtagRepository,
  ) {
  }

  async getMany(args: ProjectHashtagArgs, extraArgs: { [index: string]: any } = {}): Promise<ProjectHashtagConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.projectHashtagRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.nameCht) queryBuilder.andWhere(`name_cht LIKE '%:nameCht%'`, { nameCht: args.nameCht });
    if (args.nameEn) queryBuilder.andWhere(`name_en LIKE '%:nameEn%'`, { nameEn: args.nameEn });
    if (args.preset !== undefined) queryBuilder.andWhere('preset = :preset', { preset: args.preset });
    if (args.show !== undefined) queryBuilder.andWhere('`show` = :show', { show: args.show });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    queryBuilder.skip(offset).take(limit).orderBy({
      'sort': 'ASC',
    });
    const [projectHashtags, projectHashtagCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(projectHashtags, args, {
        arrayLength: projectHashtagCount,
        sliceStart: offset || 0,
      }),
      totalCount: projectHashtagCount,
    };
  }

  async create(
    data: ProjectHashtagCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectHashtagPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!data.nameEn && !data.nameCht) throw new Error('Name required');
      const projectHashtag = this.projectHashtagRepository.create();
      if (data.nameEn) projectHashtag.nameEn = data.nameEn;
      if (data.nameCht) projectHashtag.nameCht = data.nameCht;
      if (data.hex) projectHashtag.hex = data.hex;
      if (data.preset !== undefined) projectHashtag.preset = data.preset;
      if (data.show !== undefined) projectHashtag.show = data.show;
      if (data.sort !== undefined) projectHashtag.sort = data.sort;

      projectHashtag.createAt = Date.now();

      await queryRunner.manager.save(projectHashtag);

      await queryRunner.commitTransaction();

      return {
        projectHashtag: await projectHashtag.save(),
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
    data: ProjectHashtagUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectHashtagPayload> {
    try {
      const projectHashtag = await this.projectHashtagRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (data.nameEn) projectHashtag.nameEn = data.nameEn;
      if (data.nameCht) projectHashtag.nameCht = data.nameCht;
      if (data.hex) projectHashtag.hex = data.hex;
      if (data.preset !== undefined) projectHashtag.sort = data.sort;
      if (data.show !== undefined) projectHashtag.show = data.show;
      if (data.sort !== undefined) projectHashtag.sort = data.sort;
      if (data.deleted !== undefined) projectHashtag.deleted = data.deleted;
      projectHashtag.editAt = Date.now();
      return {
        projectHashtag: await projectHashtag.save(),
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
    data: ProjectHashtagSortInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectHashtagSortPayload> {
    try {
      const list = data.sorting.map(item => {
        return {
          realId: fromGlobalId(item.id).id,
          ...item
        }
      });
      const items = await this.projectHashtagRepository.findByIds(list.map(e => e.realId));

      for (const e of items) {
        e.editAt = Date.now();
        let sort = list.find(x => x.realId == e.id)?.sort
        if (sort) e.sort = sort;
      }

      await this.projectHashtagRepository.save(items);

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
