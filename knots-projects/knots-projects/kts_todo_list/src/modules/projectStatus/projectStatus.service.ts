import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Enforcer } from 'casbin';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { ProjectStatusRepository } from './projectStatus.repository';
import { ProjectStatusArgs } from './args/projectStatus.args';
import { ProjectStatusConnection } from './connection/projectStatus.connection';
import { ProjectStatusCreateInput } from './input/projectStatusCreate.input';
import { ProjectStatusPayload } from './payload/projectStatus.payload';
import { ProjectStatusUpdateInput } from './input/projectStatusUpdate.input';
@Service()
export class ProjectStatusService {
  constructor(
    @InjectRepository()
    private readonly projectStatusRepository: ProjectStatusRepository,
  ) {
  }

  async getMany(args: ProjectStatusArgs, extraArgs: { [index: string]: any } = {}): Promise<ProjectStatusConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.projectStatusRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.code) queryBuilder.andWhere('code = :code', { code: args.code });
    if (args.nameCht) queryBuilder.andWhere(`name_cht LIKE '%:nameCht%'`, { nameCht: args.nameCht });
    if (args.nameEn) queryBuilder.andWhere(`name_en LIKE '%:nameEn%'`, { nameEn: args.nameEn });
    if (args.show !== undefined) queryBuilder.andWhere('`show` = :show', { show: args.show });
    queryBuilder.skip(offset).take(limit);
    const [projectStatuss, projectStatusCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(projectStatuss, args, {
        arrayLength: projectStatusCount,
        sliceStart: offset || 0,
      }),
      totalCount: projectStatusCount,
    };
  }

  async create(
    data: ProjectStatusCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer): Promise<ProjectStatusPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!data.nameEn && !data.nameCht) throw new Error('Name required');
      const projectStatus = this.projectStatusRepository.create();

      projectStatus.code = data.code;
      if (data.nameEn) projectStatus.nameEn = data.nameEn;
      if (data.nameCht) projectStatus.nameCht = data.nameCht;
      if (data.sort !== undefined) projectStatus.sort = data.sort;
      if (data.show !== undefined) projectStatus.show = data.show;

      projectStatus.createAt = Date.now();

      await queryRunner.manager.save(projectStatus);

      await queryRunner.commitTransaction();

      return {
        projectStatus: await projectStatus.save(),
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
    data: ProjectStatusUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectStatusPayload> {
    try {
      const projectStatus = await this.projectStatusRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (data.code) projectStatus.code = data.code;
      if (data.nameEn) projectStatus.nameEn = data.nameEn;
      if (data.nameCht) projectStatus.nameCht = data.nameCht;
      if (data.sort !== undefined) projectStatus.sort = data.sort;
      if (data.show !== undefined) projectStatus.show = data.show;
      projectStatus.editAt = Date.now();
      return {
        projectStatus: await projectStatus.save(),
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
