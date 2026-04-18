import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { QuotationTemplate } from "./quotationTemplate.entity";
import { QuotationTemplateService } from './quotationTemplate.service';
import { QuotationTemplateArgs } from './args/quotationTemplate.args';
import { QuotationTemplateConnection } from './connection/quotationTemplate.connection';
import { QuotationTemplatePayload } from './payload/quotationTemplate.payload';
import { QuotationTemplateUpdateInput } from './input/quotationTemplateUpdate.input';
import { QuotationTemplateCreateInput } from './input/quotationTemplateCreate.input';
import { RESOURCE_QUOTATION } from '../quotation/quotation.resolver';
import { QuotationTemplateImportItemInput } from './input/quotationTemplateImportItem.input';
import { QuotationTemplateUpdateItemInput } from './input/quotationTemplateUpdateItem.input';

@Resolver(() => QuotationTemplate)
export class QuotationTemplateResolver extends ResourceResolver(QuotationTemplate) {
  constructor(
    @Inject(type => QuotationTemplateService)
    private readonly quotationTemplateService: QuotationTemplateService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_QUOTATION}:${PermissionAction.GET}`)
  @Query(type => QuotationTemplateConnection, { nullable: true, name: 'quotationTemplates' })
  async getMany(@Args() args: QuotationTemplateArgs, @Ctx() req: ResolverContext): Promise<QuotationTemplateConnection> {
    return this.quotationTemplateService.getMany(args);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.CREATE}`])
  @Mutation(
    type => QuotationTemplatePayload,
    {
      name: 'quotationTemplateCreate'
    }
  )
  async create(
    @Arg('data') data: QuotationTemplateCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationTemplatePayload> {
    return this.quotationTemplateService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationTemplatePayload,
    {
      name: 'quotationTemplateUpdate'
    }
  )
  async update(
    @Arg('data') data: QuotationTemplateUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationTemplatePayload> {
    return this.quotationTemplateService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationTemplatePayload,
    {
      name: 'quotationTemplateImportItem'
    }
  )
  async importItem(
    @Arg('data') data: QuotationTemplateImportItemInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationTemplatePayload> {
    return this.quotationTemplateService.importItem(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationTemplatePayload,
    {
      name: 'quotationTemplateUpdateItem'
    }
  )
  async updateItem(
    @Arg('data') data: QuotationTemplateUpdateItemInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationTemplatePayload> {
    return this.quotationTemplateService.updateItem(data, user, enforcer);
  }
}
