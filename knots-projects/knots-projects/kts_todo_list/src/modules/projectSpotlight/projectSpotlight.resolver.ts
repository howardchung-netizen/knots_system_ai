import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ProjectSpotlight } from "./projectSpotlight.entity";
import { RESOURCE_PROJECT } from '../project/project.resolver';
import { ProjectSpotlightConnection } from './connection/projectSpotlight.connection';
import { ProjectSpotlightArgs } from './args/projectSpotlight.args';
import { ProjectSpotlightPayload } from './payload/projectSpotlight.payload';
import { ProjectSpotlightCreateInput } from './input/projectSpotlightCreate.input';
import { ProjectSpotlightUpdateInput } from './input/projectSpotlightUpdate.input';
import { ProjectSpotlightService } from './projectSpotlight.service';

@Resolver(() => ProjectSpotlight)
export class ProjectSpotlightResolver extends ResourceResolver(ProjectSpotlight) {
  constructor(
    @Inject(type => ProjectSpotlightService)
    private readonly projectSpotlightService: ProjectSpotlightService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_PROJECT}:${PermissionAction.GET}`)
  @Query(type => ProjectSpotlightConnection, { nullable: true, name: 'projectSpotlight' })
  async getMany(@Args() args: ProjectSpotlightArgs, @Ctx() req: ResolverContext): Promise<ProjectSpotlightConnection> {
    return this.projectSpotlightService.getMany(args);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ProjectSpotlightPayload,
    {
      name: 'projectSpotlightCreate'
    }
  )
  async create(
    @Arg('data') data: ProjectSpotlightCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectSpotlightPayload> {
    return this.projectSpotlightService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectSpotlightPayload,
    {
      name: 'projectSpotlightUpdate'
    }
  )
  async update(
    @Arg('data') data: ProjectSpotlightUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectSpotlightPayload> {
    return this.projectSpotlightService.save(data, user, enforcer);
  }

}
