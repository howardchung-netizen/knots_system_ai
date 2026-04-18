import DataLoader from "dataloader";
import { QuotationStatus } from "./quotationStatus.entity";

export const quotationStatusLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await QuotationStatus.findByIds([...keys]);
  const map: { [key: string]: QuotationStatus } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
