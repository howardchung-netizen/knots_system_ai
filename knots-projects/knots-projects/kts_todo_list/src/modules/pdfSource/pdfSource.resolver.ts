import { Arg, Ctx, FieldResolver, Mutation, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PdfSource } from './pdfSource.entity';
import { PdfSourceService } from './pdfSource.service';
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { Inject } from "typedi";
import { PdfSourcePayload } from './payload/pdfSource.payload';
import { PdfSourceCreateInput } from './input/pdfSourceCreate.input';
import { PdfSourceSaveInput } from './input/pdfSourceSave.input';
import { getUrl } from '../../lib/utils';

@Resolver(() => PdfSource)
export class PdfSourceResolver extends ResourceResolver(PdfSource) {
  constructor(
    @Inject(type => PdfSourceService)
    private readonly pdfSourceService: PdfSourceService,
  ) {
    super();
  }

  @FieldResolver()
  fileUrl(
    @Root() root: PdfSource,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.filePath) return null;
    let folder = 'pdfSource';
    return getUrl(req, root.filePath, folder, root.id, root.updatedAt);
  }

  @FieldResolver()
  async pdfSourcePages(
    @Root() root: PdfSource,
    @Ctx() {
      pdfSourcePageByPdfSourceIdLoader,
    }: ResolverContext,
  ) {
    return pdfSourcePageByPdfSourceIdLoader.load(root.id);
  }

  @FieldResolver()
  async pdfSourceHistories(
    @Root() root: PdfSource,
    @Ctx() {
      pdfSourceHistoryByPdfSourceIdLoader,
    }: ResolverContext,
  ) {
    return pdfSourceHistoryByPdfSourceIdLoader.load(root.id);
  }

  @Mutation(
    type => PdfSourcePayload,
    {
      name: 'pdfSourceCreate',
      nullable: true,
    }
  )
  async create(
    @Arg('data') data: PdfSourceCreateInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() { req }: ResolverContext,
  ): Promise<PdfSourcePayload> {
    return this.pdfSourceService.create(data, user, req);
  }

  @Mutation(
    type => PdfSourcePayload,
    {
      name: 'pdfSourceSave',
      nullable: true,
    }
  )
  async save(
    @Arg('data') data: PdfSourceSaveInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() { req }: ResolverContext,
  ): Promise<PdfSourcePayload> {
    return this.pdfSourceService.save(data, user, req);
  }

}
