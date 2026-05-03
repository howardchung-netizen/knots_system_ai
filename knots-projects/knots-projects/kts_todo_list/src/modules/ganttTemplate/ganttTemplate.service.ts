import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Enforcer } from 'casbin';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { GanttTemplateRepository } from './ganttTemplate.repository';
import { GanttTemplateArgs } from './args/ganttTemplate.args';
import { GanttTemplateConnection } from './connection/ganttTemplate.connection';
import { GanttTemplateCreateInput } from './input/ganttTemplateCreate.input';
import { GanttTemplatePayload } from './payload/ganttTemplate.payload';
import { GanttTemplateUpdateInput } from './input/ganttTemplateUpdate.input';

@Service()
export class GanttTemplateService {
  constructor(
    @InjectRepository()
    private readonly ganttTemplateRepository: GanttTemplateRepository,
  ) {
  }

  async getMany(args: GanttTemplateArgs, extraArgs: { [index: string]: any } = {}): Promise<GanttTemplateConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.ganttTemplateRepository.createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.name) queryBuilder.andWhere(`name LIKE :name`, { name: `%${args.name}%` });
    if (args.type) queryBuilder.andWhere('type = :type', { type: args.type });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    
    queryBuilder.skip(offset).take(limit).orderBy({
      'id': 'DESC',
    });
    
    const [ganttTemplates, count] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(ganttTemplates, args, {
        arrayLength: count,
        sliceStart: offset || 0,
      }),
      totalCount: count,
    };
  }

  async create(
    data: GanttTemplateCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<GanttTemplatePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!data.name) throw new Error('Name required');
      const ganttTemplate = this.ganttTemplateRepository.create();

      ganttTemplate.name = data.name;
      ganttTemplate.type = data.type;
      ganttTemplate.nodes = data.nodes;
      ganttTemplate.edges = data.edges;
      ganttTemplate.createAt = Date.now();

      await queryRunner.manager.save(ganttTemplate);
      await queryRunner.commitTransaction();

      return {
        ganttTemplate: await ganttTemplate.save(),
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
    data: GanttTemplateUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<GanttTemplatePayload> {
    try {
      const ganttTemplate = await this.ganttTemplateRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (data.name !== undefined) ganttTemplate.name = data.name;
      if (data.type !== undefined) ganttTemplate.type = data.type;
      if (data.nodes !== undefined) ganttTemplate.nodes = data.nodes;
      if (data.edges !== undefined) ganttTemplate.edges = data.edges;
      if (data.deleted !== undefined) ganttTemplate.deleted = data.deleted;
      ganttTemplate.editAt = Date.now();

      return {
        ganttTemplate: await ganttTemplate.save(),
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
