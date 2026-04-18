import {fromGlobalId} from 'graphql-relay';
import {Inject, Service} from 'typedi';
import {getConnection} from 'typeorm';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {LoggedInUser} from '../shared/middleware/currentUser';
import {AppSettingService} from '../appSetting/appSetting.service';
import { ProjectOrderFileDeleteInput } from './input/projectOrderFileDelete.input';
import { ProjectOrderFileDeletePayload } from './payload/projectOrderFileDelete.payload';
import { ProjectOrderFileRepository } from './projectOrderFile.repository';

@Service()
export class ProjectOrderFileService {
  constructor(
    @InjectRepository()
    private readonly projectOrderFileRepository: ProjectOrderFileRepository,
    @Inject(type => AppSettingService)
    private readonly appSettingService: AppSettingService,
  ) {
  }

  async delete(
    user: LoggedInUser,
    data: ProjectOrderFileDeleteInput,
  ): Promise<ProjectOrderFileDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const projectOrderFile = await this.projectOrderFileRepository.findOneOrFail(
        fromGlobalId(data.id).id,
      );
      projectOrderFile.deleted = true;
      await queryRunner.manager.save(projectOrderFile);
      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        projectOrderFile: projectOrderFile,
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
