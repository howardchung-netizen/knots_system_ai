import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { ClockInContactFile } from './clockInContactFile.entity';

export const clockInContactFileByTelLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const clockInContactFiles = await ClockInContactFile.find({
      tel: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: Array<ClockInContactFile> } = {};
    clockInContactFiles.forEach(u => {
      if (!(u.tel! in map)) {
        map[u.tel!] = [];
      }
      map[u.tel!].push(u);
    });
    return keys.map(k => map[k]);
  });

