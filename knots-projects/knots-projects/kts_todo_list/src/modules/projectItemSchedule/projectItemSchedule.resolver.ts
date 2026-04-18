import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { ProjectItemSchedule } from "./projectItemSchedule.entity";
import { ProjectItemScheduleService } from './projectItemSchedule.service';
import { ProjectItemSchedulePayload } from './payload/projectItemSchedule.payload';
import { RESOURCE_PROJECT } from '../project/project.resolver';
import { ProjectItemScheduleUpdateInput } from './input/projectItemScheduleUpdate.input';

@Resolver(() => ProjectItemSchedule)
export class ProjectItemScheduleResolver extends ResourceResolver(ProjectItemSchedule) {
  constructor(
    @Inject(type => ProjectItemScheduleService)
    private readonly projectItemService: ProjectItemScheduleService,
  ) {
    super();
  }

  @Authorized([`${RESOURCE_PROJECT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => ProjectItemSchedulePayload,
    {
      name: 'projectItemScheduleUpdate'
    }
  )
  async scheduleUpdate(
    @Arg('data') data: ProjectItemScheduleUpdateInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<ProjectItemSchedulePayload> {
    return this.projectItemService.scheduleUpdate(data, user, enforcer);
  }

}
