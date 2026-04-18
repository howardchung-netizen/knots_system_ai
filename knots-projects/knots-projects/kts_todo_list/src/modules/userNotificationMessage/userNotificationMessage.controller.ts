import {Enforcer} from "casbin";
import {Request, Response} from 'express';
import {Container} from "typedi";
import {getRepository} from "typeorm";
import {authChecker} from "../../lib/authChecker";
import {logger} from '../../lib/logger';
import {PermissionAction} from "../admin/action/action.type";
import {ServiceAccount} from "../serviceAccount/serviceAccount.entity";
import {UserNotificationMessage} from "./userNotificationMessage.entity";
import {UserNotificationMessageService} from "./userNotificationMessage.service";

export class UserNotificationMessageController {
  static async userNotificationMessageBatchSend(request: Request, response: Response, enforcer: Enforcer): Promise<boolean> {
    try {

      const user = (request as any).user;
      if (!user) {
        return await this.responseError(response, 401, 'Authorization required');
      }
      if (user.loginUserType !== ServiceAccount.name) {
        return await this.responseError(response, 401, 'Invalid Token');
      }
      const serviceAccount = await getRepository(ServiceAccount).findOne(user.id);
      if (!serviceAccount) {
        return await this.responseError(response, 401, 'Invalid Token');
      }
      if (!await authChecker(
        { context: { req: request, serviceAccount: serviceAccount, enforcer: enforcer }} as any,
        [`${UserNotificationMessage.name}:${PermissionAction.CREATE}`],
        )) {
        return await this.responseError(response, 401, 'Invalid Token');
      }

      if (!request.body.userIds || !Array.isArray(request.body.userIds) || request.body.userIds.length === 0) {
        return await this.responseError(response, 422, 'Invalid userIds');
      }

      if ((!request.body.content || !request.body.shortContent) && !request.body.templateKey) {
        return await this.responseError(response, 422, 'content & shortContent or templateKey required');
      }

      const userNotificationMessageService: UserNotificationMessageService = Container.get(UserNotificationMessageService);

      response.status(200).send(await userNotificationMessageService.batchSend(request.body));

    } catch (error: any) {
      logger.error(error);
      return await this.responseError(response, 500, '');
    }

    return true;
  }

  static async responseError(response: Response, httpStatusCode: number, errorMessage: string): Promise<boolean> {
    if (!errorMessage) {
      response.status(httpStatusCode).end();
    } else {
      response.status(httpStatusCode).send(errorMessage);
    }
    return false;
  }
}
