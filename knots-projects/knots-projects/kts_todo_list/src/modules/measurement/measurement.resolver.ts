import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { Measurement } from "./measurement.entity";
import { MeasurementService } from './measurement.service';
import { MeasurementConnection } from './connection/measurement.connection';
import { MeasurementArgs } from './args/measurement.args';
import { MeasurementPayload } from './payload/measurement.payload';
import { MeasurementCreateInput } from './input/measurementCreate.input';
import { MeasurementUpdateInput } from './input/measurementUpdate.input';
import { RESOURCE_QUOTATION } from '../quotation/quotation.resolver';
import { MeasurementSortPayload } from './payload/measurementSort.payload';
import { MeasurementSortInput } from './input/measurementSort.input';

@Resolver(() => Measurement)
export class MeasurementResolver extends ResourceResolver(Measurement) {
  constructor(
    @Inject(type => MeasurementService)
    private readonly measurementService: MeasurementService,
  ) {
    super();
  }

  @FieldResolver()
  async type(
    @Root() root: Measurement,
    @Ctx() {
      measureTypeLoader,
    }: ResolverContext,
  ) {
    return root.typeId ? measureTypeLoader.load(String(root.typeId)) : null;
  }

  @FieldResolver()
  async realId(
    @Root() root: Measurement,
  ) {
    return root.id;
  }

  @Authorized(`${RESOURCE_QUOTATION}:${PermissionAction.GET}`)
  @Query(type => MeasurementConnection, { nullable: true, name: 'measurements' })
  async getMany(@Args() args: MeasurementArgs, @Ctx() req: ResolverContext): Promise<MeasurementConnection> {
    return this.measurementService.getMany(args);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.CREATE}`])
  @Mutation(
    type => MeasurementPayload,
    {
      name: 'measurementCreate'
    }
  )
  async create(
    @Arg('data') data: MeasurementCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<MeasurementPayload> {
    return this.measurementService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => MeasurementPayload,
    {
      name: 'measurementUpdate'
    }
  )
  async update(
    @Arg('data') data: MeasurementUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<MeasurementPayload> {
    return this.measurementService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_QUOTATION}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => MeasurementSortPayload,
    {
      name: 'measurementSort'
    }
  )
  async sort(
    @Arg('data') data: MeasurementSortInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<MeasurementSortPayload> {
    return this.measurementService.sort(data, user, enforcer);
  }
}
