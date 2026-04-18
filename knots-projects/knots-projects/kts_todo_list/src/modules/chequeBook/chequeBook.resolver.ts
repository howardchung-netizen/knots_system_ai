import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ChequeBook } from "./chequeBook.entity";
import { ChequeBookService } from './chequeBook.service';
import { ChequeBookArgs } from './args/chequeBook.args';
import { ChequeBookConnection } from './connection/chequeBook.connection';
import { ChequeBookPayload } from './payload/chequeBook.payload';
import { ChequeBookUpdateInput } from './input/chequeBookUpdate.input';
import { ChequeBookCreateInput } from './input/chequeBookCreate.input';
import { ChequeBookConfirmTransferPayload } from './payload/chequeBookConfirmTransfer.payload';
import { ChequeBookConfirmTransferInput } from './input/chequeBookConfirmTransfer.input';
import { ChequeBookDeletePayload } from './payload/chequeBookDelete.payload';
import { ChequeBookDeleteInput } from './input/chequeBookDelete.input';

export const RESOURCE_CHEQUE_BOOK = ChequeBook.name;

@Resolver(() => ChequeBook)
export class ChequeBookResolver extends ResourceResolver(ChequeBook) {
  constructor(
    @Inject(type => ChequeBookService)
    private readonly chequeBookService: ChequeBookService,
  ) {
    super();
  }

  @FieldResolver()
  async allocates(
    @Root() root: ChequeBook,
    @Ctx() {
      chequeBookAllocateLoader,
    }: ResolverContext,
  ) {
    return chequeBookAllocateLoader.load(root.id);
  }

  @FieldResolver()
  async forPettyCashStaff(
    @Root() root: ChequeBook,
    @Ctx() {
      userLoader,
    }: ResolverContext,
  ) {
    return root.forPettyCashStaffId ? userLoader.load(String(root.forPettyCashStaffId)) : null;
  }

  @FieldResolver()
  async categoryAccount(
    @Root() root: ChequeBook,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.categoryAccountId ? bookKeepingAccountLoader.load(root.categoryAccountId) : null;
  }

  @FieldResolver()
  async chargeAccount(
    @Root() root: ChequeBook,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return root.chargeAccountId ? bookKeepingAccountLoader.load(root.chargeAccountId) : null;
  }

  @FieldResolver()
  async company(
    @Root() root: ChequeBook,
    @Ctx() {
      bookKeepingCompanyLoader,
    }: ResolverContext,
  ) {
    return root.companyId ? bookKeepingCompanyLoader.load(root.companyId) : null;
  }

  @FieldResolver()
  async transaction(
    @Root() root: ChequeBook,
    @Ctx() {
      bookKeepingTransactionLoader,
    }: ResolverContext,
  ) {
    return root.transactionId ? bookKeepingTransactionLoader.load(root.transactionId) : null;
  }

  @Authorized(`${RESOURCE_CHEQUE_BOOK}:${PermissionAction.GET}`)
  @Query(type => ChequeBookConnection, { nullable: true, name: 'chequeBooks' })
  async getMany(@Args() args: ChequeBookArgs, @Ctx() req: ResolverContext): Promise<ChequeBookConnection> {
    return this.chequeBookService.getMany(args);
  }

  @Authorized([`${RESOURCE_CHEQUE_BOOK}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ChequeBookPayload,
    {
      name: 'chequeBookCreate'
    }
  )
  async create(
    @Arg('data') data: ChequeBookCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ChequeBookPayload> {
    return this.chequeBookService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_CHEQUE_BOOK}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ChequeBookPayload,
    {
      name: 'chequeBookUpdate'
    }
  )
  async update(
    @Arg('data') data: ChequeBookUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ChequeBookPayload> {
    return this.chequeBookService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_CHEQUE_BOOK}:${PermissionAction.DELETE}`])
  @Mutation(
    type => ChequeBookDeletePayload,
    {
      name: 'chequeBookDelete'
    }
  )
  async delete(
    @Arg('data') data: ChequeBookDeleteInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ChequeBookDeletePayload> {
    return this.chequeBookService.delete(data, user);
  }

  @Authorized([`${RESOURCE_CHEQUE_BOOK}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ChequeBookConfirmTransferPayload,
    {
      name: 'chequeBookConfirmTransfer'
    }
  )
  async confirmTransfer(
    @Arg('data') data: ChequeBookConfirmTransferInput,
  ): Promise<ChequeBookConfirmTransferPayload> {
    return this.chequeBookService.confirmTransfer(data);
  }

}
