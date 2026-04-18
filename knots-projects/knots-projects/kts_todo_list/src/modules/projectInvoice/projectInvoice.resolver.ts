import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ProjectInvoice } from "./projectInvoice.entity";
import { ProjectInvoiceService } from './projectInvoice.service';
import { ProjectInvoiceArgs } from './args/projectInvoice.args';
import { ProjectInvoiceConnection } from './connection/projectInvoice.connection';
import { ProjectInvoicePayload } from './payload/projectInvoice.payload';
import { ProjectInvoiceUpdateInput } from './input/projectInvoiceUpdate.input';
import { ProjectInvoiceCreateInput } from './input/projectInvoiceCreate.input';
import { RESOURCE_PROJECT } from '../project/project.resolver';
import { ProjectInvoiceDeleteInput } from './input/projectInvoiceDelete.input';
import { ProjectInvoiceConfirmTransferPayload } from './payload/projectInvoiceConfirmTransfer.payload';
import { ProjectInvoiceConfirmTransferInput } from './input/projectInvoiceConfirmTransfer.input';

@Resolver(() => ProjectInvoice)
export class ProjectInvoiceResolver extends ResourceResolver(ProjectInvoice) {
  constructor(
    @Inject(type => ProjectInvoiceService)
    private readonly projectInvoiceService: ProjectInvoiceService,
  ) {
    super();
  }

  @FieldResolver()
  async client(
    @Root() root: ProjectInvoice,
    @Ctx() {
      clientLoader,
    }: ResolverContext,
  ) {
    return root.clientId ? clientLoader.load(String(root.clientId)) : null;
  }

  @FieldResolver()
  async mainContact(
    @Root() root: ProjectInvoice,
    @Ctx() {
      clientContactsByIdLoader,
    }: ResolverContext,
  ) {
    return root.mainContacts_id ? clientContactsByIdLoader.load(String(root.mainContacts_id)) : null;
  }

  @FieldResolver()
  async categoryAccount(
    @Root() root: ProjectInvoice,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.categoryAccountId ? bookKeepingAccountLoader.load(root.categoryAccountId) : null;
  }

  @FieldResolver()
  async bankAccount(
    @Root() root: ProjectInvoice,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.bankAccountId ? bookKeepingAccountLoader.load(root.bankAccountId) : null;
  }

  @FieldResolver()
  async transaction(
    @Root() root: ProjectInvoice,
    @Ctx() {
      bookKeepingTransactionLoader,
    }: ResolverContext,
  ) {
    return root.transactionId ? bookKeepingTransactionLoader.load(root.transactionId) : null;
  }

  @Authorized(`${RESOURCE_PROJECT}:${PermissionAction.GET}`)
  @Query(type => ProjectInvoiceConnection, { nullable: true, name: 'projectInvoices' })
  async getMany(@Args() args: ProjectInvoiceArgs, @Ctx() req: ResolverContext): Promise<ProjectInvoiceConnection> {
    return this.projectInvoiceService.getMany(args);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ProjectInvoicePayload,
    {
      name: 'projectInvoiceCreate'
    }
  )
  async create(
    @Arg('data') data: ProjectInvoiceCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectInvoicePayload> {
    return this.projectInvoiceService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectInvoicePayload,
    {
      name: 'projectInvoiceUpdate'
    }
  )
  async update(
    @Arg('data') data: ProjectInvoiceUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectInvoicePayload> {
    return this.projectInvoiceService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.DELETE}`])
  @Mutation(
    type => ProjectInvoicePayload,
    {
      name: 'projectInvoiceDelete'
    }
  )
  async delete(
    @Arg('data') data: ProjectInvoiceDeleteInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectInvoicePayload> {
    return this.projectInvoiceService.delete(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectInvoiceConfirmTransferPayload,
    {
      name: 'projectInvoiceConfirmTransfer'
    }
  )
  async confirmTransfer(
    @Arg('data') data: ProjectInvoiceConfirmTransferInput,
  ): Promise<ProjectInvoiceConfirmTransferPayload> {
    return this.projectInvoiceService.confirmTransfer(data);
  }
}
