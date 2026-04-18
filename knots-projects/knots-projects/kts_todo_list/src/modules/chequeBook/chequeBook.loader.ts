import DataLoader from "dataloader";
import { In } from "typeorm";
import { ChequeBook } from "./chequeBook.entity";

export const chequeBookLoader = () => new DataLoader(async (keys: readonly string[]) => {
  const datas = await ChequeBook.find({ id: In([...keys]) });
  const map: { [key: string]: ChequeBook } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});

export const chequeBookByNoLoader = () => new DataLoader(async (keys: readonly string[]) => {
  const datas = await ChequeBook.find({ chequeNo: In([...keys]) });
  const map: { [key: string]: ChequeBook } = {};
  datas.forEach(t => {
    map[t.chequeNo!] = t;
  });
  return keys.map(k => map[k]);
});
