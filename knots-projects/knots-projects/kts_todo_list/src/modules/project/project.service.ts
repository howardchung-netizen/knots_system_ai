import { connectionFromArraySlice, fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ProjectRepository } from './project.repository';
import { ProjectArgs } from './args/project.args';
import { ProjectConnection } from './connection/project.connection';
import { ProjectUpdateInput } from './input/projectUpdate.input';
import { Enforcer } from 'casbin';
import { ProjectPayload } from './payload/project.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { ProjectCreateInput } from './input/projectCreate.input';
import { logger } from '../../lib/logger';
import moment from 'moment-timezone';
import { ClientRepository } from '../client/client.repository';
import { ClientContactsRepository } from '../clientContacts/clientContacts.repository';
import { Brackets, getConnection, In } from 'typeorm';
import { ProjectTypeRepository } from '../projectType/projectType.repository';
import { ProjectStatusRepository } from '../projectStatus/projectStatus.repository';
import { ProjectSpotlightRepository } from '../projectSpotlight/projectSpotlight.repository';
import { ProjectHashtagRepository } from '../projectHashtag/projectHashtag.repository';
import { UserRepository } from '../user/user.repository';
import { uuid } from 'uuidv4';
import { QuotationRepository } from '../quotation/quotation.repository';
import { GanttRepository } from '../gantt/gantt.repository';
import { Gantt } from '../gantt/gantt.entity';
import { DEFAULT_CALENDAR_ID } from '../../lib/config';
@Service()
export class ProjectService {
  constructor(
    @InjectRepository()
    private readonly projectRepository: ProjectRepository,
    @InjectRepository()
    private readonly projectTypeRepository: ProjectTypeRepository,
    @InjectRepository()
    private readonly projectStatusRepository: ProjectStatusRepository,
    @InjectRepository()
    private readonly projectSpotlightRepository: ProjectSpotlightRepository,
    @InjectRepository()
    private readonly projectHashtagRepository: ProjectHashtagRepository,
    @InjectRepository()
    private readonly clientRepository: ClientRepository,
    @InjectRepository()
    private readonly clientContactsRepository: ClientContactsRepository,
    @InjectRepository()
    private readonly userRepository: UserRepository,
    @InjectRepository()
    private readonly quotationRepository: QuotationRepository,
    @InjectRepository()
    private readonly ganttRepository: GanttRepository,
  ) {
  }


  async getMany(args: ProjectArgs, extraArgs: { [index: string]: any } = {}): Promise<ProjectConnection> {
    const { limit, offset } = args.pagingParams();
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project_info');

    if (args.id) queryBuilder.andWhere('id = :id', { id: fromGlobalId(args.id).id });
    if (args.realId) queryBuilder.andWhere('id = :id', { id: args.realId });

    if (args.projectId) queryBuilder.andWhere('project_id = :projectId', { projectId: args.projectId });
    if (args.clientId) queryBuilder.andWhere(`client_id = :clientId`, { clientId: fromGlobalId(args.clientId).id });
    if (args.statusArray) {
      let statusArray = args.statusArray.map(e=> parseFloat(fromGlobalId(e.toString()).id));
      queryBuilder.andWhere('status IN (:...statusArray)', { statusArray: statusArray });
    }

    if (args.startDate || args.endDate) {
      const inputDateFormat = "YYYY-MM-DD";

      let startDate: string | undefined = undefined;
      let endDate: string | undefined = undefined;

      startDate = args.startDate;
      endDate = args.endDate;
      
      if (startDate && endDate) {
        queryBuilder
        .andWhere("start >= :startTime", {
          startTime: startDate,
        })
        .andWhere("end <= :endTime", {
          endTime: endDate,
        });
      }
      else if (startDate) {
        queryBuilder
        .andWhere("start >= :startTime", {
          startTime: startDate,
        })
      }
      else if (endDate) {
        queryBuilder
        .andWhere("end >= :endTime", {
          endTime: endDate,
        })
      }
    }

    if (args.keyword) {
      queryBuilder.andWhere(new Brackets(qb => {
          qb.where('code LIKE :keyword', { keyword: `%${args.keyword}%` })
            .orWhere('project_id LIKE :keyword', { keyword: `%${args.keyword}%` })
        }))
    }

    let orderBy: { [key: string]: "DESC" | "ASC" } = {
      "id": 'DESC',
    };

    if (args.order && args.sort) {
       orderBy = {
        [args.sort]: args.order as "DESC" | "ASC",
      };
    }

    queryBuilder.skip(offset).take(limit).orderBy({
      ...orderBy
    });

    const [projects, projectCount] = await queryBuilder.getManyAndCount();
    return {
      ...connectionFromArraySlice(projects, args, {
        arrayLength: projectCount,
        sliceStart: offset || 0,
      }),
      totalCount: projectCount,
    };
  }

  async create(
    data: ProjectCreateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectPayload> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const project = this.projectRepository.create();

      const isValidYear = moment({ year: data.year }).isValid();
      if (!isValidYear) throw new Error('Invalid year');
      project.uuid = uuid();
      project.year = data.year;
      const yearProjectCount = await this.projectRepository.count({ year: data.year });
      project.case = yearProjectCount + 1;
      project.projectId = Number(`${data.year}${String(project.case).padStart(4, '0')}`);
      project.code = data.code;
      const projecStatus = await this.projectStatusRepository.findOneOrFail({
        id: fromGlobalId(data.statusId).id,
      });
      project.statusId = Number(projecStatus.id);

      if (data.spotlight) {
        const projecSpotlight = await this.projectSpotlightRepository.findOneOrFail({
          hex: data.spotlight,
        });
        project.spotlight = projecSpotlight.hex;
      }
      const projectType = await this.projectTypeRepository.findOneOrFail({
        id: fromGlobalId(data.typeId).id,
      });
      project.pType = Number(projectType.id);
      project.start = moment(data.start, 'YYYY-MM-DD').format('YYYY-MM-DD');
      project.end = moment(data.end, 'YYYY-MM-DD').format('YYYY-MM-DD');
      project.remark = data.remark;

      if(data.address) project.address = data.address;
      else project.address = '';

      if (data.clientId) {
        const client = await this.clientRepository.findOneOrFail({
          id: fromGlobalId(data.clientId).id,
        });
        project.clientId = Number(client.id);
      }

      if (data.contactId) {
        const contact = await this.clientContactsRepository.findOneOrFail({
          id: fromGlobalId(data.contactId).id,
        });
        project.mainContactId = Number(contact.id);
      }

      if (data.hashtags && data.hashtags.length > 0) {
        const hashtags = await this.projectHashtagRepository.find({
          id: In(data.hashtags.map(e => fromGlobalId(e).id)),
        });
        if (hashtags.length !== data.hashtags.length) throw new Error('hashtags invalid');
        //project.hashtagsId = data.hashtags.map(e => fromGlobalId(e).id).join(',');
        project.hashtags = Promise.resolve(hashtags);
      }

      project.createAt = Date.now();

      await queryRunner.manager.save(project);

      const gantt = this.ganttRepository.create();
      gantt.projectId = project.id;
      gantt.startDate = project.start;
      gantt.calendarId = DEFAULT_CALENDAR_ID;

      await queryRunner.manager.save(gantt);

      project.ganttId = gantt.id;

      await queryRunner.manager.save(project);
      if (data.quotationId) {
        const quotation = await this.quotationRepository.findOneOrFail({
          id: fromGlobalId(data.quotationId).id,
        });
        quotation.projectId = project.projectId.toString();
        await queryRunner.manager.save(quotation);
      }

      await queryRunner.commitTransaction();

      return {
        project: project,
        userErrors: []
      };
    }
    catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error(error);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      }
    } finally {
      await queryRunner.release();
    }
  }

  async save(
    data: ProjectUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer,
  ): Promise<ProjectPayload> {
    try {
      const project = await this.projectRepository.findOneOrFail(fromGlobalId(data.id).id);

      if (data.code) project.code = data.code;
      if (data.statusId) {
        const projecStatus = await this.projectStatusRepository.findOneOrFail({
          id: fromGlobalId(data.statusId).id,
        });
        project.statusId = Number(projecStatus.id);
      }
      if (data.spotlight) {
        const projecSpotlight = await this.projectSpotlightRepository.findOneOrFail({
          hex: data.spotlight,
        });
        project.spotlight = projecSpotlight.hex;
      }
      if (data.typeId) {
        const projectType = await this.projectTypeRepository.findOneOrFail({
          id: fromGlobalId(data.typeId).id,
        })
        project.pType = Number(projectType.id);
      }
      if (data.start) project.start = moment(data.start, 'YYYY-MM-DD').format('YYYY-MM-DD');
      if (data.end) project.end = moment(data.end, 'YYYY-MM-DD').format('YYYY-MM-DD');
      if (data.remark) project.remark = data.remark;
      if (data.clientId) {
        const client = await this.clientRepository.findOneOrFail({
          id: fromGlobalId(data.clientId).id,
        });
        project.clientId = Number(client.id);
      }
      if (data.contactId != undefined) {
        const contact = await this.clientContactsRepository.findOneOrFail({
          id: fromGlobalId(data.contactId).id,
        });
        project.mainContactId = Number(contact.id);
      }

      if (data.albumShareToken) {
        project.albumShareToken = data.albumShareToken;
      }

      if (data.hashtags && data.hashtags.length > 0) {
        const hashtags = await this.projectHashtagRepository.find({
          id: In(data.hashtags.map(e => fromGlobalId(e).id)),
        });
        if (hashtags.length !== data.hashtags.length) throw new Error('hashtags invalid');
        //project.hashtagsId = data.hashtags.map(e => fromGlobalId(e).id).join(',');
        project.hashtags = Promise.resolve(hashtags);
      }

      if (data.managerId != undefined) {
        const staff = await this.userRepository.findOne({
          id: fromGlobalId(data.managerId).id,
        });
        if (!staff) throw new Error('Manager ID invalid');
        project.managerId = Number(staff.id);
      }

      if (data.assginess != undefined) {
        const staffs = await this.userRepository.find({
          id: In(data.assginess.map(e => fromGlobalId(e).id)),
        });
        if (staffs.length !== data.assginess.length) throw new Error('assginess invlid');
        project.assignee = Promise.resolve(staffs);
      }
      project.editAt = Date.now();

      return {
        project: await project.save(),
        userErrors: []
      };
    } catch (error: any) {
      logger.error(error.message);
      return {
        userErrors: [{
          message: error.message,
          field: [],
        }]
      };
    }
  }
}
