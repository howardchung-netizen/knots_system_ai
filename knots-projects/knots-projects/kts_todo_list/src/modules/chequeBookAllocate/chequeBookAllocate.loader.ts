import DataLoader from "dataloader";
import { In } from "typeorm";
import { ChequeBookAllocate } from "./chequeBookAllocate.entity";

export const chequeBookAllocateLoader = () => new DataLoader(async (keys: readonly string[]) => {
  const datas = await ChequeBookAllocate.find({ chequeBookId: In([...keys]), deleted: false });
  const map: { [key: string]: ChequeBookAllocate[] } = {};
  datas.forEach(t => {
    if (!(t.chequeBookId in map)) {
      map[t.chequeBookId] = [];
    }
    map[t.chequeBookId].push(t);
  });
  return keys.map(k => map[k] ?? []);
});
