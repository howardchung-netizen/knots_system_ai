import DataLoader from 'dataloader';
import { Contact } from './contact.entity';

export const contactLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    console.log('call contact Loader',keys)
    const users = await Contact.findByIds([...keys]);

    const map: { [key: string]: Contact } = {};
    users.forEach(u => {
      map[u.id] = u;
    });

    return keys.map(k => map[k]);
  });
