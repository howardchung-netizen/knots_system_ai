import { Enforcer } from 'casbin';
import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Inject, Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PdfArgs, PdfSortField, SortOrder } from './args/pdf.args';
import { PdfConnection } from './connection/pdf.connection';
import { PdfRepository } from './pdf.repository';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { Pdf } from './pdf.entity';
import { PdfCreateInput } from './input/pdfCreate.input';
import { PdfPayload } from './payload/pdf.payload';
import { getConnection } from 'typeorm';
import { operationLogChanges, OperationLogService } from '../operationLog/operationLog.service';
import { ProjectRepository } from '../project/project.repository';
import { PdfUpdateInput } from './input/pdfUpdate.input';
import { PdfDeleteInput } from './input/pdfDelete.input';
import { PdfDeletePayload } from './payload/pdfDelete.payload';
import { DataAction, OperationAction } from '../task/task.entity';
@Service()
export class PdfService {
  constructor(
    @InjectRepository()
    private readonly pdfRepository: PdfRepository,
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
    @Inject(type => OperationLogService)
    private readonly operationLogService: OperationLogService,
  ) {
  }

  async getMany(
    args: PdfArgs,
    user: LoggedInUser,
    extraArgs: { [index: string]: any } = {},
    enforcer: Enforcer,
  ): Promise<PdfConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.pdfRepository.createQueryBuilder();

    if (args.id) {
      queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    };

    if (args.projectId) {
      queryBuilder.andWhere('project_id = :projectId', { projectId: args.projectId });
    };

    if (args.name) {
      queryBuilder.andWhere(`name like '%:name%'`, { name: fromGlobalId(args.name).id });
    };

    if (args.remarks) {
      queryBuilder.andWhere('remarks = :remarks', { remarks: args.remarks });
    };

    queryBuilder.andWhere('deleted = :deleted', { deleted: false });

    queryBuilder.skip(offset).take(limit);

    let sortField: string = 'created_at';
    if (args.sortField) {
      switch (args.sortField) {
        case PdfSortField.PROJECT_ID:
          sortField = 'project_id';
          break;
        case PdfSortField.NAME:
          sortField = 'name';
          break;
        case PdfSortField.VERSION:
          sortField = 'version';
          break;
        case PdfSortField.REMARKS:
          sortField = 'remarks';
          break;
      }
    }

    let sortOrder: 'ASC' | 'DESC' = 'DESC';
    if (args.sortOrder) {
      switch (args.sortOrder) {
        case SortOrder.ASC:
          sortOrder = 'ASC';
          break;
        case SortOrder.DESC:
          sortOrder = 'DESC';
          break;
      }
    }

    const [pdfs, pdfCount] = await queryBuilder.orderBy(sortField, sortOrder).getManyAndCount();
    return {
      ...connectionFromArraySlice(pdfs, args, {
        arrayLength: pdfCount,
        sliceStart: offset || 0,
      }),
      totalCount: pdfCount,
    };
  }

  // async generatePdfShareCode(
  //   data: PdfShareCodeInput,
  //   currentUser?: LoggedInUser,
  // ): Promise<PdfShareCodePayload> {
  //   try {

  //     const pdf = await this.pdfRepository.findOne({ id: fromGlobalId(data.pdfId).id });
  //     if (!pdf) throw new Error('pdf not found.');

  //     const expiredTime = moment().add(30, 'minutes').toDate();
  //     const code = await createToken({ pdfId: toGlobalId(Pdf.name, pdf.id) }, { expiresIn: `${1000 * 60 * 30}ms` });

  //     pdf.shareCode = code;
  //     pdf.shareEndTime = expiredTime;
  //     await pdf.save();

  //     return {
  //       userErrors: [],
  //       pdfShareCode: code,
  //     }
  //   } catch (error: any) {
  //     logger.error(error.message);
  //     return {
  //       userErrors: [{
  //         message: error.message,
  //         field: [],
  //       }]
  //     }
  //   }
  // }

  // async pdfShareCodeDelete(
  //   data: PdfShareCodeInput,
  //   currentUser?: LoggedInUser,
  // ): Promise<PdfShareCodeDeletePayload> {
  //   try {

  //     const pdf = await this.pdfRepository.findOne({ id: fromGlobalId(data.pdfId).id });
  //     if (!pdf) throw new Error('pdf not found.');
  //     pdf.shareCode = null;
  //     pdf.shareEndTime = null;
  //     await pdf.save();

  //     return {
  //       userErrors: [],
  //     }
  //   } catch (error: any) {
  //     logger.error(error.message);
  //     return {
  //       userErrors: [{
  //         message: error.message,
  //         field: [],
  //       }],
  //     }
  //   }
  // }

  async create(
    data: PdfCreateInput,
    user: LoggedInUser,
  ): Promise<PdfPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pdf = this.pdfRepository.create();
      const changes: Array<{ [key: string]: operationLogChanges }> = [];

      const project = await this.projectRepository.findOne({ id: data.projectId.toString() });
      if (!project) throw new Error('Project does not exist.');
      pdf.projectId = Number(project.id);
      changes.push({ projectId: { action: DataAction.ADD, newValue: pdf.projectId.toString() }});

      pdf.name = data.name;
      changes.push({ name: { action: DataAction.ADD, newValue: pdf.name }});

      if (data.remarks) {
        pdf.remarks = data.remarks;
        changes.push({ remarks: { action: DataAction.ADD, newValue: pdf.remarks }});
      }

      await queryRunner.manager.save(pdf);

      await this.operationLogService.save({
        operator: user,
        object: pdf,
        action: OperationAction.CREATE,
        changes: changes,
      }, queryRunner.manager);

      await queryRunner.commitTransaction();

      return {
        userErrors: [],
        pdf: pdf,
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error.message);
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

  async update(
    data: PdfUpdateInput,
    user: LoggedInUser,
  ): Promise<PdfPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pdf = await this.pdfRepository.findOne({ id: fromGlobalId(data.id).id });
      if (!pdf) throw new Error('Pdf does not exists.');
      let oldPdf: Pdf | undefined;
      oldPdf = this.pdfRepository.create({ ...pdf });
      const changes: Array<{ [key: string]: operationLogChanges }> = [];

      if (data.projectId) {
        const project = await this.projectRepository.findOne({ id: data.projectId.toString() });
        if (!project) throw new Error('Project does not exist.');
        pdf.projectId = Number(project.id);
        changes.push({ projectId: { action: DataAction.CHANGE, originalValue: oldPdf.projectId.toString(), newValue: pdf.projectId.toString() }});
      }

      if (data.name) {
        pdf.name = data.name;
        changes.push({ name: { action: DataAction.CHANGE, originalValue: oldPdf.name, newValue: pdf.name }});
      }

      if (data.remarks) {
        pdf.remarks = data.remarks;
        changes.push({ remarks: { action: DataAction.CHANGE, originalValue: oldPdf.remarks, newValue: pdf.remarks }});
      }

      await queryRunner.manager.save(pdf);

      await this.operationLogService.save({
        operator: user,
        object: pdf,
        action: OperationAction.UPDATE,
        changes: changes,
      }, queryRunner.manager);

      await queryRunner.commitTransaction();

      return {
        userErrors: [],
        pdf: pdf,
      }
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error.message);
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

  async delete(
    data: PdfDeleteInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<PdfDeletePayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const pdf = await this.pdfRepository.findOne(fromGlobalId(data.id).id);
      if (!pdf || pdf.deleted) throw new Error('Pdf does not exist.');
      pdf.deleted = true;

      await queryRunner.manager.save(pdf);

      await this.operationLogService.save({
        operator: user,
        object: pdf,
        action: OperationAction.DELETE,
      }, queryRunner.manager);

      await queryRunner.commitTransaction();

      return {
        userErrors: [],
        deletedPdfId: pdf.id,
      }
    } catch (error: any) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
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
}
