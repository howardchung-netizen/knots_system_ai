import { Arg, Authorized, Ctx, FieldResolver, Mutation, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PdfCompare } from './pdfCompare.entity';
import { PdfCompareService } from './pdfCompare.service';
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { Inject } from "typedi";
import { PdfComparePayload } from './payload/pdfCompare.payload';
import { PdfCompareCreateInput } from './input/pdfCompareCreate.input';
import { getUrl } from '../../lib/utils';
import { PdfCompareUploadPayload } from './payload/pdfCompareUpload.payload';
import { PdfCompareUploadInput } from './input/pdfCompareCompare.input';

@Resolver(() => PdfCompare)
export class PdfCompareResolver extends ResourceResolver(PdfCompare) {
  constructor(
    @Inject(type => PdfCompareService)
    private readonly pdfCompareService: PdfCompareService,
  ) {
    super();
  }

  @FieldResolver()
  fileUrl(
    @Root() root: PdfCompare,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.filePath) return null;
    let folder = 'pdfCompare';
    return getUrl(req, root.filePath, folder, root.id, root.updatedAt);
  }

  @FieldResolver()
  async sourcePageVersion(
    @Root() root: PdfCompare,
    @Ctx() {
      pdfSourcePageVersionLoader,
    }: ResolverContext,
  ) {
    return pdfSourcePageVersionLoader.load(root.sourcePageVersionId);
  }

  @FieldResolver()
  async targetPageVersion(
    @Root() root: PdfCompare,
    @Ctx() {
      pdfSourcePageVersionLoader,
    }: ResolverContext,
  ) {
    return pdfSourcePageVersionLoader.load(root.targetPageVersionId);
  }

  @Authorized()
  @Mutation(
    type => PdfComparePayload,
    {
      name: 'pdfCompare',
      nullable: true,
    }
  )
  async pdfCompare(
    @Arg('data') data: PdfCompareCreateInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() { req }: ResolverContext,
  ): Promise<PdfComparePayload> {
    return this.pdfCompareService.pdfCompare(data, user, req);
  }

  @Authorized()
  @Mutation(
    type => PdfCompareUploadPayload,
    {
      name: 'pdfCompareUpload',
      nullable: true,
    }
  )
  async pdfCompareUpload(
    @Arg('data') data: PdfCompareUploadInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() { req }: ResolverContext,
  ): Promise<PdfCompareUploadPayload> {
    return this.pdfCompareService.pdfCompareUpload(data, user, req);
  }
}
