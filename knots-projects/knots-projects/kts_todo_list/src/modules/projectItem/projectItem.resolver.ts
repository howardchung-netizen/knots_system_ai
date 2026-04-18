import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ProjectItem } from "./projectItem.entity";
import { ProjectItemService } from './projectItem.service';
import { ProjectItemArgs } from './args/projectItem.args';
import { ProjectItemConnection } from './connection/projectItem.connection';
import { ProjectItemPayload } from './payload/projectItem.payload';
import { ProjectItemUpdateInput } from './input/projectItemUpdate.input';
import { ProjectItemCreateInput } from './input/projectItemCreate.input';
import { RESOURCE_PROJECT } from '../project/project.resolver';
import { toGlobalId } from 'graphql-relay';
import { Measurement } from '../measurement/measurement.entity';
import { ProjectItemSortPayload } from './payload/projectItemSort.payload';
import { ProjectItemSortInput } from './input/projectItemSort.input';

@Resolver(() => ProjectItem)
export class ProjectItemResolver extends ResourceResolver(ProjectItem) {
  constructor(
    @Inject(type => ProjectItemService)
    private readonly projectItemService: ProjectItemService,
  ) {
    super();
  }

  @FieldResolver()
  async upperId(
    @Root() root: ProjectItem,
  ) {
    return String(root.upper) !== '0' ? toGlobalId(ProjectItem.name, String(root.upper)) : null;
  }

  @FieldResolver()
  async lowerIds(
    @Root() root: ProjectItem,
  ) {
    return root.lower !== '0' ? root.lower?.split(',')?.map((e: string) => toGlobalId(ProjectItem.name, e)) : [];
  }

  @FieldResolver()
  async child(
    @Root() root: ProjectItem,
    @Ctx() {
      projectItemChildLoader,
    }: ResolverContext,
  ) {
    if(root.lower  === '0') return null
    const childIds = root.lower?.split(',')?.map((e: string) => e) ?? [];
    const child = await projectItemChildLoader.loadMany(childIds);
    const validChildren = child.filter((item): item is ProjectItem => !(item instanceof Error));
    // Sort the valid children by their sort property
    return validChildren.sort((a, b) => a.sort - b.sort);
  }

  @FieldResolver()
  async unitId(
    @Root() root: ProjectItem,
  ) {
    return root.unit? toGlobalId(Measurement.name, String(root.unit)) : null;
  }

  @FieldResolver()
  async realId(
    @Root() root: ProjectItem,
  ) {
    return root.id;
  }

  @FieldResolver()
  async prices(
    @Root() root: ProjectItem,
  ) {
    if(root.price) return JSON.parse(root.price);
    return null;
  }

  @FieldResolver()
  async keyword(
    @Root() root: ProjectItem,
  ) {
    let keyword = '';
    if(root.nameEn) keyword += root.nameEn;
    if(root.nameCht) keyword += root.nameCht;
    if(root.descEn) keyword += root.descEn;
    if(root.descCht) keyword += root.descCht;
    return keyword;
  }

  @Authorized(`${RESOURCE_PROJECT}:${PermissionAction.GET}`)
  @Query(type => ProjectItemConnection, { nullable: true, name: 'projectItems' })
  async getMany(@Args() args: ProjectItemArgs, @Ctx() req: ResolverContext): Promise<ProjectItemConnection> {
    return this.projectItemService.getMany(args);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.CREATE}`])
  @Mutation(
    type => ProjectItemPayload,
    {
      name: 'projectItemCreate'
    }
  )
  async create(
    @Arg('data') data: ProjectItemCreateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectItemPayload> {
    return this.projectItemService.create(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectItemPayload,
    {
      name: 'projectItemUpdate'
    }
  )
  async update(
    @Arg('data') data: ProjectItemUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectItemPayload> {
    return this.projectItemService.save(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectItemSortPayload,
    {
      name: 'projectItemSort'
    }
  )
  async sort(
    @Arg('data') data: ProjectItemSortInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectItemSortPayload> {
    return this.projectItemService.sort(data, user, enforcer);
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectItemSortPayload,
    {
      name: 'initProjectItemPrice'
    }
  )
  async initProjectItemPrice(): Promise<ProjectItemSortPayload> {
    return this.projectItemService.initProjectItemPrice();
  }

}
