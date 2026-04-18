import DataLoader from "dataloader";
import { ProjectInvoice } from "./projectInvoice.entity";

export const projectInvoiceLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const projects = await ProjectInvoice.findByIds([...keys]);
  const map: { [key: string]: ProjectInvoice } = {};
  projects.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});
