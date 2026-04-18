import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ProjectOrder } from "./projectOrder.entity";
import { ProjectOrderService } from './projectOrder.service';
import { ProjectOrderArgs } from './args/projectOrder.args';
import { ProjectOrderConnection } from './connection/projectOrder.connection';
import { ProjectOrderPayload } from './payload/projectOrder.payload';
import { ProjectOrderUpdateInput } from './input/projectOrderUpdate.input';
import { ProjectOrderCreateInput } from './input/projectOrderCreate.input';
import { RESOURCE_PROJECT } from '../project/project.resolver';
import { getUrl } from '../../lib/utils';
import { ProjectOrderDeleteInput } from './input/projectOrderDelete.input';
import { ProjectOrderDeletePayload } from './payload/projectOrderDelete.payload';
import { ProjectOrderConfirmTransferInput } from './input/projectOrderConfirmTransfer.input';
import { ProjectOrderConfirmTransferPayload } from './payload/projectOrderConfirmTransfer.payload';

@Resolver(() => ProjectOrder)
export class ProjectOrderResolver extends ResourceResolver(ProjectOrder) {
  constructor(
    @Inject(type => ProjectOrderService)
    private readonly projectOrderService: ProjectOrderService,
  ) {
    super();
  }

  @FieldResolver()
  async realId(
    @Root() root: ProjectOrder,
  ) {
    return root.id;
  }

  @FieldResolver()
  async project(
    @Root() root: ProjectOrder,
    @Ctx() {
      projectByProjectIdLoader,
    }: ResolverContext,
  ) {
    return root.projectId ? projectByProjectIdLoader.load(Number(root.projectId)) : null;
  }

  @FieldResolver()
  async claimForm(
    @Root() root: ProjectOrder,
    @Ctx() {
      claimFormLoader,
    }: ResolverContext,
  ) {
    return root.claimFormId ? claimFormLoader.load(root.claimFormId) : null;
  }

  @FieldResolver()
  async bankAccount(
    @Root() root: ProjectOrder,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.bankAccountId ? bookKeepingAccountLoader.load(root.bankAccountId) : null;
  }

  @FieldResolver()
  async categoryAccount(
    @Root() root: ProjectOrder,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.categoryAccountId ? bookKeepingAccountLoader.load(root.categoryAccountId) : null;
  }

  @FieldResolver()
  async transaction(
    @Root() root: ProjectOrder,
    @Ctx() {
      bookKeepingTransactionLoader,
    }: ResolverContext,
  ) {
    return root.transactionId ? bookKeepingTransactionLoader.load(root.transactionId) : null;
  }

  @FieldResolver()
  async fileUrl(
    @Root() root: ProjectOrder,
    @Ctx() { req }: ResolverContext,
  ) {
    return root.filePath ? getUrl(req, root.filePath, 'projectOrder', root.id, root.updatedAt) : null;
  }

  @FieldResolver()
  async files(
    @Root() root: ProjectOrder,
    @Ctx() {
      projectOrderFileLoader,
    }: ResolverContext,
  ) {
    return projectOrderFileLoader.load(root.id);
  }

  @Authorized(`${RESOURCE_PROJECT}:${PermissionAction.GET}`)
  @Query(type => ProjectOrderConnection, { nullable: true, name: 'projectOrders' })
  async getMany(@Args() args: ProjectOrderArgs, @Ctx() req: ResolverContext): Promise<ProjectOrderConnection> {
    return this.projectOrderService.getMany(args);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ProjectOrderPayload,
    {
      name: 'projectOrderCreate'
    }
  )
  async create(
    @Arg('data') data: ProjectOrderCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectOrderPayload> {
    return this.projectOrderService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectOrderPayload,
    {
      name: 'projectOrderUpdate'
    }
  )
  async update(
    @Arg('data') data: ProjectOrderUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectOrderPayload> {
    return this.projectOrderService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.DELETE}`])
  @Mutation(
    type => ProjectOrderDeletePayload,
    {
      name: 'projectOrderDelete'
    }
  )
  async delete(
    @Arg('data') data: ProjectOrderDeleteInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectOrderDeletePayload> {
    return this.projectOrderService.delete(data, user);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectOrderConfirmTransferPayload,
    {
      name: 'projectOrderConfirmTransfer'
    }
  )
  async confirmTransfer(
    @Arg('data') data: ProjectOrderConfirmTransferInput,
  ): Promise<ProjectOrderConfirmTransferPayload> {
    return this.projectOrderService.confirmTransfer(data);
  }
}
