import DataLoader from "dataloader";
import { In } from "typeorm";
import { BookKeepingTransaction } from "./bookKeepingTransaction.entity";

export const bookKeepingTransactionLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await BookKeepingTransaction.find({id: In([...keys])});
  const map: { [key: string]: BookKeepingTransaction } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
