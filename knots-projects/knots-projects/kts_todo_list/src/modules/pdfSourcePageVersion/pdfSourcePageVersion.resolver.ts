import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PdfSourcePageVersion } from './pdfSourcePageVersion.entity';
import { PdfSourcePageVersionService } from './pdfSourcePageVersion.service';
import { Inject } from "typedi";
import { getUrl } from '../../lib/utils';

@Resolver(() => PdfSourcePageVersion)
export class PdfSourcePageVersionResolver extends ResourceResolver(PdfSourcePageVersion) {
  constructor(
    @Inject(type => PdfSourcePageVersionService)
    private readonly pdfSourceService: PdfSourcePageVersionService,
  ) {
    super();
  }

  @FieldResolver()
  fileUrl(
    @Root() root: PdfSourcePageVersion,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.filePath) return null;
    let folder = 'pdfSourcePageVersionFile';
    return getUrl(req, root.filePath, folder, root.id, root.updatedAt);
  }

  @FieldResolver()
  imageUrl(
    @Root() root: PdfSourcePageVersion,
    @Ctx() { req }: ResolverContext,
  ) {
    if (!root.imagePath) return null;
    let folder = 'pdfSourcePageVersionImage';
    return getUrl(req, root.imagePath, folder, root.id, root.updatedAt);
  }

}
