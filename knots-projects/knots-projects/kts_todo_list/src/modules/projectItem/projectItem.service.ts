import { connectionFromArraySlice, fromGlobalId, toGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ProjectItemRepository } from './projectItem.repository';
import { ProjectItemArgs } from './args/projectItem.args';
import { ProjectItemConnection } from './connection/projectItem.connection';
import { ProjectItemUpdateInput } from './input/projectItemUpdate.input';
import { Enforcer } from 'casbin';
import { ProjectItemPayload } from './payload/projectItem.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { ProjectItemCreateInput } from './input/projectItemCreate.input';
import { logger } from '../../lib/logger';
import { getConnection } from 'typeorm';
import { ProjectRepository } from '../project/project.repository';
import { MeasurementRepository } from '../measurement/measurement.repository';
import { ProjectItemSortInput } from './input/projectItemSort.input';
import { ProjectItemSortPayload } from './payload/projectItemSort.payload';
import { Measurement } from '../measurement/measurement.entity';

@Service()
export class ProjectItemService {
  constructor(
    @InjectRepository()
    private readonly projectItemRepository: ProjectItemRepository,
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
    @InjectRepository()
    private readonly measurementRepository: MeasurementRepository,
  ) {
  }

  async getMany(args: ProjectItemArgs, extraArgs: { [index: string]: any } = {}): Promise<ProjectItemConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.projectItemRepository
      .createQueryBuilder('project_info');
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.nameEn) queryBuilder.andWhere(`name_en LIKE '%:nameEn%'`, { nameEn: args.nameEn });
    if (args.nameCht) queryBuilder.andWhere(`name_cht LIKE '%:nameCht%'`, { nameCht: args.nameCht });
    if (args.upper !== undefined) queryBuilder.andWhere('upper = :upper', { upper: args.upper });
    if (args.show !== undefined) queryBuilder.andWhere('`show` = :show', { show: args.show });
    if (args.delete !== undefined) queryBuilder.andWhere('`delete` = :delete', { delete: args.delete });

    queryBuilder.skip(offset).take(limit).orderBy('sort', 'ASC');
    const [projectItems, projectItemCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(projectItems, args, {
        arrayLength: projectItemCount,
        sliceStart: offset || 0,
      }),
      totalCount: projectItemCount,
    };
  }

  async create(
    data: ProjectItemCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectItemPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const projectItem = this.projectItemRepository.create();
      let upperItem;
      if (data.remark) projectItem.remark = data.remark;
      if (data.upperId && data.upperId!== '0') {
         upperItem = await this.projectItemRepository.findOne({
          id: fromGlobalId(data.upperId).id,
        });
        if (!upperItem) throw new Error('Upper item invalid');
        projectItem.upper = Number(upperItem.id);
        projectItem.upperNameEn = upperItem.nameEn;
        projectItem.upperNameCht = upperItem.nameCht;
        projectItem.level = parseInt(upperItem.level.toString()) + 1;

      }
      projectItem.nameEn = data.nameEn;
      projectItem.nameCht = data.nameCht;
      if (data.descEn) projectItem.descEn = data.descEn;
      if (data.descCht) projectItem.descCht = data.descCht;

      if (data.unitId) {
        const unit = await this.measurementRepository.findOneOrFail({
          id: fromGlobalId(data.unitId).id,
        });
        projectItem.unit = Number(unit.id);
        projectItem.unitEn = unit.nameEn;
        projectItem.unitCht = unit.nameCht;
      }

      let prices: { id: number, desc: string, desc_en: string, desc_cht: string, price: string, delete: number, unitId: string | null }[] = [];
      data.prices?.map((e, i) => {
        prices.push({
          id: i,
          desc: '',
          desc_en: e.desc_en || '',
          desc_cht: e.desc_cht || '',
          price: String(e.price) || '',
          delete: 0,
          unitId: e.unitId || null,
        });
      });
      projectItem.price = prices.length ? JSON.stringify(prices) : undefined;
      projectItem.activePrice = prices.length;
      projectItem.createAt = Date.now();

      await queryRunner.manager.save(projectItem);
      if(upperItem) {
        let upperLower = upperItem.lower === '0' ? [projectItem.id] : [...upperItem.lower.split(','), projectItem.id];
        upperItem.lower = upperLower.join(',');
        await upperItem.save();
      }
      await queryRunner.commitTransaction();

      return {
        projectItem: await projectItem.save(),
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
    data: ProjectItemUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<ProjectItemPayload> {
    try {
      const projectItem = await this.projectItemRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.remark !== undefined) projectItem.remark = data.remark;
      
      if (data.upperId && data.upperId !== '0' && fromGlobalId(data.upperId).id !== projectItem.upper.toString()) {

        const upperItem = await this.projectItemRepository.findOne({
          id: fromGlobalId(data.upperId).id,
        });
        if (!upperItem || upperItem.id == projectItem.id) throw new Error('Upper item invalid');

        let upperLower = upperItem.lower === '0' ? [projectItem.id] : [...upperItem.lower.split(','), projectItem.id];
        upperItem.lower = upperLower.join(',');
        await upperItem.save();

        if (projectItem.upper != 0) {
          const oldUpperItem = await this.projectItemRepository.findOne({ id: projectItem.upper.toString() });
          if (!oldUpperItem) throw new Error('Old upper item item invalid');

          let oldUpperLower = oldUpperItem.lower.split(',').filter(e => e != projectItem.id);
          oldUpperItem.lower = oldUpperLower.join(',');
          if (oldUpperItem.lower.length == 0) oldUpperItem.lower = '0';
          await oldUpperItem.save();
        }

        projectItem.upper = Number(upperItem.id);
        projectItem.upperNameEn = upperItem.nameEn;
        projectItem.upperNameCht = upperItem.nameCht;
        projectItem.level = (data.upperId === '0' || !data.upperId) ? 0 : 1;

      }
      else if (data.upperId == '0'){
        if (projectItem.upper != 0) {
          const oldUpperItem = await this.projectItemRepository.findOne({ id: projectItem.upper.toString() });
          if (!oldUpperItem) throw new Error('Old upper item item invalid');
          let oldUpperLower = oldUpperItem.lower.split(',').filter(e => e != projectItem.id);
          oldUpperItem.lower = oldUpperLower.join(',');
          if (oldUpperItem.lower.length == 0) oldUpperItem.lower = '0';
          await oldUpperItem.save();
        }
        projectItem.upper = 0;
        projectItem.upperNameEn = undefined;
        projectItem.upperNameCht = undefined;
        projectItem.level = 0;
      }

      if (data.nameEn) projectItem.nameEn = data.nameEn;
      if (data.nameCht) projectItem.nameCht = data.nameCht;
      if (data.descEn) projectItem.descEn = data.descEn;
      if (data.descCht) projectItem.descCht = data.descCht;

      if (data.unitId && (fromGlobalId(data.unitId).id != '0') && (fromGlobalId(data.unitId).id != null)){
        const unit = await this.measurementRepository.findOneOrFail({
          id: fromGlobalId(data.unitId).id,
        });
        projectItem.unit = Number(unit.id);
        projectItem.unitEn = unit.nameEn;
        projectItem.unitCht = unit.nameCht;
      }

      if (data.prices?.length) {
        let prices: { id: number, desc: string, desc_en: string, desc_cht: string, price: string, delete: number, unitId: string | null }[] = [];
        data.prices?.map((e, i) => {
          prices.push({
            id: i,
            desc: '',
            desc_en: e.desc_en || '',
            desc_cht: e.desc_cht || '',
            price: String(e.price) || '',
            delete: 0,
            unitId: e.unitId || null,
          });
        });
        projectItem.price = prices.length ? JSON.stringify(prices) : undefined;
        projectItem.activePrice = prices.length;
      }

      if (data.delete == true) {
        if (projectItem.upper != 0) {
          const upperItem = await this.projectItemRepository.findOne({
            id: projectItem.upper.toString(),
          });
          if (upperItem) {
            upperItem.lower = upperItem.lower.split(',').filter(e => e != projectItem.id).toString();
            if (upperItem.lower.length == 0) upperItem.lower = '0';
            await upperItem.save();
            projectItem.upper = 0;
          }
        }
        else if (projectItem.lower !== '0') {
          throw new Error('This item has lower item, please delete lower item first');
        }
        projectItem.delete = true;
      }

      projectItem.editAt = Date.now();

      return {
        projectItem: await projectItem.save(),
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
    data: ProjectItemSortInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<ProjectItemSortPayload> {
    try {

      const ids = data.sort.map(item => fromGlobalId(item.id).id);
      const projectItems = await this.projectItemRepository.findByIds(ids);
      // Create a map to update sort values
      const sortMap = new Map(data.sort.map(item => [fromGlobalId(item.id).id, item.sort]));

      // Update the sort values in memory
      projectItems.forEach(projectItem => {
        const newSort = sortMap.get(projectItem.id);
        if (newSort !== undefined) {
          projectItem.sort = newSort;
          projectItem.editAt = Date.now();
        }
      });

      // Save all updated entities in a single bulk operation
      await this.projectItemRepository.save(projectItems);

      return {
        result: true,
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

  async initProjectItemPrice() : Promise<ProjectItemSortPayload> {
    const projectItems = await this.projectItemRepository.find();

    await Promise.all(projectItems.map(async (projectItem) => {

      if (projectItem.price) {
        let prices = JSON.parse(projectItem.price);
        let p = await Promise.all(prices.map(async (price: { id: number, desc: string, desc_en: string, desc_cht: string, price: string, delete: number, unitId: string | null }) => {
          if (projectItem.unit) {
            const unit = await this.measurementRepository.findOneOrFail({
              id: projectItem.unit.toString(),
            });
            price.unitId = toGlobalId(Measurement.name, String(unit.id));
          }
          return price;
        }));
  
        projectItem.price = JSON.stringify(p);
        await projectItem.save();
      }
    }));

    return {
      result: true,
      userErrors: []
    };
  }
}
