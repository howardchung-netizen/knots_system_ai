import { GraphQLResolveInfo } from "graphql";
import { fromGlobalId, toGlobalId } from "graphql-relay";
import moment from "moment-timezone";
import searchQuery, { SearchParserResult } from "search-query-parser";
import { Arg, Args, Authorized, Ctx, FieldResolver, Info, Int, Mutation, Query, Resolver, Root, } from 'type-graphql';
import { getRepository, In } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { TOKEN_COOKIE_MAX_AGE, TOKEN_COOKIE_NAME, TOKEN_COOKIE_OPTIONS, webUrl } from '../../lib/config';
import { createToken } from '../../lib/jwt';
import { ResolverContext } from '../../lib/types';
import { ResourceResolver } from '../node/resource.resolver';
import { TasksArgs, TaskView } from './args/tasks.args';
import { TasksConnection } from './connection/tasks.connection';
import { Task, TaskAssignedContact, TaskAssignedProject, TaskAssignedStaff, TaskLog, taskLogChanges } from './task.entity';
import { TaskCreatePayload } from './payload/taskCreate.payload';
import { TaskUpdatePayload } from './payload/taskUpdate.payload';
import { TaskService } from './task.service';
import { TaskPayload } from "./payload/task.payload";
import { TaskInput } from "./input/task.input";
import { TaskAssignInput } from "./input/taskAssign.input";
import { TaskStatusChangeInput } from "./input/taskStatusChange.input";
import { User } from "../user/user.entity";
import { Contact } from "../contact/contact.entity";
import { CurrentUser, LoggedInUser } from "../shared/middleware/currentUser";
import { JSONResolver } from "graphql-scalars";
import { PermissionAction } from "../admin/action/action.type";
import { Inject } from "typedi";
import { TaskDeleteInput } from "./input/taskDelete.input";
import { TaskDeletePayload } from "./payload/taskDelete.payload";
import { TaskAssignProjectInput } from "./input/taskAssignProject.input";
export const RESOURCE_TASK = Task.name;
export const RESOURCE_TASK_APPROVAL = `${Task.name}.approval`;

@Resolver(() => Task)
export class TaskResolver extends ResourceResolver(Task) {
  constructor(
    @Inject(type => TaskService)
    private readonly taskService: TaskService,
  ) {
    super();
  }

  @FieldResolver(type=>[TaskAssignedStaff])
  async assignedStaff(
    @Root() root:Task,
    @Ctx(){ assignedStaffLoader }: ResolverContext,
    ) {
      return assignedStaffLoader.load(root.id);
  }

  @FieldResolver(type=>[TaskAssignedStaff])
  async createdBy(
    @Root() root:Task,
    @Ctx(){ userLoader }: ResolverContext,
    ) {
      return root.createdById?userLoader.load(root.createdById):null;
  }
  
  @FieldResolver(type=>[TaskAssignedContact])
  async assignedContact(
    @Root() root:Task,
    @Ctx(){ assignedContactLoader }: ResolverContext,
    ) {
      return assignedContactLoader.load(root.id);
  }

  @FieldResolver(type=>[TaskAssignedContact])
  async assignedProjects(
    @Root() root:Task,
    @Ctx(){ assignedProjectsLoader }: ResolverContext,
    ) {
      return assignedProjectsLoader.load(root.id);
  }

  @FieldResolver(type=> Int)
  async sortingIndex(
    @Root() root: Task,
    @Info() info: GraphQLResolveInfo,
  ){
    return null;
  }

  @FieldResolver(type=> Task)
  async parentTask(
    @Root() root: Task,
    @Ctx(){ taskLoader }: ResolverContext,
  ){
    return root.parentTaskId?taskLoader.load(root.parentTaskId):null;
  }

  @FieldResolver(type=> [Task])
  async subTasks(
    @Root() root: Task,
    @Ctx(){ subTaskLoader }: ResolverContext,
  ){
    return subTaskLoader.load(root.id);
  }

  @FieldResolver(type=>[TaskAssignedStaff])
  async taskLog(
    @Root() root:Task,
    @Ctx(){ taskLogbyTaskIdLoader }: ResolverContext,
    ) {
      return taskLogbyTaskIdLoader.load(root.id);
  }

  @Authorized(`${RESOURCE_TASK}:${PermissionAction.GET}`)
  @Query(type => TasksConnection, { nullable: true, name: 'tasks' })
  async getMany(
    @Args() args: TasksArgs,
    @Ctx() {req, enforcer}: ResolverContext,
    @CurrentUser() user: LoggedInUser,
    ): Promise<TasksConnection> {
    return this.taskService.getManyInConnection(args, user, {}, enforcer);
  }

  @Authorized(`${RESOURCE_TASK}:${PermissionAction.CREATE}`)
  @Mutation(
    type => TaskPayload,
    {
      name: 'taskCreate',
      nullable: true,
    }
  )
  async create(
    @Arg('data') data: TaskInput,
    @CurrentUser() user: LoggedInUser,
  ): Promise<TaskPayload> {
    return this.taskService.save(data, user);
  }

  @Authorized(`${RESOURCE_TASK}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => TaskPayload,
    {
      name: 'taskUpdate',
      nullable: true,
    }
  )
  async update(
    @Arg('data') data: TaskInput,
    @CurrentUser() user: LoggedInUser
  ): Promise<TaskPayload> {
    return this.taskService.save(data, user);
  }

  @Authorized(`${RESOURCE_TASK}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => TaskPayload,
    {
      name: 'taskAssign',
      nullable: true,
    }
  )
  async assign(
    @Arg('data') data: TaskAssignInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() req: ResolverContext,
  ): Promise<TaskPayload> {
    return this.taskService.assign(data, user);
  }

  @Authorized(`${RESOURCE_TASK}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => TaskPayload,
    {
      name: 'taskAssignProject',
      nullable: true,
    }
  )
  async assignProject(
    @Arg('data') data: TaskAssignProjectInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() req: ResolverContext,
  ): Promise<TaskPayload> {
    return this.taskService.assignProject(data, user);
  }

  @Authorized(`${RESOURCE_TASK}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => TaskPayload,
    {
      name: 'taskUnassignProject',
      nullable: true,
    }
  )
  async unassignProject(
    @Arg('data') data: TaskAssignProjectInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() req: ResolverContext,
  ): Promise<TaskPayload> {
    return this.taskService.unassignProject(data, user);
  }

  @Authorized(`${RESOURCE_TASK}:${PermissionAction.DELETE}`)
  @Mutation(
    type => TaskDeletePayload,
    {
      name: 'taskDelete',
      nullable: true,
    }
  )
  async delete(
    @Arg('data') data: TaskDeleteInput,
    @CurrentUser() user: LoggedInUser,
    @Ctx() {enforcer}: ResolverContext,
  ): Promise<TaskDeletePayload> {
    return this.taskService.delete(data, user, enforcer);
  }

  @Authorized(`${RESOURCE_TASK}:${PermissionAction.UPDATE}`)
  @Mutation(
    type => TaskPayload,
    {
      name: 'taskUnassign',
      nullable: true,
    }
  )
  async unassign(
    @Arg('data') data: TaskAssignInput,
    @CurrentUser() user: LoggedInUser
  ): Promise<TaskPayload> {
    return this.taskService.unassign(data, user);
  }

  @Authorized([`${RESOURCE_TASK_APPROVAL}:${PermissionAction.UPDATE}`, `${RESOURCE_TASK}:${PermissionAction.UPDATE}`])
  @Mutation(
    type => TaskPayload,
    {
      name: 'taskSetStatus',
      nullable: true,
    }
  )
  async setStatus(
    @Arg('data') data: TaskStatusChangeInput,
    @Ctx() {user, enforcer}:ResolverContext,
  ): Promise<TaskPayload> {
    return this.taskService.setStatus(data, user, enforcer);
  }

  @Authorized(`${RESOURCE_TASK}:${PermissionAction.ALL}`)
  @Mutation(
    type => Boolean,
    {
      name: 'taskWhatsAppRemind',
      nullable: true,
    }
  )
  async whatsapp(
  ): Promise<Boolean> {
    return this.taskService.whatsAppRemind();
  }
}

@Resolver(() => TaskAssignedStaff)
export class TaskAssignedStaffResolver extends ResourceResolver(TaskAssignedStaff) {
  constructor(
    private readonly taskService: TaskService,
  ) {
    super();
  }

  @FieldResolver(type=>User)
  async staff(
    @Root() root:TaskAssignedStaff,
    @Ctx(){
      userLoader
    }: ResolverContext
  ){
    return userLoader.load(root.staffId)
  }
}

@Resolver(() => TaskAssignedContact)
export class TaskAssignedContactResolver extends ResourceResolver(TaskAssignedContact) {
  constructor(
    private readonly taskService: TaskService,
  ) {
    super();
  }

  @FieldResolver(type=>Contact)
  async contact(
    @Root() root:TaskAssignedContact,
    @Ctx(){
      contactLoader
    }: ResolverContext
  ){
    return contactLoader.load(root.contactId)
  }
}

@Resolver(() => TaskLog)
export class TaskLogResolver extends ResourceResolver(TaskLog) {
  constructor(
    @Inject(type => TaskService)
    private readonly taskService: TaskService,
  ) {
    super();
  }

  @FieldResolver(
    type => JSONResolver,
  )
  async changes(
    @Root() root: TaskLog,
  ) {
    if (root.changes) {
      return this.taskService.handleChangesList(root.changes);
    }

    return null;
  }
}


@Resolver(() => TaskAssignedProject)
export class TaskAssignedProjectResolver extends ResourceResolver(TaskAssignedProject) {
  @FieldResolver(
    type => JSONResolver,
  )
  async project(
    @Root() root: TaskAssignedProject,
    @Ctx(){
      projectLoader
    }: ResolverContext
  ) {
      return projectLoader.load(root.projectId);
  }
}

