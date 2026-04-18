import { Arg, Args, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { ResourceResolver } from '../node/resource.resolver';
import { PdfShare } from './pdfShare.entity';
import { PdfService } from './pdfShare.service';
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { Inject } from "typedi";
import { PdfShareConnection } from './connection/pdfShare.connection';
import { PdfSharePayload } from './payload/pdfShare.payload';
import { PdfShareArgs } from './args/pdfShare.args';
import { PdfCheckShareArgs } from './args/pdfCheckShare.args';
import { PdfShareGenerateInput } from './input/pdfShareGenerate.input';
import { PdfShareDisablePayload } from './payload/pdfShareDisable.payload';
import { PdfShareDisableInput } from './input/pdfShareDisable.input';
import { PdfShareCheckCodePayload } from './payload/pdfShareCheckCode.payload';

@Resolver(() => PdfShare)
export class PdfShareResolver extends ResourceResolver(PdfShare) {
  constructor(
    @Inject(type => PdfService)
    private readonly pdfService: PdfService,
  ) {
    super();
  }

  @Authorized()
  @Query(type => PdfShareConnection, { nullable: true, name: 'pdfShares' })
  async getPdfShare(@Args() args: PdfShareArgs): Promise<PdfShareConnection> {
    return this.pdfService.getShareInConnection(args);
  }

  //@Authorized()
  @Query(type => PdfShareCheckCodePayload, { nullable: true, name: 'checkPdfShareCode' })
  async checkShareCode(@Args() args: PdfCheckShareArgs, @CurrentUser() user: LoggedInUser,): Promise<PdfShareCheckCodePayload> {
    return this.pdfService.checkShareCode(args, user);
  }

  @Authorized()
  @Mutation(type => PdfSharePayload, { name: 'pdfShareGenerate', nullable: true, })
  async generateCode(
    @Arg('data') data: PdfShareGenerateInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<PdfSharePayload> {
    return this.pdfService.generateCode(data, currentUser);
  }

  @Authorized()
  @Mutation(type => PdfShareDisablePayload, { name: 'pdfShareDisable', nullable: true, })
  async disableCode(
    @Arg('data') data: PdfShareDisableInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<PdfShareDisablePayload> {
    return this.pdfService.disableCode(data, currentUser);
  }

}
