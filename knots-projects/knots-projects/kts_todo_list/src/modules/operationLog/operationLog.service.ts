import {connectionFromArraySlice, fromGlobalId, toGlobalId} from 'graphql-relay';
import moment from 'moment-timezone';
import {Enforcer} from 'casbin';
import {Inject, Service} from 'typedi';
import {EntityManager, getManager, getRepository} from 'typeorm';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {RoleService} from '../admin/role/role.service';
import {LoggedInUser} from '../shared/middleware/currentUser';
import {OperationLogArgs} from './args/operationLog.args';
import {OperationLogConnection} from './connection/operationLog.connection';
import {OperationLog, OperationObjectType} from './operationLog.entity';
import {OperationLogObjectUnion} from './union/operationLogObjectUnion';
import {OperationLogRepository} from './operationLog.repository';
import { DataAction, OperationAction } from '../task/task.entity';

@Service()
export class OperationLogService {
  constructor(
    @InjectRepository()
    private readonly OperationLogRepository: OperationLogRepository,
    @Inject(type => RoleService)
    private readonly roleService: RoleService,
  ) {
  }

  async getMany(args: OperationLogArgs, user?: LoggedInUser, enforcer?: Enforcer): Promise<OperationLogConnection> {
    const queryBuilder = getManager()
      .createQueryBuilder(OperationLog, "OperationLog");

    // check permission
    if (user && enforcer) {
      const roles = await this.roleService.getRoles(user.id, enforcer);
    }

    if (args.id) {
      queryBuilder.andWhere("id = :id", {
        id: fromGlobalId(args.id).id,
      });
    } else {
      if (args.action) {
        queryBuilder.andWhere("action = :action", {
          action: args.action,
        });
      }

      if (args.type) {
        queryBuilder.andWhere("object_type = :type", {
          type: args.type,
        });
      }

      if (args.shopId) {
        queryBuilder.andWhere("shop_id = :shopId", {
          shopId: fromGlobalId(args.shopId).id,
        });
      }

      if (args.userId) {
        queryBuilder.andWhere("user_id = :userId", {
          userId: fromGlobalId(args.userId).id,
        });
      }

      if (args.objectId) {
        queryBuilder.andWhere("object_id = :objectId", {
          objectId: fromGlobalId(args.objectId).id,
        });
      } else if (args.objectIds && args.objectIds.length > 0) {
        queryBuilder.andWhere("object_id IN (:...objectIds)", {
          objectIds: args.objectIds.map(id => fromGlobalId(id).id),
        });
      }

      if (args.date || args.startDate || args.endDate || args.startTime || args.endTime) {
        const inputDateFormat = "YYYY-MM-DD";
        const inputTimeFormat = "HH:mm:ss";

        let startDate: string | undefined = undefined;
        let endDate: string | undefined = undefined;
        if (
            args.startDate && moment(args.startDate, inputDateFormat, true).isValid() &&
            args.endDate && moment(args.startDate, inputDateFormat, true).isValid()
        ) {
          startDate = args.startDate;
          endDate = args.endDate;
        } else if (
            args.date && moment(args.date, inputDateFormat, true).isValid()
        ) {
          startDate = args.date;
          endDate = args.date;
        }

        let startTime: string | undefined = undefined;
        let endTime: string | undefined = undefined;
        if (
            args.startTime && moment(args.startTime, inputTimeFormat, true).isValid() &&
            args.endTime && moment(args.endTime, inputTimeFormat, true).isValid()
        ) {
          startTime = args.startTime;
          endTime = args.endTime;
        } else if (startDate && endDate && !args.startTime && !args.endTime) {
          startTime = '00:00:00';
          endTime = '23:59:59';
        }

        if (startDate && endDate && startTime && endTime) {
          queryBuilder
          .andWhere("created_at >= :startTime", {
            startTime: startDate + ' ' + startTime,
          })
          .andWhere("created_at <= :endTime", {
            endTime: endDate + ' ' + endTime,
          });
        }
      }
    }

    const {limit, offset} = args.pagingParams();

    const [operationLogs, operationLogCount] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      ...connectionFromArraySlice(operationLogs, args, {
        arrayLength: operationLogCount,
        sliceStart: offset || 0,
      }),
      totalCount: operationLogCount,
    };
  }

  async save(
    params: operationLogParams,
    manager?: EntityManager,
  ): Promise<Boolean> {
    if (!manager) manager = this.OperationLogRepository.manager;

    const operationLog = new OperationLog();
    const objectType = params.object.constructor.name as OperationObjectType;

    operationLog.userId = params.operator.id;
    operationLog.objectType = objectType;
    operationLog.objectId = params.object.id;
    operationLog.action = params.action;

    if (params.changes && Object.keys(params.changes).length > 0) {
      operationLog.changes = JSON.parse(JSON.stringify(params.changes));
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

  private pendingIds: { [key: string]: Array<string> } = {};

  async handleChangesList(jsonData: JSON) {
    let data: Array<{ [key: string]: operationLogChanges }> = JSON.parse(JSON.stringify(jsonData));

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
    data: Array<{ [key: string]: operationLogChanges }>,
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
          } else if (k === 'children') {
            data[i][n][k] = await this.getAllIds(kv);
          }
        }
      }
    }

    return data;
  }

  async handleIdsAndNames(
    entities: { [key: string]: any },
    data: Array<{ [key: string]: operationLogChanges }>
  ) {
    for (let i = 0; i < data.length; i++) {
      for (const [n, nv] of Object.entries(data[i])) {
        for (const [k, kv] of Object.entries(data[i][n])) {


          if ((k === 'originalId' || k === 'newId') && nv.entity) {
            if (k === 'newId' && kv in entities) {
              data[i][n]['name'] = entities[kv].name;
            }

            data[i][n][k] = toGlobalId(nv.entity, kv);
          } else if ((k === 'originalIds' || k === 'newIds') && nv.entity) {
            data[i][n].names = [];

            for (let j = 0; j < kv.length; j++) {
              if (k === 'newIds' && kv[j] in entities) {
                data[i][n].names!.push(entities[kv[j]].name);
              }

              data[i][n][k]![j] = toGlobalId(nv.entity, kv[j]);
            }
          } else if (k === 'children') {
            data[i][n][k] = await this.handleIdsAndNames(entities, kv);
          }
        }
      }
    }

    return data;
  }
}

interface operationLogParams {
  operator: LoggedInUser,
  object: typeof OperationLogObjectUnion,
  action: OperationAction,
  changes?: Array<{ [key: string]: operationLogChanges }> | null,
}

export interface operationLogChanges {
  entity?: string,
  action: DataAction,
  originalValue?: string | boolean | null,
  newValue?: string | boolean | null,
  originalId?: string,
  newId?: string,
  originalIds?: Array<string>,
  newIds?: Array<string>,
  name?: string,
  names?: Array<string>,
  children?: Array<{ [key: string]: operationLogChanges }>,
}