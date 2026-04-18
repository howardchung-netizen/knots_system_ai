import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ProjectStatus } from "./projectStatus.entity";
import { ProjectStatusService } from './projectStatus.service';
import { RESOURCE_PROJECT } from '../project/project.resolver';
import { ProjectStatusConnection } from './connection/projectStatus.connection';
import { ProjectStatusArgs } from './args/projectStatus.args';
import { ProjectStatusPayload } from './payload/projectStatus.payload';
import { ProjectStatusCreateInput } from './input/projectStatusCreate.input';
import { ProjectStatusUpdateInput } from './input/projectStatusUpdate.input';

@Resolver(() => ProjectStatus)
export class ProjectStatusResolver extends ResourceResolver(ProjectStatus) {
  constructor(
    @Inject(type => ProjectStatusService)
    private readonly projectStatusService: ProjectStatusService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_PROJECT}:${PermissionAction.GET}`)
  @Query(type => ProjectStatusConnection, { nullable: true, name: 'projectStatuss' })
  async getMany(@Args() args: ProjectStatusArgs, @Ctx() req: ResolverContext): Promise<ProjectStatusConnection> {
    return this.projectStatusService.getMany(args);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ProjectStatusPayload,
    {
      name: 'projectStatusCreate'
    }
  )
  async create(
    @Arg('data') data: ProjectStatusCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectStatusPayload> {
    return this.projectStatusService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectStatusPayload,
    {
      name: 'projectStatusUpdate'
    }
  )
  async update(
    @Arg('data') data: ProjectStatusUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectStatusPayload> {
    return this.projectStatusService.save(data, user, enforcer);
  }

}
