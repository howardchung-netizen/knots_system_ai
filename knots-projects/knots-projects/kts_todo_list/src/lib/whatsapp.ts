import rp from 'request-promise';
import { logger } from './logger';
import { WHATSAPP_META_PHONE_NUMBER_ID, WHATSAPP_META_APP_ID, WHATSAPP_META_APP_SECRET } from './config';
import { Service, Inject, Container } from 'typedi';
import { AppSettingService } from '../modules/appSetting/appSetting.service';
import { toGlobalId } from 'graphql-relay';

interface WhatsAppMessageParams {
  to: string;
  templateName: string;
  languageCode: string;
  components?: any[];
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

@Service()
export class WhatsAppService {
  private phoneNumberId: string;
  private version: string;
  private isRefreshing: boolean;
  private readonly TOKEN_EXPIRY_DAYS = 60; // Meta tokens typically expire in 60 days

  constructor(
    @Inject(() => AppSettingService) private readonly appSettingService: AppSettingService
  ) {
    if (!WHATSAPP_META_PHONE_NUMBER_ID) {
      throw new Error('WhatsApp phone number ID not configured');
    }
    this.phoneNumberId = WHATSAPP_META_PHONE_NUMBER_ID;
    this.version = 'v17.0';
    this.isRefreshing = false;
  }

  private async getToken(): Promise<string> {
    try {
      const tokenSetting = await this.appSettingService.getObjectByKey('facebook_meta_token');
      if (!tokenSetting) {
        throw new Error('WhatsApp token not found in app settings');
      }
      return tokenSetting.value!;
    } catch (error: any) {
      logger.error(`Failed to get WhatsApp token: ${error.message}`);
      throw error;
    }
  }

  private async getHeaders() {
    const token = await this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private getBaseUrl() {
    return `https://graph.facebook.com/${this.version}/${this.phoneNumberId}`;
  }

  private async refreshToken(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }

    try {
      this.isRefreshing = true;

      const currentToken = await this.getToken();

      const response = await rp.get(`https://graph.facebook.com/oauth/access_token`, {
        json: true,
        qs: {
          grant_type: 'fb_exchange_token',
          client_id: WHATSAPP_META_APP_ID,
          client_secret: WHATSAPP_META_APP_SECRET,
          fb_exchange_token: currentToken
        }
      }) as TokenResponse;

      logger.info('Received new token from Meta, updating app settings...');

      const tokenSetting = await this.appSettingService.getObjectByKey('facebook_meta_token');
      if (!tokenSetting) {
        await this.appSettingService.create({
          key: 'facebook_meta_token',
          description: 'WhatsApp token',
          value: response.access_token,
          public: false
        });
      } else {
        await this.appSettingService.update({
          id: toGlobalId('AppSetting', tokenSetting.id),
          key: 'facebook_meta_token',
          description: 'WhatsApp token',
          value: response.access_token,
          public: false
        });
      }

      const expiryValue = new Date(Date.now() + (this.TOKEN_EXPIRY_DAYS - 1) * 24 * 60 * 60 * 1000).toISOString();

      const expirySetting = await this.appSettingService.getObjectByKey('facebook_meta_token_expiry');

      if (!expirySetting) {
        await this.appSettingService.create({
          key: 'facebook_meta_token_expiry',
          description: 'WhatsApp token expiry date',
          value: expiryValue,
          public: false
        });
      } else {
        await this.appSettingService.update({
          id: toGlobalId('AppSetting', expirySetting.id),
          key: 'facebook_meta_token_expiry',
          value: expiryValue,
          public: false
        });
      }

      logger.info('WhatsApp token refreshed successfully');
    } catch (error: any) {
      const errorMessage = error.error?.error?.message || error.message;
      logger.error(`Failed to refresh WhatsApp token: ${errorMessage}`);
      logger.error('Full error:', error);
      throw new Error(`Token refresh failed: ${errorMessage}`);
    } finally {
      this.isRefreshing = false;
    }
  }

  private async ensureValidToken(): Promise<void> {
    try {
      const tokenExpiry = await this.appSettingService.getValueByKey('facebook_meta_token_expiry', null);
      if (!tokenExpiry) {
        logger.info('No token expiry found, refreshing token...');
        await this.refreshToken();
        return;
      }

      const expiryTime = new Date(tokenExpiry).getTime();
      const now = Date.now();

      if (expiryTime <= now) {
        logger.info(`Token expired at ${new Date(expiryTime).toISOString()}, refreshing...`);
        await this.refreshToken();
      } else {
        logger.info(`Token valid until ${new Date(expiryTime).toISOString()}`);
      }
    } catch (error: any) {
      logger.error(`Failed to check token validity: ${error.message}`);
      throw error;
    }
  }

  async sendTemplateMessage({ to, templateName, languageCode, components }: WhatsAppMessageParams): Promise<boolean> {
    try {
      await this.ensureValidToken();
      logger.info(`Sending template message '${templateName}' to ${to}`);

      // Remove any non-numeric characters and add WhatsApp prefix
      const formattedNumber = to.replace(/\D/g, '');

      const response = await rp.post(
        `${this.getBaseUrl()}/messages`,
        {
          json: true,
          headers: await this.getHeaders(),
          body: {
            messaging_product: "whatsapp",
            to: formattedNumber,
            type: "template",
            template: {
              name: templateName,
              language: {
                code: languageCode
              },
              components: components
            }
          }
        }
      );

      logger.info(`WhatsApp message sent successfully to ${to}`);
      return true;
    } catch (error: any) {
      const errorMessage = error.error?.error?.message || error.message;
      logger.error(`Error sending WhatsApp message to ${to}: ${errorMessage}`);
      logger.error('Full error:', error);
      return false;
    }
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing WhatsApp service...');
      const tokenSetting = await this.appSettingService.getObjectByKey('facebook_meta_token');
      if (!tokenSetting) {
        throw new Error('WhatsApp token not found in app settings. Please add the token to app_setting table first.');
      }
      logger.info('WhatsApp service initialized successfully');
    } catch (error: any) {
      logger.error(`Failed to initialize WhatsApp service: ${error.message}`);
      throw error;
    }
  }
}

let whatsappService: WhatsAppService;

export const getWhatsAppService = async () => {
  if (!whatsappService) {
    whatsappService = Container.get(WhatsAppService);
    await whatsappService.initialize();
  }
  return whatsappService;
};
