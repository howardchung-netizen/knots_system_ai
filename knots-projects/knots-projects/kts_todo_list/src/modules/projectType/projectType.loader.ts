import DataLoader from "dataloader";
import { ProjectType } from "./projectType.entity";

export const projectTypeLoader = () =>
new DataLoader(async (keys: readonly string[]) => {
  const datas = await ProjectType.findByIds([...keys]);
  const map: { [key: string]: ProjectType } = {};
  datas.forEach(t => {
    map[t.id] = t;
  });
  return keys.map(k => map[k]);
});