import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ClaimForm } from "./claimForm.entity";
import { ClaimFormService } from './claimForm.service';
import { ClaimFormArgs } from './args/claimForm.args';
import { ClaimFormConnection } from './connection/claimForm.connection';
import { ClaimFormPayload } from './payload/claimForm.payload';
import { ClaimFormUpdateInput } from './input/claimFormUpdate.input';
import { ClaimFormCreateInput } from './input/claimFormCreate.input';
import { ClaimFormDeletePayload } from './payload/claimFormDelete.payload';
import { ClaimFormDeleteInput } from './input/claimFormDelete.input';
import { getUrl } from '../../lib/utils';
import { ClaimFormUploadInput } from './input/claimFormUpload.input';
import { ClaimFormConfirmTransferPayload } from './payload/claimFormConfirmTransfer.payload';
import { ClaimFormConfirmTransferInput } from './input/claimFormConfirmTransfer.input';

export const RESOURCE_CLAIM_FORM = ClaimForm.name;

@Resolver(() => ClaimForm)
export class ClaimFormResolver extends ResourceResolver(ClaimForm) {
  constructor(
    @Inject(type => ClaimFormService)
    private readonly claimFormService: ClaimFormService,
  ) {
    super();
  }

  @FieldResolver()
  async project(
    @Root() root: ClaimForm,
    @Ctx() {
      projectLoader,
    }: ResolverContext,
  ) {
    return root.projectId ? projectLoader.load(root.projectId) : null;
  }

  @FieldResolver()
  async staff(
    @Root() root: ClaimForm,
    @Ctx() {
      userLoader,
    }: ResolverContext,
  ) {
    return root.staffId ? userLoader.load(String(root.staffId)) : null;
  }

  @FieldResolver()
  async categoryAccount(
    @Root() root: ClaimForm,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.categoryAccountId ? bookKeepingAccountLoader.load(root.categoryAccountId) : null;
  }

  @FieldResolver()
  async bankAccount(
    @Root() root: ClaimForm,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.bankAccountId ? bookKeepingAccountLoader.load(root.bankAccountId) : null;
  }

  @FieldResolver()
  async fileUrl(
    @Root() root: ClaimForm,
    @Ctx() { req }: ResolverContext,
  ) {
    return root.filePath ? getUrl(req, root.filePath, 'claimFormFile', root.id, root.updatedAt) : null;
  }

  @FieldResolver()
  async files(
    @Root() root: ClaimForm,
    @Ctx() {
      claimFormFileLoader,
    }: ResolverContext,
  ) {
    return claimFormFileLoader.load(root.id);
  }

  @FieldResolver()
  async transaction(
    @Root() root: ClaimForm,
    @Ctx() {
      bookKeepingTransactionLoader,
    }: ResolverContext,
  ) {
    return root.transactionId ? bookKeepingTransactionLoader.load(root.transactionId) : null;
  }

  @Authorized(`${RESOURCE_CLAIM_FORM}:${PermissionAction.GET}`)
  @Query(type => ClaimFormConnection, { nullable: true, name: 'claimForms' })
  async getMany(@Args() args: ClaimFormArgs, @Ctx() req: ResolverContext): Promise<ClaimFormConnection> {
    return this.claimFormService.getMany(args);
  }

  @Authorized([`${RESOURCE_CLAIM_FORM}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ClaimFormPayload,
    {
      name: 'claimFormUpload'
    }
  )
  async upload(
    @Arg('data') data: ClaimFormUploadInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ClaimFormPayload> {
    return this.claimFormService.upload(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_CLAIM_FORM}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ClaimFormPayload,
    {
      name: 'claimFormCreate'
    }
  )
  async create(
    @Arg('data') data: ClaimFormCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ClaimFormPayload> {
    return this.claimFormService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_CLAIM_FORM}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ClaimFormPayload,
    {
      name: 'claimFormUpdate'
    }
  )
  async update(
    @Arg('data') data: ClaimFormUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ClaimFormPayload> {
    return this.claimFormService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_CLAIM_FORM}:${PermissionAction.DELETE}`])
  @Mutation(
    type => ClaimFormDeletePayload,
    {
      name: 'claimFormDelete'
    }
  )
  async delete(
    @Arg('data') data: ClaimFormDeleteInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ClaimFormDeletePayload> {
    return this.claimFormService.delete(data, user);
  }

  @Authorized([`${RESOURCE_CLAIM_FORM}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ClaimFormConfirmTransferPayload,
    {
      name: 'claimFormConfirmTransfer'
    }
  )
  async confirmTransfer(
    @Arg('data') data: ClaimFormConfirmTransferInput,
  ): Promise<ClaimFormConfirmTransferPayload> {
    return this.claimFormService.confirmTransfer(data);
  }

}
