import { Enforcer } from "casbin";
import path from 'path';
import { Request, Response } from 'express';
import { fromGlobalId } from "graphql-relay";
import { Container } from "typedi";
import { getConnection, getRepository } from 'typeorm';
import moment from 'moment-timezone';
import { WEM_DATABASE_POS_OFFLINE_SUPPLEMENT_NAME } from '../../lib/config';
import { logger } from '../../lib/logger';
import { PermissionAction } from "../admin/action/action.type";
import { User } from "../user/user.entity";
import { env } from "process";
import { Contact } from "../contact/contact.entity";
import { TaskService } from "./task.service";
import rp from 'request-promise';

export class TaskController {
	static async workdone(request: Request, response: Response, enforcer: Enforcer): Promise<boolean> {
		try {
			console.log(request.query, request.body);
			const messages:Array<{ [key: string]: any }> = request.body.messages;
			if(Array.isArray(request.body.messages)){
				for(let message of request.body.messages){
					let contact: Contact | undefined;
					let user: User | undefined;
					user = await getRepository(User).findOne({whatsApp: message?.author.split('@')[0]});
					if(!user){
						contact = await getRepository(Contact).findOne({tel: message?.author.split('@')[0]});
					}
					if(!user && !contact) return await this.responseError(response, 404, '');
					const taskService: TaskService = Container.get(TaskService);
					const res = await taskService.whatsAppConfirmTask({id: message.body}, user ,contact,enforcer)
					if(res){
						await rp.post('https://api.1msg.io/374983/sendMessage?token=uc0fpad7uuau1r9w',
								{
									json: true,
									body: {
										"phone": message?.author.split('@')[0],
										"body": '成功更新任務進度'
									}
								},
						)
						await response
						.status(200)
						.send(true)
						.end();
						return true;
					}
				}
			}
			return await this.responseError(response, 500, '');
    } catch (error: any) {
      logger.error(error);
      return await this.responseError(response, 500, '');
    }
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
