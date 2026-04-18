import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { ClockInContactsArgs} from './args/clockInContacts.args';
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { Inject } from "typedi";
import { ClockInContact } from "./clockInContact.entity";
import { ClockInContactConnection } from './connection/clockInContact.connection';
import { ClockInContactService } from './clockInContact.service';
import { ClockInContactInput } from './input/clockInContact.input';
import { ClockInContactPayload } from './payload/clockInContact.payload';

// export const RESOURCE_CLOCKIN = clockInContact.name;

@Resolver(() => ClockInContact)
export class ClockInContactResolver extends ResourceResolver(ClockInContact) {
  constructor(
    @Inject(type => ClockInContactService)
    private readonly ClockInContactService: ClockInContactService,
  ) {
    super();
  }

  @Authorized()
  @Query(type => ClockInContactConnection, { nullable: true, name: 'clockInContacts' })
  async getMany(
    @Args() args: ClockInContactsArgs,
    @Ctx() {req, enforcer}: ResolverContext,
    @CurrentUser() user: LoggedInUser,
    ): Promise<ClockInContactConnection> {
    return this.ClockInContactService.getManyInConnection(args);
  }

  @Authorized()
  @Mutation(type => ClockInContactPayload, { nullable: false, name: 'updateClockInContact' })
  async create(
    @Arg('data') data: ClockInContactInput,
    ): Promise<ClockInContactPayload> {
    return this.ClockInContactService.save(data);
  }

  @FieldResolver()
  async clockInContactFiles(
    @Root() root: ClockInContact,
    @Ctx() {
      clockInContactFileByTelLoader,
    }: ResolverContext,
  ) {
    return clockInContactFileByTelLoader.load(root.tel);
  }
}
