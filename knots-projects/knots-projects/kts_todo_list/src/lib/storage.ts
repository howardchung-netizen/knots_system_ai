import fileType from 'file-type';
import fs from 'fs';
import moment from 'moment-timezone';
import path from 'path';
import sharp from 'sharp';
import { registerEnumType } from 'type-graphql';
import { Upload } from '../modules/file/interface/upload.interface';
import { UploadPayload } from '../modules/file/payload/upload.payload';
import { logger } from './logger';
import { dataUrlToFile } from './utils';

export enum StorageFileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

registerEnumType(StorageFileType, {
  name: 'StorageFileType',
});

export const uploadToLocal = (
  {
    filename,
    mimetype,
    createReadStream,
  }: Upload,
  folder?: string,
  {
    imageResizeOptions,
    withThumbnail = false,
    thumbnailResizeOptions = {
      width: 720,
      height: 720,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    },
  }: {
    imageResizeOptions?: sharp.ResizeOptions,
    withThumbnail?: boolean,
    thumbnailResizeOptions?: sharp.ResizeOptions,
  } = {},
): Promise<UploadPayload> => {
  return new Promise(async (resolve, reject) => {
    try {
      const now = moment();
      const timestampedFileName = `${now.format('x')}-${encodeURIComponent(filename)}`;
      const saveFilePath = `${now.format('x')}-${filename}`;

      let filePath = path.join(__dirname, '..', '..', 'storage');
      if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

      if (!folder) folder = 'public';

      filePath = path.join(filePath, folder);
      if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

      filePath = path.join(filePath, now.format('YYYY'));
      if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

      filePath = path.join(filePath, now.format('MMDD'));
      if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

      filePath = path.join(filePath, saveFilePath);

      const returnFilePath = `/storage/${folder}/${timestampedFileName}`;

      const stream = await fileType.stream(createReadStream());

      let fileSize = 0;

      stream.on('error', error => { reject(error); });
      stream.on('data', chunk => {
        fileSize += chunk.length;
      });
      if (!!stream.fileType && !!stream.fileType.mime) mimetype = stream.fileType.mime;

      let type = StorageFileType.DOCUMENT;
      if (mimetype.startsWith('image/')) {
        type = StorageFileType.IMAGE;
      } else if (mimetype.startsWith('video/')) {
        type = StorageFileType.VIDEO;
      }

      if (type === StorageFileType.IMAGE && mimetype !== 'image/svg+xml' && imageResizeOptions) {
        let imageGenerator = sharp().resize(imageResizeOptions);
        stream.pipe(imageGenerator).pipe(fs.createWriteStream(filePath));
      } else {
        stream.pipe(fs.createWriteStream(filePath));
      }

      let returnThumbnailPath: string | undefined;
      if (withThumbnail && type === StorageFileType.IMAGE) {
        if (mimetype === 'image/svg+xml') {
          returnThumbnailPath = returnFilePath;
        } else {
          let extIndex = filePath.lastIndexOf('.');
          const thumbnailPath = filePath.substring(0, extIndex) + '.thumbnail' + filePath.substring(extIndex);
          extIndex = returnFilePath.lastIndexOf('.');
          returnThumbnailPath = returnFilePath.substring(0, extIndex) + '.thumbnail' + returnFilePath.substring(extIndex);

          let thumbnailGenerator = sharp().resize(thumbnailResizeOptions);

          stream.pipe(thumbnailGenerator).pipe(fs.createWriteStream(thumbnailPath));
        }
      }

      stream.on('end', () => {
        resolve({
          path: returnFilePath,
          mimeType: mimetype,
          type: type,
          fileSize: fileSize,
          thumbnailPath: returnThumbnailPath,
          filename: filename
        });
      });
    } catch (error: any) {
      logger.error(`Cannot upload file to local, error: ${error}`);
      logger.error(error);
      reject(error);
    }
  });
}

export const base64FileToLocal = (
  base64String: string,
  fileName: string,
  folder?: string,
  {
    imageResizeOptions,
    withThumbnail = false,
    thumbnailResizeOptions = {
      width: 720,
      height: 720,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    },
  }: {
    imageResizeOptions?: sharp.ResizeOptions,
    withThumbnail?: boolean,
    thumbnailResizeOptions?: sharp.ResizeOptions,
  } = {},
): Promise<UploadPayload> => {
  return new Promise(async (resolve, reject) => {
    try {
      
      let base64Image = base64String.split(';base64,').pop();
      let { mimeType, beffer, filename } = dataUrlToFile(base64String, fileName);

      const now = moment();
      const timestampedFileName = `${now.format('x')}-${encodeURIComponent(filename)}`;
      const saveFilePath = `${now.format('x')}-${filename}`;

      let filePath = path.join(__dirname, '..', '..', 'storage');
      if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

      if (!folder) folder = 'public';

      filePath = path.join(filePath, folder);
      if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

      filePath = path.join(filePath, now.format('YYYY'));
      if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

      filePath = path.join(filePath, now.format('MMDD'));
      if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

      filePath = path.join(filePath, saveFilePath);

      const returnFilePath = `/storage/${folder}/${timestampedFileName}`;

      let fileSize = 0;
      let type = StorageFileType.DOCUMENT;
      if (mimeType.startsWith('image/')) {
        type = StorageFileType.IMAGE;
      } else if (mimeType.startsWith('video/')) {
        type = StorageFileType.VIDEO;
      }

      let returnThumbnailPath: string | undefined;
      if (withThumbnail && type === StorageFileType.IMAGE) {
        if (mimeType === 'image/svg+xml') {
          returnThumbnailPath = returnFilePath;
        } else {
          let extIndex = filePath.lastIndexOf('.');
          const thumbnailPath = filePath.substring(0, extIndex) + '.thumbnail' + filePath.substring(extIndex);
          extIndex = returnFilePath.lastIndexOf('.');
          returnThumbnailPath = returnFilePath.substring(0, extIndex) + '.thumbnail' + returnFilePath.substring(extIndex);
        }
      }
      // fs.writeFileSync(returnFilePath, bitmap);
      fs.writeFile(filePath, base64Image ?? '', { encoding: 'base64' }, function (err) {
        if(err) throw Error(err.message);
        resolve({
          path: returnFilePath,
          mimeType: mimeType,
          type: type,
          fileSize: fileSize,
          thumbnailPath: returnThumbnailPath,
          filename: filename
        });
      });
    
    } catch (error: any) {
      logger.error(`Cannot upload file to local, error: ${error}`);
      logger.error(error);
      reject(error);
    }
  });
}

export const savePngToLocal = (filename: string, file: Uint8Array, folder?: string,
  ): Promise<UploadPayload> => {
    return new Promise(async (resolve, reject) => {
      try {
        const now = moment();
        const timestampedFileName = `${now.format('x')}-${encodeURIComponent(filename)}`;
        const saveFilePath = `${now.format('x')}-${filename}`;

        let filePath = path.join(__dirname, '..', '..', 'storage');
        if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

        if (!folder) folder = 'public';

        filePath = path.join(filePath, folder);
        if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

        filePath = path.join(filePath, now.format('YYYY'));
        if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

        filePath = path.join(filePath, now.format('MMDD'));
        if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

        filePath = path.join(filePath, saveFilePath);

        const returnFilePath = `/storage/${folder}/${timestampedFileName}`;

        await fs.promises.writeFile(filePath, file);

        const fileSizeInBytes = fs.statSync(filePath).size;

        resolve({
          path: returnFilePath,
          mimeType: 'image/x-png',
          type: StorageFileType.IMAGE,
          fileSize: fileSizeInBytes,
          thumbnailPath: undefined,
          filename: filename
        });
      } catch (error: any) {
        logger.error(`Cannot upload file to local, error: ${error}`);
        logger.error(error);
        reject(error);
      }
    });
  }

export const getUploadBase64 = (
  {
    createReadStream,
  }: Upload,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await fileType.stream(createReadStream());

      let chunks: any[] = [];

      stream.on('error', error => { reject(error); });
      stream.on('data', chunk => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        resolve('data:image/png;base64,' + Buffer.concat(chunks).toString('base64'));
      });
    } catch (error: any) {
      logger.error(`Cannot get image base64, error: ${error}`);
      logger.error(error);
      reject(error);
    }
  });
}

export const getRealFilePath = (filePath: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const filename = filePath.split('/')?.[3];
      const fileFolder = filePath.split('/')?.[2];
      const match = filename.match(/^(\d+)-.+$/);
      if (!match) throw new Error(`Invalid request data when getting storage file, invalid "filename": ${filename}.`);
      const fileTime = moment(parseInt(match[1]));
      resolve(path.join(__dirname, '..', '..', 'storage', fileFolder, fileTime.format('YYYY'), fileTime.format('MMDD'), decodeURIComponent(filename)));
    } catch (error: any) {
      logger.error(`Cannot get real file path, error: ${error}`);
      logger.error(error);
      reject(error);
    }
  });
}
