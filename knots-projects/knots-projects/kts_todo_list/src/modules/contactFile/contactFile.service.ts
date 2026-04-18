import {fromGlobalId} from 'graphql-relay';
import {Inject, Service} from 'typedi';
import {getConnection} from 'typeorm';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {LoggedInUser} from '../shared/middleware/currentUser';
import {AppSettingService} from '../appSetting/appSetting.service';
import { ContactFileDeleteInput } from './input/contactFileDelete.input';
import { ContactFileDeletePayload } from './payload/contactFileDelete.payload';
import { ContactFileRepository } from './contactFile.repository';

@Service()
export class ContactFileService {
  constructor(
    @InjectRepository()
    private readonly contactFileRepository: ContactFileRepository,
    @Inject(type => AppSettingService)
    private readonly appSettingService: AppSettingService,
  ) {
  }

  async delete(
    user: LoggedInUser,
    data: ContactFileDeleteInput,
  ): Promise<ContactFileDeletePayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contactFile = await this.contactFileRepository.findOneOrFail(
        fromGlobalId(data.id).id,
      );
      contactFile.deleted = true;
      await queryRunner.manager.save(contactFile);
      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        contactFile: contactFile,
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
