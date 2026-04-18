import DataLoader from "dataloader";
import { Quotation } from "./quotation.entity";

export const quotationLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await Quotation.findByIds([...keys]);
  const map: { [key: string]: Quotation } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
