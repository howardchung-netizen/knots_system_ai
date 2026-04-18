import { connectionFromArraySlice, fromGlobalId, toGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { PdfShareConnection } from './connection/pdfShare.connection';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { createToken, decryptToken } from '../../lib/jwt';
import { PdfShare } from './pdfShare.entity';
import moment from 'moment-timezone';
import { PdfRepository } from '../pdf/pdf.repository';
import { PdfShareArgs } from './args/pdfShare.args';
import { PdfShareRepository } from './pdfShare.repository';
import { PdfCheckShareArgs } from './args/pdfCheckShare.args';
import { PdfShareGenerateInput } from './input/pdfShareGenerate.input';
import { PdfSharePayload } from './payload/pdfShare.payload';
import { PdfShareDisableInput } from './input/pdfShareDisable.input';
import { Pdf } from '../pdf/pdf.entity';
import { PdfShareDisablePayload } from './payload/pdfShareDisable.payload';
import { PdfShareCheckCodePayload } from './payload/pdfShareCheckCode.payload';
import { ProjectRepository } from '../project/project.repository';
import { Project } from '../project/project.entity';
@Service()
export class PdfService {
  constructor(
    @InjectRepository()
    private readonly pdfRepository: PdfRepository,
    @InjectRepository()
    private readonly pdfShareRepository: PdfShareRepository,
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
  ) {
  }

  async getShareInConnection(args: PdfShareArgs): Promise<PdfShareConnection> {
    const pdf: Pdf | undefined = await this.pdfRepository.findOne({ projectId: args.projectId });
    if (!pdf) {
      return {
        ...connectionFromArraySlice([], args, {
          arrayLength: 0,
          sliceStart: 0 || 0,
        }),
        totalCount: 0,
      };
    }
    const queryBuilder = this.pdfShareRepository
      .createQueryBuilder('pdfShare')
      .where('`is_deleted` = 0')
      .orderBy({
        'created_at': 'ASC',
      });
    if (args.pdfId) {
      queryBuilder.andWhere('pdf_id = :pdfId', { pdfId: fromGlobalId(args.pdfId).id });
    } else {
      queryBuilder.andWhere('pdf_id = :pdfId', { pdfId: pdf.id });
    }
    const [pdfShare, pdfShareCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(pdfShare, args, {
        arrayLength: pdfShareCount,
        sliceStart: 0 || 0,
      }),
      totalCount: pdfShareCount,
    };
  }

  async checkShareCode(args: PdfCheckShareArgs, user?: LoggedInUser,): Promise<PdfShareCheckCodePayload> {
    try {
      let pdfShare: PdfShare | undefined;
      let pdf: Pdf | undefined;
      let project: Project | undefined;
      if (args.code) {
        await decryptToken(args.code);
        pdfShare = await this.pdfShareRepository.findOneOrFail({ code: args.code, isDeleted: false });
        pdf = await this.pdfRepository.findOneOrFail({ id: pdfShare.pdfId });
        project = await this.projectRepository.findOneOrFail({ id: pdf.projectId.toString() });
      } else if (args.pdfId) {
        pdf = await this.pdfRepository.findOneOrFail({ id: fromGlobalId(args.pdfId).id });
        project = await this.projectRepository.findOneOrFail({ id: pdf.projectId.toString() });
      } else {
        throw new Error('args requried');
      }

      return {
        userErrors: [],
        result: true,
        project: project.code,
        name: pdf.name,
      }
    } catch (error: any) {
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }],
        result: false,
      };
    }
  }

  async generateCode(
    data: PdfShareGenerateInput,
    currentUser?: LoggedInUser,
  ): Promise<PdfSharePayload> {
    try {

      const pdf: Pdf | undefined = await this.pdfRepository.findOne({ id: fromGlobalId(data.pdfId).id });
      if (!pdf) throw new Error('Pdf does not exist');
      const dayDiff = moment(data.expiredDate).diff(moment().startOf('day'), 'days');
      const code = await createToken({ pdfId: toGlobalId(Pdf.name, pdf.id) }, { expiresIn: `${86400000 * dayDiff}ms` });

      const pdfShare: PdfShare | undefined = PdfShare.create();
      pdfShare.pdfId = pdf.id;
      pdfShare.code = code;
      pdfShare.expiredTime = moment().add(dayDiff, 'days').toDate();
      if (data.remark) pdfShare.remark = data.remark;

      await pdfShare.save();

      return {
        userErrors: [],
        pdfShare: pdfShare,
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

  async disableCode(
    data: PdfShareDisableInput,
    currentUser?: LoggedInUser,
  ): Promise<PdfShareDisablePayload> {
    try {

      const pdfShare = await this.pdfShareRepository.findOne({ id: fromGlobalId(data.id).id });
      if (!pdfShare) throw new Error('Unvalid ID');

      pdfShare.isDeleted = true;

      await pdfShare.save();

      return {
        userErrors: [],
        deletedPdfShareId: data.id,
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
