import DataLoader from "dataloader";
import { In } from "typeorm";
import { BookKeepingAccountType } from "./bookKeepingAccountType.entity";

export const bookKeepingAccountTypeLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await BookKeepingAccountType.find({id: In([...keys])});
  const map: { [key: string]: BookKeepingAccountType } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
