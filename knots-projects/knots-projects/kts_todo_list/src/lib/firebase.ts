import admin from "firebase-admin";
import {logger} from "./logger";

export interface FireBaseParam {
  data?: { [key: string]: string },
  title?: string,
  body: string,
  tokens: string[],
}

/**
* @param {string} param.title - Title
* @param {string} param.body - Content
* @param {Array} param.tokens - User Tokens (up to 500)
* @param {Object} param.data - Custom data for notification
* @param {string} data.path - App Path
* @param {string} data.type - Messaage Type
*/
export async function firebaseMessageSend(param: FireBaseParam): Promise<{
  success: string[],
  fail: string[],
}> {
  let successTokens: string[] = [];
  let failedTokens: string[] = [];
  try {
    const response = await admin.messaging().sendToDevice(
      param.tokens,
      {
        data: param.data || undefined,
        notification: {
          title: param.title || undefined,
          body: param.body,
        },
      },
      {
        contentAvailable: true,
        priority: "high",
      }
    );
    response.results.forEach((resp: any, idx) => {
      if (resp.error) {
        failedTokens.push(param.tokens[idx])
        logger.error(`Firebase sendToDevice of token that caused failure: ${param.tokens[idx]}, message: ${resp.error.errorInfo?.message || ''}`);
      } else {
        successTokens.push(param.tokens[idx]);
      }
    });
  } catch (error: any) {
    logger.error(`Cannnot send Firebase Message: ${error.message}`);
    logger.error(error);
    return {
      success: successTokens,
      fail: failedTokens,
    };
  }
  return {
    success: successTokens,
    fail: failedTokens,
  };
}
