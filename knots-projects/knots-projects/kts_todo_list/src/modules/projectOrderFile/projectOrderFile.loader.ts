import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { ProjectOrderFile } from './projectOrderFile.entity';

export const projectOrderFileLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const projectOrderFiles = await ProjectOrderFile.find({
      projectOrderId: In([...keys]),
      deleted: false,
    });

    const map: { [key: string]: Array<ProjectOrderFile> } = {};
    projectOrderFiles.forEach(u => {
      if (!(u.projectOrderId! in map)) {
        map[u.projectOrderId!] = [];
      }
      map[u.projectOrderId!].push(u);
    });
    return keys.map(k => map[k]);
  });

