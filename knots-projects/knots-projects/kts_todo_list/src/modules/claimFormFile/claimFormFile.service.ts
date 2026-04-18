import {fromGlobalId} from 'graphql-relay';
import {Inject, Service} from 'typedi';
import {getConnection} from 'typeorm';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {LoggedInUser} from '../shared/middleware/currentUser';
import {AppSettingService} from '../appSetting/appSetting.service';
import { ClaimFormFileDeleteInput } from './input/claimFormFileDelete.input';
import { ClaimFormFileDeletePayload } from './payload/claimFormFileDelete.payload';
import { ClaimFormFileRepository } from './claimFormFile.repository';

@Service()
export class ClaimFormFileService {
  constructor(
    @InjectRepository()
    private readonly claimFormFileRepository: ClaimFormFileRepository,
    @Inject(type => AppSettingService)
    private readonly appSettingService: AppSettingService,
  ) {
  }

  async delete(
    user: LoggedInUser,
    data: ClaimFormFileDeleteInput,
  ): Promise<ClaimFormFileDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const claimFormFile = await this.claimFormFileRepository.findOneOrFail(
        fromGlobalId(data.id).id,
      );
      claimFormFile.deleted = true;
      await queryRunner.manager.save(claimFormFile);
      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        claimFormFile: claimFormFile,
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
