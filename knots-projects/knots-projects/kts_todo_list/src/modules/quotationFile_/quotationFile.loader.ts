import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { QuotationFile } from './quotationFile.entity';

export const quotationFileByIdLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const quotationFiles = await QuotationFile.find({
      quotationId: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: Array<QuotationFile> } = {};
    quotationFiles.forEach(u => {
      if (!(u.quotationId! in map)) {
        map[u.quotationId!] = [];
      }
      map[u.quotationId!].push(u);
    });
    return keys.map(k => map[k]);
  });

