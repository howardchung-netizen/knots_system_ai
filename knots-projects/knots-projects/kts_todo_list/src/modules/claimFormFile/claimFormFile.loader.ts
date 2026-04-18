import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { ClaimFormFile } from './claimFormFile.entity';

export const claimFormFileLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const claimFormFiles = await ClaimFormFile.find({
      claimFormId: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: Array<ClaimFormFile> } = {};
    claimFormFiles.forEach(u => {
      if (!(u.claimFormId! in map)) {
        map[u.claimFormId!] = [];
      }
      map[u.claimFormId!].push(u);
    });
    return keys.map(k => map[k]);
  });

