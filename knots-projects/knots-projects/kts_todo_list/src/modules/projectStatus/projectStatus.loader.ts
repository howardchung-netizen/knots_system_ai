import DataLoader from "dataloader";
import { ProjectStatus } from "./projectStatus.entity";

export const projectStatusLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await ProjectStatus.findByIds([...keys]);
  const map: { [key: string]: ProjectStatus } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});