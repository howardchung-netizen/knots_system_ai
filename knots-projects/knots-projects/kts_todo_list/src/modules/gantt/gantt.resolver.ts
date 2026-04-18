import { fromGlobalId } from "graphql-relay";
import { Arg, Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root, Subscription, } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { GanttsCalendarConnection, GanttsConnection, GanttsShareConnection } from './connection/gantt.connection';
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { Inject } from "typedi";
import { Gantt, GanttAssignments, GanttCalendar, GanttCalendarIntervals, GanttColumnConfig, GanttDependencies, GanttLog, GanttShare, GanttTasks } from "./gantt.entity";
import { GanttService } from "./gantt.service";
import { GanttArgs, GanttCalendarArgs } from "./args/gantt.args";
import { GanttCalendarIntervalsInput } from "./input/ganttCalendarIntervals.input";
import { GanttCalendarIntervalsPayload } from "./payload/ganttCalendarIntervals.payload";
import { GanttCalendarInput } from "./input/ganttCalendar.input";
import { GanttCalendarPayload } from "./payload/ganttCalendar.payload";
import { GanttPayload } from "./payload/gantt.payload";
import { GanttInput } from "./input/gantt.input";
import { GanttTasksPayload } from "./payload/ganttTasks.payload";
import { GanttTasksInput } from "./input/ganttTasks.inut";
import { GanttDependenciesPayload } from "./payload/ganttDependencies.payload";
import { GanttDependenciesInput } from "./input/ganttDependencies.input";
import { GanttAssignmentsPayload } from "./payload/ganttAssignments.payload";
import { GanttAssignmentsInput } from "./input/ganttAssignments.input";
import { revivePayload } from "../../lib/subscription";
import { GanttSubscriptionPayload } from "./payload/ganttSubscription.payload";
import { GanttSubscriptionArgs } from "./args/ganttSubscription.args";
import { JSONResolver } from "graphql-scalars";
import { GanttShareArgs } from "./args/ganttShare.args";
import { GanttSharePayload } from "./payload/ganttShare.payload";
import { GanttShareDisableInput } from "./input/ganttShareDisable.input";
import { GanttShareGenerateInput } from "./input/ganttShareGenerate.input";
import { GanttShareDeletePayload } from "./payload/ganttShareDelete.payload";
import { GanttCheckShareArgs } from "./args/ganttCheckShare.args";
import { GanttUpdateCalendarInput } from "./input/ganttUpdateCalendar.input";
import { GanttColumnConfigPayload } from "./payload/ganttColumnConfig.payload";
import { GanttColumnConfigSavePayload } from "./payload/ganttColumnConfigSave.payload";
import { GanttColumnConfigSaveInput } from "./input/ganttColumnConfigSave.input";
import { PermissionAction } from "../admin/action/action.type";
import { GanttClonePayload } from "./payload/ganttClone.payload";
import { GanttCloneInput } from "./input/ganttClone.input";

export const RESOURCE_GANTT = Gantt.name;
@Resolver(() => Gantt)
export class GanttResolver extends ResourceResolver(Gantt) {
  constructor(
    @Inject(type => GanttService)
    private readonly ganttService: GanttService,
  ) {
    super();
  }

  @FieldResolver(type=>[GanttTasks])
  async ganttTasks(
    @Root() root:Gantt,
    @Ctx(){ ganttTasksLoader }: ResolverContext,
    ) {
      return ganttTasksLoader.load(root.id);
  }

  @FieldResolver(type=>[GanttDependencies])
  async ganttDependencies(
    @Root() root:Gantt,
    @Ctx(){ ganttDependenciesLoader }: ResolverContext,
    ) {
      return ganttDependenciesLoader.load(root.id);
  }

  @FieldResolver(type=>[GanttAssignments])
  async ganttAssignments(
    @Root() root:Gantt,
    @Ctx(){ ganttAssignmentsLoader }: ResolverContext,
    ) {
      return ganttAssignmentsLoader.load(root.id);
  }

  @Query(type => GanttsConnection, { nullable: true, name: 'gantt' })
  async getGantt(@Args() args: GanttArgs): Promise<GanttsConnection> {
    return this.ganttService.getManyInConnection(args);
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttPayload,
    {
      name: 'ganttCreate',
      nullable: true,
    }
  )
  async ganttCreate(
    @Arg('data') data: GanttInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttPayload> {
    return this.ganttService.ganttSave(data, currentUser);
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttPayload,
    {
      name: 'ganttUpdate',
      nullable: true,
    }
  )
  async ganttUpdate(
    @Arg('data') data: GanttInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttPayload> {
    return this.ganttService.ganttSave(data, currentUser);
  }

  @Mutation(
    type => GanttPayload,
    {
      name: 'ganttUpdateCalendar',
      nullable: true,
    }
  )
  async ganttUpdateCalendar(
    @Arg('data') data: GanttUpdateCalendarInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttPayload> {
    return this.ganttService.ganttUpdateCalendar(data, currentUser);
  }

  //@Authorized()
  @Subscription({
    topics: 'onGanttChange',
    filter: async ({ payload, args }) => {
      revivePayload(Gantt, payload);

      if (args.id) {
        const id = fromGlobalId(args.id).id;
        if (!payload.node || payload.node.id !== id) return false;
      }

      if (args.projectId) {
        const projectId = args.projectId;
        if (!payload.node || payload.node.projectId !== projectId) return false;
      }

      return true;
    },
  })
  onGanttChange(
    @Root() payload: GanttSubscriptionPayload,
    @Args() args: GanttSubscriptionArgs,
  ): GanttSubscriptionPayload {
    // already converted in filter
    // revivePayload(GanttTasks, payload);

    return payload;
  }

  @Authorized([`${RESOURCE_GANTT}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => GanttClonePayload,
    {
      name: 'ganttClone',
    }
  )
  async ganttClone(
    @Arg('data') data: GanttCloneInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttClonePayload> {
    return this.ganttService.ganttClone(data, currentUser);
  }

}

@Resolver(() => GanttCalendar)
export class GanttCalendarResolver extends ResourceResolver(GanttCalendar) {
  constructor(
    @Inject(type => GanttService)
    private readonly ganttService: GanttService,
  ) {
    super();
  }

  @FieldResolver(type=> GanttCalendar)
  async parentCalendar(
    @Root() root: GanttCalendar,
    @Ctx(){ calendarLoader }: ResolverContext,
  ){
    return calendarLoader.load(root.parentId);
  }

  @FieldResolver(type=> [GanttCalendar])
  async subCalendar(
    @Root() root: GanttCalendar,
    @Ctx(){ subCalendarLoader }: ResolverContext,
  ){
    return subCalendarLoader.load(root.id);
  }

  @Query(type => GanttsCalendarConnection, { nullable: true, name: 'ganttCalendars' })
  async getCalendars(@Args() args: GanttCalendarArgs): Promise<GanttsCalendarConnection> {
    return this.ganttService.getCalendarsInConnection(args);
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttCalendarPayload,
    {
      name: 'ganttCalendarCreate',
      nullable: true,
    }
  )
  async calendarCreate(
    @Arg('data') data: GanttCalendarInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttCalendarPayload> {
    return this.ganttService.calendarSave(data, currentUser);
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttCalendarPayload,
    {
      name: 'ganttCalendarUpdate',
      nullable: true,
    }
  )
  async calendarUpdate(
    @Arg('data') data: GanttCalendarInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttCalendarPayload> {
    return this.ganttService.calendarSave(data, currentUser);
  }

}

@Resolver(() => GanttCalendarIntervals)
export class GanttCalendarIntervalsResolver extends ResourceResolver(GanttCalendarIntervals) {
  constructor(
    @Inject(type => GanttService)
    private readonly ganttService: GanttService,
  ) {
    super();
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttCalendarIntervalsPayload,
    {
      name: 'ganttCalendarIntervalsCreate',
      nullable: true,
    }
  )
  async calendarIntervalsCreate(
    @Arg('data') data: GanttCalendarIntervalsInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttCalendarIntervalsPayload> {
    return this.ganttService.calendarIntervalsSave(data, currentUser);
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttCalendarIntervalsPayload,
    {
      name: 'ganttCalendarIntervalsUpdate',
      nullable: true,
    }
  )
  async calendarIntervalsUpdate(
    @Arg('data') data: GanttCalendarIntervalsInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttCalendarIntervalsPayload> {
    return this.ganttService.calendarIntervalsSave(data, currentUser);
  }

}

@Resolver(() => GanttTasks)
export class GanttTasksResolver extends ResourceResolver(GanttTasks) {
  constructor(
    @Inject(type => GanttService)
    private readonly ganttService: GanttService,
  ) {
    super();
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttTasksPayload,
    {
      name: 'ganttTasksCreate',
      nullable: true,
    }
  )
  async tasksCreate(
    @Arg('data') data: GanttTasksInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttTasksPayload> {
    return this.ganttService.tasksSave(data, currentUser);
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttTasksPayload,
    {
      name: 'ganttTasksUpdate',
      nullable: true,
    }
  )
  async tasksUdate(
    @Arg('data') data: GanttTasksInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttTasksPayload> {
    return this.ganttService.tasksSave(data, currentUser);
  }

  @FieldResolver(type=>[GanttTasks])
  async assignments(
    @Root() root:GanttTasks,
    @Ctx(){ ganttTasksAssignmentsLoader }: ResolverContext,
    ) {
      return ganttTasksAssignmentsLoader.load(root.id);
  }
}

@Resolver(() => GanttDependencies)
export class GanttDependenciesResolver extends ResourceResolver(GanttDependencies) {
  constructor(
    @Inject(type => GanttService)
    private readonly ganttService: GanttService,
  ) {
    super();
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttDependenciesPayload,
    {
      name: 'ganttDependenciesCreate',
      nullable: true,
    }
  )
  async tasksCreate(
    @Arg('data') data: GanttDependenciesInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttDependenciesPayload> {
    return this.ganttService.dependenciesSave(data, currentUser);
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttDependenciesPayload,
    {
      name: 'ganttDependenciesUpdate',
      nullable: true,
    }
  )
  async tasksUdate(
    @Arg('data') data: GanttDependenciesInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttDependenciesPayload> {
    return this.ganttService.dependenciesSave(data, currentUser);
  }
}

@Resolver(() => GanttAssignments)
export class GanttAssignmentsResolver extends ResourceResolver(GanttAssignments) {
  constructor(
    @Inject(type => GanttService)
    private readonly ganttService: GanttService,
  ) {
    super();
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttAssignmentsPayload,
    {
      name: 'ganttAssignmentsCreate',
      nullable: true,
    }
  )
  async tasksCreate(
    @Arg('data') data: GanttAssignmentsInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttAssignmentsPayload> {
    return this.ganttService.assignmentsSave(data, currentUser);
  }

  //@Authorized(`${RESOURCE_CONTACT}:${PermissionAction.CREATE}`)
  @Mutation(
    type => GanttAssignmentsPayload,
    {
      name: 'ganttAssignmentsUpdate',
      nullable: true,
    }
  )
  async tasksUdate(
    @Arg('data') data: GanttAssignmentsInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttAssignmentsPayload> {
    return this.ganttService.assignmentsSave(data, currentUser);
  }
}

@Resolver(() => GanttLog)
export class GanttLogResolver extends ResourceResolver(GanttLog) {
  constructor(
    @Inject(type => GanttService)
    private readonly ganttService: GanttService,
  ) {
    super();
  }

  @FieldResolver(
    type => JSONResolver,
  )
  async changes(
    @Root() root: GanttLog,
  ) {
    if (root.changes) {
      return this.ganttService.handleChangesList(root.changes);
    }

    return null;
  }
}

@Resolver(() => GanttShare)
export class GanttShareResolver extends ResourceResolver(GanttShare) {
  constructor(
    @Inject(type => GanttService)
    private readonly ganttService: GanttService,
  ) {
    super();
  }

  //@Authorized()
  @Query(type => GanttsShareConnection, { nullable: true, name: 'ganttShares' })
  async getGanttShare(@Args() args: GanttShareArgs): Promise<GanttsShareConnection> {
    return this.ganttService.getShareInConnection(args);
  }

  //@Authorized()
  @Query(type => Boolean, { nullable: true, name: 'checkShareCode' })
  async checkShareCode(@Args() args: GanttCheckShareArgs): Promise<Boolean> {
    return this.ganttService.checkShareCode(args);
  }

  @Authorized()
  @Mutation(type => GanttSharePayload, { name: 'ganttShareGenerate', nullable: true, })
  async generateCode(
    @Arg('data') data: GanttShareGenerateInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttSharePayload> {
    return this.ganttService.generateCode(data, currentUser);
  }

  @Authorized()
  @Mutation(type => GanttShareDeletePayload, { name: 'ganttShareDisable', nullable: true, })
  async disableCode(
    @Arg('data') data: GanttShareDisableInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttShareDeletePayload> {
    return this.ganttService.disableCode(data, currentUser);
  }

}

@Resolver(() => GanttColumnConfig)
export class GanttColumnConfigResolver extends ResourceResolver(GanttColumnConfig) {
  constructor(
    @Inject(type => GanttService)
    private readonly ganttService: GanttService,
  ) {
    super();
  }

  //@Authorized()
  @Query(type => GanttColumnConfigPayload, { nullable: true, name: 'ganttColumnConfig' })
  async getGanttColumnConfig(
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttColumnConfigPayload> {
    return this.ganttService.getColumnConfig(currentUser);
  }

  @Authorized()
  @Mutation(type => GanttColumnConfigSavePayload, { name: 'ganttColumnConfigSave', nullable: true, })
  async getGanttColumnConfigSave(
    @Arg('data') data: GanttColumnConfigSaveInput,
    @CurrentUser() currentUser: LoggedInUser,
  ): Promise<GanttColumnConfigSavePayload> {
    return this.ganttService.ganttColumnConfigSave(data, currentUser);
  }

}
