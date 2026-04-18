import {Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root, Subscription} from 'type-graphql';
import { PermissionAction } from "../admin/action/action.type";
import {ResourceResolver} from '../node/resource.resolver';
import { Client } from "./client.entity";
import { ClientService } from './client.service';
import { ClientsConnection } from './connection/client.connection';
import { ClientsArgs } from './args/clients.args';
import { ClientPayload } from './payload/client.payload';
import { ClientUpdateInput } from './input/clientUpdate.input';
import { ClientCreateInput } from './input/clientCreate.input';
import { ResolverContext } from '../../lib/types';
import { ClientDeleteInput } from './input/clientDelete.input';
import { revivePayload } from '../../lib/subscription';
import { ClientSubscriptionPayload } from './payload/clientSubscription.payload';
import { ClientSubscriptionArgs } from './args/clientSubscription.args';

export const RESOURCE_CLIENT = Client.name;

@Resolver(() => Client)
export class ClientResolver extends ResourceResolver(Client) {
  constructor(
    private readonly clientService: ClientService,
  ) {
    super();
  }

  @FieldResolver()
  async contacts(
    @Root() root: Client,
    @Ctx() {
      clientContactsLoader,
    }: ResolverContext,
  ) {
    return clientContactsLoader.load(root.id);
  }

  @FieldResolver()
  async mainContact(
    @Root() root: Client,
    @Ctx() {
      clientContactsByIdLoader,
    }: ResolverContext,
  ) {
    return root.mainContactId ? clientContactsByIdLoader.load(String(root.mainContactId)) : null;
  }

  @Authorized(`${RESOURCE_CLIENT}:${PermissionAction.GET}`)
  @Query(type => ClientsConnection, { nullable: true, name: 'clients' })
  async getMany(@Args() args: ClientsArgs): Promise<ClientsConnection> {
    return this.clientService.getManyInConnection(args);
  }

  @Authorized(`${RESOURCE_CLIENT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => ClientPayload,
    {
      name: 'clientCreate',
      nullable: true,
    }
  )
  async create(
    @Arg('data') data: ClientCreateInput,
  ): Promise<ClientPayload> {
    return this.clientService.create(data);
  }

  @Authorized(`${RESOURCE_CLIENT}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => ClientPayload,
    {
      name: 'clientUpdate',
      nullable: true,
    }
  )
  async update(
    @Arg('data') data: ClientUpdateInput,
  ): Promise<ClientPayload> {
    return this.clientService.update(data);
  }

  @Authorized(`${RESOURCE_CLIENT}:${PermissionAction.DELETE}`)
  @Mutation(
    type => ClientPayload,
    {
      name: 'clientDelete',
      nullable: true,
    }
  )
  async delete(
    @Arg('data') data: ClientDeleteInput,
  ): Promise<ClientPayload> {
    return this.clientService.delete(data);
  }

  // @Authorized(`${RESOURCE_CLIENT}:${PermissionAction.GET}`)
  @Subscription({
    topics: 'onClientChange',
    filter: async ({ payload, args, context }) => {
      revivePayload(Client, payload);

      if (args.status) {
        if ((!payload.node || payload.node.status !== args.status) && (!payload.previousValues || payload.previousValues.status !== args.status)) return false;
      }

      return true;
    },
  })
  onClientChange(
    @Root() payload: ClientSubscriptionPayload,
    @Args() args: ClientSubscriptionArgs,
  ): ClientSubscriptionPayload {
    // already converted in filter
    // revivePayload(loan, payload);

    return payload;
  }
}
