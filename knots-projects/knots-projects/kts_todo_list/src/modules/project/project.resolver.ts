import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { Project } from "./project.entity";
import { ProjectService } from './project.service';
import { ProjectArgs } from './args/project.args';
import { ProjectConnection } from './connection/project.connection';
import { ProjectPayload } from './payload/project.payload';
import { ProjectUpdateInput } from './input/projectUpdate.input';
import { ProjectCreateInput } from './input/projectCreate.input';

export const RESOURCE_PROJECT = Project.name;

@Resolver(() => Project)
export class ProjectResolver extends ResourceResolver(Project) {
  constructor(
    @Inject(type => ProjectService)
    private readonly projectService: ProjectService,
  ) {
    super();
  }

  @FieldResolver()
  async client(
    @Root() root: Project,
    @Ctx() {
      clientLoader,
    }: ResolverContext,
  ) {
    return root.clientId ? clientLoader.load(String(root.clientId)) : null;
  }

  @FieldResolver()
  async contact(
    @Root() root: Project,
    @Ctx() {
      clientContactsByIdLoader,
    }: ResolverContext,
  ) {
    return root.mainContactId ? clientContactsByIdLoader.load(String(root.mainContactId)) : null;
  }

  @FieldResolver()
  async status(
    @Root() root: Project,
    @Ctx() {
      projectStatusLoader,
    }: ResolverContext,
  ) {
    return root.statusId ? projectStatusLoader.load(String(root.statusId)) : null;
  }

  @FieldResolver()
  async projectType(
    @Root() root: Project,
    @Ctx() {
      projectTypeLoader,
    }: ResolverContext,
  ) {
    return root.pType ? projectTypeLoader.load(String(root.pType)) : null;
  }

  @FieldResolver()
  async orders(
    @Root() root: Project,
    @Ctx() {
      projectOrderByProjectIdLoader,
    }: ResolverContext,
  ) {
    return root.projectId ? projectOrderByProjectIdLoader.load(String(root.projectId)) : null;
  }

  @FieldResolver()
  async assignee(
    @Root() root: Project,
    @Ctx() {
      projectAssigneeLoader,
    }: ResolverContext,
  ) {
    return projectAssigneeLoader.load(root.id);
  }

  @FieldResolver()
  async hashtags(
    @Root() root: Project,
    @Ctx() {
      projectHashtagsLoader,
    }: ResolverContext,
  ) {
    return projectHashtagsLoader.load(root.id);
  }

  @FieldResolver()
  async manager(
    @Root() root: Project,
    @Ctx() {
      userLoader,
    }: ResolverContext,
  ) {
    return root.managerId ? userLoader.load(String(root.managerId)) : null;
  }

  @FieldResolver()
  async realId(
    @Root() root: Project,
  ) {
    return root.id;
  }

  @FieldResolver()
  async taskAssignedProject(
    @Root() root: Project,
    @Ctx() {
      taskAssignedProjectLoader,
    }: ResolverContext,
  ) {
    return root.id ? taskAssignedProjectLoader.load(String(root.id)) : null;
  }
  
  @Authorized(`${RESOURCE_PROJECT}:${PermissionAction.GET}`)
  @Query(type => ProjectConnection, { nullable: true, name: 'projects' })
  async getMany(@Args() args: ProjectArgs, @Ctx() req: ResolverContext): Promise<ProjectConnection> {
    return this.projectService.getMany(args);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ProjectPayload,
    {
      name: 'projectCreate'
    }
  )
  async create(
    @Arg('data') data: ProjectCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectPayload> {
    return this.projectService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectPayload,
    {
      name: 'projectUpdate'
    }
  )
  async update(
    @Arg('data') data: ProjectUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectPayload> {
    return this.projectService.save(data, user, enforcer);
  }

}
