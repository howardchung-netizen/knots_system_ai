import {Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root, Subscription} from 'type-graphql';
import { PermissionAction } from "../admin/action/action.type";
import {ResourceResolver} from '../node/resource.resolver';
import { ClientContacts } from './clientContacts.entity';
import { ClientContactsService } from './clientContacts.service';
import { ClientContactsConnection } from './connection/clientContacts.connection';
import { ClientContactsArgs } from './args/clientContacts.args';
import { ClientContactsPayload } from './payload/clientContacts.payload';
import { ClientContactsCreateInput } from './input/clientContactsCreate.input';
import { ClientContactsUpdateInput } from './input/clientContactsUpdate.input';
import { ClientContactsDeleteInput } from './input/clientContactsDelete.input';
import { revivePayload } from '../../lib/subscription';
import { ClientContactsSubscriptionArgs } from './args/clientContactsSubscription.args';
import { ClientContactsSubscriptionPayload } from './payload/clientContactsSubscription.payload';
import { ResolverContext } from '../../lib/types';

export const RESOURCE_CLIENT_CONTACTS = ClientContacts.name;

@Resolver(() => ClientContacts)
export class ClientContactsResolver extends ResourceResolver(ClientContacts) {
  constructor(
    private readonly clientContactsService: ClientContactsService,
  ) {
    super();
  }

  @FieldResolver()
  async contactFiles(
    @Root() root: ClientContacts,
    @Ctx() {
      contactFileByIdLoader,
    }: ResolverContext,
  ) {
    return contactFileByIdLoader.load(root.id);
  }
  
  @Authorized(`${RESOURCE_CLIENT_CONTACTS}:${PermissionAction.GET}`)
  @Query(type => ClientContactsConnection, { nullable: true, name: 'clientContacts' })
  async getMany(@Args() args: ClientContactsArgs): Promise<ClientContactsConnection> {
    return this.clientContactsService.getManyInConnection(args);
  }

  @Authorized(`${RESOURCE_CLIENT_CONTACTS}:${PermissionAction.CREATE}`)
  @Mutation(
    type => ClientContactsPayload,
    {
      name: 'clientContactsCreate',
      nullable: true,
    }
  )
  async create(
    @Arg('data') data: ClientContactsCreateInput,
  ): Promise<ClientContactsPayload> {
    return this.clientContactsService.create(data);
  }

  @Authorized(`${RESOURCE_CLIENT_CONTACTS}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => ClientContactsPayload,
    {
      name: 'clientContactsUpdate',
      nullable: true,
    }
  )
  async update(
    @Arg('data') data: ClientContactsUpdateInput,
  ): Promise<ClientContactsPayload> {
    return this.clientContactsService.update(data);
  }

  @Authorized(`${RESOURCE_CLIENT_CONTACTS}:${PermissionAction.DELETE}`)
  @Mutation(
    type => ClientContactsPayload,
    {
      name: 'clientContactsDelete',
      nullable: true,
    }
  )
  async delete(
    @Arg('data') data: ClientContactsDeleteInput,
  ): Promise<ClientContactsPayload> {
    return this.clientContactsService.delete(data);
  }

    // @Authorized(`${RESOURCE_CLIENT_CONTACTS}:${PermissionAction.GET}`)
    @Subscription({
      topics: 'onClientContactChange',
      filter: async ({ payload, args, context }) => {
        revivePayload(ClientContacts, payload);
  
        if (args.status) {
          if ((!payload.node || payload.node.status !== args.status) && (!payload.previousValues || payload.previousValues.status !== args.status)) return false;
        }
  
        return true;
      },
    })
    onClientContactChange(
      @Root() payload: ClientContactsSubscriptionPayload,
      @Args() args: ClientContactsSubscriptionArgs,
    ): ClientContactsSubscriptionPayload {
      // already converted in filter
      // revivePayload(loan, payload);
  
      return payload;
    }
}
