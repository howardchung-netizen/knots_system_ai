import {Enforcer} from 'casbin';
import {connectionFromArraySlice, fromGlobalId, toGlobalId} from 'graphql-relay';
import {i18n} from 'i18next';
import moment from 'moment-timezone';
import {Service, Inject} from 'typedi';
import {InjectRepository} from 'typeorm-typedi-extensions';
import { SpotlightsConnection } from './connection/spotlights.connection';
import { SpotlightRepository } from './spotlight.repository';

@Service()
export class SpotlightService {
  constructor(
    @InjectRepository()
    private readonly spotlightRepository: SpotlightRepository,
  ) {
  }
  async getMany(): Promise<SpotlightsConnection> {
    const [spotlight, spotlightCount] = await this.spotlightRepository.findAndCount({ isDeleted: false });
    return {
      ...connectionFromArraySlice(spotlight, {}, {
        arrayLength: spotlightCount,
        sliceStart: 0 || 0,
      }),
      totalCount: spotlightCount,
    };
  }

}
