import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PdfSourcePage } from './pdfSourcePage.entity';
import { PdfSourcePageService } from './pdfSourcePage.service';
import { Inject } from "typedi";

@Resolver(() => PdfSourcePage)
export class PdfSourcePageResolver extends ResourceResolver(PdfSourcePage) {
  constructor(
    @Inject(type => PdfSourcePageService)
    private readonly pdfSourceService: PdfSourcePageService,
  ) {
    super();
  }

  @FieldResolver()
  async pdfSourcePageVersion(
    @Root() root: PdfSourcePage,
    @Ctx() {
      pdfSourcePageVersionLoader,
    }: ResolverContext,
  ) {
    return pdfSourcePageVersionLoader.load(root.pdfSourcePageVersionId);
  }

  @FieldResolver()
  async historyVersions(
    @Root() root: PdfSourcePage,
    @Ctx() {
      historyVersionLoader,
    }: ResolverContext,
  ) {
    return historyVersionLoader.load(root.id);
  }

  @FieldResolver()
  async pdfSourcePageHistories(
    @Root() root: PdfSourcePage,
    @Ctx() {
      pdfSourcePageHistoryByPdfSourcePageIdLoader,
    }: ResolverContext,
  ) {
    return pdfSourcePageHistoryByPdfSourcePageIdLoader.load(root.id);
  }

}
