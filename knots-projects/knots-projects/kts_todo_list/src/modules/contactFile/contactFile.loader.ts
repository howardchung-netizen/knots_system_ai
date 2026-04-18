import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { ContactFile } from './contactFile.entity';

export const contactFileByIdLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const contactFiles = await ContactFile.find({
      contactId: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: Array<ContactFile> } = {};
    contactFiles.forEach(u => {
      if (!(u.contactId! in map)) {
        map[u.contactId!] = [];
      }
      map[u.contactId!].push(u);
    });
    return keys.map(k => map[k]);
  });

