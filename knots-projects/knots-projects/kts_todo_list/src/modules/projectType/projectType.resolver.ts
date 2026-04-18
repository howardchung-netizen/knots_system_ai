import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ProjectType } from "./projectType.entity";
import { ProjectTypeService } from './projectType.service';
import { RESOURCE_PROJECT } from '../project/project.resolver';
import { ProjectTypeConnection } from './connection/projectType.connection';
import { ProjectTypeArgs } from './args/projectType.args';
import { ProjectTypePayload } from './payload/projectType.payload';
import { ProjectTypeCreateInput } from './input/projectTypeCreate.input';
import { ProjectTypeUpdateInput } from './input/projectTypeUpdate.input';
import { ProjectTypeSortPayload } from './payload/projectTypeSort.payload';
import { ProjectTypeSortInput } from './input/projectTypeSort.input';

@Resolver(() => ProjectType)
export class ProjectTypeResolver extends ResourceResolver(ProjectType) {
  constructor(
    @Inject(type => ProjectTypeService)
    private readonly projectTypeService: ProjectTypeService,
  ) {
    super();
  }

  @Authorized(`${RESOURCE_PROJECT}:${PermissionAction.GET}`)
  @Query(type => ProjectTypeConnection, { nullable: true, name: 'projectTypes' })
  async getMany(@Args() args: ProjectTypeArgs, @Ctx() req: ResolverContext): Promise<ProjectTypeConnection> {
    return this.projectTypeService.getMany(args);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ProjectTypePayload,
    {
      name: 'projectTypeCreate'
    }
  )
  async create(
    @Arg('data') data: ProjectTypeCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectTypePayload> {
    return this.projectTypeService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectTypePayload,
    {
      name: 'projectTypeUpdate'
    }
  )
  async update(
    @Arg('data') data: ProjectTypeUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectTypePayload> {
    return this.projectTypeService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectTypeSortPayload,
    {
      name: 'projectTypeSort'
    }
  )
  async sort(
    @Arg('data') data: ProjectTypeSortInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectTypeSortPayload> {
    return this.projectTypeService.sort(data, user, enforcer);
  }
}
