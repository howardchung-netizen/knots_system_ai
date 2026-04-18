import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Enforcer } from 'casbin';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { TermsRepository } from './terms.repository';
import { TermsArgs } from './args/terms.args';
import { TermsConnection } from './connection/terms.connection';
import { TermsCreateInput } from './input/termsCreate.input';
import { TermsPayload } from './payload/terms.payload';
import { TermsUpdateInput } from './input/termsUpdate.input';

@Service()
export class TermsService {
  constructor(
    @InjectRepository()
    private readonly termsRepository: TermsRepository,
  ) {
  }

  async getMany(args: TermsArgs, extraArgs: { [index: string]: any } = {}): Promise<TermsConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.termsRepository
      .createQueryBuilder();
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.nameCht) queryBuilder.andWhere(`name_cht LIKE '%:nameCht%'`, { nameCht: args.nameCht });
    if (args.nameEn) queryBuilder.andWhere(`name_en LIKE '%:nameEn%'`, { nameEn: args.nameEn });
    if (args.descCht) queryBuilder.andWhere(`desc_cht LIKE '%:descCht%'`, { descCht: args.descCht });
    if (args.descEn) queryBuilder.andWhere(`desc_en LIKE '%:descEn%'`, { descEn: args.descEn });
    if (args.show !== undefined) queryBuilder.andWhere('`show` = :show', { show: args.show });
    if (args.deleted !== undefined) queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    queryBuilder.skip(offset).take(limit).orderBy({
      'sort': 'ASC'
    });
    const [termss, termsCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(termss, args, {
        arrayLength: termsCount,
        sliceStart: offset || 0,
      }),
      totalCount: termsCount,
    };
  }

  async create(
    data: TermsCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<TermsPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!data.nameEn && !data.nameCht) throw new Error('Name required');
      const terms = this.termsRepository.create();

      if (data.nameEn) terms.nameEn = data.nameEn;
      if (data.nameCht) terms.nameCht = data.nameCht;

      if (data.descEn) terms.descEn = data.descEn;
      if (data.descCht) terms.descCht = data.descCht;

      const lastSort = await this.termsRepository.findOne({
        where: { deleted: false },
        order: { sort: 'DESC' },
      });

      terms.sort = lastSort ? lastSort.sort + 1 : 0;

      terms.createAt = Date.now();

      await queryRunner.manager.save(terms);

      await queryRunner.commitTransaction();

      return {
        terms: await terms.save(),
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
    data: TermsUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<TermsPayload> {
    try {
      const terms = await this.termsRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.nameEn) terms.nameEn = data.nameEn;
      if (data.nameCht) terms.nameCht = data.nameCht;
      if (data.descEn) terms.descEn = data.descEn;
      if (data.descCht) terms.descCht = data.descCht;
      if (data.sort !== undefined) terms.sort = data.sort;
      if (data.preset !== undefined) terms.preset = data.preset;
      if (data.show !== undefined) terms.show = data.show;
      if (data.deleted !== undefined) terms.deleted = data.deleted;
      terms.editAt = Date.now();

      return {
        terms: await terms.save(),
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

  async delete(
    data: TermsUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<TermsPayload> {
    try {
      const terms = await this.termsRepository.findOneOrFail(fromGlobalId(data.id).id);
      terms.editAt = Date.now();

      return {
        terms: await terms.save(),
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
