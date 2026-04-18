import { Enforcer } from "casbin";
import { Request, Response } from 'express';
import { Container } from "typedi";
import moment from 'moment-timezone';
import { logger } from '../../lib/logger';
import { getWhatsAppService } from "../../lib/whatsapp";
import { ClockInService } from "./clockIn.service";
import { APP_ENV, TODO_DEV_ENDPOINT, WHATSAPP_CLOCKIN_URL } from "../../lib/config";

interface ClockInWebHookData {
	qrCodeCreatedAt: Date;
	clockedInAt: Date;
	nonce: string;
	locationId: string;
}

export class ClockInController {
	static async clockedIn(request: Request, response: Response, enforcer: Enforcer): Promise<boolean> {
		try {
			logger.info('Received WhatsApp webhook:', request.body);

			// Verify if this is a WhatsApp webhook
			if (request.body.object === 'whatsapp_business_account') {
				// Handle verification request
				if (request.query['hub.mode'] === 'subscribe' && request.query['hub.verify_token']) {
					const verifyToken = request.query['hub.verify_token'];
					// Replace 'your_verify_token' with your actual verify token
					if (verifyToken === 'your_verify_token') {
						response.status(200).send(request.query['hub.challenge']);
						return true;
					}
					return await this.responseError(response, 403, 'Invalid verify token');
				}

				// Handle incoming messages
				if (request.body.entry && Array.isArray(request.body.entry)) {
					for (const entry of request.body.entry) {
						if (entry.changes && Array.isArray(entry.changes)) {
							for (const change of entry.changes) {
								if (change.value && change.value.messages && Array.isArray(change.value.messages)) {
									for (const message of change.value.messages) {
										//const tel = message?.author.split('@')[0];
										const tel = message.from;

										const nonce = message?.body.split(':')[1];
										const clockInService: ClockInService = Container.get(ClockInService);
										const res = await clockInService.saveByQrCode({
											tel: tel,
											nonce: nonce,
										});
										if (res.result) {
											// Send clock-in confirmation via WhatsApp template
											const whatsappService = await getWhatsAppService();
											try {
												await whatsappService.sendTemplateMessage({
													to: tel,
													templateName: 'clock_in_success',
													languageCode: 'zh_HK',
													components: [{
														type: 'body',
														parameters: [{
															type: 'text',
															text: moment().format("YYYY-MM-DD HH:mm:ss")
														}]
													}]
												});

												logger.info(`Sent clock-in confirmation to ${tel}`);
											} catch (error: any) {
												logger.error(`Failed to send WhatsApp message: ${error.message}`);
											}
										}
									}
								}
							}
						}
					}
				}

				// Acknowledge the webhook
				response.status(200).send('OK');
				return true;
			}

			return await this.responseError(response, 400, 'Invalid webhook source');
		} catch (error: any) {
			logger.error('Clock-in webhook error:', error);
			return await this.responseError(response, 500, '');
		}
	}

	static async qrCode(request: Request, response: Response, enforcer: Enforcer): Promise<boolean> {
		try {
			const nonce: any = request.params?.nonce;
			if (!nonce) throw new Error('Code required');
			const clockInService: ClockInService = Container.get(ClockInService);
			const result = await clockInService.scanQrCode(nonce);
			if (result) {
				response.redirect(`${WHATSAPP_CLOCKIN_URL}/85264433800?text=員工打卡Clock in:${nonce}`);
			}
			else throw new Error('Invalid nonce.');
			return true;
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
