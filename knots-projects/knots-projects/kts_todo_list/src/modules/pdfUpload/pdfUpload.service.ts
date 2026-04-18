import { Inject, Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PdfUploadRepository } from './pdfUpload.repository';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { PdfUploadCreateInput } from './input/pdfUploadCreate.input';
import { logger } from '../../lib/logger';
import {Request} from 'express';
import { PdfUploadPayload } from './payload/pdfUpload.payload';
import { uploadToLocal } from '../../lib/storage';
import { PdfRepository } from '../pdf/pdf.repository';
import { decryptToken } from '../../lib/jwt';
import moment from 'moment-timezone';
import { fromGlobalId } from 'graphql-relay';
import { getConnection } from 'typeorm';
import { PdfUploadDeleteInput } from './input/pdfUploadDelete.input';
import { Enforcer } from 'casbin';
import { PdfUploadDeletePayload } from './payload/pdfUploadDelete.payload';
import { RoleService } from '../admin/role/role.service';
import { Pdf } from '../pdf/pdf.entity';
import { PdfShareRepository } from '../pdfShare/pdfShare.repository';

@Service()
export class PdfUploadService {
  constructor(
    @InjectRepository()
    private readonly pdfRepository: PdfRepository,
    @InjectRepository()
    private readonly pdfUploadRepository: PdfUploadRepository,
    @InjectRepository()
    private readonly pdfShareRepository: PdfShareRepository,
    @Inject(type => RoleService)
    private readonly roleService: RoleService,
  ) {
  }

  async upload(
    data: PdfUploadCreateInput,
    user: LoggedInUser,
    req: Request,
  ): Promise<PdfUploadPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let pdf: Pdf | undefined;
      if (!user || data.share) {
        if(!data.code) throw new Error('code required');
        const deCode: { [index: string]: any } = await decryptToken(data.code);
        if (!deCode.pdfId) throw new Error('Invalid Code');
        const pdfShare = await this.pdfShareRepository.findOne({ code: data.code, isDeleted: false });
        if (!pdfShare) throw new Error('code invalid.');
        if (moment().isAfter(moment(pdfShare.expiredTime))) throw new Error('code expired.');
        pdf = await this.pdfRepository.findOne({ id: pdfShare.pdfId });
        if (!pdf) throw new Error('PDF not found.');
      } else {
        if(!data.pdfId) throw new Error('pdfId required');
        pdf = await this.pdfRepository.findOne({ id: fromGlobalId(data.pdfId).id });
        if (!pdf) throw new Error('PDF not found.');
      }

      const pdfUpload = this.pdfUploadRepository.create();
      pdfUpload.pdfId = pdf.id;

      const { path: filePath } = await uploadToLocal(await data.file, 'pdfUpload');
      pdfUpload.filePath = filePath;

      pdfUpload.ip = (Array.isArray(req.headers['x-forwarded-for'])? req.headers['x-forwarded-for']?.shift() : req.headers['x-forwarded-for']) || req.socket.remoteAddress || undefined;

      await queryRunner.manager.save(pdfUpload);

      await queryRunner.commitTransaction();

      return {
        userErrors: [],
        pdfUpload: pdfUpload,
      };

    } catch (error: any) {
      logger.error(error);
      await queryRunner.rollbackTransaction();
      return {
        userErrors: [{
          message: error.message,
          field: ['id'],
        }],
      };
    } finally {
      await queryRunner.release();
    }
  }

  async delete(
    data: PdfUploadDeleteInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<PdfUploadDeletePayload> {
    try {
      const pdfUpload = await this.pdfUploadRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (!pdfUpload || pdfUpload.isDeleted) {
        throw new Error('Pdf Upload does not exist');
      }

      const userRole = await this.roleService.getRoles(user.id, enforcer);
      const hasDeletePermission = userRole.some(v => ['admin'].includes(v.name));
      if (!hasDeletePermission) {
        throw new Error(`You don't have permission to delete!`);
      }

      pdfUpload.deleted = true;

      return {
        userErrors: [],
        deletedPdfUploadId: (await pdfUpload.save()).id,
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }
}
