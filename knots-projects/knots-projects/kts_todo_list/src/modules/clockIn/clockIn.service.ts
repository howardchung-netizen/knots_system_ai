import { connectionFromArraySlice, fromGlobalId, toGlobalId } from 'graphql-relay';
import { Inject, Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ClockInsArgs} from './args/clockIns.args';
import { ClockInConnection } from './connection/clockIn.connection';
import { ClockInRepository } from './clockIn.repository';
import { ClockInCreateInput } from './input/clockInCreate.input';
import { ClockIn, ClockInError } from './clockIn.entity';
import { logger } from '../../lib/logger';
import { ClockInCreatePayload } from './payload/clockInCreate.payload';
import { ClockInLocationRepository } from '../clockInLocation/clockInLocation.repository';
import { ClockInLocation } from '../clockInLocation/clockInLocation.entity';
import moment from 'moment-timezone';
import { ClockInDeletePayload } from './payload/clockInDelete.payload';
import { ClockInDeleteInput } from './input/clockInDelete.input';
import { PubSubEngine } from 'type-graphql';
import { MutationType } from '../common/subscriptionPayload.type';
import { ClockInUpdateInput } from './input/clockInUpdate.input';
import { ClockInUpdatePayload } from './payload/clockInUpdate.payload';
import { MoreThan, MoreThanOrEqual } from 'typeorm';
import { ClockInCreateByQRCodeInput } from './input/clockInCreateByQRCode.input';
import { randomString } from '../../lib/randomString';

@Service()
export class ClockInService {
  constructor(
    @InjectRepository()
    private readonly clockInRepository: ClockInRepository,
    @InjectRepository()
    private readonly clockInLocationRepository: ClockInLocationRepository,
    @Inject('pubSub')
    private readonly pubSub: PubSubEngine,
  ) {
  }

  async getManyInConnection(args: ClockInsArgs): Promise<ClockInConnection> {

    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.clockInRepository
    .createQueryBuilder('clockIn');
    queryBuilder.where(`clockIn.is_deleted = 0`)
    
    if(!args.order || !args.sort) queryBuilder.orderBy({
      'created_at': 'DESC',
    });
    else {
      switch (args.sort) {
        case 'location.projectId':
        case 'location.address':
        case 'location.staffId':
          queryBuilder.leftJoinAndSelect("clockIn.location", "location")
          break;
      }
      queryBuilder.orderBy(args.sort, args.order);
    }

    if(args.id) {
      queryBuilder.andWhere(`id = :id`, {
        id: fromGlobalId(args.id).id,
      });
    }

    if (args.projectId) {
      let projectIds = (await this.clockInLocationRepository.find({ projectId: fromGlobalId(args.projectId).id })).map(e => e.id)
      if(projectIds.length === 0) throw Error("No Result")
      queryBuilder.andWhere(`clock_in_location_id IN(:...locationId)`, {
        locationId: projectIds,
      });
    }

    if (args.startDate) {
      queryBuilder.andWhere(`clocked_in_at >= :startDate`, {
        startDate: args.startDate,
      });
    }

    if (args.endDate) {
      queryBuilder.andWhere(`clocked_in_at <= :endDate`, {
        endDate: args.endDate,
      });
    }

    if (args.tel) {
      queryBuilder.andWhere(`clock_in_tel = :tel`, {
        tel: args.tel,
      });
    }

    if (args.isEffective && args.isDuplicated) queryBuilder.andWhere(`(is_duplicated = 0 OR is_duplicated = 1)`);
    else if (args.isEffective) queryBuilder.andWhere(`is_duplicated = 0`);
    else if (args.isDuplicated) queryBuilder.andWhere(`is_duplicated = 1`);
    queryBuilder.skip(offset).take(limit);
    const [clockIns, clockInCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(clockIns, args, {
        arrayLength: clockInCount,
        sliceStart: offset || 0,
      }),
      totalCount: clockInCount,
    };

  }

  async save(
    data: ClockInCreateInput,
  ): Promise<ClockInCreatePayload> {
    try {

      const clockIn = new ClockIn();

      clockIn.qrCodeCreatedAt = data.qrCodeCreatedAt;
      clockIn.clockedInAt = data.clockedInAt;
      clockIn.tel = data.tel;
      if (data.locationId) {
        let location = await this.clockInLocationRepository.findOneOrFail({id: fromGlobalId(data.locationId).id})
        clockIn.locationId = location.id;
        clockIn.nonce = location.nonce;
      }
      else {
        let clockInLocation = new ClockInLocation();
        if (data.staffId) clockInLocation.staffId = fromGlobalId(data.staffId).id;
        if (data.projectId) clockInLocation.projectId = fromGlobalId(data.projectId).id
        if (data.address) clockInLocation.address = data.address;
        clockInLocation.nonce = randomString({ length: 5 });
        clockIn.nonce = clockInLocation.nonce;
        await clockInLocation.save();
        clockIn.locationId = clockInLocation.id
      }

      const firstClockInRecordWithQRCode = await this.clockInRepository.findOne({
        where: [
          {
            qrCodeCreatedAt: moment(data.qrCodeCreatedAt).format("YYYY-MM-DD HH:mm:ss"),
            nonce: clockIn.nonce,
            isDeleted: false,
            isDuplicated: false
          }
        ]
      })
      
      clockIn.isDuplicated = firstClockInRecordWithQRCode ? true : false;

      let isSameTel;
      if(firstClockInRecordWithQRCode && firstClockInRecordWithQRCode.tel == data.tel) isSameTel = true;
      if ((!isSameTel && firstClockInRecordWithQRCode) || !firstClockInRecordWithQRCode) {
        await clockIn.save();
        return {
          userErrors: [{
            message: clockIn.isDuplicated ? 'QR Code Reused' : '',
            field: [],
          },],
          result: !clockIn.isDuplicated,
        };
      }
      else throw Error("QR Code Reused");
    } catch (error: any) {
      logger.error(error.message);
      const clockInError = new ClockInError ();
      clockInError.tel = data.tel;
      clockInError.message = error.message
      await clockInError.save();
      //todo send
      return {
        userErrors: [{
          message: error.message,
          field: [],
        },],
        result:false,
      }
    }
  }

  async saveByQrCode(
    data: ClockInCreateByQRCodeInput,
  ): Promise<ClockInCreatePayload> {
    try {

      const clockInLocation = await this.clockInLocationRepository.findOne({
        nonce: data.nonce,
      });
      if (!clockInLocation) throw new Error('Invalid nonce');
      if (moment.duration(moment().diff(clockInLocation.createdAt)).asMinutes() > 60) throw new Error('The nonce more than 60 mins.');
      const clockIn = new ClockIn();
      clockIn.qrCodeCreatedAt = clockInLocation.createdAt;
      clockIn.clockedInAt = moment().toDate();
      clockIn.nonce = data.nonce;
      clockIn.tel = data.tel;
      clockIn.locationId = clockInLocation.id;

      const firstClockInRecordWithQRCode = await this.clockInRepository.findOne({
        where: [
          {
            locationId: clockInLocation.id,
            nonce: data.nonce,
            isDeleted: false,
            isDuplicated: false
          }
        ]
      })

      clockIn.isDuplicated = firstClockInRecordWithQRCode ? true : false;

      let isSameTel;
      if(firstClockInRecordWithQRCode && firstClockInRecordWithQRCode.tel == data.tel) isSameTel = true;
      if ((!isSameTel && firstClockInRecordWithQRCode) || !firstClockInRecordWithQRCode) {
        await clockIn.save();
        return {
          userErrors: [{
            message: clockIn.isDuplicated ? 'QR Code Reused' : '',
            field: [],
          },],
          result: !clockIn.isDuplicated,
        };
      }
      else throw Error("QR Code Reused");
    } catch (error: any) {
      logger.error(error.message);
      const clockInError = new ClockInError ();
      clockInError.tel = data.tel;
      clockInError.message = error.message
      await clockInError.save();
      //todo send
      return {
        userErrors: [{
          message: error.message,
          field: [],
        },],
        result:false,
      }
    }
  }

  async update(
    data: ClockInUpdateInput,
  ): Promise<ClockInUpdatePayload> {
    try {
      const clockIn = await this.clockInRepository.findOneOrFail({id: fromGlobalId(data.id).id})
      clockIn.salary = data.salary??null;
      clockIn.remark = data.remark;
      await clockIn.save();
      return {
        userErrors: [],
        clockIn: clockIn
      } 
    } catch (error: any) {
      
      //todo send
      return {
        userErrors: [{
          message: error.message,
          field: [],
        },]
      }
    }
  }

  async delete(
    data: ClockInDeleteInput,
  ): Promise<ClockInDeletePayload> {
    try {

      const clockIn = await this.clockInRepository.findOneOrFail({ id: fromGlobalId(data.id).id });
      clockIn.isDeleted = true;
      await clockIn.save();

      return {
        userErrors: [],
        result: true,
      }

    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        },],
        result: false,
      }
    }
  }

  async scanQrCode(
    nonce: string,
  ): Promise<boolean | string> {
    try {
      const clockInLocation = await this.clockInLocationRepository.findOneOrFail({
        nonce: nonce,
        createdAt: MoreThanOrEqual(moment().subtract(1,'h').toDate()),
      })
      this.pubSub.publish('onQRCodeScan', {
        mutation: MutationType.CREATED,
        locationId: clockInLocation.id,
      });
      return toGlobalId('string', clockInLocation.id);
    } catch (error: any) {
      logger.error(error.message);
      return false;
    }
  }

}