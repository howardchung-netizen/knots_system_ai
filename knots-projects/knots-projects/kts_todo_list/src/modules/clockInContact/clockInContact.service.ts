import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ClockInContactsArgs} from './args/clockInContacts.args';
import { ClockInContactConnection } from './connection/clockInContact.connection';
import { ClockInContactRepository } from './clockInContact.repository';
import { ClockInContactInput } from './input/clockInContact.input';
import { ClockInContact } from './clockInContact.entity';
import { logger } from '../../lib/logger';
import { ClockInContactPayload } from './payload/clockInContact.payload';
import { getConnection } from 'typeorm';
import { base64FileToLocal, uploadToLocal } from '../../lib/storage';
import { ClockInContactFile } from '../clockInContactFile/clockInContactFile.entity';
import { ClockInContactFileRepository } from '../clockInContactFile/clockInContactFile.repository';

@Service()
export class ClockInContactService {
  constructor(
    @InjectRepository()
    private readonly clockInContactRepository: ClockInContactRepository,
    @InjectRepository()
    private readonly clockInContactFileRepository: ClockInContactFileRepository,
  ) {
  }

  async getManyInConnection(args: ClockInContactsArgs): Promise<ClockInContactConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.clockInContactRepository.createQueryBuilder('ClockInContact');
    if (args.tel) {
      queryBuilder.where(`tel = :tel`, {
        tel: args.tel
      });
    }

    // queryBuilder.skip(offset).take(limit);
    const [clockInContacts, clockInContactCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(clockInContacts, args, {
        arrayLength: clockInContactCount,
        sliceStart: offset || 0,
      }),
      totalCount: clockInContactCount,
    };
  }

  async save(
    data: ClockInContactInput,
  ): Promise<ClockInContactPayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
      let clockInContact = await this.clockInContactRepository.findOne({tel: data.tel});
      if(!clockInContact) clockInContact = new ClockInContact();
      if(clockInContact?.tel != data.tel) clockInContact.tel = data.tel;
      clockInContact.tel = data.tel;
      clockInContact.name = data.name??'';
      clockInContact.nameEng = data.nameEng??'';
      clockInContact.address = data.address??'';
      clockInContact.remark = data.remark??'';

      if(data.deleteFile && data.deleteFile.length) {
        await Promise.all(
          data.deleteFile.map(async e => {
            let clockInContactFile = await this.clockInContactFileRepository.findOne(fromGlobalId(e).id);
            if(clockInContactFile) {
              clockInContactFile.deleted = true;
              await queryRunner.manager.save(clockInContactFile);
            }
           
          })
        )
      }
      
      await queryRunner.manager.save(clockInContact);

      if (data.clockInContactFiles && data.clockInContactFiles.length) {
        await Promise.all(
          data.clockInContactFiles.map(async e => {
            const { path: filePath, mimeType: fileMimeType, type: fileType, filename: filename } = await uploadToLocal(await e, 'ClockInContactFile');
            const clockInContactFile = new ClockInContactFile();
            clockInContactFile.clockInContactFilePath = filePath;
            clockInContactFile.fileMimeType = fileMimeType;
            clockInContactFile.tel = clockInContact?.tel!;
            await queryRunner.manager.save(clockInContactFile);
          })
        )
      }
      await queryRunner.commitTransaction();
      return {
        userErrors: [],
        clockInContact: clockInContact,
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
