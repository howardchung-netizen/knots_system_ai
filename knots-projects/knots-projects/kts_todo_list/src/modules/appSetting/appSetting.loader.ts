import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { AppSetting } from './appSetting.entity';

export const appSettingLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const appSettings = await AppSetting.find({ key: In([...keys]) });

    const map: { [key: string]: AppSetting } = {};
    appSettings.forEach(v => {
      map[v.key] = v;
    });

    return keys.map(k => map[k]);
  });
