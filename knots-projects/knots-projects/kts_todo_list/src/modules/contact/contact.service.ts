import {Enforcer} from 'casbin';
import {connectionFromArraySlice, fromGlobalId} from 'graphql-relay';
import {i18n} from 'i18next';
import moment from 'moment-timezone';
import {Service, Inject} from 'typedi';
import {Brackets, FindConditions, getManager, In, MoreThanOrEqual, Between, getConnection} from 'typeorm';
import {InjectRepository} from 'typeorm-typedi-extensions';
import crypto from 'crypto';
import {logger} from '../../lib/logger';
import {ContactsArgs} from './args/contacts.args';
import {ContactsConnection} from './connection/contacts.connection';
import {Contact} from './contact.entity';
import {ContactRepository} from './contact.repository';
import { ContactInput } from './input/contact.input';
import { ContactPayload } from './payload/contact.payload';
import { ContactFileRepository } from '../contactFile/contactFile.repository';
import { ContactFile } from '../contactFile/contactFile.entity';
import { uploadToLocal } from '../../lib/storage';

@Service()
export class ContactService {
  constructor(
    @InjectRepository()
    private readonly contactRepository: ContactRepository,
    @InjectRepository()
    private readonly contactFileRepository: ContactFileRepository,
  ) {
  }


  async getManyInConnection(args: ContactsArgs, extraArgs: { [index: string]: any } = {}): Promise<ContactsConnection> {
    const {limit, offset} = args.pagingParams();
    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact');
    const [contact, contactCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(contact, args, {
        arrayLength: contactCount,
        sliceStart: offset || 0,
      }),
      totalCount: contactCount,
    };
  }

  async save(data: ContactInput): Promise<ContactPayload> {

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{
      
      let contact:Contact;
      if(!data.id){
        if(!data.contactName) throw new Error('Contact must have a name!');
        contact = Contact.create(data);
      }else{
        contact = await Contact.findOneOrFail(fromGlobalId(data.id).id);
      }

      if(data.tel != undefined){
        const contactByTel = await Contact.find({tel: data.tel});
        if(contactByTel.length>1 && contactByTel[0].id !== contact.id) throw new Error('Contact tel duplicated!');
        contact.tel = data.tel;
      }
      if(data.dailyRemindTime != undefined){
        if(data.dailyRemindTime < 0 || data.dailyRemindTime > 23) throw new Error('Daily Remind Time invalid!');
        contact.dailyRemindTime = data.dailyRemindTime;
      }
      
      if(data.contactName != undefined)contact.contactName = data.contactName;

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
    
      await queryRunner.commitTransaction();

      return {
        userErrors: [],
        contact: await contact.save()
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
}
