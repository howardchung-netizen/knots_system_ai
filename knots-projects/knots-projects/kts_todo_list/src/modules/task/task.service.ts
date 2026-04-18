import { Enforcer } from 'casbin';
import { connectionFromArraySlice, fromGlobalId, toGlobalId } from 'graphql-relay';
import moment from 'moment-timezone';
import { Service, Inject } from 'typedi';
import { Brackets, FindConditions, getManager, In, MoreThanOrEqual, Between, EntityManager, LessThanOrEqual, LessThan, getRepository, Like, getConnection, IsNull, Not } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { logger } from '../../lib/logger';
import { getWhatsAppService } from '../../lib/whatsapp';
import { TasksArgs, TaskView } from './args/tasks.args';
import { TasksConnection } from './connection/tasks.connection';
import { DataAction, LogWhatsAppStaus, OperationAction, Task, TaskAssignedContact, TaskAssignedStaff, TaskLog, taskLogChanges, TaskAssignedProject, TaskStatus } from './task.entity';
import { TaskRepository } from './task.repository';
import { TaskInput } from './input/task.input';
import { TaskPayload } from './payload/task.payload';
import { TaskAssignInput } from './input/taskAssign.input';
import { UserRepository } from '../user/user.repository';
import { ContactRepository } from '../contact/contact.repository';
import { User } from '../user/user.entity';
import { Contact } from '../contact/contact.entity';
import rp from 'request-promise';
import { TaskStatusChangeInput } from './input/taskStatusChange.input';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { TaskLogRepository } from './taskLog.repository';
import { RESOURCE_TASK_APPROVAL } from './task.resolver';
import { PermissionAction } from '../admin/action/action.type';
import { RoleService } from '../admin/role/role.service';
import { TaskDeletePayload } from './payload/taskDelete.payload';
import { TaskDeleteInput } from './input/taskDelete.input';
import { TaskAssignProjectInput } from './input/taskAssignProject.input';
import { UserNotificationMessageTemplateRepository } from '../userNotificationMessageTemplate/userNotificationMessageTemplate.repository';
import { UserNotificationMessageService } from '../userNotificationMessage/userNotificationMessage.service';
import { UserNotificationMessageTemplate } from '../userNotificationMessageTemplate/userNotificationMessageTemplate.entity';
import { Project } from '../project/project.entity';
import { ProjectRepository } from '../project/project.repository';

const getStatusText = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return '未完成';
    case TaskStatus.DONE:
      return '已完成';
    case TaskStatus.APPROVED:
      return '已確認';
    case TaskStatus.REJECTED:
      return '已駁回';
    default:
      return '';
  }
}

@Service()
export class TaskService {
  constructor(
    @InjectRepository()
    private readonly taskRepository: TaskRepository,
    @InjectRepository()
    private readonly userRepository: UserRepository,
    @InjectRepository()
    private readonly contactRepository: ContactRepository,
    @InjectRepository()
    private readonly taskLogRepository: TaskLogRepository,
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
    @InjectRepository()
    private readonly userNotificationMessageTemplateRepository: UserNotificationMessageTemplateRepository,
    private readonly userNotificationMessageService: UserNotificationMessageService,
    @Inject(type => RoleService)
    private readonly roleService: RoleService,
  ) {
  }


  async getManyInConnection(args: TasksArgs,  user: LoggedInUser, extraArgs: { [index: string]: any } = {}, enforcer: Enforcer,): Promise<TasksConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('`is_deleted` = 0');
  
    if (args.id) {
      queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    }else{
      queryBuilder.andWhere(`parent_task_id IS NULL`);
    };

    if (args.projectId == 'all') { }
    else if (args.projectId == 'no_project') {
      queryBuilder.andWhere(`parent_task_id IS NULL`);
    }
    else if (args.projectId == "my_tasks") {
      const taskByUser = await TaskAssignedStaff.find({ select: ['id', 'taskId'], where: { staffId: user.id, } });
      if(taskByUser.map(e => e.taskId).length) //我是成員的任務
      queryBuilder.andWhere('(id IN (:...myTasksIds) OR created_by = :createdById)',
        {
          myTasksIds: taskByUser.map(e => e.taskId),
          createdById: user.id
        });
      else queryBuilder.andWhere(`created_by = ${user.id}`);
    }
    else if (args.projectId) {
      const pID = !isNaN(parseInt(args.projectId))? args.projectId : fromGlobalId(args.projectId).id;
      const taskByProject = await TaskAssignedProject.find({ select: ['taskId'],where: {projectId: pID}});
      if(!taskByProject.length) return {
        ...connectionFromArraySlice([], args, {
          arrayLength: 0,
          sliceStart: offset || 0,
        }),
        totalCount: 0,
      };
      queryBuilder.andWhere(`id IN (:...projectIdsByProject)`, { projectIdsByProject: taskByProject.map(e=>e.taskId)});
    }

    if(args.realProjectId) {

      const pID = args.realProjectId; 
      const project = await this.projectRepository.findOneOrFail({projectId: pID});
      const taskByProject = await TaskAssignedProject.find({ select: ['projectId'],where: {projectId: project.id}});
      queryBuilder.andWhere(`id IN (:...projectIdsByProject)`, { projectIdsByProject: taskByProject.map(e=>e.taskId)});
    }

    if (args.userId){
      const userRole = await this.roleService.getRoles(user.id, enforcer);
      if (!userRole.some(v => ['admin'].includes(v.name)) && user.id !== args.userId) return {
        ...connectionFromArraySlice([], args, {
          arrayLength: 0,
          sliceStart: offset || 0,
        }),
        totalCount: 0,
      };
      const taskByUser = await TaskAssignedStaff.find({ select: ['id'], where: {staffId: args.userId,} });
      queryBuilder.andWhere(new Brackets(qb=>{
        qb.andWhere(`id IN (:...:projectIdsByUser)`, { projectIdsByUser: taskByUser.map(e=>e.id)});
        qb.andWhere(`created_by = :createdById`, {createdById: fromGlobalId(user.id).id})
      }));
    }

    const [tasks, taskCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(tasks, args, {
        arrayLength: taskCount,
        sliceStart: offset || 0,
      }),
      totalCount: taskCount,
    };
  }

  async save(
    data: TaskInput,
    user: LoggedInUser,
  ): Promise<TaskPayload> {
    try {
      let originalTask: Task | undefined;
      let task: Task | undefined;
      let oldTask: Task | undefined;
      let parentTask: Task | undefined;

      if (!!data.id) {
        task = await this.taskRepository.findOne(fromGlobalId(data.id).id);
        if (!task || task.isDeleted) {
          return this.returnErrorMessage('Task does not exist');
        }
        oldTask = this.taskRepository.create({ ...task });

        originalTask = Object.assign(Object.create(task), task);
      } else {
        task = Task.create();
        task.createdById = user.id;

      }

      const changes: Array<{ [key: string]: taskLogChanges }> = [];

      if (!data.id && !data.name) {
        return this.returnErrorMessage('Task name is required');
      }

      if (data.name != undefined && data.name !=task.name) {
        changes.push({
          'name': {
            action: DataAction.CHANGE,
            originalValue: task.name,
            newValue: data.name,
          }
        });
        task.name = data.name;
      }

      if (data.dueDate != undefined && data.dueDate !=task.dueDate) {
        changes.push({
          'dueDate': {
            action: DataAction.CHANGE,
            originalValue: task.dueDate,
            newValue: data.dueDate,
          }
        });
        task.dueDate = data.dueDate;
      }

      if (data.isDailyReminder) {
        task.isDailyReminder = data.isDailyReminder;
        changes.push({
          'isDailyReminder': {
            action: DataAction.CHANGE,
            originalValue: task.isDailyReminder,
            newValue: data.isDailyReminder,
          }
        });
      }

      if (data.parentTaskId && !data.id) {
        parentTask = await Task.findOneOrFail(fromGlobalId(data.parentTaskId).id);
        task.parentTaskId = parentTask.id;
      }

      if (data.description != undefined  && data.description !=task.description) {
        changes.push({
          'description': {
            action: DataAction.CHANGE,
            originalValue: task.description,
            newValue: data.description,
          }
        });
        task.description = data.description;
      }

      if (data.priority !== undefined) {
        changes.push({
          'priority': {
            action: DataAction.CHANGE,
            originalValue: task.priority,
            newValue: data.priority,
          }
        });
        task.priority = data.priority;
      }

      if (data.spotlight) { 
        task.spotlight = data.spotlight;
      }
      await task.save();

      if(changes.length){
        await this.logSave({
          user: user,
          action: data.id ? OperationAction.UPDATE : OperationAction.CREATE,
          taskId: task.id,
          whatsAppStatus: LogWhatsAppStaus.NA,
          changes: data.id ? changes : null,
        });
      }


      if (data.parentTaskId && !data.id && parentTask) {
        await this.logSave({
          user: user,
          action: OperationAction.CREATE,
          taskId: parentTask.id,
          changes: [
            {
              "subTask": {
                entity: Task.name,
                action: DataAction.ADD,
                newId: task.id,
              }
            }
          ],
        });
      }
      return {
        userErrors: [],
        task: task
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async logSave(
    params: taskLogParams,
    manager?: EntityManager,
  ): Promise<Boolean> {
    if (!manager) manager = this.taskLogRepository.manager;
    if (!params?.user?.id && !params?.contact?.id) { return false; }
    let operationLog = await this.taskLogRepository.findOne({
      where: [{
        updatedAt: MoreThanOrEqual(moment().tz('UTC').subtract(10, 'minutes').format('YYYY-MM-DD HH:mm:ss')),
        action: params.action,
        taskId: params.taskId,
        whatsAppStatus: LogWhatsAppStaus.NA,
        ...params.user ? { userId: params.user.id } : {},
        ...params.contact ? { contactId: params.contact.id } : {},
      }, {
        updatedAt: MoreThanOrEqual(moment().tz('UTC').subtract(10, 'minutes').format('YYYY-MM-DD HH:mm:ss')),
        action: params.action,
        taskId: params.taskId,
        whatsAppStatus: LogWhatsAppStaus.PENDING,
        ...params.user ? { userId: params.user.id } : {},
        ...params.contact ? { contactId: params.contact.id } : {},
      }]
    });
    if (!operationLog) {
      operationLog = new TaskLog();
      operationLog.action = params.action;
      operationLog.whatsAppStatus = params.whatsAppStatus == LogWhatsAppStaus.PENDING? params.whatsAppStatus: LogWhatsAppStaus.NA;
      operationLog.taskId = params.taskId;
      if (params?.user?.id) {
        operationLog.userId = params.user.id;
      } else if (params?.contact?.id) {
        operationLog.contactId = params?.contact?.id;
      } else {
        return false;
      }
    }

    if (params.changes && Object.keys(params.changes).length > 0) {
      const newLogChanges: Array<{ [key: string]: taskLogChanges }> = [];
      if (operationLog.changes) {
        const Orichanges = JSON.parse(JSON.stringify(operationLog.changes));
        for (let change of params.changes) {
          const changedKey = Object.keys(change)[0];
          const lastChange = Orichanges.find((e: any) => e[changedKey]);
          if (lastChange && change[changedKey].action == DataAction.CHANGE && change[changedKey].newIds && change[changedKey].originalIds) {
            change[changedKey].newIds = (change[changedKey].newIds?.concat(lastChange[changedKey].newIds ?? []));
            change[changedKey].originalIds = change[changedKey].originalIds?.concat(lastChange[changedKey].originalIds ?? []);
            change[changedKey].originalIds = change[changedKey].originalIds?.filter(e => {
              const found = change[changedKey].newIds?.indexOf(e);
              if (found != undefined && found >= 0) change[changedKey].newIds?.splice(found, 1);
              return found != undefined && found >= 1;
            })
            if (change[changedKey].originalIds?.length == 0 && change[changedKey].newIds?.length == 0) {
              continue;
            }
          }
          if (change[changedKey].action == DataAction.CHANGE && change[changedKey].originalValue && change[changedKey].newValue) {
            change[changedKey].originalValue = lastChange?.[changedKey]?.originalValue||change[changedKey].originalValue;
            if (change[changedKey].newValue == change[changedKey].originalValue) {
              continue;

            }

            if (change[changedKey].action == DataAction.CHANGE && change[changedKey].originalId && change[changedKey].newId) {
              change[changedKey].originalId = lastChange.originalId;
              if (change[changedKey].newId == change[changedKey].originalId) {
                continue;
              }
            }
          }
          newLogChanges.push(change);
        }
        for(let change of Orichanges){
          const newChange = newLogChanges.find((e: any) => e[Object.keys(change)[0]]);
          if(!newChange && !params.changes.some(f=>f[Object.keys(change)[0]]))newLogChanges.push(change);
        }
        if (newLogChanges.length == 0) {
          await operationLog.remove();
          return true;
        }
        operationLog.changes = JSON.parse(JSON.stringify(newLogChanges));
      } else {
        operationLog.changes = JSON.parse(JSON.stringify(params.changes));
      }
    }

    if (
      (operationLog.action === OperationAction.UPDATE && operationLog.changes) ||
      operationLog.action !== OperationAction.UPDATE
    ) {
      await manager.save(operationLog);
      return true;
    }

    return false;
  }

  async assignPic(
    data: TaskAssignInput,
    user: LoggedInUser,
  ): Promise<TaskPayload> {
    try {
      let task: Task | undefined;
      task = await this.taskRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (!task || task.isDeleted) {
        return this.returnErrorMessage('Task does not exist');
      }
      if (fromGlobalId(data.assignee).type == User.name) {
        const arr = await task.assignedStaff;
          const assginee = await this.userRepository.findOneOrFail(fromGlobalId(data.assignee).id);
          const taskAssignedStaff = TaskAssignedStaff.create();
          taskAssignedStaff.staffId = fromGlobalId(data.assignee).id;
          taskAssignedStaff.taskId = task.id;
          if(data.isPic) taskAssignedStaff.isPic = data.isPic;
          await taskAssignedStaff.save();
          arr?.push(taskAssignedStaff);
          task.assignedStaff = Promise.resolve(arr ?? []);

          const changes: Array<{ [key: string]: taskLogChanges }> = [];
          changes.push({
            'assignedStaff': {
              action: DataAction.CHANGE,
              entity: user.constructor.name,
              originalIds: [],
              newIds: [assginee.id],
            }
          })
          await this.logSave({
            user: user,
            taskId: fromGlobalId(data.id).id,
            action: OperationAction.UPDATE,
            whatsAppStatus: LogWhatsAppStaus.PENDING,
            changes: data.id ? changes : null,
          });

          const userNotificationMessageTemplate = await this.userNotificationMessageTemplateRepository.findOne({
            key: 'ASSIGNED_STAFF',
          });

          if (userNotificationMessageTemplate) {
            await this.userNotificationMessageService.send({
              userId: data.assignee,
              userNotificationMessageTemplateId: toGlobalId(UserNotificationMessageTemplate.name, userNotificationMessageTemplate.id),
              userNotificationMessageTemplateReplacements: {
                '{{createdBy}}': user.nickName || ' ',
                '{{taskName}}': task.name || ' ',
                '{{taskDueDate}}': task.dueDate ? `工作期限為: ${task.dueDate}` : ' ',
              },
            });
          }

      } else if (fromGlobalId(data.assignee).type == Contact.name) {
        const arr = await task.assignedContact;
        if (!arr?.find(e => e.contactId == fromGlobalId(data.assignee).id)) {
          const contact = await this.contactRepository.findOneOrFail(fromGlobalId(data.assignee).id);
          const taskAssignedContact = TaskAssignedContact.create();
          taskAssignedContact.contactId = fromGlobalId(data.assignee).id;
          taskAssignedContact.taskId = task.id;
          if(data.isPic) taskAssignedContact.isPic = data.isPic;
          await taskAssignedContact.save();
          arr?.push(taskAssignedContact);
          task.assignedContact = Promise.resolve(arr ?? []);
          const changes: Array<{ [key: string]: taskLogChanges }> = [];
          changes.push({
            'assignedContact': {
              action: DataAction.CHANGE,
              entity: contact.constructor.name,
              originalIds: [],
              newIds: [contact.id],
            }
          })
          await this.logSave({
            user: user,
            taskId: fromGlobalId(data.id).id,
            action: OperationAction.UPDATE,
            whatsAppStatus: LogWhatsAppStaus.PENDING,
            changes: changes,
          });
        }
      } else {
        return this.returnErrorMessage('Assignee ID not match!');
      }
      return {
        userErrors: [],
        task: task
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async assign(
    data: TaskAssignInput,
    user: LoggedInUser,
  ): Promise<TaskPayload> {
    try {
      let task: Task | undefined;
      task = await this.taskRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (!task || task.isDeleted) {
        return this.returnErrorMessage('Task does not exist');
      }
      if (fromGlobalId(data.assignee).type == User.name) {
        const arr = await task.assignedStaff;
        if (!arr?.find(e => e.staffId == fromGlobalId(data.assignee).id)) {
          const assginee = await this.userRepository.findOneOrFail(fromGlobalId(data.assignee).id);
          const taskAssignedStaff = TaskAssignedStaff.create();
          taskAssignedStaff.staffId = fromGlobalId(data.assignee).id;
          taskAssignedStaff.taskId = task.id;
          if(data.isPic) taskAssignedStaff.isPic = data.isPic;
          await taskAssignedStaff.save();
          arr?.push(taskAssignedStaff);
          task.assignedStaff = Promise.resolve(arr ?? []);

          const changes: Array<{ [key: string]: taskLogChanges }> = [];
          changes.push({
            'assignedStaff': {
              action: DataAction.CHANGE,
              entity: user.constructor.name,
              originalIds: [],
              newIds: [assginee.id],
            }
          })
          await this.logSave({
            user: user,
            taskId: fromGlobalId(data.id).id,
            action: OperationAction.UPDATE,
            whatsAppStatus: LogWhatsAppStaus.PENDING,
            changes: data.id ? changes : null,
          });

          const userNotificationMessageTemplate = await this.userNotificationMessageTemplateRepository.findOne({
            key: 'ASSIGNED_STAFF',
          });

          if (userNotificationMessageTemplate) {
            await this.userNotificationMessageService.send({
              userId: data.assignee,
              userNotificationMessageTemplateId: toGlobalId(UserNotificationMessageTemplate.name, userNotificationMessageTemplate.id),
              userNotificationMessageTemplateReplacements: {
                '{{createdBy}}': user.nickName || ' ',
                '{{taskName}}': task.name || ' ',
                '{{taskDueDate}}': task.dueDate ? `工作期限為: ${task.dueDate}` : ' ',
              },
            });
          }
        }
      } else if (fromGlobalId(data.assignee).type == Contact.name) {
        const arr = await task.assignedContact;
        if (!arr?.find(e => e.contactId == fromGlobalId(data.assignee).id)) {
          const contact = await this.contactRepository.findOneOrFail(fromGlobalId(data.assignee).id);
          const taskAssignedContact = TaskAssignedContact.create();
          taskAssignedContact.contactId = fromGlobalId(data.assignee).id;
          taskAssignedContact.taskId = task.id;
          if(data.isPic) taskAssignedContact.isPic = data.isPic;
          await taskAssignedContact.save();
          arr?.push(taskAssignedContact);
          task.assignedContact = Promise.resolve(arr ?? []);
          const changes: Array<{ [key: string]: taskLogChanges }> = [];
          changes.push({
            'assignedContact': {
              action: DataAction.CHANGE,
              entity: contact.constructor.name,
              originalIds: [],
              newIds: [contact.id],
            }
          })
          await this.logSave({
            user: user,
            taskId: fromGlobalId(data.id).id,
            action: OperationAction.UPDATE,
            whatsAppStatus: LogWhatsAppStaus.PENDING,
            changes: changes,
          });
        }
      } else {
        return this.returnErrorMessage('Assignee ID not match!');
      }
      return {
        userErrors: [],
        task: task
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async assignProject(
    data: TaskAssignProjectInput,
    user: LoggedInUser,
  ): Promise<TaskPayload> {
    try {
      let task: Task | undefined;
      let taskAssignedProject: TaskAssignedProject | undefined;
      task = await this.taskRepository.findOneOrFail(fromGlobalId(data.id).id, {relations: ['assignedProjects']});
      if (!task || task.isDeleted) return this.returnErrorMessage('Task does not exist');
      if (task.parentTaskId) return this.returnErrorMessage('Cannot assign a subtask');
      if (!data.projectId) return this.returnErrorMessage('Input must contain Project ID');
      const assignedProjects = await task.assignedProjects;
      taskAssignedProject = assignedProjects.find(e => e.projectId == fromGlobalId(data.projectId!).id);
      if (!taskAssignedProject) {
        taskAssignedProject = new TaskAssignedProject();
        taskAssignedProject.projectId = fromGlobalId(data.projectId).id;
        taskAssignedProject.taskId = task.id;
        assignedProjects.push(taskAssignedProject);
      }
      taskAssignedProject.sectionName = data.sectionName ?? '';
      if(!taskAssignedProject.sortingIndex) {
        const query = await getConnection().query('SELECT MAX(sorting_index) AS sortingIndex FROM task_assigned_project WHERE project_id = ? AND section_name = ?', [fromGlobalId(data.projectId!).id, taskAssignedProject.sectionName]);
        taskAssignedProject.sortingIndex = (query.sortingIndex ?? 0) + 1024;
      }
      // assignedProjects.push(taskAssignedProject)
      task.assignedProjects = Promise.resolve(assignedProjects);
      await task.save();
      return {
        userErrors: [],
        task: task
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async unassignPic(
    data: TaskAssignInput,
    user: LoggedInUser,
  ): Promise<TaskPayload> {
    try {
      let task: Task | undefined;
      task = await this.taskRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (!task || task.isDeleted) {
        return this.returnErrorMessage('Task does not exist');
      }
      if (fromGlobalId(data.assignee).type == User.name) {
        const arr = await task.assignedStaff;
        const assignee = arr?.find(e => e.staffId == fromGlobalId(data.assignee).id)
        if (assignee) {
          arr?.splice(arr.indexOf(assignee), 1);
          task.assignedStaff = Promise.resolve(arr ?? []);
          await assignee.remove();
          const changes: Array<{ [key: string]: taskLogChanges }> = [];
          changes.push({
            'assignedStaff': {
              action: DataAction.CHANGE,
              entity: assignee.constructor.name,
              originalIds: [assignee.staffId],
              newIds: [],
            }
          })
          await this.logSave({
            user: user,
            taskId: fromGlobalId(data.id).id,
            action: OperationAction.UPDATE,
            changes: changes,
          });
        }
      } else if (fromGlobalId(data.assignee).type == Contact.name) {
        const arr = await task.assignedContact;
        const assignee = arr?.find(e => e.contactId == fromGlobalId(data.assignee).id)
        if (assignee) {
          arr?.splice(arr.indexOf(assignee), 1);
          task.assignedContact = Promise.resolve(arr ?? []);
          await assignee.remove();
          const changes: Array<{ [key: string]: taskLogChanges }> = [];
          changes.push({
            'assignedContact': {
              action: DataAction.CHANGE,
              entity: assignee.constructor.name,
              originalIds: [assignee.contactId],
              newIds: [],
            }
          })
          await this.logSave({
            user: user,
            taskId: fromGlobalId(data.id).id,
            action: OperationAction.UPDATE,
            changes: changes,
          });
        }
      } else {
        return this.returnErrorMessage('Assignee ID not match!');
      }
      return {
        userErrors: [],
        task: task
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async unassign(
    data: TaskAssignInput,
    user: LoggedInUser,
  ): Promise<TaskPayload> {
    try {
      let task: Task | undefined;
      task = await this.taskRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (!task || task.isDeleted) {
        return this.returnErrorMessage('Task does not exist');
      }
      if (fromGlobalId(data.assignee).type == User.name) {
        const arr = await task.assignedStaff;
        const assignee = arr?.find(e => e.staffId == fromGlobalId(data.assignee).id)
        if (assignee) {
          arr?.splice(arr.indexOf(assignee), 1);
          task.assignedStaff = Promise.resolve(arr ?? []);
          await assignee.remove();
          const changes: Array<{ [key: string]: taskLogChanges }> = [];
          changes.push({
            'assignedStaff': {
              action: DataAction.CHANGE,
              entity: assignee.constructor.name,
              originalIds: [assignee.staffId],
              newIds: [],
            }
          })
          await this.logSave({
            user: user,
            taskId: fromGlobalId(data.id).id,
            action: OperationAction.UPDATE,
            changes: changes,
          });
        }
      } else if (fromGlobalId(data.assignee).type == Contact.name) {
        const arr = await task.assignedContact;
        const assignee = arr?.find(e => e.contactId == fromGlobalId(data.assignee).id)
        if (assignee) {
          arr?.splice(arr.indexOf(assignee), 1);
          task.assignedContact = Promise.resolve(arr ?? []);
          await assignee.remove();
          const changes: Array<{ [key: string]: taskLogChanges }> = [];
          changes.push({
            'assignedContact': {
              action: DataAction.CHANGE,
              entity: assignee.constructor.name,
              originalIds: [assignee.contactId],
              newIds: [],
            }
          })
          await this.logSave({
            user: user,
            taskId: fromGlobalId(data.id).id,
            action: OperationAction.UPDATE,
            changes: changes,
          });
        }
      } else {
        return this.returnErrorMessage('Assignee ID not match!');
      }
      return {
        userErrors: [],
        task: task
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async unassignProject(
    data: TaskAssignProjectInput,
    user: LoggedInUser,
  ): Promise<TaskPayload> {
    try {
      let task: Task | undefined;
      let taskAssignedProject: TaskAssignedProject | undefined;
      task = await this.taskRepository.findOneOrFail(fromGlobalId(data.id).id, {relations: ['assignedProjects']});
      if (!task || task.isDeleted) return this.returnErrorMessage('Task does not exist');
      if (task.parentTaskId) return this.returnErrorMessage('Cannot assign a subtask');
      if (!data.projectId) return this.returnErrorMessage('Input must contain Project ID');
      const assignedProjects = await task.assignedProjects;
      taskAssignedProject = assignedProjects.find(e => e.projectId == fromGlobalId(data.projectId!).id);
      if(!taskAssignedProject) return this.returnErrorMessage('Task is not assigned to this project');
      task.assignedProjects = Promise.resolve(assignedProjects.filter(e => e!==taskAssignedProject));
      await task.save();
      return {
        userErrors: [],
        task: task
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async delete(
    data: TaskDeleteInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<TaskDeletePayload> {
    try {
      let task: Task;
      task = await this.taskRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (!task || task.isDeleted) {
        return this.returnErrorMessage('Task does not exist');
      }

      const userRole = await this.roleService.getRoles(user.id, enforcer);
      const hasDeleteTaskPermission = userRole.some(v => ['admin'].includes(v.name)) || task.createdById === user.id
      if (!hasDeleteTaskPermission && !task.parentTaskId){
        return this.returnErrorMessage(`You don't have permission to delete task!`);
      }else if(!hasDeleteTaskPermission && task.parentTaskId){
        const permissionUserId:Set<String> = new Set();
        let parentTask = await task.parentTask;
        while(parentTask){
          permissionUserId.add(parentTask.createdById);
          (await parentTask.assignedStaff)?.forEach(e=>permissionUserId.add(e.staffId));
          parentTask = await parentTask.parentTask;
        }
        if(!permissionUserId.has(user.id)){
          return this.returnErrorMessage(`You don't have permission to delete task!`);
        }
      }

      task.isDeleted = true;
      await this.logSave({
        user: user,
        action: OperationAction.DELETE,
        taskId: task.id,
      });

      return {
        userErrors: [],
        deletedTaskId: (await task.save()).id,
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async setStatus(
    data: TaskStatusChangeInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<TaskPayload> {
    try {
      let task: Task | undefined;
      task = await this.taskRepository.findOneOrFail(fromGlobalId(data.id).id);
      if (!task || task.isDeleted) {
        return this.returnErrorMessage('Task does not exist');
      }

      if (data.status === task.status) {
        return this.returnErrorMessage('new status is same with original status');
      }
      const staffs = await User.find();
      let users: string[] = [];
      const assignedStaffs = (await Promise.resolve(task.assignedStaff))?.map(e => e.staffId);
      users = [ ...assignedStaffs || []];
      let taskStaffs = await task.assignedStaff;
      let taskStaffsAssigee = taskStaffs?.filter(e => !e.isPic);
      let taskStaffPics = taskStaffs?.filter(e => e.isPic);
      let changes: Array<{ [key: string]: taskLogChanges }> | null = [];

      if (data.status === TaskStatus.APPROVED) {
        const hasApproveTaskPermission = await enforcer.enforce(user?.id ?? '', RESOURCE_TASK_APPROVAL, PermissionAction.UPDATE);
        if (!hasApproveTaskPermission && task.createdById !== user?.id) return this.returnErrorMessage('User is not admin or task creator.');
        task.status = TaskStatus.APPROVED;
        changes.push({
          'status': {
            action: DataAction.CHANGE,
            originalValue: TaskStatus.DONE,
            newValue: TaskStatus.APPROVED,
          }
        })
        task.status = data.status;
      }
      else if (data.status === TaskStatus.DONE) {
        task.status = TaskStatus.DONE;
        changes.push({
          'status': {
            action: DataAction.CHANGE,
            originalValue: TaskStatus.TODO,
            newValue: TaskStatus.DONE,
          }
        });

        const createdBy = await Promise.resolve(task.createdBy);
        const userNotificationMessageTemplate = await this.userNotificationMessageTemplateRepository.findOne({
          key: 'JOB_COMPLETED',
        });

        if (userNotificationMessageTemplate) {
          await this.userNotificationMessageService.batchSend({
            userIds: users,
            templateKey: 'JOB_COMPLETED',
            contentReplacements: {
              '{{createdBy}}': createdBy?.nickName || ' ',
              '{{taskName}}': task.name || ' ',
              '{{taskDueDate}}': task.dueDate ? `工作期限為: ${task.dueDate}` : ' ',
            },
          });
        }

        if (taskStaffPics?.length) {
          const whatsappService = await getWhatsAppService();
          for (let taskStaffPic of taskStaffPics) {
            const staff = staffs.find(staff => staff.id == taskStaffPic.staffId);
            if (staff?.whatsApp && staff?.whatsapp2) {
              try {
                await whatsappService.sendTemplateMessage({
                  to: `${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`,
                  templateName: 'task_completed_1',
                  languageCode: 'zh_HK',
                  components: [{
                    type: 'body',
                    parameters: [{
                      type: 'text',
                      text: `${user.username} 已完成 任務:${task.name} 日期: ${moment().format('YYYY-MM-DD')}`
                    }]
                  }]
                });
              } catch (error: any) {
                logger.error(`Failed to send WhatsApp message: ${error.message}`);
              }
            }
          }
        }

      }
      else if (data.status === TaskStatus.TODO) {
        task.status = TaskStatus.TODO;
        changes.push({
          'status': {
            action: DataAction.CHANGE,
            originalValue: TaskStatus.DONE,
            newValue: TaskStatus.TODO,
          }
        });
      }
      else if (data.status === TaskStatus.REJECTED) {
        task.status = TaskStatus.REJECTED;
        changes.push({
          'status': {
            action: DataAction.CHANGE,
            originalValue: task.status,
            newValue: TaskStatus.REJECTED,
          }
        });

        const createdBy = await Promise.resolve(task.createdBy);
        let users: string[] = [];
        users.push(task.createdById);
        const assignedStaffs = (await Promise.resolve(task.assignedStaff))?.map(e => e.staffId);
        users = [...users, ...assignedStaffs || []];

        const userNotificationMessageTemplate = await this.userNotificationMessageTemplateRepository.findOne({
          key: 'JOB_REJECTED',
        });

        if (userNotificationMessageTemplate) {
          await this.userNotificationMessageService.batchSend({
            userIds: users,
            templateKey: 'JOB_REJECTED',
            contentReplacements: {
              '{{createdBy}}': createdBy?.nickName || ' ',
              '{{taskName}}': task.name || ' ',
              '{{taskDueDate}}': task.dueDate ? `工作期限為: ${task.dueDate}` : ' ',
            },
          });
        }

        const whatsappService = await getWhatsAppService();

        if (taskStaffsAssigee?.length) {
          for (let taskStaffPic of taskStaffsAssigee) {
            const staff = staffs.find(staff => staff.id == taskStaffPic.staffId);
            if (staff?.whatsApp && staff?.whatsapp2) {
              try {
                await whatsappService.sendTemplateMessage({
                  to: `${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`,
                  templateName: 'task_rejected_1',
                  languageCode: 'zh_HK',
                  components: [{
                    type: 'body',
                    parameters: [{
                      type: 'text',
                      text: `${user.username} 已駁回 任務:${task.name} 日期: ${moment().format('YYYY-MM-DD')}`
                    }]
                  }]
                });
              } catch (error: any) {
                logger.error(`Failed to send WhatsApp message: ${error.message}`);
              }
            }
          }
        }

        if (task.assignedContact) {
          for (let c of await task.assignedContact) {
            try {
              await whatsappService.sendTemplateMessage({
                to: (await c.contact).tel,
                templateName: 'task_rejected_1',
                languageCode: 'zh_HK',
                components: [{
                  type: 'body',
                  parameters: [{
                    type: 'text',
                    text: `${user.username} 已駁回 任務:${task.name} 日期: ${moment().format('YYYY-MM-DD')}`
                  }]
                }]
              });
            } catch (error: any) {
              logger.error(`Failed to send WhatsApp message: ${error.message}`);
            }
          }
        }

      }

      await task.save();
      await this.logSave({
        user: user,
        action: OperationAction.UPDATE,
        taskId: task.id,
        whatsAppStatus: LogWhatsAppStaus.NA,
        changes: data.id ? changes : null,
      });
      return {
        userErrors: [],
        task: task
      }
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    }
  }

  async whatsAppConfirmTask(
    data: { id: string },
    user: LoggedInUser | undefined,
    contact: Contact | undefined,
    enforcer: Enforcer,
  ): Promise<Boolean> {
    try {
      let task: Task | undefined;
      task = await this.taskRepository.findOne({ id: Like(`${data.id}%`) });
      if (!task || task.isDeleted || task.status === TaskStatus.APPROVED) {
        return false;
      }
      if (task.status === TaskStatus.TODO || task.status === TaskStatus.DONE) {
        if (user) {
          const assignedStaffs = await task.assignedStaff;
          if (!assignedStaffs?.some(e => e.staffId === user.id)) return false;
        } else if (contact) {
          const assignedContacts = await task.assignedContact;
          if (!assignedContacts?.some(e => e.contactId === contact.id)) return false;
        } else {
          return false;
        }
        let changes: Array<{ [key: string]: taskLogChanges }> | null = [];

        if (task.status === TaskStatus.TODO) {
          task.status = TaskStatus.DONE;
          changes.push({
            'status': {
              action: DataAction.CHANGE,
              originalValue: TaskStatus.TODO,
              newValue: TaskStatus.DONE,
            }
          });
        } else if (task.status === TaskStatus.DONE) {
          //check role can approve or creator
          const hasApproveTaskPermission = await enforcer.enforce(user?.id ?? contact?.id ?? '', RESOURCE_TASK_APPROVAL, PermissionAction.UPDATE);
          if (!hasApproveTaskPermission && task.createdById !== (user?.id ?? contact?.id)) return false;
          task.status = TaskStatus.APPROVED;
          changes.push({
            'status': {
              action: DataAction.CHANGE,
              originalValue: TaskStatus.DONE,
              newValue: TaskStatus.APPROVED,
            }
          });
        }
        await task.save();
        await this.logSave({
          user: user,
          contact: contact,
          action: OperationAction.UPDATE,
          taskId: task.id,
          whatsAppStatus: LogWhatsAppStaus.NA,
          changes: data.id ? changes : null,
        });
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      logger.error(error.message);
      return false;
    }
  }

  async returnErrorMessage(
    message: string = '',
    fields: Array<string> = [],
  ) {
    return {
      userErrors: [
        {
          message: message,
          field: fields,
        },
      ],
    };
  }

  async whatsAppRemind(): Promise<Boolean> {
    const sendLists: { [key: string]: Set<Task> } = {};
    const picSendLists: { [key: string]: Set<Task> } = {};
    const staffs = await User.find();
    const contacts = await Contact.find();

    const tasks = await this.taskRepository.find({ where: {isDeleted: false, status: In([TaskStatus.TODO, TaskStatus.REJECTED])}, relations: ['assignedStaff', 'assignedContact'] });
    for (let task of tasks) {
      let taskStaffs = await task.assignedStaff;

      if (taskStaffs) {
        for (let taskStaff of taskStaffs) {
          const staff = staffs.find(staff => staff.id == taskStaff.staffId);
          if (!sendLists[`${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`]) {
            sendLists[`${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`] = new Set;
          }
          sendLists[`${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`].add(task);
        }
      }

      let taskContacts = await task.assignedContact;

      if (taskContacts) {
        for (let taskContact of taskContacts) {
          const contact = contacts.find(contact => contact.id == taskContact.contactId);
          if (!sendLists[`${contact?.tel ?? ''}`]) {
            sendLists[`${contact?.tel ?? ''}`] = new Set;
          }
          sendLists[`${contact?.tel ?? ''}`].add(task);
        }
      }

    }

    const whatsappService = await getWhatsAppService();

    // Send messages for each staff/contact
    for (let [whatsappNumber, taskSet] of Object.entries(sendLists)) {
      const tasks = Array.from(taskSet);
      let currentBatch: Task[] = [];
      let messageCount = 0;

      for (let task of tasks) {
        currentBatch.push(task);

        // When we reach 4 items or it's the last batch, send the message
        if (currentBatch.length === 4 || task === tasks[tasks.length - 1]) {
          messageCount++;
          const templateName = currentBatch.length === 4 ? 'task_reminder_4' : `task_reminder_${currentBatch.length}`;

          // Prepare message parameters
          const parameters = [];
          for (let i = 0; i < currentBatch.length; i++) {
            const task = currentBatch[i];
            const creator = await task.createdBy;
            parameters.push({
              type: 'text',
              text: `${i + 1}) ${creator.nickName}: ${task.name} ${task.dueDate ? `工作期限為:${task.dueDate}` : ''} 狀態:${getStatusText(task.status)}`
            });
          }

          try {
            await whatsappService.sendTemplateMessage({
              to: whatsappNumber,
              templateName: templateName,
              languageCode: 'zh_HK',
              components: [{
                type: 'body',
                parameters: parameters
              }]
            });

            logger.info(`Sent ${templateName} to ${whatsappNumber} with ${currentBatch.length} records`);
          } catch (error: any) {
            logger.error(`Failed to send WhatsApp message: ${error.message}`);
          }

          // Clear batch after sending
          currentBatch = [];
        }
      }
    }

    const twoDayAfter = new Date();
    twoDayAfter.setDate(twoDayAfter.getDate() + 2);
    const formattedTwoDaysAfter = twoDayAfter.toISOString().split('T')[0];
    const picTasks = await this.taskRepository.find({ 
      where: {
        isDeleted: false, 
        status: In([TaskStatus.TODO, TaskStatus.DONE]), 
        dueDate: LessThanOrEqual(formattedTwoDaysAfter),
      }, 
      relations: ['assignedStaff', 'assignedContact'] 
    });
    for (let task of picTasks) {
      let taskStaffs = await task.assignedStaff;
      let taskStaffPics = taskStaffs?.filter(e => e.isPic);
      if (taskStaffPics?.length) {
        for (let taskStaffPic of taskStaffPics) {
          const staff = staffs.find(staff => staff.id == taskStaffPic.staffId);
          if (!picSendLists[`${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`]) {
            picSendLists[`${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`] = new Set;
          }
          picSendLists[`${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`].add(task);
        }
      }

      let taskContacts = await task.assignedContact;
      let taskContactPics = taskContacts?.filter(e => e.isPic);
      if (taskContactPics?.length) {
        for (let taskContact of taskContactPics) {
          const contact = contacts.find(contact => contact.id == taskContact.contactId);
          if (!picSendLists[`${contact?.tel ?? ''}`]) {
            picSendLists[`${contact?.tel ?? ''}`] = new Set;
          }
          picSendLists[`${contact?.tel ?? ''}`].add(task);
        }
      }
    }

    // Send PIC messages
    for (let [whatsappNumber, taskSet] of Object.entries(picSendLists)) {
      const tasks = Array.from(taskSet);
      let currentBatch: Task[] = [];
      let messageCount = 0;

      for (let task of tasks) {
        currentBatch.push(task);

        // When we reach 4 items or it's the last batch, send the message
        if (currentBatch.length === 4 || task === tasks[tasks.length - 1]) {
          messageCount++;
          const templateName = currentBatch.length === 4 ? 'task_pic_reminder_4' : `task_pic_reminder_${currentBatch.length}`;

          // Prepare message parameters
          const parameters = [];
          for (let i = 0; i < currentBatch.length; i++) {
            const task = currentBatch[i];
            const creator = await task.createdBy;
            parameters.push({
              type: 'text',
              text: `${i + 1}) ${creator.nickName}: ${task.name} ${task.dueDate ? `工作期限為:${task.dueDate}` : ''} 狀態:${getStatusText(task.status)}`
            });
          }

          try {
            await whatsappService.sendTemplateMessage({
              to: whatsappNumber,
              templateName: templateName,
              languageCode: 'zh_HK',
              components: [{
                type: 'body',
                parameters: parameters
              }]
            });

            logger.info(`Sent ${templateName} to ${whatsappNumber} with ${currentBatch.length} records`);
          } catch (error: any) {
            logger.error(`Failed to send WhatsApp message: ${error.message}`);
          }

          // Clear batch after sending
          currentBatch = [];
        }
      }
    }

    return true;
  }

  async whatsAppRemindChanges(): Promise<Boolean> {
    const operationLogs = await this.taskLogRepository.find({
      whatsAppStatus: LogWhatsAppStaus.PENDING,
      updatedAt: LessThan(moment().tz('UTC').subtract(10, 'minutes').format('YYYY-MM-DD HH:mm:ss')),
    });

    const sendLists: { [key: string]: Set<Task> } = {};
    const staffs = await User.find();
    const contacts = await Contact.find();
    if(!operationLogs.length) return true;
    for (let log of operationLogs) {
      let task = await log.task;
      if (task.isDeleted) {
        log.whatsAppStatus = LogWhatsAppStaus.SENT; 
        await log.save(); 
        continue;
      }
      let changes: Array<{ [key: string]: taskLogChanges }> | null = JSON.parse(JSON.stringify(log.changes));
      if (!changes || !changes.length) continue;

      for (let change of changes) {
        if (change['assignedStaff'] && change['assignedStaff'].newIds) {
          for (let newId of change['assignedStaff'].newIds) {
            let staff = staffs.find(staff => staff.id == newId);
            if (!sendLists[`${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`]) {
              sendLists[`${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`] = new Set;
            }
            sendLists[`${(staff?.whatsApp ?? '') + (staff?.whatsapp2 ?? '')}`].add(task);
          }
        }
        if (change['assignedContact'] && change['assignedContact'].newIds) {
          for (let newId of change['assignedContact'].newIds) {
            let contact = contacts.find(contact => contact.id == newId);
            if (!sendLists[`${contact?.tel ?? ''}`]) {
              sendLists[`${contact?.tel ?? ''}`] = new Set;
            }
            sendLists[`${contact?.tel ?? ''}`].add(task);
          }
        }
      }
      log.whatsAppStatus = LogWhatsAppStaus.SENT;
      await log.save();
    }

    const whatsappService = await getWhatsAppService();

    // Send messages for each staff/contact
    for (let [whatsappNumber, taskSet] of Object.entries(sendLists)) {
      const tasks = Array.from(taskSet);
      let currentBatch: Task[] = [];
      let messageCount = 0;

      for (let task of tasks) {
        currentBatch.push(task);

        // When we reach 4 items or it's the last batch, send the message
        if (currentBatch.length === 4 || task === tasks[tasks.length - 1]) {
          messageCount++;
          const templateName = currentBatch.length === 4 ? 'task_new_assign_4' : `task_new_assign_${currentBatch.length}`;

          // Prepare message parameters
          const parameters = [];
          for (let i = 0; i < currentBatch.length; i++) {
            const task = currentBatch[i];
            const creator = await task.createdBy;
            parameters.push({
              type: 'text',
              text: `${i + 1}) ${creator.nickName}: ${task.name} ${task.dueDate ? `工作期限為:${task.dueDate}` : ''}`
            });
          }

          try {
            await whatsappService.sendTemplateMessage({
              to: whatsappNumber,
              templateName: templateName,
              languageCode: 'zh_HK',
              components: [{
                type: 'body',
                parameters: parameters
              }]
            });

            logger.info(`Sent ${templateName} to ${whatsappNumber} with ${currentBatch.length} records`);
          } catch (error: any) {
            logger.error(`Failed to send WhatsApp message: ${error.message}`);
          }

          // Clear batch after sending
          currentBatch = [];
        }
      }
    }

    return true;
  }


  private pendingIds: { [key: string]: Array<string> } = {};

  async handleChangesList(jsonData: JSON) {
    let data: Array<{ [key: string]: taskLogChanges }> = JSON.parse(JSON.stringify(jsonData));

    data = await this.getAllIds(data);

    let entityData: Array<any> = [];
    if (Object.keys(this.pendingIds).length > 0) {
      for (const [entity, ids] of Object.entries(this.pendingIds)) {
        const data = await getRepository(entity).findByIds(ids);
        entityData = entityData.concat(data);
      }
    }

    const associatedEntityData = entityData.reduce((a: any, c: any) => {
      a[c.id] = c;
      return a;
    }, {});

    data = await this.handleIdsAndNames(associatedEntityData, data);

    return data;
  }

  async getAllIds(
    data: Array<{ [key: string]: taskLogChanges }>,
  ) {
    for (let i = 0; i < data.length; i++) {
      for (const [n, nv] of Object.entries(data[i])) {
        for (const [k, kv] of Object.entries(data[i][n])) {
          if ((k === 'originalId' || k === 'newId') && nv.entity) {
            if (!(nv.entity in this.pendingIds)) {
              this.pendingIds[nv.entity] = [];
            }

            this.pendingIds[nv.entity].push(kv);
          } else if ((k === 'originalIds' || k === 'newIds') && nv.entity) {
            if (!(nv.entity in this.pendingIds)) {
              this.pendingIds[nv.entity] = [];
            }

            for (let j = 0; j < kv.length; j++) {
              this.pendingIds[nv.entity].push(kv[j]);
            }
          }
        }
      }
    }

    return data;
  }

  async handleIdsAndNames(
    entities: { [key: string]: any },
    data: Array<{ [key: string]: taskLogChanges }>
  ) {
    for (let i = 0; i < data.length; i++) {
      for (const [n, nv] of Object.entries(data[i])) {
        for (const [k, kv] of Object.entries(data[i][n])) {


          if ((k === 'originalId' || k === 'newId') && nv.entity) {
            if (k === 'newId' && kv in entities) {
              data[i][n]['newName'] = entities[kv].name;
            }
            if (k === 'originalId' && kv in entities) {
              data[i][n]['originalName'] = entities[kv].name;
            }
            data[i][n][k] = toGlobalId(nv.entity, kv);
          } else if ((k === 'originalIds' || k === 'newIds') && nv.entity) {
            if (!Array.isArray(data[i][n].originalNames)) {
              data[i][n].originalNames = [];
              data[i][n].newNames = [];
            }
            for (let j = 0; j < kv.length; j++) {
              if (k === 'newIds' && kv[j] in entities) {
                data[i][n].newNames!.push(entities[kv[j]].nameCht ?? entities[kv[j]].contactName);
              } else if (k === 'newIds' && kv[j] in entities) {
                data[i][n].originalNames!.push(entities[kv[j]].nameCht ?? entities[kv[j]].contactName);
              }
              data[i][n][k]![j] = toGlobalId(nv.entity, kv[j]);
            }
          }
        }
      }
    }

    return data;
  }
}
interface taskLogParams {
  user?: LoggedInUser | null,
  contact?: Contact | null,
  taskId: string,
  action: OperationAction,
  whatsAppStatus?: LogWhatsAppStaus,
  changes?: Array<{ [key: string]: taskLogChanges }> | null,
}