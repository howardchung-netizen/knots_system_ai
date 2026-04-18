import {fromGlobalId} from 'graphql-relay';
import {Inject, Service} from 'typedi';
import {getConnection} from 'typeorm';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {LoggedInUser} from '../shared/middleware/currentUser';
import {AppSettingService} from '../appSetting/appSetting.service';
import { ClockInContactFileDeleteInput } from './input/clockInContactFileDelete.input';
import { ClockInContactFileDeletePayload } from './payload/clockInContactFileDelete.payload';
import { ClockInContactFileRepository } from './clockInContactFile.repository';

@Service()
export class ClockInContactFileService {
  constructor(
    @InjectRepository()
    private readonly clockInContactFileRepository: ClockInContactFileRepository,
    @Inject(type => AppSettingService)
    private readonly appSettingService: AppSettingService,
  ) {
  }

  async delete(
    user: LoggedInUser,
    data: ClockInContactFileDeleteInput,
  ): Promise<ClockInContactFileDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const clockInContactFile = await this.clockInContactFileRepository.findOneOrFail(
        fromGlobalId(data.id).id,
      );
      clockInContactFile.deleted = true;
      await queryRunner.manager.save(clockInContactFile);
      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        clockInContactFile: clockInContactFile,
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
