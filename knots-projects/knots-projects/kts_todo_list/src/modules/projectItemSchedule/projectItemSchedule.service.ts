import { fromGlobalId } from 'graphql-relay';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ProjectItemScheduleRepository } from './projectItemSchedule.repository';
import { Enforcer } from 'casbin';
import { ProjectItemSchedulePayload } from './payload/projectItemSchedule.payload';
import { LoggedInUser } from '../shared/middleware/currentUser';
import { logger } from '../../lib/logger';
import { ProjectItemScheduleUpdateInput } from './input/projectItemScheduleUpdate.input';
import { ProjectItemSchedule } from './projectItemSchedule.entity';
import { uuid } from 'uuidv4';

@Service()
export class ProjectItemScheduleService {
  constructor(
    @InjectRepository()
    private readonly projectItemScheduleRepository: ProjectItemScheduleRepository,
  ) {
  }

  async scheduleUpdate(
    data: ProjectItemScheduleUpdateInput,
    user: LoggedInUser,
    enforcer: Enforcer
  ): Promise<ProjectItemSchedulePayload> {
    try {
      let projectItemSchedule: ProjectItemSchedule | undefined;
      projectItemSchedule = await this.projectItemScheduleRepository.findOne({
        itemId: Number(fromGlobalId(data.projectItemid).id),
      });
      if (!projectItemSchedule) {
        projectItemSchedule = this.projectItemScheduleRepository.create();
        projectItemSchedule.uuid = uuid();
        projectItemSchedule.createAt = Date.now();
      } else {
        projectItemSchedule.editAt = Date.now();
      }

      if (data.color) projectItemSchedule.color = data.color;

      if (data.schedules?.length) {
        let schedules: { id: number, duration?: number, name?: string, title?: string, title_en?: string }[] = [];
        data.schedules?.map((e, i) => {
          schedules.push({
            id: i + 1,
            name: i === 0 ? 'Schedule 1' : undefined,
            duration: e.duration,
            title: e.title,
            title_en: e.titleEn,
          });
        });
        projectItemSchedule.schedule = schedules.length ? JSON.stringify(schedules) : undefined;
      }

      return {
        projectItemSchedule: await projectItemSchedule.save(),
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
