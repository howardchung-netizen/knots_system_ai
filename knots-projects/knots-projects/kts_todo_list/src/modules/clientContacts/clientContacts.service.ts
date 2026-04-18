import {connectionFromArraySlice, fromGlobalId} from 'graphql-relay';
import {Inject, Service} from 'typedi';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {logger} from '../../lib/logger';
import { Not, getConnection } from 'typeorm';
import { ClientContactsRepository } from './clientContacts.repository';
import { ClientContactsArgs } from './args/clientContacts.args';
import { ClientContactsCreateInput } from './input/clientContactsCreate.input';
import { ClientContactsPayload } from './payload/clientContacts.payload';
import { ClientContactsUpdateInput } from './input/clientContactsUpdate.input';
import { ClientContactsConnection } from './connection/clientContacts.connection';
import { uuid } from 'uuidv4';
import { ClientContactsDeleteInput } from './input/clientContactsDelete.input';
import moment from 'moment-timezone';
import { PubSubEngine } from 'type-graphql';
import { MutationType } from '../common/subscriptionPayload.type';
import { ContactFile } from '../contactFile/contactFile.entity';
import { ContactFileRepository } from '../contactFile/contactFile.repository';
import { uploadToLocal } from '../../lib/storage';

@Service()
export class ClientContactsService {
  constructor(
    @InjectRepository()
    private readonly clientContactsRepository: ClientContactsRepository,
    @InjectRepository()
    private readonly contactFileRepository: ContactFileRepository,
    @Inject('pubSub')
    private readonly pubSub: PubSubEngine,
  ) {
  }


  async getManyInConnection(args: ClientContactsArgs, extraArgs: { [index: string]: any } = {}): Promise<ClientContactsConnection> {
    const queryBuilder = this.clientContactsRepository
      .createQueryBuilder();

    if (args.uuid) {
      queryBuilder.andWhere('uuid = :uuid', { uuid: args.uuid });
    }

    if (args.nameEn) {
      queryBuilder.andWhere('name_en = :nameEn', { nameEn: args.nameEn });
    }

    if (args.nameCht) {
      queryBuilder.andWhere('name_cht = :nameCht', { nameCht: args.nameCht });
    }

    if (args.email) {
      queryBuilder.andWhere('email = :email', { email: args.email });
    }

    if (args.tel) {
      queryBuilder.andWhere('tel = :tel', { tel: args.tel });
    }

    if (args.whatsapp) {
      queryBuilder.andWhere('whatsapp = :whatsapp', { whatsapp: args.whatsapp });
    }

    if (args.wechat) {
      queryBuilder.andWhere('wechat = :wechat', { wechat: args.wechat });
    }

    if(args.deleted === false) {
      queryBuilder.andWhere('deleted = :deleted', { deleted: args.deleted });
    }

    const {limit, offset} = args.pagingParams();

    queryBuilder.skip(offset).take(limit).orderBy({
      'id': 'DESC',
    });

    const [data, dataCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(data, args, {
        arrayLength: dataCount,
        sliceStart: offset || 0,
      }),
      totalCount: dataCount,
    };
  }

  async create(data: ClientContactsCreateInput): Promise<ClientContactsPayload> {
    try{

      if(!data.nameCht || !data.nameEn) throw new Error('Contact must have a name!');

      const contact = this.clientContactsRepository.create();

      contact.uuid = uuid();

      if (data.nameEn) {
        contact.nameEn = data.nameEn;
      }

      if (data.nameCht) {
        contact.nameCht = data.nameCht;
      }

      if(data.appellation) {
        contact.appellation = data.appellation;
      }
      else contact.appellation = 0;

      if (data.email) {
        contact.email = data.email;
      }

      if (data.telCode) {
        contact.telCode = data.telCode;
      }

      if(data.tel !== undefined){
        // const clientByTel = await this.clientContactsRepository.findOne({
        //   tel: data.tel,
        // });
        // if(clientByTel) throw new Error('Contact tel duplicated!');
        contact.tel = data.tel;
      }

      if (data.whatsappCode) {
        contact.whatsappCode = data.whatsappCode;
      }

      if(data.whatsapp !== undefined){
        // const clientByWhatsapp = await this.clientContactsRepository.findOne({
        //   whatsapp: data.whatsapp,
        // });
        // if(clientByWhatsapp) throw new Error('Contact whatsapp duplicated!');
        contact.whatsapp = data.whatsapp;
      }

      if (data.wechatCode) {
        contact.wechatCode = data.wechatCode;
      }

      if(data.wechat !== undefined){
        // const clientByWechat = await this.clientContactsRepository.findOne({
        //   wechat: data.wechat,
        // });
        // if(clientByWechat) throw new Error('Contact wechat duplicated!');
        contact.wechat = data.wechat;
      }

      // this.pubSub.publish('onClientContactChange', {
      //   mutation: MutationType.CREATED,
      //   node: contact,
      // });

      return {
        userErrors: [],
        clientContacts: await contact.save()
      }
    }catch(error: any){
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async update(data: ClientContactsUpdateInput): Promise<ClientContactsPayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{

      const contact = await this.clientContactsRepository.findOneOrFail({
        uuid: data.uuid,
      });

      if (data.nameEn) {
        contact.nameEn = data.nameEn;
      }

      if (data.nameCht) {
        contact.nameCht = data.nameCht;
      }

      if(data.appellation) {
        contact.appellation = data.appellation;
      }
      else contact.appellation = 0;
      
      if (data.email) {
        contact.email = data.email;
      }

      if (data.telCode) {
        contact.telCode = data.telCode;
      }

      if(data.tel !== undefined){
        // const clientByTel = await this.clientContactsRepository.findOne({
        //   tel: data.tel,
        //   uuid: Not(data.uuid),
        // });
        // if(clientByTel) throw new Error('Contact tel duplicated!');
        contact.tel = data.tel;
      }

      if (data.whatsappCode) {
        contact.whatsappCode = data.whatsappCode;
      }

      if(data.whatsapp !== undefined){
        // const clientByWhatsapp = await this.clientContactsRepository.findOne({
        //   whatsapp: data.whatsapp,
        //   uuid: Not(data.uuid),
        // });
        // if(clientByWhatsapp) throw new Error('Contact whatsapp duplicated!');
        contact.whatsapp = data.whatsapp;
      }

      if (data.wechatCode) {
        contact.wechatCode = data.wechatCode;
      }

      if(data.wechat !== undefined){
        // const clientByWechat = await this.clientContactsRepository.findOne({
        //   wechat: data.wechat,
        //   uuid: Not(data.uuid),
        // });
        // if(clientByWechat) throw new Error('Contact wechat duplicated!');
        contact.wechat = data.wechat;
      }

      if (data.files && data.files.length) {
        await Promise.all(
          data.files.map(async e => {
            const { path: filePath, mimeType: fileMimeType, type: fileType, filename: filename } = await uploadToLocal(await e, 'contactFile');
            const contactFile = new ContactFile();
            contactFile.filePath = filePath;
            contactFile.fileMimeType = fileMimeType;
            contactFile.contactId = contact?.id!;
            await queryRunner.manager.save(contactFile);
          })
        )
      }

      if(data.deleteFile && data.deleteFile.length) {
        await Promise.all(
          data.deleteFile.map(async e => {
            let contactFile = await this.contactFileRepository.findOne(fromGlobalId(e).id);
            if(contactFile) {
              contactFile.deleted = true;
              await queryRunner.manager.save(contactFile);
            }
           
          })
        )
      }

      // this.pubSub.publish('onClientContactChange', {
      //   mutation: MutationType.UPDATED,
      //   node: contact,
      // });

          
      await queryRunner.commitTransaction();

      return {
        userErrors: [],
        clientContacts: await contact.save()
      }
    }catch(error: any){
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

  async delete(data: ClientContactsDeleteInput): Promise<ClientContactsPayload> {
    try{

      const contact = await this.clientContactsRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
      });

      contact.deleted = true;
      contact.createdAt = parseInt(moment().format('x'))

      // this.pubSub.publish('onClientContactChange', {
      //   mutation: MutationType.DELETED,
      //   node: contact,
      // });

      return {
        userErrors: [],
        clientContacts: await contact.save()
      }
    }catch(error: any){
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
