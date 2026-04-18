import DataLoader from "dataloader";
import { ClientContacts } from "./clientContacts.entity";

export const clientContactsByIdLoader = () =>
  new DataLoader(async (keys: readonly string[]) => {
    const datas = await ClientContacts.findByIds([...keys]);

    const map: { [key: string]: ClientContacts } = {};
    datas.forEach(u => {
      map[u.id] = u;
    });

    return keys.map(k => map[k]);
  });
