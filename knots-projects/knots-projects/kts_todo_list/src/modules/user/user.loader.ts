import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { User } from './user.entity';

export const userLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const users = await User.findByIds([...keys]);
    const map: { [key: string]: User } = {};
    users.forEach(u => {
      map[u.id] = u;
    });

    return keys.map(k => map[k]);
  });
