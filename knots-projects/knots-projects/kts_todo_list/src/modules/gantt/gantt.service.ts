import { connectionFromArraySlice, fromGlobalId, toGlobalId } from 'graphql-relay';
import { Service, Inject } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { GanttsConnection, GanttsCalendarConnection, GanttsShareConnection } from './connection/gantt.connection';
import { UserRepository } from '../user/user.repository';
import { GanttAssignmentsRepository, GanttCalendarIntervalsRepository, GanttCalendarRepository, GanttColumnConfigRepository, GanttDependenciesRepository, GanttLogRepository, GanttRepository, GanttShareRepository, GanttTasksRepository } from './gantt.repository';
import { Gantt, GanttAssignments, GanttCalendar, GanttCalendarIntervals, GanttColumnConfig, GanttDependencies, GanttLog, ganttLogChanges, GanttShare, GanttStatus, GanttTasks } from './gantt.entity';
import { GanttArgs, GanttCalendarArgs } from './args/gantt.args';
import { GanttCalendarIntervalsInput } from './input/ganttCalendarIntervals.input';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { GanttCalendarIntervalsPayload } from './payload/ganttCalendarIntervals.payload';
import { logger } from '../../lib/logger';
import { GanttCalendarInput } from './input/ganttCalendar.input';
import { GanttCalendarPayload } from './payload/ganttCalendar.payload';
import { GanttInput } from './input/gantt.input';
import { GanttPayload } from './payload/gantt.payload';
import { ProjectRepository } from '../project/project.repository';
import { GanttTasksInput } from './input/ganttTasks.inut';
import { GanttTasksPayload } from './payload/ganttTasks.payload';
import { GanttDependenciesInput } from './input/ganttDependencies.input';
import { GanttDependenciesPayload } from './payload/ganttDependencies.payload';
import { GanttAssignmentsInput } from './input/ganttAssignments.input';
import { GanttAssignmentsPayload } from './payload/ganttAssignments.payload';
import { EntityManager, getConnection, getRepository, QueryRunner } from 'typeorm';
import { User } from '../user/user.entity';
import moment from 'moment-timezone';
import { PubSubEngine } from 'type-graphql';
import { MutationType } from '../common/subscriptionPayload.type';
import { DataAction, OperationAction } from '../task/task.entity';
import { Project } from '../project/project.entity';
import { COLUMN_CONFIG_KEY, DEFAULT_CALENDAR_ID } from '../../lib/config';
import { GanttShareArgs } from './args/ganttShare.args';
import { createToken, decryptToken } from '../../lib/jwt';
import { GanttSharePayload } from './payload/ganttShare.payload';
import { GanttShareDisableInput } from './input/ganttShareDisable.input';
import { GanttShareGenerateInput } from './input/ganttShareGenerate.input';
import { GanttShareDeletePayload } from './payload/ganttShareDelete.payload';
import { GanttCheckShareArgs } from './args/ganttCheckShare.args';
import { GanttUpdateCalendarInput } from './input/ganttUpdateCalendar.input';
import { GanttColumnConfigPayload } from './payload/ganttColumnConfig.payload';
import { GanttColumnConfigSaveInput } from './input/ganttColumnConfigSave.input';
import { GanttColumnConfigSavePayload } from './payload/ganttColumnConfigSave.payload';
import { GanttCloneInput } from './input/ganttClone.input';
import { GanttClonePayload } from './payload/ganttClone.payload';
import { uuid } from 'uuidv4';

const buildTasksTreeData: any = (items: Array<{ [key: string]: any }>, id = null, link = 'parentId') =>
  items
    .filter(item => item[link] === id)
    .map(item => (
      {
        id: toGlobalId(GanttTasks.name, item.id),
        name: item.name,
        nameEng: item.nameEng,
        percentDone: item.percentDone,
        startDate: item.startDate,
        endDate: item.endDate,
        effort: item.effort,
        effortUnit: item.effortUnit,
        duration: item.duration,
        durationUnit: item.durationUnit,
        note: item.note,
        constraintType: item.constraintType,
        constraintDate: item.constraintDate,
        manuallyScheduled: item.manuallyScheduled,
        schedulingMode: item.schedulingMode,
        rollup: item.rollup,
        effortDriven: item.effortDriven,
        inactive: item.inactive,
        cls: item.cls,
        style: item.style,
        iconCls: item.iconCls,
        color: item.color,
        parentIndex: item.parentIndex,
        deadline: item.deadline,
        expanded: item.expanded,
        calendar: toGlobalId(GanttCalendar.name, item.calendarId),
        baselines: [],
        parentId: item.parentId ? toGlobalId(GanttTasks.name, item.parentId) : null,
        children: buildTasksTreeData(items, item.id),
        //logs: item.logs,
        moveDay: 0,
      })).sort((a, b) => a.parentIndex - b.parentIndex);

@Service()
export class GanttService {
  constructor(
    @InjectRepository()
    private readonly ganttRepository: GanttRepository,
    @InjectRepository()
    private readonly ganttCalendarRepository: GanttCalendarRepository,
    @InjectRepository()
    private readonly ganttCalendarIntervalsRepository: GanttCalendarIntervalsRepository,
    @InjectRepository()
    private readonly ganttTasksRepository: GanttTasksRepository,
    @InjectRepository()
    private readonly ganttDependenciesRepository: GanttDependenciesRepository,
    @InjectRepository()
    private readonly ganttAssignmentsRepository: GanttAssignmentsRepository,
    @InjectRepository()
    private readonly ganttLogRepository: GanttLogRepository,
    @InjectRepository()
    private readonly ganttShareRepository: GanttShareRepository,
    @InjectRepository()
    private readonly userRepository: UserRepository,
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
    @InjectRepository()
    private readonly ganttColumnConfigRepository: GanttColumnConfigRepository,
    @Inject('pubSub')
    private readonly pubSub: PubSubEngine,
  ) {
  }

  async getManyInConnection(args: GanttArgs, extraArgs: { [index: string]: any } = {}): Promise<GanttsConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.ganttRepository
      .createQueryBuilder('gantt')
      .where('`is_deleted` = 0');
    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.projectId) queryBuilder.andWhere('project_id = :projectId', { projectId: args.projectId});
    if (args.status) queryBuilder.andWhere(`status = :status`, { status: args.status });
    const [gantts, ganttsCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(gantts, args, {
        arrayLength: ganttsCount,
        sliceStart: offset || 0,
      }),
      totalCount: ganttsCount,
    };
  }

  async getShareInConnection(args: GanttShareArgs): Promise<GanttsShareConnection> {
    const gantt: Gantt | undefined = await this.ganttRepository.findOne({ projectId: args.projectId });
    if (!gantt) {
      return {
        ...connectionFromArraySlice([], args, {
          arrayLength: 0,
          sliceStart: 0 || 0,
        }),
        totalCount: 0,
      };
    }
    const queryBuilder = this.ganttShareRepository
      .createQueryBuilder('ganttShare')
      .where('`is_deleted` = 0')
      .orderBy({
        'created_at': 'ASC',
      });
    queryBuilder.andWhere('gantt_id = :ganttId', { ganttId: gantt.id });
    const [ganttShare, ganttShareCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(ganttShare, args, {
        arrayLength: ganttShareCount,
        sliceStart: 0 || 0,
      }),
      totalCount: ganttShareCount,
    };
  }

  async checkShareCode(args: GanttCheckShareArgs): Promise<Boolean> {
    try {
      await decryptToken(args.code);
      await this.ganttShareRepository.findOneOrFail({ code: args.code, isDeleted: false });
      return true;
    } catch (error) {
      return false;
    }
  }

  async generateCode(
    data: GanttShareGenerateInput,
    currentUser?: LoggedInUser,
  ): Promise<GanttSharePayload> {
    try {

      const gantt: Gantt | undefined = await this.ganttRepository.findOne({ projectId: data.projectId });
      if (!gantt) {
        return this.returnErrorMessage('Gantt does not exist');
      }
      const code = await createToken({ ganttId: toGlobalId(Gantt.name, gantt.id) }, { expiresIn: `${86400000 * data.expiredDay}ms` });

      const ganttShare: GanttShare | undefined = GanttShare.create();
      ganttShare.ganttId = gantt.id;
      ganttShare.code = code;
      ganttShare.expiredTime = moment().add(data.expiredDay, 'days').toDate();
      if (data.remark) ganttShare.remark = data.remark;

      await ganttShare.save();

      return {
        userErrors: [],
        ganttShare: ganttShare,
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

  async disableCode(
    data: GanttShareDisableInput,
    currentUser?: LoggedInUser,
  ): Promise<GanttShareDeletePayload> {
    try {

      const ganttShare: GanttShare | undefined = await this.ganttShareRepository.findOne({ code: data.code });
      if (!ganttShare) {
        return this.returnErrorMessage('Unvalid Code');
      }

      ganttShare.isDeleted = true;

      await ganttShare.save();

      return {
        userErrors: [],
        deletedGanttShareCode: data.code,
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

  async getCalendarsInConnection(args: GanttCalendarArgs, extraArgs: { [index: string]: any } = {}): Promise<GanttsCalendarConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.ganttCalendarRepository
      .createQueryBuilder('gantt_calendar');
    if (args.id) queryBuilder.where('id = :id', { id: fromGlobalId(args.id).id });
    const [calendars, calendarsCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(calendars, args, {
        arrayLength: calendarsCount,
        sliceStart: offset || 0,
      }),
      totalCount: calendarsCount,
    };
  }

  async ganttSave(
    data: GanttInput,
    currentUser?: LoggedInUser,
  ): Promise<GanttPayload> {
    try {
      let gantt: Gantt | undefined;

      if (!!data.id) {
        gantt = await this.ganttRepository.findOne(fromGlobalId(data.id).id);
        if (!gantt) {
          return this.returnErrorMessage('Gantt does not exist');
        }
        gantt.revision += 1;
      } else {
        if (!data.calendarId) return this.returnErrorMessage('Gantt calendarId required');
        if (!data.startDate) return this.returnErrorMessage('Gantt startDate required');
        gantt = Gantt.create();
      }


      if (data.projectId) {
        const project = await this.projectRepository.findOne(data.projectId);
        if (!project) {
          return this.returnErrorMessage('Project does not exist');
        }
        gantt.projectId = data.projectId;
      }

      if (data.calendarId) {
        const ganttCalendar = await this.ganttCalendarRepository.findOne(fromGlobalId(data.calendarId).id);
        if (!ganttCalendar) {
          return this.returnErrorMessage('Gantt Calendar does not exist');
        }
        gantt.calendarId = ganttCalendar.id;
      }

      if (data.startDate) {
        gantt.startDate = data.startDate;
      }

      if (data.hoursPerDay) {
        gantt.hoursPerDay = data.hoursPerDay;
      }

      if (data.daysPerWeek) {
        gantt.daysPerWeek = data.daysPerWeek;
      }

      if (data.daysPerMonth) {
        gantt.daysPerMonth = data.daysPerMonth;
      }

      await gantt.save();

      return {
        userErrors: [],
        gantt: gantt
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

  async ganttUpdateCalendar(
    data: GanttUpdateCalendarInput,
    currentUser?: LoggedInUser,
  ): Promise<GanttPayload> {
    try {
      let gantt: Gantt | undefined;

      if (!!data.projectId) {
        gantt = await this.ganttRepository.findOne({projectId: data.projectId});
        if (!gantt) {
          return this.returnErrorMessage('Gantt does not exist');
        }
        gantt.revision += 1;
      } else {
        return this.returnErrorMessage('Project Id required');
      }

      if (data.calendarId) {
        const ganttCalendar = await this.ganttCalendarRepository.findOne(fromGlobalId(data.calendarId).id);
        if (!ganttCalendar) {
          return this.returnErrorMessage('Gantt Calendar does not exist');
        }
        gantt.calendarId = ganttCalendar.id;
      }

      await gantt.save();

      return {
        userErrors: [],
        gantt: gantt
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

  async calendarSave(
    data: GanttCalendarInput,
    currentUser: LoggedInUser,
  ): Promise<GanttCalendarPayload> {
    try {
      let originalGanttCalendar: GanttCalendar | undefined;
      let ganttCalendar: GanttCalendar | undefined;
      let oldGanttCalendar: GanttCalendar | undefined;

      if (!!data.id) {
        ganttCalendar = await this.ganttCalendarRepository.findOne(fromGlobalId(data.id).id);
        if (!ganttCalendar) {
          return this.returnErrorMessage('Calendar does not exist');
        }
        oldGanttCalendar = this.ganttCalendarRepository.create({ ...ganttCalendar });

        originalGanttCalendar = Object.assign(Object.create(ganttCalendar), ganttCalendar);
      } else {
        ganttCalendar = GanttCalendar.create();
      }

      if (data.name) {
        ganttCalendar.name = data.name;
      } else if (data.name == null) {
        ganttCalendar.name = null;
        ganttCalendar.name = data.name;
      }

      await ganttCalendar.save();

      return {
        userErrors: [],
        ganttCalendar: ganttCalendar
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

  async calendarIntervalsSave(
    data: GanttCalendarIntervalsInput,
    currentUser: LoggedInUser,
  ): Promise<GanttCalendarIntervalsPayload> {
    try {
      let originalGanttCalendarIntervals: GanttCalendarIntervals | undefined;
      let ganttCalendarIntervals: GanttCalendarIntervals | undefined;
      let oldGanttCalendarIntervals: GanttCalendarIntervals | undefined;

      if (!!data.id) {
        ganttCalendarIntervals = await this.ganttCalendarIntervalsRepository.findOne(fromGlobalId(data.id).id);
        if (!ganttCalendarIntervals) {
          return this.returnErrorMessage('Calendar Intervals does not exist');
        }
        oldGanttCalendarIntervals = this.ganttCalendarIntervalsRepository.create({ ...ganttCalendarIntervals });

        originalGanttCalendarIntervals = Object.assign(Object.create(ganttCalendarIntervals), ganttCalendarIntervals);
      } else {
        if (!data.calendarId) return this.returnErrorMessage('Calendar ID is required');
        ganttCalendarIntervals = GanttCalendarIntervals.create();
      }

      if (data.calendarId) {
        const ganttCalendar = await this.ganttCalendarRepository.findOne(fromGlobalId(data.calendarId).id);
        if (!ganttCalendar) return this.returnErrorMessage('Calendar ID is not exist');
        ganttCalendarIntervals.calendarId = ganttCalendar.id;
      }

      if (data.recurrentStartDate) {
        ganttCalendarIntervals.recurrentStartDate = data.recurrentStartDate;
      }

      if (data.recurrentEndDate) {
        ganttCalendarIntervals.recurrentEndDate = data.recurrentEndDate;
      }

      await ganttCalendarIntervals.save();

      return {
        userErrors: [],
        ganttCalendarIntervals: ganttCalendarIntervals
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

  async tasksSave(
    data: GanttTasksInput,
    currentUser: LoggedInUser,
  ): Promise<GanttTasksPayload> {
    try {
      let originalGanttTasks: GanttTasks | undefined;
      let ganttTasks: GanttTasks | undefined;
      let oldGanttTasks: GanttTasks | undefined;

      if (!!data.id) {
        ganttTasks = await this.ganttTasksRepository.findOne(fromGlobalId(data.id).id);
        if (!ganttTasks) {
          return this.returnErrorMessage('Calendar Intervals does not exist');
        }
        oldGanttTasks = this.ganttTasksRepository.create({ ...ganttTasks });

        originalGanttTasks = Object.assign(Object.create(ganttTasks), ganttTasks);
      } else {
        if (!data.ganttId) return this.returnErrorMessage('Gantt ID is required');
        ganttTasks = GanttTasks.create();
      }

      if (data.ganttId) {
        const gantt = await this.ganttRepository.findOne(fromGlobalId(data.ganttId).id);
        if (!gantt) return this.returnErrorMessage('Gantt ID is not exist');
        ganttTasks.ganttId = gantt.id;
      }

      if (data.parentId) {
        const ganttTasksParent = await this.ganttTasksRepository.findOne(fromGlobalId(data.parentId).id);
        if (!ganttTasksParent) return this.returnErrorMessage('Parent ID is not exist');
        ganttTasks.parentId = ganttTasksParent.id;
      } else if (data.parentId == null) {
        ganttTasks.parentId = null;
      }

      if (data.calendarId) {
        const ganttCalendar = await this.ganttCalendarRepository.findOne(fromGlobalId(data.calendarId).id);
        if (!ganttCalendar) return this.returnErrorMessage('Calendar ID is not exist');
        ganttTasks.calendarId = ganttCalendar.id;
      } else if (data.calendarId == null) {
        ganttTasks.calendarId = null;
      }

      if (data.name) {
        ganttTasks.name = data.name;
      }

      if (data.nameEng) {
        ganttTasks.nameEng = data.nameEng;
      }

      if (data.startDate) {
        ganttTasks.startDate = data.startDate;
      }

      if (data.endDate) {
        ganttTasks.endDate = data.endDate;
      }

      if (data.effort) {
        ganttTasks.effort = data.effort;
      }

      if (data.effortUnit) {
        ganttTasks.effortUnit = data.effortUnit;
      }

      if (data.duration) {
        ganttTasks.duration = data.duration;
      }

      if (data.durationUnit) {
        ganttTasks.durationUnit = data.durationUnit;
      }

      if (data.percentDone) {
        ganttTasks.percentDone = data.percentDone;
      }

      if (data.note) {
        ganttTasks.note = data.note;
      }

      if (data.constraintType) {
        ganttTasks.constraintType = data.constraintType;
      }

      if (data.constraintDate) {
        ganttTasks.constraintDate = data.constraintDate;
      }

      if (data.manuallyScheduled) {
        ganttTasks.manuallyScheduled = data.manuallyScheduled;
      }

      if (data.schedulingMode) {
        ganttTasks.schedulingMode = data.schedulingMode;
      }

      if (data.effortDriven) {
        ganttTasks.effortDriven = data.effortDriven;
      }

      if (data.inactive) {
        ganttTasks.inactive = data.inactive;
      }

      if (data.cls) {
        ganttTasks.cls = data.cls;
      }

      if (data.iconCls) {
        ganttTasks.iconCls = data.iconCls;
      }

      if (data.color) {
        ganttTasks.color = data.color;
      }

      if (data.parentIndex) {
        ganttTasks.parentIndex = data.parentIndex;
      }

      if (data.expanded) {
        ganttTasks.expanded = data.expanded;
      }

      if (data.deadline) {
        ganttTasks.deadline = data.deadline;
      }

      await ganttTasks.save();

      return {
        userErrors: [],
        ganttTasks: ganttTasks
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

  async dependenciesSave(
    data: GanttDependenciesInput,
    currentUser: LoggedInUser,
  ): Promise<GanttDependenciesPayload> {
    try {
      let originalGanttDependencies: GanttDependencies | undefined;
      let ganttDependencies: GanttDependencies | undefined;
      let oldGanttDependencies: GanttDependencies | undefined;

      if (!!data.id) {
        ganttDependencies = await this.ganttDependenciesRepository.findOne(fromGlobalId(data.id).id);
        if (!ganttDependencies) {
          return this.returnErrorMessage('Dependencies does not exist');
        }
        oldGanttDependencies = this.ganttDependenciesRepository.create({ ...ganttDependencies });

        originalGanttDependencies = Object.assign(Object.create(ganttDependencies), ganttDependencies);
      } else {
        if (!data.ganttId) return this.returnErrorMessage('Gantt ID is required');
        if (!data.fromEventId) return this.returnErrorMessage('From Event ID is required');
        if (!data.toEventId) return this.returnErrorMessage('To Event ID is required');
        ganttDependencies = GanttDependencies.create();
      }

      if (data.ganttId) {
        const gantt = await this.ganttRepository.findOne(fromGlobalId(data.ganttId).id);
        if (!gantt) return this.returnErrorMessage('Gantt ID is not exist');
        ganttDependencies.ganttId = gantt.id;
      }

      if (data.fromEventId) {
        const fromEvent = await this.ganttTasksRepository.findOne(fromGlobalId(data.fromEventId).id);
        if (!fromEvent) return this.returnErrorMessage('From Event ID is not exist');
        ganttDependencies.fromEventId = fromEvent.id;
      }

      if (data.toEventId) {
        const toEvent = await this.ganttTasksRepository.findOne(fromGlobalId(data.toEventId).id);
        if (!toEvent) return this.returnErrorMessage('To Event ID is not exist');
        ganttDependencies.toEventId = toEvent.id;
      }

      if (data.typ) {
        ganttDependencies.typ = data.typ;
      }

      if (data.cls) {
        ganttDependencies.cls = data.cls;
      } else if (data.cls === null) {
        ganttDependencies.cls = null;
      }

      if (data.lag) {
        ganttDependencies.lag = data.lag;
      }

      if (data.lagUnit) {
        ganttDependencies.lagUnit = data.lagUnit;
      }

      await ganttDependencies.save();

      return {
        userErrors: [],
        ganttDependencies: ganttDependencies
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

  async assignmentsSave(
    data: GanttAssignmentsInput,
    currentUser: LoggedInUser,
  ): Promise<GanttAssignmentsPayload> {
    try {
      let originalGanttAssignments: GanttAssignments | undefined;
      let ganttAssignments: GanttAssignments | undefined;
      let oldGanttAssignments: GanttAssignments | undefined;

      if (!!data.id) {
        ganttAssignments = await this.ganttAssignmentsRepository.findOne(fromGlobalId(data.id).id);
        if (!ganttAssignments) {
          return this.returnErrorMessage('Assignments does not exist');
        }
        oldGanttAssignments = this.ganttAssignmentsRepository.create({ ...ganttAssignments });

        originalGanttAssignments = Object.assign(Object.create(ganttAssignments), ganttAssignments);
      } else {
        if (!data.ganttId) return this.returnErrorMessage('Gantt ID is required');
        if (!data.eventId) return this.returnErrorMessage('Event ID is required');
        if (!data.staffId) return this.returnErrorMessage('Staff ID is required');
        ganttAssignments = GanttAssignments.create();
      }

      if (data.ganttId) {
        const gantt = await this.ganttRepository.findOne(fromGlobalId(data.ganttId).id);
        if (!gantt) return this.returnErrorMessage('Gantt ID is not exist');
        ganttAssignments.ganttId = gantt.id;
      }

      if (data.eventId) {
        const event = await this.ganttTasksRepository.findOne(fromGlobalId(data.eventId).id);
        if (!event) return this.returnErrorMessage('Event ID is not exist');
        ganttAssignments.eventId = event.id;
      }

      if (data.staffId) {
        const user = await this.userRepository.findOne(fromGlobalId(data.staffId).id);
        if (!user) return this.returnErrorMessage('Staff ID is not exist');
        ganttAssignments.staffId = user.id;
      }

      await ganttAssignments.save();

      return {
        userErrors: [],
        ganttAssignments: ganttAssignments
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

  async syncTasks(
    queryRunner: any,
    data: any,
    gantt: Gantt,
    returnSubscriptionData: any,
    requestId: string,
    revision: number,
    operateUser: User | undefined,
  ): Promise<any> {

    let returnAdded: Array<{ [key: string]: any }> = [];
    let tmpId: { [key: string]: any } = {};
    let returnDeleted: Array<{ [key: string]: any }> = [];
    let earliestStartDate: string = gantt.startDate;

    try {

      const addData = async (row: any, queryRunner: any) => {
        let record: GanttTasks | undefined = GanttTasks.create();

          record.ganttId = gantt.id;

          if (row.parentId?.startsWith('_generated')) {
            record.parentId = fromGlobalId(tmpId[row.parentId]).id;
          } else {
            record.parentId = row.parentId ? fromGlobalId(row.parentId).id : null;
          }

          const target = await queryRunner.manager.findOne(GanttTasks, {
            ganttId: record.ganttId,
            parentId: record.parentId,
            parentIndex: row.parentIndex,
            isDeleted: 0,
          });

          if (row.name) {
            record.name = row.name;
          }
          if (row.nameEng) {
            record.nameEng = row.nameEng;
          }
          if (row.startDate) {
            record.startDate = row.startDate;

            if (!earliestStartDate) {
              const updateProject: Gantt | undefined = gantt;
              updateProject.startDate = moment(row.startDate).format('YYYY-MM-DD');
              earliestStartDate = moment(row.startDate).format('YYYY-MM-DD');
              await queryRunner.manager.save(updateProject);
            } else if (moment(earliestStartDate, 'YYYY-MM-DD').isAfter(moment(row.startDate))) {
              const updateProject: Gantt | undefined = gantt;
              updateProject.startDate = moment(row.startDate).format('YYYY-MM-DD');
              earliestStartDate = moment(row.startDate).format('YYYY-MM-DD');
              await queryRunner.manager.save(updateProject);
            }
          }
          if (row.endDate) {
            record.endDate = row.endDate;
          }
          if (row.effort !== undefined) {
            record.effort = row.effort;
          }
          if (row.effortUnit) {
            record.effortUnit = row.effortUnit;
          }
          if (row.duration !== undefined) {
            record.duration = row.duration;
          }
          if (row.durationUnit) {
            record.durationUnit = row.durationUnit;
          }
          if (row.percentDone !== undefined) {
            record.percentDone = row.percentDone;
          }
          if (row.constraintType) {
            record.constraintType = row.constraintType;
          }
          if (row.constraintDate) {
            record.constraintDate = row.constraintDate;
            if (!earliestStartDate) {
              const updateProject: Gantt | undefined = gantt;
              updateProject.startDate = moment(row.constraintDate).format('YYYY-MM-DD');
              earliestStartDate = moment(row.constraintDate).format('YYYY-MM-DD');
              await queryRunner.manager.save(updateProject);
            } else if (moment(earliestStartDate, 'YYYY-MM-DD').isAfter(moment(row.constraintDate))) {
              const updateProject: Gantt | undefined = gantt;
              updateProject.startDate = moment(row.constraintDate).format('YYYY-MM-DD');
              earliestStartDate = moment(row.constraintDate).format('YYYY-MM-DD');
              await queryRunner.manager.save(updateProject);
            }
          }
          if (row.manuallyScheduled !== undefined) {
            record.manuallyScheduled = row.manuallyScheduled;
          }
          if (row.schedulingMode) {
            record.schedulingMode = row.schedulingMode;
          }
          if (row.rollup !== undefined) {
            record.rollup = row.rollup;
          }
          if (row.effortDriven !== undefined) {
            record.effortDriven = row.effortDriven;
          }
          if (row.inactive !== undefined) {
            record.inactive = row.inactive;
          }
          if (row.cls) {
            record.cls = row.cls;
          }
          if (row.parentIndex !== undefined) {
            record.parentIndex = row.parentIndex;
          }
          const newRecord = await queryRunner.manager.save(record);
          const newId = toGlobalId(GanttTasks.name, newRecord.id);
          returnAdded.push({ $PhantomId: row.$PhantomId, id: newId });
          tmpId[row.$PhantomId] = newId;
          delete row.$PhantomId;
          //returnSubscriptionData.tasks.add.push({ ...row, id: newId });

          //put move record to before target item
          if (target) {
            if (row.parentId) {
              returnSubscriptionData.tasks.insertChild.push({ from: { ...row, id: newId }, to: toGlobalId(GanttTasks.name, target.id), tree: row.parentId });
            } else {
              returnSubscriptionData.tasks.insertRoot.push({ from: { ...row, id: newId }, to: toGlobalId(GanttTasks.name, target.id) });
              //returnSubscriptionData.tasks.move.push({ from: row.id, to: toGlobalId(GanttTasks.name, target.id) });
            }
          } else {
            if (row.parentId) {
              returnSubscriptionData.tasks.appendNew.push({ from: { ...row, id: newId }, to: row.parentId });
            } else {
              returnSubscriptionData.tasks.rootNew.push({ from: { ...row, id: newId } });
            }
          }
      }

      if (data.added && data.added.length) {
        let tempList = [...data.added];
        while (tempList.length > 0) {
          const row = tempList.shift();
          if (row.parentId && row.parentId.startsWith('_generated') && !(row.parentId in tmpId)) {
            tempList.push(row);
          } else {
            await addData(row, queryRunner);
          }
        }
      }

      if (data.updated && data.updated.length) {
        for (let row of data.updated) {
          const record: GanttTasks | undefined = await this.ganttTasksRepository.findOne(fromGlobalId(row.id).id);
          if (!record) throw new Error("Task not exists");

          if (row.parentId !== undefined) {
            if (row.parentIndex !== undefined) {
              const target = await this.ganttTasksRepository.findOne({
                ganttId: record.ganttId,
                parentId: row.parentId === null ? null : fromGlobalId(row.parentId).id,
                parentIndex: row.parentIndex,
                isDeleted: 0,
              });
              //put move record to before target item
              if (target) {
                returnSubscriptionData.tasks.move.push({ from: row.id, to: toGlobalId(GanttTasks.name, target.id) });
              } else {
                if (row.parentId) {
                  returnSubscriptionData.tasks.appendTree.push({ from: row.id, tree: row.parentId });
                } else {
                  returnSubscriptionData.tasks.appendRoot.push({ to: row.id });
                }
              }
            }
            //bryntum bug if move to second of index will return undefined
            else {
              const target = await this.ganttTasksRepository.findOne({
                ganttId: record.ganttId,
                parentId: row.parentId === null ? null : fromGlobalId(row.parentId).id,
                parentIndex: 1,
                isDeleted: 0,
              });
              if (target) {
                returnSubscriptionData.tasks.move.push({ from: row.id, to: toGlobalId(GanttTasks.name, target.id) });
              } else {
                if (row.parentId) {
                  returnSubscriptionData.tasks.appendTree.push({ from: row.id, tree: row.parentId });
                } else {
                  returnSubscriptionData.tasks.appendRoot.push({ to: row.id });
                }
              }
            }
            if (row.parentId in tmpId) {
              record.parentId = fromGlobalId(tmpId[row.parentId]).id;
            } else {
              record.parentId = row.parentId === null ? null : fromGlobalId(row.parentId).id
            }
          }
          if (row.calendar) {
            record.calendarId = fromGlobalId(row.calendar).id;
          }
          if (row.name) {
            record.name = row.name;
          }
          if (row.nameEng) {
            record.nameEng = row.nameEng;
          }

          if (row.startDate) {
            record.startDate = row.startDate;

            if (!earliestStartDate) {
              const updateProject: Gantt | undefined = gantt;
              updateProject.startDate = moment(row.startDate).format('YYYY-MM-DD');
              earliestStartDate = moment(row.startDate).format('YYYY-MM-DD');
              await queryRunner.manager.save(updateProject);
            } else if (moment(earliestStartDate, 'YYYY-MM-DD').isAfter(moment(row.startDate))) {
              const updateProject: Gantt | undefined = gantt;
              updateProject.startDate = moment(row.startDate).format('YYYY-MM-DD');
              earliestStartDate = moment(row.startDate).format('YYYY-MM-DD');
              await queryRunner.manager.save(updateProject);
            }
          }
          if (row.endDate) {
            record.endDate = row.endDate;
          }
          if (row.effort !== undefined) {
            record.effort = row.effort;
          }
          if (row.effortUnit) {
            record.effortUnit = row.effortUnit;
          }
          if (row.duration !== undefined) {
            record.duration = row.duration;
          }
          if (row.durationUnit) {
            record.durationUnit = row.durationUnit;
          }
          if (row.percentDone !== undefined) {
            record.percentDone = row.percentDone;
          }
          if (row.note) {
            record.note = row.note;
          }
          if (row.constraintType) {
            record.constraintType = row.constraintType;
          }
          if (row.constraintDate) {
            record.constraintDate = row.constraintDate;

            if (!earliestStartDate) {
              const updateProject: Gantt | undefined = gantt;
              updateProject.startDate = moment(row.constraintDate).format('YYYY-MM-DD');
              earliestStartDate = moment(row.constraintDate).format('YYYY-MM-DD');
              await queryRunner.manager.save(updateProject);
              await queryRunner.manager
            } else if (moment(earliestStartDate, 'YYYY-MM-DD').isAfter(moment(row.constraintDate))) {
              const updateProject: Gantt | undefined = gantt;
              updateProject.startDate = moment(row.constraintDate).format('YYYY-MM-DD');
              earliestStartDate = moment(row.constraintDate).format('YYYY-MM-DD');
              await queryRunner.manager.save(updateProject);
            }
          }

          if (row.manuallyScheduled !== undefined) {
            record.manuallyScheduled = row.manuallyScheduled;
          }
          if (row.schedulingMode) {
            record.schedulingMode = row.schedulingMode;
          }
          if (row.rollup !== undefined) {
            record.rollup = row.rollup;
          }
          if (row.effortDriven !== undefined) {
            record.effortDriven = row.effortDriven;
          }
          if (row.inactive !== undefined) {
            record.inactive = row.inactive;
          }
          if (row.iconCls) {
            record.iconCls = row.iconCls;
          }
          if (row.color) {
            record.color = row.color;
          }
          if (row.style !== undefined) {
            record.style = row.style;
          }
          if (row.parentIndex !== undefined) {
            record.parentIndex = row.parentIndex;
          }
          if (row.expanded !== undefined) {
            record.expanded = row.expanded;
          }
          if (row.deadline) {
            record.deadline = row.deadline;
          }
          await queryRunner.manager.save(record);
          returnSubscriptionData.tasks.update.push({ ...row });
        }
      }
      //for take out update trigger if move tasks case
      if (returnSubscriptionData.tasks.move.length || returnSubscriptionData.tasks.appendRoot.length || returnSubscriptionData.tasks.append.length) {
        returnSubscriptionData.tasks.update = [];
      }

      if (data.removed && data.removed.length) {
        for (let row of data.removed) {
          const record: GanttTasks | undefined = await this.ganttTasksRepository.findOne(fromGlobalId(row.id).id);
          if (!record) throw new Error("Task not exists");
          record.isDeleted = true;
          returnDeleted.push({ id: row.id });
          await queryRunner.manager.save(record);
          returnSubscriptionData.tasks.remove.push({ id: row.id });
        }
      }

      return { rows: returnAdded, removed: returnDeleted, tmpId: tmpId }

    } catch (error: any) {
      throw new Error(error);
    }
  }

  async syncDependencies(
    queryRunner: any,
    data: any,
    gantt: Gantt,
    returnSubscriptionData: any,
    requestId: string,
    revision: number,
    operateUser: User | undefined,
    tmpId: { [key: string]: any },
  ): Promise<any> {

    let returnAdded: Array<{ [key: string]: any }> = [];
    let returnDeleted: Array<{ [key: string]: any }> = [];

    if (data.added && data.added.length) {
      for (let row of data.added) {
        let record: GanttDependencies | undefined = GanttDependencies.create();

        record.ganttId = gantt.id;

        if (row.fromEvent.startsWith('_generated')) {
          row.fromEvent = tmpId[row.fromEvent];
        }
        if (row.toEvent.startsWith('_generated')) {
          row.toEvent = tmpId[row.toEvent];
        }

        if (row.fromEvent) {
          record.fromEventId = fromGlobalId(row.fromEvent).id;
        }
        if (row.toEvent) {
          record.toEventId = fromGlobalId(row.toEvent).id;
        }
        if (row.type) {
          record.typ = row.type;
        }
        if (row.cls) {
          record.cls = row.cls;
        }
        if (row.lag !== undefined) {
          record.lag = row.lag;
        }
        if (row.lagUnit) {
          record.lagUnit = row.lagUnit;
        }
        if (row.active !== undefined) {
          record.active = row.active;
        }
        const newRecord = await queryRunner.manager.save(record);
        const newId = toGlobalId(GanttDependencies.name, newRecord.id);
        returnAdded.push({ $PhantomId: row.$PhantomId, id: newId });
        delete row.$PhantomId;
        returnSubscriptionData.dependencies.add.push({ ...row, id: newId });
      }
    }

    if (data.updated && data.updated.length) {
      for (let row of data.updated) {
        const record: GanttDependencies | undefined = await this.ganttDependenciesRepository.findOne(fromGlobalId(row.id).id);
        if (!record) throw new Error("Dependencies not exists");

        if (row.fromEvent) {
          record.fromEventId = fromGlobalId(row.fromEvent).id;
        }
        if (row.toEvent) {
          record.toEventId = fromGlobalId(row.toEvent).id;
        }
        if (row.type) {
          record.typ = row.type;
        }
        if (row.cls) {
          record.cls = row.cls;
        }
        if (row.lag !== undefined) {
          record.lag = row.lag;
        }
        if (row.lagUnit) {
          record.lagUnit = row.lagUnit;
        }
        if (row.active !== undefined) {
          record.active = row.active;
        }
        await queryRunner.manager.save(record);
        returnSubscriptionData.dependencies.update.push({ ...row });
      }
    }

    if (data.removed && data.removed.length) {
      for (let row of data.removed) {
        const record: GanttDependencies | undefined = await this.ganttDependenciesRepository.findOne(fromGlobalId(row.id).id);
        if (!record) throw new Error("Dependencies not exists");
        record.isDeleted = true;
        returnDeleted.push({ id: row.id });
        await queryRunner.manager.save(record);
        returnSubscriptionData.dependencies.remove.push({ id: row.id });
      }
    }
    return { rows: returnAdded, removed: returnDeleted }
  }

  async syncAssignments(
    queryRunner: any,
    data: any,
    gantt: Gantt,
    returnSubscriptionData: any,
    requestId: string,
    revision: number,
    operateUser: User | undefined,
    tmpId: { [key: string]: any },
  ): Promise<any> {

    let returnAdded: Array<{ [key: string]: any }> = [];
    let returnDeleted: Array<{ [key: string]: any }> = [];

    if (data.added && data.added.length) {

      let dataAdded = data.added;

      for (let row of dataAdded) {
        let record: GanttAssignments | undefined;
        record = GanttAssignments.create();

        record.ganttId = gantt.id;

        if (row.eventId.startsWith('_generated')) {
          row.eventId = tmpId[row.eventId];
        }

        if (row.eventId) {
          record.eventId = fromGlobalId(row.eventId).id;
        }
        if (row.resourceId) {
          record.staffId = row.resourceId;
        }
        if (row.units) {
          record.units = row.units;
        }
        const newRecord = await queryRunner.manager.save(record);
        const newId = toGlobalId(GanttAssignments.name, newRecord.id);
        returnAdded.push({ $PhantomId: row.$PhantomId, id: newId });
        delete row.$PhantomId;
        returnSubscriptionData.assignments.add.push({ ...row, id: newId });
      }
    }

    if (data.updated && data.updated.length) {

      let dataUpdated = data.updated;

      for (let row of dataUpdated) {
        const record: GanttAssignments | undefined = await this.ganttAssignmentsRepository.findOne(fromGlobalId(row.id).id);
        if (!record) throw new Error("Assignments not exists");

        if (row.eventId) {
          record.eventId = fromGlobalId(row.eventId).id;
        }
        if (row.resourceId) {
          record.staffId = row.resourceId;
        }
        if (row.units) {
          record.units = row.units;
        }
        await queryRunner.manager.save(record);
        returnSubscriptionData.assignments.update.push({ ...row });
      }
    }

    if (data.removed && data.removed.length) {

      let dataRemoved = data.removed;

      for (let row of dataRemoved) {
        const record: GanttAssignments | undefined = await this.ganttAssignmentsRepository.findOne(fromGlobalId(row.id).id);
        if (!record) throw new Error("Assignments not exists");
        record.isDeleted = true;
        returnDeleted.push({ id: row.id });
        await queryRunner.manager.save(record);
        returnSubscriptionData.assignments.remove.push({ id: row.id });
      }
    }

    return { rows: returnAdded, removed: returnDeleted }
  }

  async loadData(
    gantt: Gantt,
    requestId: string,
  ): Promise<any> {
    try {

      const returnData: { [key: string]: any } = {
        success: true,
        requestId: requestId,
        project: {},
        calendars: { rows: [] },
        tasks: { rows: [] },
        dependencies: { rows: [] },
        resources: { rows: [] },
        assignments: { rows: [] },
        timeRanges: { rows: [] },
        revision: gantt.revision,
      }

      let project: { [key: string]: any } = {};
      project.calendar = toGlobalId(GanttCalendar.name, gantt.calendarId);
      project.startDate = gantt.startDate ?? moment().format('YYYY-MM-DD');
      project.hoursPerDay = gantt.hoursPerDay;
      project.daysPerWeek = gantt.daysPerWeek;
      project.daysPerMonth = gantt.daysPerMonth;
      returnData.project = project;

      let dependencies: Array<GanttDependencies> | undefined = (await gantt.dependencies)?.filter(item => item['isDeleted'] === false);
      returnData.dependencies.rows = dependencies?.map(e => ({
        id: toGlobalId(GanttDependencies.name, e.id),
        fromTask: toGlobalId(GanttTasks.name, e.fromEventId),
        toTask: toGlobalId(GanttTasks.name, e.toEventId),
        lag: e.lag,
        lagUnit: e.lagUnit,
        active: e.active,
      }));

      const staffs: Array<User> = await this.userRepository.find();
      returnData.resources.rows = staffs?.map(e => ({
        id: e.id,
        name: e.nameEn,
        city: null,
        calendar: e.calendarId ? toGlobalId(GanttCalendar.name, e.calendarId) : null,
        image: e.img
      }));


      let assignments: Array<GanttAssignments> | undefined = (await gantt.assignments)?.filter(item => item['isDeleted'] === false);
      returnData.assignments.rows = assignments?.map(e => ({
        id: toGlobalId(GanttTasks.name, e.id),
        event: toGlobalId(GanttTasks.name, e.eventId),
        resource: e.staffId,
        units: e.units,
      }));

      let calendarsRow: Array<{ [key: string]: any }> = [];
      let calendars: Array<GanttCalendar> = await this.ganttCalendarRepository.find();
      if (calendars && calendars.length) {
        for (let row of calendars) {
          calendarsRow.push({
            id: toGlobalId(GanttCalendar.name, row.id),
            name: row.name,
            expanded: false,
            intervals: (await row.calendarIntervals)?.map(e => ({
              recurrentStartDate: e.recurrentStartDate,
              recurrentEndDate: e.recurrentEndDate,
              isWorking: e.isWorking
            }))
          })
        }
      }
      returnData.calendars.rows = calendarsRow;

      let tasksRow: Array<{ [key: string]: any }> = [];
      const tasks = (await gantt.ganttTasks)?.filter(item => item['isDeleted'] === false);
      // if (tasks && tasks.length) {
      //   for (let row of tasks) {
      //     //let dataLogs = await row.logs;
      //     // let dataLogs = row.logs;

      //     // const logs = dataLogs? await Promise.all(dataLogs.map(async e => ({
      //     //   id: toGlobalId(GanttLog.name, e.id),
      //     //   date: moment(e.createdAt).format('YYYY-MM-DD HH:MM:SS'),
      //     //   timestamp: moment(e.createdAt).format('x'),
      //     //   action: e.action,
      //     //   //user: (await this.userRepository.findOne({id:e.userId}))?.nameEn??null,
      //     //   user: null,
      //     //   changes: e.changes,
      //     //   requestId: e.requestId,
      //     //   revision: e.revision,
      //     // }))) : []

      //     let logs: any[] = [];

      //     tasksRow.push({
      //       id: row.id,
      //       name: row.name,
      //       percentDone: row.percentDone,
      //       startDate: row.startDate,
      //       endDate: row.endDate,
      //       effort: row.effort,
      //       effortUnit: row.effortUnit,
      //       duration: row.duration,
      //       durationUnit: row.durationUnit,
      //       note: row.note,
      //       constraintType: row.constraintType,
      //       constraintDate: row.constraintDate,
      //       manuallyScheduled: row.manuallyScheduled,
      //       schedulingMode: row.schedulingMode,
      //       rollup: row.rollup,
      //       effortDriven: row.effortDriven,
      //       inactive: row.inactive,
      //       cls: row.cls,
      //       iconCls: row.iconCls,
      //       color: row.color,
      //       style: row.style,
      //       parentIndex: row.parentIndex,
      //       deadline: row.deadline,
      //       expanded: row.expanded,
      //       calenderId: row.calendarId,
      //       parentId: row.parentId,
      //       logs: logs.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)),
      //     })
      //   }
      // }

      const treeTasks = buildTasksTreeData(tasks);

      returnData.tasks.rows = treeTasks;

      return returnData;

    } catch (error: any) {
      logger.error(error.message);
      throw new Error(error.message);
    }
  }

  async batchSave(
    data: any,
    gantt: Gantt,
    appUUID: string,
    user: any,
  ): Promise<any> {
    const connection = getConnection();
    let queryRunner = connection.createQueryRunner();
    let queryRunner2 = connection.createQueryRunner();
    const returnData: any = {
      success: true,
      requestId: data.requestId,
    }
    try {
      const resultTasks: any = {};
      const resultDependencies: any = {};
      const resultAssignments: any = {};

      const operateUser = await this.userRepository.findOne({ id: user.id });

      const returnSubscriptionData: any = {
        tasks: {
          add: [],
          update: [],
          remove: [],
          move: [],
          appendRoot: [],
          append: [],
          insertChild: [],
          insertRoot: [],
          appendNew: [],
          rootNew: [],
          appendTree: [],
        },
        dependencies: {
          add: [],
          update: [],
          remove: [],
        },
        assignments: {
          add: [],
          update: [],
          remove: [],
        }
      };

      await queryRunner.connect();
      await queryRunner.startTransaction();

      //update revision
      gantt.revision += 1;
      await queryRunner.manager.save(gantt);
      returnData.revision = gantt.revision;

      let tmpId: { [key: string]: any } = {};
      if (data.tasks) {
        const rpTasks = await this.syncTasks(queryRunner, data.tasks, gantt, returnSubscriptionData, data.requestId, gantt.revision, operateUser);
        if (rpTasks.rows.length) resultTasks.rows = rpTasks.rows;
        if (rpTasks.removed.length) resultTasks.removed = rpTasks.removed;
        if (rpTasks.rows.length || rpTasks.removed.length) returnData.tasks = resultTasks;
        tmpId = rpTasks.tmpId;
      }

      if (data.dependencies) {
        const rpDependencies = await this.syncDependencies(queryRunner, data.dependencies, gantt, returnSubscriptionData, data.requestId, gantt.revision, operateUser, tmpId);
        if (rpDependencies.rows.length) resultDependencies.rows = rpDependencies.rows;
        if (rpDependencies.removed.length) resultDependencies.removed = rpDependencies.removed;
        if (rpDependencies.rows.length || rpDependencies.removed.length) returnData.dependencies = resultDependencies;
      }

      if (data.assignments) {
        const rpAssignments = await this.syncAssignments(queryRunner, data.assignments, gantt, returnSubscriptionData, data.requestId, gantt.revision, operateUser, tmpId);
        if (rpAssignments.rows.length) resultAssignments.rows = rpAssignments.rows;
        if (rpAssignments.removed.length) resultAssignments.removed = rpAssignments.removed;
        if (rpAssignments.rows.length || rpAssignments.removed.length) returnData.assignments = resultAssignments;
      }

      await queryRunner.commitTransaction();

      //fix project start date if task after then project start
      await queryRunner2.startTransaction();

      const finalCheckEarlyTask: GanttTasks | undefined = await this.ganttTasksRepository.createQueryBuilder('start_date')
        .where({ ganttId: gantt.id, isDeleted: 0 })
        .orderBy({
          'start_date': 'ASC',
        }).getOne();

      if (finalCheckEarlyTask) {
        if (finalCheckEarlyTask.startDate) {
          if (moment(gantt.startDate, 'YYYY-MM-DD').isBefore(moment(finalCheckEarlyTask.startDate, 'YYYY-MM-DD'))) {
            const updateProject: Gantt | undefined = gantt;
            updateProject.startDate = moment(finalCheckEarlyTask.startDate).format('YYYY-MM-DD');
            await queryRunner.manager.save(updateProject);
          }
        }
      }

      await queryRunner2.commitTransaction();

      this.pubSub.publish('onGanttChange', {
        mutation: MutationType.UPDATED,
        node: gantt,
        updatedTime: moment().format('YYYY-MM-DD HH:MM:SS'),
        requestId: data.requestId.toString(),
        appUUID: appUUID,
        operateUser: operateUser?.nameEn,
        returnSubscriptionData: JSON.stringify(returnSubscriptionData),
      });

    } catch (error: any) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
      await queryRunner2.rollbackTransaction();
      return {
        success: false,
        message: error.message,
        code: error.code
      }
    } finally {
      await queryRunner.release();
      await queryRunner2.release();
    }

    return returnData;
  }

  async logSave(
    params: ganttLogParams,
    manager?: EntityManager,
  ): Promise<Boolean> {
    if (!manager) manager = this.ganttLogRepository.manager;
    if (!params?.user?.id && !params?.ganttId && !params?.requestId && !params?.revision) { return false; }
    let operationLog = new GanttLog();
    operationLog.action = params.action;
   // operationLog.ganttId = params.ganttId;
    operationLog.requestId = params.requestId;
    operationLog.revision = params.revision;

    if (params?.user?.id) {
      operationLog.userId = params.user.id;
    } else if (params?.ganttTasksId) {
     // operationLog.ganttTasksId = params?.ganttTasksId;
    } else if (params?.ganttId) {
    //  operationLog.ganttId = params?.ganttId;
    } else {
      return false;
    }

    if (params.changes && Object.keys(params.changes).length > 0) {
      const newLogChanges: Array<{ [key: string]: ganttLogChanges }> = [];
      if (operationLog.changes) {
        const Orichanges = JSON.parse(JSON.stringify(operationLog.changes));
        for (let change of params.changes) {
          const changedKey = Object.keys(change)[0];
          const lastChange = Orichanges.find((e: any) => e[changedKey])
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
            change[changedKey].originalValue = lastChange.originalValue;
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

  async syncLogSave(
    params: ganttLogParams,
    queryRunner: QueryRunner,
  ): Promise<Boolean> {
    if (!params?.user?.id && !params?.ganttId && !params?.requestId && !params?.revision) { return false; }
    let operationLog = new GanttLog();
    operationLog.action = params.action;
    //operationLog.ganttId = params.ganttId;
    operationLog.requestId = params.requestId;
    operationLog.revision = params.revision;

    if (params?.user?.id) {
      operationLog.userId = params.user.id;
    } else if (params?.ganttTasksId) {
     // operationLog.ganttTasksId = params?.ganttTasksId;
    } else if (params?.ganttId) {
     // operationLog.ganttId = params?.ganttId;
    } else {
      return false;
    }

    // if (params.ganttTasksId) operationLog.ganttTasksId = params.ganttTasksId;
    // if (params.ganttDependenciesId) operationLog.ganttDependenciesId = params.ganttDependenciesId;
    // if (params.ganttAssignmentsId) operationLog.ganttAssignmentsId = params.ganttAssignmentsId;

    if (params.changes && Object.keys(params.changes).length > 0) {
      const newLogChanges: Array<{ [key: string]: ganttLogChanges }> = [];
      if (operationLog.changes) {
        const Orichanges = JSON.parse(JSON.stringify(operationLog.changes));
        for (let change of params.changes) {
          const changedKey = Object.keys(change)[0];
          const lastChange = Orichanges.find((e: any) => e[changedKey])
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
            change[changedKey].originalValue = lastChange.originalValue;
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
      await queryRunner.manager.save(operationLog);
      return true;
    }

    return false;
  }

  async initGantt(
    data: any,
    project: Project,
  ): Promise<boolean> {

    const connection = getConnection();
    let queryRunner = connection.createQueryRunner();

    try {

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const record: Gantt | undefined = Gantt.create();
      record.projectId = project.id;
      record.startDate = data.startDate ? data.startDate : project.start ? project.start : moment().format('YYYY-MM-DD');
      record.calendarId = data.calendarId ?? DEFAULT_CALENDAR_ID;
      if (data.hoursPerDay) record.hoursPerDay = data.hoursPerDay;
      if (data.daysPerWeek) record.daysPerWeek = data.daysPerWeek;
      if (data.daysPerMonth) record.daysPerMonth = data.daysPerMonth;

      const newRecord = await queryRunner.manager.save(record);

      project.ganttId = newRecord.id;

      await queryRunner.manager.save(project);

      await queryRunner.commitTransaction();

    } catch (error: any) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
    return true;
  }

  async multiInitGantt(
    data: [any],
  ): Promise<boolean> {

    const connection = getConnection();
    let queryRunner = connection.createQueryRunner();

    try {

      await queryRunner.connect();
      await queryRunner.startTransaction();

      for (let row of data) {
        if (!row.projectId) throw new Error('Project ID required');
        const project = await this.projectRepository.findOne({ id: row.projectId });
        if (!project) throw new Error('Project not exists');
        if (project.ganttId) throw new Error('Project Gantt already exists');

        const record: Gantt | undefined = Gantt.create();
        record.projectId = project.id;
        record.startDate = row.startDate ? row.startDate : project.start;
        record.calendarId = row.calendarId ?? DEFAULT_CALENDAR_ID;
        if (row.hoursPerDay) record.hoursPerDay = row.hoursPerDay;
        if (row.daysPerWeek) record.daysPerWeek = row.daysPerWeek;
        if (row.daysPerMonth) record.daysPerMonth = row.daysPerMonth;

        const newRecord = await queryRunner.manager.save(record);

        project.ganttId = newRecord.id;

        await queryRunner.manager.save(project);
      }

      await queryRunner.commitTransaction();

    } catch (error: any) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
    return true;
  }

  async insertTasks(
    tasks: [{ [key: string]: any }],
    gantt: Gantt,
    user: any,
  ): Promise<boolean> {

    const connection = getConnection();
    let queryRunner = connection.createQueryRunner();

    let requestId = Math.floor(Math.random() * 1000000000).toString();
    let revision = gantt.revision + 1;

    const returnSubscriptionData: any = {
      tasks: {
        add: [],
        update: [],
        remove: [],
        move: [],
        appendRoot: [],
        append: [],
        insertChild: [],
        insertRoot: [],
        appendNew: [],
        rootNew: [],
        appendTree: [],
      },
      dependencies: {
        add: [],
        update: [],
        remove: [],
      },
      assignments: {
        add: [],
        update: [],
        remove: [],
      }
    };

    const colorType: {[key:string]: string} = {
      Default: '',
      Yellow: 'background:#FFEB3B;',
      Orange: 'background:#FF9966;',
      Red: 'background:#E74C3C;',
      Purple: 'background:#8E44AD;',
      Gray: 'background:#BDC3C7;',
    };

    try {

      const createSubtasks = async (queryRunner: any, ganttId: any, returnSubscriptionData: any, row: any, target: any, subTasks: any, earlyDate: any, requestId: any, revision: any) => {
        let subTasksIndex: number = 0;
        let largeParenIndexTasks: GanttTasks | undefined = undefined;

        for (let subRow of subTasks) {

          //from current tree
          const subTarget = await this.ganttTasksRepository.findOne({
            ganttId: gantt.id,
            name: subRow.name,
            parentId: target.id,
            isDeleted: 0,
          });

          const newSubRecord: GanttTasks | undefined = GanttTasks.create();

          if (subTarget === undefined) {
            largeParenIndexTasks = await this.ganttTasksRepository.createQueryBuilder('parent_index')
              .where({
                ganttId: gantt.id,
                parentId: target.id,
                isDeleted: 0,
              })
              .orderBy({
                'parent_index': 'DESC',
              })
              .getOne();

            if (largeParenIndexTasks) {
              subTasksIndex += (largeParenIndexTasks.parentIndex ?? 0) + 1;
            } else {
              subTasksIndex = 0;
            }

            newSubRecord.ganttId = ganttId
            newSubRecord.parentId = target.id;
            newSubRecord.name = subRow.name;
            newSubRecord.nameEng = subRow.nameEng || '';
            newSubRecord.parentIndex = subTasksIndex;

            if (subRow.startDate) {
              newSubRecord.startDate = subRow.startDate;
            } else if (subRow.duration) {
              newSubRecord.duration = subRow.duration;
            } else {
              newSubRecord.startDate = earlyDate;
              newSubRecord.duration = 1;
            }
            if (subRow.endDate) {
              newSubRecord.endDate = subRow.endDate;
            }
            if (subRow.color) {
              newSubRecord.style = (subRow.color in colorType)?colorType[subRow.color]:'';
            }
            await queryRunner.manager.save(newSubRecord);

            let newObj: any = {
              id: toGlobalId(GanttTasks.name, newSubRecord.id),
              name: newSubRecord.name,
              nameEng: newSubRecord.nameEng,
              parentIndex: newSubRecord.parentIndex,
            };
            if (newSubRecord.startDate) {
              newObj.startDate = newSubRecord.startDate;
            }
            if (newSubRecord.duration) {
              newObj.duration = newSubRecord.duration;
            }
            if (newSubRecord.endDate) {
              newObj.endDate = newSubRecord.endDate;
            }
            if (newSubRecord.style) {
              newObj.style = newSubRecord.style;
            }

            returnSubscriptionData.tasks.appendNew.push({
              from: newObj,
              to: toGlobalId(GanttTasks.name, target.id)
            });

            const assignments = subRow?.assignments??[];

            for (let row of assignments) {
              let record: GanttAssignments | undefined;
              record = GanttAssignments.create();

              record.ganttId = gantt.id;

              record.eventId = newSubRecord.id;

              const staff: User | undefined = await this.userRepository.findOne({username:row});
              if (!staff) throw new Error('Username not found');
              record.staffId = staff.id;

              const newRecord = await queryRunner.manager.save(record);
              const newId = toGlobalId(GanttAssignments.name, newRecord.id);
              returnSubscriptionData.assignments.add.push({
                $PhantomId: newId,
                id: newId,
                event: toGlobalId(GanttTasks.name, record.eventId),
                resource: record.staffId,
              });
            }

          }

          if (subRow.subTasks) await createSubtasks(queryRunner, gantt.id, returnSubscriptionData, row, (subTarget ? subTarget : newSubRecord), subRow.subTasks, earlyDate, requestId, revision);
        }
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const earlyData = await this.ganttTasksRepository.createQueryBuilder('start_date')
        .where({
          ganttId: gantt.id,
          parentId: null,
          isDeleted: 0,
        })
        .orderBy({
          'start_date': 'ASC',
        })
        .getOne();
      const earlyDate = earlyData?.startDate ?? moment().toDate();

      let rootLargeIndex: number = 0;

      for (let row of tasks) {

        const subTasks = row.subTasks;

        const target = await this.ganttTasksRepository.findOne({
          ganttId: gantt.id,
          name: row.name,
          isDeleted: 0,
        });

        const newRecord: GanttTasks | undefined = GanttTasks.create();

        if (!target) {

          newRecord.ganttId = gantt.id;

          newRecord.name = row.name;
          newRecord.nameEng = row.nameEng || '';

          if (row.startDate) {
            newRecord.startDate = row.startDate;
          } else if (row.duration) {
            newRecord.startDate = earlyDate;
            newRecord.duration = row.duration;
          } else {
            newRecord.startDate = earlyDate;
            newRecord.duration = 1;
          }
          if (row.endDate) {
            newRecord.endDate = row.endDate;
          }
          if (row.color) {
            newRecord.style = (row.color in colorType)?colorType[row.color]:'';
          }
          let rootLargeIndexRecord = await this.ganttTasksRepository.createQueryBuilder('parent_index')
            .where({
              ganttId: gantt.id,
              parentId: null,
              isDeleted: 0,
            })
            .orderBy({
              'parent_index': 'DESC',
            })
            .getOne();

          if (rootLargeIndexRecord) {
            newRecord.parentIndex = (rootLargeIndexRecord.parentIndex ?? 0) + 1;
            rootLargeIndex = newRecord.parentIndex;
          } else {
            newRecord.parentIndex = 0;
          }

          await queryRunner.manager.save(newRecord);

          let newObj: any = {
            id: toGlobalId(GanttTasks.name, newRecord.id),
            name: newRecord.name,
            nameEng: newRecord.nameEng,
            parentIndex: newRecord.parentIndex,
          };
          if (newRecord.startDate) {
            newObj.startDate = newRecord.startDate;
          }
          if (newRecord.duration) {
            newObj.duration = newRecord.duration;
          }
          if (newRecord.endDate) {
            newObj.endDate = newRecord.endDate;
          }
          if (newRecord.style) {
            newObj.style = newRecord.style;
          }
          returnSubscriptionData.tasks.rootNew.push({ from: newObj });

          const assignments = row?.assignments??[];

          for (let row of assignments) {
            let record: GanttAssignments | undefined;
            record = GanttAssignments.create();

            record.ganttId = gantt.id;

            record.eventId = newRecord.id;

            const staff: User | undefined = await this.userRepository.findOne({username:row});
            if (!staff) throw new Error('Username not found');
            record.staffId = staff.id;

            const newAssign = await queryRunner.manager.save(record);
            const newId = toGlobalId(GanttAssignments.name, newAssign.id);
            returnSubscriptionData.assignments.add.push({
              $PhantomId: newId,
              id: newId,
              event: toGlobalId(GanttTasks.name, record.eventId),
              resource: record.staffId,
            });
          }

        }

        await createSubtasks(queryRunner, gantt.id, returnSubscriptionData, row, (target ? target : newRecord), subTasks, earlyDate, requestId, revision);

        //update revision + 1
        gantt.revision = revision;
        await queryRunner.manager.save(gantt);

      }

      await queryRunner.commitTransaction();

      this.pubSub.publish('onGanttChange', {
        mutation: MutationType.CREATED,
        node: gantt,
        updatedTime: moment().format('YYYY-MM-DD HH:MM:SS'),
        requestId: requestId,
        appUUID: 'system_add_tasks',
        operateUser: 'CMS_user',
        returnSubscriptionData: JSON.stringify(returnSubscriptionData),
      });
    } catch (error: any) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
      throw new Error(error.message);
    } finally {
      await queryRunner.release();
    }
    return true;
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

  private pendingIds: { [key: string]: Array<string> } = {};

  async handleChangesList(jsonData: JSON) {
    let data: Array<{ [key: string]: ganttLogChanges }> = JSON.parse(JSON.stringify(jsonData));

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
    data: Array<{ [key: string]: ganttLogChanges }>,
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
    data: Array<{ [key: string]: ganttLogChanges }>
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

  async getColumnConfig(
    currentUser: LoggedInUser,
  ): Promise<GanttColumnConfigPayload> {
    try {
      return {
        ganttColumnConfig: currentUser?.id ? await this.ganttColumnConfigRepository.findOne({ staffId: currentUser.id }) : undefined
      };
    } catch (error) {
      return {};
    }
  }

  async ganttColumnConfigSave(
    data: GanttColumnConfigSaveInput,
    currentUser: LoggedInUser,
  ): Promise<GanttColumnConfigSavePayload> {
    try {
      const configData: ganttColumnConfigParams = data.config;
      if (Object.keys(configData).length !== 10) throw new Error('data error');
      const config = JSON.parse(COLUMN_CONFIG_KEY);
      if (config?.length) {
        for (const e of config) {
          if (!(e in configData)) throw new Error('Error key');
        }
      }
      if (!Object.keys(configData).find((key: string) => configData[key] === true)) throw new Error('At least have one set true');
      let ganttColumnConfig : GanttColumnConfig | undefined;
      ganttColumnConfig = await this.ganttColumnConfigRepository.findOne({ staffId: currentUser.id });
      if (!ganttColumnConfig) {
        ganttColumnConfig = new GanttColumnConfig();
        ganttColumnConfig.staffId = currentUser.id;
      }
      ganttColumnConfig.config = JSON.parse(JSON.stringify(data.config));
      return {
        userErrors: [],
        ganttColumnConfig: await ganttColumnConfig.save()
      };
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: ['id'],
        }],
      };
    }
  }

  async ganttClone(
    data: GanttCloneInput,
    currentUser: LoggedInUser,
  ): Promise<GanttClonePayload> {

    const connection = getConnection();
    let queryRunner = connection.createQueryRunner();

    try {

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const toGantt = await this.ganttRepository.findOneOrFail({ id: fromGlobalId(data.toId).id });
      const toGanttTasks = await this.ganttTasksRepository.find({ ganttId: toGantt.id, isDeleted: false });
      if (toGanttTasks.length) throw new Error('Target Gantt not empty');
      const fromGantt = await this.ganttRepository.findOneOrFail({ id: fromGlobalId(data.fromId).id });

      toGantt.startDate = fromGantt.startDate;
      toGantt.calendarId = fromGantt.calendarId;

      toGantt.revision = toGantt.revision + 1;

      await queryRunner.manager.save(toGantt);

      const fromGanttTasks = await this.ganttTasksRepository.find({ ganttId: fromGantt.id, isDeleted: false });
      const fromGanttDependencies = await this.ganttDependenciesRepository.find({ ganttId: fromGantt.id, isDeleted: false });
      const fromGanttAssignments = await this.ganttAssignmentsRepository.find({ ganttId: fromGantt.id, isDeleted: false });

      const fromGanttTasksIds = fromGanttTasks.map(e => {
        return {
          oldId: e.id,
          newId: uuid(),
        }
      });

      const fromGanttTasksRoot = fromGanttTasks.filter(e => e.parentId === null);
      let fromGanttTasksSub = fromGanttTasks.filter(e => e.parentId !== null);
      let insertedIds: Array<string> = [];

      await queryRunner.manager.insert(GanttTasks, fromGanttTasksRoot.map(e => {
        e.ganttId = toGantt.id;
        e.createdAt = new Date();
        e.updatedAt = new Date();
        e.id = fromGanttTasksIds.find(f => f.oldId === e.id)?.newId!;
        insertedIds.push(e.id);
        return e;
      }));

      while (fromGanttTasksSub.length) {
        //if parent not exists, skip and move to last
        let parentId = fromGanttTasksIds.find(f => f.oldId === fromGanttTasksSub[0].parentId)?.newId;
        if (parentId && !insertedIds.includes(parentId)) {
          fromGanttTasksSub.push(fromGanttTasksSub.shift()!);
          continue;
        }
        const sub = fromGanttTasksSub.shift()!;
        sub.ganttId = toGantt.id;
        sub.createdAt = new Date();
        sub.updatedAt = new Date();
        sub.id = fromGanttTasksIds.find(f => f.oldId === sub.id)?.newId!;
        sub.parentId = fromGanttTasksIds.find(f => f.oldId === sub.parentId)?.newId || undefined;
        insertedIds.push(sub.id);
        await queryRunner.manager.save(sub);
      }

      await queryRunner.manager.insert(GanttDependencies, fromGanttDependencies.map(e => {
        e.id = uuid();
        e.ganttId = toGantt.id;
        e.fromEventId = fromGanttTasksIds.find(f => f.oldId === e.fromEventId)?.newId!;
        e.toEventId = fromGanttTasksIds.find(f => f.oldId === e.toEventId)?.newId!;
        return e;
      }));

      await queryRunner.manager.insert(GanttAssignments, fromGanttAssignments.map(e => {
        e.id = uuid();
        e.ganttId = toGantt.id;
        e.eventId = fromGanttTasksIds.find(f => f.oldId === e.eventId)?.newId!;
        return e;
      }));

      await queryRunner.commitTransaction();

      return {
        userErrors: [],
        result: true,
      }
    } catch (error: any) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
      return {
        userErrors: [{
          message: error.message,
          field: ['id'],
        }],
        result: false,
      };
    } finally {
      await queryRunner.release();
    }
  }
}

export interface ganttColumnConfigParams {
  [key: string]: boolean,
}

interface ganttLogParams {
  user?: LoggedInUser | null,
  ganttId: string,
  ganttTasksId?: string | null,
  ganttDependenciesId?: string | null,
  ganttAssignmentsId?: string | null,
  action: OperationAction,
  changes?: Array<{ [key: string]: ganttLogChanges }> | null,
  requestId: string,
  revision: number,
}

interface ganttShareParams {
  ganttId: string,
}
