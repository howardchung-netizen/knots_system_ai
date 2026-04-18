import {Request} from 'express';
import moment from 'moment-timezone';
import {EXPORT_PDF_ENDPOINT, isProduction} from './config';
import path from 'path';

export const getAppInfo = (req: Request) => {
  const appInfo = {
    appName: '',
    appVersion: '',
    appEnv: '',
    appPlatform: '',
    appPlatformVersion: '',
    deviceModel: '',
  };

  if (req?.headers && req.headers['user-agent']) {
    const match = req.headers['user-agent'].match(/^([^\/\s]+)\/([^\s]+)\s+\(([^\)\s]+)\)\s+([^\/\s]+)\/([^\s]+)\s+(.+)$/);
    if (match) {
      appInfo.appName = match[1];
      appInfo.appVersion = match[2];
      appInfo.appEnv = match[3];
      appInfo.appPlatform = match[4];
      appInfo.appPlatformVersion = match[5];
      appInfo.deviceModel = match[6];
    }
  }

  return appInfo;
}

export const getAppLocale = (locale: any) => {
  switch (locale) {
    case 'zh_Hant':
      return 'zh-HK';
    default:
      return 'zh-HK';
  }
}

export const getUrl = (req: Request, path: string, folder: string, id: string, updatedAt: Date, fileType?: string) => {
  return !req || path.indexOf('://') >= 0 ? path : isProduction ? `${EXPORT_PDF_ENDPOINT}/storage/${folder}/${id}?v=${updatedAt.getTime()}${fileType?`&${fileType}`:''}` : `${req.protocol}://${req.headers.host}/storage/${folder}/${id}?v=${updatedAt.getTime()}${fileType?`&${fileType}`:''}`;
}

export const getFolder = (fileName: string | undefined) => {
  try {
    if (!fileName) return '';
    const folders = fileName.split('/');
    const folder = folders[folders?.length - 2];
    return folder;
  } catch (error: any) {
    return '';
  }
}

export const roundNumber = (num: number, decimalNumber: number, upDown: 'up' | 'down') => {
  const rate = Math.pow(10, decimalNumber);
  return upDown === 'up' ? Math.round(num * rate) / rate : Math.floor(num * rate) / rate;
}

export function dataUrlToFile(dataUrl: string, filename: string): any {
  const arr = dataUrl.split(',');
  if (arr.length < 2) { return undefined; }
  const mimeArr = arr[0].match(/:(.*?);/);
  if (!mimeArr || mimeArr.length < 2) { return undefined; }
  const mime = mimeArr[1];
  const buff = Buffer.from(arr[1], 'base64');
  const extention = mime.split('/')[1]
  const name = filename+'.'+extention
  return { mimeType: mime , buffer: buff, filename : name, extention: extention}
}

export const getRealFilePath = (filePath: string): string => {
  const filename = filePath.split('/')?.[3];
  const fileFolder = filePath.split('/')?.[2];
  const match = filename.match(/^(\d+)-.+$/);
  if (!match) throw new Error(`Invalid request data when getting storage file, invalid "filename": ${filename}.`);
  const fileTime = moment(parseInt(match[1]));
  return path.join(__dirname, '..', '..', 'storage', fileFolder, fileTime.format('YYYY'), fileTime.format('MMDD'), decodeURIComponent(filename));
}
