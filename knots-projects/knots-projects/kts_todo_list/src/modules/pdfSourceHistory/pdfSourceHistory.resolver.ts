import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PdfSourceHistory } from './pdfSourceHistory.entity';
import { getUrl } from '../../lib/utils';

@Resolver(() => PdfSourceHistory)
export class PdfSourceHistoryResolver extends ResourceResolver(PdfSourceHistory) {
  constructor(
  ) {
    super();
  }

  @FieldResolver()
  fileUrl(
    @Root() root: PdfSourceHistory,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.filePath) return null;
    const folder = 'pdfSourceHistoryFile';
    return getUrl(req, root.filePath, folder, root.id, root.updatedAt);
  }

  @FieldResolver()
  compareUrl(
    @Root() root: PdfSourceHistory,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.comparePath) return null;
    const folder = 'pdfSourceHistoryCompare';
    return getUrl(req, root.comparePath, folder, root.id, root.updatedAt);
  }

  @FieldResolver()
  async pdfSource(
    @Root() root: PdfSourceHistory,
    @Ctx() {
      pdfSourceLoader,
    }: ResolverContext,
  ) {
    return pdfSourceLoader.load(root.id);
  }

}
