import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { ClockInLocationsArgs} from './args/clockInLocation.args';
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { Inject } from "typedi";
import { ClockInLocation } from "./clockInLocation.entity";
import { ClockInLocationConnection } from './connection/clockInLocation.connection';
import { ClockInLocationService } from './clockInLocation.service';
import { ClockInLocationCreate, ClockInLocationRefresh, ClockInLocationUpdate } from './input/clockInLocation.input';
import { ClockInLocationCreatePayload, ClockInLocationRefreshPayload, ClockInLocationUpdatePayload } from './payload/clockInLocation.payload';

// export const RESOURCE_CLOCKIN = ClockInLocation.name;

@Resolver(() => ClockInLocation)
export class LocationResolver extends ResourceResolver(ClockInLocation) {
  constructor(
    @Inject(type => ClockInLocationService)
    private readonly clockInLocationService: ClockInLocationService,
  ) {
    super();
  }

  // @Authorized(`${RESOURCE_ClockInContact}:${PermissionAction.GET}`)
  @Authorized()
  @Query(type => ClockInLocationConnection, { nullable: true, name: 'clockInLocations' })
  async getMany(
    @Args() args: ClockInLocationsArgs,
    @Ctx() {req, enforcer}: ResolverContext,
    @CurrentUser() user: LoggedInUser,
    ): Promise<ClockInLocationConnection> {
    return this.clockInLocationService.getManyInConnection(args);
  }

  @Authorized()
  @Mutation(type => ClockInLocationCreatePayload, { nullable: false, name: 'createClockInLocation' })
  async create(
    @Arg('data') data: ClockInLocationCreate,
    ): Promise<ClockInLocationCreatePayload> {
    return this.clockInLocationService.create(data);
  }

  @Authorized()
  @Mutation(type => ClockInLocationRefreshPayload, { nullable: false, name: 'refreshClockInLocation' })
  async refresh(
    @Arg('data') data: ClockInLocationRefresh,
    ): Promise<ClockInLocationRefreshPayload> {
    return this.clockInLocationService.refresh(data);
  }

  @Authorized()
  @Mutation(type => ClockInLocationUpdatePayload, { nullable: false, name: 'updateClockInLocation' })
  async update(
    @Arg('data') data: ClockInLocationUpdate,
    ): Promise<ClockInLocationUpdatePayload> {
    return this.clockInLocationService.update(data);
  }

  @FieldResolver(type=> ClockInLocation)
  async user(
    @Root() root: ClockInLocation,
    @Ctx(){ userLoader }: ResolverContext,
  ){
    return userLoader.load(root.staffId);
  }

  @FieldResolver(type=> ClockInLocation)
  async project(
    @Root() root: ClockInLocation,
    @Ctx(){ projectLoader }: ResolverContext,
  ){
    return projectLoader.load(root.projectId);
  }
}
