import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root, Subscription } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { ClockInsArgs} from './args/clockIns.args';
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ClockIn } from "./clockIn.entity";
import { ClockInConnection } from './connection/clockIn.connection';
import { ClockInService } from './clockIn.service';
import { ClockInCreateInput } from './input/clockInCreate.input';
import { ClockInCreatePayload } from './payload/clockInCreate.payload';
import { ClockInDeletePayload } from './payload/clockInDelete.payload';
import { ClockInDeleteInput } from './input/clockInDelete.input';
import { ClockInUpdateInput } from './input/clockInUpdate.input';
import { revivePayload } from '../../lib/subscription';
import { fromGlobalId } from 'graphql-relay';
import { QrCodeScanSubscriptionPayload } from './payload/qrCodeScanSubscription.payload';
import { QrCodeScanSubscriptionArgs } from './args/qrCodeScanSubscription.args';
import { ClockInUpdatePayload } from './payload/clockInUpdate.payload';

// export const RESOURCE_CLOCKIN = ClockIn.name;

@Resolver(() => ClockIn)
export class ClockInResolver extends ResourceResolver(ClockIn) {
  constructor(
    @Inject(type => ClockInService)
    private readonly clockInService: ClockInService,
  ) {
    super();
  }

  @Authorized()
  @Query(type => ClockInConnection, { nullable: true, name: 'clockIns' })
  async getMany(
    @Args() args: ClockInsArgs,
    @Ctx() {req, enforcer}: ResolverContext,
    @CurrentUser() user: LoggedInUser,
    ): Promise<ClockInConnection> {
    return this.clockInService.getManyInConnection(args);
  }

  @Authorized()
  @Mutation(type => ClockInCreatePayload, { nullable: false, name: 'createClockIn' })
  async save(
    @Arg('data') data: ClockInCreateInput,
    ): Promise<ClockInCreatePayload> {
    return this.clockInService.save(data);
  }

  @Authorized()
  @Mutation(type => ClockInUpdatePayload, { nullable: false, name: 'updateClockIn' })
  async update(
    @Arg('data') data: ClockInUpdateInput,
    ): Promise<ClockInUpdatePayload> {
    return this.clockInService.update(data);
  }

  @Authorized()
  @Mutation(type => ClockInDeletePayload, { nullable: false, name: 'deleteClockIn' })
  async delete(
    @Arg('data') data: ClockInDeleteInput,
    ): Promise<ClockInDeletePayload> {
    return this.clockInService.delete(data);
  }

  @FieldResolver(type=> ClockIn)
  async contact(
    @Root() root: ClockIn,
    @Ctx(){ clockInContactLoader }: ResolverContext,
  ){
    return clockInContactLoader.load(root.tel);
  }

  @FieldResolver(type=> ClockIn)
  async location(
    @Root() root: ClockIn,
    @Ctx(){ clockInLocationLoader }: ResolverContext,
  ){
    return clockInLocationLoader.load(root.locationId);
  }

  @Subscription({
    topics: 'onQRCodeScan',
    filter: async ({ payload, args }) => {
      //revivePayload(ClockIn, payload);

      if (args.locationId) {
        const locationId = Number(fromGlobalId(args.locationId).id);
        if (!payload.locationId || payload.locationId !== locationId) return false;
      }

      return true;
    },
  })
  onQRCodeScan(
    @Root() payload: QrCodeScanSubscriptionPayload,
    @Args() args: QrCodeScanSubscriptionArgs,
  ): QrCodeScanSubscriptionPayload {
    return payload;
  }
}
