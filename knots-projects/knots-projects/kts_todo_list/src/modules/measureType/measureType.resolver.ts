import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { MeasureType } from "./measureType.entity";
import { MeasureTypeService } from './measureType.service';
import { MeasureTypeConnection } from './connection/measureType.connection';
import { MeasureTypeArgs } from './args/measureType.args';
import { MeasureTypePayload } from './payload/measureType.payload';
import { MeasureTypeCreateInput } from './input/measureTypeCreate.input';
import { MeasureTypeUpdateInput } from './input/measureTypeUpdate.input';
import { RESOURCE_QUOTATION } from '../quotation/quotation.resolver';
import { MeasureTypeSortInput } from './input/measureTypeSort.input';
import { MeasureTypeSortPayload } from './payload/measureTypeSort.payload';

@Resolver(() => MeasureType)
export class MeasureTypeResolver extends ResourceResolver(MeasureType) {
  constructor(
    @Inject(type => MeasureTypeService)
    private readonly measureTypeService: MeasureTypeService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_QUOTATION}:${PermissionAction.GET}`)
  @Query(type => MeasureTypeConnection, { nullable: true, name: 'measureTypes' })
  async getMany(@Args() args: MeasureTypeArgs, @Ctx() req: ResolverContext): Promise<MeasureTypeConnection> {
    return this.measureTypeService.getMany(args);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.CREATE}`])
  @Mutation(
    type => MeasureTypePayload,
    {
      name: 'measureTypeCreate'
    }
  )
  async create(
    @Arg('data') data: MeasureTypeCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<MeasureTypePayload> {
    return this.measureTypeService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => MeasureTypePayload,
    {
      name: 'measureTypeUpdate'
    }
  )
  async update(
    @Arg('data') data: MeasureTypeUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<MeasureTypePayload> {
    return this.measureTypeService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => MeasureTypeSortPayload,
    {
      name: 'measureTypeSort'
    }
  )
  async sort(
    @Arg('data') data: MeasureTypeSortInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<MeasureTypeSortPayload> {
    return this.measureTypeService.sort(data, user, enforcer);
  }

}
