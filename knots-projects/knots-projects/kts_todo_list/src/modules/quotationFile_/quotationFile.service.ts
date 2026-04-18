import {fromGlobalId} from 'graphql-relay';
import {Inject, Service} from 'typedi';
import {getConnection} from 'typeorm';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {LoggedInUser} from '../shared/middleware/currentUser';
import {AppSettingService} from '../appSetting/appSetting.service';
import { QuotationFileDeleteInput } from './input/quotationFileDelete.input';
import { QuotationFileDeletePayload } from './payload/quotationFileDelete.payload';
import { QuotationFileRepository } from './quotationFile.repository';


@Service()
export class QuotationFileService {
  constructor(
    @InjectRepository()
    private readonly quotationFileRepository: QuotationFileRepository,
    @Inject(type => AppSettingService)
    private readonly appSettingService: AppSettingService,
  ) {
  }

  async delete(
    user: LoggedInUser,
    data: QuotationFileDeleteInput,
  ): Promise<QuotationFileDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const quotationFile = await this.quotationFileRepository.findOneOrFail(
        fromGlobalId(data.id).id,
      );
      quotationFile.deleted = true;
      await queryRunner.manager.save(quotationFile);
      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        quotationFile: quotationFile,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      return {
        userErrors: [
          {
            message: error.message,
            field: ['id'],
          },
        ],
      };
    } finally {
      await queryRunner.release();
    }
  }
}
