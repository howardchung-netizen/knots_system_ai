import DataLoader from "dataloader";
import { In } from "typeorm";
import { BookKeepingAccount } from "./bookKeepingAccount.entity";

export const bookKeepingAccountLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await BookKeepingAccount.find({id: In([...keys])});
  const map: { [key: string]: BookKeepingAccount } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
