import DataLoader from "dataloader";
import { QuotationTemplate } from "./quotationTemplate.entity";

export const quotationTemplateLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await QuotationTemplate.findByIds([...keys]);
  const map: { [key: string]: QuotationTemplate } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
