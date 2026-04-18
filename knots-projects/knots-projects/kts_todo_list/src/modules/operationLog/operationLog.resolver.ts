import {Args, Authorized, Ctx, FieldResolver, Query, Resolver, Root, Subscription} from "type-graphql";
import {JSONResolver} from "graphql-scalars";
import {revivePayload} from "../../lib/subscription";
import {ResolverContext} from "../../lib/types";
import {ResourceResolver} from "../node/resource.resolver";
import {OperationLogArgs} from "./args/operationLog.args";
import {OperationLogConnection} from "./connection/operationLog.connection";
import {OperationLog, OperationObjectType} from "./operationLog.entity";
import {OperationLogService} from "./operationLog.service";
import {OperationLogObjectUnion} from "./union/operationLogObjectUnion";
import {OperationLogSubscriptionArgs} from "./args/operationLogSubscription.args";
import {OperationLogSubscriptionPayload} from "./payload/operationLogSubscription.payload";

export const RESOURCE_OPERATION_LOG = OperationLog.name;

@Resolver(type => OperationLog)
export class OperationLogResolver extends ResourceResolver(OperationLog) {
  constructor(
    private readonly OperationLogService: OperationLogService,
  ) {
    super();
  }

  @FieldResolver()
  async user(
    @Root() root: OperationLog,
    @Ctx() {
      userLoader,
    }: ResolverContext,
  ) {
    return root.userId ? userLoader.load(root.userId) : null;
  }

  @Authorized()
  @FieldResolver(
    type => OperationLogObjectUnion,
  )
  async object(
    @Root() root: OperationLog,
  ) {
    switch (root.objectType) {
    }
  }

  @FieldResolver(
    type => JSONResolver,
  )
  async changes(
    @Root() root: OperationLog,
  ) {
    if (root.changes) {
      return this.OperationLogService.handleChangesList(root.changes);
    }

    return null;
  }

  @Authorized()
  @Query(
    type => OperationLogConnection,
    {
      name: 'operationLog',
    }
  )
  async getMany(
    @Ctx() {user, enforcer}: ResolverContext,
    @Args() args: OperationLogArgs,
  ): Promise<OperationLogConnection> {
    return this.OperationLogService.getMany(args, user, enforcer);
  }

  @Authorized()
  @Subscription({
    topics: 'onNewOperationLog',
    filter: async ({ payload, args, context }) => {
      revivePayload(OperationLog, payload);

      if (args.objectType) {
        if ((!payload.node || payload.node.objectType !== args.objectType) && (!payload.previousValues || payload.previousValues.objectType !== args.objectType)) return false;
      }

      return true;
    },
  })
  onNewOperationLog(
    @Root() payload: OperationLogSubscriptionPayload,
    @Args() args: OperationLogSubscriptionArgs,
  ): OperationLogSubscriptionPayload {
    // already converted in filter
    // revivePayload(OperationLog, payload);

    return payload;
  }
}