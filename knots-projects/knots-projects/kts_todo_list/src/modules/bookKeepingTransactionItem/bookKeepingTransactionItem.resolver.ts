import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { ResourceResolver } from '../node/resource.resolver';
import { Inject } from "typedi";
import { BookKeepingTransactionItem } from "./bookKeepingTransactionItem.entity";
import { BookKeepingTransactionItemService } from './bookKeepingTransactionItem.service';
import { ResolverContext } from '../../lib/types';

@Resolver(() => BookKeepingTransactionItem)
export class BookKeepingTransactionItemResolver extends ResourceResolver(BookKeepingTransactionItem) {
  constructor(
    @Inject(type => BookKeepingTransactionItemService)
    private readonly bookKeepingTransactionItemService: BookKeepingTransactionItemService,
  ) {
    super();
  }

  @FieldResolver()
  async account(
    @Root() root: BookKeepingTransactionItem,
    @Ctx() {
      bookKeepingAccountLoader,
    }: ResolverContext,
  ) {
    return bookKeepingAccountLoader.load(root.accountId);
  }

  @FieldResolver()
  async transaction(
    @Root() root: BookKeepingTransactionItem,
    @Ctx() {
      bookKeepingTransactionLoader,
    }: ResolverContext,
  ) {
    return bookKeepingTransactionLoader.load(root.transactionId);
  }
}
