import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { Quotation } from "./quotation.entity";
import { QuotationService } from './quotation.service';
import { QuotationConnection } from './connection/quotation.connection';
import { QuotationArgs } from './args/quotation.args';
import { QuotationPayload } from './payload/quotation.payload';
import { QuotationCreateInput } from './input/quotationCreate.input';
import { QuotationUpdateInput } from './input/quotationUpdate.input';
import { QuotationBudgetUpdateInput } from './input/quotationBudgetUpdate.input';
import { QuotationUpdateItemInput } from './input/quotationItemUpdate.input';
import { QuotationImportItemInput } from './input/quotationItemImport.input';
import { QuotationImportTermInput } from './input/quotationTermImport.input';
import { QuotationUpdateTermInput } from './input/quotationTermUpdate.input';
import { QuotationMarkupUpdateInput } from './input/quotationMarkupUpdate.input';
import { QuotationUploadFileInput } from './input/quotationUploadFile.input';
import { QuotationDuplicateInput } from './input/quotationDuplicate.input';

export const RESOURCE_QUOTATION = Quotation.name;

@Resolver(() => Quotation)
export class QuotationResolver extends ResourceResolver(Quotation) {
  constructor(
    @Inject(type => QuotationService)
    private readonly quotationService: QuotationService,
  ) {
    super();
  }

  @FieldResolver()
  async project(
    @Root() root: Quotation,
    @Ctx() {
      projectByProjectIdLoader,
    }: ResolverContext,
  ) {
    return root.projectId ? projectByProjectIdLoader.load(Number(root.projectId)) : null;
  }

  @FieldResolver()
  async progress(
    @Root() root: Quotation,
    @Ctx() {
      quotationStatusLoader,
    }: ResolverContext,
  ) {
    return root.progressId ? quotationStatusLoader.load(String(root.progressId)) : null;
  }

  @FieldResolver()
  async client(
    @Root() root: Quotation,
    @Ctx() {
      clientLoader,
    }: ResolverContext,
  ) {
    return root.clientId ? clientLoader.load(String(root.clientId)) : null;
  }

  @FieldResolver()
  async mainContact(
    @Root() root: Quotation,
    @Ctx() {
      clientContactsByIdLoader,
    }: ResolverContext,
  ) {
    return root.mainContacts_id ? clientContactsByIdLoader.load(String(root.mainContacts_id)) : null;
  }

  @FieldResolver()
  async quotationFiles(
    @Root() root: Quotation,
    @Ctx() {
      quotationFileByIdLoader,
    }: ResolverContext,
  ) {
    return quotationFileByIdLoader.load(root.id);
  }

  @Authorized(`${RESOURCE_QUOTATION}:${PermissionAction.GET}`)
  @Query(type => QuotationConnection, { nullable: true, name: 'quotations' })
  async getMany(@Args() args: QuotationArgs, @Ctx() req: ResolverContext): Promise<QuotationConnection> {
    return this.quotationService.getMany(args);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.CREATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationCreate'
    }
  )
  async create(
    @Arg('data') data: QuotationCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationUpdate'
    }
  )
  async update(
    @Arg('data') data: QuotationUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationClientUpdate'
    }
  )

  async clientUpdate(
    @Arg('data') data: QuotationUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.clientUpdate(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationBudgetUpdate'
    }
  )
  async budgetUpdate(
    @Arg('data') data: QuotationBudgetUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.budgetUpdate(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationImportItem'
    }
  )
  async importItem(
    @Arg('data') data: QuotationImportItemInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.importItem(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationUpdateItem'
    }
  )
  async updateItem(
    @Arg('data') data: QuotationUpdateItemInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.updateItem(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationMarkupUpdate'
    }
  )
  async updateMarkup(
    @Arg('data') data: QuotationMarkupUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.updateMark(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationImportTerm'
    }
  )
  async importTerm(
    @Arg('data') data: QuotationImportTermInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.importTerm(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationUpdateTerm'
    }
  )
  async updateTerms(
    @Arg('data') data: QuotationUpdateTermInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.updateTerm(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationUploadFile'
    }
  )
  async uploadFile(
    @Arg('data') data: QuotationUploadFileInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.uploadFile(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationPayload,
    {
      name: 'quotationDuplicate'
    }
  )
  async duplication(
    @Arg('data') data: QuotationDuplicateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationPayload> {
    return this.quotationService.duplicateQuotation(data, user, enforcer);
  }
}
