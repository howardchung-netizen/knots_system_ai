import { Service } from 'typedi';
import moment from 'moment';
import path from 'path';

@Service()
export class FileService {
  constructor(
  ) {}

  async getFilePath(
    filePath: string
  ): Promise<string> {
    try {
      const filename = filePath.split('/')?.[3];
      const folder = filePath.split('/')?.[2];
      const match = filename.match(/^(\d+)-.+$/);
      if (!match) throw new Error(`Invalid request data when getting storage file, invalid "filename": ${filename}.`);
      const fileTime = moment(parseInt(match[1]));
      const realFilePath = path.join(__dirname, '..', '..', '..', 'storage', folder, fileTime.format('YYYY'), fileTime.format('MMDD'), filename)
      return realFilePath;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
