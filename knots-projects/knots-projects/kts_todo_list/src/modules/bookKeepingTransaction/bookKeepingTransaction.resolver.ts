import { Arg, Args, Authorized, Ctx, Field, FieldResolver, Int, Mutation, ObjectType, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { BookKeepingTransaction } from "./bookKeepingTransaction.entity";
import { BookKeepingTransactionService } from './bookKeepingTransaction.service';
import { BookKeepingTransactionArgs } from './args/bookKeepingTransaction.args';
import { BookKeepingTransactionConnection } from './connection/bookKeepingTransaction.connection';
import { BookKeepingTransactionPayload } from './payload/bookKeepingTransaction.payload';
import { BookKeepingTransactionUpdateInput } from './input/bookKeepingTransactionUpdate.input';
import { BookKeepingTransactionCreateInput } from './input/bookKeepingTransactionCreate.input';
import { BookKeepingTransactionDeletePayload } from './payload/bookKeepingTransactionDelete.payload';
import { BookKeepingTransactionDeleteInput } from './input/bookKeepingTransactionDelete.input';
import { BookKeepingTransactionItemDeletePayload } from './payload/bookKeepingTransactionItemDelete.payload';
import { BookKeepingTransactionItemDeleteInput } from './input/bookKeepingTransactionItemDelete.input';

export const RESOURCE_BOOKKEEPING_TRANSACTION = BookKeepingTransaction.name;

@ObjectType()
export class BookKeepingFinancialYear {
  @Field(type => Int)
  financialYearStart: number;

  @Field(type => Int)
  financialYearEnd: number;
}

@Resolver(() => BookKeepingTransaction)
export class BookKeepingTransactionResolver extends ResourceResolver(BookKeepingTransaction) {
  constructor(
    @Inject(type => BookKeepingTransactionService)
    private readonly bookKeepingTransactionService: BookKeepingTransactionService,
  ) {
    super();
  }

  @FieldResolver()
  async transactionItems(
    @Root() root: BookKeepingTransaction,
    @Ctx() {
      bookKeepingTransactionItemsLoader,
    }: ResolverContext,
  ) {
    return bookKeepingTransactionItemsLoader.load(root.id);
  }

  @FieldResolver()
  async chequeBook(
    @Root() root: BookKeepingTransaction,
    @Ctx() {
      chequeBookLoader,
    }: ResolverContext,
  ) {
    return root.chequeBookId ? chequeBookLoader.load(root.chequeBookId) : null;
  }

  @FieldResolver()
  async invoice(
    @Root() root: BookKeepingTransaction,
    @Ctx() {
      projectInvoiceLoader,
    }: ResolverContext,
  ) {
    return root.invoiceId ? projectInvoiceLoader.load(root.invoiceId) : null;
  }

  @FieldResolver()
  async claimForm(
    @Root() root: BookKeepingTransaction,
    @Ctx() {
      claimFormLoader,
    }: ResolverContext,
  ) {
    return root.claimFormId ? claimFormLoader.load(root.claimFormId) : null;
  }

  @FieldResolver()
  async order(
    @Root() root: BookKeepingTransaction,
    @Ctx() {
      projectOrderLoader,
    }: ResolverContext,
  ) {
    return root.orderId ? projectOrderLoader.load(root.orderId) : null;
  }


  @Authorized(`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.GET}`)
  @Query(type => BookKeepingTransactionConnection, { nullable: true, name: 'bookKeepingTransactions' })
  async getMany(@Args() args: BookKeepingTransactionArgs, @Ctx() req: ResolverContext): Promise<BookKeepingTransactionConnection> {
    return this.bookKeepingTransactionService.getMany(args);
  }

  @Authorized(`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.GET}`)
  @Query(type => [BookKeepingFinancialYear], { nullable: true, name: 'bookKeepingFinancialYears' })
  async getFinancialYear(): Promise<BookKeepingFinancialYear[]> {
    return this.bookKeepingTransactionService.getFinancialYear();
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.CREATE}`])
  @Mutation(
    type => BookKeepingTransactionPayload,
    {
      name: 'bookKeepingTransactionCreate'
    }
  )
  async create(
    @Arg('data') data: BookKeepingTransactionCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<BookKeepingTransactionPayload> {
    return this.bookKeepingTransactionService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => BookKeepingTransactionPayload,
    {
      name: 'bookKeepingTransactionUpdate'
    }
  )
  async update(
    @Arg('data') data: BookKeepingTransactionUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<BookKeepingTransactionPayload> {
    return this.bookKeepingTransactionService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.DELETE}`])
  @Mutation(
    type => BookKeepingTransactionDeletePayload,
    {
      name: 'bookKeepingTransactionDelete',
      nullable: true,
    }
  )
  async delete(
    @Ctx() { user }: ResolverContext,
    @Arg('data') data: BookKeepingTransactionDeleteInput,
  ): Promise<BookKeepingTransactionDeletePayload> {
    return this.bookKeepingTransactionService.delete(data, user);
  }

  @Authorized([`${RESOURCE_BOOKKEEPING_TRANSACTION}:${PermissionAction.DELETE}`])
  @Mutation(
    type => BookKeepingTransactionItemDeletePayload,
    {
      name: 'bookKeepingTransactionItemDelete',
      nullable: true,
    }
  )
  async deleteItem(
    @Ctx() { user }: ResolverContext,
    @Arg('data') data: BookKeepingTransactionItemDeleteInput,
  ): Promise<BookKeepingTransactionItemDeletePayload> {
    return this.bookKeepingTransactionService.deleteItem(data, user);
  }

}
