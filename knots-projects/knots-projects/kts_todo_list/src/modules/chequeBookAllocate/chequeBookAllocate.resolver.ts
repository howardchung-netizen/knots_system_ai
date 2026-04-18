import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { ChequeBookAllocate } from "./chequeBookAllocate.entity";

@Resolver(() => ChequeBookAllocate)
export class ChequeBookAllocateResolver extends ResourceResolver(ChequeBookAllocate) {
  constructor(
  ) {
    super();
  }

  @FieldResolver()
  async chequeBook(
    @Root() root: ChequeBookAllocate,
    @Ctx() {
      chequeBookLoader,
    }: ResolverContext,
  ) {
    return chequeBookLoader.load(root.chequeBookId);
  }
}
