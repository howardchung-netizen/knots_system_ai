import { Arg, Authorized, Ctx, FieldResolver, Mutation, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PdfUpload } from './pdfUpload.entity';
import { PdfUploadService } from './pdfUpload.service';
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { Inject } from "typedi";
import { PdfUploadCreateInput } from './input/pdfUploadCreate.input';
import { PdfUploadPayload } from './payload/pdfUpload.payload';
import { getUrl } from '../../lib/utils';
import { PdfUploadDeletePayload } from './payload/pdfUploadDelete.payload';
import { PdfUploadDeleteInput } from './input/pdfUploadDelete.input';

@Resolver(() => PdfUpload)
export class PdfUploadResolver extends ResourceResolver(PdfUpload) {
  constructor(
    @Inject(type => PdfUploadService)
    private readonly pdfUploadService: PdfUploadService,
  ) {
    super();
  }

  @FieldResolver()
  fileUrl(
    @Root() root: PdfUpload,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.filePath) return null;
    let folder = 'pdfUpload';
    return getUrl(req, root.filePath, folder, root.id, root.updatedAt);
  }

  @Mutation(
    type => PdfUploadPayload,
    {
      name: 'pdfUploadCreate',
      nullable: true,
    }
  )
  async upload(
    @Arg('data') data: PdfUploadCreateInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() { req }: ResolverContext,
  ): Promise<PdfUploadPayload> {
    return this.pdfUploadService.upload(data, user, req);
  }

  @Mutation(
    type => PdfUploadDeletePayload,
    {
      name: 'pdfUploadDelete',
      nullable: true,
    }
  )
  async delete(
    @Arg('data') data: PdfUploadDeleteInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() { enforcer }: ResolverContext,
  ): Promise<PdfUploadDeletePayload> {
    return this.pdfUploadService.delete(data, user, enforcer);
  }
}
