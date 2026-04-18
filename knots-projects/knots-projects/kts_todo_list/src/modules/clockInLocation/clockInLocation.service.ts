import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ClockInLocationsArgs} from './args/clockInLocation.args';
import { ClockInLocationConnection } from './connection/clockInLocation.connection';
import { ClockInLocationRepository } from './clockInLocation.repository';
import { ClockInLocationCreate, ClockInLocationRefresh, ClockInLocationUpdate} from './input/clockInLocation.input';
import { ClockInLocation } from './clockInLocation.entity';
import { logger } from '../../lib/logger';
import { ClockInLocationCreatePayload, ClockInLocationRefreshPayload, ClockInLocationUpdatePayload } from './payload/clockInLocation.payload';
import { randomString } from '../../lib/randomString';
import { UserRepository } from '../user/user.repository';
import { ProjectRepository } from '../project/project.repository';
import moment from 'moment-timezone';

@Service()
export class ClockInLocationService {
  constructor(
    @InjectRepository()
    private readonly clockInLocationRepository: ClockInLocationRepository,
    @InjectRepository()
    private readonly userRepository: UserRepository,
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
  ) {
  }

  async getManyInConnection(args: ClockInLocationsArgs): Promise<ClockInLocationConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.clockInLocationRepository
      .createQueryBuilder('location');
    queryBuilder.where('is_deleted = 0');

    if(args.id) {
      queryBuilder.andWhere(`id = :id`, {
        id: fromGlobalId(args.id).id,
      });
    }

    if(args.projectId) {
      console.log(fromGlobalId(args.projectId).id)
      queryBuilder.andWhere(`project_id = :projectId`, {
        projectId: fromGlobalId(args.projectId).id,
      });
    }

    if(args.staffId) {
      queryBuilder.andWhere(`staff_id = :staffId`, {
        staffId: fromGlobalId(args.staffId).id,
      });
    }

    let now = new Date();
    //console.log(moment(now).subtract(1, 'h').toDate())

    if(args.nonce) queryBuilder.andWhere(`nonce = :nonce`, {
      nonce: args.nonce,
    })
    .andWhere(`created_at <= :now`, {
      now: now,
    })
    .andWhere(`created_at >= :before1H`, {
      before1H: moment(now).subtract(1, 'h').toDate(),
    });
    
    const [locations, locationCount] = await queryBuilder.getManyAndCount();
    
    return {
      ...connectionFromArraySlice(locations, args, {
        arrayLength: locationCount,
        sliceStart: offset || 0,
      }),
      totalCount: locationCount,
    };
  }

  async create(
    data: ClockInLocationCreate,
  ): Promise<ClockInLocationCreatePayload> {
    try {
      const clockInLocation = new ClockInLocation();
      clockInLocation.staffId = fromGlobalId(data.staffId).id;
      clockInLocation.projectId = fromGlobalId(data.projectId).id;
      clockInLocation.nonce = randomString({ length: 5 });
      if(data.lat) clockInLocation.lat = data.lat;
      if(data.lon) clockInLocation.lon = data.lon;
      if(data.address) clockInLocation.address = data.address;
      await clockInLocation.save();
      return {
        userErrors: [],
        clockInLocation: clockInLocation,
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async refresh(
    data: ClockInLocationRefresh,
  ): Promise<ClockInLocationRefreshPayload> {
    try {
      const clockInLocation = await this.clockInLocationRepository.findOneOrFail({id: fromGlobalId(data.locationId).id});
      clockInLocation.nonce = randomString({ length: 5 });
      await clockInLocation.save();
      return {
        userErrors: [],
        clockInLocation: clockInLocation,
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async update(
    data: ClockInLocationUpdate,
  ): Promise<ClockInLocationUpdatePayload> {
    try {

      const clockInLocation = new ClockInLocation();
      if(data.staffId) clockInLocation.staffId = data.staffId;
      if(data.lat) clockInLocation.lat = data.lat;
      if(data.lon) clockInLocation.lon = data.lon;

      return {
        userErrors: [],
        clockInLocation: clockInLocation,
      }

    } catch (error: any) {
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
