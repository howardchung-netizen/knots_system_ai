import DataLoader from "dataloader";
import { In } from "typeorm";
import { BookKeepingTransactionItem } from "./bookKeepingTransactionItem.entity";

export const bookKeepingTransactionItemsLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await BookKeepingTransactionItem.find({transactionId: In([...keys]), deleted: false });
  const map: { [key: string]: BookKeepingTransactionItem[] } = {};
  datas.forEach(t => {
    if(!(t.transactionId in map)){
      map[t.transactionId] = [];
    }
    map[t.transactionId].push(t);
  });
  return keys.map(k => map[k]??[]);
});