import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Enforcer } from 'casbin';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { ProjectSpotlightRepository } from './projectSpotlight.repository';
import { ProjectSpotlightArgs } from './args/projectSpotlight.args';
import { ProjectSpotlightConnection } from './connection/projectSpotlight.connection';
import { ProjectSpotlightCreateInput } from './input/projectSpotlightCreate.input';
import { ProjectSpotlightPayload } from './payload/projectSpotlight.payload';
import { ProjectSpotlightUpdateInput } from './input/projectSpotlightUpdate.input';
@Service()
export class ProjectSpotlightService {
  constructor(
    @InjectRepository()
    private readonly projectSpotlightRepository: ProjectSpotlightRepository,
  ) {
  }

  async getMany(args: ProjectSpotlightArgs, extraArgs: { [index: string]: any } = {}): Promise<ProjectSpotlightConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.projectSpotlightRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.nameCht) queryBuilder.andWhere(`name_cht LIKE '%:nameCht%'`, { nameCht: args.nameCht });
    if (args.nameEn) queryBuilder.andWhere(`name_en LIKE '%:nameEn%'`, { nameEn: args.nameEn });
    if (args.hex) queryBuilder.andWhere('hex = :hex', { hex: args.hex });
    if (args.preset !== undefined) queryBuilder.andWhere('preset = :preset', { preset: args.preset });
    if (args.show !== undefined) queryBuilder.andWhere('`show` = :show', { show: args.show });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    queryBuilder.skip(offset).take(limit);
    const [projectSpotlights, projectSpotlightCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(projectSpotlights, args, {
        arrayLength: projectSpotlightCount,
        sliceStart: offset || 0,
      }),
      totalCount: projectSpotlightCount,
    };
  }

  async create(
    data: ProjectSpotlightCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectSpotlightPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!data.nameEn && !data.nameCht) throw new Error('Name required');
      const projectSpotlight = this.projectSpotlightRepository.create();
      if (data.nameEn) projectSpotlight.nameEn = data.nameEn;
      if (data.nameCht) projectSpotlight.nameCht = data.nameCht;
      if (data.hex) projectSpotlight.hex = data.hex;
      if (data.preset !== undefined) projectSpotlight.preset = data.preset;
      if (data.show !== undefined) projectSpotlight.show = data.show;
      if (data.sort !== undefined) projectSpotlight.sort = data.sort;

      projectSpotlight.createAt = Date.now();

      await queryRunner.manager.save(projectSpotlight);

      await queryRunner.commitTransaction();

      return {
        projectSpotlight: await projectSpotlight.save(),
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
    data: ProjectSpotlightUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<ProjectSpotlightPayload> {
    try {
      const projectSpotlight = await this.projectSpotlightRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (data.nameEn) projectSpotlight.nameEn = data.nameEn;
      if (data.nameCht) projectSpotlight.nameCht = data.nameCht;
      if (data.hex) projectSpotlight.hex = data.hex;
      if (data.preset !== undefined) projectSpotlight.sort = data.sort;
      if (data.show !== undefined) projectSpotlight.show = data.show;
      if (data.sort !== undefined) projectSpotlight.sort = data.sort;
      if (data.deleted !== undefined) projectSpotlight.deleted = data.deleted;
      projectSpotlight.editAt = Date.now();
      return {
        projectSpotlight: await projectSpotlight.save(),
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
