import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { Pdf } from './pdf.entity';
import { PdfService } from './pdf.service';
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { PdfConnection } from './connection/pdf.connection';
import { PdfArgs } from './args/pdf.args';
import { PdfPayload } from './payload/pdf.payload';
import { PdfCreateInput } from './input/pdfCreate.input';
import { PdfUpdateInput } from './input/pdfUpdate.input';
import { PdfDeletePayload } from './payload/pdfDelete.payload';
import { PdfDeleteInput } from './input/pdfDelete.input';
export const RESOURCE_PDF = Pdf.name;

@Resolver(() => Pdf)
export class PdfFullResolver extends ResourceResolver(Pdf) {
  constructor(
    @Inject(type => PdfService)
    private readonly pdfService: PdfService,
  ) {
    super();
  }

  @FieldResolver(type => Pdf)
  async isDeleted(
    @Root() root: Pdf,
  ) {
    return root.deleted;
  }

  @FieldResolver(type => Pdf)
  async project(
    @Root() root: Pdf,
    @Ctx() { projectLoader }: ResolverContext,
  ) {
    return projectLoader.load(root.projectId.toString());
  }

  @FieldResolver()
  async pdfUploads(
    @Root() root: Pdf,
    @Ctx() {
      pdfUploadByPdfIdLoader,
    }: ResolverContext,
  ) {
    return pdfUploadByPdfIdLoader.load(root.id);
  }

  @FieldResolver()
  async pdfSources(
    @Root() root: Pdf,
    @Ctx() {
      pdfSourceByPdfIdLoader,
    }: ResolverContext,
  ) {
    return pdfSourceByPdfIdLoader.load(root.id);
  }

  @FieldResolver()
  async pdfShares(
    @Root() root: Pdf,
    @Ctx() {
      pdfShareLoader,
    }: ResolverContext,
  ) {
    return pdfShareLoader.load(root.id);
  }

  @Authorized(`${RESOURCE_PDF}:${PermissionAction.GET}`)
  @Query(type => PdfConnection, { nullable: true, name: 'pdfs' })
  async getMany(
    @Args() args: PdfArgs,
    @Ctx() { req, enforcer }: ResolverContext,
    @CurrentUser() user: LoggedInUser,
  ): Promise<PdfConnection> {
    return this.pdfService.getMany(args, user, {}, enforcer);
  }

  // @Authorized()
  // @Mutation(type => PdfShareCodePayload, { name: 'pdfShareCode', nullable: true, })
  // async generatePdfShareCode(
  //   @Arg('data') data: PdfShareCodeInput,
  //   @CurrentUser() currentUser: LoggedInUser,
  // ): Promise<PdfShareCodePayload> {
  //   return this.pdfService.generatePdfShareCode(data, currentUser);
  // }

  // @Authorized()
  // @Mutation(type => PdfShareCodePayload, { name: 'pdfShareCodeDelete', nullable: true, })
  // async pdfShareCodeDelete(
  //   @Arg('data') data: PdfShareCodeInput,
  //   @CurrentUser() currentUser: LoggedInUser,
  // ): Promise<PdfShareCodeDeletePayload> {
  //   return this.pdfService.pdfShareCodeDelete(data, currentUser);
  // }

  @Authorized(`${RESOURCE_PDF}:${PermissionAction.CREATE}`)
  @Mutation(
    type => PdfPayload,
    {
      name: 'pdfCreate',
      nullable: true,
    }
  )
  async create(
    @Arg('data') data: PdfCreateInput,
    @CurrentUser() user: LoggedInUser,
  ): Promise<PdfPayload> {
    return this.pdfService.create(data, user);
  }

  @Authorized(`${RESOURCE_PDF}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => PdfPayload,
    {
      name: 'pdfUpdate',
      nullable: true,
    }
  )
  async update(
    @Arg('data') data: PdfUpdateInput,
    @CurrentUser() user: LoggedInUser
  ): Promise<PdfPayload> {
    return this.pdfService.update(data, user);
  }

  @Authorized(`${RESOURCE_PDF}:${PermissionAction.DELETE}`)
  @Mutation(
    type => PdfDeletePayload,
    {
      name: 'pdfDelete',
      nullable: true,
    }
  )
  async delete(
    @Arg('data') data: PdfDeleteInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() { enforcer }: ResolverContext,
  ): Promise<PdfDeletePayload> {
    return this.pdfService.delete(data, user, enforcer);
  }
}
