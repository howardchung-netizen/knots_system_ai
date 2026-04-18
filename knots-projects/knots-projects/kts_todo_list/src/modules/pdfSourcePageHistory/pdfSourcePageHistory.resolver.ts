import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PdfSourcePageHistory } from './pdfSourcePageHistory.entity';
import { getUrl } from '../../lib/utils';

@Resolver(() => PdfSourcePageHistory)
export class PdfSourcePageHistoryResolver extends ResourceResolver(PdfSourcePageHistory) {
  constructor(
  ) {
    super();
  }

  @FieldResolver()
  fileUrl(
    @Root() root: PdfSourcePageHistory,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.filePath) return null;
    const folder = 'pdfSourcePageHistoryFile';
    return getUrl(req, root.filePath, folder, root.id, root.updatedAt);
  }

  @FieldResolver()
  compareUrl(
    @Root() root: PdfSourcePageHistory,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.comparePath) return null;
    const folder = 'pdfSourcePageHistoryCompare';
    return getUrl(req, root.comparePath, folder, root.id, root.updatedAt);
  }

  @FieldResolver()
  async pdfSourcePage(
    @Root() root: PdfSourcePageHistory,
    @Ctx() {
      pdfSourcePageLoader,
    }: ResolverContext,
  ) {
    return pdfSourcePageLoader.load(root.id);
  }

}
