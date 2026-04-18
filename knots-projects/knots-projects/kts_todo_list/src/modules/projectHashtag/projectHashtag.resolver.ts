import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ProjectHashtag } from "./projectHashtag.entity";
import { ProjectHashtagService } from './projectHashtag.service';
import { RESOURCE_PROJECT } from '../project/project.resolver';
import { ProjectHashtagConnection } from './connection/projectHashtag.connection';
import { ProjectHashtagArgs } from './args/projectHashtag.args';
import { ProjectHashtagPayload } from './payload/projectHashtag.payload';
import { ProjectHashtagCreateInput } from './input/projectHashtagCreate.input';
import { ProjectHashtagUpdateInput } from './input/projectHashtagUpdate.input';
import { ProjectHashtagSortInput } from './input/projectHashtagSort.input';
import { ProjectHashtagSortPayload } from './payload/projectHashtagSort.payload';

@Resolver(() => ProjectHashtag)
export class ProjectHashtagResolver extends ResourceResolver(ProjectHashtag) {
  constructor(
    @Inject(type => ProjectHashtagService)
    private readonly projectHashtagService: ProjectHashtagService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_PROJECT}:${PermissionAction.GET}`)
  @Query(type => ProjectHashtagConnection, { nullable: true, name: 'projectHashtag' })
  async getMany(@Args() args: ProjectHashtagArgs, @Ctx() req: ResolverContext): Promise<ProjectHashtagConnection> {
    return this.projectHashtagService.getMany(args);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ProjectHashtagPayload,
    {
      name: 'projectHashtagCreate'
    }
  )
  async create(
    @Arg('data') data: ProjectHashtagCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectHashtagPayload> {
    return this.projectHashtagService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectHashtagPayload,
    {
      name: 'projectHashtagUpdate'
    }
  )
  async update(
    @Arg('data') data: ProjectHashtagUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectHashtagPayload> {
    return this.projectHashtagService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectHashtagSortPayload,
    {
      name: 'projectHashtagSort'
    }
  )
  async sort(
    @Arg('data') data: ProjectHashtagSortInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectHashtagSortPayload> {
    return this.projectHashtagService.sort(data, user, enforcer);
  }

}
