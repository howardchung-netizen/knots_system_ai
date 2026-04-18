import {connectionFromArraySlice, fromGlobalId} from 'graphql-relay';
import {Inject, Service} from 'typedi';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {logger} from '../../lib/logger';
import {ClientsArgs} from '../client/args/clients.args';
import {ClientRepository} from '../client/client.repository';
import { ClientUpdateInput } from './input/clientUpdate.input';
import { ClientPayload } from '../client/payload/client.payload';
import { ClientsConnection } from './connection/client.connection';
import { ClientCreateInput } from './input/clientCreate.input';
import { In, Not } from 'typeorm';
import { ClientContactsRepository } from '../clientContacts/clientContacts.repository';
import { uuid } from 'uuidv4';
import { ClientDeleteInput } from './input/clientDelete.input';
import moment from 'moment-timezone';
import { MutationType } from '../common/subscriptionPayload.type';
import { PubSubEngine } from 'type-graphql';

@Service()
export class ClientService {
  constructor(
    @InjectRepository()
    private readonly clientRepository: ClientRepository,
    @InjectRepository()
    private readonly clientContactsRepository: ClientContactsRepository,
    @Inject('pubSub')
    private readonly pubSub: PubSubEngine,
  ) {
  }

  async getManyInConnection(args: ClientsArgs, extraArgs: { [index: string]: any } = {}): Promise<ClientsConnection> {
    const queryBuilder = this.clientRepository
      .createQueryBuilder('client');

    if (args.id) {
      queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    }

    if (args.prefix) {
      queryBuilder.andWhere('prefix LIKE `%:prefix%`', { prefix: args.prefix });
    }

    if (args.companyEn) {
      queryBuilder.andWhere('company_en = :companyEn', { companyEn: args.companyEn });
    }

    if (args.companyCht) {
      queryBuilder.andWhere('company_cht = :companyCht', { companyCht: args.companyCht });
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

    const [client, clientCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(client, args, {
        arrayLength: clientCount,
        sliceStart: offset || 0,
      }),
      totalCount: clientCount,
    };
  }

  async create(data: ClientCreateInput): Promise<ClientPayload> {
    try{

      if(!data.companyCht || !data.companyEn) throw new Error('Client must have a company name!');

      const client = this.clientRepository.create();

      client.uuid = uuid();

      if (data.prefix) {
        client.prefix = data.prefix;
      }

      if (data.companyEn) {
        client.companyEn = data.companyEn;
      }

      if (data.companyCht) {
        client.companyCht = data.companyCht;
      }

      if (data.address) {
        client.address = data.address;
      }

      if (data.email) {
        client.email = data.email;
      }

      if (data.telCode) {
        client.telCode = data.telCode;
      }

      if(data.tel !== undefined && data.tel!== null && data.tel !== ''){
        const clientByTel = await this.clientRepository.findOne({
          tel: data.tel,
        });
        if(clientByTel) throw new Error('Client tel duplicated!');
        client.tel = data.tel;
      }

      if (data.whatsappCode) {
        client.whatsappCode = data.whatsappCode;
      }

      if(data.whatsapp !== undefined && data.whatsapp!== null && data.whatsapp !== ''){
        const clientByWhatsapp = await this.clientRepository.findOne({
          whatsapp: data.whatsapp,
        });
        if(clientByWhatsapp) throw new Error('Client whatsapp duplicated!');
        client.whatsapp = data.whatsapp;
      }

      if (data.wechatCode) {
        client.wechatCode = data.wechatCode;
      }

      if(data.wechat !== undefined && data.wechat!== null && data.wechat !== ''){
        const clientByWechat = await this.clientRepository.findOne({
          wechat: data.wechat,
        });
        if(clientByWechat) throw new Error('Client wechat duplicated!');
        client.wechat = data.wechat;
      }

      if (data.faxCode) {
        client.faxCode = data.faxCode;
      }

      if(data.faxCode !== undefined && data.faxCode!== null && data.faxCode !== ''){
        const clientByFax = await this.clientRepository.findOne({
          faxCode: data.faxCode,
        });
        if(clientByFax) throw new Error('Client faxCode duplicated!');
        client.faxCode = data.faxCode;
      }

      if (data.contacts && data.contacts.length) {
        const contacts = await this.clientContactsRepository.find({
          id: In(data.contacts.map(e => fromGlobalId(e.id).id)),
        });
        if (contacts.length !== data.contacts.length) throw new Error('Contract ids invalid');
        client.contactIds = contacts.map(e => e.id).join(',');
        const mainContact = data.contacts.find(e => e.isMainContact === true);
        if (mainContact) {
          client.mainContactId = Number(fromGlobalId(mainContact.id).id);
        }
      }

      await client.save()

      this.pubSub.publish('onClientChange', {
        mutation: MutationType.CREATED,
        node: client,
      });

      return {
        userErrors: [],
        client: client
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

  async update(data: ClientUpdateInput): Promise<ClientPayload> {
    try{

      const client = await this.clientRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
      });

      if (data.prefix !== undefined) {
        client.prefix = data.prefix;
      }

      if (data.companyEn !== undefined) {
        client.companyEn = data.companyEn;
      }

      if (data.companyCht !== undefined) {
        client.companyCht = data.companyCht;
      }

      if (data.address !== undefined) {
        client.address = data.address;
      }

      if (data.email !== undefined) {
        client.email = data.email;
      }

      if (data.telCode !== undefined) {
        client.telCode = data.telCode;
      }

      if(data.tel !== undefined && data.tel!== null && data.tel !== ''){
        const clientByTel = await this.clientRepository.findOne({
          tel: data.tel,
          id: Not(fromGlobalId(data.id).id),
        });
        if(clientByTel) throw new Error('Client tel duplicated!');
        client.tel = data.tel;
      }

      if (data.whatsappCode !== undefined) {
        client.whatsappCode = data.whatsappCode;
      }

      if(data.whatsapp !== undefined && data.whatsapp!== null && data.whatsapp !== ''){
        const clientByWhatsapp = await this.clientRepository.findOne({
          whatsapp: data.whatsapp,
          id: Not(fromGlobalId(data.id).id),
        });
        if(clientByWhatsapp) throw new Error('Client whatsapp duplicated!');
        client.whatsapp = data.whatsapp;
      }

      if (data.wechatCode !== undefined) {
        client.wechatCode = data.wechatCode;
      }

      if(data.wechat !== undefined && data.wechat!== null && data.wechat !== ''){
        const clientByWechat = await this.clientRepository.findOne({
          wechat: data.wechat,
          id: Not(fromGlobalId(data.id).id),
        });
        if(clientByWechat) throw new Error('Client wechat duplicated!');
        client.wechat = data.wechat;
      }

      if (data.faxCode !== undefined) {
        client.faxCode = data.faxCode;
      }

      if(data.fax !== undefined && data.fax!== null){
        client.fax = data.fax;
      }

      if (data.contacts && data.contacts.length) {
        const contacts = await this.clientContactsRepository.find({
          id: In(data.contacts.map(e => fromGlobalId(e.id).id)),
        });
        if (contacts.length !== data.contacts.length) throw new Error('Contract ids invalid');
        client.contactIds = contacts.map(e => e.id).join(',');
        const mainContact = data.contacts.find(e => e.isMainContact === true);
        if (mainContact) {
          client.mainContactId = Number(fromGlobalId(mainContact.id).id);
        }
        else {
          client.mainContactId = undefined;
        }
      }
      else {
        client.contactIds = "";
        client.mainContactId = undefined;
      }

      this.pubSub.publish('onClientChange', {
        mutation: MutationType.UPDATED,
        node: client,
      });

      return {
        userErrors: [],
        client: await client.save()
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

  async delete(data: ClientDeleteInput): Promise<ClientPayload> {
    try{

      const client = await this.clientRepository.findOneOrFail({
        id: fromGlobalId(data.id).id,
      });

      client.deleted = true;
      client.deleteAt = parseInt(moment().format('x'));

      this.pubSub.publish('onClientChange', {
        mutation: MutationType.DELETED,
        node: client,
      });

      return {
        userErrors: [],
        client: await client.save()
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
