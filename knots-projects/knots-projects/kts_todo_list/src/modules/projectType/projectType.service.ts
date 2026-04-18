import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Enforcer } from 'casbin';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { ProjectTypeRepository } from './projectType.repository';
import { ProjectTypeArgs } from './args/projectType.args';
import { ProjectTypeConnection } from './connection/projectType.connection';
import { ProjectTypeCreateInput } from './input/projectTypeCreate.input';
import { ProjectTypePayload } from './payload/projectType.payload';
import { ProjectTypeUpdateInput } from './input/projectTypeUpdate.input';
import { ProjectTypeSortPayload } from './payload/projectTypeSort.payload';
import { ProjectTypeSortInput } from './input/projectTypeSort.input';
@Service()
export class ProjectTypeService {
  constructor(
    @InjectRepository()
    private readonly projectTypeRepository: ProjectTypeRepository,
  ) {
  }

  async getMany(args: ProjectTypeArgs, extraArgs: { [index: string]: any } = {}): Promise<ProjectTypeConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.projectTypeRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.code) queryBuilder.andWhere('code = :code', { code: args.code });
    if (args.nameCht) queryBuilder.andWhere(`name_cht LIKE '%:nameCht%'`, { nameCht: args.nameCht });
    if (args.nameEn) queryBuilder.andWhere(`name_en LIKE '%:nameEn%'`, { nameEn: args.nameEn });
    if (args.show !== undefined) queryBuilder.andWhere('`show` = :show', { show: args.show });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    queryBuilder.skip(offset).take(limit).orderBy({
      'sort': 'ASC',
    });
    const [projectTypes, projectTypeCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(projectTypes, args, {
        arrayLength: projectTypeCount,
        sliceStart: offset || 0,
      }),
      totalCount: projectTypeCount,
    };
  }

  async create(
    data: ProjectTypeCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectTypePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!data.nameEn && !data.nameCht) throw new Error('Name required');
      const projectType = this.projectTypeRepository.create();

      projectType.code = data.code;
      if (data.nameEn) projectType.nameEn = data.nameEn;
      if (data.nameCht) projectType.nameCht = data.nameCht;
      if (data.descEn) projectType.descEn = data.descEn;
      if (data.descCht) projectType.descCht = data.descCht;
      if (data.sort !== undefined) projectType.sort = data.sort;
      if (data.show !== undefined) projectType.show = data.show;
      projectType.createAt = Date.now();

      await queryRunner.manager.save(projectType);

      await queryRunner.commitTransaction();

      return {
        projectType: await projectType.save(),
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
    data: ProjectTypeUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectTypePayload> {
    try {
      const projectType = await this.projectTypeRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (data.code) projectType.code = data.code;
      if (data.nameEn) projectType.nameEn = data.nameEn;
      if (data.nameCht) projectType.nameCht = data.nameCht;
      if (data.descEn) projectType.descEn = data.descEn;
      if (data.descCht) projectType.descCht = data.descCht;
      if (data.sort !== undefined) projectType.sort = data.sort;
      if (data.show !== undefined) projectType.show = data.show;
      if (data.deleted !== undefined) projectType.deleted = data.deleted;
      projectType.editAt = Date.now();

      return {
        projectType: await projectType.save(),
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
    data: ProjectTypeSortInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectTypeSortPayload> {
    try {
      const list = data.sorting.map((item) => {
        return {
          realId: fromGlobalId(item.id).id,
          ...item
        }
      });
      const items = await this.projectTypeRepository.findByIds(list.map(e => e.realId));

      for (const e of items) {
        e.editAt = Date.now();
        let sort = list.find(x => x.realId == e.id)?.sort
        if (sort) e.sort = sort;
      }

      await this.projectTypeRepository.save(items);

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
