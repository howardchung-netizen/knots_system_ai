import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { QuotationStatus } from "./quotationStatus.entity";
import { QuotationStatusService } from './quotationStatus.service';
import { QuotationStatusConnection } from './connection/quotationStatus.connection';
import { QuotationStatusArgs } from './args/quotationStatus.args';
import { QuotationStatusPayload } from './payload/quotationStatus.payload';
import { QuotationStatusCreateInput } from './input/quotationStatusCreate.input';
import { QuotationStatusUpdateInput } from './input/quotationStatusUpdate.input';
import { RESOURCE_QUOTATION } from '../quotation/quotation.resolver';

@Resolver(() => QuotationStatus)
export class QuotationStatusResolver extends ResourceResolver(QuotationStatus) {
  constructor(
    @Inject(type => QuotationStatusService)
    private readonly quotationStatusService: QuotationStatusService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_QUOTATION}:${PermissionAction.GET}`)
  @Query(type => QuotationStatusConnection, { nullable: true, name: 'quotationStatuses' })
  async getMany(@Args() args: QuotationStatusArgs, @Ctx() req: ResolverContext): Promise<QuotationStatusConnection> {
    return this.quotationStatusService.getMany(args);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.CREATE}`])
  @Mutation(
    type => QuotationStatusPayload,
    {
      name: 'quotationStatusCreate'
    }
  )
  async create(
    @Arg('data') data: QuotationStatusCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationStatusPayload> {
    return this.quotationStatusService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => QuotationStatusPayload,
    {
      name: 'quotationStatusUpdate'
    }
  )
  async update(
    @Arg('data') data: QuotationStatusUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<QuotationStatusPayload> {
    return this.quotationStatusService.save(data, user, enforcer);
  }

}
