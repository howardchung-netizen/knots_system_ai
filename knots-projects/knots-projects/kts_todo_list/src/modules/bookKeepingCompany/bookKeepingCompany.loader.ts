import DataLoader from "dataloader";
import { In } from "typeorm";
import { BookKeepingCompany } from "./bookKeepingCompany.entity";

export const bookKeepingCompanyLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await BookKeepingCompany.find({id: In([...keys])});
  const map: { [key: string]: BookKeepingCompany } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
